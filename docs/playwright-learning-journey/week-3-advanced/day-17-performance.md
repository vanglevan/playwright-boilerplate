# Day 17 — Performance Testing

> **Goal:** Đo Core Web Vitals, set budget, fail build nếu regression. Biết khác biệt performance test vs load test.
> **Thời gian:** 2-3 giờ

---

## Prerequisites

- Week 1-2 hoàn thành

---

## 1. Performance test ≠ Load test

| Test type             | Đo gì                                   | Tools                  |
| --------------------- | --------------------------------------- | ---------------------- |
| **Performance (này)** | Single user page load nhanh thế nào     | Playwright, Lighthouse |
| **Load**              | N user đồng thời, system chịu bao nhiêu | k6, JMeter, Gatling    |
| **Stress**            | Giới hạn trước khi break                | k6, Gatling            |

Hôm nay focus performance (frontend).

---

## 2. Core Web Vitals

Google định 3 metrics chính (quan trọng cho SEO):

| Metric                                | Đo                           | Good   | Needs improvement | Poor   |
| ------------------------------------- | ---------------------------- | ------ | ----------------- | ------ |
| **LCP** (Largest Contentful Paint)    | Element lớn nhất render xong | <2.5s  | 2.5-4s            | >4s    |
| **FID** (First Input Delay) → **INP** | Thời gian first interaction  | <100ms | 100-300ms         | >300ms |
| **CLS** (Cumulative Layout Shift)     | UI "nhảy" khi load           | <0.1   | 0.1-0.25          | >0.25  |

**Bonus metrics:**

- **FP** (First Paint) — anything rendered
- **FCP** (First Contentful Paint) — first text/image
- **DOMContentLoaded** — DOM ready
- **load** — all resources loaded
- **TTFB** (Time to First Byte) — server response

---

## 3. Lấy metrics từ Playwright

```typescript
test('home page performance', async ({ page }) => {
  await page.goto('https://playwright.dev');

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    return {
      ttfb: nav.responseStart - nav.requestStart,
      fp: paint.find((p) => p.name === 'first-paint')?.startTime,
      fcp: paint.find((p) => p.name === 'first-contentful-paint')?.startTime,
      domContentLoaded: nav.domContentLoadedEventEnd - nav.fetchStart,
      load: nav.loadEventEnd - nav.fetchStart,
    };
  });

  console.log(metrics);
  expect(metrics.fcp).toBeLessThan(2000);
  expect(metrics.load).toBeLessThan(5000);
});
```

---

## 4. Đo LCP (PerformanceObserver)

LCP continuously update, cần observer:

```typescript
async function measureLCP(page: Page): Promise<number> {
  return page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let lcp = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        lcp = last.startTime;
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });

      // Stop sau 3s idle
      setTimeout(() => {
        observer.disconnect();
        resolve(lcp);
      }, 3000);
    });
  });
}

test('LCP budget', async ({ page }) => {
  await page.goto('/');
  const lcp = await measureLCP(page);
  console.log(`LCP: ${lcp}ms`);
  expect(lcp).toBeLessThan(2500); // Good < 2.5s
});
```

---

## 5. Budget pattern — helper

**`src/helpers/performance.ts`:**

```typescript
import { Page, expect } from '@playwright/test';

export type PerfMetrics = {
  ttfb: number;
  fp: number | undefined;
  fcp: number | undefined;
  dcl: number;
  load: number;
  lcp?: number;
};

export async function collectMetrics(page: Page): Promise<PerfMetrics> {
  // Wait for load complete first
  await page.waitForLoadState('load');

  const basic = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    return {
      ttfb: nav.responseStart - nav.requestStart,
      fp: paint.find((p) => p.name === 'first-paint')?.startTime,
      fcp: paint.find((p) => p.name === 'first-contentful-paint')?.startTime,
      dcl: nav.domContentLoadedEventEnd - nav.fetchStart,
      load: nav.loadEventEnd - nav.fetchStart,
    };
  });

  const lcp = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        resolve(last.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      setTimeout(() => resolve(0), 2000);
    });
  });

  return { ...basic, lcp };
}

export type PerfBudget = Partial<{
  ttfb: number;
  fcp: number;
  dcl: number;
  load: number;
  lcp: number;
}>;

export function assertBudget(metrics: PerfMetrics, budget: PerfBudget): void {
  for (const [key, max] of Object.entries(budget)) {
    const actual = metrics[key as keyof PerfMetrics];
    if (actual !== undefined && max !== undefined) {
      expect(actual, `${key} exceeded budget`).toBeLessThan(max);
    }
  }
}
```

### Sử dụng

```typescript
import { collectMetrics, assertBudget } from '@helpers/performance';

test('home performance budget', async ({ page }) => {
  await page.goto('/');
  const metrics = await collectMetrics(page);
  console.table(metrics);

  assertBudget(metrics, {
    fcp: 2000,
    lcp: 2500,
    load: 5000,
  });
});
```

---

## 6. Network throttling

Simulate user mạng chậm:

```typescript
test('slow 3G performance', async ({ page, browser }) => {
  const context = await browser.newContext();
  const page2 = await context.newPage();
  const cdp = await context.newCDPSession(page2);

  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (1.6 * 1000 * 1000) / 8, // 1.6 Mbps
    uploadThroughput: (750 * 1000) / 8, // 750 Kbps
    latency: 150,
  });

  await page2.goto('/');
  const metrics = await collectMetrics(page2);
  // ...
});
```

---

## 7. CPU throttling

```typescript
const cdp = await context.newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); // 4x slower CPU
```

Kết hợp network + CPU = simulate low-end mobile.

---

## 8. Lighthouse integration

Lighthouse cho kết quả authoritative (Google scoring):

```bash
npm i -D playwright-lighthouse
```

```typescript
import { playAudit } from 'playwright-lighthouse';

test('lighthouse audit', async ({ page, browser }) => {
  await page.goto('/');

  await playAudit({
    page,
    port: 9222,
    thresholds: {
      performance: 80,
      accessibility: 90,
      'best-practices': 80,
      seo: 80,
    },
    reports: {
      formats: { html: true },
      name: 'lighthouse-report',
      directory: 'lighthouse-reports',
    },
  });
});
```

**Alternative:** [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) standalone.

---

## 9. Regression detection

**Vấn đề:** LCP 1200ms OK hôm nay, tuần sau 2400ms vẫn "OK". Thực ra regression 2x.

**Solution:** Track & compare over time.

```typescript
// Lưu results
import * as fs from 'node:fs';

test('track performance over time', async ({ page }) => {
  await page.goto('/');
  const metrics = await collectMetrics(page);

  const historyPath = 'perf-history.json';
  const history = fs.existsSync(historyPath)
    ? JSON.parse(fs.readFileSync(historyPath, 'utf-8'))
    : [];

  history.push({ date: new Date().toISOString(), ...metrics });
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

  // Compare với baseline (avg last 10 runs)
  if (history.length >= 10) {
    const recent = history.slice(-10);
    const avgLcp = recent.reduce((s, r) => s + r.lcp!, 0) / recent.length;
    expect(metrics.lcp).toBeLessThan(avgLcp * 1.2); // tolerance 20%
  }
});
```

**Production:** Push metrics vào DB/Grafana/DataDog cho long-term tracking.

---

## 10. Bài tập

### Bài 1: Basic budget

Viết test đo FCP, LCP, load của 3 trang công khai. Set budget theo "Good" threshold. Chạy.

### Bài 2: Throttle network

So sánh cùng trang với mạng fast vs slow 3G. Ghi metrics, discuss trong NOTES.md.

### Bài 3: Lighthouse audit

Chạy Lighthouse qua playwright-lighthouse. Gentile thresholds. Xem HTML report.

### Bài 4: Regression tracking

Implement tracking file JSON. Chạy 3 lần (giả lập 3 ngày). Test regression detection.

### Bài 5: Bundle size tracking

Đo `Content-Length` của main JS/CSS file:

```typescript
const responses: number[] = [];
page.on('response', async (res) => {
  if (res.url().endsWith('.js')) {
    responses.push(parseInt(res.headers()['content-length'] || '0'));
  }
});
await page.goto('/');
const totalJs = responses.reduce((s, n) => s + n, 0);
expect(totalJs).toBeLessThan(500_000); // 500KB
```

---

## 11. Common Pitfalls

| Vấn đề                        | Fix                                                   |
| ----------------------------- | ----------------------------------------------------- |
| Metrics dao động lớn          | Chạy nhiều lần lấy median, không single run           |
| Local pass, CI fail           | CI hardware khác → set budget sát với CI env          |
| `navigation` entry không có   | Page chưa load; dùng `waitForLoadState("load")` trước |
| LCP = 0                       | Observer chưa fire, tăng timeout                      |
| Lighthouse score khác mỗi run | Normal (±5%), đừng set threshold quá chặt             |

---

## 12. Anti-patterns

- ❌ Performance test trong cùng suite với functional (chậm) → tách project
- ❌ Chỉ đo 1 lần rồi hardcode baseline → env đổi là sai
- ❌ Test trên localhost cho prod budget → khác hoàn toàn
- ❌ Ignore CLS — user cảm nhận được layout nhảy

---

## 13. Monitor production

Performance test CI = 1 điểm dữ liệu. Production monitoring quan trọng hơn:

- **Real User Monitoring (RUM)**: [Vercel Analytics](https://vercel.com/analytics), [DataDog RUM](https://www.datadoghq.com/product/real-user-monitoring/)
- **Synthetic**: [Checkly](https://www.checklyhq.com/), [Pingdom](https://www.pingdom.com/)
- **Chrome UX Report**: Google data thực từ Chrome users

---

## 14. Checklist

- [ ] `collectMetrics()` helper hoạt động
- [ ] Budget test 3 pages
- [ ] Network throttle demo
- [ ] Lighthouse thử ít nhất 1 lần
- [ ] Bài 5: bundle size check
- [ ] Commit: `test: performance budgets`
- [ ] NOTES.md: so sánh metrics local vs CI

---

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Playwright — BrowserContext.newCDPSession](https://playwright.dev/docs/api/class-browsercontext#browser-context-new-cdp-session)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [playwright-lighthouse](https://github.com/abhinaba-ghosh/playwright-lighthouse)
- [WebPageTest](https://www.webpagetest.org/)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [Core Web Vitals explained (Google)](https://www.youtube.com/watch?v=AQqFZ5t8uNc)
- [Performance budgets in CI](https://www.youtube.com/results?search_query=performance+budgets+ci)
- [Lighthouse CI tutorial](https://www.youtube.com/results?search_query=lighthouse+ci+tutorial)
- [Web Performance crash course](https://www.youtube.com/watch?v=RWLzUnESylc)

### 📝 Articles & blogs

- [web.dev performance](https://web.dev/performance/) — Google's hub
- [Addy Osmani — Performance articles](https://addyosmani.com/blog/)
- [The Performance Inequality Gap](https://infrequently.org/2024/01/performance-inequality-gap-2024/) — Alex Russell
- [Chrome UX Report explained](https://web.dev/chrome-ux-report/)
- [Smashing Magazine — Performance](https://www.smashingmagazine.com/category/performance/)

### 🎓 Deep learning

- [High Performance Browser Networking (free book)](https://hpbn.co/) — Ilya Grigorik
- [Responsible JavaScript (A List Apart)](https://alistapart.com/article/responsible-javascript-part-1/)
- [Making things fast (Google)](https://web.dev/fast/)
- [Performance patterns](https://web.dev/patterns/)

### 📖 Books

- _High Performance Browser Networking_ — Ilya Grigorik (free!)
- _Web Performance in Action_ — Jeremy Wagner

### 🐙 Related GitHub repos

- [GoogleChrome/lighthouse](https://github.com/GoogleChrome/lighthouse)
- [GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci)
- [abhinaba-ghosh/playwright-lighthouse](https://github.com/abhinaba-ghosh/playwright-lighthouse)
- [GoogleChrome/web-vitals](https://github.com/GoogleChrome/web-vitals) — JS lib measuring WV

### 🛠️ Tools

- [PageSpeed Insights](https://pagespeed.web.dev/) — Google direct
- [WebPageTest](https://www.webpagetest.org/) — detailed
- [Calibre](https://calibreapp.com/) — monitoring platform
- [Checkly](https://www.checklyhq.com/) — synthetic monitoring
- [SpeedCurve](https://www.speedcurve.com/) — enterprise

### 📊 Cheat sheets

- [Core Web Vitals thresholds](https://web.dev/vitals/)
- [Performance API reference (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [PerformanceObserver API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (measure metrics)

**B1.** Collect basic metrics (TTFB, FP, FCP, load) cho 3 sites. Compare.

**B2.** Single LCP measurement với PerformanceObserver. Add to test.

**B3.** Chạy Lighthouse manually trên site, ghi score performance/a11y/SEO. Note vs your measured metrics — consistent?

### 🟡 Trung bình (throttle + budget)

**M1.** Network throttling:

```typescript
const cdp = await context.newCDPSession(page);
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  downloadThroughput: (1.5 * 1024 * 1024) / 8, // 1.5 Mbps
  uploadThroughput: (750 * 1024) / 8,
  latency: 40,
});
```

Test same page: fast vs 3G vs offline. Compare metrics.

**M2.** CPU throttling:

```typescript
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
```

Combine network + CPU = simulate low-end mobile.

**M3.** Performance budgets per-test:

```typescript
const budgets = {
  home: { lcp: 2000, fcp: 1000, load: 3000 },
  product: { lcp: 2500, fcp: 1500, load: 4000 },
  cart: { lcp: 1500, fcp: 800, load: 2500 },
};

for (const [page, budget] of Object.entries(budgets)) {
  test(`${page} performance`, async ({ page: p }) => {
    await p.goto(`/${page}`);
    const m = await collectMetrics(p);
    assertBudget(m, budget);
  });
}
```

**M4.** Bundle size tracking:

```typescript
const sizes: Record<string, number> = {};
page.on('response', async (res) => {
  const url = res.url();
  if (url.endsWith('.js') || url.endsWith('.css')) {
    sizes[url] = parseInt(res.headers()['content-length'] || '0');
  }
});

await page.goto('/');
const totalJs = Object.entries(sizes)
  .filter(([u]) => u.endsWith('.js'))
  .reduce((s, [_, n]) => s + n, 0);

expect(totalJs).toBeLessThan(500 * 1024); // 500KB
```

### 🔴 Nâng cao (prod monitoring style)

**A1.** Lighthouse CI full setup:

```bash
npm i -D @lhci/cli
```

Config `.lighthouserc.json`, run CI, publish reports.

**A2.** Regression detection — compare vs baseline:

```typescript
const history = JSON.parse(fs.readFileSync('perf-history.json'));
const avg = history.slice(-10).reduce((s, r) => s + r.lcp, 0) / 10;
expect(metrics.lcp).toBeLessThan(avg * 1.2); // 20% tolerance
```

Run daily, track over time.

**A3.** Multi-device profile:

```typescript
const profiles = [
  { name: 'desktop', cpu: 1, network: null },
  { name: 'mid-mobile', cpu: 4, network: '3G' },
  { name: 'low-mobile', cpu: 6, network: 'Slow 3G' },
];

for (const p of profiles) {
  test(`perf on ${p.name}`, async ({ page, browser }) => {
    // apply throttling, measure
  });
}
```

**A4.** Long task detection:

```typescript
const longTasks = await page.evaluate(() => {
  return new Promise((resolve) => {
    const tasks: any[] = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) tasks.push(entry);
    }).observe({ type: 'longtask', buffered: true });
    setTimeout(() => resolve(tasks), 3000);
  });
});

expect(longTasks.length, 'No long tasks >50ms').toBeLessThan(3);
```

### 🏆 Mini challenge (60 phút)

**Task:** Performance budget enforcement CI:

Setup:

- Budgets per route (5 routes)
- Run in CI with consistent env (Docker)
- Track 30 days of metrics
- Fail build if regression >25% vs 7-day moving avg
- Dashboard (optional): push to grafana/free service

Deliverable: working system that prevents perf regressions from merging.

### 🌟 Stretch goal

Read [Alex Russell's performance articles](https://infrequently.org/). Understand why ship speed matters in emerging markets.

---

## Next

[Day 18 — Network Mocking & Routing →](./day-18-network-mocking.md)
