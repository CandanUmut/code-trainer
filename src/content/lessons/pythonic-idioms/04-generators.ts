import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'pyi-generators',
  category: 'pythonic-idioms',
  title: 'Generators with yield',
  summary:
    'Functions that produce values lazily with `yield`, and the compact generator-expression form.',
  estimatedMinutes: 16,
  order: 4,
  prerequisites: [],
  objectives: [
    'Write a generator function with `yield`',
    'Explain that calling a generator function runs no code until iterated',
    'Describe why generators are lazy and memory-light',
    'Write a generator expression `(x for x in ...)`',
    'Explain that a generator is consumed exactly once',
  ],
  glossary: [
    {
      term: 'Generator',
      definition:
        'A lazy iterator defined with a function that uses `yield`, or with a generator expression. It produces values on demand.',
    },
    {
      term: 'yield',
      definition:
        'A keyword that hands one value back to the caller and pauses the function, resuming where it left off on the next request.',
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'A function that pauses',
      markdown: `A normal function \`return\`s once and is done. A function containing **\`yield\`** is a {{term:generator}} — it can hand back many values, pausing between each:

\`\`\`python
def count_up(n):
    i = 0
    while i < n:
        yield i
        i += 1
\`\`\`

Each \`yield\` produces a value and *freezes* the function. The next time a value is requested, it thaws and continues right after the \`yield\` — local variables intact.`,
    },
    {
      kind: 'predict-output',
      prompt: 'A generator function is *called*. What does this print?',
      code: `def count_up(n):
    i = 0
    while i < n:
        yield i
        i += 1

g = count_up(3)
print(type(g).__name__)`,
      expected: 'generator',
      explanation: `Calling a generator function runs **none** of its body. It immediately returns a *generator object* — its type name is \`generator\`. If you printed \`g\` directly you would see \`<generator object count_up at 0x...>\`, not the values. The body only runs when you start iterating.`,
      hint: 'Calling the function gives you a generator object, not its values.',
    },
    {
      kind: 'explanation',
      title: 'Nothing runs until you iterate',
      markdown: `To actually get values out, you iterate the generator — with a \`for\` loop, or by passing it to \`list()\`, \`sum()\`, \`next()\`, and so on:

\`\`\`python
for x in count_up(3):
    print(x)            # 0, 1, 2

list(count_up(3))       # [0, 1, 2]
\`\`\`

This is **{{term:lazy-evaluation}}**: the values are computed one at a time, only when asked for. A generator never holds the whole sequence in memory — which is why it can even represent an *infinite* stream.`,
    },
    {
      kind: 'predict-output',
      prompt: 'When does the generator body actually run? Predict the order of output.',
      code: `def noisy():
    print("start")
    yield 1
    print("middle")
    yield 2
    print("end")

g = noisy()
print("created")
print(next(g))
print(next(g))`,
      expected: `created
start
1
middle
2`,
      explanation: `Creating \`g\` prints nothing — so \`"created"\` appears first. The first \`next(g)\` runs the body up to the first \`yield\`: it prints \`"start"\`, then yields \`1\`. The second \`next(g)\` resumes after that \`yield\`, prints \`"middle"\`, and yields \`2\`. The body runs *between* requests, not all at once.`,
      hint: 'Each next() runs the body only up to the next yield.',
    },
    {
      kind: 'explanation',
      title: 'Generator expressions',
      markdown: `Just as \`[x for x in it]\` builds a list, \`(x for x in it)\` with **round brackets** builds a generator:

\`\`\`python
squares_list = [x*x for x in range(1000)]   # builds all 1000 now
squares_gen  = (x*x for x in range(1000))   # builds none yet
\`\`\`

The list allocates 1000 numbers immediately; the generator allocates nothing until iterated. When a generator is the sole argument to a function, you can even drop the extra parentheses:

\`\`\`python
total = sum(x*x for x in range(1000))
\`\`\``,
    },
    {
      kind: 'fill-in-blank',
      prompt:
        'Fill the blank so `total` is the sum of the squares of `0..4` computed *lazily* (no intermediate list).',
      template: `total = sum(__1__ for n in range(5))`,
      blanks: [
        {
          id: '1',
          accept: ['n * n', 'n*n', 'n ** 2', 'n**2'],
          explanation:
            'The output expression squares each item. With round-bracket (generator) syntax inside `sum`, no list is built.',
          hint: 'This is the value yielded for each `n`.',
        },
      ],
      validation: { expectedVar: { name: 'total', value: 30 } },
    },
    {
      kind: 'predict-output',
      prompt: 'The same generator is iterated twice. What prints?',
      code: `gen = (c.upper() for c in "abc")
print(list(gen))
print(list(gen))`,
      expected: `['A', 'B', 'C']
[]`,
      explanation: `A generator is **consumed once**. The first \`list(gen)\` walks it to exhaustion, producing \`['A', 'B', 'C']\`. The generator is now used up — there is no rewind. The second \`list(gen)\` finds nothing left and returns \`[]\`. To iterate again you must create a fresh generator.`,
      hint: 'A generator has no rewind. Once drained, it stays empty.',
    },
    {
      kind: 'multiple-choice',
      prompt:
        'You need to loop over a result twice. Which choice avoids the "empty on second pass" trap?',
      choices: [
        {
          id: 'a',
          markdown: 'Materialise it once: `data = list(gen)`, then loop over `data` twice.',
          correct: true,
          whyRight:
            'A list can be iterated any number of times. Convert the generator to a list when you need multiple passes.',
        },
        {
          id: 'b',
          markdown: 'Just loop over the same generator object twice.',
          correct: false,
          whyWrong:
            'The second loop sees nothing — the generator was exhausted by the first loop.',
        },
        {
          id: 'c',
          markdown: 'Call `gen.reset()` between the two loops.',
          correct: false,
          whyWrong: 'Generators have no `reset()` method. They cannot be rewound.',
        },
      ],
    },
    {
      kind: 'write-function',
      prompt:
        'Write `first_n_evens(n)` that returns a *list* of the first `n` non-negative even numbers (`0, 2, 4, ...`). Define a generator with `yield` internally, then return `list(...)` of it.',
      functionName: 'first_n_evens',
      starterCode: `def first_n_evens(n: int) -> list[int]:
    def gen():
        ...
    return list(gen())`,
      tests: [
        { name: 'First four', input: [4], expected: [0, 2, 4, 6] },
        { name: 'First one', input: [1], expected: [0] },
        { name: 'Zero requested', input: [0], expected: [] },
        { name: 'First six', input: [6], expected: [0, 2, 4, 6, 8, 10] },
      ],
      referenceSolution: `def first_n_evens(n: int) -> list[int]:
    def gen():
        value = 0
        produced = 0
        while produced < n:
            yield value
            value += 2
            produced += 1
    return list(gen())`,
      hints: [
        'A generator returns a generator object — wrap it in `list(...)` so the tests can compare a real list.',
        'Track how many values you have yielded and stop once it reaches `n`.',
      ],
      explanation:
        'A function returning a generator cannot be tested for equality directly, so we drain it with `list(...)`. The generator yields evens one at a time and stops after `n` of them.',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        'A function with `yield` is a generator; calling it returns a generator object and runs no body code.',
        'The body runs lazily — a little more on each `next()` or loop step, up to the next `yield`.',
        'Generators hold no full sequence in memory, so they can be huge or even infinite.',
        '`(expr for x in it)` is a generator expression — round brackets, not square.',
        'A generator is consumed once; iterate a second time and you get nothing.',
      ],
    },
  ],
  appliesTo: ['iterators-generators'],
};

export default lesson;
