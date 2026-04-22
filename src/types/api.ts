export interface ApiSuccess<T> {
  ok: true;
  status: number;
  data: T;
  headers: Record<string, string>;
}

export interface ApiFailure {
  ok: false;
  status: number;
  error: string;
  body?: unknown;
  headers: Record<string, string>;
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
