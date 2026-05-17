import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'pyi-context-managers',
  category: 'pythonic-idioms',
  title: 'Context managers and with',
  summary:
    'The `with` statement guarantees cleanup; write your own with `__enter__`/`__exit__` or `@contextmanager`.',
  estimatedMinutes: 16,
  order: 7,
  prerequisites: [],
  objectives: [
    'Use `with` so setup and cleanup are always paired',
    'Explain that cleanup runs even when the block raises',
    'Write a class context manager with `__enter__` and `__exit__`',
    'Write a generator-based context manager with `@contextlib.contextmanager`',
  ],
  glossary: [
    {
      term: 'Context manager',
      definition:
        'An object usable with `with` that runs setup on entry and guaranteed cleanup on exit, even if an exception is raised.',
    },
    {
      term: 'with statement',
      definition:
        'A block that enters a context manager, runs its body, and always exits the manager afterwards.',
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'The problem `with` solves',
      markdown: `Many resources must be released — files closed, locks freed, connections dropped. Doing it by hand is fragile:

\`\`\`python
f = open("data.txt")
process(f)            # if this raises, the next line never runs
f.close()             # ...and the file leaks
\`\`\`

A {{term:context-manager}} used with \`with\` makes the pairing automatic:

\`\`\`python
with open("data.txt") as f:
    process(f)
# f is closed here — guaranteed
\`\`\`

The \`with\` block enters the manager, runs the body, and exits the manager **no matter how the body ends**.`,
    },
    {
      kind: 'predict-output',
      prompt: 'The body raises an exception. Does cleanup still happen?',
      code: `class Resource:
    def __enter__(self):
        print("open")
        return self
    def __exit__(self, exc_type, exc, tb):
        print("close")
        return False

try:
    with Resource():
        print("working")
        raise ValueError("boom")
except ValueError:
    print("caught")`,
      expected: `open
working
close
caught`,
      explanation: `\`__enter__\` runs first (\`"open"\`), then the body prints \`"working"\` and raises. Even though the body blew up, \`__exit__\` still runs (\`"close"\`) — that is the guarantee. \`__exit__\` returns \`False\`, so the exception is *not* suppressed; it propagates out and the \`except\` prints \`"caught"\`.`,
      hint: '__exit__ always runs, even on an exception.',
    },
    {
      kind: 'explanation',
      title: 'A class context manager: `__enter__` / `__exit__`',
      markdown: `Any object becomes a context manager by defining two {{term:dunder}} methods:

\`\`\`python
class Timer:
    def __enter__(self):
        self.start = time.time()
        return self          # value bound by 'as'
    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.time() - self.start
        return False         # do not suppress exceptions
\`\`\`

- \`__enter__\` runs the setup; whatever it **returns** is what \`as name\` binds.
- \`__exit__\` runs the cleanup. It receives details of any exception (all \`None\` if the block succeeded). Returning a falsy value lets exceptions propagate normally.`,
    },
    {
      kind: 'multiple-choice',
      prompt:
        'In `with Timer() as t:`, what does the name `t` refer to?',
      choices: [
        {
          id: 'a',
          markdown: 'Whatever the `__enter__` method returns.',
          correct: true,
          whyRight:
            '`as` binds the return value of `__enter__`. Returning `self` is common, but the manager may return anything.',
        },
        {
          id: 'b',
          markdown: 'Always the `Timer` instance itself, regardless of `__enter__`.',
          correct: false,
          whyWrong:
            'It is the instance only because `__enter__` happens to `return self`. A manager can return something else entirely.',
        },
        {
          id: 'c',
          markdown: 'The return value of `__exit__`.',
          correct: false,
          whyWrong:
            '`__exit__` runs at the *end*; its return value controls exception suppression, not the `as` binding.',
        },
      ],
    },
    {
      kind: 'predict-output',
      prompt: 'What does `__enter__` return, and what gets bound by `as`?',
      code: `class Box:
    def __enter__(self):
        return "the value"
    def __exit__(self, *exc):
        return False

with Box() as x:
    print(x)`,
      expected: 'the value',
      explanation: `\`as x\` binds whatever \`__enter__\` returns — here the string \`"the value"\`, not the \`Box\` instance. The body then prints \`x\`. This is why \`open()\` as a context manager binds the *file object*: its \`__enter__\` returns the file.`,
      hint: 'as binds the __enter__ return value, not the object before `as`.',
    },
    {
      kind: 'explanation',
      title: 'The shortcut: `@contextlib.contextmanager`',
      markdown: `Writing a whole class is heavy for simple cases. \`contextlib.contextmanager\` turns a **generator** into a context manager:

\`\`\`python
from contextlib import contextmanager

@contextmanager
def tag(name):
    print(f"<{name}>")      # setup — runs on enter
    yield                   # body runs here
    print(f"</{name}>")     # cleanup — runs on exit
\`\`\`

Everything **before** \`yield\` is the \`__enter__\` part; the value yielded is what \`as\` binds; everything **after** \`yield\` is the \`__exit__\` part. (For exception-safe cleanup you would wrap the \`yield\` in \`try/finally\`.)`,
    },
    {
      kind: 'fill-in-blank',
      prompt:
        'Fill the blanks to complete a generator-based context manager that prints `enter` then `exit`.',
      template: `from contextlib import contextmanager

@__1__
def section():
    print("enter")
    __2__
    print("exit")

with section():
    print("inside")`,
      blanks: [
        {
          id: '1',
          accept: ['contextmanager'],
          explanation:
            'The `@contextmanager` decorator converts the generator function into a context manager.',
          hint: 'The name imported from `contextlib`.',
        },
        {
          id: '2',
          accept: ['yield'],
          explanation:
            'A single `yield` separates setup (before) from cleanup (after). The body of the `with` runs at the `yield`.',
          hint: 'One keyword marks where the `with` body runs.',
        },
      ],
      validation: { expectedStdout: 'enter\ninside\nexit' },
    },
    {
      kind: 'predict-output',
      prompt: 'In what order do the print calls fire?',
      code: `from contextlib import contextmanager

@contextmanager
def banner():
    print("=== start ===")
    yield
    print("=== end ===")

with banner():
    print("content")`,
      expected: `=== start ===
content
=== end ===`,
      explanation: `Code before \`yield\` runs on entry — \`"=== start ==="\`. Control then passes to the \`with\` body, printing \`"content"\`. When the body finishes, the generator resumes after \`yield\` and prints \`"=== end ==="\`. The \`yield\` is exactly the seam between setup and cleanup.`,
      hint: 'Before yield = setup; after yield = cleanup.',
    },
    {
      kind: 'write-function',
      prompt:
        'Write `collect_events(actions)`. Define a context manager `recorder(log)` (a generator with `@contextmanager`) that appends `"begin"` to `log` on entry and `"finish"` to `log` on exit. Inside `collect_events`, create an empty list `log`, then use `with recorder(log):` and inside the block append every string in `actions` to `log`. Return `log`.',
      functionName: 'collect_events',
      starterCode: `from contextlib import contextmanager

def collect_events(actions: list[str]) -> list[str]:
    @contextmanager
    def recorder(log):
        ...

    log = []
    ...
    return log`,
      tests: [
        {
          name: 'Two actions',
          input: [['a', 'b']],
          expected: ['begin', 'a', 'b', 'finish'],
        },
        {
          name: 'No actions',
          input: [[]],
          expected: ['begin', 'finish'],
        },
        {
          name: 'One action',
          input: [['x']],
          expected: ['begin', 'x', 'finish'],
        },
      ],
      referenceSolution: `from contextlib import contextmanager

def collect_events(actions: list[str]) -> list[str]:
    @contextmanager
    def recorder(log):
        log.append("begin")
        yield
        log.append("finish")

    log = []
    with recorder(log):
        for action in actions:
            log.append(action)
    return log`,
      hints: [
        'Before `yield`, append `"begin"`; after `yield`, append `"finish"`.',
        'Inside the `with` block, loop over `actions` and append each one.',
        'The order in `log` shows entry, then body, then exit.',
      ],
      explanation:
        'The generator runs its pre-`yield` code on entry (`"begin"`), the `with` body runs at the `yield` (the actions), and the post-`yield` code runs on exit (`"finish"`). The final list captures that begin/body/finish ordering.',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        '`with` pairs setup and cleanup so the cleanup always runs.',
        'Cleanup runs even when the block raises — that is the core guarantee.',
        'A class context manager defines `__enter__` (setup, its return value is bound by `as`) and `__exit__` (cleanup).',
        '`@contextlib.contextmanager` turns a generator into a context manager: code before `yield` is setup, code after is cleanup.',
      ],
    },
  ],
  appliesTo: ['context-managers'],
};

export default lesson;
