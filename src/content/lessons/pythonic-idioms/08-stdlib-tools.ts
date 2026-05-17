import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'pyi-stdlib-tools',
  category: 'pythonic-idioms',
  title: 'The standard toolbox: itertools and functools',
  summary:
    'Reach for `Counter`, `groupby`, `reduce`, and `lru_cache` instead of reinventing them.',
  estimatedMinutes: 17,
  order: 8,
  prerequisites: ['pyi-generators'],
  objectives: [
    'Tally items with `collections.Counter`',
    'Group consecutive items with `itertools.groupby` — and sort first',
    'Fold a sequence to one value with `functools.reduce`',
    'Add memoization with `functools.lru_cache`',
  ],
  glossary: [
    {
      term: 'Counter',
      definition:
        'A `dict` subclass from `collections` that counts hashable items: `Counter("aab")` is `{\'a\': 2, \'b\': 1}`.',
    },
    {
      term: 'reduce',
      definition:
        'A `functools` function that folds an iterable into one value by applying a two-argument function cumulatively.',
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'Counting: `collections.Counter`',
      markdown: `Tallying occurrences is so common the standard library ships a tool for it. {{term:Counter}} is a \`dict\` subclass that counts:

\`\`\`python
from collections import Counter

c = Counter("banana")          # Counter({'a': 3, 'n': 2, 'b': 1})
c["a"]                          # 3
c["z"]                          # 0  — missing keys are 0, not KeyError
c.most_common(2)                # [('a', 3), ('n', 2)]
\`\`\`

Pass it any iterable. A missing key returns \`0\` instead of raising, and \`most_common(n)\` gives the top \`n\` items already sorted by count.`,
    },
    {
      kind: 'predict-output',
      prompt: 'A missing key is looked up in a Counter. What prints?',
      code: `from collections import Counter

votes = Counter(["yes", "no", "yes", "yes", "no"])
print(votes["yes"])
print(votes["maybe"])
print(votes.most_common(1))`,
      expected: `3
0
[('yes', 3)]`,
      explanation: `\`votes["yes"]\` is \`3\`. \`votes["maybe"]\` was never seen — a normal dict would raise \`KeyError\`, but a \`Counter\` returns \`0\` for any missing key. \`most_common(1)\` returns the single highest-count pair as a list of tuples: \`[('yes', 3)]\`.`,
      hint: 'A Counter treats unseen keys as count 0.',
    },
    {
      kind: 'write-line',
      prompt:
        'Write an expression using `Counter` that returns how many times `"a"` appears in the string `text`.',
      setup: `from collections import Counter
text = "abracadabra"`,
      mode: 'expression',
      expected: 5,
      referenceAnswer: 'Counter(text)["a"]',
      explanation:
        '`Counter(text)` tallies every character; indexing it with `"a"` reads that character\'s count. `"abracadabra"` has five `a`s.',
      hint: 'Build a `Counter` from `text`, then index it with `"a"`.',
    },
    {
      kind: 'explanation',
      title: 'Grouping: `itertools.groupby` (sort first!)',
      markdown: `\`itertools.groupby\` groups **consecutive** equal items. The catch: it only looks at *neighbours*, so items must already be **sorted** by the same key, or the same value gets split into several groups:

\`\`\`python
from itertools import groupby

data = ["apple", "avocado", "banana", "cherry"]
data.sort(key=lambda w: w[0])          # sort by first letter FIRST
for letter, group in groupby(data, key=lambda w: w[0]):
    print(letter, list(group))
\`\`\`

Each \`group\` is itself a lazy iterator — wrap it in \`list()\` to see its items. Forgetting the sort is the single most common \`groupby\` bug.`,
    },
    {
      kind: 'predict-output',
      prompt:
        'This data is NOT sorted before `groupby`. What goes wrong?',
      code: `from itertools import groupby

nums = [1, 1, 2, 1, 1]
for value, group in groupby(nums):
    print(value, len(list(group)))`,
      expected: `1 2
2 1
1 2`,
      explanation: `\`groupby\` only merges *adjacent* equal items. The two leading \`1\`s form one group, the lone \`2\` breaks the run, and the trailing two \`1\`s form a *separate* group. So \`1\` appears as two groups, not one. Sorting first (\`[1, 1, 1, 1, 2]\`) would have given a single group of four \`1\`s.`,
      hint: 'groupby never reorders — it only merges neighbours.',
    },
    {
      kind: 'multiple-choice',
      prompt:
        'You want `groupby` to produce exactly one group per distinct value. What must you do first?',
      choices: [
        {
          id: 'a',
          markdown: 'Sort the iterable by the same key you pass to `groupby`.',
          correct: true,
          whyRight:
            '`groupby` only merges adjacent equal keys. Sorting first brings all equal keys together so each forms a single group.',
        },
        {
          id: 'b',
          markdown: 'Nothing — `groupby` sorts the input internally.',
          correct: false,
          whyWrong:
            '`groupby` never sorts. It scans once and groups only consecutive matches.',
        },
        {
          id: 'c',
          markdown: 'Convert the iterable to a `set` first.',
          correct: false,
          whyWrong:
            'A set removes duplicates entirely and has no defined order — that defeats the point of grouping.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Folding: `functools.reduce`',
      markdown: `{{term:reduce}} collapses an iterable to a single value by applying a two-argument function cumulatively:

\`\`\`python
from functools import reduce

reduce(lambda acc, x: acc + x, [1, 2, 3, 4])        # 10
reduce(lambda acc, x: acc * x, [1, 2, 3, 4])        # 24
reduce(lambda acc, x: acc * x, [1, 2, 3, 4], 100)   # 2400  (start = 100)
\`\`\`

It carries an **accumulator**: \`acc\` starts as the first item (or the optional \`initial\` argument), and each step folds in the next item. For plain sums use \`sum()\` — but \`reduce\` handles any custom combine step.`,
    },
    {
      kind: 'fill-in-blank',
      prompt:
        'Fill the blank so `total` is the product of all numbers in `nums` using `reduce`.',
      template: `from functools import reduce
nums = [2, 3, 4]
total = reduce(lambda acc, x: __1__, nums)`,
      blanks: [
        {
          id: '1',
          accept: ['acc * x', 'acc*x', 'x * acc', 'x*acc'],
          explanation:
            'The combine step multiplies the running accumulator by the next item: `acc * x`.',
          hint: 'Multiply the accumulator by the current item.',
        },
      ],
      validation: { expectedVar: { name: 'total', value: 24 } },
    },
    {
      kind: 'explanation',
      title: 'Memoizing: `functools.lru_cache`',
      markdown: `\`functools.lru_cache\` is a decorator that adds **{{term:memoization}}** — it remembers each call's result so repeat calls with the same arguments return instantly:

\`\`\`python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
\`\`\`

Without the cache, \`fib\` recomputes the same subproblems exponentially. With it, each \`fib(k)\` runs once and is reused — turning an exponential function linear. The cached function's arguments must be hashable.`,
    },
    {
      kind: 'predict-output',
      prompt: 'The cache stores results. How many times does the body actually run?',
      code: `from functools import lru_cache

@lru_cache(maxsize=None)
def square(n):
    print("computing", n)
    return n * n

print(square(4))
print(square(4))
print(square(5))`,
      expected: `computing 4
16
16
computing 5
25`,
      explanation: `The first \`square(4)\` runs the body — it prints \`"computing 4"\` then returns \`16\`. The second \`square(4)\` is a **cache hit**: the body does *not* run, so no \`"computing"\` line, just \`16\`. \`square(5)\` is a new argument, so the body runs once more. The body executes once per distinct argument.`,
      hint: 'A cache hit skips the function body entirely.',
    },
    {
      kind: 'write-function',
      prompt:
        'Write `word_frequencies(words)` that returns a dict mapping each distinct word to how many times it appears in the list `words`. Use `collections.Counter` and return a plain `dict`.',
      functionName: 'word_frequencies',
      starterCode: `from collections import Counter

def word_frequencies(words: list[str]) -> dict:
    ...`,
      tests: [
        {
          name: 'Repeated words',
          input: [['a', 'b', 'a', 'c', 'b', 'a']],
          expected: { a: 3, b: 2, c: 1 },
        },
        {
          name: 'All distinct',
          input: [['x', 'y', 'z']],
          expected: { x: 1, y: 1, z: 1 },
        },
        { name: 'Single word', input: [['hi']], expected: { hi: 1 } },
        { name: 'Empty list', input: [[]], expected: {} },
      ],
      referenceSolution: `from collections import Counter

def word_frequencies(words: list[str]) -> dict:
    return dict(Counter(words))`,
      hints: [
        '`Counter(words)` already tallies every word.',
        'Wrap it in `dict(...)` to return a plain dictionary.',
      ],
      explanation:
        '`Counter` does the entire tally in one pass. `dict(Counter(words))` converts the result to an ordinary dictionary — the manual "loop and increment" pattern is unnecessary.',
    },
    {
      kind: 'write-function',
      prompt:
        'Write `largest_group_size(items)` that returns the size of the biggest group of equal values. Sort the list first, then use `itertools.groupby` to count run lengths and return the maximum (return `0` for an empty list).',
      functionName: 'largest_group_size',
      starterCode: `from itertools import groupby

def largest_group_size(items: list[int]) -> int:
    ...`,
      tests: [
        { name: 'Clear winner', input: [[3, 1, 3, 3, 2, 1]], expected: 3 },
        { name: 'All same', input: [[5, 5, 5, 5]], expected: 4 },
        { name: 'All distinct', input: [[1, 2, 3]], expected: 1 },
        { name: 'Empty', input: [[]], expected: 0 },
      ],
      referenceSolution: `from itertools import groupby

def largest_group_size(items: list[int]) -> int:
    if not items:
        return 0
    ordered = sorted(items)
    return max(len(list(group)) for _, group in groupby(ordered))`,
      hints: [
        'Sort first — `groupby` only merges adjacent equal values.',
        'Each `group` from `groupby` is an iterator; `len(list(group))` is its size.',
        'Return `0` for an empty list before calling `max` (which would raise on an empty iterable).',
      ],
      explanation:
        'Sorting brings every equal value together so each distinct value forms exactly one `groupby` group. Counting each group and taking the `max` gives the largest run — and the empty-list guard avoids `max` raising on no data.',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        '`collections.Counter` tallies any iterable; missing keys return `0`, and `most_common(n)` ranks them.',
        '`itertools.groupby` groups only *consecutive* equal items — sort by the same key first.',
        '`functools.reduce` folds an iterable to one value with a two-argument combine function.',
        '`functools.lru_cache` memoizes a function so repeat calls skip the body entirely.',
      ],
    },
  ],
  appliesTo: ['functools-reduce', 'itertools-groupby'],
};

export default lesson;
