import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'asx-dict-basics',
  category: 'arrays-strings-hashmaps',
  title: 'Dict basics: keys, values, lookups',
  summary:
    'Create dicts, look items up safely, check membership, and iterate keys, values, and items.',
  estimatedMinutes: 14,
  order: 4,
  prerequisites: ['asx-indexing-slicing'],
  objectives: [
    'Create a dict and read a value by key',
    'Avoid `KeyError` with `.get(key, default)` and `key in d`',
    'Iterate a dict with `.keys()`, `.values()`, and `.items()`',
  ],
  glossary: [
    {
      term: 'Dict',
      definition:
        'A built-in mapping from keys to values with average-case O(1) lookup. Keys must be hashable; values can be anything.',
      example: "ages = {'ada': 36, 'alan': 41}",
    },
    {
      term: 'KeyError',
      definition:
        'The exception raised when you access `d[key]` for a key that is not in the dict.',
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'A dict maps keys to values',
      markdown: `A {{term:hashmap}} in Python is the \`dict\`. It stores **key → value** pairs and finds any value by its key in roughly constant time.

\`\`\`python
ages = {"ada": 36, "alan": 41}
ages["ada"]   # 36 — look up by key
ages["grace"] = 45   # add a new pair
\`\`\`

The keys must be {{term:hashable}} (strings, numbers, tuples — not lists). The values can be anything. Writing \`d[key] = value\` either **adds** a new pair or **overwrites** an existing one.`,
    },
    {
      kind: 'predict-output',
      prompt: 'A missing key is not silently `None`. What happens here?',
      code: `ages = {"ada": 36}
try:
    print(ages["alan"])
except KeyError as e:
    print("KeyError:", e)`,
      expected: 'KeyError: \'alan\'',
      explanation: `Indexing a dict with a key that does not exist raises a **\`KeyError\`** — Python never silently returns \`None\`. The program stops with a traceback whose last line is \`KeyError: 'alan'\`. This is why \`.get()\` exists.`,
      hint: 'Missing key + square brackets = an exception, not a default.',
    },
    {
      kind: 'explanation',
      title: 'Safe lookups with `.get()`',
      markdown: `\`d.get(key)\` returns the value if the key exists, and \`None\` (no exception) if it does not. Pass a second argument to choose your own default:

\`\`\`python
ages = {"ada": 36}
ages.get("ada")        # 36
ages.get("alan")       # None
ages.get("alan", 0)    # 0  — your chosen default
\`\`\`

\`.get()\` never raises. Reach for it whenever a missing key is normal rather than a bug — counting is the classic case.`,
    },
    {
      kind: 'predict-output',
      prompt: 'Compare `[]` access with `.get()`. What prints?',
      code: `stock = {"apple": 5}
print(stock.get("apple", 0))
print(stock.get("pear", 0))`,
      expected: `5
0`,
      explanation: `\`stock.get("apple", 0)\` finds the key and returns \`5\`. \`stock.get("pear", 0)\` does **not** find the key, so instead of raising it returns the supplied default \`0\`. No \`KeyError\` is ever produced.`,
    },
    {
      kind: 'predict-output',
      prompt: 'The `in` operator checks dict keys. What does this print?',
      code: `ages = {"ada": 36, "alan": 41}
print("ada" in ages)
print(36 in ages)`,
      expected: `True
False`,
      explanation: `\`in\` on a dict tests **keys, not values**. \`"ada"\` is a key, so the first line is \`True\`. \`36\` is a *value*, not a key, so the second line is \`False\`. To search values you would write \`36 in ages.values()\`.`,
      hint: '`x in d` asks "is x a key?" — values are not checked.',
    },
    {
      kind: 'multiple-choice',
      prompt:
        'You want to check whether the string `"alan"` is a key of `ages` before using it. Which test is correct and safe?',
      choices: [
        {
          id: 'a',
          markdown: '`if "alan" in ages:`',
          correct: true,
          whyRight:
            '`in` on a dict tests membership of keys and never raises — exactly the safe pre-check you want.',
        },
        {
          id: 'b',
          markdown: '`if ages["alan"]:`',
          correct: false,
          whyWrong:
            'If `"alan"` is missing this raises `KeyError` before the `if` can even evaluate.',
        },
        {
          id: 'c',
          markdown: '`if "alan" in ages.values():`',
          correct: false,
          whyWrong:
            '`.values()` searches the values, not the keys — this answers a different question.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Iterating a dict',
      markdown: `Looping over a dict directly gives you its **keys**. Three view methods give you the other angles:

\`\`\`python
scores = {"a": 1, "b": 2}
for k in scores:            # keys: 'a', 'b'
for k in scores.keys():     # same — keys
for v in scores.values():   # values: 1, 2
for k, v in scores.items(): # pairs: ('a', 1), ('b', 2)
\`\`\`

Since Python 3.7 a dict **preserves insertion order** — you iterate in the order pairs were added, not in random order.`,
    },
    {
      kind: 'predict-output',
      prompt: 'Dicts preserve insertion order. In what order do these pairs print?',
      code: `d = {}
d["z"] = 1
d["a"] = 2
d["m"] = 3
for k, v in d.items():
    print(k, v)`,
      expected: `z 1
a 2
m 3`,
      explanation: `A dict iterates in **insertion order**, not sorted order. The keys were added \`z\`, \`a\`, \`m\`, so they come back \`z\`, \`a\`, \`m\` — alphabetical order is irrelevant.`,
    },
    {
      kind: 'fill-in-blank',
      prompt:
        'Fill the blank so `total` is the sum of all the values in the dict.',
      template: `prices = {"pen": 2, "book": 9, "cup": 4}
total = sum(prices.__1__)`,
      blanks: [
        {
          id: '1',
          accept: ['values()', 'values ()'],
          explanation:
            '`prices.values()` yields `2, 9, 4`; `sum()` adds them to `15`. Iterating the dict directly would sum the *keys* (strings) and fail.',
          hint: 'You want the numbers, not the keys.',
        },
      ],
      validation: { expectedVar: { name: 'total', value: 15 } },
    },
    {
      kind: 'write-line',
      prompt:
        'Write an expression that looks up `"banana"` in `stock`, returning `0` if it is absent.',
      setup: 'stock = {"apple": 5, "pear": 3}',
      mode: 'expression',
      expected: 0,
      referenceAnswer: 'stock.get("banana", 0)',
      explanation:
        '`.get("banana", 0)` returns the value for `"banana"` if present, otherwise the default `0`. Using `stock["banana"]` here would raise `KeyError`.',
      hint: 'Use `.get` with a second argument as the fallback.',
    },
    {
      kind: 'write-function',
      prompt:
        'Write `lookup(d, key)` that returns the value for `key` in dict `d`, or the string `"missing"` if the key is not present.',
      functionName: 'lookup',
      starterCode: `def lookup(d: dict, key) -> object:
    ...`,
      tests: [
        { name: 'Key present', input: [{ a: 1, b: 2 }, 'b'], expected: 2 },
        { name: 'Key absent', input: [{ a: 1 }, 'z'], expected: 'missing' },
        { name: 'Empty dict', input: [{}, 'x'], expected: 'missing' },
        { name: 'Value is zero', input: [{ a: 0 }, 'a'], expected: 0 },
      ],
      referenceSolution: `def lookup(d: dict, key) -> object:
    return d.get(key, "missing")`,
      hints: [
        '`.get(key, default)` does the whole job in one call.',
        'Do not test `if d[key]:` — that raises on a missing key.',
      ],
      explanation:
        '`.get(key, "missing")` returns the real value (even a falsy one like `0`) when the key exists, and the default `"missing"` otherwise — no `KeyError`, no special-casing.',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        '`d[key]` raises `KeyError` for a missing key; `d.get(key, default)` never raises.',
        '`key in d` checks **keys**, not values — use `d.values()` to search values.',
        'Looping a dict gives keys; use `.items()` for `(key, value)` pairs.',
        'Dicts iterate in insertion order, and `d[key] = v` adds or overwrites a pair.',
      ],
    },
  ],
  appliesTo: ['two-sum'],
};

export default lesson;
