import type { Lesson } from '../../../types';

const lesson: Lesson = {
  id: 'asx-strings',
  category: 'arrays-strings-hashmaps',
  title: 'Strings: slicing, methods, joining',
  summary:
    'Strings are immutable sequences — slice them, split and join them, normalize case, and build them with f-strings.',
  estimatedMinutes: 15,
  order: 6,
  prerequisites: ['asx-indexing-slicing'],
  objectives: [
    'Explain why strings are immutable and what that forces you to do',
    'Convert between strings and lists with `.split()` and `.join()`',
    'Normalize text with `.strip()`, `.lower()`, `.upper()` and build with f-strings',
  ],
  glossary: [
    {
      term: 'f-string',
      definition:
        'A string literal prefixed with `f` whose `{...}` placeholders are replaced by the values of the enclosed expressions.',
      example: "name = 'Ada'; f'hi {name}'  # 'hi Ada'",
    },
  ],
  steps: [
    {
      kind: 'explanation',
      title: 'A string is an immutable sequence',
      markdown: `A \`str\` is an {{term:iterable}} sequence of characters — you can index and slice it just like a list:

\`\`\`python
s = "python"
s[0]      # 'p'
s[-1]     # 'n'
s[1:4]    # 'yth'
s[::-1]   # 'nohtyp'  — reversed
\`\`\`

But a string is {{term:immutable}}: you **cannot** change a character in place. Every "edit" actually produces a brand-new string. That single fact shapes how all string code is written.`,
    },
    {
      kind: 'predict-output',
      prompt: 'Strings are immutable. What happens on the second line?',
      code: `s = "cat"
try:
    s[0] = "b"
except TypeError as e:
    print("TypeError:", e)`,
      expected: "TypeError: 'str' object does not support item assignment",
      explanation: `A string is **immutable**, so item assignment is not allowed — Python raises \`TypeError: 'str' object does not support item assignment\`. To get \`"bat"\` you must build a *new* string, e.g. \`"b" + s[1:]\`.`,
      hint: 'You cannot mutate a character in place.',
    },
    {
      kind: 'predict-output',
      prompt: 'How do you actually "change" a character, then?',
      code: `s = "cat"
s = "b" + s[1:]
print(s)`,
      expected: 'bat',
      explanation: `Since you cannot mutate \`s\`, you **rebuild** it: \`"b"\` concatenated with the slice \`s[1:]\` (which is \`"at"\`) gives the new string \`"bat"\`. Reassigning \`s\` points the name at this new object — the original \`"cat"\` is unchanged and simply discarded.`,
    },
    {
      kind: 'explanation',
      title: '`.split()` and `.join()`',
      markdown: `These two methods convert between a string and a list of pieces — they are inverses:

\`\`\`python
"a,b,c".split(",")     # ['a', 'b', 'c']  — str -> list
"-".join(["a", "b"])   # 'a-b'            — list -> str
"hello world".split()  # ['hello', 'world']  — no arg: split on whitespace
\`\`\`

Note the direction of \`.join()\`: the **separator** string owns the method, and you pass it the list. \`",".join(parts)\` reads as "glue parts with commas".`,
    },
    {
      kind: 'predict-output',
      prompt: 'Watch the `.join()` syntax carefully. What prints?',
      code: `words = ["red", "green", "blue"]
print("-".join(words))
print("".join(words))`,
      expected: `red-green-blue
redgreenblue`,
      explanation: `\`.join()\` is called **on the separator**, not the list. \`"-".join(words)\` puts a \`-\` between each word. \`"".join(words)\` uses an empty separator, concatenating the words with nothing between them.`,
      hint: 'separator.join(list) — the separator goes between each item.',
    },
    {
      kind: 'explanation',
      title: 'Cleaning and normalizing text',
      markdown: `Three methods come up constantly when comparing or cleaning text. Each returns a **new** string:

\`\`\`python
"  hello  ".strip()    # 'hello'  — trim leading/trailing whitespace
"Hello".lower()        # 'hello'
"Hello".upper()        # 'HELLO'
\`\`\`

To compare text case-insensitively, normalize first: \`a.lower() == b.lower()\`. And because these return new strings, you must capture the result — \`s.strip()\` alone does nothing if you ignore what it hands back.`,
    },
    {
      kind: 'fill-in-blank',
      prompt:
        'Fill the blank so `clean` is the input with surrounding spaces removed and lowercased.',
      template: `raw = "   Hello World   "
clean = raw.strip().__1__`,
      blanks: [
        {
          id: '1',
          accept: ['lower()', 'lower ()'],
          explanation:
            '`.strip()` trims the spaces, then `.lower()` on its result lowercases everything → `"hello world"`. Method calls chain left to right.',
          hint: 'Which method makes a string all lowercase?',
        },
      ],
      validation: { expectedVar: { name: 'clean', value: 'hello world' } },
    },
    {
      kind: 'predict-output',
      prompt: '`sorted` on a string — what type comes back?',
      code: `s = "cba"
result = sorted(s)
print(result)
print(type(result).__name__)`,
      expected: `['a', 'b', 'c']
list`,
      explanation: `\`sorted()\` always returns a **\`list\`**, never a string — even when given a string. \`sorted("cba")\` produces \`['a', 'b', 'c']\`, a list of single-character strings. To get a sorted *string* back you would write \`"".join(sorted(s))\`.`,
      hint: '`sorted()` returns a list no matter what you feed it.',
    },
    {
      kind: 'multiple-choice',
      prompt:
        'You want a single sorted *string* of the characters of `s` (so `"cba"` becomes `"abc"`). Which expression is correct?',
      choices: [
        {
          id: 'a',
          markdown: '`"".join(sorted(s))`',
          correct: true,
          whyRight:
            '`sorted(s)` gives a list of characters; `"".join(...)` glues them back into one string.',
        },
        {
          id: 'b',
          markdown: '`sorted(s)`',
          correct: false,
          whyWrong: '`sorted` returns a *list* of characters, not a string.',
        },
        {
          id: 'c',
          markdown: '`s.sort()`',
          correct: false,
          whyWrong:
            'Strings are immutable and have no `.sort()` method — that is a `list` method.',
        },
      ],
    },
    {
      kind: 'write-line',
      prompt:
        'Using an f-string, write an expression that produces the string `"Ada is 36"` from the variables.',
      setup: 'name = "Ada"\nage = 36',
      mode: 'expression',
      expected: 'Ada is 36',
      referenceAnswer: 'f"{name} is {age}"',
      explanation:
        'An {{term:f-string}} substitutes each `{...}` with the value of the expression inside it: `{name}` → `Ada`, `{age}` → `36`.',
      hint: 'Prefix the string with `f` and put the variable names in `{}`.',
    },
    {
      kind: 'write-function',
      prompt:
        'Write `normalize_key(s)` that returns a "signature" for a word: lowercase it, strip surrounding whitespace, then return its characters sorted into a single string. Two anagrams must produce the same signature.',
      functionName: 'normalize_key',
      starterCode: `def normalize_key(s: str) -> str:
    ...`,
      tests: [
        { name: 'Plain word', input: ['listen'], expected: 'eilnst' },
        { name: 'Anagram matches', input: ['silent'], expected: 'eilnst' },
        { name: 'Case and spaces', input: ['  Silent '], expected: 'eilnst' },
        { name: 'Empty string', input: [''], expected: '' },
      ],
      referenceSolution: `def normalize_key(s: str) -> str:
    return "".join(sorted(s.strip().lower()))`,
      hints: [
        'Clean first: `s.strip().lower()`.',
        '`sorted(...)` of a string gives a list of characters.',
        '`"".join(...)` turns that list back into a string.',
      ],
      explanation:
        'Anagrams have the same letters in a different order, so sorting the (cleaned, lowercased) characters produces an identical key for all of them. `"".join(sorted(...))` is the standard recipe — it is exactly how "group anagrams" buckets its words.',
    },
    {
      kind: 'checklist',
      title: 'Before you move on',
      items: [
        'Strings are immutable — `s[0] = "x"` raises; rebuild with slicing/concatenation instead.',
        '`.split()` turns a string into a list; `separator.join(list)` turns a list back into a string.',
        '`.strip()`, `.lower()`, `.upper()` return new strings — capture the result.',
        '`sorted(s)` returns a *list* of characters; use `"".join(sorted(s))` for a sorted string.',
      ],
    },
  ],
  appliesTo: ['group-anagrams'],
};

export default lesson;
