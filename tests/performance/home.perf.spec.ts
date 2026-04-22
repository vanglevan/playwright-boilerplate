import { test, expect } from '@fixtures/index';
import { TAGS } from '@config/constants';

interface PerformanceTimingMarks {
  domContentLoaded: number;
  loadEvent: number;
  firstPaint: number;
  firstContentfulPaint: number;
}

/**
 * Lightweight perf checks using the Performance API + CDP metrics.
 * For full Lighthouse-grade audits add `playwright-lighthouse` and run
 * via a separate CDP-enabled project.
 */
test.describe(`Performance ${TAGS.perf}`, () => {
  test('docs home — paint metrics under budget', async ({ page, docsHomePage }) => {
    await docsHomePage.goto();

    const metrics = await page.evaluate<PerformanceTimingMarks>(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paints = performance.getEntriesByType('paint');
      const fp = paints.find((p) => p.name === 'first-paint')?.startTime ?? 0;
      const fcp = paints.find((p) => p.name === 'first-contentful-paint')?.startTime ?? 0;
      return {
        domContentLoaded: nav.domContentLoadedEventEnd,
        loadEvent: nav.loadEventEnd,
        firstPaint: fp,
        firstContentfulPaint: fcp,
      };
    });

    test.info().annotations.push({ type: 'metrics', description: JSON.stringify(metrics) });

    // Budgets — tune for your application.
    expect(metrics.firstContentfulPaint).toBeLessThan(4_000);
    expect(metrics.domContentLoaded).toBeLessThan(8_000);
    expect(metrics.loadEvent).toBeLessThan(15_000);
  });
});
