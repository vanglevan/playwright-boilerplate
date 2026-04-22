import { test, expect } from '@fixtures/index';
import { TAGS } from '@config/constants';

test.describe(`Visual regression ${TAGS.visual}`, () => {
  test('docs home — full page snapshot', async ({ docsHomePage }) => {
    await docsHomePage.goto();
    await expect(docsHomePage.page).toHaveScreenshot('home-full.png', { fullPage: true });
  });

  test('docs home — heading region snapshot', async ({ docsHomePage }) => {
    await docsHomePage.goto();
    await expect(docsHomePage.heading).toHaveScreenshot('home-heading.png');
  });
});
