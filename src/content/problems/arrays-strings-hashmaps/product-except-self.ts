import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'product-except-self',
  title: 'Product of Array Except Self',
  category: 'arrays-strings-hashmaps',
  difficulty: 'medium',
  tags: ['prefix-product', 'array'],
  concept: `## Prefix and Suffix Passes

When a problem asks for something about "all elements except the current one", consider computing **prefix** and **suffix** aggregates separately, then combining them.

For products: \`result[i] = product(nums[:i]) * product(nums[i+1:])\`

Instead of recomputing each slice, do two O(n) passes:
\`\`\`python
n = len(nums)
prefix = [1] * n   # prefix[i] = product of nums[0..i-1]
suffix = [1] * n   # suffix[i] = product of nums[i+1..n-1]

for i in range(1, n):
    prefix[i] = prefix[i-1] * nums[i-1]

for i in range(n-2, -1, -1):
    suffix[i] = suffix[i+1] * nums[i+1]

result = [prefix[i] * suffix[i] for i in range(n)]
\`\`\`

Space-optimized: build the result array as the prefix pass, then multiply in the suffix on a second pass using a running variable — O(1) extra space.`,

  workedExample: {
    problem: `Given an integer array \`nums\`, return an array \`output\` such that \`output[i]\` is the product of all elements of \`nums\` except \`nums[i]\`.

Must run in O(n) without using division.

\`\`\`
nums = [1, 2, 3, 4]  →  [24, 12, 8, 6]
nums = [-1, 1, 0, -3, 3]  →  [0, 0, 9, 0, 0]
\`\`\``,
    solution: `def product_except_self(nums: list[int]) -> list[int]:
    n = len(nums)
    result = [1] * n

    # First pass: result[i] = product of nums[0..i-1]
    prefix = 1
    for i in range(n):
        result[i] = prefix
        prefix *= nums[i]

    # Second pass: multiply in product of nums[i+1..n-1]
    suffix = 1
    for i in range(n - 1, -1, -1):
        result[i] *= suffix
        suffix *= nums[i]

    return result`,
    steps: [
      {
        lines: [1, 3],
        explanation: '`result = [1] * n` allocates the output array pre-filled with 1s. Using 1 as the identity element for multiplication means we can multiply partial products directly into it without a special-case for the first element.',
      },
      {
        lines: [5, 9],
        explanation: 'The first pass (left to right) fills `result[i]` with the product of all elements **before** index `i`. `prefix` accumulates as we go: before storing into `result[i]`, `prefix` excludes `nums[i]`; then we update `prefix *= nums[i]` so the next index includes it.',
        stateAfter: [
          { name: 'result after pass 1 (e.g. [1,2,3,4])', value: '[1, 1, 2, 6]' },
        ],
      },
      {
        lines: [11, 15],
        explanation: 'The second pass (right to left) multiplies each `result[i]` by `suffix` — the running product of all elements **after** index `i`. Critically, `result[i] *= suffix` happens **before** `suffix *= nums[i]`, so `suffix` at each position excludes `nums[i]` itself.',
        stateAfter: [
          { name: 'result after pass 2 (e.g. [1,2,3,4])', value: '[24, 12, 8, 6]' },
        ],
      },
      {
        lines: [17, 17],
        explanation: 'After both passes, `result[i]` contains the product of all elements to the left of `i` multiplied by all elements to the right — exactly the product of everything except `nums[i]`. O(1) extra space because no separate prefix/suffix arrays were allocated.',
      },
    ],
    complexity: 'O(n) time, O(1) extra space (output array not counted)',
  },

  exercise: {
    problem: `Given an integer array \`nums\`, return an array where each element is the **sum of all elements except itself**.

O(n) time required. You may use O(1) extra space (output array not counted).

\`\`\`
nums = [1, 2, 3, 4]  →  [9, 8, 7, 6]
nums = [5, 5, 5]     →  [10, 10, 10]
\`\`\``,
    functionName: 'sum_except_self',
    starterCode: `def sum_except_self(nums: list[int]) -> list[int]:
    """Return array where result[i] = sum of all nums except nums[i]."""
    ...`,
    tests: [
      { name: 'Basic [1,2,3,4]', input: [[1, 2, 3, 4]], expected: [9, 8, 7, 6] },
      { name: 'All same', input: [[5, 5, 5]], expected: [10, 10, 10] },
      { name: 'Single element', input: [[42]], expected: [0] },
      { name: 'With negatives', input: [[-1, 2, -3, 4]], expected: [3, 0, 5, -2], hidden: true },
      { name: 'Two elements', input: [[3, 7]], expected: [7, 3], hidden: true },
    ],
    referenceSolution: `def sum_except_self(nums: list[int]) -> list[int]:
    total = sum(nums)
    return [total - n for n in nums]`,
    hints: [
      'Unlike products, sums have a simpler trick: compute the total sum once, then subtract each element.',
      'Total sum can be computed with the built-in `sum()`. Then `result[i] = total - nums[i]`.',
      'This is O(n) time and O(1) extra space (the output array is not counted).',
    ],
  },
};

export default problem;
