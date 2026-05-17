import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'design-patterns',
  title: 'Observer and Strategy Patterns',
  category: 'oop-typing',
  difficulty: 'medium',
  tags: ['design-patterns', 'observer', 'strategy', 'oop'],
  concept: `## Behavioral Design Patterns in Python

**Observer pattern:** objects (observers) subscribe to an event source (subject) and are notified on state changes. Decouples event producers from consumers.

\`\`\`python
from collections import defaultdict
from typing import Callable

class EventBus:
    def __init__(self) -> None:
        self._listeners: defaultdict[str, list[Callable]] = defaultdict(list)

    def subscribe(self, event: str, handler: Callable) -> None:
        self._listeners[event].append(handler)

    def publish(self, event: str, data: object = None) -> None:
        for handler in self._listeners[event]:
            handler(data)
\`\`\`

**Strategy pattern:** define a family of algorithms, encapsulate each, make them interchangeable. In Python, strategies are often just callables (functions/lambdas) rather than full classes.

\`\`\`python
from typing import Callable

Sorter = Callable[[list], list]  # strategy type alias

def sort_with(data: list, strategy: Sorter) -> list:
    return strategy(data)
\`\`\``,

  workedExample: {
    problem: `Implement an \`EventBus\` with \`subscribe(event, handler)\`, \`unsubscribe(event, handler)\`, and \`publish(event, data)\`. Handlers are called in subscription order. Supports multiple events and multiple handlers per event.`,
    solution: `from collections import defaultdict
from typing import Callable, Any

class EventBus:
    def __init__(self) -> None:
        self._listeners: defaultdict[str, list[Callable[[Any], None]]] = defaultdict(list)

    def subscribe(self, event: str, handler: Callable[[Any], None]) -> None:
        self._listeners[event].append(handler)

    def unsubscribe(self, event: str, handler: Callable[[Any], None]) -> None:
        try:
            self._listeners[event].remove(handler)
        except ValueError:
            pass

    def publish(self, event: str, data: Any = None) -> None:
        for handler in list(self._listeners[event]):  # copy to handle unsubscribe during publish
            handler(data)`,
    walkthrough: `\`defaultdict(list)\` initializes missing event keys to \`[]\`, so \`subscribe\` can always append without checking.

\`unsubscribe\` uses \`list.remove\` which removes the first occurrence. We swallow \`ValueError\` if the handler wasn't registered — idiomatic for observer cleanup.

\`list(self._listeners[event])\` creates a copy before iterating — if a handler unsubscribes itself during a publish, the copy ensures we don't skip handlers due to list mutation.`,
    complexity: 'O(n) publish where n = number of handlers for that event',
  },

  exercise: {
    problem: `Implement a \`Pipeline\` class that chains data transformations (the Strategy pattern applied to a sequence). Each stage is a callable \`Callable[[T], T]\`. The pipeline runs them left-to-right.

Also implement \`conditional(predicate, transform)\` — a higher-order function that returns a transform that only applies \`transform\` if \`predicate(data)\` is True.

\`\`\`python
p = Pipeline([
    str.lower,
    str.strip,
    conditional(lambda s: len(s) > 3, lambda s: s[:3]),
])
p.run("  HELLO  ")   →  "hel"
p.run("  HI  ")      →  "hi"
\`\`\``,
    functionName: 'test_pipeline',
    starterCode: `from typing import TypeVar, Callable

T = TypeVar("T")

class Pipeline:
    def __init__(self, stages: list[Callable]) -> None: ...

    def run(self, data) -> object: ...

    def add_stage(self, stage: Callable) -> "Pipeline":
        """Return a new Pipeline with stage appended (don't mutate self)."""
        ...

def conditional(predicate: Callable, transform: Callable) -> Callable:
    """Return a transform that applies transform only if predicate(data) is True."""
    ...

def test_pipeline() -> dict:
    p = Pipeline([str.lower, str.strip])
    p2 = p.add_stage(conditional(lambda s: len(s) > 3, lambda s: s[:3]))
    return {
        "long_string": p2.run("  HELLO  "),
        "short_string": p2.run("  HI  "),
        "base_unchanged": p.run("  WORLD  "),
    }`,
    tests: [
      {
        name: 'Pipeline test',
        input: [],
        expected: { long_string: 'hel', short_string: 'hi', base_unchanged: 'world' },
      },
    ],
    referenceSolution: `from typing import Callable

class Pipeline:
    def __init__(self, stages: list[Callable]) -> None:
        self._stages = list(stages)

    def run(self, data: object) -> object:
        for stage in self._stages:
            data = stage(data)
        return data

    def add_stage(self, stage: Callable) -> "Pipeline":
        return Pipeline(self._stages + [stage])

def conditional(predicate: Callable, transform: Callable) -> Callable:
    def _apply(data):
        return transform(data) if predicate(data) else data
    return _apply

def test_pipeline() -> dict:
    p = Pipeline([str.lower, str.strip])
    p2 = p.add_stage(conditional(lambda s: len(s) > 3, lambda s: s[:3]))
    return {
        "long_string": p2.run("  HELLO  "),
        "short_string": p2.run("  HI  "),
        "base_unchanged": p.run("  WORLD  "),
    }`,
    hints: [
      '`Pipeline.run` is just a left-fold: `for stage in stages: data = stage(data)`.',
      '`add_stage` should return a NEW Pipeline (immutable design) with the stage appended.',
      '`conditional` returns a closure that checks the predicate before applying the transform.',
    ],
  },
};

export default problem;
