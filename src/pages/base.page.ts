import type { Page, Response } from '@playwright/test';
import { env } from '@config/env';
import { childLogger, type Logger } from '@helpers/logger';

/**
 * BasePage: shared behavior for every page object.
 *
 * - Holds the Playwright `Page`.
 * - Provides safe navigation to a relative path against the configured BASE_URL.
 * - Subclasses MUST set `path` (relative URL) for `goto()` to work.
 * - Subclasses MUST implement `waitUntilLoaded()` to assert the page is ready
 *   before tests interact with it (no arbitrary sleeps anywhere).
 */
export abstract class BasePage {
  /** Public so specs can do `expect(page.page).toHaveURL(...)` if needed. */
  readonly page: Page;
  protected readonly log: Logger;
  abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
    this.log = childLogger({ scope: this.constructor.name });
  }

  async goto(query?: Record<string, string | number>): Promise<Response | null> {
    const url = this.buildUrl(query);
    this.log.debug({ url }, 'goto');
    const response = await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.waitUntilLoaded();
    return response;
  }

  abstract waitUntilLoaded(): Promise<void>;

  url(): string {
    return this.page.url();
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  async screenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }

  private buildUrl(query?: Record<string, string | number>): string {
    const path = this.path.startsWith('/') ? this.path : `/${this.path}`;
    if (!query || Object.keys(query).length === 0) {
      return path;
    }
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      params.append(k, String(v));
    }
    const sep = path.includes('?') ? '&' : '?';
    return `${path}${sep}${params.toString()}`;
  }

  /** Resolve a path against the configured BASE_URL — useful for cross-origin links. */
  protected absolute(relativePath: string): string {
    return new URL(relativePath, env.BASE_URL).toString();
  }
}
