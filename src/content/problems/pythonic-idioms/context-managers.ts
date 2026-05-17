import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'context-managers',
  title: 'Custom Context Managers with contextlib',
  category: 'pythonic-idioms',
  difficulty: 'medium',
  tags: ['contextlib', 'context-manager', 'with-statement', 'generators'],
  concept: `## Context Managers: Resource Management Done Right

Context managers ensure cleanup runs even when exceptions occur. The \`__enter__\`/\`__exit__\` protocol is the foundation; \`contextlib.contextmanager\` wraps a generator to implement it without a class.

\`\`\`python
from contextlib import contextmanager

@contextmanager
def managed_resource(name: str):
    print(f"Acquiring {name}")
    resource = acquire(name)
    try:
        yield resource          # value given to 'as' in 'with' statement
    finally:
        release(resource)       # runs even if the body raises
        print(f"Released {name}")
\`\`\`

The generator must have exactly one \`yield\`. Code before \`yield\` is \`__enter__\`; code after (in \`finally\`) is \`__exit__\`.

**\`contextlib.suppress\`:** silently ignores specified exceptions. \`contextlib.ExitStack\`: dynamically compose multiple context managers.`,

  workedExample: {
    problem: `Implement a context manager \`timer\` that measures elapsed time in seconds. When used as \`with timer() as t:\`, after the block, \`t.elapsed\` holds the duration.

\`\`\`python
import time
with timer() as t:
    time.sleep(0.1)
print(t.elapsed)  # ~0.1
\`\`\``,
    solution: `import time
from contextlib import contextmanager
from dataclasses import dataclass, field

@dataclass
class TimerResult:
    elapsed: float = field(default=0.0)

@contextmanager
def timer():
    result = TimerResult()
    start = time.perf_counter()
    try:
        yield result
    finally:
        result.elapsed = time.perf_counter() - start`,
    walkthrough: `We yield a \`TimerResult\` dataclass instance — a mutable object that the \`with\` block receives via \`as t\`. Because it's mutable, we can update \`result.elapsed\` in the \`finally\` block after the body has run.

\`time.perf_counter()\` is higher precision than \`time.time()\` for measuring short durations.

The \`try/finally\` ensures timing is recorded even if the block raises an exception.`,
    complexity: 'O(1)',
  },

  exercise: {
    problem: `Implement a \`transaction\` context manager that simulates database transactions on an in-memory log.

- Takes a list \`log\` as argument (append operations to it)
- On entry: appends \`"BEGIN"\` to \`log\`
- On successful exit: appends \`"COMMIT"\`
- On exception: appends \`"ROLLBACK"\` and **re-raises** the exception

\`\`\`python
log = []
with transaction(log):
    log.append("INSERT A")
# log == ["BEGIN", "INSERT A", "COMMIT"]

log2 = []
with transaction(log2):
    log2.append("INSERT B")
    raise ValueError("oops")
# log2 == ["BEGIN", "INSERT B", "ROLLBACK"], ValueError raised
\`\`\``,
    functionName: 'transaction',
    starterCode: `from contextlib import contextmanager
from typing import Generator

@contextmanager
def transaction(log: list[str]) -> Generator[None, None, None]:
    """Context manager that appends BEGIN/COMMIT/ROLLBACK to log."""
    ...

def run_transaction_test(ops: list[str], should_fail: bool) -> tuple[list[str], bool]:
    """Run ops in a transaction. Return (log, raised_exception)."""
    log: list[str] = []
    raised = False
    try:
        with transaction(log):
            for op in ops:
                log.append(op)
            if should_fail:
                raise ValueError("simulated failure")
    except ValueError:
        raised = True
    return log, raised`,
    tests: [
      {
        name: 'Successful transaction',
        input: [['INSERT A', 'UPDATE B'], false],
        expected: [['BEGIN', 'INSERT A', 'UPDATE B', 'COMMIT'], false],
      },
      {
        name: 'Failed transaction',
        input: [['INSERT B'], true],
        expected: [['BEGIN', 'INSERT B', 'ROLLBACK'], true],
      },
      {
        name: 'Empty transaction',
        input: [[], false],
        expected: [['BEGIN', 'COMMIT'], false],
      },
    ],
    referenceSolution: `from contextlib import contextmanager
from typing import Generator

@contextmanager
def transaction(log: list[str]) -> Generator[None, None, None]:
    log.append("BEGIN")
    try:
        yield
        log.append("COMMIT")
    except Exception:
        log.append("ROLLBACK")
        raise  # re-raise the original exception

def run_transaction_test(ops: list[str], should_fail: bool) -> tuple[list[str], bool]:
    log: list[str] = []
    raised = False
    try:
        with transaction(log):
            for op in ops:
                log.append(op)
            if should_fail:
                raise ValueError("simulated failure")
    except ValueError:
        raised = True
    return log, raised`,
    hints: [
      'Use `@contextmanager` decorator on a generator function.',
      'Wrap the `yield` in `try/except Exception`. On exception, append ROLLBACK and `raise` (bare raise re-raises the current exception).',
      'COMMIT should only be appended if no exception occurs — put it *after* the yield, not in a finally block.',
    ],
  },
};

export default problem;
