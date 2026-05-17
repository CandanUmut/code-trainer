import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'asx-prefix-window',
  category: 'arrays-strings-hashmaps',
  title: 'Prefix sums and sliding windows',
  summary:
    'Two linear-time array techniques: a prefix-sum array for O(1) range sums, and the expand/contract sliding window.',
  estimatedMinutes: 20,
  order: 8,
  prerequisites: ['asx-hashmap-pattern'],
  objectives: [
    'Build a prefix-sum array and read any subarray sum in O(1)',
    'Explain why prefix sums beat re-summing each range',
    'Apply the expand/contract sliding-window idiom',
  ],
  glossary: [
    {
      term: 'Prefix sum',
      definition:
        'A running total where `prefix[i]` holds the sum of the first `i` elements. The sum of elements `j..k` is then `prefix[k+1] - prefix[j]`.',
      example: 'nums=[2,4,6] -> prefix=[0,2,6,12]',
    },
    {
      term: 'Sliding window',
      definition:
        'A contiguous range over a sequence, grown from the right and shrunk from the left, so all valid ranges are scanned in one O(n) pass.',
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'Why re-summing ranges is slow',
      markdown: `Suppose you must answer many "sum of elements from index \`j\` to \`k\`" questions. The obvious loop re-adds the range every time:

\`\`\`python
sum(nums[j:k+1])   # O(k - j) work — per query
\`\`\`

With \`q\` queries over an array of size \`n\`, that is up to \`O(n * q)\`. A {{term:prefix-sum}} array trades a single O(n) setup pass for O(1) answers afterwards.`,
    },
    {
      kind: 'explanation',
      title: 'Building the prefix-sum array',
      markdown: `\`prefix\` is one element **longer** than \`nums\`. \`prefix[0] = 0\`, and each later entry adds the next number:

\`\`\`python
nums = [2, 4, 6, 8]
prefix = [0]
for n in nums:
    prefix.append(prefix[-1] + n)
# prefix = [0, 2, 6, 12, 20]
\`\`\`

\`prefix[i]\` is "the sum of the first \`i\` numbers". The leading \`0\` is what makes the range formula work cleanly with no special case for ranges that start at index 0.`,
    },
    {
      kind: 'predict-output',
      prompt: 'Building a prefix-sum array. What is the final list?',
      code: `nums = [5, 1, 3, 2]
prefix = [0]
for n in nums:
    prefix.append(prefix[-1] + n)
print(prefix)`,
      expected: '[0, 5, 6, 9, 11]',
      explanation: `Start with \`[0]\`. Add \`5\` → \`5\`; add \`1\` → \`6\`; add \`3\` → \`9\`; add \`2\` → \`11\`. The result \`[0, 5, 6, 9, 11]\` has **five** entries for a four-element input — one extra because of the leading \`0\`.`,
      hint: 'Each new entry is the previous total plus the next number.',
    },
    {
      kind: 'explanation',
      title: 'The O(1) range-sum formula',
      markdown: `With the prefix array built, the sum of \`nums[j:k+1]\` (indices \`j\` through \`k\` inclusive) is just one subtraction:

\`\`\`python
range_sum = prefix[k + 1] - prefix[j]
\`\`\`

\`prefix[k+1]\` is the total up to and including index \`k\`; \`prefix[j]\` is the total *before* index \`j\`. Subtracting cancels the shared front part, leaving exactly the middle range — in O(1), no matter how wide it is.`,
    },
    {
      kind: 'predict-output',
      prompt: 'Using the range-sum formula. What does this print?',
      code: `nums = [5, 1, 3, 2]
prefix = [0, 5, 6, 9, 11]
# sum of indices 1..3 inclusive
print(prefix[3 + 1] - prefix[1])`,
      expected: '6',
      explanation: `Indices 1..3 of \`nums\` are \`1, 3, 2\`, which sum to \`6\`. The formula \`prefix[k+1] - prefix[j]\` with \`j = 1\`, \`k = 3\` gives \`prefix[4] - prefix[1]\` = \`11 - 5\` = \`6\` — no loop needed.`,
      hint: 'prefix[k+1] - prefix[j], with j=1 and k=3.',
    },
    {
      kind: 'fill-in-blank',
      prompt:
        'Fill the blanks to complete the prefix-sum builder.',
      template: `nums = [3, 3, 4]
prefix = [__1__]
for n in nums:
    prefix.append(prefix[-1] + __2__)`,
      blanks: [
        {
          id: '1',
          accept: ['0'],
          explanation:
            'The prefix array starts with a single `0` — the sum of zero elements.',
          hint: 'The sum of nothing.',
        },
        {
          id: '2',
          accept: ['n'],
          explanation:
            'Each new running total is the previous total `prefix[-1]` plus the current number `n`.',
          hint: 'Add the current loop value.',
        },
      ],
      validation: { expectedVar: { name: 'prefix', value: [0, 3, 6, 10] } },
    },
    {
      kind: 'write-function',
      prompt:
        'Write `range_sum(nums, j, k)` that returns the sum of `nums[j..k]` inclusive. Build a prefix-sum array first, then use the subtraction formula. (For one query this is overkill — the point is to practice the technique.)',
      functionName: 'range_sum',
      starterCode: `def range_sum(nums: list[int], j: int, k: int) -> int:
    prefix = [0]
    ...`,
      tests: [
        { name: 'Middle range', input: [[5, 1, 3, 2], 1, 3], expected: 6 },
        { name: 'Whole array', input: [[5, 1, 3, 2], 0, 3], expected: 11 },
        { name: 'Single element', input: [[5, 1, 3, 2], 2, 2], expected: 3 },
        { name: 'Starts at zero', input: [[10, 20, 30], 0, 1], expected: 30 },
      ],
      referenceSolution: `def range_sum(nums: list[int], j: int, k: int) -> int:
    prefix = [0]
    for n in nums:
        prefix.append(prefix[-1] + n)
    return prefix[k + 1] - prefix[j]`,
      hints: [
        'Build `prefix` so `prefix[i]` is the sum of the first `i` elements.',
        'The answer is `prefix[k + 1] - prefix[j]`.',
        'The `+ 1` on `k` is because `prefix` is offset by the leading `0`.',
      ],
      explanation:
        'Once `prefix` is built, every range query is a single subtraction. `prefix[k+1]` includes index `k`; `prefix[j]` is everything before `j`; their difference is exactly the range — O(1) per query after the O(n) build.',
    },
    {
      kind: 'explanation',
      title: 'The sliding-window idiom',
      markdown: `A {{term:sliding-window}} keeps a contiguous range \`[left, right]\` over a sequence. You **expand** by moving \`right\` forward, and **contract** by moving \`left\` forward when the window breaks a rule:

\`\`\`python
left = 0
for right in range(len(nums)):
    # 1. expand: bring nums[right] into the window
    while window_is_invalid():
        # 2. contract: drop nums[left], shrink from the left
        left += 1
    # 3. the window [left, right] is now valid — record it
\`\`\`

Each index enters once and leaves once, so the whole scan is **O(n)** even though the window is constantly resized.`,
    },
    {
      kind: 'multiple-choice',
      prompt:
        'In the sliding-window idiom, why is the total cost O(n) even though there is a `while` loop nested inside the `for` loop?',
      choices: [
        {
          id: 'a',
          markdown:
            '`left` only ever moves forward, so across the whole run it advances at most n times total.',
          correct: true,
          whyRight:
            '`right` advances n times and `left` advances at most n times overall — the inner `while` is amortized, not per-iteration. Total work is O(n).',
        },
        {
          id: 'b',
          markdown: 'The `while` loop runs a constant number of times per `right`.',
          correct: false,
          whyWrong:
            'It can run many times for one `right` and zero for another — it is not constant per step. The bound comes from `left` never moving backward.',
        },
        {
          id: 'c',
          markdown: 'Nested loops are always O(n) in Python.',
          correct: false,
          whyWrong:
            'Nested loops are usually O(n^2). This case is special precisely because `left` is monotonic.',
        },
      ],
    },
    {
      kind: 'write-function',
      prompt:
        'Write `max_window_sum(nums, k)` — the largest sum of any `k` consecutive elements. Use a fixed-size sliding window: keep a running sum, add the entering element and subtract the leaving one as the window slides. Assume `1 <= k <= len(nums)`.',
      functionName: 'max_window_sum',
      starterCode: `def max_window_sum(nums: list[int], k: int) -> int:
    ...`,
      tests: [
        { name: 'Window of 2', input: [[1, 4, 2, 10, 3], 2], expected: 13 },
        { name: 'Window of 3', input: [[1, 4, 2, 10, 3], 3], expected: 16 },
        { name: 'Whole array', input: [[2, 3, 5], 3], expected: 10 },
        { name: 'Window of 1', input: [[7, 1, 9, 4], 1], expected: 9 },
      ],
      referenceSolution: `def max_window_sum(nums: list[int], k: int) -> int:
    window = sum(nums[:k])
    best = window
    for right in range(k, len(nums)):
        window += nums[right] - nums[right - k]
        best = max(best, window)
    return best`,
      hints: [
        'Start with `window = sum(nums[:k])` — the first window — and treat that as the best so far.',
        'To slide one step: add the new element `nums[right]` and subtract the one that fell off, `nums[right - k]`.',
        'Update `best = max(best, window)` after each slide.',
      ],
      explanation:
        'Re-summing every window from scratch would be O(n*k). Instead the running `window` is updated in O(1) per slide — add the entering element, subtract the leaving one — so the whole function is O(n). This add-one/drop-one move is the core of every fixed-size window problem.',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        '`prefix` is one longer than `nums`, starts with `0`, and `prefix[i]` is the sum of the first `i` items.',
        'Any range sum `j..k` is `prefix[k+1] - prefix[j]` — O(1) after an O(n) build.',
        'A sliding window expands `right` and contracts `left`; `left` never moves backward.',
        'A fixed-size window slides in O(1): add the entering element, subtract the leaving one.',
      ],
    },
  ],
  appliesTo: ['product-except-self', 'minimum-window', 'sliding-window-max'],
};

export default lesson;
