import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@fixtures/index';
import { TAGS } from '@config/constants';

test.describe(`Accessibility ${TAGS.a11y}`, () => {
  test('docs home — no critical/serious WCAG 2.1 AA violations', async ({ docsHomePage }) => {
    await docsHomePage.goto();
    const results = await new AxeBuilder({ page: docsHomePage.page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter((v) =>
      ['critical', 'serious'].includes(v.impact ?? '')
    );
    expect(blocking, formatViolations(blocking)).toEqual([]);
  });
});

function formatViolations(
  violations: { id: string; description: string; impact?: string | null }[]
) {
  if (violations.length === 0) {
    return 'No violations';
  }
  return violations.map((v) => `[${v.impact}] ${v.id} — ${v.description}`).join('\n');
}
