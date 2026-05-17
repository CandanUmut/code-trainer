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
    steps: [
      {
        lines: [3, 4],
        explanation: 'The `inorder` inner function is a generator — it `yield`s values lazily rather than building a list. This is key to early termination: we can stop as soon as we have the k-th value without traversing the rest of the tree.',
      },
      {
        lines: [5, 9],
        explanation: 'The inorder traversal pattern for BSTs: recurse left → yield current → recurse right. This produces values in strictly ascending order (a fundamental BST property). `yield from` cleanly delegates to the recursive sub-generators without manual iteration.',
      },
      {
        lines: [11, 13],
        explanation: '`enumerate(inorder(root), 1)` pairs each yielded BST value with its 1-based rank in sorted order. We stop and return the moment `i == k` — early termination means we do not traverse nodes after the k-th smallest.',
        stateAfter: [
          { name: 'nodes visited', value: 'H (height) + k at most' },
        ],
      },
      {
        lines: [14, 14],
        explanation: 'If the loop exhausts the generator without finding rank k, k exceeds the number of nodes in the tree. Raising `ValueError` makes this contract violation explicit rather than silently returning `None`.',
      },
    ],
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
