import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'comprehensions',
  title: 'Advanced Comprehensions and Generator Expressions',
  category: 'pythonic-idioms',
  difficulty: 'easy',
  tags: ['comprehensions', 'generators', 'functional'],
  concept: `## List, Dict, Set Comprehensions and Generator Expressions

Comprehensions replace manual loop-and-append patterns with a single declarative expression. They're faster (the loop runs in C) and more readable when the transform is simple.

\`\`\`python
# List comprehension: [expression for item in iterable if condition]
squares = [x**2 for x in range(10) if x % 2 == 0]

# Dict comprehension
freq = {ch: s.count(ch) for ch in set(s)}

# Set comprehension
unique_lengths = {len(w) for w in words}

# Generator expression (lazy — doesn't build a list)
total = sum(x**2 for x in range(1_000_000))  # no 1M-element list

# Nested comprehension (matrix transpose)
transposed = [[row[i] for row in matrix] for i in range(len(matrix[0]))]
\`\`\`

**When NOT to use:** if the logic requires multiple statements per item, a regular loop is clearer. Don't chain more than two levels of nesting — the readability cost exceeds the elegance benefit.`,

  workedExample: {
    problem: `Given a list of strings, return a dict mapping each string to a list of its character frequencies (only characters appearing more than once), using only comprehensions (no explicit \`for\` loops).

\`\`\`
["hello", "world"]
→ {"hello": {'l': 2}, "world": {}}
\`\`\``,
    solution: `def char_freq_filtered(words: list[str]) -> dict[str, dict[str, int]]:
    return {
        word: {ch: word.count(ch) for ch in set(word) if word.count(ch) > 1}
        for word in words
    }`,
    steps: [
      {
        lines: [1, 5],
        explanation: 'The entire function body is a single nested dict comprehension. The outer level `{ word: ... for word in words }` iterates over each word and maps it to the result of the inner comprehension.',
      },
      {
        lines: [3, 3],
        explanation: 'The inner comprehension `{ch: word.count(ch) for ch in set(word) if word.count(ch) > 1}` does three things: `set(word)` deduplicates characters so each is considered once; `word.count(ch)` computes the frequency; the `if` clause filters out characters appearing only once.',
        stateAfter: [
          { name: 'inner dict for "hello"', value: "{'l': 2}" },
          { name: 'inner dict for "world"', value: '{}' },
        ],
      },
      {
        lines: [2, 5],
        explanation: 'The outer comprehension closes the dict and returns it. Each word becomes a key; words with no repeated characters map to an empty dict `{}`. This two-level nesting replaces what would otherwise be two nested loops with explicit `.append()` calls.',
      },
    ],
    complexity: 'O(n·k²) where k is average word length',
  },

  exercise: {
    problem: `Given a matrix (list of lists) of integers, return:
1. A **transposed** version of the matrix (swap rows and columns)
2. A **flat list** of all elements that are prime numbers, in row-major order

\`\`\`
matrix = [[1,2,3],[4,5,6],[7,8,9]]
transpose → [[1,4,7],[2,5,8],[3,6,9]]
primes    → [2,3,5,7]
\`\`\`

Return a tuple \`(transposed, primes)\`. Use comprehensions for both.`,
    functionName: 'matrix_ops',
    starterCode: `def matrix_ops(matrix: list[list[int]]) -> tuple[list[list[int]], list[int]]:
    """Return (transposed_matrix, prime_elements_in_row_major_order)."""
    ...`,
    tests: [
      {
        name: 'Basic 3x3',
        input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
        expected: [
          [
            [1, 4, 7],
            [2, 5, 8],
            [3, 6, 9],
          ],
          [2, 3, 5, 7],
        ],
      },
      {
        name: '2x3 matrix',
        input: [[[1, 2, 3], [4, 5, 6]]],
        expected: [
          [
            [1, 4],
            [2, 5],
            [3, 6],
          ],
          [2, 3, 5],
        ],
      },
      {
        name: '1x1',
        input: [[[7]]],
        expected: [[[7]], [7]],
      },
    ],
    referenceSolution: `def matrix_ops(matrix: list[list[int]]) -> tuple[list[list[int]], list[int]]:
    def is_prime(n: int) -> bool:
        if n < 2:
            return False
        return all(n % i != 0 for i in range(2, int(n**0.5) + 1))

    rows, cols = len(matrix), len(matrix[0])
    transposed = [[matrix[r][c] for r in range(rows)] for c in range(cols)]
    primes = [n for row in matrix for n in row if is_prime(n)]
    return transposed, primes`,
    hints: [
      'Transpose: `[[matrix[r][c] for r in range(rows)] for c in range(cols)]`.',
      'Flat list from nested: `[n for row in matrix for n in row]` — the outer loop first, inner loop second.',
      'For primality: `all(n % i != 0 for i in range(2, int(n**0.5) + 1))`.',
    ],
  },
};

export default problem;
