import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'minimum-window',
  title: 'Minimum Window Substring',
  category: 'arrays-strings-hashmaps',
  difficulty: 'hard',
  tags: ['sliding-window', 'hashmap', 'string', 'two-pointer'],
  concept: `## Sliding Window with a Satisfaction Counter

For "find smallest window satisfying some constraint" problems, the template is:

1. Expand right until the window satisfies the constraint.
2. Contract left while it still satisfies — tracking the minimum.
3. Repeat.

The challenge is efficiently tracking *whether* the constraint is satisfied. Use a \`have\`/\`need\` counter: \`need\` is the number of distinct characters that still need to reach their target frequency; when \`need == 0\`, the window is valid.

\`\`\`python
from collections import Counter

need_count = Counter(t)
need = len(need_count)   # distinct chars still unsatisfied
have = 0
window: Counter = Counter()

for right, ch in enumerate(s):
    window[ch] += 1
    if ch in need_count and window[ch] == need_count[ch]:
        have += 1        # this char is now fully satisfied
    while have == need:
        # window [left..right] is valid — try to shrink
        ...
        left_ch = s[left]
        window[left_ch] -= 1
        if left_ch in need_count and window[left_ch] < need_count[left_ch]:
            have -= 1    # losing this char breaks satisfaction
        left += 1
\`\`\``,

  workedExample: {
    problem: `Given strings \`s\` and \`t\`, return the minimum window substring of \`s\` such that every character in \`t\` (including duplicates) is included. If no such window exists, return \`""\`.

\`\`\`
s = "ADOBECODEBANC", t = "ABC"  →  "BANC"
s = "a", t = "a"                →  "a"
s = "a", t = "aa"               →  ""
\`\`\``,
    solution: `from collections import Counter

def min_window(s: str, t: str) -> str:
    if not t or not s:
        return ""
    need_count = Counter(t)
    need = len(need_count)
    have = 0
    window: Counter[str] = Counter()
    left = 0
    best = (float("inf"), 0, 0)   # (length, l, r)

    for right, ch in enumerate(s):
        window[ch] += 1
        if ch in need_count and window[ch] == need_count[ch]:
            have += 1
        while have == need:
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right)
            left_ch = s[left]
            window[left_ch] -= 1
            if left_ch in need_count and window[left_ch] < need_count[left_ch]:
                have -= 1
            left += 1

    return s[best[1]:best[2]+1] if best[0] != float("inf") else ""`,
    steps: [
      {
        lines: [4, 11],
        explanation: 'Guard for empty inputs, then set up the three core data structures: `need_count` records how many of each character `t` requires; `need` counts how many distinct characters are still unsatisfied; `window` tracks current counts in the sliding window. `best` stores `(length, left, right)` so we can reconstruct the substring at the end.',
      },
      {
        lines: [13, 16],
        explanation: 'Expand the window rightward. We increment `window[ch]` for the new character. The `have += 1` fires **only** when that character\'s window count first exactly meets its requirement — not on every increase. This prevents over-counting satisfaction.',
        stateAfter: [
          { name: 'have', value: 'number of fully-satisfied distinct chars' },
          { name: 'need', value: 'total distinct chars required' },
        ],
      },
      {
        lines: [17, 19],
        explanation: 'When `have == need`, the window contains every required character in sufficient quantity — it is valid. We immediately try to record it as the best if it is shorter than any previous valid window.',
      },
      {
        lines: [20, 23],
        explanation: 'Shrink the window from the left to find the minimum. We remove `s[left]` from the window. If that character was *exactly* at its required count, losing it breaks satisfaction: `have` decrements and the `while` loop exits, forcing us to expand right again.',
      },
      {
        lines: [24, 24],
        explanation: '`left += 1` advances the left pointer. This continues the shrinking loop until the window is no longer valid, then we go back to expanding right.',
      },
      {
        lines: [26, 26],
        explanation: 'After processing the whole string, `best` holds the shortest valid window\'s bounds. If `best[0]` is still infinity, no valid window was ever found and we return `""`. Otherwise slice `s` using the stored `left` and `right` indices.',
      },
    ],
    complexity: 'O(|s| + |t|) time, O(|t|) space',
  },

  exercise: {
    problem: `Given a string \`s\` and a pattern \`p\`, find **all start indices** of \`p\`'s anagrams in \`s\`. Return indices in sorted order.

An anagram of \`p\` is any permutation of \`p\`'s characters.

\`\`\`
s = "cbaebabacd", p = "abc"  →  [0, 6]
s = "abab", p = "ab"         →  [0, 1, 2]
\`\`\``,
    functionName: 'find_anagrams',
    starterCode: `def find_anagrams(s: str, p: str) -> list[int]:
    """Return all start indices where a permutation of p appears in s."""
    ...`,
    tests: [
      { name: 'Basic example', input: ['cbaebabacd', 'abc'], expected: [0, 6] },
      { name: 'Overlapping', input: ['abab', 'ab'], expected: [0, 1, 2] },
      { name: 'No match', input: ['af', 'be'], expected: [] },
      { name: 'p longer than s', input: ['ab', 'abc'], expected: [] },
      { name: 'All same char', input: ['aaaa', 'aa'], expected: [0, 1, 2], hidden: true },
    ],
    referenceSolution: `from collections import Counter

def find_anagrams(s: str, p: str) -> list[int]:
    if len(p) > len(s):
        return []
    p_count = Counter(p)
    window = Counter(s[:len(p)])
    result = [0] if window == p_count else []

    for i in range(len(p), len(s)):
        # Add new char on the right
        window[s[i]] += 1
        # Remove char that fell off the left
        left_ch = s[i - len(p)]
        window[left_ch] -= 1
        if window[left_ch] == 0:
            del window[left_ch]
        if window == p_count:
            result.append(i - len(p) + 1)
    return result`,
    hints: [
      'Use a fixed-size sliding window of length `len(p)`. Slide it across `s`, comparing window character counts to `Counter(p)`.',
      'Instead of recomputing the Counter from scratch each step, add the new right character and remove the character that fell off the left.',
      'When removing, delete the key if its count reaches 0 so Counter equality works correctly.',
    ],
  },
};

export default problem;
