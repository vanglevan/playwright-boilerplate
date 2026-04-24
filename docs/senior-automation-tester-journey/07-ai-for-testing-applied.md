# 07 — AI for Testing Applied

> Practical patterns for integrating AI into every step of QA workflow.
> Measure impact, iterate, eliminate workflows that don't net-help.

---

## 🎯 Goal

By end of this module:

- Apply AI to 10+ concrete QA tasks with clear patterns
- Measure productivity impact honestly
- Know when AI hurts vs helps (both exist)
- Adopt 3-5 workflows into daily rhythm
- Share best patterns with team

---

## 🗺️ The QA workflow (AI-augmented)

Typical QA work + where AI fits:

```
┌──────────────────────────────────────────────────────────┐
│  1. Requirements → test plan (AI: decompose specs)       │
│  2. Test case design (AI: generate scenarios)            │
│  3. Test data (AI: generate realistic + edge)            │
│  4. Write tests (AI: scaffold code)                      │
│  5. Review tests (AI: critique)                          │
│  6. Run tests (non-AI: just run)                         │
│  7. Debug failures (AI: analyze traces)                  │
│  8. Root cause analysis (AI: hypothesize)                │
│  9. Fix flaky (AI: suggest + verify)                     │
│ 10. Refactor (AI: suggest migrations)                    │
│ 11. Documentation (AI: auto-generate docs)               │
│ 12. Report to stakeholders (AI: summarize)               │
└──────────────────────────────────────────────────────────┘
```

Not every step benefits. Senior = knowing which steps gain most.

---

## 📝 Part 1: Requirements → Test Plan

### Pattern: Spec decomposer

**Input:** Product spec / user story / BDD file
**Output:** Structured test plan with priorities

```
Role: Senior QA engineer.

Input: [paste user story or spec]

Task: Decompose into:

1. **Happy path scenarios** (2-3)
2. **Negative scenarios** (3-5)
3. **Boundary conditions** (2-3)
4. **Edge cases** (3-5)
5. **Cross-cutting concerns**:
   - Accessibility (specific checks)
   - Performance (specific budgets)
   - Security (specific threats)
6. **Out of scope** (explicit, for alignment)

For each scenario:
- Name (clear, behavior-driven)
- Priority (P0/P1/P2)
- Automation feasibility (easy/medium/hard)
- Estimated effort

Format: markdown table.

Don't write code yet.
```

### Typical output quality

- First attempt: 60-70% useful (miss some edge cases)
- After feedback + refinement: 85-90%
- Use as **starting point**, you + team add domain knowledge

### Senior tip: combine with team workshop

```
AI draft → Print out → 45-min team review → Add domain edges → Finalize
```

AI reduces "blank page problem". Team expertise + AI breadth.

---

## 🧪 Part 2: Test Data Generation

### Pattern: Realistic + edge data

````
Generate 30 test users for an e-commerce platform.

Distribution:
- 15 realistic users (age 18-65, diverse countries, various buying patterns)
- 5 Vietnamese users (UTF-8 names, VN phone, Hanoi/HCMC addresses)
- 3 edge names (1 very short "A", 1 very long 100 chars, 1 hyphenated)
- 3 special characters (emoji in name, apostrophe "O'Brien", tildes "Pérez")
- 2 security patterns (SQL injection attempts, XSS)
- 2 boundary emails (single char local part, 254-char email max)

Output: TypeScript array, each with field `expectedResult: 'accepted' | 'rejected_reason_X'`.

Format:
```typescript
const testUsers: TestUser[] = [
  { firstName: "Alice", lastName: "Smith", email: "...", expectedResult: "accepted" },
  ...
];
````

```

### When AI data wins
- Volume + variety (generate 100s quickly)
- Thinking of cases you'd miss
- Localizations (Vietnamese, etc.)
- Boundary cases

### When NOT to use AI data
- Production-style datasets (use real anonymized)
- Compliance-regulated data (PCI, HIPAA)
- Statistical distributions (use proper tools)

### Data management tips
- Version control the generated datasets
- Include `seed` for reproducibility
- Document generation prompt in repo
- Re-generate quarterly with new edge cases

---

## ✍️ Part 3: Test Code Generation

### Pattern A: From Gherkin → code
```

Feature: [paste Gherkin]

Generate Playwright TypeScript test file.

Context:

- Project: [quick describe or ref CLAUDE.md]
- POM location: src/pages/
- Fixtures: import from @fixtures/index
- Style: tests/saucedemo/login.spec.ts pattern

Include:

- All scenarios from Gherkin
- Both happy + failure paths
- Tags: @smoke for critical, @regression for rest
- TypeScript strict

Output: single file, ready to commit.

```

### Pattern B: From requirements → multiple files
**Break into steps (chaining):**

Step 1 prompt:
```

Given spec: [paste]
Identify page objects needed, list (don't code yet).

```

Step 2 prompt (after reviewing):
```

Generate src/pages/feature.page.ts POM with methods:
[paste list from step 1]

Follow BasePage pattern, readonly locators, business-named methods.

```

Step 3 prompt:
```

Generate tests/features/feature.spec.ts using the POM above.
Cover scenarios: [paste list]

```

Multi-step = more control, cleaner output.

### Quality gates for AI-generated tests
Before committing AI code:
1. `npm run typecheck` — TS correctness
2. `npm run lint` — code style
3. Run tests locally — actually work?
4. Read diff — understand every line
5. Check: any `waitForTimeout`? `any` types? CSS selectors?

**Senior discipline:** never commit unread AI code.

---

## 🔍 Part 4: Test Review & Critique

### Pattern: AI as peer reviewer

```

Review this Playwright test critically:

[paste file content]

Flag specifically (with line numbers):

1. **Locator quality**
   - Using CSS when role/label available?
   - Fragile selectors (nth-child, long chains)?
   - Hard-coded data vs dynamic?

2. **Waiting & synchronization**
   - Any waitForTimeout?
   - Non-web-first assertions?
   - Missing waits for network/state?

3. **Assertions**
   - Assert what matters (user-observable)?
   - Missing state assertions?
   - Redundant assertions?

4. **Structure**
   - POM usage correct?
   - Fixtures used?
   - Test independence?

5. **Edge cases missing**
   - Empty input?
   - Auth expiry?
   - Network failure?
   - Race conditions?

Format: markdown table [Line, Severity (Critical/Major/Minor), Category, Issue, Suggestion].

Be strict. No softening.

```

### Typical response quality
- Catches 70-80% of issues a senior would
- False positives ~10-20% (ignore)
- Sometimes misses domain-specific issues
- Complements human review, doesn't replace

### Integrate into PR workflow
**Option 1: Manual** (simple)
- On PR, run Claude review
- Post summary as PR comment

**Option 2: Automated** (agent)
- GitHub Action triggers agent
- Agent reads changed files
- Agent comments with review

**Option 3: IDE integration**
- Cursor/Claude Code review before PR
- Apply fixes → push

---

## 🐛 Part 5: Debug & Flaky Test Triage

### Pattern: AI as diagnostician

```

Test tests/cart.spec.ts fails intermittently in CI (30% rate).
Passes locally 100%.

Test code:
[paste]

Error message:
[paste]

Trace viewer shows:

- Step: locator.click() times out at 30000ms
- Preceding: GET /api/cart takes 2-4s
- Locator: page.getByRole("button", { name: "Checkout" })

CI: 4 workers, Ubuntu-latest, retries=2
Environment: staging (shared with dev team)

Analyze as detective:

Hypothesis 1 (most likely): [with reasoning]
Hypothesis 2: [with reasoning]
Hypothesis 3 (less likely): [with reasoning]

For top hypothesis, suggest:

- Verification experiment (how to confirm)
- Proposed fix (code)
- Prevention (how to avoid in future)

Don't guess — reason from observations.

```

### When AI diagnosis shines
- Common flakiness patterns (race, timing, data)
- When you give full context (trace, logs, env)
- Combining multiple signals

### When AI diagnosis fails
- Unique domain bugs
- Insufficient context provided
- Real root cause is in 3rd-party infra

### Senior tip: track AI accuracy
Keep log:
- Test bug
- AI hypothesis
- Actual root cause
- Match / mismatch

Over time, learn where AI reliably correct vs unreliable.

---

## 🔧 Part 6: Test Refactoring

### Pattern: Migration planning

```

I have Playwright test suite:

- 80 .spec.ts files
- No shared fixtures (each test has beforeEach with new LoginPage())
- Mix of CSS and role locators
- Some tests use waitForTimeout

Plan migration to:

- Centralized fixtures in src/fixtures/
- 100% role-based locators (or getByLabel)
- No waitForTimeout

Output:

1. Migration order (which files first, why)
2. Effort estimate per file category
3. Risks to watch (what could break)
4. Automation opportunities (scripts to help)
5. Testing strategy (how to verify migration correct)

Don't touch code yet. Plan only.

```

After plan → execute step-by-step in subsequent prompts.

### Codemod patterns
For bulk mechanical changes, combine AI + code:

**Example: replace all `waitForTimeout` with `waitForLoadState`:**
1. AI analyzes patterns
2. Generates regex / AST transformer
3. Run transformer across codebase
4. AI reviews + fixes remaining
5. Human final sweep

Tool: [jscodeshift](https://github.com/facebook/jscodeshift) for AST transforms.

---

## 👁️ Part 7: Visual Testing with AI

### Beyond pixel comparison

Traditional visual: `expect(page).toHaveScreenshot()` — pixel diff.

AI visual tools (Applitools, Percy, Chromatic):
- **Semantic diff** — ignore minor pixel differences, catch meaningful changes
- **Cross-device** — test on many devices easily
- **Learn baselines** — adapt to acceptable change patterns

### AI-powered local visual tests

**Using multimodal Claude:**
```

[Attach screenshot of current UI]
[Attach screenshot of previous UI]

What changed between these?
Categorize changes as:

- Intentional (design update, content change)
- Accidental (bug, broken layout)
- Cosmetic (fonts, colors shifted slightly)

Flag any accessibility concerns (contrast, spacing, text overflow).

```

Not a replacement for dedicated tools, but free + flexible.

### Tools
- [Applitools Eyes](https://applitools.com/) — enterprise, AI-native
- [Percy](https://percy.io/) — BrowserStack, team-friendly
- [Chromatic](https://www.chromatic.com/) — Storybook-native
- [Lost Pixel](https://losttpixel.com/) — OSS alternative

---

## 🔁 Part 8: Self-healing tests

### The promise
Tests that fix themselves when UI changes.

### Current reality (2026)
Partially possible, not magical. Works for:
- Locator changes (dev renamed class) — AI suggests new locator
- Minor text updates — AI detects, updates assertion

Doesn't work for:
- Business logic changes
- New steps required
- Paradigm shifts in UI

### How it works
```

Test runs → Fail (locator not found)
↓
AI analyzes: "button 'Submit' exists with different class"
↓
Propose updated locator: page.getByRole("button", { name: "Submit" })
↓
[Human approves → apply → retry]
OR [Auto-apply with confidence threshold]

```

### Implementation (DIY)
Using Playwright Inspector + AI:
1. On locator failure, capture DOM snapshot
2. Send to LLM with failed locator + snapshot
3. LLM suggests alternate locator
4. Try — if pass, log self-heal event + PR to update

### Tools with self-healing built-in
- [Testim](https://www.testim.io/) — commercial, AI-heavy
- [Katalon](https://katalon.com/) — also has it
- Playwright native: not yet (as of 2026)

**Senior take:** Don't over-invest. Well-written tests with role locators rarely need self-healing. If self-healing triggers often, root cause = unstable UI or bad locator strategy.

---

## 📊 Part 9: Coverage analysis + gap identification

### Pattern: Coverage auditor agent

```

Analyze this project:

- src/ has 40 source files (attached tree)
- tests/ has 15 spec files

For each src file:

- Check if corresponding test exists
- If yes, evaluate test quality (LOC, assertion count, tag presence)
- Flag gaps + quality issues

Output markdown report with:

- Coverage %
- Priority gaps (by file importance)
- Quality issues (by test file)
- Top 5 recommendations

```

Automate as nightly agent (from Day 24/26 bootcamp).

### Beyond line coverage

Line coverage (what Jest/nyc measure) says "this line executed".

Better questions:
- Is the **behavior** tested? (not just line)
- Are **error paths** tested?
- Are **concurrent scenarios** tested?
- Are **state transitions** tested?

AI can help identify behavioral gaps:
```

Given this function: [paste]
List behaviors that should be tested (not line coverage, but observable behavior).
For each, is there a test? If not, what's the risk?

```

---

## 📝 Part 10: Test Documentation

### Pattern: Auto-generate docs from tests

```

Here are my test files (tests/ directory):
[paste key files]

Generate documentation:

1. **Feature coverage matrix** — which features have which test types
2. **Test naming guide** — patterns I use
3. **Fixture catalog** — what fixtures exist, when to use
4. **Running tests guide** — commands + scenarios

Target audience: new team member. Length: 500-800 words.

Format: markdown with headers, code blocks, tables.

```

Output: `TEST_DOCUMENTATION.md` for onboarding.

### Auto-update on changes
Combine with git hooks:
- After PR merged, agent updates test docs
- Commits as "docs: sync test documentation"

### Living documentation
AI drafts, humans refine. Update quarterly minimum.

---

## 📊 Part 11: Reporting to Stakeholders

### Pattern: Executive summary from test run

```

Test suite ran today. Results:

- 347 tests total
- 332 passed
- 8 failed
- 7 flaky (passed on retry)
- Duration: 12 min

Failed tests:
[paste list with summaries]

Generate executive summary (non-technical, 200 words):

- Overall health
- Key risks to ship today
- Recommended actions
- Trend (compare to last week if data provided)

Tone: professional, clear, no jargon. Format: plain paragraphs, no tables.

```

### For different audiences
- **Engineering leads** — technical detail, trends, flaky rate
- **Product** — risk level for release, user impact
- **C-suite** — 3 sentences: green/yellow/red, one number

AI helps translate same data → multiple audiences.

---

## 📐 Part 12: Workflow productivity measurement

### Setup baseline
Before heavy AI adoption:
- 2 weeks: measure your current output
  - Tests written/week
  - Bugs found
  - Time to fix flaky
  - Satisfaction 1-10

### Integrate AI
Apply 3-5 workflows from this doc.

### Measure after
2 weeks AI-integrated:
- Same metrics
- Note which tasks faster, which slower

### Honest report
Example real numbers (anonymized):
```

                 Before AI   After AI   Delta

────────────────────────────────────────────────
Tests/week 12 22 +83%
Flaky fix time 2h 45min -62%
Design time 3h 3.5h +17% (slower!)
Satisfaction 7 8 +1

```

Design time slower → AI not always net-positive. Accept reality.

### Track over time
Re-measure every 3 months. Tools + workflows evolve.

---

## ⚖️ Part 13: When AI hurts (real cases)

### Case 1: Over-reliance on first output
**Bug:** AI generates test, you commit. Test passes but doesn't actually verify behavior.
**Root cause:** Shallow assertions AI produces by default.
**Fix:** Always critique own AI output.

### Case 2: Debugging via AI actually slower
**Bug:** Spent 20 min formatting context for AI, AI guessed wrong, you figured it out in 5 min manual.
**Root cause:** Easy bug wasn't worth AI setup cost.
**Fix:** Try manual first 5 minutes, then AI if stuck.

### Case 3: Team fragmentation
**Bug:** Everyone has different AI workflow, code style inconsistent.
**Root cause:** No team playbook.
**Fix:** Shared CLAUDE.md, PROMPT_LIBRARY, standards.

### Case 4: Context-switching tax
**Bug:** Constant switching IDE ↔ chat ↔ terminal breaks flow.
**Root cause:** Tool setup not streamlined.
**Fix:** Claude Code CLI or tight IDE integration. Reduce switching.

### Case 5: AI overconfidence in unfamiliar domain
**Bug:** AI confidently wrong about Vietnamese character handling in regex.
**Root cause:** Training data skew.
**Fix:** Always verify domain-specific claims.

---

## 🎯 Case study: Month 3 workflow transformation

### Typical senior tester's AI-augmented day (2026)

**Morning:**
- Review overnight AI agent report (coverage, flakiness, CI health)
- 30 min: triage flagged issues
- AI helps prioritize

**Mid-morning:**
- Feature work: PM spec → AI decompose → team review → test plan
- 45 min focus: AI drafts POM + initial tests
- 45 min: refine, add domain edges, ensure quality

**Lunch + async:**
- PR reviews: AI first-pass, senior judgment layer
- Slack: help juniors with AI-workflow questions

**Afternoon:**
- Complex debug: AI hypothesizes, senior investigates with ReAct
- Refactor: AI plans, senior executes step by step

**End of day:**
- 15 min: log AI interactions (wins + losses)
- Update PROMPT_LIBRARY if pattern discovered

Total output: 2-3x pre-AI. Quality: equivalent or better. Stress: lower.

This is aspirational but achievable.

---

## 🚦 AI workflow decision framework

Ask before using AI:

1. **Is task well-defined?**
   No → spend 5 min defining. AI amplifies clarity, not ambiguity.
2. **Have I tried 5 minutes manual?**
   No → try manual. Easy tasks faster solo.
3. **Do I have context AI needs?**
   No → gather context. Garbage in, garbage out.
4. **Will I review output carefully?**
   No → don't use AI. Auto-commit is dangerous.
5. **Have I measured AI helps here?**
   No → track this first time.

Yes to all → proceed with AI. Otherwise, reconsider.

---

## 📚 Resources

### Case studies
- [Meta — AI in Software Testing](https://engineering.fb.com/category/testing/)
- [Google Testing Blog](https://testing.googleblog.com/) — search AI posts
- [Microsoft Research — Software Testing](https://www.microsoft.com/en-us/research/research-area/software-engineering/)

### Visual testing
- [Applitools blog](https://applitools.com/blog/) — AI visual testing leader
- [Percy docs](https://www.browserstack.com/docs/percy)
- [Chromatic docs](https://www.chromatic.com/docs/)

### Tools in space
- [Testim](https://www.testim.io/) — AI-first test platform
- [Katalon Studio](https://katalon.com/) — commercial
- [Mabl](https://www.mabl.com/) — low-code + AI
- [Tricentis Tosca](https://www.tricentis.com/products/automate-continuous-testing-tosca) — enterprise

### Research
- Papers on LLM code generation, TestGPT, self-healing — search Semantic Scholar

### Community
- [AI Testing Conference](https://aitestingconf.com/) — annual
- [Ministry of Testing — AI Testing track](https://www.ministryoftesting.com/)

---

## 🎯 Exercises

### 🟢 Basic (Week 9)
1. Apply 3 patterns from this doc to real tasks tuần này. Measure time saved.
2. Generate test plan for 1 feature via Spec Decomposer pattern.
3. Use AI review on 3 old test files. Apply 1-2 suggestions each.

### 🟡 Intermediate (Week 10)
1. Build nightly coverage auditor agent (homework from Day 24 bootcamp + build up).
2. Pipeline: bug report → reproduce → test → PR. Full agent flow.
3. Self-healing experiment: 1 test, manually break locator, test AI suggest fix.

### 🔴 Advanced
1. Measure AI impact rigorously (2 weeks baseline, 2 weeks AI) — publish blog.
2. Build custom MCP for your team's specific workflow.
3. Design + run team adoption (train 3+ people, share playbook).

### 🏆 Mini project (End of Week 10)
**Task:** Personal AI-Testing Playbook v1.

Create `AI_TESTING_PLAYBOOK.md` covering:
- 10 workflows you've adopted
- Per workflow: prompt template, example, metric, lesson learned
- Anti-patterns you've seen
- Tool config (`.claude/`, MCP setup)

Share with team. Present 30-min workshop. Gather feedback.

### 🌟 Stretch goal
Write long-form blog (1500-2000 words): "How I redesigned my testing workflow with AI in 3 months — data + lessons."

---

## ✅ Self-check

Can you do, unaided:
- [ ] Generate test plan from spec that colleagues approve
- [ ] Use AI code review to find ≥ 3 issues in own code
- [ ] Debug flaky test with AI in under 30 min
- [ ] Build 1 production agent for ongoing QA task
- [ ] Measure AI productivity impact honestly
- [ ] Teach 1 teammate an AI workflow

Goal: all yes by end of Month 3.

---

## Next

[08 — AI Best Practices (Senior) →](./08-ai-best-practices-senior.md) — principles that separate good from reckless AI use.
```
