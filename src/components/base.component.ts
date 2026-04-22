import type { Locator, Page } from '@playwright/test';

/**
 * BaseComponent: a reusable widget scoped to a `Locator` (its root element).
 *
 * Component objects encapsulate a piece of UI that may appear on many pages
 * (header, modal, data-table row...). They differ from PageObjects in that
 * they NEVER navigate — they only interact with their root locator.
 *
 * Subclasses: define internal locators relative to `this.root`.
 */
export abstract class BaseComponent {
  protected readonly page: Page;
  readonly root: Locator;

  constructor(page: Page, root: Locator) {
    this.page = page;
    this.root = root;
  }

  /** Wait until the component's root is visible. */
  async waitUntilVisible(timeoutMs = 10_000): Promise<void> {
    await this.root.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }
}
