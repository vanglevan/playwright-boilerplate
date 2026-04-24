# Day 29 — Interview Prep

> **Goal:** Prepare answers cho 30 câu hỏi phổ biến. Biết cách "show off" portfolio trong 2 phút.
> **Thời gian:** 3-4 giờ

---

## Prerequisites

- Portfolio ở Day 28 hoàn thành

---

## 1. 3 loại câu hỏi phỏng vấn

| Type                    | Example                                 | Prep           |
| ----------------------- | --------------------------------------- | -------------- |
| **Behavioral**          | "Tell me about flaky test you debugged" | STAR framework |
| **Conceptual**          | "Pyramid vs trophy testing?"            | Understanding  |
| **Technical deep-dive** | "Walk through your POM design"          | Your portfolio |

---

## 2. The 30 Questions

### A. Playwright-specific (10)

**Q1: Why Playwright over Cypress/Selenium?**

Good answer:

- Playwright: multi-browser engine, parallel by default, auto-wait web-first, faster
- Cypress: single-browser (+Firefox/Edge experimental), better debug UI, but slower cross-browser
- Selenium: mature, language options, but verbose, less modern
- "For new projects, Playwright trade-offs win. Selenium still for enterprise with deep investment."

**Q2: Locator priority?**
`getByRole > getByLabel > getByPlaceholder > getByText > getByTestId > CSS > XPath`. Reason: resilient to UI changes, accessible-first.

**Q3: What is auto-waiting?**
Playwright trước mọi action check: attached, visible, stable, receives events, enabled. Timeout default 30s. No need `sleep()`.

**Q4: `page.waitForTimeout()` — when OK?**
Debug local only. Never commit. It's flakiness amplifier.

**Q5: Fixture vs beforeEach?**
Fixture: typed, reusable cross-file, merges, injected by name. BeforeEach: scoped to describe, shared via `let` (not type-safe).

**Q6: Storage state purpose?**
Login once, save cookies/localStorage to JSON, reuse across tests. 10-50x faster than UI login per test.

**Q7: Visual test — pros/cons?**
Pros: catch CSS regression. Cons: flaky (font/animation), baseline maintenance. Use for critical UI only, 10-15% of suite.

**Q8: Parallel — when break?**
When tests share state (let variables, DB record by hardcoded ID). Fix: factory-per-test, fixtures, no shared mutable.

**Q9: How to make flaky test stable?**
Root cause ∈ {race condition, bad locator, animation, test data pollution, network}. Process: reproduce with `--repeat-each=10` → trace viewer → identify → fix. Never retry.

**Q10: API testing với Playwright?**
`APIRequestContext` built-in (no axios needed). Combine with UI tests: setup via API (fast) + verify via UI. Validate schema via Zod.

---

### B. Strategy / Design (10)

**Q11: Test pyramid?**
70% unit (dev), 20% integration/API, 10% E2E. Trophy: similar but integration-heavy. Choose based on app (backend-heavy → pyramid; frontend SPA → trophy).

**Q12: When NOT to automate?**

- Exploratory testing
- One-off scripts
- UI changing daily
- Test is cheaper to maintain manually than code

**Q13: POM drawback?**

- Giant page objects (>500 lines)
- Inheritance hell
- Over-abstraction

Alternatives: App Actions (functional), Screenplay (tester-centric). POM OK default; switch for scale.

**Q14: Page Object vs Component Object?**
POM: per page. Component Object: reusable UI blocks (header, modal). Both: composition > inheritance.

**Q15: Test data strategy?**

- Static for credentials (env-aware)
- Faker for unique data per test
- Seeded for reproducibility
- Never hardcode production data
- Cleanup via API after test

**Q16: Test naming convention?**
Describe behavior, not implementation.

- ✅ "user sees error when password is empty"
- ❌ "test loginPassword validation"

**Q17: What tests on CI? All?**

- PR: smoke + affected tests (grep tag)
- Main: full regression
- Nightly: full + visual + a11y + perf
- Prod: smoke synthetic hourly

**Q18: Tag system?**
`@smoke` `@critical` `@regression` `@slow` `@flaky` — filter via `--grep`. Separate concerns.

**Q19: Flaky test culture?**

- Track in ticket (JIRA flag)
- Quarantine suite (separate project)
- Fix rate expectation (5/week per engineer)
- Don't ignore for weeks

**Q20: Contract testing?**
[Pact](https://docs.pact.io/) — consumer (frontend) define expectation; producer (backend) verify. Catches breaking API changes before E2E.

---

### C. Your Portfolio (10)

Tailor these to your repo. Example answers based on what you built:

**Q21: Walk through your repo structure.**

- `src/pages/` POM
- `src/api/` typed client + Zod schemas
- `src/fixtures/` merged DI
- `src/config/` env with Zod validation
- 5 test types (E2E, API, visual, a11y, perf)
- `.github/workflows/` 4-shard matrix + Allure deploy

**Q22: Biggest technical decision?**
E.g., "Chose storage state over UI login — 10x speedup in suite. Trade-off: extra setup project + staleness management."

**Q23: What would you refactor?**
Show humility. E.g., "POM classes for niche pages — maybe overkill. Could use App Actions for single-use flows. Also: visual tests need Docker consistency — currently fails locally on macOS fonts."

**Q24: How do you use AI?**
Describe `AI_WORKFLOW.md` briefly.

- Generate draft, YOU refactor
- AI for negative case brainstorming
- MCP for bug-to-test
- Never paste credentials
- Measure — drop if net negative

**Q25: Hardest bug found?**
Pick real story. STAR:

- Situation: flaky checkout test, 30% fail
- Task: stabilize in 2 days
- Action: trace → race condition between UI button enable and API response → waitForResponse sync
- Result: 0/100 failures over 2 weeks

**Q26: Most proud of?**
Can be: full pipeline green, AI workflow docs, clean POM design, data-driven negative test catching real bug.

**Q27: What's missing / would you add?**

- Contract tests (Pact)
- Load (k6)
- Mobile (Appium)
- More a11y coverage
  Show growth mindset.

**Q28: How would you scale to team?**

- `.claude/` commands for consistency
- CLAUDE.md conventions
- Shared fixtures package
- Test pyramid ownership (dev unit, QA integration+E2E)
- Flaky dashboard

**Q29: Metrics you'd track?**

- Test suite duration
- Flaky rate
- Coverage by feature (not just LOC)
- Escape defects (bugs found in prod vs test)
- Time-to-feedback on PR

**Q30: Why hire you?**

- Manual tester DNA (know UX, edge cases)
- Automation skills (30-day proof in repo)
- AI-native workflow (productivity edge)
- Communication (blog post)
- Growth trajectory visible

---

## 3. STAR framework cho behavioral

**S**ituation — context  
**T**ask — what you needed to do  
**A**ction — what YOU did (not team)  
**R**esult — measurable outcome

**Example:**

> S: In my previous manual testing role, regression took 3 days and missed edge cases.  
> T: Reduce regression time and catch issues consistently.  
> A: Learned Playwright in 30 days, built automated suite covering critical flows, integrated with CI.  
> R: Regression now 30 min automated. Caught 3 issues manual missed. Unblocked faster releases.

Even if hypothetical — be clear it's "what I'd do" vs past experience.

---

## 4. Questions to ASK interviewers

Show engagement. Good questions:

1. **Testing culture**: Who owns testing? Dev+QA partnership or silo?
2. **Flaky test rate**: Currently tracked? Strategy?
3. **AI adoption**: Team using any AI tools? Standards?
4. **Stack evolution**: How decisions made for test infra?
5. **Recent bug**: One that escaped to prod — post-mortem approach?
6. **Career path**: What's next after this role for me?

**Skip:**

- Salary (research first, discuss with recruiter)
- Benefits (obvious googling)
- "Do you like working here?" (boring)

---

## 5. Mock interview format

Pair with friend / use AI:

### 30-min session

- 5 min: warm-up (experience, why Playwright)
- 15 min: 5 questions mixed (Playwright + strategy + portfolio)
- 5 min: live coding or walkthrough
- 5 min: you ask questions

### Live coding likely tasks

- "Write a Playwright test for [URL]" — 10 min
- "Debug this failing test" — walkthrough
- "Refactor this POM" — discussion

**Prep:** Bookmark 3 demo URLs you can write tests fluently:

- https://demo.playwright.dev/todomvc
- https://www.saucedemo.com
- https://the-internet.herokuapp.com

---

## 6. Red flags nhà tuyển dụng

Notice these:

- ❌ No clear testing strategy (everything manual still)
- ❌ "We don't have time for tests"
- ❌ Flaky rate 30%+ with no fix culture
- ❌ No CI or CI broken weeks
- ❌ Automation team separate from dev (silo)

**Green flags:**

- ✅ Test suite <30 min feedback
- ✅ Flaky rate <5%
- ✅ Dev write tests too
- ✅ Modern stack (Playwright, GitHub Actions, cloud)
- ✅ Blameless post-mortems

---

## 7. Salary negotiation basics

Research first:

- [Glassdoor](https://www.glassdoor.com/) — role + location
- [Levels.fyi](https://www.levels.fyi/) — tech-heavy
- Vietnam-specific: [Topdev](https://topdev.vn/), [VietnamWorks](https://www.vietnamworks.com/)

Range: junior automation tester VN Q2 2026 khoảng 15-25M VND, mid 25-40M, senior 40-60M+ (varies a lot).

**Don't give number first.** "What's the range for this role?" puts ball in their court.

---

## 8. Bài tập

### Bài 1: Answer 10 questions written

Choose 10/30 questions. Write 3-5 sentence answer each. Read aloud → sound natural?

### Bài 2: Record self

Phone record yourself answering 5 questions. Watch. Cringe. Improve.

### Bài 3: STAR stories

Prepare 3 STAR stories from your 30-day journey:

- Biggest technical challenge
- Best decision
- Lesson learned from mistake

### Bài 4: Mock with AI

```
Prompt to Claude:
"Act as hiring manager for automation tester role at mid-size SaaS company.
Interview me with 5 mixed questions (Playwright + strategy + behavioral).
Wait for my answer before next question.
After 5, give structured feedback."
```

### Bài 5: Prepare questions list

Finalize 5 questions you'll ask interviewer.

---

## 9. Common Pitfalls

| Pattern                                                | Fix                                                      |
| ------------------------------------------------------ | -------------------------------------------------------- |
| Rambling 3+ min answer                                 | Practice: aim for 1-2 min, structure                     |
| "I don't know" without grace                           | "I haven't done that, but here's how I'd approach it..." |
| Bashing previous employer                              | Neutral: "different priorities than mine"                |
| Over-selling (claiming senior expertise after 30 days) | "I have foundations; depth for X, growing in Y"          |
| No questions at end                                    | Always have 3+ prepared                                  |
| Not researching company                                | 10 min Google: product, recent news, tech blog           |

---

## 10. Day-of tips

- Sleep 8 hrs night before
- Eat well
- Test video setup 30 min early (if remote)
- Have notebook (physical or virtual)
- Portfolio repo open in tab
- Water nearby

---

## 11. Checklist

- [ ] 30 questions answers drafted
- [ ] 3 STAR stories ready
- [ ] 5 questions to ask prepared
- [ ] Mock interview done (AI or friend)
- [ ] Portfolio walkthrough <2 min
- [ ] NOTES.md: 3 most likely weakness questions + answers

---

## Resources

- [Glassdoor Interview Database](https://www.glassdoor.com/Interview/index.htm)
- [LeetCode Discuss — Interview Experiences](https://leetcode.com/discuss/interview-experience)
- [Interviewing.io](https://interviewing.io/) — practice tech interviews
- [Careercup](https://www.careercup.com/)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [QA Interview Questions (common)](https://www.youtube.com/results?search_query=qa+interview+questions+automation)
- [Playwright interview prep](https://www.youtube.com/results?search_query=playwright+interview)
- [Behavioral interview STAR technique](https://www.youtube.com/results?search_query=star+interview+technique)
- [How to negotiate salary (Patrick McKenzie)](https://www.youtube.com/results?search_query=patrick+mckenzie+salary+negotiation)

### 📝 Articles & blogs

- [Software Testing Interview Questions (Guru99)](https://www.guru99.com/software-testing-interview-questions.html)
- [Patrick McKenzie — Salary Negotiation](https://www.kalzumeus.com/2012/01/23/salary-negotiation/)
- [Levels.fyi compensation data](https://www.levels.fyi/)
- [QA career paths overview](https://dev.to/search?q=qa+career+path)

### 🎓 Free resources

- [interviewing.io — Free mock interviews](https://interviewing.io/)
- [Pramp — peer interviews](https://www.pramp.com/)
- [Exercism — coding practice](https://exercism.org/)

### 📖 Books

- _Cracking the Coding Interview_ — Gayle McDowell (general dev)
- _The Tech Resume Inside Out_ — Gergely Orosz
- _Staff Engineer: Leadership Beyond the Management Track_ — Will Larson (later career)

### 🐙 Related GitHub repos

- [kdeldycke/awesome-falsehood](https://github.com/kdeldycke/awesome-falsehood) — prep cho tricky questions
- [donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer) — if role system-focused

### 🛠️ Tools

- [Loom](https://www.loom.com/) — record practice
- [ChatGPT / Claude](https://claude.com/) — mock interview bot
- [Streak CRM for Gmail](https://www.streak.com/) — track applications

### 📊 Cheat sheets

- [STAR method template](https://www.themuse.com/advice/star-interview-method)
- [Common QA interview questions list](https://www.guru99.com/)
- [Tech interview checklist](https://github.com/yangshun/tech-interview-handbook)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (written prep)

**B1.** Answer 10/30 questions trong writing. 3-5 sentences each. Read aloud — natural?

**B2.** 3 STAR stories từ 30-day journey:

- Biggest technical challenge
- Best technical decision
- Lesson from mistake

Write timeline (3-5 sentences each section S/T/A/R).

**B3.** Portfolio walkthrough — practice 2-minute pitch:

- Problem context
- Tech stack overview
- 1-2 highlighted features
- Lessons learned
- What's next

Time yourself. Aim 2:00-2:30.

### 🟡 Trung bình (mock interviews)

**M1.** AI mock interview:

```
Claude, act as hiring manager for mid-level automation tester
at SaaS company. Interview me with 5 mixed questions
(Playwright + strategy + behavioral). Wait for each answer.
After 5, give structured feedback.
```

Record session. Review.

**M2.** Record self answering:
Phone record, 5 questions, 3 min each. Watch back:

- Filler words ("uh", "um")?
- Rambling?
- Confidence?
- Eye contact (if video)?

Improve 3 things, re-record.

**M3.** Technical deep-dive prep:

- Q: "Walk through your biggest test file"
- Practice opening IDE, showing code, explaining decisions
- 5 min limit

**M4.** Live coding practice:
On demo site (not practiced before), write 5 tests in 30 min. Explain thinking out loud.

### 🔴 Nâng cao (negotiation + soft skills)

**A1.** Research 5 companies you'd want to work for:

- Testing team (Glassdoor)
- Tech blog posts
- Recent news
- Open roles fit you?

Save notes for each.

**A2.** Prepare 5 questions to ASK interviewers:

- Testing culture
- Tech stack evolution
- Flaky test policy
- Dev/QA relationship
- Career path

**A3.** Salary research:

- [Glassdoor](https://www.glassdoor.com/)
- [Levels.fyi](https://www.levels.fyi/)
- [Topdev](https://topdev.vn/) (VN market)
- [Vietnamworks](https://www.vietnamworks.com/)

Define: floor, target, ceiling. Never quote first.

**A4.** Red flags list — what you AVOID in jobs:

- No automation culture
- "QA is bottleneck" attitude
- No CI or broken CI
- 30%+ flaky rate normalized
- QA reports to manual/ops, not eng

### 🏆 Mini challenge (60 phút)

**Task:** Full mock interview simulation:

Partner with friend or AI:

- 30 min: 5 mixed questions (tech + behavioral)
- 5 min: live coding demo
- 10 min: Q&A your turn
- 15 min: debrief + feedback

Identify:

- Top 3 strength answers
- Top 3 areas to improve
- Red flag questions (you fumble)

Schedule 2nd mock in 1 week.

### 🌟 Stretch goal

Write 1 blog post answering 1 common interview question deeply (e.g., "How do you debug flaky tests?" → 500 word post).

---

## Next

[Day 30 — Showcase + Roadmap →](./day-30-showcase.md)
