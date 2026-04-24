# 12 — Soft Skills & Leadership

> Technical skills get you to senior. Soft skills get you past senior.
> 80% of senior+ failures are communication, not technical.

---

## 🎯 Why soft skills matter more at senior

### The leverage shift

```
Junior:     100% individual work
Mid:         70% individual, 30% coordination
Senior:      40% individual, 60% coordination + influence
Staff+:      20% individual, 80% leadership + strategy
```

Senior and beyond → impact through others.

### What gets you promoted past senior

- **Communication** (written, verbal)
- **Judgment** (know what matters)
- **Influence** (get things done through others)
- **Mentorship** (lift others)
- **Stakeholder management** (expectations + trust)
- **Conflict resolution** (disagreements productive)

Not: more code output.

### The automation tester specific

Testers already need cross-functional skills:

- Dev partnership
- Product empathy
- Bug reporting (translating technical → business impact)
- Defending quality bar (sometimes unpopular)

Double-down on these as senior.

---

## 💬 Part 1: Communication

### Written communication

#### The default in 2026

- Async-first (Slack, docs)
- Global teams (timezones)
- AI-amplified output (more to review)

Good writers have compounding advantage.

#### Writing principles

1. **Lead with conclusion** — don't bury the lede
2. **Structure > prose** — headers, bullets, tables
3. **Concrete > abstract** — examples, numbers
4. **Signal context** — who, when, why
5. **Invite action** — end with ask

#### Example: bad vs good Slack message

**Bad:**

> Hey, so I was testing the cart page and noticed some issues. The tests are failing about 30% of the time in CI but pass locally. I think it might be timing-related but not sure. Should we look into it?

**Good:**

> **Flaky test: cart.spec.ts (30% CI fail rate)**
>
> Passes 100% local. Symptoms suggest race condition with /api/cart response.
>
> **Ask:** 15 min pair-debug today 3pm? Or async review of trace?
>
> **Context:** Trace attached. Retry logs in thread.

Same info, 10x more actionable.

#### Writing cheat sheet for testers

**Bug reports:**

```
Title: [Component] Expected X, got Y
Severity: blocker/major/minor
Reproduction:
1. Step 1
2. Step 2
3. Observe Y
Expected: X
Environment: [browser, version, OS]
Evidence: screenshot / video / trace link
```

**PR descriptions:**

```
## What
[1-2 sentences]

## Why
[Context / problem being solved]

## How
[Approach, key decisions]

## Testing
[How verified]

## AI involvement
[If applicable, honest]

## Rollout concerns
[Anything to watch in prod]
```

**Design docs:**
Use section format from Doc 11 (strategy template applicable here).

**Status updates:**

```
**Done this week:**
- [concrete thing]

**Next week:**
- [concrete thing]

**Blocked:**
- [what, need help with]

**Heads-up:**
- [risk / opportunity worth flagging]
```

#### Practice

Write 1 piece of professional communication per day (bug, PR, doc, email). Review weekly — improve clarity.

AI can help: "Review this message for clarity. Suggest improvements."

### Verbal communication

#### Speaking in meetings

- **Prepare 1 point** per meeting (not 5)
- **Land it clearly** when speaking
- **Defer non-critical** to async follow-up
- **Don't fill silence** — let others speak

#### Technical presentations

- **Know audience** — adjust depth
- **Start with why** — before what/how
- **One idea per slide** — visual clarity
- **Demo > slides** for technical
- **End with action** — what happens next

#### Difficult conversations

Framework: S-B-I (Situation-Behavior-Impact)

> **Situation:** "In yesterday's code review..."
> **Behavior:** "...when you pushed back on the coverage threshold..."
> **Impact:** "...it felt dismissive of the QA concerns and made it hard to reach agreement."

Non-accusatory. Specific. Actionable.

### Listening

Underrated skill. Senior testers hear:

- What stakeholders actually need (vs what they say)
- Dev's underlying concerns (vs surface-level pushback)
- Team's morale signals
- What's not being said

#### Techniques

- **Reflect back:** "So you're saying the timeline is the main concern?"
- **Ask what's missing:** "Is there anything I'm not asking about?"
- **Sit with silence:** Don't rush to fill
- **Take notes:** Shows you value input

---

## 🤝 Part 2: Stakeholder Management

### Who are stakeholders

- Engineering manager
- Product manager
- Designer
- Dev team
- Other QA
- Customer success / support
- Sometimes: customers directly

Each has different goals + communication style.

### Map your stakeholders

```
                    High interest
                          │
          Keep informed   │   Manage closely
          (PMs)           │   (Eng manager, Lead dev)
        ──────────────────┼──────────────────
          Monitor         │   Keep satisfied
          (C-suite)       │   (Designers, CS)
                          │
                    Low interest
         Low power ◀──────┼──────▶ High power
```

Adjust communication cadence based on power/interest.

### Communication cadences

#### With engineering manager

- 1:1 weekly (30 min)
- Async update daily in Slack (optional)
- Escalate blockers immediately
- Share: wins, struggles, learnings

#### With PM

- Standup (if applicable)
- Release readiness check pre-launch
- Bug triage sessions
- Share: quality metrics, risk assessment

#### With devs

- Paired debugging when appropriate
- Code review participation
- Technical discussions in relevant channels
- Share: test results, flaky test data, improvements

#### With designers

- Design review: a11y feedback, edge cases
- Testability review early
- Share: visual test results, usability issues found

### Managing expectations

#### Over-promising

Common trap: "Yes, I'll automate everything by EOQ."

Better:

- "Here's what's feasible in sprint X"
- "Here's the dependency"
- "Here's the trade-off"

#### Under-promising + over-delivering

Too conservative is also bad — team loses trust in your estimates.

Target: realistic + small buffer.

#### When timelines slip

Tell early:

> "Originally estimated 2 weeks. Discovering more complex than expected (3 issues found). New estimate: 3.5 weeks. Options: [descope X], [extend Y], [add resource Z]."

Transparency + options = professional.

### Saying no (constructively)

Senior means sometimes rejecting requests.

Formula: "I understand X is important. Given Y constraint, here are options: A/B/C. I recommend A because..."

Never: flat "no" without alternatives.

---

## 👨‍🏫 Part 3: Mentorship

### Why mentor

- **Force multiplier** — 1 senior helps 5 juniors → 5x team output
- **Career leverage** — mentoring shows leadership
- **Retention** — mentored people stay longer
- **Learning** — teaching forces clarity

### Levels of mentorship

#### Drive-by help

Junior has question → answer in 5 min → move on.

**When:** Day-to-day. Free, cheap, good.

#### Ad-hoc pairing

30-60 min session. Specific problem.

**When:** Weekly-ish for same mentee.

#### Structured mentorship

Weekly 1:1. Goals, progress tracking.

**When:** Formal program or committed 3-6 month arrangement.

### Structured mentorship format

#### First meeting (1 hour)

- Where are you now? (skills self-assessment)
- Where do you want to be? (6 months)
- What's blocking?
- How can I help?
- Agree on cadence + format

#### Regular meetings (30-45 min)

- Wins since last time
- Challenges
- Help needed
- Next step

#### Quarterly review

- Progress vs goals
- Re-align if needed
- Celebrate growth

### What to mentor on

#### Technical

- Playwright / testing frameworks
- Code quality
- Architecture thinking

#### Career

- Resume / portfolio review
- Interview prep
- Salary negotiation
- Path to senior

#### Soft skills

- Communication practice
- Conflict resolution
- Stakeholder management

### Mentorship don'ts

#### Don't: solve for them

Tempting but stunts growth.

**Bad:** "Here's the fix."
**Good:** "What have you tried? What do you think could be the issue?"

#### Don't: criticize publicly

Private only. Protect mentee's reputation.

#### Don't: take credit for their work

Even if you helped heavily. Their work, their credit.

#### Don't: commit too much

1-2 mentees max. Quality > quantity.

#### Don't: fake interest

Mentees sense it. Match with genuine interest topics.

### What good mentees look like

Recognize + protect these traits:

- Asks specific questions (not "help me")
- Tries before asking
- Takes feedback well
- Follows up on commitments
- Shares their own learnings

If mentee doesn't have these yet, coach them.

---

## 🔍 Part 4: Code Review Culture

### Why code review matters for quality

Beyond catching bugs:

- Knowledge spread
- Standards reinforcement
- Learning accelerator
- Psychological safety builder (or destroyer)

### Senior-level code review

#### What to review

1. **Correctness** — does it do what intended
2. **Design** — is approach right
3. **Complexity** — simpler way?
4. **Tests** — adequate coverage
5. **Naming** — clear?
6. **Comments** — why, not what
7. **Style** — team conventions
8. **Security** — any concerns?

#### How to comment

**Bad:**

> Fix this.

**Good:**

> Nit: consider extracting this into a helper — used 3x in this file. Optional.

#### Nit vs blocker

Make severity clear:

- **nit:** optional, style/preference
- **suggestion:** consider, but your call
- **question:** help me understand
- **blocker:** must fix before merge

Labels keep communication clean.

#### Review frequency

- Review within 24 hours (unblock team)
- Schedule time (not reactive)
- Review your own PRs first (catches 50% of issues)

### When receiving review

#### Psychological framing

- Feedback about code, not you
- More feedback = they care
- Can always push back with reasoning

#### Responding to comments

- **Accept:** "Good point. Fixed in commit X."
- **Discuss:** "I considered that. Went this way because Y. What do you think?"
- **Defer:** "Good for v2 — ticketed #123."
- **Decline:** "I understand concern. Think current approach is better because... Can you elaborate if still disagree?"

Respectful. Reasoned. Not defensive.

#### When stuck

Escalate:

- Ask manager / arbiter
- Documenting disagreement in PR
- Agree to disagree + move on (rare)

### Building review culture

As senior, you influence team culture:

**Encourage:**

- Fast reviews (<1 day turnaround)
- Kind tone ("we" not "you", assume good intent)
- Knowledge sharing in comments
- Small PRs (<400 lines ideal)

**Discourage:**

- Drive-by negative comments without context
- Blocking on taste disagreements
- Reviewer as gatekeeper
- Rubber-stamp approvals

### AI + code review

Honest about AI's role:

- AI first-pass is fine
- Reviewer still reads everything
- Final approval is human
- AI-found issues cited as such

---

## 🤯 Part 5: Conflict Resolution

### Common senior tester conflicts

1. Dev wants to skip test for velocity
2. PM wants faster release despite risk
3. Another QA disagrees on approach
4. You think feature shouldn't ship, team disagrees

### Framework: Interests vs Positions

**Positions:** what people claim to want
**Interests:** underlying needs

Example:

- Position: "We need to skip E2E tests this sprint"
- Interest: "We're under timeline pressure from leadership"

Negotiate on interests:

> "What if we run smoke tests only this sprint, defer regression to next? That reduces blocking while maintaining some safety."

### De-escalation techniques

#### 1. Lower temperature

- Move to 1:1 (not Slack channel)
- Acknowledge emotion: "I see this is frustrating"
- Take break if needed

#### 2. Restate their view

> "Let me make sure I understand. You're saying X because of Y. Right?"

Often disagreement evaporates when heard.

#### 3. Find common ground

> "We both want Z (ship good product). Differ on how."

Reframe from opponents → collaborators.

#### 4. Options, not demands

> "What if we did A? Or B? Or C?"

Choices > ultimatums.

#### 5. Escalate if needed

If conflict blocks work + you've tried above:

- Bring in manager or arbiter
- Document disagreement for context
- Accept decision, commit

### When to "die on hill"

Some things worth fighting for:

- User safety (legal, compliance, security)
- Ethics (privacy, fairness)
- Technical debt that'll hurt badly
- Professional integrity

Most things → pick 2-3 max per quarter. Don't fight everything.

### When to compromise

- Small style preferences
- Tool choices (can migrate later)
- Process debates
- Naming

Save capital for important fights.

---

## 🧑‍🤝‍🧑 Part 6: Cross-functional Partnership

### Dev ↔ QA partnership

#### Anti-pattern: adversarial

"Devs break, QA catches."
Sets up opposition. Bad culture.

#### Better: collaborative

"We ship quality together. Different skills, same goal."

#### Practical moves

- **Pair on feature kick-off** — QA + Dev + PM align on acceptance
- **Test review** — Dev reviews test files (not just Dev's code review by QA)
- **Shared on-call** — both respond to prod issues
- **QA writes test, Dev runs manual** — role-swap quarterly

### PM partnership

#### Understand PM's world

- Pressure from customers, leadership
- Tight deadlines often not their fault
- Need to balance many stakeholders

#### Be useful to PM

- Proactive quality assessment ("green/yellow/red for this release")
- Risk framing ("if we ship, risk is X")
- Options with trade-offs
- Translate tech to business terms

#### Common friction points

- PM wants feature out → QA wants bar met
- PM's "it's fine" → QA's "actually not fine"

**Resolution:** Data + framing.

> "If we ship, 2 bugs likely in production (based on coverage). Severity: medium. Customer impact: X. Fix time if we wait: 2 days. Your call."

### Designer partnership

#### What you offer designer

- Testability feedback (hard-to-test UI = hard to maintain)
- A11y findings
- Usability issues from testing

#### What you get

- Understanding of design intent
- Patterns to follow
- Early visibility into changes

### Engineering Manager partnership

#### Your manager cares about

- Team output
- Quality / reliability
- Your growth
- Their manager's concerns

#### Make their life easier

- Clear updates (written)
- Proactive escalation
- Ownership (don't dump all decisions on them)
- Solutions, not just problems

---

## 🎤 Part 7: Meetings + Facilitation

### Running a productive meeting

#### Pre-meeting (5 min)

- Clear agenda
- Materials shared 24h before
- Right attendees (not "everyone")
- Time box

#### During (timebox strictly)

- State goal at start
- Park off-topic discussions
- Assign action items with owners + dates
- End on time

#### Post-meeting (10 min)

- Send summary with action items
- Follow up on commits in 1 week

### Meetings senior testers run

#### Test strategy review (quarterly)

Facilitate design session (Doc 11).

#### Bug triage

Weekly, fast, structured.

#### Incident retrospective

Blameless postmortem format.

#### Tech talk

30 min for team on new pattern/tool.

#### 1:1s with mentees

### Meetings to avoid / push back

- "Discuss" meetings (no decision possible)
- Status meetings (use async)
- Your-attendance-not-essential
- Ill-prepared meetings

Respectfully decline:

> "I want to be useful here. Could you share what decision you need from me? If it's status, I can send written update instead."

### Meeting fatigue reality

Senior roles have MANY meetings. Manage it:

- Block 2-3 hours/day as no-meeting (deep work)
- Batch meetings (e.g., all on Tue/Thu)
- Reject or delegate what you can
- Protect 1:1 time with team

---

## 📢 Part 8: Influence Without Authority

### Scenarios

- You want team to adopt new testing tool (no authority to mandate)
- You think architecture decision is wrong (you're not tech lead)
- You want team to care more about quality (can't force)

### Techniques

#### 1. Lead by example

Adopt + demonstrate. Others follow successful examples.

"Let me try this in my work for 2 weeks. If it saves time, we can discuss team adoption."

#### 2. Build coalitions

Find 1-2 allies first. Then broader.
"What do you think about trying X? Want to pilot with me?"

#### 3. Use data

Opinions lose to data.
"I measured our flaky rate. 12% last quarter. Industry best-in-class is <2%. Here's proposal to reduce."

#### 4. Frame in their interests

Not "I want X". But "here's why X helps you too."

"This testing approach reduces your PR review time by 30 min per review."

#### 5. Ask questions

"What would you need to see to adopt this?"
Surfaces objections, shows respect.

#### 6. Patience

Some things take months. Plant seeds, water occasionally, harvest later.

### When you don't win

- Disagree + commit (most times)
- Escalate (rare)
- Accept + move on

Picking battles is a senior skill.

---

## ⚖️ Part 9: Work-Life Balance + Burnout

### Senior role = more demands

- More meetings
- More mentorship
- More context switching
- More visibility = more pressure

Risk of burnout higher at senior.

### Signs of burnout

- Dread of Monday
- Cynicism about work
- Detachment from outcomes
- Physical (sleep, health)
- Mental (anxiety, depression)

### Prevention

#### Boundaries

- Working hours (enforced)
- No Slack after hours (exceptions for genuine emergencies)
- Vacation actually off (not checking email)

#### Prioritization

- Can't do all → pick top 3
- Everything else: document, delegate, or delete

#### Recharge

- Hobbies outside tech
- Exercise
- Relationships
- Sleep (non-negotiable)

### If burning out

- Tell your manager (they'd rather know)
- Take PTO / sabbatical if available
- Therapy helps many
- Job change if role unsustainable

### Senior responsibility: model sustainability

Your team watches you.

- Work weekends → they feel pressure to
- Don't take vacation → they don't
- Email at 11pm → they think it's expected

Lead with good boundaries.

---

## 🧠 Part 10: Emotional Intelligence

### 4 pillars (Goleman)

1. **Self-awareness** — know own emotions
2. **Self-management** — regulate emotions
3. **Social awareness** — read others
4. **Relationship management** — handle interactions

### For senior testers

#### Self-awareness

- What triggers me? (bad code? pushback?)
- What's my stress response? (withdraw / escalate)
- What's my communication blindspot?

Journal weekly. Pattern recognition.

#### Self-management

- Cool down before sensitive emails
- Separate feelings from facts
- Name emotions to contain them

"I'm frustrated because this will mean more work. Let me respond tomorrow."

#### Social awareness

- Watch body language (remote: video helps)
- Notice who's quiet in meeting
- Pick up tension before explosion

#### Relationship management

- Remember personal details (hobbies, family)
- Celebrate others' wins
- Repair after conflict
- Show up consistently

---

## 📣 Part 11: Personal Brand (for senior career)

### Why brand matters

- Recruiters find you (vs you hunting)
- Promotions consider visibility
- Consulting / speaking opportunities
- Community respect

### Build visibility

#### Internal

- Present at team tech talks
- Document + share learnings
- Mentor visibly
- Volunteer for cross-team initiatives

#### External

- Blog (1 post/month sustainable)
- GitHub activity (test your repos, contribute OSS)
- Conference talks (submit 1-2/year)
- Meetup involvement
- LinkedIn thought leadership
- Twitter/X if comfortable

### What to write about

Things you genuinely did:

- "How we migrated from X to Playwright"
- "AI workflow that 3x'd my productivity (with data)"
- "Lessons from debugging 100 flaky tests"
- "Test strategy for my team of 30"

Authentic > performative.

### Frequency

- Blog: monthly minimum
- GitHub: weekly commits
- LinkedIn: weekly posts
- Conference: 1-2/year

Compounds over 2-3 years.

---

## 🎯 Exercises

### 🟢 Basic (Week 21)

1. Write 1 piece of communication per day (PR, bug, docs). Review weekly.
2. 1:1 weekly with 1 junior or peer. 6-week commitment.
3. Comment thoughtfully on 3 PRs (not rubber-stamp).

### 🟡 Intermediate (Week 22)

1. Facilitate 1 meeting (test strategy, triage, retro).
2. Handle 1 conflict using S-B-I framework.
3. Write 1 blog post — technical + honest.

### 🔴 Advanced

1. Start mentorship with 1-2 people. Structured, 3-6 months.
2. Present to 10+ people (team talk, meetup).
3. Run design review session.

### 🏆 Mini project (Month 5 end)

**Task:** Soft skills development portfolio.

Over 1 month:

- 4 blog posts / long-form shares
- 1 formal mentorship started
- 1 presentation delivered
- 1 conflict navigated thoughtfully
- Retro: what worked, what didn't

Reflect in 500-word retrospective.

### 🌟 Stretch goal

Volunteer as ambassador/organizer in automation testing community (MoT, local meetup).

---

## 📚 Resources

### Books

- _Crucial Conversations_ — Patterson et al. — conflict handling
- _The Culture Map_ — Erin Meyer — cross-cultural nuance
- _Radical Candor_ — Kim Scott — feedback culture
- _Never Split the Difference_ — Chris Voss — negotiation
- _The Effective Engineer_ — Edmond Lau — leverage thinking
- _Staff Engineer_ — Will Larson — senior IC path
- _The Manager's Path_ — Camille Fournier — if managing
- _High Output Management_ — Andy Grove — classic management

### Articles / blogs

- Lara Hogan — [larahogan.me](https://larahogan.me/) — management + IC
- Will Larson — [lethain.com](https://lethain.com/)
- Patrick McKenzie — [kalzumeus.com](https://www.kalzumeus.com/)
- Rands — [randsinrepose.com](https://randsinrepose.com/)

### Podcasts

- _Soft Skills Engineering_ — weekly career Q&A
- _Manager Tools_ — practical management
- _HBR IdeaCast_ — Harvard business ideas

### Videos / talks

- Lara Hogan talks on [YouTube](https://www.youtube.com/)
- Tanya Reilly — "Being Glue" (staff engineering)

---

## ✅ Self-check

Can you do, unaided:

- [ ] Write bug report clearly in <3 min
- [ ] Facilitate difficult conversation using S-B-I
- [ ] Mentor 1 person structurally
- [ ] Run a meeting people don't dread
- [ ] Present to stakeholders without panic
- [ ] Handle conflict without damaging relationship
- [ ] Say no constructively
- [ ] Write 1 blog post per month
- [ ] Maintain work-life boundaries

Goal: most yes.

---

## Next

[13 — Career Growth (Senior → Staff) →](./13-career-growth-senior.md) — path forward.
