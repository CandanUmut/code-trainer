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
    walkthrough: `We use a list \`best = [float("-inf")]\` as a mutable closure — Python closures can read outer variables but not rebind them without \`nonlocal\`; using a list sidesteps that (alternatively use \`nonlocal best\`).

At each node, \`left\` and \`right\` are clamped to 0 — if a subtree contributes negatively, we don't extend into it.

\`best[0]\` tracks the best path found *anywhere* in the tree, including paths that go through both children (and hence can't be extended upward). The return value \`node.val + max(left, right)\` is the best single-branch path we can offer to the parent.`,
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
