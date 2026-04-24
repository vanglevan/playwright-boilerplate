# 03 — AI Fundamentals for Senior Testers

> Understand HOW AI works, not just use it. This doc is **conceptual, not deeply mathematical**. For a senior tester, you need enough mental model to **judge AI output quality**, **debug weird behavior**, và **design workflows that leverage AI correctly**.

---

## 🎯 Why testers need AI fundamentals

**Without fundamentals:**

- AI says "use `page.waitForClick()`" → you believe it (API doesn't exist)
- Test suite suddenly flaky after AI-generated changes → you can't diagnose
- Team uses AI inconsistently → no one catches bad outputs
- You're replaceable by a junior who actually understands

**With fundamentals:**

- Instinct catches hallucinations
- Debug AI behavior like debugging code
- Design prompts that work for YOUR codebase
- Mentor team on AI use
- Become indispensable

---

## 🧠 Part 1: What is an LLM?

### The 60-second explanation

A **Large Language Model** (LLM) is a neural network that:

1. Reads massive amounts of text (internet-scale)
2. Learns to predict "what comes next" given previous text
3. Gets so good at prediction it can generate coherent responses, code, reasoning

**Key insight:** LLMs don't "understand" — they predict the statistically most likely next token given context. Sometimes that prediction reveals deep patterns that _look_ like understanding.

### Popular models (2026)

| Family      | Models                                   | Strengths                    |
| ----------- | ---------------------------------------- | ---------------------------- |
| Anthropic   | Claude (Opus 4.x, Sonnet 4.x, Haiku 4.x) | Coding, reasoning, safety    |
| OpenAI      | GPT-4 variants, o-series                 | General, broad ecosystem     |
| Google      | Gemini                                   | Multimodal, long context     |
| Open Source | Llama, Mistral, DeepSeek                 | Cost, privacy, customization |

For automation testers in 2026: **Claude** is often preferred for coding tasks (Claude Code is native). **GPT-4/5** for broader use. **Open source** for on-prem / compliance.

---

## 🔤 Part 2: Tokens

### What's a token

LLMs don't see characters or words — they see **tokens**. Roughly:

- 1 token ≈ 4 English characters
- 1 token ≈ 0.75 English words
- Punctuation, numbers often their own tokens
- Non-English (Vietnamese, Chinese) often 2-4x more tokens

### Why you care

- **Cost** — API pricing per token (input + output)
- **Speed** — more tokens = slower response
- **Context limits** — models have max tokens they can process

### Test your intuition

```
"Hello world"                          → ~2 tokens
"The quick brown fox jumps over the lazy dog"  → ~9 tokens
"Xin chào thế giới"                    → ~8-10 tokens (Vietnamese heavier)
"def test_login(): ..."                → ~8-10 tokens (code)
```

Tools to check: [tiktokenizer.vercel.app](https://tiktokenizer.vercel.app/) or [platform.openai.com/tokenizer](https://platform.openai.com/tokenizer)

### Practical implications for testers

```
Sending test file 500 lines ≈ 4000-6000 tokens
Sending API response JSON 5KB ≈ 1500 tokens
Sending "full codebase context" not feasible — summarize
```

**Lesson:** Be intentional. Don't paste entire repos.

---

## 📏 Part 3: Context windows

### What it is

The **context window** is the max tokens a model can consider at once (input + output combined, usually).

### Current landscape (2026)

| Model tier    | Context window                     |
| ------------- | ---------------------------------- |
| Small/cheap   | 8K - 32K tokens                    |
| Standard      | 128K tokens                        |
| Large context | 200K - 1M tokens                   |
| Frontier      | 1M+ tokens (Gemini Pro, Claude 1M) |

### Practical context budget

Even with 200K context:

- Your prompt + system message: 1-2K
- File you're asking about: 5-10K
- Conversation history: 2-30K
- Output budget: 1-8K

**"You have 100K context" ≠ "fill it all"**. Larger context = slower + more expensive + sometimes worse quality (lost-in-middle phenomenon).

### Context strategies for testers

1. **Link, don't paste** — "the file at src/pages/login.page.ts" > pasting
2. **Summarize older context** — "Earlier we discussed X, Y. Now..."
3. **New conversation for new task** — don't accumulate bloat
4. **Use CLAUDE.md** — persistent context file auto-loaded

---

## 🌡️ Part 4: Temperature and sampling

### Temperature (0.0 - 2.0)

Controls randomness/creativity of outputs.

- **0.0** — deterministic, same input → same output. Best for code, facts.
- **0.5-0.7** — balanced. Default for most AI assistants.
- **1.0+** — creative, varied. Best for brainstorming, creative writing.

### Practical for testers

```
Generate test code          → temperature 0.1-0.3
Brainstorm edge cases       → temperature 0.7-1.0
Debug/troubleshoot          → temperature 0.2
Refactor/review             → temperature 0.3
```

Most AI tools (Claude Code, Cursor) **don't expose temperature**. But knowing the concept helps you:

- Understand why same prompt gives different answer
- Re-ask for variety if first output not useful

### Top-p / top-k (advanced)

Alternatives to temperature for controlling randomness. Mostly tuned by tool maintainer, not you.

---

## 🎭 Part 5: System prompts vs user prompts

### Hierarchy

```
[System prompt]   ← "Who AI is, how it should behave"
[User prompt 1]   ← Your instruction
[AI response 1]
[User prompt 2]
[AI response 2]
...
```

### System prompt (set by tool/developer)

Examples:

- Claude Code: "You are Claude Code, Anthropic's official CLI..."
- ChatGPT: "You are ChatGPT, a helpful assistant..."
- Custom API: whatever you configure

### User prompt (what you write)

Your actual questions/tasks.

### Why it matters

- System prompt is **higher priority** than user prompt (mostly)
- You can't override system-level rules via user prompt (usually)
- When building custom agents, YOU design system prompt — huge leverage

### For senior testers: design system prompts

```
You are an expert Playwright test reviewer.

Given a test file, review for:
- Locator quality (prefer getByRole > getByLabel > getByTestId > CSS)
- Web-first assertions
- Test independence
- Missing edge cases

Always cite specific line numbers.
Never suggest fixes without explanation.
```

Reusable across conversations. Consistent behavior.

---

## 🗄️ Part 6: Embeddings (intro)

### What it is

Convert text → **vector** (list of numbers, typically 1000-3000 dimensions).

Similar texts → similar vectors. Different texts → far-apart vectors.

### Why it matters for testers

- **Semantic search** — find similar bug reports, tests, etc.
- **RAG systems** — retrieve relevant docs before asking LLM
- **Test deduplication** — cluster similar tests
- **Flaky test analysis** — find tests failing similarly

### Mental model

```
"cart has 2 items"  →  [0.23, 0.45, ..., -0.12]   (1536 dims)
"basket has 2 products" → [0.21, 0.44, ..., -0.11]  (very similar!)
"user login OAuth"  →  [0.89, -0.12, ..., 0.55]   (far away)
```

Cosine similarity measures "how close" two vectors are.

### Tools (for later)

- OpenAI embeddings API: `text-embedding-3-small`
- Vector DBs: Pinecone, Weaviate, Qdrant, Chroma
- Free local: sentence-transformers (Python)

**For most testers, you won't build embeddings. Just understand when a tool (like code search) is using them.**

---

## 📚 Part 7: RAG (Retrieval Augmented Generation)

### Problem

LLM has **static knowledge** (training cutoff). Doesn't know:

- Your proprietary codebase
- Latest framework version
- Today's news
- Internal docs

### Solution: RAG

```
User question → Search knowledge base → Retrieve top-K relevant chunks
                                          ↓
            Combine into prompt → Send to LLM with context → Response
```

### Practical example

**Without RAG:**

> You: "What's our project's test structure?"
> AI: [generic best practices, doesn't know YOUR project]

**With RAG:**

> You: "What's our project's test structure?"
> System: [retrieves `README.md`, `CONTRIBUTING.md` from your repo]
> AI: "Based on your repo, tests live at `tests/`, organized by..."

### Tools using RAG

- Cursor (indexes your codebase)
- Claude Code (reads files as you mention them)
- GitHub Copilot (context from open files)

### Build your own (Month 2-3 of roadmap)

Simple RAG for testers:

1. Embed all your test files with `text-embedding-3-small`
2. Store in Chroma DB locally
3. For each question, retrieve top-5 relevant tests
4. Pass to Claude with user question
5. Get contextualized answer

Tutorial: [LangChain RAG guide](https://python.langchain.com/docs/tutorials/rag/)

---

## 🔧 Part 8: Tool use (function calling)

### What it is

LLMs can "request" to call external tools.

```
You: "What's the weather in Hanoi?"
AI: [Request to call tool: getWeather("Hanoi")]
System: [Runs getWeather, returns "28°C, sunny"]
AI: "It's 28°C and sunny in Hanoi."
```

### Why it matters for testers

All AI agent capabilities rest on tool use:

- Read files (Read tool)
- Execute shell (Bash tool)
- Browser control (Playwright MCP)
- GitHub API (GitHub MCP)

**MCP (Day 26 from bootcamp) is a standard for exposing tools to LLMs.**

### Practical

Your Claude Code interactions already use tool use heavily — every `Read`, `Edit`, `Bash` call = tool use.

### For senior testers

Design custom tools for your team's workflows:

- `query_test_results(test_id)` — fetch from your CI
- `fetch_bug(id)` — from JIRA
- `deploy_to_preview(branch)` — trigger pipeline

Wrap as MCP server → any AI client can use.

---

## 🎨 Part 9: Multi-modal AI

### What's new in 2026

Models now see/hear/speak, not just read:

- **Vision** — process images, screenshots, diagrams
- **Audio** — speech-to-text, voice input
- **Video** — frame analysis
- **Code + images** — debug UI screenshots

### Practical for testers

- **Debug from screenshot** — paste error screenshot to Claude → get diagnosis
- **Visual bug reports** — attach screenshot, ask "what's wrong UX-wise"
- **Diagram from image** — hand-sketch flow, AI converts to mermaid
- **Accessibility audit from screenshot** — image contrast analysis
- **Locator generation from screenshot** — ask AI to pick a locator for this button

### Example prompt

```
[Attach screenshot of login form]

What's accessibility issues in this UI?
What test cases would you prioritize?
Generate Playwright locators for each interactive element.
```

Huge time-saver when working with non-technical folks (PM, designer).

---

## 🤔 Part 10: Hallucinations

### What they are

LLM confidently states things that are **not true**.

### Common patterns

- Invents API methods that don't exist
- Cites sources that don't exist
- Makes up facts about obscure topics
- Fabricates package names on npm
- References outdated API from training data

### Why they happen

LLMs predict "what seems plausible given context". When under-informed, plausible ≠ true.

### Detection techniques for testers

1. **Run it** — `npm install fake-package` → not found
2. **Search docs** — method name → 0 results = hallucination
3. **Cross-check** — ask same question fresh conversation; different answer = suspect
4. **Ask for source** — "Cite the docs page" → if can't, likely made up
5. **Grep codebase** — "AI says project has X class" → `grep -r "class X"` → if not found, false

### Prevention

- Low temperature for factual code
- Explicit: "If unsure, say so"
- Provide context (docs, file paths)
- Don't blindly trust first answer

### Accept reality

Hallucinations **will decrease** but **won't disappear** in foreseeable future. Build processes around them:

- Always verify AI code actually runs
- Lint + typecheck after AI output
- Test after AI output
- Code review AI output like junior dev code

---

## 🧪 Part 11: Fine-tuning vs prompting

### Prompting (what you mostly do)

- Use model as-is
- Craft better prompts
- Cheap, fast iteration
- No training data needed

### Fine-tuning (advanced)

- Additional training with YOUR data
- Customize model behavior
- Expensive, slow
- Requires dataset

### When fine-tuning makes sense for testers

Probably **never** for 99% of testers in 2026. Pros:

- Enterprise-scale repetitive prompts
- Strict style consistency
- On-prem privacy

Cons:

- Cost ($$$)
- Maintenance burden (re-fine-tune with new data)
- Over-engineering for most problems

### When to consider

If you're building an AI product (not just using one), fine-tuning might matter. For QA work: **prompt engineering gets 95% of the benefit at 5% of the cost**.

---

## 🎓 Part 12: Model selection for testers

### Claude (Anthropic)

**Best for:**

- Coding tasks (strongest programming AI in 2026)
- Complex reasoning
- Following instructions carefully
- Long conversations

**Models:**

- Opus (highest quality, slowest, most expensive)
- Sonnet (balanced)
- Haiku (fast, cheap, smaller context often)

**Recommend:** Claude Code CLI uses Claude by default. Good default choice.

### ChatGPT/GPT (OpenAI)

**Best for:**

- General knowledge queries
- Creative writing
- Broad ecosystem integrations
- o-series models for reasoning

### Gemini (Google)

**Best for:**

- Multimodal (images, video)
- Very long context (1M+ tokens)
- Google ecosystem integration

### Open Source (Llama, Mistral, DeepSeek, etc.)

**Best for:**

- On-prem / air-gapped environments
- Privacy-sensitive workflows
- Customization via fine-tuning
- Cost at very high scale

**Run locally with:** Ollama, LM Studio, vLLM

### For senior testers in 2026

Default: Claude for coding. Have account at 2-3 major providers. Know how to run 1 open-source model locally (for privacy).

---

## 📖 Learning path (Week 1-2 of Month 1)

### Must-read

- [Lilian Weng — LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/) — depth for agent era
- [Jay Alammar — Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) — visual intuition
- [Anthropic — Core Views on AI Safety](https://www.anthropic.com/news/core-views-on-ai-safety) — safety thinking
- [Simon Willison's blog](https://simonwillison.net/) — daily practitioner insights

### Watch

- [3Blue1Brown — Neural Networks playlist](https://www.3blue1brown.com/topics/neural-networks) — visual math intuition
- [Karpathy — Let's build GPT from scratch](https://www.youtube.com/watch?v=kCc8FmEb1nY) — 2h, eye-opening if you have time
- [Fireship — AI explained series](https://www.youtube.com/@Fireship)

### Books

- _Hands-On Large Language Models_ — Jay Alammar (excellent practical)
- _Designing Machine Learning Systems_ — Chip Huyen
- _The Alignment Problem_ — Brian Christian (safety context)

### Interactive

- [Anthropic Prompt Engineering Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) — hands-on
- [LLM course (free)](https://github.com/mlabonne/llm-course) — comprehensive

---

## 🎯 Exercises

### 🟢 Basic (Week 1)

1. Use [tiktokenizer.vercel.app](https://tiktokenizer.vercel.app/) — tokenize 5 different texts (English, Vietnamese, code, emoji, long URL). Compare.
2. Ask Claude same prompt 5 times with your bluff "no RAG" (fresh conversation) — observe variance.
3. Read Lilian Weng's article — summarize in 200 words.

### 🟡 Intermediate (Week 2)

1. Build simple Python script that calls Claude API with system + user prompt. Vary temperature 0.0, 0.5, 1.0 — compare outputs.
2. Write a "system prompt" for a test-reviewer agent — test on 3 real test files.
3. Try 1 multi-modal query — screenshot of UI, ask Claude for a11y issues.

### 🔴 Advanced

1. Set up local Llama with Ollama. Ask same coding question. Compare to Claude quality.
2. Write 500-word blog post: "What I learned about LLMs that changed my testing workflow"
3. Build tiny RAG system: embed your 10 best tests, retrieve relevant ones given query.

### 🏆 Mini project (Week 2 end)

**Task:** LLM-powered test recommender.

Given: bug description as input.
Output: top 5 most relevant existing tests (from your repo), ranked by semantic similarity.

Stack:

- Embed existing tests with OpenAI API
- Store in local JSON (sufficient for small projects)
- On query: embed input, cosine-similarity against all, return top 5

This is your first "real" AI engineering for testing. ~3-4 hours.

---

## ✅ Self-check (end of Month 1, Week 2)

Rate 1-5 your ability to:

- [ ] Explain tokens to a junior tester
- [ ] Predict roughly how many tokens a given text is
- [ ] Decide when low temperature vs high helps
- [ ] Detect 3 common hallucination types
- [ ] Pick between Claude / GPT / Gemini for a task
- [ ] Explain RAG in 2 sentences
- [ ] Know when fine-tuning is NOT needed (most testers)

Goal: all ≥ 4.

---

## Next

[04 — Prompt Engineering Mastery →](./04-prompt-engineering-mastery.md) — apply fundamentals to practical prompting.
