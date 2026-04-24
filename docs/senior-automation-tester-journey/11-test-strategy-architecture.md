# 11 — Test Strategy & Architecture

> Senior testers don't just write tests — they **design strategies** that scale.
> This doc teaches architect-level thinking: what to test, why, by whom, with what tools.

---

## 🎯 The difference

| Mid-level          | Senior                           |
| ------------------ | -------------------------------- |
| Writes tests       | Designs what tests to write      |
| Owns 1 test suite  | Designs strategy across suites   |
| Fixes flaky tests  | Designs system to prevent flaky  |
| Uses Playwright    | Picks testing framework for team |
| Writes CI config   | Designs CI architecture          |
| Thinks per-feature | Thinks per-product, per-quarter  |

Mid-level is skilled execution. Senior is skilled design.

---

## 🏛️ Part 1: Test pyramid — variations

### Classic Pyramid (Mike Cohn, 2009)

```
              ╱──────╲
             ╱  E2E    ╲   10%
            ╱──────────╲
           ╱ Integration ╲ 20%
          ╱──────────────╲
         ╱      Unit       ╲ 70%
        ╱──────────────────╲
```

**Philosophy:** Many fast cheap unit tests, few slow expensive E2E.

**When fits:** Backend-heavy, lots of logic, stable APIs.

### Honeycomb (newer shape)

```
      ╱──╲
     │ E2E │ 5%
     ├────┤
   ╱  Integration  ╲  60%
  │   (the main)    │
   ╲──────────────╱
      ╱──────╲
     │ Unit  │ 35%
      ╲────╱
```

**Philosophy:** Unit tests often test implementation. Integration tests test behavior.

**When fits:** Microservices with critical inter-service contracts.

### Trophy (Kent C. Dodds)

```
    ╱╲
   ╱E2╲     5%
   ────
  ╱ Int ╲   50%
  ──────
 ╱Compnt╲   35%
 ────────
  ╱ St ╲    10%  (static: lint, types)
  ──────
```

**Philosophy:** Static analysis + component tests catch most bugs.

**When fits:** Frontend-heavy, component-based (React, Vue).

### Diamond (Risk-based)

```
       ╱╲
      ╱──╲  E2E (critical paths) 20%
     ╱────╲
    ╱      ╲  Integration 60%
    ╲      ╱
     ╲────╱
      ╲──╱   Unit (targeted) 20%
       ╲╱
```

**Philosophy:** Integration = confidence. Unit for complex algorithms. E2E for business-critical.

**When fits:** Systems where integration/contract matters most.

### Which to choose

**Not dogmatic.** Depends on:

- System type (frontend vs backend vs both)
- Team maturity (testing muscle)
- Risk profile (FinTech differs from CMS)
- Speed requirements

**Senior wisdom:** Use as guide, adapt ratios. Strategy doc should justify ratios.

---

## 🎯 Part 2: Shift-left vs Shift-right

### Shift-left

Move testing earlier in dev cycle.

- **Static analysis** on commit
- **Unit tests** in IDE
- **Integration** on push
- **Pre-merge** checks

**Benefits:**

- Catch bugs when cheap
- Developer owns quality
- Fast feedback

### Shift-right

Test in production (carefully).

- **Feature flags** — progressive rollout
- **Canary deploys** — % of users
- **A/B testing** — scientific comparison
- **Synthetic monitoring** — prod tests
- **Chaos engineering** — production robustness
- **Real user monitoring (RUM)** — actual user metrics

**Benefits:**

- Real conditions tested
- Real users validate
- Can't simulate reality perfectly pre-prod

### Both together (senior)

```
Dev          → Pre-merge → Merge  → Staging → Canary → Production
(shift-left)                                             (shift-right)
lint                                                     feature flags
unit                                                     A/B tests
integration                                              RUM
E2E smoke                                                chaos
```

Comprehensive strategy = both arrows.

### What senior designs

- Which checks at which stage
- What % rollout for canary
- How to measure prod health
- Rollback triggers

---

## 🏗️ Part 3: Ownership models

### Model 1: QA-centralized (legacy)

```
Devs write code → throw over wall → QA tests
```

**Pros:** Specialization, dedicated QA expertise.
**Cons:** Slow, adversarial, quality not owned.

### Model 2: Dev-owned (modern default)

```
Devs write code + tests → QA adds specialized layers (perf, security, exploratory)
```

**Pros:** Fast, devs own quality.
**Cons:** Devs may skip tests; need QA culture.

### Model 3: Pairs (ideal for complex features)

```
QA + Dev pair on feature → QA designs tests, Dev implements → both own
```

**Pros:** Knowledge transfer, quality built-in.
**Cons:** Needs time investment, matching schedules.

### Model 4: Test Guild / CoE (mid-size orgs)

```
Central QA team = center of excellence
→ Standards, tools, infrastructure
→ Federated: QAs embedded in feature teams
```

**Pros:** Consistency + agility.
**Cons:** Org complexity.

### Model 5: Full-stack tester (2026 trend)

```
"Testers" are actually full-stack engineers who specialize in quality.
Can write app code, can design systems, happen to focus on testing.
```

**Pros:** High-leverage, respected.
**Cons:** High skill bar, hard to hire.

### Matching model to company

- Startup (<50): Model 2 or 5
- Mid (50-500): Model 4 with 2-3 test specialists
- Enterprise (500+): Model 4 + domain specialists (perf, security, mobile)
- Regulated (finance, health): Model 1 for compliance, Model 4 for agility

---

## 🎨 Part 4: Test strategy document (how to write)

### Why a strategy doc

- Aligns team on approach
- Surfaces assumptions
- Onboarding tool
- Pro-active (prevents bad decisions)

### Template

```markdown
# Test Strategy — [Project/Product Name]

**Owner:** [Name]
**Last updated:** YYYY-MM-DD
**Status:** Draft / Reviewed / Approved
**Review cadence:** Quarterly

## 1. Context

Project: [product name, business purpose]
Team: [size, composition]
Stack: [tech stack brief]
Risk level: [low/medium/high + why]
Launch: [date / ongoing]

## 2. Quality goals

- [Goal 1: e.g., 99% uptime]
- [Goal 2: e.g., <1 bug per 10k users reported]
- [Goal 3: e.g., <2min CI feedback]

## 3. Test distribution

### Pyramid choice

[Diagram + % split]

### Rationale

[Why this shape for this product]

## 4. Test types and ownership

| Layer       | Who writes | Tools                | % of suite     |
| ----------- | ---------- | -------------------- | -------------- |
| Unit        | Devs       | Vitest               | 50%            |
| Integration | Devs + QA  | Supertest, Vitest    | 30%            |
| E2E         | QA         | Playwright           | 15%            |
| Visual      | QA         | Playwright snapshots | 3%             |
| A11y        | QA         | axe-core             | 2%             |
| Performance | QA         | k6                   | separate suite |
| Security    | DevSecOps  | ZAP, Snyk            | CI gate        |

## 5. CI strategy

- Pre-commit: lint, typecheck
- Push: unit + integration
- Pre-merge: E2E smoke
- Main merged: full regression
- Nightly: full + perf + visual + a11y
- Weekly: security scan

## 6. Flaky test policy

- Track flaky rate as metric
- Quarantine suite for known flaky
- Sprint-level goal: <2% flaky
- Each quarter: dedicate sprint for flaky fixes

## 7. Metrics

- Test duration (CI feedback time)
- Flaky rate
- Coverage (line + branch)
- Escape defects (bugs found post-ship)
- Time to diagnose failure

## 8. Out of scope

[Explicit: what we choose NOT to test]

## 9. Risks & mitigations

| Risk                               | Mitigation         |
| ---------------------------------- | ------------------ |
| E2E too slow                       | Shards + parallel  |
| Data setup painful                 | API-based fixtures |
| Cross-team tests unclear ownership | CODEOWNERS file    |

## 10. Roadmap

- Q2: migrate to Playwright
- Q3: introduce contract testing
- Q4: add chaos engineering
```

### Example variations

**Startup (5-eng team):**

- Strategy 1 page
- 3 pillars: unit (dev), E2E smoke (QA), manual exploratory
- Decisions: no visual tests (UI changing), no chaos (too early)

**Enterprise (500-eng):**

- Strategy 20 pages
- Multi-layered
- Per-domain variations (finance stricter than marketing)
- Compliance-driven

Both valid for their contexts.

---

## 🎯 Part 5: What NOT to automate

### Counter-intuitively important for senior

Automating everything is wrong.

### Don't automate

1. **Exploratory testing** — human intuition needed
2. **Usability** — subjective, requires humans
3. **Accessibility (fully)** — automated catches 40%, rest requires SR testing
4. **One-off experiments** — cost > benefit
5. **Rapidly changing UI** — baseline churn
6. **Features about to be deprecated** — wasted effort
7. **Business rules in flux** — tests break constantly
8. **Hardware-dependent** — hard to automate reliably

### Cost-benefit analysis

```
Cost to automate =
  Design time
  + Implementation time
  + Maintenance (forever)
  + Flaky investigation

Benefit =
  Bugs caught (estimate)
  × Severity
  × Frequency of regression

Automate if: Benefit >> Cost over 6-12 months
```

### Senior statement

"We intentionally don't automate X because Y (cost > benefit) — we manually test X each release."

Make it explicit. Document in strategy.

---

## 🔁 Part 6: Regression testing strategies

### Strategy 1: Full regression

Run all tests before every release.

**Pros:** Max confidence.
**Cons:** Slow, costly at scale.

### Strategy 2: Smoke + risk-based regression

Smoke every PR. Risk-based regression (areas touched) before release.

**Pros:** Fast PR feedback, targeted ship confidence.
**Cons:** Requires mapping tests → code areas.

### Strategy 3: Test impact analysis

Tool analyzes PR diff → runs only affected tests.

**Pros:** Fastest PR feedback.
**Cons:** Needs tooling (Jest's `--findRelatedTests`, Nx affected).

### Strategy 4: Trunk-based with frequent release

Tests gate every commit to main. Deploy multiple times/day.

**Pros:** Small changes = quick to diagnose failures.
**Cons:** Requires mature team + tooling.

### Modern recommendation (2026)

Hybrid:

- PR: smoke + affected
- Main: full + perf nightly
- Release: full + manual exploratory
- Prod: synthetic monitoring

---

## 📐 Part 7: Feature flag testing strategy

### Why feature flags matter for QA

- Decouple deploy from release
- Progressive rollout
- Kill switches
- A/B testing
- Config-driven behavior

### How testing changes

Without flags: test 1 code path.
With flags: test multiple combinations (with + without).

### Strategies

#### Strategy A: Test each flag independently

```
Feature X + Feature Y both available:
  - Test X=on, Y=off
  - Test X=off, Y=on
  - Test X=on, Y=on
  - Test X=off, Y=off
```

4 combos for 2 flags. Exponential growth.

#### Strategy B: Test activated path only

```
Test current default config (what users see)
+ test next release config
```

Manageable.

#### Strategy C: Pairwise combinations

Use combinatorial testing tools (ACTS, PICT) to reduce N-flag combinations to orthogonal pairs.

### Tools

- [LaunchDarkly](https://launchdarkly.com/) — enterprise flags
- [Split.io](https://www.split.io/)
- [Unleash](https://www.getunleash.io/) — OSS
- [Flagsmith](https://www.flagsmith.com/) — OSS/hosted

### In Playwright tests

```typescript
test.use({
  extraHTTPHeaders: {
    'X-Feature-Flags': 'newCheckout=true,darkMode=false',
  },
});

test('new checkout flow', async ({ page }) => {
  // Test with flag on
});
```

---

## 🔐 Part 8: Deployment strategies + testing

### Blue/Green

Two identical environments. Traffic switches between them.

**Testing opportunity:** Deploy to green, test, then switch.

```
[Users] ──▶ [Blue (live)]
            [Green (new, being tested)]
```

After tests pass → flip → Green becomes live.

### Canary

Release to small % of users first.

```
[Users] ──▶ 95% → [Stable v1]
            5%  → [Canary v2]
```

**Testing:** Monitor canary metrics. Rollback if anomaly.

### Rolling update

Gradually replace instances.

**Testing:** Health checks per instance. New instances verified before routing traffic.

### Senior role

Design tests that catch issues at each stage:

- Pre-deploy: unit, integration, E2E
- Green env: full E2E suite
- Canary: synthetic monitoring, A/B metrics
- Full rollout: production smoke, alerting

---

## 🎛️ Part 9: Metrics for a testing team

### Metrics to track

#### Health metrics

- CI duration (PR feedback time)
- Test pass rate
- Flaky rate
- Coverage trend

#### Business metrics

- Escape defects (bugs in prod)
- Customer-reported issues
- Rollback frequency
- Time-to-detect regressions

#### Team metrics

- PR cycle time (open → merged)
- Tests added per sprint
- Senior's % time on strategic vs execution

### DORA metrics (you should know)

Research-backed metrics for high-performing teams:

1. **Deployment frequency** — how often to prod
2. **Lead time for changes** — commit → prod
3. **Change failure rate** — what % broke
4. **Mean time to restore** — incident recovery time

QA contributes to all 4 indirectly. Understand + advocate.

### SPACE framework

Newer than DORA, holistic:

- Satisfaction + well-being
- Performance
- Activity
- Communication + collaboration
- Efficiency + flow

Not just speed — sustainable pace.

### What to avoid

- **Test count alone** — easily gamed
- **Coverage % as goal** — can incentivize bad tests
- **Individual metrics** — creates politics
- **Vanity metrics** — sound good, mean nothing

---

## 🎓 Part 10: Running a test architecture design session

### When to run

- Starting new project
- Major architectural change
- Quarterly strategy review
- Joining new team as senior

### Agenda (2 hours)

**0:00 - 0:15 | Context setting**

- Product, team, timeline
- Known challenges
- Goals

**0:15 - 0:45 | Current state audit**

- What tests exist?
- What coverage?
- What pain points?
- Measure baseline metrics

**0:45 - 1:15 | Desired state**

- What does "great" look like?
- Quality goals
- Test distribution aspiration

**1:15 - 1:45 | Design**

- Pick pyramid shape
- Define ownership
- CI strategy
- Tool decisions

**1:45 - 2:00 | Roadmap**

- Next quarter: 3-5 concrete actions
- Who owns each
- Deadline
- How to measure progress

### Output

- Strategy doc (living)
- Action items (ticketed)
- Team alignment

### Facilitation tips

- Bring the doc template (speed)
- Assign pre-work (reading, data prep)
- Diverse voices (dev, QA, PM, SRE)
- Ask "what's hardest?" — reveals real constraints
- End with commitments, not just ideas

---

## 🏛️ Part 11: Architecture decisions (ADR)

### What are ADRs

Architecture Decision Records — short docs capturing why decision made.

### Template

```markdown
# ADR-001: Use Playwright over Cypress for E2E

## Status

Accepted

## Context

We need E2E testing framework for web app launching Q3 2026.

## Options considered

1. Cypress
2. Playwright
3. Selenium
4. WebdriverIO

## Decision

Playwright.

## Rationale

- Multi-browser support (Cypress limited)
- Parallel execution by default
- TypeScript-first
- Microsoft investment (stable future)
- Team familiarity with Claude Code + Playwright MCP

## Consequences

- Need migration plan if switching (~6 months)
- Cypress ecosystem (plugins, cloud) larger short-term
- Some CI tuning needed

## Related

- ADR-002: Playwright fixtures over beforeEach
- ADR-003: storage state auth strategy
```

### Why ADRs matter for testers

- Document "why we did it" for future team
- Avoid re-debating decisions
- Onboarding aid
- Refactor confidence (know constraints)

### Where to store

- `docs/adr/` in repo
- Numbered sequentially (ADR-001, ADR-002...)
- Committed with code

---

## 🎯 Part 12: Strategy in face of constraints

### Constraint: No time to automate

Real situation at most companies.

**Strategy:**

1. Smoke tests first (catch worst bugs)
2. Manual test critical flows
3. Document manual checklist (repeatable)
4. Automate 1-2 critical per sprint
5. Eventually build up

Don't promise 100% automation. Set realistic trajectory.

### Constraint: Legacy system no tests

Common in established companies.

**Strategy:**

1. "Characterization tests" — document current behavior (even if bad)
2. Test refactor boundaries (what's changing)
3. Test new code to higher standard
4. Gradually backfill legacy

Don't try to retroactively test everything. Path forward.

### Constraint: Changing requirements

Products in flux.

**Strategy:**

1. Invest in fast feedback (unit, integration)
2. Defer E2E for stable behaviors
3. Light automation for unstable areas
4. Regular review: what stabilized?

Spend where stability exists.

### Constraint: Non-technical team

Business users wanting testing.

**Strategy:**

1. BDD with Gherkin (readable)
2. Low-code tools (Testim, Katalon)
3. Manual testing guide + structure
4. Slowly up-skill interested people

Match approach to team skills.

### Constraint: Tight budget

No budget for tools.

**Strategy:**

1. Use OSS (Playwright, k6, ZAP, axe)
2. GitHub Actions free tier
3. Self-host where possible
4. Free tier Allure, Percy, etc.

Good testing possible at $0 tool cost.

---

## 📚 Resources

### Books

- _Agile Testing_ — Lisa Crispin & Janet Gregory — foundational
- _Accelerate_ — Forsgren et al. — DORA research
- _Continuous Delivery_ — Humble & Farley
- _Building Evolutionary Architectures_ — Neal Ford

### Articles

- Martin Fowler — [bliki, search "test"](https://martinfowler.com/)
- Kent C. Dodds — [testing trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Google Testing Blog](https://testing.googleblog.com/)
- [Spotify Engineering](https://engineering.atspotify.com/)

### Videos + talks

- "Test Automation ROI" — various conference talks
- "Testing in Production" — GOTO talks
- "Continuous Delivery" talks

### Community

- [Ministry of Testing](https://www.ministryoftesting.com/) — practitioner community
- [ISTQB](https://www.istqb.org/) — certifications if relevant

---

## 🎯 Exercises

### 🟢 Basic (Week 17)

1. Write test strategy doc for current project (1 page minimum).
2. Analyze your project's test pyramid — what shape?
3. Read Google SRE Book chapter on monitoring.

### 🟡 Intermediate (Week 18)

1. Write strategy for hypothetical greenfield project (2-3 pages).
2. Run "design session" with teammate. Iterate.
3. Author 3 ADRs for past decisions.

### 🔴 Advanced (Week 19)

1. Review your team's strategy with peer. Incorporate feedback.
2. Present test strategy to stakeholders (eng lead, product).
3. Design migration plan for legacy system.

### 🏆 Mini project (End of Month 5)

**Task:** Professional-grade strategy doc.

Deliver:

- 2000+ word strategy for real or hypothetical project
- Pyramid choice + rationale
- Ownership matrix
- CI architecture diagram
- Metrics framework
- Risks + mitigations
- Roadmap

Get 2-3 peer reviews. Incorporate. Share publicly (gist/blog).

### 🌟 Stretch goal

Present strategy at local meetup or internally to 20+ people.

---

## ✅ Self-check

Can you do, unaided:

- [ ] Pick test pyramid shape with defensible reasoning
- [ ] Write 2-page strategy doc for new project
- [ ] Design CI architecture for team of 15+
- [ ] Define ownership model appropriate for context
- [ ] Facilitate design session with stakeholders
- [ ] Draft ADR for technical decision

Goal: all yes by end of Month 5.

---

## Next

[12 — Soft Skills & Leadership →](./12-soft-skills-leadership.md) — technical mastery is necessary, soft skills are differentiating.
