import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'type-narrowing',
  title: 'Type Narrowing, TypeGuard, and Literal Types',
  category: 'oop-typing',
  difficulty: 'hard',
  tags: ['TypeGuard', 'Literal', 'Union', 'type-narrowing', 'mypy'],
  concept: `## Advanced Typing: TypeGuard, Literal, and Discriminated Unions

**TypeGuard** narrows a type in the positive branch of an \`if\`:
\`\`\`python
from typing import TypeGuard

def is_list_of_str(val: list) -> TypeGuard[list[str]]:
    return all(isinstance(v, str) for v in val)

def process(x: list) -> None:
    if is_list_of_str(x):
        # x is now list[str] here
        print(x[0].upper())
\`\`\`

**Literal types** constrain a parameter to specific values:
\`\`\`python
from typing import Literal

Direction = Literal["north", "south", "east", "west"]

def move(direction: Direction, steps: int) -> None: ...
\`\`\`

**Discriminated unions** (tagged unions): use a \`kind\` literal field to distinguish union members — type checkers can narrow based on the field.
\`\`\`python
from typing import Literal
from dataclasses import dataclass

@dataclass
class Circle:
    kind: Literal["circle"] = "circle"
    radius: float = 0.0

@dataclass
class Rect:
    kind: Literal["rect"] = "rect"
    width: float = 0.0
    height: float = 0.0

Shape = Circle | Rect
\`\`\``,

  workedExample: {
    problem: `Implement a \`Shape\` discriminated union (Circle and Rectangle) and a \`total_area\` function that handles both cases. Use \`match\` statement for exhaustive dispatch.`,
    solution: `from dataclasses import dataclass
from typing import Literal
import math

@dataclass
class Circle:
    kind: Literal["circle"] = "circle"
    radius: float = 0.0

@dataclass
class Rectangle:
    kind: Literal["rect"] = "rect"
    width: float = 0.0
    height: float = 0.0

Shape = Circle | Rectangle

def area(shape: Shape) -> float:
    match shape:
        case Circle(radius=r):
            return math.pi * r ** 2
        case Rectangle(width=w, height=h):
            return w * h

def total_area(shapes: list[Shape]) -> float:
    return sum(area(s) for s in shapes)`,
    walkthrough: `The \`match\` statement does **structural pattern matching** on dataclasses — \`case Circle(radius=r)\` binds the \`radius\` field to \`r\`. This is more concise than \`if isinstance(shape, Circle): r = shape.radius\`.

The type checker (mypy/pyright) knows that \`match\` on a \`Circle | Rectangle\` with both cases covered is exhaustive. If you add a new shape variant, the type checker will warn that the match isn't exhaustive.

No \`case _:\` fallback is needed — but adding one with \`raise TypeError(f"Unknown shape: {shape}")\` makes runtime behavior explicit.`,
    complexity: 'O(n)',
  },

  exercise: {
    problem: `Implement a JSON-like value type system with discriminated unions:

\`\`\`python
JsonNull = {"type": "null"}
JsonBool = {"type": "bool", "value": True}
JsonNumber = {"type": "number", "value": 42.0}
JsonString = {"type": "string", "value": "hello"}
JsonArray = {"type": "array", "items": [...]}
JsonObject = {"type": "object", "properties": {...}}
\`\`\`

Write \`json_to_python(node: JsonNode) -> object\` that converts this representation to native Python values.`,
    functionName: 'json_to_python',
    starterCode: `from typing import Literal, TypeAlias
from dataclasses import dataclass, field

@dataclass
class JsonNull:
    type: Literal["null"] = "null"

@dataclass
class JsonBool:
    type: Literal["bool"] = "bool"
    value: bool = False

@dataclass
class JsonNumber:
    type: Literal["number"] = "number"
    value: float = 0.0

@dataclass
class JsonString:
    type: Literal["string"] = "string"
    value: str = ""

@dataclass
class JsonArray:
    type: Literal["array"] = "array"
    items: list = field(default_factory=list)

@dataclass
class JsonObject:
    type: Literal["object"] = "object"
    properties: dict = field(default_factory=dict)

JsonNode: TypeAlias = JsonNull | JsonBool | JsonNumber | JsonString | JsonArray | JsonObject

def json_to_python(node: JsonNode) -> object:
    """Convert JsonNode tree to native Python value."""
    ...`,
    tests: [
      {
        name: 'Nested structure',
        input: [
          {
            type: 'object',
            properties: {
              name: { type: 'string', value: 'Alice' },
              scores: {
                type: 'array',
                items: [
                  { type: 'number', value: 95 },
                  { type: 'number', value: 87 },
                ],
              },
              active: { type: 'bool', value: true },
              note: { type: 'null' },
            },
          },
        ],
        expected: { name: 'Alice', scores: [95, 87], active: true, note: null },
      },
    ],
    referenceSolution: `from typing import Literal, TypeAlias
from dataclasses import dataclass, field

@dataclass
class JsonNull:
    type: Literal["null"] = "null"

@dataclass
class JsonBool:
    type: Literal["bool"] = "bool"
    value: bool = False

@dataclass
class JsonNumber:
    type: Literal["number"] = "number"
    value: float = 0.0

@dataclass
class JsonString:
    type: Literal["string"] = "string"
    value: str = ""

@dataclass
class JsonArray:
    type: Literal["array"] = "array"
    items: list = field(default_factory=list)

@dataclass
class JsonObject:
    type: Literal["object"] = "object"
    properties: dict = field(default_factory=dict)

JsonNode: TypeAlias = JsonNull | JsonBool | JsonNumber | JsonString | JsonArray | JsonObject

def json_to_python(node) -> object:
    if isinstance(node, dict):
        # Handle dict-form inputs (from JS test runner)
        t = node.get("type")
        match t:
            case "null": return None
            case "bool": return node["value"]
            case "number": return node["value"]
            case "string": return node["value"]
            case "array": return [json_to_python(item) for item in node["items"]]
            case "object": return {k: json_to_python(v) for k, v in node["properties"].items()}
    match node:
        case JsonNull(): return None
        case JsonBool(value=v): return v
        case JsonNumber(value=v): return v
        case JsonString(value=v): return v
        case JsonArray(items=items): return [json_to_python(i) for i in items]
        case JsonObject(properties=props): return {k: json_to_python(v) for k, v in props.items()}`,
    hints: [
      'Use `match node:` with pattern matching on each dataclass type.',
      'For `JsonArray`, recursively call `json_to_python` on each item. For `JsonObject`, recursively convert each value in `properties`.',
      'The test runner passes dicts (from JavaScript JSON serialization), so also handle the dict form with `node.get("type")`.',
    ],
  },
};

export default problem;
