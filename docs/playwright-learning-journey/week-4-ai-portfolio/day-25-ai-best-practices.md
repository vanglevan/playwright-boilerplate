# Day 25 — AI Best Practices (10 Rules)

> **Goal:** Crystallize 10 rules cho làm việc với AI trong automation. Commit vào `AI_WORKFLOW.md` cá nhân.
> **Thời gian:** 2 giờ

---

## Prerequisites

- Day 22-24 hoàn thành

---

## Rule 1: AI sinh code — bạn chịu trách nhiệm

**Không** "AI said so". Bạn là tester/engineer — AI là công cụ.

**Why:**

- Stakeholder không quan tâm AI sai — họ expect bạn catch
- AI hallucinate APIs, miss edge cases
- "But Claude suggested it" is not excusable

**How to apply:**

- Review every line trước commit
- Run `npm run check` sau mỗi AI change
- Test actually passes với chính bạn

---

## Rule 2: Never paste credentials/data thật vào AI

**Why:**

- Training data leak risk
- Compliance (GDPR, HIPAA)
- Audit trail

**How to apply:**

- Credentials → env vars, ref bằng `env.TEST_USER`
- PII → fake data (faker)
- API responses: redact sensitive fields trước paste

**Placeholder template:**

```
// Bad
user: "alice.real@company.com", password: "MyRealPass!"

// Good
user: "<EMAIL_PLACEHOLDER>", password: "<PASSWORD_PLACEHOLDER>"
```

---

## Rule 3: AI không biết codebase — cung cấp context

**Why:**

- AI default dùng "generic best practice"
- Code bạn có convention riêng (POM pattern, fixture names)
- Generic code → conflict với existing patterns

**How to apply:**

- `/init` sinh CLAUDE.md mỗi repo
- Ref existing file: "like `src/pages/login.page.ts`"
- Paste 1 example code block in prompt
- For multi-file changes: give file tree

---

## Rule 4: Prompt có ví dụ > prompt dài lý thuyết

**Why:**

- LLM pattern-match tốt, instruction follow kém
- 1 code example = 100 words description

**Bad:**

```
Write a Page Object with readonly locators, methods that return
promises, use getByRole priority, extend base class, add path property...
```

**Good:**

```
Create SignupPage like this pattern:
[paste LoginPage code]

For URL /signup with fields: email, password, confirm, acceptTerms.
```

**Apply:** Always provide 1 reference implementation.

---

## Rule 5: Test AI-generated code trước commit

**Checklist:**

- [ ] `npm run typecheck` pass
- [ ] `npm run lint` pass
- [ ] `npm test` với test mới pass
- [ ] Run test 3 lần (check flakiness)
- [ ] Read diff line-by-line

**AI có thể fabricate:**

- Functions/methods không tồn tại
- NPM packages không có
- Config options đã deprecated

---

## Rule 6: Dùng AI để review, không chỉ viết

**Often overlooked.** AI review your code là underused.

**Prompts:**

```
Review tests/cart.spec.ts:
- Any flakiness risk?
- Missing assertions?
- Better locator choices?
- Edge cases not covered?
Be specific with line numbers.
```

```
What are 5 ways this test could break in production:
[paste code]
```

```
Compare my approach vs Playwright best practice for
[specific pattern]. Where am I off?
```

**Benefit:** Free senior-level review, anytime.

---

## Rule 7: Context window có giới hạn — break task nhỏ

**Symptoms của over-context:**

- Claude "forgot" earlier instruction
- Output tangential
- Slower responses

**How to apply:**

- 1 task, 1 file, 1 prompt
- Start fresh convo khi switch domain
- Use `/clear` trong Claude Code khi context bloated

**Rule thumb:** >200 lines code in prompt = probably too much context.

---

## Rule 8: Specific > vague

**Bad:**

```
Fix this flaky test
```

**Good:**

```
Test tests/checkout.spec.ts:45 fails ~30% runs.
Trace shows: `page.getByRole('button', { name: 'Pay' }).click()`
times out waiting for actionable.
Network tab: /api/pricing returns after 2s but test expects <1s.
My hypothesis: button enables after pricing fetch completes.
Fix: wait for pricing response before click.
Implement the fix.
```

**Specificity components:**

- File:line
- Error message
- Observable behavior
- Your hypothesis
- Constraints

---

## Rule 9: AI giỏi patterns, yếu creative

**AI strengths:**

- Boilerplate (POM scaffold, config)
- Naming (given intent, suggest good name)
- Syntax (remind you API)
- Refactor mechanical

**AI weaknesses:**

- Novel edge cases (requires user empathy)
- Business logic specificity
- Strategic test coverage
- Identifying what matters

**How to apply:**

- Use AI for HOW, not WHAT
- You decide scope, priority, quality bar
- AI executes mechanics

---

## Rule 10: Đo lường

**Without metrics:** "feel" AI helps → actually costs time sometimes.

**Track weekly trong NOTES.md:**

```markdown
## Week AI metrics

### Prompts

- Useful: 15
- Discarded: 3
- Retry (bad output): 5

### Output

- Kept verbatim: 20%
- Minor tweaks: 60%
- Major rewrite: 20%

### Time

- Estimated savings: 4 hrs/week
- vs learning cost: 1 hr/week
- Net: +3 hrs
```

**When net negative:** stop, reflect on why, adjust prompts or skip AI for that task.

---

## Summary Card (in lên bàn làm việc)

```
┌─────────────────────────────────────────────┐
│  10 AI RULES FOR AUTOMATION TESTER          │
├─────────────────────────────────────────────┤
│  1. You own the code, AI is assistant       │
│  2. No real credentials in prompts          │
│  3. Give context (files, conventions)       │
│  4. Examples > descriptions                 │
│  5. Always test AI output before commit     │
│  6. Use AI for review, not just write       │
│  7. One task, one prompt                    │
│  8. Specific > vague                        │
│  9. AI for mechanics, you for judgment      │
│  10. Measure — drop if not helpful          │
└─────────────────────────────────────────────┘
```

---

## AI_WORKFLOW.md template

Create `AI_WORKFLOW.md` in your repo với content này:

```markdown
# My AI Workflow for Playwright Automation

## My Rules

[Paste 10 rules above, customized]

## Preferred Tools

- Primary: Claude Code CLI
- Secondary: Cursor (inline suggestions)
- Model: Opus 4.7 (complex), Sonnet 4.6 (fast)

## Project Conventions (reinforce in every prompt)

- Use fixtures from @fixtures/index
- POM in src/pages/
- Locator priority: getByRole > getByLabel > getByTestId
- No waitForTimeout
- Web-first assertions
- Zod validate API schemas

## Good Prompt Templates

### Generate test
```

Context: [stack, conventions]
Task: Write Playwright test for [feature]
Scenarios: [list]
Reference: [existing file path]
Constraints: [...]

```

### Review test
```

Review [file path]. Flag:

- Flakiness risks
- Missing assertions
- Locator issues
- Line numbers required

```

### Diagnose failure
```

Test [path:line] fails intermittently.
Error: [paste]
Trace summary: [paste]
Code: [paste]
Hypothesize root causes ranked by probability.

```

## Metrics

(Fill weekly)

### Week of YYYY-MM-DD
- Prompts: X | Useful: Y
- Time saved: X hrs
- Notable: ...

## Lessons Learned
1. Vague prompt → wasted 20 min Monday. Lesson: always specify file paths.
2. ...
```

---

## Bài tập

### Bài 1: Create AI_WORKFLOW.md

Populate với 10 rules + 5 prompt templates + empty metrics section.

### Bài 2: Code review AI

Pick 1 old test. Run AI review với Rule 6 prompts. Apply ≥ 1 suggestion.

### Bài 3: Bad prompt retrospective

Trong NOTES.md, recall 1 prompt tuần này KHÔNG hiệu quả. Analyze:

- Which rule violated?
- How would you rewrite?
- Rewrite + run again. Better?

### Bài 4: Measure a real week

Next 7 days: log every AI interaction với outcome (useful/discard). Compute ratio.

---

## Common Pitfalls

| Pattern                      | Why bad                          | Fix                |
| ---------------------------- | -------------------------------- | ------------------ |
| "AI is always right" mindset | Breeds complacency               | Always verify      |
| No context in prompts        | Generic output                   | Include examples   |
| Never measure                | Can't improve                    | Weekly tracking    |
| Afraid to disagree with AI   | Miss suggestions bạn know better | Push back, argue   |
| Use AI for everything        | Overhead sometimes > benefit     | Only when it helps |

---

## Checklist

- [ ] `AI_WORKFLOW.md` tạo với 10 rules
- [ ] 5 prompt templates ready
- [ ] Measure section dang ghi
- [ ] Bài 2 — AI code review apply ≥ 1 suggestion
- [ ] Bài 3 — bad prompt refactored
- [ ] Commit: `docs: AI workflow guide`
- [ ] Share `AI_WORKFLOW.md` với team hoặc LinkedIn

---

## Resources

- [Anthropic — Prompt Engineering Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial)
- [Simon Willison's prompt engineering blog](https://simonwillison.net/tags/prompt-engineering/)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [AI Engineer's Guide to Testing](https://www.aiengineer.com/) (podcast)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [How to work with AI (Karpathy)](https://www.youtube.com/@AndrejKarpathy)
- [AI ethics for engineers](https://www.youtube.com/results?search_query=ai+ethics+engineering)
- [Prompt engineering masterclass](https://www.youtube.com/results?search_query=prompt+engineering+masterclass)

### 📝 Articles & blogs

- [Anthropic — Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Simon Willison — 500+ AI/LLM articles](https://simonwillison.net/)
- [AI coding productivity research](https://github.blog/)
- [Avoiding AI dependency (thoughtful)](https://kentcdodds.com/blog)

### 🎓 Deep reading

- [Anthropic Policies](https://www.anthropic.com/policies) — acceptable use
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Google's AI Principles](https://ai.google/principles/)

### 📖 Books

- _Prompt Engineering Guide_ — free online resources
- _The Alignment Problem_ — Brian Christian (context for responsible AI)

### 🐙 Related GitHub repos

- [anthropics/prompt-eng-interactive-tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial)
- [dair-ai/Prompt-Engineering-Guide](https://github.com/dair-ai/Prompt-Engineering-Guide)
- [f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)

### 📊 Cheat sheets

- [Prompt patterns cheatsheet](https://www.promptingguide.ai/)
- [Claude capabilities overview](https://docs.claude.com/)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (awareness)

**B1.** Audit your last week's AI interactions:

- How many prompts?
- How much time saved vs spent on prompt?
- What was throwaway vs kept?

Calculate net productivity impact.

**B2.** Create `AI_WORKFLOW.md` với 10 rules. Customize for your style.

**B3.** Mini code of conduct:

```markdown
# My AI Rules

## I will always

- Read every line of AI output
- Run tests before commit
- Verify AI-suggested APIs exist

## I will never

- Paste real credentials
- Commit untested AI code
- Trust "AI said so" as justification
```

Print, stick on desk.

### 🟡 Trung bình (critical thinking)

**M1.** Detect hallucination — ask AI:

```
Use Playwright method page.waitForClick()
```

Does AI flag that function doesn't exist? If not, revise prompt/tool.

**M2.** Context-aware prompts — compare:

- Generic: "write test for login"
- Context: "write test for login using our LoginPage at src/pages/login.page.ts with methods goto() and login(user, pass)"

Output quality delta?

**M3.** Review with AI — give it your test:

```
Review this test. Flag issues. Be harsh, no politeness.
Specific line numbers required.
```

Apply feedback. Surprised by what you missed?

**M4.** Push back on AI:
When AI's first answer wrong:

```
Your suggestion uses deprecated API. Playwright 1.59 uses X instead.
Revise.
```

Practice advocating for correctness.

### 🔴 Nâng cao (meta-AI patterns)

**A1.** Multi-step prompt chain:

```
Step 1: Plan the test structure (don't code).
Step 2: I review plan, make changes.
Step 3: Generate code from approved plan.
Step 4: Review + fix issues.
Step 5: Run test.
```

Compare quality vs "one-shot generate".

**A2.** "Red team" your own code — ask AI:

```
Find 10 ways this test could fail in production.
Flag flakiness risks, edge cases, missed scenarios.
```

**A3.** Document AI decisions — keep decision log:

```markdown
## 2026-04-26 — Refactoring login test

- Asked AI to extract LoginPage.
- It proposed: [approach]
- I chose: [approach]
- Reasoning: [why]
- Outcome: [result]
```

Review weekly — calibrate judgment.

**A4.** AI-skeptical pair programming — intentionally disagree 3 times in 1 session. Does AI capitulate or defend?

### 🏆 Mini challenge (30 phút)

**Task:** Ship AI_WORKFLOW.md public:

- Finalize 10 rules với concrete examples
- 5 prompt templates working for your project
- Metrics section (track weekly)
- Lessons learned (≥ 3 real stories)
- Post on LinkedIn / blog

Goal: help 1 teammate adopt better workflow.

### 🌟 Stretch goal

Read & summarize [Anthropic's Constitutional AI paper](https://www.anthropic.com/research). Understand how Claude trained to be helpful+safe.

---

## Next

[Day 26 — MCP Servers & Custom Workflows →](./day-26-mcp-servers.md)
