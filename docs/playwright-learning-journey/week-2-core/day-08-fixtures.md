# Day 8 — Fixtures (Dependency Injection cho Test)

> **Goal:** Hiểu fixture là gì, tại sao tốt hơn `beforeEach`, cách viết custom fixture, merge nhiều fixtures.
> **Thời gian:** 3-4 giờ

---

## Prerequisites

- Week 1 hoàn thành
- Đã có POM với 3+ page objects

---

## 1. Vấn đề `beforeEach` giải quyết không đủ

```typescript
// Week 1 code
test.describe('Cart tests', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
  });

  test('...', async () => {
    await inventoryPage.addToCart('...');
    // ...
  });
});
```

**Nhược điểm:**

- Duplicate trong mỗi `describe`
- `let` biến không type-safe như param
- Muốn reuse cross-file phải copy-paste

---

## 2. Fixture — Playwright's DI container

```typescript
// tests/cart.spec.ts (giả sử đã có fixture)
test('can checkout', async ({ loginPage, cartPage }) => {
  await loginPage.loginAsDefaultUser();
  await cartPage.addFirstItem();
  await cartPage.checkout();
});
```

**Magic:** Khi test list `{ loginPage, cartPage }`, Playwright tự:

1. Tạo instance LoginPage, CartPage
2. Pass vào test
3. Tear down sau test (nếu cần)

Reuse cross file. Typed. Composable.

---

## 3. Custom fixture đầu tiên

**`src/fixtures/pages.fixture.ts`:**

```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { InventoryPage } from '@pages/inventory.page';
import { CartPage } from '@pages/cart.page';

type PagesFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
};

export const test = base.extend<PagesFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
    // Teardown (nếu cần) viết sau `use()`
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});

export { expect } from '@playwright/test';
```

**Sử dụng:**

```typescript
// tests/cart.spec.ts
import { test, expect } from '@fixtures/pages.fixture';

test('add to cart', async ({ loginPage, inventoryPage, cartPage }) => {
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
  await inventoryPage.addToCart('Sauce Labs Backpack');
  await inventoryPage.header.openCart();
  await expect(cartPage.items).toHaveCount(1);
});
```

---

## 4. Fixture pattern giải thích

```typescript
fixtureName: async ({ page }, use) => {
  // 1. Setup — trước khi test chạy
  const thing = new Thing(page);

  // 2. Pass vào test
  await use(thing);

  // 3. Teardown — sau test
  await thing.cleanup();
};
```

**3 phần:**

- **Setup** — khởi tạo, config
- `await use(value)` — pause, để test chạy
- **Teardown** — sau test xong (resource cleanup)

---

## 5. Fixtures có options & scope

### Option fixture — pass giá trị từ config

```typescript
type Options = { defaultUser: string };

export const test = base.extend<Options>({
  defaultUser: ['standard_user', { option: true }],
});

// Override trong test:
test.use({ defaultUser: 'problem_user' });

test('test with custom user', async ({ defaultUser, loginPage }) => {
  await loginPage.login(defaultUser, '...');
});
```

### Worker-scoped fixture (share trong worker)

```typescript
// Per-worker: tạo 1 lần cho nhiều test trong worker
type WorkerFixtures = { apiToken: string };

export const test = base.extend<{}, WorkerFixtures>({
  apiToken: [
    async ({}, use) => {
      const token = await loginViaApi();
      await use(token);
    },
    { scope: 'worker' },
  ],
});
```

Default scope: `"test"` — tạo mới mỗi test.

---

## 6. Merge multiple fixtures

Khi dự án lớn, tách fixtures ra nhiều file:

**`src/fixtures/api.fixture.ts`:**

```typescript
import { test as base } from '@playwright/test';
import { ApiClient } from '@api/api-client';

export const test = base.extend<{ apiClient: ApiClient }>({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
});
```

**`src/fixtures/auth.fixture.ts`:**

```typescript
import { test as base } from '@playwright/test';

type AuthFixtures = {
  testUser: { username: string; password: string };
};

export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    await use({
      username: process.env.TEST_USER || 'standard_user',
      password: process.env.TEST_PASS || 'secret_sauce',
    });
  },
});
```

**`src/fixtures/index.ts` — merge:**

```typescript
import { mergeTests } from '@playwright/test';
import { test as pagesTest } from './pages.fixture';
import { test as apiTest } from './api.fixture';
import { test as authTest } from './auth.fixture';

export const test = mergeTests(pagesTest, apiTest, authTest);
export { expect } from '@playwright/test';
```

**Usage:**

```typescript
import { test, expect } from '@fixtures/index';

test('complex test', async ({ loginPage, apiClient, testUser }) => {
  // Tất cả fixtures có sẵn, typed
});
```

---

## 7. Auto fixture (chạy tự động)

Dùng cho logging, telemetry — không cần inject vào test:

```typescript
export const test = base.extend({
  logTestInfo: [
    async ({}, use, testInfo) => {
      console.log(`Starting: ${testInfo.title}`);
      await use();
      console.log(`Finished: ${testInfo.title}`);
    },
    { auto: true },
  ],
});
```

Mọi test trong file dùng fixture này auto chạy, không cần list `{ logTestInfo }`.

---

## 8. Lazy init fixtures

Pattern cho page objects — chỉ init khi test thực sự dùng:

```typescript
type PagesFixtures = {
  loginPage: LoginPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<PagesFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page)); // chỉ tạo nếu test list `checkoutPage`
  },
});
```

Test chỉ dùng login → không tạo CheckoutPage instance. Tiết kiệm memory.

---

## 9. Bài tập

### Bài 1: Refactor week 1 → dùng fixtures

Chuyển toàn bộ `beforeEach` trong mini project week 1 sang fixtures. Test file phải sạch, chỉ có:

```typescript
test("...", async ({ loginPage, ... }) => { ... });
```

### Bài 2: Create `authenticatedTest` fixture

Viết fixture tự động login (tạm thời dùng login UI, sẽ optimize Day 11):

```typescript
authenticatedPage: async ({ page, loginPage }, use) => {
  await loginPage.goto();
  await loginPage.login("standard_user", "secret_sauce");
  await use(page);
  // Sau test, nothing to cleanup
},
```

Rồi dùng trong test cần user đã login:

```typescript
test('protected feature', async ({ authenticatedPage, inventoryPage }) => {
  await inventoryPage.addToCart('...');
});
```

### Bài 3: Option fixture

Tạo fixture `testUserType` với default `"standard"`. Cho phép test override `"problem"` hoặc `"locked"`:

```typescript
test.use({ testUserType: "problem" });
test("test with problem user", async ({ testUserType, ... }) => {
  // credentials đổi theo type
});
```

### Bài 4: Merge 3 fixtures

Tạo 3 file fixtures: `pages`, `api`, `auth`. Merge vào `index.ts`. Dùng trong 1 test phức hợp.

---

## 10. Common Pitfalls

| Vấn đề                              | Fix                                                                 |
| ----------------------------------- | ------------------------------------------------------------------- |
| "Fixture 'X' does not have a value" | Chưa extend base test; hoặc fixture chưa register                   |
| TypeScript không thấy fixture type  | Thiếu generic `<MyFixtures>`                                        |
| Fixture chạy 2 lần / test           | Worker-scoped cần declare `{ scope: "worker" }` đúng                |
| Teardown không chạy                 | Quên `await use(value)` — cần `await`                               |
| Merge fixtures xung đột tên         | Rename 1 trong 2 hoặc `mergeTests` không work — check docs          |
| Performance kém                     | Worker-scoped fixture cho expensive resource (DB connection, token) |

---

## 11. Fixture decision matrix

| Case                         | Pattern                                   |
| ---------------------------- | ----------------------------------------- |
| Page Object                  | `fixture { scope: "test" }` — default     |
| API client (reuse)           | `fixture { scope: "worker" }`             |
| Auth token (fetch 1 lần)     | `fixture { scope: "worker" }`             |
| Test data user               | `fixture { scope: "test" }` — isolation   |
| Logger, telemetry            | `fixture { auto: true }`                  |
| Config override per test     | `test.use({ option: ... })`               |
| Setup run once for ALL tests | `globalSetup` trong config (khác fixture) |

---

## 12. Checklist

- [ ] Hiểu 3 phần của fixture (setup / use / teardown)
- [ ] Bài 1: test file không còn `beforeEach` với `new XPage()`
- [ ] Bài 2: `authenticatedPage` fixture hoạt động
- [ ] Bài 4: merge 3 fixtures, TS autocomplete đủ
- [ ] Giải thích được difference test-scope vs worker-scope
- [ ] Commit: `feat: introduce test fixtures`
- [ ] NOTES.md: ghi 2 nơi fixture cứu bạn khỏi duplicate

---

## Resources

- [Playwright — Test Fixtures](https://playwright.dev/docs/test-fixtures) — đọc hết
- [Playwright — Advanced Fixtures](https://playwright.dev/docs/test-advanced)
- Video: search YouTube "Playwright fixtures deep dive"

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Playwright Fixtures — Everything You Need to Know](https://www.youtube.com/results?search_query=playwright+fixtures+advanced) — tìm video mới nhất
- [Dependency Injection in 100 seconds (Fireship)](https://www.youtube.com/watch?v=J1f5b4vcxCQ) — mental model
- [Playwright Fixtures vs Hooks (Butch Mayhew)](https://www.youtube.com/@ButchMayhew)

### 📝 Articles & blogs

- [Playwright — Test Fixtures Concepts](https://playwright.dev/docs/test-fixtures#with-fixtures)
- [DI in TypeScript explained](https://blog.wolksoftware.com/dependency-injection-in-typescript)
- [Why fixtures beat beforeEach](https://dev.to/search?q=playwright+fixtures)
- [Fixture composition patterns](https://medium.com/search?q=playwright+fixture+composition)

### 🎓 Advanced topics

- [Worker-scoped fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures) — share expensive resources
- [Fixture override + parameterize](https://playwright.dev/docs/test-parameterize#parameterized-projects)
- [`test.use()` scope rules](https://playwright.dev/docs/api/class-test#test-use)

### 🐙 Related GitHub repos

- [microsoft/playwright — fixture examples](https://github.com/microsoft/playwright/tree/main/tests) — real-world usage
- [tsoa/tsoa](https://github.com/lukeautry/tsoa) — DI patterns in TypeScript (concepts)

### 📊 Cheat sheets / quick refs

- [Fixture types table](https://playwright.dev/docs/test-fixtures)
- [mergeTests API docs](https://playwright.dev/docs/api/class-test#test-merge-tests)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (fixture mechanics)

**B1.** Refactor 5 tests có `beforeEach(async ({ page }) => { new LoginPage(page) })` sang fixture. So sánh độ dài test file trước/sau.

**B2.** Create fixture cho 3 page objects (LoginPage, InventoryPage, CartPage). Merge trong 1 file `pages.fixture.ts`.

**B3.** Test độ "lazy" — thêm `console.log` trong constructor mỗi page object. Chạy 1 test chỉ dùng `loginPage` → verify console chỉ log "LoginPage", KHÔNG log các page khác.

### 🟡 Trung bình (scope + option)

**M1.** Worker-scoped fixture:

```typescript
export const test = base.extend<{}, { apiToken: string }>({
  apiToken: [
    async ({}, use) => {
      console.log('Fetching token (expensive)...');
      const token = await fetchToken();
      await use(token);
    },
    { scope: 'worker' },
  ],
});
```

Chạy 10 tests → verify "Fetching token" log chỉ xuất hiện 1-2 lần (số workers), không phải 10 lần.

**M2.** Option fixture:

```typescript
export const test = base.extend<{ userType: 'standard' | 'problem' }>({
  userType: ['standard', { option: true }],
});

// File A:
test('test 1', async ({ userType }) => {
  /* standard */
});

// File B:
test.use({ userType: 'problem' });
test('test 2', async ({ userType }) => {
  /* problem */
});
```

Verify override hoạt động.

**M3.** Auto fixture — logger:

```typescript
logTestInfo: [
  async ({}, use, testInfo) => {
    console.log(`▶ ${testInfo.title}`);
    const start = Date.now();
    await use();
    console.log(`✔ ${testInfo.title} (${Date.now() - start}ms)`);
  },
  { auto: true },
],
```

Chạy vài tests → verify logs tự động xuất hiện.

**M4.** `mergeTests` — tạo 3 file fixture, merge:

- `pages.fixture.ts`
- `api.fixture.ts`
- `data.fixture.ts`

Trong `index.ts`:

```typescript
export const test = mergeTests(pagesTest, apiTest, dataTest);
```

Verify test có access tất cả fixtures + TypeScript autocomplete.

### 🔴 Nâng cao (complex patterns)

**A1.** Chained fixture dependencies:

```typescript
// apiClient depends on apiToken
// userApi depends on apiClient
// newUser depends on userApi

export const test = base.extend<{
  apiToken: string;
  apiClient: ApiClient;
  userApi: UserApi;
  newUser: User;
}>({
  apiToken: async ({}, use) => { ... },
  apiClient: async ({ apiToken }, use) => { ... },
  userApi: async ({ apiClient }, use) => { ... },
  newUser: async ({ userApi }, use) => {
    const user = await userApi.create(buildUser());
    await use(user);
    await userApi.delete(user.id);
  },
});

// Test:
test("uses user", async ({ newUser }) => {
  // All chain runs. Cleanup reverse order.
});
```

Implement + verify cleanup order.

**A2.** Conditional fixture — skip nếu env không support:

```typescript
adminUser: async ({}, use, testInfo) => {
  if (!process.env.ADMIN_USER) {
    testInfo.skip(true, "Admin creds not configured");
    return;
  }
  await use({ username: process.env.ADMIN_USER, ... });
},
```

**A3.** Typed page factory fixture:

```typescript
type Pages = {
  login: LoginPage;
  inventory: InventoryPage;
  cart: CartPage;
};

pages: (async ({ page }, use) => {
  await use({
    login: new LoginPage(page),
    inventory: new InventoryPage(page),
    cart: new CartPage(page),
  });
},
  // Test:
  test('...', async ({ pages }) => {
    await pages.login.goto();
    await pages.cart.addItem();
  }));
```

Trade-off vs individual fixtures?

**A4.** Fixture extension (inheritance):

```typescript
// base-test.ts — team's default
export const test = base.extend({ ... });

// feature-test.ts — adds feature-specific
import { test as baseTest } from "./base-test";
export const test = baseTest.extend({ featureSpecificFixture: ... });
```

Pattern này hữu ích cho monorepo.

### 🏆 Mini challenge (60 phút)

**Task:** Build "Advanced Auth Fixture" — production-grade auth setup.

Requirements:

```typescript
type AuthFixtures = {
  // Worker-scoped — cached across tests
  adminToken: string;
  userToken: string;

  // Test-scoped — per-test
  authedPage: Page; // page đã login as user
  adminPage: Page; // page đã login as admin
  tempUser: User; // random user, cleanup after
};
```

Features:

1. Token cache by worker — không fetch lại per test
2. Storage state injection — `authedPage` đã có cookies
3. Cleanup reverse order — tempUser deleted after test
4. Type-safe — autocomplete all fixtures

Test với 20 tests parallel — verify:

- Token fetch <3 lần (≈ số workers)
- No conflict giữa tests
- Tất cả cleanup

### 🌟 Stretch goal

Read [Playwright test fixture source code](https://github.com/microsoft/playwright/tree/main/packages/playwright/src/common) — understand how fixtures actually work internally.

---

## Next

[Day 9 — Test Data & Faker →](./day-09-test-data-faker.md)
