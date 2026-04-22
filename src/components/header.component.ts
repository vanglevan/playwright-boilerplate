import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from './base.component';
import { step } from '@helpers/test-step';

/**
 * Example component object — a site-wide header that appears on every page.
 * Replace selectors with the real ones for your application.
 */
export class HeaderComponent extends BaseComponent {
  readonly logo: Locator;
  readonly searchInput: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page, root?: Locator) {
    super(page, root ?? page.getByRole('banner'));
    this.logo = this.root.getByRole('link', { name: /home|logo/i });
    this.searchInput = this.root.getByRole('searchbox');
    this.userMenu = this.root.getByRole('button', { name: /account|user menu/i });
    this.logoutButton = this.page.getByRole('menuitem', { name: /log ?out|sign ?out/i });
  }

  async search(query: string): Promise<void> {
    await step(`Header → search "${query}"`, async () => {
      await this.searchInput.fill(query);
      await this.searchInput.press('Enter');
    });
  }

  async logout(): Promise<void> {
    await step('Header → logout', async () => {
      await this.userMenu.click();
      await this.logoutButton.click();
    });
  }
}
