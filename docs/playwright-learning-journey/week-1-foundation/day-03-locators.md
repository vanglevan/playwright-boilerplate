# Day 3 — Locators & Selectors

> **Goal:** Master cách tìm element — nền tảng của mọi test. Biết priority 6 loại locator và khi nào dùng cái nào.
> **Thời gian:** 3 giờ

---

## Prerequisites

- Day 1-2 hoàn thành
- Có ít nhất 1 test chạy xanh

---

## 1. Tại sao locators là phần quan trọng nhất

> "A test is only as good as its locators."

- **Locator sai → flaky test** — test fail không phải do bug, mà do click nhầm/không tìm thấy element
- **Locator thay đổi theo UI** — dev sửa class name, test break hàng loạt
- **Good locator = stable + readable** — 6 tháng sau đọc lại vẫn hiểu

Senior dev/tester phân biệt được bởi cách chọn locator.

---

## 2. Priority — thứ tự ưu tiên

Playwright khuyến nghị theo **khả năng resilient** (chống vỡ khi UI đổi):

```
1. getByRole        ← best, mô phỏng user + screen reader
2. getByLabel       ← form fields
3. getByPlaceholder ← khi không có label
4. getByText        ← visible text (buttons, links)
5. getByTestId      ← khi dev thêm data-testid
6. CSS selectors    ← fallback
7. XPath            ← last resort
```

**Rule:** Luôn thử từ trên xuống. Chỉ dùng cái sau khi cái trước không được.

---

## 3. `getByRole` — cái vua

Dùng ARIA roles — chuẩn accessibility mà browser đã build sẵn.

```typescript
// Buttons
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('button', { name: /submit/i }).click(); // regex, case-insensitive

// Links
await page.getByRole('link', { name: 'Documentation' }).click();

// Inputs
await page.getByRole('textbox', { name: 'Email' }).fill('test@test.com');
await page.getByRole('checkbox', { name: 'Remember me' }).check();
await page.getByRole('combobox', { name: 'Country' }).selectOption('VN');

// Headings
await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dashboard');

// List
await page.getByRole('listitem').nth(0).click();

// Dialogs
await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
```

**Common roles:** `button`, `link`, `textbox`, `checkbox`, `combobox`, `heading`, `listitem`, `dialog`, `tab`, `menuitem`, `alert`, `status`

Xem đầy đủ: [MDN — ARIA Roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)

---

## 4. `getByLabel` / `getByPlaceholder`

```typescript
// HTML: <label>Email<input type="email" /></label>
await page.getByLabel('Email').fill('alice@test.com');

// HTML: <input placeholder="Search..." />
await page.getByPlaceholder('Search...').fill('playwright');
```

**Priority:** Label > Placeholder (label là permanent, placeholder biến mất khi user gõ).

---

## 5. `getByText`

```typescript
// Exact match
await page.getByText('Hello World').click();

// Partial match
await page.getByText('Hello', { exact: false }).click();

// Regex (case-insensitive với flag i)
await page.getByText(/hello/i).click();
```

**Khi nào dùng:** Nội dung cố định, không có role phù hợp (vd `<div>` chứa text).

---

## 6. `getByTestId` — khi dev hợp tác

```html
<button data-testid="submit-btn">Submit</button>
```

```typescript
await page.getByTestId('submit-btn').click();
```

**Ưu điểm:** Cực stable — không đổi khi translate, refactor class, đổi text.
**Nhược điểm:** Phụ thuộc dev phải thêm attribute. Production code "bẩn" thêm.

**Config testIdAttribute** (nếu team dùng attribute khác như `data-qa`):

```typescript
// playwright.config.ts
use: {
  testIdAttribute: "data-qa",
}
```

---

## 7. CSS Selectors — fallback

```typescript
await page.locator('.btn-primary').click();
await page.locator('#login-form input[type=email]').fill('a@b.com');
await page.locator('button.btn.btn-submit').click();
```

**Tránh:**

- `nth-child(2)` — fragile, UI đổi order là vỡ
- CSS quá dài: `.container > div > .row > .col-4 > button` — đổi 1 wrapper là vỡ
- Phụ thuộc class styling: `.text-red-500` — class có thể đổi

---

## 8. XPath — last resort

```typescript
await page.locator("//button[contains(text(), 'Submit')]").click();
```

**Khi nào dùng XPath:** Khi không có cách nào khác (rất hiếm trong Playwright vì đã có `getByText`, `getByRole`...).

---

## 9. Filters & Chaining

### Filter

```typescript
// Lọc row trong table có text cụ thể
const row = page.getByRole('row').filter({ hasText: 'Alice' });
await row.getByRole('button', { name: 'Delete' }).click();

// Filter bằng locator khác
const activeItem = page.locator('li').filter({
  has: page.getByRole('button', { name: 'Active' }),
});
```

### Chaining (scope)

```typescript
const modal = page.getByRole('dialog');
await modal.getByRole('textbox').fill('...');
await modal.getByRole('button', { name: 'OK' }).click();
// Tránh click nhầm button ngoài modal
```

### nth / first / last

```typescript
await page.getByRole('listitem').first().click();
await page.getByRole('listitem').nth(2).click(); // index 0-based
await page.getByRole('listitem').last().click();
```

---

## 10. Handle nhiều element match

```typescript
const items = page.getByRole('listitem');

// Count
const count = await items.count();
expect(count).toBe(5);

// Loop
for (let i = 0; i < count; i++) {
  const text = await items.nth(i).textContent();
  console.log(text);
}

// All at once
const texts = await items.allTextContents();
```

---

## 11. Tool vàng: `npx playwright codegen`

```bash
npx playwright codegen https://demo.playwright.dev/todomvc
```

Mở 2 cửa sổ:

- Browser — bạn click bình thường
- Inspector — tự generate code với locator tốt

**Dùng đúng cách:**

1. Click vài action trên browser
2. Copy code generate
3. **Refactor theo priority** — Codegen hay thích CSS, bạn đổi sang `getByRole`

**VS Code extension còn tiện hơn:**

- Panel Testing → "Pick locator" button
- Hover browser → thấy locator suggestion real-time

---

## 12. Bài tập

### Bài 1: 5 locator cùng 1 element

Trên https://demo.playwright.dev/todomvc, input "What needs to be done?" — viết 5 locator khác nhau:

1. `getByPlaceholder`
2. `getByRole`
3. CSS
4. `locator` với filter
5. Dùng codegen suggest

Chạy mỗi cái trong `test()`, so sánh độ dài + readability.

### Bài 2: Saucedemo login

Viết test file `tests/saucedemo.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('login with valid credentials', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  // TODO: fill username "standard_user"
  // TODO: fill password "secret_sauce"
  // TODO: click Login
  // TODO: assert URL contains "/inventory.html"
  // TODO: assert có element với text "Products"
});

test('login with wrong password shows error', async ({ page }) => {
  // TODO: fill wrong credentials
  // TODO: assert error message xuất hiện
});
```

**Requirements:** Dùng `getByRole` / `getByLabel` / `getByPlaceholder` — KHÔNG dùng CSS selector nào.

### Bài 3: Filter trong table

Trên https://the-internet.herokuapp.com/tables — viết test:

- Tìm row có email "iuvrjv@hrrxog.net"
- Click "delete" trong row đó
- Assert row biến mất

Hint: `getByRole("row").filter({ hasText: ... })`

### Bài 4: Scope với modal

Trên https://the-internet.herokuapp.com/entry_ad (có popup ad), viết test close popup bằng cách scope locator vào `role=dialog`.

---

## 13. Common Pitfalls

| Vấn đề                                                  | Triệu chứng                           | Fix                                              |
| ------------------------------------------------------- | ------------------------------------- | ------------------------------------------------ |
| "Strict mode violation: locator resolved to N elements" | Nhiều element match                   | Thêm filter, dùng `first()`, hoặc scope chặt hơn |
| Test pass local, fail CI                                | CSS phụ thuộc hover/focus             | Dùng role/text thay CSS state                    |
| Test break sau dev thay text button                     | Dùng `getByText` với nội dung hay đổi | Chuyển sang `getByRole` + `data-testid`          |
| Locator quá dài khó đọc                                 | CSS chain 5 cấp                       | Scope bằng `locator().locator()` ngắn hơn        |
| XPath fragile sau refactor                              | Tree DOM đổi                          | Thay bằng role/text/testId                       |

---

## 14. Quick reference cheatsheet

```typescript
// Ưu tiên
page.getByRole("button", { name: "Submit" })
page.getByLabel("Email")
page.getByPlaceholder("Search...")
page.getByText("Welcome")
page.getByTestId("submit-btn")

// Fallback
page.locator(".btn")
page.locator("//button")

// Modifiers
.first() / .last() / .nth(2)
.filter({ hasText: "..." })
.filter({ has: page.getByRole(...) })

// Scope
parent.getByRole("button")    // search inside parent

// Actions
.click() .dblclick() .fill("...") .type("...")
.check() .uncheck() .selectOption("VN")
.hover() .press("Enter")

// Assertions (Day 4 sẽ sâu)
await expect(locator).toBeVisible()
await expect(locator).toHaveText("...")
await expect(locator).toHaveCount(5)
```

---

## 15. Checklist

- [ ] Gõ thuộc priority 6 loại locator
- [ ] Giải thích tại sao `getByRole` tốt hơn CSS class
- [ ] Bài 2 (saucedemo) pass 2/2 tests, không dùng CSS
- [ ] Bài 3 (table filter) pass
- [ ] Đã dùng `npx playwright codegen` ít nhất 1 lần
- [ ] Đã dùng VS Code extension "Pick locator"
- [ ] Commit: `test: saucedemo login with role-based locators`
- [ ] NOTES.md: ghi 3 locator pattern hay nhất học hôm nay

---

## Resources

- [Playwright — Locators](https://playwright.dev/docs/locators) — đọc hết
- [Playwright — Best Practices: Locators](https://playwright.dev/docs/best-practices#use-locators)
- [ARIA Roles Reference (MDN)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)
- Video: [Testing Library — Which query should I use?](https://testing-library.com/docs/queries/about/#priority) (Playwright follow triết lý này)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Playwright Locators Deep Dive (official)](https://www.youtube.com/watch?v=A3kTNxAxVCA) — Debbie O'Brien, 20 phút
- [Stop Using CSS Selectors (Playwright team)](https://www.youtube.com/results?search_query=playwright+stop+using+css+selectors)
- [Role-based locators best practice](https://www.youtube.com/@Playwrightdev) — search "role locators"
- [Testing Library Priority (Kent C. Dodds)](https://www.youtube.com/watch?v=aq_V2pM0kRk) — philosophy

### 📝 Articles & blogs

- [Testing Library — Priority Queries](https://testing-library.com/docs/queries/about/#priority) — Playwright theo triết lý này
- [Kent C. Dodds — Making your UI tests resilient to change](https://kentcdodds.com/blog/making-your-ui-tests-resilient-to-change)
- [Better locator strategies (checkly)](https://www.checklyhq.com/learn/)
- [data-testid: the good, the bad](https://kula.blog/posts/test_id_attributes/)

### 🎓 Interactive learning

- [Playwright Locator Playground](https://playwright.dev/docs/locators) — docs có live widgets
- [Role queries tester (MDN)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)

### 📖 Deeper reading

- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) — official W3C, deep
- [HTML semantics reference](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_HTML_to_solve_common_problems)
- [WAI-ARIA 1.2 spec](https://www.w3.org/TR/wai-aria-1.2/) — authoritative roles list

### 🐙 Related GitHub repos

- [testing-library/dom-testing-library](https://github.com/testing-library/dom-testing-library) — same philosophy source
- [microsoft/playwright examples — locators](https://github.com/microsoft/playwright/tree/main/tests) — real locator usage
- [Chrome A11y tree](https://github.com/GoogleChrome/puppeteer) — see inspect tree

### 📊 Cheat sheets / quick refs

- [Playwright Locator methods cheatsheet](https://playwright.dev/docs/api/class-locator) — all methods
- [ARIA Roles quick reference](https://www.w3.org/TR/html-aria/) — HTML → ARIA mapping
- [Landmark Roles explained](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)

### 🛠️ Tools

- `npx playwright codegen` — record & suggest locators (built-in)
- VS Code Playwright ext → "Pick locator" button
- [Axe DevTools](https://www.deque.com/axe/devtools/) — inspect a11y tree (includes roles)
- [Chrome DevTools — Accessibility tab](https://developer.chrome.com/docs/devtools/accessibility/) — see role + name per element

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (master 6 locator types)

**B1.** Trên https://demo.playwright.dev/todomvc, viết 1 test locate input "What needs to be done?" theo 6 cách:

1. `getByPlaceholder`
2. `getByRole` (textbox, name via placeholder)
3. CSS: `.new-todo`
4. `input[placeholder*="needs"]`
5. `locator('input').first()`
6. XPath `//input[@class="new-todo"]`

Comment pros/cons mỗi cách.

**B2.** Saucedemo: viết test login KHÔNG dùng CSS selector nào. Chỉ role/label/placeholder/text.

**B3.** TodoMVC — add 3 todos. Assert `getByRole("listitem").toHaveCount(3)`. Try thay bằng `.locator(".todo-list li")` — verify both work, but getByRole resilient hơn.

**B4.** Codegen trial:

```bash
npx playwright codegen https://www.automationexercise.com/
```

Click vài thao tác, copy generated code, dán vào file spec. Chạy. Thấy codegen locator như nào (thường là getByRole tốt).

### 🟡 Trung bình (filter, chain, scope)

**M1.** Filter table row:
Trên https://the-internet.herokuapp.com/tables, viết test:

- Tìm row có email "iuvrjv@hrrxog.net"
- Assert row có first name chứa "John"
- Click "delete" trong row đó
- Assert row biến mất

Hint: `getByRole("row").filter({ hasText: "iuvrjv@hrrxog.net" })`

**M2.** Scoped locator:
Trên https://the-internet.herokuapp.com/hovers, có 3 figure. Test:

- Hover figure thứ 2
- Click link "View profile" TRONG figure đó (không phải figure khác)

Hint:

```typescript
const figure = page.locator('figure').nth(1);
await figure.hover();
await figure.getByRole('link').click();
```

**M3.** `has` filter:
Trên 1 product listing (saucedemo inventory), locate card:

- CÓ text "Backpack"
- CÓ button "Add to cart" (chưa add)

```typescript
page
  .locator('[data-test="inventory-item"]')
  .filter({ hasText: 'Backpack' })
  .filter({ has: page.getByRole('button', { name: 'Add to cart' }) });
```

**M4.** Loop & assert all items:

```typescript
const items = page.getByRole('listitem');
const count = await items.count();
for (let i = 0; i < count; i++) {
  const text = await items.nth(i).textContent();
  expect(text).toMatch(/some pattern/);
}
```

Apply vào 1 app thật (news site, blog, etc.)

### 🔴 Nâng cao (stability + resilience)

**A1.** Locator stability audit:
Pick 1 test bạn đã viết. Với mỗi locator, rate 1-5:

- 5 = `getByRole` với accessible name
- 4 = `getByLabel` / `getByText` exact
- 3 = `getByTestId` (OK nếu có)
- 2 = `getByText` với regex loose
- 1 = CSS class / `.nth(N)` / XPath

Refactor tất cả rating ≤2. Goal: suite avg ≥4.

**A2.** iframe — khi gặp page có iframe (e.g., CodePen embeds, YouTube videos), test gì bên trong:

```typescript
const frame = page.frameLocator('iframe[name="content"]');
await frame.getByRole('button').click();
```

Tìm 1 page có iframe public để practice.

**A3.** Shadow DOM — một số component lib (vd Lit, Stencil) dùng shadow DOM. Playwright tự pierce through:

```typescript
// Works automatically:
await page.getByRole('button').click();
```

Research 1 ví dụ (e.g., https://shoelace.style/) — thử click button bên trong web component.

**A4.** Generated test IDs — khi dev tạo dynamic IDs (`#user-123`, `#user-456`):

```typescript
// Bad: hard-coded ID
page.locator('#user-123');

// Good: filter
page.getByRole('listitem').filter({ hasText: 'alice@test.com' });
```

Refactor 3 test của bạn nếu có pattern này.

### 🏆 Mini challenge (45 phút)

**Task:** Write a "Locator Quality Audit" script — tool tự động phân tích locator quality.

Trong `scripts/audit-locators.ts`:

- Grep all `.spec.ts` files
- Parse dòng chứa `page.locator`, `page.getBy*`
- Classify theo priority (1-6)
- Report:
  ```
  Total locators: 47
  getByRole:    18 (38%)  ✅
  getByLabel:    8 (17%)
  getByText:     6 (13%)
  getByTestId:   5 (11%)
  CSS:           8 (17%)  ⚠️
  XPath:         2 (4%)   ❌
  Avg score: 4.1 / 5
  Suggestions: 10 locators to refactor...
  ```

Hint: dùng Node `fs` + regex. Đừng over-engineer (AST parser không cần cho bài này).

Output file: `locator-audit.md` với recommendation.

### 🌟 Stretch goal

Contribute to [testing-library docs](https://github.com/testing-library/testing-library-docs) — fix typo hoặc add example. OSS PR đầu tiên của bạn.

---

## Next

[Day 4 — Assertions & Auto-waiting →](./day-04-assertions-auto-waiting.md)
