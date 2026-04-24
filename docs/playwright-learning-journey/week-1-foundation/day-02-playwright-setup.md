# Day 2 — Dựng Playwright project from zero

> **Goal:** Tự tay tạo Playwright project, hiểu từng file sinh ra, chạy được test mẫu ở 3 chế độ (headed, UI, debug).
> **Thời gian:** 2-3 giờ

---

## Prerequisites

- Day 1 hoàn thành
- Terminal ở folder `playwright-learning-journey` (repo đã tạo hôm 0)

---

## 1. Init project

```bash
# Đảm bảo đang ở repo
cd ~/Projects/playwright-learning-journey
pwd

# Init npm
npm init -y

# Init Playwright
npm init playwright@latest
```

**Khi được hỏi:**

- Language: **TypeScript**
- Tests folder: **tests**
- GitHub Actions: **Yes** (sẽ dùng ở Week 3)
- Install Playwright browsers: **Yes** (~400MB, tải lần đầu)

Playwright sẽ cài:

- `@playwright/test` — framework chính
- Chromium, Firefox, WebKit — 3 browser binaries
- Sinh ra các file mẫu

---

## 2. Giải thích từng file sinh ra

### `package.json`

```jsonc
{
  "name": "playwright-learning-journey",
  "version": "1.0.0",
  "scripts": {
    "test": "playwright test", // chạy tất cả test
  },
  "devDependencies": {
    "@playwright/test": "^1.59.0",
    "@types/node": "^22.x",
  },
}
```

### `playwright.config.ts` — file quan trọng nhất

Mở ra đọc từng block. Bạn chưa cần hiểu hết, đánh dấu để quay lại.

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // folder chứa test files
  fullyParallel: true, // tests trong 1 file chạy song song
  forbidOnly: !!process.env.CI, // CI: fail nếu có test.only()
  retries: process.env.CI ? 2 : 0, // CI retry 2 lần
  workers: process.env.CI ? 1 : undefined, // parallel workers
  reporter: 'html', // báo cáo HTML

  use: {
    baseURL: 'http://localhost:3000', // (placeholder)
    trace: 'on-first-retry', // ghi trace khi retry
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

**Concepts cần biết:**
| Concept | Ý nghĩa |
|---|---|
| `testDir` | Playwright tìm file `*.spec.ts` ở đâu |
| `fullyParallel` | Nhiều test trong cùng file cũng chạy parallel |
| `projects` | Mỗi project = 1 browser hoặc device (mobile, desktop) |
| `use.trace` | Ghi video + snapshots để debug — "on-first-retry" là balance tốt |
| `workers` | Số tests chạy đồng thời |

### `tests/example.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Get started' }).click();
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
```

2 test mẫu:

- Test 1: vào playwright.dev, assert title match regex `/Playwright/`
- Test 2: click link "Get started", assert heading "Installation" hiện

### `tests-examples/demo-todo-app.spec.ts`

Demo phức tạp hơn — TodoMVC đầy đủ. Đọc lướt, không cần hiểu hết hôm nay.

### `.github/workflows/playwright.yml`

CI workflow — sẽ dùng ở Day 19.

### `.gitignore` (cần update)

Thêm các dòng sau nếu chưa có:

```
node_modules/
/playwright-report/
/test-results/
/blob-report/
/playwright/.cache/
.env
.env.*
!.env.example
```

---

## 3. Chạy test ở 4 chế độ khác nhau

### Chế độ 1: Headless (mặc định)

```bash
npx playwright test
```

Browser chạy ẩn, nhanh nhất. Xem output trong terminal + report tại `playwright-report/`.

### Chế độ 2: Headed (thấy browser)

```bash
npx playwright test --headed
```

Browser mở lên thật, bạn thấy nó click. Học cơ bản nên dùng cái này.

### Chế độ 3: UI Mode (trải nghiệm cực kỳ khuyến nghị)

```bash
npx playwright test --ui
```

Mở 1 UI tool: chọn test, xem step-by-step, time-travel, retry 1 test. **Dùng UI mode trong suốt quá trình học.**

### Chế độ 4: Debug (step-through)

```bash
npx playwright test --debug
```

Mở Playwright Inspector + browser, pause ở từng step. Dùng khi test fail bí ẩn.

### Xem report sau khi chạy

```bash
npx playwright show-report
```

---

## 4. Cài thêm script tiện

Mở `package.json`, thay `scripts` block:

```json
"scripts": {
  "test": "playwright test",
  "test:headed": "playwright test --headed",
  "test:ui": "playwright test --ui",
  "test:debug": "playwright test --debug",
  "test:chromium": "playwright test --project=chromium",
  "report": "playwright show-report"
}
```

Giờ:

```bash
npm run test:ui       # thay cho gõ dài
npm run report
```

---

## 5. Cấu trúc folder ban đầu

```
playwright-learning-journey/
├── .github/workflows/playwright.yml
├── node_modules/        # do git ignore
├── playwright-report/   # do git ignore
├── test-results/        # do git ignore
├── tests/
│   └── example.spec.ts
├── tests-examples/
│   └── demo-todo-app.spec.ts
├── .gitignore
├── package.json
├── package-lock.json
├── playwright.config.ts
└── README.md
```

---

## 6. Bài tập

### Bài 1: Chạy & quan sát

- Chạy `npm run test` → đếm bao nhiêu test pass
- Chạy `npm run test:headed --project=chromium` → nhìn từng bước
- Chạy `npm run test:ui` → click vào 1 test, explore timeline

### Bài 2: Cố tình break test

Trong `example.spec.ts`, đổi:

```typescript
await expect(page).toHaveTitle(/Playwright/);
// thành
await expect(page).toHaveTitle(/Selenium/);
```

Chạy lại, xem:

- Terminal output báo gì?
- Mở `playwright-report/index.html` — có trace viewer không?
- Download trace, mở bằng [trace.playwright.dev](https://trace.playwright.dev/)

### Bài 3: Thêm test mới

Tạo `tests/my-first.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('can navigate to docs', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Docs' }).first().click();
  await expect(page).toHaveURL(/.*docs.*/);
});

test('can search documentation', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  // TODO: tự viết — click button search, gõ "locator", verify kết quả
});
```

Hoàn thành test thứ 2 → chạy → xanh.

### Bài 4: Khám phá config

Trong `playwright.config.ts`:

- Comment out project `webkit` — chạy lại, chỉ 2 project chạy
- Đổi `retries: 3` — chạy test fail → thấy retry 3 lần
- Đổi `workers: 1` — chạy → chậm hơn (sequential)

---

## 7. Common Pitfalls

| Vấn đề                                                     | Nguyên nhân                | Fix                                                 |
| ---------------------------------------------------------- | -------------------------- | --------------------------------------------------- |
| `npm init playwright` báo lỗi                              | Node < 18                  | `nvm use 20`                                        |
| Browser download chậm/fail                                 | Firewall, mạng             | `HTTPS_PROXY=... npx playwright install` hoặc retry |
| `Cannot find module '@playwright/test'`                    | Quên `npm i`               | Chạy `npm install`                                  |
| Test chạy được terminal nhưng VS Code extension không nhận | Extension chưa thấy config | Restart VS Code, Cmd+Shift+P → "Reload Window"      |
| `ENOENT: .env`                                             | Chưa tạo env (OK hôm nay)  | Ignore cho đến Day 10                               |

---

## 8. Checklist

- [ ] `npm init playwright@latest` đã chạy thành công
- [ ] `tests/example.spec.ts` chạy xanh headless
- [ ] Đã thử cả 4 mode: headless, headed, UI, debug
- [ ] Hiểu `projects` trong config là gì
- [ ] Đã thêm `.gitignore` với `playwright-report/`, `test-results/`
- [ ] Bài 2 làm xong — xem được trace viewer
- [ ] Bài 3 — test thứ 2 pass
- [ ] Commit: `feat: initialize playwright project` + push
- [ ] NOTES.md: ghi điều ngạc nhiên nhất tuần này

---

## Resources

- [Playwright — Getting Started](https://playwright.dev/docs/intro)
- [Playwright — Running and debugging tests](https://playwright.dev/docs/running-tests)
- [Playwright UI Mode Announcement](https://playwright.dev/docs/test-ui-mode)
- Trace Viewer online: [trace.playwright.dev](https://trace.playwright.dev/)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Playwright Tutorial for Beginners (freeCodeCamp)](https://www.youtube.com/watch?v=wawbt1cATsk) — 2h comprehensive
- [Playwright YouTube (official)](https://www.youtube.com/@Playwrightdev) — weekly new videos
- [Playwright UI Mode Demo (Debbie O'Brien)](https://www.youtube.com/watch?v=xz9jF-LzM2I) — 10 phút essential
- [Trace Viewer Walkthrough](https://www.youtube.com/watch?v=lfOK4RkZFFE) — debug workflow
- [Playwright vs Cypress vs Selenium (2026 comparison)](https://www.youtube.com/results?search_query=playwright+vs+cypress+2026)

### 📝 Articles & blogs

- [Playwright Blog](https://playwright.dev/blog) — official release notes + best practices
- [Checkly — Playwright vs Cypress deep dive](https://www.checklyhq.com/blog/cypress-vs-playwright/)
- [How to structure Playwright project](https://dev.to/playwright)
- [30 Playwright patterns you should know](https://dev.to/search?q=playwright)

### 🎓 Free courses

- [Test Automation University — Playwright path](https://testautomationu.applitools.com/playwright-tutorial/) — multiple modules, cert
- [LambdaTest — Playwright tutorial](https://www.lambdatest.com/learning-hub/playwright) — with free cloud runs
- [Playwright docs — "Getting Started" series](https://playwright.dev/docs/intro) — official walkthrough

### 📖 Books / deeper reading

- [Playwright official guide (PDF equivalent)](https://playwright.dev/docs/writing-tests) — read chapter by chapter
- _Modern Web Testing with Playwright_ (O'Reilly, 2024) — comprehensive paid book
- [Engineering blog archive — Microsoft Playwright](https://devblogs.microsoft.com/playwright/) — under-the-hood

### 🐙 Related GitHub repos

- [microsoft/playwright-examples](https://github.com/microsoft/playwright/tree/main/examples) — official examples
- [mxschmitt/awesome-playwright](https://github.com/mxschmitt/awesome-playwright) — curated tools
- [playwright-community/action-playwright-cli](https://github.com/playwright-community/action-playwright-cli) — CI actions
- [microsoft/playwright-github-action](https://github.com/microsoft/playwright-github-action) — official CI action

### 📊 Cheat sheets / quick refs

- [Playwright config cheatsheet](https://playwright.dev/docs/test-configuration) — all config options
- [Playwright CLI flags](https://playwright.dev/docs/test-cli) — full CLI reference
- [DevHints — Playwright](https://devhints.io/) — search "playwright"

### 🛠️ Interactive tools

- [Playwright Tour (interactive)](https://playwright.dev/docs/intro) — docs have try-live widgets
- [Demo: TodoMVC for practice](https://demo.playwright.dev/todomvc)
- [Demo: E-commerce for practice](https://demo.playwright.dev/)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (củng cố setup)

**B1.** Cài lại Playwright trong folder `~/Desktop/pw-scratch` — lặp lại `npm init playwright@latest`. Lần 2 quen tay hơn.

**B2.** Đọc từng dòng `playwright.config.ts`. Viết comment tiếng Việt next to mỗi field giải thích ý nghĩa.

**B3.** Chạy lần lượt:

- `npx playwright test`
- `npx playwright test --headed`
- `npx playwright test --ui`
- `npx playwright test --debug`
- `npx playwright test --project=chromium`
- `npx playwright test --list`
- `npx playwright test --repeat-each=3`

Note difference trong NOTES.md.

**B4.** Chạy test 1 file specific: `npx playwright test tests/example.spec.ts`. Chạy 1 test specific: `npx playwright test tests/example.spec.ts -g "has title"`.

### 🟡 Trung bình (hiểu sâu config)

**M1.** Modify `playwright.config.ts`:

- Đổi `workers` từ undefined → 1, 2, 4. Đo thời gian suite mỗi config.
- Bật `fullyParallel: true` vs `false`. So kết quả.
- Thêm project mới: mobile-chrome với viewport iPhone 13.

**M2.** Environment variable trong test:

```typescript
test('log env', async ({ page }) => {
  console.log('Running on:', process.env.TEST_ENV);
});
```

Chạy với `TEST_ENV=staging npm test` → verify output.

**M3.** Viết 3 tests khác nhau trên 3 trang public:

- https://playwright.dev — assert title, click link
- https://www.wikipedia.org — fill search box, submit, verify results page
- https://www.github.com — click "Sign in" link, verify URL change

Tất cả pass headless.

**M4.** Trace viewer deep dive:

- Break 1 test cố ý (assertion sai)
- Chạy `--trace=on` → tìm file trace.zip
- Drag vào https://trace.playwright.dev/
- Explore: DOM snapshot, network tab, source tab, console tab
- Note 3 info bạn thấy hữu ích nhất

### 🔴 Nâng cao (production-ish patterns)

**A1.** Multi-browser matrix:

- Thêm 3 project: chromium, firefox, webkit trong config
- Thêm 2 mobile: iPhone 13, Pixel 5
- Chạy `npx playwright test --project=chromium --project=firefox` → parallel 2 browsers
- Tổng thời gian?

**A2.** Conditional projects:

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ...(process.env.CI
    ? [
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ]
    : []),
];
```

Chạy local → 1 project. Set `CI=1 npm test` → 3 projects.

**A3.** Custom metadata trong report:

```typescript
// playwright.config.ts
metadata: {
  testEnvironment: process.env.TEST_ENV || "local",
  testDate: new Date().toISOString(),
  runBy: process.env.USER,
},
```

Chạy, mở HTML report → verify hiển thị.

### 🏆 Mini challenge (30-45 phút)

**Task:** Setup "multi-env config" từ scratch (sẽ dùng lại Day 10):

Tạo 3 files:

- `playwright.config.dev.ts`
- `playwright.config.staging.ts`
- `playwright.config.prod.ts`

Mỗi file override:

- `use.baseURL` (localhost / staging / prod URLs)
- `retries` (0 / 1 / 2)
- `reporter` (list / html / junit)

Thêm npm scripts:

```json
"test:dev": "playwright test --config=playwright.config.dev.ts",
"test:staging": "playwright test --config=playwright.config.staging.ts"
```

Verify cả 3 work.

### 🌟 Stretch goal

Đọc source [playwright.config.ts examples](https://github.com/microsoft/playwright/blob/main/tests/playwright-test/assets/playwright.config.ts). Xem Playwright team tự config thế nào.

---

## Next

[Day 3 — Locators & Selectors →](./day-03-locators.md)
