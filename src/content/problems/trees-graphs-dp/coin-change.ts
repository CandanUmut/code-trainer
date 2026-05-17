import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'coin-change',
  title: 'Coin Change',
  category: 'trees-graphs-dp',
  difficulty: 'medium',
  tags: ['dynamic-programming', 'bottom-up', 'unbounded-knapsack'],
  concept: `## Bottom-Up Dynamic Programming

DP problems have **optimal substructure**: the solution to the full problem depends on solutions to subproblems. Bottom-up DP builds a table of subproblem solutions from smallest to largest, avoiding repeated recomputation.

**Unbounded knapsack pattern** (each item usable unlimited times):
\`\`\`python
dp = [float("inf")] * (amount + 1)
dp[0] = 0   # base case: 0 coins to make amount 0

for coin in coins:
    for a in range(coin, amount + 1):
        dp[a] = min(dp[a], dp[a - coin] + 1)
\`\`\`

**Why \`dp[0] = 0\`?** It's the base case — you need 0 coins to make amount 0. All other cells start at infinity (unreachable).

**Why iterate coins in outer loop?** For the unbounded version (repeated use allowed), the order doesn't matter. Each coin can reduce any reachable amount.`,

  workedExample: {
    problem: `Given integer array \`coins\` and integer \`amount\`, return the fewest number of coins needed to make up \`amount\`. Return \`-1\` if it's impossible.

\`\`\`
coins = [1, 5, 6, 9], amount = 11  →  2  (5+6)
coins = [2], amount = 3            →  -1
\`\`\``,
    solution: `def coin_change(coins: list[int], amount: int) -> int:
    dp = [float("inf")] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for a in range(coin, amount + 1):
            if dp[a - coin] + 1 < dp[a]:
                dp[a] = dp[a - coin] + 1
    return dp[amount] if dp[amount] != float("inf") else -1`,
    steps: [
      {
        lines: [1, 3],
        explanation: '`dp[a]` will hold the minimum coins needed to make amount `a`. Initializing to `float("inf")` represents "unreachable". The base case `dp[0] = 0` is critical: zero coins are needed to make amount zero, and all other subproblems build on this.',
      },
      {
        lines: [4, 5],
        explanation: 'Outer loop over coins, inner loop over amounts — this is the unbounded knapsack pattern. `range(coin, amount + 1)` ensures `a - coin >= 0`, so we never access a negative index. Because each coin can be used unlimited times, we allow `dp[a - coin]` to itself have been built using the same coin.',
        stateAfter: [
          { name: 'dp state (coins=[1,5,6,9], amount=11)', value: '[0, inf, inf, inf, inf, inf, inf, inf, inf, inf, inf, inf]' },
        ],
      },
      {
        lines: [6, 7],
        explanation: 'The recurrence: using `coin` to reach amount `a` costs `dp[a - coin] + 1`. We update `dp[a]` only when this is strictly better than the current value — greedy local choice that leads to the global optimum via optimal substructure.',
      },
      {
        lines: [8, 8],
        explanation: 'If `dp[amount]` is still infinity after trying every coin, the amount is unreachable and we return `-1`. Otherwise return the computed minimum coin count.',
      },
    ],
    complexity: 'O(amount × len(coins)) time, O(amount) space',
  },

  exercise: {
    problem: `Given integer array \`coins\` and integer \`amount\`, return the **number of distinct combinations** that sum to \`amount\`. Each coin may be used unlimited times. Order doesn't matter (\`[1,2]\` and \`[2,1]\` are the same combination).

\`\`\`
coins = [1, 2, 5], amount = 5  →  4
# {5}, {2,2,1}, {2,1,1,1}, {1,1,1,1,1}
coins = [2], amount = 3        →  0
\`\`\``,
    functionName: 'coin_combinations',
    starterCode: `def coin_combinations(coins: list[int], amount: int) -> int:
    """Return number of distinct combinations (unordered) that sum to amount."""
    ...`,
    tests: [
      { name: 'Basic example', input: [[1, 2, 5], 5], expected: 4 },
      { name: 'Impossible', input: [[2], 3], expected: 0 },
      { name: 'amount=0', input: [[1, 2], 0], expected: 1 },
      { name: 'Single coin fits exactly', input: [[5], 5], expected: 1 },
      { name: 'Multiple coins same amount', input: [[1, 2, 3], 4], expected: 4, hidden: true },
    ],
    referenceSolution: `def coin_combinations(coins: list[int], amount: int) -> int:
    dp = [0] * (amount + 1)
    dp[0] = 1   # one way to make 0: use no coins
    # Iterate coins in outer loop to count combinations (not permutations)
    for coin in coins:
        for a in range(coin, amount + 1):
            dp[a] += dp[a - coin]
    return dp[amount]`,
    hints: [
      'This is the "unbounded knapsack — count ways" variant. `dp[a]` = number of ways to make amount `a`.',
      'Base case: `dp[0] = 1` (one way to make 0: use nothing).',
      'IMPORTANT: iterate coins in the outer loop, amounts in the inner loop. This prevents counting [1,2] and [2,1] as different combinations.',
    ],
  },
};

export default problem;
