# Day 1 — JavaScript/TypeScript cơ bản cho Tester

> **Goal:** Nắm đủ JS/TS để đọc và viết Playwright tests. Không phải thành JS dev.
> **Thời gian:** 3-4 giờ (1h lý thuyết + 2h thực hành + 30' ghi chú)

---

## Prerequisites

- Đã hoàn thành [00-preparation](../00-preparation.md)
- Terminal mở sẵn, VS Code mở ở folder `playwright-learning-journey`

---

## Mục lục

1. [Tại sao TypeScript chứ không phải JavaScript](#1-tại-sao-typescript)
2. [Biến và kiểu dữ liệu](#2-biến-và-kiểu-dữ-liệu)
3. [Functions & Arrow functions](#3-functions--arrow-functions)
4. [Objects, Arrays, Destructuring](#4-objects-arrays-destructuring)
5. [Async/await — phần quan trọng nhất](#5-asyncawait)
6. [Types, Interfaces, Generics](#6-types-interfaces-generics)
7. [Bài tập thực hành](#7-bài-tập)
8. [Common Pitfalls](#8-common-pitfalls)
9. [Checklist](#9-checklist)

---

## 1. Tại sao TypeScript

- **Playwright official dùng TS.** 95% tutorial dùng TS.
- **Bắt bug lúc gõ**, không cần chạy mới biết sai. Quan trọng với test — test bug sẽ mask app bug.
- **Autocomplete siêu mạnh trong VS Code** — gõ `page.` thấy tất cả method.
- **Refactor an toàn**: rename 1 chỗ, TS báo hết các nơi khác cần sửa.

TS = JS + kiểu dữ liệu (types). Mọi code JS đều là TS hợp lệ. Học TS không phải học lại JS.

---

## 2. Biến và kiểu dữ liệu

```typescript
// KHÔNG dùng var (đã lỗi thời)
const name: string = 'Alice'; // không thay đổi được
let age: number = 30; // có thể gán lại
age = 31; // OK
// name = "Bob";                       ❌ Cannot assign to 'name'

// Primitive types
const isActive: boolean = true;
const items: number[] = [1, 2, 3];
const nothing: null = null;
const notSet: undefined = undefined;

// Type inference — TS tự đoán type, không cần khai báo
const city = 'Hà Nội'; // TS biết đây là string
const port = 3000; // TS biết đây là number
```

**Rule thumb:**

- Default dùng `const`
- Chỉ dùng `let` khi phải reassign
- Tên biến camelCase: `userName`, `apiBaseUrl`

---

## 3. Functions & Arrow functions

```typescript
// Function declaration cổ điển
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function (ngắn gọn, phổ biến trong Playwright)
const multiply = (a: number, b: number): number => a * b;

// Multi-line arrow
const greet = (name: string): string => {
  const message = `Hello, ${name}!`;
  return message;
};

// Default parameter
const log = (message: string, level: string = 'info'): void => {
  console.log(`[${level}] ${message}`);
};

// Template literal (backtick + ${})
const url = `https://api.com/users/${userId}`;
```

**Playwright hay dùng cú pháp này:**

```typescript
test('login works', async ({ page }) => {
  // ^^^^^^^^^^^^        ^^^^^^^^^^^^
  // arrow function      destructured parameter
});
```

---

## 4. Objects, Arrays, Destructuring

```typescript
// Object literal
const user = {
  id: 1,
  name: 'Alice',
  email: 'alice@test.com',
};

// Access property
console.log(user.name);
console.log(user['name']); // tương đương, ít dùng

// Array methods quan trọng cho test
const numbers = [1, 2, 3, 4, 5];

numbers.map((n) => n * 2); // [2,4,6,8,10] — transform
numbers.filter((n) => n > 2); // [3,4,5] — lọc
numbers.find((n) => n === 3); // 3 — tìm 1 cái đầu khớp
numbers.forEach((n) => console.log(n)); // loop, không trả value
numbers.some((n) => n > 4); // true — có ít nhất 1
numbers.every((n) => n > 0); // true — tất cả đều

// Destructuring — CỰC QUAN TRỌNG với Playwright
const { name, email } = user;
// giờ `name`, `email` là biến rời

// Array destructuring
const [first, second] = numbers;
// first = 1, second = 2

// Rest operator
const { id, ...rest } = user;
// rest = { name, email }
```

---

## 5. Async/await

**Đây là phần quan trọng nhất.** Playwright là async toàn bộ.

### Vấn đề: code async không đợi nhau

```typescript
// SAI
const data = fetch('https://api.com');
console.log(data); // → Promise { <pending> }, không phải data thực
```

### Giải pháp: async/await

```typescript
// ĐÚNG
async function getUser() {
  const response = await fetch('https://api.com/user');
  const data = await response.json();
  console.log(data); // → { id: 1, name: "Alice" }
  return data;
}
```

**Rule bất di bất dịch:**

- Function dùng `await` → phải khai báo `async`
- Await 1 Promise → giá trị "unwrapped" ra
- Không `await` → bạn có Promise (chưa xong), không phải value

### Pattern Playwright

```typescript
test('user can login', async ({ page }) => {
  await page.goto('https://app.com/login');
  await page.getByLabel('Email').fill('alice@test.com');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/.*dashboard/);
});
```

**Mọi dòng `page.*` đều phải `await`.** Quên `await` là bug phổ biến số 1 của newbie.

### Lỗi kinh điển: floating promise

```typescript
// ❌ BUG — test pass trong khi chưa thực sự click!
test('click button', async ({ page }) => {
  page.getByRole('button').click(); // thiếu await
  await expect(page).toHaveURL(/.*success/);
});
```

ESLint plugin `@typescript-eslint/no-floating-promises` sẽ bắt lỗi này → Day 6 ta config.

---

## 6. Types, Interfaces, Generics

### Type alias vs Interface

```typescript
// Type alias
type User = {
  id: number;
  name: string;
  email?: string; // optional
};

// Interface (về cơ bản giống nhau cho object)
interface Product {
  sku: string;
  price: number;
}

// Khi nào dùng gì?
// - Type: union, primitive alias, tính toán phức tạp
// - Interface: object shape, class implement, dễ extend
// - Nhớ: team consistency > preference
```

### Union & Literal types

```typescript
type Status = 'pending' | 'active' | 'closed';
let userStatus: Status = 'active';
// userStatus = "foo";  ❌ not allowed

type Id = number | string;
const id1: Id = 42;
const id2: Id = 'abc';
```

### Generics (đừng sợ)

```typescript
// T = type "placeholder", bạn truyền khi gọi
function first<T>(items: T[]): T | undefined {
  return items[0];
}

first<number>([1, 2, 3]); // T = number
first<string>(['a', 'b']); // T = string
first([1, 2, 3]); // TS tự infer, không cần <number>
```

Playwright có dùng generics nhưng bạn chủ yếu chỉ cần **đọc hiểu**, không cần viết phức tạp.

---

## 7. Bài tập

### Bài 1: Scratch file

Tạo `scratch.ts`:

```typescript
type User = {
  id: number;
  name: string;
  email: string;
};

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  if (!response.ok) {
    throw new Error(`Failed: ${response.status}`);
  }
  const data = await response.json();
  return data as User;
}

async function main() {
  const user = await fetchUser(1);
  console.log(`User: ${user.name} (${user.email})`);
}

main();
```

Chạy: `npx tsx scratch.ts` (cài `tsx` nếu chưa: `npm i -g tsx`)

### Bài 2: Filter logic

Viết function `getActiveAdultUsers(users)`:

- Input: array của `{ id, name, age, isActive }`
- Output: array chỉ gồm user `age >= 18` và `isActive === true`

### Bài 3: Async chain

Viết function async gọi API sau theo thứ tự, log kết quả mỗi bước:

1. GET `/users/1`
2. Dùng `user.id` → GET `/posts?userId={id}`
3. Count số posts

### Bài 4: Đọc code Playwright

Mở bất cứ snippet Playwright nào trên [playwright.dev/docs/intro](https://playwright.dev/docs/intro). Identify:

- Chỗ nào là async function?
- Chỗ nào là arrow function?
- Chỗ nào là destructuring?
- Chỗ nào là template literal?

---

## 8. Common Pitfalls

| Lỗi                               | Triệu chứng                         | Fix                                                        |
| --------------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| Quên `await` trước `page.click()` | Test pass trong khi chưa click      | Luôn `await`; bật ESLint rule `no-floating-promises`       |
| Dùng `var` thay `const/let`       | Hoisting bug kỳ lạ                  | Chỉ dùng `const`/`let`                                     |
| `==` thay vì `===`                | `0 == ""` → true                    | Luôn `===` (strict equality)                               |
| Không khai báo return type        | Function trả sai kiểu, TS không báo | Cho Public API: luôn khai báo `: ReturnType`               |
| `any` khắp nơi                    | Mất lợi ích TS                      | Dùng `unknown` nếu thật sự không biết; `any` chỉ khi debug |
| Mix `Promise.then()` và `await`   | Code khó đọc                        | Chọn 1 style, ưu tiên `async/await`                        |

---

## 9. Checklist

- [ ] Hiểu difference `const` vs `let` (và tại sao không dùng `var`)
- [ ] Viết được arrow function với typed parameters
- [ ] Giải thích `async/await` cho chính mình: _"await unwraps a promise"_
- [ ] Biết destructuring object `{ page }` là gì
- [ ] Làm xong bài 1 + bài 2 + bài 3
- [ ] Đọc hiểu 1 spec file trên docs Playwright
- [ ] Commit: `chore: setup learning workspace` + push
- [ ] Ghi NOTES.md: 3 điều học được, 1 điều chưa hiểu

---

## Resources

- [JavaScript.info — JavaScript Fundamentals](https://javascript.info/first-steps) — 5 chương đầu
- [TypeScript in 5 minutes](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [MDN — async/await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Introducing)
- Video (30'): [TypeScript in 100 Seconds](https://www.youtube.com/watch?v=zQnBQ4tB3ZA) (Fireship)
- Cheat sheet: [typescriptlang.org/cheatsheets](https://www.typescriptlang.org/cheatsheets)

---

## 📚 Tài liệu mở rộng — Đào sâu chủ đề

### 🎥 Video tutorials

- [TypeScript Crash Course (Traversy Media)](https://www.youtube.com/watch?v=BCg4U1FzODs) — 1h, đi từ JS → TS natural
- [TypeScript Tutorial for Beginners (Programming with Mosh)](https://www.youtube.com/watch?v=d56mG7DezGs) — 1h, chi tiết cho beginner
- [Net Ninja — TypeScript Tutorial playlist](https://www.youtube.com/playlist?list=PL4cUxeGkcC9gUgr39Q_yD6v-bSyMwKPUI) — 22 videos, free
- [Fireship — 10 TS tricks every dev should know](https://www.youtube.com/watch?v=hBk4nV7q6-w) — short tips
- [Jack Herrington — Type Narrowing deep dive](https://www.youtube.com/@jherr) — channel cho TS advanced

### 📝 Articles & blogs

- [Matt Pocock — Total TypeScript Tips](https://www.totaltypescript.com/tips) — top-notch, free
- [Kent C. Dodds — How to solve an impossible problem with TypeScript](https://kentcdodds.com/blog)
- [DevHints — TypeScript cheatsheet](https://devhints.io/typescript)
- [Overreacted — Algebraic Effects for the Rest of Us](https://overreacted.io/algebraic-effects-for-the-rest-of-us/) — mental model cho async (advanced)
- [JavaScript: The Right Way](https://jstherightway.org/) — curated best practices

### 🎓 Free courses

- [Total TypeScript — TypeScript Essentials](https://www.totaltypescript.com/books/total-typescript-essentials) — free e-book, Matt Pocock
- [freeCodeCamp — JavaScript Algorithms and Data Structures](https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/) — fundamentals practice
- [Execute Program — TypeScript basics](https://www.executeprogram.com/) — spaced repetition (free preview)
- [TypeScript Handbook (official)](https://www.typescriptlang.org/docs/handbook/intro.html) — authoritative

### 📖 Books (free online)

- [Eloquent JavaScript (3rd ed)](https://eloquentjavascript.net/) — Marijn Haverbeke, free
- [You Don't Know JS Yet](https://github.com/getify/You-Dont-Know-JS) — Kyle Simpson, free on GitHub
- [Exploring JS](https://exploringjs.com/) — Axel Rauschmayer, comprehensive
- [JavaScript: The Good Parts](https://www.goodreads.com/book/show/2998152) — Douglas Crockford (paid, classic)

### 🐙 Related GitHub repos

- [type-challenges/type-challenges](https://github.com/type-challenges/type-challenges) — TS puzzles, cực vui, đi từ easy → extreme
- [trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) — algorithms with TS
- [goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices) — production Node.js patterns
- [microsoft/TypeScript-Node-Starter](https://github.com/microsoft/TypeScript-Node-Starter) — reference project
- [sindresorhus/type-fest](https://github.com/sindresorhus/type-fest) — collection of advanced types để đọc

### 📊 Cheat sheets / quick refs

- [TypeScript Cheat Sheets (official)](https://www.typescriptlang.org/cheatsheets) — types/interfaces/generics/classes
- [OverAPI JavaScript](https://overapi.com/javascript)
- [Async/Await Cheatsheet](https://gist.github.com/jesperorb/6ca596217c8343c8b21fa9e3621aa0e5)
- [MDN — Array methods reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)

### 🛠️ Interactive playgrounds

- [TypeScript Playground](https://www.typescriptlang.org/play) — gõ TS thấy JS output + errors ngay
- [CodeSandbox](https://codesandbox.io/) — mini projects online
- [TypeHero](https://typehero.dev/) — TS challenges có gamification

---

## 🎯 Thực hành mở rộng — Challenge exercises

### 🟢 Cơ bản (củng cố nền tảng)

**B1.** Viết 5 utility functions với full types:

- `capitalize(s: string): string` — "hello" → "Hello"
- `clamp(n: number, min: number, max: number): number`
- `unique<T>(arr: T[]): T[]` — dùng Set
- `pick<T, K>(obj: T, keys: K[])` — lấy subset object (hint: `Pick<T, K>`)
- `sleep(ms: number): Promise<void>`

**B2.** Convert 3 JS snippet sau sang TS strict:

```javascript
function formatPrice(p) {
  return '$' + p.toFixed(2);
}
const users = [{ name: 'Alice' }, { name: 'Bob' }].map((u) => u.name.toUpperCase());
async function getData() {
  const r = await fetch('...');
  return r.json();
}
```

**B3.** Đọc 5 snippet Playwright trong docs, identify (không chạy):

- Arrow functions
- Destructuring
- Async/await
- Template literal
- Type annotations

### 🟡 Trung bình (mở rộng hiểu biết)

**M1.** Build typed CRUD helpers cho REST API (không có UI):

```typescript
type User = { id: number; name: string; email: string };

// Implement với type-safe signatures:
async function listUsers(): Promise<User[]>;
async function getUser(id: number): Promise<User | null>;
async function createUser(data: Omit<User, 'id'>): Promise<User>;
async function updateUser(id: number, patch: Partial<User>): Promise<User>;
async function deleteUser(id: number): Promise<boolean>;
```

Dùng `fetch` + https://jsonplaceholder.typicode.com. Handle 4xx/5xx.

**M2.** Error handling:

- Viết `tryOrDefault<T>(fn: () => Promise<T>, fallback: T): Promise<T>`
- Khi `fn` throw → return `fallback`
- Khi OK → return value từ `fn`

**M3.** Array method combo — data transformation:
Cho array orders `[{id, userId, total, status}, ...]`:

- Filter `status === "paid"`
- Group by `userId` (hint: `reduce` to `Record<number, Order[]>`)
- Sum total per user
- Return top 3 users by total
- Viết signature types đầy đủ, zero `any`

**M4.** Async patterns:

- `Promise.all` — fetch 3 URLs song song, return `[r1, r2, r3]`
- `Promise.allSettled` — fetch 3 URLs, return status cho từng cái (OK để fail 1-2)
- So sánh behavior khác nhau

### 🔴 Nâng cao (push boundaries)

**A1.** Discriminated union cho API result:

```typescript
type Result<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

async function safeFetch<T>(url: string): Promise<Result<T>>;
```

Test với endpoint thật. Dùng `if (result.ok)` → TypeScript narrow type tự động.

**A2.** Generic constraint:

```typescript
// Chỉ cho phép keys là string-valued properties
function joinByKey<T, K extends keyof T>(items: T[], key: K, sep: string): string;
```

Example:

```typescript
joinByKey([{ name: 'A' }, { name: 'B' }], 'name', ', '); // "A, B"
joinByKey([{ age: 1 }], 'age', ','); // ❌ TS error: age không phải string
```

**A3.** Type-safe event emitter:

```typescript
type Events = {
  login: { userId: string };
  logout: { reason: string };
};

class Emitter<E> {
  on<K extends keyof E>(event: K, cb: (data: E[K]) => void): void;
  emit<K extends keyof E>(event: K, data: E[K]): void;
}

const e = new Emitter<Events>();
e.on('login', (d) => d.userId); // ✅ d typed
e.emit('logout', { reason: 'timeout' }); // ✅
e.emit('login', { foo: 'bar' }); // ❌ TS error
```

### 🏆 Mini challenge (45-60 phút)

**Build `fetchHelper.ts`** — production-quality fetch wrapper:

Requirements:

- `fetchHelper<T>(url, options)` trả `Result<T>` (discriminated union)
- Timeout support (default 10s, configurable)
- Retry với exponential backoff (default 2 retries)
- Log mỗi attempt
- Full TypeScript strict mode, zero `any`
- Validate output với schema function caller truyền vào

Template:

```typescript
type Result<T> =
  | { ok: true; data: T; attempts: number }
  | { ok: false; error: string; attempts: number };

type Options<T> = {
  timeout?: number;
  retries?: number;
  validate?: (data: unknown) => data is T;
};

export async function fetchHelper<T>(url: string, opts: Options<T> = {}): Promise<Result<T>> {
  // TODO
}
```

Test trên reqres.in. Kết thúc: paste code lên Claude Code hỏi review → apply 2 suggestions.

### 🌟 Stretch goal (nếu xong hết và còn energy)

**TypeHero challenges** — solve 5 easy challenges tại [typehero.dev](https://typehero.dev/). Không xem solution, bạn phải struggle.

---

## Next

[Day 2 — Dựng Playwright project from zero →](./day-02-playwright-setup.md)
