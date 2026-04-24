# Day 4 — Assertions & Auto-waiting

> **Goal:** Hiểu web-first assertions, tại sao Playwright tự động wait, và tuyệt đối KHÔNG dùng `waitForTimeout`.
> **Thời gian:** 2-3 giờ

---

## Prerequisites

- Day 1-3 hoàn thành
- Đã viết được test với locators

---

## 1. Vấn đề mà auto-waiting giải quyết

**Code sai truyền thống (Selenium style):**

```typescript
driver.findElement(By.id('submit')).click();
// ⚠️ Nếu nút chưa render → NoSuchElementException
// Fix bẩn: sleep(3000) — chậm + flaky
```

**Playwright approach:**

```typescript
await page.getByRole('button', { name: 'Submit' }).click();
// Playwright tự động đợi:
// 1. Element attached to DOM
// 2. Visible
// 3. Stable (không animation)
// 4. Receives events (không bị overlay che)
// 5. Enabled
// Timeout mặc định 30s → nếu không ready → throw
```

**→ Không bao giờ cần `sleep()` thủ công.**

---

## 2. Actionability — 5 điều Playwright check trước mỗi action

| Check               | Ý nghĩa                                                       |
| ------------------- | ------------------------------------------------------------- |
| **Attached**        | Element tồn tại trong DOM                                     |
| **Visible**         | Không `display:none`, không `visibility:hidden`, không size 0 |
| **Stable**          | Đã hoàn tất animation/transition                              |
| **Receives Events** | Không bị element khác (overlay, modal) che                    |
| **Enabled**         | Không `disabled`, không `aria-disabled`                       |

Với `click()`, `fill()`, `check()`, Playwright đợi cả 5. Với `textContent()` chỉ đợi Attached.

Chi tiết: [Playwright Actionability](https://playwright.dev/docs/actionability)

---

## 3. Web-first assertions — cực kỳ quan trọng

**SAI (non-web-first):**

```typescript
const isVisible = await page.getByText('Welcome').isVisible();
expect(isVisible).toBe(true);
// ❌ Chỉ check 1 lần, nếu chưa load → fail
```

**ĐÚNG (web-first):**

```typescript
await expect(page.getByText('Welcome')).toBeVisible();
// ✅ Playwright auto-retry mỗi 50ms đến khi true hoặc timeout
```

**Quy tắc:**

- `expect(locator).*` — auto-retry (web-first)
- `expect(value).*` — 1 lần, không retry

---

## 4. Assertions quan trọng phải thuộc

### Về visibility

```typescript
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toBeAttached(); // trong DOM (có thể hidden)
```

### Về nội dung

```typescript
await expect(locator).toHaveText('Exact text');
await expect(locator).toHaveText(/partial/i); // regex
await expect(locator).toContainText('part');
await expect(locator).toHaveText(['Item 1', 'Item 2']); // multiple
```

### Về attribute/value

```typescript
await expect(locator).toHaveAttribute('href', '/docs');
await expect(locator).toHaveValue('alice@test.com'); // input value
await expect(locator).toHaveClass(/active/);
await expect(locator).toHaveCSS('color', 'rgb(255, 0, 0)');
```

### Về state

```typescript
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
await expect(locator).toBeChecked();
await expect(locator).toBeFocused();
await expect(locator).toBeEditable();
```

### Về count

```typescript
await expect(locator).toHaveCount(5);
await expect(locator).not.toHaveCount(0);
```

### Về page

```typescript
await expect(page).toHaveURL(/.*dashboard/);
await expect(page).toHaveURL('https://app.com/home');
await expect(page).toHaveTitle(/Dashboard/);
```

### Negation

```typescript
await expect(locator).not.toBeVisible();
await expect(locator).not.toHaveText('Error');
```

### Soft assertions (không fail ngay, tiếp tục chạy)

```typescript
await expect.soft(locator).toHaveText('...');
await expect.soft(page).toHaveTitle('...');
// Test vẫn mark failed nếu có soft fail, nhưng chạy hết
```

---

## 5. Anti-pattern: `waitForTimeout`

```typescript
// ❌ Làm ơn đừng
await page.waitForTimeout(3000); // "sleep 3 giây"

// Vì sao bad:
// - Chậm (đợi cả khi element đã ready)
// - Flaky (đôi khi 3s không đủ)
// - Gây nghi ngờ trong code review — senior sẽ comment
```

**Khi nào OK dùng:** Debug local, reproduce bug. Không bao giờ commit vào repo.

---

## 6. Khi thật sự cần wait explicit

### 6.1. Wait cho network request

```typescript
await page.waitForResponse(
  (response) => response.url().includes('/api/users') && response.status() === 200
);
```

### 6.2. Wait cho URL change

```typescript
await page.waitForURL(/.*\/dashboard/);
```

### 6.3. Wait cho load state

```typescript
await page.goto('https://app.com');
await page.waitForLoadState('networkidle'); // không còn request 500ms
```

### 6.4. Wait cho function trả true

```typescript
await page.waitForFunction(() => document.title.includes('Ready'));
```

### 6.5. Wait cho selector (rất hiếm khi cần — assertion đã cover)

```typescript
await page.waitForSelector('.loading-spinner', { state: 'hidden' });
```

**Rule thumb:** 90% trường hợp, `expect(locator).toBeVisible()` là đủ. Chỉ dùng `waitFor*` khi cần đồng bộ với event không có UI (network, console log, etc.)

---

## 7. Custom timeout

### Global (playwright.config.ts)

```typescript
use: {
  actionTimeout: 10_000,      // cho click, fill, etc.
  navigationTimeout: 30_000,  // cho goto
},
expect: {
  timeout: 10_000,            // cho expect(locator).*
}
```

### Per assertion

```typescript
await expect(locator).toBeVisible({ timeout: 60_000 });
```

### Per test

```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60_000);
  // ...
});
```

**Rule:** Đừng tăng timeout để "fix" flaky test. Timeout là plaster, không phải cure — phải tìm root cause.

---

## 8. Bài tập

### Bài 1: Convert non-web-first → web-first

Cho đoạn code xấu:

```typescript
test('bad test', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/dynamic_loading/1');
  await page.click('#start button');
  await page.waitForTimeout(5000);
  const text = await page.locator('#finish h4').textContent();
  expect(text).toBe('Hello World!');
});
```

→ Viết lại đúng cách, không có `waitForTimeout`, dùng web-first assertion.

### Bài 2: 5 assertion styles

Trên saucedemo.com (sau khi login), viết 5 assertions khác nhau:

1. `toBeVisible` — cart icon
2. `toHaveCount` — products list có 6 items
3. `toHaveText` — header text = "Products"
4. `toHaveURL` — URL khớp regex
5. `toBeEnabled` — nút "Add to cart" enable

### Bài 3: Soft assertions

Viết 1 test với `expect.soft()`:

- Check 3 thứ về 1 trang cùng lúc
- Cố tình để 1 soft fail → test fail nhưng vẫn chạy hết

### Bài 4: Dynamic content

Trên https://the-internet.herokuapp.com/dynamic_controls:

1. Click "Remove" button
2. Assert checkbox biến mất (`toBeHidden`)
3. Click "Add"
4. Assert checkbox hiện lại + enabled

Test phải chạy stable dù element xuất hiện/biến mất với delay.

---

## 9. Common Pitfalls

| Vấn đề                                        | Root cause                           | Fix                                                                                          |
| --------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| Test pass local, fail CI                      | Timing khác (CI slower)              | Dùng web-first assertion thay vì custom wait                                                 |
| `isVisible() returns false` but element there | 1-shot check, không retry            | Dùng `expect(locator).toBeVisible()`                                                         |
| Test vẫn flaky sau dùng web-first             | Race condition thật (data chưa load) | `waitForResponse`, không phải sleep                                                          |
| Flaky với animation                           | Element "jumping"                    | Playwright tự đợi stable, nếu vẫn vỡ → CSS `prefers-reduced-motion` hoặc `page.emulateMedia` |
| Assertion timeout 30s vẫn fail                | Locator thực sự sai                  | Dùng UI mode để debug, đừng tăng timeout                                                     |
| Dùng `page.$` / `page.$$`                     | Deprecated API                       | Dùng `page.locator(...)` mọi lúc                                                             |

---

## 10. Quick reference

```typescript
// Visibility
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();

// Text
await expect(locator).toHaveText('Exact');
await expect(locator).toContainText('partial');

// State
await expect(locator).toBeEnabled();
await expect(locator).toBeChecked();

// Count
await expect(locator).toHaveCount(5);

// Page
await expect(page).toHaveURL(/regex/);
await expect(page).toHaveTitle('...');

// Attribute/Value
await expect(locator).toHaveAttribute('href', '/home');
await expect(locator).toHaveValue('text');

// Soft (không fail ngay)
await expect.soft(locator).toHaveText('...');

// Negation
await expect(locator).not.toBeVisible();

// Wait (chỉ khi thật cần)
await page.waitForResponse((r) => r.url().includes('/api'));
await page.waitForURL(/dashboard/);
await page.waitForLoadState('networkidle');
```

---

## 11. Checklist

- [ ] Hiểu difference web-first vs non-web-first assertion
- [ ] Giải thích được 5 checks trong Actionability
- [ ] Bài 1: convert code xấu thành đẹp — KHÔNG có `waitForTimeout`
- [ ] Bài 4: test chạy 10 lần liên tiếp đều pass (test flakiness)
- [ ] Đã dùng ít nhất 8 loại assertion khác nhau
- [ ] Commit: `test: convert to web-first assertions`
- [ ] NOTES.md: ghi lý do "KHÔNG BAO GIỜ waitForTimeout"

---

## Resources

- [Playwright — Auto-waiting (Actionability)](https://playwright.dev/docs/actionability)
- [Playwright — Assertions](https://playwright.dev/docs/test-assertions)
- [Playwright — Best Practices: Avoid timeouts](https://playwright.dev/docs/best-practices#dont-rely-on-networkidle-to-assert-elements)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Web-First Assertions Explained (Playwright YouTube)](https://www.youtube.com/@Playwrightdev) — search "web first"
- [Flaky Tests & Auto-waiting (Debbie O'Brien)](https://www.youtube.com/watch?v=lfOK4RkZFFE)
- [Why Playwright doesn't need explicit waits](https://www.youtube.com/results?search_query=playwright+auto+waiting)

### 📝 Articles & blogs

- [The End of `sleep()` in Tests](https://martinfowler.com/articles/nonDeterminism.html) — Martin Fowler on flakiness
- [Playwright — Understanding timeouts](https://playwright.dev/docs/test-timeouts)
- [Anti-patterns in E2E testing](https://dev.to/search?q=e2e%20anti-patterns)
- [Eradicating Non-Determinism in Tests](https://martinfowler.com/articles/nonDeterminism.html) — classic article

### 🎓 Deep learning

- [Playwright API — expect](https://playwright.dev/docs/api/class-locatorassertions) — all assertion methods
- [expect() in Playwright vs Jest vs Jasmine](https://www.google.com/search?q=playwright+expect+vs+jest+vs+jasmine) — comparison
- [Auto-retry mechanisms in testing frameworks](https://testautomationu.applitools.com/)

### 📖 Further reading

- [The Art of Unit Testing](https://www.artofunittesting.com/) — Roy Osherove (paid)
- [Working Effectively with Legacy Code](https://www.oreilly.com/library/view/working-effectively-with/0131177052/) — Feathers (concepts apply)

### 🐙 Related GitHub repos

- [microsoft/playwright — expect source](https://github.com/microsoft/playwright/blob/main/packages/playwright/src/matchers) — see how assertions implemented
- [jest-community/jest-extended](https://github.com/jest-community/jest-extended) — more matchers philosophy

### 📊 Cheat sheets / quick refs

- [Playwright Assertions cheatsheet (all matchers)](https://playwright.dev/docs/api/class-locatorassertions)
- [Auto-wait decision tree](https://playwright.dev/docs/actionability)
- [Timeout hierarchy reference](https://playwright.dev/docs/test-timeouts)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (thuần assertion)

**B1.** Viết 10 assertion khác nhau trên saucedemo inventory page (sau login):

1. `toBeVisible` — cart icon
2. `toBeHidden` — error (không có sau login OK)
3. `toHaveCount` — 6 products
4. `toHaveText` — header text
5. `toContainText` — product name
6. `toHaveURL` — regex match
7. `toHaveTitle` — page title
8. `toBeEnabled` — "Add to cart" button
9. `toHaveAttribute` — link href
10. `toHaveClass` — active nav class

**B2.** Negation — 5 tests dùng `.not`:

- `not.toBeVisible`
- `not.toHaveText`
- `not.toHaveCount(0)`
- `not.toBeDisabled`
- `not.toContainText`

**B3.** Convert 5 anti-pattern sau (bịa sẵn) thành đúng:

```typescript
// Anti
const count = await page.locator('.item').count();
expect(count).toBe(5);

// Đúng
await expect(page.locator('.item')).toHaveCount(5);
```

Làm tương tự với `isVisible`, `textContent`, `getAttribute`, `inputValue`.

### 🟡 Trung bình (timing + retry)

**M1.** Dynamic content — on https://the-internet.herokuapp.com/dynamic_loading/1:

```typescript
test('loads eventually', async ({ page }) => {
  await page.goto('...');
  await page.getByRole('button', { name: 'Start' }).click();

  // Web-first — auto retries up to 30s
  await expect(page.getByText('Hello World!')).toBeVisible();
});
```

Chạy, confirm no `waitForTimeout`. Verify stable qua 10 chạy.

**M2.** Custom timeout per assertion:

```typescript
// Global timeout 10s không đủ cho slow API
await expect(locator).toBeVisible({ timeout: 60_000 });
```

Use case: element render sau 45s (rare). Create contrived example + test.

**M3.** Soft assertions:
Viết test kiểm tra 5 thứ trong 1 page. Dùng `expect.soft()` cho 3 cái đầu. Cố tình fail 1 cái giữa. Verify:

- Test FAIL
- 5 assertions đều chạy (không stop sớm)
- Report show cái nào fail

**M4.** Custom timeout trong config — thay vì per-call, set global:

```typescript
// playwright.config.ts
expect: {
  timeout: 10_000,   // default
},
use: {
  actionTimeout: 15_000,
  navigationTimeout: 30_000,
}
```

Verify override hoạt động trong test.

### 🔴 Nâng cao (sync với events, network, state)

**A1.** `waitForResponse`:
Trên 1 app có API (reqres.in), test:

```typescript
test('search triggers API call', async ({ page }) => {
  await page.goto('https://reqres.in/');
  const responsePromise = page.waitForResponse(
    (res) => res.url().includes('/api/users') && res.ok()
  );
  await page.getByRole('button', { name: 'Search' }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);
});
```

**A2.** `waitForLoadState`:

```typescript
await page.goto('...');
await page.waitForLoadState('networkidle'); // đợi network idle 500ms
// hoặc "domcontentloaded", "load"
```

Compare 3 states: DOMContentLoaded vs load vs networkidle — log timing khi nào trigger trong 1 heavy page (e.g., cnn.com).

**A3.** `waitForFunction` — custom condition:

```typescript
await page.waitForFunction(() => {
  return document.querySelectorAll('.loaded').length >= 10;
});
```

Use case: đợi state internal mà không có UI marker clear.

**A4.** Race condition detector:
Viết test cố tình có race (API chậm + UI action):

```typescript
await Promise.all([page.waitForResponse(/api\/data/), page.getByRole('button').click()]);
```

Với và không có `Promise.all` — quan sát difference.

### 🏆 Mini challenge (45 phút)

**Task:** "Flaky Killer" — find và fix flaky tests cố ý.

Tạo `tests/flaky-lab.spec.ts` với 5 test cố ý flaky (bad patterns):

```typescript
// Bad 1: waitForTimeout
await page.waitForTimeout(2000);

// Bad 2: non-web-first
const visible = await locator.isVisible();
expect(visible).toBe(true);

// Bad 3: race condition
const count = await page.locator('.item').count();
await page.click('button');
expect(count).toBe(5); // count taken BEFORE click

// Bad 4: hardcoded delay for animation
await page.click('button');
await page.waitForTimeout(500); // magic number
await expect(page.locator('.modal')).toBeVisible();

// Bad 5: relying on order
test('test A (creates data)', async () => {
  /* create user */
});
test('test B (uses data)', async () => {
  /* assert user exists */
});
```

Chạy với `--repeat-each=20` → observe flakiness rate.

**Fix all 5** với web-first assertions + proper sync. Re-run → 20/20 pass.

Document fixes trong `FLAKY_LAB.md`.

### 🌟 Stretch goal

Find 1 flaky test in [microsoft/playwright issues](https://github.com/microsoft/playwright/issues?q=flaky). Read discussion, understand root cause, learn từ maintainers.

---

## Next

[Day 5 — Page Object Model →](./day-05-page-object-model.md)
