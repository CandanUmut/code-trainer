# Python Interview Trainer

A single-page web app that teaches Python through a **teach → worked example → exercise → check** loop. Runs Python in the browser via [Pyodide](https://pyodide.org/) — no backend needed.

**Live:** https://candanumut.github.io/code-trainer/

## Features

- **40+ problems** across 6 categories, ranging from easy to hard
- **Two-pane layout**: concept + worked example on the left, exercise + editor on the right
- **In-browser Python execution** with test results, diffs on failure, and timeout detection
- **Progressive hints** revealed one at a time
- **Reference solutions** revealed after passing all tests (or on request)
- **Progress tracking** in localStorage — no login required
- **Fully offline** after initial Pyodide load (~8MB from CDN)

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173/code-trainer/

## Build & Deploy

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

**GitHub Pages:** Push to `main` — the `deploy.yml` workflow builds and deploys automatically.

Before deploying, update `vite.config.ts`:
```ts
const REPO_NAME = 'your-repo-name';  // change this
```

And `package.json`:
```json
"homepage": "https://yourusername.github.io/your-repo-name"
```

## Adding Problems

See [src/content/README.md](src/content/README.md) for the full guide.

Short version:
1. Copy `src/content/problems/_template.ts.example` to the right category folder
2. Fill in all fields
3. `npm run dev` — it appears automatically

## Tech Stack

- **Vite + React + TypeScript** — static, no SSR
- **Pyodide** (CDN) — Python 3.11 in WebAssembly, loaded lazily on first use
- **Monaco Editor** — the same editor as VS Code, Python syntax mode
- **Tailwind CSS v4** — minimal styling
- **react-router-dom** with HashRouter — compatible with GitHub Pages
- **react-markdown + rehype-highlight** — rendered markdown with syntax highlighting

## Project Structure

```
src/
  App.tsx                    # Router setup
  main.tsx
  types.ts                   # Problem, TestCase, etc.
  routes/
    Home.tsx                 # Category grid + progress
    Problem.tsx              # Two-pane problem view
    Browse.tsx               # Filterable problem list
  components/
    ConceptPane.tsx          # Concept + worked example
    ExercisePane.tsx         # Editor + run + results
    TestResults.tsx          # Pass/fail per test case
    HintDrawer.tsx           # Progressive hints
    ProgressBar.tsx
  pyodide/
    runner.ts                # Pyodide loader + test runner
  content/
    index.ts                 # Glob loader
    problems/                # 40 problems, 6 categories
  state/
    progress.ts              # localStorage-backed progress
  lib/
    markdown.tsx             # react-markdown wrapper
    diff.ts                  # expected/actual formatting
```
