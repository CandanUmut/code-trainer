import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'metaclasses',
  title: 'Metaclasses and Class Decorators',
  category: 'oop-typing',
  difficulty: 'hard',
  tags: ['metaclass', 'class-decorator', 'type', '__init_subclass__'],
  concept: `## Metaclasses: Classes of Classes

A metaclass controls class *creation*. \`type\` is the default metaclass — \`type(name, bases, namespace)\` creates a class.

\`\`\`python
class SingletonMeta(type):
    _instances: dict[type, object] = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Config(metaclass=SingletonMeta):
    def __init__(self) -> None:
        self.debug = False
\`\`\`

**\`__init_subclass__\`**: a cleaner alternative for many metaclass use cases — called automatically when a class is subclassed. Great for registering plugins.

\`\`\`python
class Plugin:
    _registry: dict[str, type] = {}

    def __init_subclass__(cls, name: str, **kwargs) -> None:
        super().__init_subclass__(**kwargs)
        Plugin._registry[name] = cls

class MyPlugin(Plugin, name="my"):
    ...
\`\`\``,

  workedExample: {
    problem: `Implement a \`Registry\` base class using \`__init_subclass__\` that automatically registers all subclasses by a \`name\` keyword argument. Provide a \`get(name)\` class method to look up registered classes.`,
    solution: `class Registry:
    _registry: dict[str, type] = {}

    def __init_subclass__(cls, name: str = "", **kwargs: object) -> None:
        super().__init_subclass__(**kwargs)
        if name:
            Registry._registry[name] = cls

    @classmethod
    def get(cls, name: str) -> type | None:
        return cls._registry.get(name)

    @classmethod
    def all_names(cls) -> list[str]:
        return list(cls._registry.keys())

# Usage:
class Encoder(Registry, name="encoder"):
    def encode(self, data: bytes) -> str:
        return data.hex()

class Decoder(Registry, name="decoder"):
    def decode(self, s: str) -> bytes:
        return bytes.fromhex(s)`,
    steps: [
      {
        lines: [1, 2],
        explanation: '`_registry` is a **class variable** on `Registry` — a single dict shared across all instances and subclasses. Every subclass registration goes into the same dict, giving us a global plugin registry.',
        stateAfter: [{ name: 'Registry._registry', value: '{}' }],
      },
      {
        lines: [4, 7],
        explanation: '`__init_subclass__` is called by Python automatically whenever a class subclasses `Registry`. The `name` keyword from the class definition (e.g., `class Encoder(Registry, name="encoder")`) arrives here as a parameter. We only register if a name was provided — this lets abstract intermediate classes exist without names.',
      },
      {
        lines: [5, 5],
        explanation: 'Calling `super().__init_subclass__(**kwargs)` forwards any remaining keyword args up the MRO. This is essential for cooperative multiple inheritance — skipping it would break chains involving other base classes that also define `__init_subclass__`.',
      },
      {
        lines: [9, 11],
        explanation: '`get` is a class method so it works without an instance. It does a simple dict lookup by name, returning `None` if not found — a safe interface for dynamic plugin resolution.',
      },
      {
        lines: [18, 24],
        explanation: 'Usage: each subclass passes `name=...` as a keyword argument to the class definition, which Python routes to `__init_subclass__`. After these class definitions, `Registry._registry` maps `"encoder"` and `"decoder"` to their respective classes.',
        stateAfter: [
          { name: 'Registry._registry', value: '{"encoder": <class Encoder>, "decoder": <class Decoder>}' },
        ],
      },
    ],
    complexity: 'O(1) per registration, O(1) lookup',
  },

  exercise: {
    problem: `Implement an \`Immutable\` metaclass that prevents attribute mutation after \`__init__\` completes. Any attempt to set or delete an attribute after construction raises \`AttributeError\`.

\`\`\`python
class Point(metaclass=Immutable):
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

p = Point(1, 2)
p.x = 3    # AttributeError: Point is immutable
p.z = 4    # AttributeError: Point is immutable
\`\`\``,
    functionName: 'test_immutable',
    starterCode: `class Immutable(type):
    ...

class Point(metaclass=Immutable):
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y

def test_immutable() -> dict:
    p = Point(1.0, 2.0)
    set_raises = False
    del_raises = False
    try:
        p.x = 99.0
    except AttributeError:
        set_raises = True
    try:
        del p.x
    except AttributeError:
        del_raises = True
    return {
        "x": p.x,
        "y": p.y,
        "set_raises": set_raises,
        "del_raises": del_raises,
    }`,
    tests: [
      {
        name: 'Immutable point',
        input: [],
        expected: { x: 1.0, y: 2.0, set_raises: true, del_raises: true },
      },
    ],
    referenceSolution: `class Immutable(type):
    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)

        original_init = namespace.get("__init__", lambda self: None)

        def __init__(self, *args, **kwargs):
            # Allow setting during __init__ by bypassing our __setattr__
            object.__setattr__(self, "_initializing", True)
            original_init(self, *args, **kwargs)
            object.__setattr__(self, "_initializing", False)

        def __setattr__(self, name, value):
            if not object.__getattribute__(self, "_initializing"):
                raise AttributeError(f"{type(self).__name__} is immutable")
            object.__setattr__(self, name, value)

        def __delattr__(self, name):
            raise AttributeError(f"{type(self).__name__} is immutable")

        cls.__init__ = __init__
        cls.__setattr__ = __setattr__
        cls.__delattr__ = __delattr__
        return cls


class Point(metaclass=Immutable):
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y


def test_immutable() -> dict:
    p = Point(1.0, 2.0)
    set_raises = False
    del_raises = False
    try:
        p.x = 99.0
    except AttributeError:
        set_raises = True
    try:
        del p.x
    except AttributeError:
        del_raises = True
    return {
        "x": p.x,
        "y": p.y,
        "set_raises": set_raises,
        "del_raises": del_raises,
    }`,
    hints: [
      'Override `__setattr__` and `__delattr__` on the class to raise AttributeError. But you need to allow setting during `__init__`.',
      'Use a flag like `_initializing` set via `object.__setattr__` to bypass your own `__setattr__` during init.',
      'In the metaclass `__new__`, wrap the original `__init__` to set/unset `_initializing` around the call.',
    ],
  },
};

export default problem;
