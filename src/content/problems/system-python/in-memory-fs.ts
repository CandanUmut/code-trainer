import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'in-memory-fs',
  title: 'In-Memory Filesystem',
  category: 'system-python',
  difficulty: 'hard',
  tags: ['tree', 'trie', 'filesystem', 'design'],
  concept: `## Tree-Based Filesystem Simulation

A filesystem is a tree: directories are internal nodes, files are leaves. The path \`/a/b/c\` represents a traversal from root through nodes \`a\`, \`b\`, to file/dir \`c\`.

Operations:
- \`mkdir(path)\`: create intermediate directories as needed (like \`mkdir -p\`)
- \`write(path, content)\`: create/overwrite a file
- \`read(path)\`: read a file's content
- \`ls(path)\`: list directory contents
- \`find(root, name)\`: recursively find files/dirs by name

\`\`\`python
class Node:
    def __init__(self, is_dir: bool) -> None:
        self.is_dir = is_dir
        self.content = ""         # only for files
        self.children: dict[str, "Node"] = {}  # only for dirs

root = Node(is_dir=True)
\`\`\`

Split paths with \`path.strip('/').split('/')\` — handles both \`/a/b\` and \`a/b\`.`,

  workedExample: {
    problem: `Implement an in-memory filesystem with:
- \`mkdir(path)\`: create directory (and parents)
- \`write(path, content)\`: write a file
- \`read(path)\`: read a file, raise FileNotFoundError if absent
- \`ls(path)\`: list directory contents sorted
- \`exists(path)\`: check if path exists`,
    solution: `class FS:
    class _Node:
        def __init__(self, is_dir: bool) -> None:
            self.is_dir = is_dir
            self.content = ""
            self.children: dict[str, "FS._Node"] = {}

    def __init__(self) -> None:
        self._root = self._Node(is_dir=True)

    def _traverse(self, path: str, create_dirs: bool = False) -> "_Node | None":
        parts = [p for p in path.strip('/').split('/') if p]
        node = self._root
        for part in parts:
            if part not in node.children:
                if not create_dirs:
                    return None
                node.children[part] = self._Node(is_dir=True)
            node = node.children[part]
        return node

    def mkdir(self, path: str) -> None:
        self._traverse(path, create_dirs=True)

    def write(self, path: str, content: str) -> None:
        parts = path.strip('/').split('/')
        dir_path = '/'.join(parts[:-1])
        filename = parts[-1]
        parent = self._traverse(dir_path, create_dirs=True) if dir_path else self._root
        file_node = self._Node(is_dir=False)
        file_node.content = content
        parent.children[filename] = file_node

    def read(self, path: str) -> str:
        node = self._traverse(path)
        if node is None or node.is_dir:
            raise FileNotFoundError(f"No file at {path}")
        return node.content

    def ls(self, path: str) -> list[str]:
        node = self._traverse(path) if path and path != '/' else self._root
        if node is None or not node.is_dir:
            raise NotADirectoryError(f"{path} is not a directory")
        return sorted(node.children.keys())

    def exists(self, path: str) -> bool:
        return self._traverse(path) is not None`,
    walkthrough: `\`_traverse\` is the core helper: split the path, walk the tree, optionally creating intermediate dirs. Returning \`None\` signals "path not found."

\`write\` separates the parent directory path from the filename, traverses to the parent (creating dirs), and inserts a new file node.

The root node is always a directory at \`/\`. An empty path or \`/\` traversal returns the root.`,
    complexity: 'O(d) per operation where d is path depth',
  },

  exercise: {
    problem: `Extend the filesystem with:
- \`find(root_path, name)\`: return sorted list of all absolute paths where filename equals \`name\`
- \`move(src, dst)\`: move a file or directory to a new path
- \`copy(src, dst)\`: deep-copy a file or directory to a new path
- \`du(path)\`: disk usage — total number of characters in all files under path`,
    functionName: 'test_fs_extended',
    starterCode: `import copy as _copy_module

class FS:
    class _Node:
        def __init__(self, is_dir: bool) -> None:
            self.is_dir = is_dir
            self.content = ""
            self.children: dict[str, "FS._Node"] = {}

    def __init__(self) -> None:
        self._root = self._Node(is_dir=True)

    # Include all methods from worked example + new ones:
    def _traverse(self, path: str, create_dirs: bool = False): ...
    def mkdir(self, path: str) -> None: ...
    def write(self, path: str, content: str) -> None: ...
    def read(self, path: str) -> str: ...
    def ls(self, path: str) -> list[str]: ...
    def exists(self, path: str) -> bool: ...

    def find(self, root_path: str, name: str) -> list[str]:
        """Return sorted list of absolute paths where the name matches."""
        ...

    def move(self, src: str, dst: str) -> None:
        """Move src to dst."""
        ...

    def copy(self, src: str, dst: str) -> None:
        """Deep copy src to dst."""
        ...

    def du(self, path: str) -> int:
        """Return total character count of all files under path."""
        ...

def test_fs_extended() -> dict:
    fs = FS()
    fs.mkdir("/home/alice")
    fs.mkdir("/home/bob")
    fs.write("/home/alice/notes.txt", "hello world")
    fs.write("/home/alice/data.csv", "a,b,c")
    fs.write("/home/bob/notes.txt", "goodbye")
    fs.copy("/home/alice/notes.txt", "/home/bob/copy.txt")
    fs.move("/home/alice/data.csv", "/home/bob/data.csv")
    return {
        "find_notes": fs.find("/", "notes.txt"),
        "alice_ls": fs.ls("/home/alice"),
        "bob_ls": fs.ls("/home/bob"),
        "du_home": fs.du("/home"),
        "copy_content": fs.read("/home/bob/copy.txt"),
    }`,
    tests: [
      {
        name: 'Extended FS operations',
        input: [],
        expected: {
          find_notes: ['/home/alice/notes.txt', '/home/bob/notes.txt'],
          alice_ls: ['notes.txt'],
          bob_ls: ['copy.txt', 'data.csv', 'notes.txt'],
          du_home: 28,
          copy_content: 'hello world',
        },
      },
    ],
    referenceSolution: `import copy as _copy_module

class FS:
    class _Node:
        def __init__(self, is_dir: bool) -> None:
            self.is_dir = is_dir
            self.content = ""
            self.children: dict[str, "FS._Node"] = {}

    def __init__(self) -> None:
        self._root = self._Node(is_dir=True)

    def _traverse(self, path: str, create_dirs: bool = False):
        parts = [p for p in path.strip('/').split('/') if p]
        node = self._root
        for part in parts:
            if part not in node.children:
                if not create_dirs:
                    return None
                node.children[part] = self._Node(is_dir=True)
            node = node.children[part]
        return node

    def _parent_and_name(self, path: str):
        parts = [p for p in path.strip('/').split('/') if p]
        return '/'.join(parts[:-1]), parts[-1]

    def mkdir(self, path: str) -> None:
        self._traverse(path, create_dirs=True)

    def write(self, path: str, content: str) -> None:
        dir_path, filename = self._parent_and_name(path)
        parent = self._traverse(dir_path, create_dirs=True) if dir_path else self._root
        node = self._Node(is_dir=False)
        node.content = content
        parent.children[filename] = node

    def read(self, path: str) -> str:
        node = self._traverse(path)
        if node is None or node.is_dir:
            raise FileNotFoundError(path)
        return node.content

    def ls(self, path: str) -> list[str]:
        node = self._traverse(path) if path and path != '/' else self._root
        if node is None or not node.is_dir:
            raise NotADirectoryError(path)
        return sorted(node.children.keys())

    def exists(self, path: str) -> bool:
        return self._traverse(path) is not None

    def find(self, root_path: str, name: str) -> list[str]:
        results: list[str] = []
        start = self._traverse(root_path) if root_path != '/' else self._root
        if start is None:
            return []
        prefix = root_path.rstrip('/')

        def dfs(node, current_path: str):
            for child_name, child in node.children.items():
                child_path = f"{current_path}/{child_name}"
                if child_name == name:
                    results.append(child_path)
                if child.is_dir:
                    dfs(child, child_path)

        dfs(start, prefix)
        return sorted(results)

    def move(self, src: str, dst: str) -> None:
        src_dir, src_name = self._parent_and_name(src)
        src_parent = self._traverse(src_dir) if src_dir else self._root
        node = src_parent.children.pop(src_name)
        dst_dir, dst_name = self._parent_and_name(dst)
        dst_parent = self._traverse(dst_dir, create_dirs=True) if dst_dir else self._root
        dst_parent.children[dst_name] = node

    def copy(self, src: str, dst: str) -> None:
        src_node = self._traverse(src)
        dst_dir, dst_name = self._parent_and_name(dst)
        dst_parent = self._traverse(dst_dir, create_dirs=True) if dst_dir else self._root
        dst_parent.children[dst_name] = _copy_module.deepcopy(src_node)

    def du(self, path: str) -> int:
        node = self._traverse(path) if path and path != '/' else self._root
        if node is None:
            return 0
        if not node.is_dir:
            return len(node.content)
        return sum(self.du.__func__(self, '') or self._du(child) for child in node.children.values())

    def _du(self, node) -> int:
        if not node.is_dir:
            return len(node.content)
        return sum(self._du(child) for child in node.children.values())


def test_fs_extended() -> dict:
    fs = FS()
    fs.mkdir("/home/alice")
    fs.mkdir("/home/bob")
    fs.write("/home/alice/notes.txt", "hello world")
    fs.write("/home/alice/data.csv", "a,b,c")
    fs.write("/home/bob/notes.txt", "goodbye")
    fs.copy("/home/alice/notes.txt", "/home/bob/copy.txt")
    fs.move("/home/alice/data.csv", "/home/bob/data.csv")
    return {
        "find_notes": fs.find("/", "notes.txt"),
        "alice_ls": fs.ls("/home/alice"),
        "bob_ls": fs.ls("/home/bob"),
        "du_home": fs.du("/home"),
        "copy_content": fs.read("/home/bob/copy.txt"),
    }`,
    hints: [
      '`find`: DFS from the root_path node. Build paths as you recurse, yielding when `child_name == name`.',
      '`move`: pop the node from its parent\'s children dict, then insert it at the destination.',
      '`du`: recursively sum `len(node.content)` for file nodes. For directories, recurse into all children.',
    ],
  },
};

export default problem;
