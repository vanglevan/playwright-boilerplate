# 10 — Advanced Testing Topics (Technical Depth)

> Beyond Playwright E2E. 6 domains every senior tester should have working knowledge in.
> Master 1-2 deeply (specialization), have Working level in rest.

---

## 🎯 Scope

This doc covers 6 areas. Each treated in sufficient depth for you to:

- Explain to a junior
- Pass an interview question
- Set up basic implementation
- Know when to bring in specialist

**Goal:** Competent across breadth, specialist in 1-2 depth areas.

### The 6 areas

1. Performance Testing
2. Security Testing
3. Mobile Testing
4. Contract Testing
5. Chaos Engineering
6. Observability & SRE for QA

---

## ⚡ Part 1: Performance Testing

### The landscape

| Type                     | Goal                      | Tools                  |
| ------------------------ | ------------------------- | ---------------------- |
| **Frontend performance** | Page load speed (LCP/FCP) | Lighthouse, Playwright |
| **Load testing**         | System under normal load  | k6, JMeter             |
| **Stress testing**       | Find breaking point       | k6, Gatling            |
| **Soak testing**         | Sustained load (hours)    | k6, custom             |
| **Spike testing**        | Sudden load               | k6                     |
| **Volume testing**       | Large data sets           | Custom                 |

### Frontend performance (covered in bootcamp Day 17)

Quick recap: Core Web Vitals (LCP, CLS, INP), Lighthouse, budgets.

### Load testing with k6 (the main focus)

#### Why k6

- JavaScript syntax (familiar)
- Scriptable, version-controllable
- Rich ecosystem (Grafana, Cloud)
- Free + open source (Grafana Labs)

#### Install

```bash
# macOS
brew install k6

# Linux
sudo apt install k6

# Docker
docker pull grafana/k6
```

#### First test

```javascript
// smoke-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1, // 1 virtual user
  duration: '30s',
};

export default function () {
  const res = http.get('https://your-app.com/api/users');

  check(res, {
    'status 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

Run:

```bash
k6 run smoke-test.js
```

#### Scenarios

**Smoke (minimal load):**

```javascript
export const options = { vus: 1, duration: '30s' };
```

**Load (normal traffic):**

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // ramp up to 100
    { duration: '5m', target: 100 }, // sustain
    { duration: '2m', target: 0 }, // ramp down
  ],
};
```

**Stress (find breakpoint):**

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '2m', target: 400 },
    { duration: '2m', target: 800 }, // likely breaks here
    { duration: '2m', target: 0 },
  ],
};
```

**Spike (sudden burst):**

```javascript
export const options = {
  stages: [
    { duration: '10s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '10s', target: 1400 }, // spike
    { duration: '3m', target: 1400 },
    { duration: '10s', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '10s', target: 0 },
  ],
};
```

#### Assertions (thresholds)

```javascript
export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'], // less than 1% errors
    http_req_duration: ['p(95)<500'], // 95% requests < 500ms
    http_req_duration: ['p(99)<1000'], // 99% < 1s
  },
};
```

If exceeded → test fails (good for CI).

#### Integration with CI

```yaml
# .github/workflows/load-test.yml
on:
  schedule:
    - cron: '0 2 * * 0' # Sunday 2 AM
jobs:
  load:
    steps:
      - uses: grafana/k6-action@v0.3.0
        with:
          filename: tests/load/main.js
```

#### Reading results

Key metrics:

- `http_reqs` — total requests
- `http_req_duration` — latency (p95, p99)
- `http_req_failed` — error rate
- `vus` — peak concurrent users
- `iteration_duration` — full scenario time

### Alternatives

- **Gatling** — Scala/Java-based, enterprise pedigree
- **JMeter** — GUI, mature, Java
- **Locust** — Python, simple
- **Artillery** — Node.js, lightweight

### When performance testing matters

- Before major launch (validate capacity)
- After architectural change (DB, caching)
- Baseline regression (nightly trends)
- Capacity planning (growth projections)

### Senior-level performance thinking

- Understand percentiles (p50 vs p99 matters)
- Distinguish cold vs warm cache
- Factor in network/geography
- Synthetic vs real-user monitoring
- Capacity math: 100 req/s = how many users?

---

## 🔒 Part 2: Security Testing

### Scope for automation testers

You're not a pentester, but you:

- Add automated security checks in CI
- Understand OWASP Top 10 at basic level
- Know when to escalate to security team
- Avoid introducing security issues in test code

### OWASP Top 10 (2021, still foundational 2026)

1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Identification/Authentication Failures
8. Software/Data Integrity Failures
9. Security Logging/Monitoring Failures
10. Server-Side Request Forgery

Also: OWASP LLM Top 10 (new, for AI apps).

### Tools for automation testers

#### OWASP ZAP (Zed Attack Proxy)

Free, open-source web app security scanner.

```bash
# Install
brew install zaproxy  # macOS

# CLI scan
zap-cli quick-scan --self-contained https://your-app.com

# Or as Docker
docker run -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable zap-baseline.py \
  -t https://your-app.com \
  -r zap-report.html
```

Baseline scan = quick, safe for staging.

#### Burp Suite (Community)

- GUI-based
- Proxy + scanner
- More powerful than ZAP
- Learning curve steeper

#### npm audit / Snyk / Dependabot

Dependency vulnerability scanning.

```bash
npm audit                # built-in
npm audit fix            # auto-fix where possible

# Or Snyk:
snyk test
```

Integrate in CI → fail build on high/critical.

#### Semgrep

Code-level security patterns.

```bash
semgrep --config=auto .
```

Finds issues like:

- Hardcoded secrets
- SQL injection patterns
- Unsafe deserialization

### Security in Playwright tests

#### Don't do

```typescript
// DANGER: credentials in test
await page.fill('#pass', 'RealAdminPassword!');
```

#### Do

```typescript
// env vars, not hardcoded
await page.fill('#pass', env.TEST_USER_PASSWORD);
```

#### Test security behaviors

```typescript
test('SQL injection attempt rejected', async ({ request }) => {
  const res = await request.post('/api/search', {
    data: { query: "'; DROP TABLE users; --" },
  });
  expect(res.status()).not.toBe(500); // app handles gracefully
  expect(res.status()).toBeLessThan(500);
});

test('rate limiting works', async ({ request }) => {
  const responses = await Promise.all(Array.from({ length: 100 }, () => request.get('/api/users')));
  const rateLimited = responses.filter((r) => r.status() === 429);
  expect(rateLimited.length).toBeGreaterThan(0);
});

test('auth required for sensitive endpoint', async ({ request }) => {
  const res = await request.get('/api/admin/users');
  expect(res.status()).toBe(401);
});
```

### CI security pipeline

```yaml
jobs:
  security:
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high # dependency scan
      - uses: github/super-linter@v6 # code scanning
      - uses: zaproxy/action-baseline@v0.12.0 # DAST
        with:
          target: 'https://staging.app.com'
```

### What to learn deeper

If pursuing security track:

- [PortSwigger Web Security Academy](https://portswigger.net/web-security) — free, excellent
- OWASP Top 10 documentation
- OSCP / eWPT certifications (professional)
- [HackTheBox](https://www.hackthebox.com/), [TryHackMe](https://tryhackme.com/)

### Ethical boundaries

- Only test systems you own or have written permission
- Report found vulnerabilities via responsible disclosure
- Don't exfiltrate data
- Don't persistent attacks

---

## 📱 Part 3: Mobile Testing

### Market reality 2026

- 60%+ traffic is mobile
- Many companies have mobile apps
- Automation tester valuable = cross-platform

### Tools landscape

| Tool           | Platform      | Language    | Strengths                    |
| -------------- | ------------- | ----------- | ---------------------------- |
| **Appium**     | iOS + Android | Any         | Industry standard, mature    |
| **Maestro**    | iOS + Android | YAML/JS     | Simple, fast setup           |
| **Detox**      | React Native  | JS          | Native for RN apps           |
| **Espresso**   | Android       | Java/Kotlin | Native Android               |
| **XCUITest**   | iOS           | Swift/ObjC  | Native iOS                   |
| **Playwright** | Web on mobile | JS/TS       | If web app + mobile viewport |

### Start with Maestro (easiest)

#### Install

```bash
brew install maestro
```

#### First test

`flow.yaml`:

```yaml
appId: com.example.myapp
---
- launchApp
- tapOn: 'Sign In'
- inputText: 'user@test.com'
- tapOn:
    id: 'password'
- inputText: 'password123'
- tapOn: 'Submit'
- assertVisible: 'Welcome'
```

Run:

```bash
maestro test flow.yaml
```

#### Strengths

- YAML = readable by non-devs
- Fast setup
- Good docs
- Cloud runs available

#### Limitations

- Less flexible than Appium
- Smaller ecosystem

### Appium (when flexibility needed)

#### Setup (heavier)

```bash
npm install -g appium
appium driver install xcuitest       # iOS
appium driver install uiautomator2   # Android
```

#### Example test (with Playwright-like syntax via WebdriverIO)

```typescript
import { remote } from 'webdriverio';

const driver = await remote({
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:app': '/path/to/app.apk',
  },
});

await driver.$('~loginButton').click();
await driver.$('~username').setValue('test');
// ...
await driver.deleteSession();
```

More verbose. More powerful.

### Cross-platform strategies

```
               Mobile Web App     Hybrid App      Native App
               (React/Vue web)    (Cordova/Ionic) (Swift/Kotlin)
───────────────────────────────────────────────────────────────
Playwright       ✅ Perfect         ⚠️  Sometimes    ❌ No
Maestro          ❌                 ✅               ✅
Appium           ⚠️                 ✅               ✅ (heavyweight)
Detox            ❌                 React Native only  ❌
```

### Mobile testing challenges

- **Device fragmentation** — 1000s of Android variants
- **OS version diversity** — iOS 14-18, Android 9-15
- **Network conditions** — 3G/4G/5G/wifi/offline
- **Battery/performance**
- **Permissions (cam, mic, location)**
- **App store constraints**

### Device labs

- **BrowserStack** — cloud devices
- **Sauce Labs** — cloud devices + tools
- **AWS Device Farm** — cloud
- **LambdaTest** — cloud
- **Self-hosted** — rack of devices (enterprise)

### Senior mobile thinking

- Smoke test on real devices (catches many bugs)
- Automate happy paths only, manual exploratory for rest
- Visual regression important (layout on different screens)
- Accessibility on mobile matters (VoiceOver, TalkBack)
- Performance on low-end devices

---

## 🤝 Part 4: Contract Testing

### The problem it solves

Frontend expects API X format. Backend changes API. Silent breakage.

E2E catches this, but slow and brittle. **Contract testing catches earlier.**

### Consumer-Driven Contract Testing (Pact)

```
Consumer (frontend)                Producer (backend API)
     │                                     │
     │ defines expected contract           │
     │────────────────────────────────────▶│
     │                                     │ verifies implementation
     │                                     │ matches contract
     │                                     │
     │ ✅ or ❌                              │
     ◀─────────────────────────────────────│
```

### Workflow

1. **Consumer writes "contract tests"** — describes expected API
2. **Pact file generated** — contract artifact
3. **Producer runs "verification"** — "can we satisfy this contract?"
4. **Fail fast** if producer breaks contract

### When worth it

- Multiple teams (frontend + backend separate)
- Microservices (N × M communication)
- API evolution (need guardrails)

### When overkill

- Single monorepo, 1 team
- Tight integration tested via E2E already
- Simple apps with static APIs

### Example (Pact JS)

**Consumer side (frontend tests):**

```typescript
import { PactV3, MatchersV3 } from '@pact-foundation/pact';

const { eachLike, like } = MatchersV3;

const provider = new PactV3({
  consumer: 'frontend',
  provider: 'api',
});

provider
  .given('user 1 exists')
  .uponReceiving('a request for user 1')
  .withRequest({
    method: 'GET',
    path: '/api/users/1',
  })
  .willRespondWith({
    status: 200,
    body: {
      id: like(1),
      name: like('Alice'),
      email: like('alice@test.com'),
    },
  });

await provider.executeTest(async (mockServer) => {
  // Call your frontend code that hits mockServer
  const response = await fetchUser(1);
  expect(response.name).toBe('Alice');
});
```

**Producer side (backend verification):**

```typescript
import { Verifier } from '@pact-foundation/pact';

const opts = {
  providerBaseUrl: 'http://localhost:3001',
  pactUrls: ['./pacts/frontend-api.json'],
  providerStatesSetupUrl: 'http://localhost:3001/_pact/setup-state',
};

await new Verifier(opts).verifyProvider();
```

### Pact Broker

Central hub for sharing contracts between consumer + producer.

Hosted options: Pactflow, self-hosted Broker.

### Learn more

- [Pact docs](https://docs.pact.io/)
- Martin Fowler's [Consumer-Driven Contracts article](https://martinfowler.com/articles/consumerDrivenContracts.html)
- [Pactflow blog](https://pactflow.io/blog/)

---

## 🐵 Part 5: Chaos Engineering

### The principle

"**Break things on purpose to learn how they fail.**" — Originated at Netflix.

### For most testers

You won't run production chaos. But:

- Understand concept
- Run basic experiments in staging
- Advocate for resilience patterns

### Basic chaos experiments

#### Experiment 1: Network partition

Simulate backend API unavailable.

```bash
# Block API at OS level
sudo pfctl -E  # macOS
# Add rule: block outbound to api-host
```

Observe: does UI handle gracefully?

#### Experiment 2: Latency injection

Add artificial latency.

```bash
# macOS
sudo dnctl pipe 1 config delay 2000
sudo pfctl -f - <<'EOF'
dummynet out from any to any port 443 pipe 1
EOF
```

2-second delay on HTTPS. Observe app.

#### Experiment 3: CPU/memory pressure

Use tools like `stress`:

```bash
stress --cpu 8 --timeout 60s
```

Observe performance degradation.

#### In Playwright: route abort

```typescript
await page.route('**/api/**', (route) => route.abort());
```

Test UI gracefully handles API failures.

### Tools (if going deeper)

- [Chaos Monkey (Netflix)](https://github.com/Netflix/chaosmonkey)
- [Gremlin](https://www.gremlin.com/) — commercial platform
- [Litmus](https://litmuschaos.io/) — Kubernetes-native
- [Chaos Toolkit](https://chaostoolkit.org/)

### Principles

1. Start small (staging, off-hours)
2. Hypothesis-driven (predict outcome, test)
3. Monitor + rollback (observability crucial)
4. Gradually increase scope
5. Share findings team-wide

### Related: game days

Scheduled fake-disaster simulation. Team practices response.

Good for:

- Incident response training
- Finding undocumented dependencies
- Runbook validation

---

## 📊 Part 6: Observability & SRE for QA

### SRE mindset for testers

SRE (Site Reliability Engineering) treats reliability as a product.

Key concepts testers should know:

- **SLI** (Service Level Indicator) — metric (e.g., latency)
- **SLO** (Service Level Objective) — target (e.g., 99.9% < 500ms)
- **SLA** (Service Level Agreement) — commitment (contractual)
- **Error budget** — (100 - SLO%) = allowed error rate

### Why testers care

- Tests should contribute to SLI data
- Test flakiness IS an error budget concern
- Observability in tests helps debug production

### The 3 pillars of observability

1. **Logs** — discrete events, searchable
2. **Metrics** — numeric measurements over time
3. **Traces** — request flow through distributed system

### OpenTelemetry (OTel)

Industry standard for observability data.

- Vendor-neutral
- Instruments code → ships to any backend (Datadog, Honeycomb, New Relic, Grafana)

Install for Node:

```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```

Example:

```typescript
// trace.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const sdk = new NodeSDK({
  traceExporter: /* your exporter */,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

### Observability for test suites

- Measure: test duration, pass rate, flaky rate
- Track: SLO (e.g., "smoke tests <5 min, <1% flaky")
- Alert: if SLO violated (Slack ping)

Tool: any metrics platform (Datadog, Grafana, Honeycomb).

### Example: test metrics dashboard

```
Dashboard: Test Suite Health
─────────────────────────────────────
Smoke tests     | 47/47  | 100%  | 2min
Regression      | 348/350 | 99.4% | 12min
Flaky rate      | 1.2%           | ⬇
Avg PR feedback | 11 min         | ⬆

Error budget (smoke 99.5% target):
  Used: 0.5% → 50% of budget used this month
```

### Distributed tracing for E2E

When testing distributed system, trace the full request:

```typescript
test("order processed end-to-end", async ({ page, request }) => {
  const traceId = generateTraceId();

  await request.post("/api/orders", {
    headers: { "X-Trace-Id": traceId },
    data: { ... },
  });

  // Later, query tracing system to see full path
  const spans = await getTrace(traceId);
  expect(spans).toHaveLength(5);  // 5 services involved
  expect(spans.some(s => s.service === "billing")).toBe(true);
});
```

### Reading

- [Google SRE Book](https://sre.google/sre-book/table-of-contents/) — free, canonical
- [OpenTelemetry docs](https://opentelemetry.io/docs/)
- [Honeycomb blog](https://www.honeycomb.io/blog/) — observability thought leadership
- _Observability Engineering_ — Majors, Fong-Jones, Miranda

---

## 🔀 Integration: how 6 areas fit

```
                    Quality of Software
                            │
      ┌─────────────────────┼─────────────────────┐
      │                     │                     │
   Functional           Non-functional        Operational
   (Does it work?)      (How well?)          (Will it keep?)
      │                     │                     │
   E2E, API,          Performance,         Observability,
   Unit                Security,            Chaos
                       Mobile,
                       Contract
```

**Testers ship quality across all 3.** Functional is base. Non-functional + operational = seniority signal.

---

## 🎯 Specialization guide

### Should you specialize?

- Month 4-6 of roadmap: try all briefly
- Month 7+: pick 1 to go deep
- Still have broad working knowledge

### Specialization paths

1. **Performance Specialist** — k6, JMeter, infrastructure. High demand for SaaS.
2. **Security QA** — OWASP, pen testing. Great for FinTech, HealthTech.
3. **Mobile Specialist** — Appium, device farms. Mobile-first companies.
4. **Test Architect** — Strategy, system design. Senior individual contributor ceiling.
5. **AI Testing** — LLM apps, agents, prompt injection. Cutting-edge 2026.
6. **Reliability/SRE** — Observability, chaos. Overlaps with SRE.

### How to pick

- What's market demand in your city/remote?
- What are you naturally curious about?
- What's your company's need?
- Which compensates best?

Combination approach: broad senior + 1 specialty = most valuable.

---

## 📚 Resources

### Performance

- [k6 docs](https://k6.io/docs/) + [k6 university](https://k6.io/learn/)
- [JMeter docs](https://jmeter.apache.org/)
- [Web Performance Calendar](https://calendar.perfplanet.com/)

### Security

- [OWASP](https://owasp.org/)
- [PortSwigger Academy (free)](https://portswigger.net/web-security)
- [HackTheBox](https://www.hackthebox.com/)
- [TryHackMe](https://tryhackme.com/)

### Mobile

- [Appium docs](https://appium.io/)
- [Maestro docs](https://maestro.mobile.dev/)
- [Detox docs](https://wix.github.io/Detox/)

### Contract

- [Pact docs](https://docs.pact.io/)
- [Pactflow blog](https://pactflow.io/blog/)
- Martin Fowler's articles

### Chaos

- [Principles of Chaos Engineering](https://principlesofchaos.org/)
- [Awesome Chaos Engineering](https://github.com/dastergon/awesome-chaos-engineering)

### SRE/Observability

- [Google SRE Book](https://sre.google/sre-book/)
- [OpenTelemetry](https://opentelemetry.io/)
- [Honeycomb blog](https://www.honeycomb.io/blog/)

---

## 🎯 Exercises

### Performance

- 🟢 Run k6 smoke test against public API
- 🟡 Load test with 100 VUs, analyze p95/p99
- 🔴 Find breakpoint via stress test, graph throughput vs errors
- 🏆 Integrate into CI with thresholds

### Security

- 🟢 Run `npm audit` + fix high/critical
- 🟡 ZAP baseline scan on a demo app
- 🔴 Write 10 Playwright tests covering OWASP categories
- 🏆 Integrate security scan in CI, block on critical

### Mobile

- 🟢 Install Maestro, run on 1 app
- 🟡 Write 5 tests for demo mobile app
- 🔴 Appium setup with real device farm
- 🏆 CI with BrowserStack integration

### Contract

- 🟢 Read Pact docs, understand flow
- 🟡 Set up Pact consumer + producer tests
- 🔴 Integrate Pact Broker (hosted)
- 🏆 Real multi-team contract workflow

### Chaos

- 🟢 Route abort test in Playwright
- 🟡 Latency injection via OS tools
- 🔴 Structured chaos experiment (hypothesis → test → result)
- 🏆 Team game day organization

### SRE

- 🟢 Read 3 chapters of Google SRE book
- 🟡 Define SLOs for your test suite
- 🔴 Instrument Playwright with OpenTelemetry
- 🏆 Full observability dashboard for test suite

---

## ✅ Self-check

After Month 4:

- [ ] Can run k6 load test confidently
- [ ] Understand OWASP Top 10, can integrate ZAP scan
- [ ] Set up mobile test (Maestro or Appium)
- [ ] Explain Pact workflow
- [ ] Defined SLOs for at least 1 system
- [ ] Know which specialization interests you

---

## Next

[11 — Test Strategy & Architecture →](./11-test-strategy-architecture.md) — think at team/org level.
