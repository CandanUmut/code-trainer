import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'binary-tree-max-path',
  title: 'Binary Tree Maximum Path Sum',
  category: 'trees-graphs-dp',
  difficulty: 'hard',
  tags: ['tree', 'dfs', 'recursion'],
  concept: `## Tree DFS with a Global Maximum

Many tree problems require tracking two things:
1. What you **return** to the parent (constrained by the path structure)
2. What you **record globally** (which may use both children and can't be returned)

For max path sum, a path through a node can use left child, right child, both, or neither. But if you return this to the parent, the parent can only extend in **one direction** (a path can't fork).

\`\`\`python
def dfs(node) -> int:
    if node is None:
        return 0
    left  = max(0, dfs(node.left))   # ignore negative contributions
    right = max(0, dfs(node.right))
    # Best path *through* this node (not returnable to parent if it uses both)
    best_through = node.val + left + right
    global_max = max(global_max, best_through)
    # Return only one branch to the parent
    return node.val + max(left, right)
\`\`\`

Using \`max(0, ...)\` on child results means we simply don't extend into a subtree if it would decrease the sum.`,

  workedExample: {
    problem: `Given the root of a binary tree, find the maximum path sum. A path is a sequence of nodes where each pair of adjacent nodes has an edge. A path can start and end at any node, and each node appears at most once. The path does not need to pass through the root.

Nodes represent as nested dicts: \`{"val": 1, "left": {...}, "right": {...}}\` or \`None\`.

\`\`\`
tree = {val:1, left:{val:2}, right:{val:3}}  →  6  (2+1+3)
tree = {val:-3, left:{val:-2}, right:{val:-1}}  →  -1  (single node)
\`\`\``,
    solution: `def max_path_sum(root: dict | None) -> int:
    best = [float("-inf")]

    def dfs(node: dict | None) -> float:
        if node is None:
            return 0
        left  = max(0, dfs(node.get("left")))
        right = max(0, dfs(node.get("right")))
        best[0] = max(best[0], node["val"] + left + right)
        return node["val"] + max(left, right)

    dfs(root)
    return int(best[0])`,
    steps: [
      {
        lines: [1, 2],
        explanation: '`best = [float("-inf")]` is a mutable single-element list used as a closure variable. Python inner functions can *read* outer variables freely but cannot *rebind* them without `nonlocal`. Wrapping the scalar in a list is a common workaround — mutating `best[0]` is not rebinding `best`.',
      },
      {
        lines: [4, 6],
        explanation: 'The `dfs` inner function returns the best single-branch path sum extending downward from `node`. The base case returns 0 for `None` — a non-existent child contributes nothing.',
      },
      {
        lines: [7, 8],
        explanation: '`max(0, dfs(...))` clamps each subtree\'s contribution to at least 0. If a subtree yields a negative sum, we simply do not extend into it — a path that avoids a negative subtree is always better.',
        stateAfter: [
          { name: 'left (clamped)', value: 'max(0, left_subtree_sum)' },
          { name: 'right (clamped)', value: 'max(0, right_subtree_sum)' },
        ],
      },
      {
        lines: [9, 9],
        explanation: '`node["val"] + left + right` is the best path that *passes through* this node using both branches. This path cannot be extended to the parent (a path cannot fork), so we only record it globally in `best[0]` rather than returning it.',
      },
      {
        lines: [10, 10],
        explanation: 'The return value to the parent is the best *single-branch* extension: current node\'s value plus the better of left or right (not both). This represents the longest non-forking path the parent can extend.',
      },
      {
        lines: [12, 13],
        explanation: 'We kick off DFS from the root and discard its return value — we only care about `best[0]`, the global maximum path found during traversal. `int()` converts from float back to int (since we initialized with `float("-inf")`).',
      },
    ],
    complexity: 'O(n) time, O(h) space where h is tree height',
  },

  exercise: {
    problem: `Given a binary tree (same dict representation), find the **diameter** — the length of the longest path between any two nodes, measured in number of **edges** (not nodes).

\`\`\`
tree = {val:1, left:{val:2, left:{val:4}, right:{val:5}}, right:{val:3}}
→ 3  (path: 4→2→1→3 has 3 edges)
\`\`\``,
    functionName: 'tree_diameter',
    starterCode: `def tree_diameter(root: dict | None) -> int:
    """Return the diameter (max edge-length path) of the binary tree."""
    ...`,
    tests: [
      {
        name: 'Basic tree',
        input: [
          {
            val: 1,
            left: { val: 2, left: { val: 4 }, right: { val: 5 } },
            right: { val: 3 },
          },
        ],
        expected: 3,
      },
      { name: 'Single node', input: [{ val: 1 }], expected: 0 },
      { name: 'Linear tree', input: [{ val: 1, left: { val: 2, left: { val: 3 } } }], expected: 2 },
      { name: 'Null root', input: [null], expected: 0 },
      {
        name: 'Diameter not through root',
        input: [
          {
            val: 1,
            left: {
              val: 2,
              left: { val: 4, left: { val: 6 } },
              right: { val: 5 },
            },
            right: { val: 3 },
          },
        ],
        expected: 4,
        hidden: true,
      },
    ],
    referenceSolution: `def tree_diameter(root: dict | None) -> int:
    best = [0]

    def dfs(node: dict | None) -> int:
        if node is None:
            return 0
        left  = dfs(node.get("left"))
        right = dfs(node.get("right"))
        best[0] = max(best[0], left + right)
        return 1 + max(left, right)

    dfs(root)
    return best[0]`,
    hints: [
      'Mirror the max path sum pattern: at each node, the diameter *through* this node is `left_depth + right_depth`. Track the maximum globally.',
      'The return value to the parent is `1 + max(left_depth, right_depth)` — the longest single branch extending downward.',
      'Unlike max path sum, depths are never negative, so no need to clamp to 0.',
    ],
  },
};

export default problem;
