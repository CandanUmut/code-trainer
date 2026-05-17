import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'number-of-islands',
  title: 'Number of Islands',
  category: 'trees-graphs-dp',
  difficulty: 'medium',
  tags: ['graph', 'bfs', 'dfs', 'grid'],
  concept: `## Graph Traversal on a Grid

A 2D grid where cells can be "connected" is just a graph — each cell is a node, edges connect adjacent cells (4-directional or 8-directional). BFS and DFS work the same way; you just generate neighbors from grid coordinates.

**DFS flood-fill pattern:**
\`\`\`python
def dfs(r, c):
    if r < 0 or r >= rows or c < 0 or c >= cols:
        return
    if grid[r][c] != '1':
        return
    grid[r][c] = '0'      # mark visited (in-place)
    for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
        dfs(r + dr, c + dc)

count = 0
for r in range(rows):
    for c in range(cols):
        if grid[r][c] == '1':
            dfs(r, c)
            count += 1
\`\`\`

Each \`dfs\` call floods an entire island, marking all its cells as visited. Counting how many times we start a DFS gives the island count. Modifying in-place avoids a separate \`visited\` set — note that this mutates the input.`,

  workedExample: {
    problem: `Given an m×n grid of \`'1'\` (land) and \`'0'\` (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent lands horizontally or vertically.

\`\`\`
grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
→ 1

grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
→ 3
\`\`\``,
    solution: `def num_islands(grid: list[list[str]]) -> int:
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])

    def dfs(r: int, c: int) -> None:
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '0'
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            dfs(r + dr, c + dc)

    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                dfs(r, c)
                count += 1
    return count`,
    steps: [
      {
        lines: [1, 4],
        explanation: 'Guard for empty grid, then capture dimensions. Using `rows` and `cols` as named variables makes the boundary checks below more readable than repeating `len(grid)` and `len(grid[0])`.',
      },
      {
        lines: [6, 8],
        explanation: 'The single compound guard at the top of `dfs` handles both out-of-bounds and non-land cells in one check. This "early return" pattern is cleaner than filtering neighbors before recursing — we let the recursion handle all cases uniformly.',
      },
      {
        lines: [9, 9],
        explanation: 'Marking the cell `"0"` before recursing is the visited-set equivalent for grids. By mutating in place we avoid allocating a separate `visited` set. Any cell we\'ve already processed will fail the `grid[r][c] != "1"` check on re-entry.',
      },
      {
        lines: [10, 11],
        explanation: 'The four direction offsets `[(-1,0),(1,0),(0,-1),(0,1)]` enumerate the four cardinal neighbors. Recursing into all four flood-fills the entire connected land region from the starting cell.',
      },
      {
        lines: [13, 19],
        explanation: 'The outer loop scans every cell. When it finds an unvisited land cell (`"1"`), it triggers DFS which floods the entire island to `"0"`. `count` increments once per island — not once per land cell. Finally we return the island count.',
        stateAfter: [
          { name: 'count', value: 'number of distinct islands found' },
        ],
      },
    ],
    complexity: 'O(m·n) time and space (recursion stack in worst case)',
  },

  exercise: {
    problem: `Given an m×n grid of \`'1'\` (land) and \`'0'\` (water), return the **area** (cell count) of the **largest island**.

\`\`\`
grid = [
  ["0","0","1","0","0","0","0","1","0","0","0","0","0"],
  ["0","0","0","0","0","0","0","1","1","1","0","0","0"],
  ["0","1","1","0","1","0","0","0","0","0","0","0","0"],
  ["0","1","0","0","1","1","0","0","1","0","1","0","0"],
  ["0","1","0","0","1","1","0","0","1","1","1","0","0"],
  ["0","0","0","0","0","0","0","0","0","0","1","0","0"],
  ["0","0","0","0","0","0","0","1","1","1","0","0","0"],
  ["0","0","0","0","0","0","0","1","1","0","0","0","0"]
]
→ 6
\`\`\``,
    functionName: 'max_island_area',
    starterCode: `def max_island_area(grid: list[list[str]]) -> int:
    """Return the area of the largest island (0 if no islands)."""
    ...`,
    tests: [
      {
        name: 'Large grid',
        input: [
          [
            ['0', '0', '1', '0', '0', '0', '0', '1', '0', '0', '0', '0', '0'],
            ['0', '0', '0', '0', '0', '0', '0', '1', '1', '1', '0', '0', '0'],
            ['0', '1', '1', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0'],
            ['0', '1', '0', '0', '1', '1', '0', '0', '1', '0', '1', '0', '0'],
            ['0', '1', '0', '0', '1', '1', '0', '0', '1', '1', '1', '0', '0'],
            ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '0', '0'],
            ['0', '0', '0', '0', '0', '0', '0', '1', '1', '1', '0', '0', '0'],
            ['0', '0', '0', '0', '0', '0', '0', '1', '1', '0', '0', '0', '0'],
          ],
        ],
        expected: 6,
      },
      {
        name: 'No islands',
        input: [[['0', '0'], ['0', '0']]],
        expected: 0,
      },
      {
        name: 'Single cell island',
        input: [[['1']]],
        expected: 1,
      },
      {
        name: 'All land',
        input: [[['1', '1'], ['1', '1']]],
        expected: 4,
        hidden: true,
      },
    ],
    referenceSolution: `def max_island_area(grid: list[list[str]]) -> int:
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])

    def dfs(r: int, c: int) -> int:
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
            return 0
        grid[r][c] = '0'
        return 1 + sum(
            dfs(r + dr, c + dc)
            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]
        )

    return max(
        (dfs(r, c) for r in range(rows) for c in range(cols) if grid[r][c] == '1'),
        default=0,
    )`,
    hints: [
      'Modify the DFS from the worked example to return the area of each island instead of just marking cells.',
      'Each DFS call returns `1 + sum of areas from 4 neighbors`.',
      'Collect all island areas and return the maximum. Use `max(..., default=0)` for empty grids.',
    ],
  },
};

export default problem;
