# Day 6 — TypeScript config, ESLint, Prettier, Husky

> **Goal:** Setup code quality gates — bắt bug từ khi gõ, auto-format, commit hook. Đây là khác biệt giữa "chạy được" và "production-ready".
> **Thời gian:** 2 giờ

---

## Prerequisites

- Day 1-5 hoàn thành
- Có ≥5 test file + POM

---

## 1. Tại sao cần tooling

| Không có tooling               | Có tooling                       |
| ------------------------------ | -------------------------------- |
| Bug phát hiện lúc chạy test    | Bug phát hiện lúc gõ code        |
| Code review cãi nhau về format | Prettier tự format, không debate |
| Ai đó quên `await` → flaky     | ESLint báo lỗi, không cho commit |
| Import `@pages/...` trỏ sai    | TS báo đỏ ngay                   |
| Commit message lung tung       | Commitlint enforce convention    |

**Nguyên tắc:** Máy đã check được thì đừng để người check.

---

## 2. TypeScript strict mode

**`tsconfig.json`** (nâng cấp):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,

    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": false,
    "sourceMap": true,

    "baseUrl": ".",
    "paths": {
      "@pages/*": ["src/pages/*"],
      "@components/*": ["src/components/*"],
      "@fixtures/*": ["src/fixtures/*"],
      "@helpers/*": ["src/helpers/*"],
      "@api/*": ["src/api/*"],
      "@data/*": ["src/data/*"],
      "@config/*": ["src/config/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*", "playwright.config.ts"],
  "exclude": ["node_modules", "playwright-report", "test-results"]
}
```

**Các flag quan trọng:**

- `strict: true` — bật **tất cả** strict options (noImplicitAny, strictNullChecks, etc.)
- `noUnusedLocals/Parameters` — xoá import/variable dư thừa
- `noImplicitReturns` — function phải return ở mọi branch

**Thêm script kiểm tra:**

```json
"scripts": {
  "typecheck": "tsc --noEmit"
}
```

Chạy: `npm run typecheck` — không có output = OK.

---

## 3. ESLint 9 — flat config

```bash
npm i -D eslint typescript-eslint eslint-plugin-playwright eslint-config-prettier
```

**`eslint.config.mjs`** (ESLint 9 flat config):

```javascript
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettierConfig from 'eslint-config-prettier';

export default [
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',
    },
  },
  {
    files: ['tests/**', 'src/**'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/expect-expect': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'warn',
    },
  },
  prettierConfig,
  {
    ignores: [
      'node_modules',
      'playwright-report',
      'test-results',
      'allure-results',
      '*.config.{js,mjs,cjs}',
    ],
  },
];
```

**Rules quan trọng nhất cho Playwright:**
| Rule | Catch |
|---|---|
| `no-floating-promises` | Quên `await page.click()` |
| `no-misused-promises` | Pass async function vào non-async context |
| `no-wait-for-timeout` | Ai đó cố lén `waitForTimeout` |
| `no-focused-test` | `test.only()` commit lên main |
| `expect-expect` | Test không có assertion |

**Scripts:**

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix"
```

Chạy `npm run lint` — sửa tất cả warning/error trước khi commit.

---

## 4. Prettier — auto format

```bash
npm i -D prettier
```

**`.prettierrc.json`:**

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**`.prettierignore`:**

```
node_modules
playwright-report
test-results
allure-results
package-lock.json
*.md
```

**Scripts:**

```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

VS Code:

- Setting `editor.formatOnSave: true` — format tự động khi save
- Setting `editor.defaultFormatter: "esbenp.prettier-vscode"`

---

## 5. Husky + lint-staged — pre-commit hook

**Ý tưởng:** Trước khi commit, auto chạy `lint` + `format` + `typecheck` trên file đã đổi.

```bash
npm i -D husky lint-staged
npx husky init
```

**`.husky/pre-commit`:**

```sh
npx lint-staged
npm run typecheck
```

**`package.json`** — thêm:

```json
"lint-staged": {
  "*.{ts,js}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml}": [
    "prettier --write"
  ]
}
```

**Test:**

```bash
# Cố tình để 1 file có lỗi lint
git add .
git commit -m "test"
# → husky sẽ chặn, bảo bạn fix trước
```

---

## 6. Commitlint — convention commit messages

**Conventional Commits** format: `<type>(<scope>): <description>`

- `feat: add login page object`
- `fix: resolve flaky cart test`
- `chore: update deps`
- `docs: readme update`
- `refactor: extract header component`
- `test: add visual snapshot for home`
- `ci: shard workflow`

```bash
npm i -D @commitlint/cli @commitlint/config-conventional
```

**`commitlint.config.cjs`:**

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
};
```

**Husky hook `.husky/commit-msg`:**

```sh
npx commitlint --edit "$1"
```

**Test:**

```bash
git commit -m "update stuff"      # ❌ blocked
git commit -m "chore: update deps" # ✅ OK
```

---

## 7. Package.json — full scripts vocabulary

Cuối ngày 6, `package.json` scripts nên có:

```json
"scripts": {
  "test": "playwright test",
  "test:headed": "playwright test --headed",
  "test:ui": "playwright test --ui",
  "test:debug": "playwright test --debug",
  "test:chromium": "playwright test --project=chromium",
  "test:firefox": "playwright test --project=firefox",
  "report": "playwright show-report",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "typecheck": "tsc --noEmit",
  "check": "npm run typecheck && npm run lint && npm run format:check",
  "prepare": "husky"
}
```

`npm run check` = chạy toàn bộ quality gates. Nên chạy trước mỗi push.

---

## 8. VS Code settings-per-workspace

**`.vscode/settings.json`:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["typescript", "javascript"],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

**`.vscode/extensions.json`** — recommend extensions cho team:

```json
{
  "recommendations": [
    "ms-playwright.playwright",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "yoavbls.pretty-ts-errors"
  ]
}
```

---

## 9. Bài tập

### Bài 1: Setup end-to-end

Thực hiện tất cả 5 mục trên: tsconfig strict, ESLint, Prettier, Husky, Commitlint.

### Bài 2: Break & fix

Cố tình:

1. Thêm `page.waitForTimeout(3000)` trong 1 test → chạy `npm run lint` → phải thấy error
2. Quên `await page.click()` → ESLint phải báo `no-floating-promises`
3. Import không dùng → TS báo `'X' is declared but never used`

### Bài 3: Pre-commit test

```bash
# Tạo commit có lỗi lint
echo "const x:any = 1;" >> src/scratch.ts
git add . && git commit -m "chore: test"
# → Husky phải chặn

# Fix lỗi
npm run lint:fix
git add . && git commit -m "update"       # ❌ commitlint chặn
git commit -m "chore: test scratch file"   # ✅ OK
```

### Bài 4: CI-ready check

Chạy `npm run check` — không có output = pass. Nếu có output, fix hết.

---

## 10. Common Pitfalls

| Vấn đề                                                       | Fix                                                                                            |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | --- | ------ |
| ESLint báo `Parsing error: Cannot read file 'tsconfig.json'` | `parserOptions.project` đúng path chưa? Cần `tsconfigRootDir`                                  |
| ESLint + Prettier cãi nhau (format conflict)                 | Dùng `eslint-config-prettier` ở cuối chain — tắt rule ESLint xung đột                          |
| Husky hook không chạy                                        | `npx husky init` đã chạy? File `.husky/pre-commit` có executable? `chmod +x .husky/pre-commit` |
| `prepare` script fail trên CI                                | CI thường không clone `.git` → husky không cần. Thêm: `"prepare": "husky                       |     | true"` |
| Quá nhiều warning, không biết bắt đầu                        | `npm run lint:fix` — auto fix ~70%                                                             |
| `noUnusedLocals` báo với test fixtures                       | Unused param trong destructure — rename `_param` hoặc disable rule cho file fixtures           |

---

## 11. Checklist

- [ ] `tsconfig.json` strict mode + path aliases, `npm run typecheck` pass
- [ ] `eslint.config.mjs` với Playwright plugin, `npm run lint` pass
- [ ] `.prettierrc.json`, `npm run format:check` pass
- [ ] Husky pre-commit hook chặn bad commit
- [ ] Commitlint enforce conventional commits
- [ ] VS Code format on save hoạt động
- [ ] `npm run check` xanh
- [ ] Commit: `chore: add linting and formatting`
- [ ] NOTES.md: 3 bug ESLint đã bắt cho bạn

---

## Resources

- [TypeScript — Compiler Options](https://www.typescriptlang.org/tsconfig)
- [typescript-eslint rules](https://typescript-eslint.io/rules/)
- [eslint-plugin-playwright rules](https://github.com/playwright-community/eslint-plugin-playwright)
- [Prettier Options](https://prettier.io/docs/en/options)
- [Husky docs](https://typicode.github.io/husky/)
- [Conventional Commits spec](https://www.conventionalcommits.org/)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [ESLint + Prettier setup in 10 minutes](https://www.youtube.com/results?search_query=eslint+prettier+typescript+2026)
- [Husky pre-commit explained (Fireship)](https://www.youtube.com/watch?v=zFhBZGj2PYI)
- [tsconfig strict deep dive](https://www.youtube.com/results?search_query=tsconfig+strict)
- [Conventional Commits in 100 seconds](https://www.youtube.com/results?search_query=conventional+commits)

### 📝 Articles & blogs

- [TypeScript strict mode explained](https://www.typescriptlang.org/tsconfig#strict) — official
- [Matt Pocock — How strict should TS config be?](https://www.totaltypescript.com/)
- [Why we need linters (Kent C. Dodds)](https://kentcdodds.com/blog)
- [The @typescript-eslint/no-floating-promises rule explained](https://typescript-eslint.io/rules/no-floating-promises/)
- [Git hooks without Husky](https://dev.to/search?q=git%20hooks%20modern)

### 🎓 Deep courses

- [Total TypeScript — Configuring TypeScript](https://www.totaltypescript.com/)
- [Awesome ESLint](https://github.com/dustinspecker/awesome-eslint) — curated rules

### 📖 Books / references

- _Clean Code_ — Robert Martin (pairing format rules với team)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) — historical reference

### 🐙 Related GitHub repos

- [typescript-eslint/typescript-eslint](https://github.com/typescript-eslint/typescript-eslint) — rules source
- [playwright-community/eslint-plugin-playwright](https://github.com/playwright-community/eslint-plugin-playwright) — Playwright rules
- [conventional-changelog/commitlint](https://github.com/conventional-changelog/commitlint) — commit enforcement
- [lint-staged/lint-staged](https://github.com/lint-staged/lint-staged) — run tools on staged files
- [Microsoft/TypeScript-Website](https://github.com/microsoft/TypeScript-Website) — see their tsconfig

### 📊 Cheat sheets / quick refs

- [tsconfig explained (interactive)](https://www.typescriptlang.org/tsconfig)
- [ESLint flat config migration guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [Prettier trailing comma explanation](https://prettier.io/docs/en/options#trailing-commas)
- [Conventional Commits cheatsheet](https://www.conventionalcommits.org/en/v1.0.0/)

### 🛠️ Tools

- [ESLint rule search](https://eslint.org/docs/latest/rules/) — 200+ rules
- [typescript-eslint playground](https://typescript-eslint.io/play/)
- [Prettier playground](https://prettier.io/playground/)

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (setup end-to-end)

**B1.** Migrate từ legacy `.eslintrc.json` → ESLint 9 flat config (`eslint.config.mjs`). Nếu bắt đầu fresh ok, this gives migration practice.

**B2.** Thử break mỗi rule và verify detection:

- `no-floating-promises`: thêm `page.click()` không await
- `no-misused-promises`: pass async function vào `forEach`
- `await-thenable`: `await 5`
- Playwright `no-wait-for-timeout`: thêm `waitForTimeout`
- Playwright `no-focused-test`: add `test.only`

Fix từng cái.

**B3.** VS Code integration:

- Thêm `.vscode/settings.json` với format-on-save + ESLint auto-fix
- Verify save file → tự format + lint-fix

**B4.** Pre-commit hook test:

```bash
# Cố tình break lint
echo 'const x: any = 1' > src/scratch.ts
git add src/scratch.ts
git commit -m "test"       # ❌ lint fail
# Fix
npm run lint:fix
git add src/scratch.ts
git commit -m "bad message"  # ❌ commitlint fail
git commit -m "chore: scratch test"  # ✅
```

### 🟡 Trung bình (customize team-ready)

**M1.** Custom ESLint rule overrides — team may want:

```typescript
// eslint.config.mjs
{
  rules: {
    "@typescript-eslint/no-explicit-any": "error",     // strict no any
    "@typescript-eslint/consistent-type-imports": "warn",
    "playwright/no-conditional-in-test": "warn",       // conditional = smell
    "playwright/no-focused-test": "error",
    "playwright/no-skipped-test": "warn",
  }
}
```

Apply, fix new warnings.

**M2.** File-specific rule override:

```typescript
{
  files: ["tests/**/*.spec.ts"],
  rules: {
    // Test files can have longer functions
    "max-lines-per-function": "off",
  },
}
```

Apply. Verify different rules per folder.

**M3.** Prettier customization — discuss & set team style:

```json
{
  "singleQuote": false, // "" vs ''
  "printWidth": 100, // line width
  "trailingComma": "all" // trailing comma in last item
}
```

**M4.** Husky với multiple hooks:

- `pre-commit`: lint-staged
- `commit-msg`: commitlint
- `pre-push`: typecheck + smoke test (`npm test -- --grep @smoke`)

Set up. Verify pre-push blocks if smoke tests fail.

### 🔴 Nâng cao (CI integration)

**A1.** ESLint with TypeScript project references — handle monorepo:

```typescript
parserOptions: {
  project: ["./tsconfig.json", "./packages/*/tsconfig.json"],
}
```

Practice nếu có monorepo, skip nếu single repo.

**A2.** Custom ESLint rule — viết 1 rule đơn giản:

```javascript
// eslint-local-rules/no-real-credentials.js
module.exports = {
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === 'string' && /real.*@.*company\.com/.test(node.value)) {
          context.report({ node, message: 'Real credentials detected!' });
        }
      },
    };
  },
};
```

Register trong config. Test: thêm string match pattern → rule catches.

**A3.** CI fail-fast:

```yaml
# .github/workflows/lint.yml
name: Lint
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run check # typecheck + lint + format:check
```

**A4.** Editor config — `.editorconfig` cho consistency across IDEs:

```ini
root = true
[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

### 🏆 Mini challenge (45 phút)

**Task:** "Quality Gate" — tạo full quality enforcement pipeline.

Build:

1. `npm run check` = typecheck + lint + format:check + smoke test
2. Pre-commit: lint-staged + typecheck (staged files only)
3. Pre-push: `npm run check`
4. Commit-msg: commitlint
5. CI workflow: run `npm run check` + full test

Constraints:

- `npm run check` phải chạy <30s locally
- Pre-commit phải <10s (dùng lint-staged incremental)
- CI chạy <3 phút

Measure & optimize. Note timings trong NOTES.md.

### 🌟 Stretch goal

Contribute 1 rule improvement to [eslint-plugin-playwright](https://github.com/playwright-community/eslint-plugin-playwright) — read issues, find easy one.

---

## Next

[Day 7 — Tổng kết tuần 1 + Mini project →](./day-07-review.md)
