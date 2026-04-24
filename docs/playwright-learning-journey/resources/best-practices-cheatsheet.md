# Best Practices Cheatsheet

Print và dán lên bàn làm việc. 1 trang.

---

## Locators

### Priority

```
1. getByRole         — best
2. getByLabel
3. getByPlaceholder
4. getByText
5. getByTestId       — when dev adds data-testid
6. CSS selectors     — fallback
7. XPath             — last resort
```

### Examples

```typescript
page.getByRole('button', { name: 'Submit' });
page.getByLabel('Email');
page.getByTestId('login-btn');
page.locator('.btn'); // avoid if possible
```

### Avoid

- `nth-child(2)` — fragile
- CSS phụ thuộc style class `.text-red-500`
- XPath phức tạp (trừ khi bất khả kháng)

---

## Waits

### ✅ Do

```typescript
await expect(locator).toBeVisible(); // auto-retry
await page.waitForURL(/dashboard/);
await page.waitForResponse((r) => r.url().includes('/api'));
```

### ❌ Never

```typescript
await page.waitForTimeout(3000); // BAD
```

---

## Assertions

### Web-first (auto-retry)

```typescript
await expect(locator).toBeVisible();
await expect(locator).toHaveText('...');
await expect(locator).toHaveCount(5);
await expect(page).toHaveURL(/.../);
```

### Non-web-first (1-shot)

```typescript
expect(await locator.count()).toBe(5); // OK nhưng không retry
```

### Soft (continue if fail)

```typescript
await expect.soft(locator).toHaveText('...');
```

---

## Test Structure

### Shape

```typescript
test.describe('Feature', () => {
  test('specific behavior', async ({ fixtures }) => {
    // Arrange
    await loginPage.goto();

    // Act
    await loginPage.login(user, pass);

    // Assert
    await expect(page).toHaveURL(/.*home/);
  });
});
```

### Rules

- 1 test = 1 behavior
- `beforeEach` for setup DUPLICATED trong describe
- `fixture` for setup REUSED cross-file
- Tests **independent** — parallel-safe

---

## POM

### Do

```typescript
export class LoginPage extends BasePage {
  readonly path = '/login';
  readonly username: Locator;
  readonly password: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.getByLabel('Email');
    this.password = page.getByLabel('Password');
  }

  async login(user: string, pass: string): Promise<void> {
    await this.username.fill(user);
    await this.password.fill(pass);
    await page.getByRole('button', { name: 'Login' }).click();
  }
}
```

### Don't

- Assertions trong page object (trừ state checks)
- Test logic (data setup, API) trong page object
- Deep inheritance chain
- Page object >500 lines — split components

---

## Data

### Rules

```typescript
// ✅ Env vars validated
env.TEST_USER_USERNAME

// ✅ Factory per test
const user = buildUser();

// ❌ Hardcode prod data
"alice.real@company.com"

// ❌ Shared mutable
let userId = null;
test("a", () => { userId = ...; });
test("b", () => { use(userId); });   // order dependency
```

---

## Tags

```typescript
test('smoke login', { tag: ['@smoke', '@critical'] }, async () => {});

// Run:
// --grep @smoke
// --grep-invert @slow
```

Common tags: `@smoke`, `@regression`, `@critical`, `@slow`, `@flaky`

---

## Parallel

### Config

```typescript
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 2 : 0, // CI only
});
```

### Test must be independent

- No shared `let` variables
- No order dependency
- Factory data per test

---

## Env & Config

```typescript
// .env.dev, .env.staging (never commit)
// Validate with Zod at import time
import { env } from '@config/env';

await page.goto(env.BASE_URL);
await loginPage.login(env.TEST_USER_USERNAME, env.TEST_USER_PASSWORD);
```

---

## API Testing

```typescript
test('...', async ({ request }) => {
  const res = await request.get('/api/users');
  expect(res.ok()).toBeTruthy();
  const data = await res.json();

  // Validate schema with Zod
  const parsed = UserListSchema.parse(data);
});
```

**Speed:** API test = 50-300ms vs UI = 3-10s.

---

## Auth

```typescript
// Setup once
setup('authenticate', async ({ page }) => {
  await loginPage.login(user, pass);
  await page.context().storageState({ path: 'auth/user.json' });
});

// Use in projects
use: {
  storageState: 'auth/user.json';
}
```

---

## Visual

```typescript
await expect(page).toHaveScreenshot({
  animations: 'disabled',
  mask: [page.getByTestId('timestamp')],
  maxDiffPixelRatio: 0.01,
});
```

**Rules:**

- Docker for CI consistency
- Mask dynamic content
- Element-level > full-page
- Update: `npx playwright test --update-snapshots`

---

## A11y

```typescript
import AxeBuilder from '@axe-core/playwright';

const results = await new AxeBuilder({ page }).withTags(['wcag2aa', 'wcag21aa']).analyze();

expect(results.violations).toEqual([]);
```

**Strategy:** Block critical, warn serious, monitor moderate.

---

## Performance

```typescript
const metrics = await page.evaluate(() => {
  const nav = performance.getEntriesByType('navigation')[0];
  return { load: nav.loadEventEnd - nav.fetchStart };
});
expect(metrics.load).toBeLessThan(3000);
```

**Core Web Vitals targets:**

- LCP < 2.5s
- CLS < 0.1
- INP < 100ms

---

## Mocking

```typescript
// Force error
await page.route('**/api/users', (route) => route.fulfill({ status: 500 }));

// Slow
await page.route('**/api/users', async (route) => {
  await new Promise((r) => setTimeout(r, 3000));
  route.continue();
});
```

---

## CI

### Minimal workflow

```yaml
jobs:
  lint:
    # typecheck, lint, format:check
  test:
    needs: lint
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - run: npx playwright test --shard=${{ matrix.shard }}/4
  merge-reports:
    needs: test
    if: always()
    # merge blob reports → html
```

**Pillars:**

- Lint as gate
- Shard parallel
- Upload artifacts on fail
- Cancel in-progress concurrency

---

## AI Rules (10)

1. You own code, AI assistant
2. No real credentials in prompts
3. Give context (file paths, conventions)
4. Examples > descriptions
5. Test AI output before commit
6. AI for review + write
7. One task, one prompt
8. Specific > vague
9. AI for mechanics, you for judgment
10. Measure — drop if not helpful

---

## Debug flow

```
1. npm run test:ui       # UI mode first
2. npx playwright test --debug   # step through
3. Trace Viewer (test-results/.../trace.zip)
4. Pick locator in VS Code extension
5. page.pause() in code
```

---

## Git commits

**Conventional Commits:**

- `feat: add cart page object`
- `fix: resolve flaky checkout test`
- `chore: update dependencies`
- `docs: readme polish`
- `refactor: extract header component`
- `test: add visual snapshot for home`
- `ci: shard workflow`

---

## When stuck >30 min

1. Ask AI (with context)
2. Search Playwright Discord
3. Google with error message
4. Try rubber duck (explain to someone/anything)

**Don't:** Stuck 2 hours alone.
