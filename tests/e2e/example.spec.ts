import { test, expect } from '@fixtures/index';
import { TAGS } from '@config/constants';

test.describe('Demo home page', () => {
  test(`loads the docs home page ${TAGS.smoke}`, async ({ docsHomePage }) => {
    await docsHomePage.goto();
    await expect(docsHomePage.heading).toBeVisible();
  });

  test(`title contains expected text ${TAGS.regression}`, async ({ docsHomePage }) => {
    await docsHomePage.goto();
    await expect(docsHomePage.page).toHaveTitle(/playwright/i);
  });
});
