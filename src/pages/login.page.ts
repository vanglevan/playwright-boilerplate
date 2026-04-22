import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '@helpers/test-step';
import type { TestUser } from '@app-types/user';

/**
 * Example LoginPage — replace selectors / path with your application's real ones.
 */
export class LoginPage extends BasePage {
  readonly path = '/login';

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole('button', { name: /sign in|log in/i });
    this.errorBanner = page.getByRole('alert');
  }

  async waitUntilLoaded(): Promise<void> {
    await expect(this.submitButton).toBeVisible();
  }

  async login(user: Pick<TestUser, 'email' | 'password'>): Promise<void> {
    await step(`Login as ${user.email}`, async () => {
      await this.emailInput.fill(user.email);
      await this.passwordInput.fill(user.password);
      await this.submitButton.click();
    });
  }

  async expectError(message: string | RegExp): Promise<void> {
    await expect(this.errorBanner).toContainText(message);
  }
}
