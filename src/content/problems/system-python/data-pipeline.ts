import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'data-pipeline',
  title: 'CSV/Data Pipeline with csv and io modules',
  category: 'system-python',
  difficulty: 'medium',
  tags: ['csv', 'io', 'data-processing', 'pipeline'],
  concept: `## In-Memory CSV Processing with csv and io

Since we can't use the real filesystem, simulate it with \`io.StringIO\` — an in-memory string buffer that looks like a file object.

\`\`\`python
import csv
import io

# Writing CSV
output = io.StringIO()
writer = csv.DictWriter(output, fieldnames=["name", "score"])
writer.writeheader()
writer.writerow({"name": "Alice", "score": 95})
csv_string = output.getvalue()

# Reading CSV
reader = csv.DictReader(io.StringIO(csv_string))
for row in reader:
    print(row["name"], row["score"])  # rows are dicts
\`\`\`

\`csv.DictReader\` yields each row as an \`OrderedDict\` (Python 3.7+: regular dict). The first row is treated as headers.

For transformations, compose the read → transform → write pipeline using generators to keep memory low.`,

  workedExample: {
    problem: `Given a CSV string with columns \`name,score,grade\`, filter rows where \`score > threshold\`, sort by score descending, and return the result as a new CSV string.`,
    solution: `import csv
import io

def filter_and_sort_csv(csv_string: str, threshold: float) -> str:
    reader = csv.DictReader(io.StringIO(csv_string))
    rows = [row for row in reader if float(row["score"]) > threshold]
    rows.sort(key=lambda r: float(r["score"]), reverse=True)

    output = io.StringIO()
    if rows:
        writer = csv.DictWriter(output, fieldnames=reader.fieldnames or [])
        writer.writeheader()
        writer.writerows(rows)
    return output.getvalue()`,
    walkthrough: `\`io.StringIO(csv_string)\` creates an in-memory file-like object. \`DictReader\` consumes it row by row, turning each into a dict keyed by column headers.

We collect rows into a list (to sort), filter with a float comparison, then sort descending. Finally, \`DictWriter\` writes back to another \`StringIO\` buffer using the same fieldnames.

\`reader.fieldnames\` becomes available after iteration starts — it's read from the header row. We access it after the list comprehension.`,
    complexity: 'O(n log n) due to sort',
  },

  exercise: {
    problem: `Given a CSV string with columns \`date,category,amount\` (date as YYYY-MM-DD, amount as float), compute:
1. Total amount per category
2. Monthly totals (YYYY-MM format)
3. The category with the highest total

Return a dict with keys \`"by_category"\`, \`"by_month"\`, \`"top_category"\`.`,
    functionName: 'analyze_transactions',
    starterCode: `import csv
import io
from collections import defaultdict
from typing import Any

def analyze_transactions(csv_string: str) -> dict[str, Any]:
    """Aggregate transaction CSV by category and month."""
    ...`,
    tests: [
      {
        name: 'Basic analysis',
        input: [
          'date,category,amount\n2024-01-15,food,50.0\n2024-01-20,food,30.0\n2024-02-01,travel,200.0\n2024-02-10,food,25.0\n',
        ],
        expected: {
          by_category: { food: 105.0, travel: 200.0 },
          by_month: { '2024-01': 80.0, '2024-02': 225.0 },
          top_category: 'travel',
        },
      },
    ],
    referenceSolution: `import csv
import io
from collections import defaultdict
from typing import Any

def analyze_transactions(csv_string: str) -> dict[str, Any]:
    by_category: defaultdict[str, float] = defaultdict(float)
    by_month: defaultdict[str, float] = defaultdict(float)

    for row in csv.DictReader(io.StringIO(csv_string)):
        amount = float(row["amount"])
        by_category[row["category"]] += amount
        month = row["date"][:7]  # "YYYY-MM"
        by_month[month] += amount

    top_category = max(by_category, key=by_category.get)  # type: ignore[arg-type]
    return {
        "by_category": dict(by_category),
        "by_month": dict(by_month),
        "top_category": top_category,
    }`,
    hints: [
      'Use `csv.DictReader(io.StringIO(csv_string))` to iterate over rows.',
      'Use `defaultdict(float)` for both aggregation dicts. Add `float(row["amount"])` to the category and month keys.',
      'Month key: `row["date"][:7]` slices "2024-01-15" to "2024-01".',
    ],
  },
};

export default problem;
