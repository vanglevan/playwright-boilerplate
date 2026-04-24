# Day 19 — CI/CD với GitHub Actions

> **Goal:** Tự build workflow production-grade: lint gate, parallel shards, merged reports, artifact upload.
> **Thời gian:** 3 giờ

---

## Prerequisites

- Repo push lên GitHub
- Week 1-2 hoàn thành

---

## 1. Vì sao CI/CD quan trọng

- **Bug caught at PR** — không để dev merge code broken
- **Automation = source of truth** — manual test không scale
- **Dashboard team-wide** — ai cũng thấy state
- **Pre-deploy gate** — không deploy nếu test fail

---

## 2. GitHub Actions basics

Files trong `.github/workflows/*.yml` auto chạy khi:

- `push` to branches
- `pull_request` open/update
- `schedule` cron
- `workflow_dispatch` manual

**Anatomy:**

```yaml
name: My Workflow # tên hiển thị
on: [push, pull_request] # trigger
jobs:
  job-name:
    runs-on: ubuntu-latest # OS
    steps:
      - uses: actions/checkout@v4
      - run: npm test
```

---

## 3. Workflow cơ bản cho Playwright

**`.github/workflows/playwright.yml`:**

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test
        env:
          TEST_ENV: staging
          BASE_URL: ${{ secrets.STAGING_BASE_URL }}
          TEST_USER_USERNAME: ${{ secrets.TEST_USER }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_PASS }}

      - name: Upload report
        if: always() # chạy kể cả khi test fail
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

**Quan trọng:**

- `concurrency + cancel-in-progress` — push commit mới → cancel run cũ
- `if: always()` — luôn upload report, kể cả test fail
- `secrets` — config trong repo Settings → Secrets

---

## 4. Nâng cao: Lint gate + parallel shards

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ==================== JOB 1: Lint gate ====================
  lint:
    name: Lint & Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run format:check

  # ==================== JOB 2: Tests (parallel shards) ====================
  test:
    name: Test — Shard ${{ matrix.shard }}
    needs: lint # chỉ chạy nếu lint pass
    runs-on: ubuntu-latest
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Run tests (shard ${{ matrix.shard }}/4)
        run: npx playwright test --shard=${{ matrix.shard }}/4 --reporter=blob
        env:
          TEST_ENV: staging
          BASE_URL: ${{ secrets.STAGING_BASE_URL }}
          TEST_USER_USERNAME: ${{ secrets.TEST_USER }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_PASS }}

      - name: Upload blob report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: blob-report-${{ matrix.shard }}
          path: blob-report/
          retention-days: 7

      - name: Upload test results (on fail)
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results-${{ matrix.shard }}
          path: test-results/
          retention-days: 7

  # ==================== JOB 3: Merge reports ====================
  merge-reports:
    name: Merge reports
    if: always() # chạy kể cả khi shard fail
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci

      - name: Download all blob reports
        uses: actions/download-artifact@v4
        with:
          pattern: blob-report-*
          merge-multiple: true
          path: all-blob-reports

      - name: Merge into HTML report
        run: npx playwright merge-reports --reporter=html ./all-blob-reports

      - name: Upload HTML report
        uses: actions/upload-artifact@v4
        with:
          name: html-report
          path: playwright-report/
          retention-days: 14
```

---

## 5. Matrix cross-browser + cross-OS

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        browser: [chromium, firefox, webkit]
    steps:
      # ...
      - run: npx playwright test --project=${{ matrix.browser }}
```

**Trade-off:** 3 OS × 3 browser = 9 jobs. Dùng hợp lý (không phải mọi commit).

---

## 6. PR annotations (inline comments)

Playwright có reporter tự comment trong PR:

```yaml
- name: Run tests
  run: npx playwright test --reporter=github
```

GitHub Annotations → test fail hiện inline trong "Files changed" tab. Rất đẹp.

---

## 7. Deploy HTML report to GitHub Pages

```yaml
permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  # ... test + merge-reports jobs ...

  deploy-report:
    needs: merge-reports
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Download HTML report
        uses: actions/download-artifact@v4
        with:
          name: html-report
          path: report

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: report

      - name: Deploy to Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Enable in: Repo Settings → Pages → Source: "GitHub Actions".

Report URL: `https://<user>.github.io/<repo>/`

---

## 8. Secrets management

**Không hardcode credentials:**

Repo Settings → Secrets and variables → Actions → New repository secret.

**Access:**

```yaml
env:
  API_TOKEN: ${{ secrets.API_TOKEN }}
```

**Org-level secrets:** Share qua nhiều repo (Enterprise).

**⚠️ Secrets không hiện trong logs** — GitHub mask tự động, nhưng đừng `echo` cố ý.

---

## 9. Workflow dispatch — chạy thủ công

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [dev, staging, prod]
        default: staging
      browser:
        type: choice
        options: [chromium, firefox, webkit, all]
        default: chromium

jobs:
  test:
    steps:
      - run: npx playwright test
        env:
          TEST_ENV: ${{ github.event.inputs.environment }}
```

GitHub UI: Actions tab → Workflow → "Run workflow" button.

---

## 10. Scheduled runs (cron)

```yaml
on:
  schedule:
    - cron: '0 6 * * *' # 6 AM UTC daily
```

**Use case:**

- Smoke test prod nightly
- Alert nếu fail
- Không ảnh hưởng dev velocity

---

## 11. Caching để tăng tốc

### Playwright browsers cache

```yaml
- name: Get Playwright version
  id: pw-version
  run: echo "version=$(npm pkg get devDependencies.@playwright/test | tr -d '\"')" >> $GITHUB_OUTPUT

- name: Cache Playwright browsers
  uses: actions/cache@v4
  id: playwright-cache
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ steps.pw-version.outputs.version }}

- name: Install Playwright browsers
  if: steps.playwright-cache.outputs.cache-hit != 'true'
  run: npx playwright install --with-deps
```

### npm cache

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm' # built-in
```

---

## 12. Bài tập

### Bài 1: Basic workflow

Copy workflow ở mục 3. Push → verify chạy xanh.

### Bài 2: Parallel shards

Nâng cấp lên workflow mục 4 với 4 shards. So sánh thời gian vs 1 job.

### Bài 3: PR annotations

Cố tình break 1 test → mở PR → verify thấy annotation inline.

### Bài 4: Secrets

Move credentials sang GitHub Secrets. Verify local vẫn OK qua `.env.*`, CI qua Secrets.

### Bài 5: Deploy report

Enable GitHub Pages, setup deploy job. Chia sẻ link report cho bạn bè.

### Bài 6: Scheduled smoke

Setup cron 6AM daily chạy `@smoke` tests.

---

## 13. Common Pitfalls

| Vấn đề                                                    | Fix                                                               |
| --------------------------------------------------------- | ----------------------------------------------------------------- |
| "Playwright browsers not installed"                       | `npx playwright install --with-deps` (deps cho Linux)             |
| Secret `undefined` trong workflow                         | Secret name đúng? Repo có access?                                 |
| Shard không balance (1 shard mất 10 phút, 3 shard 2 phút) | Playwright sort by size — OK rồi, hoặc tự tách test               |
| Cache miss → cài lại mỗi run                              | Hash key không stable; dùng package-lock.json hash                |
| HTML report size to                                       | Compress trước upload: `tar -czf report.tar.gz playwright-report` |
| Concurrency không cancel                                  | `cancel-in-progress: true` phải ở top-level                       |
| Workflow không chạy                                       | Check file path `.github/workflows/*.yml`; YAML indent đúng       |

---

## 14. Beyond GitHub Actions

| CI             | Khi dùng                |
| -------------- | ----------------------- |
| GitHub Actions | Default cho GitHub repo |
| Jenkins        | Enterprise, self-hosted |
| GitLab CI      | GitLab repo             |
| CircleCI       | Fast, good caching      |
| Azure DevOps   | Microsoft stack         |

Concept chung giống nhau (jobs, steps, matrix, secrets) — học 1 là hiểu hết.

---

## 15. Best practices

- **Fail fast** — lint gate trước test
- **Parallelize** — shards + matrix
- **Cache aggressively** — npm, browsers
- **Always upload reports** — `if: always()`
- **Keep workflows DRY** — reusable workflows (`workflow_call`)
- **Dry-run for PR** — `workflow_dispatch` confirm before run against prod
- **Alert on prod smoke fail** — Slack webhook

---

## 16. Checklist

- [ ] Basic workflow xanh
- [ ] Lint gate + 4 shards
- [ ] PR annotations hiện inline
- [ ] Secrets configured
- [ ] GitHub Pages deploy report work
- [ ] Scheduled smoke test setup
- [ ] Commit: `ci: github actions pipeline`
- [ ] Share workflow link trong NOTES.md

---

## Resources

- [Playwright — CI](https://playwright.dev/docs/ci)
- [Playwright — CI with GitHub Actions](https://playwright.dev/docs/ci-intro)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [actions/cache](https://github.com/actions/cache)
- [awesome-actions](https://github.com/sdras/awesome-actions)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [GitHub Actions for Beginners (Fireship)](https://www.youtube.com/watch?v=eB0nUzAI7M8)
- [Playwright CI setup (official)](https://www.youtube.com/@Playwrightdev)
- [GitHub Actions deep dive](https://www.youtube.com/results?search_query=github+actions+deep+dive)
- [Matrix builds explained](https://www.youtube.com/results?search_query=github+actions+matrix)

### 📝 Articles & blogs

- [Playwright CI docs](https://playwright.dev/docs/ci)
- [GitHub Actions best practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Faster CI builds — 10 tips](https://github.blog/)
- [Runner cost optimization](https://dev.to/search?q=github+actions+cost)

### 🎓 Deep topics

- [Reusable workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [Composite actions](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action)
- [Self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [GitHub Actions as code reviews (Codecov)](https://about.codecov.io/)

### 📖 Books

- _Continuous Delivery_ — Humble & Farley (CI origins)
- _The DevOps Handbook_ — Gene Kim et al.

### 🐙 Related GitHub repos

- [actions/cache](https://github.com/actions/cache)
- [actions/setup-node](https://github.com/actions/setup-node)
- [actions/upload-artifact](https://github.com/actions/upload-artifact)
- [microsoft/playwright-github-action](https://github.com/microsoft/playwright-github-action)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages) — deploy reports

### 🛠️ Tools

- [Act](https://github.com/nektos/act) — run GHA locally
- [GitHub CLI](https://cli.github.com/) — manage from terminal
- [GitHub Actions Toolkit](https://github.com/actions/toolkit) — build custom actions

### 📊 Cheat sheets

- [GitHub Actions quick reference](https://docs.github.com/en/actions/learn-github-actions/expressions)
- [Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Context and expression syntax](https://docs.github.com/en/actions/learn-github-actions/contexts)

### 🏢 Other CI platforms (for reference)

- [Jenkins Pipeline](https://www.jenkins.io/doc/book/pipeline/) — enterprise
- [GitLab CI](https://docs.gitlab.com/ee/ci/)
- [CircleCI](https://circleci.com/docs/)
- [Azure DevOps](https://learn.microsoft.com/en-us/azure/devops/pipelines/)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (basic workflow)

**B1.** Minimal workflow: checkout → install → test → upload report. Push → verify chạy.

**B2.** Break test intentionally → push → observe:

- Workflow fails
- PR annotations inline
- Artifact uploaded (trace, screenshot)

**B3.** Secrets — move credentials từ `.env` sang GitHub Secrets. Local vẫn OK qua `.env.dev`.

### 🟡 Trung bình (parallelism + caching)

**M1.** 4-shard matrix:

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/4 --reporter=blob
```

Merge job after. Verify tổng thời gian giảm.

**M2.** Cache optimization:

```yaml
- name: Cache npm
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'

- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
```

Measure: uncached run vs cached run.

**M3.** Concurrency cancellation:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Push 2 commits fast → verify old run canceled.

**M4.** Conditional execution — skip if only docs changed:

```yaml
on:
  pull_request:
    paths-ignore:
      - '**.md'
      - 'docs/**'
```

### 🔴 Nâng cao (production patterns)

**A1.** Workflow dispatch — manual trigger:

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [dev, staging, prod]
      browser:
        type: choice
        options: [chromium, firefox, webkit, all]
```

Actions tab → run manually with inputs.

**A2.** Scheduled smoke tests:

```yaml
on:
  schedule:
    - cron: '0 6 * * *' # 6 AM UTC daily
```

Run `@smoke` against prod. Slack alert if fail.

**A3.** Reusable workflows:

```yaml
# .github/workflows/test-reusable.yml
on:
  workflow_call:
    inputs:
      env:
        required: true
        type: string

jobs:
  test:
    # ...
```

Call from multiple workflows.

**A4.** Matrix cross-browser + cross-OS:

```yaml
matrix:
  os: [ubuntu-latest, macos-latest, windows-latest]
  browser: [chromium, firefox, webkit]
  exclude:
    - { os: windows-latest, browser: webkit }
```

3×3 = 9 jobs (minus exclude).

### 🏆 Mini challenge (60 phút)

**Task:** Production-grade pipeline:

1. Lint gate (typecheck + lint + format:check) — fail fast
2. 4-shard parallel test
3. Blob reports merge into HTML
4. Upload artifacts (on fail)
5. Deploy HTML + Allure report to GitHub Pages
6. Slack notify on main fail
7. Concurrency cancellation
8. Scheduled smoke daily

Goal: 10 commits xanh liên tiếp, CI <5 phút.

Document trong README với link to workflow file + badge status.

### 🌟 Stretch goal

Build 1 reusable composite action — e.g., "setup-playwright-project" that encapsulates 5 common steps.

---

## Next

[Day 20 — Reporters (Allure, Monocart) →](./day-20-reporters.md)
