# Day 14 — Debug như senior + Mini Project Tuần 2

> **Goal:** Master 5 debugging tools, debug flaky test trong 10 phút, hoàn thành mini project tuần 2.
> **Thời gian:** 3-4 giờ

---

## Prerequisites

- Day 8-13 hoàn thành

---

## 1. 5 debugging tools must-know

### 1.1 Playwright UI Mode — best overall

```bash
npm run test:ui
```

- Chọn test bằng chuột
- Run in watch mode (auto re-run khi save)
- Timeline: hover step → xem snapshot
- Pick locator button → click DOM → copy locator

**Dùng 80% thời gian debug.**

### 1.2 Debug mode (Inspector)

```bash
npx playwright test --debug
# Hoặc: PWDEBUG=1 npx playwright test
```

- Pause từ đầu
- Step through từng action
- Explore locators
- Resume/skip

### 1.3 Trace Viewer (post-mortem)

```bash
# After test fails
npx playwright show-trace test-results/.../trace.zip
# Hoặc online: trace.playwright.dev
```

- Timeline actions
- Network requests
- Console messages
- DOM snapshot ở mỗi step

Config để always capture:

```typescript
use: {
  trace: "on-first-retry",   // balance
  // hoặc "on" khi debug
}
```

### 1.4 VS Code extension

- Panel "Testing" — tree view tests
- Run/debug với breakpoint
- "Pick locator" button trong editor

### 1.5 Page events trong code

```typescript
page.on('console', (msg) => console.log('PAGE:', msg.text()));
page.on('request', (req) => console.log('→', req.method(), req.url()));
page.on('response', (res) => console.log('←', res.status(), res.url()));
page.on('pageerror', (err) => console.log('ERROR:', err));
```

Dùng tạm khi debug. Xoá khi xong.

---

## 2. Debugging recipes

### 2.1 Test fail với "locator not found"

**Step 1:** Mở trace → tìm step fail → xem DOM snapshot lúc đó.

**Step 2:** Hỏi các câu:

- Element có trong DOM không?
- Có hidden không (display:none, visibility:hidden)?
- Có bị overlay che không?
- Có trong iframe không? (Playwright cần `frameLocator`)
- Selector có đúng không? (copy từ pick-locator)

**Step 3:** Fix:

- Wrong locator → dùng `page.getByRole` với name chính xác
- Element in iframe → `page.frameLocator('#frame').getByRole(...)`
- Hidden → check logic app (button disabled until form valid?)
- Late render → assertion đã auto-wait, ok

### 2.2 Test flaky (pass 7/10 lần)

**Step 1:** `npx playwright test path/to/flaky.spec.ts --repeat-each=10` → reproduce

**Step 2:** Trace lần fail → so với lần pass:

- Network timing khác?
- Animation không stable?
- Data race (API chậm hơn UI)?

**Step 3:** Fix theo root cause:

- Animation → `await expect(locator).toBeVisible()` (auto-wait stable)
- Race → `await page.waitForResponse(...)` sync với API
- Async state → assertion thay vì `isVisible()`

### 2.3 Test pass local, fail CI

**Common causes:**

1. **Viewport khác** — CI thường 1280x720, local có thể khác
2. **Font rendering** — macOS ≠ Linux CI → visual test diff
3. **Network** — CI slower, timeout chặt hơn
4. **Display** — CI headless, local headed → CSS hover/focus state

**Fix:**

```typescript
use: {
  viewport: { width: 1280, height: 720 },  // consistent
}
```

Reproduce local:

```bash
docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.59.1 npm test
```

### 2.4 `TimeoutError: locator.click: Timeout 30000ms exceeded`

**Causes:**

- Element chưa render
- Overlay che
- Animation đang chạy
- Disabled

**Debug:**

```typescript
await page.pause(); // chèn dòng này ngay trước action fail
// Chạy với --debug → Inspector mở → bạn inspect DOM
```

---

## 3. Useful snippets khi debug

```typescript
// 1. Wait but log
await page.waitForTimeout(100);
console.log('DOM now:', await page.content());

// 2. Screenshot at any point
await page.screenshot({ path: 'debug.png', fullPage: true });

// 3. Log locator info
const loc = page.getByRole('button', { name: 'Submit' });
console.log('Count:', await loc.count());
console.log('Visible:', await loc.isVisible());
console.log('HTML:', await loc.innerHTML());

// 4. Explore page object
console.log(await page.title());
console.log(page.url());
console.log(await page.locator('*').count()); // total elements

// 5. pause execution
await page.pause(); // Inspector mở, can resume

// 6. Slow down for human watching
// playwright.config.ts: launchOptions: { slowMo: 500 }
```

---

## 4. `test.only` và `test.skip` cho debug

```typescript
test.only("this test I'm debugging", async () => {
  // chỉ test này chạy
});
```

**⚠️ ESLint `no-focused-test`** chặn commit. Tốt — tránh push quên.

```typescript
test.skip("broken for now", async () => { ... });
```

Skip có reason → team biết lý do.

---

## 5. Mini Project Tuần 2

### Brief

Xây dựng **e-commerce flow test suite** hoàn chỉnh, demonstrating tuần 2 skills.

### App: SauceDemo hoặc Automation Exercise

### Requirements

#### Structure

```
src/
├── pages/
│   ├── base.page.ts
│   ├── login.page.ts
│   ├── inventory.page.ts
│   ├── cart.page.ts
│   └── checkout.page.ts
├── components/
│   └── header.component.ts
├── fixtures/
│   ├── pages.fixture.ts
│   ├── api.fixture.ts
│   ├── auth.fixture.ts
│   └── index.ts          # merge
├── api/
│   ├── api-client.ts
│   └── endpoints/
├── helpers/
│   ├── logger.ts
│   └── data-factory.ts
├── config/
│   ├── env.ts
│   └── constants.ts
└── data/
    └── users.json

tests/
├── auth.setup.ts
├── auth/
│   └── login.spec.ts
├── shopping/
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   └── product-list.spec.ts
└── api/
    └── (nếu app có API)

playwright.config.ts       # multi-project với storage state
.env.dev, .env.staging     # env per target
```

#### Requirements chi tiết

1. **Auth setup** (storage state) — 1 lần login, reuse
2. **Fixtures merge** — `{ loginPage, inventoryPage, cartPage, testUser, apiClient }`
3. **Env config** — Zod validated, switch dev/staging
4. **Data factory** — `buildUser()`, `buildCheckoutInfo()`
5. **15+ tests**, ít nhất:
   - 3 auth tests (login happy/unhappy/locked)
   - 5 shopping tests
   - 3 checkout tests
   - 2 negative tests (empty cart checkout, invalid form)
   - 2 data-driven (multiple users/products)
6. **Parallel ready** — `workers: 4`, tests độc lập
7. **Tags** — `@smoke`, `@regression`, `@critical`
8. **Quality** — `npm run check` xanh
9. **Commits** — theo convention

#### Deliverables

- [ ] Tests pass với `npm test --workers=4`
- [ ] Smoke only: `npm test -- --grep @smoke` → chạy nhanh <1 phút
- [ ] README update mô tả cấu trúc
- [ ] Commit ≥ 7 commits tuần này
- [ ] Screenshot test report trong README

---

## 6. Bài tập debugging

### Bài 1: Induced flakiness

Viết test cố tình flaky:

```typescript
test('flaky', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc');
  await page.getByPlaceholder('What needs to be done?').fill('test');
  await page.keyboard.press('Enter');
  // Race: assert ngay khi chưa render
  expect(await page.locator('.todo-list li').count()).toBe(1); // không auto-retry
});
```

Chạy 10 lần → ghi tỉ lệ fail. Fix bằng web-first assertion:

```typescript
await expect(page.locator('.todo-list li')).toHaveCount(1);
```

Chạy 10 lần → so sánh.

### Bài 2: Debug với trace

Cho 1 test fail (tự tạo fail case). Debug chỉ bằng trace file, không chạy lại test. Xác định:

- Step nào fail?
- DOM lúc đó thế nào?
- Network request có status gì?

### Bài 3: `page.pause()` workflow

Viết test, chèn `await page.pause()` ở giữa. Chạy `--debug`. Thao tác trong Inspector:

- Step through
- Pick locator
- Resume

---

## 7. Checklist cuối tuần 2

- [ ] Mini project 15+ tests pass parallel
- [ ] Storage state hoạt động
- [ ] API client typed + Zod validated
- [ ] Debug được flaky test trong 10' bằng trace
- [ ] `npm run check` xanh
- [ ] Commit ≥ 7 tuần này
- [ ] Push lên GitHub, CI chạy (nếu đã setup Day 2)
- [ ] README mô tả rõ project
- [ ] NOTES.md week 2 retro

---

## 8. Tự đánh giá

| Câu hỏi                                 | Check |
| --------------------------------------- | ----- |
| Giải thích fixture cho người chưa biết? | ☐     |
| Parallel vs serial — khi nào dùng gì?   | ☐     |
| Sharding là gì, đã run?                 | ☐     |
| Zod schema validation lý do?            | ☐     |
| Storage state — luồng activity?         | ☐     |
| Khi debug, tool đầu tiên bạn mở?        | ☐     |

---

## 9. Ready for Week 3?

Week 3 sẽ học: Visual regression, A11y, Performance, Network mocking, CI/CD, Reporters, Docker.

**→** [Week 3 Overview](../week-3-advanced/README.md)
**→** [Day 15 — Visual Regression Testing](../week-3-advanced/day-15-visual-regression.md)

---

## Resources

- [Playwright — Debugging Tests](https://playwright.dev/docs/debug)
- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Playwright UI Mode](https://playwright.dev/docs/test-ui-mode)
- Video: "Playwright UI Mode" on YouTube (ms.playwright channel)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Playwright Debugging Masterclass](https://www.youtube.com/results?search_query=playwright+debugging+masterclass)
- [Trace Viewer Deep Dive](https://www.youtube.com/watch?v=lfOK4RkZFFE)
- [UI Mode new features](https://www.youtube.com/@Playwrightdev)
- [Debug flaky tests live](https://www.youtube.com/results?search_query=debug+flaky+playwright)

### 📝 Articles & blogs

- [Playwright Debug docs](https://playwright.dev/docs/debug)
- [Trace Viewer guide](https://playwright.dev/docs/trace-viewer-intro)
- [Mental models for debugging](https://kentcdodds.com/blog/aha-programming)
- [Rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging)
- [Scientific debugging](https://andygrove.io/2022/10/scientific-debugging/)

### 🎓 Debug skills (meta)

- [Debugging: The 9 Indispensable Rules](https://debuggingrules.com/) — David Agans
- [Chrome DevTools — Debugging guide](https://developer.chrome.com/docs/devtools/javascript/)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)

### 📖 Books

- _Why Programs Fail_ — Andreas Zeller (academic but applicable)
- _Debugging: The 9 Indispensable Rules_ — Agans (practical)

### 🐙 Related GitHub repos

- [microsoft/playwright — test utilities](https://github.com/microsoft/playwright/tree/main/packages/playwright/src) — understand internals

### 📊 Cheat sheets

- [Playwright CLI debug flags](https://playwright.dev/docs/test-cli)
- [Chrome DevTools shortcuts](https://developer.chrome.com/docs/devtools/shortcuts/)
- [VS Code debug shortcuts](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf)

### 🛠️ Tools

- [trace.playwright.dev](https://trace.playwright.dev/) — online trace viewer
- VS Code Playwright extension — pick locator button, debug inline
- Chrome DevTools Performance tab — see render blockers
- [Playwright-bdd](https://github.com/vitalets/playwright-bdd) — debug BDD (advanced)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (tool mastery)

**B1.** Practice all 5 debug tools trên 1 test:

1. `npm run test:ui` → navigate test, step through
2. `npx playwright test --debug` → Inspector mở
3. `npx playwright test --trace=on` → sau đó show-trace
4. VS Code → Pick locator
5. `page.on("console", ...)` → log browser console

**B2.** Trace viewer — cố tình fail, analyze:

- Actions timeline
- DOM snapshot at failure
- Network requests
- Console logs

**B3.** UI Mode watch — chạy `--ui`, edit test, save → watch auto-re-run.

### 🟡 Trung bình (diagnose flaky)

**M1.** Create 5 flaky patterns:

```typescript
// 1. Race condition
await page.click("button");
const count = await page.locator(".item").count();  // race with render

// 2. Animation
await page.click(".toggle");
await expect(page.locator(".menu")).toBeVisible();  // might catch mid-animation

// 3. Non-web-first
const visible = await page.locator(".error").isVisible();
expect(visible).toBe(true);

// 4. Order dependency
test("create", ...);  // creates user
test("verify", ...);  // assumes user exists

// 5. Slow network
await page.goto("/");
await page.locator(".dashboard").click();  // dashboard might not load yet
```

Run with `--repeat-each=20` → observe fail rate. Fix each.

**M2.** Reproduce production bug — 1 test fail CI, pass local:

- Docker: reproduce Linux env
- Set `CI=1 npm test` — see retries behavior
- Throttle CPU to simulate slow CI

**M3.** Page events instrumentation:

```typescript
page.on('console', (msg) => console.log('PAGE:', msg.type(), msg.text()));
page.on('pageerror', (err) => console.log('ERROR:', err));
page.on('request', (req) => console.log('→', req.method(), req.url()));
page.on('response', (res) => console.log('←', res.status(), res.url()));
page.on('requestfailed', (req) => console.log('✗', req.url(), req.failure()?.errorText));
```

Log all. Find 1 unexpected event.

**M4.** `page.pause()` workflow:

```typescript
test('debugging', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Inspector opens here
  await page.click('button');
});
```

Run with `--debug`. In Inspector:

- Step over
- Use Pick locator button
- Modify & resume

### 🔴 Nâng cao (root cause detective)

**A1.** HTTP Archive (HAR) recording:

```typescript
test.use({
  recordHar: { path: 'trace.har' },
});
```

Replay HAR trong other test để isolate backend issues.

**A2.** Video debug — mỗi fail có video:

```typescript
use: {
  video: 'retain-on-failure';
}
```

Open video → identify visual issue.

**A3.** Playwright Inspector scripting:

```bash
PWDEBUG=1 npx playwright test
```

Learn keyboard shortcuts trong Inspector.

**A4.** Performance profiling — record trace trong Chrome DevTools:

```typescript
const cdp = await page.context().newCDPSession(page);
await cdp.send('Performance.enable');
// ... actions ...
const metrics = await cdp.send('Performance.getMetrics');
```

### 🏆 Mini challenge (60 phút) — "Debug Detective"

**Task:** Cho 1 intentionally buggy test, find root cause trong 30 phút.

Tạo `debug-lab.spec.ts` với 3 tests fail mỗi cái cho 1 reason khác nhau:

1. Wrong locator (matches nhiều element, uses `.first()` sai scope)
2. Race condition (action before page ready)
3. Flaky CSS state (hover-dependent visibility)

**Process:**

1. Run test → see fail
2. Check trace
3. Formulate hypothesis
4. Verify hypothesis (add logs hoặc use `page.pause()`)
5. Fix
6. Verify 10 consecutive passes

Document process trong `DEBUG_REPORT.md` — timeline approach.

---

## 🏆 Mini project tuần 2 — Challenge mở rộng

### 🟢 Option A — E-commerce flow

Full test suite cho saucedemo.com:

- 20+ tests covering all critical flows
- Storage state auth
- API + UI hybrid (nếu có API)
- Data factory with faker
- Multi-env config
- 4 workers parallel
- Tags: @smoke, @regression, @critical

### 🟡 Option B — Full DemoBlaze

https://www.demoblaze.com (e-commerce demo):

- Register, login, logout
- Browse products, categories, search
- Add to cart, view cart, place order
- Contact form

Tests: 30+ covering happy + edge cases.

### 🔴 Option C — Multi-site scenario

Pick 2 sites (vd: saucedemo + automationexercise):

- Shared POM base (can reuse HeaderComponent?)
- Shared fixtures
- Different env per site
- CI runs both in matrix

Show scalability pattern.

---

## Next

Week 3 sẽ học: Visual regression, A11y, Performance, Network mocking, CI/CD, Reporters, Docker.

**→** [Week 3 Overview](../week-3-advanced/README.md)
**→** [Day 15 — Visual Regression Testing](../week-3-advanced/day-15-visual-regression.md)
