import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'descriptors',
  title: 'Properties and Descriptors',
  category: 'pythonic-idioms',
  difficulty: 'medium',
  tags: ['property', 'descriptor', 'oop', 'dunder'],
  concept: `## Python Properties and the Descriptor Protocol

A **property** is a managed attribute: you intercept get, set, and delete operations.

\`\`\`python
class Circle:
    def __init__(self, radius: float) -> None:
        self._radius = radius

    @property
    def radius(self) -> float:
        return self._radius

    @radius.setter
    def radius(self, value: float) -> None:
        if value < 0:
            raise ValueError("Radius must be non-negative")
        self._radius = value

    @property
    def area(self) -> float:
        import math
        return math.pi * self._radius ** 2
\`\`\`

A **descriptor** generalizes this: any object implementing \`__get__\`, \`__set__\`, or \`__delete__\` is a descriptor. \`property\` is just a built-in descriptor. Write custom descriptors when the same validation logic applies to many classes/attributes.`,

  workedExample: {
    problem: `Implement a \`BoundedValue\` descriptor that enforces a numeric range on any attribute. When the value is out of range, raise \`ValueError\`.

\`\`\`python
class Config:
    timeout = BoundedValue(0, 300)
    retries = BoundedValue(0, 10)

cfg = Config()
cfg.timeout = 30    # OK
cfg.timeout = -1    # ValueError
cfg.retries = 3     # OK
\`\`\``,
    solution: `class BoundedValue:
    def __init__(self, min_val: float, max_val: float) -> None:
        self.min_val = min_val
        self.max_val = max_val
        self.attr_name = ""

    def __set_name__(self, owner: type, name: str) -> None:
        self.attr_name = name

    def __get__(self, obj: object, objtype: type | None = None) -> float:
        if obj is None:
            return self  # type: ignore[return-value]
        return obj.__dict__.get(self.attr_name, self.min_val)

    def __set__(self, obj: object, value: float) -> None:
        if not (self.min_val <= value <= self.max_val):
            raise ValueError(
                f"{self.attr_name} must be in [{self.min_val}, {self.max_val}], got {value}"
            )
        obj.__dict__[self.attr_name] = value`,
    walkthrough: `\`__set_name__\` is called when the class is defined — it gives the descriptor the name of the attribute it's assigned to (\`"timeout"\` or \`"retries"\`). This lets us store per-instance values in \`obj.__dict__\` under the correct name.

\`__get__\` returns \`self\` when called on the class (not an instance) — convention for descriptors that want \`Config.timeout\` to return the descriptor itself.

\`obj.__dict__[self.attr_name]\` bypasses the descriptor protocol for storage, preventing infinite recursion that would occur if we stored to an attribute sharing the descriptor's name.`,
    complexity: 'O(1) per access',
  },

  exercise: {
    problem: `Implement a \`TypedAttr\` descriptor that enforces a type constraint. Any attempt to set an attribute to a value that isn't an instance of the specified type raises \`TypeError\` with a helpful message.

Also implement a \`Temperature\` class that uses it to enforce that \`celsius\` and \`fahrenheit\` are floats, with \`fahrenheit\` as a computed property (not stored separately).

\`\`\`python
class Temperature:
    celsius = TypedAttr(float)
    # fahrenheit is a @property: celsius * 9/5 + 32

t = Temperature(25.0)
t.celsius = 100.0   # OK
t.celsius = "hot"   # TypeError
t.fahrenheit        # 212.0
\`\`\``,
    functionName: 'test_typed_attr',
    starterCode: `class TypedAttr:
    def __init__(self, expected_type: type) -> None:
        ...

    def __set_name__(self, owner: type, name: str) -> None:
        ...

    def __get__(self, obj, objtype=None):
        ...

    def __set__(self, obj, value) -> None:
        ...


class Temperature:
    celsius = TypedAttr(float)

    def __init__(self, celsius: float) -> None:
        self.celsius = celsius

    @property
    def fahrenheit(self) -> float:
        ...


def test_typed_attr(celsius: float, new_celsius: float, bad_value: str) -> tuple[float, float, bool]:
    """Create Temperature(celsius), update to new_celsius, try setting bad_value.
    Return (fahrenheit_at_new_celsius, new_celsius, type_error_raised)."""
    t = Temperature(celsius)
    t.celsius = new_celsius
    raised = False
    try:
        t.celsius = bad_value  # type: ignore
    except TypeError:
        raised = True
    return t.fahrenheit, t.celsius, raised`,
    tests: [
      { name: 'Basic test', input: [0.0, 100.0, 'hot'], expected: [212.0, 100.0, true] },
      { name: 'Freezing', input: [20.0, 0.0, 'cold'], expected: [32.0, 0.0, true] },
      { name: 'Body temp', input: [36.0, 37.0, 'warm'], expected: [98.6, 37.0, true] },
    ],
    referenceSolution: `class TypedAttr:
    def __init__(self, expected_type: type) -> None:
        self.expected_type = expected_type
        self.attr_name = ""

    def __set_name__(self, owner: type, name: str) -> None:
        self.attr_name = name

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.attr_name)

    def __set__(self, obj, value) -> None:
        if not isinstance(value, self.expected_type):
            raise TypeError(
                f"{self.attr_name} must be {self.expected_type.__name__}, "
                f"got {type(value).__name__}"
            )
        obj.__dict__[self.attr_name] = value


class Temperature:
    celsius = TypedAttr(float)

    def __init__(self, celsius: float) -> None:
        self.celsius = celsius

    @property
    def fahrenheit(self) -> float:
        return self.celsius * 9 / 5 + 32


def test_typed_attr(celsius: float, new_celsius: float, bad_value: str) -> tuple[float, float, bool]:
    t = Temperature(celsius)
    t.celsius = new_celsius
    raised = False
    try:
        t.celsius = bad_value  # type: ignore
    except TypeError:
        raised = True
    return t.fahrenheit, t.celsius, raised`,
    hints: [
      'Mirror `BoundedValue`: implement `__set_name__`, `__get__`, `__set__`. In `__set__`, use `isinstance(value, self.expected_type)` to check the type.',
      'Store the actual value in `obj.__dict__[self.attr_name]` to avoid infinite recursion.',
      '`fahrenheit` is a read-only `@property` — just `return self.celsius * 9/5 + 32`.',
    ],
  },
};

export default problem;
