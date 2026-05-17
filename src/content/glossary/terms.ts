import type { GlossaryTerm } from '../../types';

/**
 * Seed glossary. Real terms, precise definitions. Lessons and steps may add
 * more terms at runtime (see lib/glossary.ts) — these are the always-present base.
 * `id` is the slug used in `{{term:slug}}` markdown references.
 */
export const seedGlossary: GlossaryTerm[] = [
  {
    id: 'hashmap',
    term: 'Hash map',
    definition:
      'A data structure that maps keys to values with average-case O(1) lookup, insert, and delete. In Python this is `dict`. A hash function converts each key into an index into an internal array; collisions are resolved internally so you never see them.',
    example: "ages = {'ada': 36, 'alan': 41}; ages['ada']  # 36",
  },
  {
    id: 'hash-function',
    term: 'Hash function',
    definition:
      'A function that maps an arbitrary value to a fixed-size integer. Equal values must produce equal hashes. Python uses it to place dict keys and set members; this is why keys must be hashable (immutable).',
    example: 'hash("abc")  # some int, stable within one run',
  },
  {
    id: 'idempotent',
    term: 'Idempotent',
    definition:
      'An operation that produces the same result whether you run it once or many times. `set.add(x)` is idempotent; `list.append(x)` is not (the list grows each call).',
  },
  {
    id: 'side-effect',
    term: 'Side effect',
    definition:
      'A change a function makes to state outside its own scope — mutating a global, writing a file, or mutating an argument passed in. A pure function has no side effects and depends only on its inputs.',
  },
  {
    id: 'pure-function',
    term: 'Pure function',
    definition:
      'A function whose output depends only on its inputs and which has no side effects. Pure functions are easy to test, cache, and reason about.',
  },
  {
    id: 'mutable',
    term: 'Mutable',
    definition:
      'A value that can be changed in place after creation. `list`, `dict`, and `set` are mutable. Mutating a value is visible through every reference to it.',
    example: 'a = [1]; b = a; b.append(2); a  # [1, 2]',
  },
  {
    id: 'immutable',
    term: 'Immutable',
    definition:
      'A value that cannot be changed after creation. `int`, `float`, `str`, `tuple`, and `frozenset` are immutable. "Modifying" one actually creates a new object.',
  },
  {
    id: 'hashable',
    term: 'Hashable',
    definition:
      'A value that has a hash that never changes over its lifetime, so it can be a dict key or set member. Immutable built-ins are hashable; `list` and `dict` are not.',
  },
  {
    id: 'iterable',
    term: 'Iterable',
    definition:
      'Any object you can loop over with `for` — lists, strings, dicts, sets, generators, files. Formally, an object that returns an iterator from `iter()`.',
  },
  {
    id: 'iterator',
    term: 'Iterator',
    definition:
      'An object that produces values one at a time via `next()` and raises `StopIteration` when exhausted. An iterator is consumed once — you cannot rewind it.',
  },
  {
    id: 'generator',
    term: 'Generator',
    definition:
      'A lazy iterator defined with a function that uses `yield`, or with a generator expression. It produces values on demand instead of building the whole sequence in memory.',
    example: 'squares = (x*x for x in range(10))',
  },
  {
    id: 'lazy-evaluation',
    term: 'Lazy evaluation',
    definition:
      'Computing a value only when it is actually needed, rather than up front. Generators, `range`, and `map` are lazy — they produce items on demand.',
  },
  {
    id: 'list-comprehension',
    term: 'List comprehension',
    definition:
      'A concise expression that builds a list by transforming and/or filtering an iterable: `[expr for item in iterable if condition]`.',
    example: '[x*x for x in range(5) if x % 2 == 0]  # [0, 4, 16]',
  },
  {
    id: 'slice',
    term: 'Slice',
    definition:
      'A sub-sequence selected with `seq[start:stop:step]`. `stop` is exclusive. Omitted bounds default to the ends; a negative `step` reverses.',
    example: 'nums[1:4]  # items at indices 1, 2, 3',
  },
  {
    id: 'truthy',
    term: 'Truthy / Falsy',
    definition:
      'Any value used in a boolean context counts as true or false. Falsy values: `False`, `None`, `0`, `0.0`, `\'\'`, `[]`, `{}`, `set()`. Everything else is truthy.',
  },
  {
    id: 'identity-vs-equality',
    term: 'Identity vs equality',
    definition:
      '`==` asks "are these values equal?"; `is` asks "are these the exact same object in memory?". Use `is` only for `None`, `True`, `False`.',
  },
  {
    id: 'late-binding',
    term: 'Late binding',
    definition:
      'A closure looks up the variables it captures when it is called, not when it is defined. This is why all functions made in a loop can see the loop variable\'s final value.',
  },
  {
    id: 'closure',
    term: 'Closure',
    definition:
      'A function that captures and remembers variables from the enclosing scope where it was defined, even after that scope has returned.',
  },
  {
    id: 'mutable-default-argument',
    term: 'Mutable default argument',
    definition:
      'A default argument value is evaluated once, when the function is defined. A `def f(x=[])` shares one list across all calls — a classic bug. Use `None` as the default instead.',
  },
  {
    id: 'time-complexity',
    term: 'Time complexity',
    definition:
      'How an algorithm\'s running time grows as the input size n grows, expressed with Big-O notation (`O(n)`, `O(n^2)`, `O(log n)`).',
  },
  {
    id: 'space-complexity',
    term: 'Space complexity',
    definition:
      'How much extra memory an algorithm uses as a function of input size n, ignoring the input itself.',
  },
  {
    id: 'big-o',
    term: 'Big-O notation',
    definition:
      'An upper bound on growth rate, ignoring constants and lower-order terms. `O(2n + 3)` is just `O(n)`. It describes how cost scales, not absolute speed.',
  },
  {
    id: 'amortized',
    term: 'Amortized cost',
    definition:
      'The average cost per operation across a long sequence of operations. `list.append` is amortized O(1): occasional resizes are O(n) but rare enough to average out.',
  },
  {
    id: 'prefix-sum',
    term: 'Prefix sum',
    definition:
      'A running total where `prefix[i]` is the sum of all elements up to index i. The sum of any subarray j..i is `prefix[i] - prefix[j-1]`, computed in O(1).',
  },
  {
    id: 'sliding-window',
    term: 'Sliding window',
    definition:
      'A technique that maintains a contiguous range over a sequence, expanding and shrinking its bounds to scan all valid windows in O(n) instead of O(n^2).',
  },
  {
    id: 'two-pointer',
    term: 'Two-pointer technique',
    definition:
      'Using two indices that move through a sequence (often from both ends, or at different speeds) to solve a problem in one linear pass.',
  },
  {
    id: 'recursion',
    term: 'Recursion',
    definition:
      'A function that solves a problem by calling itself on a smaller piece of the same problem, until it reaches a base case that needs no further recursion.',
  },
  {
    id: 'base-case',
    term: 'Base case',
    definition:
      'The condition in a recursive function that returns directly without recursing. Without a correct base case, recursion never stops and you hit a RecursionError.',
  },
  {
    id: 'call-stack',
    term: 'Call stack',
    definition:
      'The stack of currently-running function calls. Each call adds a frame holding its local variables; returning pops the frame. Deep recursion can overflow it.',
  },
  {
    id: 'memoization',
    term: 'Memoization',
    definition:
      'Caching the result of a function for each set of arguments so repeated calls return instantly. `functools.lru_cache` adds memoization to any function.',
  },
  {
    id: 'dynamic-programming',
    term: 'Dynamic programming',
    definition:
      'Solving a problem by combining solutions to overlapping subproblems, each solved once and reused — either top-down with memoization or bottom-up with a table.',
  },
  {
    id: 'dfs',
    term: 'Depth-first search (DFS)',
    definition:
      'A traversal that follows one path as deep as possible before backtracking. Implemented with recursion or an explicit stack.',
  },
  {
    id: 'bfs',
    term: 'Breadth-first search (BFS)',
    definition:
      'A traversal that visits all nodes at the current distance before moving further out. Implemented with a queue; finds shortest paths in unweighted graphs.',
  },
  {
    id: 'binary-tree',
    term: 'Binary tree',
    definition:
      'A tree where each node has at most two children, conventionally called `left` and `right`.',
  },
  {
    id: 'graph',
    term: 'Graph',
    definition:
      'A set of nodes connected by edges. Edges may be directed or undirected. Commonly stored as an adjacency list: a dict mapping each node to its neighbors.',
  },
  {
    id: 'topological-sort',
    term: 'Topological sort',
    definition:
      'An ordering of a directed acyclic graph\'s nodes such that every edge points forward. Used to schedule tasks with dependencies.',
  },
  {
    id: 'decorator',
    term: 'Decorator',
    definition:
      'A callable that takes a function and returns a replacement function, applied with `@name` syntax. Used to add behavior (logging, caching, timing) without editing the original.',
  },
  {
    id: 'context-manager',
    term: 'Context manager',
    definition:
      'An object usable with `with` that runs setup on entry and guaranteed cleanup on exit, even if an exception is raised. Files and locks are context managers.',
  },
  {
    id: 'unpacking',
    term: 'Unpacking',
    definition:
      'Assigning the elements of an iterable to multiple variables at once: `a, b = pair`. `*rest` captures the leftover items.',
    example: 'first, *rest = [1, 2, 3]  # first=1, rest=[2, 3]',
  },
  {
    id: 'enumerate',
    term: 'enumerate',
    definition:
      'A built-in that pairs each item of an iterable with its index: `for i, x in enumerate(seq)`. Cleaner than indexing with `range(len(seq))`.',
  },
  {
    id: 'comprehension',
    term: 'Comprehension',
    definition:
      'A compact expression that builds a list, set, dict, or generator from an iterable in one line. List, set, dict, and generator comprehensions share the same shape.',
  },
  {
    id: 'dunder',
    term: 'Dunder method',
    definition:
      'A "double underscore" method like `__init__`, `__eq__`, `__len__`. Python calls these automatically to implement operators and built-in behavior on your objects.',
  },
  {
    id: 'duck-typing',
    term: 'Duck typing',
    definition:
      'Code that depends on what an object can do (its methods), not its declared type. "If it walks like a duck and quacks like a duck, treat it as a duck."',
  },
  {
    id: 'protocol',
    term: 'Protocol',
    definition:
      'A typing construct describing a set of methods/attributes an object must have. A class satisfies a Protocol structurally — no inheritance required.',
  },
  {
    id: 'dataclass',
    term: 'Dataclass',
    definition:
      'A class decorated with `@dataclass` that auto-generates `__init__`, `__repr__`, and `__eq__` from typed field declarations, removing boilerplate.',
  },
  {
    id: 'gil',
    term: 'Global Interpreter Lock (GIL)',
    definition:
      'A lock in CPython that lets only one thread execute Python bytecode at a time. Threads still help with I/O-bound work but not CPU-bound work.',
  },
  {
    id: 'coroutine',
    term: 'Coroutine',
    definition:
      'A function defined with `async def`. Calling it returns a coroutine object that does nothing until awaited or scheduled on an event loop.',
  },
  {
    id: 'event-loop',
    term: 'Event loop',
    definition:
      'The asyncio scheduler that runs coroutines, pausing each one at `await` points and resuming it when its awaited result is ready.',
  },
  {
    id: 'race-condition',
    term: 'Race condition',
    definition:
      'A bug where the result depends on the unpredictable timing of concurrent operations interleaving on shared state.',
  },
  {
    id: 'in-place',
    term: 'In-place operation',
    definition:
      'An operation that modifies an existing object instead of returning a new one. `list.sort()` sorts in place and returns `None`; `sorted(list)` returns a new list.',
  },
  {
    id: 'shadowing',
    term: 'Shadowing',
    definition:
      'Defining a local name that hides a built-in or outer-scope name of the same name, e.g. naming a variable `list` or `sum`.',
  },
];
