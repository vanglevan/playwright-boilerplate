# Day 0 — Chuẩn bị môi trường

> **Thời gian:** 1-2 giờ
> **Mục đích:** Cài sẵn tools để ngày 1 vào việc ngay, không bị phân tâm bởi issue setup

---

## 1. Hardware & OS

- **macOS / Windows 10+ / Linux (Ubuntu 20+)** đều OK
- RAM tối thiểu **8GB** (khuyến nghị 16GB — chạy 4 browser parallel)
- Ổ đĩa còn trống **≥10GB** (Playwright browsers ~2GB, node_modules, Docker images)

---

## 2. Cài đặt Tools (Must-have)

### 2.1 Node.js 20+ LTS

```bash
# Qua nvm (khuyến nghị, để quản nhiều version)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Cài Node 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node -v   # phải >= v20.x
npm -v    # phải >= 10.x
```

Windows: tải từ [nodejs.org](https://nodejs.org/) hoặc dùng [nvm-windows](https://github.com/coreybutler/nvm-windows).

### 2.2 Git

```bash
# macOS
brew install git

# Ubuntu
sudo apt install git

# Verify
git --version
```

Config:

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git config --global init.defaultBranch main
```

### 2.3 VS Code + Extensions

Tải: [code.visualstudio.com](https://code.visualstudio.com/)

**Extensions must-have:**
| Extension | ID |
|---|---|
| Playwright Test for VSCode | `ms-playwright.playwright` |
| ESLint | `dbaeumer.vscode-eslint` |
| Prettier | `esbenp.prettier-vscode` |
| GitLens | `eamodio.gitlens` |
| Error Lens | `usernamehw.errorlens` |
| Pretty TypeScript Errors | `yoavbls.pretty-ts-errors` |

Cài nhanh qua terminal:

```bash
code --install-extension ms-playwright.playwright
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension eamodio.gitlens
code --install-extension usernamehw.errorlens
code --install-extension yoavbls.pretty-ts-errors
```

**VS Code settings khuyến nghị** (`Cmd+,` → tìm "settings.json"):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### 2.4 GitHub account

- Tạo tài khoản tại [github.com](https://github.com) nếu chưa có
- Setup SSH key để push không cần password:

```bash
ssh-keygen -t ed25519 -C "your@email.com"
cat ~/.ssh/id_ed25519.pub
# Copy, paste vào github.com/settings/keys
```

### 2.5 AI coding assistant

Chọn **ít nhất 1**:

- [Claude Code CLI](https://claude.com/claude-code) — bạn đang dùng, terminal-based
- [Cursor](https://cursor.com/) — VS Code fork AI-native (free tier đủ dùng)
- [GitHub Copilot](https://github.com/features/copilot) — $10/tháng, hoặc free cho student

---

## 3. Tools Nice-to-have (cài khi cần)

| Tool                          | Khi nào cài | Link                                                          |
| ----------------------------- | ----------- | ------------------------------------------------------------- |
| Docker Desktop                | Day 21      | [docker.com](https://www.docker.com/products/docker-desktop/) |
| Bruno (API client OSS)        | Day 12      | [usebruno.com](https://www.usebruno.com/)                     |
| Allure CLI                    | Day 20      | `brew install allure`                                         |
| Postman (nếu chưa dùng Bruno) | Day 12      | [postman.com](https://www.postman.com/)                       |
| axe DevTools Chrome ext       | Day 16      | [deque.com/axe](https://www.deque.com/axe/devtools/)          |

---

## 4. Tạo repo học tập

```bash
# Trên GitHub, tạo repo mới: playwright-learning-journey (public)
# Clone về local
cd ~/Projects   # hoặc folder bạn thích
git clone git@github.com:YOUR_USERNAME/playwright-learning-journey.git
cd playwright-learning-journey

# Tạo file cơ bản
echo "# Playwright Learning Journey\n\n30 days journey from manual to automation tester." > README.md
echo "node_modules/\n.DS_Store\n.env\n.env.*\n!.env.example\nplaywright-report/\ntest-results/\nallure-results/" > .gitignore

git add .
git commit -m "chore: initial commit"
git push
```

Từ ngày 1 trở đi, **mọi code đều vào repo này**.

---

## 5. Verify setup (làm trước khi ngủ)

Chạy các lệnh sau, tất cả phải thành công:

```bash
node -v          # v20.x.x
npm -v           # 10.x.x
git --version    # git version 2.x
code --version   # bản VS Code
```

Test AI assistant:

- Claude Code: gõ `claude` trong terminal
- Cursor: mở app, login
- Copilot: mở VS Code, icon Copilot hiện ở status bar

---

## 6. Tạo NOTES.md + AI_WORKFLOW.md

Trong repo `playwright-learning-journey`, tạo 2 file này — sẽ fill dần mỗi ngày:

**NOTES.md** (journal học tập):

```markdown
# Playwright Learning Journey — Notes

## Day 0 — 2026-04-23

- Setup done: Node, VS Code, Claude Code
- Repo created: playwright-learning-journey
```

**AI_WORKFLOW.md** (style guide dùng AI):

```markdown
# My AI Workflow for Automation Testing

## Rules

1. Never paste real credentials into AI prompts
2. Always review AI-generated code line-by-line before commit
3. Prompt pattern: Context + Task + Constraints + Example

## Good prompt examples

- (fill later)

## Bad prompt examples (avoid)

- "write test for login page" (too vague)
```

---

## 7. Checklist trước Day 1

- [ ] Node 20+ đã cài, verify bằng `node -v`
- [ ] VS Code + 6 extensions đã cài
- [ ] Git + GitHub account + SSH key
- [ ] AI assistant hoạt động (gõ thử 1 câu)
- [ ] Repo `playwright-learning-journey` tạo trên GitHub + clone về local
- [ ] `NOTES.md` và `AI_WORKFLOW.md` đã tạo
- [ ] Commit đầu tiên push thành công
- [ ] Bookmarked: [playwright.dev](https://playwright.dev/), [typescriptlang.org](https://www.typescriptlang.org/)

---

## Common issues ngày 0

| Issue                                      | Fix                                                          |
| ------------------------------------------ | ------------------------------------------------------------ |
| `nvm: command not found`                   | Restart terminal; thêm `source ~/.nvm/nvm.sh` vào `~/.zshrc` |
| `npm ERR! EACCES`                          | Đừng dùng `sudo npm`; dùng nvm để Node ở user dir            |
| Git push bị hỏi password                   | Chưa setup SSH key → quay lại mục 2.4                        |
| VS Code mở không thấy Playwright extension | Restart VS Code; Cmd+Shift+P → "Reload Window"               |

---

Xong chuẩn bị. Sẵn sàng cho [Day 1 — JavaScript/TypeScript cơ bản cho Tester](./week-1-foundation/day-01-js-ts-basics.md).
