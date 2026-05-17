# Adding Problems

## Quick start

1. Copy `problems/_template.ts.example` into the right category folder:
   ```
   src/content/problems/
   ├── arrays-strings-hashmaps/
   ├── trees-graphs-dp/
   ├── pythonic-idioms/
   ├── oop-typing/
   ├── concurrency/
   └── system-python/
   ```

2. Rename it (e.g. `my-problem.ts`) and fill in all fields.

3. Run `npm run dev` — the problem appears automatically. No manual registration needed.

## How it works

`src/content/index.ts` uses Vite's glob import:
```ts
import.meta.glob('./problems/**/*.ts', { eager: true })
```
Any `.ts` file under `problems/` is automatically picked up.

## Problem requirements

- `id`: stable kebab-case slug (used in URLs and localStorage — never change it)
- `workedExample` and `exercise` must be **different** problems sharing the same technique
- `exercise.functionName`: the exact Python function name the user must implement
- `exercise.tests`: mix of visible and hidden (`hidden: true`) tests
- `exercise.referenceSolution`: shown only after passing all tests or clicking "show solution"

## Test case format

```ts
{
  name: 'Descriptive test name',
  input: [arg1, arg2, ...],    // array of positional arguments
  expected: <value>,           // compared with deep equality (floats: isclose)
  hidden?: true,               // shown only after first attempt passes or on reveal
}
```

## Categories

| Category | Description |
|---|---|
| `arrays-strings-hashmaps` | Two pointers, sliding window, prefix sums, hash maps |
| `trees-graphs-dp` | DFS, BFS, topological sort, DP |
| `pythonic-idioms` | Comprehensions, itertools, generators, decorators |
| `oop-typing` | Protocols, generics, ABCs, metaclasses |
| `concurrency` | asyncio, threading, queues |
| `system-python` | AST, regex, CSV, JSON, in-memory filesystem |
