import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'word-ladder',
  title: 'Word Ladder (BFS Shortest Path)',
  category: 'trees-graphs-dp',
  difficulty: 'hard',
  tags: ['bfs', 'graph', 'string'],
  concept: `## BFS for Shortest Path in Unweighted Graphs

In an unweighted graph (or one where all edges have equal cost), **BFS always finds the shortest path**. DFS does not — it may find a path but not necessarily the shortest.

BFS explores in "rings" around the source: first all nodes at distance 1, then distance 2, etc. The first time you reach the target is via the shortest path.

\`\`\`python
from collections import deque

queue = deque([(start, 1)])   # (node, distance)
visited = {start}

while queue:
    node, dist = queue.popleft()
    if node == target:
        return dist
    for neighbor in get_neighbors(node):
        if neighbor not in visited:
            visited.add(neighbor)
            queue.append((neighbor, dist + 1))
return -1  # unreachable
\`\`\`

**Key:** add to \`visited\` when *enqueuing*, not when *dequeuing*. Adding at dequeue time lets duplicate enqueues pile up, ruining O(V+E) complexity.`,

  workedExample: {
    problem: `Given \`begin_word\`, \`end_word\`, and a \`word_list\`, find the length of the shortest transformation sequence from \`begin_word\` to \`end_word\`, where each step changes exactly one letter and every intermediate word must be in \`word_list\`. Return 0 if no such sequence exists.

\`\`\`
begin_word="hit", end_word="cog",
word_list=["hot","dot","dog","lot","log","cog"]
→ 5  (hit→hot→dot→dog→cog)
\`\`\``,
    solution: `from collections import deque

def word_ladder(begin_word: str, end_word: str, word_list: list[str]) -> int:
    word_set = set(word_list)
    if end_word not in word_set:
        return 0
    queue: deque[tuple[str, int]] = deque([(begin_word, 1)])
    visited = {begin_word}
    while queue:
        word, steps = queue.popleft()
        for i in range(len(word)):
            for ch in 'abcdefghijklmnopqrstuvwxyz':
                candidate = word[:i] + ch + word[i+1:]
                if candidate == end_word:
                    return steps + 1
                if candidate in word_set and candidate not in visited:
                    visited.add(candidate)
                    queue.append((candidate, steps + 1))
    return 0`,
    walkthrough: `Instead of precomputing an adjacency list, we generate neighbors on-the-fly by trying each position with each letter (26 × word_length candidates per word).

We check \`candidate == end_word\` before the \`word_set\` check because \`end_word\` might not be in \`word_set\` after we dequeue it... actually here it is guaranteed. This micro-optimization returns as soon as we first construct the end word.

Marking visited at enqueue time is critical — without it, BFS degenerates when many words share one-letter transitions.`,
    complexity: 'O(n × L × 26) where n = word list size, L = word length',
  },

  exercise: {
    problem: `Given a list of words and a start word, find the shortest path (as a list of words) that connects the start word to **any** word in a target set, changing one letter at a time, where every intermediate word is in the word list (including the start).

Return the path as a list, or \`[]\` if unreachable.

\`\`\`
words = ["hot","dot","dog","lot","log","cog"]
start = "hit"
targets = {"cog", "log"}
→ ["hit","hot","dot","dog","cog"]  (or a path ending in "log")
\`\`\``,
    functionName: 'shortest_word_path',
    starterCode: `def shortest_word_path(words: list[str], start: str, targets: set[str]) -> list[str]:
    """Return shortest one-letter-change path from start to any word in targets."""
    ...`,
    tests: [
      {
        name: 'Basic path to cog',
        input: [['hot', 'dot', 'dog', 'lot', 'log', 'cog'], 'hit', new Set(['cog', 'log'])],
        expected: ['hit', 'hot', 'dot', 'dog', 'cog'],
      },
      {
        name: 'Start is target',
        input: [['hot', 'dot'], 'hot', new Set(['hot'])],
        expected: ['hot'],
      },
      {
        name: 'Unreachable',
        input: [['abc', 'def'], 'xyz', new Set(['def'])],
        expected: [],
      },
    ],
    referenceSolution: `from collections import deque

def shortest_word_path(words: list[str], start: str, targets: set[str]) -> list[str]:
    if start in targets:
        return [start]
    word_set = set(words)
    queue: deque[list[str]] = deque([[start]])
    visited = {start}
    while queue:
        path = queue.popleft()
        word = path[-1]
        for i in range(len(word)):
            for ch in 'abcdefghijklmnopqrstuvwxyz':
                candidate = word[:i] + ch + word[i+1:]
                if candidate in targets:
                    return path + [candidate]
                if candidate in word_set and candidate not in visited:
                    visited.add(candidate)
                    queue.append(path + [candidate])
    return []`,
    hints: [
      'BFS, but store the full path in the queue instead of just the current node and distance.',
      'When you find a neighbor that is in `targets`, return `current_path + [candidate]`.',
      'This is less memory-efficient than storing only distances, but directly gives you the path.',
    ],
  },
};

export default problem;
