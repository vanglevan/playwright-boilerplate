import { test as setup } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { STORAGE_STATE } from '@config/constants';
import { env } from '@config/env';

/**
 * Auth setup project — runs ONCE per `npx playwright test` invocation
 * (the `setup` project), persisting an authenticated browser context to
 * `playwright/.auth/user.json`. Other UI projects load it via `storageState`.
 *
 * Replace the body with your real login flow (UI-driven or API-driven).
 *
 * NOTE: For demo purposes (the boilerplate ships pointing at demo.playwright.dev
 * which has no real login), we just save an empty state so the dependency
 * resolves. Once you point BASE_URL at a real app, swap in actual login steps.
 */
setup('authenticate as user', async ({ page }) => {
  const targetFile = STORAGE_STATE.user;
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });

  // ─── REAL LOGIN FLOW ─── (uncomment and adapt for your app)
  // const loginPage = new LoginPage(page);
  // await loginPage.goto();
  // await loginPage.login({ email: env.TEST_USER_EMAIL, password: env.TEST_USER_PASSWORD });
  // await page.waitForURL('**/dashboard', { timeout: env.NAVIGATION_TIMEOUT_MS });

  // For the demo target there is no auth — visit the site so cookies/origin exist.
  await page.goto(env.BASE_URL);

  await page.context().storageState({ path: targetFile });
});
