import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'kth-smallest-bst',
  title: 'Kth Smallest Element in a BST',
  category: 'trees-graphs-dp',
  difficulty: 'easy',
  tags: ['tree', 'bst', 'inorder', 'dfs'],
  concept: `## BST Inorder Traversal = Sorted Order

A fundamental BST property: **inorder traversal (left → root → right) visits nodes in ascending order**. This means many BST problems reduce to "do an inorder traversal, then solve the equivalent sorted-array problem."

\`\`\`python
def inorder(node):
    if node is None:
        return
    yield from inorder(node.get("left"))
    yield node["val"]
    yield from inorder(node.get("right"))

# k-th smallest is just the k-th element of inorder traversal
return next(itertools.islice(inorder(root), k - 1, None))
\`\`\`

Using a generator with \`yield from\` is elegant because it's lazy — we stop as soon as we've seen k elements rather than traversing the whole tree.

For follow-up (frequently modified BST), augment each node with a \`left_count\` to find kth in O(log n).`,

  workedExample: {
    problem: `Given the root of a BST and integer \`k\`, return the k-th smallest value (1-indexed).

BST represented as nested dicts: \`{"val": v, "left": {...}, "right": {...}}\`.

\`\`\`
tree = {val:3, left:{val:1, right:{val:2}}, right:{val:4}}
k=1 → 1,  k=3 → 3
\`\`\``,
    solution: `from typing import Generator

def kth_smallest(root: dict | None, k: int) -> int:
    def inorder(node: dict | None) -> Generator[int, None, None]:
        if node is None:
            return
        yield from inorder(node.get("left"))
        yield node["val"]
        yield from inorder(node.get("right"))

    for i, val in enumerate(inorder(root), 1):
        if i == k:
            return val
    raise ValueError("k exceeds tree size")`,
    walkthrough: `The generator \`inorder\` yields values in sorted order without materializing the full list. \`yield from\` delegates to recursive sub-generators cleanly.

\`enumerate(inorder(root), 1)\` pairs each yielded value with its rank (1-indexed). We stop the moment we reach rank \`k\` — early termination on a large tree.

This is O(H + k) time where H is tree height, rather than O(n) if we collected all values first.`,
    complexity: 'O(H + k) time, O(H) space (recursion stack)',
  },

  exercise: {
    problem: `Given the root of a BST and two values \`lo\` and \`hi\`, return the **sum of all node values in the inclusive range [lo, hi]**.

\`\`\`
tree = {val:10, left:{val:5, left:{val:3}, right:{val:7}}, right:{val:15, right:{val:18}}}
lo=7, hi=15  →  32  (7 + 10 + 15)
\`\`\``,
    functionName: 'range_sum_bst',
    starterCode: `def range_sum_bst(root: dict | None, lo: int, hi: int) -> int:
    """Return sum of all BST values in [lo, hi] inclusive."""
    ...`,
    tests: [
      {
        name: 'Basic range',
        input: [
          {
            val: 10,
            left: { val: 5, left: { val: 3 }, right: { val: 7 } },
            right: { val: 15, right: { val: 18 } },
          },
          7,
          15,
        ],
        expected: 32,
      },
      { name: 'Single node in range', input: [{ val: 5 }, 3, 6], expected: 5 },
      { name: 'No nodes in range', input: [{ val: 5 }, 6, 10], expected: 0 },
      { name: 'Null root', input: [null, 1, 5], expected: 0 },
      {
        name: 'Full range',
        input: [{ val: 10, left: { val: 5 }, right: { val: 15 } }, 5, 15],
        expected: 30,
        hidden: true,
      },
    ],
    referenceSolution: `def range_sum_bst(root: dict | None, lo: int, hi: int) -> int:
    if root is None:
        return 0
    val = root["val"]
    total = val if lo <= val <= hi else 0
    # BST pruning: only recurse into branches that could contain values in [lo, hi]
    if val > lo:
        total += range_sum_bst(root.get("left"), lo, hi)
    if val < hi:
        total += range_sum_bst(root.get("right"), lo, hi)
    return total`,
    hints: [
      'A simple inorder traversal works but misses a key optimization: BST properties let you prune whole subtrees.',
      'If `root.val > lo`, the left subtree may have values ≥ lo — recurse left. If `root.val < hi`, the right subtree may have values ≤ hi — recurse right.',
      'This pruning makes the solution O(k + H) where k is the number of nodes in range, rather than O(n).',
    ],
  },
};

export default problem;
