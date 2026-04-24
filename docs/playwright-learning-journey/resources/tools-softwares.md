# Tools & Softwares

Danh sách đầy đủ các tool sẽ cài/dùng trong 30 ngày. Tick khi đã cài.

---

## 1. Core — must-have ngay từ Day 0

| Tool           | Version | Purpose                    | Link                                                    |
| -------------- | ------- | -------------------------- | ------------------------------------------------------- |
| Node.js        | 20+ LTS | Runtime                    | [nodejs.org](https://nodejs.org/)                       |
| nvm            | latest  | Multi Node version manager | [nvm-sh](https://github.com/nvm-sh/nvm)                 |
| Git            | 2.40+   | Version control            | [git-scm.com](https://git-scm.com/)                     |
| VS Code        | latest  | Editor                     | [code.visualstudio.com](https://code.visualstudio.com/) |
| GitHub account | -       | Repo hosting               | [github.com](https://github.com)                        |

---

## 2. VS Code Extensions

| Extension                  | ID                         | Day dùng |
| -------------------------- | -------------------------- | -------- |
| Playwright Test for VSCode | `ms-playwright.playwright` | Day 2    |
| ESLint                     | `dbaeumer.vscode-eslint`   | Day 6    |
| Prettier                   | `esbenp.prettier-vscode`   | Day 6    |
| GitLens                    | `eamodio.gitlens`          | Day 0    |
| Error Lens                 | `usernamehw.errorlens`     | Day 1    |
| Pretty TypeScript Errors   | `yoavbls.pretty-ts-errors` | Day 1    |

**Cài nhanh:**

```bash
code --install-extension ms-playwright.playwright
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension eamodio.gitlens
code --install-extension usernamehw.errorlens
code --install-extension yoavbls.pretty-ts-errors
```

---

## 3. AI Coding Assistants

Chọn **ít nhất 1**:

| Tool            | Pricing               | Strengths               | Link                                                      |
| --------------- | --------------------- | ----------------------- | --------------------------------------------------------- |
| Claude Code CLI | Subscription          | Terminal, agentic, MCP  | [claude.com/claude-code](https://claude.com/claude-code)  |
| Cursor          | Free + Pro            | VS Code fork, inline AI | [cursor.com](https://cursor.com/)                         |
| GitHub Copilot  | $10/mo, free students | VS Code native          | [github.com/copilot](https://github.com/features/copilot) |
| Aider           | Free (bring model)    | CLI, git-first          | [aider.chat](https://aider.chat/)                         |

---

## 4. Browser & DevTools

| Tool                                                                                                              | Purpose                     | Day   |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------- | ----- |
| Chrome                                                                                                            | Primary testing browser     | 1     |
| Firefox Developer Edition                                                                                         | Cross-browser               | 13    |
| Chrome DevTools                                                                                                   | Debug, Network, Performance | 4, 17 |
| [axe DevTools Chrome](https://www.deque.com/axe/devtools/)                                                        | A11y scan                   | 16    |
| [React DevTools](https://chromewebstore.google.com/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) | If testing React app        | -     |

---

## 5. API Testing

| Tool           | Strength                      | Free?       | Link                                                |
| -------------- | ----------------------------- | ----------- | --------------------------------------------------- |
| Bruno          | OSS, git-friendly collections | ✅ Free     | [usebruno.com](https://www.usebruno.com/)           |
| Postman        | Mature, team features         | Free tier   | [postman.com](https://www.postman.com/)             |
| Insomnia       | Lightweight                   | Free + paid | [insomnia.rest](https://insomnia.rest/)             |
| Thunder Client | VS Code extension             | Free + paid | [thunderclient.com](https://www.thunderclient.com/) |
| HTTPie         | CLI                           | ✅ Free     | [httpie.io](https://httpie.io/)                     |

**Khuyến nghị:** Bruno (OSS, collections in git).

---

## 6. Reporting

| Tool            | Day dùng | Install                                                                       |
| --------------- | -------- | ----------------------------------------------------------------------------- |
| Allure CLI      | Day 20   | `brew install allure` (macOS) / [allurereport.org](https://allurereport.org/) |
| Playwright HTML | built-in | -                                                                             |
| Monocart        | Day 20   | `npm i -D monocart-reporter`                                                  |

---

## 7. Container & Infrastructure

| Tool                   | Day         | Why                    |
| ---------------------- | ----------- | ---------------------- | ------------------------------------------------------------------------------------- |
| Docker Desktop         | 21          | Consistent test env    | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| Act (GH Actions local) | 19 optional | Test workflows locally | [github.com/nektos/act](https://github.com/nektos/act)                                |

---

## 8. Recording & Screenshots

| Tool                                       | OS    | Use                        |
| ------------------------------------------ | ----- | -------------------------- |
| Cmd+Shift+5                                | macOS | Built-in screen record     |
| [LICEcap](https://www.cockos.com/licecap/) | All   | GIF recorder               |
| [Kap](https://getkap.co/)                  | macOS | Beautiful video/GIF        |
| [OBS Studio](https://obsproject.com/)      | All   | Full screencast            |
| [Loom](https://www.loom.com/)              | All   | Cloud recording, share URL |

---

## 9. Database clients (nếu cần verify data)

| Tool                                                         | DB support | Cost             |
| ------------------------------------------------------------ | ---------- | ---------------- |
| [DBeaver](https://dbeaver.io/)                               | Universal  | Free             |
| [TablePlus](https://tableplus.com/)                          | Multiple   | Free tier + paid |
| [pgAdmin](https://www.pgadmin.org/)                          | Postgres   | Free             |
| [MySQL Workbench](https://www.mysql.com/products/workbench/) | MySQL      | Free             |

---

## 10. MCP Servers (Day 26)

| Server         | Install                                   | Purpose                |
| -------------- | ----------------------------------------- | ---------------------- |
| playwright-mcp | `npx @playwright/mcp@latest`              | Browser control for AI |
| filesystem     | `@modelcontextprotocol/server-filesystem` | Read/write files       |
| github         | `@modelcontextprotocol/server-github`     | Issues, PRs            |
| slack          | `@modelcontextprotocol/server-slack`      | Team messaging         |
| postgres       | `@modelcontextprotocol/server-postgres`   | DB queries             |

Full list: [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

---

## 11. Advanced (Month 2+)

| Tool                                                                  | Purpose                   | Month |
| --------------------------------------------------------------------- | ------------------------- | ----- |
| [Playwright-BDD](https://github.com/vitalets/playwright-bdd)          | Cucumber BDD              | 2     |
| [k6](https://k6.io/)                                                  | Load testing              | 2-3   |
| [Pact](https://docs.pact.io/)                                         | Contract testing          | 3     |
| [Percy](https://percy.io/) / [Chromatic](https://chromatic.com/)      | Advanced visual           | 2     |
| [Appium](https://appium.io/) / [Maestro](https://maestro.mobile.dev/) | Mobile testing            | 2-3   |
| [Checkly](https://www.checklyhq.com/)                                 | Prod synthetic monitoring | 3     |

---

## 12. Productivity / Nice-to-have

| Tool                                           | Why                     | Link                                          |
| ---------------------------------------------- | ----------------------- | --------------------------------------------- |
| [Raycast](https://www.raycast.com/) (macOS)    | Fast launcher, snippets | [raycast.com](https://www.raycast.com/)       |
| [Rectangle](https://rectangleapp.com/) (macOS) | Window management       | [rectangleapp.com](https://rectangleapp.com/) |
| [GitHub Desktop](https://desktop.github.com/)  | Visual git              | -                                             |
| [Fork](https://git-fork.com/)                  | Git GUI                 | -                                             |
| [Obsidian](https://obsidian.md/)               | NOTES.md on steroids    | -                                             |

---

## 13. Cost summary

**Totally free path** (recommended start):

- Node, Git, VS Code, Playwright, Cursor free tier, Docker Desktop, axe DevTools, Bruno, DBeaver, Allure
- **$0/month**

**Pro path** (>30 days, serious):

- Claude Code subscription: ~$20/mo (API usage) or Pro plan
- Cursor Pro: $20/mo
- Total: ~$40/mo

**Enterprise path** (if employer pays):

- Copilot: $10-20/mo
- Percy/Chromatic: $100+/mo
- Datadog monitoring: $$

Start free. Upgrade khi thấy value.
