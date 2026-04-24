# Day 18 — Network Mocking & Routing

> **Goal:** Test UI edge cases không thể reproduce thật (API 500, chậm, empty) bằng `page.route()`.
> **Thời gian:** 2-3 giờ

---

## Prerequisites

- Week 1-2 + Day 12 (API testing) hoàn thành

---

## 1. Tại sao cần mock

**Use cases:**

1. Test **error state** — khó trigger thật (force 500, timeout)
2. Test **loading state** — slow connection
3. Test **empty state** — data rỗng khi staging có data sẵn
4. Test **edge data** — very long text, unicode, special chars
5. **Tách UI test khỏi backend flakiness** — backend down không block UI test
6. **Test third-party** — Stripe, Google Maps — mock thay gọi thật

**Không dùng để:** Unit test component (dùng Jest/Vitest cho cái đó).

---

## 2. `page.route()` basics

Intercept request matching URL pattern:

```typescript
await page.route('**/api/users', (route) => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ users: [{ id: 1, name: 'Mocked' }] }),
  });
});

await page.goto('/users');
// → UI show "Mocked" user
```

**3 actions:**

- `route.fulfill()` — trả response fake
- `route.continue()` — pass through (optional modify)
- `route.abort()` — fail request

---

## 3. URL matching

### Glob

```typescript
await page.route("**/api/**", ...);          // tất cả /api/
await page.route("**/users/*", ...);          // /users/1, /users/2
await page.route("https://api.example.com/*", ...);
```

### Regex

```typescript
await page.route(/\/api\/users\/\d+/, ...);
```

### Function predicate

```typescript
await page.route(
  (url) => url.pathname.startsWith("/api") && url.searchParams.has("debug"),
  ...
);
```

---

## 4. Scenarios thực tế

### 4.1 Force server error

```typescript
test('UI shows error when API returns 500', async ({ page }) => {
  await page.route('**/api/products', (route) => {
    route.fulfill({ status: 500, body: 'Internal Server Error' });
  });

  await page.goto('/products');
  await expect(page.getByText('Something went wrong')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
});
```

### 4.2 Slow response (loading state)

```typescript
test('shows spinner during slow load', async ({ page }) => {
  await page.route('**/api/products', async (route) => {
    await new Promise((r) => setTimeout(r, 3000)); // 3s delay
    route.continue();
  });

  await page.goto('/products');
  await expect(page.getByTestId('spinner')).toBeVisible();
  await expect(page.getByTestId('spinner')).toBeHidden({ timeout: 5000 });
});
```

### 4.3 Empty state

```typescript
test('empty state when no products', async ({ page }) => {
  await page.route('**/api/products', (route) => {
    route.fulfill({ json: { items: [], total: 0 } });
  });

  await page.goto('/products');
  await expect(page.getByText('No products found')).toBeVisible();
});
```

### 4.4 Network timeout

```typescript
test('shows timeout error', async ({ page }) => {
  await page.route('**/api/slow-endpoint', (route) => {
    // Never respond → client-side timeout
  });

  // ... assert timeout UI
});
```

### 4.5 Abort request

```typescript
test('page works when analytics blocked', async ({ page }) => {
  await page.route('**/google-analytics.com/**', (route) => route.abort());
  await page.route('**/*.adsystem.com/**', (route) => route.abort());

  await page.goto('/');
  // Page should still work
});
```

### 4.6 Modify response

```typescript
test('handles 1000 products (mock pagination)', async ({ page }) => {
  await page.route('**/api/products', async (route) => {
    const response = await route.fetch();
    const json = await response.json();

    // Modify
    const inflated = {
      ...json,
      items: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Product ${i}`,
      })),
    };

    route.fulfill({ response, json: inflated });
  });

  await page.goto('/products');
  // Test pagination UI
});
```

---

## 5. Scope & cleanup

### Per test

```typescript
test("...", async ({ page }) => {
  await page.route(...);  // auto cleanup after test
});
```

### Per describe

```typescript
test.beforeAll(async ({ browser }) => {
  // context-level route
});
```

### Unroute (remove handler)

```typescript
const handler = (route) => route.fulfill(...);
await page.route("**/api/**", handler);

// ... later
await page.unroute("**/api/**", handler);
```

---

## 6. Fixture pattern — mock reusable

```typescript
// src/fixtures/mock.fixture.ts
import { test as base, Page } from '@playwright/test';

type MockFixture = {
  mockApi: {
    users: (users: User[]) => Promise<void>;
    error: (pattern: string, status: number) => Promise<void>;
    slow: (pattern: string, ms: number) => Promise<void>;
  };
};

export const test = base.extend<MockFixture>({
  mockApi: async ({ page }, use) => {
    await use({
      async users(users) {
        await page.route('**/api/users', (route) => route.fulfill({ json: { items: users } }));
      },
      async error(pattern, status) {
        await page.route(pattern, (route) => route.fulfill({ status }));
      },
      async slow(pattern, ms) {
        await page.route(pattern, async (route) => {
          await new Promise((r) => setTimeout(r, ms));
          route.continue();
        });
      },
    });
  },
});

// Usage:
test('...', async ({ page, mockApi }) => {
  await mockApi.users([{ id: 1, name: 'Alice' }]);
  await page.goto('/users');
});
```

---

## 7. HAR recording & replay

Record traffic thật, replay sau:

```typescript
// Record
const context = await browser.newContext({
  recordHar: { path: 'fixtures/users.har' },
});

// Replay
const context = await browser.newContext({
  harUrl: 'fixtures/users.har',
  harMode: 'replay',
});
```

**Use case:** Test deterministic với production-like data mà không phụ thuộc backend.

---

## 8. Intercept & assert requests

Không fulfill, chỉ quan sát:

```typescript
test('sends correct analytics', async ({ page }) => {
  const events: string[] = [];

  await page.route('**/analytics/event', (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    events.push(body.event);
    route.fulfill({ status: 200 });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Sign up' }).click();

  expect(events).toContain('signup_clicked');
});
```

### Alternative: `page.waitForRequest`

```typescript
const requestPromise = page.waitForRequest(
  (req) => req.url().includes('/api/signup') && req.method() === 'POST'
);

await page.getByRole('button', { name: 'Sign up' }).click();

const req = await requestPromise;
const body = JSON.parse(req.postData() || '{}');
expect(body.email).toBe('test@test.com');
```

---

## 9. Realistic mocking với MSW

Nếu mock phức tạp (dozens of endpoints) → [MSW (Mock Service Worker)](https://mswjs.io/):

```bash
npm i -D msw
```

Define handlers 1 chỗ, reuse trong Playwright + unit test frontend:

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => HttpResponse.json({ users: [...] })),
  http.post("/api/login", ({ request }) => {
    // ...
  }),
];
```

**Overkill cho simple cases** — Playwright native đủ rồi.

---

## 10. Bài tập

### Bài 1: 3 scenarios

Trên 1 app demo (saucedemo hoặc tự host), viết 3 tests:

1. API `/inventory` trả 500 → UI show error
2. API chậm 3s → UI show loading
3. API empty → UI show "No items"

### Bài 2: Block analytics

Load 1 trang có Google Analytics (hầu hết site). Block `googletagmanager.com`. Verify page vẫn work.

### Bài 3: Intercept & assert

Viết test verify signup form POST body đúng schema khi submit.

### Bài 4: Modify response

Mock API trả 100 items. Test pagination button work. Test scroll infinite (nếu có).

### Bài 5: Fixture pattern

Build `mockApi` fixture reusable cho 5 tests khác nhau.

---

## 11. Common Pitfalls

| Vấn đề                                   | Fix                                                                |
| ---------------------------------------- | ------------------------------------------------------------------ |
| Route không match                        | Check URL pattern, xem Network tab URL thật                        |
| Multiple routes conflict                 | Route handlers LIFO — handler sau chạy trước                       |
| Mock không cleanup giữa tests            | Playwright auto-cleanup per test; nếu describe-level cần `unroute` |
| `fulfill` body sai format                | `contentType` phải set hoặc dùng `json: {...}`                     |
| Third-party SDK vẫn gọi                  | SDK cache URL — abort ALL variations                               |
| Over-mocking → test không catch real bug | Chỉ mock điều thật sự cần, giữ integration thật nếu có thể         |

---

## 12. Anti-patterns

- ❌ Mock mọi API → test chỉ verify UI logic, không catch backend-UI contract break
- ❌ Mock trong functional test → mix concern
- ❌ Hardcode mock data khác production schema → test pass, prod break
- ❌ Không assert request body → test không verify UI gửi đúng data

---

## 13. When to use MOCK vs REAL

| Test type             | Mock                     | Real                |
| --------------------- | ------------------------ | ------------------- |
| UI error state        | ✅                       | Hard to trigger     |
| Happy path smoke      | Prefer real              | Contract validation |
| Slow/timeout          | ✅                       | Can't simulate      |
| Third-party (payment) | ✅                       | Cost money          |
| Edge data             | ✅                       | Hard to seed        |
| Performance           | ❌                       | Real network        |
| Security              | Use real + specific mock | -                   |

---

## 14. Checklist

- [ ] `page.route()` cho 3 scenarios: error, slow, empty
- [ ] Block third-party script test
- [ ] Intercept & assert request body
- [ ] `mockApi` fixture reusable
- [ ] Commit: `test: network mocking scenarios`
- [ ] NOTES.md: 3 bug mock giúp phát hiện

---

## Resources

- [Playwright — Mock APIs](https://playwright.dev/docs/mock)
- [Playwright — Network](https://playwright.dev/docs/network)
- [HAR Format](https://w3c.github.io/web-performance/specs/HAR/Overview.html)
- [MSW docs](https://mswjs.io/docs/)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Network mocking in Playwright (official)](https://www.youtube.com/@Playwrightdev)
- [MSW tutorial (Mock Service Worker)](https://www.youtube.com/results?search_query=msw+tutorial)
- [API mocking strategies](https://www.youtube.com/results?search_query=api+mocking+strategies)

### 📝 Articles & blogs

- [Playwright — Mock APIs](https://playwright.dev/docs/mock)
- [When to mock vs when not](https://martinfowler.com/articles/mocksArentStubs.html) — Fowler classic
- [Mock Service Worker philosophy](https://kettanaito.com/blog/the-comprehensive-rest-api-testing-guide)
- [HAR file format explained](https://toolbox.googleapps.com/apps/har_analyzer/) — analyzer

### 🎓 Deep topics

- [Mocks vs Stubs vs Fakes](https://martinfowler.com/bliki/TestDouble.html) — Fowler
- [Record & Replay patterns](https://medium.com/search?q=record+replay+testing)
- [Consumer-driven contract testing vs mocking](https://docs.pact.io/)

### 📖 Books

- _Growing Object-Oriented Software, Guided by Tests_ — Freeman & Pryce (mocking origins)
- _xUnit Test Patterns_ — Meszaros (test doubles chapter)

### 🐙 Related GitHub repos

- [mswjs/msw](https://github.com/mswjs/msw) — Mock Service Worker
- [microsoft/playwright — route examples](https://github.com/microsoft/playwright/tree/main/tests)
- [nock/nock](https://github.com/nock/nock) — HTTP mocking for Node

### 🛠️ Tools

- [MSW (Mock Service Worker)](https://mswjs.io/) — when complex
- [mockoon](https://mockoon.com/) — standalone mock server
- [json-server](https://github.com/typicode/json-server) — quick REST mock
- [wiremock](https://wiremock.org/) — production mock server

### 📊 Cheat sheets

- [page.route() API reference](https://playwright.dev/docs/api/class-page#page-route)
- [route.fulfill / continue / abort](https://playwright.dev/docs/api/class-route)
- [HAR file structure](<https://en.wikipedia.org/wiki/HAR_(file_format)>)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (basic mocking)

**B1.** 3 classic scenarios:

- Error 500 → UI shows "Try again"
- Slow response 3s → spinner visible
- Empty array → empty state UI

**B2.** Abort third-party scripts:

```typescript
await page.route('**/google-analytics.com/**', (r) => r.abort());
await page.route('**/*.adsystem.com/**', (r) => r.abort());
```

Page should still work.

**B3.** Fulfill with static JSON file:

```typescript
await page.route('**/api/users', (route) => {
  route.fulfill({
    path: 'fixtures/users.json',
  });
});
```

### 🟡 Trung bình (modify + intercept)

**M1.** Modify real response:

```typescript
await page.route('**/api/products', async (route) => {
  const response = await route.fetch();
  const json = await response.json();
  json.items = json.items.map((p) => ({ ...p, price: 0 })); // all free!
  route.fulfill({ response, json });
});
```

Test UI rendering modified data.

**M2.** Intercept & assert request body:

```typescript
const bodyPromise = new Promise<any>((resolve) => {
  page.route('**/api/signup', (route) => {
    resolve(JSON.parse(route.request().postData() || '{}'));
    route.fulfill({ status: 201 });
  });
});

await page.getByRole('button', { name: 'Sign up' }).click();
const body = await bodyPromise;
expect(body.email).toBe('test@test.com');
expect(body.source).toBe('landing-page');
```

**M3.** Multiple mocks in order — stub chain:

```typescript
let callCount = 0;
await page.route('**/api/items', (route) => {
  callCount++;
  if (callCount === 1) {
    route.fulfill({ json: { items: [] } }); // First: empty
  } else {
    route.fulfill({ json: { items: [item1, item2] } }); // Refresh
  }
});
```

Test refresh button flow.

**M4.** Dynamic mock based on request:

```typescript
await page.route('**/api/users/*', (route) => {
  const url = new URL(route.request().url());
  const id = url.pathname.split('/').pop();
  if (id === '1') route.fulfill({ json: alice });
  else if (id === '2') route.fulfill({ json: bob });
  else route.fulfill({ status: 404 });
});
```

### 🔴 Nâng cao (HAR + MSW)

**A1.** HAR record & replay:

```typescript
// Record
const context = await browser.newContext({
  recordHar: { path: 'fixtures/site.har' },
});

// Replay (in another test)
const context = await browser.newContext({
  serviceWorkers: 'block',
  harUrl: 'fixtures/site.har',
  harMode: 'replay',
});
```

Deterministic replay of session.

**A2.** WebSocket mocking:

```typescript
await page.route('**/ws/**', (route) => {
  // Complex — Playwright 1.40+ has WS route API
});
```

Test realtime features without real server.

**A3.** MSW integration — complex API scenarios:

```typescript
import { setupServer } from 'msw/node';
import { http } from 'msw';

const server = setupServer(
  http.get('/api/users', () => HttpResponse.json(users)),
  http.post('/api/login', () => HttpResponse.json({ token: '...' }))
);

test.beforeAll(() => server.listen());
test.afterAll(() => server.close());
```

**A4.** Conditional mocking — only test specific condition:

```typescript
if (process.env.MOCK_PAYMENTS) {
  await page.route('**/api/charge', (route) => route.fulfill({ json: { success: true } }));
}
```

Env-driven: local always mock, CI real.

### 🏆 Mini challenge (45 phút)

**Task:** Mock API fixture cho test suite:

Build `src/fixtures/mock.fixture.ts`:

```typescript
type MockFixture = {
  mock: {
    users: (users: User[]) => Promise<void>;
    productError: (status: number) => Promise<void>;
    slowApi: (pattern: string, ms: number) => Promise<void>;
    emptyCart: () => Promise<void>;
  };
};
```

Test ≥ 8 scenarios using fixture:

- Happy empty state
- Loading state
- Error 4xx
- Error 5xx
- Partial data
- Unicode data
- Large dataset (100+ items)
- Pagination edge

### 🌟 Stretch goal

Research: when to use MSW vs Playwright native route? Read [MSW docs](https://mswjs.io/docs/) — cases each better.

---

## Next

[Day 19 — CI/CD với GitHub Actions →](./day-19-ci-cd.md)
