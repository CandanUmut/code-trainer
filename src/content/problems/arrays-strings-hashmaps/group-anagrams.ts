import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'group-anagrams',
  title: 'Group Anagrams',
  category: 'arrays-strings-hashmaps',
  difficulty: 'medium',
  tags: ['hashmap', 'sorting', 'string'],
  concept: `## Using Canonical Forms as Hash Keys

Many grouping problems reduce to: "compute a canonical (normalized) form for each item, then bucket items by that form."

For anagrams, all anagrams have the same sorted characters — so \`sorted("eat") == sorted("tea") == sorted("ate") == ['a','e','t']\`.

**Pattern:**
\`\`\`python
from collections import defaultdict

groups: defaultdict[tuple, list] = defaultdict(list)
for word in words:
    key = tuple(sorted(word))   # canonical form
    groups[key].append(word)
return list(groups.values())
\`\`\`

\`defaultdict(list)\` is cleaner than manually checking \`if key not in d: d[key] = []\`.

**Alternative canonical form:** count vector. \`"aab"\` → \`(2,1,0,...)\` (26-element tuple of char counts). Avoids sorting (O(k) vs O(k log k) per word) but same asymptotic result in practice.`,

  workedExample: {
    problem: `Given a list of strings, group the anagrams together. Return the groups in any order.

\`\`\`
["eat","tea","tan","ate","nat","bat"]
→ [["bat"],["nat","tan"],["ate","eat","tea"]]
\`\`\``,
    solution: `from collections import defaultdict

def group_anagrams(strs: list[str]) -> list[list[str]]:
    groups: defaultdict[tuple[str, ...], list[str]] = defaultdict(list)
    for word in strs:
        key = tuple(sorted(word))
        groups[key].append(word)
    return list(groups.values())`,
    walkthrough: `\`sorted(word)\` gives a list of characters in alphabetical order — the same for every anagram. We convert it to a \`tuple\` so it's hashable (lists can't be dict keys).

\`defaultdict(list)\` automatically initializes missing keys to \`[]\`, so we can always call \`.append\` without a guard.

After one pass over all words, each group is a value in \`groups\`. We return \`list(groups.values())\` — the order of groups doesn't matter per the problem.`,
    complexity: 'O(n·k log k) time where k is max word length, O(n·k) space',
  },

  exercise: {
    problem: `Given a list of strings, find all pairs of indices \`(i, j)\` where \`i < j\` and \`strs[i]\` and \`strs[j]\` are anagrams of each other.

Return a list of such index pairs, sorted by \`i\` then \`j\`.

\`\`\`
strs = ["eat", "tea", "tan", "ate"]
→ [[0, 1], [0, 3], [1, 3]]
# "eat"/"tea", "eat"/"ate", "tea"/"ate" are all anagram pairs
\`\`\``,
    functionName: 'anagram_pairs',
    starterCode: `def anagram_pairs(strs: list[str]) -> list[list[int]]:
    """Return all index pairs (i, j) where i < j and strs[i] and strs[j] are anagrams."""
    ...`,
    tests: [
      {
        name: 'Basic example',
        input: [['eat', 'tea', 'tan', 'ate']],
        expected: [
          [0, 1],
          [0, 3],
          [1, 3],
        ],
      },
      { name: 'No anagrams', input: [['abc', 'def', 'ghi']], expected: [] },
      { name: 'All same word', input: [['ab', 'ab', 'ab']], expected: [[0, 1], [0, 2], [1, 2]] },
      {
        name: 'Single character strings',
        input: [['a', 'b', 'a']],
        expected: [[0, 2]],
        hidden: true,
      },
      {
        name: 'Mixed lengths',
        input: [['abc', 'bca', 'ab', 'ba', 'c']],
        expected: [
          [0, 1],
          [2, 3],
        ],
        hidden: true,
      },
    ],
    referenceSolution: `from collections import defaultdict

def anagram_pairs(strs: list[str]) -> list[list[int]]:
    groups: defaultdict[tuple[str, ...], list[int]] = defaultdict(list)
    for i, word in enumerate(strs):
        groups[tuple(sorted(word))].append(i)
    result: list[list[int]] = []
    for indices in groups.values():
        for a in range(len(indices)):
            for b in range(a + 1, len(indices)):
                result.append([indices[a], indices[b]])
    result.sort()
    return result`,
    hints: [
      'Group indices by their anagram canonical form (sorted characters), just like in the worked example.',
      'Once you have groups of indices, generate all pairs within each group where i < j.',
      'Collect all pairs, then sort the final list.',
    ],
  },
};

export default problem;
