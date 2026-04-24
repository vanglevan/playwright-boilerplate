# Day 12 — API Testing với Playwright

> **Goal:** Biết viết API tests (10-100x nhanh hơn UI), build typed API client, dùng Zod validate response schema.
> **Thời gian:** 3-4 giờ

---

## Prerequisites

- Day 10 (Zod) và Day 11 (auth state) hoàn thành

---

## 1. Tại sao cần API test

| Aspect                  | UI Test            | API Test        |
| ----------------------- | ------------------ | --------------- |
| Tốc độ                  | 3-10s/test         | 50-300ms/test   |
| Flakiness               | High (CSS, timing) | Low             |
| Setup cost              | Browser + login    | Chỉ HTTP client |
| Business logic coverage | Gián tiếp qua UI   | Direct          |
| UI regression           | Catch              | Miss            |

**Test pyramid khuyến nghị:**

- 70% unit (dev viết)
- 20% API integration
- 10% UI E2E (chỉ critical flow)

**Automation tester ngày nay phải biết cả 3.**

---

## 2. Playwright có `APIRequestContext` built-in

Không cần cài axios/node-fetch:

```typescript
test('create user via API', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: { name: 'Alice', email: 'alice@test.com' },
  });

  expect(response.ok()).toBeTruthy(); // status 200-299
  expect(response.status()).toBe(201);

  const user = await response.json();
  expect(user.id).toBeDefined();
});
```

**`request` fixture** — có sẵn, cùng baseURL với `page`.

---

## 3. HTTP methods

```typescript
// GET
const res = await request.get('/api/users/1');
const res2 = await request.get('/api/users', {
  params: { role: 'admin', limit: 10 },
});

// POST
const res = await request.post('/api/users', {
  data: { name: 'Alice' },
  headers: { Authorization: `Bearer ${token}` },
});

// PUT
await request.put('/api/users/1', { data: { name: 'Bob' } });

// PATCH
await request.patch('/api/users/1', { data: { status: 'active' } });

// DELETE
await request.delete('/api/users/1');

// Other
await request.head('/api/users/1');
```

---

## 4. Response methods

```typescript
const res = await request.get('/api/users');

res.ok(); // boolean: 2xx?
res.status(); // number
res.statusText(); // "OK"
res.headers(); // { "content-type": "application/json", ... }
res.url(); // resolved URL

await res.json(); // parse JSON
await res.text(); // raw string
await res.body(); // Buffer
```

---

## 5. Typed API Client pattern

Thay vì dùng `request` trực tiếp khắp nơi — xây wrapper.

### ApiClient

**`src/api/api-client.ts`:**

```typescript
import { APIRequestContext, APIResponse } from '@playwright/test';
import { childLogger } from '@helpers/logger';

const log = childLogger('ApiClient');

export type Result<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async get<T>(path: string, params?: Record<string, string | number>): Promise<Result<T>> {
    log.debug({ path, params }, 'GET');
    const res = await this.request.get(path, { params });
    return this.handle<T>(res);
  }

  async post<T>(path: string, data: unknown): Promise<Result<T>> {
    log.debug({ path }, 'POST');
    const res = await this.request.post(path, { data });
    return this.handle<T>(res);
  }

  async put<T>(path: string, data: unknown): Promise<Result<T>> {
    const res = await this.request.put(path, { data });
    return this.handle<T>(res);
  }

  async delete(path: string): Promise<Result<void>> {
    const res = await this.request.delete(path);
    return this.handle<void>(res);
  }

  private async handle<T>(res: APIResponse): Promise<Result<T>> {
    if (res.ok()) {
      const text = await res.text();
      const data = text ? (JSON.parse(text) as T) : (undefined as T);
      return { ok: true, data };
    }
    const error = await res.text().catch(() => '<unreadable>');
    return { ok: false, status: res.status(), error };
  }
}

// Helper: unwrap or throw
export function unwrap<T>(result: Result<T>): T {
  if (!result.ok) {
    throw new Error(`API call failed (${result.status}): ${result.error}`);
  }
  return result.data;
}
```

### Endpoint module

**`src/api/endpoints/users.ts`:**

```typescript
import { z } from 'zod';
import { ApiClient, unwrap } from '../api-client';

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const UserListSchema = z.array(UserSchema);

export class UsersApi {
  constructor(private readonly client: ApiClient) {}

  async list(): Promise<User[]> {
    const result = await this.client.get<unknown>('/api/users');
    const data = unwrap(result);
    return UserListSchema.parse(data);
  }

  async get(id: number): Promise<User> {
    const result = await this.client.get<unknown>(`/api/users/${id}`);
    return UserSchema.parse(unwrap(result));
  }

  async create(body: Omit<User, 'id'>): Promise<User> {
    const result = await this.client.post<unknown>('/api/users', body);
    return UserSchema.parse(unwrap(result));
  }

  async delete(id: number): Promise<void> {
    const result = await this.client.delete(`/api/users/${id}`);
    unwrap(result);
  }
}
```

### Fixture

**`src/fixtures/api.fixture.ts`:**

```typescript
import { test as base, request } from '@playwright/test';
import { ApiClient } from '@api/api-client';
import { UsersApi } from '@api/endpoints/users';
import { env } from '@config/env';

type ApiFixtures = {
  apiClient: ApiClient;
  usersApi: UsersApi;
};

export const test = base.extend<ApiFixtures>({
  apiClient: async ({}, use) => {
    const context = await request.newContext({
      baseURL: env.API_BASE_URL,
      extraHTTPHeaders: env.API_TOKEN ? { Authorization: `Bearer ${env.API_TOKEN}` } : undefined,
    });
    await use(new ApiClient(context));
    await context.dispose();
  },

  usersApi: async ({ apiClient }, use) => {
    await use(new UsersApi(apiClient));
  },
});
```

### Test file

**`tests/api/users.api.spec.ts`:**

```typescript
import { test, expect } from '@fixtures/index';

test.describe('Users API', () => {
  test('list returns users', async ({ usersApi }) => {
    const users = await usersApi.list();
    expect(users.length).toBeGreaterThan(0);
  });

  test('get returns single user with valid schema', async ({ usersApi }) => {
    const user = await usersApi.get(1); // Zod already validated
    expect(user.id).toBe(1);
  });

  test('create user succeeds', async ({ usersApi }) => {
    const newUser = await usersApi.create({
      name: 'Test User',
      email: 'test@example.com',
    });
    expect(newUser.id).toBeGreaterThan(0);
  });

  test('get non-existent user returns 404', async ({ apiClient }) => {
    const result = await apiClient.get<unknown>('/api/users/99999');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(404);
    }
  });
});
```

---

## 6. Authentication patterns

### Bearer token (từ env)

```typescript
const context = await request.newContext({
  extraHTTPHeaders: {
    Authorization: `Bearer ${env.API_TOKEN}`,
  },
});
```

### Login → get token → inject

```typescript
const loginRes = await request.post('/api/login', {
  data: { username, password },
});
const { token } = await loginRes.json();

const authedContext = await request.newContext({
  extraHTTPHeaders: { Authorization: `Bearer ${token}` },
});
```

### Basic auth

```typescript
const context = await request.newContext({
  httpCredentials: {
    username: 'user',
    password: 'pass',
  },
});
```

---

## 7. API + UI kết hợp

**Pattern: Setup data qua API, verify qua UI**

```typescript
test("new order appears on dashboard", async ({ page, ordersApi }) => {
  // Fast: Create via API
  const order = await ordersApi.create({ ... });

  // Verify: UI renders correctly
  await page.goto("/orders");
  await expect(page.getByText(order.orderNumber)).toBeVisible();

  // Cleanup
  await ordersApi.delete(order.id);
});
```

**Tiết kiệm thời gian:** Thay vì click 10 buttons để tạo order → API 1 call.

---

## 8. Response schema validation với Zod

**Tại sao:**

- Backend thay đổi response → test catch ngay
- Không phải check field-by-field
- Type-safe: `user.email` autocomplete trong IDE

**Pattern:**

```typescript
export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
});

// In test:
const result = await productsApi.get(id);
ProductSchema.parse(result); // throws if shape mismatch
// now `result` is typed as Product
```

**Z parse vs safeParse:**

- `.parse()` — throw on error (test fail)
- `.safeParse()` — return `{ success, data, error }` — tự handle

---

## 9. Practice APIs (public, free)

| API             | Base URL                               | Purpose                 |
| --------------- | -------------------------------------- | ----------------------- |
| JSONPlaceholder | `https://jsonplaceholder.typicode.com` | Fake REST, đủ GET/POST  |
| Reqres          | `https://reqres.in/api`                | Login + CRUD, realistic |
| Restful-API.dev | `https://api.restful-api.dev`          | Simple objects CRUD     |
| DummyJSON       | `https://dummyjson.com`                | Products, users, auth   |

---

## 10. Bài tập

### Bài 1: Build ApiClient

Copy pattern trên, adapt cho repo của bạn.

### Bài 2: Test CRUD trên reqres.in

5 tests:

1. `GET /users` — list trả 6 users
2. `GET /users/2` — single user với schema Zod
3. `POST /users` — tạo user, assert response
4. `PUT /users/2` — update, verify
5. `DELETE /users/2` — expect 204

### Bài 3: Auth flow

Trên reqres.in:

1. `POST /login` với `{"email": "eve.holt@reqres.in", "password": "cityslicka"}`
2. Save token
3. Subsequent requests include token

### Bài 4: API + UI hybrid

Trên saucedemo (nếu có API) hoặc bất cứ app nào:

- Create data qua API
- Navigate UI page list
- Verify data hiện
- Delete qua API (cleanup)

### Bài 5: Zod schema

Viết schema cho response của `/api/users`. Chạy test. Cố tình thay Schema (đổi `name` thành `z.number()`) → test phải fail với message rõ.

---

## 11. Common Pitfalls

| Vấn đề                             | Fix                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `request.get()` không nhận baseURL | Trong `playwright.config.ts` set `use.baseURL` hoặc `extraHTTPHeaders.host` |
| Context leak (quên dispose)        | Fixture cleanup: `await context.dispose()` sau `use()`                      |
| Zod parse fail với nullable field  | `z.string().nullable()` hoặc `z.string().optional()` tuỳ                    |
| Test chạy OK nhưng log rác         | Set logger level `warn` ở prod env                                          |
| API call chậm (3+ seconds)         | Có thể là DNS, CDN, cold start — set timeout `{ timeout: 30000 }`           |
| Cookie-based session không work    | Lưu `context.storageState()` sau login API                                  |
| Race condition khi parallel create | Dùng unique email per test (Day 9 faker)                                    |

---

## 12. Advanced: Custom matchers

```typescript
// utils/schema-matcher.ts
import { expect as baseExpect } from '@playwright/test';
import { z } from 'zod';

export const expect = baseExpect.extend({
  toMatchSchema(received: unknown, schema: z.ZodSchema) {
    const result = schema.safeParse(received);
    return {
      pass: result.success,
      message: () =>
        result.success
          ? 'Schema matched'
          : `Schema mismatch:\n${JSON.stringify(result.error.format(), null, 2)}`,
    };
  },
});

// Usage:
expect(responseData).toMatchSchema(UserSchema);
```

---

## 13. Checklist

- [ ] `src/api/api-client.ts` với Result type
- [ ] `src/api/endpoints/users.ts` với Zod schema
- [ ] `src/fixtures/api.fixture.ts` với typed ApiClient
- [ ] 5 tests API trên reqres.in pass
- [ ] API + UI test hybrid chạy
- [ ] Zod schema catch schema mismatch
- [ ] Commit: `feat: api testing layer with typed client`
- [ ] NOTES.md: so sánh thời gian API test vs UI test đo được

---

## Resources

- [Playwright — API Testing](https://playwright.dev/docs/api-testing)
- [Playwright — APIRequestContext](https://playwright.dev/docs/api/class-apirequestcontext)
- [Zod docs](https://zod.dev/)
- [HTTP status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [API Testing with Playwright](https://www.youtube.com/results?search_query=playwright+api+testing)
- [REST API testing best practices](https://www.youtube.com/results?search_query=REST+api+testing+best+practices)
- [GraphQL testing with Playwright](https://www.youtube.com/results?search_query=playwright+graphql)
- [Contract testing explained (Pact)](https://www.youtube.com/results?search_query=contract+testing+pact)

### 📝 Articles & blogs

- [Playwright API Testing Guide](https://playwright.dev/docs/api-testing)
- [Martin Fowler — Integration Tests](https://martinfowler.com/bliki/IntegrationTest.html)
- [Testing Pyramid vs Honeycomb](https://engineering.atspotify.com/2018/01/testing-of-microservices/)
- [Idempotent API testing](https://dev.to/search?q=idempotent+testing)
- [Postman to Playwright migration](https://medium.com/search?q=postman+to+playwright)

### 🎓 Deep learning

- [OpenAPI / Swagger spec](https://swagger.io/specification/)
- [REST API design guide (Microsoft)](https://github.com/microsoft/api-guidelines)
- [GraphQL docs](https://graphql.org/learn/)
- [Pact contract testing](https://docs.pact.io/)

### 📖 Books

- _API Design Patterns_ — JJ Geewax
- _Building Microservices_ — Sam Newman
- _REST API Design Rulebook_ — Mark Massé

### 🐙 Related GitHub repos

- [microsoft/playwright — API examples](https://github.com/microsoft/playwright/tree/main/tests)
- [pactflow/example-consumer-playwright](https://github.com/pactflow) — contract testing
- [colinhacks/zod — schema examples](https://github.com/colinhacks/zod#table-of-contents)
- [Rich-Harris/devalue](https://github.com/Rich-Harris/devalue) — handle complex JSON

### 📊 Cheat sheets

- [HTTP status codes table](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [REST verbs semantics (GET/POST/PUT/PATCH/DELETE)](https://restfulapi.net/http-methods/)
- [Zod common patterns](https://zod.dev/?id=basic-usage)

### 🛠️ Practice APIs (free, public)

- [JSONPlaceholder](https://jsonplaceholder.typicode.com/) — fake REST
- [Reqres](https://reqres.in/) — auth + CRUD
- [DummyJSON](https://dummyjson.com/) — comprehensive
- [Fake Store API](https://fakestoreapi.com/) — e-commerce
- [Rick and Morty API](https://rickandmortyapi.com/) — fun, GraphQL + REST

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (HTTP verbs)

**B1.** CRUD trên reqres.in:

- `GET /users` — list
- `GET /users/2` — single
- `POST /users` — create
- `PUT /users/2` — full update
- `PATCH /users/2` — partial (nếu support)
- `DELETE /users/2`

Assert status code + response shape mỗi lệnh.

**B2.** Error cases:

- GET /users/99999 → 404
- POST /users with invalid body → 400
- Unauthorized call → 401/403

**B3.** Query params + headers:

```typescript
await request.get('/users', {
  params: { page: 2, per_page: 5 },
  headers: { 'x-api-version': 'v2' },
});
```

### 🟡 Trung bình (typed client, Zod)

**M1.** Build typed ApiClient:

```typescript
class ApiClient {
  async get<T>(path, params?): Promise<Result<T>>;
  async post<T>(path, body): Promise<Result<T>>;
  // ...
}
```

Result type (discriminated union) — Day 1 knowledge applied.

**M2.** Zod schemas for all endpoints:

```typescript
const UserSchema = z.object({ id: z.number(), name: z.string(), email: z.string().email() });
const UserListResponse = z.object({ data: z.array(UserSchema), total: z.number() });

// In test:
const parsed = UserListResponse.parse(await res.json());
// parsed is typed, validated
```

**M3.** Endpoint module pattern:

```typescript
class UsersApi {
  constructor(private client: ApiClient) {}

  async list(): Promise<User[]> { ... }
  async get(id: number): Promise<User> { ... }
  async create(data: NewUser): Promise<User> { ... }
}
```

**M4.** Fixture cho auth-aware API:

```typescript
apiClient: async ({}, use) => {
  const context = await request.newContext({
    baseURL: env.API_BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${env.API_TOKEN}`,
    },
  });
  await use(new ApiClient(context));
  await context.dispose();
},
```

### 🔴 Nâng cao (advanced)

**A1.** GraphQL queries:

```typescript
const res = await request.post('/graphql', {
  data: {
    query: `query { user(id: 1) { name email } }`,
  },
});
```

Try với [countries API](https://countries.trevorblades.com/).

**A2.** File upload:

```typescript
await request.post('/upload', {
  multipart: {
    file: fs.createReadStream('./file.pdf'),
  },
});
```

**A3.** Streaming response:

```typescript
const res = await request.get('/sse-endpoint');
const body = await res.text();
// Parse SSE events
```

**A4.** API + UI combo test:

```typescript
test('new order appears in UI', async ({ page, ordersApi }) => {
  const order = await ordersApi.create(data); // Fast via API
  await page.goto('/orders'); // Verify via UI
  await expect(page.getByText(order.number)).toBeVisible();
  await ordersApi.delete(order.id); // Cleanup
});
```

Benefit: Test UI without slow manual setup.

### 🏆 Mini challenge (60 phút)

**Task:** Full API suite cho [DummyJSON](https://dummyjson.com):

Build (`src/api/` folder):

- `ApiClient` class (typed, Zod, disposable)
- Endpoints:
  - `UsersApi` (list, get, create, update, delete)
  - `ProductsApi` (list, get, search, categories)
  - `CartsApi` (list, get, add, update, delete)
  - `AuthApi` (login, refresh)

Zod schemas for all response types.

Tests (≥ 15):

- CRUD happy path mỗi endpoint
- Error cases
- Schema validation
- Auth flow

Quality:

- 100% TypeScript strict
- No `any`
- Each test <500ms

### 🌟 Stretch goal

Build contract test với [Pact](https://docs.pact.io/). Consumer-driven testing 1 endpoint.

---

## Next

[Day 13 — Parallelization, Sharding, Retries →](./day-13-parallel-sharding.md)
