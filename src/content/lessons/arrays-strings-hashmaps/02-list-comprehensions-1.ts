import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'asx-list-comp-1',
  category: 'arrays-strings-hashmaps',
  title: 'List comprehensions, part 1',
  summary:
    'Turn a build-a-list loop into a single readable expression that maps and filters.',
  estimatedMinutes: 15,
  order: 2,
  prerequisites: ['asx-indexing-slicing'],
  objectives: [
    'Rewrite an append-in-a-loop as a list comprehension',
    'Add an `if` filter to keep only some items',
    'Explain why the comprehension variable does not leak',
  ],
  glossary: [
    {
      term: 'List comprehension',
      definition:
        'A one-line expression that builds a list: `[expr for item in iterable if condition]`.',
      example: '[x * x for x in range(5)]  # [0, 1, 4, 9, 16]',
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'The pattern a comprehension replaces',
      markdown: `Over and over you write the same three-line shape: make an empty list, loop, append.

\`\`\`python
result = []
for x in range(5):
    result.append(x * x)
\`\`\`

A {{term:list-comprehension}} says the same thing in one expression:

\`\`\`python
result = [x * x for x in range(5)]
\`\`\`

Read it left to right: **\`x * x\`** is what goes in the list, **\`for x in range(5)\`** is where the values come from. Same result, less ceremony.`,
    },
    {
      kind: 'predict-output',
      prompt: 'The variable `x` already exists. Does the comprehension change it?',
      code: `x = 99
squares = [x * x for x in range(4)]
print(squares)
print(x)`,
      expected: `[0, 1, 4, 9]
99`,
      explanation: `In Python 3 the loop variable of a comprehension lives in its **own scope**. It does not leak out and does not overwrite an existing \`x\`. So after the comprehension runs, the outer \`x\` is still \`99\`. (A plain \`for\` loop is different — *that* would leave \`x\` as \`3\`.)`,
      hint: 'A comprehension is not a plain for-loop — it has its own scope.',
    },
    {
      kind: 'multiple-choice',
      prompt:
        'Which comprehension is equivalent to this loop?\n\n```python\nout = []\nfor w in words:\n    if len(w) > 3:\n        out.append(w.upper())\n```',
      choices: [
        {
          id: 'a',
          markdown: '`[w.upper() for w in words if len(w) > 3]`',
          correct: true,
          whyRight:
            'The expression `w.upper()` comes first, the source `for w in words` next, the `if` filter last — matching the loop exactly.',
        },
        {
          id: 'b',
          markdown: '`[if len(w) > 3: w.upper() for w in words]`',
          correct: false,
          whyWrong: 'A comprehension is not a statement — you cannot put a colon-`if` inside it.',
        },
        {
          id: 'c',
          markdown: '`[w.upper() if len(w) > 3 for w in words]`',
          correct: false,
          whyWrong:
            'A filtering `if` goes *after* the `for`. An `if` before the `for` would need an `else` (that is a different feature — the conditional expression).',
        },
      ],
    },
    {
      kind: 'predict-output',
      prompt: 'The trailing `if` keeps only some items. What prints?',
      code: `nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
print([n for n in nums if n % 3 == 0])`,
      expected: '[3, 6, 9]',
      explanation: `The \`if n % 3 == 0\` clause is a **filter**: only items for which it is true reach the new list. Items that fail the test are simply skipped — the list ends up shorter than the input.`,
    },
    {
      kind: 'fill-in-blank',
      prompt:
        'Fill the blanks so `result` holds the square of each *even* number in `nums`.',
      template: `nums = [1, 2, 3, 4, 5, 6]
result = [__1__ for n in nums __2__]`,
      blanks: [
        {
          id: '1',
          accept: ['n * n', 'n*n', 'n ** 2', 'n**2'],
          explanation: 'The output expression squares the item: `n * n` (or `n ** 2`).',
          hint: 'This is the value placed into the list.',
        },
        {
          id: '2',
          accept: ['if n % 2 == 0', 'if n%2==0', 'if n % 2 == 0 '],
          explanation:
            'The filter goes after the `for`: `if n % 2 == 0` keeps only even numbers.',
          hint: 'A number is even when `n % 2` is `0`.',
        },
      ],
      validation: { expectedVar: { name: 'result', value: [4, 16, 36] } },
    },
    {
      kind: 'write-line',
      prompt:
        'Write an expression that builds a list of the *lengths* of each word in `words`.',
      setup: "words = ['hi', 'world', 'a', 'python']",
      mode: 'expression',
      expected: [2, 5, 1, 6],
      referenceAnswer: '[len(w) for w in words]',
      explanation:
        'The output expression `len(w)` transforms each word into its length. No filter is needed because we keep every word.',
      hint: 'The output expression should be `len(w)`.',
    },
    {
      kind: 'write-function',
      prompt:
        'Write `positives(nums)` that returns a new list containing only the numbers greater than 0, in their original order.',
      functionName: 'positives',
      starterCode: `def positives(nums: list[int]) -> list[int]:
    ...`,
      tests: [
        { name: 'Mixed signs', input: [[-2, 3, -1, 0, 5]], expected: [3, 5] },
        { name: 'All positive', input: [[1, 2, 3]], expected: [1, 2, 3] },
        { name: 'None positive', input: [[-1, -2, 0]], expected: [] },
        { name: 'Empty', input: [[]], expected: [] },
      ],
      referenceSolution: `def positives(nums: list[int]) -> list[int]:
    return [n for n in nums if n > 0]`,
      hints: [
        'You only need a filter — the output expression is just `n`.',
        'Zero is not positive, so the test is `n > 0`, not `n >= 0`.',
      ],
      explanation:
        'When the output expression is just the item itself (`n`), the comprehension is purely a filter. `[n for n in nums if n > 0]` reads almost like the sentence "n for each n in nums where n is positive".',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        'A comprehension has the shape `[expr for item in iterable if condition]`.',
        'The `expr` is what goes in the list; the trailing `if` filters items out.',
        'The loop variable is scoped to the comprehension — it does not leak.',
        'Drop the `if` when you keep every item; make `expr` just the item when you only filter.',
      ],
    },
  ],
  appliesTo: [],
};

export default lesson;
