# Day 10 — Environment Config + Zod Validation

> **Goal:** Tests chạy được trên dev/staging/prod cùng code, khác URL/credentials. Validate env bằng Zod — fail fast nếu config sai.
> **Thời gian:** 2-3 giờ

---

## Prerequisites

- Day 8-9 hoàn thành

---

## 1. Vấn đề

**Đoạn code xấu:**

```typescript
await page.goto('https://dev-myapp.com'); // hardcoded URL
await loginPage.login('test@test.com', 'test123'); // hardcoded creds
```

Muốn chạy trên staging → sửa tay. Muốn xoá creds → commit lịch sử còn.

**Target:** `TEST_ENV=staging npm test` → tự lấy URL và creds staging.

---

## 2. `.env` files

**`.env.example`** (commit vào git, template):

```bash
TEST_ENV=dev
BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api
TEST_USER_USERNAME=
TEST_USER_PASSWORD=
ADMIN_USER_USERNAME=
ADMIN_USER_PASSWORD=
API_TOKEN=
LOG_LEVEL=info
HEADLESS=true
```

**`.env.dev`** (KHÔNG commit):

```bash
TEST_ENV=dev
BASE_URL=https://dev.myapp.com
API_BASE_URL=https://dev.myapp.com/api
TEST_USER_USERNAME=dev-user
TEST_USER_PASSWORD=DevPass123
ADMIN_USER_USERNAME=dev-admin
ADMIN_USER_PASSWORD=AdminDev123
API_TOKEN=dev-xxxx
LOG_LEVEL=debug
HEADLESS=true
```

**`.env.staging`**, **`.env.prod`** tương tự.

**`.gitignore`** — MUST:

```
.env
.env.*
!.env.example
```

---

## 3. Cài dotenv + zod

```bash
npm i -D dotenv zod
```

---

## 4. Config module with Zod validation

**`src/config/env.ts`:**

```typescript
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
import { z } from 'zod';

// Step 1: Load .env based on TEST_ENV
const testEnv = process.env.TEST_ENV || 'dev';
const envFile = `.env.${testEnv}`;
const envPath = path.resolve(process.cwd(), envFile);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`✓ Loaded env from ${envFile}`);
} else {
  // Fallback
  dotenv.config();
  console.warn(`⚠ ${envFile} not found, using .env or process.env`);
}

// Step 2: Define schema
const envSchema = z.object({
  TEST_ENV: z.enum(['dev', 'staging', 'prod']).default('dev'),

  BASE_URL: z.string().url(),
  API_BASE_URL: z.string().url(),

  TEST_USER_USERNAME: z.string().min(1),
  TEST_USER_PASSWORD: z.string().min(1),

  ADMIN_USER_USERNAME: z.string().min(1).optional(),
  ADMIN_USER_PASSWORD: z.string().min(1).optional(),

  API_TOKEN: z.string().optional(),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  HEADLESS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),

  ACTION_TIMEOUT_MS: z.coerce.number().default(15_000),
  NAV_TIMEOUT_MS: z.coerce.number().default(30_000),
  EXPECT_TIMEOUT_MS: z.coerce.number().default(10_000),
});

// Step 3: Parse & validate
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(parsed.error.format());
  process.exit(1);
}

// Step 4: Export typed object
export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
```

**Lợi ích:**

- Typed: `env.BASE_URL` autocomplete, không sợ typo
- Fail fast: thiếu biến → exit(1) với lỗi rõ
- Default: có giá trị mặc định
- Transform: `"true"` → `true` bool

---

## 5. Config constants

**`src/config/constants.ts`:**

```typescript
export const TAGS = {
  SMOKE: '@smoke',
  REGRESSION: '@regression',
  CRITICAL: '@critical',
  SLOW: '@slow',
} as const;

export const STORAGE_STATE = {
  USER: 'playwright/.auth/user.json',
  ADMIN: 'playwright/.auth/admin.json',
} as const;

export const REPORT_DIRS = {
  HTML: 'playwright-report',
  ALLURE: 'allure-results',
  RESULTS: 'test-results',
} as const;

export const SELECTORS = {
  TEST_ID: 'data-testid',
} as const;
```

---

## 6. Use env trong config & tests

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

export default defineConfig({
  testDir: './tests',

  timeout: 60_000,
  expect: { timeout: env.EXPECT_TIMEOUT_MS },

  use: {
    baseURL: env.BASE_URL,
    headless: env.HEADLESS,
    actionTimeout: env.ACTION_TIMEOUT_MS,
    navigationTimeout: env.NAV_TIMEOUT_MS,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  metadata: {
    environment: env.TEST_ENV,
    baseURL: env.BASE_URL,
  },
});
```

### Test files

```typescript
import { env } from '@config/env';

test('admin dashboard', async ({ page }) => {
  await page.goto('/admin');
  // (baseURL automatic thêm prefix)

  // Hoặc access env trực tiếp:
  console.log(`Testing on: ${env.TEST_ENV}`);
});
```

### Auth fixture dùng env

```typescript
// src/fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';
import { env } from '@config/env';

type Auth = {
  testUser: { username: string; password: string };
  adminUser: { username: string; password: string };
};

export const test = base.extend<Auth>({
  testUser: async ({}, use) => {
    await use({
      username: env.TEST_USER_USERNAME,
      password: env.TEST_USER_PASSWORD,
    });
  },

  adminUser: async ({}, use) => {
    if (!env.ADMIN_USER_USERNAME || !env.ADMIN_USER_PASSWORD) {
      throw new Error('Admin credentials not configured for this environment');
    }
    await use({
      username: env.ADMIN_USER_USERNAME,
      password: env.ADMIN_USER_PASSWORD,
    });
  },
});
```

---

## 7. Scripts npm cho nhiều env

**`package.json`:**

```json
"scripts": {
  "test": "TEST_ENV=dev playwright test",
  "test:dev": "TEST_ENV=dev playwright test",
  "test:staging": "TEST_ENV=staging playwright test",
  "test:prod": "TEST_ENV=prod playwright test --grep @smoke",
  "test:ui": "TEST_ENV=dev playwright test --ui"
}
```

**Windows (nếu cần):**

```bash
# Cross-platform:
npm i -D cross-env
```

```json
"test:staging": "cross-env TEST_ENV=staging playwright test"
```

---

## 8. Bảo mật credentials

### ❌ KHÔNG làm

- Commit `.env.dev` vào git
- Share creds qua Slack/email
- Log `env.PASSWORD` trong console

### ✅ Làm

- `.env.*` trong `.gitignore`
- CI: inject creds qua GitHub Secrets / Jenkins credentials
- Dev share qua tool (1Password, LastPass shared vault)
- Log KHÔNG include password (mask nếu cần)

### GitHub Actions example

```yaml
# .github/workflows/playwright.yml
env:
  TEST_ENV: staging
  BASE_URL: ${{ secrets.STAGING_BASE_URL }}
  TEST_USER_USERNAME: ${{ secrets.STAGING_USER }}
  TEST_USER_PASSWORD: ${{ secrets.STAGING_PASS }}
```

---

## 9. Logger helper

**`src/helpers/logger.ts`:**

```typescript
import pino from 'pino';
import { env } from '@config/env';

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    },
  },
});

export function childLogger(scope: string) {
  return logger.child({ scope });
}
```

**Cài:**

```bash
npm i -D pino pino-pretty
```

**Usage:**

```typescript
import { childLogger } from '@helpers/logger';

const log = childLogger('LoginPage');
log.info({ user: 'test' }, 'Logging in'); // [INFO] Logging in { user: "test" }
log.debug('Extra detail');
```

---

## 10. Bài tập

### Bài 1: Full setup

Setup đầy đủ: `.env.dev`, `.env.staging`, `.env.example`, `src/config/env.ts` với Zod.

### Bài 2: Test validation

Xoá `BASE_URL` trong `.env.dev` → chạy `npm test` → expect: exit với error rõ ràng.

### Bài 3: Switch env

```bash
TEST_ENV=staging npm test  # đảm bảo chạy vào staging URL
```

### Bài 4: Config test với different timeout per env

Dev: 15s. Prod: 30s (network chậm). Verify bằng env.

### Bài 5: Logger

Thêm log trong LoginPage.login():

```typescript
log.info({ username }, 'Login attempt');
```

Chạy test → thấy log colorized.

---

## 11. Common Pitfalls

| Vấn đề                            | Fix                                               |
| --------------------------------- | ------------------------------------------------- |
| `Cannot find module 'dotenv'`     | `npm i -D dotenv`                                 |
| env validation fail on CI         | CI secrets chưa set; hoặc env name khác           |
| `process.env.X` là `undefined`    | dotenv load trước khi access `process.env`        |
| Merge branch commit `.env.dev`    | Force remove: `git rm --cached .env.dev`          |
| Zod `z.coerce.number()` fail      | Value env string không convert được → check value |
| Cross-platform env var không work | Dùng `cross-env` trong npm scripts                |
| Windows `set` vs Mac `export`     | `cross-env` giải quyết                            |

---

## 12. Checklist

- [ ] `.env.example` commit, `.env.*` ignored
- [ ] `src/config/env.ts` với Zod schema
- [ ] 3 env files: dev / staging / prod
- [ ] `playwright.config.ts` dùng `env.BASE_URL`
- [ ] Scripts npm: test:dev, test:staging
- [ ] Logger setup với pino-pretty
- [ ] Commit: `feat: multi-environment config with zod validation`
- [ ] NOTES.md: ghi lý do Zod > TS types cho env

---

## Resources

- [Zod docs](https://zod.dev/)
- [dotenv docs](https://github.com/motdotla/dotenv)
- [pino docs](https://getpino.io/)
- [12-factor: Config](https://12factor.net/config)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Zod in 100 seconds (Fireship)](https://www.youtube.com/watch?v=L6BE-U3oy80)
- [Environment variables best practices](https://www.youtube.com/results?search_query=env+variables+nodejs+best+practices)
- [The 12-factor app explained](https://www.youtube.com/results?search_query=12+factor+app)

### 📝 Articles & blogs

- [12-Factor App: Config](https://12factor.net/config) — canonical
- [Zod vs Joi vs Yup comparison](https://dev.to/search?q=zod+vs+joi)
- [dotenv best practices](https://www.npmjs.com/package/dotenv)
- [Secrets management 101](https://www.doppler.com/blog/managing-env-vars)
- [Pino vs Winston vs Bunyan](https://betterstack.com/community/guides/logging/best-nodejs-logging-libraries/)

### 🎓 Advanced topics

- [dotenv-vault](https://www.dotenv.org/docs/quickstart/env-vault) — encrypted .env
- [Managing secrets in CI](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [HashiCorp Vault](https://www.vaultproject.io/) — enterprise secrets
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)

### 📖 Books

- _The Twelve-Factor App_ — free online methodology
- _Continuous Delivery_ — Humble & Farley (config chapters)

### 🐙 Related GitHub repos

- [colinhacks/zod](https://github.com/colinhacks/zod) — source + examples
- [motdotla/dotenv](https://github.com/motdotla/dotenv)
- [pinojs/pino](https://github.com/pinojs/pino) — fast JSON logger
- [znck/schema](https://github.com/znck/schema) — zod alternatives
- [ducaale/xh](https://github.com/ducaale/xh) — env var inspection CLI

### 📊 Cheat sheets

- [Zod schema cheatsheet](https://github.com/colinhacks/zod#table-of-contents)
- [dotenv common patterns](https://github.com/motdotla/dotenv#readme)
- [pino logger config](https://getpino.io/#/docs/api)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (env setup)

**B1.** Tạo đầy đủ 4 files:

- `.env.example` (committed)
- `.env.dev` (local)
- `.env.staging`
- `.env.prod`

Populate values (fake prod of course). `.gitignore` chặn `.env.*` trừ example.

**B2.** Zod schema cho:

- `BASE_URL` (URL)
- `TEST_USER_USERNAME` (string, ≥1 char)
- `TEST_USER_PASSWORD` (string, ≥1 char)
- `TIMEOUT_MS` (number, coerced from string)
- `HEADLESS` (boolean, coerced from "true"/"false")

Break 1 value trong `.env.dev` (e.g., `BASE_URL=notaurl`) → chạy → verify clear error message.

**B3.** Run các env khác nhau:

```bash
TEST_ENV=dev npm test
TEST_ENV=staging npm test
```

Verify baseURL khác, credentials khác.

### 🟡 Trung bình (nested, transform, CI)

**M1.** Nested config object:

```typescript
const schema = z.object({
  test: z.object({
    user: z.object({
      username: z.string(),
      password: z.string(),
    }),
    admin: z
      .object({
        username: z.string(),
        password: z.string(),
      })
      .optional(),
  }),
  api: z.object({
    baseUrl: z.string().url(),
    token: z.string().optional(),
  }),
});
```

Load từ env với prefix: `TEST_USER_USERNAME` → `test.user.username`.

**M2.** Derived values — timeouts scale theo env:

```typescript
const derivedTimeouts = {
  action: env.TEST_ENV === 'prod' ? 30_000 : 15_000,
  nav: env.TEST_ENV === 'prod' ? 60_000 : 30_000,
};
```

**M3.** Secret masking — logger không log password:

```typescript
const safeConfig = {
  ...env,
  TEST_USER_PASSWORD: '***',
  API_TOKEN: env.API_TOKEN ? '***' : undefined,
};
log.info(safeConfig, 'Loaded config');
```

**M4.** CI integration:
GitHub Secrets → env vars:

```yaml
env:
  TEST_ENV: staging
  BASE_URL: ${{ secrets.STAGING_BASE_URL }}
  TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASS }}
```

Local dev dùng `.env.dev`, CI dùng secrets. Same code.

### 🔴 Nâng cao (production patterns)

**A1.** Multi-source config — priority order:

1. Process env (highest) — CI secrets
2. `.env.${TEST_ENV}` — local env-specific
3. `.env` — common defaults
4. Schema defaults (lowest)

Implement với `dotenv.config({ path })` multiple times.

**A2.** Encrypted `.env` — setup dotenv-vault hoặc git-crypt. Team share secrets safely.

**A3.** Runtime config reload — watch `.env` changes trong dev mode:

```typescript
import { watch } from 'node:fs';
watch('.env.dev', () => reloadConfig());
```

Advanced pattern, usually overkill for test runner.

**A4.** Config validator CLI:

```bash
npm run config:validate
# Chạy zod parse + print issues nếu có
```

Dùng trong CI pre-test.

### 🏆 Mini challenge (45 phút)

**Task:** "Zero-config-mistake" setup — bulletproof env config.

Requirements:

1. Zod schema validate 15+ env vars
2. Fail-fast với error rõ (path + expected type + received)
3. Support 3 envs: dev, staging, prod
4. Secrets never logged
5. Types exported for IDE autocomplete
6. CI-ready (works with GitHub Secrets)
7. `.env.example` auto-generated from schema (stretch)

Deliverable: `src/config/env.ts` + `.env.example` + docs section in README.

### 🌟 Stretch goal

Read [Nx enterprise env management](https://nx.dev/) — how Nx workspaces handle per-app env config at scale.

---

## Next

[Day 11 — Auth State (Storage State) →](./day-11-auth-state.md)
