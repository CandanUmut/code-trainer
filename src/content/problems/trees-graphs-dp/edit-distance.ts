import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'edit-distance',
  title: 'Edit Distance (Levenshtein)',
  category: 'trees-graphs-dp',
  difficulty: 'hard',
  tags: ['dynamic-programming', '2d-dp', 'string'],
  concept: `## 2D DP on Two Strings

When a problem involves comparing or transforming two strings, think 2D DP where \`dp[i][j]\` represents the answer for prefixes \`s1[:i]\` and \`s2[:j]\`.

**Edit distance recurrence:**
- If \`s1[i-1] == s2[j-1]\`: no operation needed → \`dp[i][j] = dp[i-1][j-1]\`
- Otherwise, take the minimum of three operations:
  - Insert: \`dp[i][j-1] + 1\`
  - Delete: \`dp[i-1][j] + 1\`
  - Replace: \`dp[i-1][j-1] + 1\`

Base cases: transforming empty string to/from any string = that string's length.

\`\`\`python
m, n = len(word1), len(word2)
dp = [[0] * (n+1) for _ in range(m+1)]
for i in range(m+1): dp[i][0] = i
for j in range(n+1): dp[0][j] = j
\`\`\``,

  workedExample: {
    problem: `Given two strings \`word1\` and \`word2\`, return the minimum number of operations (insert, delete, replace) to transform \`word1\` into \`word2\`.

\`\`\`
word1 = "horse", word2 = "ros"   →  3
word1 = "intention", word2 = "execution"  →  5
\`\`\``,
    solution: `def edit_distance(word1: str, word2: str) -> int:
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],      # delete from word1
                    dp[i][j - 1],      # insert into word1
                    dp[i - 1][j - 1],  # replace
                )

    return dp[m][n]`,
    steps: [
      {
        lines: [1, 3],
        explanation: '`dp[i][j]` will store the minimum edits to transform `word1[:i]` into `word2[:j]`. Allocating an `(m+1) × (n+1)` table with the extra row/column enables clean base-case handling for empty prefixes.',
      },
      {
        lines: [5, 8],
        explanation: 'Base cases: `dp[i][0] = i` means transforming `word1[:i]` into an empty string costs `i` deletions. `dp[0][j] = j` means building `word2[:j]` from an empty string costs `j` insertions. These anchor the entire DP table.',
        stateAfter: [
          { name: 'dp[0]', value: '[0, 1, 2, ..., n]' },
          { name: 'dp[i][0]', value: 'i for each row i' },
        ],
      },
      {
        lines: [10, 13],
        explanation: 'When `word1[i-1] == word2[j-1]`, the characters already match — no edit is needed for this position. We carry the diagonal value forward: `dp[i][j] = dp[i-1][j-1]`.',
      },
      {
        lines: [14, 19],
        explanation: 'When characters differ, we pay 1 operation and take the cheapest of three options: delete from `word1` (`dp[i-1][j]`), insert into `word1` (`dp[i][j-1]`), or replace (`dp[i-1][j-1]`). The `min` of these three cells plus 1 gives the optimal subproblem combination.',
      },
      {
        lines: [21, 21],
        explanation: '`dp[m][n]` is the answer — the minimum edits to transform all of `word1` into all of `word2`.',
      },
    ],
    complexity: 'O(m×n) time, O(m×n) space (reducible to O(min(m,n)) with rolling array)',
  },

  exercise: {
    problem: `Given strings \`s\` and \`t\`, count the number of distinct subsequences of \`s\` that equal \`t\`.

\`\`\`
s = "rabbbit", t = "rabbit"  →  3
s = "babgbag",  t = "bag"    →  5
\`\`\``,
    functionName: 'num_distinct_subsequences',
    starterCode: `def num_distinct_subsequences(s: str, t: str) -> int:
    """Count distinct subsequences of s that equal t."""
    ...`,
    tests: [
      { name: 'rabbbit / rabbit', input: ['rabbbit', 'rabbit'], expected: 3 },
      { name: 'babgbag / bag', input: ['babgbag', 'bag'], expected: 5 },
      { name: 'empty t', input: ['abc', ''], expected: 1 },
      { name: 'empty s', input: ['', 'a'], expected: 0 },
      { name: 'same strings', input: ['abc', 'abc'], expected: 1, hidden: true },
    ],
    referenceSolution: `def num_distinct_subsequences(s: str, t: str) -> int:
    m, n = len(s), len(t)
    # dp[i][j] = # ways to form t[:j] using s[:i]
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = 1   # one way to form empty string: take nothing

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i - 1][j]   # skip s[i-1]
            if s[i - 1] == t[j - 1]:
                dp[i][j] += dp[i - 1][j - 1]  # use s[i-1]
    return dp[m][n]`,
    hints: [
      '2D DP: `dp[i][j]` = number of ways to form `t[:j]` from `s[:i]`.',
      'At each cell: always add `dp[i-1][j]` (skip `s[i-1]`). If characters match, also add `dp[i-1][j-1]` (use `s[i-1]`).',
      'Base case: `dp[i][0] = 1` for all i (one way to form empty string).',
    ],
  },
};

export default problem;
