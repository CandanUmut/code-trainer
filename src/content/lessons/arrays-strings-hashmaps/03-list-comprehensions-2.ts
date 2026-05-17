import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'asx-list-comp-2',
  category: 'arrays-strings-hashmaps',
  title: 'List comprehensions, part 2',
  summary:
    'The conditional expression, nested loops for flattening, and dict and set comprehensions.',
  estimatedMinutes: 15,
  order: 3,
  prerequisites: ['asx-list-comp-1'],
  objectives: [
    'Tell apart a filtering `if` and a transforming `if/else`',
    'Flatten a nested list with a two-`for` comprehension',
    'Build a dict or set with comprehension syntax',
  ],
  glossary: [
    {
      term: 'Conditional expression',
      definition:
        'An inline `a if cond else b` that evaluates to one of two values. Unlike a filter, it always produces a value.',
      example: "sign = 'pos' if n > 0 else 'neg'",
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'Two different uses of `if`',
      markdown: `An \`if\` in a comprehension means two completely different things depending on **where** it sits.

\`\`\`python
# FILTER — if after the for. Drops items.
[n for n in nums if n > 0]

# TRANSFORM — if...else before the for. Keeps every item, changes it.
[n if n > 0 else 0 for n in nums]
\`\`\`

The filter \`if\` has **no \`else\`** and can shorten the list. The transforming form is a {{term:conditional-expression}} — it *must* have an \`else\` because every item still needs a value.`,
    },
    {
      kind: 'predict-output',
      prompt: 'One comprehension filters, one transforms. Predict both.',
      code: `nums = [-2, 5, -1, 3]
print([n for n in nums if n > 0])
print([n if n > 0 else 0 for n in nums])`,
      expected: `[5, 3]
[0, 5, 0, 3]`,
      explanation: `The first drops the negatives, so the list shrinks to 2 items. The second keeps all 4 items but replaces each negative with \`0\`. Same data, but the filter changes the *length* while the conditional expression changes the *values*.`,
      hint: 'A filter shortens the list; an if/else keeps every slot.',
    },
    {
      kind: 'multiple-choice',
      prompt:
        'You want a list the same length as `nums`, with each odd number replaced by the string `"odd"`. Which is correct?',
      choices: [
        {
          id: 'a',
          markdown: '`["odd" if n % 2 else n for n in nums]`',
          correct: true,
          whyRight:
            'The `if/else` sits before the `for`, so every item is kept and transformed — the list stays the same length.',
        },
        {
          id: 'b',
          markdown: '`["odd" for n in nums if n % 2]`',
          correct: false,
          whyWrong:
            'This filters to only odd numbers and turns them all into "odd" — the even numbers vanish entirely.',
        },
        {
          id: 'c',
          markdown: '`[n if n % 2 for n in nums]`',
          correct: false,
          whyWrong: 'A conditional expression before the `for` must include an `else`.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Nested loops: flattening',
      markdown: `A comprehension can have **more than one \`for\`**. They nest left-to-right, exactly like stacked loops:

\`\`\`python
matrix = [[1, 2], [3, 4], [5]]
flat = [v for row in matrix for v in row]
# same as:
flat = []
for row in matrix:
    for v in row:
        flat.append(v)
\`\`\`

The trick is the order: the **outer** loop is written first, the **inner** loop second — the opposite of what many people guess.`,
    },
    {
      kind: 'predict-output',
      prompt: 'What does this flatten to?',
      code: `matrix = [[1, 2], [3, 4], [5]]
print([v for row in matrix for v in row])`,
      expected: '[1, 2, 3, 4, 5]',
      explanation: `Read the \`for\` clauses in order: first \`for row in matrix\` (the outer loop), then \`for v in row\` (the inner loop). Each inner value \`v\` is collected, giving one flat list. The rows can be different lengths — it does not matter.`,
    },
    {
      kind: 'fill-in-blank',
      prompt: 'Fill the blanks to flatten `pairs` into a single list.',
      template: `pairs = [(1, 2), (3, 4), (5, 6)]
flat = [n for pair in pairs for n in __1__]`,
      blanks: [
        {
          id: '1',
          accept: ['pair'],
          explanation:
            'The inner loop iterates over each `pair`, so the inner iterable is `pair` itself.',
          hint: 'The outer loop already gave you each `pair`.',
        },
      ],
      validation: { expectedVar: { name: 'flat', value: [1, 2, 3, 4, 5, 6] } },
    },
    {
      kind: 'explanation',
      title: 'Dict and set comprehensions',
      markdown: `Swap the square brackets for curly braces and you build other containers:

\`\`\`python
# set comprehension — unique values
{c for c in "banana"}          # {'b', 'a', 'n'}

# dict comprehension — key: value pairs
{w: len(w) for w in ["a", "bb"]}   # {'a': 1, 'bb': 2}
\`\`\`

A dict comprehension needs a \`key: value\` pair before the \`for\`. A set comprehension looks just like a list comprehension but with \`{}\` — and it drops duplicates.`,
    },
    {
      kind: 'write-line',
      prompt:
        'Write a dict comprehension that maps each word in `words` to its length. Assign it to `lengths`.',
      setup: "words = ['hi', 'world', 'a']",
      mode: 'statement',
      checkVar: { name: 'lengths', value: { hi: 2, world: 5, a: 1 } },
      referenceAnswer: 'lengths = {w: len(w) for w in words}',
      explanation:
        'The part before the `for` is `w: len(w)` — the word is the key, its length is the value. Curly braces plus a colon makes it a dict comprehension rather than a set.',
      hint: 'Use `{key: value for ... }` — the key is `w`, the value is `len(w)`.',
    },
    {
      kind: 'write-function',
      prompt:
        'Write `flatten(matrix)` that takes a list of lists and returns one flat list with every value, row by row.',
      functionName: 'flatten',
      starterCode: `def flatten(matrix: list[list]) -> list:
    ...`,
      tests: [
        { name: 'Rectangular', input: [[[1, 2], [3, 4]]], expected: [1, 2, 3, 4] },
        { name: 'Ragged rows', input: [[[1], [2, 3, 4], []]], expected: [1, 2, 3, 4] },
        { name: 'Single row', input: [[[9, 8, 7]]], expected: [9, 8, 7] },
        { name: 'Empty matrix', input: [[]], expected: [] },
      ],
      referenceSolution: `def flatten(matrix: list[list]) -> list:
    return [v for row in matrix for v in row]`,
      hints: [
        'You need two `for` clauses in one comprehension.',
        'Write the outer loop (`for row in matrix`) first, the inner loop (`for v in row`) second.',
      ],
      explanation:
        'The two-`for` comprehension handles ragged and empty rows for free: an empty row simply contributes nothing to the inner loop.',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        'A trailing `if` filters; an `if/else` before the `for` transforms every item.',
        'A conditional expression `a if cond else b` always needs the `else`.',
        'Multiple `for` clauses nest outer-first, inner-second.',
        '`{}` with a `key: value` builds a dict; `{}` with a single expr builds a set.',
      ],
    },
  ],
  appliesTo: [],
};

export default lesson;
