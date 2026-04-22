import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '@components/header.component';

export class HomePage extends BasePage {
  readonly path = '/';
  readonly header: HeaderComponent;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
  }

  async waitUntilLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/$|home/i);
  }
}
