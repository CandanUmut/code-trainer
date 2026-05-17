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
    steps: [
      {
        lines: [1, 2],
        explanation: '`set(nums)` deduplicates the input and gives O(1) membership testing — both properties are essential. `best = 0` tracks the longest sequence found so far (works even if `nums` is empty).',
      },
      {
        lines: [3, 4],
        explanation: 'We iterate over `num_set`, not `nums`, to skip duplicates. The guard `if num - 1 not in num_set` is the key optimization: we only start counting from the *beginning* of a sequence. Without this, starting from every element would re-count each sequence multiple times.',
        stateAfter: [
          { name: 'num (e.g. 1)', value: '1' },
          { name: 'num-1 (0) in set?', value: 'False → start counting' },
        ],
      },
      {
        lines: [5, 6],
        explanation: '`length = 1` seeds the counter for the current sequence. The while loop extends it by checking `num + length` — i.e., the next expected number. Each step increments `length` as long as the consecutive successor exists in the set.',
      },
      {
        lines: [7, 7],
        explanation: '`best` is updated only after the while loop exhausts the current sequence. Because each number can only be the start of one sequence (the guard ensures this), total while-loop iterations across all outer-loop iterations is O(n).',
      },
      {
        lines: [8, 8],
        explanation: 'Return the maximum consecutive sequence length found. The O(n) guarantee holds because every element is visited at most twice: once as a potential start (outer loop) and once during an extension (while loop).',
      },
    ],
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
