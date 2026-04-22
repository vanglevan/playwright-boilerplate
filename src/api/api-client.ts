import type { APIRequestContext, APIResponse } from '@playwright/test';
import { request as pwRequest } from '@playwright/test';
import { env } from '@config/env';
import { childLogger, type Logger } from '@helpers/logger';
import type { ApiResult } from '@app-types/api';

export interface ApiClientOptions {
  baseURL?: string;
  token?: string;
  extraHeaders?: Record<string, string>;
  logger?: Logger;
}

export type ApiRequestOptions = {
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  body?: unknown;
  multipart?: Record<string, string | Blob | { name: string; mimeType: string; buffer: Buffer }>;
  form?: Record<string, string>;
  timeoutMs?: number;
};

/**
 * Thin, typed wrapper over Playwright's APIRequestContext.
 *
 * - Always returns a discriminated `ApiResult<T>` so callers handle errors explicitly.
 * - Logs request/response metadata via pino (no body content by default — opt in if needed).
 * - Supports auth-token injection and per-request header overrides.
 */
export class ApiClient {
  private readonly log: Logger;

  private constructor(
    private readonly ctx: APIRequestContext,
    private readonly baseURL: string,
    private readonly defaultHeaders: Record<string, string>,
    logger: Logger
  ) {
    this.log = logger;
  }

  static async create(options: ApiClientOptions = {}): Promise<ApiClient> {
    const baseURL = options.baseURL ?? env.API_BASE_URL;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.extraHeaders ?? {}),
    };
    const token = options.token ?? env.API_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const ctx = await pwRequest.newContext({ baseURL, extraHTTPHeaders: headers });
    return new ApiClient(ctx, baseURL, headers, options.logger ?? childLogger({ scope: 'api' }));
  }

  async dispose(): Promise<void> {
    await this.ctx.dispose();
  }

  get raw(): APIRequestContext {
    return this.ctx;
  }

  get<T = unknown>(path: string, options?: ApiRequestOptions): Promise<ApiResult<T>> {
    return this.send<T>('GET', path, options);
  }

  post<T = unknown>(path: string, options?: ApiRequestOptions): Promise<ApiResult<T>> {
    return this.send<T>('POST', path, options);
  }

  put<T = unknown>(path: string, options?: ApiRequestOptions): Promise<ApiResult<T>> {
    return this.send<T>('PUT', path, options);
  }

  patch<T = unknown>(path: string, options?: ApiRequestOptions): Promise<ApiResult<T>> {
    return this.send<T>('PATCH', path, options);
  }

  delete<T = unknown>(path: string, options?: ApiRequestOptions): Promise<ApiResult<T>> {
    return this.send<T>('DELETE', path, options);
  }

  private async send<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResult<T>> {
    const url = this.resolveUrl(path);
    const started = Date.now();
    this.log.debug({ method, url, query: options.query }, 'api → request');

    const params = options.query
      ? Object.fromEntries(
          Object.entries(options.query).filter(([, v]) => v !== undefined) as [
            string,
            string | number | boolean,
          ][]
        )
      : undefined;

    const response: APIResponse = await this.ctx.fetch(url, {
      method,
      params,
      headers: { ...this.defaultHeaders, ...(options.headers ?? {}) },
      data: options.body,
      multipart: options.multipart as never,
      form: options.form,
      timeout: options.timeoutMs,
    });

    const status = response.status();
    const headers = response.headers();
    const elapsed = Date.now() - started;
    this.log.debug({ method, url, status, elapsed }, 'api ← response');

    const text = await response.text();
    const parsed = parseJson<T>(text);

    if (!response.ok()) {
      return {
        ok: false,
        status,
        error: `HTTP ${status} ${method} ${url}`,
        body: parsed.ok ? parsed.value : text,
        headers,
      };
    }

    return {
      ok: true,
      status,
      data: (parsed.ok ? parsed.value : (text as unknown)) as T,
      headers,
    };
  }

  /**
   * Build the absolute request URL by *concatenating* the configured base URL
   * with the given path. We intentionally do NOT use `new URL(path, baseURL)`
   * because URL-spec resolution drops base-URL path segments when `path`
   * starts with `/` (e.g. base `https://api.example.com/v1` + `/users` →
   * `https://api.example.com/users`, losing `/v1`).
   */
  private resolveUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    const tail = path.startsWith('/') ? path : `/${path}`;
    return `${base}${tail}`;
  }
}

/**
 * Throw on failure; return `data` on success — meant to be used by tests that
 * want a one-liner against the happy path without polluting them with
 * `if (!result.ok) ...` branches (which the eslint-plugin-playwright rule
 * `no-conditional-in-test` rightly flags).
 */
export const unwrap = <T>(result: ApiResult<T>): T => {
  if (!result.ok) {
    const bodyStr =
      typeof result.body === 'string'
        ? result.body
        : result.body !== undefined
          ? JSON.stringify(result.body)
          : '';
    throw new Error(`${result.error}${bodyStr ? `\n${bodyStr}` : ''}`);
  }
  return result.data;
};

const parseJson = <T>(text: string): { ok: true; value: T } | { ok: false } => {
  if (!text) {
    return { ok: false };
  }
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch {
    return { ok: false };
  }
};
