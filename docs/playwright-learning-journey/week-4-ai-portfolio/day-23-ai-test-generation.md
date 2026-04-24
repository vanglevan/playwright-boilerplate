# Day 23 — AI-Assisted Test Generation (đúng cách)

> **Goal:** Combo `playwright codegen` + AI refactor để tạo test nhanh 5-10x, nhưng không hy sinh quality.
> **Thời gian:** 2-3 giờ

---

## Prerequisites

- Day 22 hoàn thành

---

## 1. Workflow 3 bước "AI as pair, not replacement"

```
┌─────────────────────┐    ┌────────────────────┐    ┌─────────────────────┐
│ 1. Record + Draft   │ -> │ 2. AI Refactor     │ -> │ 3. Human Polish     │
│ playwright codegen  │    │ Move to POM        │    │ Review + extend     │
│ or AI from Gherkin  │    │ Replace bad pats   │    │ Run, debug, commit  │
└─────────────────────┘    └────────────────────┘    └─────────────────────┘
```

Không skip bước 3. AI hay generate code pass typecheck nhưng test thực sự fail.

---

## 2. Bước 1A: Playwright Codegen

### Record traffic

```bash
npx playwright codegen https://www.saucedemo.com
```

Mở 2 cửa sổ:

- Browser — bạn thao tác bình thường
- Inspector — code tự generate

**Workflow:**

1. Bạn: Click Login button, fill username, fill password, click Login
2. Inspector:

```typescript
await page.goto('https://www.saucedemo.com/');
await page.getByPlaceholder('Username').click();
await page.getByPlaceholder('Username').fill('standard_user');
await page.getByPlaceholder('Password').click();
await page.getByPlaceholder('Password').fill('secret_sauce');
await page.getByRole('button', { name: 'Login' }).click();
```

**Strengths:**

- Locator gợi ý thường tốt (role-based)
- Nhanh cho exploratory
- Hiển thị element bạn vừa click

**Weaknesses:**

- Bao gồm cả click thừa (focus, tab)
- Không biết context POM
- Không có assertion

---

## 2. Bước 1B: AI từ spec

Alternative: không record, mô tả Gherkin cho AI:

```
Prompt:
Generate Playwright test for SauceDemo login:

Given user at https://www.saucedemo.com/
When types "standard_user" username, "secret_sauce" password
  And clicks Login
Then URL contains "/inventory.html"
  And heading "Products" is visible

Use TypeScript, web-first assertions, no POM yet (just bare test).
```

AI draft:

```typescript
import { test, expect } from '@playwright/test';

test('login redirects to inventory', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/.*inventory\.html/);
  await expect(page.getByText('Products')).toBeVisible();
});
```

**Tốt hơn codegen vì có assertion.**

---

## 3. Bước 2: AI refactor vào POM

```
Prompt:
Refactor this test to use POM.

Existing code:
[paste draft]

Project has BasePage at src/pages/base.page.ts.
Create LoginPage at src/pages/login.page.ts with:
- extends BasePage
- path = "/"
- locators: username, password, loginButton
- method: login(user, pass)

Test file should import LoginPage and fixture from @fixtures/index.

Constraints:
- Use `readonly` for Locator properties
- TypeScript strict
- Use `getByRole` / `getByPlaceholder` only
```

AI trả:

**`src/pages/login.page.ts`:**

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly path = '/';
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async login(user: string, pass: string): Promise<void> {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginButton.click();
  }
}
```

**`tests/saucedemo/login.spec.ts`:**

```typescript
import { test, expect } from '@fixtures/index';

test('login redirects to inventory', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
  await expect(page).toHaveURL(/.*inventory\.html/);
  await expect(page.getByText('Products')).toBeVisible();
});
```

---

## 4. Bước 3: Human polish (**quan trọng nhất**)

Checklist review:

- [ ] Assertion đủ? (URL + 1 content assertion tốt; chỉ URL không đủ)
- [ ] Locator priority đúng? (getByRole > placeholder)
- [ ] Có magic number/string? (credentials nên từ env)
- [ ] Cleanup cần? (logout, reset cart?)
- [ ] Test tag? (`@smoke`, `@critical`)
- [ ] Edge case miss? (login với trailing space?)

**Apply polish:**

```typescript
import { test, expect } from '@fixtures/index';
import { TAGS } from '@config/constants';
import { env } from '@config/env';

test.describe('SauceDemo login', () => {
  test(`valid user redirects to inventory ${TAGS.SMOKE} ${TAGS.CRITICAL}`, async ({
    page,
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(env.TEST_USER_USERNAME, env.TEST_USER_PASSWORD);

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    await expect(page.locator('[data-test="inventory-item"]')).toHaveCount(6);
  });
});
```

So với draft → tốt hơn nhiều.

---

## 5. AI cho negative cases (strength thật sự)

Con người hay miss negative. AI rất giỏi brainstorm:

```
Prompt:
Given this happy-path test [paste], generate 5 negative/edge tests.
For each: test name, setup, expected behavior.
Don't write code yet — just the list.
```

AI trả:

1. **Empty username** — error "Username is required"
2. **Empty password** — error "Password is required"
3. **Wrong password** — error "Epic sadface: ..."
4. **Locked out user** (`locked_out_user`) — locked message
5. **SQL injection attempt** (`' OR 1=1 --`) — treated as invalid, no crash
6. **Whitespace-only username** — same as empty
7. **Very long username (10000 chars)** — no UI break
8. **Unicode/emoji** (`user_😀`) — graceful handling

Review → chọn 3-5 viết.

---

## 6. Generate API tests từ OpenAPI spec

Nếu app có OpenAPI/Swagger:

```
Prompt:
Given this OpenAPI spec for /api/users [paste relevant part],
generate Playwright API tests covering:
- Each endpoint success path
- Each error case mentioned in spec
- Schema validation using Zod (I use zod package)

Use pattern from src/api/endpoints/users.ts.
```

Scalable cho apps có 50+ endpoints.

---

## 7. AI cho data scenarios

```
Prompt:
Generate 10 diverse user records for signup testing. Include:
- Normal names
- Unicode names (Vietnamese, Chinese, Arabic, emoji)
- Edge lengths (1-char, 100-char)
- SQL injection attempts
- XSS attempts
- Valid but uncommon emails (+ alias, dots, subdomains)

Format: TypeScript array, with `expectedResult` field explaining each.
```

AI trả array → bạn dùng data-driven testing.

---

## 8. Anti-patterns

| Pattern                       | Why bad                          |
| ----------------------------- | -------------------------------- |
| Copy AI code 100% → push      | Unreviewed bugs slip in          |
| AI generates whole test suite | No understanding, can't debug    |
| Use AI for simple things      | Overhead > benefit               |
| Skip typecheck after AI       | Invented APIs break              |
| Never read AI output          | Hardware programmed with AI bugs |

---

## 9. Bài tập

### Bài 1: Codegen workflow

Chọn 1 app demo. Dùng codegen record 1 flow (register hoặc checkout). Copy output.

### Bài 2: AI refactor

Paste codegen output cho AI. Ask refactor vào POM với specific constraints. Compare before/after.

### Bài 3: Negative brainstorm

Cho happy-path test hiện có. Ask AI 10 negative cases. Chọn 3 viết.

### Bài 4: Self-benchmark

Time yourself:

- Write 1 test manual (no AI) — note time
- Write 1 similar test with AI flow — note time
- Compare

### Bài 5: AI wrong detection

Cố gắng detect AI hallucination:

- Ask AI generate test dùng `page.waitForSelector` (deprecated API)
- Check output: AI có flag deprecated không? Nếu không, AI chưa updated.

---

## 10. Common Pitfalls

| Vấn đề                              | Fix                                       |
| ----------------------------------- | ----------------------------------------- |
| AI đề xuất `page.waitForTimeout`    | Add rule to prompt: "no waitForTimeout"   |
| AI generate POM không match pattern | Ref existing file trong prompt            |
| AI miss assertions                  | Specify: "assert both URL and content"    |
| AI quên import                      | Always review imports; run typecheck      |
| AI fabricate package                | Check package.json; don't install blindly |

---

## 11. Measurement

Track trong NOTES.md:

```markdown
## Day 23 — AI test generation

### Productivity

- Manual write test: ~15 min
- AI-assisted: ~5 min (prompt + review + polish)
- Savings: 10 min/test × 20 tests/week = 3.3 hrs

### Quality

- AI draft kept 100%: 20% of cases
- Needed minor tweaks: 60%
- Rewrote mostly: 20%

### Best prompt this week

[template]
```

---

## 12. Checklist

- [ ] Codegen workflow thử
- [ ] AI refactor vào POM thành công
- [ ] 3 negative cases từ AI brainstorm
- [ ] Time benchmark manual vs AI
- [ ] Commit: `test: ai-assisted test generation workflow`
- [ ] NOTES.md: template prompt tốt nhất

---

## Resources

- [Playwright — Codegen](https://playwright.dev/docs/codegen)
- [Claude — Prompt Engineering](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering)
- [OpenAPI / Swagger](https://swagger.io/specification/)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Playwright codegen walkthrough (official)](https://www.youtube.com/@Playwrightdev)
- [AI-assisted test generation demo](https://www.youtube.com/results?search_query=ai+test+generation)
- [OpenAPI to tests pipeline](https://www.youtube.com/results?search_query=openapi+to+tests)

### 📝 Articles & blogs

- [Playwright — Test Generator docs](https://playwright.dev/docs/codegen-intro)
- [AI-pair programming patterns](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Swagger/OpenAPI test generation](https://dev.to/search?q=openapi+tests)
- [AI hallucination examples (and how to spot)](https://simonwillison.net/tags/hallucinations/)

### 🎓 Advanced topics

- [Test generation from requirements (academic)](https://scholar.google.com/scholar?q=test+generation+from+requirements)
- [Model-based testing](https://www.guru99.com/model-based-testing.html)
- [Property-based testing](https://github.com/dubzzz/fast-check)

### 📖 Books

- _The Art of Testing_ — James Whittaker (heuristics)
- _Exploratory Software Testing_ — James Whittaker

### 🐙 Related GitHub repos

- [microsoft/playwright — codegen source](https://github.com/microsoft/playwright/tree/main/packages/recorder)
- [testgen tools collection](https://github.com/topics/test-generation)

### 🛠️ Tools

- `npx playwright codegen <url>` — built-in
- [Postman Flows — API test generation](https://www.postman.com/flows/)
- [Restful-Booker Platform](https://automationintesting.online/) — practice API testing

### 📊 Cheat sheets

- [Playwright codegen options](https://playwright.dev/docs/codegen#options)
- [Common AI testing pitfalls](https://simonwillison.net/)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (codegen workflow)

**B1.** Record 1 complete flow với codegen:

```bash
npx playwright codegen https://www.saucedemo.com
```

Login → browse → add cart → checkout. Copy output.

**B2.** Refactor codegen output vào POM:

- Extract locators vào LoginPage, InventoryPage, CartPage
- Remove duplicate actions
- Add missing assertions

**B3.** Paste codegen code cho Claude/Cursor, ask:

```
Refactor this to use POM pattern at src/pages/.
Remove any redundant actions.
Add missing assertions (URL, visible elements).
```

Review diff.

### 🟡 Trung bình (AI-first workflow)

**M1.** AI từ Gherkin spec:

```
Feature: User can recover password

  Scenario: Send reset email
    Given user at /forgot-password
    When enters email "test@test.com"
      And clicks "Send reset link"
    Then message "Check your email" appears
      And email service received request

Generate Playwright test. Use POM at src/pages/.
Use fixtures from @fixtures/index.
Intercept email API call to verify request body.
```

**M2.** Negative case brainstorming:
Give AI a happy path test, ask:

```
Generate 10 negative/edge test cases for this flow.
For each: test name, setup steps, expected behavior.
Don't write code — just specifications.
```

Pick top 5, implement.

**M3.** API test generation từ OpenAPI:
Find public OpenAPI spec (e.g., [Swagger Petstore](https://petstore.swagger.io/v2/swagger.json)). Prompt:

```
Given this OpenAPI spec section for /pet endpoint:
[paste]

Generate Playwright API tests covering:
- Happy path each method
- Each documented error case
- Schema validation via Zod
```

**M4.** Data generation:

```
Generate 20 diverse user records for signup testing:
- Normal
- Unicode (Vietnamese, Chinese, Arabic, emoji)
- Edge lengths (1-char, 100-char)
- SQL injection patterns
- XSS patterns
- Valid but uncommon (plus alias, dots in email)

Format: TypeScript array with `expectedResult` field.
```

### 🔴 Nâng cao (detect + validate)

**A1.** Hallucination detection — ask AI generate test using `page.waitForSelector` (deprecated-ish). Check:

- Does AI flag it as deprecated?
- Uses modern web-first assertion?
- If not, your prompt needs improvement.

**A2.** Generate test, then self-benchmark:

- Timer on
- Write 1 test manually — note time
- Generate similar with AI (prompt + review + polish) — note time
- Savings?

Be honest. Sometimes AI slows you down.

**A3.** Batch generation — 10 negative cases at once:

```
Here's my existing test (happy path): [paste]

Generate 10 distinct negative/edge cases covering:
- Auth boundaries (locked, expired, deleted user)
- Input validation (empty, invalid, too long, special chars)
- State issues (concurrent, cached, stale)

For each: code complete, self-contained.
```

Review, implement 3.

**A4.** Self-review loop — AI reviews its own output:

```
Step 1: Generate test for X.
Step 2: Review the test you just wrote. Flag any issues.
Step 3: Rewrite with improvements.
```

Compare step 1 vs step 3 quality.

### 🏆 Mini challenge (60 phút)

**Task:** AI-augmented test suite — race human vs AI:

- 30 min: Generate test suite bằng AI (prompts + review + polish)
- 30 min: Review + verify all tests run + fix issues
- End: 10+ tests CI green

Track metrics:

- Prompts used
- Output kept as-is %
- Time savings estimate vs manual
- Quality impression (1-5)

Write blog post draft "My AI test generation workflow".

### 🌟 Stretch goal

Build a simple script `scripts/gen-test.ts` that:

- Takes Gherkin file as input
- Prompts AI via Claude API
- Writes test file with proper structure

(This is basic agentic engineering, Day 24 topic preview.)

---

## Next

[Day 24 — Agentic Engineering cho Tester →](./day-24-agentic-engineering.md)
