import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'regex-parsing',
  title: 'Regex: Named Groups, Lookaheads, and Complex Parsing',
  category: 'system-python',
  difficulty: 'medium',
  tags: ['regex', 'parsing', 're', 'named-groups'],
  concept: `## Advanced Regex in Python

**Named groups** make regex more readable and maintainable:
\`\`\`python
import re

pattern = re.compile(
    r'(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})'
)
m = pattern.match("2024-01-15")
m.group("year")   # "2024"
m.groupdict()     # {"year": "2024", "month": "01", "day": "15"}
\`\`\`

**Lookaheads and lookbehinds (zero-width assertions):**
- \`(?=...)\` — positive lookahead: "followed by"
- \`(?!...)\` — negative lookahead: "not followed by"
- \`(?<=...)\` — positive lookbehind: "preceded by"
- \`(?<!...)\` — negative lookbehind: "not preceded by"

\`\`\`python
# Extract numbers not followed by "px"
re.findall(r'\\d+(?!px)', "10px 20em 30")
# ['1', '20', '30']  — '1' from '10px' (last digit), '20', '30'
\`\`\`

**\`re.VERBOSE\`:** allows whitespace and comments in patterns for readability.`,

  workedExample: {
    problem: `Parse log lines of the format:
\`[2024-01-15 10:23:45] ERROR service_name: message text\`

Extract timestamp, level, service, and message into a dict. Lines that don't match the format should return \`None\`.`,
    solution: `import re
from typing import Optional

LOG_PATTERN = re.compile(
    r"""
    \\[
    (?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})
    \\
    (?P<hour>\\d{2}):(?P<minute>\\d{2}):(?P<second>\\d{2})
    \\]
    \\ (?P<level>\\w+)
    \\ (?P<service>\\S+):
    \\ (?P<message>.+)
    """,
    re.VERBOSE,
)

def parse_log_line(line: str) -> Optional[dict]:
    m = LOG_PATTERN.match(line.strip())
    if not m:
        return None
    d = m.groupdict()
    return {
        "timestamp": f"{d['year']}-{d['month']}-{d['day']} {d['hour']}:{d['minute']}:{d['second']}",
        "level": d["level"],
        "service": d["service"],
        "message": d["message"],
    }`,
    walkthrough: `\`re.VERBOSE\` lets us split the pattern across lines and add whitespace for readability. The actual match still works — \`re.VERBOSE\` just strips whitespace and comments from the pattern string.

Named groups (\`(?P<name>...)\`) let us use \`m.groupdict()\` to get a clean dict of all captures, rather than positional \`m.group(1)\`, \`m.group(2)\`, etc.

We strip the line before matching to handle trailing newlines from file I/O.`,
    complexity: 'O(n) where n is line length',
  },

  exercise: {
    problem: `Parse configuration files in a custom format where each valid line is:
\`key = value  # optional comment\`

Keys are alphanumeric with underscores. Values can be integers, floats, booleans (\`true\`/\`false\`), or quoted strings. Return a dict mapping keys to their Python-typed values. Skip blank lines and full-comment lines (\`# ...\`).

\`\`\`
# Database config
host = "localhost"
port = 5432
debug = true
timeout = 30.5
\`\`\`
→ \`{"host": "localhost", "port": 5432, "debug": True, "timeout": 30.5}\``,
    functionName: 'parse_config',
    starterCode: `import re
from typing import Any

def parse_config(text: str) -> dict[str, Any]:
    """Parse custom config format into a Python dict with typed values."""
    ...`,
    tests: [
      {
        name: 'Full config',
        input: [
          '# Database config\nhost = "localhost"\nport = 5432\ndebug = true\ntimeout = 30.5\n',
        ],
        expected: { host: 'localhost', port: 5432, debug: true, timeout: 30.5 },
      },
      {
        name: 'Inline comments',
        input: ['name = "test"  # this is the name\nvalue = 42  # answer\n'],
        expected: { name: 'test', value: 42 },
      },
      {
        name: 'Boolean values',
        input: ['enabled = true\ndisabled = false\n'],
        expected: { enabled: true, disabled: false },
      },
    ],
    referenceSolution: `import re
from typing import Any

KEY_VALUE = re.compile(
    r'^(?P<key>[a-zA-Z_]\\w*)\\s*=\\s*(?P<value>.+?)\\s*(?:#.*)?$'
)

def _parse_value(raw: str) -> Any:
    raw = raw.strip()
    if raw.startswith('"') and raw.endswith('"'):
        return raw[1:-1]
    if raw == 'true':
        return True
    if raw == 'false':
        return False
    try:
        return int(raw)
    except ValueError:
        pass
    try:
        return float(raw)
    except ValueError:
        pass
    return raw

def parse_config(text: str) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith('#'):
            continue
        m = KEY_VALUE.match(stripped)
        if m:
            result[m.group('key')] = _parse_value(m.group('value'))
    return result`,
    hints: [
      'Split on lines. Skip blank lines and lines starting with `#`.',
      'Use a regex like `r"^(\\w+)\\s*=\\s*(.+?)\\s*(?:#.*)?$"` to capture key and value (stripping inline comments).',
      'Parse the value: check for quoted string, then "true"/"false", then try `int()`, then `float()`, then fall back to raw string.',
    ],
  },
};

export default problem;
