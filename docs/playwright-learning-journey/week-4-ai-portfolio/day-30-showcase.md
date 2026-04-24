# Day 30 — Showcase + Roadmap Tiếp Theo

> **Goal:** Ghi điểm chuyển giao — publish blog, final push, review hành trình, lên roadmap 90 ngày tới.
> **Thời gian:** 3-4 giờ

---

## Prerequisites

- Day 1-29 hoàn thành

---

## 1. Demo day

### Screen recording (5 phút)

Content:

1. **Intro (30s):** "I'm X, completed 30-day Playwright journey. Here's what I built."
2. **Run suite (1 min):** `npm run test:ui` — cho thấy 47 tests xanh
3. **Show report (1 min):** Allure dashboard navigate epic/feature/story
4. **Code walkthrough (1.5 min):** 1 POM, 1 fixture, 1 test file
5. **AI workflow demo (1 min):** `/generate-test` slash command
6. **Closing (30s):** Link GitHub + blog

Record bằng:

- **macOS:** `Cmd+Shift+5` (built-in)
- **All OS:** [OBS Studio](https://obsproject.com/)
- Upload to YouTube unlisted hoặc Loom

---

## 2. Publish blog post

Go to [dev.to](https://dev.to/new) (reach + SEO tốt).

### Title (SEO):

- "30 Days Learning Playwright: Manual Tester → Automation in a Month"
- "From Manual Tester to Automation: My 30-Day Playwright Journey"

### Tags: `#playwright` `#testing` `#automation` `#webdev`

### Structure (scan bảng nội dung)

1. **Hook** (200 words)
   - Your background
   - Why now (AI era)
   - What you'll learn in this post

2. **Week 1 — Foundations** (300 words)
   - TypeScript basics for tester
   - Locator priority insight
   - First "aha" moment

3. **Week 2 — Core Skills** (300 words)
   - Fixtures vs beforeEach
   - API testing 100x faster than UI
   - Auth state speedup

4. **Week 3 — Advanced** (300 words)
   - Visual/a11y/perf as specialists
   - CI/CD pipeline design
   - Docker consistency

5. **Week 4 — AI + Portfolio** (400 words)
   - Not "AI writes tests" — AI as sensei
   - MCP + agentic workflow
   - Measured productivity

6. **Key lessons** (200 words)
   - 3 surprising things
   - 2 mistakes

7. **What's next** (200 words)
   - Roadmap 90 days
   - Open to feedback / hire

Total: ~1,900 words. Good length.

### Images/GIFs

- Demo GIF (header)
- Architecture diagram
- 1-2 code snippets

### CTA (end of post)

- GitHub repo link
- LinkedIn connect
- "Comments open — feedback welcome"

---

## 3. LinkedIn post + connections

### Post

Template từ [Day 28 mục 7](./day-28-portfolio.md#7-linkedin-post-template).

### Actions sau post

- Tag 3-5 people: mentors, recruiters followed, automation leaders
- Respond to every comment within 24hrs
- Connect with commenters

### Optimize profile

- Headline: "Automation Tester | Playwright + AI-Native Workflow | Open to Fullstack Tester Roles"
- About: 3-paragraph — background, journey, goals
- Featured: pin repo + blog post
- Skills: Playwright, TypeScript, Test Automation, CI/CD, API Testing

---

## 4. Final repo push

```bash
# Last commit
git add .
git commit -m "chore: 30-day learning journey complete"
git push

# Tag release
git tag -a v1.0 -m "30-day learning journey v1.0"
git push --tags
```

GitHub sẽ show "Release v1.0" — nice badge.

### Repo polish final

- [ ] README: badges, demo GIF, live report link
- [ ] NOTES.md: all 30 days filled
- [ ] AI_WORKFLOW.md: 10 rules + 5 templates
- [ ] `.claude/` committed (team can reuse)
- [ ] Release v1.0 tagged
- [ ] CI xanh 7 ngày liên tiếp
- [ ] Pin repo on GitHub profile

---

## 5. 30-Day Retrospective

Trong NOTES.md viết dài (1000+ words):

### Template

```markdown
## 30-Day Retrospective — YYYY-MM-DD

### What I can now do

- [list 10 concrete skills]

### What surprised me

- [3 unexpected learnings]

### Hardest week

- Week X because [reason]
- Why I pushed through: [...]

### Most valuable hour

- [specific moment — e.g., "Day 13 debug session unlocked trace viewer mastery"]

### Top 5 mistakes (and fixes)

1. [...]
2. [...]

### How AI changed my workflow

- Before: [...]
- Now: [...]
- Productivity: estimated +X%

### If I redid this, I would

- [3 things differently]

### What I'm proud of

- [1-2 concrete achievements]

### Thanks to

- [docs, community, mentors]
```

**Post on GitHub as release notes** + snippet on LinkedIn.

---

## 6. Roadmap 90 ngày tiếp theo

### Month 2: Depth + Breadth (Days 31-60)

**Week 5-6: Cucumber BDD + reporting ecosystem**

- [playwright-bdd](https://github.com/vitalets/playwright-bdd)
- Gherkin syntax, step definitions
- When BDD worth it (stakeholder collaboration)

**Week 7: Mobile testing intro**

- [Maestro](https://maestro.mobile.dev/) (simple, YAML)
- or Appium (if native app)
- Cross-platform E2E (web + mobile)

**Week 8: Load testing basics**

- [k6](https://k6.io/docs/)
- Write scripts, run in cloud
- Performance baseline vs load

### Month 3: Specialization (Days 61-90)

Choose 1 track:

**Track A: AI-native testing engineer**

- Advanced Claude Agent SDK projects
- Build your own MCP server for team
- Automated test authoring pipeline

**Track B: Test Architect**

- Pact contract testing
- Test strategy frameworks (ISTQB)
- Design review skill

**Track C: Full-stack tester**

- Basics of dev (React/Vue component)
- Debug actual prod code
- Pair with devs on features

### Month 4+: Compounding

**Weekly:**

- Read 1 testing blog post
- Review 1 GitHub test repo
- Write 1 test for OSS project

**Monthly:**

- Contribute 1 PR to OSS
- Write 1 dev.to post
- Attend 1 QA meetup (online OK)

**Quarterly:**

- Conference (QA Global, Automation Guild, TestBash)
- Learn 1 adjacent tool (Cypress, Playwright alternatives)

---

## 7. Community & network

Join & actively participate:

| Community                 | Link                                                           | Cost             |
| ------------------------- | -------------------------------------------------------------- | ---------------- |
| Playwright Discord        | [aka.ms/playwright/discord](https://aka.ms/playwright/discord) | Free             |
| r/QualityAssurance        | [reddit](https://www.reddit.com/r/QualityAssurance/)           | Free             |
| MoT (Ministry of Testing) | [ministryoftesting.com](https://www.ministryoftesting.com/)    | Free tier + paid |
| Automation Guild          | Annual online conference                                       | $100-200         |
| Testing Hub VN (local)    | Telegram/Facebook groups                                       | Free             |

**Goal:** 1 activity/week (post, answer question, share learning).

---

## 8. Staying current

**Subscribe (free):**

- [Playwright YouTube](https://www.youtube.com/@Playwrightdev) — weekly
- [Kent C. Dodds newsletter](https://kentcdodds.com/) — testing philosophy
- [Software Testing Weekly](https://softwaretestingweekly.com/)
- [Ministry of Testing The Testing Planet](https://www.ministryoftesting.com/dojo/lessons)

**Avoid:**

- Hype tweets "X kills Y"
- Surface-level "top 10 tools 2026" listicles
- Tutorials > 6 months old (stack moves fast)

---

## 9. When applying for jobs

### Timing

- Week after Day 30: apply to 5 roles (warmup)
- Week after: refine resume based on feedback
- Week 3+: aim 10+/week quality apps

### Where to apply (VN + remote)

- [Topdev](https://topdev.vn/)
- [ITviec](https://itviec.com/)
- [LinkedIn Jobs](https://www.linkedin.com/jobs/)
- [We Work Remotely](https://weworkremotely.com/) — global remote
- Company career pages directly

### Cover letter template (short)

```
Hi [Hiring manager name],

I'm a former manual tester who built Playwright automation skills
via a focused 30-day project. My portfolio:
[GitHub link]

Highlights relevant to [role]:
- 47 tests across 5 types (E2E, API, visual, a11y, performance)
- CI/CD pipeline with parallel shards
- Typed TypeScript codebase (strict mode)
- AI-native workflow (Claude Code + MCP)

I'm drawn to [Company] because [specific reason — product, culture,
engineering blog post].

Available for conversation at [timezone].

Thanks,
[Name]
```

Keep under 150 words. Specific > generic.

---

## 10. Metrics of success

Track 90 days post-journey:

| Metric                                  | Target |
| --------------------------------------- | ------ |
| GitHub repo stars                       | 10+    |
| Blog post views                         | 500+   |
| LinkedIn followers growth               | +100   |
| Interview conversions (app → interview) | 20%+   |
| Offer conversion (interview → offer)    | 15%+   |

**Realistic:** 2-5 interviews/month, 1 offer in 2-3 months given decent market.

---

## 11. Bài tập cuối cùng

### Bài 1: Final commit + release

```bash
git add . && git commit -m "chore: 30-day journey complete"
git tag v1.0 && git push --tags
```

### Bài 2: Record demo

5 phút video screen-share. Upload.

### Bài 3: Publish blog

Polish draft → publish on dev.to. Share link on LinkedIn, Twitter, Discord.

### Bài 4: Share milestone

LinkedIn post với takeaways + ask for feedback/introductions.

### Bài 5: Retro in NOTES.md

1000+ words. Save forever — reference when doubting self later.

### Bài 6: Plan next 30 days

Write `ROADMAP.md` cho Month 2. Commit.

---

## 12. Final Checklist

### Portfolio

- [ ] Repo public với CI xanh
- [ ] README + demo GIF + live report
- [ ] v1.0 release tagged
- [ ] 30+ commits chronological

### Content

- [ ] Blog post published
- [ ] LinkedIn post + profile optimized
- [ ] Demo video uploaded

### Knowledge

- [ ] All 30 day-files reviewed
- [ ] NOTES.md retro completed
- [ ] AI_WORKFLOW.md refined
- [ ] ROADMAP.md next 30 days

### Network

- [ ] Joined 2+ communities
- [ ] Connected with 10+ people tuần này
- [ ] 1 testing newsletter subscribed

### Application ready

- [ ] Resume updated với portfolio
- [ ] Cover letter template
- [ ] 5 target companies researched

---

## 13. Words to finish

**You did it.**

From knowing zero JavaScript → deploying tests in Docker with AI workflow.

The journey doesn't end today. Skill compounds:

- Week 1 you struggled with `async/await`
- Week 4 you built agentic workflows
- Month 6 you'll review someone else's tests and refactor in 10 minutes

**What matters most:**

- Consistency > intensity
- Ship > perfect
- Public > private (learn in open)
- Teach > hoard (you learn 10x more teaching)

**The fullstack tester you want to become:**

- Writes good tests
- Debugs production in calm
- Mentors juniors
- Partners with dev as peer
- Uses AI as force multiplier
- Has strong opinions, loosely held

**You're now on that path.**

---

## Resources tiếp theo

- [Awesome Testing](https://github.com/TheJambo/awesome-testing)
- [Test Automation University](https://testautomationu.applitools.com/) — free courses
- [Ministry of Testing Dojo](https://www.ministryoftesting.com/dojo) — free + paid
- [AI Testing Conference](https://aitestingconf.com/)
- Back to [START](../README.md)

---

## 📚 Tài liệu mở rộng — Next 90 days curriculum

### 🎥 Video series để theo Month 2+

- [Cypress vs Playwright 2026](https://www.youtube.com/results?search_query=cypress+vs+playwright+2026) — compare frameworks
- [k6 load testing crash course](https://www.youtube.com/results?search_query=k6+crash+course)
- [Pact contract testing tutorial](https://www.youtube.com/results?search_query=pact+tutorial)
- [Appium for mobile](https://www.youtube.com/results?search_query=appium+tutorial)
- [Maestro mobile testing](https://maestro.mobile.dev/) — simpler alternative

### 📝 Ongoing reading (subscribe)

- [Playwright Blog](https://playwright.dev/blog) — weekly
- [Software Testing Weekly](https://softwaretestingweekly.com/) — curated
- [Kent C. Dodds newsletter](https://kentcdodds.com/subscribe) — testing philosophy
- [Anthropic Eng blog](https://www.anthropic.com/engineering) — AI + dev tools
- [Ministry of Testing](https://www.ministryoftesting.com/)

### 🎓 Advanced courses (Month 2+)

- [Test Automation University — Full curriculum](https://testautomationu.applitools.com/) — continue learning
- [Pluralsight — Testing](https://www.pluralsight.com/browse/software-development/testing) — if company subscription
- [Educative — System Design](https://www.educative.io/)
- [Frontend Masters — Testing courses](https://frontendmasters.com/)

### 📖 Books (reading list 3-6 months)

- _The Art of Testing_ — Myers (classic foundations)
- _Agile Testing_ — Lisa Crispin (mindset)
- _Accelerate_ — DORA metrics
- _Staff Engineer_ — Will Larson (career progression)
- _Designing Data-Intensive Applications_ — Kleppmann (if role evolves)
- _The Manager's Path_ — Fournier (if moving to leadership)

### 🐙 Communities để đóng góp

- [microsoft/playwright](https://github.com/microsoft/playwright) — contribute
- [mxschmitt/awesome-playwright](https://github.com/mxschmitt/awesome-playwright) — add resources
- [testing-library/docs](https://github.com/testing-library/testing-library-docs) — improve docs
- Vietnam local: find automation groups

### 🏢 Jobs & networking

- [Topdev](https://topdev.vn/) — VN tech jobs
- [ITviec](https://itviec.com/) — VN jobs
- [LinkedIn](https://www.linkedin.com/jobs/) — global
- [We Work Remotely](https://weworkremotely.com/) — remote
- [RemoteOK](https://remoteok.com/)
- [Wellfound (AngelList)](https://wellfound.com/) — startups

### 🎤 Conferences (Q2-Q4 2026)

- [TestBash](https://www.ministryoftesting.com/testbash) — multiple editions
- [Automation Guild](https://automationguild.com/) — online
- [Selenium Conf](https://seleniumconf.com/) — cross-platform
- [AI Testing Conference](https://aitestingconf.com/)
- Local meetups — Meetup.com, Facebook groups

### 📊 Self-tracking for next 90 days

Template ghi tuần:

```markdown
## Week of YYYY-MM-DD

### Applied (count, companies)

-

### Interviews (stage)

-

### Offers

-

### Learning (1 thing/week)

-

### Portfolio growth

- Repo: +X commits, +Y stars
- Blog: +Z posts

### Next week priority

-
```

---

## 🎯 Thực hành mở rộng — Post-30-day exercises

### 🟢 Cơ bản (momentum)

**B1.** Apply to 5 automation tester roles tuần này (không cần perfect match). Cover letter customized mỗi cái.

**B2.** 1 blog post/tuần — cover 1 concept sâu:

- Week 31: "Why web-first assertions matter"
- Week 32: "My storage state setup"
- Week 33: "Playwright + AI workflow"
- Week 34: "Lessons from my first 100 tests"

**B3.** 1 OSS contribution/month:

- Fix typo trong docs
- Add example trong awesome-playwright
- Improve test coverage

### 🟡 Trung bình (depth)

**M1.** Learn Cypress — 1 week sidegrade:

- Rewrite 5 Playwright tests in Cypress
- Compare verbose, DX, capabilities
- Blog post "Cypress vs Playwright — my take"

**M2.** Mobile testing — pick Appium or Maestro:

- Setup environment
- Write 5 mobile tests
- Integrate với existing CI

**M3.** Load testing với k6:

- Install k6
- Write 3 scripts (smoke, load, stress)
- Run in CI
- Pair với Playwright tests

**M4.** Contract testing — Pact basics:

- Consumer tests
- Provider verification
- Pact Broker setup

### 🔴 Nâng cao (career track)

**A1.** Specialize 1 track:

- **AI/Agentic**: build 1 production agent
- **Performance**: optimize 1 real app with Core Web Vitals
- **Security**: OWASP ZAP + Playwright integration

**A2.** Open source maintainer track:

- Contribute 5 PRs to Playwright
- Become known in community (answer questions)
- Write plugin (eslint rule, reporter)

**A3.** Speaker track:

- Submit talk to local meetup
- Record demo video
- Become test conference speaker in 6-12 months

**A4.** Product tester evolution:

- Learn React/Vue basics
- Debug prod code alongside devs
- Fullstack tester role reality

### 🏆 6-month stretch goals

**Goal 1:** Job landed (automation tester or fullstack)
**Goal 2:** 500 GitHub followers / 100 stars on portfolio
**Goal 3:** Published 20+ blog posts
**Goal 4:** Spoken at 1 meetup
**Goal 5:** Contributing regularly to OSS

Measure monthly. Adjust if off track.

### 🌟 1-year vision

Where you want to be 2027-04:

- Role:
- Company type:
- Salary range:
- Skills depth:
- Team size:
- Impact:

Write it now. Revisit monthly.

---

## See you at Day 60 checkpoint 🎯

(Set reminder in calendar: 60 ngày từ hôm nay, re-do Verification Checklist — see growth.)

### Final words

You've completed 30 days. But the real journey starts now — in the real world, with real job applications, real bugs, real teams.

Keep learning. Keep shipping. Keep improving.

Xin chào ngày mới. 🌅
