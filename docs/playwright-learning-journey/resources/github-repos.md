# GitHub Repos đáng tham khảo

Danh sách repos để **đọc code** học pattern, không phải clone-and-copy. Mỗi repo kèm **lý do đáng xem** và **what to look at**.

---

## 1. Official Playwright

### [microsoft/playwright](https://github.com/microsoft/playwright)

**Why:** Source chính. Issues là treasure trove — "how do I..." + maintainer answers.

**What to look at:**

- `tests/` — Playwright tests own test themselves (meta, educational)
- [Issues labeled "good first issue"](https://github.com/microsoft/playwright/labels/good%20first%20issue) — OSS contribution
- Recent PRs — see how features ship

### [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)

**Why:** Combine Playwright + AI agents.

**What to look at:**

- Tool definitions (what actions AI can do)
- Real-world integration patterns

---

## 2. Boilerplates / Templates

### [mxschmitt/awesome-playwright](https://github.com/mxschmitt/awesome-playwright)

**Why:** Curated list of plugins, guides, examples, boilerplates.

**What to look at:**

- "Boilerplates" section — multi patterns
- "Plugins" — community tools

### [playwright-community/eslint-plugin-playwright](https://github.com/playwright-community/eslint-plugin-playwright)

**Why:** Lint rules — bạn đã dùng trong Day 6. Đọc rule source → hiểu anti-pattern phổ biến.

**What to look at:**

- [src/rules/](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/src/rules) — each file explains WHY rule exists

### [ryanrosello-og/playwright-typescript-boilerplate](https://github.com/ryanrosello-og/playwright-typescript-boilerplate)

**Why:** Reference TS structure.

**Caution:** Use for inspiration, don't clone — bạn học bằng cách tự gõ.

---

## 3. Real production repos (public)

### [storybookjs/storybook](https://github.com/storybookjs/storybook/tree/next/code/e2e-tests)

**Why:** How large OSS project does Playwright E2E.

**What to look at:**

- `code/e2e-tests/`
- Fixtures, helpers
- Parallel execution at scale

### [vercel/next.js](https://github.com/vercel/next.js/tree/canary/test)

**Why:** E2E test at enormous scale (Next.js).

**What to look at:**

- `test/` structure
- How they organize per-feature tests

---

## 4. AI + Testing

### [anthropics/courses](https://github.com/anthropics/courses)

**Why:** Official Anthropic prompt engineering tutorials.

**What to complete:**

- Prompt engineering interactive tutorial
- Tool use chapter
- Real-world workflows examples

### [anthropics/claude-code](https://github.com/anthropics/claude-code) (if public/docs)

**Why:** Claude Code docs + examples.

### [anthropics/anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook)

**Why:** Recipes — tool use, multi-agent, extraction.

### [browser-use/browser-use](https://github.com/browser-use/browser-use)

**Why:** Alternative to Playwright MCP — AI browser agent framework.

**What to look at:**

- Python implementation — same concepts as MCP nhưng framework khác

### [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

**Why:** Reference MCP server implementations.

**What to look at:**

- `src/filesystem/` — how tool handlers work
- `src/github/` — OAuth + API integration pattern

---

## 5. Code quality references

### [typescript-eslint/typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)

**Why:** Rules source — see "no-floating-promises" implementation to understand why it matters.

### [zod-js/zod](https://github.com/colinhacks/zod)

**Why:** Validation library you'll use.

**What to look at:**

- Examples in README
- TypeScript tricks in source

---

## 6. Testing philosophy authors

### [kentcdodds/kentcdodds.com](https://github.com/kentcdodds/kentcdodds.com)

**Why:** Testing Trophy author. Articles source.

### [testing-library/testing-library-docs](https://github.com/testing-library/testing-library-docs)

**Why:** Playwright `getByRole` priority philosophy comes from here.

---

## 7. Specific patterns

### API testing patterns

**Look for:** Any repo with `tests/api/` folder using Playwright. Good examples:

- [cypress-io/cypress-example-recipes](https://github.com/cypress-io/cypress-example-recipes) (Cypress but concepts transfer)
- Your own repo after Day 12 ✓

### Visual regression

**Look for:** `*.visual.spec.ts` patterns.

- [storybookjs/storybook](https://github.com/storybookjs/storybook) has Chromatic integration examples

### Performance

- [GoogleChromeLabs/lighthouse](https://github.com/GoogleChrome/lighthouse) — how Lighthouse itself tests
- [WebdevJohn/lighthouse-playwright-tutorial](https://github.com/search?q=lighthouse+playwright) — various tutorials

---

## 8. Vietnamese community repos

Search GitHub for repos có README tiếng Việt:

```
https://github.com/search?q=playwright+automation+vietnam
```

Follow Vietnamese automation testers on GitHub — copy pattern quality của họ.

---

## 9. How to read a repo effectively

### Don't

- Clone and run immediately
- Skim README then close
- Copy files into your project

### Do

1. **Read README first** — understand intent
2. **Browse file tree** — note structure
3. **Open 1 test file** — read line-by-line
4. **Open 1 page object** — compare with yours
5. **Check git log** — see how code evolved
6. **Note 3 things you'll apply** to your repo

**Time-box:** 30 min/repo max. Move on.

---

## 10. Contribute back

After Month 2-3:

- Browse [Playwright good first issues](https://github.com/microsoft/playwright/labels/good%20first%20issue)
- Contribute to [awesome-playwright](https://github.com/mxschmitt/awesome-playwright)
- Share your boilerplate (it's yours by Day 30)

**Contribution counts:**

- 1 OSS PR in your GitHub profile = instant credibility
- Career boost: "Playwright contributor" in LinkedIn

---

## 11. Starred list for fast reference

Star these cuối Day 30 để check lại:

- [ ] [microsoft/playwright](https://github.com/microsoft/playwright)
- [ ] [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- [ ] [mxschmitt/awesome-playwright](https://github.com/mxschmitt/awesome-playwright)
- [ ] [anthropics/courses](https://github.com/anthropics/courses)
- [ ] [anthropics/anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook)
- [ ] [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
- [ ] [playwright-community/eslint-plugin-playwright](https://github.com/playwright-community/eslint-plugin-playwright)
- [ ] [colinhacks/zod](https://github.com/colinhacks/zod)

Public starred list = also portfolio signal.
