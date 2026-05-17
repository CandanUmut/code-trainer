import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'longest-increasing-subsequence',
  title: 'Longest Increasing Subsequence',
  category: 'trees-graphs-dp',
  difficulty: 'medium',
  tags: ['dynamic-programming', 'binary-search', 'patience-sorting'],
  concept: `## DP with Binary Search Optimization (Patience Sorting)

The naive LIS DP is O(n²): for each index, scan all previous indices to find the longest ending there. The O(n log n) version uses **patience sorting** — maintain a \`tails\` array where \`tails[i]\` is the smallest tail element of all increasing subsequences of length \`i+1\` seen so far.

\`\`\`python
import bisect

tails: list[int] = []
for num in nums:
    pos = bisect.bisect_left(tails, num)
    if pos == len(tails):
        tails.append(num)   # extend LIS
    else:
        tails[pos] = num    # replace — keeps tails as small as possible

return len(tails)
\`\`\`

**Why this works:** \`tails\` is always sorted. \`bisect_left\` finds where \`num\` would fit. If it goes at the end, it extends the LIS. If it replaces a larger value, it doesn't change LIS length but gives future elements a better "entry point".`,

  workedExample: {
    problem: `Given an integer array \`nums\`, return the length of the longest strictly increasing subsequence.

\`\`\`
nums = [10, 9, 2, 5, 3, 7, 101, 18]  →  4  ([2,3,7,18] or [2,5,7,18])
nums = [0, 1, 0, 3, 2, 3]            →  4
\`\`\``,
    solution: `import bisect

def length_of_lis(nums: list[int]) -> int:
    tails: list[int] = []
    for num in nums:
        pos = bisect.bisect_left(tails, num)
        if pos == len(tails):
            tails.append(num)
        else:
            tails[pos] = num
    return len(tails)`,
    walkthrough: `\`tails\` represents the "piles" from patience sorting. Each pile holds the smallest-possible tail for an IS of that length.

When \`num > tails[-1]\`, it extends the longest IS found so far, so we append. When \`num <= tails[-1]\`, it fits somewhere in the middle — \`bisect_left\` finds the first tail ≥ \`num\`, and replacing it with \`num\` keeps that pile's tail as small as possible (greedy choice).

\`tails\` length after processing all elements equals the LIS length. Note: \`tails\` itself is not a valid IS — it's a bookkeeping structure.`,
    complexity: 'O(n log n) time, O(n) space',
  },

  exercise: {
    problem: `Given an integer array \`nums\`, return the **actual longest increasing subsequence** (the elements, not just the length). If multiple LIS exist, return any one of them.

\`\`\`
nums = [10, 9, 2, 5, 3, 7, 101, 18]
→ [2, 3, 7, 18]  (or [2, 5, 7, 18] or [2, 5, 7, 101])
\`\`\``,
    functionName: 'find_lis',
    starterCode: `def find_lis(nums: list[int]) -> list[int]:
    """Return any one valid longest increasing subsequence."""
    ...`,
    tests: [
      {
        name: 'Basic',
        input: [[10, 9, 2, 5, 3, 7, 101, 18]],
        expected: [2, 3, 7, 18],
      },
      { name: 'Already sorted', input: [[1, 2, 3, 4, 5]], expected: [1, 2, 3, 4, 5] },
      { name: 'Single element', input: [[42]], expected: [42] },
      { name: 'Descending', input: [[5, 4, 3, 2, 1]], expected: [1] },
      { name: 'With duplicates', input: [[1, 3, 2, 3, 4]], expected: [1, 2, 3, 4], hidden: true },
    ],
    referenceSolution: `def find_lis(nums: list[int]) -> list[int]:
    if not nums:
        return []
    n = len(nums)
    # dp[i] = length of LIS ending at index i
    dp = [1] * n
    parent = [-1] * n
    for i in range(1, n):
        for j in range(i):
            if nums[j] < nums[i] and dp[j] + 1 > dp[i]:
                dp[i] = dp[j] + 1
                parent[i] = j
    # Reconstruct: find the index with max dp value
    best_idx = max(range(n), key=lambda i: dp[i])
    path: list[int] = []
    idx = best_idx
    while idx != -1:
        path.append(nums[idx])
        idx = parent[idx]
    return path[::-1]`,
    hints: [
      'To reconstruct the actual sequence, use the O(n²) DP with a `parent` array that tracks which previous element was extended.',
      '`dp[i]` = LIS length ending at index `i`. `parent[i]` = the index in `nums` we extended from.',
      'After computing dp, find `max(dp)` index, then follow `parent` pointers backward to reconstruct the path.',
    ],
  },
};

export default problem;
