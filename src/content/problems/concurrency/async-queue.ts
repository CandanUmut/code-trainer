import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'async-queue',
  title: 'Producer-Consumer with asyncio.Queue',
  category: 'concurrency',
  difficulty: 'medium',
  tags: ['asyncio', 'queue', 'producer-consumer', 'task'],
  concept: `## asyncio.Queue: Decoupled Producer-Consumer

\`asyncio.Queue\` is the async equivalent of \`queue.Queue\`. Producers \`put\` items; consumers \`get\` items. Both operations are awaitable and yield control when the queue is full/empty.

\`\`\`python
import asyncio

async def producer(queue: asyncio.Queue, items: list) -> None:
    for item in items:
        await queue.put(item)
    await queue.put(None)   # sentinel to signal done

async def consumer(queue: asyncio.Queue, results: list) -> None:
    while True:
        item = await queue.get()
        if item is None:
            break
        results.append(item * 2)
        queue.task_done()

async def main() -> list:
    queue: asyncio.Queue[int | None] = asyncio.Queue(maxsize=3)
    results: list[int] = []
    await asyncio.gather(
        producer(queue, [1, 2, 3, 4, 5]),
        consumer(queue, results),
    )
    return results
\`\`\`

**\`queue.task_done()\` + \`queue.join()\`:** alternative to sentinel — \`join()\` blocks until all tasks are marked done.`,

  workedExample: {
    problem: `Implement a work pipeline: one producer generates tasks, multiple workers process them concurrently from a queue, results go to a results queue. Return all results after all work is done.`,
    solution: `import asyncio

async def work_pipeline(
    tasks: list[int],
    worker_count: int,
    process: callable,
) -> list[int]:
    work_q: asyncio.Queue[int | None] = asyncio.Queue()
    result_q: asyncio.Queue[int] = asyncio.Queue()

    async def producer():
        for t in tasks:
            await work_q.put(t)
        for _ in range(worker_count):   # one sentinel per worker
            await work_q.put(None)

    async def worker():
        while True:
            item = await work_q.get()
            if item is None:
                break
            result = await process(item)
            await result_q.put(result)
            work_q.task_done()

    await asyncio.gather(producer(), *[worker() for _ in range(worker_count)])
    results = []
    while not result_q.empty():
        results.append(result_q.get_nowait())
    return results`,
    steps: [
      {
        lines: [3, 9],
        explanation: 'Two queues serve distinct roles: `work_q` distributes tasks to workers, `result_q` collects outputs. The `int | None` type on `work_q` signals that it can carry either a real task or a sentinel `None` to stop a worker.',
        stateAfter: [
          { name: 'work_q', value: 'Queue()  # empty' },
          { name: 'result_q', value: 'Queue()  # empty' },
        ],
      },
      {
        lines: [11, 15],
        explanation: 'The producer pushes all tasks, then sends **one `None` sentinel per worker**. This is the key design: each worker stops when it receives exactly one sentinel. Sending a shared flag or a single sentinel would create a race condition where one worker consumes the signal meant for another.',
      },
      {
        lines: [17, 24],
        explanation: 'Each worker loops, awaiting tasks. When it receives `None`, it stops. Otherwise it processes the task and puts the result in `result_q`. `task_done()` marks the item consumed — required if anyone calls `queue.join()` to wait for completion.',
      },
      {
        lines: [26, 26],
        explanation: '`asyncio.gather` runs the producer and all workers concurrently on the same event loop. The queue acts as the synchronization primitive — workers block on `get()` when the queue is empty, and the producer blocks on `put()` if maxsize is set.',
      },
      {
        lines: [27, 30],
        explanation: 'After gather completes, all workers have exited, so no new items can be added to `result_q`. Using `get_nowait()` in a loop is safe here — there are no concurrent writers left. Return all collected results.',
      },
    ],
    complexity: 'O(n) wall time ÷ worker_count (assuming equal task duration)',
  },

  exercise: {
    problem: `Implement an async \`RateLimiter\` class that allows at most \`rate\` operations per second. Use it to rate-limit a batch of async operations.

\`\`\`python
async with RateLimiter(rate=10):   # context manager
    await do_work()
\`\`\`

Implement \`run_rate_limited(tasks, rate)\` that runs all tasks through the rate limiter and returns results.`,
    functionName: 'run_rate_limited',
    starterCode: `import asyncio
import time
from typing import Callable, Awaitable

class RateLimiter:
    def __init__(self, rate: float) -> None:
        """rate: max calls per second."""
        ...

    async def __aenter__(self): ...
    async def __aexit__(self, *args): ...

async def _timed_task(delay: float, value: int) -> int:
    await asyncio.sleep(delay)
    return value

def run_rate_limited(count: int, rate: float) -> tuple[list[int], float]:
    """Run 'count' instant tasks with rate limit. Return (results, elapsed_seconds)."""
    async def _run():
        limiter = RateLimiter(rate)
        async def task(i: int) -> int:
            async with limiter:
                return i * 2
        start = time.perf_counter()
        results = await asyncio.gather(*[task(i) for i in range(count)])
        elapsed = time.perf_counter() - start
        return list(results), round(elapsed, 2)
    return asyncio.run(_run())`,
    tests: [
      {
        name: '5 tasks at 5/s should take ~0.8s',
        input: [5, 5],
        expected: [[0, 2, 4, 6, 8], 0.8],
      },
    ],
    referenceSolution: `import asyncio
import time

class RateLimiter:
    def __init__(self, rate: float) -> None:
        self._interval = 1.0 / rate
        self._lock = asyncio.Lock()
        self._last_call = 0.0

    async def __aenter__(self):
        async with self._lock:
            now = time.monotonic()
            wait = self._interval - (now - self._last_call)
            if wait > 0:
                await asyncio.sleep(wait)
            self._last_call = time.monotonic()

    async def __aexit__(self, *args):
        pass

def run_rate_limited(count: int, rate: float) -> tuple[list[int], float]:
    async def _run():
        limiter = RateLimiter(rate)
        async def task(i: int) -> int:
            async with limiter:
                return i * 2
        start = time.perf_counter()
        results = await asyncio.gather(*[task(i) for i in range(count)])
        elapsed = time.perf_counter() - start
        return list(results), round(elapsed, 2)
    return asyncio.run(_run())`,
    hints: [
      'The RateLimiter needs to serialize access (only one task can check/update `_last_call` at a time) — use `asyncio.Lock`.',
      'In `__aenter__`: acquire the lock, check if enough time has passed since the last call, sleep if not, update `_last_call`.',
      '`__aexit__` can be empty — we release the lock when the `async with self._lock` block exits.',
    ],
  },
};

export default problem;
