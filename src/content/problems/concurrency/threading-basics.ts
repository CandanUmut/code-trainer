import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'threading-basics',
  title: 'Thread Safety with Locks and Thread-Local Storage',
  category: 'concurrency',
  difficulty: 'medium',
  tags: ['threading', 'lock', 'thread-local', 'race-condition'],
  concept: `## Python Threading: The GIL and Where Threads Help

Python has a Global Interpreter Lock (GIL) that prevents true parallel CPU execution in CPython. However, threads are released during I/O and C extensions, so threading is effective for:
- I/O-bound work (network, disk)
- Calling blocking C libraries

**Race condition:** two threads read-modify-write a shared variable without synchronization.

\`\`\`python
import threading

counter = 0
lock = threading.Lock()

def increment():
    global counter
    with lock:        # mutual exclusion
        counter += 1  # safe: only one thread at a time

threads = [threading.Thread(target=increment) for _ in range(100)]
for t in threads: t.start()
for t in threads: t.join()
assert counter == 100
\`\`\`

**\`threading.local()\`:** gives each thread its own copy of a variable — useful for per-thread state like database connections.`,

  workedExample: {
    problem: `Implement a thread-safe \`Counter\` class with \`increment()\`, \`decrement()\`, and \`value\` property. Verify it's correct under concurrent access.`,
    solution: `import threading

class Counter:
    def __init__(self, initial: int = 0) -> None:
        self._value = initial
        self._lock = threading.Lock()

    def increment(self) -> None:
        with self._lock:
            self._value += 1

    def decrement(self) -> None:
        with self._lock:
            self._value -= 1

    @property
    def value(self) -> int:
        with self._lock:
            return self._value

def test_counter_concurrency(n_threads: int, ops_per_thread: int) -> int:
    counter = Counter()
    threads = [
        threading.Thread(target=lambda: [counter.increment() for _ in range(ops_per_thread)])
        for _ in range(n_threads)
    ]
    for t in threads: t.start()
    for t in threads: t.join()
    return counter.value`,
    walkthrough: `The \`Lock\` is acquired before any read-modify-write operation and released after. \`with self._lock:\` is the idiomatic way — it releases even if an exception is raised.

Even the \`value\` property acquires the lock — without it, a thread could read a partially-updated value on 32-bit platforms (though in CPython, \`int\` reads are atomic in practice).

We capture \`counter\` in a lambda default (\`lambda: ...\`) — but here it's already in scope. The threads list comprehension creates N threads before starting any, which is fine.`,
    complexity: 'O(n) with O(1) per operation amortized',
  },

  exercise: {
    problem: `Implement a thread-safe \`BoundedCache\` that:
- Has a max size
- Evicts the oldest entry when full (FIFO eviction)
- Supports \`get(key)\` and \`set(key, value)\`
- Is safe for concurrent reads and writes

Test it by having multiple threads concurrently read and write.`,
    functionName: 'test_bounded_cache',
    starterCode: `import threading
from collections import OrderedDict
from typing import Any

class BoundedCache:
    def __init__(self, max_size: int) -> None: ...
    def get(self, key: str) -> Any | None: ...
    def set(self, key: str, value: Any) -> None: ...
    def size(self) -> int: ...

def test_bounded_cache() -> dict:
    cache = BoundedCache(max_size=3)
    results = {}

    def writer():
        for i in range(10):
            cache.set(f"k{i}", i)

    def reader():
        for i in range(10):
            val = cache.get(f"k{i}")
            if val is not None:
                results[f"k{i}"] = val

    threads = [threading.Thread(target=writer), threading.Thread(target=reader)]
    for t in threads: t.start()
    for t in threads: t.join()

    return {
        "max_size_respected": cache.size() <= 3,
        "no_crash": True,
    }`,
    tests: [
      { name: 'Bounded cache test', input: [], expected: { max_size_respected: true, no_crash: true } },
    ],
    referenceSolution: `import threading
from collections import OrderedDict
from typing import Any

class BoundedCache:
    def __init__(self, max_size: int) -> None:
        self._max_size = max_size
        self._store: OrderedDict[str, Any] = OrderedDict()
        self._lock = threading.Lock()

    def get(self, key: str) -> Any | None:
        with self._lock:
            return self._store.get(key)

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            if key in self._store:
                self._store.move_to_end(key)
            self._store[key] = value
            while len(self._store) > self._max_size:
                self._store.popitem(last=False)  # FIFO: evict oldest

    def size(self) -> int:
        with self._lock:
            return len(self._store)

def test_bounded_cache() -> dict:
    cache = BoundedCache(max_size=3)
    results = {}

    def writer():
        for i in range(10):
            cache.set(f"k{i}", i)

    def reader():
        for i in range(10):
            val = cache.get(f"k{i}")
            if val is not None:
                results[f"k{i}"] = val

    threads = [threading.Thread(target=writer), threading.Thread(target=reader)]
    for t in threads: t.start()
    for t in threads: t.join()

    return {
        "max_size_respected": cache.size() <= 3,
        "no_crash": True,
    }`,
    hints: [
      'Use `threading.Lock()` to protect all access to the internal store.',
      '`OrderedDict` preserves insertion order — `popitem(last=False)` removes the oldest entry (FIFO).',
      'Every public method (`get`, `set`, `size`) should acquire the lock before accessing `_store`.',
    ],
  },
};

export default problem;
