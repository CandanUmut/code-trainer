import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'ast-analysis',
  title: 'AST Analysis and Code Introspection',
  category: 'system-python',
  difficulty: 'hard',
  tags: ['ast', 'introspection', 'static-analysis', 'NodeVisitor'],
  concept: `## Python's ast Module: Walking the Syntax Tree

\`ast.parse(code)\` turns Python source into an Abstract Syntax Tree. \`ast.NodeVisitor\` provides a visitor pattern: subclass it and implement \`visit_<NodeType>\` methods.

\`\`\`python
import ast

class FunctionFinder(ast.NodeVisitor):
    def __init__(self):
        self.functions: list[str] = []

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self.functions.append(node.name)
        self.generic_visit(node)   # visit children

source = """
def foo(): pass
def bar(): pass
"""
tree = ast.parse(source)
finder = FunctionFinder()
finder.visit(tree)
finder.functions  # ["foo", "bar"]
\`\`\`

\`generic_visit(node)\` recurses into child nodes — call it if you want to visit nested functions/classes.

**\`ast.NodeTransformer\`:** like NodeVisitor but can replace nodes. Useful for code rewriting.

**\`ast.dump(tree)\`:** prints the tree for debugging.`,

  workedExample: {
    problem: `Given Python source code as a string, analyze it and return:
- List of all defined function names
- List of all imported module names (from \`import X\` and \`from X import ...\`)
- Whether the code contains any \`eval\` or \`exec\` calls (security check)`,
    solution: `import ast

def analyze_code(source: str) -> dict:
    tree = ast.parse(source)

    class Analyzer(ast.NodeVisitor):
        def __init__(self) -> None:
            self.functions: list[str] = []
            self.imports: list[str] = []
            self.has_eval_exec = False

        def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
            self.functions.append(node.name)
            self.generic_visit(node)

        visit_AsyncFunctionDef = visit_FunctionDef

        def visit_Import(self, node: ast.Import) -> None:
            for alias in node.names:
                self.imports.append(alias.name.split('.')[0])
            self.generic_visit(node)

        def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
            if node.module:
                self.imports.append(node.module.split('.')[0])
            self.generic_visit(node)

        def visit_Call(self, node: ast.Call) -> None:
            if isinstance(node.func, ast.Name) and node.func.id in ('eval', 'exec'):
                self.has_eval_exec = True
            self.generic_visit(node)

    analyzer = Analyzer()
    analyzer.visit(tree)
    return {
        "functions": sorted(set(analyzer.functions)),
        "imports": sorted(set(analyzer.imports)),
        "has_eval_exec": analyzer.has_eval_exec,
    }`,
    steps: [
      {
        lines: [1, 4],
        explanation: '`ast.parse(source)` transforms Python source text into an Abstract Syntax Tree. The tree is an in-memory object graph where each node represents a syntactic construct. This is the foundation for all static analysis.',
      },
      {
        lines: [6, 16],
        explanation: '`ast.NodeVisitor` dispatches to `visit_<NodeType>` methods automatically. The `__init__` collects results into lists. The assignment `visit_AsyncFunctionDef = visit_FunctionDef` reuses the same handler for both sync and async functions — a Python trick to avoid code duplication.',
      },
      {
        lines: [18, 26],
        explanation: 'Two separate handlers cover `import X` and `from X import Y`. For dotted modules like `os.path`, `split(".")[0]` extracts just the top-level name. `generic_visit` is called in each handler to recurse into child nodes — without it, nested imports inside functions would be missed.',
      },
      {
        lines: [28, 31],
        explanation: '`visit_Call` checks for `eval` and `exec` calls. `node.func` is `ast.Name` for simple calls like `eval(...)` and `ast.Attribute` for method calls like `obj.eval(...)`. Checking `isinstance(node.func, ast.Name)` avoids false positives on method calls.',
      },
      {
        lines: [33, 39],
        explanation: 'Instantiate and run the visitor with `analyzer.visit(tree)`. The results are deduplicated with `set()` and sorted alphabetically for deterministic output. Return as a plain dict.',
        stateAfter: [
          { name: 'functions', value: 'sorted list of unique function names' },
          { name: 'imports', value: 'sorted list of unique top-level module names' },
        ],
      },
    ],
    complexity: 'O(n) where n is number of AST nodes',
  },

  exercise: {
    problem: `Given Python source code, compute its **cyclomatic complexity** — the number of independent paths through the code, approximated as: 1 + number of branching statements (\`if\`, \`elif\`, \`for\`, \`while\`, \`except\`, \`with\`, conditional expressions \`x if ... else y\`).

Return a dict mapping each function name to its complexity.

\`\`\`python
def simple(x):      # complexity 1 (no branches)
    return x

def branchy(x, y):  # complexity 3 (if + elif)
    if x > 0:
        return x
    elif y > 0:
        return y
    return 0
\`\`\``,
    functionName: 'cyclomatic_complexity',
    starterCode: `import ast
from typing import Any

def cyclomatic_complexity(source: str) -> dict[str, int]:
    """Return {function_name: complexity} for all functions in source."""
    ...`,
    tests: [
      {
        name: 'Simple and branchy functions',
        input: [
          'def simple(x):\n    return x\n\ndef branchy(x, y):\n    if x > 0:\n        return x\n    elif y > 0:\n        return y\n    return 0\n',
        ],
        expected: { simple: 1, branchy: 3 },
      },
      {
        name: 'Loop complexity',
        input: [
          'def loopy(items):\n    total = 0\n    for item in items:\n        if item > 0:\n            total += item\n    return total\n',
        ],
        expected: { loopy: 3 },
      },
    ],
    referenceSolution: `import ast

def cyclomatic_complexity(source: str) -> dict[str, int]:
    tree = ast.parse(source)
    result: dict[str, int] = {}

    BRANCH_NODES = (
        ast.If, ast.For, ast.AsyncFor,
        ast.While, ast.ExceptHandler,
        ast.With, ast.AsyncWith,
        ast.IfExp,  # ternary
    )

    class ComplexityVisitor(ast.NodeVisitor):
        def __init__(self) -> None:
            self.complexity = 1  # base complexity

        def visit_If(self, node: ast.If) -> None:
            self.complexity += 1
            # elif is an If inside the orelse — count it separately via generic_visit
            self.generic_visit(node)

        def visit_For(self, node: ast.For) -> None:
            self.complexity += 1
            self.generic_visit(node)

        def visit_AsyncFor(self, node: ast.AsyncFor) -> None:
            self.complexity += 1
            self.generic_visit(node)

        def visit_While(self, node: ast.While) -> None:
            self.complexity += 1
            self.generic_visit(node)

        def visit_ExceptHandler(self, node: ast.ExceptHandler) -> None:
            self.complexity += 1
            self.generic_visit(node)

        def visit_With(self, node: ast.With) -> None:
            self.complexity += 1
            self.generic_visit(node)

        def visit_AsyncWith(self, node: ast.AsyncWith) -> None:
            self.complexity += 1
            self.generic_visit(node)

        def visit_IfExp(self, node: ast.IfExp) -> None:
            self.complexity += 1
            self.generic_visit(node)

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            visitor = ComplexityVisitor()
            visitor.visit(node)
            result[node.name] = visitor.complexity

    return result`,
    hints: [
      'Walk all `FunctionDef` nodes in the tree. For each, create a visitor that counts branching nodes.',
      'Branching nodes: `ast.If`, `ast.For`, `ast.While`, `ast.ExceptHandler`, `ast.With`, `ast.IfExp`. Start complexity at 1.',
      'Remember to call `self.generic_visit(node)` in each handler to recurse into nested nodes.',
    ],
  },
};

export default problem;
