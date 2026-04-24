# Day 11 — Auth State (Storage State)

> **Goal:** Login 1 lần đầu, 100 tests sau reuse session. Giảm test suite từ 10 phút → 2 phút.
> **Thời gian:** 2 giờ

---

## Prerequisites

- Day 10 hoàn thành

---

## 1. Vấn đề

```typescript
// 100 tests, mỗi test login qua UI
test.beforeEach(async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login(user, pass); // 3-5s
});
// → suite mất 500s = 8 phút chỉ cho login
```

**Lý do chậm:**

- Load login page
- Type credentials
- Click button
- Redirect

**Lý do flaky:**

- Mỗi login = network call → retry hop lên

---

## 2. Giải pháp: Storage State

**Ý tưởng:**

1. Login 1 lần trong "setup project"
2. Browser lưu cookies + localStorage → file JSON
3. Tests khác load file đó → browser đã "sẵn login"

**Sơ đồ:**

```
[setup.ts] → login → save state.json
                         ↓
[test 1] ← load state.json ← starts as logged-in
[test 2] ← load state.json ← starts as logged-in
...
```

---

## 3. Setup project

### Step 1: Tạo auth setup test

**`tests/auth.setup.ts`:**

```typescript
import { test as setup } from '@playwright/test';
import { env } from '@config/env';
import { STORAGE_STATE } from '@config/constants';
import { LoginPage } from '@pages/login.page';
import * as fs from 'node:fs';
import * as path from 'node:path';

setup('authenticate as user', async ({ page }) => {
  // Ensure dir exists
  fs.mkdirSync(path.dirname(STORAGE_STATE.USER), { recursive: true });

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(env.TEST_USER_USERNAME, env.TEST_USER_PASSWORD);

  // Wait for redirect confirming login success
  await page.waitForURL(/.*inventory/);

  // Save auth state
  await page.context().storageState({ path: STORAGE_STATE.USER });
});

setup('authenticate as admin', async ({ page }) => {
  if (!env.ADMIN_USER_USERNAME) {
    setup.skip();
    return;
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(env.ADMIN_USER_USERNAME, env.ADMIN_USER_PASSWORD!);
  await page.waitForURL(/.*admin/);
  await page.context().storageState({ path: STORAGE_STATE.ADMIN });
});
```

### Step 2: Register trong playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';
import { STORAGE_STATE } from './src/config/constants';

export default defineConfig({
  testDir: './tests',

  projects: [
    // Setup runs first
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // UI tests use the saved state
    {
      name: 'chromium-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE.USER, // <-- magic
      },
      dependencies: ['setup'], // <-- chờ setup xong
      testIgnore: /auth\.setup\.ts/,
    },

    // Tests that need admin
    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE.ADMIN,
      },
      dependencies: ['setup'],
      testMatch: /.*admin.*\.spec\.ts/,
    },

    // Tests that need fresh session (login test itself)
    {
      name: 'chromium-fresh',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /login\.spec\.ts/,
    },
  ],
});
```

### Step 3: Test không cần login

```typescript
// tests/inventory.spec.ts
import { test, expect } from '@fixtures/index';

test('cart icon is visible', async ({ page }) => {
  await page.goto('/inventory.html');
  // Đã login rồi, access page trực tiếp
  await expect(page.locator('[data-test="shopping-cart-link"]')).toBeVisible();
});
```

---

## 4. Storage state bên trong là gì?

Sau khi save:

**`playwright/.auth/user.json`:**

```json
{
  "cookies": [
    {
      "name": "session_id",
      "value": "abc123...",
      "domain": ".saucedemo.com",
      "path": "/",
      "expires": 1758000000,
      "httpOnly": true,
      "secure": true,
      "sameSite": "Lax"
    }
  ],
  "origins": [
    {
      "origin": "https://www.saucedemo.com",
      "localStorage": [{ "name": "auth_token", "value": "xyz..." }]
    }
  ]
}
```

**Tip:** Mở file này khi debug để verify session lưu đúng.

---

## 5. Multi-user testing

### Cách 1: Multiple storage states

```typescript
projects: [
  { name: 'customer', use: { storageState: 'auth/customer.json' } },
  { name: 'admin', use: { storageState: 'auth/admin.json' } },
  { name: 'vendor', use: { storageState: 'auth/vendor.json' } },
];
```

### Cách 2: Test-level override

```typescript
test.use({ storageState: 'auth/admin.json' });

test('admin can delete user', async ({ page }) => {
  // Runs as admin regardless of default state
});
```

### Cách 3: Fresh session trong 1 test

```typescript
test.use({ storageState: { cookies: [], origins: [] } }); // empty state

test('login page shows', async ({ page }) => {
  await page.goto('/');
  // Không có session → sẽ thấy login form
});
```

---

## 6. API-based auth (nhanh hơn UI login)

Nếu backend support login API → dùng nó thay UI:

**`tests/auth.setup.ts` — version API:**

```typescript
setup('authenticate via API', async ({ request }) => {
  const response = await request.post('/api/login', {
    data: {
      username: env.TEST_USER_USERNAME,
      password: env.TEST_USER_PASSWORD,
    },
  });

  const { token } = await response.json();

  // Manually construct storage state
  const state = {
    cookies: [],
    origins: [
      {
        origin: env.BASE_URL,
        localStorage: [{ name: 'auth_token', value: token }],
      },
    ],
  };

  fs.writeFileSync(STORAGE_STATE.USER, JSON.stringify(state, null, 2));
});
```

API login: 100-500ms. UI login: 3-5s. **10-50x nhanh hơn.**

---

## 7. Caching & invalidation

### Khi nào cache cũ?

- Session expire (token hết hạn)
- Env đổi (dev → staging)
- User change password

### Strategy

```typescript
// tests/auth.setup.ts — check và re-login nếu cần
setup('authenticate', async ({ page, request }) => {
  const statePath = STORAGE_STATE.USER;

  if (fs.existsSync(statePath)) {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    const cookie = state.cookies.find((c) => c.name === 'session_id');
    if (cookie && cookie.expires > Date.now() / 1000 + 60) {
      console.log('Session still valid, skipping login');
      return;
    }
  }

  // Re-login
  await doLogin(page);
  await page.context().storageState({ path: statePath });
});
```

**Hoặc đơn giản:** Luôn chạy setup (overhead 1 login/suite không lớn).

---

## 8. Bài tập

### Bài 1: UI-based auth setup

Implement `tests/auth.setup.ts` cho saucedemo. Chạy test → verify `playwright/.auth/user.json` sinh ra.

### Bài 2: Multiple projects

Tạo 2 project: `standard-user` và `problem-user` (saucedemo user có bug UI). Mỗi project load state khác. Viết 2 tests trên `/inventory` → verify standard normal, problem có UI issue.

### Bài 3: Login page test không dùng state

Login page itself cần fresh session → tạo project `chromium-fresh` không có `storageState`, match file `login.spec.ts`.

### Bài 4: API auth (nếu app support)

Trên https://reqres.in (API có `/api/login`), implement API-based auth setup. Compare thời gian vs UI setup.

### Bài 5: Measure speedup

Chạy suite 10 tests với UI login mỗi test vs storage state. So sánh thời gian total.

---

## 9. Common Pitfalls

| Vấn đề                                 | Fix                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| Test vẫn thấy login page               | `storageState` path sai; hoặc file chưa tồn tại → check setup chạy chưa            |
| "Permission denied" writing state file | Folder `playwright/.auth/` chưa tạo → `mkdir` trong setup                          |
| Session expire giữa suite              | Tăng session timeout hoặc dùng fresh login mỗi test (trade-off)                    |
| CI chạy setup mỗi job                  | Cache `playwright/.auth/` giữa jobs hoặc accept cost                               |
| Commit `.auth/` file vào git           | `.gitignore`: `playwright/.auth/`                                                  |
| Multiple tests write cùng state → race | Setup project có 1 worker; hoặc worker-scoped fixture                              |
| Domain/cookie sai khi đổi env          | State có domain `dev.app.com` không work ở `staging.app.com` → mỗi env state riêng |

---

## 10. Checklist

- [ ] `tests/auth.setup.ts` viết xong
- [ ] `playwright.config.ts` có setup project + dependencies
- [ ] Storage state file sinh ra đúng `playwright/.auth/user.json`
- [ ] Test trên `/inventory` không cần login lại
- [ ] `.gitignore` có `playwright/.auth/`
- [ ] Login test itself dùng fresh session
- [ ] Commit: `feat: auth setup with storage state`
- [ ] NOTES.md: ghi thời gian tiết kiệm đo được

---

## Resources

- [Playwright — Authentication](https://playwright.dev/docs/auth)
- [Playwright — Global setup](https://playwright.dev/docs/test-global-setup-teardown)
- Video: search "Playwright storage state"

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Playwright Storage State Explained (official)](https://www.youtube.com/@Playwrightdev)
- [Speed up your tests with storage state](https://www.youtube.com/results?search_query=playwright+storage+state)
- [Multi-user auth patterns](https://www.youtube.com/results?search_query=playwright+multi+user+auth)

### 📝 Articles & blogs

- [Playwright — Authentication patterns](https://playwright.dev/docs/auth)
- [Session vs cookie-based auth](https://security.stackexchange.com/)
- [JWT best practices in testing](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-token-best-practices)
- [Storage state vs login API](https://dev.to/search?q=playwright+auth)

### 🎓 Auth protocols (understand what you're testing)

- [OAuth 2.0 explained](https://www.oauth.com/)
- [OpenID Connect](https://openid.net/developers/how-connect-works/)
- [SAML basics](https://developer.okta.com/docs/concepts/saml/)
- [JWT fundamentals](https://jwt.io/introduction)
- [SSO patterns](https://www.onelogin.com/learn/how-single-sign-on-works)

### 📖 Books

- _API Security in Action_ — Neil Madden (depth for testers)
- _OAuth 2 in Action_ — Justin Richer

### 🐙 Related GitHub repos

- [microsoft/playwright — auth examples](https://github.com/microsoft/playwright/tree/main/tests)
- [nextauthjs/next-auth](https://github.com/nextauthjs/next-auth) — see real auth flows
- [auth0/node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — JWT library

### 📊 Cheat sheets

- [Playwright storage state methods](https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state)
- [HTTP cookies cheatsheet](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [Auth headers quick ref](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (basic auth setup)

**B1.** UI-based auth setup — implement cho saucedemo. Verify `playwright/.auth/user.json` sinh ra với cookies.

**B2.** Multiple projects:

- `chromium-user` — uses `user.json`
- `chromium-admin` — uses `admin.json`
- `chromium-fresh` — no state (for login tests)

Config correctly. Run each project separately.

**B3.** Inspect saved state file:

```bash
cat playwright/.auth/user.json | jq
```

Understand structure: cookies, origins, localStorage.

### 🟡 Trung bình (API login, caching)

**M1.** API-based auth (nếu app support):

```typescript
setup("auth via API", async ({ request }) => {
  const res = await request.post("/api/login", { data: { ... } });
  const { token } = await res.json();
  // Manually construct storageState
  const state = {
    cookies: [],
    origins: [{
      origin: env.BASE_URL,
      localStorage: [{ name: "token", value: token }],
    }],
  };
  fs.writeFileSync("auth/user.json", JSON.stringify(state, null, 2));
});
```

Compare time: UI login vs API login (measure with `console.time`).

**M2.** Session caching — skip login nếu token còn valid:

```typescript
setup("conditional login", async ({ page }) => {
  if (isTokenValid(readState())) return;
  await doLogin(page);
  await page.context().storageState({ path: ... });
});
```

**M3.** Multi-user storage — 5 users khác nhau, 5 files state:

```typescript
for (const user of users) {
  await performLogin(user);
  await saveState(user.name);
}
```

**M4.** Per-test-fresh auth — some tests need clean session:

```typescript
test.use({ storageState: { cookies: [], origins: [] } });
test('login shows form', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Email')).toBeVisible();
});
```

### 🔴 Nâng cao (complex auth)

**A1.** OAuth flow automation — test với Google/GitHub OAuth:

- Browser automation trên OAuth consent screen
- Capture redirect + token
- Save state

**A2.** MFA (multi-factor auth) — simulate TOTP:

```typescript
import { TOTP } from 'otpauth';
const token = new TOTP({ secret: '...' }).generate();
await page.fill('#otp', token);
```

**A3.** JWT token refresh — test long-running sessions:

```typescript
// Monitor token expiry, refresh before expire
const cdpSession = await context.newCDPSession(page);
cdpSession.on('Network.responseReceived', (e) => {
  if (e.response.url.includes('/auth/refresh')) {
    console.log('Token refreshed');
  }
});
```

**A4.** Cross-domain auth — app dùng multiple domains (SSO):

```typescript
const state = await context.storageState();
// State contains cookies for multiple origins
```

### 🏆 Mini challenge (45 phút)

**Task:** "Auth Fixture Library" — auth patterns cho team.

Build:

1. `auth.setup.ts` — UI login (fallback)
2. `auth-api.setup.ts` — API login (fast path)
3. Fixture `authedAs(role)` — test.use dynamic
4. Token caching — check valid before re-login
5. Cleanup — logout trong teardown nếu cần

Example usage:

```typescript
test('admin sees dashboard', async ({ page }) => {
  await authedAs('admin');
  await page.goto('/admin');
  // ...
});

test('customer sees shop', async ({ page }) => {
  await authedAs('customer');
  await page.goto('/shop');
});
```

Requirements:

- Parallel safe
- Each worker 1 auth per role (worker-scoped)
- TypeScript strict

### 🌟 Stretch goal

Research "Session Hijacking Testing" — ethical security testing patterns. How to verify session token security via automation?

---

## Next

[Day 12 — API Testing →](./day-12-api-testing.md)
