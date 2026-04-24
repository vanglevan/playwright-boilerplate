# Day 9 — Test Data & Faker

> **Goal:** Biết khi nào dùng data cố định vs random, dùng Faker đúng cách, data-driven testing.
> **Thời gian:** 2-3 giờ

---

## Prerequisites

- Day 8 (fixtures) hoàn thành

---

## 1. Triết lý về test data

### 3 loại data

| Loại                | Khi nào                      | Ví dụ                                        |
| ------------------- | ---------------------------- | -------------------------------------------- |
| **Static**          | Credentials, role cố định    | `admin@test.com` / `password123`             |
| **Random (unique)** | Mỗi test cần user/data riêng | Signup email random                          |
| **Seeded random**   | Cần reproduce bug            | `faker.seed(42)` → mỗi lần random giống nhau |

### Golden rule

> **Mỗi test tự tạo data của nó, không phụ thuộc data test trước để lại.**

Vi phạm rule này = tests có order dependency = parallel không work.

---

## 2. Static data pattern

**`src/data/users.json`:**

```json
{
  "validUsers": [
    { "username": "standard_user", "password": "secret_sauce", "role": "customer" },
    { "username": "problem_user", "password": "secret_sauce", "role": "customer" }
  ],
  "invalidUsers": [
    { "username": "", "password": "secret_sauce", "expectedError": "Username required" },
    { "username": "x", "password": "", "expectedError": "Password required" },
    {
      "username": "locked_out_user",
      "password": "secret_sauce",
      "expectedError": "Sorry, this user has been locked out"
    }
  ]
}
```

**`src/data/index.ts`:**

```typescript
import users from './users.json';

export const testData = {
  users,
};
```

Đảm bảo `tsconfig.json` có `"resolveJsonModule": true`.

**Usage:**

```typescript
import { testData } from '@data/index';

test('login with all invalid users', async ({ loginPage }) => {
  for (const user of testData.users.invalidUsers) {
    await loginPage.goto();
    await loginPage.login(user.username, user.password);
    await expect(loginPage.errorMessage).toContainText(user.expectedError);
  }
});
```

---

## 3. Faker.js — data động

```bash
npm i -D @faker-js/faker
```

**Basic:**

```typescript
import { faker } from '@faker-js/faker';

faker.internet.email(); // "Cameron_Stokes52@hotmail.com"
faker.person.fullName(); // "Denise Zieme"
faker.phone.number(); // "+1-555-273-4729"
faker.location.streetAddress(); // "4526 Emile Pike"
faker.commerce.product(); // "Chair"
faker.commerce.price(); // "523.00"
faker.lorem.sentence(); // "Voluptatum..."
faker.number.int({ min: 1, max: 100 });
faker.datatype.boolean();
```

**Tiếng Việt:**

```typescript
import { fakerVI } from '@faker-js/faker';

fakerVI.person.fullName(); // "Nguyễn Văn Anh"
fakerVI.location.city(); // "Đà Nẵng"
```

---

## 4. Data factory pattern

**`src/helpers/data-factory.ts`:**

```typescript
import { faker } from '@faker-js/faker';

export type User = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export function buildUser(overrides: Partial<User> = {}): User {
  return {
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12 }),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phone: faker.phone.number({ style: 'international' }),
    ...overrides,
  };
}

export type Address = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

export function buildAddress(overrides: Partial<Address> = {}): Address {
  return {
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    postalCode: faker.location.zipCode(),
    country: faker.location.country(),
    ...overrides,
  };
}

export function buildProduct(overrides = {}) {
  return {
    sku: faker.string.alphanumeric(8).toUpperCase(),
    name: faker.commerce.productName(),
    price: parseFloat(faker.commerce.price()),
    category: faker.commerce.department(),
    inStock: faker.datatype.boolean(),
    ...overrides,
  };
}

// Reproducibility
export function setSeed(seed: number): void {
  faker.seed(seed);
}
```

**Usage:**

```typescript
import { buildUser } from '@helpers/data-factory';

test('signup with random user', async ({ page }) => {
  const user = buildUser();
  // hoặc override field cụ thể:
  const premiumUser = buildUser({ email: 'premium@test.com' });
});
```

---

## 5. Data-driven tests (parametrized)

### Pattern 1: for loop trong 1 test

```typescript
import { testData } from '@data/index';

test('all invalid users show error', async ({ loginPage }) => {
  for (const user of testData.users.invalidUsers) {
    await test.step(`user: ${user.username || 'empty'}`, async () => {
      await loginPage.goto();
      await loginPage.login(user.username, user.password);
      await expect(loginPage.errorMessage).toContainText(user.expectedError);
    });
  }
});
```

`test.step` group trong report → dễ đọc.

### Pattern 2: generate test per row (khuyến nghị)

```typescript
testData.users.invalidUsers.forEach((user) => {
  test(`login fails for ${user.username || 'empty username'}`, async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(user.username, user.password);
    await expect(loginPage.errorMessage).toContainText(user.expectedError);
  });
});
```

**Lợi ích:** Mỗi row là 1 test độc lập, parallel, report rõ.

### Pattern 3: test.describe with parameterize

```typescript
for (const user of testData.users.invalidUsers) {
  test.describe(`Invalid user: ${user.username}`, () => {
    test('shows error', async ({ loginPage }) => {
      // ...
    });
    test('cannot access dashboard', async ({ page }) => {
      // ...
    });
  });
}
```

---

## 6. Seeded random — reproduce bug

```typescript
import { setSeed, buildUser } from '@helpers/data-factory';

test('user creation works', async ({ page }) => {
  setSeed(12345); // luôn sinh ra cùng 1 user
  const user = buildUser();
  // user.email, user.firstName deterministic
});
```

**Use case:** Bug chỉ xảy ra với user tên `"James O'Brien"` (có dấu `'`) → set seed để reproduce.

---

## 7. Data cleanup — xử lý rác

Khi test tạo user qua API → dọn sau test:

```typescript
import { test as base } from '@playwright/test';
import { buildUser } from '@helpers/data-factory';

export const test = base.extend<{ newUser: User }>({
  newUser: async ({ request }, use) => {
    const user = buildUser();
    // Tạo qua API
    await request.post('/api/users', { data: user });

    await use(user);

    // Cleanup sau test
    await request.delete(`/api/users/${user.email}`);
  },
});
```

**Alternative:** Nếu không API — dùng email có pattern (`test+${uuid}@test.com`) → cron cleanup nightly.

---

## 8. Anti-patterns

### ❌ Data prod trong test

```typescript
// KHÔNG làm
await loginPage.login('real-admin@company.com', 'RealPassword123');
```

Risk: lộ credentials, test pollution prod, violation GDPR.

### ❌ Shared mutable data

```typescript
// KHÔNG làm
const sharedUser = { email: "test@test.com", id: null };
test("create", async () => { sharedUser.id = ...; });
test("update", async () => { /* depends on create */ });
```

Race condition parallel.

### ❌ Sequential ID assumption

```typescript
// KHÔNG làm
const userId = 42; // hardcoded, sẽ vỡ khi DB reset
```

---

## 9. Bài tập

### Bài 1: Build 3 factories

Viết `buildUser`, `buildProduct`, `buildOrder` với 3-5 fields mỗi cái. Support `overrides`.

### Bài 2: Data-driven negative test

Trên saucedemo, viết data-driven test với 5 invalid login cases (empty username, empty password, wrong password, locked user, performance_glitch_user). Dùng Pattern 2 (generate test per row).

### Bài 3: Unique email mỗi test

Viết fixture `newUser` auto-generate user mới mỗi test. Verify 10 tests parallel không collision email.

### Bài 4: Seeded reproduce

Set seed 123, chạy `buildUser()` 3 lần → log output. Chạy lại test → verify output giống lần trước.

### Bài 5: Test với data tiếng Việt

Dùng `fakerVI` generate 5 users tiếng Việt, signup form (trên app demo tiếng Việt bất kỳ). Check app handle được UTF-8.

---

## 10. Common Pitfalls

| Vấn đề                                    | Fix                                                           |
| ----------------------------------------- | ------------------------------------------------------------- |
| Email trùng giữa tests                    | Dùng `faker.internet.email()` mỗi lần, không shared           |
| Test flaky với random data                | Log data generated; set seed để reproduce                     |
| `Cannot find module './users.json'`       | `tsconfig.json` thêm `"resolveJsonModule": true`              |
| Test đọc data prod                        | Dùng `.env` riêng theo env, không bao giờ hardcode prod creds |
| Test tạo rác không xoá                    | Fixture cleanup; hoặc pattern email để cron xoá               |
| `buildUser()` thiếu field yêu cầu của API | Validate bằng Zod schema trước khi send                       |

---

## 11. Checklist

- [ ] `src/data/users.json` có validUsers + invalidUsers
- [ ] `src/helpers/data-factory.ts` với 3 factory
- [ ] `setSeed()` function
- [ ] Data-driven test tạo 5 tests từ 5 rows
- [ ] Fixture `newUser` unique mỗi test
- [ ] Commit: `feat: add test data factories`
- [ ] NOTES.md: ghi pattern đã học

---

## Resources

- [faker-js docs](https://fakerjs.dev/)
- [faker-js API](https://fakerjs.dev/api/)
- [Playwright — Parametrize tests](https://playwright.dev/docs/test-parameterize)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Data-driven testing explained](https://www.youtube.com/results?search_query=data+driven+testing+playwright)
- [Faker.js tutorial](https://www.youtube.com/results?search_query=faker+js+tutorial)
- [Test data management strategies](https://www.youtube.com/results?search_query=test+data+management)

### 📝 Articles & blogs

- [Faker.js Localizations (including VI)](https://fakerjs.dev/guide/localization.html)
- [Test data anti-patterns](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Property-based testing with fast-check](https://github.com/dubzzz/fast-check) — advanced randomness
- [Builder pattern in test data](https://refactoring.guru/design-patterns/builder)

### 🎓 Deep concepts

- [Test data as first-class citizen](https://dev.to/search?q=test+data)
- [Ephemeral vs persistent test data](https://testautomationu.applitools.com/)
- [Equivalence partitioning & boundary value analysis](https://www.istqb.org/certifications/foundation-level) — ISTQB

### 📖 Books

- _Refactoring_ — Fowler (Builder pattern chapters)
- _Domain-Driven Design_ — Eric Evans (concepts of factories)

### 🐙 Related GitHub repos

- [faker-js/faker](https://github.com/faker-js/faker) — source + examples
- [dubzzz/fast-check](https://github.com/dubzzz/fast-check) — property-based testing
- [factory-girl-orm/factory-girl](https://github.com/factory-girl-orm/factory-girl) — Ruby-inspired factories (concepts)

### 📊 Cheat sheets

- [Faker.js API cheatsheet](https://fakerjs.dev/api/)
- [Common localizations (faker)](https://fakerjs.dev/guide/localization.html)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (factory + static)

**B1.** Build 5 factories:

- `buildUser()` — email, password, name
- `buildAddress()` — street, city, zip
- `buildProduct()` — sku, name, price
- `buildOrder()` — contains user + products
- `buildCreditCard()` — number, cvv, expiry (Luhn valid!)

Dùng faker cho random, hỗ trợ `overrides`.

**B2.** Static data — tạo `users.json` với 5 invalid login cases. Load via `import` với `resolveJsonModule: true`.

**B3.** Data-driven — generate test per row:

```typescript
for (const user of invalidUsers) {
  test(`login fails: ${user.description}`, async ({ loginPage }) => {
    // ...
  });
}
```

### 🟡 Trung bình (seeded, localized, edge)

**M1.** Seeded random — reproduce bug:

```typescript
import { faker } from '@faker-js/faker';

test('reproduce bug with seed 42', async () => {
  faker.seed(42);
  const user = buildUser();
  console.log(user); // Same output every run
});
```

Run 3 lần → verify outputs identical.

**M2.** Vietnamese localization:

```typescript
import { fakerVI } from '@faker-js/faker';

const user = {
  name: fakerVI.person.fullName(), // "Nguyễn Thị Mai"
  address: fakerVI.location.streetAddress(),
  phone: fakerVI.phone.number(),
};
```

Test signup form với 10 Vietnamese users. Verify UTF-8 OK.

**M3.** Edge case data:
Generate 10 "evil" test strings:

- Empty ""
- Very long (10000 chars)
- Unicode only ("🚀😀")
- SQL injection (`' OR 1=1 --`)
- XSS (`<script>alert(1)</script>`)
- Path traversal (`../../etc/passwd`)
- Null bytes (`\x00`)
- Long emoji chain
- RTL chars (Arabic/Hebrew)
- Zero-width chars

Test form field — should handle gracefully.

**M4.** Data cleanup fixture:

```typescript
newUser: async ({ request }, use) => {
  const user = buildUser();
  await request.post("/api/users", { data: user });
  await use(user);
  await request.delete(`/api/users/${user.email}`);
},
```

Verify 20 tests parallel → no user leaks (check DB count before/after).

### 🔴 Nâng cao (advanced patterns)

**A1.** Realistic data scenarios — 5 user archetypes:

```typescript
function buildBudgetShopper() {
  return buildUser({ budget: 50, preferredCategory: 'sale' });
}

function buildLoyalCustomer() {
  return buildUser({ accountAge: 5 * 365, purchaseCount: 100 });
}

// etc.
```

Write tests that target each archetype.

**A2.** Data dependency resolution:

```typescript
// Order depends on User and Products
const user = buildUser();
const products = [buildProduct(), buildProduct()];
const order = buildOrder({ user, products });
```

Factory handle dependency injection.

**A3.** Property-based testing preview (fast-check):

```typescript
import fc from 'fast-check';

test.describe('email validation', () => {
  test('accepts all valid emails', () => {
    fc.assert(
      fc.property(fc.emailAddress(), (email) => {
        expect(isValidEmail(email)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
```

Install fast-check, try.

**A4.** DB seeding pattern — complex scenario:
Before test: seed DB với 100 users, 500 orders, 50 products via API.
Sau test: truncate tables.

Use case: test pagination, search, filter trên dataset realistic.

### 🏆 Mini challenge (45 phút)

**Task:** "Data Factory Library" — production-quality factories.

Build `src/helpers/factories/`:

- `user.factory.ts` — với types: basic, admin, premium, suspended
- `product.factory.ts` — với categories + price ranges
- `order.factory.ts` — aggregates user + products + address
- `index.ts` — barrel export

Features:

- `setSeed()` global (affects all factories)
- `overrides` pattern cho mọi factory
- `buildMany(fn, count)` helper — sinh array
- TypeScript strict, zero `any`
- Unit tests (không cần Playwright, dùng `tsx` hoặc vitest)

Example usage:

```typescript
const users = buildMany(() => buildUser(), 10);
const admins = buildMany(() => buildUser({ role: 'admin' }), 3);
```

### 🌟 Stretch goal

Research & write short note on **"data cleanup strategies at scale"** — test org with 10k+ tests/day. Strategies: API cleanup, TTL on emails (e.g., `test+timestamp@`), scheduled jobs, DB snapshot/restore.

---

## Next

[Day 10 — Environment Config + Zod →](./day-10-env-config.md)
