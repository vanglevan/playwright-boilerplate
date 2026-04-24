# Day 27 — Claude Code Power Features (Slash Commands, Hooks, Subagents)

> **Goal:** Biến Claude Code từ "chat tool" thành "testing automation platform" với commands, hooks, và subagents.
> **Thời gian:** 3 giờ

---

## Prerequisites

- Day 22-26 hoàn thành

---

## 1. Slash Commands — reusable prompts

### Concept

1 slash command = 1 template prompt có sẵn. Thay vì gõ lại 5 dòng prompt, gõ `/generate-test`.

### Create command

Tạo `.claude/commands/generate-test.md`:

```markdown
---
description: Generate Playwright test for a feature
---

Generate a Playwright TypeScript test for the feature described below.

Follow these rules:

- Use POM pattern — check src/pages/ for existing page objects
- Use fixtures from @fixtures/index
- Prefer getByRole > getByLabel > getByTestId > CSS
- No waitForTimeout — use web-first assertions
- Tag with @smoke or @regression
- Include 1 happy path + 1 negative case

Feature to test:
$ARGUMENTS
```

### Use

```
/generate-test user signup with email verification
```

Claude expands prompt with `$ARGUMENTS` = "user signup...", follows rules, generates test.

---

## 2. Slash command library cho tester

### `/add-page-object`

```markdown
---
description: Scaffold Page Object Model class
---

Create a new Page Object extending BasePage at src/pages/$ARGUMENTS.page.ts.

Include:

- Readonly path property
- Constructor taking Page
- 3-5 Locator properties (use getByRole priority)
- 2-3 methods with clear business names
- TypeScript strict

Also update src/fixtures/pages.fixture.ts to inject it.
```

Usage: `/add-page-object checkout`

### `/run-smoke`

```markdown
---
description: Run smoke tests only
---

Run the smoke test suite:
\`\`\`bash
npx playwright test --grep @smoke --reporter=list
\`\`\`

After running, summarize:

- Total tests
- Passed/failed
- Any failures with 1-line reason
```

### `/refactor-to-pom`

```markdown
---
description: Refactor inline test to use POM
---

File: $ARGUMENTS

Refactor the test file:

1. Extract locators into a new POM class (or existing if fits)
2. Create action methods with business names
3. Update test to call page object methods only
4. Verify test still passes logic

Show diff before applying.
```

### `/debug-flaky`

```markdown
---
description: Debug flaky test
---

Test: $ARGUMENTS

Steps:

1. Run this test 10 times: `npx playwright test $ARGUMENTS --repeat-each=10`
2. If any fails, collect traces
3. Analyze traces for: race conditions, timing issues, unstable locators
4. Propose 3 fixes ranked by probability
5. Do NOT apply yet — wait for my confirm
```

---

## 3. Hooks — automatic actions

**Hooks = commands auto-run on events.** No more "remember to run typecheck".

### Event types

- `PreToolUse` — trước tool call (can block)
- `PostToolUse` — sau tool call
- `UserPromptSubmit` — khi user gửi prompt
- `Stop` — khi Claude stop
- `SessionStart` — khi Claude Code start

### Setup trong `.claude/settings.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm run typecheck 2>&1 | tail -20"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Session ended. Commit your changes!'"
          }
        ]
      }
    ]
  }
}
```

**Result:** Mỗi khi Claude edit file TS → tự động chạy typecheck → output vào context → Claude thấy lỗi và fix.

### Useful hook ideas cho tester

| Event                          | Command                       | Purpose                     |
| ------------------------------ | ----------------------------- | --------------------------- |
| `PostToolUse: Edit`            | `npm run lint -- --fix $FILE` | Auto-lint edited file       |
| `PostToolUse: Edit`            | `npm run typecheck`           | Catch TS errors immediately |
| `PostToolUse: Write(tests/**)` | `npx playwright test $FILE`   | Auto-run new tests          |
| `SessionStart`                 | `git status`                  | Show current state          |
| `Stop`                         | `git diff --stat`             | Summary of changes          |
| `PreToolUse: Bash(git push)`   | `npm run check`               | Block push if checks fail   |

### Advanced: conditional hooks với script

**`.claude/hooks/on-test-edit.sh`:**

```bash
#!/usr/bin/env bash
FILE="$1"
if [[ "$FILE" == tests/* ]]; then
  echo "Running $FILE..."
  npx playwright test "$FILE" --reporter=line
fi
```

In settings:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "bash .claude/hooks/on-test-edit.sh \"$FILE_PATH\"" }
        ]
      }
    ]
  }
}
```

---

## 4. Subagents — delegate tasks

**Subagent = specialized Claude instance with scoped tools.** Main Claude delegates complex tasks → subagent does → returns result.

### Built-in subagents (Claude Code)

| Subagent                       | Best for                             |
| ------------------------------ | ------------------------------------ |
| `Explore`                      | Search codebase, find files/patterns |
| `general-purpose`              | Multi-step research                  |
| `Plan`                         | Design implementation before coding  |
| `code-reviewer` (if available) | Review diffs                         |

### Usage patterns

**Explore:**

```
Use Explore subagent to find all tests tagged @smoke in this repo,
summarize what flows they cover.
```

**Plan:**

```
Use Plan subagent to design implementation for adding
accessibility tests to the product detail page.
I want the plan to include: test structure, axe rules to enable,
how to handle dynamic content.
```

### Create custom subagent

`.claude/agents/test-architect.md`:

```markdown
---
name: test-architect
description: Design test strategy for a new feature
tools: Read, Glob, Grep, WebFetch
---

You are a test automation architect.

When given a feature description:

1. Analyze codebase for existing patterns
2. Identify test layers needed (unit, API, E2E, visual, a11y, perf)
3. Propose test cases with tags and priority
4. Identify risks and gaps
5. Output a structured plan (not code)

Never write test code — only plans.
```

Call:

```
Use the test-architect subagent to plan tests for a new
"wishlist" feature that lets users save items.
```

---

## 5. Combine: commands + hooks + subagents

**Workflow example: Full test creation automation**

```
User types: /new-feature "password reset"

Slash command prompts Claude:
  "Use test-architect subagent to plan tests for $ARGUMENTS.
  Then implement test files.
  Run them to verify."

Test architect agent:
  → returns plan

Main Claude:
  → writes test files
  → Edit hook fires: npm run typecheck
  → if error, Claude sees and fixes
  → once clean, Stop hook: "commit your changes"
```

Entire feature testing scaffold in 1 command. Reviewed by you.

---

## 6. Export & share configs

### Project-level (commit vào repo)

```
.claude/
├── commands/
│   ├── add-page-object.md
│   ├── generate-test.md
│   ├── run-smoke.md
│   └── refactor-to-pom.md
├── agents/
│   └── test-architect.md
└── settings.json   # hooks, permissions
```

**Team benefit:** Mọi member clone repo, Claude Code cùng setup ngay.

### User-level

`~/.claude/commands/` — personal commands, không commit.

---

## 7. Bài tập

### Bài 1: 3 slash commands

Tạo 3 commands:

1. `/generate-test`
2. `/add-page-object`
3. `/debug-flaky`

Test với 3 prompts thật.

### Bài 2: Hooks setup

Config `.claude/settings.json`:

- PostToolUse: `npm run typecheck` sau edit
- SessionStart: `git status`

Verify: edit file → typecheck tự chạy.

### Bài 3: Custom subagent

Tạo `test-architect` agent. Use it to plan tests for 1 feature.

### Bài 4: Full workflow

Combine: slash command → uses subagent → main writes code → hook validates.

### Bài 5: Share with team

Write `README.md` section describing your `.claude/` setup. Other devs can adopt.

---

## 8. Common Pitfalls

| Vấn đề                                           | Fix                                                |
| ------------------------------------------------ | -------------------------------------------------- |
| Slash command không xuất hiện                    | Check filename (must be `.md`), frontmatter valid  |
| Hook crashes Claude                              | Exit non-zero blocks; echo error message           |
| Hook slows things down                           | Keep hooks fast; async jobs use background         |
| Infinite loop (hook triggers edit triggers hook) | Use `matcher` to scope; or debounce                |
| Custom agent không gọi được                      | Check `.claude/agents/name.md` valid; name matches |
| Permissions block tool                           | Add to `allow` list                                |

---

## 9. Best practices

- **1 command = 1 purpose** — không cố command 50-dòng prompt
- **Hooks minimal** — 2-3 lệnh, không build system
- **Test hooks standalone** — run command manually trước config hook
- **Commit `.claude/` vào repo** — team consistency
- **Document commands trong README** — new members biết có gì

---

## 10. Checklist

- [ ] 3+ slash commands tạo
- [ ] 2+ hooks configured
- [ ] 1 custom subagent
- [ ] Full workflow combine test
- [ ] README mention `.claude/` setup
- [ ] Commit: `chore: claude code power features`
- [ ] NOTES.md: commands bạn dùng hàng ngày

---

## Resources

- [Claude Code Settings](https://docs.claude.com/en/docs/claude-code/settings)
- [Slash Commands docs](https://docs.claude.com/en/docs/claude-code/slash-commands)
- [Hooks docs](https://docs.claude.com/en/docs/claude-code/hooks)
- [Subagents docs](https://docs.claude.com/en/docs/claude-code/sub-agents)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Claude Code advanced features](https://www.youtube.com/@anthropic-ai)
- [Slash commands + hooks tutorial](https://www.youtube.com/results?search_query=claude+code+slash+commands)
- [Subagents explained](https://www.youtube.com/results?search_query=claude+subagents)

### 📝 Articles & blogs

- [Claude Code official docs](https://docs.claude.com/en/docs/claude-code/overview)
- [Anthropic Eng blog](https://www.anthropic.com/engineering)
- [CLAUDE.md patterns](https://docs.claude.com/en/docs/claude-code/memory)
- [Hooks use cases blog posts](https://dev.to/search?q=claude+code+hooks)

### 🎓 Deep topics

- [Agent SDK for custom workflows](https://docs.claude.com/en/api/agent-sdk/overview)
- [Subagent design patterns](https://docs.claude.com/en/docs/claude-code/sub-agents)
- [Hook security considerations](https://docs.claude.com/en/docs/claude-code/hooks)

### 📖 References

- Claude Code full reference: [docs.claude.com/en/docs/claude-code](https://docs.claude.com/en/docs/claude-code/)

### 🐙 Related GitHub repos

- [anthropics/claude-code-examples](https://github.com/anthropics/claude-code-action) — if available
- Community Claude Code configs — search GitHub "claude code"

### 🛠️ Tools

- Claude Code CLI
- VS Code Claude extension (if available)
- Settings JSON validators

### 📊 Cheat sheets

- [Slash command frontmatter](https://docs.claude.com/en/docs/claude-code/slash-commands)
- [Hook event types](https://docs.claude.com/en/docs/claude-code/hooks)
- [Subagent fields](https://docs.claude.com/en/docs/claude-code/sub-agents)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (commands)

**B1.** Create 3 slash commands cho automation workflow:

- `/generate-test <feature>` — scaffold test file
- `/add-page-object <name>` — create new POM
- `/run-smoke` — run smoke suite + summary

Save in `.claude/commands/`. Test each.

**B2.** Commands với `$ARGUMENTS`:

```markdown
---
description: Debug failing test
---

Debug test: $ARGUMENTS

Run: npx playwright test $ARGUMENTS --debug
```

Test: `/debug-test tests/cart.spec.ts`.

**B3.** Share commands — commit `.claude/` vào repo. Teammate clones, commands work.

### 🟡 Trung bình (hooks)

**M1.** Simple hook — run typecheck after edit:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "npm run typecheck 2>&1 | tail -20" }]
      }
    ]
  }
}
```

**M2.** Conditional hook — only for test files:

```bash
#!/bin/bash
FILE="$1"
if [[ "$FILE" == tests/* ]]; then
  npx playwright test "$FILE" --reporter=line
fi
```

Wire into hook.

**M3.** Session hooks:

```json
{
  "SessionStart": [{ "hooks": [{ "type": "command", "command": "git status" }] }],
  "Stop": [{ "hooks": [{ "type": "command", "command": "git diff --stat" }] }]
}
```

**M4.** Pre-push gate — block push if tests fail:

```json
{
  "PreToolUse": [
    {
      "matcher": "Bash\\(git push.*\\)",
      "hooks": [{ "type": "command", "command": "npm run check" }]
    }
  ]
}
```

### 🔴 Nâng cao (subagents)

**A1.** Custom test-architect subagent `.claude/agents/test-architect.md`:

```markdown
---
name: test-architect
description: Plan tests for new features (no code)
tools: Read, Glob, Grep, WebFetch
---

You are a test automation architect.

Given a feature description:

1. Analyze codebase patterns (Read existing tests/)
2. Identify test layers (unit/API/E2E/visual/a11y/perf)
3. Propose test cases with tags + priority
4. Identify risks and gaps
5. Output structured plan

Never write code — only plans.
```

Use: `Use test-architect to plan tests for checkout feature.`

**A2.** Code-reviewer subagent:

```markdown
---
name: code-reviewer
description: Review test code for quality issues
tools: Read, Grep
---

Review the provided test file against these criteria:

- Locator priority (role > label > testid > CSS)
- Web-first assertions
- No magic waits
- POM usage
- Tag presence

Report issues with line numbers + severity.
```

**A3.** Explore + Plan combo — main Claude orchestrates:

```
1. Use Explore agent to find all @smoke tests.
2. Use Plan agent to design 5 new smoke tests filling gaps.
3. Implement the tests.
4. Run to verify.
```

**A4.** Agent-to-agent coordination — Plan outputs → code-reviewer verifies → main Claude implements.

### 🏆 Mini challenge (60 phút)

**Task:** Full Claude Code power setup cho team:

`.claude/`:

- 5+ slash commands (common workflows)
- 3+ hooks (quality gates)
- 2+ subagents (test-architect, code-reviewer)
- README section explaining how to use

Goal: teammate clones, productive in 10 minutes. Share with 1 person, get feedback.

### 🌟 Stretch goal

Publish your `.claude/` setup as template repo — "claude-code-playwright-starter". Share on Twitter.

---

## Next

[Day 28 — Portfolio Polish →](./day-28-portfolio.md)
