import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'itertools-groupby',
  title: 'Run-Length Encoding with itertools.groupby',
  category: 'pythonic-idioms',
  difficulty: 'easy',
  tags: ['itertools', 'generators', 'functional'],
  concept: `## itertools.groupby — Collapsing Consecutive Groups

\`itertools.groupby(iterable, key)\` yields \`(key, group_iterator)\` pairs for each run of consecutive elements with the same key. It's the lazy, Pythonic way to process runs.

\`\`\`python
from itertools import groupby

s = "aaabbbccddddee"
rle = [(ch, sum(1 for _ in grp)) for ch, grp in groupby(s)]
# [('a', 3), ('b', 3), ('c', 2), ('d', 4), ('e', 2)]
\`\`\`

**Gotcha:** \`groupby\` only groups *consecutive* duplicates. \`"abba"\` yields \`('a',['a']), ('b',['b','b']), ('a',['a'])\` — three groups, not two. Pre-sort if you want all duplicates together.

**Gotcha 2:** The group iterator is consumed when the outer loop advances. Don't store group iterators for later use — convert them immediately (e.g., \`list(grp)\` or \`sum(1 for _ in grp)\`).`,

  workedExample: {
    problem: `Implement **run-length encoding**: given a string, compress it by replacing runs of identical characters with \`count+char\`. Runs of length 1 are written as just the character (no leading "1").

\`\`\`
"aaabbbcc"  →  "3a3b2c"
"abcd"      →  "abcd"
"aabba"     →  "2a2ba"
\`\`\``,
    solution: `from itertools import groupby

def run_length_encode(s: str) -> str:
    parts = []
    for ch, group in groupby(s):
        count = sum(1 for _ in group)
        parts.append(f"{count}{ch}" if count > 1 else ch)
    return "".join(parts)`,
    walkthrough: `\`groupby(s)\` iterates over the string, yielding each run as \`(character, iterator_over_that_run)\`. We convert the group iterator to a count with \`sum(1 for _ in group)\`.

The conditional \`f"{count}{ch}" if count > 1 else ch\` avoids the ugly "1a" encoding for single characters.

\`"".join(parts)\` is the idiomatic way to build strings from a list of pieces — never use \`result += ch\` in a loop (quadratic due to string immutability).`,
    complexity: 'O(n) time, O(n) space',
  },

  exercise: {
    problem: `Implement **run-length decoding**: given a run-length encoded string (output of the worked example's format), return the original string.

\`\`\`
"3a3b2c"  →  "aaabbbcc"
"abcd"    →  "abcd"
"2a2ba"   →  "aabba"
\`\`\`

The encoding: an optional digit(s) followed by a character. Single characters have no count prefix.`,
    functionName: 'run_length_decode',
    starterCode: `def run_length_decode(s: str) -> str:
    """Decode a run-length encoded string."""
    ...`,
    tests: [
      { name: 'Basic decode', input: ['3a3b2c'], expected: 'aaabbbcc' },
      { name: 'No repetitions', input: ['abcd'], expected: 'abcd' },
      { name: 'Mixed', input: ['2a2ba'], expected: 'aabba' },
      { name: 'Single char', input: ['a'], expected: 'a' },
      { name: 'Large count', input: ['10a2b'], expected: 'aaaaaaaaaabb', hidden: true },
    ],
    referenceSolution: `import re

def run_length_decode(s: str) -> str:
    # Match optional digits followed by a character
    return "".join(
        ch * (int(count) if count else 1)
        for count, ch in re.findall(r'(\\d*)(\\D)', s)
    )`,
    hints: [
      'Use `re.findall(r"(\\d*)(\\D)", s)` to split into (optional_count, char) pairs.',
      'For each pair, the count is `int(count) if count else 1` (empty string means count=1).',
      'Repeat the character: `ch * count`, then join all pieces.',
    ],
  },
};

export default problem;
