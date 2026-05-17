import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'sliding-window-max',
  title: 'Longest Substring Without Repeating Characters',
  category: 'arrays-strings-hashmaps',
  difficulty: 'medium',
  tags: ['sliding-window', 'hashmap', 'string'],
  concept: `## Sliding Window with a Hash Map

The **sliding window** pattern uses two pointers (\`left\`, \`right\`) to maintain a window over a sequence. Expanding the right pointer adds elements; shrinking the left pointer removes them.

When the window invariant breaks (e.g., a duplicate appears), advance \`left\` until the invariant holds again. A hash map tracks what's currently inside the window.

\`\`\`python
left = 0
seen: dict[str, int] = {}   # char → last-seen index

for right, ch in enumerate(s):
    if ch in seen and seen[ch] >= left:
        # ch is inside the window — shrink from left past its previous position
        left = seen[ch] + 1
    seen[ch] = right
    max_len = max(max_len, right - left + 1)
\`\`\`

The key trick: store the **index** in the map, not just presence. When we see a duplicate, we jump \`left\` directly to \`seen[ch] + 1\` rather than inching forward one step at a time — O(n) total instead of O(n²).`,

  workedExample: {
    problem: `Given a string \`s\`, find the length of the longest substring without repeating characters.

\`\`\`
s = "abcabcbb"  →  3  ("abc")
s = "bbbbb"     →  1  ("b")
s = "pwwkew"    →  3  ("wke")
\`\`\``,
    solution: `def length_of_longest_substring(s: str) -> int:
    seen: dict[str, int] = {}  # char → most recent index
    left = 0
    max_len = 0
    for right, ch in enumerate(s):
        if ch in seen and seen[ch] >= left:
            left = seen[ch] + 1
        seen[ch] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
    walkthrough: `\`seen[ch]\` stores the last index where \`ch\` appeared. When we encounter \`ch\` again at \`right\`, we only care if its previous position is *inside* the current window (\`seen[ch] >= left\`). If it is, we move \`left\` past it.

Always update \`seen[ch] = right\` even when we shrink — we want the most recent position.

The window \`[left, right]\` always contains no duplicates. Its size is \`right - left + 1\`. We track the maximum over all right positions.`,
    complexity: 'O(n) time, O(min(n, alphabet)) space',
  },

  exercise: {
    problem: `Given a string \`s\` and an integer \`k\`, find the length of the longest substring that contains **at most \`k\` distinct characters**.

\`\`\`
s = "eceba", k = 2  →  3  ("ece")
s = "aa", k = 1     →  2  ("aa")
s = "aabbcc", k = 2 →  4  ("aabb" or "bbcc")
\`\`\``,
    functionName: 'longest_k_distinct',
    starterCode: `def longest_k_distinct(s: str, k: int) -> int:
    """Return length of longest substring with at most k distinct characters."""
    ...`,
    tests: [
      { name: 'eceba k=2', input: ['eceba', 2], expected: 3 },
      { name: 'aa k=1', input: ['aa', 1], expected: 2 },
      { name: 'aabbcc k=2', input: ['aabbcc', 2], expected: 4 },
      { name: 'k=0', input: ['abc', 0], expected: 0 },
      { name: 'k >= distinct chars', input: ['abc', 10], expected: 3, hidden: true },
      {
        name: 'All same character k=1',
        input: ['aaaaaaa', 1],
        expected: 7,
        hidden: true,
      },
    ],
    referenceSolution: `from collections import defaultdict

def longest_k_distinct(s: str, k: int) -> int:
    if k == 0:
        return 0
    freq: defaultdict[str, int] = defaultdict(int)
    left = 0
    max_len = 0
    for right, ch in enumerate(s):
        freq[ch] += 1
        while len(freq) > k:
            left_ch = s[left]
            freq[left_ch] -= 1
            if freq[left_ch] == 0:
                del freq[left_ch]
            left += 1
        max_len = max(max_len, right - left + 1)
    return max_len`,
    hints: [
      'Use a sliding window. The window invariant is: at most k distinct characters inside.',
      'Track character frequencies inside the window with a dict. When `len(freq) > k`, shrink from the left.',
      'When a character\'s frequency drops to 0 after shrinking, remove it from the dict so `len(freq)` accurately reflects distinct chars.',
    ],
  },
};

export default problem;
