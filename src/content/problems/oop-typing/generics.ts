import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'generics',
  title: 'Generic Classes and TypeVar',
  category: 'oop-typing',
  difficulty: 'medium',
  tags: ['generics', 'TypeVar', 'typing', 'type-safety'],
  concept: `## Writing Generic Classes with TypeVar

A generic class is parameterized by a type variable, allowing it to work with any type while preserving type information.

\`\`\`python
from typing import TypeVar, Generic

T = TypeVar("T")
K = TypeVar("K")
V = TypeVar("V")

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

    def peek(self) -> T:
        return self._items[-1]

    def __len__(self) -> int:
        return len(self._items)
\`\`\`

\`Stack[int]\` is a stack of ints; \`Stack[str]\` is a stack of strings. The type checker verifies you don't mix them.

**Bounded TypeVar:** \`T = TypeVar("T", bound=Comparable)\` constrains T to subtypes of Comparable.
**Multiple bounds:** \`T = TypeVar("T", int, str)\` constrains T to exactly int or str.`,

  workedExample: {
    problem: `Implement a generic \`Pair[T, U]\` class that holds two values of potentially different types, with:
- \`first\` and \`second\` properties
- \`swap() -> Pair[U, T]\` method
- \`map_first(fn) -> Pair[V, U]\` method that transforms the first element`,
    solution: `from typing import TypeVar, Generic, Callable

T = TypeVar("T")
U = TypeVar("U")
V = TypeVar("V")

class Pair(Generic[T, U]):
    def __init__(self, first: T, second: U) -> None:
        self._first = first
        self._second = second

    @property
    def first(self) -> T:
        return self._first

    @property
    def second(self) -> U:
        return self._second

    def swap(self) -> "Pair[U, T]":
        return Pair(self._second, self._first)

    def map_first(self, fn: Callable[[T], V]) -> "Pair[V, U]":
        return Pair(fn(self._first), self._second)

    def __repr__(self) -> str:
        return f"Pair({self._first!r}, {self._second!r})"`,
    walkthrough: `\`Generic[T, U]\` declares that \`Pair\` is parameterized by two type variables. The type checker then tracks that \`Pair[int, str].first\` returns \`int\` and \`.second\` returns \`str\`.

\`swap()\` returns \`Pair[U, T]\` — types are reversed. \`map_first(fn)\` introduces a third type variable \`V\` for the return type of \`fn\`.

Forward references (\`"Pair[U, T]"\`) as strings are needed when the class isn't fully defined yet — or use \`from __future__ import annotations\`.`,
    complexity: 'O(1) per operation',
  },

  exercise: {
    problem: `Implement a generic \`Result[T]\` type (like Rust's Result or Haskell's Either) that represents either a successful value or an error:

- \`Result.ok(value: T)\` — factory for success
- \`Result.err(error: str)\` — factory for error
- \`is_ok\` / \`is_err\` properties
- \`unwrap() -> T\` — returns value or raises \`RuntimeError\` with the error message
- \`map(fn: Callable[[T], U]) -> Result[U]\` — applies fn if ok, propagates error
- \`unwrap_or(default: T) -> T\` — returns value or default

\`\`\`python
Result.ok(42).map(lambda x: x * 2).unwrap()  # 84
Result.err("oops").map(lambda x: x * 2).unwrap_or(-1)  # -1
\`\`\``,
    functionName: 'test_result',
    starterCode: `from typing import TypeVar, Generic, Callable

T = TypeVar("T")
U = TypeVar("U")

class Result(Generic[T]):
    ...

def test_result() -> dict:
    ok = Result.ok(42)
    err = Result.err("not found")
    return {
        "ok_unwrap": ok.unwrap(),
        "ok_map": ok.map(lambda x: x * 2).unwrap(),
        "err_is_err": err.is_err,
        "err_unwrap_or": err.unwrap_or(-1),
        "err_map_unwrap_or": err.map(lambda x: x * 2).unwrap_or(-1),
        "err_unwrap_raises": False,  # will be set to True if unwrap raises
    }`,
    tests: [
      {
        name: 'Result operations',
        input: [],
        expected: {
          ok_unwrap: 42,
          ok_map: 84,
          err_is_err: true,
          err_unwrap_or: -1,
          err_map_unwrap_or: -1,
          err_unwrap_raises: false,
        },
      },
    ],
    referenceSolution: `from typing import TypeVar, Generic, Callable

T = TypeVar("T")
U = TypeVar("U")

class Result(Generic[T]):
    def __init__(self, value: T | None, error: str | None) -> None:
        self._value = value
        self._error = error

    @classmethod
    def ok(cls, value: T) -> "Result[T]":
        return cls(value, None)

    @classmethod
    def err(cls, error: str) -> "Result[T]":
        return cls(None, error)

    @property
    def is_ok(self) -> bool:
        return self._error is None

    @property
    def is_err(self) -> bool:
        return self._error is not None

    def unwrap(self) -> T:
        if self._error is not None:
            raise RuntimeError(self._error)
        return self._value  # type: ignore[return-value]

    def unwrap_or(self, default: T) -> T:
        return self._value if self.is_ok else default  # type: ignore[return-value]

    def map(self, fn: Callable[[T], U]) -> "Result[U]":
        if self.is_err:
            return Result(None, self._error)  # type: ignore[arg-type]
        return Result.ok(fn(self._value))  # type: ignore[arg-type]


def test_result() -> dict:
    ok = Result.ok(42)
    err = Result.err("not found")
    return {
        "ok_unwrap": ok.unwrap(),
        "ok_map": ok.map(lambda x: x * 2).unwrap(),
        "err_is_err": err.is_err,
        "err_unwrap_or": err.unwrap_or(-1),
        "err_map_unwrap_or": err.map(lambda x: x * 2).unwrap_or(-1),
        "err_unwrap_raises": False,
    }`,
    hints: [
      'Store `_value` and `_error` internally. Use class methods `ok` and `err` as factories.',
      '`map` should return a new Result — if already an error, propagate it (return `Result.err(self._error)`). Otherwise apply fn.',
      '`unwrap_or` is simple: return `self._value if self.is_ok else default`.',
    ],
  },
};

export default problem;
