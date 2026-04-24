# Day 15 — Visual Regression Testing

> **Goal:** Tự động phát hiện UI bị lệch sau deploy. Biết khi nào visual test giá trị, khi nào là nỗi đau.
> **Thời gian:** 2-3 giờ

---

## Prerequisites

- Week 1-2 hoàn thành

---

## 1. Visual regression là gì

- Chạy test lần đầu → chụp ảnh → lưu thành **baseline**
- Chạy test lần sau → chụp ảnh mới → so sánh pixel với baseline
- Khác biệt → fail (kèm diff image)

**Khi nào giá trị:**

- Catch CSS regression (margin sai, color đổi)
- Cross-browser consistency
- Design system changes

**Khi nào là nỗi đau:**

- UI dynamic (carousel, video, timestamp) → flaky
- Font rendering khác OS → local vs CI diff
- Quá nhiều baseline cần maintain

**→ Visual test chiếm 10-15% suite thôi. Không thay thế functional.**

---

## 2. Basic usage

```typescript
import { test, expect } from '@playwright/test';

test('home page matches snapshot', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveScreenshot('home.png');
});
```

**Lần 1:** Không có baseline → test "fail" nhưng tạo file `home-chromium-darwin.png`. Commit file này.

**Lần 2+:** So với baseline. Match → pass. Khác → fail + save diff.

---

## 3. File naming & organization

Playwright auto-generate theo pattern:

```
tests/
├── home.spec.ts
└── home.spec.ts-snapshots/
    ├── home-chromium-darwin.png
    ├── home-firefox-darwin.png
    └── home-webkit-darwin.png
```

Project/browser/OS → riêng. Commit folder `*-snapshots/` vào git.

---

## 4. Options quan trọng

### Masking dynamic content

```typescript
await expect(page).toHaveScreenshot({
  mask: [page.locator('[data-test="timestamp"]'), page.getByText(/^\d+ visitors online/)],
});
```

Masked area → đen, không so sánh.

### Clip region

```typescript
await expect(page).toHaveScreenshot({
  clip: { x: 0, y: 0, width: 800, height: 400 },
});
```

### Fullpage

```typescript
await expect(page).toHaveScreenshot({ fullPage: true });
```

### Threshold

```typescript
await expect(page).toHaveScreenshot({
  maxDiffPixels: 100, // số pixel được khác
  maxDiffPixelRatio: 0.01, // 1% diff OK
  threshold: 0.2, // mỗi pixel tolerance
});
```

### Animations

```typescript
await expect(page).toHaveScreenshot({
  animations: 'disabled', // pause CSS animation
});
```

### Scale

```typescript
await expect(page).toHaveScreenshot({
  scale: 'css', // match CSS px (consistent cross-DPI)
});
```

---

## 5. Global config

```typescript
// playwright.config.ts
export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide', // ẩn caret nhấp nháy
      scale: 'css',
    },
    toMatchSnapshot: {
      threshold: 0.2,
    },
  },
});
```

---

## 6. Element-level screenshot

```typescript
const hero = page.locator('.hero-section');
await expect(hero).toHaveScreenshot('hero.png');
```

**Ưu:** Nhỏ hơn, ít flaky. **Khuyến nghị over full-page.**

---

## 7. Update baselines

Khi UI thay đổi có chủ ý:

```bash
npx playwright test --update-snapshots
# Hoặc chỉ 1 file:
npx playwright test tests/visual/home.spec.ts --update-snapshots
```

**Workflow đúng:**

1. Dev đổi UI (PR có screenshot mới)
2. Chạy test → visual test fail
3. Review diff: đúng chủ ý → update. Không đúng → đó là bug.
4. `npx playwright test --update-snapshots`
5. Commit cả code + snapshot files
6. Code review: reviewer nhìn diff snapshot, approve

---

## 8. Nhảy qua font rendering hell

**Vấn đề:** Screenshot local (macOS) ≠ CI (Ubuntu) vì font khác.

**Giải pháp:**

### Option A: Docker cho visual tests

Day 21 sẽ detail. Chạy trong container → consistent.

### Option B: Separate project cho visual

```typescript
projects: [
  { name: 'chromium' /* ... */ },
  {
    name: 'visual',
    testMatch: /.*\.visual\.spec\.ts/,
    snapshotPathTemplate: '{testDir}/{testFileDir}/__screenshots__/{arg}{ext}',
    use: {
      /* ... */
    },
  },
];
```

### Option C: Chỉ chạy visual trên CI

```bash
# Local: không chạy visual
npm test -- --grep-invert "visual"

# CI: chỉ visual
npm test -- --project=visual
```

---

## 9. Recipes thực tế

### Recipe 1: Mask mọi thứ dynamic

```typescript
test('home page visual', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('home.png', {
    mask: [
      page.locator('[data-dynamic]'),
      page.getByTestId('timestamp'),
      page.locator('.live-counter'),
    ],
    fullPage: true,
  });
});
```

### Recipe 2: Wait for stability

```typescript
// Wait cho content load xong
await page.waitForLoadState('networkidle');

// Hoặc wait specific content
await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();

// Disable animations
await page.addStyleTag({
  content: `*, *::before, *::after { animation: none !important; transition: none !important; }`,
});

await expect(page).toHaveScreenshot('stable.png');
```

### Recipe 3: Responsive breakpoints

```typescript
const breakpoints = [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1440, height: 900, name: 'desktop' },
];

for (const bp of breakpoints) {
  test(`home ${bp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto('/');
    await expect(page).toHaveScreenshot(`home-${bp.name}.png`);
  });
}
```

---

## 10. Bài tập

### Bài 1: First baseline

Viết `tests/visual/home.visual.spec.ts` trên https://playwright.dev. Chạy → tạo baseline. Commit snapshot.

### Bài 2: Detect real change

Cố tình thay CSS site của bạn (vd: thay đổi button color trong demo site) → chạy test → verify fail + xem diff.

### Bài 3: Mask dynamic

Trên https://www.google.com (có dynamic content), viết visual test. Mask sections dynamic. Test stable 5 lần liên tiếp.

### Bài 4: Responsive test

3 breakpoints cho 1 page. Chạy, inspect 3 snapshots.

### Bài 5: Update workflow

Thay UI → `--update-snapshots` → commit. Test lại pass.

---

## 11. Common Pitfalls

| Vấn đề                       | Fix                                                                   |
| ---------------------------- | --------------------------------------------------------------------- |
| Local pass, CI fail          | Font/rendering OS khác → dùng Docker hoặc CI-only visual              |
| Baseline file to quá (1MB+)  | Dùng element-level, clip, không full-page                             |
| "animation" fail dù disabled | Một số lib dùng JS animation → thêm `*{animation:none!important}` CSS |
| Dynamic content vỡ           | Mask mọi thứ dynamic                                                  |
| Quá nhiều baseline files     | Visual chỉ cho critical UI — không test mọi page                      |
| Timestamp visible            | Mask hoặc mock `Date`                                                 |
| Video/carousel animate       | Wait + mask                                                           |

---

## 12. Khi nào NOT nên dùng visual test

- UI content-heavy (blog, news) — nội dung thay mỗi ngày
- Experimentation (A/B test) — variant khác
- Rapid iteration (startup early) — baseline thay liên tục
- Accessibility focus (→ Day 16 a11y test)

Thay bằng: assertion `toHaveText`, a11y test, Percy/Chromatic nếu cần advanced visual.

---

## 13. Alternatives

| Tool                                               | Strength                      | When              |
| -------------------------------------------------- | ----------------------------- | ----------------- |
| Playwright built-in                                | Zero setup, free              | Default choice    |
| [Percy](https://percy.io/)                         | Cloud, AI diff, cross-browser | Team scale        |
| [Chromatic](https://chromatic.com/)                | Storybook integration         | Component library |
| [BackstopJS](https://github.com/garris/BackstopJS) | Standalone                    | Legacy            |

---

## 14. Checklist

- [ ] Baseline 1 file commit vào git
- [ ] Intentional change → test fail → review diff
- [ ] Mask dynamic content thành công
- [ ] Responsive 3 breakpoints
- [ ] `--update-snapshots` workflow hiểu
- [ ] Commit: `test: visual regression baseline`
- [ ] NOTES.md: ghi use case visual test bạn thấy giá trị

---

## Resources

- [Playwright — Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Playwright — Screenshots API](https://playwright.dev/docs/screenshots)
- [Percy Best Practices](https://docs.percy.io/docs/best-practices)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Visual Regression Testing explained](https://www.youtube.com/results?search_query=visual+regression+testing)
- [Playwright screenshots deep dive](https://www.youtube.com/@Playwrightdev)
- [Percy vs Chromatic vs Applitools](https://www.youtube.com/results?search_query=percy+vs+chromatic)

### 📝 Articles & blogs

- [Playwright — Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Storybook + Chromatic workflow](https://storybook.js.org/docs/writing-tests/visual-testing)
- [Handling font rendering differences](https://dev.to/search?q=font+rendering+test)
- [BackstopJS vs Playwright screenshots](https://github.com/garris/BackstopJS)
- [Visual testing anti-patterns](https://medium.com/search?q=visual+regression+anti+pattern)

### 🎓 Deep topics

- [Image comparison algorithms (pixelmatch)](https://github.com/mapbox/pixelmatch)
- [Perceptual diff vs pixel diff](https://github.com/Huddle/PerceptualDiff)
- [Chromatic story pipeline](https://www.chromatic.com/docs/)

### 📖 Books / further

- _Designing Web Interfaces_ — principles of stable UI
- UX/visual testing talks on [InfoQ](https://www.infoq.com/)

### 🐙 Related GitHub repos

- [mapbox/pixelmatch](https://github.com/mapbox/pixelmatch) — image diff lib
- [garris/BackstopJS](https://github.com/garris/BackstopJS) — alternative tool
- [storybookjs/storybook](https://github.com/storybookjs/storybook) — storybook tests

### 🛠️ Tools

- [Percy](https://percy.io/) — cloud visual platform
- [Chromatic](https://www.chromatic.com/) — Storybook-native
- [Applitools Eyes](https://applitools.com/) — AI-assisted
- [BackstopJS](https://garris.github.io/BackstopJS/) — OSS alternative
- [reg-suit](https://github.com/reg-viz/reg-suit) — git-based workflow

### 📊 Cheat sheets

- [toHaveScreenshot() options](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot)
- [Snapshot file naming](https://playwright.dev/docs/test-snapshots#naming-snapshots)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (baseline + compare)

**B1.** Visual test home page 3 sites. Sinh baseline commit vào git. Rerun — verify pass.

**B2.** Intentional break:

- Modify CSS via `page.addStyleTag({ content: "body { background: red; }" })`
- Run test → fail
- Open HTML report → view diff image

**B3.** Update snapshots workflow:

```bash
# UI change intentional
npx playwright test --update-snapshots

# Review diff trong git
git diff --stat

# Commit new baseline
git commit -m "test: update snapshots after UI redesign"
```

### 🟡 Trung bình (masking, scoping)

**M1.** Mask dynamic content:

```typescript
await expect(page).toHaveScreenshot('home.png', {
  mask: [page.getByTestId('timestamp'), page.locator('.live-counter'), page.locator('video')],
});
```

Test trên Google News hoặc similar dynamic page. Achieve 10 consecutive stable runs.

**M2.** Element-level vs full-page:
Compare:

- `await expect(page).toHaveScreenshot()` — full page
- `await expect(page.locator(".hero")).toHaveScreenshot()` — element only

Element-level:

- File size?
- Flakiness rate (10 runs)?
- Better failure isolation?

**M3.** Responsive snapshots — 3 breakpoints:

```typescript
for (const viewport of [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1440, height: 900, name: 'desktop' },
]) {
  test(`home ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page).toHaveScreenshot(`home-${viewport.name}.png`);
  });
}
```

**M4.** Stability techniques — disable ALL sources of randomness:

```typescript
await page.addStyleTag({
  content: `
    *, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
    }
  `,
});
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.evaluate(() => document.fonts.ready); // wait fonts loaded
```

### 🔴 Nâng cao (production patterns)

**A1.** Docker for consistency:

```bash
docker run -it --rm \
  -v $(pwd):/work -w /work \
  mcr.microsoft.com/playwright:v1.59.1-jammy \
  npx playwright test --project=visual
```

Snapshots from Docker differ from macOS local. Commit Docker-generated only.

**A2.** Diff tolerance tuning:

```typescript
await expect(page).toHaveScreenshot({
  maxDiffPixels: 100, // accept <100 pixels diff
  maxDiffPixelRatio: 0.001, // 0.1% tolerance
  threshold: 0.2, // per-pixel tolerance
});
```

Find sweet spot — not so tight it breaks on minor rendering, not so loose bugs slip.

**A3.** Percy integration (cloud):

```bash
npm i -D @percy/cli @percy/playwright
```

```typescript
import percySnapshot from '@percy/playwright';
await percySnapshot(page, 'Home page');
```

Push → Percy dashboard shows diffs + approval workflow.

**A4.** Multiple snapshot per test — capture states:

```typescript
test('form validation visuals', async ({ page }) => {
  await page.goto('/signup');
  await expect(page).toHaveScreenshot('empty-form.png');

  await page.click('button[type=submit]');
  await expect(page).toHaveScreenshot('validation-errors.png');

  await page.fill('#email', 'valid@test.com');
  await expect(page).toHaveScreenshot('filled-partial.png');
});
```

### 🏆 Mini challenge (45 phút)

**Task:** Visual test suite cho 1 landing page:

- 3 responsive breakpoints
- 5 components: header, hero, features, cta, footer
- Mask all dynamic (timestamps, counters, personalization)
- Docker consistency
- CI matrix: run on macOS + Ubuntu, compare baselines

Goal: 100 consecutive runs stable across CI + local.

### 🌟 Stretch goal

Research & write up comparison: Percy vs Chromatic vs Applitools vs Playwright native. Which when? Cost? Team workflow?

---

## Next

[Day 16 — Accessibility (A11y) →](./day-16-accessibility.md)
