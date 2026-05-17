import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'pyi-iterators',
  category: 'pythonic-idioms',
  title: 'Iterators and lazy evaluation',
  summary:
    'What `for` really does under the hood: `iter()`, `next()`, `StopIteration`, and lazy built-ins.',
  estimatedMinutes: 15,
  order: 5,
  prerequisites: ['pyi-generators'],
  objectives: [
    'Get an iterator with `iter()` and pull values with `next()`',
    'Recognise `StopIteration` as the end-of-iteration signal',
    'Describe the iter/next/StopIteration loop that `for` runs internally',
    'Explain that `range`, `map`, and `zip` are lazy',
    'Explain what it means for an iterator to be exhausted',
  ],
  glossary: [
    {
      term: 'Iterator',
      definition:
        'An object that produces values one at a time via `next()` and raises `StopIteration` when exhausted.',
    },
    {
      term: 'StopIteration',
      definition:
        'The exception an iterator raises to signal it has no more values. `for` catches it silently.',
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'Iterable vs iterator',
      markdown: `Two related words that are easy to confuse:

- An **{{term:iterable}}** is anything you *can* loop over — a \`list\`, \`str\`, \`dict\`, \`range\`.
- An **{{term:iterator}}** is the object that actually *does* the stepping. You get one by calling \`iter()\` on an iterable, and you pull values from it with \`next()\`:

\`\`\`python
nums = [10, 20]        # iterable
it = iter(nums)        # iterator
next(it)               # 10
next(it)               # 20
\`\`\`

A list is iterable but is *not* its own iterator — \`iter(list)\` hands you a fresh stepper each time.`,
    },
    {
      kind: 'predict-output',
      prompt: '`next()` pulls one value at a time. What prints?',
      code: `it = iter(["a", "b", "c"])
print(next(it))
print(next(it))
print(next(it))`,
      expected: `a
b
c`,
      explanation: `\`iter(...)\` builds an iterator over the list. Each \`next(it)\` returns the next item and advances the internal position: \`"a"\`, then \`"b"\`, then \`"c"\`. The iterator remembers where it is between calls.`,
    },
    {
      kind: 'explanation',
      title: 'The end signal: `StopIteration`',
      markdown: `When an iterator has nothing left, calling \`next()\` does not return \`None\` — it **raises {{term:StopIteration}}**:

\`\`\`python
it = iter([1])
next(it)        # 1
next(it)        # raises StopIteration
\`\`\`

To pull a value safely without an exception, give \`next()\` a **default**:

\`\`\`python
next(it, "done")   # returns "done" instead of raising
\`\`\`

\`StopIteration\` is not really an "error" — it is the normal, expected way an iterator says "that is all".`,
    },
    {
      kind: 'predict-output',
      prompt: '`next()` is given a default. What happens past the end?',
      code: `it = iter([7])
print(next(it, "empty"))
print(next(it, "empty"))
print(next(it, "empty"))`,
      expected: `7
empty
empty`,
      explanation: `The first \`next\` returns the only item, \`7\`. The iterator is now exhausted, so every later \`next(it, "empty")\` returns the default \`"empty"\` instead of raising \`StopIteration\`. An exhausted iterator stays exhausted — it never refills.`,
      hint: 'One item, then the default forever after.',
    },
    {
      kind: 'explanation',
      title: 'What `for` does under the hood',
      markdown: `A \`for\` loop is just sugar. This loop:

\`\`\`python
for x in seq:
    use(x)
\`\`\`

is essentially:

\`\`\`python
it = iter(seq)            # 1. get an iterator
while True:
    try:
        x = next(it)      # 2. pull the next value
    except StopIteration:
        break             # 3. stop cleanly at the end
    use(x)
\`\`\`

So \`for\` calls \`iter()\` once, then \`next()\` repeatedly, and treats \`StopIteration\` as "we are finished". That is the entire protocol.`,
    },
    {
      kind: 'multiple-choice',
      prompt: 'In the iterator protocol, how does a `for` loop know it should stop?',
      choices: [
        {
          id: 'a',
          markdown: 'The iterator raises `StopIteration`, which `for` catches and turns into a clean exit.',
          correct: true,
          whyRight:
            '`for` calls `next()` until `StopIteration` is raised, then breaks — silently.',
        },
        {
          id: 'b',
          markdown: 'The iterator returns `None`, and `for` stops on the first `None`.',
          correct: false,
          whyWrong:
            '`None` is a perfectly valid value to yield. The end signal is the `StopIteration` exception, not a sentinel value.',
        },
        {
          id: 'c',
          markdown: '`for` checks `len()` before each step and stops at the count.',
          correct: false,
          whyWrong:
            '`for` works on infinite generators that have no `len()`. It relies on `StopIteration`, not length.',
        },
      ],
    },
    {
      kind: 'explanation',
      title: 'Lazy built-ins: `range`, `map`, `zip`',
      markdown: `Several core built-ins do **not** build a list — they return lazy objects that compute values on demand:

\`\`\`python
range(1_000_000)        # holds no million numbers
map(str.upper, words)   # applies str.upper one item at a time
zip(a, b)               # pairs items as you ask for them
\`\`\`

This is **{{term:lazy-evaluation}}** again. \`range(10**12)\` is instant and tiny because it stores only start/stop/step. To *see* the values, iterate the object or wrap it in \`list()\`.`,
    },
    {
      kind: 'predict-output',
      prompt: 'Are `map` and `range` lazy? Predict the output.',
      code: `m = map(str.upper, ["hi", "yo"])
print(type(m).__name__)
print(list(m))
print(list(range(2, 8, 2)))`,
      expected: `map
['HI', 'YO']
[2, 4, 6]`,
      explanation: `\`map(...)\` does not return a list — it returns a lazy \`map\` object, so its type name is \`map\`. Only \`list(m)\` forces it to compute \`['HI', 'YO']\`. Likewise \`range(2, 8, 2)\` is a lazy range; \`list()\` materialises it to \`[2, 4, 6]\` (stop \`8\` is exclusive).`,
      hint: 'map and range return lazy objects; list() forces them.',
    },
    {
      kind: 'fill-in-blank',
      prompt:
        'Fill the blanks: get an iterator from `data`, then pull its first value into `head`.',
      template: `data = [100, 200, 300]
it = __1__(data)
head = __2__(it)`,
      blanks: [
        {
          id: '1',
          accept: ['iter'],
          explanation: '`iter()` turns an iterable into an iterator you can step through.',
          hint: 'The built-in that produces an iterator.',
        },
        {
          id: '2',
          accept: ['next'],
          explanation: '`next()` pulls the next value from an iterator.',
          hint: 'The built-in that pulls one value.',
        },
      ],
      validation: { expectedVar: { name: 'head', value: 100 } },
    },
    {
      kind: 'write-function',
      prompt:
        'Write `take(iterable, n)` that returns a list of the first `n` items of `iterable`. If the iterable has fewer than `n` items, return whatever it has. It must work on a lazy iterator without consuming more than `n` items.',
      functionName: 'take',
      starterCode: `def take(iterable, n: int) -> list:
    ...`,
      tests: [
        { name: 'Take some', input: [[1, 2, 3, 4, 5], 3], expected: [1, 2, 3] },
        { name: 'Take all', input: [[1, 2], 5], expected: [1, 2] },
        { name: 'Take none', input: [[1, 2, 3], 0], expected: [] },
        { name: 'Take from empty', input: [[], 3], expected: [] },
      ],
      referenceSolution: `def take(iterable, n: int) -> list:
    it = iter(iterable)
    result = []
    for _ in range(n):
        try:
            result.append(next(it))
        except StopIteration:
            break
    return result`,
      hints: [
        'Call `iter()` once, then `next()` at most `n` times.',
        'Catch `StopIteration` to stop early when the iterable runs out before `n`.',
      ],
      explanation:
        'Calling `next()` exactly `n` times (and stopping on `StopIteration`) takes only what you need — crucial for lazy or infinite iterators where `list(iterable)[:n]` would hang or waste work.',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        'An iterable can be looped over; an iterator is the stepper, made by `iter()`.',
        '`next(it)` returns the next value; past the end it raises `StopIteration` (or returns a given default).',
        '`for` is sugar for: call `iter()` once, call `next()` until `StopIteration`, then stop.',
        '`range`, `map`, and `zip` are lazy — wrap them in `list()` to see their values.',
        'An exhausted iterator stays exhausted; it does not rewind or refill.',
      ],
    },
  ],
  appliesTo: ['iterators-generators'],
};

export default lesson;
