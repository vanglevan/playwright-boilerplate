# Verification Checklist — cuối Day 30

> Dùng để xác định "có sẵn sàng apply fullstack/senior automation tester chưa". Trả lời honest — không ai nhìn.

---

## 1. Code challenge (1 giờ, self-timed)

**Task:** Cho URL lạ (e.g., https://the-internet.herokuapp.com hoặc bất kỳ app nào bạn chưa thấy). Trong 1 giờ:

- [ ] Init Playwright project (clean, không boilerplate)
- [ ] Viết 10 tests covering 3+ feature
- [ ] Dùng POM (≥ 2 page objects)
- [ ] Dùng fixtures
- [ ] Dùng data factory cho signup/form
- [ ] Tests xanh với `--workers=4`
- [ ] `npm run typecheck` + `npm run lint` xanh

**Không nhìn:**

- Repo cũ của bạn
- Stack Overflow
- Tài liệu cũ

**Được nhìn:** [playwright.dev/docs](https://playwright.dev/docs) (official only)

**Passing:** 8/10 checklist above.

---

## 2. Debug challenge (15 phút)

Cho 1 test flaky (fail 30% runs). Bạn phải:

- [ ] Reproduce consistently bằng `--repeat-each`
- [ ] Mở trace viewer, xác định step fail
- [ ] Identify root cause category (race / locator / timing / data)
- [ ] Propose 3 fixes ranked by probability
- [ ] Apply 1 fix → verify xanh 10 runs

**Scenarios to practice:**

- Race condition (API response vs UI action)
- Wrong locator matching nhiều elements
- Animation chưa xong
- Timezone bug in assertion

---

## 3. Architecture challenge

Cho scenario: team 50 người, 5 repos, cần test strategy.

**Design document (không code):**

- [ ] Test pyramid distribution (unit/integration/E2E %)
- [ ] Ownership model (who writes what?)
- [ ] CI strategy (sharding, matrix, branch rules)
- [ ] Flaky test culture (metric, response)
- [ ] Tool choice (Playwright? Why? Vs alternatives?)
- [ ] Metrics to track
- [ ] Onboarding new tester plan

**Format:** 1-page doc + simple diagram (mermaid/draw.io)

**Passing:** Document defensible — có thể answer "why" for each decision.

---

## 4. AI challenge

Given: bug report (manually crafted hoặc real từ GitHub). Task:

- [ ] Dùng Claude Code với Playwright MCP
- [ ] Reproduce bug trong browser
- [ ] Auto-generate regression test
- [ ] Review + polish AI output
- [ ] Open PR

**Time:** 30 phút

**Passing:** PR opens in <30 min với working test, quality giống bạn write từ đầu.

---

## 5. Portfolio check

### Repository

- [ ] Public GitHub repo
- [ ] CI xanh 7+ ngày liên tiếp
- [ ] 30+ commits chronological
- [ ] 20+ tests across 5 types (E2E, API, visual, a11y, perf)
- [ ] Tagged release v1.0

### README

- [ ] Badges: CI status, Node version, Playwright version
- [ ] Demo GIF / video
- [ ] Architecture diagram
- [ ] Tech stack table
- [ ] Clear scripts documentation
- [ ] Live Allure/HTML report link
- [ ] Link to blog post

### Code quality

- [ ] `npm run check` xanh
- [ ] TypeScript strict mode
- [ ] ESLint + Prettier + Husky
- [ ] No `any` (hoặc comment explaining)
- [ ] No `waitForTimeout`
- [ ] No `test.only` / `.skip` (trừ khi có reason)

### Docs

- [ ] NOTES.md completed 30 days
- [ ] AI_WORKFLOW.md với 10 rules + 5 templates
- [ ] `.claude/` commands commit (shareable)
- [ ] ROADMAP.md next 90 days

### External presence

- [ ] Blog post published (dev.to / medium / personal)
- [ ] LinkedIn post shared
- [ ] Pin repo on GitHub profile
- [ ] Joined 2+ communities

---

## 6. Knowledge check (30 questions no lookup)

### Playwright (10)

- [ ] 1. Why Playwright over Selenium/Cypress?
- [ ] 2. Locator priority (list 6)
- [ ] 3. What is auto-waiting?
- [ ] 4. When OK to `waitForTimeout`?
- [ ] 5. Fixture vs beforeEach — key differences
- [ ] 6. Storage state purpose & flow
- [ ] 7. Visual test pros/cons
- [ ] 8. Parallel failure root causes
- [ ] 9. Fix flaky test process
- [ ] 10. API testing speed vs UI

### Strategy (10)

- [ ] 11. Test pyramid vs trophy
- [ ] 12. When NOT to automate
- [ ] 13. POM drawbacks + alternatives
- [ ] 14. Test data strategies (3)
- [ ] 15. Test naming convention
- [ ] 16. CI strategy per branch
- [ ] 17. Tag system design
- [ ] 18. Flaky test culture
- [ ] 19. Contract testing concept
- [ ] 20. When use mocks vs real

### Portfolio (10)

- [ ] 21. Walk through your repo 2 min
- [ ] 22. Biggest technical decision
- [ ] 23. What you'd refactor
- [ ] 24. How you use AI
- [ ] 25. Hardest bug found
- [ ] 26. Most proud of
- [ ] 27. What's missing (growth areas)
- [ ] 28. How to scale to team
- [ ] 29. Metrics you'd track
- [ ] 30. Why hire you

**Passing:** 25/30 confident answers.

---

## 7. Scoring

| Challenge               | Weight | Your score |
| ----------------------- | ------ | ---------- |
| Code challenge (8/10)   | 20%    | \_\_\_     |
| Debug challenge         | 15%    | \_\_\_     |
| Architecture challenge  | 15%    | \_\_\_     |
| AI challenge            | 10%    | \_\_\_     |
| Portfolio               | 25%    | \_\_\_     |
| Knowledge check (25/30) | 15%    | \_\_\_     |

### Interpretation

| Score  | Readiness                                                                                 |
| ------ | ----------------------------------------------------------------------------------------- |
| 90%+   | Ready to apply **senior** automation positions (with honest "1 year experience" language) |
| 75-90% | Ready to apply **mid-level**, competitive for fullstack tester                            |
| 60-75% | Ready for **junior** automation role, identify 2 gaps to close first                      |
| <60%   | Back to Week 2-3 topics, gap analysis, retry in 2 weeks                                   |

---

## 8. Gap analysis template

Nếu thiếu, identify specifically:

```markdown
## My Gaps (honest)

### Conceptual

- [ ] Gap 1: [e.g., "Not confident explaining worker-scoped fixtures"]
  - Plan: Re-read Day 8 + practice with 3 custom fixtures
  - Timeline: 3 days

### Practical

- [ ] Gap 2: [e.g., "Never deployed Allure report to public"]
  - Plan: Finish Day 28 Bài 3
  - Timeline: 1 day

### Interview prep

- [ ] Gap 3: [e.g., "Ramble >3 min per question"]
  - Plan: Record self, edit answers to 60-90s
  - Timeline: 1 week practice
```

---

## 9. Don't obsess over 100%

30 days is start, not end.

**Realistic expectation:**

- 60-75% after 30 days = normal
- 85%+ = exceptional
- 100% = probably overfit (skills untested in wild)

Apply with 70%+. Real job will force growth to 90%.

---

## 10. Next checkpoint: Day 60

Set calendar reminder 30 days from now. Re-run this checklist.

**Expected:** 10-15% improvement in every category by Day 60 (through applying, interviews, ongoing practice).

If no improvement → identify blocker:

- Not applying?
- Not getting interviews?
- Interviews going badly?
- Burn out?

Address specifically.

---

## Final words

> "I'm a beginner-level automation engineer with 30 days of intense, structured, portfolio-driven experience — and the discipline to keep learning."

That's a true statement after Day 30. And it's compelling.

Apply. Interview. Learn. Iterate.
