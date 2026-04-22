import { test } from '@playwright/test';

/**
 * Wrap any async fn so its execution is reported as a Playwright test step
 * (visible in HTML/Allure/Monocart reports).
 *
 * Usage inside a Page Object method:
 *   async login(user: TestUser) {
 *     await step(`Login as ${user.email}`, async () => {
 *       await this.emailInput.fill(user.email);
 *       await this.passwordInput.fill(user.password);
 *       await this.submitButton.click();
 *     });
 *   }
 */
export const step = async <T>(name: string, body: () => Promise<T>): Promise<T> =>
  test.step(name, body);
