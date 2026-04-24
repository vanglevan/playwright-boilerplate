# Day 5 — Page Object Model (POM)

> **Goal:** Biết cách tách test code ra POM, tại sao pattern này quan trọng, và viết POM đúng (không lạm dụng).
> **Thời gian:** 3 giờ

---

## Prerequisites

- Day 1-4 hoàn thành
- Có ít nhất 3-4 test spec trong project

---

## 1. Vấn đề: tests phình to

Sau Week 1, code bạn sẽ giống thế này:

```typescript
test('login valid', async ({ page }) => {
  await page.goto('https://saucedemo.com');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
});

test('login invalid', async ({ page }) => {
  await page.goto('https://saucedemo.com');
  await page.getByPlaceholder('Username').fill('wrong');
  await page.getByPlaceholder('Password').fill('wrong');
  await page.getByRole('button', { name: 'Login' }).click();
});
```

**Vấn đề:**

1. Duplicate 5 dòng login
2. Nếu dev đổi placeholder → sửa 10 chỗ
3. Logic "login" lẫn với logic "test"

---

## 2. POM — Page Object Model

**Ý tưởng:** Mỗi trang web = 1 class. Class chứa:

- **Locators** (properties)
- **Actions** (methods như `login()`, `addToCart()`)

**Test file chỉ gọi methods — KHÔNG chứa locator.**

### Refactor

**`src/pages/login.page.ts`:**

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.getByPlaceholder('Username');
    this.password = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async login(user: string, pass: string): Promise<void> {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginButton.click();
  }

  async assertErrorVisible(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }
}
```

**`tests/saucedemo.spec.ts` — sau refactor:**

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';

test('login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
  await expect(page).toHaveURL(/.*inventory/);
});

test('login with invalid credentials shows error', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('wrong', 'wrong');
  await loginPage.assertErrorVisible();
});
```

**Lợi ích:**

- Test file đọc như prose: "goto login, login with x, assert y"
- Selector đổi chỉ cần sửa 1 chỗ
- Reusable trong 10+ test files

---

## 3. Base Page — tránh duplicate

Hầu hết page đều có `goto()`, `waitUntilLoaded()`. Tạo abstract base:

**`src/pages/base.page.ts`:**

```typescript
import { Page } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitUntilLoaded();
  }

  async waitUntilLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  get url(): string {
    return this.page.url();
  }
}
```

**LoginPage extends BasePage:**

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

### Set baseURL trong config

Để `path: "/"` work:

```typescript
// playwright.config.ts
use: {
  baseURL: "https://www.saucedemo.com",
}
```

---

## 4. Component Object (tiến hoá của POM)

Header, sidebar, modal dùng nhiều trang → tách ra component:

**`src/components/header.component.ts`:**

```typescript
import { Page, Locator } from '@playwright/test';

export class HeaderComponent {
  readonly root: Locator;
  readonly cartIcon: Locator;
  readonly menuButton: Locator;

  constructor(page: Page) {
    this.root = page.locator('[data-test="header"]');
    this.cartIcon = this.root.locator('[data-test="shopping-cart-link"]');
    this.menuButton = this.root.getByRole('button', { name: 'Menu' });
  }

  async openCart(): Promise<void> {
    await this.cartIcon.click();
  }
}
```

**Inventory page dùng Header:**

```typescript
export class InventoryPage extends BasePage {
  readonly header: HeaderComponent;
  // ...

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
  }
}
```

---

## 5. Best Practices của POM

### DO

- ✅ 1 page = 1 file
- ✅ Locators là `readonly` properties
- ✅ Methods có tên business (`login`, `addToCart`) — không phải technical (`clickBtn3`)
- ✅ Method return `Promise<void>` hoặc trả value cần thiết
- ✅ Nếu action dẫn sang page khác → return instance page đó:
  ```typescript
  async login(...): Promise<InventoryPage> {
    await this.loginButton.click();
    return new InventoryPage(this.page);
  }
  ```

### DON'T

- ❌ Put assertions trong page object (trừ khi assertion về state của page — vd `assertErrorVisible()`)
- ❌ Put test logic (data setup, API call) vào page object
- ❌ Giant page object 500 dòng — split thành components
- ❌ Inheritance chain > 2 level — composition tốt hơn
- ❌ Private getter lazy: `get submitBtn() { return ... }` — chậm hơn readonly

---

## 6. Structure chuẩn sau Day 5

```
src/
├── pages/
│   ├── base.page.ts
│   ├── login.page.ts
│   ├── inventory.page.ts
│   └── cart.page.ts
├── components/
│   ├── base.component.ts   # (optional)
│   └── header.component.ts
tests/
├── saucedemo/
│   ├── login.spec.ts
│   ├── inventory.spec.ts
│   └── checkout.spec.ts
```

---

## 7. tsconfig paths (nice-to-have)

Tránh relative path dài `../../../../src/pages/login.page`:

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["src/pages/*"],
      "@components/*": ["src/components/*"],
      "@fixtures/*": ["src/fixtures/*"],
      "@helpers/*": ["src/helpers/*"]
    }
  }
}
```

Sau đó:

```typescript
import { LoginPage } from '@pages/login.page'; // clean
```

---

## 8. Bài tập

### Bài 1: Refactor tất cả test hiện có

Tests saucedemo ngày 3 → tách ra POM:

- `LoginPage` (đã làm ví dụ)
- `InventoryPage` — methods: `addItemToCart(name)`, `goToCart()`, `getCartCount()`
- `CartPage` — methods: `checkout()`, `removeItem(name)`

### Bài 2: TodoMVC POM

Trên https://demo.playwright.dev/todomvc, tạo `TodoMvcPage` với methods:

- `goto()`
- `addTodo(text: string)`
- `toggleTodo(index: number)`
- `deleteTodo(index: number)`
- `getTodoTexts(): Promise<string[]>`
- `filterBy(filter: "all" | "active" | "completed")`
- `getCount(): Promise<number>`

Viết 5 tests dùng POM này.

### Bài 3: Component

Tách header (inventory page có burger menu + cart icon) thành `HeaderComponent`. Reuse trong InventoryPage và CartPage.

### Bài 4: Chain page transitions

Refactor `login()` để return `InventoryPage`:

```typescript
const inventoryPage = await loginPage.login('standard_user', 'secret_sauce');
await inventoryPage.addItemToCart('Sauce Labs Backpack');
```

---

## 9. Common Pitfalls

| Vấn đề                                            | Fix                                                                                          |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Page object 500+ dòng                             | Tách components                                                                              |
| Nhiều test duplicate `new LoginPage(page)`        | Day 8 sẽ dùng fixtures để auto-inject                                                        |
| Locators trong test file lọt qua                  | Code review rule: tests chỉ `import` page objects, không import `@playwright/test` `Locator` |
| Method trả wrong type                             | Luôn khai báo return type rõ `: Promise<Cart>`                                               |
| Private `goto()` duplicate trong mọi page         | Đẩy lên BasePage                                                                             |
| Over-abstraction: `ButtonWrapper`, `InputWrapper` | Không cần — Playwright locator đã đủ expressive                                              |

---

## 10. Khi nào KHÔNG dùng POM

POM không phải lúc nào cũng tốt:

- **Micro tests (unit-level)** — overhead lớn hơn benefit
- **One-off exploratory script** — không cần reusability
- **Page siêu đơn giản (1 button)** — inline locator đủ

**Alternative pattern:**

- **App Actions** — hàm thuần: `await login(page, user, pass)`, không class
- **Screenplay** — tester-centric pattern (Actors/Tasks/Questions), phức tạp hơn

POM là default tốt. Khi team >10 người thử screenplay.

---

## 11. Checklist

- [ ] Tất cả saucedemo test dùng POM, không còn locator trong spec
- [ ] `BasePage` abstract class hoàn thiện
- [ ] TodoMVC POM với 7 methods
- [ ] Component pattern dùng ít nhất 1 lần
- [ ] tsconfig paths config để import gọn
- [ ] Commit: `refactor: introduce page object model`
- [ ] NOTES.md: liệt kê 3 điều POM cứu bạn khỏi duplicate

---

## Resources

- [Playwright — POM](https://playwright.dev/docs/pom)
- [Martin Fowler — PageObject](https://martinfowler.com/bliki/PageObject.html) — pattern origin
- [Testing patterns — App Actions](https://www.cypress.io/blog/2019/01/03/stop-using-page-objects-and-start-using-app-actions) (Cypress, nhưng concept cross-framework)
- Video (20'): [Playwright Page Object Model Tutorial](https://www.youtube.com/results?search_query=playwright+page+object+model) — chọn video mới nhất

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [POM in Playwright (Butch Mayhew)](https://www.youtube.com/watch?v=BU-3cLFz7qw) — pragmatic walkthrough
- [Refactoring to Page Objects (live coding)](https://www.youtube.com/results?search_query=playwright+page+object+refactor)
- [Why POM is sometimes harmful (Kent C. Dodds)](https://www.youtube.com/@kentcdodds1) — alternative views

### 📝 Articles & blogs

- [Martin Fowler — PageObject](https://martinfowler.com/bliki/PageObject.html) — original pattern (2013)
- [Gil Zilberfeld — Page Object done right](https://www.gilzilberfeld.com/) — common mistakes
- [SmartBear — Page Object Model best practices](https://smartbear.com/learn/automated-testing/best-practices-for-test-automation/)
- [Cypress blog — Page Objects vs App Actions](https://www.cypress.io/blog/2019/01/03/stop-using-page-objects-and-start-using-app-actions) — alternative
- [Screenplay Pattern explained](https://serenity-js.org/handbook/design/screenplay-pattern.html)

### 🎓 Pattern deep dives

- [Fluent interface pattern](https://martinfowler.com/bliki/FluentInterface.html)
- [Composition over inheritance (Refactoring Guru)](https://refactoring.guru/design-patterns/composition-vs-inheritance)
- [SOLID principles in test code](https://medium.com/search?q=solid%20test%20automation)

### 📖 Books

- _Refactoring_ — Martin Fowler (2nd ed) — mindset for test code refactor
- _Clean Code_ — Robert Martin (applies to test code!)
- _Test Automation Patterns_ — Dorothy Graham
- _Agile Testing_ — Lisa Crispin (role of POM in agile)

### 🐙 Related GitHub repos

- [microsoft/playwright — test examples](https://github.com/microsoft/playwright/tree/main/tests) — see POM in practice
- [serenity-js/serenity-js](https://github.com/serenity-js/serenity-js) — Screenplay pattern reference (advanced)
- [cypress-io/cypress-example-recipes](https://github.com/cypress-io/cypress-example-recipes) — App Actions examples

### 📊 Cheat sheets / quick refs

- [Playwright POM quickref](https://playwright.dev/docs/pom)
- [OOP in TypeScript](https://www.typescriptlang.org/docs/handbook/2/classes.html)

### 🏛️ Alternative patterns (để biết)

- **App Actions**: functional, no classes, direct state manipulation
- **Screenplay**: actor-centric, tasks + questions
- **Component Objects**: smaller scope than POM
- **Robot Pattern** (Android): similar to POM for mobile

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (POM mechanics)

**B1.** Refactor 3 tests sau cùng POM, ít nhất 3 test dùng chung 1 LoginPage:

- Happy login
- Wrong password
- Locked user

**B2.** Viết `BasePage` abstract class với:

- `readonly page: Page`
- `abstract path: string`
- `async goto()` — goto + wait
- `async waitUntilLoaded()`
- `get url(): string`

Extends với LoginPage, InventoryPage.

**B3.** Locator organization — move mọi locator vào constructor. Không có `page.locator` nào trong method body. Verify dễ đọc hơn.

### 🟡 Trung bình (composition, chain, typing)

**M1.** Component pattern — tách Header (có cart + menu) ra `HeaderComponent`:

```typescript
export class HeaderComponent {
  readonly root: Locator;
  readonly cartIcon: Locator;

  constructor(page: Page) {
    this.root = page.locator('[data-test="primary-header"]');
    this.cartIcon = this.root.locator('[data-test="shopping-cart-link"]');
  }

  async openCart(): Promise<void> {
    await this.cartIcon.click();
  }
}
```

Reuse trong InventoryPage & CartPage. Verify no duplicate locator.

**M2.** Chain page transition — `login()` return `InventoryPage`:

```typescript
async login(user: string, pass: string): Promise<InventoryPage> {
  await this.username.fill(user);
  // ...
  await this.loginButton.click();
  return new InventoryPage(this.page);
}

// Test:
const inventoryPage = await loginPage.login("user", "pass");
await inventoryPage.addToCart("...");
```

Refactor chain 3 level: LoginPage → InventoryPage → CartPage → CheckoutPage.

**M3.** TodoMVC — viết 1 full POM:

```typescript
class TodoMvcPage extends BasePage {
  readonly path = '/todomvc';
  readonly newTodo: Locator;
  readonly todoItems: Locator;

  async addTodo(text: string): Promise<void>;
  async toggleTodo(index: number): Promise<void>;
  async deleteTodo(index: number): Promise<void>;
  async getTexts(): Promise<string[]>;
  async filterBy(filter: 'all' | 'active' | 'completed'): Promise<void>;
  async clearCompleted(): Promise<void>;
  async getCount(): Promise<number>;
}
```

Viết 10 tests dùng POM này.

**M4.** Readable method names — refactor bad names:

```typescript
// Bad
async clickBtn3(): Promise<void>
async typeUserInfo(a, b, c, d): Promise<void>
async doStuff(): Promise<void>

// Good
async submitOrder(): Promise<void>
async fillCheckoutForm(info: CheckoutInfo): Promise<void>
async proceedToPayment(): Promise<void>
```

Audit 3 POM của bạn — rename methods theo business language.

### 🔴 Nâng cao (pattern design)

**A1.** Compare POM vs App Actions:

- Viết 1 tính năng với POM
- Viết cùng tính năng với App Actions (functions, no class)
- So sánh: LOC, readability, flexibility

**A2.** Screenplay Pattern preview — đọc [Serenity/JS docs](https://serenity-js.org/handbook/design/screenplay-pattern.html), viết 1 test theo pattern này (chỉ để hiểu, không cần lib):

```typescript
actor.attemptsTo(
  Navigate.to('/login'),
  Enter.theValue('alice').into(LoginPage.username),
  Enter.theValue('secret').into(LoginPage.password),
  Click.on(LoginPage.submit)
);
```

Trade-off vs POM?

**A3.** Component composition (không inheritance):

```typescript
class InventoryPage extends BasePage {
  // ❌ Avoid: extends HeaderPage extends BasePage (inheritance chain)

  // ✅ Compose:
  readonly header: HeaderComponent;
  readonly footer: FooterComponent;
  readonly sidebar: SidebarComponent;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.footer = new FooterComponent(page);
    this.sidebar = new SidebarComponent(page);
  }
}
```

Refactor project ≥ 2 pages share header — dùng composition.

**A4.** Type-safe page factory:

```typescript
type PageClass<T> = new (page: Page) => T;

function createPage<T>(cls: PageClass<T>, page: Page): T {
  return new cls(page);
}

// Usage:
const loginPage = createPage(LoginPage, page);
```

Useful cho testing lib internal? Discuss pros/cons.

### 🏆 Mini challenge (60 phút)

**Task:** Full POM cho 1 real app — https://automationexercise.com/

Requirements:

- `BasePage` + ≥ 5 concrete page classes:
  - `HomePage`
  - `LoginSignupPage`
  - `ProductListPage`
  - `ProductDetailPage`
  - `CartPage`
  - `CheckoutPage`
- ≥ 1 component: `NavigationComponent` (header menu reuse cross pages)
- Fluent chain: `home.goToProducts().search("t-shirt").firstResult().addToCart()` → returns `CartPage`
- TypeScript strict, path aliases
- 5 tests covering critical flows

Constraints:

- Không method dài >10 dòng
- Không page class >200 dòng (split nếu cần)
- Mọi locator readonly
- Mọi method tên business language

### 🌟 Stretch goal

Read [serenity-js source code](https://github.com/serenity-js/serenity-js) — understand advanced testing architecture.

---

## Next

[Day 6 — TypeScript config, ESLint, Prettier →](./day-06-linting-tooling.md)
