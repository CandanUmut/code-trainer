import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'json-serialization',
  title: 'Custom JSON Serialization',
  category: 'system-python',
  difficulty: 'medium',
  tags: ['json', 'serialization', 'dataclasses', 'encoder'],
  concept: `## Extending JSON for Custom Types

\`json.dumps\` handles Python primitives. For custom types, extend \`json.JSONEncoder\`:

\`\`\`python
import json
from datetime import datetime
from dataclasses import asdict

class ExtendedEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return {"__type__": "datetime", "iso": obj.isoformat()}
        if hasattr(obj, "__dataclass_fields__"):
            return asdict(obj)
        return super().default(obj)  # raises TypeError for unknown types

json.dumps(obj, cls=ExtendedEncoder)
\`\`\`

For **deserialization**, pass an \`object_hook\` to \`json.loads\`:
\`\`\`python
def decode_hook(d: dict):
    if d.get("__type__") == "datetime":
        return datetime.fromisoformat(d["iso"])
    return d

json.loads(s, object_hook=decode_hook)
\`\`\``,

  workedExample: {
    problem: `Implement a JSON serializer/deserializer that handles:
- \`datetime\` objects (serialize as ISO string with type tag)
- \`set\` objects (serialize as sorted list with type tag)
- Dataclasses (serialize as dict)

Round-trip: \`deserialize(serialize(obj)) == obj\`.`,
    solution: `import json
from datetime import datetime
from dataclasses import dataclass, asdict, fields, is_dataclass
from typing import Any

class ExtendedEncoder(json.JSONEncoder):
    def default(self, obj: Any) -> Any:
        if isinstance(obj, datetime):
            return {"__type__": "datetime", "value": obj.isoformat()}
        if isinstance(obj, (set, frozenset)):
            return {"__type__": "set", "values": sorted(str(v) for v in obj)}
        if is_dataclass(obj) and not isinstance(obj, type):
            return {"__type__": "dataclass", "cls": type(obj).__name__, "data": asdict(obj)}
        return super().default(obj)

def decode_hook(d: dict) -> Any:
    match d.get("__type__"):
        case "datetime":
            return datetime.fromisoformat(d["value"])
        case "set":
            return set(d["values"])
    return d

def serialize(obj: Any) -> str:
    return json.dumps(obj, cls=ExtendedEncoder)

def deserialize(s: str) -> Any:
    return json.loads(s, object_hook=decode_hook)`,
    walkthrough: `The encoder's \`default\` method is called for any type that the base encoder can't handle. We check types in order: datetime → set → dataclass → unknown (raises TypeError).

The \`object_hook\` in \`json.loads\` is called for *every* dict parsed. We check the \`__type__\` tag; if absent, return \`d\` unchanged.

Dataclass deserialization is trickier (we need the class reference to reconstruct) — the worked example omits that for simplicity, focusing on datetime and set round-trips.`,
    complexity: 'O(n) where n is the size of the serialized data',
  },

  exercise: {
    problem: `Implement a simple JSON-based key-value store backed by an in-memory dict. Simulate "file I/O" using a \`mock_fs\` dict.

\`\`\`python
mock_fs = {}
store = KVStore(mock_fs, "data.json")
store.set("user", {"name": "Alice", "age": 30})
store.set("count", 42)
store.save()

store2 = KVStore(mock_fs, "data.json")
store2.load()
store2.get("user")   # {"name": "Alice", "age": 30}
\`\`\``,
    functionName: 'test_kvstore',
    starterCode: `import json
from typing import Any

class KVStore:
    def __init__(self, mock_fs: dict[str, str], filename: str) -> None:
        """mock_fs simulates a filesystem: maps filename → file contents (str)."""
        ...

    def set(self, key: str, value: Any) -> None: ...
    def get(self, key: str) -> Any | None: ...
    def delete(self, key: str) -> None: ...
    def save(self) -> None: """Serialize store to mock_fs[filename].""" ...
    def load(self) -> None: """Deserialize from mock_fs[filename].""" ...

def test_kvstore() -> dict:
    fs: dict[str, str] = {}
    s = KVStore(fs, "data.json")
    s.set("name", "Alice")
    s.set("scores", [10, 20, 30])
    s.set("active", True)
    s.save()

    s2 = KVStore(fs, "data.json")
    s2.load()
    s2.delete("active")

    return {
        "name": s2.get("name"),
        "scores": s2.get("scores"),
        "active": s2.get("active"),
        "has_file": "data.json" in fs,
    }`,
    tests: [
      {
        name: 'KVStore round-trip',
        input: [],
        expected: { name: 'Alice', scores: [10, 20, 30], active: null, has_file: true },
      },
    ],
    referenceSolution: `import json
from typing import Any

class KVStore:
    def __init__(self, mock_fs: dict[str, str], filename: str) -> None:
        self._fs = mock_fs
        self._filename = filename
        self._data: dict[str, Any] = {}

    def set(self, key: str, value: Any) -> None:
        self._data[key] = value

    def get(self, key: str) -> Any | None:
        return self._data.get(key)

    def delete(self, key: str) -> None:
        self._data.pop(key, None)

    def save(self) -> None:
        self._fs[self._filename] = json.dumps(self._data, indent=2)

    def load(self) -> None:
        raw = self._fs.get(self._filename, "{}")
        self._data = json.loads(raw)

def test_kvstore() -> dict:
    fs: dict[str, str] = {}
    s = KVStore(fs, "data.json")
    s.set("name", "Alice")
    s.set("scores", [10, 20, 30])
    s.set("active", True)
    s.save()

    s2 = KVStore(fs, "data.json")
    s2.load()
    s2.delete("active")

    return {
        "name": s2.get("name"),
        "scores": s2.get("scores"),
        "active": s2.get("active"),
        "has_file": "data.json" in fs,
    }`,
    hints: [
      'Store the mock_fs reference and filename. `save()` sets `mock_fs[filename] = json.dumps(self._data)`. `load()` does the reverse.',
      'Use `json.loads(mock_fs.get(filename, "{}"))` to handle files that don\'t exist yet (return empty dict).',
      'All other methods (`get`, `set`, `delete`) just operate on `self._data` — an ordinary dict.',
    ],
  },
};

export default problem;
