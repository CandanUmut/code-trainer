import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'pyi-unpacking',
  category: 'pythonic-idioms',
  title: 'Unpacking and multiple assignment',
  summary:
    'Assign several variables at once, swap without a temp, and capture leftovers with `*rest`.',
  estimatedMinutes: 14,
  order: 2,
  prerequisites: [],
  objectives: [
    'Unpack a sequence into several variables in one assignment',
    'Swap two variables with `a, b = b, a`',
    'Capture leftover items with a starred target `*rest`',
    'Unpack the loop variable inside a `for` loop',
  ],
  glossary: [
    {
      term: 'Unpacking',
      definition:
        'Assigning the elements of an iterable to multiple variables at once: `a, b = pair`.',
    },
    {
      term: 'Starred target',
      definition:
        'A target written `*name` in an unpacking. It collects all leftover items into a list.',
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'One iterable, several names',
      markdown: `{{term:unpacking}} lets the left side of an \`=\` be **several names**. Python matches them up with the items of the iterable on the right:

\`\`\`python
point = (3, 7)
x, y = point        # x = 3, y = 7

r, g, b = [255, 0, 128]
\`\`\`

The count must match: three names need exactly three items, or you get a \`ValueError\`. This works for any iterable — tuples, lists, even strings.`,
    },
    {
      kind: 'predict-output',
      prompt: 'A string is iterable too. What do these three names become?',
      code: `a, b, c = "xyz"
print(a)
print(b)
print(c)`,
      expected: `x
y
z`,
      explanation: `A string is an iterable of its characters. Unpacking \`"xyz"\` into three names assigns one character to each: \`a = "x"\`, \`b = "y"\`, \`c = "z"\`. If the string had a different length, this would raise \`ValueError\`.`,
      hint: 'A string iterates character by character.',
    },
    {
      kind: 'explanation',
      title: 'Swapping without a temp variable',
      markdown: `The right-hand side of an assignment is fully evaluated **before** anything is assigned. That gives Python its famous one-line swap:

\`\`\`python
a, b = b, a
\`\`\`

Python first builds the pair \`(b, a)\` from the *current* values, then unpacks it back into \`a\` and \`b\`. No temporary variable, no risk of clobbering — the old values are safely captured before assignment begins.`,
    },
    {
      kind: 'predict-output',
      prompt: 'The right side is built first. Predict the output.',
      code: `a = 1
b = 2
a, b = b, a
print(a, b)
a, b = b, a + b
print(a, b)`,
      expected: `2 1
1 3`,
      explanation: `First swap: \`(b, a)\` is \`(2, 1)\`, so \`a, b\` become \`2, 1\`. Second line: the right side \`(b, a + b)\` is computed from the *current* values \`a=2, b=1\` → \`(1, 3)\`. Only then are they assigned, giving \`a=1, b=3\`. The right side always uses pre-assignment values.`,
      hint: 'Compute the entire right-hand tuple first, using current values.',
    },
    {
      kind: 'fill-in-blank',
      prompt: 'Fill the blanks so `x` and `y` end up swapped.',
      template: `x = "left"
y = "right"
__1__ = __2__`,
      blanks: [
        {
          id: '1',
          accept: ['x, y', 'x,y'],
          explanation: 'The left side lists the two names being assigned: `x, y`.',
          hint: 'Both names go on the left, comma-separated.',
        },
        {
          id: '2',
          accept: ['y, x', 'y,x'],
          explanation:
            'The right side is the pair in swapped order: `y, x`. It is built first, then unpacked.',
          hint: 'Put the values in the opposite order.',
        },
      ],
      validation: { expectedVar: { name: 'x', value: 'right' } },
    },
    {
      kind: 'explanation',
      title: 'Starred targets catch the rest',
      markdown: `One target may be **starred** with \`*\`. It greedily collects every item the other names do not claim — always as a **list**:

\`\`\`python
first, *rest = [1, 2, 3, 4]   # first = 1,  rest = [2, 3, 4]
*init, last = [1, 2, 3, 4]    # init = [1, 2, 3],  last = 4
a, *mid, b = [1, 2, 3, 4]     # a = 1, mid = [2, 3], b = 4
\`\`\`

The starred name can sit anywhere, but only **one** is allowed. If there are no leftovers, it simply becomes the empty list \`[]\`.`,
    },
    {
      kind: 'predict-output',
      prompt: 'Where does the star grab its items? Predict each line.',
      code: `first, *rest = [10, 20, 30, 40]
print(first, rest)
*init, last = [10, 20, 30, 40]
print(init, last)
only, *rest = [99]
print(only, rest)`,
      expected: `10 [20, 30, 40]
[10, 20, 30] 40
99 []`,
      explanation: `\`first, *rest\` — \`first\` takes one item, \`*rest\` collects the remaining three as a list. \`*init, last\` — \`last\` takes the final item, \`*init\` collects everything before it. \`only, *rest\` on a one-item list — \`only\` takes it, and \`*rest\` is the empty list \`[]\` because nothing is left. A starred target is *always* a list, even when empty.`,
      hint: 'The non-starred names are filled first; the star takes whatever is left.',
    },
    {
      kind: 'explanation',
      title: 'Unpacking in `for` loops',
      markdown: `When you loop over a sequence of pairs, you can unpack each pair right in the \`for\` header:

\`\`\`python
pairs = [("ada", 36), ("alan", 41)]
for name, age in pairs:
    print(name, age)
\`\`\`

When you do not need one of the values, the conventional throwaway name is a single underscore \`_\`:

\`\`\`python
for _, age in pairs:     # ignore the name, use only age
    print(age)
\`\`\`

\`_\` is an ordinary variable — the convention just signals "I do not care about this".`,
    },
    {
      kind: 'predict-output',
      prompt: 'The loop unpacks each pair, ignoring one side. What prints?',
      code: `scores = [("math", 90), ("art", 75), ("gym", 88)]
total = 0
for _, points in scores:
    total += points
print(total)`,
      expected: '253',
      explanation: `Each tuple is unpacked into \`_\` (the subject name, ignored) and \`points\` (the number). The loop adds \`90 + 75 + 88\`, giving \`253\`. Using \`_\` makes it clear at a glance that the first element is deliberately unused.`,
    },
    {
      kind: 'write-function',
      prompt:
        'Write `head_tail(seq)` that returns a 2-element list `[first_item, rest_list]`, where `rest_list` is a list of every item after the first. Assume `seq` has at least one item.',
      functionName: 'head_tail',
      starterCode: `def head_tail(seq: list) -> list:
    ...`,
      tests: [
        { name: 'Several items', input: [[1, 2, 3, 4]], expected: [1, [2, 3, 4]] },
        { name: 'Single item', input: [[9]], expected: [9, []] },
        { name: 'Two items', input: [['a', 'b']], expected: ['a', ['b']] },
      ],
      referenceSolution: `def head_tail(seq: list) -> list:
    first, *rest = seq
    return [first, rest]`,
      hints: [
        'Unpack with `first, *rest = seq`.',
        '`*rest` is already a list — return `[first, rest]`.',
      ],
      explanation:
        'A starred target makes the head/tail split a single line. `rest` is automatically a list, and becomes `[]` when `seq` has just one item.',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        'Unpacking matches names on the left to items in an iterable on the right; counts must match.',
        '`a, b = b, a` swaps because the right-hand tuple is built before any assignment.',
        'A starred target `*rest` collects leftover items into a list (possibly empty).',
        'Unpack pairs directly in a `for` header; use `_` for a value you intend to ignore.',
      ],
    },
  ],
  appliesTo: [],
};

export default lesson;
