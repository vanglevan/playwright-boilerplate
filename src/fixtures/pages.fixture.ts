import { test as base } from '@playwright/test';
import { HomePage } from '@pages/home.page';
import { LoginPage } from '@pages/login.page';
import { PlaywrightDocsHomePage } from '@pages/playwright-docs.page';

export interface PageObjects {
  homePage: HomePage;
  loginPage: LoginPage;
  docsHomePage: PlaywrightDocsHomePage;
}

/**
 * Page-object fixture: every PO lazily constructed per test, scoped to the
 * test's `page`. Tests destructure only what they need.
 */
export const test = base.extend<PageObjects>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  docsHomePage: async ({ page }, use) => {
    await use(new PlaywrightDocsHomePage(page));
  },
});
