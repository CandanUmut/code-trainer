import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'async-streams',
  title: 'Async Generators and Async Iteration',
  category: 'concurrency',
  difficulty: 'hard',
  tags: ['asyncio', 'async-generator', 'aiter', 'streaming'],
  concept: `## Async Generators: Streaming Data Asynchronously

An async generator uses \`async def\` with \`yield\`. Consumers iterate with \`async for\`.

\`\`\`python
async def paginated_results(
    fetch_page: callable,
    page_size: int,
) -> AsyncIterator[dict]:
    page = 0
    while True:
        results = await fetch_page(page, page_size)
        if not results:
            return
        for item in results:
            yield item
        page += 1

async def main():
    async for item in paginated_results(fetch, 10):
        process(item)
\`\`\`

**Async comprehensions:** \`[x async for x in async_gen()]\` works just like a list comprehension but over async iterables.

**Composing async generators:**
\`\`\`python
async def amap(fn, aiter):
    async for item in aiter:
        yield await fn(item)

async def afilter(pred, aiter):
    async for item in aiter:
        if await pred(item):
            yield item
\`\`\``,

  workedExample: {
    problem: `Implement an \`async_batch\` generator that takes an async iterable and yields items in batches (lists) of size n. The last batch may be smaller.

\`\`\`python
async def number_stream():
    for i in range(7):
        await asyncio.sleep(0)
        yield i

batches = [b async for b in async_batch(number_stream(), 3)]
# [[0,1,2], [3,4,5], [6]]
\`\`\``,
    solution: `import asyncio
from typing import AsyncIterator, TypeVar

T = TypeVar("T")

async def async_batch(
    source: AsyncIterator[T],
    batch_size: int,
) -> AsyncIterator[list[T]]:
    batch: list[T] = []
    async for item in source:
        batch.append(item)
        if len(batch) == batch_size:
            yield batch
            batch = []
    if batch:
        yield batch

async def number_stream():
    for i in range(7):
        await asyncio.sleep(0)
        yield i

def run_batching() -> list[list[int]]:
    async def _main():
        return [b async for b in async_batch(number_stream(), 3)]
    return asyncio.run(_main())`,
    steps: [
      {
        lines: [1, 9],
        explanation: 'The function signature uses `async def` with `yield` inside, making it an **async generator**. The return annotation `AsyncIterator[list[T]]` documents that consumers should use `async for` to iterate. The generic `T` preserves element types through batching.',
      },
      {
        lines: [10, 12],
        explanation: '`async for item in source` consumes the async iterable lazily — it `await`s each item as it arrives, yielding control to the event loop between items. Items accumulate in `batch`.',
        stateAfter: [{ name: 'batch (after 3 items)', value: '[0, 1, 2]' }],
      },
      {
        lines: [13, 15],
        explanation: 'When the batch reaches `batch_size`, yield it and reset with `batch = []`. The reset **must** use `[]` rather than `.clear()` — we already yielded the reference to the old list, and calling `.clear()` would mutate the list the caller received.',
      },
      {
        lines: [16, 17],
        explanation: 'After the loop ends, any remaining items form the final (possibly partial) batch. The `if batch:` guard handles the edge case where the total count is exactly divisible by `batch_size` — in that case `batch` is empty and we skip the final yield.',
      },
      {
        lines: [24, 27],
        explanation: '`run_batching` is the synchronous entry point. It uses an async comprehension (`[b async for b in ...]`) inside `asyncio.run`, which starts the event loop and drives the async generator to completion.',
      },
    ],
    complexity: 'O(1) memory — only one batch in memory at a time',
  },

  exercise: {
    problem: `Implement \`async_merge(*async_iters)\`: an async generator that merges multiple async iterables, yielding items as they arrive (not in any particular order — first available wins).

\`\`\`python
async def slow(items, delay):
    for item in items:
        await asyncio.sleep(delay)
        yield item

result = sorted(asyncio.run(collect(
    async_merge(slow([1,3,5], 0.01), slow([2,4,6], 0.01))
)))
# [1, 2, 3, 4, 5, 6]
\`\`\``,
    functionName: 'run_async_merge',
    starterCode: `import asyncio
from typing import AsyncIterator, TypeVar

T = TypeVar("T")

async def async_merge(*async_iters: AsyncIterator[T]) -> AsyncIterator[T]:
    """Merge multiple async iterables, yielding items as they arrive."""
    ...

async def _slow_stream(items: list[int], delay: float):
    for item in items:
        await asyncio.sleep(delay)
        yield item

def run_async_merge() -> list[int]:
    async def _main():
        results = []
        async for item in async_merge(
            _slow_stream([1, 3, 5], 0.005),
            _slow_stream([2, 4, 6], 0.005),
        ):
            results.append(item)
        return sorted(results)
    return asyncio.run(_main())`,
    tests: [{ name: 'Merge two streams', input: [], expected: [1, 2, 3, 4, 5, 6] }],
    referenceSolution: `import asyncio
from typing import AsyncIterator, TypeVar

T = TypeVar("T")

async def async_merge(*async_iters: AsyncIterator[T]) -> AsyncIterator[T]:
    queue: asyncio.Queue = asyncio.Queue()
    sentinel = object()
    active = len(async_iters)

    async def drain(aiter):
        nonlocal active
        async for item in aiter:
            await queue.put(item)
        active -= 1
        if active == 0:
            await queue.put(sentinel)

    tasks = [asyncio.create_task(drain(it)) for it in async_iters]
    while True:
        item = await queue.get()
        if item is sentinel:
            break
        yield item
    for t in tasks:
        await t

async def _slow_stream(items: list[int], delay: float):
    for item in items:
        await asyncio.sleep(delay)
        yield item

def run_async_merge() -> list[int]:
    async def _main():
        results = []
        async for item in async_merge(
            _slow_stream([1, 3, 5], 0.005),
            _slow_stream([2, 4, 6], 0.005),
        ):
            results.append(item)
        return sorted(results)
    return asyncio.run(_main())`,
    hints: [
      'Use a shared `asyncio.Queue`. Each input async iter gets a task that drains it into the queue.',
      'Use a sentinel object to signal when all inputs are exhausted: put it once when the last draining task finishes.',
      'The generator yields from the queue until it sees the sentinel.',
    ],
  },
};

export default problem;
