# Lộ trình 30 ngày học Playwright Automation Testing from Scratch

> **Dành cho:** Manual tester chưa có kinh nghiệm automation
> **Mục tiêu:** Trở thành fullstack tester trong thời đại AI
> **Phiên bản:** 2026.04 — Playwright 1.59+, Node 20+
> **Approach:** Học from scratch, tự tay gõ từng dòng — không dùng template/boilerplate

---

## Triết lý học

1. **70% thực hành, 20% đọc code, 10% lý thuyết** — không watch tutorial quá 30 phút/ngày
2. **Commit daily** lên GitHub — timeline chính là portfolio
3. **Mỗi bug/lỗi → viết 1 dòng trong `NOTES.md`** — đó là kiến thức thực sự của bạn
4. **Dùng AI như sensei, không phải ghostwriter** — luôn hỏi "tại sao", không chỉ "làm sao"
5. **Khi stuck >30 phút → hỏi AI/Google** — đừng stuck 2 tiếng

---

## Navigation

### Chuẩn bị (trước Day 1)

- [00 — Preparation & Setup](./00-preparation.md)

### Tuần 1: Nền tảng — [Overview](./week-1-foundation/README.md)

| Ngày | Chủ đề                                  | Link                                                       |
| ---- | --------------------------------------- | ---------------------------------------------------------- |
| 1    | JavaScript/TypeScript cơ bản cho Tester | [→](./week-1-foundation/day-01-js-ts-basics.md)            |
| 2    | Dựng Playwright project from zero       | [→](./week-1-foundation/day-02-playwright-setup.md)        |
| 3    | Locators & Selectors                    | [→](./week-1-foundation/day-03-locators.md)                |
| 4    | Assertions & Auto-waiting               | [→](./week-1-foundation/day-04-assertions-auto-waiting.md) |
| 5    | Page Object Model (POM)                 | [→](./week-1-foundation/day-05-page-object-model.md)       |
| 6    | TypeScript config, ESLint, Prettier     | [→](./week-1-foundation/day-06-linting-tooling.md)         |
| 7    | Tổng kết tuần 1 + Mini project          | [→](./week-1-foundation/day-07-review.md)                  |

### Tuần 2: Core Skills — [Overview](./week-2-core/README.md)

| Ngày | Chủ đề                             | Link                                           |
| ---- | ---------------------------------- | ---------------------------------------------- |
| 8    | Fixtures (dependency injection)    | [→](./week-2-core/day-08-fixtures.md)          |
| 9    | Test Data & Faker                  | [→](./week-2-core/day-09-test-data-faker.md)   |
| 10   | Environment Config + `.env` + Zod  | [→](./week-2-core/day-10-env-config.md)        |
| 11   | Auth State (Storage State)         | [→](./week-2-core/day-11-auth-state.md)        |
| 12   | API Testing với Playwright         | [→](./week-2-core/day-12-api-testing.md)       |
| 13   | Parallelization, Sharding, Retries | [→](./week-2-core/day-13-parallel-sharding.md) |
| 14   | Debug như senior + Mini project    | [→](./week-2-core/day-14-debugging.md)         |

### Tuần 3: Nâng cao — [Overview](./week-3-advanced/README.md)

| Ngày | Chủ đề                            | Link                                               |
| ---- | --------------------------------- | -------------------------------------------------- |
| 15   | Visual Regression Testing         | [→](./week-3-advanced/day-15-visual-regression.md) |
| 16   | Accessibility (A11y) với axe-core | [→](./week-3-advanced/day-16-accessibility.md)     |
| 17   | Performance Testing               | [→](./week-3-advanced/day-17-performance.md)       |
| 18   | Network Mocking & Routing         | [→](./week-3-advanced/day-18-network-mocking.md)   |
| 19   | CI/CD với GitHub Actions          | [→](./week-3-advanced/day-19-ci-cd.md)             |
| 20   | Reporters (HTML, Allure, JUnit)   | [→](./week-3-advanced/day-20-reporters.md)         |
| 21   | Docker + Mini project             | [→](./week-3-advanced/day-21-docker.md)            |

### Tuần 4: AI + Agentic + Portfolio — [Overview](./week-4-ai-portfolio/README.md)

| Ngày | Chủ đề                          | Link                                                     |
| ---- | ------------------------------- | -------------------------------------------------------- |
| 22   | Claude Code / Cursor cho Tester | [→](./week-4-ai-portfolio/day-22-claude-code-cursor.md)  |
| 23   | AI-Assisted Test Generation     | [→](./week-4-ai-portfolio/day-23-ai-test-generation.md)  |
| 24   | Agentic Engineering cho Tester  | [→](./week-4-ai-portfolio/day-24-agentic-engineering.md) |
| 25   | AI Best Practices (10 rules)    | [→](./week-4-ai-portfolio/day-25-ai-best-practices.md)   |
| 26   | MCP Servers & Custom Workflows  | [→](./week-4-ai-portfolio/day-26-mcp-servers.md)         |
| 27   | Claude Code Power Features      | [→](./week-4-ai-portfolio/day-27-claude-code-power.md)   |
| 28   | Portfolio Polish                | [→](./week-4-ai-portfolio/day-28-portfolio.md)           |
| 29   | Interview Prep                  | [→](./week-4-ai-portfolio/day-29-interview-prep.md)      |
| 30   | Showcase + Roadmap tiếp theo    | [→](./week-4-ai-portfolio/day-30-showcase.md)            |

### Resources

- [Tools & Softwares](./resources/tools-softwares.md)
- [Documents & Links](./resources/documents-links.md)
- [GitHub Repos tham khảo](./resources/github-repos.md)
- [Best Practices Cheatsheet](./resources/best-practices-cheatsheet.md)
- [Daily Notes Template](./resources/daily-notes-template.md)
- [Verification Checklist (ngày 30)](./resources/verification-checklist.md)

---

## Sau 30 ngày bạn sẽ có

- 1 repo `playwright-learning-journey` public trên GitHub — viết 100% từ tay
- Viết được E2E, API, Visual, A11y, Performance tests độc lập
- Hiểu POM, Fixtures, CI/CD, reporters ở mức vận hành được
- Biết dùng Claude Code / Cursor / MCP như pair programmer
- 1 blog post chia sẻ hành trình → credibility để apply job

---

## Cấu trúc project cuối Day 30

```
playwright-learning-journey/
├── .github/workflows/playwright.yml
├── .claude/
│   ├── commands/                 # slash commands tự tạo
│   └── settings.json             # hooks + MCP config
├── src/
│   ├── pages/                    # POM
│   ├── fixtures/                 # test fixtures
│   ├── api/                      # API client + endpoints
│   ├── config/                   # env.ts (zod-validated)
│   ├── helpers/                  # logger, wait, data-factory
│   └── data/                     # static JSON fixtures
├── tests/
│   ├── e2e/
│   ├── api/
│   ├── visual/
│   ├── a11y/
│   └── performance/
├── Dockerfile
├── playwright.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── package.json
├── README.md                     # portfolio-quality
├── NOTES.md                      # learning journal
├── AI_WORKFLOW.md                # AI style guide cá nhân
└── .env.example
```

---

## Cách dùng tài liệu này

1. **Mỗi sáng:** Mở file ngày hôm đó, đọc phần "Goal" và "Prerequisites"
2. **Học theo thứ tự:** Theory → Code examples → Exercises → Pitfalls → Checklist
3. **Trước khi đi ngủ:** Tick checklist, commit, ghi `NOTES.md`
4. **Cuối tuần:** Mở `week-N/README.md` review tổng thể

Bắt đầu tại [00-preparation.md](./00-preparation.md).
