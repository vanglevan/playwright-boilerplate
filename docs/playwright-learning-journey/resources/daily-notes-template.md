# Daily Notes Template

Copy mỗi ngày vào `NOTES.md` trong repo học tập.

---

## Template

```markdown
## Day N — [Topic] — YYYY-MM-DD

### ✅ Đã làm

- [x] Task 1
- [x] Task 2
- [ ] Task chưa xong (carry sang ngày mai)

### 💡 Kiến thức mới

-
-
-

### 😖 Khó khăn

-

### 🔧 Giải pháp

-

### 🤖 AI prompts đã dùng

**Prompt hiệu quả:**
```

[paste prompt]

```
→ Output dùng được ~X%, tweaked Y%.

**Prompt KHÔNG hiệu quả:**
```

[paste]

````
→ Lý do: ...

### 📎 Snippets đáng nhớ
```typescript
// Reason: ...
[code]
````

### ❓ Câu hỏi còn

-
-

### 📝 Commit

- [Link]

### ⏱️ Thời gian

- Planned: 3h
- Actual: Xh
- Notes on time: ...

````

---

## Cuối tuần (Day 7, 14, 21, 28): Retrospective

```markdown
## Week N Retrospective — YYYY-MM-DD

### What went well 🎯
-
-
-

### What was hard 😰
-
-

### Biggest "aha" moment 💡
-

### Top 3 learnings this week
1.
2.
3.

### What I'd do differently
-

### Technical debt to address next week
-

### AI workflow adjustments
-

### Energy / motivation check (1-10)
- Monday: X
- Tuesday: X
- ...
- Average: X

### Confidence in applying knowledge (1-10)
- [Topic 1]: X
- [Topic 2]: X

### Questions for next week
-
````

---

## Cuối 30 ngày: Final retrospective

```markdown
## 30-Day Journey Retrospective — YYYY-MM-DD

### By numbers

- Commits: X
- Tests written: X
- Test types: X
- Lines of code: X
- Pages of notes: X
- Blog posts: X

### What I can NOW do (but couldn't before)

1.
2.
3. ...

### Biggest surprise

-

### Hardest week and why

-

### Most valuable hour of the entire journey

-

### Top 5 mistakes (learning opportunities)

1. **Mistake:** ...
   **What I learned:** ...
2. ...

### How AI changed my workflow

- Before: ...
- After: ...
- Productivity impact: estimated +X%
- Risk discovered: ...

### If I redid this journey

- I would keep: ...
- I would change: ...

### What I'm most proud of

-

### Thanks to

- ...

### What's next (30/60/90 days)

- 30 days: ...
- 60 days: ...
- 90 days: ...

### Mood at end

- [ ] Burned out
- [ ] Solid, ready for more
- [ ] On fire, want to do another intensive
```

---

## Tips ghi notes hiệu quả

1. **Ghi ngay, không delay** — memory decay 80% trong 24h
2. **Ngắn gọn, specific** — "flaky fixed by waitForResponse" > "fixed flaky today"
3. **Include code** — future you will thank
4. **Link to external** — PR, doc, issue
5. **Emotional tags** — "frustrated", "confident" — track state
6. **Commit NOTES.md daily** — version history is extra metadata

---

## Anti-pattern

❌ Bullet list vô nghĩa:

```
- Learned testing
- Did some tests
- Tired
```

✅ Concrete:

```
- Learned fixture merging with `mergeTests` — solved duplicate
  fixture problem I had Monday
- Wrote 5 tests for SauceDemo checkout, tagged @critical
- Spent 1h debugging flaky test — turned out to be `waitForTimeout`
  (surprised at myself). Fixed with `toBeVisible`.
- Energy: 6/10 (sluggish Monday)
```

---

## Format suggestions

- **Markdown** — GitHub renders nicely
- **Commit daily** — history is your diary
- **Obsidian users:** link `[[Day 12]]` for graph view
- **Private repo** — if NOTES include personal stuff
