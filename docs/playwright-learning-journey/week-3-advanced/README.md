# Tuần 3 — Nâng cao (Day 15-21)

> **Goal:** Mở rộng test coverage beyond functional — visual, a11y, performance. Setup CI/CD, reporters, Docker production-ready.

---

## Overview

Tuần 3 phân biệt junior với mid-level tester. Không chỉ test "feature work" mà còn test "app ship được":

- Visual regression — UI không lệch sau deploy
- Accessibility — user khuyết tật dùng được
- Performance — user không chạy lên vì chậm
- Mocking — test edge case network không thể gặp thật
- CI/CD — team push code là biết ngay có vỡ gì

---

## Kế hoạch chi tiết

| Ngày                                | Chủ đề                   | Deliverable                   |
| ----------------------------------- | ------------------------ | ----------------------------- |
| [15](./day-15-visual-regression.md) | Visual Regression        | Baseline + diff detection     |
| [16](./day-16-accessibility.md)     | Accessibility (axe-core) | A11y report với impact        |
| [17](./day-17-performance.md)       | Performance budgets      | FP/FCP/LCP thresholds         |
| [18](./day-18-network-mocking.md)   | Network mocking          | 3 scenarios: slow/error/empty |
| [19](./day-19-ci-cd.md)             | CI/CD GitHub Actions     | Workflow matrix + reports     |
| [20](./day-20-reporters.md)         | Allure + Monocart        | HTML deploy GitHub Pages      |
| [21](./day-21-docker.md)            | Docker + Mini project    | Consistent env + pyramid      |

---

## Skills đạt được

- Snapshot testing với `toHaveScreenshot`
- WCAG 2.1 AA compliance basics
- Core Web Vitals (LCP, FID, CLS)
- `page.route()` cho mock/intercept
- GitHub Actions matrix + artifact merge
- Allure (business report) + Monocart (detailed)
- Docker for test consistency

---

## Mini project cuối tuần

Test pyramid hoàn chỉnh cho 1 web app demo:

- 10 API tests
- 10 E2E tests (core flow)
- 3 visual tests
- 3 a11y tests (home, product, checkout)
- 2 performance tests (LCP budget)

Toàn bộ chạy CI xanh, report public link.
