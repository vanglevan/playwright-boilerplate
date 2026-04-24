# 09 — AI Productivity Playbook

> Concrete patterns to 3-10x productivity. Copy, adapt, measure.
> This is the "how" doc — more tactical than philosophical.

---

## 🎯 Why this playbook

Principles (Doc 08) = when + whether.
This doc (09) = **how**, with specific tactics you can steal today.

**What you'll get:**

- 10x patterns with working prompts
- Daily / weekly / monthly rhythms
- Workflow templates
- Metrics + measurement
- Real-world examples

---

## ⚡ The 10 Core Patterns

### Pattern 1: The Brief (30 sec context → 10 min saved)

**Problem:** Repeated context-setting wastes time.

**Solution:** Create `BRIEF.md` — 1-paragraph project context. Reference in every session.

```markdown
# BRIEF.md

Project: SaaS B2B platform, 18 eng, Q3 2026 launch.
Stack: React + Node + Postgres + Playwright tests.
My role: Senior automation tester.
Current focus: test suite for checkout flow.

Conventions: See CLAUDE.md.
Active sprint: tests for payment integration.
```

Open with: _"Context: see BRIEF.md. Task: ..."_

**Time saved:** 5-10 min per conversation. Over 20 conversations/week → 100-200 min saved.

---

### Pattern 2: The Rubber Duck (30 min → 5 min debug)

**Problem:** Staring at flaky test for 30 minutes.

**Solution:** Explain problem to AI like explaining to teammate.

```
I have a test that fails 30% in CI, passes 100% local.

It's checking cart.addItem() flow.

[Paste test code]

Error message:
[Paste]

CI environment: ubuntu-latest, 4 workers, retries=2
Local environment: macOS, headed, 1 worker

Don't solve yet. Ask me clarifying questions first.
```

Often **act of writing it out** solves problem. AI's questions prompt you.

**Time saved:** 20-25 min on avg tough debug. If AI helps, even more.

---

### Pattern 3: The Scaffolder (1 hour → 10 min)

**Problem:** Writing boilerplate (POM, fixture, etc.).

**Solution:** Template-prompt.

```
Generate src/pages/checkout.page.ts:

- Extends BasePage
- Path: /checkout
- Locators: form inputs (email, address, city, zip, card info), submit button
- Methods: fillPersonalInfo(data), fillPayment(card), submit()

Reference existing: src/pages/login.page.ts for style.
TypeScript strict, readonly locators.
```

10 min → skeleton. 30 min → you add business logic.

**Time saved:** 45-60 min per page object.

---

### Pattern 4: The Reviewer (1 hour → 15 min)

**Problem:** PR review takes forever.

**Solution:** First-pass with AI, human focuses on judgment.

```
Review this PR diff:
[paste diff]

For each file, flag (line numbers):
- Bugs (functional issues)
- Smells (not bugs, but suspicious)
- Missing tests
- Style violations

Format: table [File, Line, Severity, Issue, Suggestion].
```

AI catches routine issues. You focus on:

- Architectural decisions
- Business logic correctness
- Edge cases AI missed

**Time saved:** 30-45 min per PR.

---

### Pattern 5: The Critic (hidden 2x quality)

**Problem:** AI's first output = mediocre.

**Solution:** Ask for critique immediately.

Prompt 1:

```
Write a test for feature X.
```

Prompt 2 (same convo):

```
Critique your test above. List specifically:
- Coverage gaps
- Flakiness risks
- Better locator options
- Readability issues

Then rewrite improved version.
```

AI's v2 = significantly better than v1. Same tokens budget.

**Quality gain:** 2x subjective quality.

---

### Pattern 6: The Expander (1 idea → 10 scenarios)

**Problem:** Thinking of edge cases is tiring.

**Solution:** Brainstorm at scale.

```
Happy path test for checkout payment:
[paste]

Generate 10 negative/edge test scenarios:
- 3 payment failures (declined, expired, insufficient)
- 2 network issues (timeout, partial response)
- 2 user errors (invalid card format, wrong CVV)
- 2 edge cases (very small amount, very large)
- 1 security (SQL in name field)

For each: scenario name, setup, expected behavior.
```

You pick 5 worth implementing.

**Time saved:** 20-30 min brainstorming → 3 min curate.

---

### Pattern 7: The Translator (30 min → 5 min)

**Problem:** Translating same info for different audiences.

**Solution:** AI translates.

Source material (rich, technical):

```
Test suite results: 347 tests, 8 failed, 7 flaky passed-on-retry.
Duration 12 min. Failed: 3 checkout (API 500), 2 search (wrong data), 3 a11y (contrast).
Flaky: 5 cart, 2 login.
```

Prompt:

```
Generate 3 summaries of above test results:

1. For C-suite (3 sentences, red/yellow/green, 1 action item)
2. For engineering lead (1 paragraph, root causes, priority)
3. For product manager (release readiness assessment, user impact)
```

3 stakeholders in 1 prompt. 5 minutes.

**Time saved:** 25 min.

---

### Pattern 8: The Auditor (nightly free work)

**Problem:** Maintenance work (coverage, doc updates, technical debt tracking) never done.

**Solution:** Agent runs nightly.

Setup (from Doc 06 Agentic Engineering):

```bash
# .github/workflows/nightly-audit.yml
on:
  schedule:
    - cron: "0 3 * * *"
jobs:
  audit:
    steps:
      - uses: actions/checkout@v4
      - run: npx tsx agents/test-auditor.ts
      - name: Commit audit
        run: |
          git config ...
          git add AUDIT.md
          git commit -m "docs: nightly audit" || true
          git push
```

Wake up to maintained quality docs.

**Time saved:** 2-3 hours/week.

---

### Pattern 9: The Template Factory (generate similar 10x)

**Problem:** Writing 10 similar tests (pagination, sorting, filter variants).

**Solution:** Generate template, parameterize.

```
Given this one test (for sorting A-Z):
[paste]

Generate tests for:
- Sort Z-A
- Sort price low-high
- Sort price high-low
- Sort newest first
- Sort best-seller

Maintain exact same structure, only change sort param + expected order.
```

Output: 5 tests in 1 prompt. Manually write 1, AI writes 5.

**Time saved:** 30+ min.

---

### Pattern 10: The Commit Message Bot (always good messages)

**Problem:** Rushed commits → bad messages.

**Solution:** AI generates from diff.

```bash
# Alias in ~/.zshrc
ai-commit() {
  git diff --cached | claude-code -p "Based on this diff, generate Conventional Commit message. Single line, <70 chars. Return only the message."
}

# Usage
git add .
ai-commit | git commit -F -
```

Good messages, every time.

---

## 🕒 Daily Rhythm

### Morning (15 min)

1. Check overnight agent output (auditor, flakiness, CI status)
2. Prioritize day based on AI findings
3. Quick CLAUDE.md update if new convention adopted

### Deep work (2-3 hour blocks)

- Single AI window per task
- Clear context → prompt → iterate 2-3 turns → ship
- Don't keep 10 AI tabs open

### Afternoon (focused tasks)

- PR reviews (AI first-pass, you judgment)
- Pair with teammate (you + AI + teammate)

### End of day (10 min)

- Log notable AI wins/losses in NOTES.md
- Update PROMPT_LIBRARY if new pattern
- Close unused AI sessions (security)

---

## 📅 Weekly Rhythm

### Monday: Plan + review

- Review last week's AI metrics
- Plan week's focus (AI-heavy tasks vs manual)
- Team AI sync (30 min)

### Tue-Thu: Execute

- Deep work patterns
- Track wins/losses

### Friday: Retro + learn

- Self-retrospective (30 min)
- Update PROMPT_LIBRARY
- Share 1 win with team

---

## 📆 Monthly Rhythm

### Week 1: Measure

- Collect productivity metrics
- Compare to last month

### Week 2: Evolve

- Update CLAUDE.md with new conventions
- Deprecate underperforming prompts

### Week 3: Share

- Blog/write post (1 a month)
- Team workshop or 1:1 teaching

### Week 4: Explore

- Try new AI tool or feature
- Read 2-3 latest AI articles
- Experiment with 1 new workflow

---

## 📊 Measurement framework

### Individual metrics

```
Week of YYYY-MM-DD
Workflows used: [list]
Prompts count: ~40

Speed metrics:
- Tests written: 22 (target 15+)
- Avg time per test: 18 min (with AI) vs 35 min (baseline)
- PRs reviewed: 8

Quality metrics:
- Bugs escaped: 0
- Flaky introduced: 0
- Code review rejections: 2 (last week 4)

Wellbeing:
- Satisfaction 1-10: 8
- Cognitive load: 5/10 (lower = better)

Lessons:
- Pattern X works great for Y
- Pattern Z not worth the overhead
```

Track weekly. Keep history.

### Team metrics (aggregated)

- Avg PR review time
- CI flaky rate
- Test coverage %
- Feature test cycle time
- Team satisfaction

Review quarterly.

### Qualitative metrics

"Feels" matter too:

- Less stressed?
- More time for deep work?
- Pride in work?
- Learning?

If AI is net-negative on these, reconsider regardless of speed numbers.

---

## 🧪 Workflow examples

### Workflow: "Feature arrives → test suite ready"

Total time: 3-4 hours (was 8-10 hours pre-AI).

```
1. PM sends spec (10 min to read)
2. AI decomposes spec → scenarios (5 min)
3. You review + add domain edges (20 min)
4. AI scaffolds POM + fixtures (10 min)
5. You refine + add business logic (45 min)
6. AI generates happy path tests (20 min)
7. AI generates edge case tests (30 min)
8. You review all + fix issues (45 min)
9. Run + debug (30 min)
10. AI review own tests (15 min)
11. Fix issues (15 min)
12. Commit + PR (10 min)
```

### Workflow: "Flaky test → fixed"

Total: 30-45 min (was 2-3 hours).

```
1. Identify flaky from CI (2 min)
2. Reproduce locally with --repeat-each (5 min)
3. AI analyzes trace + hypothesizes (10 min)
4. You verify top hypothesis (10 min)
5. AI suggests fix (5 min)
6. Apply + test 20 runs (10 min)
7. Commit + close issue (3 min)
```

### Workflow: "Legacy refactor"

Total: 1-2 days (was 1 week).

```
Day 1 morning:
1. AI analyzes codebase, proposes migration plan (1 hour review)
2. You review + adjust (1 hour)
3. AI generates codemod scripts (30 min)
4. Apply to 1 file, verify (1 hour)

Day 1 afternoon:
5. Apply to 10 files with script (10 min)
6. AI reviews each file output (30 min)
7. Manual fixes where needed (1 hour)

Day 2:
8. Apply to remaining 40 files (1 hour)
9. Run full test suite (30 min)
10. Fix regressions (2 hour)
11. PR + docs (1 hour)
```

---

## 🎛️ Configuration tips

### CLAUDE.md maintenance

Update weekly:

- New conventions adopted
- Common corrections you make to AI
- Project-specific knowledge

### PROMPT_LIBRARY.md structure

```markdown
# Prompt Library

## Generate tests

### From Gherkin

[template]
Metrics: 47 uses, 1.2 avg iterations, ~20 min saved each

### From component API

[template]
...

## Review

### Test file critique

[template]
...
```

Organized by category. Metrics per template.

### Hooks for habit formation

```json
{
  "PostToolUse": [{ "matcher": "Edit|Write", "hooks": [{ "command": "npm run typecheck" }] }],
  "Stop": [{ "command": "echo 'Review diff + commit. Update NOTES if significant.'" }]
}
```

Make good habits default.

---

## 🚨 Anti-patterns (avoid productivity tax)

### Anti-pattern 1: AI for trivial

```
"Write: const x = 1"
```

Manual is 100x faster. Don't ask AI.

### Anti-pattern 2: Context as crutch

Pasting 5000-line file every prompt. Fragment + reference by file path.

### Anti-pattern 3: Perfect prompt hunt

Spending 15 min crafting "the perfect prompt" for 5-minute task. Just ask, iterate.

### Anti-pattern 4: Chat drift

50-turn conversation, AI forgetful, slow. Start fresh convo.

### Anti-pattern 5: Tool sprawl

Claude + Cursor + Copilot + Aider simultaneously. Pick 1 primary.

### Anti-pattern 6: Metric obsession

Spending 30 min logging AI use after each task. Measure weekly, not constantly.

### Anti-pattern 7: AI FOMO

Constantly trying new tools because social media. Stabilize 3 months, then try.

### Anti-pattern 8: Abandoning good workflows

"Not new enough." Old + proven > new + shiny for most work.

---

## 🛠️ Personal setup template

### Your `~/.claude/` (user-level)

```
~/.claude/
├── settings.json           # Global preferences
├── commands/               # Personal commands
│   ├── brief.md            # Load project context
│   ├── critique.md         # Ask AI to critique
│   └── expand.md           # Brainstorm variants
└── memory/                 # Personal knowledge
    └── workflows.md        # Your patterns
```

### Your `BRIEF.md` (per project)

Short context for current project.

### Your `PROMPT_LIBRARY.md` (personal)

20+ templates refined over time.

### Your `NOTES.md` (running journal)

Daily observations, weekly retros.

### Your measurement spreadsheet

Weekly metrics tracked.

Invest 2-3 hours in setup. Pay off forever.

---

## 🎓 Mentorship + teaching patterns

### Pair-programming with junior + AI

1. Junior drives, you observe
2. Junior stuck → you suggest AI pattern
3. Junior uses pattern, learns
4. Discuss what worked/didn't
5. Junior writes their own version

Teaches: AI literacy + good judgment.

### Code review teaching moments

When reviewing junior's AI-assisted code:

- "How did AI help here?"
- "What did you verify?"
- "What would you ask AI differently?"

Grow them, not just correct.

### Team workshop structure (1 hour)

1. Intro (5 min): Why this pattern
2. Demo (15 min): You use it live
3. Each person tries (20 min): hands-on
4. Share observations (15 min): wins/struggles
5. Assign homework (5 min): apply to real task

Run monthly. Rotating patterns.

---

## 📈 Career implications

### Visibility from productivity

Seniors who 3x output visible:

- Lead projects
- Mentor many
- Promoted faster
- Recruited more

### Skill compounding

Each month → better prompts → better workflows → better output.
Compounding is underrated.

### Differentiation in job market

2026 market: "AI-native" tester earns 20-40% premium.
Portfolio showing AI-integrated work = stand out.

---

## 🔧 Troubleshooting productivity drops

### "I feel slower with AI"

Likely causes:

- Over-tooling (simplify)
- Bad context management (update CLAUDE.md)
- Perfectionist prompting (just ask, iterate)
- Unclear metrics (how do you know slower?)

### "AI outputs bad quality suddenly"

Check:

- Model updated? (behavior changed)
- Context bloated? (new session)
- Task ambiguous? (clarify)
- Prompts out of date? (refine library)

### "Team lagging on adoption"

Approach:

- Demo specific value (not abstract)
- Pair with volunteers first
- Let skeptics watch successes
- Don't force

---

## 📚 Resources

### Productivity-focused

- [Simon Willison — AI productivity](https://simonwillison.net/)
- [Every — tech productivity](https://every.to/)
- [Farnam Street](https://fs.blog/) — mental models

### Workflow inspiration

- [Building in public — Twitter/X](https://twitter.com/search?q=ai%20workflow)
- [r/ChatGPTCoding](https://reddit.com/r/ChatGPTCoding)

### Tools

- [Raycast](https://raycast.com/) — launcher with AI
- [Superwhisper](https://superwhisper.com/) — voice → text everywhere
- [Granola](https://granola.ai/) — AI meeting notes

### Books

- _Deep Work_ — Cal Newport (focus principles)
- _Getting Things Done_ — David Allen
- _Atomic Habits_ — James Clear

---

## 🎯 Exercises

### 🟢 Basic

1. Set up BRIEF.md for current project.
2. Try 3 patterns from this doc tuần này. Measure time saved.
3. Add 1 hook that enforces a habit.

### 🟡 Intermediate

1. Build weekly measurement routine. Track 4 weeks.
2. Run 1 team pattern workshop.
3. Publish PROMPT_LIBRARY as public gist.

### 🔴 Advanced

1. Build nightly auditor agent (Pattern 8).
2. Measure team-level productivity (not just individual).
3. Write long-form blog post on patterns that 3x'd your productivity.

### 🏆 Mini project (End of Month 3)

**Task:** Personal AI Productivity System v1.

Deliver:

- BRIEF.md + CLAUDE.md + PROMPT_LIBRARY.md + NOTES.md
- 10 workflows documented
- 4 weeks of metrics
- 2-page report: "My productivity transformation"

Public gist. Get feedback. Iterate.

### 🌟 Stretch goal

Talk at meetup: "How AI changed my daily work — measured".

---

## ✅ Self-check

Can you do, unaided:

- [ ] List your 5 most-used patterns
- [ ] Cite your productivity metrics (with data)
- [ ] Teach teammate a pattern effectively
- [ ] Identify and eliminate an anti-pattern from your workflow
- [ ] Decide: "for this task, AI or manual?"

Goal: all yes.

---

## Next

[10 — Advanced Testing Topics →](./10-advanced-testing-topics.md) — beyond AI, technical depth for senior role.
