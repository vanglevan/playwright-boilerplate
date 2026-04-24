# 08 — AI Best Practices (Senior Level)

> 20 principles + frameworks for using AI responsibly at scale.
> Written for seniors who model behavior for their team.

---

## 🎯 Why senior-level best practices differ

A junior using AI affects only their work.
A senior affects:

- **Team standards** (you set norms)
- **Codebase quality** (you review AI output that ships)
- **Junior development** (they copy your habits)
- **Business risk** (compliance, security)
- **Company culture** (you advocate or gatekeep)

Hence: senior best practices = team + business considerations, not just personal productivity.

---

## 🏛️ The 20 Principles

### Foundation (1-5) — always true

#### 1. You own what AI produces

**Principle:** AI assists, you commit. Responsibility lies with human.

**In practice:**

- Read every AI-generated line before commit
- If tests fail after AI change → your fault, not AI's
- In code review: treat as "junior dev suggestion", not "senior approval"

**Anti-pattern:** "Claude said this was correct" in PR description.
**Fix:** "I chose this approach because [reason]. AI helped draft."

#### 2. Privacy is non-negotiable

**Principle:** Never paste credentials, PII, or regulated data into public AI.

**What counts as sensitive:**

- API keys, passwords, tokens
- Production DB rows (user data)
- Internal codebase code (if company strict)
- Healthcare, financial records
- Employee data

**Defenses:**

- `.gitignore` includes `.env.*`
- Mask data before paste: replace `user_123@real.com` → `<EMAIL>`
- For regulated: on-prem / VPC AI only
- Check company AI policy — follow it

**Senior responsibility:** Call out teammates pasting sensitive data.

#### 3. Context determines quality

**Principle:** AI output quality = function of context provided.

**In practice:**

- Spend 20% of time on context, 80% on iteration
- CLAUDE.md maintained = team's multiplier
- Reference files > describe in prose
- Include failures + constraints, not just goals

**Anti-pattern:** "write test for login" (context = 0).
**Good:** "using pattern from X, following Y convention, avoiding Z" (context = rich).

#### 4. Verify before trust

**Principle:** Every AI claim must be verifiable.

**Checklist:**

- Does this API method actually exist? (grep docs)
- Does this package exist on npm? (search)
- Does this test actually verify behavior? (read carefully)
- Does this command do what AI says? (read man page)

**Anti-pattern:** Copy AI output to prod code without running it.

#### 5. Measure or it doesn't count

**Principle:** AI helping = hypothesis. Verify with data.

**Metrics to track:**

- Time saved per workflow (rough estimate)
- Output accepted as-is %
- Defects introduced via AI
- Net productivity (accounting for verification time)

**Senior responsibility:** Collect team-level metrics honestly. Cut workflows that don't help.

---

### Safety (6-10) — avoid disasters

#### 6. Least privilege for agents

**Principle:** Give AI minimum tools needed for task.

**Example:**

- Task: audit test coverage → only needs `Read`, `Grep`, `Glob`, `Write(AUDIT.md)`
- Don't allow: `Bash(git push)`, `Write(.env*)`, broad `Bash(*)`

**Implementation:**

```json
{
  "permissions": {
    "allow": ["Read(src/**)", "Read(tests/**)", "Write(reports/**)"],
    "deny": ["Bash(rm *)", "Bash(git push *)", "Edit(.env*)"]
  }
}
```

**Senior responsibility:** Team default permissions file. Secure by default.

#### 7. Reversibility preferred

**Principle:** Prefer actions that can be undone.

**Examples:**

- Create PR (reversible) > direct push to main (less reversible)
- Write to new file (reversible) > overwrite existing without backup
- Comment > delete
- Draft PR > merge automatically

**For agents:** prefer informational over mutating actions when possible.

#### 8. Human in the loop for critical actions

**Principle:** AI doesn't take final irreversible actions autonomously.

**Critical actions requiring approval:**

- Push to main / production
- Delete files / branches
- Deploy to production
- Send external communications (Slack, email)
- Charge payments (any money action)
- Modify user data

**Senior responsibility:** Define "critical" list for team. Codify in CI + AI agent configs.

#### 9. Defense against prompt injection

**Principle:** Untrusted input can manipulate AI.

**Scenarios:**

- User input fed to AI feature (chatbot, summarizer)
- Test automation that reads user-submitted content
- Reading untrusted files

**Defenses:**

- Sanitize input (strip known injection patterns)
- Separate trusted system prompts from untrusted data
- Don't give agent broad tools if it processes untrusted input
- Rate-limit + monitor
- Review [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)

#### 10. Hallucination detection as default

**Principle:** Assume AI occasionally fabricates. Design to catch.

**Detection habits:**

- If AI cites source → verify source exists
- If AI invents API → grep docs/source
- If AI claims package → `npm search` / check npmjs.com
- If AI states fact → search second time

**Automated:**

- Typecheck catches invented types
- Tests catch invented APIs
- Lint catches style fabrications

**When it matters most:** Code that ships to users, security decisions, compliance claims.

---

### Quality (11-15) — output standards

#### 11. Prompt engineering is engineering

**Principle:** Treat prompts as code: version, review, test, refactor.

**Artifacts:**

- `PROMPT_LIBRARY.md` — committed, reviewed
- Metrics per prompt template
- Changelog when prompts evolve
- Deprecation when outdated

**Senior responsibility:** Lead team adoption. Don't let prompt knowledge die in DMs.

#### 12. AI output is draft, not final

**Principle:** AI's first output = v0 draft. Always.

**Implications:**

- Budget time for review + refine
- Don't time-box "AI does it, I approve" — that's gambling
- Iteration loops OK (but measure turns needed)

**Anti-pattern:** "This is what AI gave me — LGTM." No. Refine.

#### 13. Documentation lags code — use AI to bridge

**Principle:** AI-generated docs are better than no docs.

**Use cases:**

- Auto-generate README sections from code
- Auto-generate API docs from types
- Summarize test files for onboarding
- Update docs after refactors

**Caveat:** Docs sources of truth = code. AI can drift. Verify periodically.

#### 14. Code style consistency through constitutional prompts

**Principle:** Enforce style via prompts, not PR comments.

**Implementation:**
In CLAUDE.md:

```
Rules:
- Locator priority: getByRole > getByLabel > getByTestId > CSS
- No waitForTimeout (ever)
- No `any` type
- Fixtures > beforeEach
```

AI respects these automatically. Saves PR comment fights.

#### 15. Embrace "AI rejected this" feedback

**Principle:** When AI resists your prompt, it often has reason.

**Examples:**

- "I notice this could break backward compatibility..." — listen
- "Are you sure you want to delete X?" — usually yes, listen anyway
- "This approach has security concerns..." — investigate

**Senior wisdom:** AI has read more code than you. Its hesitations are sometimes insight.

---

### Team & Culture (16-20) — lead responsibly

#### 16. AI literacy for team, not gatekeeping

**Principle:** Share knowledge. Don't hoard "AI wizard" status.

**Actions:**

- Weekly 30-min AI workflow demo
- `TEAM_AI_PLAYBOOK.md` contributed by all
- Celebrate wins + losses (learning culture)
- Pair-programming with AI for juniors

**Anti-pattern:** "I use AI, you wouldn't understand."
**Fix:** Explain. Teach. Document.

#### 17. Honest communication about AI involvement

**Principle:** PR descriptions, blog posts — be transparent.

**In PR:**

```markdown
## Description

Added login + cart tests for new feature.

## AI involvement

- Test scaffolds drafted with Claude Code
- Locators manually chosen + verified
- Edge cases + data manually designed
- All code reviewed + tested
```

Benefits:

- Team calibrates expectations
- Credit goes where appropriate
- Learn collectively

**Anti-pattern:** Hide AI usage. Pretend all human.

#### 18. Consider environmental + economic cost

**Principle:** AI inference isn't free (money or carbon).

**Be thoughtful:**

- Large context with rarely-used tools = expensive
- Generating 1000 tests overnight = $$$
- Re-prompting 20 times = inefficient

**Senior responsibility:** Optimize. Avoid wasteful patterns. Teach cost-awareness.

#### 19. AI can't replace social skills

**Principle:** Senior role = relationships + trust + judgment + AI. Not AI alone.

**What AI can't do (well):**

- Navigate political tensions
- Earn trust
- Mentor emotionally
- Understand team morale
- Read rooms
- Provide authentic recognition

**Implication:** Don't substitute AI for team communication. Use AI for prep, you do the conversation.

#### 20. Evolve constantly

**Principle:** AI landscape changes monthly. Your skills must too.

**Habits:**

- Monthly: try new tool or feature
- Quarterly: update AI_WORKFLOW.md
- Annually: re-evaluate entire stack
- Always: Simon Willison + Anthropic blog + community Discords

**Anti-pattern:** "I learned Claude Code 2026, I'm set." No. 2027 needs 2027 skills.

---

## 📐 Frameworks

### Framework 1: The Trust Ladder

Trust AI at increasing levels as patterns proven:

```
Level 0: Never (some domains, e.g., legal contract gen)
Level 1: Read output, never directly apply (initial learning)
Level 2: Apply with heavy review (most tasks initially)
Level 3: Apply with spot-check (proven workflows)
Level 4: Auto-apply with verification (CI-enforced)
Level 5: Auto-apply with monitoring (measured patterns)
```

**Senior judgment:** Task-specific. `npm install` = Level 5. `git push --force` = Level 0.

### Framework 2: The Review Matrix

Map AI output → review depth needed:

| Output type           | Stakes | Review depth          |
| --------------------- | ------ | --------------------- |
| Test scaffolding      | Low    | Skim + run            |
| Production code       | High   | Line-by-line + tests  |
| Documentation         | Medium | Read + fact-check     |
| Commit message        | Low    | Skim                  |
| Architecture decision | High   | Deep discuss + verify |
| Data generation       | Medium | Spot-check + variety  |
| Bug analysis          | Medium | Verify hypothesis     |
| Prompt improvement    | Low    | Try it                |

### Framework 3: The Context Sufficiency Test

Before prompt, ask:

1. Does AI have project conventions? (CLAUDE.md?)
2. Does AI have task context? (relevant files referenced?)
3. Does AI have constraints? (what NOT to do?)
4. Does AI have examples? (patterns to follow?)
5. Does AI have success criteria? (what "done" looks like?)

Any "no" → provide before prompting.

### Framework 4: The Hallucination Triage

When AI says X:

```
Is X a factual claim?
├── Yes → Is X verifiable via grep/docs/run?
│          ├── Yes → Verify (30 sec)
│          └── No → Flag as suspicious, cross-check
└── No → opinion/suggestion, treat as such
```

Make verification a muscle, not a chore.

---

## 🚨 Red flags (team smells)

### Smell 1: "AI did it"

**What it sounds like:** "Claude generated this, I just approved."
**Why bad:** Abdication of responsibility.
**Fix:** Require human reasoning in PR descriptions.

### Smell 2: Secret AI usage

**What it sounds like:** Silence about AI, but code has hallmarks.
**Why bad:** Culture of shame, not learning.
**Fix:** Make AI transparent, celebrated.

### Smell 3: Inconsistent AI output across team

**What it sounds like:** Every person's AI code looks different.
**Why bad:** No shared standards.
**Fix:** Shared CLAUDE.md, team workshops.

### Smell 4: Untested AI code shipping

**What it sounds like:** "Didn't have time to test, AI said it works."
**Why bad:** Production bugs.
**Fix:** CI gates. "Can't bypass" rules.

### Smell 5: AI gatekeeping

**What it sounds like:** One person "owns" AI workflows, won't share.
**Why bad:** Single point of failure, cultural rot.
**Fix:** Document, train, rotate.

### Smell 6: Over-tooling

**What it sounds like:** 8 AI tools, 20 hooks, hours configuring.
**Why bad:** Maintenance tax exceeds benefit.
**Fix:** Minimalism. 2-3 tools max.

### Smell 7: AI pessimism

**What it sounds like:** "AI is useless for real work."
**Why bad:** Missing productivity gains.
**Fix:** Gentle intervention, share successful workflows.

### Smell 8: AI optimism

**What it sounds like:** "AI can do everything, no bugs possible."
**Why bad:** Shipping bad code.
**Fix:** Show examples of AI failures. Reality check.

---

## 🧩 Team adoption framework

### Stage 1: Awareness (Week 1-2)

- 1-hour team talk: what AI can/can't
- Share this doc
- Individual play time

### Stage 2: Experimentation (Week 3-6)

- Each person: pick 1 workflow, try AI
- Bi-weekly retro: share wins/losses
- Start TEAM_AI_PLAYBOOK.md

### Stage 3: Standardization (Month 2-3)

- CLAUDE.md committed
- 5-10 agreed patterns
- Shared slash commands / hooks
- Metrics baseline

### Stage 4: Optimization (Month 4-6)

- Measure impact
- Cut workflows not helping
- Deeper agents
- Team specialists emerge

### Stage 5: Culture (Month 6+)

- AI literacy expected, not special
- Automatic team-wide updates when AI improves
- Mentor new team members

---

## 📜 Example team policies

### Policy: AI code review standards

```markdown
# AI in Code Review — Team Policy

## Expectations

1. **Generation OK, verification required** — AI-generated code must pass:
   - TypeScript strict
   - ESLint + Prettier
   - Tests (new + existing)
   - Human review (same as any code)

2. **PR description must mention AI if used**
   Template:
```

## AI involvement

- [ ] AI drafted tests
- [ ] AI suggested refactor
- [ ] AI reviewed first
- [ ] None

```

3. **Never paste sensitive data to public AI**
- Credentials, PII, regulated → deny
- Use placeholder / mock data in prompts

4. **AI output = junior dev level by default**
- Trust increases with proven patterns
- Quarterly review of trusted workflows

## Tools
- Primary: Claude Code
- Shared config: `.claude/` in repo
- Shared prompts: `PROMPT_LIBRARY.md`

## Approved use cases
- Test scaffolding ✅
- Code review assistance ✅
- Documentation drafts ✅
- Refactoring suggestions ✅

## Not approved without review
- Auto-merge any PR
- Direct push to main
- Modify production data
- External communications
```

Adopt and adapt.

---

## 🔒 Security-specific best practices

### 1. API keys + tokens

- Never in prompts
- Never in CLAUDE.md
- `.env.example` has placeholders
- Secret scanners on commit

### 2. Codebase leakage

- Proprietary code to AI = check company policy
- Some contracts prohibit external AI
- On-prem AI for strict companies (Claude via AWS Bedrock etc.)

### 3. Agent blast radius

- Agents with DB access = limit to read-only
- Agents with Slack = limit to test channels
- Agents with git = no force-push, no delete

### 4. Audit trails

- Log every AI interaction (for post-hoc review)
- Log tool calls, results
- For agents: keep activity log

### 5. Compliance

- GDPR — EU user data not to US AI
- HIPAA — healthcare data requires BAA
- SOC2 — audit AI vendor controls
- Company policy — follow or escalate

---

## 🌍 Ethical considerations

### 1. Impact on junior roles

AI amplifies seniors more than juniors initially. Risk: junior jobs automated away.

**Senior responsibility:**

- Mentor juniors on AI usage (up-skill)
- Advocate for human-machine teaming, not human replacement
- Internally push for "AI augments" not "AI replaces"

### 2. Bias in AI outputs

AI trained on internet = inherits biases.

**Implications for testing:**

- Test data generated by AI may reflect biases
- Diverse test users (names, countries) — not AI's default
- Check generated content for problematic assumptions

### 3. Attribution + credit

When AI helps significantly, credit appropriately.

- Blog post: "with help from Claude Code"
- Tool in bio: not hidden
- Academic: check venue's AI policy

### 4. Misinformation + hallucination harms

AI outputs in high-stakes areas (medical, legal, financial) require extra care.

For testers: mostly lower stakes, but if testing these domains, be extra careful with AI-generated content.

---

## 📊 The senior checklist

Before committing AI-assisted work:

- [ ] Read every line
- [ ] Ran typecheck + lint
- [ ] Executed tests
- [ ] Verified 1-2 claims AI made
- [ ] No secrets leaked
- [ ] PR description honest about AI
- [ ] I understand what this does
- [ ] I'd defend this decision without AI present

All yes → commit. Any no → iterate.

---

## 📚 Resources

### Must-read

- [Anthropic — Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [OpenAI — Moderation guidelines](https://platform.openai.com/docs/guides/moderation)
- [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

### Articles

- Simon Willison's posts on AI safety
- Anthropic Research pages
- Google AI Principles
- Responsible AI from Microsoft

### Books

- _The Alignment Problem_ — Brian Christian
- _Weapons of Math Destruction_ — Cathy O'Neil
- _Power and Progress_ — Acemoglu & Johnson

### Community

- [AI Ethics Lab](https://aiethicslab.com/)
- Partnership on AI
- Anthropic Forum

---

## 🎯 Exercises

### 🟢 Basic (Week 11)

1. Audit last 2 weeks of AI work. Score against 20 principles. What did you violate?
2. Write team policy (adapt example above) for your team.
3. Check company AI policy. Align personal usage.

### 🟡 Intermediate

1. Facilitate team discussion on AI best practices (1 hour).
2. Introduce `AI involvement` section in PR template.
3. Audit team's AI workflows — identify 2 risk areas. Fix.

### 🔴 Advanced

1. Write company-level AI policy (larger scope than team). Propose to leadership.
2. Present at meetup/conference: "AI in QA — responsibly".
3. Build agent with full safety guardrails — permissions, logs, rollback.

### 🏆 Mini project (End of Week 12)

**Task:** Team AI Governance Document.

Create 2000-3000 word `TEAM_AI_GOVERNANCE.md`:

- Team's principles (adapted from 20 principles)
- Approved/forbidden use cases
- Security requirements
- Review process
- Incident response (when AI causes bug in prod)
- Metrics + quarterly review

Get feedback from 2-3 teammates + 1 stakeholder. Adopt as living doc.

### 🌟 Stretch goal

Propose AI policy to all engineering organization. Get C-level acknowledgement.

---

## ✅ Self-check

Can you do, unaided:

- [ ] Cite 5 principles that guide your daily AI use
- [ ] Detect when teammate violating principle + gently correct
- [ ] Write/review team AI policy
- [ ] Explain AI risks to non-tech stakeholder
- [ ] Design agent with proper safety guardrails

Goal: all yes by end of Month 3.

---

## Next

[09 — AI Productivity Playbook →](./09-ai-productivity-playbook.md) — turn principles into daily 10x patterns.
