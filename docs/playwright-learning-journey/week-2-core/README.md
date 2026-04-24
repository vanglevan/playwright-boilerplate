# Tuần 2 — Core Skills (Day 8-14)

> **Goal:** Master fixtures, data-driven, auth state, API testing, parallelization — những kỹ năng phân biệt junior với mid-level automation tester.

---

## Overview

Sau tuần 1, bạn viết được test. Tuần 2, bạn viết được test **scale được** — 100 tests chạy parallel, data động, auth share, API + UI phối hợp.

**Skills đạt được cuối tuần:**

- Fixtures (dependency injection) — auto-inject dependencies vào test
- Faker.js cho data động; static JSON cho data cố định
- Multi-environment config với Zod validation
- Auth state — login 1 lần, reuse cho 100 tests
- API testing với `APIRequestContext`
- Parallel execution, sharding, retries
- Debug như senior (trace viewer, inspector)

---

## Kế hoạch chi tiết

| Ngày                                | Chủ đề               | Deliverable                               |
| ----------------------------------- | -------------------- | ----------------------------------------- |
| [8](./day-08-fixtures.md)           | Fixtures (DI)        | Fixture merge pattern hoạt động           |
| [9](./day-09-test-data-faker.md)    | Test Data & Faker    | `buildUser()`, `buildProduct()` factories |
| [10](./day-10-env-config.md)        | Env Config + Zod     | 3 env files: dev/staging/prod             |
| [11](./day-11-auth-state.md)        | Auth State           | Login 1 lần, 10 tests dùng chung          |
| [12](./day-12-api-testing.md)       | API Testing          | `src/api/` với typed client               |
| [13](./day-13-parallel-sharding.md) | Parallel/Shard/Retry | Chạy `--shard=1/4` hiểu                   |
| [14](./day-14-debugging.md)         | Debug + Mini project | 15 tests e-commerce flow                  |

---

## Câu thần chú tuần 2

> "Fixtures replace duplication. Parallel reveals dependencies. API is 100x faster than UI."

---

## Dự án end-of-week

E-commerce flow hoàn chỉnh:

- Register via API (nhanh)
- Login via UI once, reuse state
- Data-driven test với 5 users random
- Parallel 4 workers
- Mix API setup + UI test

---

## Self-check cuối tuần 2

- [ ] Viết được custom fixture typed
- [ ] Hiểu storage state trick
- [ ] API test chạy < 1s mỗi test
- [ ] Tests independent, chạy `--workers=8` không fail
- [ ] Debug 1 flaky test bằng trace viewer trong 10 phút
