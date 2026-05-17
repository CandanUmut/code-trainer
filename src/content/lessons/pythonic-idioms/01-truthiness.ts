import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'pyi-truthiness',
  category: 'pythonic-idioms',
  title: 'Truthiness and None',
  summary:
    'Which values count as false, why `or` and `and` return operands, and how `None` differs from `False`.',
  estimatedMinutes: 14,
  order: 1,
  prerequisites: [],
  objectives: [
    'List the falsy values and explain that everything else is truthy',
    'Prefer `if not seq` over `if len(seq) == 0`',
    'Explain why `or` and `and` return an operand, not a bool',
    'Test for `None` with `is None`, not `== None` or a truthiness check',
  ],
  glossary: [
    {
      term: 'Truthy / Falsy',
      definition:
        'Any value used where a boolean is expected counts as true or false. Falsy values: `False`, `None`, `0`, `0.0`, `\'\'`, `[]`, `{}`, `set()`. Everything else is truthy.',
    },
    {
      term: 'None',
      definition:
        'A singleton object meaning "no value". There is exactly one `None` in a running program, so it is tested with `is`.',
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'Every value is true or false',
      markdown: `When you write \`if x:\`, Python does not need a real \`bool\`. It asks the value itself "are you {{term:truthy}}?".

A short, fixed list of values are **falsy**:

\`\`\`python
False        # the bool
None         # the "no value" object
0    0.0     # any zero number
''           # the empty string
[]   {}      # empty list, empty dict
set()        # the empty set
\`\`\`

**Everything else is truthy** — any non-empty container, any non-zero number, any non-empty string. There is no separate rule to memorise: if it is empty or zero, it is falsy.`,
    },
    {
      kind: 'predict-output',
      prompt: 'Each value is tested in an `if`. What prints?',
      code: `for value in [0, "", [], "0", [0], -1]:
    if value:
        print("truthy", repr(value))
    else:
        print("falsy", repr(value))`,
      expected: `falsy 0
falsy ''
falsy []
truthy '0'
truthy [0]
truthy -1`,
      explanation: `\`0\`, \`''\` and \`[]\` are all falsy. But \`"0"\` is a *non-empty string* — its contents do not matter, only that it has length. \`[0]\` is a *non-empty list*. And \`-1\` is non-zero, so negative numbers are truthy too.`,
      hint: 'Falsiness is about being empty or zero, not about what is inside.',
    },
    {
      kind: 'explanation',
      title: 'Lean on truthiness for emptiness checks',
      markdown: `Because an empty container is falsy, you almost never need \`len()\` to test for emptiness:

\`\`\`python
# verbose
if len(items) == 0:
    ...
if len(items) > 0:
    ...

# idiomatic
if not items:        # items is empty
    ...
if items:            # items has at least one element
    ...
\`\`\`

\`if not items\` reads like English and works for any sequence. Save \`len()\` for when you genuinely need the count.`,
    },
    {
      kind: 'multiple-choice',
      prompt:
        'Which is the idiomatic way to run a block only when the list `results` is non-empty?',
      choices: [
        {
          id: 'a',
          markdown: '`if results:`',
          correct: true,
          whyRight:
            'A non-empty list is truthy, so `if results:` is true exactly when it has at least one item.',
        },
        {
          id: 'b',
          markdown: '`if len(results) > 0:`',
          correct: false,
          whyWrong:
            'It works, but it is verbose. Python style prefers `if results:` for emptiness checks.',
        },
        {
          id: 'c',
          markdown: '`if results != []:`',
          correct: false,
          whyWrong:
            'This builds a throwaway empty list just to compare. `if results:` does the same thing directly.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: '`or` and `and` return an operand',
      markdown: `Here is the surprise: \`or\` and \`and\` do **not** return \`True\` or \`False\`. They return one of the actual operands.

\`\`\`python
x or y    # x if x is truthy, otherwise y
x and y   # x if x is falsy,  otherwise y
\`\`\`

They also **short-circuit**: \`or\` stops at the first truthy value, \`and\` stops at the first falsy one. This makes \`or\` a clean way to supply a default:

\`\`\`python
name = user_input or "anonymous"   # "anonymous" if user_input is empty
\`\`\``,
    },
    {
      kind: 'predict-output',
      prompt: '`or` and `and` return an operand, not a bool. Predict every line.',
      code: `print([] or "fallback")
print(0 or 0.0 or "third")
print("first" and "second")
print(None and crash())`,
      expected: `fallback
third
second
None`,
      explanation: `\`[] or "fallback"\` — \`[]\` is falsy so \`or\` returns the *second* operand. \`0 or 0.0 or "third"\` — both zeros are falsy, so it returns \`"third"\`. \`"first" and "second"\` — \`"first"\` is truthy, so \`and\` skips past it and returns \`"second"\`. \`None and crash()\` — \`None\` is falsy, so \`and\` short-circuits and returns \`None\` *without ever calling* \`crash()\`.`,
      hint: '`or` returns the first truthy operand; `and` returns the first falsy one.',
    },
    {
      kind: 'fill-in-blank',
      prompt:
        'Fill the blank so `label` is the given `text`, or the string `"untitled"` when `text` is empty.',
      template: `text = ""
label = text __1__ "untitled"`,
      blanks: [
        {
          id: '1',
          accept: ['or'],
          explanation:
            '`or` returns the first operand if it is truthy, otherwise the second. An empty string is falsy, so `label` becomes `"untitled"`.',
          hint: 'You want the fallback when `text` is falsy.',
        },
      ],
      validation: { expectedVar: { name: 'label', value: 'untitled' } },
    },
    {
      kind: 'explanation',
      title: '`None` is not `False`',
      markdown: `\`None\` and \`False\` are *both* falsy, but they are different objects with different meanings. \`False\` is a boolean answer; \`None\` means "no value at all".

Test for \`None\` with the **identity** operator \`is\`:

\`\`\`python
if x is None:        # correct
if x == None:        # works, but not idiomatic
if not x:            # WRONG — also true for 0, '', []
\`\`\`

\`if not x\` is a trap: it cannot tell \`None\` apart from \`0\` or an empty list. When "no value" and "empty value" must be distinguished, you *must* use \`is None\`.`,
      glossary: [
        {
          term: 'is operator',
          definition:
            'Checks whether two names point to the exact same object in memory. Correct for `None`, `True`, `False`.',
        },
      ],
    },
    {
      kind: 'predict-output',
      prompt: 'Why does `not x` give the wrong answer here?',
      code: `def describe(x):
    if not x:
        return "missing"
    return "present"

print(describe(None))
print(describe(0))
print(describe([]))
print(describe(42))`,
      expected: `missing
missing
missing
present`,
      explanation: `All four \`print\` calls run. \`describe(None)\`, \`describe(0)\` and \`describe([])\` all return \`"missing"\` — because \`0\` and \`[]\` are falsy, \`not x\` cannot tell them apart from \`None\`. Only \`describe(42)\` returns \`"present"\`. That bug is exactly why an explicit \`x is None\` test matters.`,
      hint: 'Every print runs. 0 and [] are falsy too, so not x is true for them.',
    },
    {
      kind: 'write-function',
      prompt:
        'Write `is_really_none(x)` that returns `True` only when `x` is exactly `None`, and `False` for every other value — including `0`, `""`, and `[]`.',
      functionName: 'is_really_none',
      starterCode: `def is_really_none(x) -> bool:
    ...`,
      tests: [
        { name: 'None itself', input: [null], expected: true },
        { name: 'Zero is not None', input: [0], expected: false },
        { name: 'Empty string is not None', input: [''], expected: false },
        { name: 'Empty list is not None', input: [[]], expected: false },
        { name: 'False is not None', input: [false], expected: false },
        { name: 'A real value', input: [42], expected: false },
      ],
      referenceSolution: `def is_really_none(x) -> bool:
    return x is None`,
      hints: [
        'Do not use `not x` — that is true for `0`, `""`, and `[]` as well.',
        'The identity check `x is None` is true for `None` and nothing else.',
      ],
      explanation:
        '`x is None` asks "is this the one and only `None` object?". Unlike a truthiness test, it cannot be fooled by other falsy values.',
    },
    {
      kind: 'write-line',
      prompt:
        'Write an expression that gives `count` if it is non-zero, otherwise the string `"none"`.',
      setup: 'count = 0',
      mode: 'expression',
      expected: 'none',
      referenceAnswer: 'count or "none"',
      explanation:
        '`count or "none"` returns `count` when it is truthy. `0` is falsy, so the expression evaluates to `"none"`.',
      hint: 'Use `or` to supply a fallback for a falsy value.',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        'Falsy values: `False`, `None`, `0`, `0.0`, `\'\'`, `[]`, `{}`, `set()`. Everything else is truthy.',
        'Use `if not seq` and `if seq` for emptiness — not `len(seq) == 0`.',
        '`or` returns the first truthy operand; `and` returns the first falsy one; both short-circuit.',
        '`None` and `False` are both falsy but different — test `None` with `x is None`.',
      ],
    },
  ],
  appliesTo: [],
};

export default lesson;
