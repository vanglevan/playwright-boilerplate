# Day 7 — Review + Mini Project tuần 1

> **Goal:** Consolidate kiến thức tuần 1 qua mini project thực tế. Tự check xem đã "ngấm" chưa.
> **Thời gian:** 4-5 giờ

---

## Prerequisites

- Day 1-6 hoàn thành
- Tất cả lint/typecheck xanh

---

## 1. Retrospective (30 phút)

Trả lời tất cả câu hỏi sau **không nhìn tài liệu**. Nếu trả lời không được → quay lại ngày đó ôn.

### Về JS/TS

1. Difference `const` vs `let`?
2. `async/await` làm gì? Nếu quên `await` trước `page.click()` thì sao?
3. Destructuring `const { page } = ...` là gì?

### Về Playwright cơ bản

4. 6 loại locator priority? Tại sao `getByRole` tốt hơn CSS?
5. Web-first assertion là gì? Tại sao KHÔNG được dùng `waitForTimeout`?
6. 5 checks của Actionability?

### Về POM

7. POM giải quyết vấn đề gì?
8. Page object có nên chứa assertion không?
9. Khi nào dùng component thay vì page?

### Về Tooling

10. `no-floating-promises` bắt lỗi gì?
11. Husky hoạt động thế nào?
12. `npm run check` chạy gì?

**Đánh giá:**

- 10-12 đúng → tốt, skip sang mini project
- 7-9 đúng → ôn lại ngày chưa nắm
- <7 đúng → dành thêm 1 ngày ôn

---

## 2. Mini Project tuần 1

**Brief:** Viết suite test cho 1 demo app. Không có hướng dẫn chi tiết — bạn tự thiết kế.

### Chọn 1 trong 3 app

| App                 | Link                                | Độ khó                        |
| ------------------- | ----------------------------------- | ----------------------------- |
| SauceDemo           | https://www.saucedemo.com/          | ⭐⭐ Dễ, có bug sẵn để test   |
| Automation Exercise | https://automationexercise.com/     | ⭐⭐⭐ Trung bình, đủ feature |
| TodoMVC             | https://demo.playwright.dev/todomvc | ⭐ Rất dễ, tập trung CRUD     |

### Requirements

1. **Cấu trúc:**
   - `src/pages/` với ít nhất 3 page objects
   - `src/components/` với ít nhất 1 component (header/footer/modal)
   - `tests/` nhóm tests theo feature (folder con)

2. **Tests:** Tối thiểu **5 tests**, mỗi test 1 behavior:
   - 1 happy path (login/register)
   - 1 negative case (invalid input, empty form)
   - 1 flow (add to cart → view cart → remove)
   - 1 edge case (quantity = 0, very long text)
   - 1 navigation (breadcrumb/menu)

3. **Chất lượng:**
   - Mọi locator dùng `getByRole`/`getByLabel`/`getByText` (no CSS unless absolutely needed)
   - KHÔNG có `waitForTimeout`
   - 100% dùng POM, test file không chứa locator trực tiếp
   - `npm run check` pass
   - Pre-commit hook chạy

4. **Docs:**
   - `README.md` trong repo: describe project, cách chạy
   - Screenshot hoặc GIF 1 test chạy (quay bằng macOS `Cmd+Shift+5`)

---

## 3. Example — Mini Project SauceDemo

### Structure đề xuất

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
tests/
├── auth/
│   ├── login.spec.ts
│   └── logout.spec.ts
├── shopping/
│   ├── add-to-cart.spec.ts
│   ├── checkout.spec.ts
│   └── cart-management.spec.ts
```

### Test cases gợi ý

**auth/login.spec.ts:**

```typescript
test('user with valid credentials can log in');
test('user with invalid password sees error');
test('user with locked account cannot log in'); // saucedemo có user "locked_out_user"
```

**shopping/add-to-cart.spec.ts:**

```typescript
test('can add single item to cart');
test('can add multiple items, badge shows correct count');
test('can remove item from inventory page, badge decreases');
```

**shopping/checkout.spec.ts:**

```typescript
test('complete checkout flow with valid info');
test('cannot checkout with empty form');
test('cart shows correct total before checkout');
```

### Snippet tham khảo

```typescript
// src/pages/inventory.page.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '@components/header.component';

export class InventoryPage extends BasePage {
  readonly path = '/inventory.html';
  readonly header: HeaderComponent;
  readonly items: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.items = page.locator('[data-test="inventory-item"]');
    this.sortSelect = page.locator('[data-test="product-sort-container"]');
  }

  async getItemByName(name: string): Promise<Locator> {
    return this.items.filter({ hasText: name });
  }

  async addToCart(name: string): Promise<void> {
    const item = await this.getItemByName(name);
    await item.getByRole('button', { name: 'Add to cart' }).click();
  }

  async getItemCount(): Promise<number> {
    return await this.items.count();
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortSelect.selectOption(option);
  }
}
```

---

## 4. Self Code Review

Trước khi claim "done", tự review với checklist:

### Code quality

- [ ] Không có `console.log` thừa
- [ ] Không có `test.only()` hoặc `test.skip()` quên
- [ ] Không có TODO comment vô nghĩa
- [ ] Mọi `async` function đều có `await` khi cần
- [ ] Không có `any` type (hoặc có `// eslint-disable-next-line` với lý do)

### Test quality

- [ ] Mỗi test có mô tả rõ ràng (`"user can add item to cart"`, không phải `"test 1"`)
- [ ] Test independent — chạy `npx playwright test --workers=4` không fail
- [ ] Test có thể chạy lần 2 ngay không cần cleanup (idempotent)
- [ ] Không duplicate setup — dùng `beforeEach` hoặc fixture

### Git hygiene

- [ ] Ít nhất 7 commit (1/ngày)
- [ ] Commit message theo Conventional Commits
- [ ] Không commit `node_modules/`, `.env`, `test-results/`

---

## 5. README portfolio-quality

Tạo `README.md` cho repo `playwright-learning-journey`:

````markdown
# Playwright Learning Journey — Week 1

End-to-end tests for SauceDemo using Playwright + TypeScript.

## Tech Stack

- Playwright 1.59+
- TypeScript 5 (strict mode)
- ESLint 9 + Prettier + Husky

## Structure

- `src/pages/` — Page Object Model
- `src/components/` — Shared UI components
- `tests/` — Test specs grouped by feature

## Quick Start

```bash
npm install
npx playwright install
npm test
npm run report
```
````

## Scripts

| Script            | Purpose                         |
| ----------------- | ------------------------------- |
| `npm test`        | Run all tests headless          |
| `npm run test:ui` | Open Playwright UI mode         |
| `npm run check`   | Lint + typecheck + format check |

## What I Learned This Week

- Playwright locators priority (getByRole first)
- Web-first assertions replace manual waits
- Page Object Model keeps tests maintainable
- ESLint + Husky catch bugs before commit

## Next

Week 2: Fixtures, API testing, data factories, parallel execution.

````

---

## 6. Push demo lên GitHub

```bash
git add .
git commit -m "test: week 1 mini project — saucedemo e2e suite"
git push
````

Kiểm tra trên github.com:

- Repo public
- README hiện đẹp
- Ít nhất 7 commits
- Green commit history

---

## 7. Ghi chép cuối tuần 1

Trong `NOTES.md`, viết retro:

```markdown
## Week 1 Retrospective — 2026-04-29

### What went well

- ...

### What was hard

- ...

### Biggest "aha" moment

- ...

### Top 3 learnings

1. ...
2. ...
3. ...

### Questions for Week 2

- ...
```

---

## 8. Bonus: Play with AI

Dùng Claude Code / Cursor:

- Ask: _"Review `src/pages/inventory.page.ts` — any issues with naming, structure, or locator choices? Be specific, reference line numbers."_
- Ask: _"Propose 3 more tests that would improve coverage of cart flow. Just describe them, don't write code yet."_

Note response in NOTES.md. Apply 1 suggestion.

---

## 9. Checklist tuần 1 hoàn thành

- [ ] 7 ngày đều commit ≥1 lần
- [ ] 5+ tests pass, 1+ POM, 1+ component
- [ ] `npm run check` xanh
- [ ] README professional
- [ ] Screenshot/GIF trong README
- [ ] Mini project push lên GitHub public
- [ ] NOTES.md week 1 retro ≥10 điểm
- [ ] Retrospective self-questions ≥10/12 đúng
- [ ] Tự confident giải thích POM cho bạn bè

---

## 10. Red flags cần xử lý trước Week 2

Nếu 1 trong các điều sau còn đúng → DỪNG, quay lại ôn:

- ❌ Còn dùng `waitForTimeout`
- ❌ Test pass local nhưng fail khi chạy `--workers=4`
- ❌ Locator CSS dài hơn 3 cấp
- ❌ Test file dài hơn 100 dòng
- ❌ Chưa dùng pre-commit hook
- ❌ Không biết difference fixture vs beforeEach (sẽ học Day 8, nhưng nên đã đọc qua)

---

## 11. Ready for Week 2?

Week 2 sẽ học: fixtures, faker, env config, auth state, API testing, parallel, debug.

**→** [Week 2 Overview](../week-2-core/README.md)
**→** [Day 8 — Fixtures](../week-2-core/day-08-fixtures.md)

---

## 📚 Tài liệu mở rộng — Week 1 consolidation

### 🎥 Videos để review

- [Playwright in 100 seconds (Fireship)](https://www.youtube.com/results?search_query=playwright+100+seconds) — context refresher
- [Full Playwright tutorial (freeCodeCamp)](https://www.youtube.com/watch?v=wawbt1cATsk) — 2h comprehensive review
- [Common Playwright mistakes & fixes](https://www.youtube.com/@Playwrightdev) — search "common mistakes"

### 📝 Articles để đọc cuối tuần 1

- [Playwright Best Practices — All together](https://playwright.dev/docs/best-practices)
- [Anti-patterns to avoid](https://dev.to/search?q=playwright+anti-patterns)
- [Test Automation ROI](https://www.browserstack.com/guide/roi-for-test-automation)
- [From manual to automation career](https://medium.com/search?q=manual+to+automation+tester)

### 🐙 GitHub repos để inspiration

- [Playwright official examples](https://github.com/microsoft/playwright/tree/main/examples)
- [awesome-playwright](https://github.com/mxschmitt/awesome-playwright)
- Search "playwright e-commerce tests" trên GitHub — see real patterns

### 📊 Cheat sheet tuần 1

Lưu 1 file `CHEATSHEET-WEEK1.md` trong repo:

- Locator priority (6 levels)
- Web-first assertions list
- POM structure template
- `npm run` scripts list
- Common Playwright CLI flags

---

## 🎯 Mini project tuần 1 — Challenge mở rộng

### 🟢 Option A — Easy: TodoMVC full coverage

https://demo.playwright.dev/todomvc

**Requirements (≥ 8 tests):**

1. Add 1 todo
2. Add multiple todos, verify count
3. Toggle todo completed
4. Delete todo
5. Filter: All / Active / Completed
6. Clear completed
7. Edit todo (double-click)
8. Persist data (reload page, todos still there)

**Quality:**

- Full POM (`TodoMvcPage`)
- Fixtures
- No waitForTimeout
- All role-based locators
- Tags: `@smoke`, `@regression`

### 🟡 Option B — Medium: SauceDemo e-commerce

https://www.saucedemo.com (user: `standard_user`, pass: `secret_sauce`)

**Requirements (≥ 12 tests):**

_Auth:_

- Valid login → inventory
- Invalid credentials → error
- Locked user → specific error
- Problem user → UI issues (observable)

_Shopping:_

- Sort products (4 options)
- Add to cart
- Remove from cart (from inventory + cart page)
- Cart badge updates

_Checkout:_

- Valid checkout flow (end to end)
- Empty form validation
- Cart total matches items

**Structure:**

- `LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage`
- `HeaderComponent` reuse
- Tags + grouping

### 🔴 Option C — Hard: AutomationExercise full site

https://automationexercise.com/

**Requirements (≥ 20 tests):**

_Full E2E coverage:_

- Register + login + logout
- Product search + filter
- Category navigation
- Add to cart + quantity changes
- Checkout flow
- Contact form submission
- Newsletter subscription
- API tests (site has public API)

**Extras:**

- Negative cases (register với email tồn tại, invalid data)
- Edge cases (special chars, very long input)
- At least 1 data-driven test (3+ rows)

### 🏆 Super challenge (nếu còn energy)

**Combine A + B + C:** Build test suite cho 1 app thật bạn dùng (Shopee, Tiki, một app company bạn). Ethics check: test public pages only, không automate actions có impact (booking, payment), respect robots.txt.

---

## 🔍 Week 1 self-audit

Trả lời không nhìn tài liệu — mỗi câu 1 câu trả lời ngắn:

### TypeScript

1. `strict: true` bật những options nào cụ thể?
2. `readonly` khác `const` chỗ nào?
3. `Promise<T>` generic có ý nghĩa gì?

### Playwright

4. Locator priority — list 6 levels
5. 5 checks của Actionability
6. Tại sao `waitForTimeout` bad, alternative là gì?
7. Web-first assertion có behavior khác thông thường thế nào?

### POM

8. POM drawback chính?
9. Component vs Page — khi nào tách?
10. `BasePage` abstract có lợi gì?

### Tooling

11. `no-floating-promises` bắt gì?
12. Husky vs CI hook — khác thế nào?
13. Conventional Commits type nào thường dùng nhất?

**Score:**

- 12-13 đúng: Excellent, sẵn sàng Week 2
- 9-11: Review câu sai, vẫn OK
- <9: Dành 1 ngày ôn tuần 1 trước khi qua Week 2

---

## 📊 Productivity tracking — Week 1

Ghi vào NOTES.md:

```markdown
## Week 1 Metrics

### Time

- Total hours: \_\_\_
- Most productive day: \_\_\_
- Hardest day: \_\_\_

### Output

- Commits: \_\_\_
- Tests written: \_\_\_
- Lines of code: \_\_\_
- Pages read: \_\_\_

### AI usage

- Prompts used: \_\_\_
- Useful rate: \_\_\_%

### Energy (1-10)

- Start of week: \_\_\_
- End of week: \_\_\_

### Biggest win

-

### Biggest blocker

-
```

---

## 🌟 Extended reading (weekend optional)

- [The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Why I don't use Page Object Model (controversial take)](https://www.cypress.io/blog/2019/01/03/stop-using-page-objects-and-start-using-app-actions)
- [Accelerate: The Science of Lean Software](https://itrevolution.com/product/accelerate/) — DevOps metrics
- [Conway's Law](https://en.wikipedia.org/wiki/Conway%27s_law) — why team structure affects test architecture
