import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'asx-indexing-slicing',
  category: 'arrays-strings-hashmaps',
  title: 'Indexing and slicing',
  summary:
    'How to pull single items and sub-sequences out of lists and strings — including the surprising parts.',
  estimatedMinutes: 12,
  order: 1,
  prerequisites: [],
  objectives: [
    'Read an item by positive or negative index',
    'Take a sub-sequence with start:stop:step slicing',
    'Explain why a slice is a copy, not a view',
  ],
  glossary: [
    {
      term: 'Index',
      definition:
        'The position of an item in a sequence, counting from 0. `seq[0]` is the first item.',
    },
    {
      term: 'Slice',
      definition:
        'A sub-sequence selected with `seq[start:stop:step]`. `stop` is exclusive.',
      example: 'nums[1:4]  # items at indices 1, 2, 3',
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'Positions count from zero',
      markdown: `Every {{term:iterable}} sequence — a \`list\` or a \`str\` — lets you grab one item by its **{{term:index}}**.

\`\`\`python
word = "python"
#       p  y  t  h  o  n
#       0  1  2  3  4  5     <- positive index
#      -6 -5 -4 -3 -2 -1     <- negative index
word[0]   # 'p'
word[-1]  # 'n'  — last item
\`\`\`

Negative indices count *backwards from the end*, so \`seq[-1]\` is always the last item without needing \`len()\`.`,
    },
    {
      kind: 'predict-output',
      prompt: 'Negative indices count from the end. What prints?',
      code: `word = "python"
print(word[-1], word[-2], word[-6])`,
      expected: 'n o p',
      explanation: `\`-1\` is the last character, \`-2\` the second-to-last, and \`-6\` reaches all the way back to the first. For a 6-character string, \`word[-6]\` and \`word[0]\` are the same item.`,
    },
    {
      kind: 'multiple-choice',
      prompt: 'What happens when you run this?\n\n```python\nnums = [1, 2, 3]\nprint(nums[3])\n```',
      choices: [
        {
          id: 'a',
          markdown: 'It raises `IndexError: list index out of range`',
          correct: true,
          whyRight:
            'A single index past the end is an error. Valid indices for a length-3 list are 0, 1, 2 (and -1, -2, -3).',
        },
        {
          id: 'b',
          markdown: 'It prints `None`',
          correct: false,
          whyWrong: 'Python never silently returns `None` for a bad index — it raises.',
        },
        {
          id: 'c',
          markdown: 'It prints `3`',
          correct: false,
          whyWrong: 'Indexing reads a position, not a value. There is no index 3 here.',
        },
      ],
    },
    {
      kind: 'predict-output',
      prompt:
        'A single bad index raises. But what about a slice that runs past the end?',
      code: `nums = [1, 2, 3]
print(nums[5:10])
print(nums[1:99])`,
      expected: `[]
[2, 3]`,
      explanation: `Unlike single-index access, **slicing never raises for out-of-range bounds**. It quietly clamps to what exists: \`nums[5:10]\` starts past the end so you get \`[]\`, and \`nums[1:99]\` just stops at the real end. This is why slicing is safe for "give me up to N items".`,
      hint: 'Slices clamp; single indices raise.',
    },
    {
      kind: 'explanation',
      title: 'The third number: step',
      markdown: `\`seq[start:stop:step]\` takes a third optional number. \`step\` says how far to jump each time; a **negative** step walks backwards.

\`\`\`python
nums = [0, 1, 2, 3, 4, 5]
nums[::2]   # [0, 2, 4]  — every other item
nums[::-1]  # [5, 4, 3, 2, 1, 0]  — reversed
\`\`\`

\`seq[::-1]\` is the idiomatic way to reverse any sequence.`,
    },
    {
      kind: 'predict-output',
      prompt: 'A slice builds a *new* list. Predict both lines.',
      code: `a = [1, 2, 3]
b = a[:]
b.append(99)
print(a)
print(b)`,
      expected: `[1, 2, 3]
[1, 2, 3, 99]`,
      explanation: `\`a[:]\` is a full slice — it produces a brand-new list with the same items. \`b\` is therefore a separate {{term:mutable}} object, so \`b.append(99)\` cannot touch \`a\`. This is the classic one-line way to copy a list before mutating it.`,
    },
    {
      kind: 'fill-in-blank',
      prompt: 'Fill the blank so `result` is every other character starting at index 1.',
      template: `s = "abcdefg"
result = s[__1__]`,
      blanks: [
        {
          id: '1',
          accept: ['1::2'],
          explanation:
            'Start at index 1, no stop (`go to the end`), step 2 → characters at 1, 3, 5 → `"bdf"`.',
          hint: 'You need a start and a step, but no stop.',
        },
      ],
      validation: { expectedVar: { name: 'result', value: 'bdf' } },
    },
    {
      kind: 'write-line',
      prompt: 'Write an expression that returns the last two elements of `nums` as a list.',
      setup: 'nums = [3, 1, 4, 1, 5, 9]',
      mode: 'expression',
      expected: [5, 9],
      referenceAnswer: 'nums[-2:]',
      explanation:
        '`nums[-2:]` starts two from the end and runs to the end. Negative start with an empty stop is the idiom for "the last N items".',
      hint: 'Use a negative start and leave the stop blank.',
    },
    {
      kind: 'write-function',
      prompt:
        'Write `first_and_last(seq)` that returns a 2-element list `[first_item, last_item]`. You may assume `seq` has at least one item.',
      functionName: 'first_and_last',
      starterCode: `def first_and_last(seq: list) -> list:
    ...`,
      tests: [
        { name: 'Several items', input: [[10, 20, 30, 40]], expected: [10, 40] },
        { name: 'Single item', input: [[7]], expected: [7, 7] },
        { name: 'Two items', input: [[1, 2]], expected: [1, 2] },
        { name: 'Strings', input: [['a', 'b', 'c']], expected: ['a', 'c'] },
      ],
      referenceSolution: `def first_and_last(seq: list) -> list:
    return [seq[0], seq[-1]]`,
      hints: [
        'The first item is `seq[0]`.',
        'The last item is `seq[-1]` — no need for `len(seq) - 1`.',
      ],
      explanation:
        'Using `seq[-1]` instead of `seq[len(seq) - 1]` is shorter and works for a single-item list too, where first and last are the same element.',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        '`seq[0]` is the first item; `seq[-1]` is the last.',
        'A **single** index past the end raises `IndexError`; a **slice** past the end clamps quietly.',
        '`seq[::-1]` reverses; `seq[::2]` takes every other item.',
        'A slice like `a[:]` produces a *new* copy — mutating it does not affect the original.',
      ],
    },
  ],
  appliesTo: [],
};

export default lesson;
