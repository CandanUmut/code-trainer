import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'asx-sets',
  category: 'arrays-strings-hashmaps',
  title: 'Sets and membership',
  summary:
    'An unordered collection of unique items with O(1) membership — plus the set operators and the famous empty-braces trap.',
  estimatedMinutes: 14,
  order: 7,
  prerequisites: ['asx-dict-basics'],
  objectives: [
    'Create a set and deduplicate a list with it',
    'Use O(1) `in` membership and the `&`, `|`, `-` operators',
    'Avoid the `{}` empty-dict trap and remember sets are unordered',
  ],
  glossary: [
    {
      term: 'Set',
      definition:
        'An unordered collection of unique, hashable items with average-case O(1) membership tests. Created with `{...}` or `set(...)`.',
      example: "{1, 2, 2, 3}  # {1, 2, 3}",
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'A set holds unique items',
      markdown: `A \`set\` is an unordered collection where every item is **unique** and {{term:hashable}}. You write one with curly braces:

\`\`\`python
colors = {"red", "green", "blue"}
nums = set([1, 2, 2, 3])   # {1, 2, 3} — duplicates dropped
\`\`\`

A set is like a {{term:hashmap}} with keys but no values. Its superpower is the same: an \`in\` check is O(1), so testing membership against a set is far faster than scanning a list.`,
    },
    {
      kind: 'predict-output',
      prompt: 'A set drops duplicates. What is the size of this set?',
      code: `nums = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3}
print(len(nums))`,
      expected: '7',
      explanation: `A set keeps only **unique** items. The literal lists ten numbers, but \`1\`, \`5\`, and \`3\` each appear twice — so the set holds just \`{1, 2, 3, 4, 5, 6, 9}\`, which is **7** distinct values. The three duplicates collapse, taking the count from 10 down to 7.`,
      hint: 'List the distinct values, ignoring repeats.',
    },
    {
      kind: 'explanation',
      title: 'The `{}` trap: that is a dict',
      markdown: `Empty curly braces do **not** make an empty set:

\`\`\`python
type({})       # <class 'dict'>   — surprise!
type(set())    # <class 'set'>    — this is the empty set
\`\`\`

\`{}\` is reserved for the empty **dict**. To make an empty set you must call \`set()\`. (A non-empty literal like \`{1, 2}\` *is* a set — the ambiguity only bites for the empty case.)`,
    },
    {
      kind: 'predict-output',
      prompt: 'Empty braces. Is `box` a set or a dict?',
      code: `box = {}
try:
    box.add(5)
except AttributeError as e:
    print("AttributeError:", e)`,
      expected: "AttributeError: 'dict' object has no attribute 'add'",
      explanation: `\`{}\` creates an empty **dict**, not a set. A dict has no \`.add()\` method, so \`box.add(5)\` raises \`AttributeError: 'dict' object has no attribute 'add'\`. To get an empty set you must write \`box = set()\`.`,
      hint: '`{}` is the empty dict — and dicts have no `.add`.',
    },
    {
      kind: 'explanation',
      title: '`.add()` is idempotent',
      markdown: `You grow a set with \`.add()\`. Adding an item that is already present does nothing — the set stays the same size:

\`\`\`python
seen = set()
seen.add(7)
seen.add(7)    # no effect — 7 is already in
len(seen)      # 1
\`\`\`

\`set.add\` is {{term:idempotent}}: run it once or ten times with the same value, the result is identical. This is exactly why a set is the natural home for the "seen" pattern — you never have to check before adding.`,
    },
    {
      kind: 'predict-output',
      prompt: 'Set operators. What do these three lines print?',
      code: `a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(sorted(a & b))
print(sorted(a | b))
print(sorted(a - b))`,
      expected: `[3, 4]
[1, 2, 3, 4, 5, 6]
[1, 2]`,
      explanation: `\`&\` is **intersection** (items in both) → \`{3, 4}\`. \`|\` is **union** (items in either) → \`{1,2,3,4,5,6}\`. \`-\` is **difference** (in \`a\` but not \`b\`) → \`{1, 2}\`. We wrap each in \`sorted()\` only to get a predictable printed order, since a set itself is unordered.`,
      hint: '& = both, | = either, - = in the first only.',
    },
    {
      kind: 'multiple-choice',
      prompt:
        'Why does converting a list to a `set` make repeated membership tests dramatically faster?',
      choices: [
        {
          id: 'a',
          markdown: 'A set uses a hash table, so `x in s` is average O(1); `x in list` is O(n).',
          correct: true,
          whyRight:
            'A set hashes each item to a slot, so membership is a direct lookup — independent of size. A list must scan element by element.',
        },
        {
          id: 'b',
          markdown: 'A set keeps its items sorted, so `in` uses binary search.',
          correct: false,
          whyWrong: 'A set is a hash table, not a sorted structure — it has no defined order at all.',
        },
        {
          id: 'c',
          markdown: 'A set caches the most recent lookups.',
          correct: false,
          whyWrong: 'There is no lookup cache; the speed comes purely from hashing, which makes every lookup O(1).',
        },
      ],
    },
    {
      kind: 'fill-in-blank',
      prompt:
        'Fill the blank so `unique` is the sorted list of distinct values in `nums`.',
      template: `nums = [4, 2, 4, 1, 2, 4]
unique = sorted(__1__(nums))`,
      blanks: [
        {
          id: '1',
          accept: ['set'],
          explanation:
            '`set(nums)` collapses the duplicates to `{1, 2, 4}`; `sorted(...)` turns that into the ordered list `[1, 2, 4]`.',
          hint: 'Which constructor drops duplicates?',
        },
      ],
      validation: { expectedVar: { name: 'unique', value: [1, 2, 4] } },
    },
    {
      kind: 'write-line',
      prompt:
        'Write an expression that is `True` when the value `target` is one of the items in the set `seen`.',
      setup: 'seen = {10, 20, 30}\ntarget = 20',
      mode: 'expression',
      expected: true,
      referenceAnswer: 'target in seen',
      explanation:
        '`target in seen` is an O(1) hash lookup — the fast membership test that makes sets ideal for "have I encountered this?" checks.',
      hint: 'Use the `in` operator.',
    },
    {
      kind: 'write-function',
      prompt:
        'Write `has_duplicate(nums)` that returns `True` if any value appears more than once, else `False`. Use a set so the scan is a single O(n) pass.',
      functionName: 'has_duplicate',
      starterCode: `def has_duplicate(nums: list[int]) -> bool:
    ...`,
      tests: [
        { name: 'Has a dup', input: [[1, 2, 3, 2]], expected: true },
        { name: 'All unique', input: [[1, 2, 3, 4]], expected: false },
        { name: 'Empty', input: [[]], expected: false },
        { name: 'Dup at end', input: [[5, 6, 7, 5]], expected: true },
      ],
      referenceSolution: `def has_duplicate(nums: list[int]) -> bool:
    seen = set()
    for n in nums:
        if n in seen:
            return True
        seen.add(n)
    return False`,
      hints: [
        'Keep a `seen` set and walk the list once.',
        'Before adding `n`, check `if n in seen:` — if it is already there you found a duplicate.',
        'A neat alternative: `len(set(nums)) != len(nums)`.',
      ],
      explanation:
        'Each item is checked against `seen` (O(1)) and then added. The first time you meet a value you have already stored, you return `True`. One pass, O(n) — far better than comparing every pair.',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        'A set holds unique, hashable items and `set(list)` deduplicates instantly.',
        '`{}` is an empty **dict** — use `set()` for an empty set.',
        '`.add()` is idempotent; `x in s` is O(1) — the basis of the "seen" pattern.',
        '`&` `|` `-` are intersection, union, difference; sets have no order.',
      ],
    },
  ],
  appliesTo: ['longest-consecutive', 'valid-sudoku'],
};

export default lesson;
