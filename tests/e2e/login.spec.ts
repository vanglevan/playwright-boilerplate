import { test, expect } from '@fixtures/index';
import { testData } from '@data/index';
import { TAGS } from '@config/constants';

/**
 * NOTE: The boilerplate ships pointing at https://demo.playwright.dev which
 * has no real `/login` route — this whole describe is `fixme`'d by default.
 * Once you point BASE_URL at your app and adjust LoginPage selectors, switch
 * `test.describe.fixme` → `test.describe`.
 */
test.describe.fixme('Login flow (sample — wire up to your real app)', () => {
  test(`logs in with valid credentials ${TAGS.smoke} ${TAGS.critical}`, async ({
    loginPage,
    homePage,
    testUser,
  }) => {
    await loginPage.goto();
    await loginPage.login(testUser);
    await homePage.waitUntilLoaded();
    await expect(homePage.header.userMenu).toBeVisible();
  });

  for (const invalid of testData.users.invalidUsers) {
    test(`rejects invalid login: ${invalid.label} ${TAGS.regression}`, async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login({ email: invalid.email, password: invalid.password });
      await expect(loginPage.errorBanner).toContainText(/invalid|incorrect/i);
    });
  }
});
