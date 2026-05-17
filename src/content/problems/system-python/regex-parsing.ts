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
    steps: [
      {
        lines: [1, 3],
        explanation: 'Import `re` for regex and `Optional` for the nullable return type. Pre-compiling the pattern at module level (rather than inside the function) avoids recompiling on every call — the compiled pattern object is cached and reused.',
      },
      {
        lines: [4, 10],
        explanation: '`re.VERBOSE` allows whitespace and newlines in the pattern for readability. The actual regex ignores these — `re.VERBOSE` strips unescaped whitespace and everything after `#` on each line. This is critical for complex patterns: the alternative is one unreadable string.',
      },
      {
        lines: [11, 16],
        explanation: 'Named groups `(?P<name>...)` capture each field with a descriptive name. This is why `m.groupdict()` later works — it returns a dict keyed by group name rather than by position. `\\w+` matches the log level, `\\S+` matches the service name (no spaces), and `.+` greedily captures the rest as the message.',
      },
      {
        lines: [18, 21],
        explanation: '`line.strip()` handles trailing newlines from file I/O before matching. If the pattern doesn\'t match, return `None` — this is the clean way to signal "not a valid log line" without exceptions.',
      },
      {
        lines: [22, 28],
        explanation: '`m.groupdict()` returns all named captures as a single dict. We then reshape it: combine the six date/time components into a single timestamp string, and extract the remaining fields. The final return value is the parsed representation.',
        stateAfter: [
          { name: 'd["year"]', value: '"2024"' },
          { name: 'return["timestamp"]', value: '"2024-01-15 10:23:45"' },
        ],
      },
    ],
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
