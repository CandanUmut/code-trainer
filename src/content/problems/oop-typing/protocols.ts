import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'protocols',
  title: 'Structural Typing with Protocol',
  category: 'oop-typing',
  difficulty: 'medium',
  tags: ['Protocol', 'structural-typing', 'duck-typing', 'typing'],
  concept: `## Protocol: Structural (Duck-Type) Interfaces

\`typing.Protocol\` formalizes duck typing. A class "implements" a Protocol just by having the right methods/attributes — no explicit inheritance required. This is structural subtyping.

\`\`\`python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Drawable(Protocol):
    def draw(self, canvas: str) -> None: ...
    @property
    def color(self) -> str: ...

class Circle:            # no explicit inheritance
    color = "red"
    def draw(self, canvas: str) -> None:
        print(f"Drawing circle on {canvas}")

def render_all(shapes: list[Drawable]) -> None:
    for shape in shapes:
        shape.draw("screen")

render_all([Circle()])   # type-checks correctly!
\`\`\`

\`@runtime_checkable\` lets you use \`isinstance(obj, Drawable)\` at runtime (only checks method/attribute existence, not signatures).

**When to use Protocol vs ABC:** Protocol for external/third-party types you don't control; ABC when you own the hierarchy and want to enforce implementation.`,

  workedExample: {
    problem: `Define a \`Comparable\` Protocol (supports \`<\`, \`<=\`, \`>\`, \`>=\`, \`==\`). Then write a generic \`sorted_desc\` function that sorts any sequence of \`Comparable\` objects in descending order.`,
    solution: `from typing import Protocol, TypeVar, Sequence, Any

class Comparable(Protocol):
    def __lt__(self, other: Any) -> bool: ...
    def __le__(self, other: Any) -> bool: ...
    def __gt__(self, other: Any) -> bool: ...
    def __ge__(self, other: Any) -> bool: ...

C = TypeVar("C", bound=Comparable)

def sorted_desc(items: Sequence[C]) -> list[C]:
    return sorted(items, reverse=True)`,
    steps: [
      {
        lines: [1, 1],
        explanation: 'Import `Protocol` for structural typing, `TypeVar` and `Sequence` for the generic function signature, and `Any` so the dunder method parameters accept any operand type.',
      },
      {
        lines: [3, 7],
        explanation: 'The Protocol defines the interface purely through method signatures — no implementation, no base class registration. Any object with `__lt__`, `__le__`, `__gt__`, and `__ge__` automatically satisfies `Comparable` — `int`, `str`, `float`, or any custom class. This is structural (duck-type) subtyping.',
      },
      {
        lines: [9, 9],
        explanation: '`TypeVar("C", bound=Comparable)` creates a **bounded** TypeVar: `C` must be a subtype of `Comparable`. This is stronger than `Any` — the type checker will reject types that don\'t have the comparison methods.',
      },
      {
        lines: [11, 12],
        explanation: '`sorted(..., reverse=True)` works for any type satisfying the Protocol. The critical benefit of the bounded TypeVar: the return type is `list[C]`, not `list[Any]`. If you pass `list[int]`, you get back `list[int]` — type information is preserved.',
      },
    ],
    complexity: 'O(n log n)',
  },

  exercise: {
    problem: `Define three Protocols:
1. \`Readable\`: has \`read() -> str\`
2. \`Writable\`: has \`write(data: str) -> int\` (returns bytes written)
3. \`ReadWritable\`: inherits both (Protocol can inherit Protocol)

Then implement \`copy_stream(src: Readable, dst: Writable) -> int\` that reads from src and writes to dst, returning total bytes written.

Finally implement \`InMemoryStream\` that satisfies \`ReadWritable\`.`,
    functionName: 'test_protocols',
    starterCode: `from typing import Protocol

class Readable(Protocol):
    def read(self) -> str: ...

class Writable(Protocol):
    def write(self, data: str) -> int: ...

class ReadWritable(Readable, Writable, Protocol): ...

def copy_stream(src: Readable, dst: Writable) -> int:
    """Read from src, write to dst, return bytes written."""
    ...

class InMemoryStream:
    def __init__(self, initial_data: str = "") -> None: ...
    def read(self) -> str: ...
    def write(self, data: str) -> int: ...

def test_protocols() -> dict:
    src = InMemoryStream("hello world")
    dst = InMemoryStream()
    written = copy_stream(src, dst)
    return {
        "written": written,
        "dst_content": dst.read(),
        "src_empty_after": src.read() == "",
    }`,
    tests: [
      {
        name: 'Stream copy',
        input: [],
        expected: { written: 11, dst_content: 'hello world', src_empty_after: true },
      },
    ],
    referenceSolution: `from typing import Protocol

class Readable(Protocol):
    def read(self) -> str: ...

class Writable(Protocol):
    def write(self, data: str) -> int: ...

class ReadWritable(Readable, Writable, Protocol): ...

def copy_stream(src: Readable, dst: Writable) -> int:
    data = src.read()
    return dst.write(data)

class InMemoryStream:
    def __init__(self, initial_data: str = "") -> None:
        self._buffer = initial_data

    def read(self) -> str:
        data, self._buffer = self._buffer, ""
        return data

    def write(self, data: str) -> int:
        self._buffer += data
        return len(data)

def test_protocols() -> dict:
    src = InMemoryStream("hello world")
    dst = InMemoryStream()
    written = copy_stream(src, dst)
    return {
        "written": written,
        "dst_content": dst.read(),
        "src_empty_after": src.read() == "",
    }`,
    hints: [
      'Protocol inheritance: `class ReadWritable(Readable, Writable, Protocol):` — you must include `Protocol` explicitly when composing.',
      '`InMemoryStream` needs a buffer. `read()` returns and clears it; `write(data)` appends and returns `len(data)`.',
      '`copy_stream` just calls `src.read()` then `dst.write(data)` and returns the result.',
    ],
  },
};

export default problem;
