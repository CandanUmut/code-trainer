# Python Interview Trainer

A single-page web app that teaches Python as a **curriculum**: short lessons
introduce each concept in small, low-stakes steps, then interview-style problems
let you apply it. Runs Python in the browser via [Pyodide](https://pyodide.org/)
— no backend needed.

**Live:** https://candanumut.github.io/code-trainer/

## The learning model

A category is structured as **Lessons (in order) → Problems (apply what you learned)**.

- A **Lesson** teaches one concept (e.g. "List comprehensions", "The hashmap
  pattern"). It is a sequence of small interactions — explanations,
  predict-the-output, fill-in-the-blank, write-one-line, multiple-choice, and a
  couple of small write-a-function drills. ~10–20 minutes each.
- A **Problem** is a full interview-style question with a step-by-step worked
  example and a similar exercise to solve.

Browse the curriculum tree at `/browse`; lessons and problems show their state
(⚪ not started, 🔵 in progress, ✅ completed, ❌ stuck).

## Features

- **Lessons** with seven step types, graded by running real Python in the browser
- **Curriculum tree** Browse page — lessons first, then the problems they unlock
- **Step-by-step worked examples** — the solution is walked line-by-line with
  "why" explanations and variable-state panels
- **Glossary** — 50+ precise terms; write `{{term:slug}}` in any lesson markdown
  to get an inline tooltip; full glossary page at `/glossary`
- **40+ problems** across 6 categories, easy to hard
- **In-browser Python execution** with test results, diffs, and timeout detection
- **Progress tracking** in localStorage — no login required

## Content status

| Category | Lessons | Problems |
|----------|---------|----------|
| arrays-strings-hashmaps | ✅ 8 lessons | ✅ 8 problems (worked examples migrated to steppers) |
| pythonic-idioms | ✅ 8 lessons | ✅ 8 problems (steppers) |
| trees-graphs-dp | ⛔ not yet — problem-only | ✅ 8 problems (steppers) |
| oop-typing | ⛔ not yet — problem-only | ✅ 6 problems (steppers) |
| concurrency | ⛔ not yet — problem-only | ✅ 5 problems (steppers) |
| system-python | ⛔ not yet — problem-only | ✅ 5 problems (steppers) |

All 40 problems have had their worked examples migrated to the line-by-line
stepper. **16 of the planned 42 lessons are authored** (arrays-strings-hashmaps
and pythonic-idioms, 8 each). The remaining four categories are still
problem-only and show "Lessons not authored yet" in the Browse tree — they are
the next pass, in the order trees-graphs-dp → oop-typing → concurrency →
system-python.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173/code-trainer/

## Build & Deploy

```bash
npm run build      # tsc -b && vite build → dist/
npm run preview    # preview the production build
npm run typecheck  # tsc --noEmit
```

**GitHub Pages:** push to `main` — the `deploy.yml` workflow builds and deploys.

## Authoring content

### Adding a Problem

Copy `src/content/problems/_template.ts.example` into a category folder and fill
it in. It appears automatically (Vite glob import).

### Authoring a Lesson

Create `src/content/lessons/<category>/NN-slug.ts` exporting a `Lesson`
(see the `Lesson` type in `src/types.ts`). It auto-registers via glob import.
Use the existing arrays-strings-hashmaps lessons as the quality reference.

A `Lesson` has `id`, `category`, `title`, `summary`, `estimatedMinutes`,
`order` (its place in the category sequence), `prerequisites`, `glossary`,
`objectives`, `steps`, and `appliesTo` (problem IDs surfaced as "now try these").

`steps` is an array of 8–15 steps. Each step is one of:

| `kind` | What the learner does |
|--------|----------------------|
| `explanation` | Reads markdown; optional inline `glossary` |
| `predict-output` | Predicts a snippet's stdout (graded against real output) |
| `fill-in-blank` | Fills `__1__`, `__2__` placeholders in a template |
| `write-line` | Writes one expression or statement |
| `write-function` | A small focused drill — same runner as problems |
| `multiple-choice` | Picks the correct choice(s) |
| `checklist` | Ticks recap items |

**Quality bar:** a lesson is not chopped-up problems. It introduces a concept,
defines its terms, shows a tiny example, then has the learner *do* something with
it 5–10 times before any full problem. Cut a `predict-output` if the answer is
obvious from reading the code — the good ones target *surprising* Python
behavior. A `fill-in-blank` should blank the *interesting* token, not boilerplate.
Start each lesson with an `explanation` and end with a `checklist`; include 1–3
`write-function` drills.

**Authoring constraints (these will silently break content if ignored):**

- `predict-output` snippets must run without raising. To teach an exception,
  wrap it in `try/except` and `print` the caught message.
- `fill-in-blank` `validation.expectedVar` / `write-line` `expected` /
  `write-function` test `expected` values must be JSON-serializable —
  lists/dicts/strings/numbers/bools. Never a raw `set`. (Dict keys may be ints;
  the runner compares dict keys as strings.)

### Validating content

`scripts/validate-content.mjs` transpiles every lesson, runs all its Python
through the real interpreter, and checks predicted outputs, fill-in answers,
reference solutions, and worked-example line ranges:

```bash
node scripts/validate-content.mjs
```

## Tech Stack

- **Vite + React + TypeScript** — static, no SSR
- **Pyodide** (CDN) — Python 3.11 in WebAssembly, loaded lazily, one shared instance
- **Monaco Editor** — Python syntax mode
- **Tailwind CSS v4**
- **react-router-dom** with HashRouter — GitHub Pages compatible
- **react-markdown** — a custom remark plugin renders `{{term:slug}}` glossary links

## Project Structure

```
src/
  App.tsx                    # Router: /, /browse, /problem/:id, /lesson/:id, /glossary
  types.ts                   # Problem, Lesson + 7 LessonStep types, progress types
  routes/
    Home.tsx                 # Category grid + lesson/problem progress
    Browse.tsx               # Curriculum tree (lessons → problems per category)
    Problem.tsx              # Two-pane problem view
    Lesson.tsx               # Stepper lesson view + end-of-lesson summary
    Glossary.tsx             # Global glossary page
  components/
    ConceptPane.tsx          # Concept + worked-example stepper
    WorkedExampleStepper.tsx # Line-by-line solution walkthrough
    LessonSteps.tsx          # All 7 lesson step components + dispatcher
    ExercisePane.tsx         # Editor + run + results
    TermTooltip.tsx          # Glossary term popover
    TestResults.tsx, HintDrawer.tsx, ProgressBar.tsx
  pyodide/
    runner.ts                # Pyodide loader; problem + lesson step runners
  content/
    index.ts                 # Problem glob loader
    problems/                # 40 problems, 6 categories
    lessons/index.ts         # Lesson glob loader
    lessons/<category>/      # Lesson files (16 authored)
    glossary/terms.ts        # Seed glossary (50+ terms)
  state/
    progress.ts              # localStorage — problem + lesson progress
  lib/
    markdown.tsx             # react-markdown + {{term:}} remark plugin
    glossary.ts              # Aggregates seed + per-lesson terms, with backlinks
    diff.ts                  # expected/actual formatting
scripts/
  validate-content.mjs       # Content validator (runs lesson Python)
  run-checks.py
```
