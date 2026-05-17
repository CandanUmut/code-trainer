import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'longest-consecutive',
  title: 'Longest Consecutive Sequence',
  category: 'arrays-strings-hashmaps',
  difficulty: 'hard',
  tags: ['hashset', 'array'],
  concept: `## O(n) Sequence Detection with a Hash Set

To find sequences in unsorted data without sorting (which costs O(n log n)), put all values into a **hash set** for O(1) membership testing.

The insight for consecutive sequences: only start counting from the **beginning** of a sequence — i.e., where \`num - 1\` is NOT in the set. This ensures each sequence is counted exactly once.

\`\`\`python
num_set = set(nums)
best = 0
for num in num_set:
    if num - 1 not in num_set:   # start of a sequence
        length = 1
        while num + length in num_set:
            length += 1
        best = max(best, length)
return best
\`\`\`

Total work: each number is visited at most twice (once in the outer loop, once as part of a sequence extension). So O(n) overall despite the nested while loop.`,

  workedExample: {
    problem: `Given an unsorted array of integers, find the length of the longest consecutive sequence.

Must run in O(n).

\`\`\`
nums = [100, 4, 200, 1, 3, 2]  →  4  (sequence: 1,2,3,4)
nums = [0,3,7,2,5,8,4,6,0,1]  →  9
\`\`\``,
    solution: `def longest_consecutive(nums: list[int]) -> int:
    num_set = set(nums)
    best = 0
    for num in num_set:
        if num - 1 not in num_set:
            length = 1
            while num + length in num_set:
                length += 1
            best = max(best, length)
    return best`,
    walkthrough: `Converting to a set deduplicates and enables O(1) lookups.

We only begin counting from a number \`num\` where \`num - 1\` is absent — that's the start of a new sequence. This is the key optimization: without it, we'd re-count every element of every sequence.

From each sequence start, we extend forward (\`num+1\`, \`num+2\`, ...) using the set. The while loop for a sequence of length L runs L times, but each element starts exactly one sequence, so total work across all sequences is O(n).`,
    complexity: 'O(n) time, O(n) space',
  },

  exercise: {
    problem: `Given an unsorted integer array \`nums\`, return **all** consecutive sequences of length ≥ 2, sorted by start value.

Each sequence is returned as a list \`[start, end]\` (inclusive).

\`\`\`
nums = [100, 4, 200, 1, 3, 2]
→ [[1, 4], [100, 100]]  # [100,100] length=1, excluded → [[1,4]]
→ [[1, 4]]

nums = [1, 2, 3, 10, 11]
→ [[1, 3], [10, 11]]
\`\`\``,
    functionName: 'find_consecutive_sequences',
    starterCode: `def find_consecutive_sequences(nums: list[int]) -> list[list[int]]:
    """Return all consecutive sequences of length >= 2 as [start, end], sorted by start."""
    ...`,
    tests: [
      { name: 'Basic example', input: [[100, 4, 200, 1, 3, 2]], expected: [[1, 4]] },
      {
        name: 'Two sequences',
        input: [[1, 2, 3, 10, 11]],
        expected: [
          [1, 3],
          [10, 11],
        ],
      },
      { name: 'No sequences', input: [[1, 3, 5]], expected: [] },
      { name: 'Empty', input: [[]], expected: [] },
      {
        name: 'Duplicates',
        input: [[1, 1, 2, 2, 3]],
        expected: [[1, 3]],
        hidden: true,
      },
    ],
    referenceSolution: `def find_consecutive_sequences(nums: list[int]) -> list[list[int]]:
    num_set = set(nums)
    result: list[list[int]] = []
    for num in num_set:
        if num - 1 not in num_set:
            length = 1
            while num + length in num_set:
                length += 1
            if length >= 2:
                result.append([num, num + length - 1])
    result.sort()
    return result`,
    hints: [
      'Adapt the worked example: only start counting from numbers where `num-1` is not in the set.',
      'After extending the sequence, only add it to results if length >= 2.',
      'Sort the result list before returning — `result.sort()` sorts by first element by default.',
    ],
  },
};

export default problem;
