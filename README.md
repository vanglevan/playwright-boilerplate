# Playwright Boilerplate

Production-grade automation boilerplate built around **Playwright Test** with TypeScript. Designed for teams that want one repo to cover **E2E, API, Visual, Accessibility, Performance and Mobile** testing — across multiple environments — with strong typing, fixture-based architecture, and first-class CI on **GitHub Actions** and **Jenkins**.

---

## Highlights

- **TypeScript strict mode** + path aliases (`@pages`, `@components`, `@fixtures`, `@api`, `@helpers`, `@config`, `@data`, `@app-types`).
- **Fixture-based architecture** (Playwright modern best practice) — `mergeTests` combining Page Objects, API clients, and Auth fixtures.
- **Component Object pattern** for reusable widgets (header, modal, table row...).
- **Multi-environment** via `.env.<env>` files + Zod-validated runtime env loader.
- **Multi-reporter**: HTML, Allure, Monocart, JUnit, Blob (for shard merging), GitHub annotations.
- **Cross-browser × cross-form-factor** projects: Chromium / Firefox / WebKit / Pixel 7 / iPhone 14.
- **Storage-state auth** via a `setup` project — log in once, reuse across all UI specs.
- **CI for GitHub Actions and Jenkins** — both with **shard parallelism + report merging**.
- **Linting + formatting + commit hygiene**: ESLint flat config, Prettier, Husky, Commitlint (Conventional Commits), lint-staged.
- **Docker** image based on the official Playwright container for local-CI parity.

---

## Tech stack

| Layer          | Choice                                                               |
| -------------- | -------------------------------------------------------------------- |
| Test runner    | `@playwright/test`                                                   |
| Language       | TypeScript 5 (strict)                                                |
| Test data      | Static JSON fixtures + `@faker-js/faker`                             |
| Env validation | `dotenv` + `zod`                                                     |
| Logging        | `pino` + `pino-pretty`                                               |
| Accessibility  | `@axe-core/playwright`                                               |
| Reports        | HTML · Allure · Monocart · JUnit · Blob                              |
| Lint / format  | ESLint 9 (flat) + Prettier + `eslint-plugin-playwright`              |
| Git hygiene    | Husky + lint-staged + commitlint (`@commitlint/config-conventional`) |
| CI             | GitHub Actions (matrix sharding) + Jenkins (declarative pipeline)    |

---

## Project structure

```
.
├── src/
│   ├── api/              # Typed API client + endpoint modules
│   │   ├── api-client.ts
│   │   └── endpoints/
│   ├── components/       # Component Objects (scoped to a Locator root)
│   │   ├── base.component.ts
│   │   └── header.component.ts
│   ├── pages/            # Page Objects (own a path + waitUntilLoaded)
│   │   ├── base.page.ts
│   │   ├── home.page.ts
│   │   ├── login.page.ts
│   │   └── playwright-docs.page.ts
│   ├── fixtures/         # Custom test fixtures (mergeTests)
│   │   ├── pages.fixture.ts
│   │   ├── api.fixture.ts
│   │   ├── auth.fixture.ts
│   │   └── index.ts      # ← `import { test, expect } from '@fixtures/index'`
│   ├── helpers/          # Logger, faker wrappers, wait utilities, step decorator
│   ├── config/           # Env loader (Zod), constants
│   ├── data/             # Static JSON test data
│   └── types/            # Shared TS types (re-exported as @app-types/*)
│
├── tests/
│   ├── auth.setup.ts     # Storage-state authentication (runs once)
│   ├── auth.teardown.ts  # Cleans storage state
│   ├── e2e/              # E2E specs (per-page or per-flow)
│   ├── api/              # API-only specs (no browser)
│   ├── visual/           # Visual regression (with __snapshots__)
│   ├── a11y/             # Accessibility (axe-core)
│   └── performance/      # Perf budgets (PerformanceTiming + paints)
│
├── .github/workflows/playwright.yml   # GitHub Actions: lint → 4-shard test → merge
├── Jenkinsfile                        # Declarative Jenkins pipeline w/ sharding
├── Dockerfile                         # Pinned to mcr.microsoft.com/playwright
├── playwright.config.ts               # All projects + reporter matrix
├── tsconfig.json                      # Strict + path aliases
├── eslint.config.mjs                  # ESLint 9 flat config (TS + Playwright + Prettier)
├── commitlint.config.cjs              # Conventional Commits
├── .env.example  .env.dev  .env.staging  .env.prod
└── package.json
```

---

## Getting started

```bash
# 1. Use the right Node version (20+).
nvm use

# 2. Install deps + browsers.
npm ci
npm run install:browsers

# 3. Pick an environment and run.
TEST_ENV=dev npm test
```

### Useful scripts

```bash
# Run by test type
npm run test:e2e
npm run test:api
npm run test:visual
npm run test:a11y
npm run test:perf
npm run test:mobile
npm run test:cross-browser

# By tag (uses Playwright --grep)
npm run test:smoke
npm run test:regression

# Interactive / debug
npm run test:ui          # Playwright UI mode
npm run test:debug       # PWDEBUG=1
npm run test:headed
npm run codegen          # `playwright codegen $BASE_URL`

# Visual snapshots
npm run test:update-snapshots

# Sharded run locally: SHARD=1/4 npm run test:shard
SHARD=1/4 npm run test:shard

# Reports
npm run report:html              # Opens last HTML report
npm run report:allure:serve      # Builds + serves Allure (live)
npm run report:allure:generate   # Static Allure HTML
npm run report:merge             # Merge blob reports into one HTML

# Quality gates
npm run typecheck
npm run lint
npm run format
npm run verify     # typecheck + lint + format:check
```

---

## Architecture: fixture-based + Component Objects

Every spec imports a single `test`:

```ts
import { test, expect } from '@fixtures/index';
```

`@fixtures/index` is a `mergeTests(...)` of three fixture files:

| Fixture         | Provides                                                                      |
| --------------- | ----------------------------------------------------------------------------- |
| `pages.fixture` | `homePage`, `loginPage`, `docsHomePage` (lazy POs, scoped to the test's page) |
| `api.fixture`   | `api: ApiClient`, `usersApi` (auto-disposed `APIRequestContext`)              |
| `auth.fixture`  | `testUser`, `adminUser` (typed users from env)                                |

A test only destructures what it needs:

```ts
test('list users', async ({ usersApi }) => {
  const result = await usersApi.list(1);
  expect(result.ok).toBe(true);
});
```

### Page Objects

- Extend `BasePage` (must declare `path` and `waitUntilLoaded()`).
- Wrap multi-action methods in `step('Login as X', async () => { ... })` (from `@helpers/test-step`) to surface them as named steps in HTML / Allure / Monocart reports.

### Component Objects

- Extend `BaseComponent`.
- Take a `Locator` root and never navigate — only interact with their subtree.
- Reusable across many pages (e.g. `HeaderComponent` in `HomePage`).

---

## Authentication (storage state)

Configured in `playwright.config.ts` via the `setup` project:

1. `tests/auth.setup.ts` runs **first**.
2. It performs a real login (you implement) and saves the session to `playwright/.auth/user.json`.
3. Every UI project (`chromium-e2e`, `firefox-e2e`, `mobile-*`, `visual`, `accessibility`) declares `dependencies: ['setup']` and `storageState: STORAGE_STATE.user`.
4. `tests/auth.teardown.ts` cleans the file at the end.

**Out of the box** the setup just visits the demo site (no real login). When you point `BASE_URL` at your app, swap in real login steps inside `tests/auth.setup.ts` (the file has a commented template).

---

## Multi-environment

```
TEST_ENV=staging npm test
```

Loading order (first hit wins):

1. `.env.${TEST_ENV}` (e.g. `.env.staging`)
2. `.env`
3. process env

The loader (`src/config/env.ts`) validates the resulting env with **Zod**. Missing or malformed values fail fast with a precise message — you never enter a Playwright run with a broken config.

Add per-developer secrets in a local `.env` (gitignored). Per-environment defaults live in committed `.env.dev` / `.env.staging` / `.env.prod`.

---

## Reporters

Every run produces:

| Reporter  | Path                                 | Open with                     |
| --------- | ------------------------------------ | ----------------------------- |
| HTML      | `reports/html-report/`               | `npm run report:html`         |
| Allure    | `reports/allure-results/` (raw)      | `npm run report:allure:serve` |
| Monocart  | `reports/monocart-report/index.html` | open in browser               |
| JUnit     | `reports/junit/results.xml`          | consumed by Jenkins / GH      |
| Blob (CI) | `reports/blob-report/`               | `npm run report:merge`        |

On CI the `github` reporter additionally annotates failed assertions on PRs.

---

## Sharding

`playwright.config.ts` is fully sharding-friendly. Locally:

```bash
SHARD=1/4 npm run test:shard
SHARD=2/4 npm run test:shard
# ...
npm run report:merge          # merges blob reports into one HTML
```

GitHub Actions runs a **4-shard matrix** by default (edit `matrix.shard` in `.github/workflows/playwright.yml` to scale).

Jenkins exposes a `SHARD_TOTAL` parameter and runs shards in true parallel via `parallel { ... }`, then merges blob/allure artifacts in a final stage.

---

## Visual regression

Visual specs live under `tests/visual/` and are picked up only by the `visual` project. Snapshots are stored in `__snapshots__/` next to their test file (template: `{testDir}/__snapshots__/{testFilePath}/{arg}{ext}`).

Update baselines:

```bash
npm run test:update-snapshots -- --project=visual
```

The project sets `animations: 'disabled'` and `caret: 'hide'` to cut down on flake. Tune `maxDiffPixelRatio` in `playwright.config.ts` for your stack.

---

## Accessibility

`tests/a11y/` uses `@axe-core/playwright` to fail the test on any **critical** or **serious** WCAG 2.1 AA violation. Loosen/tighten via `withTags(...)` and the impact filter in `home.a11y.spec.ts`.

---

## Performance

`tests/performance/` records core paint metrics (FP, FCP, DOMContentLoaded, load) via the Performance API and asserts against budgets. For full Lighthouse audits, add `playwright-lighthouse` and a CDP-enabled project.

---

## CI

### GitHub Actions

Workflow file: `.github/workflows/playwright.yml`. Pipeline:

1. **lint** — `typecheck`, `lint`, `format:check`.
2. **test (matrix)** — 4 parallel shards. Each uploads `blob-report-N`, `allure-results-N`, and `test-results-N` (on failure).
3. **merge-reports** — downloads blobs, merges into a single HTML, uploads as `playwright-html-report`.
4. **allure-report** — downloads allure raw results, generates static HTML, uploads as `allure-report`.

`workflow_dispatch` exposes a `env` input (dev/staging/prod).

### Jenkins

`Jenkinsfile` declarative pipeline:

- **Checkout → Setup → Lint(parallel) → Test(parallel shards) → Merge & publish**.
- Parameters: `TEST_ENV`, `SHARD_TOTAL`, `GREP`, `UPDATE_SNAPSHOTS`.
- Publishes JUnit + HTML (Playwright, Monocart, Allure-static), and uses the **Allure Jenkins plugin** for trend graphs (if installed).

### Docker

```bash
docker build -t playwright-boilerplate .
docker run --rm -e TEST_ENV=dev playwright-boilerplate
```

The image is pinned to `mcr.microsoft.com/playwright:v1.59.1-jammy` — bump it together with the `@playwright/test` version in `package.json` to keep browser binaries in lockstep.

---

## Code quality

- **ESLint** flat config with `typescript-eslint`, `eslint-plugin-playwright`, and Prettier integration. Notable Playwright rules: `no-wait-for-timeout`, `prefer-web-first-assertions`, `expect-expect`, `no-conditional-in-test`.
- **Prettier** enforced via `format:check` in CI and on `pre-commit`.
- **Husky + lint-staged**: every commit auto-fixes staged TS files and validates the commit message against Conventional Commits.
- **TS strict** including `noUncheckedIndexedAccess`, `noUnusedLocals`, `noImplicitReturns`.

---

## Conventions

- **Locators**: prefer role-based (`getByRole`, `getByLabel`, `getByTestId`). The default `testIdAttribute` is `data-testid`.
- **Assertions**: prefer web-first (`await expect(locator).toBeVisible()`) over manual polls. ESLint will warn on `waitForTimeout`.
- **No arbitrary sleeps**: use `expect.poll()`, `page.waitForResponse()`, or `BasePage.waitUntilLoaded()`.
- **Tags**: use `@smoke`, `@regression`, `@critical`, `@visual`, `@a11y`, `@perf`, `@api`, `@mobile` (constants in `src/config/constants.ts`).
- **Commits**: Conventional Commits — `feat:`, `fix:`, `test:`, `ci:`, `chore:`, etc.

---

## Adapting to your application

1. Set `BASE_URL` and `API_BASE_URL` in `.env.dev` (and friends).
2. Replace selectors in `src/pages/login.page.ts` + `src/pages/home.page.ts` (and components).
3. Implement real login in `tests/auth.setup.ts` (template included).
4. Add new endpoint modules under `src/api/endpoints/` and expose them through `api.fixture.ts`.
5. Add new page objects under `src/pages/` and expose them through `pages.fixture.ts`.
6. Write specs under `tests/<type>/` — they're auto-picked up by the matching project.

---

## License

ISC.
