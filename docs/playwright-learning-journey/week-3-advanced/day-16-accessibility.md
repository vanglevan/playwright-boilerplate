# Day 16 — Accessibility (A11y) Testing

> **Goal:** Biết WCAG 2.1 AA basics, dùng axe-core trong test, phân biệt impact critical vs minor.
> **Thời gian:** 2-3 giờ

---

## Prerequisites

- Week 1-2 hoàn thành

---

## 1. Tại sao a11y quan trọng

- **15% population** có khuyết tật (visual, motor, cognitive, auditory)
- **Legal**: nhiều quốc gia require (ADA US, EU Accessibility Act 2025)
- **SEO**: search engines favor accessible sites
- **UX**: fix a11y thường cải thiện UX cho mọi user

**Automation tester ngày nay phải biết cơ bản**, không để developer đau đầu 1 mình.

---

## 2. WCAG 2.1 AA cheat sheet

**4 nguyên lý POUR:**

1. **Perceivable** — Nội dung phải nhận thức được
2. **Operable** — Navigate được bằng keyboard
3. **Understandable** — Predictable behavior
4. **Robust** — Work với assistive tech

### Top 10 rule thường vi phạm

| Rule                               | Example vi phạm                               |
| ---------------------------------- | --------------------------------------------- |
| `img` có `alt`                     | `<img src="logo.png">`                        |
| Contrast ratio ≥ 4.5:1             | Text xám nhạt trên nền trắng                  |
| `label` cho form input             | `<input type="email">` không `<label>`        |
| `button` có text hoặc `aria-label` | `<button><i class="icon-trash"></i></button>` |
| Headings hierarchy (h1 → h2 → h3)  | Skip từ h1 sang h4                            |
| Focus visible                      | Remove outline mà không thay thế              |
| `html` có `lang`                   | `<html>` không `lang="en"`                    |
| Link có text descriptive           | `<a>click here</a>`                           |
| Color không phải info duy nhất     | Error chỉ bằng màu đỏ                         |
| ARIA role đúng                     | `<div role="button">` không handle keyboard   |

Đầy đủ: [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 3. axe-core + Playwright

```bash
npm i -D @axe-core/playwright
```

### Basic test

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home page a11y', async ({ page }) => {
  await page.goto('https://playwright.dev');

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
```

Nếu có violation → fail, kèm list rule bị vi phạm.

---

## 4. Fine-tune scan

### Chỉ check rule nhất định

```typescript
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();
```

**Tags phổ biến:**

- `wcag2a` — WCAG 2 Level A
- `wcag2aa` — WCAG 2 Level AA (standard compliance)
- `wcag21aa` — WCAG 2.1 AA
- `best-practice` — axe best practice (không WCAG)
- `section508` — US law

### Disable rule gặp false positive

```typescript
const results = await new AxeBuilder({ page })
  .disableRules(['color-contrast']) // vd: dark mode của bạn axe chưa hiểu
  .analyze();
```

### Scan chỉ vùng cụ thể

```typescript
const results = await new AxeBuilder({ page })
  .include('[data-testid=main-content]')
  .exclude('.third-party-widget')
  .analyze();
```

---

## 5. Filter by impact

```typescript
test('no critical a11y issues', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();

  const critical = results.violations.filter((v) => v.impact === 'critical');
  const serious = results.violations.filter((v) => v.impact === 'serious');

  expect(critical, 'Critical a11y violations').toEqual([]);
  expect(serious.length, 'Serious a11y violations').toBeLessThan(3);
});
```

**Levels:**

- **critical** — block user hoàn toàn
- **serious** — khó dùng đáng kể
- **moderate** — inconvenient
- **minor** — edge case

**Strategy realistic:** Block critical, warn serious, monitor moderate.

---

## 6. Reporting meaningful

```typescript
test('home page a11y with detailed output', async ({ page }, testInfo) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();

  // Attach JSON report
  await testInfo.attach('a11y-report.json', {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });

  // Formatted console
  if (results.violations.length > 0) {
    console.log('\n=== A11Y Violations ===');
    for (const v of results.violations) {
      console.log(`\n[${v.impact}] ${v.id}: ${v.description}`);
      console.log(`  Help: ${v.helpUrl}`);
      console.log(`  Nodes: ${v.nodes.length}`);
      v.nodes.slice(0, 3).forEach((n) => {
        console.log(`    - ${n.html}`);
      });
    }
  }

  expect(results.violations).toEqual([]);
});
```

---

## 7. Keyboard navigation test

Axe không test keyboard flow. Bổ sung bằng Playwright:

```typescript
test('can navigate form with keyboard', async ({ page }) => {
  await page.goto('/contact');

  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Name')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Email')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Message')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Send' })).toBeFocused();

  // Focus visible
  const focusedOutline = await page.evaluate(
    () => getComputedStyle(document.activeElement!).outlineStyle
  );
  expect(focusedOutline).not.toBe('none');
});
```

---

## 8. Screen reader considerations

Không test thật được qua Playwright. Nhưng kiểm tra các attribute:

```typescript
test('images have alt text', async ({ page }) => {
  await page.goto('/');
  const images = page.locator('img');
  const count = await images.count();
  for (let i = 0; i < count; i++) {
    const alt = await images.nth(i).getAttribute('alt');
    expect(alt, `Image ${i} missing alt`).not.toBeNull();
  }
});

test('buttons have accessible names', async ({ page }) => {
  const buttons = page.locator('button');
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    const name = await buttons.nth(i).evaluate((btn) => {
      return btn.getAttribute('aria-label') || btn.textContent?.trim();
    });
    expect(name, `Button ${i} has no accessible name`).toBeTruthy();
  }
});
```

---

## 9. Fixture for reusability

```typescript
// src/fixtures/a11y.fixture.ts
import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type A11y = {
  makeAxe: (page: Page) => AxeBuilder;
};

export const test = base.extend<A11y>({
  makeAxe: async ({}, use) => {
    await use((page) => new AxeBuilder({ page }).withTags(['wcag2aa', 'wcag21aa']));
  },
});
```

Usage:

```typescript
test('scan home', async ({ page, makeAxe }) => {
  await page.goto('/');
  const results = await makeAxe(page).analyze();
  // ...
});
```

---

## 10. Bài tập

### Bài 1: Scan 3 pages

Chọn 3 page của 1 public site, scan a11y. Report violations by impact.

### Bài 2: Fix-it-yourself

Tạo HTML page cố tình xấu:

```html
<img src="logo.png" />
<button><span class="icon-x"></span></button>
<div onclick="submit()">Submit</div>
```

Serve local. Run axe → nhiều violations. Fix từng cái → violations = 0.

### Bài 3: Keyboard flow

Trên 1 form (vd https://the-internet.herokuapp.com/login), test tab order keyboard.

### Bài 4: Custom rule filter

Chạy scan trên trang có nhiều issue. Filter:

- Chỉ critical → báo cáo 3 đầu tiên
- Chỉ color-contrast → đếm số
- Exclude 3rd party widgets

### Bài 5: Compare sites

Scan 3 site: government, e-commerce, blog. So a11y score. Ghi nhận finding thú vị.

---

## 11. Common Pitfalls

| Vấn đề                             | Fix                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------- |
| axe báo `color-contrast` sai       | axe không hiểu dynamic theme — disable rule hoặc test light+dark mode riêng |
| Third-party widgets fail a11y      | `.exclude()` selector của widget                                            |
| Test fail mọi page vì heading skip | Fix root cause thật (h1 → h2 → h3), không disable                           |
| Quá nhiều violations ban đầu       | Bắt đầu từ critical, phase dần xuống serious                                |
| A11y test chậm                     | Chạy subset trang critical, không mọi page                                  |
| Team không biết fix                | Share axe `helpUrl` — mỗi rule có docs fix                                  |

---

## 12. Tools bổ sung

| Tool                                                                          | Purpose                   |
| ----------------------------------------------------------------------------- | ------------------------- |
| [axe DevTools Chrome ext](https://www.deque.com/axe/devtools/)                | Scan manual từ browser    |
| [WAVE](https://wave.webaim.org/)                                              | Visual overlay violations |
| [Lighthouse](https://developer.chrome.com/docs/lighthouse/accessibility)      | Built-in Chrome DevTools  |
| [Storybook a11y addon](https://storybook.js.org/addons/@storybook/addon-a11y) | Component-level           |
| [pa11y](https://pa11y.org/)                                                   | CLI alternative           |

---

## 13. Beyond automated — manual a11y testing

Automated chỉ catch ~40% issues. Manual testing bắt buộc cho:

- **Screen reader flow** — VoiceOver (macOS), NVDA (Windows)
- **Zoom 200%** — text overflow, layout break?
- **Color blind** — Chrome DevTools → Rendering → Emulate
- **Reduced motion** — `prefers-reduced-motion: reduce`
- **Focus trap** — modal trap focus đúng không

---

## 14. Checklist

- [ ] `@axe-core/playwright` cài
- [ ] Scan 3 page successfully
- [ ] Filter by impact: critical/serious
- [ ] Bài 2: fix violations intentional
- [ ] Bài 3: keyboard test
- [ ] Commit: `test: accessibility with axe-core`
- [ ] NOTES.md: 3 rules WCAG quan trọng nhất team bạn cần biết

---

## Resources

- [@axe-core/playwright docs](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Deque University (free courses)](https://dequeuniversity.com/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [a11y Project](https://www.a11yproject.com/)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [A11y testing in Playwright (Deque)](https://www.youtube.com/@dequesystems)
- [Web A11y crash course](https://www.youtube.com/watch?v=e2nkq3h1P68) — Google devs
- [Screen reader demo (NVDA + VoiceOver)](https://www.youtube.com/results?search_query=screen+reader+demo)
- [Inclusive Design 101](https://www.youtube.com/results?search_query=inclusive+design+101)

### 📝 Articles & blogs

- [WCAG 2.1 Understanding](https://www.w3.org/WAI/WCAG21/Understanding/) — detailed
- [WebAIM articles](https://webaim.org/articles/) — deep a11y knowledge
- [Inclusive components](https://inclusive-components.design/) — patterns
- [Smashing Magazine — Accessibility](https://www.smashingmagazine.com/category/accessibility/)
- [A11y project — Checklist](https://www.a11yproject.com/checklist/)

### 🎓 Free courses

- [Deque University Free Trial](https://dequeuniversity.com/) — quality courses
- [W3C Introduction to Web Accessibility](https://www.edx.org/course/web-accessibility-introduction) — edX free
- [Google Web Fundamentals — A11y](https://web.dev/accessibility/)
- [A11y Fundamentals (Microsoft)](https://learn.microsoft.com/en-us/training/modules/introduction-accessibility/)

### 📖 Books

- _Inclusive Design Patterns_ — Heydon Pickering
- _Accessibility for Everyone_ — Laura Kalbag (free online)
- _Color Accessibility Workflows_ — Geri Coady

### 🐙 Related GitHub repos

- [dequelabs/axe-core](https://github.com/dequelabs/axe-core) — core engine
- [a11yproject/a11yproject.com](https://github.com/a11yproject/a11yproject.com) — learn từ source
- [GoogleChrome/accessibility-developer-tools](https://github.com/GoogleChrome/accessibility-developer-tools)
- [microsoft/accessibility-insights-web](https://github.com/microsoft/accessibility-insights-web) — MS's tool

### 🛠️ Tools

- [axe DevTools Chrome ext](https://www.deque.com/axe/devtools/) — manual scan
- [WAVE](https://wave.webaim.org/) — visual overlay
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/accessibility/) — Chrome built-in
- [Accessibility Insights](https://accessibilityinsights.io/) — Microsoft
- [Storybook a11y addon](https://storybook.js.org/addons/@storybook/addon-a11y) — component-level

### 📊 Cheat sheets

- [WCAG 2.1 AA checklist (WebAIM)](https://webaim.org/standards/wcag/checklist)
- [ARIA roles quick ref](https://www.w3.org/TR/html-aria/)
- [Keyboard shortcuts reference (a11y)](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)

### 🎯 Assistive tech (free screen readers)

- [NVDA (Windows)](https://www.nvaccess.org/) — free
- [VoiceOver (macOS)](https://support.apple.com/guide/voiceover/) — built-in
- [Orca (Linux)](https://help.gnome.org/users/orca/) — built-in

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (scan + report)

**B1.** Scan 5 public sites, compare violation count:

- Your favorite e-commerce
- Government site (`.gov.vn`)
- News site
- Tech blog
- Social media

Report findings trong NOTES.md — most common violation?

**B2.** Filter by impact:

```typescript
const critical = results.violations.filter((v) => v.impact === 'critical');
expect(critical).toEqual([]);
```

Set realistic threshold: critical=0, serious<3, moderate<10.

**B3.** Detailed report attachment:

```typescript
await testInfo.attach('a11y-violations.json', {
  body: JSON.stringify(results.violations, null, 2),
  contentType: 'application/json',
});
```

### 🟡 Trung bình (fine-tune + keyboard)

**M1.** Tag-based scanning:

```typescript
// Strict WCAG AA
.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])

// Best practices (stricter)
.withTags(["wcag2aa", "best-practice"])
```

**M2.** Scope scan:

```typescript
new AxeBuilder({ page })
  .include('main') // only main content
  .exclude('.third-party-widget') // exclude widgets
  .exclude("[aria-hidden='true']");
```

**M3.** Keyboard navigation tests:

```typescript
test('tab order is logical', async ({ page }) => {
  await page.goto('/contact');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Name')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Email')).toBeFocused();
  // ...
});
```

Test 5 forms.

**M4.** Focus visible test:

```typescript
test('focus has visible outline', async ({ page }) => {
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(outline).not.toBe('none');
});
```

### 🔴 Nâng cao (deeper checks)

**A1.** Alt text audit — all images:

```typescript
test('all images have alt', async ({ page }) => {
  const images = page.locator('img');
  const count = await images.count();
  for (let i = 0; i < count; i++) {
    const alt = await images.nth(i).getAttribute('alt');
    expect(alt, `img ${i}`).not.toBeNull();
  }
});
```

**A2.** Heading hierarchy:

```typescript
test("heading levels don't skip", async ({ page }) => {
  const levels = await page.$$eval('h1,h2,h3,h4,h5,h6', (els) =>
    els.map((el) => parseInt(el.tagName[1]))
  );
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i] - levels[i - 1], `heading skip at ${i}`).toBeLessThanOrEqual(1);
  }
});
```

**A3.** Color contrast — dynamic theme:
Test light mode + dark mode → scan each.

**A4.** Live region test (aria-live):

```typescript
test('error is announced', async ({ page }) => {
  await page.click('button[type=submit]');
  const errorRegion = page.locator("[aria-live='polite']");
  await expect(errorRegion).toContainText('Error');
});
```

### 🏆 Mini challenge (60 phút)

**Task:** A11y audit for 1 app:

- Scan 5 critical pages
- Keyboard navigation tests
- Alt text audit
- Heading hierarchy
- Focus management

Output: `A11Y_AUDIT.md` with:

- Violations list by impact
- Top 5 issues ranked by user impact
- Recommended fixes với estimate effort
- Budget recommendation (critical=0, serious<X, etc.)

### 🌟 Stretch goal

Do manual a11y test — use VoiceOver (macOS Cmd+F5) or NVDA navigate 1 app for 10 min. Note issues automated missed.

---

## Next

[Day 17 — Performance Testing →](./day-17-performance.md)
