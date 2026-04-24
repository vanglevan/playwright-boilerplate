# 06 — Agentic Engineering

> From "using AI" to "building with AI". Agents are the defining skill of 2026 senior engineers.
> By end of this module, you'll build + deploy a custom agent that solves real testing problems.

---

## 🎯 Why agentic engineering

**The progression:**

```
2023: Chatbot era   — Ask, get answer
2024: Assistant era — Ask, assistant does 1 action
2025: Agent era     — Ask, agent does multi-step task
2026: Multi-agent   — Orchestrate specialists
```

Senior testers in 2026 don't just use agents — they **design** them.

### Value proposition

- **Scale yourself** — 1 agent does work of 5 junior hours/day
- **Consistent quality** — codified rules > human vibes
- **24/7 operation** — runs on schedule, reports to Slack
- **Composable** — combine with team infra (JIRA, GitHub, CI)

### Real examples (2026)

- Agent reads JIRA bug → reproduces in browser → files regression test PR
- Agent monitors CI → diagnoses flaky tests → comments on PR with fix
- Agent audits test coverage nightly → reports gaps
- Agent scrapes product docs → generates API test suite
- Agent A/B tests prompts → evolves team playbook

---

## 🧠 Part 1: Agent vs workflow vs chatbot

### Definitions (Anthropic's framing)

**Workflow:**
Pre-defined sequence of LLM calls and tool uses. Deterministic structure.

```
User input → LLM call 1 → Tool call → LLM call 2 → Output
```

**Agent:**
LLM decides actions dynamically based on observations. Loop until done.

```
User goal → [LLM thinks → chooses tool → observes result] × N → Output
```

**Chatbot:**
Q&A, no tools (or simple retrieval only).

```
User question → LLM → Answer
```

### When to use what

| Problem                      | Pattern                    |
| ---------------------------- | -------------------------- |
| Summarize document           | Chatbot (just LLM)         |
| Translate + save to DB       | Workflow (fixed steps)     |
| Debug flaky test             | Agent (exploration needed) |
| Generate test plan from spec | Workflow (steps known)     |
| Reproduce bug from report    | Agent (steps vary by bug)  |

**Wise principle:** Use agent only when workflow insufficient. Agents harder to debug.

---

## 🏛️ Part 2: Core agent patterns

Reference: [Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)

### Pattern 1: Prompt chaining

Break task into sequential LLM calls.

```
[User] → [LLM 1: generate outline] → [Gate: valid?] → [LLM 2: write draft] → [LLM 3: polish] → [Output]
```

**Use case:** Write test suite for feature.

- Step 1: Extract acceptance criteria from spec
- Step 2: Generate test scenarios list
- Step 3: Write code for each scenario
- Step 4: Review + refine

### Pattern 2: Routing

Classify input, route to specialized LLM/prompt.

```
Input → [Classifier] → [Expert A] or [Expert B] or [Expert C]
```

**Use case:** Bug triage agent.

- Classifier: UI bug, API bug, perf bug, a11y bug
- Route each to specialized sub-agent

### Pattern 3: Parallelization

Run multiple LLM calls concurrently, aggregate.

**Sectioning:**

```
Task → [Subtask 1] parallel [Subtask 2] parallel [Subtask 3] → Combine
```

**Voting:**

```
Same task → [LLM run 1] [LLM run 2] [LLM run 3] → Majority vote
```

**Use case:** Generate test ideas.

- 3 parallel LLMs think of edge cases
- Combine → richer list than single run

### Pattern 4: Orchestrator-Workers

Central LLM breaks task + delegates.

```
Task → [Orchestrator] → [Worker 1] + [Worker 2] + [Worker 3] → [Orchestrator synthesizes]
```

**Use case:** Test strategy doc.

- Orchestrator: "Cover pyramid, CI, metrics, ownership"
- Worker 1: Pyramid section
- Worker 2: CI section
- Worker 3: Metrics section
- Orchestrator: stitches + polishes

### Pattern 5: Evaluator-Optimizer

LLM evaluates output, iterates until quality threshold.

```
Task → [LLM generates] → [Evaluator LLM scores] → Pass? → Output
                           ↓ Fail                  ↓
                       [LLM revises with feedback] ← loop
```

**Use case:** Generate + review test code iteratively.

### Pattern 6: Agent (autonomous)

LLM in loop with tools. Decides next action based on observation.

```
Goal → [LLM observes env] → [Picks tool] → [Executes] → [Observes result]
         ↑___________________________________________________|
                  Loop until done or failed
```

**Use case:** Almost any multi-step task.

---

## 🔄 Part 3: The ReAct loop (foundational)

**ReAct = Reasoning + Acting** — cornerstone of modern agents.

### The loop

```
Thought:      [LLM reasons about next step]
Action:       [LLM chooses tool + input]
Observation:  [Tool returns result]
[repeat]
Final Answer: [LLM synthesizes]
```

### Example: debug flaky test

```
User goal: Fix flaky tests/cart.spec.ts

Thought 1: I need to see the test first.
Action 1:  Read("tests/cart.spec.ts")
Observation 1: [test code shown]

Thought 2: Looks OK. Check recent failure logs.
Action 2:  Bash("ls test-results/ | grep cart")
Observation 2: test-cart-chromium-retry1/

Thought 3: Let me examine the trace.
Action 3:  Read("test-results/test-cart-chromium-retry1/trace.zip")
Observation 3: [trace metadata]

Thought 4: The cart button click times out ~30% of time. Before it, there's an API response.
           Race condition between UI render and API.
Action 4:  Edit("tests/cart.spec.ts", ...) [add waitForResponse before click]
Observation 4: [file modified]

Thought 5: Verify by running.
Action 5:  Bash("npx playwright test tests/cart.spec.ts --repeat-each=10")
Observation 5: 10/10 passed.

Final: Fix applied. Flakiness resolved.
```

This is what Claude Code does internally. Understanding pattern = understanding Claude Code.

---

## 🧰 Part 4: Planning patterns

### Plan-then-execute

```
Goal → [Planner LLM creates plan] → [Human approves?] → [Executor executes plan] → Output
```

**Why valuable:**

- Plan visible before commitment
- Can interject before bad direction
- Reusable plan for similar tasks

### ReWOO (Reasoning WithOut Observation)

Plan full sequence upfront, execute all, synthesize.

**Trade-off:**

- Fewer LLM calls (cheaper, faster)
- Can't adapt mid-execution
- Worse for dynamic environments

### LLM Compiler

Plan → parallel execute all possible → combine.

**For:** Independent sub-tasks.

---

## 🪞 Part 5: Reflection patterns

Agents that self-critique + improve.

### Basic reflection

```
[LLM generates output] → [Same LLM (different prompt): "critique this"] → [LLM revises]
```

Simple. Effective for quality.

### Actor-Critic (advanced)

Two separate LLMs or prompts:

- **Actor:** Does the work
- **Critic:** Evaluates quality, suggests improvements

Iterates until critic approves.

### Self-consistency

Run same task 3-5x (different randomness), take majority answer. Robust for ambiguous.

---

## 🔌 Part 6: MCP (Model Context Protocol) — deep dive

### What MCP solves

Before MCP: every AI tool had own plugin system. Devs built integration N × M times.

After MCP: standard protocol. 1 server → works with all MCP-compatible clients (Claude Code, Cursor, Claude Desktop, etc.)

### Architecture

```
┌─────────────────┐           ┌──────────────────┐
│  AI Client      │           │  MCP Server      │
│  (Claude Code)  │◀─JSON-RPC▶│  (playwright)    │
└─────────────────┘           └──────────────────┘
                                       │
                                       │ (does the actual work)
                                       ▼
                              ┌──────────────────┐
                              │  External system │
                              │  (Playwright,    │
                              │   GitHub, etc.)  │
                              └──────────────────┘
```

### Transport

- **stdio** — most common, process communicates via stdin/stdout
- **HTTP+SSE** — for remote MCP servers
- **WebSocket** — emerging

### MCP primitives (what servers expose)

| Primitive     | Purpose                            |
| ------------- | ---------------------------------- |
| **Resources** | Read-only data (files, docs)       |
| **Tools**     | Executable functions (actions)     |
| **Prompts**   | Reusable prompt templates          |
| **Sampling**  | Let server request LLM completions |

### MCP server catalog (essential for testers)

| Server                                      | Use                         |
| ------------------------------------------- | --------------------------- |
| `@playwright/mcp`                           | Browser control for AI      |
| `@modelcontextprotocol/server-filesystem`   | File ops with scope         |
| `@modelcontextprotocol/server-github`       | GitHub issues/PRs/workflows |
| `@modelcontextprotocol/server-slack`        | Team notifications          |
| `@sooperset/mcp-atlassian`                  | JIRA/Confluence             |
| `@modelcontextprotocol/server-postgres`     | DB queries                  |
| `@modelcontextprotocol/server-memory`       | Knowledge graph             |
| `@modelcontextprotocol/server-brave-search` | Web search                  |
| `@modelcontextprotocol/server-puppeteer`    | Alternative browser         |
| `@modelcontextprotocol/server-sqlite`       | Local DB                    |

Full list: [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

### Build your own MCP server

**Example: `test-results-query` MCP**

Goal: Let AI query your CI test results.

`test-results-mcp/src/server.ts`:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

const server = new Server(
  { name: 'test-results-query', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Tool 1: list failed tests
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'list_failed_tests',
      description: 'List tests that failed in latest run',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 10 },
        },
      },
    },
    {
      name: 'get_trace_summary',
      description: 'Get trace file summary for specific failed test',
      inputSchema: {
        type: 'object',
        properties: {
          testId: { type: 'string' },
        },
        required: ['testId'],
      },
    },
  ],
}));

server.setRequestHandler('tools/call', async (req) => {
  if (req.params.name === 'list_failed_tests') {
    const resultsDir = 'test-results';
    const entries = await fs.readdir(resultsDir);
    const failed = entries.filter((e) => e.includes('retry') || e.includes('failed'));
    return {
      content: [
        { type: 'text', text: JSON.stringify(failed.slice(0, req.params.arguments?.limit ?? 10)) },
      ],
    };
  }

  if (req.params.name === 'get_trace_summary') {
    const testId = req.params.arguments.testId;
    const tracePath = path.join('test-results', testId, 'trace.zip');
    const exists = await fs
      .access(tracePath)
      .then(() => true)
      .catch(() => false);
    if (!exists) return { content: [{ type: 'text', text: 'Trace not found' }] };

    // In real impl, parse trace zip
    return {
      content: [{ type: 'text', text: `Trace at ${tracePath}` }],
    };
  }

  throw new Error(`Unknown tool: ${req.params.name}`);
});

await server.connect(new StdioServerTransport());
```

Register in `.mcp.json`:

```json
{
  "mcpServers": {
    "test-results-query": {
      "command": "npx",
      "args": ["tsx", "./test-results-mcp/src/server.ts"]
    }
  }
}
```

Now Claude can:

> "List failed tests from latest run and analyze root causes."

Claude calls `list_failed_tests` → `get_trace_summary` iteratively → synthesizes.

### MCP best practices

- **Scope tools narrowly** — 1 tool = 1 clear purpose
- **Validate inputs** — Zod schemas
- **Sanitize outputs** — don't leak secrets
- **Handle errors gracefully** — return error info, don't crash
- **Document in description field** — AI uses to decide

---

## 🤖 Part 7: Claude Agent SDK

Official SDK for building agents in Python/TypeScript.

### Install

```bash
npm i @anthropic-ai/claude-agent-sdk
```

### Basic agent

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

async function testRepairAgent() {
  const result = query({
    prompt: `
      You are a test-repair agent.
      Analyze test-results/ for failed tests.
      For each failed test:
        1. Read the test code
        2. Read the trace/error
        3. Suggest a fix (don't apply yet)
      Output: markdown report to REPAIR_REPORT.md
    `,
    options: {
      cwd: process.cwd(),
      allowedTools: ['Read', 'Glob', 'Grep', 'Write'],
      permissionMode: 'default', // or "bypassPermissions"
    },
  });

  for await (const msg of result) {
    if (msg.type === 'result') {
      console.log('Done:', msg);
    } else if (msg.type === 'assistant') {
      console.log('Claude:', msg.content);
    }
  }
}

testRepairAgent();
```

Run:

```bash
ANTHROPIC_API_KEY=sk-... npx tsx repair-agent.ts
```

### Key capabilities

- Tool allowlist (security)
- Permission modes (strict, default, bypass)
- Streaming responses
- MCP integration
- Custom tool definitions

### Use cases for testers

1. **Flaky test detector** (nightly)
2. **Bug reproducer** (reads JIRA, creates repro)
3. **Test generator** (from spec to PR)
4. **Coverage auditor** (scan code, find untested)
5. **PR reviewer** (comments on test quality)

---

## 🎭 Part 8: Multi-agent systems

### When to use

- Task too big for single context window
- Specialized expertise needed (different roles)
- Parallelization meaningful

### When NOT to use

- Simple task
- Communication overhead > benefit
- Debugging cost high (many agents = hard to trace)

### Common architectures

#### Hierarchical

```
         [Manager]
        /    |    \
   [QA]  [Dev]  [PM]
```

Manager decomposes → delegates to specialists → synthesizes.

#### Peer-to-peer

```
[Agent A] ←→ [Agent B] ←→ [Agent C]
```

Equal agents collaborate, no central orchestrator.

#### Specialists

```
[Router] → [Expert 1 or 2 or 3]
```

Input classified, routed to one expert.

### Testing-specific: bug reproduction team

- **Reader agent** — parses JIRA bug
- **Environment agent** — sets up isolated env
- **Reproducer agent** — attempts reproduction
- **Reporter agent** — documents findings

Real framework: [CrewAI](https://www.crewai.com/), [AutoGen](https://microsoft.github.io/autogen/), [LangGraph](https://www.langchain.com/langgraph).

---

## 🧠 Part 9: Agent memory

### Short-term memory

Within conversation. Limited by context window.

### Long-term memory

Across sessions. Options:

- **File-based** — agent reads/writes `memory.md`
- **Vector DB** — semantic recall
- **Knowledge graph** — structured facts
- **Database** — relational (user prefs, history)

### Claude Code's memory

- `CLAUDE.md` (project-level, in context automatically)
- `~/.claude/memory/` (user-level, persistent)

### For custom agents

Simplest: append to `agent_memory.jsonl`:

```json
{"timestamp": "2026-05-01", "type": "finding", "content": "Flaky test cart.spec.ts — race on pricing API"}
{"timestamp": "2026-05-02", "type": "decision", "content": "Chose Pact for contract testing"}
```

On each run, agent reads last N entries for context.

---

## 🛡️ Part 10: Agent evaluation + debugging

### Why agents are hard to debug

- Non-deterministic (temperature, sampling)
- Multi-step failures (cascade)
- Hidden state (tool outputs)
- Long logs (hundreds of thoughts)

### Evaluation approaches

#### 1. Unit tests for agents

```typescript
test('agent finds flaky test correctly', async () => {
  // Setup: known flaky test in fixtures
  const result = await flakyDetectorAgent.run();
  expect(result.findings).toContain('tests/cart.spec.ts');
});
```

#### 2. Golden dataset

- Collect 50 historical bugs + known-good agent outputs
- Run agent on inputs
- Compare to golden outputs (LLM-judge or exact match)
- Track accuracy over time

#### 3. Observability

Log every:

- Prompt sent
- Response received
- Tool call + result
- Timing

Use [LangSmith](https://www.langchain.com/langsmith), [Arize](https://arize.com/), or homegrown.

#### 4. A/B testing

New version vs old on same tasks. Measure quality delta.

### Common failure modes

| Failure           | Symptom                    | Fix                               |
| ----------------- | -------------------------- | --------------------------------- |
| Loop              | Agent repeats same action  | Add iteration limit; detect loops |
| Lost goal         | Agent wanders off task     | Reinforce goal in prompt          |
| Tool misuse       | Calls wrong tool           | Better tool descriptions          |
| Hallucinated tool | Invokes non-existent tool  | Validate tool names               |
| Premature finish  | Claims done too early      | Require evaluator step            |
| Context overflow  | Long conversation, forgets | Summarize periodically            |

---

## 🏗️ Part 11: Build your first real agent

### Project: **Test Auditor Agent**

**Goal:** Nightly agent audits your test suite, reports gaps.

**Requirements:**

- Scan all `src/` files
- For each file, check if corresponding test exists
- For tests, measure basic quality (length, assertions, tags)
- Output report to `AUDIT.md`
- Post summary to Slack (optional)

### Architecture

```
Trigger (cron)
     ↓
Load context (CLAUDE.md, recent audits)
     ↓
Agent loop:
   Thought → Scan files → Analyze → Repeat
     ↓
Generate report
     ↓
(Optional) Post to Slack via MCP
     ↓
Commit audit to git
```

### Code skeleton

```typescript
// test-auditor.ts
import { query } from '@anthropic-ai/claude-agent-sdk';

async function main() {
  const systemPrompt = `
You are a senior QA auditor.

Task: Audit the test suite for this project.

Process:
1. List all files in src/
2. For each, check if tests/ has corresponding test file
3. For existing tests, evaluate:
   - Does it have at least 3 meaningful tests?
   - Do tests use fixtures (not manual beforeEach)?
   - Are tags present (@smoke, @regression)?
4. Compile findings into AUDIT.md

Output format:
- Coverage summary (% files with tests)
- Gap list (files missing tests, priority)
- Quality issues (tests lacking tags, poor structure)
- Top 5 recommendations

Be concise. Use tables.
`;

  const result = query({
    prompt: systemPrompt,
    options: {
      cwd: process.cwd(),
      allowedTools: ['Read', 'Glob', 'Grep', 'Write'],
      systemPrompt,
    },
  });

  for await (const msg of result) {
    console.log(msg);
  }
}

main().catch(console.error);
```

Run nightly via cron or GitHub Actions.

### Extensions

- Track over time (AUDIT.md history → improvements trend)
- Auto-create JIRA ticket for top gap
- Post top gap to team Slack
- Self-improve: read its own past audits, detect patterns

---

## 🚨 Part 12: Safety + ethics for agents

### Principles

1. **Least privilege** — agents get minimum tools needed
2. **Human in the loop** — critical actions require approval
3. **Auditability** — log everything
4. **Reversibility** — prefer reversible actions (comment, don't delete)
5. **Scope clearly** — "read these files" not "read filesystem"

### Permissions design

```json
{
  "allow": ["Read(src/**)", "Read(tests/**)", "Write(AUDIT.md)", "Bash(ls *)", "Bash(git status)"],
  "deny": ["Bash(rm *)", "Bash(git push *)", "Edit(.env*)"]
}
```

### Disaster scenarios to prevent

- Agent deletes production files
- Agent commits secrets
- Agent runs DROP TABLE (via DB MCP)
- Agent sends unauthorized messages (Slack MCP)

### Real-world incidents to learn from

- Search "AI agent accident" — real stories abound
- Post-mortems illuminate failure modes

---

## 📚 Resources

### Must-read articles

- [Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) — canonical
- [Lilian Weng — LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)
- [Simon Willison — Agents tag](https://simonwillison.net/tags/agents/)

### Papers

- [ReAct: Reasoning and Acting](https://arxiv.org/abs/2210.03629)
- [Reflexion: Language Agents with Verbal Reinforcement](https://arxiv.org/abs/2303.11366)
- [Voyager: An Open-Ended Embodied Agent](https://arxiv.org/abs/2305.16291)
- [Toolformer: Language Models Can Teach Themselves to Use Tools](https://arxiv.org/abs/2302.04761)

### MCP specific

- [MCP Introduction](https://modelcontextprotocol.io/introduction)
- [MCP Quickstart — Server](https://modelcontextprotocol.io/quickstart/server)
- [MCP Servers list](https://github.com/modelcontextprotocol/servers)
- [Awesome MCP](https://github.com/punkpeye/awesome-mcp-servers)

### Tools

- [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview)
- [LangChain](https://python.langchain.com/) — most popular framework
- [LangGraph](https://www.langchain.com/langgraph) — agent graphs
- [CrewAI](https://www.crewai.com/) — multi-agent
- [AutoGen (Microsoft)](https://microsoft.github.io/autogen/)
- [Browser Use](https://github.com/browser-use/browser-use)

### Videos

- [Building AI Agents (Anthropic)](https://www.youtube.com/@anthropic-ai)
- [Multi-agent systems explained](https://www.youtube.com/results?search_query=multi+agent+llm)

### Books

- _Building AI Agents with Large Language Models_ (newer book search)
- _Designing Data-Intensive Applications_ — Kleppmann (systems thinking)

---

## 🎯 Exercises

### 🟢 Basic (Week 7)

1. Set up Playwright MCP + GitHub MCP. Build combined workflow: "read issue #1, reproduce in browser, screenshot".
2. Create `.mcp.json` with 3 servers. Test each via Claude Code.
3. Read [Anthropic — Building Effective Agents]. Write 500-word summary.

### 🟡 Intermediate (Week 7-8)

1. Build simple MCP server with 1 tool (your choice — e.g., `get_test_count`).
2. Use Claude Agent SDK to build a "test summarizer" — analyzes test files, outputs coverage report.
3. Implement ReAct loop manually for "debug flaky test" task — log each step.

### 🔴 Advanced (Week 8)

1. Build multi-step agent: bug report → reproduce → generate test → open PR.
2. Custom MCP server with ≥ 3 tools, published on npm.
3. Measure agent quality: create golden dataset of 10 tasks + expected outputs. Score your agent.

### 🏆 Mini project (End of Week 8)

**Task:** Test Auditor Agent — production ready.

Features:

- Scans src/ for test coverage
- Identifies quality issues
- Posts daily report to `AUDIT.md`
- GitHub Actions cron schedule
- Slack notification on critical gaps
- Self-improving (reads past audits)

Deliverable:

- Repo with agent code
- GitHub Actions workflow
- 1 week of running agent + audit trail
- Demo video 5 min

### 🌟 Stretch goal

Contribute custom MCP server to [awesome-mcp](https://github.com/punkpeye/awesome-mcp-servers) or submit to [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers).

---

## ✅ Self-check

Can you do, unaided:

- [ ] Explain difference agent vs workflow vs chatbot
- [ ] Implement ReAct loop from scratch
- [ ] Build MCP server with ≥ 2 tools
- [ ] Use Claude Agent SDK to build real agent
- [ ] Design agent with proper permissions
- [ ] Debug failing agent

Goal: all yes by end of Month 2.

---

## Next

[07 — AI for Testing Applied →](./07-ai-for-testing-applied.md) — apply agentic thinking to real QA problems.
