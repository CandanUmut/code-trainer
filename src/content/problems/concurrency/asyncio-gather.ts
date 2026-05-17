import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'asyncio-gather',
  title: 'Concurrent Tasks with asyncio.gather',
  category: 'concurrency',
  difficulty: 'medium',
  tags: ['asyncio', 'gather', 'coroutines', 'concurrent'],
  concept: `## asyncio.gather: Fan-Out Concurrency

\`asyncio.gather(*coros)\` runs multiple coroutines concurrently on the same event loop. It's the I/O fan-out pattern: fire many async operations, wait for all results.

\`\`\`python
import asyncio

async def fetch(url: str) -> str:
    await asyncio.sleep(0.1)   # simulate I/O
    return f"data from {url}"

async def main() -> list[str]:
    results = await asyncio.gather(
        fetch("api.example.com/a"),
        fetch("api.example.com/b"),
        fetch("api.example.com/c"),
    )
    return list(results)
\`\`\`

All three \`fetch\` calls run concurrently — total time ≈ 0.1s, not 0.3s.

**Error handling:** \`gather(..., return_exceptions=True)\` returns exceptions as values instead of raising. Check with \`isinstance(result, Exception)\`.

**asyncio.TaskGroup** (Python 3.11+): cleaner for structured concurrency with automatic cancellation.`,

  workedExample: {
    problem: `Simulate fetching data from multiple "URLs" concurrently. Each URL has an associated delay. Return all results, noting which failed, using \`asyncio.gather(return_exceptions=True)\`.

The mock fetch function: \`async def mock_fetch(url, delay, should_fail)\`.`,
    solution: `import asyncio

async def mock_fetch(url: str, delay: float, should_fail: bool) -> str:
    await asyncio.sleep(delay)
    if should_fail:
        raise ConnectionError(f"Failed to fetch {url}")
    return f"OK: {url}"

async def fetch_all(requests: list[tuple[str, float, bool]]) -> list[str | Exception]:
    coros = [mock_fetch(url, delay, fail) for url, delay, fail in requests]
    results = await asyncio.gather(*coros, return_exceptions=True)
    return list(results)

def run_fetch_all(requests: list[tuple[str, float, bool]]) -> list[str]:
    results = asyncio.run(fetch_all(requests))
    return [
        f"ERROR: {r}" if isinstance(r, Exception) else r
        for r in results
    ]`,
    walkthrough: `\`asyncio.gather\` returns results in the same order as the input coroutines, regardless of completion order. This is crucial for mapping results back to requests.

\`return_exceptions=True\` prevents one failure from cancelling all pending tasks — each exception is returned as a value at its index.

\`asyncio.run()\` is the entry point for synchronous code calling async code. In real applications the event loop is already running; here we use \`run()\` for the outermost call.`,
    complexity: 'O(max delay) wall time, O(n) total CPU',
  },

  exercise: {
    problem: `Implement \`parallel_map(fn, items, max_concurrency)\`: an async function that applies \`fn\` to each item concurrently, but limits to at most \`max_concurrency\` simultaneous calls using \`asyncio.Semaphore\`.

\`\`\`python
async def slow_double(x: int) -> int:
    await asyncio.sleep(0.01 * x)
    return x * 2

# Process [1,2,3,4,5] with at most 2 concurrent
results = asyncio.run(parallel_map(slow_double, [1,2,3,4,5], max_concurrency=2))
# [2, 4, 6, 8, 10]
\`\`\``,
    functionName: 'run_parallel_map',
    starterCode: `import asyncio
from typing import TypeVar, Callable, Awaitable

T = TypeVar("T")
U = TypeVar("U")

async def parallel_map(
    fn: Callable[[T], Awaitable[U]],
    items: list[T],
    max_concurrency: int,
) -> list[U]:
    """Apply fn to each item concurrently, limited to max_concurrency at a time."""
    ...

async def slow_double(x: int) -> int:
    await asyncio.sleep(0.001)
    return x * 2

def run_parallel_map(items: list[int], max_concurrency: int) -> list[int]:
    return asyncio.run(parallel_map(slow_double, items, max_concurrency))`,
    tests: [
      { name: 'Basic parallel map', input: [[1, 2, 3, 4, 5], 2], expected: [2, 4, 6, 8, 10] },
      {
        name: 'Max concurrency = 1 (sequential)',
        input: [[10, 20, 30], 1],
        expected: [20, 40, 60],
      },
      { name: 'Empty list', input: [[], 3], expected: [] },
    ],
    referenceSolution: `import asyncio
from typing import TypeVar, Callable, Awaitable

T = TypeVar("T")
U = TypeVar("U")

async def parallel_map(
    fn: Callable[[T], Awaitable[U]],
    items: list[T],
    max_concurrency: int,
) -> list[U]:
    sem = asyncio.Semaphore(max_concurrency)

    async def guarded(item: T) -> U:
        async with sem:
            return await fn(item)

    return list(await asyncio.gather(*[guarded(item) for item in items]))

async def slow_double(x: int) -> int:
    await asyncio.sleep(0.001)
    return x * 2

def run_parallel_map(items: list[int], max_concurrency: int) -> list[int]:
    return asyncio.run(parallel_map(slow_double, items, max_concurrency))`,
    hints: [
      'Use `asyncio.Semaphore(max_concurrency)` to limit concurrency. Acquire it with `async with sem:`.',
      'Wrap each call to `fn` in a `guarded` coroutine that acquires the semaphore before calling `fn`.',
      'Pass all `guarded(item)` coroutines to `asyncio.gather` — results are in order.',
    ],
  },
};

export default problem;
