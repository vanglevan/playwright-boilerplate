# 05 — AI Coding Tools Mastery

> Choose 1 tool, master it deeply in 3 months. Know 2 others well enough to compare.
> For senior 2026: **Claude Code is default**, Cursor is secondary, Copilot is enterprise reality.

---

## 🎯 Why tool mastery matters

**Surface-level user:**

- Uses tool for 1-2 features
- Blames tool when output bad
- Doesn't understand why it works
- Stuck at 2x productivity ceiling

**Master user:**

- Customizes tool deeply (hooks, commands, agents)
- Teaches team
- Knows when to switch tools
- Achieves 5-10x productivity on appropriate tasks
- Contributes improvements back

---

## 🛠️ Landscape 2026

| Tool               | Category           | Strength                     | Weakness           |
| ------------------ | ------------------ | ---------------------------- | ------------------ |
| **Claude Code**    | CLI agent          | Agentic, MCP, power features | CLI learning curve |
| **Cursor**         | IDE (VS Code fork) | Inline suggestions, composer | Proprietary, cost  |
| **GitHub Copilot** | IDE plugin         | Enterprise ecosystem         | Less agentic       |
| **Aider**          | CLI                | OSS, bring-your-model        | Less polished      |
| **Continue**       | VS Code ext (OSS)  | Free, customizable           | Setup friction     |
| **Cline**          | VS Code ext        | Agentic in VS Code           | Younger, evolving  |
| **Zed AI**         | Native IDE         | Performance                  | Smaller ecosystem  |

**Recommendation for senior tester 2026:**

- **Primary:** Claude Code (unless company dictates otherwise)
- **Secondary:** Cursor (for visual IDE work)
- **Know conceptually:** Copilot, open-source alternatives

---

## 🎓 Part 1: Claude Code deep dive

### Why Claude Code for testers

- **CLI-first** → scriptable, integrable with your workflow
- **Agentic by design** → multi-step tasks out of the box
- **MCP native** → extensible with any MCP server
- **Powerful hooks** → automate quality gates
- **Subagents** → delegate specialized work
- **File system + Bash access** → real work, not just chat

### Installation + setup

Already done in 30-day bootcamp. If not:

```bash
# Follow official install
# https://claude.com/claude-code
```

### Core workflow

```bash
cd ~/Projects/my-repo
claude
```

Prompt → Claude thinks → uses tools → completes task → ready for next prompt.

### Key features to master

#### 1. CLAUDE.md (project memory)

```bash
/init
```

Generates context file Claude auto-loads every session. Example:

```markdown
# Project Conventions

## Tech stack

- Playwright 1.59, TypeScript strict, Node 20+

## Testing rules

- POM in src/pages/
- Fixtures from @fixtures/index
- Locator priority: role > label > testid > CSS
- No waitForTimeout
- Tests independent, parallel-safe
- Tag: @smoke, @regression, @critical

## Directory structure

- src/ → application code
- tests/ → test specs by type (e2e/, api/, visual/, a11y/, performance/)
- .claude/ → slash commands + agents
```

Senior tip: **CLAUDE.md is a living document**. Update whenever you catch Claude not knowing something.

#### 2. Slash commands

`.claude/commands/<name>.md`:

```markdown
---
description: Generate Playwright test from Gherkin
---

Given this Gherkin specification:
$ARGUMENTS

Generate Playwright TypeScript test covering all scenarios.
Use fixtures from @fixtures/index.
Follow POM pattern (check src/pages/ for existing).
Tag @smoke on happy path.
```

Usage: `/generate-test-from-gherkin <spec>`

#### 3. Hooks

`.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "npm run typecheck 2>&1 | tail -20" }]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash\\(git push.*\\)",
        "hooks": [{ "type": "command", "command": "npm run check" }]
      }
    ]
  }
}
```

**Impact:** Every edit → typecheck auto-run. Push blocked if quality fails.

#### 4. Subagents

`.claude/agents/test-reviewer.md`:

```markdown
---
name: test-reviewer
description: Critique Playwright tests for quality issues
tools: Read, Grep, Glob
---

You are a senior test reviewer. Only review, never write code.

Criteria:

- Locator quality (role > label > testid > CSS)
- Web-first assertions (no waitForTimeout)
- Test independence
- Missing edge cases
- Naming clarity

Output: table [Line, Severity, Issue, Suggestion].
```

Usage: "Use test-reviewer subagent to review tests/cart.spec.ts"

#### 5. MCP servers

Connect external tools. See [06 — Agentic Engineering](./06-agentic-engineering.md) for deep dive.

#### 6. Permissions

```json
{
  "permissions": {
    "allow": [
      "Bash(npm *)",
      "Bash(npx playwright *)",
      "Bash(git status)",
      "Bash(git diff)",
      "Edit(tests/**)",
      "Edit(src/**)",
      "Write(tests/**)"
    ],
    "deny": ["Bash(rm -rf *)", "Bash(git push *)", "Edit(.env*)", "Write(.env*)"]
  }
}
```

Whitelist + blacklist. Essential for safety at senior level.

### Claude Code advanced workflows

#### Pattern 1: Agentic test generation pipeline

```
1. `/plan-feature <feature>` → slash command generates test plan
2. Review plan, approve
3. `/implement-plan` → generates code following plan
4. Hooks auto-run typecheck + lint
5. You review final, commit
```

#### Pattern 2: Multi-file refactor

```
You: Rename method `doLogin` → `login` across all page objects and tests.
Show diff first before applying.
Claude: [greps, generates diff]
You: Approved
Claude: [applies, runs typecheck, commits]
```

#### Pattern 3: Interactive debug

```
You: Test tests/cart.spec.ts is flaky. Help me debug.
Claude: (uses ReAct)
  Thought: Need to see trace. Let me find it.
  Action: Bash(ls test-results/)
  Observation: ...
  Thought: Found. Let me parse for timing issues.
  ...
  Final: Root cause is X. Fix: Y. Apply?
You: Yes
Claude: [applies fix]
```

---

## 💻 Part 2: Cursor deep dive

### Why Cursor for some tasks

- **Visual IDE** — see diffs inline
- **Tab auto-complete** — AI predicts next line while typing
- **Cmd+K** — inline edit selected code
- **Composer** — multi-file changes with natural language
- **`@Codebase`** — query entire repo

### Key commands

| Shortcut        | Purpose                       |
| --------------- | ----------------------------- |
| **Cmd+K** (⌘K)  | Inline edit selected code     |
| **Cmd+L** (⌘L)  | Open chat sidebar             |
| **Cmd+I** (⌘I)  | Composer (multi-file changes) |
| **Tab**         | Accept AI suggestion          |
| **`@Codebase`** | Query entire codebase         |
| **`@Files`**    | Reference specific files      |
| **`@Docs`**     | Query docs site               |

### Rules for AI (`.cursor/rules/*.mdc`)

Similar to CLAUDE.md. Project-specific instructions Cursor auto-loads.

Example:

```markdown
---
description: Playwright testing conventions
globs: ['tests/**/*.ts', 'src/**/*.ts']
alwaysApply: true
---

# Playwright Testing Rules

- Always use fixtures from @fixtures/index
- Prefer getByRole > getByLabel > getByTestId > CSS
- No `page.waitForTimeout()` — use web-first assertions
- TypeScript strict, no `any`
```

### When Cursor > Claude Code

- Writing long prose/docs (inline feedback better)
- Visual refactor across files
- You're learning a new codebase (Codebase query)
- Need IDE features (debugger, extensions)

### When Claude Code > Cursor

- Scripted workflows (CLI scriptable)
- Agentic multi-step tasks
- Customization (hooks, subagents)
- CI integration
- MCP tools needed

**Senior user:** uses both. Different tools, different jobs.

---

## 🤖 Part 3: GitHub Copilot

### Why still relevant 2026

- Enterprise standard (many companies use)
- Best IDE integration (Microsoft ecosystem)
- Fast completions
- Cheap/free in many cases

### Core features

- **Inline completions** — accept with Tab
- **Copilot Chat** — chat panel
- **Copilot Workspace** — plan-based multi-file edits (newer)
- **PR summaries** — auto-generate PR descriptions
- **Commit messages** — suggest based on diff

### For testers specifically

- Writing repetitive test boilerplate → Tab-complete is fast
- Comment → Copilot suggests implementation
- Learning a new library → suggestions teach API

### Weaknesses

- Less agentic than Claude Code
- Less customizable
- Quality varies vs Claude/GPT

**Use if:** Company dictates. Otherwise, Claude Code/Cursor give more power.

---

## 🔧 Part 4: Other tools to know conceptually

### Aider (CLI OSS)

- Bring-your-own-model
- Git-native (auto-commits AI changes)
- Works with OpenAI, Claude, local

Install:

```bash
pip install aider-install && aider-install
```

**When:** OSS preference, local models, CLI purist.

### Continue (VS Code extension, OSS)

- Free, configurable
- Support multiple model providers
- Agentic experiments

**When:** Budget constrained, privacy-sensitive, custom setups.

### Cline / Claude Dev

- Agentic in VS Code
- Alternative to Cursor
- Active development 2026

**When:** Want agentic UX in VS Code without switching IDE.

### Zed

- High-perf IDE with AI built-in
- Rust-native speed
- Growing ecosystem

**When:** Performance matters, Mac user, new/greenfield.

---

## 🎯 Part 5: Tool selection framework

### Decision tree

```
Is task agentic (multi-step, tool use, automation)?
├── Yes → Claude Code
└── No → IDE task?
        ├── Yes → Cursor
        └── No → Shell task?
                ├── Yes → Aider or Claude Code
                └── No → Chat UI (Claude.ai / ChatGPT)
```

### By task type

| Task                             | Best tool                                   |
| -------------------------------- | ------------------------------------------- |
| Generate long test file          | Cursor composer or Claude Code              |
| Inline refactor                  | Cursor Cmd+K                                |
| Debug flaky test (investigation) | Claude Code (agentic)                       |
| Write docs                       | Cursor (visual) or Claude.ai (chat UI)      |
| Auto-commit on change            | Aider                                       |
| Review PR                        | Claude.ai (paste diff) or GitHub Copilot PR |
| Custom CI workflow               | Claude Agent SDK (build)                    |
| Quick code question              | Any chat (Claude / ChatGPT)                 |

### By scenario

| Scenario                        | Recommended                                 |
| ------------------------------- | ------------------------------------------- |
| Solo dev                        | Claude Code + Cursor                        |
| Team with standards             | Claude Code + CLAUDE.md + shared `.claude/` |
| Enterprise (company dictates)   | Whatever company mandates (usually Copilot) |
| OSS contribution                | Aider (git-friendly)                        |
| Learning unfamiliar codebase    | Cursor `@Codebase`                          |
| Building products (not testing) | Cursor or Claude Code depending on taste    |

---

## 📊 Part 6: Productivity measurement

### What to track

Over 2 weeks baseline, then 2 weeks with tool, compare:

| Metric                     | How to measure            |
| -------------------------- | ------------------------- |
| **Tests/hour**             | Count commits with tests  |
| **Bugs escaped to prod**   | JIRA/GH issues            |
| **Time to fix flaky test** | Timestamp start → resolve |
| **Code review comments**   | GitHub API export         |
| **Cognitive load**         | Self-rate 1-10 daily      |
| **Satisfaction**           | Weekly 1-10               |

### Expected numbers

Research + anecdotes show:

- Junior tester: 1.5x-2x productivity (much variance)
- Mid: 2x-3x
- Senior: 3x-5x (higher ceiling, know when NOT to use)

**Your number matters, not average.** Measure honestly.

### Anti-measurement traps

- **Output count alone** — more commits ≠ more value
- **Feature velocity** — confounded by other factors
- **Single metric** — all gamified quickly
- **Comparing with peer** — different contexts

### Honest framing

"AI makes me write code faster — I've measured +2.3x on test writing specifically. It doesn't speed up design work or debugging complex issues."

---

## 🏗️ Part 7: Team adoption strategies

### Rollout for small team (5-15 people)

**Phase 1: Champion (you)**

- Master 1 tool personally
- Document workflows
- 1-month experiment logged

**Phase 2: Pilot (3 volunteers)**

- Share setup + CLAUDE.md/`.claude/`
- Weekly retro
- Gather pain points

**Phase 3: Team rollout**

- Workshop (1 hour)
- Shared Prompt Library
- Team AI_WORKFLOW.md

**Phase 4: Culture**

- PR template asks "AI used?"
- Quarterly review effectiveness
- Share wins (+ losses)

### Common team objections + responses

| Objection                      | Response                                             |
| ------------------------------ | ---------------------------------------------------- |
| "AI will make us lazy"         | Measure quality — share data                         |
| "Hallucinations are dangerous" | Show our review process catches them                 |
| "Cost"                         | Calculate time saved vs tool cost                    |
| "Compliance (GDPR)"            | Discuss what data goes to AI; local models if needed |
| "My job gone"                  | It won't — AI amplifies those who adapt              |

### What NOT to do

- Force adoption (backlash)
- Measure individuals publicly (creates gaming)
- Mandate specific tools (let people choose)
- Skip training (bad habits form)

---

## ⚠️ Part 8: Common pitfalls (pro user)

### 1. Tool maximalism

Using every feature just because. Wastes time, overwhelms.
**Fix:** Master 5 core features first. Add complexity gradually.

### 2. Context neglect

Not maintaining CLAUDE.md. Claude keeps asking basic questions.
**Fix:** Invest 30 min/month updating CLAUDE.md with new conventions.

### 3. Prompt drift

Same prompt works differently over time (model updates).
**Fix:** Re-test prompts quarterly. Update PROMPT_LIBRARY.md.

### 4. Vendor lock-in

Only know Claude Code. Job requires Copilot. Painful transition.
**Fix:** Try 2-3 tools, know conceptual overlap.

### 5. Auto-pilot commits

AI generates, you commit without review → bugs.
**Fix:** Always read diff. Always run tests. Senior discipline.

### 6. No feedback loop

Never review what AI got wrong over time.
**Fix:** Weekly retrospective. Learn patterns of AI failure modes.

### 7. Ignoring model updates

New Claude / GPT release, you don't try.
**Fix:** Monthly check provider blogs. Re-test critical prompts.

### 8. Over-indexing on AI

Every task via AI, even when manual faster.
**Fix:** Measure. Some tasks (quick one-line fix) are faster manual.

---

## 📚 Resources

### Official docs

- [Claude Code docs](https://docs.claude.com/en/docs/claude-code/overview)
- [Claude Code Best Practices (Anthropic Eng blog)](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Cursor docs](https://docs.cursor.com/)
- [GitHub Copilot docs](https://docs.github.com/en/copilot)
- [Aider docs](https://aider.chat/)

### Videos

- [Claude Code demo by Anthropic](https://www.youtube.com/@anthropic-ai)
- [Cursor tutorials (official + community)](https://www.youtube.com/results?search_query=cursor+ide+tutorial)
- [AI coding tools compared 2026](https://www.youtube.com/results?search_query=ai+coding+tools+comparison)

### Blogs + articles

- [Simon Willison's AI blog](https://simonwillison.net/) — daily insights
- [swyx — AI Engineer blog](https://www.latent.space/) — advanced
- [Anthropic engineering](https://www.anthropic.com/engineering)
- [GitHub blog — Copilot](https://github.blog/tag/copilot/)

### Communities

- [Claude Code Discord](https://discord.com/) (official)
- [Cursor Discord](https://discord.com/invite/cursor)
- [r/ChatGPTCoding](https://reddit.com/r/ChatGPTCoding)
- [Hacker News](https://news.ycombinator.com/) — AI tool discussions

### GitHub resources

- Search "awesome claude code" for community configs
- [awesome-cursor](https://github.com/) — search for curated list

---

## 🎯 Exercises

### 🟢 Basic (Week 5)

1. Install + setup Claude Code. Complete `/init` to generate CLAUDE.md.
2. Create 5 slash commands for your common tasks.
3. Add 3 hooks (typecheck post-edit, lint post-edit, smoke test pre-push).

### 🟡 Intermediate (Week 6)

1. Design 2 subagents (test-reviewer, bug-reproducer). Test each.
2. Configure permissions file with allow/deny lists.
3. Try Cursor for 1 week. Compare workflow vs Claude Code — which works for which tasks?

### 🔴 Advanced

1. Build custom workflow: "feature request → test plan → tests → run → commit". Orchestrate with slash commands + hooks.
2. Measure productivity: 2 weeks without AI, 2 weeks with. Track metrics. Publish blog.
3. Teach 1 teammate adoption (1-hour session + followup). Iterate based on feedback.

### 🏆 Mini project (End of Week 6)

**Task:** Publish `.claude/` setup as team template.

Create shareable `.claude/` folder with:

- 10+ slash commands
- 5 hooks (quality gates)
- 3 subagents (reviewer, generator, debugger)
- Permissions file
- README explaining each

Share on GitHub as template repo. Get 1 teammate to adopt.

### 🌟 Stretch goal

Build & publish 1 custom MCP server (Day 26 territory from bootcamp). Register on awesome-mcp.

---

## ✅ Self-check

Can you do, unaided:

- [ ] Set up Claude Code for new project in <10 min
- [ ] Write useful slash command
- [ ] Configure 3 hooks that save time
- [ ] Build custom subagent
- [ ] Explain Claude Code vs Cursor trade-offs
- [ ] Measure AI productivity honestly

Goal: all yes by end of Month 2.

---

## Next

[06 — Agentic Engineering →](./06-agentic-engineering.md) — go beyond "using" AI to "building" with AI.
