# Day 22 — Claude Code / Cursor cho Tester

> **Goal:** Master AI coding assistants cho automation work. Hiểu prompt engineering cơ bản.
> **Thời gian:** 3 giờ

---

## Prerequisites

- Đã cài Claude Code hoặc Cursor (Day 0)

---

## 1. Landscape tools AI coding 2026

| Tool                                                  | Strengths                     | Pricing                  | Best for                 |
| ----------------------------------------------------- | ----------------------------- | ------------------------ | ------------------------ |
| [Claude Code CLI](https://claude.com/claude-code)     | Terminal-native, agentic, MCP | Subscription             | Power users, Unix lovers |
| [Cursor](https://cursor.com/)                         | VS Code fork, inline suggest  | Free tier + Pro          | Full IDE workflow        |
| [GitHub Copilot](https://github.com/features/copilot) | VS Code native, enterprise    | $10/mo, free cho student | Enterprise IT            |
| [Aider](https://aider.chat/)                          | CLI, git-first                | Free (bring model)       | Dev purists              |
| [Continue](https://continue.dev/)                     | VS Code ext open-source       | Free                     | DIY models               |

**Khuyến nghị:** Chọn 1 làm chính, học sâu. **Claude Code** là default tốt nhất 2026 cho agentic work.

---

## 2. Claude Code — cơ bản

### Khởi động

```bash
cd ~/Projects/playwright-learning-journey
claude
```

### Interaction patterns

- **Chat**: gõ câu hỏi như Slack với đồng nghiệp
- **Tool use**: Claude tự dùng tools (Read, Bash, Edit) để làm việc
- **File context**: drag file vào hoặc ref bằng path

### Slash commands built-in

```
/help         # help
/clear        # reset conversation
/model        # switch model
/fast         # faster mode
/agents       # manage subagents
/hooks        # manage hooks
/init         # init CLAUDE.md
/review       # review PR
/security-review  # security audit
```

Xem [resources/documents-links.md](../resources/documents-links.md) cho link docs.

---

## 3. Cursor — cơ bản

### Các feature chính

- **Cmd+K**: inline edit current file
- **Cmd+L**: chat sidebar với workspace context
- **Cmd+I**: composer (multi-file edit)
- **Tab**: auto-complete AI-powered

### Strengths cho automation

- Tab complete trong `.spec.ts` — biết Playwright API
- `@Codebase` trong chat — query cả repo
- Ctrl+K trên 1 test → "add negative case"

---

## 4. Prompt Engineering basics cho Testing

### Anatomy của prompt tốt

```
[Context]     — Ai là bạn, app gì, stack gì
[Task]        — Làm gì cụ thể
[Constraints] — Rules, avoid patterns
[Example]     — Reference code có sẵn
[Output]      — Format mong muốn
```

### Bad prompt (không hiệu quả)

```
"Write a test for login page"
```

Lý do bad:

- Không context app nào
- Không biết đã có POM chưa
- Không biết test case nào
- AI đoán → sinh generic code

### Good prompt

```
Context: I'm working on a Playwright TypeScript project for
SauceDemo (https://www.saucedemo.com/). I have a LoginPage
POM at src/pages/login.page.ts with methods goto() and
login(user, pass).

Task: Write 3 test cases for login:
1. Valid credentials → redirects to /inventory.html
2. Wrong password → shows error "Epic sadface: Username..."
3. Locked user (locked_out_user) → shows error

Constraints:
- Use getByRole/getByLabel, no CSS selectors
- No waitForTimeout
- Use fixture from src/fixtures/index.ts (test & expect)
- TypeScript strict

Reference: existing test at tests/saucedemo/inventory.spec.ts

Output: single file tests/saucedemo/login.spec.ts with 3 tests
```

AI trả được test dùng được ~80%, chỉ cần tweak nhỏ.

---

## 5. Prompt patterns cho automation tester

### Pattern 1: Generate from spec (Given-When-Then)

```
Generate Playwright test for:

Given user is on /products page
When user types "laptop" in search box
  And clicks Search button
Then results list shows at least 1 item with "laptop" in name
  And URL contains "q=laptop"

Use POM (src/pages/products.page.ts exists)
```

### Pattern 2: Review & improve

```
Review this test at tests/cart.spec.ts (attached):
- Any flakiness risk?
- Missing assertions?
- Better locators?
- Readable?

Be specific with line numbers.
```

### Pattern 3: Diagnose failure

```
This test failed in CI:
[paste error + trace summary]

Given test code at tests/login.spec.ts line 23:
[paste code]

And selected app behavior: [describe]

What are 3 likely root causes ranked by probability?
```

### Pattern 4: Refactor

```
Refactor this test file to:
- Move locators to a new LoginPage POM
- Replace page.waitForSelector with web-first assertion
- Add 2 more negative test cases

Show diff only for changed sections.
```

### Pattern 5: Explain

```
Explain what this Playwright fixture does (attached).
Focus on:
- Why `await use(X)` pattern
- What happens on test failure
- When teardown runs
```

---

## 6. Context injection strategies

AI không biết codebase của bạn — phải inject.

### Strategy A: CLAUDE.md file

```bash
/init   # trong Claude Code — tự scan repo, sinh CLAUDE.md
```

Content mẫu:

```markdown
# Project Conventions

## Stack

- Playwright 1.59, TypeScript 5 strict, Node 20
- Fixtures in src/fixtures/index.ts
- POM pattern (src/pages/)

## Testing conventions

- Use `test, expect` from @fixtures/index
- Locators: getByRole > getByLabel > getByTestId > CSS
- No waitForTimeout
- Tag tests: @smoke, @regression, @critical
```

Future AI turns auto-load CLAUDE.md.

### Strategy B: Reference files in prompt

```
Like the pattern in [src/pages/login.page.ts], create LoginPage for...
```

### Strategy C: Paste critical snippets

Better hơn tả bằng chữ.

---

## 7. Workflow: AI as pair programmer

### Flow khuyến nghị cho mỗi test

```
1. [You] Write test case in Gherkin (Given-When-Then)
2. [AI] Generate draft
3. [You] REVIEW: locator quality, assertion, edge cases
4. [AI/You] Refactor into POM
5. [You] Run test, fix failures
6. [AI] If failure — explain + propose fix
7. [You] Apply, verify
8. [You] Commit with co-author: "Co-Authored-By: Claude"
```

**Rule:** Bạn drive, AI assist. Không phải ngược lại.

---

## 8. Bài tập

### Bài 1: Bad vs Good prompt A/B

Viết cùng task (generate test cho /checkout) bằng 2 cách:

- Bad: "write checkout test"
- Good: context + task + constraints + reference

So sánh output. Ghi vào NOTES.md.

### Bài 2: Pattern 2 — Review

Cho AI file test cũ của bạn (tuần 1-2). Hỏi review. Apply ≥ 1 suggestion.

### Bài 3: Pattern 3 — Diagnose

Cố tình tạo 1 flaky test. Paste lỗi cho AI. So sánh AI's diagnosis với root cause thực (bạn biết).

### Bài 4: CLAUDE.md

Run `/init` trong Claude Code. Review file sinh ra. Bổ sung 5 conventions.

### Bài 5: 5 prompt patterns

Viết prompts cho 5 tasks khác nhau dùng 5 patterns. Lưu trong `AI_WORKFLOW.md`.

---

## 9. Anti-patterns

| Pattern                      | Tại sao bad                           |
| ---------------------------- | ------------------------------------- |
| "Write all tests for my app" | Quá vague, AI không biết scope        |
| Copy code without reading    | Học được 0                            |
| Hide errors from AI          | AI không thể help nếu thiếu info      |
| Trust AI's claims            | Verify by running                     |
| Paste credentials/secrets    | Training data leak risk               |
| Let AI pick locators blind   | Review, refactor theo priority        |
| Ignore warnings from AI      | "This might fail if..." — thường đúng |

---

## 10. When AI wrong

AI có thể:

- **Hallucinate APIs** — tạo function không tồn tại
- **Outdated**: dùng Playwright 1.30 API
- **Context loss** — forget earlier convo
- **Syntax right, logic wrong** — compile OK nhưng behavior sai

**Protection:**

- Luôn `npm run typecheck` và `npm test` sau mỗi AI change
- Read diff trước commit
- Skeptical với "tôi đã test xong" — AI không thực sự chạy được

---

## 11. Tracking productivity

Trong NOTES.md:

```markdown
## AI impact

### Week 4 Day 22

- Prompts used: 8
- Tests generated: 5
- Tests kept as-is: 1
- Tests refactored: 3
- Tests discarded: 1
- Time saved estimate: ~30min

### Learnings

- Prompt X works really well for...
- Prompt Y wastes time because...
```

Data thật sẽ guide bạn tối ưu workflow.

---

## 12. Common Pitfalls

| Vấn đề                           | Fix                                                      |
| -------------------------------- | -------------------------------------------------------- |
| AI generate code không compile   | Check TS version; provide more context                   |
| Locators AI chọn fragile         | Specify priority trong prompt                            |
| AI bỏ `await`                    | Explicit rule: "every Playwright action must be awaited" |
| AI dùng outdated API             | Ref docs link trong prompt                               |
| AI invent fixtures không tồn tại | Ref file path: "use fixtures from @fixtures/index"       |
| Context quá dài, AI lạc          | Break task nhỏ                                           |

---

## 13. Checklist

- [ ] Claude Code hoặc Cursor cài xong
- [ ] `/init` tạo CLAUDE.md
- [ ] 5 prompt patterns thử
- [ ] So sánh bad vs good prompt
- [ ] AI_WORKFLOW.md có ≥ 5 templates
- [ ] Commit: `docs: AI workflow guide`
- [ ] NOTES.md: ghi pattern hiệu quả nhất với bạn

---

## Resources

- [Anthropic — Prompt Engineering Overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code/overview)
- [Cursor Docs](https://docs.cursor.com/)
- [Claude Code Best Practices (Anthropic Eng blog)](https://www.anthropic.com/engineering/claude-code-best-practices)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Claude Code tutorial (Anthropic)](https://www.youtube.com/@anthropic-ai)
- [Cursor deep dive](https://www.youtube.com/results?search_query=cursor+ide+tutorial)
- [Prompt engineering crash course](https://www.youtube.com/results?search_query=prompt+engineering)
- [AI pair programming best practices](https://www.youtube.com/results?search_query=ai+pair+programming)

### 📝 Articles & blogs

- [Anthropic's engineering blog](https://www.anthropic.com/engineering) — hands-on articles
- [Simon Willison's blog](https://simonwillison.net/tags/prompt-engineering/) — daily prompt engineering insights
- [AI coding assistant showdown](https://www.google.com/search?q=cursor+vs+copilot+vs+claude+code)
- [CLAUDE.md best practices](https://docs.claude.com/en/docs/claude-code/memory)

### 🎓 Free courses

- [Anthropic Prompt Engineering Tutorial (interactive)](https://github.com/anthropics/prompt-eng-interactive-tutorial)
- [Anthropic Courses](https://github.com/anthropics/courses) — multiple modules
- [DeepLearning.AI — Prompt Engineering](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/)

### 📖 Books / long reads

- _The Art of Prompt Engineering_ — free articles collection
- _Anthropic's Constitutional AI papers_ (advanced)

### 🐙 Related GitHub repos

- [anthropics/courses](https://github.com/anthropics/courses) — official tutorials
- [anthropics/anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook) — recipes
- [anthropics/prompt-eng-interactive-tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial)
- [f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts) — community prompts

### 🛠️ Tools

- [Claude Code CLI](https://claude.com/claude-code)
- [Cursor](https://cursor.com/)
- [GitHub Copilot](https://github.com/features/copilot)
- [Aider](https://aider.chat/) — CLI alternative
- [Continue](https://continue.dev/) — OSS VS Code extension

### 📊 Cheat sheets / quick refs

- [Claude Code slash commands](https://docs.claude.com/en/docs/claude-code/slash-commands)
- [Prompt patterns](https://www.promptingguide.ai/)
- [ChatGPT vs Claude comparison](https://simonwillison.net/)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (prompt craft)

**B1.** A/B test prompts:

- Bad: "write login test"
- Good: Context + Task + Constraints + Example + Output

Same task (viết test cho checkout), measure:

- Output quality (keep as-is?)
- Lines of code needed to tweak
- Time total (prompt + review + tweak)

**B2.** CLAUDE.md setup:

```bash
/init
```

Review file sinh ra. Bổ sung 5 project-specific conventions. Test: next session, Claude tự áp dụng.

**B3.** 5 prompt templates — save vào `AI_WORKFLOW.md`:

- Generate test
- Review test
- Refactor test
- Diagnose failure
- Explain pattern

### 🟡 Trung bình (workflows)

**M1.** Pattern 1 — Generate from Gherkin:

```
Given user at /products
When searches for "laptop"
  And clicks Search
Then results list shows ≥1 laptop
  And URL contains "q=laptop"

Generate Playwright test using POM at src/pages/products.page.ts.
```

**M2.** Pattern 2 — Review own code:
Paste 1 test bạn viết tuần 1. Ask:

```
Review for:
- Flakiness risks
- Missing assertions
- Locator quality
- Edge cases
Be specific with line numbers.
```

Apply ≥ 2 suggestions.

**M3.** Pattern 3 — Diagnose:
Reproduce flaky test. Paste error + trace summary + code:

```
Test fails 30% of time. Error: [...]. Trace shows: [...].
Code: [...].
Hypothesize 3 root causes ranked by probability.
```

Compare AI's hypothesis with your own investigation.

**M4.** Pattern 4 — Refactor:

```
Refactor tests/cart.spec.ts to:
- Extract LoginPage (create if missing)
- Replace waitForTimeout with web-first assertions
- Add 2 negative cases

Show diff only for changed sections.
```

### 🔴 Nâng cao (meta)

**A1.** Prompt comparison — same task, 3 phrasings:

- Terse: "make this async"
- Descriptive: "convert sync calls to async/await, preserve error handling"
- Example-based: "like this [code], refactor this [code]"

Score output quality. Which works best? Why?

**A2.** Context budgeting — 3 approaches:

- Paste full file (lots of context)
- Paste only changed function + signature
- Describe structure in prose

Same task each. Compare AI understanding.

**A3.** Iterative refinement:

```
You: Write test X.
AI: [version 1]
You: Rename function, use getByRole instead of CSS.
AI: [version 2]
You: Add 2 edge cases.
AI: [version 3]
```

Track how many iterations → usable code. Identify upfront prompt improvements.

**A4.** Different AI behavior — compare:
Same prompt to:

- Claude Code
- Cursor
- GitHub Copilot
- ChatGPT

Observation in NOTES.md.

### 🏆 Mini challenge (45 phút)

**Task:** "Prompt Library" for your team:

Build `AI_WORKFLOW.md` với:

- 10 templates covering common automation tasks
- Each template: input variables + example usage + tips
- Meta section: when NOT to use AI

Commit + share with 1 teammate. Get feedback. Iterate.

### 🌟 Stretch goal

Read [Anthropic's prompt engineering interactive tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) end-to-end. Complete all exercises.

---

## Next

[Day 23 — AI-Assisted Test Generation →](./day-23-ai-test-generation.md)
