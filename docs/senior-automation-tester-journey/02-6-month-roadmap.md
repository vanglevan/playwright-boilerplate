# 02 — 6-Month Post-Bootcamp Roadmap

> From mid-level (end of 30-day bootcamp) → senior automation tester ready for 2026 job market.

---

## 📅 Overview

```
Month 1  Month 2  Month 3  Month 4  Month 5  Month 6
  AI       AI      AI     Tech     Strat    Career
 Found.  Tools   Testing  Depth   + Arch    Launch
────────────────────────────────────────────────────
  M1 ────► M2 ────► M3 ────► M4 ────► M5 ────► M6
```

**M1-M3: AI Mastery Block** (50% of curriculum weight)
**M4: Technical Depth**
**M5: Strategy & System Design**
**M6: Career Launch**

---

## 🔹 Month 1 — AI Fundamentals + Prompt Engineering

### Goal

Go from "AI user" → "AI practitioner". Understand HOW, not just use.

### Week 1-2: AI Fundamentals

**Study:**

- [03 — AI Fundamentals](./03-ai-fundamentals.md) — full doc
- [Lilian Weng — LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)
- Watch: [3Blue1Brown — Neural Networks](https://www.3blue1brown.com/topics/neural-networks)

**Concepts must master:**

- Tokens, context windows
- Temperature, top-p, top-k
- System vs user messages
- Embeddings conceptually
- RAG (basic idea)
- Model comparison (Claude / GPT / Gemini / OSS)

**Practice:**

- Claude API hands-on — simple completion, streaming, tool use
- Token counter tool — paste text, count tokens
- Experiment with temperature: 0 vs 1 on same prompt → observe

**Deliverable:** Blog post "What testers should know about LLMs" (500-800 words).

### Week 3-4: Prompt Engineering

**Study:**

- [04 — Prompt Engineering Mastery](./04-prompt-engineering-mastery.md)
- [Anthropic Prompt Engineering Interactive Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial)

**Patterns to master:**

1. Zero-shot
2. Few-shot
3. Chain-of-Thought (CoT)
4. Self-consistency
5. ReAct
6. Tree of Thoughts (conceptual)
7. Role-playing
8. Decomposition
9. Meta-prompting
10. Constitutional prompting

**Practice:**

- Re-do every AI interaction from 30-day bootcamp with Pattern X
- Build "prompt library" — 20 templates cho automation tasks
- A/B test: bad prompt vs good prompt, measure output quality

**Deliverable:**

- `PROMPT_LIBRARY.md` — 20 tested prompts
- Blog post: "Prompt patterns for automation testers" (800-1200 words)

### M1 checkpoint

- [ ] Can explain tokens, context, temperature to junior tester
- [ ] Know 10 prompt patterns by name + when to use
- [ ] Have `PROMPT_LIBRARY.md` for your workflow
- [ ] 1 published blog post

---

## 🔹 Month 2 — AI Coding Tools + Agentic Engineering

### Goal

Master tools, understand + build agents.

### Week 5-6: AI Coding Tools Deep Dive

**Study:**

- [05 — AI Coding Tools Mastery](./05-ai-coding-tools-mastery.md)
- [Claude Code Best Practices (Anthropic)](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Cursor docs](https://docs.cursor.com/)

**Tools deep:**

- Claude Code (primary)
  - Slash commands (create 10+ custom)
  - Hooks (setup 5+)
  - Subagents (custom for test work)
  - MCP config
- Cursor (secondary)
  - Composer
  - `@Codebase`
  - Rules for AI
- Copilot (if available)

**Practice:**

- Take 1 real project, rebuild 50% with Claude Code workflow
- Measure: time, quality, satisfaction
- Customize `.claude/` fully — commit to your repo

**Deliverable:** `.claude/` setup (commands, hooks, agents) usable by team.

### Week 7-8: Agentic Engineering

**Study:**

- [06 — Agentic Engineering](./06-agentic-engineering.md)
- [Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Lilian Weng — Agent blog](https://lilianweng.github.io/posts/2023-06-23-agent/)

**Topics:**

- Agent vs workflow vs chatbot
- ReAct pattern
- Planning + reflection
- Tool use design
- MCP deep dive
- Claude Agent SDK hands-on
- Multi-agent orchestration (concepts)

**Build:**

- Custom MCP server (1 tool, works)
- 1 agent using Claude Agent SDK for testing task:
  - Bug reproducer agent (reads JIRA → reproduces → writes test)
  - OR Flaky detector (reads CI logs → analyzes → suggests fix)
  - OR Test generator (reads spec → writes tests)

**Deliverable:**

- 1 working custom MCP server
- 1 agent solving real testing problem
- Demo video 3-5 min

### M2 checkpoint

- [ ] Fluent với Claude Code (can automate daily workflow)
- [ ] Built working MCP server
- [ ] Built 1 agent end-to-end
- [ ] Understand ReAct + Planning + Reflection patterns
- [ ] Demo video published

---

## 🔹 Month 3 — AI for Testing Applied + Best Practices

### Goal

Integrate AI into EVERY step of QA workflow. Safely, measurably.

### Week 9-10: AI Applied to Testing

**Study:**

- [07 — AI for Testing Applied](./07-ai-for-testing-applied.md)
- Case studies: Meta, Google, Microsoft AI testing blogs

**Apply to own workflow:**

- Test generation từ specs → agent workflow
- Test review → AI feedback loop
- Flaky test triage → trace analysis prompts
- Visual testing AI tools (Applitools demo)
- Self-healing tests (experimental)
- Test data generation at scale
- Auto-documentation

**Measure impact:**

- Tests/week before + after AI workflow
- Time to fix flaky test before + after
- % AI output kept as-is
- Defect escape rate (no change expected, verify no regression)

**Deliverable:** Personal dashboard tracking 5+ AI productivity metrics.

### Week 11-12: AI Best Practices + Playbook

**Study:**

- [08 — AI Best Practices (Senior)](./08-ai-best-practices-senior.md)
- [09 — AI Productivity Playbook](./09-ai-productivity-playbook.md)

**Codify:**

- Team AI playbook (shareable)
- Security rules (credentials, PII)
- Hallucination detection checklist
- AI code review criteria
- Ethics framework

**Teach:**

- Mentor 1 teammate adopt AI workflow
- Present tech talk to team (30 min)
- Write team-facing doc

**Deliverable:**

- `TEAM_AI_PLAYBOOK.md` adopted by team
- 1 tech talk video

### M3 checkpoint

- [ ] AI integrated trong 80% QA workflow
- [ ] Measurable productivity impact documented
- [ ] 1 teammate mentored
- [ ] Tech talk delivered
- [ ] `TEAM_AI_PLAYBOOK.md` adopted

---

## 🔹 Month 4 — Technical Depth

### Goal

Fill technical gaps beyond Playwright E2E.

### Week 13: Performance Testing

**Study:**

- [10 — Advanced Testing Topics](./10-advanced-testing-topics.md) — performance section
- [k6 docs](https://k6.io/docs/)
- [Grafana k6 university](https://k6.io/learn/)

**Build:**

- k6 smoke test
- Load test (100 concurrent users)
- Stress test (find breakpoint)
- Integrate với CI

**Deliverable:** Load test suite for 1 app.

### Week 14: Security Testing

**Study:**

- [10 — Advanced Testing Topics](./10-advanced-testing-topics.md) — security section
- [OWASP Top 10](https://owasp.org/Top10/)
- [OWASP ZAP](https://www.zaproxy.org/)

**Practice:**

- Run ZAP against 1 app
- Identify + categorize findings
- Automated security scan trong CI

**Deliverable:** Security scan report cho 1 app.

### Week 15: Mobile Testing

**Study:**

- [10 — Advanced Testing Topics](./10-advanced-testing-topics.md) — mobile section
- [Maestro docs](https://maestro.mobile.dev/) (easier start)
- [Appium docs](https://appium.io/) (heavier)

**Build:**

- 5 mobile E2E tests với Maestro (or Appium)
- Integrate với CI

**Deliverable:** Mobile test suite (5 tests).

### Week 16: Contract + Chaos + Observability

**Study:**

- Contract testing với Pact
- Chaos engineering basics (Gremlin, Chaos Monkey concepts)
- OpenTelemetry basics
- Observability as code

**Build:**

- 1 Pact contract test
- Exploratory experiment: inject latency với tc/network
- Instrument 1 test suite với OpenTelemetry

**Deliverable:** 3 mini artifacts.

### M4 checkpoint

- [ ] Ran real load test (> 100 VU)
- [ ] Scanned 1 app with ZAP, understand OWASP Top 10
- [ ] 5+ mobile tests working
- [ ] Pact contract test understanding
- [ ] Used OpenTelemetry at least once

---

## 🔹 Month 5 — Strategy + System Design

### Goal

Think architect-level. Can design for team 50+, not just write tests.

### Week 17-18: Test Strategy & Architecture

**Study:**

- [11 — Test Strategy & Architecture](./11-test-strategy-architecture.md)
- _Agile Testing_ — Lisa Crispin (chapters on strategy)
- _Accelerate_ — DORA metrics
- Read real strategy docs (search GitHub)

**Practice:**

- Design strategy for:
  - 1 greenfield project (choose 1 hypothetical or real)
  - 1 legacy system migration
- Include: pyramid distribution, tooling, CI strategy, ownership, metrics

**Deliverable:** 2 strategy docs, each 2000-3000 words, reviewed by peer.

### Week 19: System Design for QA

**Study:**

- Distributed systems basics
- Microservices testing patterns
- API contracts
- Event-driven architectures
- [System Design Primer (GitHub)](https://github.com/donnemartin/system-design-primer)

**Practice:**

- Read 2-3 system design challenges
- For each, think: "How would I test this?"
- Draw test strategy diagram (mermaid)

**Deliverable:** 1 "System Design for QA" note — how to test a distributed app.

### Week 20: Observability + SRE Mindset

**Study:**

- _Google SRE Book_ (free online) — chapters on monitoring
- [honeycomb.io blog](https://www.honeycomb.io/blog)
- Distributed tracing

**Apply:**

- Instrument 1 test suite (Playwright) với OpenTelemetry
- Identify 5 metrics to track in production
- Define SLOs for your test suite (flaky rate, duration)

**Deliverable:** Test observability dashboard.

### M5 checkpoint

- [ ] 2 strategy docs written + reviewed
- [ ] Understand distributed systems testing
- [ ] Observability instrumented somewhere
- [ ] SLO thinking applied to tests

---

## 🔹 Month 6 — Leadership + Career Launch

### Goal

Polish soft skills, prep for senior interviews, land role.

### Week 21-22: Soft Skills + Leadership

**Study:**

- [12 — Soft Skills & Leadership](./12-soft-skills-leadership.md)

**Practice:**

- Weekly 1:1 với junior tester (mentor)
- Code review 3 PRs with thoughtful feedback
- Write 1 design doc, solicit feedback
- Present technical topic to team (30 min)

**Deliverable:**

- Mentorship log (bi-weekly check-ins)
- 1 design doc reviewed
- 1 presentation delivered

### Week 23-24: Career Launch

**Study:**

- [13 — Career Growth (Senior)](./13-career-growth-senior.md)
- Research companies (10 target)

**Execute:**

- Resume polish với senior framing
- Portfolio final review
- 5+ applications/week
- 5+ mock interviews
- Salary negotiation prep

**Deliverable:**

- 1-2 offers landed
- OR 5+ interviews completed (if market slow)
- LinkedIn + blog up-to-date

### M6 checkpoint

- [ ] Mentored ≥ 1 person ongoing
- [ ] Presented at team/meetup
- [ ] 1+ offer OR 10+ interviews completed
- [ ] Portfolio polish final

---

## 📊 Monthly check-in template

Every month, answer (in NOTES.md):

```markdown
## Month N Checkpoint — YYYY-MM-DD

### Deliverables hit?

- [x] A
- [ ] B (reason missed)

### Skills gained (rate 1-5 change)

- AI fundamentals: 2 → 4
- Agentic: 1 → 3
- Performance: 1 → 3

### Biggest "aha" moment

-

### Hardest topic

-

### What I'd do differently

-

### Next month focus

-

### Energy level (1-10)

-

### Confidence at senior level (1-10)

-
```

---

## 🚦 Pacing adjustments

### If ahead of schedule

- Go deeper in specialization track (M4 onward)
- Contribute to OSS
- Mentor 2+ people
- Submit conference talk

### If behind schedule

- Cut M5 system design to basics only
- Defer mobile testing (M4 week 15) to month 7
- Focus M6 on interview prep, skip strategy writing
- **Never cut AI sections** — the differentiator

### Total flexibility

- 6-month plan → 9 months extended if balance family/work
- 6-month plan → 3 months intensive if unemployed + motivated
- **Measure progress, not time**

---

## 🎯 Beyond 6 months — specialization

After completing roadmap, pick 1 track:

### Track A: AI-Native Testing Engineer

- Build production AI agents
- Publish MCP servers
- Speak at AI testing conferences
- Path: Senior → Staff AI QA Engineer

### Track B: Test Architect / Strategist

- Design testing strategies for multiple teams
- Lead test infrastructure
- Cross-functional impact
- Path: Senior → Staff → Principal

### Track C: Performance Specialist

- k6 expert
- Load testing at scale
- Performance budgets + regressions
- Path: Senior → Performance Architect

### Track D: Security Testing Specialist

- OWASP expert
- Pen testing integration
- Security in CI/CD
- Path: Senior → Security QA → AppSec Engineer

### Track E: Mobile Testing Specialist

- Native + cross-platform
- Device farm operations
- Mobile CI/CD
- Path: Senior → Mobile QA Lead

Research salary + demand 2026 for your region → pick accordingly.

---

## 🌟 The senior mindset shift

**Throughout 6 months, internalize:**

1. "How do I test this?" → **"How should this be tested?"**
2. "I'll write a test" → **"Should we even test this manually?"**
3. "My team" → **"Organization, company, users"**
4. "I disagree" → **"I'd approach differently, here's why"**
5. "AI said" → **"I verified, because I'm responsible"**

The skills you learn matter less than the **mental model** you develop.

---

## Next

[03 — AI Fundamentals →](./03-ai-fundamentals.md) — start Month 1 deep dive.
