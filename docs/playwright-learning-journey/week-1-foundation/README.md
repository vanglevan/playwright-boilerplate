# Tuần 1 — Nền tảng (Day 1-7)

> **Goal:** Tự dựng project Playwright from zero, chạy được test đầu tiên, nắm TypeScript đủ dùng, viết được POM và config code quality tools.

---

## Overview

Tuần 1 là tuần quan trọng nhất — xây móng. Nếu skip tuần này, về sau gặp concept nâng cao sẽ không hiểu sâu được.

**Skills đạt được cuối tuần:**

- JS/TS cơ bản cho testing (`async/await` là must)
- `npm init playwright` → hiểu từng file sinh ra
- 5 loại locators, biết priority
- Web-first assertions, auto-waiting
- Page Object Model (POM) pattern
- ESLint + Prettier + TypeScript strict mode

---

## Kế hoạch chi tiết

| Ngày                                     | Chủ đề                         | Deliverable                          |
| ---------------------------------------- | ------------------------------ | ------------------------------------ |
| [1](./day-01-js-ts-basics.md)            | JS/TS cơ bản cho Tester        | `scratch.ts` chạy được               |
| [2](./day-02-playwright-setup.md)        | Dựng Playwright project        | Test mẫu chạy xanh                   |
| [3](./day-03-locators.md)                | Locators & Selectors           | `first.spec.ts` với 3+ locator types |
| [4](./day-04-assertions-auto-waiting.md) | Assertions & Auto-waiting      | 5 assertion styles khác nhau         |
| [5](./day-05-page-object-model.md)       | Page Object Model              | `src/pages/` với 2 page objects      |
| [6](./day-06-linting-tooling.md)         | Tooling (ESLint, Prettier, TS) | Pre-commit hook chạy OK              |
| [7](./day-07-review.md)                  | Review + Mini project          | 5+ tests trên demo site              |

---

## Anti-patterns cần tránh cả tuần

- `page.waitForTimeout(3000)` — dùng web-first assertions thay thế
- CSS selectors dài `.container > div:nth-child(2) > span`
- Duplicate locator trong nhiều test files
- `beforeAll` setup DB (tests không còn independent)
- Copy-paste từ AI mà không đọc

---

## Self-check cuối tuần 1

- [ ] Giải thích được `async/await` cho bạn bè
- [ ] Viết POM không nhìn docs
- [ ] Hiểu tại sao không dùng `waitForTimeout`
- [ ] Lint/format tự chạy trên save
- [ ] Commit ≥7 lần, push lên GitHub đều đặn
