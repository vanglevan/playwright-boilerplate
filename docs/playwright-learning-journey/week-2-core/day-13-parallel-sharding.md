# Day 13 — Parallelization, Sharding, Retries

> **Goal:** Scale test suite từ 1 máy → N máy. Hiểu khi nào nên retry, khi nào không. Tránh flaky test che bug thật.
> **Thời gian:** 2-3 giờ

---

## Prerequisites

- Week 1 + Day 8-12 hoàn thành
- Có ≥ 10 tests

---

## 1. Parallelization — nhiều tests chạy cùng lúc

### 3 level parallel trong Playwright

```
Level 1: multiple workers (processes)       — playwright.config workers
Level 2: multiple test files per worker     — default
Level 3: tests in one file run parallel    — fullyParallel: true
```

### Default behavior

- **Tests trong DIFFERENT files** — chạy parallel
- **Tests trong SAME file** — chạy SEQUENTIAL (default)

### Bật fullyParallel

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true, // tests in same file also parallel
  workers: 4, // số process
});
```

**Hoặc per file:**

```typescript
test.describe.configure({ mode: 'parallel' });
// hoặc
test.describe.configure({ mode: 'serial' }); // ngược lại
```

---

## 2. Workers — số process

```typescript
// playwright.config.ts
workers: process.env.CI ? 2 : undefined,  // CI: 2, local: auto (= CPU cores)
```

**Rule thumb:**

- Local: `undefined` (Playwright tự chọn, ~CPU cores)
- CI: 1-4 (tuỳ CI plan, tránh OOM)

**CLI override:**

```bash
npx playwright test --workers=4
npx playwright test --workers=1   # sequential, for debug
```

### Monitoring

```bash
npx playwright test --reporter=line
# output: [2/4] tests/cart.spec.ts — "can add item" ...
#                                    ↑ số workers đang chạy
```

---

## 3. Test isolation — điều kiện để parallel work

Parallel chỉ work nếu tests **independent**.

### ✅ Independent

```typescript
test('test A', async ({ page }) => {
  await page.goto('/login');
  // ...
});

test('test B', async ({ page }) => {
  await page.goto('/signup');
  // ...
});
```

### ❌ Dependent (sẽ fail khi parallel)

```typescript
let userId: number;

test('create user', async () => {
  userId = await createUser(); // ⚠️ shared state
});

test('delete user', async () => {
  await deleteUser(userId); // ⚠️ depends on order
});
```

**Fix:** Mỗi test tự tạo data của nó (Day 9 — factories).

### Shared setup: beforeAll dùng cẩn thận

```typescript
test.describe("Profile", () => {
  test.describe.configure({ mode: "serial" });  // chấp nhận sequential

  let userId: number;

  test.beforeAll(async ({ request }) => {
    userId = (await request.post("/users").then(r => r.json())).id;
  });

  test.afterAll(async ({ request }) => {
    await request.delete(`/users/${userId}`);
  });

  test("profile shows name", async () => { ... });
  test("profile shows email", async () => { ... });
});
```

**Trade-off:** Serial chậm hơn nhưng đơn giản hơn data-per-test.

---

## 4. Sharding — chia suite cho nhiều machines

### Khái niệm

100 tests, 4 máy → mỗi máy chạy 25 tests.

### CLI

```bash
# Máy 1
npx playwright test --shard=1/4

# Máy 2
npx playwright test --shard=2/4

# ... etc
```

### Trên CI (GitHub Actions matrix)

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
    total: [4]

steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/${{ matrix.total }}
```

### Merge reports từ nhiều shards

```yaml
# Từng shard upload blob report
- name: Upload blob report
  uses: actions/upload-artifact@v4
  with:
    name: blob-report-${{ matrix.shard }}
    path: blob-report

# Job sau merge
merge-reports:
  needs: [test]
  steps:
    - uses: actions/download-artifact@v4
      with:
        pattern: blob-report-*
        merge-multiple: true
        path: all-blob-reports
    - run: npx playwright merge-reports --reporter=html ./all-blob-reports
```

**Combo speed:** `workers=4` × `shards=4` = 16x parallelism.

---

## 5. Retries — cho CI only

```typescript
retries: process.env.CI ? 2 : 0,
```

**Rule:**

- Local: `0` — thấy flaky ngay, fix
- CI: `1-2` — CI thường flakier (network, resource)

**CẢNH BÁO:** Retry CHE GIẤU flaky tests. Đừng dùng retry để "fix" test — fix root cause.

### Retry strategy per test

```typescript
test('flaky legacy test', async ({ page }) => {
  test.info().annotations.push({ type: 'flaky-reason', description: '3rd party race' });
  // ...
});
```

Đánh dấu → review thường xuyên → fix hoặc xoá.

---

## 6. Test annotations & tags

### Tags (grep-able)

```typescript
test("smoke login", { tag: ["@smoke", "@critical"] }, async () => { ... });

// Hoặc inline trong tên
test("smoke login @smoke @critical", async () => { ... });
```

**Run subset:**

```bash
npx playwright test --grep @smoke
npx playwright test --grep "@smoke|@critical"
npx playwright test --grep-invert @slow   # exclude slow
```

### test.slow / test.fixme / test.skip

```typescript
test('heavy test', async () => {
  test.slow(); // 3x timeout
  // ...
});

test('known bug', async () => {
  test.fixme(true, 'JIRA-1234 — dropdown not rendering in Firefox');
  // ...
});

test('feature not ready', async () => {
  test.skip(true, 'Waiting for backend');
  // ...
});
```

---

## 7. Test timeout

```typescript
// Global
export default defineConfig({
  timeout: 60_000, // 60s per test
});

// Per test
test('long test', async () => {
  test.setTimeout(120_000);
  // ...
});
```

**Rule:** Timeout default 30s đủ cho 95% tests. Tăng chỉ khi thật cần (API slow, large page).

---

## 8. Dependencies giữa tests

### Test dependency

```typescript
test("login", async () => { ... });

test("view dashboard", async () => { ... });
// Nếu login fail → dashboard tự skip? Không — mặc định vẫn chạy
```

**Nếu muốn:** Dùng fixture (login trong fixture) — nếu fixture fail, test tự skip.

### Project dependency

```typescript
projects: [
  { name: 'setup', testMatch: /setup\.ts/ },
  { name: 'tests', dependencies: ['setup'] },
];
```

---

## 9. Bài tập

### Bài 1: Enable fullyParallel

`fullyParallel: true` + `workers: 4`. Chạy suite, so thời gian trước/sau.

### Bài 2: Tạo dependency bug

Viết 2 test share biến:

```typescript
let count = 0;
test('inc', async () => {
  count++;
  expect(count).toBe(1);
});
test('verify', async () => {
  expect(count).toBe(1);
});
```

Chạy parallel → fail. Chạy serial → pass. **Hiểu tại sao parallel cần isolation.**

### Bài 3: Shard local

Chạy:

```bash
npx playwright test --shard=1/2
npx playwright test --shard=2/2
```

Verify 2 lần chạy cover tất cả test.

### Bài 4: Tag system

Tag 3 test `@smoke`, 5 test `@regression`, 2 test `@critical`.

```bash
npx playwright test --grep @smoke   # chỉ 3 test
```

### Bài 5: Slow test

Viết test có `await page.waitForTimeout(5000)` (CHỈ để exercise, không commit!):

```typescript
test('slow', async () => {
  test.slow();
  await page.waitForTimeout(20_000);
});
```

Không có `test.slow()` → timeout fail. Có → pass.

---

## 10. Anti-patterns

| Pattern                                               | Tại sao bad                 |
| ----------------------------------------------------- | --------------------------- |
| `test.describe.configure({ mode: "serial" })` mọi nơi | Mất lợi ích parallel        |
| `retries: 5`                                          | Flaky test che bug thật     |
| Shared `let userId`                                   | Race condition khi parallel |
| `beforeAll` tạo data, tests modify data               | Test order dependency       |
| `test.only()` commit vào main                         | Tests khác không chạy       |
| `test.skip()` không reason                            | Code chết                   |
| Timeout 300_000ms để "fix" flaky                      | Root cause chưa giải quyết  |

---

## 11. Common Pitfalls

| Vấn đề                               | Fix                                                     |
| ------------------------------------ | ------------------------------------------------------- |
| Test pass serial, fail parallel      | Shared state → extract to fixture hoặc factory per test |
| Shard 1 dài hơn shard 2 nhiều        | Playwright cố balance; hoặc tách tests nặng             |
| Report merge fail                    | Dùng `blob` reporter (CI), merge bằng `merge-reports`   |
| Worker crash (OOM)                   | Giảm workers; hoặc xem memory leak                      |
| Retry 2 lần vẫn fail → final timeout | Test thật sự bug — không phải flaky                     |

---

## 12. Checklist

- [ ] `fullyParallel: true` + workers cấu hình
- [ ] Bài 2: thấy tests share state fail khi parallel
- [ ] Sharding 1/2 + 2/2 chạy đúng
- [ ] Tag `@smoke` + `--grep @smoke` work
- [ ] Hiểu tại sao retry là plaster, không phải cure
- [ ] Commit: `chore: configure parallel execution`
- [ ] NOTES.md: ghi thời gian chạy 1 worker vs 4 workers

---

## Resources

- [Playwright — Parallelism](https://playwright.dev/docs/test-parallel)
- [Playwright — Sharding](https://playwright.dev/docs/test-sharding)
- [Playwright — Retries](https://playwright.dev/docs/test-retries)
- [Playwright — Tags & Annotations](https://playwright.dev/docs/test-annotations)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Playwright Sharding explained](https://www.youtube.com/results?search_query=playwright+sharding)
- [Parallel testing strategies](https://www.youtube.com/results?search_query=parallel+testing+strategies)
- [The case against test retries (tech talk)](https://www.youtube.com/results?search_query=against+test+retries)

### 📝 Articles & blogs

- [Eradicating Non-Determinism in Tests](https://martinfowler.com/articles/nonDeterminism.html) — Fowler classic
- [Playwright — Sharding deep dive](https://playwright.dev/docs/test-sharding)
- [Flaky Tests at Google](https://testing.googleblog.com/) — search "flaky tests"
- [Retry logic considered harmful](https://dev.to/search?q=retry+considered+harmful)
- [Test quarantine pattern](https://martinfowler.com/articles/nonDeterminism.html#Quarantine)

### 🎓 Deep concepts

- [Test Parallelization Patterns](https://testing.googleblog.com/2016/09/our-journey-to-hermetic-testing.html)
- [Hermetic testing](https://testing.googleblog.com/2012/10/hermetic-servers.html)
- [Test independence principles](https://kentcdodds.com/blog/test-isolation-with-react)

### 📖 Books

- _Release It!_ — Michael Nygard (stability patterns)
- _Site Reliability Engineering_ — Google SRE book (free online)

### 🐙 Related GitHub repos

- [microsoft/playwright — sharding examples](https://github.com/microsoft/playwright/tree/main/examples)
- GitHub Actions matrix examples — search "playwright shard matrix"

### 📊 Cheat sheets

- [CLI flags for parallel](https://playwright.dev/docs/test-cli#reference) — search "parallel", "shard", "workers"
- [Tag filter syntax](https://playwright.dev/docs/test-annotations#tag-tests)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (parallel mechanics)

**B1.** Run cùng suite 3 config, ghi thời gian:

```bash
npx playwright test --workers=1    # ___ giây
npx playwright test --workers=2    # ___ giây
npx playwright test --workers=4    # ___ giây
npx playwright test --workers=8    # ___ giây
```

Graph thời gian vs workers. Observe plateau.

**B2.** `fullyParallel: true` vs `false` trong cùng file:

```typescript
test.describe("sequential", () => {
  test.describe.configure({ mode: "serial" });
  test("a", ...);
  test("b", ...);
});
test.describe("parallel", () => {
  test.describe.configure({ mode: "parallel" });
  test("c", ...);
  test("d", ...);
});
```

Compare run time.

**B3.** Tag + filter:

```typescript
test("smoke login", { tag: "@smoke" }, ...);
test("edge case", { tag: ["@regression", "@slow"] }, ...);
```

```bash
npx playwright test --grep @smoke
npx playwright test --grep "@regression"
npx playwright test --grep-invert "@slow"
```

### 🟡 Trung bình (sharding + CI)

**M1.** Shard local:

```bash
npx playwright test --shard=1/2   # machine 1
npx playwright test --shard=2/2   # machine 2
```

Verify tổng set of tests = full suite, không overlap.

**M2.** CI matrix 4 shards:

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/4 --reporter=blob
```

Merge reports sau:

```yaml
- run: npx playwright merge-reports --reporter=html ./all-blob-reports
```

**M3.** Intentional order dependency (demonstrate why parallel breaks it):

```typescript
let counter = 0;
test('increment', async () => {
  counter++;
  expect(counter).toBe(1);
});
test('verify', async () => {
  expect(counter).toBe(1);
});
```

Run with `--workers=1` → passes. `--workers=4` → fails randomly. Understand why.

**M4.** Retry strategy tuning:

```typescript
retries: process.env.CI ? 2 : 0,
```

Run suite with flaky test, compare retries 0 vs 2 vs 5. Discuss trade-offs.

### 🔴 Nâng cao (scale patterns)

**A1.** Custom sharding (test file balance):
Playwright default shard balances by file. Optimize further:

- Tag slow tests `@slow`
- Put slow tests trong separate project
- Parallel project vs sequential project

**A2.** Retry với analysis — log retry reason:

```typescript
test('important', async ({}, testInfo) => {
  if (testInfo.retry > 0) {
    console.log(`Retry ${testInfo.retry}`);
  }
});
```

Track retry rate over 1 week. >5% = flakiness problem.

**A3.** Worker-scoped resources — expensive DB connection once/worker:

```typescript
export const test = base.extend<{}, { db: DbConnection }>({
  db: [
    async ({}, use) => {
      const conn = await connectDb();
      await use(conn);
      await conn.close();
    },
    { scope: 'worker' },
  ],
});
```

Measure improvement vs test-scoped.

**A4.** Dynamic shard allocation — CI auto decides:

```yaml
- id: calc
  run: |
    TESTS=$(npx playwright test --list --reporter=json | jq '.suites | length')
    SHARDS=$((TESTS / 10 + 1))
    echo "shards=$SHARDS" >> $GITHUB_OUTPUT
- strategy:
    matrix:
      shard: ${{ fromJSON(steps.calc.outputs.shards) }}
```

### 🏆 Mini challenge (45 phút)

**Task:** "Suite Optimizer" — measure, diagnose, optimize.

Run suite của bạn với baseline metrics:

- Total tests: \_\_\_
- Serial time (workers=1): \_\_\_
- Parallel time (workers=4): \_\_\_
- Speedup factor: \_\_\_x (ideal: 4x)

Diagnose:

- Which tests slowest? (`--reporter=list` timing)
- Shared resources? (fixture scopes wrong?)
- Setup heavy? (use worker-scoped)

Optimize (target ≥3x speedup):

1. Tag slow tests
2. Move expensive setup to worker scope
3. API-first setup (not UI)
4. Remove `waitForTimeout`
5. Split giant describe into focused ones

Document trong `OPTIMIZATION.md`.

### 🌟 Stretch goal

Research how Playwright team tests themselves — look at [their CI config](https://github.com/microsoft/playwright/tree/main/.github/workflows).

---

## Next

[Day 14 — Debug như senior →](./day-14-debugging.md)
