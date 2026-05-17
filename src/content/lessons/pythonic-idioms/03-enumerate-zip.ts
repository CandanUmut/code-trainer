import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'pyi-enumerate-zip',
  category: 'pythonic-idioms',
  title: 'enumerate and zip',
  summary:
    'Loop with a running index using `enumerate`, and walk two sequences side by side with `zip`.',
  estimatedMinutes: 14,
  order: 3,
  prerequisites: ['pyi-unpacking'],
  objectives: [
    'Replace `range(len(seq))` with `enumerate`',
    'Start the index at a different number with `enumerate(seq, start=1)`',
    'Pair items from two sequences with `zip`',
    'Explain that `zip` stops at the shortest input',
    'Build a dict from two sequences with `dict(zip(keys, values))`',
  ],
  glossary: [
    {
      term: 'enumerate',
      definition:
        'A built-in that pairs each item of an iterable with its index: `for i, x in enumerate(seq)`.',
    },
    {
      term: 'zip',
      definition:
        'A built-in that pairs up items from several iterables position by position, stopping at the shortest.',
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'You rarely need `range(len(...))`',
      markdown: `A very common beginner loop uses an index just to fetch the item:

\`\`\`python
for i in range(len(items)):
    print(i, items[i])
\`\`\`

{{term:enumerate}} does both at once — it yields \`(index, item)\` pairs that you unpack in the \`for\` header:

\`\`\`python
for i, item in enumerate(items):
    print(i, item)
\`\`\`

No \`len()\`, no \`items[i]\`, no chance of an off-by-one. If you find yourself writing \`range(len(...))\`, reach for \`enumerate\` instead.`,
    },
    {
      kind: 'predict-output',
      prompt: '`enumerate` yields index/item pairs. What prints?',
      code: `colors = ["red", "green", "blue"]
for i, color in enumerate(colors):
    print(i, color)`,
      expected: `0 red
1 green
2 blue`,
      explanation: `\`enumerate\` produces \`(0, "red")\`, \`(1, "green")\`, \`(2, "blue")\`. The \`for\` header unpacks each pair into \`i\` and \`color\`. The index counts from \`0\` by default, matching list indices.`,
    },
    {
      kind: 'explanation',
      title: 'Starting the count somewhere else',
      markdown: `\`enumerate\` takes a second argument, \`start\`, for the first index it yields:

\`\`\`python
for rank, name in enumerate(finishers, start=1):
    print(rank, name)     # 1, 2, 3, ...
\`\`\`

\`start\` only changes the **number reported** — it does not skip any items. It is handy for human-facing output ("question 1", "line 1") where counting from zero looks odd.`,
    },
    {
      kind: 'fill-in-blank',
      prompt:
        'Fill the blank so the loop numbers the steps starting at 1, building the list `labels`.',
      template: `steps = ["mix", "bake", "cool"]
labels = []
for n, step in enumerate(steps, __1__):
    labels.append(f"{n}. {step}")`,
      blanks: [
        {
          id: '1',
          accept: ['start=1', 'start = 1', '1'],
          explanation:
            'The second argument is the starting index. `start=1` makes the first `n` equal to `1`.',
          hint: 'Pass the start value as the second argument to `enumerate`.',
        },
      ],
      validation: {
        expectedVar: { name: 'labels', value: ['1. mix', '2. bake', '3. cool'] },
      },
    },
    {
      kind: 'predict-output',
      prompt: 'A `start` value is given. What is the first index?',
      code: `for i, letter in enumerate("abc", start=10):
    print(i, letter)`,
      expected: `10 a
11 b
12 c`,
      explanation: `\`start=10\` means the very first index reported is \`10\`, then it increments normally: \`11\`, \`12\`. The items themselves are untouched — \`start\` only shifts the counter.`,
      hint: 'The first index equals `start`; items are not skipped.',
    },
    {
      kind: 'explanation',
      title: 'Walking two sequences with `zip`',
      markdown: `{{term:zip}} pairs up items from two (or more) iterables, position by position:

\`\`\`python
names = ["ada", "alan", "grace"]
ages  = [36, 41, 45]
for name, age in zip(names, ages):
    print(name, age)
\`\`\`

\`zip\` yields \`("ada", 36)\`, \`("alan", 41)\`, \`("grace", 45)\`. It replaces the awkward "index into both lists" pattern with a clean side-by-side loop.`,
    },
    {
      kind: 'predict-output',
      prompt: 'The two lists are different lengths. What does `zip` do?',
      code: `nums = [1, 2, 3, 4, 5]
letters = ["a", "b", "c"]
print(list(zip(nums, letters)))`,
      expected: "[(1, 'a'), (2, 'b'), (3, 'c')]",
      explanation: `\`zip\` stops as soon as the **shortest** input runs out. \`letters\` has only 3 items, so \`zip\` produces 3 pairs and silently ignores \`4\` and \`5\`. This truncation is easy to miss — if you need every item, the lists must be the same length.`,
      hint: 'zip is only as long as its shortest argument.',
    },
    {
      kind: 'multiple-choice',
      prompt:
        'You `zip` a list of 6 items with a list of 4 items. How many pairs does `zip` produce?',
      choices: [
        {
          id: 'a',
          markdown: '`4` — it stops at the shorter list.',
          correct: true,
          whyRight:
            '`zip` ends as soon as any input is exhausted, so the shorter length (4) wins.',
        },
        {
          id: 'b',
          markdown: '`6` — it pads the shorter list with `None`.',
          correct: false,
          whyWrong:
            '`zip` never pads. (`itertools.zip_longest` pads, but plain `zip` truncates.)',
        },
        {
          id: 'c',
          markdown: 'It raises a `ValueError` for mismatched lengths.',
          correct: false,
          whyWrong: '`zip` does not check lengths — it just stops at the shortest.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: '`dict(zip(...))` builds a mapping',
      markdown: `Because \`zip\` yields pairs, and \`dict()\` accepts an iterable of \`(key, value)\` pairs, the two combine to build a dictionary from parallel lists:

\`\`\`python
keys   = ["x", "y", "z"]
values = [1, 2, 3]
mapping = dict(zip(keys, values))   # {'x': 1, 'y': 2, 'z': 3}
\`\`\`

This is the idiomatic one-liner for "I have a list of keys and a matching list of values".`,
    },
    {
      kind: 'write-line',
      prompt:
        'Write an expression that builds a dict pairing each key in `keys` with the value at the same position in `vals`.',
      setup: `keys = ["a", "b", "c"]
vals = [10, 20, 30]`,
      mode: 'expression',
      expected: { a: 10, b: 20, c: 30 },
      referenceAnswer: 'dict(zip(keys, vals))',
      explanation:
        '`zip(keys, vals)` yields the pairs `("a", 10)`, `("b", 20)`, `("c", 30)`, and `dict()` turns that stream of pairs into a mapping.',
      hint: 'Wrap `zip(...)` in `dict(...)`.',
    },
    {
      kind: 'write-function',
      prompt:
        'Write `index_of_max(nums)` that returns the index of the largest value in a non-empty list. If the maximum appears more than once, return the index of the first occurrence.',
      functionName: 'index_of_max',
      starterCode: `def index_of_max(nums: list[int]) -> int:
    ...`,
      tests: [
        { name: 'Distinct values', input: [[3, 9, 1, 7]], expected: 1 },
        { name: 'Max is first', input: [[8, 2, 5]], expected: 0 },
        { name: 'Repeated max', input: [[4, 9, 9, 2]], expected: 1 },
        { name: 'Single item', input: [[42]], expected: 0 },
      ],
      referenceSolution: `def index_of_max(nums: list[int]) -> int:
    best_i = 0
    for i, n in enumerate(nums):
        if n > nums[best_i]:
            best_i = i
    return best_i`,
      hints: [
        'Use `enumerate` so you have both the index and the value in the loop.',
        'Track the best index so far; only update on a strictly greater value (`>`) so the *first* maximum wins.',
      ],
      explanation:
        '`enumerate` gives the index for free. Using a strict `>` comparison means a later equal value never replaces the first one, so ties resolve to the earliest index.',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        'Use `enumerate(seq)` instead of `range(len(seq))` when you need both index and item.',
        '`enumerate(seq, start=n)` shifts the reported index without skipping items.',
        '`zip` walks several iterables in parallel, yielding tuples.',
        '`zip` stops at the shortest input — extra items in longer inputs are dropped.',
        '`dict(zip(keys, values))` builds a mapping from two parallel sequences.',
      ],
    },
  ],
  appliesTo: [],
};

export default lesson;
