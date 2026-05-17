import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'valid-sudoku',
  title: 'Valid Sudoku',
  category: 'arrays-strings-hashmaps',
  difficulty: 'medium',
  tags: ['hashmap', 'set', 'matrix'],
  concept: `## Multi-Key Constraint Validation with Sets

Some validation problems require checking the **same elements** against multiple independent constraints simultaneously. The pattern: collect sets keyed by constraint group; insert each element; detect duplicates.

\`\`\`python
from collections import defaultdict

rows    = defaultdict(set)
cols    = defaultdict(set)
boxes   = defaultdict(set)

for r in range(9):
    for c in range(9):
        val = board[r][c]
        if val == '.':
            continue
        box_key = (r // 3, c // 3)
        if val in rows[r] or val in cols[c] or val in boxes[box_key]:
            return False
        rows[r].add(val)
        cols[c].add(val)
        boxes[box_key].add(val)
\`\`\`

The box key \`(r//3, c//3)\` maps each cell to its 3×3 box — a common trick worth memorizing.`,

  workedExample: {
    problem: `Determine if a 9×9 Sudoku board is valid. A board is valid if:
- Each row contains digits 1–9 with no repeats (ignoring \`'.'\`)
- Each column contains digits 1–9 with no repeats
- Each of the nine 3×3 sub-boxes contains digits 1–9 with no repeats

The board may be partially filled.`,
    solution: `from collections import defaultdict

def is_valid_sudoku(board: list[list[str]]) -> bool:
    rows: defaultdict[int, set[str]] = defaultdict(set)
    cols: defaultdict[int, set[str]] = defaultdict(set)
    boxes: defaultdict[tuple[int, int], set[str]] = defaultdict(set)

    for r in range(9):
        for c in range(9):
            val = board[r][c]
            if val == '.':
                continue
            box = (r // 3, c // 3)
            if val in rows[r] or val in cols[c] or val in boxes[box]:
                return False
            rows[r].add(val)
            cols[c].add(val)
            boxes[box].add(val)
    return True`,
    steps: [
      {
        lines: [1, 6],
        explanation: 'Three separate `defaultdict(set)` structures, one per constraint type (rows, columns, boxes). Using `defaultdict` means we never need to explicitly initialize a set before inserting — the first access creates an empty set automatically.',
      },
      {
        lines: [8, 12],
        explanation: 'We scan every cell with a nested loop. Empty cells (`"."`) are skipped with `continue` — they do not participate in any constraint.',
      },
      {
        lines: [13, 13],
        explanation: 'The box key `(r // 3, c // 3)` maps each cell to one of nine 3×3 sub-boxes. Integer division groups rows 0–2 into box-row 0, rows 3–5 into box-row 1, etc. This clever formula is worth memorizing.',
        stateAfter: [
          { name: 'box key for (r=4, c=7)', value: '(1, 2)' },
        ],
      },
      {
        lines: [14, 15],
        explanation: 'All three constraints are checked in a single `or` expression before we record anything. If `val` already appears in that row, column, or box, the board is invalid — return `False` immediately.',
      },
      {
        lines: [16, 19],
        explanation: 'Only after passing all three checks do we record `val` in the three sets. The final `return True` is reached only if no duplicate was found in any constraint across the entire board.',
      },
    ],
    complexity: 'O(1) time and space (board is always 9×9)',
  },

  exercise: {
    problem: `Given an n×n matrix of integers, determine if each row, column, and (if n is a perfect square) each √n×√n sub-box contains no duplicate values. Ignore zeros (treat them as empty).

Return \`True\` if valid, \`False\` otherwise.

\`\`\`
board = [
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  ...
]
\`\`\``,
    functionName: 'is_valid_board',
    starterCode: `def is_valid_board(board: list[list[int]]) -> bool:
    """Validate that rows, cols, and sub-boxes have no duplicate non-zero values."""
    ...`,
    tests: [
      {
        name: 'Valid 4x4',
        input: [
          [
            [1, 2, 3, 4],
            [3, 4, 1, 2],
            [2, 1, 4, 3],
            [4, 3, 2, 1],
          ],
        ],
        expected: true,
      },
      {
        name: 'Duplicate in row',
        input: [
          [
            [1, 1, 3, 4],
            [3, 4, 1, 2],
            [2, 1, 4, 3],
            [4, 3, 2, 1],
          ],
        ],
        expected: false,
      },
      {
        name: 'Duplicate in column',
        input: [
          [
            [1, 2, 3, 4],
            [1, 4, 2, 3],
            [2, 1, 4, 3],
            [4, 3, 1, 2],
          ],
        ],
        expected: false,
      },
      {
        name: 'With zeros (empty cells)',
        input: [
          [
            [1, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 1],
          ],
        ],
        expected: true,
        hidden: true,
      },
    ],
    referenceSolution: `import math
from collections import defaultdict

def is_valid_board(board: list[list[int]]) -> bool:
    n = len(board)
    box_size = int(math.isqrt(n))
    has_boxes = box_size * box_size == n

    rows: defaultdict[int, set[int]] = defaultdict(set)
    cols: defaultdict[int, set[int]] = defaultdict(set)
    boxes: defaultdict[tuple[int, int], set[int]] = defaultdict(set)

    for r in range(n):
        for c in range(n):
            val = board[r][c]
            if val == 0:
                continue
            box = (r // box_size, c // box_size)
            if val in rows[r] or val in cols[c] or (has_boxes and val in boxes[box]):
                return False
            rows[r].add(val)
            cols[c].add(val)
            if has_boxes:
                boxes[box].add(val)
    return True`,
    hints: [
      'Use the same three-dict approach from the worked example: rows, cols, boxes.',
      'Check `math.isqrt(n)**2 == n` to determine if sub-boxes apply.',
      'Box key is `(r // box_size, c // box_size)` where `box_size = int(math.isqrt(n))`.',
    ],
  },
};

export default problem;
