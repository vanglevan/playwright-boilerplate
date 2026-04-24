# Day 24 — Agentic Engineering cho Tester

> **Goal:** Hiểu difference chatbot vs agent. Setup Playwright MCP. Build 1 agentic workflow tự động cho testing.
> **Thời gian:** 3-4 giờ

---

## Prerequisites

- Day 22-23 hoàn thành

---

## 1. Chatbot vs Agent

| Aspect      | Chatbot        | Agent                     |
| ----------- | -------------- | ------------------------- |
| Interaction | Q&A round-trip | Multi-step autonomous     |
| Tools       | Chỉ text       | File system, browser, API |
| Decision    | User drives    | Agent decides next step   |
| Example     | ChatGPT web    | Claude Code, Cursor Agent |

**Agent trong 1 câu:** LLM + tools + loop ("tôi đã xong chưa?")

---

## 2. Use cases cho automation tester

### Use case 1: Bug reproducer agent

**Flow:**

1. Đọc bug report JIRA (MCP tool)
2. Extract steps
3. Run Playwright browser reproducing
4. Capture screenshot at fail point
5. Write regression test
6. Open PR

**Value:** Turn manual bug investigation → automated test.

### Use case 2: Flaky detective

**Flow:**

1. Read CI logs (GitHub MCP)
2. Identify flaky tests (fail >1/10 runs)
3. Download traces
4. Analyze with LLM
5. Suggest fixes (race condition? wrong locator?)
6. Comment on PR

### Use case 3: Smoke test generator

**Flow:**

1. Crawl app sitemap (browser tool)
2. Identify critical paths
3. Generate smoke test per path
4. Run → verify no false positive

### Use case 4: A11y monitor agent

**Flow:**

1. Scan 50 pages (scheduled)
2. Compare với baseline
3. Alert regression trong Slack (MCP Slack)

### Use case 5: Data-driven test expander

**Flow:**

1. Đọc existing test spec
2. Generate edge case data (boundary, unicode, negative)
3. Create parametrized tests
4. Run & commit nếu pass

---

## 3. Playwright MCP — browser cho AI

**MCP (Model Context Protocol):** standard để AI dùng tools ngoài.

**Playwright MCP:** server expose Playwright API cho AI client (Claude Code, Cursor, Claude Desktop).

### Cài

```bash
# Option A: npm
npm i -D @playwright/mcp

# Option B: global
npm i -g @playwright/mcp
```

### Config Claude Code

Edit `.mcp.json` in project root (or `~/.claude/settings.json` global):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Restart Claude Code → MCP tools available.

### Demo

```bash
claude
```

Prompt:

> Open https://www.saucedemo.com, login as standard_user/secret_sauce, add first item to cart, and report what you see at each step.

Agent flow:

1. `mcp__playwright__browser_navigate` → goto
2. `mcp__playwright__browser_snapshot` → screenshot
3. `mcp__playwright__browser_type` → fill username
4. ... etc
5. Return description

**Bạn không viết code nào — agent tự điều khiển browser.**

---

## 4. Generate test từ agentic exploration

Prompt mạnh hơn:

> Explore https://www.saucedemo.com as a standard_user. Navigate: login → inventory → add 2 items → cart → checkout → complete.
> At each step, note the UI elements and expected behavior.
> After exploration, generate a Playwright test file `tests/e2e/checkout.spec.ts` using POM at src/pages/. Use fixtures from @fixtures/index.

Agent:

1. Tự navigate và observe
2. Build mental model
3. Viết test code dựa trên observation
4. Save to file

**Review:** You check diff, run test, polish.

---

## 5. Build custom agent với Claude Agent SDK

Nếu MCP không đủ, build agent riêng:

```bash
npm i @anthropic-ai/claude-agent-sdk
```

**Script `agents/flaky-detector.ts`:**

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

async function main() {
  const result = query({
    prompt: `
      Analyze test-results/ folder.
      Identify tests that failed, extract failure reason.
      Suggest fixes ranked by probability.
      Output markdown report to flaky-report.md.
    `,
    options: {
      cwd: process.cwd(),
      allowedTools: ['Read', 'Glob', 'Write'],
    },
  });

  for await (const msg of result) {
    if (msg.type === 'result') {
      console.log('Done:', msg);
    }
  }
}

main();
```

Run:

```bash
ANTHROPIC_API_KEY=sk-... npx tsx agents/flaky-detector.ts
```

**Result:** Markdown report generated tự động.

---

## 6. Agent feedback loops

Agent không perfect. Build verification loop:

```
[Agent writes test] → [Run test] → [Fail?]
                                       ↓
                            [Feed error back to agent]
                                       ↓
                              [Agent adjusts] → (retry, max 3)
```

**In practice với Claude Code:**

```
You: Write login test for saucedemo. Use codebase patterns.
Claude: [writes test]
You: Run it.
Claude: [Bash: npm test ...] → see failure
Claude: Error is X. Fix is Y. [edits file]
Claude: [Bash: npm test ...] → pass
Claude: Done.
```

Claude auto iterates trong khi bạn drink coffee. ✨

---

## 7. Autonomy levels

| Level | Description                                   | Risk                 |
| ----- | --------------------------------------------- | -------------------- |
| 0     | Chat only, you apply                          | Lowest               |
| 1     | Agent writes files, you review before commit  | Low                  |
| 2     | Agent writes + runs tests, you review results | Medium               |
| 3     | Agent writes + runs + commits (opt-in git)    | High                 |
| 4     | Agent opens PR automatically                  | Higher               |
| 5     | Agent auto-merge after CI                     | ⚠️ Do this carefully |

**Khuyến nghị:** Level 1-2 là sweet spot. Level 3+ cho workflow well-understood.

---

## 8. Safety guardrails

```json
// .claude/settings.json
{
  "permissions": {
    "allow": [
      "Bash(npm *)",
      "Bash(npx playwright *)",
      "Bash(git status)",
      "Bash(git diff)",
      "Read(**)",
      "Edit(tests/**)",
      "Edit(src/**)",
      "Write(tests/**)"
    ],
    "deny": ["Bash(rm -rf *)", "Bash(git push *)", "Write(.env*)", "Edit(.env*)"]
  }
}
```

**Rules:**

- Whitelist commands bạn trust
- Block dangerous (rm -rf, git push)
- Never commit `.env`
- Review diff trước commit

---

## 9. Bài tập

### Bài 1: Playwright MCP

Cài MCP server. Verify Claude Code thấy tools `mcp__playwright__*`. Test 1 navigate command.

### Bài 2: Agentic exploration

Yêu cầu agent explore 1 app demo và gen test. Review diff.

### Bài 3: Flaky detective (small scale)

Manually tạo 2 failing tests. Run `agents/flaky-detector.ts` analysis. Verify report sensible.

### Bài 4: Feedback loop

Iterate với agent: gen test → run → fail → fix → run → pass. Count iterations.

### Bài 5: Settings guardrails

Config `.claude/settings.json` với permissions rules. Test: agent cố chạy `rm -rf` → bị block.

---

## 10. Common Pitfalls

| Vấn đề                        | Fix                                              |
| ----------------------------- | ------------------------------------------------ |
| MCP server không start        | Check logs; verify Node version                  |
| Agent lặp vô hạn              | Set iteration limit; better prompt               |
| Agent ignore conventions      | Provide CLAUDE.md; ref existing files            |
| Agent commit bad code         | Stay at level 1-2 autonomy; review before commit |
| MCP tools authenticate fail   | Some need API keys (Slack, GitHub) — config env  |
| Agent generate test không run | Always specify "verify by running" in prompt     |

---

## 11. Anti-patterns

- ❌ Full autonomy for critical paths (auth, payment)
- ❌ Agent has git push access without review
- ❌ Agent modifies CI config without review
- ❌ Trust agent's claim "test passed" without verifying
- ❌ Give agent prod credentials

---

## 12. The future (và bạn)

Cuối 2026, expected:

- 60% test creation involve AI
- "Prompt tester" role emerges
- Agent PR assistants standard
- MCP ecosystem mature

**Tester nào survive:**

- Know automation deep (bạn đã biết sau 30 ngày)
- Know AI/agent patterns (đang học)
- Can review AI output critically (skill hiếm)
- Business logic + UX judgment (AI yếu)

---

## 13. Checklist

- [ ] Playwright MCP working trong Claude Code
- [ ] Agentic exploration + test gen thử 1 lần
- [ ] Permissions guardrails config
- [ ] Flaky detector (mini) hoặc similar agent built
- [ ] Commit: `feat: agentic testing experiments`
- [ ] NOTES.md: agent use cases bạn thấy value nhất

---

## Resources

- [Model Context Protocol](https://modelcontextprotocol.io/introduction)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview)
- [Anthropic — Building Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Browser Use](https://github.com/browser-use/browser-use) — alternative agent framework

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [What are AI agents? (Anthropic)](https://www.youtube.com/@anthropic-ai)
- [Building agents with Claude](https://www.youtube.com/results?search_query=claude+agent+sdk)
- [MCP explained](https://www.youtube.com/results?search_query=model+context+protocol)
- [Playwright MCP demo](https://www.youtube.com/results?search_query=playwright+mcp)

### 📝 Articles & blogs

- [Anthropic — Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) — must-read
- [Lil'Log — LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/) — Lilian Weng comprehensive
- [Simon Willison — Agents tag](https://simonwillison.net/tags/agents/)
- [Agent design patterns](https://www.promptingguide.ai/techniques/react)

### 🎓 Deep topics

- [ReAct pattern paper](https://arxiv.org/abs/2210.03629) — Reasoning + Acting
- [Tool Use paper (Anthropic)](https://www.anthropic.com/research) — search
- [Chain-of-Thought prompting](https://arxiv.org/abs/2201.11903)
- [Tree of Thoughts](https://arxiv.org/abs/2305.10601)

### 📖 Books

- _Designing Machine Learning Systems_ — Chip Huyen
- _Hands-On Large Language Models_ — Jay Alammar

### 🐙 Related GitHub repos

- [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
- [browser-use/browser-use](https://github.com/browser-use/browser-use)
- [anthropics/anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook/tree/main/tool_use)
- [Significant-Gravitas/AutoGPT](https://github.com/Significant-Gravitas/AutoGPT) — early agent framework
- [langchain-ai/langchain](https://github.com/langchain-ai/langchain) — agent framework

### 🛠️ Tools

- [Playwright MCP server](https://github.com/microsoft/playwright-mcp)
- [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview)
- [LangChain](https://www.langchain.com/) — Python/JS agent framework
- [LlamaIndex](https://www.llamaindex.ai/) — RAG + agents

### 📊 Cheat sheets

- [MCP protocol overview](https://modelcontextprotocol.io/introduction)
- [Agent design patterns](https://www.anthropic.com/engineering/building-effective-agents)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (MCP setup + demo)

**B1.** Setup Playwright MCP trong Claude Code:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Verify Claude thấy `mcp__playwright__*` tools.

**B2.** Agentic browsing:

```
Open https://www.saucedemo.com.
Login as standard_user/secret_sauce.
Add first 2 items to cart.
Proceed to checkout.
Report each step.
```

Claude tự điều khiển browser qua MCP.

**B3.** Explore + report:

```
Visit https://demoblaze.com. Explore for 2 minutes. Report:
- Main features
- Navigation structure
- Potential test targets
- Accessibility quick impression
```

### 🟡 Trung bình (generate + verify)

**M1.** Agentic test gen:

```
Navigate SauceDemo. Login as standard_user. Explore inventory, cart, checkout.
Based on observation, generate tests/saucedemo/checkout.spec.ts using POM at
src/pages/. Use fixtures from @fixtures/index. Cover happy path + 2 negatives.
```

Review output, run, polish.

**M2.** Feedback loop:

```
1. Write test → run → if fail, read error → fix → run → loop
Max 3 iterations.
Stop if still fail, explain root cause.
```

Observe Claude iterate.

**M3.** Agent with guardrails — setup `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "mcp__playwright__*",
      "Read(tests/**)",
      "Edit(tests/**)",
      "Write(tests/**)",
      "Bash(npx playwright *)"
    ],
    "deny": ["Bash(git push*)", "Bash(rm *)", "Edit(.env*)"]
  }
}
```

Verify: agent can't push, can't delete files, can't modify env.

**M4.** Bug repro agent:
Create fake GitHub issue với reproduction steps. Ask:

```
Read issue #1 in this repo. Extract steps. Reproduce in browser.
Screenshot failure point. Write regression test at tests/regression/issue-1.spec.ts.
```

Observe.

### 🔴 Nâng cao (build agent)

**A1.** Build Claude Agent SDK script — flaky detector:

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

const result = query({
  prompt: `
    Analyze test-results/ folder.
    Identify failed tests, read traces, categorize root cause.
    Output flaky-report.md with top 5 flaky tests + suggested fixes.
  `,
  options: {
    allowedTools: ['Read', 'Glob', 'Write'],
  },
});

for await (const msg of result) {
  console.log(msg);
}
```

**A2.** Test scaffolder agent:

```typescript
// Given: feature description
// Agent: creates POM class + fixture + test file + runs to verify
```

Build script, try for 3 features.

**A3.** Multi-MCP combined workflow:
Setup MCP: playwright + github + filesystem. Run:

```
Read all PRs this week in user/repo.
For each PR touching src/, identify if test coverage added.
Report missing coverage in table format.
```

**A4.** Parallel agents — 3 agents testing 3 pages simultaneously. Discuss challenges (context sharing, result aggregation).

### 🏆 Mini challenge (90 phút)

**Task:** Build "AutoTestGen" agent — end-to-end:

Features:

- Input: URL
- Agent explores site (2-3 min browsing)
- Identifies critical user flows
- Generates POM classes
- Writes tests
- Runs tests to verify
- Creates PR with changes (optional)

Constraints:

- Use Claude Agent SDK
- Playwright MCP for browser control
- Permissions locked down (no git push)
- Log every decision agent makes

Deliverable: working script + demo video showing full flow.

### 🌟 Stretch goal

Contribute to [playwright-mcp](https://github.com/microsoft/playwright-mcp) — find "good first issue", open PR.

---

## Next

[Day 25 — AI Best Practices →](./day-25-ai-best-practices.md)
