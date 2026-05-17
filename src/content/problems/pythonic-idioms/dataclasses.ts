import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'dataclasses',
  title: 'Dataclasses, Slots, and Frozen Instances',
  category: 'pythonic-idioms',
  difficulty: 'medium',
  tags: ['dataclasses', 'slots', 'frozen', 'typing'],
  concept: `## Python Dataclasses: Beyond Simple Data Holders

\`@dataclass\` auto-generates \`__init__\`, \`__repr__\`, and \`__eq__\` from field annotations. Key options:

\`\`\`python
from dataclasses import dataclass, field
from typing import ClassVar

@dataclass(frozen=True, slots=True, order=True)
class Point:
    x: float
    y: float
    z: float = 0.0
    _cache: ClassVar[dict] = {}    # ClassVar not a field

    def distance(self, other: "Point") -> float:
        return ((self.x-other.x)**2 + (self.y-other.y)**2 + (self.z-other.z)**2)**0.5
\`\`\`

- \`frozen=True\`: instances are immutable (hashable). Attempting to set an attribute raises \`FrozenInstanceError\`.
- \`slots=True\` (Python 3.10+): uses \`__slots__\` under the hood — faster attribute access, less memory.
- \`order=True\`: generates \`__lt__\`, \`__le__\`, \`__gt__\`, \`__ge__\` based on fields in declaration order.
- \`field(default_factory=list)\`: for mutable defaults (never use \`field: list = []\`).`,

  workedExample: {
    problem: `Implement a \`Rectangle\` dataclass with width and height (floats), that:
- Is frozen (immutable)
- Has computed \`area\` and \`perimeter\` properties
- Supports ordering by area
- Raises \`ValueError\` in \`__post_init__\` if width or height ≤ 0`,
    solution: `from dataclasses import dataclass
from functools import cached_property

@dataclass(frozen=True, order=False)
class Rectangle:
    width: float
    height: float

    def __post_init__(self) -> None:
        if self.width <= 0 or self.height <= 0:
            raise ValueError(f"Dimensions must be positive, got {self.width}x{self.height}")

    @property
    def area(self) -> float:
        return self.width * self.height

    @property
    def perimeter(self) -> float:
        return 2 * (self.width + self.height)

    def __lt__(self, other: "Rectangle") -> bool:
        return self.area < other.area

    def __le__(self, other: "Rectangle") -> bool:
        return self.area <= other.area`,
    walkthrough: `\`__post_init__\` runs after the auto-generated \`__init__\` — it's the place for validation logic. With \`frozen=True\`, you can't set attributes normally in \`__post_init__\`, but reading is fine.

We implement ordering manually (by area) rather than using \`order=True\`, because \`order=True\` would sort by \`(width, height)\` tuple, not area.

\`cached_property\` would be ideal for \`area\` but doesn't work with frozen dataclasses (it needs to write to the instance dict). Regular \`@property\` is fine here.`,
    complexity: 'O(1) per operation',
  },

  exercise: {
    problem: `Implement a \`Vector3D\` frozen dataclass with \`x\`, \`y\`, \`z\` float components that supports:
- \`+\` operator (component-wise addition)
- \`*\` operator with a scalar (scaling)
- \`dot(other)\` method (dot product)
- \`magnitude\` property
- \`normalized()\` method (unit vector)

\`\`\`python
v1 = Vector3D(1, 2, 3)
v2 = Vector3D(4, 5, 6)
v1 + v2        # Vector3D(5, 7, 9)
v1 * 2         # Vector3D(2, 4, 6)
v1.dot(v2)     # 32.0
v1.magnitude   # 3.7416...
\`\`\``,
    functionName: 'test_vector',
    starterCode: `from dataclasses import dataclass
import math

@dataclass(frozen=True)
class Vector3D:
    x: float
    y: float
    z: float

    def __add__(self, other: "Vector3D") -> "Vector3D": ...
    def __mul__(self, scalar: float) -> "Vector3D": ...
    def dot(self, other: "Vector3D") -> float: ...

    @property
    def magnitude(self) -> float: ...

    def normalized(self) -> "Vector3D": ...


def test_vector(x1: float, y1: float, z1: float,
                x2: float, y2: float, z2: float) -> dict:
    v1 = Vector3D(x1, y1, z1)
    v2 = Vector3D(x2, y2, z2)
    n = v1.normalized()
    return {
        "add": list([v1.__add__(v2).x, v1.__add__(v2).y, v1.__add__(v2).z]),
        "scale": list([(v1 * 2).x, (v1 * 2).y, (v1 * 2).z]),
        "dot": v1.dot(v2),
        "magnitude": round(v1.magnitude, 6),
        "norm_magnitude": round(n.magnitude, 6),
    }`,
    tests: [
      {
        name: 'Basic operations',
        input: [1.0, 2.0, 3.0, 4.0, 5.0, 6.0],
        expected: {
          add: [5.0, 7.0, 9.0],
          scale: [2.0, 4.0, 6.0],
          dot: 32.0,
          magnitude: 3.741657,
          norm_magnitude: 1.0,
        },
      },
      {
        name: 'Unit vectors',
        input: [1.0, 0.0, 0.0, 0.0, 1.0, 0.0],
        expected: {
          add: [1.0, 1.0, 0.0],
          scale: [2.0, 0.0, 0.0],
          dot: 0.0,
          magnitude: 1.0,
          norm_magnitude: 1.0,
        },
      },
    ],
    referenceSolution: `from dataclasses import dataclass
import math

@dataclass(frozen=True)
class Vector3D:
    x: float
    y: float
    z: float

    def __add__(self, other: "Vector3D") -> "Vector3D":
        return Vector3D(self.x + other.x, self.y + other.y, self.z + other.z)

    def __mul__(self, scalar: float) -> "Vector3D":
        return Vector3D(self.x * scalar, self.y * scalar, self.z * scalar)

    def dot(self, other: "Vector3D") -> float:
        return self.x * other.x + self.y * other.y + self.z * other.z

    @property
    def magnitude(self) -> float:
        return math.sqrt(self.x**2 + self.y**2 + self.z**2)

    def normalized(self) -> "Vector3D":
        mag = self.magnitude
        return Vector3D(self.x / mag, self.y / mag, self.z / mag)


def test_vector(x1: float, y1: float, z1: float,
                x2: float, y2: float, z2: float) -> dict:
    v1 = Vector3D(x1, y1, z1)
    v2 = Vector3D(x2, y2, z2)
    n = v1.normalized()
    return {
        "add": [v1.__add__(v2).x, v1.__add__(v2).y, v1.__add__(v2).z],
        "scale": [(v1 * 2).x, (v1 * 2).y, (v1 * 2).z],
        "dot": v1.dot(v2),
        "magnitude": round(v1.magnitude, 6),
        "norm_magnitude": round(n.magnitude, 6),
    }`,
    hints: [
      'With `frozen=True`, operators that return new instances (instead of mutating) work naturally.',
      'Implement `__add__` by constructing a new `Vector3D`. Same pattern for `__mul__`.',
      '`normalized()` divides each component by `self.magnitude`.',
    ],
  },
};

export default problem;
