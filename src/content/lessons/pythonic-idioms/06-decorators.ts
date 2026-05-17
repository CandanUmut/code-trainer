import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'pyi-decorators',
  category: 'pythonic-idioms',
  title: 'Decorators',
  summary:
    'Functions are objects; a decorator wraps one function in another to add behavior without editing it.',
  estimatedMinutes: 17,
  order: 6,
  prerequisites: [],
  objectives: [
    'Treat functions as first-class objects passed and returned like any value',
    'Write a decorator: a function that takes a function and returns a function',
    'Explain that `@name` above a `def` is shorthand for reassignment',
    'Forward arbitrary arguments with `*args, **kwargs`',
    'Use `functools.wraps` to preserve the wrapped function\'s identity',
  ],
  glossary: [
    {
      term: 'Decorator',
      definition:
        'A callable that takes a function and returns a replacement function, applied with `@name` syntax.',
    },
    {
      term: 'Wrapper',
      definition:
        'The inner function a decorator returns. It usually calls the original function and adds behavior around it.',
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'Functions are objects',
      markdown: `In Python a function is just a value, like an \`int\` or a \`list\`. You can store it in a variable, put it in a list, pass it as an argument, and **return it from another function**:

\`\`\`python
def shout(text):
    return text.upper()

f = shout            # no parentheses — f now refers to the function
print(f("hi"))       # HI
\`\`\`

Note the difference: \`shout\` is the function object; \`shout("hi")\` *calls* it. A decorator is built entirely on this idea — handing functions around like data.`,
    },
    {
      kind: 'predict-output',
      prompt: 'A function is passed to another function. What prints?',
      code: `def apply_twice(fn, value):
    return fn(fn(value))

def add_three(n):
    return n + 3

print(apply_twice(add_three, 10))`,
      expected: '16',
      explanation: `\`add_three\` is passed *as a value* (no parentheses) into \`apply_twice\`. Inside, \`fn\` is \`add_three\`. \`fn(10)\` is \`13\`, then \`fn(13)\` is \`16\`. Functions being ordinary objects is exactly what makes this work.`,
    },
    {
      kind: 'explanation',
      title: 'A decorator: a function in, a function out',
      markdown: `A {{term:decorator}} is a function that **takes a function and returns a function** — usually a new one that wraps the original:

\`\`\`python
def announce(fn):
    def wrapper():
        print("calling...")
        result = fn()
        print("done")
        return result
    return wrapper
\`\`\`

\`announce\` does not call \`fn\` itself. It builds a \`wrapper\` that, *when later called*, runs \`fn\` with extra behavior around it — then hands \`wrapper\` back as the replacement.`,
    },
    {
      kind: 'explanation',
      title: 'The `@` syntax',
      markdown: `Applying a decorator by hand looks like this:

\`\`\`python
def greet():
    print("hello")

greet = announce(greet)    # replace greet with the wrapped version
\`\`\`

The \`@name\` syntax placed above a \`def\` is **exactly** that reassignment, written more clearly:

\`\`\`python
@announce
def greet():
    print("hello")
# greet is now announce(greet)
\`\`\`

So \`@announce\` means: define \`greet\`, pass it to \`announce\`, and bind the name \`greet\` to whatever \`announce\` returns.`,
    },
    {
      kind: 'predict-output',
      prompt: 'A decorator wraps the function. In what order does output appear?',
      code: `def announce(fn):
    def wrapper():
        print("before")
        fn()
        print("after")
    return wrapper

@announce
def task():
    print("working")

task()`,
      expected: `before
working
after`,
      explanation: `\`@announce\` replaces \`task\` with \`wrapper\`. Calling \`task()\` actually runs \`wrapper()\`: it prints \`"before"\`, calls the original \`task\` (printing \`"working"\`), then prints \`"after"\`. The decorator sandwiches the original call.`,
      hint: 'Calling the decorated name runs the wrapper, which sandwiches the original.',
    },
    {
      kind: 'explanation',
      title: 'Forwarding any arguments with `*args, **kwargs`',
      markdown: `The wrapper above only works for a function taking *no* arguments. To wrap **any** function, the wrapper must accept and pass along whatever it is given:

\`\`\`python
def announce(fn):
    def wrapper(*args, **kwargs):
        print("calling", fn.__name__)
        return fn(*args, **kwargs)
    return wrapper
\`\`\`

\`*args\` catches every positional argument as a tuple, \`**kwargs\` catches every keyword argument as a dict. Passing \`fn(*args, **kwargs)\` spreads them straight back into the original. And do not forget to \`return\` the result.`,
      glossary: [
        {
          term: '*args / **kwargs',
          definition:
            '`*args` collects extra positional arguments into a tuple; `**kwargs` collects extra keyword arguments into a dict. Used in the call, they spread the values back out.',
        },
      ],
    },
    {
      kind: 'fill-in-blank',
      prompt:
        'Fill the blanks so `wrapper` accepts any arguments and forwards them to `fn`.',
      template: `def logged(fn):
    def wrapper(__1__):
        return fn(__2__)
    return wrapper`,
      blanks: [
        {
          id: '1',
          accept: ['*args, **kwargs', '*args,**kwargs'],
          explanation:
            'In the parameter list, `*args, **kwargs` collects every positional and keyword argument.',
          hint: 'Two catch-all parameters.',
        },
        {
          id: '2',
          accept: ['*args, **kwargs', '*args,**kwargs'],
          explanation:
            'In the call, `*args, **kwargs` spreads the collected arguments back into `fn`.',
          hint: 'Spread the same two names into the call.',
        },
      ],
    },
    {
      kind: 'predict-output',
      prompt: 'Why does the decorated function "lose its name"?',
      code: `def logged(fn):
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper

@logged
def compute(x):
    return x * 2

print(compute.__name__)`,
      expected: 'wrapper',
      explanation: `\`@logged\` rebinds \`compute\` to the \`wrapper\` object. So \`compute.__name__\` reports \`"wrapper"\`, not \`"compute"\` — the wrapper has shadowed the original's identity. This breaks debugging and introspection, which is the problem \`functools.wraps\` solves.`,
      hint: 'The name now points at the wrapper, not the original.',
    },
    {
      kind: 'explanation',
      title: '`functools.wraps` keeps the identity',
      markdown: `Decorating \`wrapper\` itself with \`@functools.wraps(fn)\` copies the original function's \`__name__\`, \`__doc__\`, and other metadata onto the wrapper:

\`\`\`python
import functools

def logged(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper
\`\`\`

Now the decorated function still reports its real name. Always add \`@functools.wraps(fn)\` to your wrappers — it costs one line and prevents confusing debugging later.`,
    },
    {
      kind: 'write-function',
      prompt:
        'Write `double_results(numbers)`. Inside it, define a decorator `double` that wraps a function so its return value is multiplied by 2 (forward arguments with `*args, **kwargs`). Apply `@double` to a small function that returns its argument unchanged, then return a list of that decorated function called on each value in `numbers`.',
      functionName: 'double_results',
      starterCode: `import functools

def double_results(numbers: list[int]) -> list[int]:
    def double(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            ...
        return wrapper

    @double
    def identity(n):
        return n

    ...`,
      tests: [
        { name: 'Several values', input: [[1, 2, 3]], expected: [2, 4, 6] },
        { name: 'Single value', input: [[10]], expected: [20] },
        { name: 'Empty list', input: [[]], expected: [] },
        { name: 'Negatives', input: [[-4, 0, 5]], expected: [-8, 0, 10] },
      ],
      referenceSolution: `import functools

def double_results(numbers: list[int]) -> list[int]:
    def double(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            return fn(*args, **kwargs) * 2
        return wrapper

    @double
    def identity(n):
        return n

    return [identity(n) for n in numbers]`,
      hints: [
        'The wrapper should call `fn(*args, **kwargs)` and multiply the result by 2.',
        '`@double` on `identity` makes `identity(n)` return `n * 2`.',
        'Build the result with a comprehension over `numbers`.',
      ],
      explanation:
        'The `double` decorator returns a wrapper that runs the original function and transforms its result. `*args, **kwargs` forwards whatever arguments arrive, and the wrapper returns `fn(...) * 2` — so the decorated `identity` doubles every input.',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        'Functions are first-class objects — they can be stored, passed, and returned.',
        'A decorator takes a function and returns a replacement function (the wrapper).',
        '`@name` above a `def` means `func = name(func)` — nothing more.',
        'Wrap with `*args, **kwargs` so the wrapper works for any signature, and `return` the result.',
        'Add `@functools.wraps(fn)` to the wrapper so the decorated function keeps its real name.',
      ],
    },
  ],
  appliesTo: ['decorators'],
};

export default lesson;
