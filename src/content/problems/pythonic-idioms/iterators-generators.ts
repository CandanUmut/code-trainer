import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'iterators-generators',
  title: 'Custom Iterators and Infinite Generators',
  category: 'pythonic-idioms',
  difficulty: 'hard',
  tags: ['generators', 'iterators', 'protocol', 'lazy-evaluation'],
  concept: `## The Iterator Protocol and Generator Pipelines

Any object implementing \`__iter__\` and \`__next__\` is an iterator. Generators (\`yield\`) implement this protocol automatically.

\`\`\`python
from itertools import islice

def fibonacci():
    a, b = 0, 1
    while True:            # infinite generator
        yield a
        a, b = b, a + b

# Take first 10 Fibonacci numbers without materializing the infinite sequence
list(islice(fibonacci(), 10))
\`\`\`

**Generator pipelines** compose lazy transformations:
\`\`\`python
def take_while(pred, iterable):
    for item in iterable:
        if not pred(item):
            break
        yield item

# Pipeline: infinite fibs → filter evens → take while < 1000
evens_under_1000 = list(take_while(lambda x: x < 1000,
                                    filter(lambda x: x % 2 == 0, fibonacci())))
\`\`\`

Each stage processes one element at a time — no intermediate lists.`,

  workedExample: {
    problem: `Implement a \`Cycle\` iterator class that infinitely cycles through a sequence. Then implement \`take(n, iterable)\` that returns the first \`n\` elements.

\`\`\`python
c = Cycle([1, 2, 3])
take(7, c)  →  [1, 2, 3, 1, 2, 3, 1]
\`\`\``,
    solution: `from typing import TypeVar, Iterable

T = TypeVar("T")

class Cycle:
    def __init__(self, sequence: list) -> None:
        self._seq = list(sequence)
        self._idx = 0

    def __iter__(self) -> "Cycle":
        return self

    def __next__(self):
        if not self._seq:
            raise StopIteration
        val = self._seq[self._idx % len(self._seq)]
        self._idx += 1
        return val

def take(n: int, iterable: Iterable[T]) -> list[T]:
    from itertools import islice
    return list(islice(iterable, n))`,
    steps: [
      {
        lines: [5, 8],
        explanation: '`list(sequence)` creates a private copy so external mutations don\'t affect the cycle. `_idx` starts at 0 and grows monotonically — the modulo wrapping in `__next__` makes it cycle automatically without any explicit reset.',
      },
      {
        lines: [10, 11],
        explanation: '`__iter__` returning `self` makes `Cycle` simultaneously an *iterable* (can be passed to `for`) and an *iterator* (has `__next__`). This is appropriate here because the cycle has no notion of "rewinding" — each `for` loop always continues from where the last one left off.',
      },
      {
        lines: [13, 18],
        explanation: '`__next__` raises `StopIteration` on an empty sequence (the mandatory contract for exhausted iterators). `self._idx % len(self._seq)` is the core trick — integer modulo wraps the ever-growing index back into the valid range, producing the cycling behavior without bounds checks.',
        stateAfter: [
          { name: '_idx=0,seq=[1,2,3]', value: 'yields 1' },
          { name: '_idx=3,seq=[1,2,3]', value: 'yields 1 (wraps around)' },
        ],
      },
      {
        lines: [20, 22],
        explanation: '`itertools.islice(iterable, n)` lazily consumes exactly `n` elements from any iterator without materializing the rest. Wrapping in `list()` collects the results. This works with infinite iterators like `Cycle` because `islice` stops after `n` elements.',
      },
    ],
    complexity: 'O(1) per __next__ call, O(n) for take(n)',
  },

  exercise: {
    problem: `Implement a \`merge_sorted\` generator that takes multiple sorted iterables and yields elements in sorted order (like a k-way merge). Memory usage should be O(k), not O(total elements).

\`\`\`python
list(merge_sorted([1,3,5], [2,4,6], [0,7]))
→ [0, 1, 2, 3, 4, 5, 6, 7]
\`\`\``,
    functionName: 'merge_sorted',
    starterCode: `from typing import Iterable, Iterator

def merge_sorted(*iterables: Iterable[int]) -> Iterator[int]:
    """Yield elements from multiple sorted iterables in sorted order."""
    ...`,
    tests: [
      {
        name: 'Three sorted lists',
        input: [[1, 3, 5], [2, 4, 6], [0, 7]],
        expected: [0, 1, 2, 3, 4, 5, 6, 7],
      },
      { name: 'One iterable', input: [[1, 2, 3]], expected: [1, 2, 3] },
      { name: 'Some empty', input: [[], [1, 2], []], expected: [1, 2] },
      {
        name: 'Duplicates across lists',
        input: [[1, 2, 3], [2, 3, 4]],
        expected: [1, 2, 2, 3, 3, 4],
        hidden: true,
      },
    ],
    referenceSolution: `import heapq
from typing import Iterable, Iterator

def merge_sorted(*iterables: Iterable[int]) -> Iterator[int]:
    # heapq.merge does exactly this, but let's implement it
    # Use a min-heap: (value, tie_breaker, iterator)
    heap: list[tuple[int, int, Iterator[int]]] = []
    for i, it in enumerate(iterables):
        iterator = iter(it)
        try:
            val = next(iterator)
            heapq.heappush(heap, (val, i, iterator))
        except StopIteration:
            pass  # empty iterable
    while heap:
        val, i, iterator = heapq.heappop(heap)
        yield val
        try:
            next_val = next(iterator)
            heapq.heappush(heap, (next_val, i, iterator))
        except StopIteration:
            pass`,
    hints: [
      'Use a min-heap to always know which iterator has the smallest current element.',
      'Push `(value, tie_breaker, iterator)` tuples — the tie_breaker (iterator index) prevents Python from comparing iterators when values are equal.',
      'After popping the minimum, advance that iterator and push the next value back. Stop when the heap is empty.',
    ],
  },
};

export default problem;
