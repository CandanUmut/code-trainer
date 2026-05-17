import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'two-sum',
  title: 'Two Sum',
  category: 'arrays-strings-hashmaps',
  difficulty: 'easy',
  tags: ['hashmap', 'array'],
  concept: `## Hash Maps for O(n) Lookups

When you need to check whether a value exists in a collection, the naive approach is to scan the whole collection — O(n) per check. A hash map (Python \`dict\`) gives you O(1) average-case lookup.

**The pattern:**
1. Iterate over the input once.
2. At each element, ask "do I already have what I need to pair with this?"
3. If yes → you found the answer. If no → record this element in the map and continue.

This trades O(n) space for O(n) time instead of O(n²) time. For interview problems where the brute force is a nested loop, suspect that a hash map will reduce the outer loop.

\`\`\`python
# Brute force O(n²)
for i in range(len(nums)):
    for j in range(i + 1, len(nums)):
        if nums[i] + nums[j] == target:
            return [i, j]

# Hash map O(n)
seen: dict[int, int] = {}
for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        return [seen[complement], i]
    seen[num] = i
\`\`\`

The key insight: instead of asking "for this element, find its pair" (O(n) scan), ask "have I *already seen* this element's pair?" (O(1) dict lookup).`,

  workedExample: {
    problem: `Given an array of integers \`nums\` and an integer \`target\`, return the **indices** of the two numbers that add up to \`target\`.

Assume exactly one solution exists. You may not use the same element twice.

**Example:**
\`\`\`
nums = [2, 7, 11, 15], target = 9
→ [0, 1]  # nums[0] + nums[1] == 9
\`\`\``,
    solution: `from typing import Optional

def two_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []  # guaranteed to find one by problem statement`,
    walkthrough: `We use \`seen\` to map each number to its index as we go.

For each \`num\` at index \`i\`, we compute \`complement = target - num\` — the value we *need* to form \`target\`. If \`complement\` is already in \`seen\`, we've previously encountered exactly what we need, so we return \`[seen[complement], i]\`.

If not, we store \`seen[num] = i\` and move on. We never need to look back further because: if a valid pair exists, one element will be the "complement seeker" and the other will already be in \`seen\` when we reach it.

The \`enumerate\` call avoids manual index tracking with \`range(len(nums))\` — idiomatic Python.`,
    complexity: 'O(n) time, O(n) space',
  },

  exercise: {
    problem: `Given an array of integers \`nums\` and an integer \`k\`, return the **total number of contiguous subarrays** whose elements sum to \`k\`.

**Example:**
\`\`\`
nums = [1, 1, 1], k = 2
→ 2  # subarrays [1,1] at indices [0,1] and [1,2]

nums = [1, 2, 3], k = 3
→ 2  # [1,2] and [3]
\`\`\`

**Hint direction:** prefix sums + hash map. \`prefix[i] - prefix[j] == k\` means the subarray \`nums[j..i]\` sums to \`k\`.`,
    functionName: 'subarray_sum',
    starterCode: `def subarray_sum(nums: list[int], k: int) -> int:
    """Return count of contiguous subarrays that sum to k."""
    ...`,
    tests: [
      { name: 'Basic [1,1,1] k=2', input: [[1, 1, 1], 2], expected: 2 },
      { name: 'Mixed [1,2,3] k=3', input: [[1, 2, 3], 3], expected: 2 },
      { name: 'Single element equals k', input: [[3], 3], expected: 1 },
      { name: 'No valid subarray', input: [[1, 2, 3], 7], expected: 0 },
      {
        name: 'Negative numbers',
        input: [[-1, -1, 1], 0],
        expected: 1,
        hidden: true,
      },
      {
        name: 'Large input performance',
        input: [Array.from({ length: 1000 }, (_, i) => i % 5), 3],
        expected: 400,
        hidden: true,
      },
    ],
    referenceSolution: `def subarray_sum(nums: list[int], k: int) -> int:
    count = 0
    prefix = 0
    # prefix_counts[s] = how many times prefix sum s has appeared
    prefix_counts: dict[int, int] = {0: 1}
    for num in nums:
        prefix += num
        # If prefix - k appeared before, those subarrays sum to k
        count += prefix_counts.get(prefix - k, 0)
        prefix_counts[prefix] = prefix_counts.get(prefix, 0) + 1
    return count`,
    hints: [
      'Think about prefix sums: `prefix[i]` is the sum of `nums[0..i]`. A subarray `nums[j..i]` sums to `k` when `prefix[i] - prefix[j-1] == k`.',
      'Rearrange: `prefix[j-1] == prefix[i] - k`. So at index `i`, ask "how many previous prefix sums equal `prefix[i] - k`?"',
      'Store a frequency map of prefix sums seen so far. Initialize it with `{0: 1}` to handle subarrays starting at index 0.',
    ],
  },
};

export default problem;
