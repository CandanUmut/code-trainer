import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'asx-hashmap-pattern',
  category: 'arrays-strings-hashmaps',
  title: 'The hashmap pattern: count, group, seen',
  summary:
    'Three reusable dict moves — counting, grouping, and the seen-set trick — that turn O(n^2) loops into O(n).',
  estimatedMinutes: 18,
  order: 5,
  prerequisites: ['asx-dict-basics'],
  objectives: [
    'Count occurrences with `dict.get` and `collections.Counter`',
    'Group items with `setdefault` or `collections.defaultdict`',
    'Use a "seen" dict/set to replace a nested loop with one O(n) pass',
  ],
  glossary: [
    {
      term: 'Counter',
      definition:
        'A `dict` subclass from `collections` that counts hashable items. `Counter(seq)` builds a key→count map in one call.',
      example: "Counter('banana')  # {'a': 3, 'n': 2, 'b': 1}",
    },
    {
      term: 'defaultdict',
      definition:
        'A `dict` subclass from `collections` that auto-creates a missing key with a default value, e.g. `defaultdict(list)` makes a fresh `[]`.',
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'Why a dict beats a nested loop',
      markdown: `Many array problems ask "have I seen something related to this item before?" The naive answer is two nested loops — O(n^2). A {{term:hashmap}} answers the same question in O(1) per item, so the whole scan becomes O(n).

The pattern has three flavors you will use constantly:

- **Count** — how many times does each value appear?
- **Group** — collect items that share some key.
- **Seen** — remember what you have already passed, and check new items against it.

This lesson drills all three.`,
    },
    {
      kind: 'explanation',
      title: 'Counting with `.get(k, 0) + 1`',
      markdown: `To count occurrences, start an empty dict and bump each key:

\`\`\`python
counts = {}
for ch in "banana":
    counts[ch] = counts.get(ch, 0) + 1
# {'b': 1, 'a': 3, 'n': 2}
\`\`\`

\`counts.get(ch, 0)\` reads the current count — \`0\` the first time a key appears — and \`+ 1\` records one more sighting. The same idiom counts words, numbers, anything {{term:hashable}}.`,
    },
    {
      kind: 'predict-output',
      prompt: 'The `.get(k, 0) + 1` counting idiom. What is the final dict?',
      code: `counts = {}
for ch in "mississippi":
    counts[ch] = counts.get(ch, 0) + 1
print(counts)`,
      expected: "{'m': 1, 'i': 4, 's': 4, 'p': 2}",
      explanation: `Each character is bumped as it is seen. \`m\` appears once, \`i\` four times, \`s\` four times, \`p\` twice. The keys print in **insertion order** — \`m\`, \`i\`, \`s\`, \`p\` — the order each character was first encountered.`,
      hint: 'Count each letter of "mississippi"; keys appear in first-seen order.',
    },
    {
      kind: 'explanation',
      title: '`collections.Counter` does it for you',
      markdown: `Counting is so common that the standard library ships a {{term:counter}}:

\`\`\`python
from collections import Counter
counts = Counter("banana")     # {'a': 3, 'n': 2, 'b': 1}
counts.most_common(2)          # [('a', 3), ('n', 2)]
\`\`\`

\`Counter\` *is* a dict, so \`counts["a"]\` works — and it returns \`0\` for a missing key instead of raising. \`.most_common(k)\` hands back the top-k pairs already sorted, which is perfect for "top K frequent" problems.`,
    },
    {
      kind: 'predict-output',
      prompt: 'A `Counter` returns 0 for a missing key. What prints?',
      code: `from collections import Counter
c = Counter("aabbbc")
print(c["b"], c["z"])`,
      expected: '3 0',
      explanation: `\`c["b"]\` is \`3\` because \`b\` appears three times. \`c["z"]\` is **\`0\`**, not a \`KeyError\` — a \`Counter\` treats any unseen key as having count zero. This is one of the main reasons to use \`Counter\` over a plain dict for counting.`,
    },
    {
      kind: 'explanation',
      title: 'Grouping with `setdefault` / `defaultdict`',
      markdown: `To **group** items, each key maps to a *list* of items. The problem: the first time you see a key, there is no list yet.

\`\`\`python
# setdefault: returns the existing list, or installs a new [] first
groups = {}
for word in words:
    groups.setdefault(len(word), []).append(word)
\`\`\`

\`\`\`python
# defaultdict(list): a missing key auto-creates an empty list
from collections import defaultdict
groups = defaultdict(list)
for word in words:
    groups[len(word)].append(word)
\`\`\`

Both build a key → list-of-items map. \`defaultdict\` reads cleaner; \`setdefault\` needs no import.`,
    },
    {
      kind: 'predict-output',
      prompt: 'Grouping words by their length. What prints?',
      code: `from collections import defaultdict
groups = defaultdict(list)
for word in ["hi", "ok", "cat", "a", "dog"]:
    groups[len(word)].append(word)
print(dict(groups))`,
      expected: "{2: ['hi', 'ok'], 3: ['cat', 'dog'], 1: ['a']}",
      explanation: `Each word lands in the list for its length. \`defaultdict(list)\` makes a fresh \`[]\` the first time a length is seen, so no \`KeyError\`. The keys appear in insertion order: length \`2\` first (\`"hi"\`), then \`3\` (\`"cat"\`), then \`1\` (\`"a"\`).`,
      hint: 'Each new length key gets a fresh empty list automatically.',
    },
    {
      kind: 'fill-in-blank',
      prompt:
        'Fill the blanks so `counts` maps each number to how many times it appears.',
      template: `nums = [4, 4, 1, 4, 1]
counts = {}
for n in nums:
    counts[n] = counts.__1__ + __2__`,
      blanks: [
        {
          id: '1',
          accept: ['get(n, 0)', 'get(n,0)', 'get(n, 0) '],
          explanation:
            '`counts.get(n, 0)` reads the running count, defaulting to `0` the first time `n` is seen.',
          hint: 'Use `.get` with a default of 0.',
        },
        {
          id: '2',
          accept: ['1'],
          explanation: 'Add `1` to record one more sighting of `n`.',
          hint: 'You are counting one more occurrence.',
        },
      ],
      validation: { expectedVar: { name: 'counts', value: { '4': 3, '1': 2 } } },
    },
    {
      kind: 'multiple-choice',
      prompt:
        'You scan a list once, asking for each item "has a matching item appeared earlier?" by checking a `seen` set. What is the time complexity?',
      choices: [
        {
          id: 'a',
          markdown: '`O(n)` — one pass, and each `in` / `add` on a set is O(1)',
          correct: true,
          whyRight:
            'A single loop over n items, each doing constant-time set work, totals O(n). This is the whole point of the seen pattern.',
        },
        {
          id: 'b',
          markdown: '`O(n^2)` — checking `seen` rescans everything each time',
          correct: false,
          whyWrong:
            'A set membership test is O(1) on average; it does not rescan. That O(n^2) cost is exactly what the set eliminates.',
        },
        {
          id: 'c',
          markdown: '`O(log n)` — the set keeps items sorted',
          correct: false,
          whyWrong:
            'A Python `set` is a hash table, not a sorted structure; lookups are O(1), and one full pass is O(n).',
        },
      ],
    },
    {
      kind: 'write-line',
      prompt:
        'Using the `seen` set, write an expression that is `True` when the current value `x` has already been recorded.',
      setup: 'seen = {3, 7, 9}\nx = 7',
      mode: 'expression',
      expected: true,
      referenceAnswer: 'x in seen',
      explanation:
        '`x in seen` is the heart of the seen pattern — an O(1) membership check that replaces a backward scan over everything processed so far.',
      hint: 'Membership test against the set.',
    },
    {
      kind: 'write-function',
      prompt:
        'Write `two_sum(nums, target)` — return a list `[i, j]` of the two indices whose values add up to `target`. Use a dict mapping value → index so the search is one O(n) pass, not a nested loop. Assume exactly one answer exists; return indices with `i < j`.',
      functionName: 'two_sum',
      starterCode: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}  # value -> index
    ...`,
      tests: [
        { name: 'Basic', input: [[2, 7, 11, 15], 9], expected: [0, 1] },
        { name: 'Answer later', input: [[3, 2, 4], 6], expected: [1, 2] },
        { name: 'Same value twice', input: [[3, 3], 6], expected: [0, 1] },
        { name: 'Negatives', input: [[-1, -2, -3, -4], -6], expected: [1, 3] },
      ],
      referenceSolution: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}  # value -> index
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return [seen[complement], i]
        seen[n] = i
    return []`,
      hints: [
        'For each `n`, the value you need is `complement = target - n`.',
        'Check `if complement in seen:` BEFORE storing `n` — that guarantees `i < j` and avoids matching an item with itself.',
        '`enumerate(nums)` gives you both the index and the value.',
      ],
      explanation:
        'Instead of comparing every pair (O(n^2)), you remember each value\'s index in `seen`. For each new number you ask "have I already seen the complement?" — an O(1) dict lookup — so the whole function is O(n). Storing `n` *after* the check ensures the earlier index comes first and an element is never paired with itself.',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        'Count with `counts[k] = counts.get(k, 0) + 1`, or just `collections.Counter`.',
        'A `Counter` returns `0` for a missing key instead of raising.',
        'Group with `setdefault(key, []).append(x)` or `defaultdict(list)`.',
        'A `seen` dict/set turns "did I pass a match?" into an O(1) check, making the scan O(n).',
      ],
    },
  ],
  appliesTo: ['two-sum', 'group-anagrams', 'top-k-frequent'],
};

export default lesson;
