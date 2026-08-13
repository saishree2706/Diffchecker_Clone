# DiffChecker Clone

A fast, clean, and feature-rich text diff tool — built with React, TypeScript, and Vite.

---

## Features

### Split & Unified Views
Compare text side-by-side in **Split View** or follow the flow in **Unified View** — switch instantly from the toolbar.

### Inline Highlighting
Modified lines don't just show up red/green — character-level and word-level highlights pinpoint exactly what changed within a line.

### Hunk Navigation
Jump between changes with **Previous / Next** buttons or use `Alt + ↑` / `Alt + ↓` keyboard shortcuts. A live counter (e.g. `2 / 5`) keeps you oriented.

### Merge Controls
Accept changes hunk-by-hunk using the arrow buttons in the gutter, or merge everything at once with **← All** / **→ All**. The diff recomputes live after every merge.

### Collapse Unchanged Lines
Hide the noise — unchanged lines collapse automatically, showing just the context around each change (like GitHub's diff view).

### Export & Copy
- Download a self-contained **HTML report** you can open anywhere
- Copy the diff to clipboard as a standard **unified patch** with `+` / `−` prefixes

### Diff Options
- **Ignore Whitespace** — strip leading/trailing whitespace before comparing
- **Ignore Case** — case-insensitive comparison while preserving original display

### Diff Stats Bar
At-a-glance counts for added, removed, modified, and unchanged lines — plus total hunk count.

### Swap Panels
One click to swap Original ↔ Changed without retyping anything.

### Dark Mode
Light and dark themes with automatic OS preference detection. Toggle anytime with the Moon / Sun button in the header.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 (dark mode via class) |
| Diff Engine | jsdiff v7 |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```
src/
├── components/       # SplitView, UnifiedView, Toolbar, Header, DiffStats
├── hooks/            # useDiff, useTheme
├── lib/              # differ, merger, exporter
├── types/            # TypeScript interfaces
└── config.ts         # Central app configuration
```

---

> Always open to new features — feel free to suggest or contribute ideas!
