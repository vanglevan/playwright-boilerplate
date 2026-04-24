# Day 26 — MCP Servers & Custom Workflows

> **Goal:** Hiểu MCP protocol, setup nhiều server, build custom workflow kết hợp 2-3 tools.
> **Thời gian:** 2-3 giờ

---

## Prerequisites

- Day 24 (Playwright MCP) hoàn thành

---

## 1. MCP — Model Context Protocol

**Analogy:** MCP cho AI giống USB — standard protocol để plug tools vào.

**Before MCP:**

- Mỗi AI client có plugin system riêng
- Dev build integration 10 lần cho 10 clients

**After MCP:**

- 1 server implement MCP
- Works với Claude Desktop, Claude Code, Cursor, IDE nào support MCP

---

## 2. MCP servers hữu ích cho Tester

| Server               | Purpose                | Link                                                                                           |
| -------------------- | ---------------------- | ---------------------------------------------------------------------------------------------- |
| **playwright**       | Browser control        | [playwright-mcp](https://github.com/microsoft/playwright-mcp)                                  |
| **github**           | Issues, PRs, workflows | [github-mcp-server](https://github.com/github/github-mcp-server)                               |
| **filesystem**       | Read/write files       | [servers/filesystem](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) |
| **git**              | Git operations         | [servers/git](https://github.com/modelcontextprotocol/servers/tree/main/src/git)               |
| **slack**            | Messages, channels     | [mcp-slack](https://github.com/modelcontextprotocol/servers/tree/main/src/slack)               |
| **atlassian / jira** | Issues, sprints        | [atlassian-mcp](https://github.com/sooperset/mcp-atlassian)                                    |
| **postgres**         | DB queries             | [servers/postgres](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)     |
| **puppeteer**        | Alternative browser    | [servers/puppeteer](https://github.com/modelcontextprotocol/servers)                           |

Full list: [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

---

## 3. Config MCP trong Claude Code

### Project-level (`.mcp.json` in repo root)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/you/Projects/playwright-learning-journey"
      ]
    }
  }
}
```

### Global (`~/.claude/settings.json`)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

**Best practice:** Project-specific servers trong `.mcp.json` (commit vào repo), secrets trong env vars.

---

## 4. Setup GitHub MCP (example)

### Step 1: Get GitHub PAT

- GitHub → Settings → Developer settings → Personal access tokens
- Scopes: `repo`, `workflow`, `read:org`
- Copy token, save to env:

```bash
export GITHUB_TOKEN=ghp_...
# Or add to ~/.zshrc
```

### Step 2: Add to `.mcp.json`

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Step 3: Restart Claude Code

```
claude
```

### Step 4: Test

> List open issues in your-username/playwright-learning-journey

Claude uses `mcp__github__list_issues` to fetch.

---

## 5. Combined workflow example

**Scenario:** Bug reported trong GitHub issue → reproduce → write test.

### Setup

MCP servers: playwright + github + filesystem

### Prompt

```
Read issue #42 in this repo.
Extract reproduction steps.
Open the app in browser (Playwright MCP), follow the steps,
take screenshot at the failure point.
Based on observation, create a regression test at
tests/regression/issue-42.spec.ts.
Commit the test with message "test: repro issue #42".
```

### Agent flow

1. `mcp__github__get_issue` → extract description
2. `mcp__playwright__browser_navigate` → go to app
3. `mcp__playwright__browser_click` → reproduce steps
4. `mcp__playwright__browser_snapshot` → screenshot
5. `Write` → create test file
6. `Bash(git add + commit)` → commit

**1 prompt = end-to-end bug-to-test automation.**

---

## 6. Custom MCP server (advanced)

Build your own MCP server nếu cần integrate internal tool:

### Basic structure (TypeScript)

```typescript
// my-mcp-server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: 'my-tester-tool', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'fetch_test_data',
      description: 'Fetch test data from internal DB',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'number' },
        },
        required: ['userId'],
      },
    },
  ],
}));

server.setRequestHandler('tools/call', async (req) => {
  if (req.params.name === 'fetch_test_data') {
    const data = await fetchFromDb(req.params.arguments.userId);
    return { content: [{ type: 'text', text: JSON.stringify(data) }] };
  }
  throw new Error(`Unknown tool: ${req.params.name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

Register trong `.mcp.json`:

```json
{
  "mcpServers": {
    "my-tool": {
      "command": "npx",
      "args": ["tsx", "./my-mcp-server.ts"]
    }
  }
}
```

Docs: [MCP Quickstart](https://modelcontextprotocol.io/quickstart/server)

---

## 7. Permissions & safety

MCP servers have power. Gate properly:

### `.claude/settings.json`

```json
{
  "permissions": {
    "allow": [
      "mcp__playwright__*",
      "mcp__github__get_issue",
      "mcp__github__list_issues",
      "mcp__github__create_pull_request",
      "mcp__filesystem__read_file"
    ],
    "deny": ["mcp__github__delete_repository", "mcp__filesystem__delete"]
  }
}
```

**Principle:** Default deny, opt-in for each tool.

---

## 8. Debugging MCP

### Check server starts

```bash
# Test standalone
npx @playwright/mcp@latest
# Should print "MCP server listening on stdio"
```

### Claude Code debug

```
/mcp   # slash command in Claude Code — list MCP servers + status
```

### Log servers

Set `DEBUG=mcp:*` env var → verbose logs.

---

## 9. Workflow recipes

### Recipe 1: JIRA → Playwright test

MCP: atlassian + playwright + filesystem

```
Read JIRA ticket PROJ-123.
Extract acceptance criteria.
Generate Playwright test covering each AC.
Save to tests/features/proj-123.spec.ts.
```

### Recipe 2: Daily smoke → Slack report

MCP: github actions + slack

Scheduled cron → agent runs → Slack message:

```
Daily smoke report:
✅ 45/47 tests passed
❌ tests/critical/checkout.spec.ts line 23
   → timeout on payment button
Trace: [link]
```

### Recipe 3: Code review bot

MCP: github + filesystem

```
For PR #88:
- Read all changed test files
- Flag violations of our conventions
- Post review comments
```

---

## 10. Bài tập

### Bài 1: Multi-MCP setup

Setup 3 MCP servers: playwright + github + filesystem. Verify all show trong `/mcp`.

### Bài 2: Bug-to-test workflow

Create fake GitHub issue mô tả bug. Ask Claude Code to reproduce + write test. Run full flow.

### Bài 3: GitHub PR summary

Prompt:

> Look at all test files I added this week (commits by me). Write a summary for LinkedIn about what I learned.

Agent flow: GitHub MCP read commits → filesystem read files → summarize.

### Bài 4: Custom MCP (optional, advanced)

Build tiny MCP server với 1 tool (e.g., `get_current_time`). Register. Use from Claude Code.

### Bài 5: Permissions lock-down

Implement `.claude/settings.json` với allow/deny lists. Test: agent cố dùng denied tool → rejected.

---

## 11. Common Pitfalls

| Vấn đề                      | Fix                                           |
| --------------------------- | --------------------------------------------- |
| MCP server không start      | Check Node path, try `npx -y <pkg>`           |
| `GITHUB_TOKEN undefined`    | Env var không export; `source ~/.zshrc`       |
| Tool không xuất hiện        | Restart Claude Code; check `.mcp.json` syntax |
| Permission prompts liên tục | Add to `allow` list                           |
| Conflicting tool names      | Prefix với server name: `mcp__github__*`      |
| Slow responses              | MCP có overhead; use caching trong server     |

---

## 12. Anti-patterns

- ❌ Give agent broad filesystem access + no review
- ❌ Plain-text credentials trong `.mcp.json` (use env vars!)
- ❌ Commit `.mcp.json` với user-specific paths (use `${HOME}`)
- ❌ Skip permissions config → agent can `rm -rf`
- ❌ Over-rely on MCP for simple tasks — sometimes manual faster

---

## 13. Checklist

- [ ] Playwright MCP working
- [ ] GitHub MCP setup với PAT
- [ ] Combined workflow (2+ servers) thử 1 lần
- [ ] `/mcp` hiển thị servers healthy
- [ ] Permissions config `.claude/settings.json`
- [ ] Commit: `chore: configure MCP servers`
- [ ] NOTES.md: workflow recipe bạn sẽ dùng hàng ngày

---

## Resources

- [MCP Introduction](https://modelcontextprotocol.io/introduction)
- [MCP Server Gallery](https://github.com/modelcontextprotocol/servers)
- [Build Your Own MCP Server](https://modelcontextprotocol.io/quickstart/server)
- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers) (community)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [MCP explained (official Anthropic)](https://www.youtube.com/@anthropic-ai)
- [Build custom MCP server tutorial](https://www.youtube.com/results?search_query=custom+mcp+server)
- [MCP + Claude Code workflow](https://www.youtube.com/results?search_query=mcp+claude+code)

### 📝 Articles & blogs

- [MCP Protocol docs](https://modelcontextprotocol.io/docs)
- [MCP Quickstart — server](https://modelcontextprotocol.io/quickstart/server)
- [MCP Quickstart — client](https://modelcontextprotocol.io/quickstart/client)
- [Anthropic blog — MCP launch](https://www.anthropic.com/news/model-context-protocol)

### 🎓 Deep topics

- [MCP SDK Architecture](https://modelcontextprotocol.io/docs/concepts/architecture)
- [JSON-RPC over stdio](https://modelcontextprotocol.io/docs/concepts/transports)
- [MCP security model](https://modelcontextprotocol.io/docs/concepts/security)

### 📖 References

- MCP spec: [modelcontextprotocol.io](https://modelcontextprotocol.io/)
- Protocol spec repo: [modelcontextprotocol/specification](https://github.com/modelcontextprotocol/specification)

### 🐙 Related GitHub repos

- [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) — reference implementations
- [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- [modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk)
- [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- [github/github-mcp-server](https://github.com/github/github-mcp-server)
- [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)

### 🛠️ Popular MCP servers cho tester

- `@playwright/mcp` — browser control
- `@modelcontextprotocol/server-filesystem` — file ops
- `@modelcontextprotocol/server-github` — GitHub API
- `@modelcontextprotocol/server-slack` — Slack messaging
- `@modelcontextprotocol/server-postgres` — DB queries
- `@sooperset/mcp-atlassian` — Jira + Confluence
- `@modelcontextprotocol/server-brave-search` — web search
- `@modelcontextprotocol/server-memory` — knowledge graph

### 📊 Cheat sheets

- [MCP tool schema format](https://modelcontextprotocol.io/docs/concepts/tools)
- [`.mcp.json` structure](https://docs.claude.com/en/docs/claude-code/mcp)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (setup servers)

**B1.** Config 3 MCP servers:

- playwright
- filesystem (scoped to your repo)
- github

Verify `/mcp` trong Claude Code show 3 healthy.

**B2.** Test each server với simple prompt:

- Playwright: "navigate to playwright.dev, take screenshot"
- Filesystem: "read package.json, list dependencies"
- GitHub: "list open issues in my repo"

**B3.** Permissions config `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": ["mcp__playwright__*", "mcp__github__list_issues"],
    "deny": ["mcp__github__delete_repository"]
  }
}
```

### 🟡 Trung bình (combined workflows)

**M1.** Bug-to-test workflow:

```
Read issue #42 in user/repo.
Extract repro steps.
Reproduce with Playwright MCP (screenshot at failure).
Write regression test at tests/regression/issue-42.spec.ts.
```

Full 3-MCP chain (github + playwright + filesystem).

**M2.** Daily smoke summary:

```
Get today's workflow runs for this repo.
Summarize: pass/fail counts, flaky tests (fail 1-2 times), total duration.
Post summary to tests/.daily-report.md.
```

**M3.** PR test coverage checker:

```
Show me open PRs touching src/api/.
For each, check if test coverage added in tests/api/.
Report gaps.
```

**M4.** Screenshot diary:

```
Navigate to 5 different URLs in sequence, screenshot each.
Save to docs/screenshots/ with timestamps.
```

### 🔴 Nâng cao (build custom MCP)

**A1.** Build tiny MCP server — 1 tool:

`mcp-hello.ts`:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({ name: 'hello-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });

server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'greet',
      description: 'Greet someone',
      inputSchema: {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name'],
      },
    },
  ],
}));

server.setRequestHandler('tools/call', async (req) => {
  if (req.params.name === 'greet') {
    return { content: [{ type: 'text', text: `Hello, ${req.params.arguments.name}!` }] };
  }
  throw new Error('Unknown tool');
});

await server.connect(new StdioServerTransport());
```

Register, test.

**A2.** MCP for team — wrap your internal DB:

```typescript
{
  name: "query_test_db",
  description: "Run read-only query on test DB",
  inputSchema: { type: "object", properties: { query: { type: "string" } } }
}
```

Security: read-only only, sanitize input.

**A3.** MCP for cloud resources — AWS S3 upload (screenshots):

```typescript
{ name: "upload_screenshot", description: "..." }
```

**A4.** Debug MCP logs — set `DEBUG=mcp:*`, observe RPC messages.

### 🏆 Mini challenge (60 phút)

**Task:** Build "Testing Command Center" MCP server:

Custom MCP with 5 tools:

- `list_failed_tests(since)` — query test-results
- `extract_trace_info(file)` — parse trace, return summary
- `fetch_screenshot(test)` — return latest screenshot
- `get_flakiness_stats(days)` — compute flaky rate
- `suggest_fix(test_name)` — analyze + suggest

Register in Claude Code. Test end-to-end.

### 🌟 Stretch goal

Contribute MCP server to community — e.g., `mcp-playwright-test-results-analyzer`. Publish to npm, share on awesome-mcp.

---

## Next

[Day 27 — Claude Code Power Features →](./day-27-claude-code-power.md)
