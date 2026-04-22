import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Concrete page object for https://playwright.dev (used by example specs
 * so the boilerplate can run out-of-the-box without a real app).
 */
export class PlaywrightDocsHomePage extends BasePage {
  readonly path = '/';
  readonly getStartedLink: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    this.getStartedLink = page.getByRole('link', { name: /get started/i });
  }

  async waitUntilLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }
}
