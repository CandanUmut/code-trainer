import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'decorators',
  title: 'Decorators: Memoization and Rate Limiting',
  category: 'pythonic-idioms',
  difficulty: 'medium',
  tags: ['decorators', 'functools', 'closures', 'caching'],
  concept: `## Writing Decorators Correctly

A decorator is a function that takes a function and returns a (usually wrapped) function. \`functools.wraps\` preserves the original function's metadata.

\`\`\`python
from functools import wraps
import time

def retry(max_attempts: int, delay: float = 0.0):
    def decorator(fn):
        @wraps(fn)   # preserves fn.__name__, fn.__doc__, etc.
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return fn(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(max_attempts=3, delay=0.1)
def flaky_request(url: str) -> str: ...
\`\`\`

**Decorator factory** (like \`retry\` above): a function that takes configuration and *returns* a decorator. Three levels of nesting is the norm.

\`functools.lru_cache\`: built-in memoization. \`@lru_cache(maxsize=None)\` is equivalent to \`@cache\` (Python 3.9+).`,

  workedExample: {
    problem: `Implement a \`memoize\` decorator that caches function results by arguments. It should work for any function with hashable arguments, and expose a \`cache_info()\` method on the wrapped function returning \`(hits, misses)\`.

\`\`\`python
@memoize
def fib(n: int) -> int:
    return n if n < 2 else fib(n-1) + fib(n-2)

fib(10)              # 55
fib.cache_info()     # (8, 11)  — 8 hits, 11 misses (varies)
\`\`\``,
    solution: `from functools import wraps
from typing import Callable, TypeVar, Any

F = TypeVar("F", bound=Callable[..., Any])

def memoize(fn: F) -> F:
    cache: dict[tuple, Any] = {}
    hits = 0
    misses = 0

    @wraps(fn)
    def wrapper(*args):
        nonlocal hits, misses
        if args in cache:
            hits += 1
            return cache[args]
        misses += 1
        result = fn(*args)
        cache[args] = result
        return result

    def cache_info() -> tuple[int, int]:
        return (hits, misses)

    wrapper.cache_info = cache_info  # type: ignore[attr-defined]
    return wrapper  # type: ignore[return-value]`,
    walkthrough: `\`nonlocal hits, misses\` lets the inner \`wrapper\` rebind the outer variables — necessary because we're reassigning them, not just mutating.

We use \`args\` (a tuple) as the cache key. This works for positional arguments; for kwargs you'd need to include them too (e.g., sort and tuple the items).

Attaching \`cache_info\` directly to the wrapper function as an attribute is a common pattern for "side channels" on decorated functions. \`functools.lru_cache\` does the same thing.`,
    complexity: 'O(1) amortized per call after first call',
  },

  exercise: {
    problem: `Implement a \`throttle(calls_per_second)\` decorator factory. The decorated function may be called at most \`calls_per_second\` times per second. If called too fast, the call should **block** (sleep) until enough time has passed, then execute.

\`\`\`python
import time

@throttle(calls_per_second=2)
def fast_op(x: int) -> int:
    return x * 2

# These calls should take ~0.5s each if called faster than 2/s
\`\`\`

Test: call the function 3 times rapidly and verify the total time is >= 1.0s (2 calls/s × 3 calls = 1.5s minimum, but first call is free).`,
    functionName: 'test_throttle',
    starterCode: `import time
from functools import wraps
from typing import Callable, TypeVar, Any

F = TypeVar("F", bound=Callable[..., Any])

def throttle(calls_per_second: float) -> Callable[[F], F]:
    """Return a decorator that limits the function to calls_per_second."""
    ...

@throttle(calls_per_second=10)
def _test_fn(x: int) -> int:
    return x * 2

def test_throttle(num_calls: int) -> tuple[list[int], float]:
    """Call _test_fn(i) num_calls times rapidly.
    Return (results, elapsed_seconds)."""
    start = time.perf_counter()
    results = [_test_fn(i) for i in range(num_calls)]
    elapsed = time.perf_counter() - start
    return results, round(elapsed, 3)`,
    tests: [
      {
        name: '3 calls at 10/s should take >=0.2s',
        input: [3],
        expected: [[0, 2, 4], 0.2],
      },
    ],
    referenceSolution: `import time
from functools import wraps
from typing import Callable, TypeVar, Any

F = TypeVar("F", bound=Callable[..., Any])

def throttle(calls_per_second: float) -> Callable[[F], F]:
    min_interval = 1.0 / calls_per_second

    def decorator(fn: F) -> F:
        last_call_time: list[float] = [0.0]  # mutable container to avoid nonlocal

        @wraps(fn)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            now = time.perf_counter()
            elapsed = now - last_call_time[0]
            if elapsed < min_interval:
                time.sleep(min_interval - elapsed)
            last_call_time[0] = time.perf_counter()
            return fn(*args, **kwargs)

        return wrapper  # type: ignore[return-value]

    return decorator

@throttle(calls_per_second=10)
def _test_fn(x: int) -> int:
    return x * 2

def test_throttle(num_calls: int) -> tuple[list[int], float]:
    start = time.perf_counter()
    results = [_test_fn(i) for i in range(num_calls)]
    elapsed = time.perf_counter() - start
    return results, round(elapsed, 3)`,
    hints: [
      'The throttle decorator needs to track when the last call happened. Use a mutable container like `last_call_time = [0.0]` or `nonlocal`.',
      '`min_interval = 1.0 / calls_per_second`. If time since last call < min_interval, sleep the difference.',
      'Update `last_call_time` after sleeping so the next call computes elapsed from the correct baseline.',
    ],
  },
};

export default problem;
