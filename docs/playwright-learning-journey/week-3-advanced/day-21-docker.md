# Day 21 — Docker + Mini Project Tuần 3

> **Goal:** Chạy test trong Docker để loại "works on my machine". Hoàn thành mini project test pyramid.
> **Thời gian:** 3-4 giờ

---

## Prerequisites

- Week 1-2 + Day 15-20 hoàn thành
- Docker Desktop đã cài (Day 0)

---

## 1. Tại sao Docker

**Vấn đề không có Docker:**

- macOS render font ≠ Linux CI → visual test fail mỗi merge
- Dev A machine chạy OK, dev B fail (Node version, browser version)
- CI OS khác local → bug CI-only
- Khó reproduce bug của tester khác

**Docker giải pháp:**

- Image định nghĩa chính xác: OS + Node + browser + deps
- Mọi nơi chạy image → kết quả giống nhau
- CI = local = dev == reproducible

---

## 2. Official Playwright Docker image

Microsoft publish image sẵn:

```
mcr.microsoft.com/playwright:v1.59.1-jammy
```

- Base: Ubuntu 22.04 (jammy)
- Cài sẵn: Node 20, Chromium, Firefox, WebKit, deps
- Pin version → reproducible

**Alternatives:**

- `mcr.microsoft.com/playwright:v1.59.1-noble` (Ubuntu 24.04)
- `mcr.microsoft.com/playwright/python:v1.59.1-jammy` (Python bindings)

---

## 3. Dockerfile cơ bản

**`Dockerfile`:**

```dockerfile
FROM mcr.microsoft.com/playwright:v1.59.1-jammy

WORKDIR /app

# Copy package files trước để cache layer install
COPY package.json package-lock.json ./
RUN npm ci

# Copy rest
COPY . .

# Default command
CMD ["npm", "test"]
```

**`.dockerignore`:**

```
node_modules
playwright-report
test-results
allure-results
.git
.env
.env.*
!.env.example
*.md
```

**Build & run:**

```bash
docker build -t pw-tests .
docker run --rm pw-tests
```

**Với env:**

```bash
docker run --rm \
  -e TEST_ENV=staging \
  -e BASE_URL=$BASE_URL \
  -e TEST_USER=$TEST_USER \
  -e TEST_PASS=$TEST_PASS \
  pw-tests
```

---

## 4. Mount report folder ra ngoài

Default: report sinh trong container → mất khi `docker rm`.

```bash
docker run --rm \
  -v $(pwd)/playwright-report:/app/playwright-report \
  -v $(pwd)/test-results:/app/test-results \
  pw-tests
```

Sau run, mở `playwright-report/index.html` từ host.

---

## 5. Docker Compose — nhiều services

**`docker-compose.yml`:**

```yaml
version: '3.8'

services:
  tests:
    build: .
    environment:
      TEST_ENV: ${TEST_ENV:-dev}
      BASE_URL: ${BASE_URL}
      TEST_USER: ${TEST_USER}
      TEST_PASS: ${TEST_PASS}
    volumes:
      - ./playwright-report:/app/playwright-report
      - ./test-results:/app/test-results
    # Nếu cần mạng host
    network_mode: host
```

**Run:**

```bash
docker compose up --build --abort-on-container-exit
```

---

## 6. Dockerfile production-grade

```dockerfile
FROM mcr.microsoft.com/playwright:v1.59.1-jammy AS base

WORKDIR /app
ENV NODE_ENV=test

# ============ Dependencies stage (cache) ============
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit

# ============ Runtime stage ============
FROM base AS runtime

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create non-root user (optional, security)
RUN addgroup --system --gid 1001 playwright \
  && adduser --system --uid 1001 --ingroup playwright playwright \
  && chown -R playwright:playwright /app

USER playwright

CMD ["npx", "playwright", "test"]
```

---

## 7. Interactive debug trong Docker

```bash
docker run --rm -it \
  -v $(pwd):/app \
  -w /app \
  mcr.microsoft.com/playwright:v1.59.1-jammy \
  bash

# Trong container:
npm ci
npx playwright test --headed   # nhưng headed trong container cần X11 forward
```

**Tip:** Dùng `--ipc=host` nếu gặp OOM với Chromium:

```bash
docker run --ipc=host ...
```

---

## 8. CI với Docker

```yaml
# .github/workflows/docker-tests.yml
jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.59.1-jammy
      options: --user 1001
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright test
```

**Hoặc build image riêng** push lên GHCR/Docker Hub, reuse giữa runs.

---

## 9. Visual test consistency

Lý do hàng đầu dùng Docker: **visual test**.

**Config:**

```typescript
// playwright.config.ts
projects: [
  {
    name: 'visual',
    testMatch: /.*\.visual\.spec\.ts/,
    snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  },
];
```

**Flow:**

1. Dev local: `docker compose run tests npx playwright test --project=visual`
2. Snapshots sinh ra từ container (Ubuntu)
3. Commit
4. CI runs (Ubuntu) → match
5. No more "works on my machine"

---

## 10. Mini Project Tuần 3

### Brief

Hoàn chỉnh test pyramid cho 1 app. Chạy tất cả trong CI với Docker.

### Requirements

#### App

Chọn 1:

- [SauceDemo](https://www.saucedemo.com/) + API free ([reqres.in](https://reqres.in))
- [Automation Exercise](https://automationexercise.com/) (có API thật)
- [DemoBlaze](https://www.demoblaze.com/) + [fakerestapi](https://fakerestapi.azurewebsites.net/)

#### Test types (tối thiểu số lượng)

| Loại               | Count | Example                                   |
| ------------------ | ----- | ----------------------------------------- |
| **API**            | 10    | CRUD users, auth, error cases             |
| **E2E smoke**      | 5     | Critical flows: register, login, checkout |
| **E2E regression** | 10    | Cart edit, search, filter, etc.           |
| **Visual**         | 3     | Home, product detail, checkout            |
| **A11y**           | 3     | Home, form, modal                         |
| **Performance**    | 2     | Home LCP, checkout flow                   |
| **Network mock**   | 2     | API error UI, slow connection             |

**Total:** ≥ 35 tests

#### Infrastructure

- [ ] Multi-env config (dev, staging) with Zod
- [ ] Auth storage state setup
- [ ] Fixtures merged (pages, api, auth, mock)
- [ ] Data factories
- [ ] ESLint + Prettier + Husky + Commitlint
- [ ] 4 shards parallel CI
- [ ] Multi-reporter (HTML, Allure, JUnit)
- [ ] Docker build + run
- [ ] Allure report deployed GitHub Pages
- [ ] README portfolio-quality

#### Deliverables

1. Repo public với CI xanh
2. `README.md` với:
   - Badge (CI, coverage, Node version)
   - Tech stack table
   - Architecture diagram (mermaid)
   - `npm run` scripts explained
   - Link Allure report hosted
   - Screenshot/GIF
3. 1 blog post dev.to / LinkedIn sharing progress

---

## 11. Bài tập

### Bài 1: Basic Docker

Build image, run tests trong container. Report mount ra host.

### Bài 2: Compose với env vars

`docker-compose.yml` với env injected từ `.env` file.

### Bài 3: CI với Docker

GitHub Action dùng Playwright image (option A) hoặc build image riêng (option B). Compare tốc độ.

### Bài 4: Visual consistency

Chạy visual test local (macOS) → fail. Chạy trong Docker → pass. Chứng minh hypothesis font rendering.

### Bài 5: Mini project

Hoàn thành mini project đúng requirement mục 10.

---

## 12. Common Pitfalls

| Vấn đề                        | Fix                                                           |
| ----------------------------- | ------------------------------------------------------------- |
| `permission denied` khi mount | Chown folder hoặc `--user 1001`                               |
| Docker build chậm             | Layer caching: copy `package*.json` trước, `COPY . .` sau     |
| Image to (>2GB)               | Dùng multi-stage, `.dockerignore`, không include node_modules |
| `npm ci` cache miss liên tục  | `package-lock.json` khác mỗi lần → check commit               |
| Chromium OOM in container     | `--ipc=host` hoặc `--shm-size=1gb`                            |
| Headed mode không hiện        | Linux container không có X11 — dùng headless hoặc xvfb        |
| Browser version mismatch      | Image version = `@playwright/test` version                    |

---

## 13. Best practices

- **Pin exact version** `mcr.microsoft.com/playwright:v1.59.1-jammy` (không `:latest`)
- **Multi-stage Dockerfile** — deps + runtime
- **Layer caching** — copy `package*.json` → `npm ci` → copy rest
- **`.dockerignore`** — loại bỏ build context không cần
- **Non-root user** — security
- **Versioned images on GHCR** — reuse trong pipeline

---

## 14. Checklist Day 21 + tuần 3

### Day 21 specific

- [ ] Dockerfile build
- [ ] Run tests trong container
- [ ] Docker Compose work
- [ ] Visual test consistent local vs Docker

### Tuần 3 tổng

- [ ] 35+ tests across 5 types
- [ ] Multi-env config
- [ ] CI 4 shards xanh
- [ ] Allure report deployed
- [ ] Docker build working
- [ ] README portfolio-quality
- [ ] 7+ commits tuần này
- [ ] NOTES.md week 3 retro

---

## 15. Tự đánh giá cuối tuần 3

| Câu hỏi                                               | Check |
| ----------------------------------------------------- | ----- |
| Giải thích visual regression pros/cons?               | ☐     |
| A11y impact levels (critical/serious/moderate/minor)? | ☐     |
| Core Web Vitals (LCP/FID/CLS) là gì?                  | ☐     |
| `page.route()` scenarios bạn dùng?                    | ☐     |
| Workflow CI có mấy jobs, flow?                        | ☐     |
| Reporter cho audience nào?                            | ☐     |
| Docker tại sao cho visual test?                       | ☐     |

---

## 16. Ready for Week 4?

Week 4 là phần "modern tester" — AI, agentic engineering, MCP, portfolio, interview.

**→** [Week 4 Overview](../week-4-ai-portfolio/README.md)
**→** [Day 22 — Claude Code / Cursor cho Tester](../week-4-ai-portfolio/day-22-claude-code-cursor.md)

---

## Resources

- [Playwright — Docker](https://playwright.dev/docs/docker)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Dockerfile linter hadolint](https://github.com/hadolint/hadolint)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Docker in 100 seconds (Fireship)](https://www.youtube.com/watch?v=Gjnup-PuquQ)
- [Dockerfile best practices](https://www.youtube.com/results?search_query=dockerfile+best+practices)
- [Playwright + Docker setup](https://www.youtube.com/results?search_query=playwright+docker)
- [Docker Compose tutorial](https://www.youtube.com/watch?v=HG6yIjZapSA) — freeCodeCamp

### 📝 Articles & blogs

- [Playwright — Docker docs](https://playwright.dev/docs/docker)
- [Docker images for Playwright](https://mcr.microsoft.com/en-us/product/playwright/about)
- [Multi-stage build patterns](https://docs.docker.com/build/building/multi-stage/)
- [Cache optimization in Docker builds](https://docs.docker.com/build/cache/)

### 🎓 Deep topics

- [Docker BuildKit](https://docs.docker.com/build/buildkit/) — modern builder
- [Docker layer caching explained](https://dev.to/search?q=docker+layer+caching)
- [Container security best practices](https://snyk.io/learn/container-security/)
- [Distroless images](https://github.com/GoogleContainerTools/distroless)

### 📖 Books

- _Docker Deep Dive_ — Nigel Poulton (concepts)
- _The Docker Book_ — James Turnbull

### 🐙 Related GitHub repos

- [microsoft/playwright — Dockerfile source](https://github.com/microsoft/playwright/blob/main/utils/docker/Dockerfile.jammy)
- [hadolint/hadolint](https://github.com/hadolint/hadolint) — Dockerfile linter
- [dive (image layer explorer)](https://github.com/wagoodman/dive)

### 🛠️ Tools

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Podman](https://podman.io/) — Docker alternative
- [Dive](https://github.com/wagoodman/dive) — inspect image layers
- [Hadolint](https://github.com/hadolint/hadolint) — lint Dockerfiles
- [BuildKit](https://docs.docker.com/build/buildkit/) — faster builds

### 📊 Cheat sheets

- [Dockerfile reference](https://docs.docker.com/engine/reference/builder/)
- [Docker Compose reference](https://docs.docker.com/compose/compose-file/)
- [Docker CLI cheatsheet](https://docs.docker.com/get-started/docker_cheatsheet.pdf)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (container basics)

**B1.** Build image, run tests, mount reports:

```bash
docker build -t pw-tests .
docker run --rm -v $(pwd)/playwright-report:/app/playwright-report pw-tests
open playwright-report/index.html
```

**B2.** Pass env vars:

```bash
docker run --rm \
  -e TEST_ENV=staging \
  -e BASE_URL=$BASE_URL \
  pw-tests
```

**B3.** Docker Compose minimal:

```yaml
services:
  tests:
    build: .
    volumes:
      - ./playwright-report:/app/playwright-report
    environment:
      - TEST_ENV=dev
```

### 🟡 Trung bình (optimize, multi-stage)

**M1.** Multi-stage Dockerfile:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.59.1-jammy AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM mcr.microsoft.com/playwright:v1.59.1-jammy AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["npx", "playwright", "test"]
```

Compare image size với single-stage.

**M2.** Non-root user:

```dockerfile
RUN groupadd -g 1001 pw && useradd -u 1001 -g pw -s /bin/bash -m pw
USER pw
```

Verify container không run as root.

**M3.** Docker layer caching optimization:

```dockerfile
# 1. Lock file first (changes less often)
COPY package.json package-lock.json ./
RUN npm ci

# 2. Then source (changes often)
COPY . .
```

Rebuild after code change → should be fast (only source layer rebuilt).

**M4.** `.dockerignore` thorough:

```
node_modules
.git
.env
.env.*
!.env.example
playwright-report
test-results
coverage
*.md
```

### 🔴 Nâng cao (production)

**A1.** CI with Docker — GitHub Actions:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.59.1-jammy
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright test
```

**A2.** Build custom image, push to GHCR:

```yaml
- uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}

- uses: docker/build-push-action@v5
  with:
    push: true
    tags: ghcr.io/user/pw-tests:latest
```

**A3.** BuildKit cache mounts:

```dockerfile
# syntax=docker/dockerfile:1.4
RUN --mount=type=cache,target=/root/.npm \
  npm ci
```

Faster rebuilds in CI.

**A4.** Image scanning:

```bash
docker scan pw-tests          # built-in
trivy image pw-tests          # Trivy scanner
```

Fix vulnerabilities.

### 🏆 Mini challenge (60 phút)

**Task:** Production-ready Docker setup:

1. Multi-stage Dockerfile
2. Non-root user
3. Layer-optimized
4. `.dockerignore` comprehensive
5. Docker Compose với env injection
6. CI integration (GHA container)
7. Image scan passing (no CRITICAL/HIGH CVE)
8. Image size <1GB
9. Build time <3 min cold, <30s warm

### 🌟 Stretch goal

Build image for ARM64 (Apple Silicon) + AMD64 multi-arch với `docker buildx`.

---

## 🏆 Mini project tuần 3 — Test Pyramid (expanded)

Build full pyramid cho 1 app (chọn demoblaze hoặc automationexercise):

**Layer 1 — Unit** (nếu có, use Vitest):

- 10 helper function tests

**Layer 2 — API** (Playwright):

- 15 tests covering CRUD, auth, error cases
- Zod schema validation

**Layer 3 — Integration** (API + data):

- 5 tests combining multiple endpoints

**Layer 4 — E2E UI** (Playwright):

- 10 critical flow tests
- Storage state auth
- Fixtures

**Layer 5 — Visual** (Playwright snapshots):

- 3 pages
- Masked dynamic
- Docker consistent

**Layer 6 — A11y** (axe-core):

- 4 pages WCAG AA

**Layer 7 — Performance** (Lighthouse/Core Vitals):

- 2 pages with budget

**Infrastructure:**

- Multi-env (dev, staging)
- 4-shard CI parallel
- Docker for visual consistency
- Allure + HTML + JUnit reports
- GitHub Pages deploy report
- Slack alerts

**Deliverable:**

- README professional
- Architecture diagram (mermaid)
- CI 7+ days green
- Blog post draft
