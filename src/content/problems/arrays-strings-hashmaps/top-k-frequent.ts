import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'top-k-frequent',
  title: 'Top K Frequent Elements',
  category: 'arrays-strings-hashmaps',
  difficulty: 'medium',
  tags: ['hashmap', 'heap', 'bucket-sort'],
  concept: `## Counting + Partial Sort with a Heap

When you need the **top-k** items by some metric, the naive approach (full sort) costs O(n log n). A **min-heap of size k** does it in O(n log k) — often dramatically faster when k << n.

\`\`\`python
import heapq
from collections import Counter

freq = Counter(nums)                  # O(n)
# heapq.nlargest uses a heap internally
return heapq.nlargest(k, freq, key=freq.get)   # O(n log k)
\`\`\`

**Bucket sort alternative — O(n):** since frequencies range from 1 to n, create n+1 buckets where \`bucket[i]\` holds all elements with frequency \`i\`. Then scan buckets from high to low.

Understanding both approaches and their tradeoffs is interview gold.`,

  workedExample: {
    problem: `Given an integer array \`nums\` and integer \`k\`, return the \`k\` most frequent elements. You may return in any order.

\`\`\`
nums = [1,1,1,2,2,3], k = 2  →  [1, 2]
nums = [1], k = 1             →  [1]
\`\`\``,
    solution: `import heapq
from collections import Counter

def top_k_frequent(nums: list[int], k: int) -> list[int]:
    freq = Counter(nums)
    # nlargest picks k items from the iterable maximizing key
    return heapq.nlargest(k, freq, key=freq.get)`,
    steps: [
      {
        lines: [1, 2],
        explanation: '`heapq` provides the `nlargest` function that efficiently selects the top-k items without a full sort. `Counter` from `collections` is a `dict` subclass that counts occurrences in one pass.',
      },
      {
        lines: [4, 5],
        explanation: '`Counter(nums)` builds a frequency map — keys are unique numbers, values are how many times each appears. This is O(n) and far cleaner than manually writing a loop to populate a dict.',
        stateAfter: [
          { name: 'freq (e.g. [1,1,1,2,2,3])', value: 'Counter({1: 3, 2: 2, 3: 1})' },
        ],
      },
      {
        lines: [6, 7],
        explanation: '`heapq.nlargest(k, freq, key=freq.get)` iterates over the *keys* of `freq` (the unique numbers) and returns the k with the largest values under `freq.get`. It maintains a min-heap of size k internally — O(n log k) total, better than sorting all n elements when k is small.',
      },
    ],
    complexity: 'O(n log k) time, O(n) space',
  },

  exercise: {
    problem: `Given a list of strings \`words\` and integer \`k\`, return the \`k\` most frequent words. Sort the result by frequency (descending); break ties alphabetically (ascending).

\`\`\`
words = ["i","love","leetcode","i","love","coding"], k = 2
→ ["i", "love"]

words = ["the","day","is","sunny","the","the","the","sunny","is","is"], k = 4
→ ["the","is","sunny","day"]
\`\`\``,
    functionName: 'top_k_frequent_words',
    starterCode: `def top_k_frequent_words(words: list[str], k: int) -> list[str]:
    """Return k most frequent words, sorted by frequency desc then alphabetically asc."""
    ...`,
    tests: [
      {
        name: 'Basic example',
        input: [['i', 'love', 'leetcode', 'i', 'love', 'coding'], 2],
        expected: ['i', 'love'],
      },
      {
        name: 'Alphabetical tiebreak',
        input: [['the', 'day', 'is', 'sunny', 'the', 'the', 'the', 'sunny', 'is', 'is'], 4],
        expected: ['the', 'is', 'sunny', 'day'],
      },
      { name: 'k=1', input: [['a', 'b', 'a'], 1], expected: ['a'] },
      {
        name: 'Alphabetical tiebreak exact',
        input: [['a', 'b', 'c', 'a', 'b', 'c'], 2],
        expected: ['a', 'b'],
        hidden: true,
      },
    ],
    referenceSolution: `from collections import Counter

def top_k_frequent_words(words: list[str], k: int) -> list[str]:
    freq = Counter(words)
    # Sort by (-frequency, word) so highest freq comes first, ties broken alphabetically
    return sorted(freq, key=lambda w: (-freq[w], w))[:k]`,
    hints: [
      'Count frequencies with `Counter`. The challenge is the sort order: primary by frequency (descending), secondary by word (ascending).',
      'Python\'s `sorted` is stable and accepts a tuple key. `(-freq[w], w)` sorts by negative frequency (so higher freq = lower sort key) then alphabetically.',
      'After sorting by that key, slice `[:k]` to get the top k.',
    ],
  },
};

export default problem;
