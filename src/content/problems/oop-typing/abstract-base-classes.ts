import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'abstract-base-classes',
  title: 'Abstract Base Classes and Interface Contracts',
  category: 'oop-typing',
  difficulty: 'medium',
  tags: ['abc', 'abstract', 'interface', 'polymorphism'],
  concept: `## ABCs: Enforcing Interfaces at Instantiation Time

Python's \`abc.ABC\` and \`@abstractmethod\` let you define interfaces that cannot be instantiated without implementing all abstract methods.

\`\`\`python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

    @abstractmethod
    def perimeter(self) -> float: ...

    def describe(self) -> str:
        return f"{type(self).__name__}: area={self.area():.2f}"

class Circle(Shape):
    def __init__(self, r: float) -> None:
        self.r = r
    def area(self) -> float:
        return 3.14159 * self.r ** 2
    def perimeter(self) -> float:
        return 2 * 3.14159 * self.r
\`\`\`

Shape() → TypeError: Can't instantiate abstract class.

**\`@abstractproperty\`** is deprecated; use \`@property\` combined with \`@abstractmethod\` (stack them, abstractmethod on the inside).`,

  workedExample: {
    problem: `Implement a \`Serializable\` ABC that requires subclasses to implement \`to_dict()\` and \`from_dict(cls, data)\`. Include a concrete \`to_json()\` method that calls \`to_dict()\`.

Then implement a \`User\` dataclass-like class that extends \`Serializable\`.`,
    solution: `from abc import ABC, abstractmethod
from dataclasses import dataclass
import json

class Serializable(ABC):
    @abstractmethod
    def to_dict(self) -> dict: ...

    @classmethod
    @abstractmethod
    def from_dict(cls, data: dict) -> "Serializable": ...

    def to_json(self) -> str:
        return json.dumps(self.to_dict())

@dataclass
class User(Serializable):
    name: str
    age: int
    email: str

    def to_dict(self) -> dict:
        return {"name": self.name, "age": self.age, "email": self.email}

    @classmethod
    def from_dict(cls, data: dict) -> "User":
        return cls(name=data["name"], age=data["age"], email=data["email"])`,
    walkthrough: `Stacking \`@classmethod\` and \`@abstractmethod\` (class method first, abstract second) creates an abstract class method — subclasses must provide a \`@classmethod\` implementation.

\`to_json()\` is a **concrete** method in the ABC — it works for any subclass via \`to_dict()\` without knowing the concrete type. This is the Template Method pattern.

\`User\` uses \`@dataclass\` to avoid boilerplate \`__init__\`/\`__repr__\`. The dataclass fields automatically become constructor parameters.`,
    complexity: 'O(1)',
  },

  exercise: {
    problem: `Implement a \`Cache\` ABC with abstract methods \`get(key)\`, \`set(key, value)\`, \`delete(key)\`, and \`clear()\`. Add a concrete \`get_or_set(key, factory)\` method.

Then implement \`LRUCache(capacity)\` and \`TTLCache(ttl_seconds)\` as concrete subclasses using only the standard library.`,
    functionName: 'test_caches',
    starterCode: `from abc import ABC, abstractmethod
from typing import Any, Callable
import time

class Cache(ABC):
    @abstractmethod
    def get(self, key: str) -> Any | None: ...

    @abstractmethod
    def set(self, key: str, value: Any) -> None: ...

    @abstractmethod
    def delete(self, key: str) -> None: ...

    @abstractmethod
    def clear(self) -> None: ...

    def get_or_set(self, key: str, factory: Callable[[], Any]) -> Any:
        """Return cached value or compute, store, and return factory()."""
        ...


class LRUCache(Cache):
    def __init__(self, capacity: int) -> None: ...
    def get(self, key: str) -> Any | None: ...
    def set(self, key: str, value: Any) -> None: ...
    def delete(self, key: str) -> None: ...
    def clear(self) -> None: ...


class TTLCache(Cache):
    def __init__(self, ttl_seconds: float) -> None: ...
    def get(self, key: str) -> Any | None: ...
    def set(self, key: str, value: Any) -> None: ...
    def delete(self, key: str) -> None: ...
    def clear(self) -> None: ...


def test_caches() -> dict:
    lru = LRUCache(2)
    lru.set("a", 1)
    lru.set("b", 2)
    lru.get("a")      # access a (most recently used)
    lru.set("c", 3)   # evicts b (least recently used)
    lru_b_evicted = lru.get("b") is None

    ttl = TTLCache(ttl_seconds=0.05)
    ttl.set("x", 42)
    val_before = ttl.get("x")
    time.sleep(0.1)
    val_after = ttl.get("x")

    computed = []
    lru2 = LRUCache(10)
    lru2.get_or_set("key", lambda: computed.append(1) or 99)
    lru2.get_or_set("key", lambda: computed.append(2) or 88)

    return {
        "lru_b_evicted": lru_b_evicted,
        "ttl_before": val_before,
        "ttl_after": val_after,
        "factory_calls": len(computed),
        "cached_val": lru2.get("key"),
    }`,
    tests: [
      {
        name: 'Cache behavior',
        input: [],
        expected: {
          lru_b_evicted: true,
          ttl_before: 42,
          ttl_after: null,
          factory_calls: 1,
          cached_val: 99,
        },
      },
    ],
    referenceSolution: `from abc import ABC, abstractmethod
from collections import OrderedDict
from typing import Any, Callable
import time

class Cache(ABC):
    @abstractmethod
    def get(self, key: str) -> Any | None: ...

    @abstractmethod
    def set(self, key: str, value: Any) -> None: ...

    @abstractmethod
    def delete(self, key: str) -> None: ...

    @abstractmethod
    def clear(self) -> None: ...

    def get_or_set(self, key: str, factory: Callable[[], Any]) -> Any:
        val = self.get(key)
        if val is None:
            val = factory()
            self.set(key, val)
        return val


class LRUCache(Cache):
    def __init__(self, capacity: int) -> None:
        self.capacity = capacity
        self._store: OrderedDict[str, Any] = OrderedDict()

    def get(self, key: str) -> Any | None:
        if key not in self._store:
            return None
        self._store.move_to_end(key)  # mark as recently used
        return self._store[key]

    def set(self, key: str, value: Any) -> None:
        if key in self._store:
            self._store.move_to_end(key)
        self._store[key] = value
        if len(self._store) > self.capacity:
            self._store.popitem(last=False)  # evict LRU

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def clear(self) -> None:
        self._store.clear()


class TTLCache(Cache):
    def __init__(self, ttl_seconds: float) -> None:
        self.ttl = ttl_seconds
        self._store: dict[str, tuple[Any, float]] = {}

    def get(self, key: str) -> Any | None:
        if key not in self._store:
            return None
        val, expires_at = self._store[key]
        if time.monotonic() > expires_at:
            del self._store[key]
            return None
        return val

    def set(self, key: str, value: Any) -> None:
        self._store[key] = (value, time.monotonic() + self.ttl)

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def clear(self) -> None:
        self._store.clear()


def test_caches() -> dict:
    lru = LRUCache(2)
    lru.set("a", 1)
    lru.set("b", 2)
    lru.get("a")
    lru.set("c", 3)
    lru_b_evicted = lru.get("b") is None

    ttl = TTLCache(ttl_seconds=0.05)
    ttl.set("x", 42)
    val_before = ttl.get("x")
    time.sleep(0.1)
    val_after = ttl.get("x")

    computed = []
    lru2 = LRUCache(10)
    lru2.get_or_set("key", lambda: computed.append(1) or 99)
    lru2.get_or_set("key", lambda: computed.append(2) or 88)

    return {
        "lru_b_evicted": lru_b_evicted,
        "ttl_before": val_before,
        "ttl_after": val_after,
        "factory_calls": len(computed),
        "cached_val": lru2.get("key"),
    }`,
    hints: [
      'For LRU: `collections.OrderedDict` remembers insertion order and supports `move_to_end()` and `popitem(last=False)` — perfect for LRU.',
      'For TTL: store `(value, expiry_timestamp)` pairs. On `get`, check `time.monotonic() > expiry`.',
      'For `get_or_set`: call `self.get(key)` first. Only invoke `factory()` on a miss, then call `self.set(key, result)`.',
    ],
  },
};

export default problem;
