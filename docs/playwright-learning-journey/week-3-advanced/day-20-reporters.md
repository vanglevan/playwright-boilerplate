# Day 20 — Reporters (HTML, Allure, JUnit, Monocart)

> **Goal:** Biết chọn reporter cho từng audience, setup Allure đẹp cho stakeholder, integrate JUnit với Jenkins.
> **Thời gian:** 2 giờ

---

## Prerequisites

- Week 1-2 + Day 19 hoàn thành

---

## 1. Audience matrix

Ai đọc report? Chọn reporter theo đó.

| Audience          | Reporter        | Tại sao                    |
| ----------------- | --------------- | -------------------------- |
| Dev debug local   | HTML (built-in) | Nhanh, trace viewer        |
| Tester manual     | HTML + Allure   | Screenshots, steps         |
| PM / stakeholder  | Allure          | Epic/feature/story, trend  |
| CI logs           | Line / Dot      | Compact                    |
| Jenkins           | JUnit XML       | Native integration         |
| Detailed coverage | Monocart        | Rich data + coverage merge |

Playwright supports multiple reporters **cùng lúc**.

---

## 2. Built-in reporters

### HTML (default)

```typescript
reporter: 'html';
```

- File: `playwright-report/index.html`
- View: `npx playwright show-report`
- Có trace viewer embedded

### Line (CI default)

```typescript
reporter: 'line';
```

- 1 line update khi test chạy
- Concise cho CI logs

### Dot

```typescript
reporter: 'dot';
```

- Chỉ `.` `F` `X` — cực ngắn

### List

```typescript
reporter: 'list';
```

- Mỗi test 1 line với tên

### JUnit

```typescript
reporter: [['junit', { outputFile: 'results.xml' }]];
```

- XML format cho Jenkins, CircleCI, GitLab CI

### JSON

```typescript
reporter: [['json', { outputFile: 'results.json' }]];
```

- Custom processing downstream

### GitHub (CI annotations)

```typescript
reporter: 'github';
```

- PR inline annotations

### Blob (dùng cho shard merge)

```typescript
reporter: 'blob';
```

- CI shards → merge later

---

## 3. Multiple reporters

```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['list'], // console
    ['html', { open: 'never' }], // HTML
    ['junit', { outputFile: 'junit-results.xml' }], // Jenkins
    ['json', { outputFile: 'results.json' }], // raw data
    process.env.CI ? ['github'] : ['null'], // conditional
  ],
});
```

---

## 4. Allure — đẹp nhất cho stakeholder

### Cài

```bash
npm i -D allure-playwright
brew install allure   # macOS CLI
# Windows: scoop install allure
# Linux: tải từ GitHub releases
```

### Config

```typescript
reporter: [
  ['list'],
  [
    'allure-playwright',
    {
      detail: true,
      suiteTitle: true,
      outputFolder: 'allure-results',
      environmentInfo: {
        environment: process.env.TEST_ENV || 'dev',
        baseURL: process.env.BASE_URL,
        node_version: process.version,
      },
    },
  ],
];
```

### Chạy

```bash
npx playwright test
allure serve allure-results
# Hoặc:
allure generate allure-results -o allure-report --clean
allure open allure-report
```

### Allure-specific API

```typescript
import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';

test('checkout flow', async ({ page }) => {
  await allure.epic('E-commerce');
  await allure.feature('Checkout');
  await allure.story('Guest checkout with credit card');
  await allure.severity('critical');
  await allure.owner('QA Team');
  await allure.tag('smoke', 'payment');
  await allure.link('https://jira.com/PROJ-123', 'name', 'issue');

  await allure.step('Add item to cart', async () => {
    // ...
  });

  await allure.step('Proceed to checkout', async () => {
    // ...
  });

  // Attachments
  await allure.attachment('Response body', JSON.stringify(data), 'application/json');
});
```

**Result:** Dashboard dividable by:

- Epics → Features → Stories
- Severity
- Categories
- Timeline
- Retries visualization

---

## 5. `test.step()` — grouping universal

Không cần Allure để có steps — Playwright built-in:

```typescript
test('user can checkout', async ({ page }) => {
  await test.step('Login', async () => {
    await page.goto('/login');
    await page.fill('#user', '...');
    await page.fill('#pass', '...');
    await page.click('button[type=submit]');
  });

  await test.step('Add item to cart', async () => {
    await page.click('.item .add-btn');
  });

  await test.step('Checkout', async () => {
    await page.click('.checkout-btn');
    await expect(page).toHaveURL(/.*confirmation/);
  });
});
```

Steps show trong HTML report & Allure với timing.

---

## 6. Custom decorator `@step`

**`src/helpers/test-step.ts`:**

```typescript
import { test } from '@playwright/test';

export function step(name?: string) {
  return function (target: any, context: ClassMethodDecoratorContext) {
    return function (this: any, ...args: any[]) {
      const stepName = name || `${this.constructor.name}.${String(context.name)}`;
      return test.step(stepName, async () => target.call(this, ...args));
    };
  };
}
```

Usage in POM:

```typescript
export class LoginPage extends BasePage {
  @step()
  async login(user: string, pass: string): Promise<void> {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginButton.click();
  }
}
```

Mọi call `loginPage.login(...)` tự thành step trong report → không cần viết `test.step()` manual.

Cần bật TS decorators:

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": false // dùng new decorator spec (TS 5)
  }
}
```

---

## 7. Monocart — alternative đến Allure

```bash
npm i -D monocart-reporter
```

```typescript
reporter: [
  [
    'monocart-reporter',
    {
      name: 'Test Report',
      outputFile: 'monocart-report/index.html',
      coverage: {
        // nếu có coverage
        reports: [['lcov']],
      },
    },
  ],
];
```

**Strengths:**

- Single HTML file (self-contained)
- Coverage merge
- Customizable with plugins

---

## 8. Attachments — inline data trong report

```typescript
test('api response schema', async ({ request }, testInfo) => {
  const res = await request.get('/api/users');
  const data = await res.json();

  // Attach raw data
  await testInfo.attach('response.json', {
    body: JSON.stringify(data, null, 2),
    contentType: 'application/json',
  });

  // Attach screenshot manually
  const screenshot = await page.screenshot();
  await testInfo.attach('page', {
    body: screenshot,
    contentType: 'image/png',
  });
});
```

Attachment hiện trong HTML report và Allure.

---

## 9. Custom reporter (nâng cao)

```typescript
// src/reporters/slack-reporter.ts
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

class SlackReporter implements Reporter {
  private failed: number = 0;

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed') this.failed++;
  }

  async onEnd() {
    if (this.failed > 0) {
      await fetch('https://slack.com/webhook/...', {
        method: 'POST',
        body: JSON.stringify({ text: `${this.failed} tests failed 🚨` }),
      });
    }
  }
}

export default SlackReporter;
```

Config:

```typescript
reporter: [['./src/reporters/slack-reporter.ts']];
```

---

## 10. Deploy Allure report to GitHub Pages

Actions workflow:

```yaml
- name: Generate Allure report
  if: always()
  run: |
    npm install -g allure-commandline
    allure generate allure-results -o allure-report --clean

- name: Deploy to GitHub Pages
  if: always()
  uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./allure-report
```

Hoặc dùng action chuyên: [`simple-elf/allure-report-action`](https://github.com/marketplace/actions/allure-report-with-history)

---

## 11. Bài tập

### Bài 1: Multi-reporter

Config HTML + JUnit + JSON cùng lúc. Chạy → verify 3 outputs sinh ra.

### Bài 2: test.step()

Refactor 5 tests cũ dùng `test.step()` cho phase. Mở report → verify hierarchical.

### Bài 3: Allure full

Setup Allure. Thêm `epic/feature/story/severity` cho 10 tests. Chạy `allure serve` → explore dashboard.

### Bài 4: @step decorator

Apply `@step` decorator vào POM methods. Chạy → mọi call thành step tự động.

### Bài 5: Deploy

Deploy Allure report lên GitHub Pages. Share link.

### Bài 6: Attachment

Attach API response JSON vào 3 tests. Mở report → verify thấy.

---

## 12. Common Pitfalls

| Vấn đề                          | Fix                                                        |
| ------------------------------- | ---------------------------------------------------------- |
| `allure` CLI not found          | `brew install allure` hoặc add to PATH                     |
| Allure dashboard rỗng           | Check `allure-results/` có file JSON không                 |
| Multiple reporters chậm         | HTML reporter nặng; dùng conditional (chỉ local)           |
| JUnit XML format sai            | Playwright auto — check `outputFile` path                  |
| Decorator `@step` compile error | TS 5: dùng new spec; TS <5: `experimentalDecorators: true` |
| GitHub Pages 404                | Enable Pages in Settings, source = gh-pages branch         |

---

## 13. Best practices

- **Local dev:** HTML only (fast)
- **CI:** Line (console) + HTML (artifact) + JUnit (Jenkins) + Blob (shards)
- **Weekly demo:** Allure với epic/feature/story
- **`test.step()` liberally** — 1 phút effort, 10x readable report
- **Don't over-attach** — attachments big → artifacts lớn

---

## 14. Checklist

- [ ] HTML + JUnit + JSON running cùng lúc
- [ ] `test.step()` in 5+ tests
- [ ] Allure setup và run local
- [ ] `@step` decorator in POM
- [ ] Deploy 1 report (HTML hoặc Allure) lên GitHub Pages
- [ ] Commit: `feat: multi-reporter setup`
- [ ] NOTES.md: so sánh HTML vs Allure — khi nào dùng cái nào

---

## Resources

- [Playwright — Reporters](https://playwright.dev/docs/test-reporters)
- [Allure Playwright](https://allurereport.org/docs/playwright/)
- [Monocart Reporter](https://github.com/cenfun/monocart-reporter)
- [Custom Reporter API](https://playwright.dev/docs/api/class-reporter)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Allure Report setup tutorial](https://www.youtube.com/results?search_query=allure+report+playwright)
- [Custom reporter walkthrough](https://www.youtube.com/results?search_query=playwright+custom+reporter)
- [Report for stakeholders vs devs](https://www.youtube.com/results?search_query=test+reporting+stakeholders)

### 📝 Articles & blogs

- [Allure Report blog](https://allurereport.org/blog/) — examples + patterns
- [Monocart features](https://github.com/cenfun/monocart-reporter)
- [Report driven development](https://dev.to/search?q=test+reporting)

### 🎓 Deep topics

- [Allure labels & hierarchy (epic/feature/story)](https://allurereport.org/docs/howto/labels/)
- [Test Management Systems integration](https://www.browserstack.com/guide/test-management-tools)
- [Custom reporter API](https://playwright.dev/docs/api/class-reporter)

### 📖 Books / articles

- _The Reporting Layer_ (blog series on quality reports)

### 🐙 Related GitHub repos

- [allure-framework/allure-js](https://github.com/allure-framework/allure-js)
- [cenfun/monocart-reporter](https://github.com/cenfun/monocart-reporter)
- [simple-elf/allure-report-action](https://github.com/simple-elf/allure-report-action) — CI deploy
- [ctrf-io/github-test-reporter](https://github.com/ctrf-io/github-test-reporter) — CTRF format

### 🛠️ Tools

- Allure CLI: `brew install allure` | [allurereport.org](https://allurereport.org/)
- [TestRail](https://www.testrail.com/) — test management platform
- [Zephyr](https://smartbear.com/test-management/zephyr/) — JIRA integration
- [qTest](https://www.tricentis.com/products/quality-test-management-qtest) — enterprise

### 📊 Cheat sheets

- [Allure annotations cheatsheet](https://allurereport.org/docs/features/)
- [Playwright test.step docs](https://playwright.dev/docs/api/class-test#test-step)
- [JUnit XML format](https://llg.cubic.org/docs/junit/)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (multi-reporter)

**B1.** Config 4 reporters cùng lúc:

```typescript
reporter: [
  ['list'],
  ['html'],
  ['junit', { outputFile: 'junit.xml' }],
  ['json', { outputFile: 'results.json' }],
];
```

Verify 4 outputs sinh ra.

**B2.** test.step():

```typescript
test("checkout", async ({ page }) => {
  await test.step("login", async () => { ... });
  await test.step("add items", async () => { ... });
  await test.step("checkout", async () => { ... });
});
```

Mở HTML report — verify step hierarchy.

**B3.** Attachments:

```typescript
await testInfo.attach('api-response', {
  body: JSON.stringify(data, null, 2),
  contentType: 'application/json',
});
```

### 🟡 Trung bình (Allure rich)

**M1.** Allure labels:

```typescript
import { allure } from 'allure-playwright';

test('...', async () => {
  await allure.epic('Authentication');
  await allure.feature('Login');
  await allure.story('Valid credentials');
  await allure.severity('critical');
  await allure.owner('QA Team');
  await allure.tag('smoke');
  await allure.link('https://jira.com/ISSUE-123', 'Issue');
});
```

Dashboard — navigate by Epic → Feature → Story.

**M2.** `@step` decorator in POM — mọi method tự thành step:

```typescript
class LoginPage {
  @step()
  async login(user, pass) {
    // ...
  }
}
```

Report show "LoginPage.login" as step.

**M3.** Allure history — xem trend:

- Keep `allure-results` giữa runs
- `allure generate --clean history`
- Dashboard có chart: pass rate, trend, retries over time

**M4.** Monocart setup:

```typescript
reporter: [
  [
    'monocart-reporter',
    {
      name: 'Test Report',
      outputFile: 'monocart-report/index.html',
    },
  ],
];
```

Compare với Allure (which better for which case?).

### 🔴 Nâng cao (custom reporter)

**A1.** Build simple custom reporter:

```typescript
class StatsReporter {
  onTestEnd(test, result) {
    console.log(`[${result.status}] ${test.title}`);
  }
  onEnd() {
    console.log('Done!');
  }
}

export default StatsReporter;
```

Register, run.

**A2.** Slack notification reporter:

```typescript
async onEnd() {
  if (this.failed > 0) {
    await fetch(SLACK_WEBHOOK, {
      method: "POST",
      body: JSON.stringify({
        text: `${this.failed} tests failed 🚨`,
      }),
    });
  }
}
```

**A3.** CTRF reporter — standardized test result format:
Output in [CTRF format](https://ctrf.io/) — universal schema.

**A4.** Deploy Allure history to Pages:

```yaml
- uses: simple-elf/allure-report-action@v1
  with:
    allure_results: allure-results
    gh_pages: gh-pages
    keep_reports: 20 # keep 20 historical runs
```

Historical trend dashboard at `https://user.github.io/repo/`.

### 🏆 Mini challenge (45 phút)

**Task:** Portfolio-quality reporting setup:

- HTML report (dev)
- JUnit (Jenkins)
- Allure with epic/feature/story hierarchy
- Deploy Allure to GitHub Pages
- Slack alert on prod smoke fail
- @step decorator trong POM
- Attachments: trace, screenshot, API responses

Goal: anyone (PM, dev, QA) có thể read report understand what happened.

### 🌟 Stretch goal

Research "Test Management Integration" — how to sync Playwright results to Jira/TestRail automatically.

---

## Next

[Day 21 — Docker + Mini Project Tuần 3 →](./day-21-docker.md)
