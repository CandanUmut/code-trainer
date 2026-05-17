import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'course-schedule',
  title: 'Course Schedule (Cycle Detection)',
  category: 'trees-graphs-dp',
  difficulty: 'medium',
  tags: ['graph', 'topological-sort', 'dfs', 'cycle-detection'],
  concept: `## Topological Sort and Cycle Detection in Directed Graphs

A directed graph has a valid topological ordering if and only if it is a **DAG** (Directed Acyclic Graph) — it contains no cycles.

**DFS cycle detection with three colors:**
- White (0): unvisited
- Gray (1): currently in DFS stack (being processed)
- Black (2): fully processed

If DFS reaches a gray node, we've found a back edge → cycle exists.

\`\`\`python
color = [0] * n

def dfs(node: int) -> bool:
    color[node] = 1   # gray: in progress
    for neighbor in adj[node]:
        if color[neighbor] == 1:
            return True  # cycle!
        if color[neighbor] == 0 and dfs(neighbor):
            return True
    color[node] = 2   # black: done
    return False
\`\`\`

**Kahn's algorithm** (BFS alternative): repeatedly remove nodes with in-degree 0. If all nodes are removed, no cycle exists. If some remain, they form a cycle.`,

  workedExample: {
    problem: `There are \`n\` courses labeled 0 to n-1. \`prerequisites[i] = [a, b]\` means course \`b\` must be taken before \`a\`. Return \`True\` if it's possible to finish all courses (no circular dependency), \`False\` otherwise.

\`\`\`
n=2, prerequisites=[[1,0]]         →  True  (0→1)
n=2, prerequisites=[[1,0],[0,1]]   →  False (cycle)
\`\`\``,
    solution: `from collections import defaultdict

def can_finish(n: int, prerequisites: list[list[int]]) -> bool:
    adj: defaultdict[int, list[int]] = defaultdict(list)
    for course, prereq in prerequisites:
        adj[prereq].append(course)

    # 0=unvisited, 1=in-stack, 2=done
    color = [0] * n

    def dfs(node: int) -> bool:
        color[node] = 1
        for neighbor in adj[node]:
            if color[neighbor] == 1:
                return True  # cycle found
            if color[neighbor] == 0 and dfs(neighbor):
                return True
        color[node] = 2
        return False

    return not any(dfs(i) for i in range(n) if color[i] == 0)`,
    walkthrough: `We build an adjacency list where \`adj[prereq]\` contains courses that require \`prereq\`.

The three-color DFS: gray nodes are "in progress" on the current recursion path. Hitting a gray neighbor means we've traversed back to a node we're currently processing — that's a cycle.

\`any(dfs(i) for i in range(n) if color[i] == 0)\` handles disconnected graphs by starting a DFS from every unvisited node.`,
    complexity: 'O(V + E) time, O(V + E) space',
  },

  exercise: {
    problem: `Given \`n\` courses and \`prerequisites\`, return a valid order to complete all courses (any valid topological ordering). If it's impossible (cycle exists), return \`[]\`.

\`\`\`
n=4, prerequisites=[[1,0],[2,0],[3,1],[3,2]]
→ [0, 1, 2, 3]  (or [0, 2, 1, 3])
\`\`\``,
    functionName: 'find_course_order',
    starterCode: `def find_course_order(n: int, prerequisites: list[list[int]]) -> list[int]:
    """Return a valid topological ordering of n courses, or [] if impossible."""
    ...`,
    tests: [
      {
        name: 'Basic ordering',
        input: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]],
        expected: [0, 1, 2, 3],
      },
      { name: 'Impossible cycle', input: [2, [[1, 0], [0, 1]]], expected: [] },
      { name: 'No prerequisites', input: [3, []], expected: [0, 1, 2] },
      {
        name: 'Linear chain',
        input: [3, [[1, 0], [2, 1]]],
        expected: [0, 1, 2],
        hidden: true,
      },
    ],
    referenceSolution: `from collections import defaultdict, deque

def find_course_order(n: int, prerequisites: list[list[int]]) -> list[int]:
    adj: defaultdict[int, list[int]] = defaultdict(list)
    in_degree = [0] * n
    for course, prereq in prerequisites:
        adj[prereq].append(course)
        in_degree[course] += 1

    # Kahn's algorithm: BFS from zero-in-degree nodes
    queue = deque(i for i in range(n) if in_degree[i] == 0)
    order: list[int] = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    return order if len(order) == n else []`,
    hints: [
      "Use Kahn's algorithm (BFS): start with all nodes of in-degree 0, process them, and reduce in-degrees of their neighbors.",
      'When a neighbor\'s in-degree reaches 0, it\'s "unlocked" — add it to the queue.',
      'If the final order has length n, all courses can be completed. Otherwise there\'s a cycle.',
    ],
  },
};

export default problem;
