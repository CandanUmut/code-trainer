import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'functools-reduce',
  title: 'Functional Pipelines with functools and operator',
  category: 'pythonic-idioms',
  difficulty: 'medium',
  tags: ['functools', 'operator', 'functional', 'higher-order'],
  concept: `## functools.reduce and the operator Module

\`functools.reduce(fn, iterable, initializer)\` folds a sequence left-to-right: \`fn(fn(fn(init, a), b), c)\`. Use it when you need to aggregate a sequence with a binary operation.

\`\`\`python
from functools import reduce
from operator import mul

product = reduce(mul, [1, 2, 3, 4, 5])   # 120
\`\`\`

The \`operator\` module provides function equivalents of operators (\`operator.add\`, \`operator.mul\`, \`operator.itemgetter\`, \`operator.attrgetter\`, ...). This lets you pass operators as first-class functions.

**When to use reduce:** when the aggregation is more complex than \`sum()\`/\`max()\` can express. For simple cases, prefer the built-in.

\`\`\`python
# Compute GCD of a list
from math import gcd
from functools import reduce

total_gcd = reduce(gcd, numbers)
\`\`\``,

  workedExample: {
    problem: `Given a list of dicts with keys \`"name"\` and \`"score"\`, return the name of the person with the highest score using functional-style Python (no explicit loops).

\`\`\`
[{"name": "Alice", "score": 92}, {"name": "Bob", "score": 88}, {"name": "Carol", "score": 95}]
→ "Carol"
\`\`\``,
    solution: `from functools import reduce

def top_scorer(records: list[dict]) -> str:
    best = reduce(
        lambda a, b: a if a["score"] >= b["score"] else b,
        records
    )
    return best["name"]`,
    steps: [
      {
        lines: [1, 1],
        explanation: '`functools.reduce` is imported — it is not a built-in in Python 3 (unlike Python 2). It folds a binary function over a sequence left to right: `f(f(f(a, b), c), d) ...`.',
      },
      {
        lines: [3, 7],
        explanation: '`reduce` with the lambda `lambda a, b: a if a["score"] >= b["score"] else b` acts as a running maximum: after each comparison, the "winner" (higher-scored record) becomes the new accumulator `a`. After all records are processed, `best` is the record with the highest score.',
        stateAfter: [
          { name: 'after step 1', value: 'a = {"Alice": 92} vs b = {"Bob": 88} → a wins' },
          { name: 'after step 2', value: 'a = {"Alice": 92} vs b = {"Carol": 95} → b wins' },
        ],
      },
      {
        lines: [8, 8],
        explanation: '`best["name"]` extracts the name from the winning record. Note: `max(records, key=lambda r: r["score"])["name"]` is more readable for this specific case — `reduce` demonstrates the pattern but `max` is preferred when Python has a built-in for the aggregation.',
      },
    ],
    complexity: 'O(n) time, O(1) space',
  },

  exercise: {
    problem: `Given a list of integers, use \`functools.reduce\` to compute the **product of all numbers** (not using any loops or comprehensions — only functional tools). Return 1 for an empty list.

Then, given a nested list of integers (arbitrary depth), flatten it into a single list using a recursive generator. Both functions required.

\`\`\`
list_product([1, 2, 3, 4, 5])   →  120
list_product([])                 →  1
deep_flatten([1,[2,[3,4]],5])   →  [1,2,3,4,5]
\`\`\``,
    functionName: 'list_product_and_flatten',
    starterCode: `from functools import reduce
from operator import mul
from typing import Any

def list_product(nums: list[int]) -> int:
    """Product of all numbers using functools.reduce. Return 1 for empty list."""
    ...

def deep_flatten(nested: list[Any]) -> list[int]:
    """Flatten arbitrarily nested list of ints."""
    ...

def list_product_and_flatten(nums: list[int], nested: list[Any]) -> tuple[int, list[int]]:
    """Return (list_product(nums), deep_flatten(nested))."""
    return list_product(nums), deep_flatten(nested)`,
    tests: [
      {
        name: 'Basic product and flatten',
        input: [[1, 2, 3, 4, 5], [1, [2, [3, 4]], 5]],
        expected: [120, [1, 2, 3, 4, 5]],
      },
      { name: 'Empty product', input: [[], [1, 2]], expected: [1, [1, 2]] },
      {
        name: 'Deeply nested',
        input: [[2, 3], [1, [2, [3, [4, [5]]]]]],
        expected: [6, [1, 2, 3, 4, 5]],
      },
      { name: 'Flat nested', input: [[10], [1, 2, 3]], expected: [10, [1, 2, 3]], hidden: true },
    ],
    referenceSolution: `from functools import reduce
from operator import mul
from typing import Any

def list_product(nums: list[int]) -> int:
    return reduce(mul, nums, 1)  # initial value 1 handles empty list

def deep_flatten(nested: list[Any]) -> list[int]:
    def _flatten(x: Any):
        if isinstance(x, list):
            for item in x:
                yield from _flatten(item)
        else:
            yield x
    return list(_flatten(nested))

def list_product_and_flatten(nums: list[int], nested: list[Any]) -> tuple[int, list[int]]:
    return list_product(nums), deep_flatten(nested)`,
    hints: [
      'For `list_product`: `reduce(mul, nums, 1)` — the third argument is the initial value, which also handles empty lists.',
      'For `deep_flatten`: write a recursive generator that `yield from`s itself on lists and `yield`s scalars directly.',
      '`isinstance(x, list)` distinguishes lists from ints.',
    ],
  },
};

export default problem;
