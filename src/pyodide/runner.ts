import type { TestCase, TestResult } from '../types';

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInstance>;
  }
}

interface PyodideInstance {
  runPythonAsync: (code: string, options?: { globals?: unknown }) => Promise<unknown>;
  globals: {
    get: (name: string) => unknown;
    set: (name: string, value: unknown) => void;
  };
  toPy: (obj: unknown) => unknown;
  pyimport: (mod: string) => unknown;
}

let pyodideInstance: PyodideInstance | null = null;
let loadingPromise: Promise<PyodideInstance> | null = null;

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

const HELPER_MODULE = `
import math
import json
import traceback

def _serialize(obj):
    """Convert any Python value to something json.dumps can handle."""
    if isinstance(obj, (set, frozenset)):
        # Represent as sorted list so JS can display it
        return sorted(_serialize(v) for v in obj)
    if isinstance(obj, dict):
        return {str(k): _serialize(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_serialize(v) for v in obj]
    if isinstance(obj, (int, float, bool, str)) or obj is None:
        return obj
    # Fallback: repr for unknown types
    return repr(obj)

def _deep_equal(a, b):
    if isinstance(a, float) or isinstance(b, float):
        try:
            return math.isclose(float(a), float(b), rel_tol=1e-9, abs_tol=1e-9)
        except (TypeError, ValueError):
            return False
    if isinstance(a, (set, frozenset)) and isinstance(b, (set, frozenset)):
        return set(a) == set(b)
    if isinstance(a, dict) and isinstance(b, dict):
        # JSON object keys are always strings, so compare keys as strings — this
        # lets an int-keyed Python dict match its JSON-authored expected value.
        a_s = {str(k): v for k, v in a.items()}
        b_s = {str(k): v for k, v in b.items()}
        if set(a_s.keys()) != set(b_s.keys()):
            return False
        return all(_deep_equal(a_s[k], b_s[k]) for k in a_s)
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        if len(a) != len(b):
            return False
        return all(_deep_equal(x, y) for x, y in zip(a, b))
    return a == b
`;

async function loadPyodide(): Promise<PyodideInstance> {
  if (pyodideInstance) return pyodideInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const script = document.createElement('script');
    script.src = `${PYODIDE_CDN}pyodide.js`;
    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });

    const instance = await window.loadPyodide({ indexURL: PYODIDE_CDN });
    await instance.runPythonAsync(HELPER_MODULE);
    pyodideInstance = instance;
    return instance;
  })();

  return loadingPromise;
}

function extractLastFrame(traceback: string): string {
  const lines = traceback.split('\n').filter(l => l.trim());
  // Find the last meaningful error line, skip pyodide internals
  const userLines = lines.filter(l => !l.includes('pyodide') && !l.includes('<exec>'));
  const errorLine = lines[lines.length - 1] || traceback;
  const frameLines = userLines.slice(-3).join('\n');
  return frameLines ? `${frameLines}\n${errorLine}` : errorLine;
}

export async function initPyodide(): Promise<void> {
  await loadPyodide();
}

export async function runUserCode(
  userCode: string,
  functionName: string,
  tests: TestCase[],
): Promise<TestResult[]> {
  const pyodide = await loadPyodide();
  const results: TestResult[] = [];

  for (const test of tests) {
    const result = await runSingleTest(pyodide, userCode, functionName, test);
    results.push(result);
  }

  return results;
}

async function runSingleTest(
  pyodide: PyodideInstance,
  userCode: string,
  functionName: string,
  test: TestCase,
): Promise<TestResult> {
  const inputJson = JSON.stringify(test.input);
  const expectedJson = JSON.stringify(test.expected);

  // The result must be assigned then referenced at top level — a try/except
  // statement itself has no return value, so runPythonAsync would get None.
  const testCode = `
import json as _json
import traceback as _traceback

_out = None
try:
    _ns = {}
    exec(${JSON.stringify(userCode)}, _ns)

    _fn = _ns.get(${JSON.stringify(functionName)})
    if _fn is None:
        raise NameError(f"Function '${functionName}' not found. Did you define it?")

    _inputs = _json.loads(${JSON.stringify(inputJson)})
    _expected = _json.loads(${JSON.stringify(expectedJson)})
    _actual = _fn(*_inputs)

    _passed = _deep_equal(_actual, _expected)
    _out = _json.dumps({"passed": bool(_passed), "actual": _serialize(_actual), "error": None})
except Exception as _e:
    _tb = _traceback.format_exc()
    _out = _json.dumps({"passed": False, "actual": None, "error": _tb})

_out
`;

  const TIMEOUT_MS = 3000;

  const timeoutPromise: Promise<TestResult> = new Promise(resolve =>
    setTimeout(
      () =>
        resolve({
          name: test.name,
          passed: false,
          input: test.hidden ? undefined : test.input,
          expected: test.hidden ? undefined : test.expected,
          actual: null,
          error: 'Timeout — possible infinite loop (3s limit)',
          hidden: test.hidden ?? false,
          timedOut: true,
        }),
      TIMEOUT_MS,
    ),
  );

  const runPromise: Promise<TestResult> = (async () => {
    try {
      // runPythonAsync returns the last expression value as a PyProxy.
      // We return a JSON string from Python so we get a plain JS string here.
      const jsonStr = await pyodide.runPythonAsync(testCode);
      const raw = JSON.parse(String(jsonStr)) as {
        passed: boolean;
        actual: unknown;
        error: string | null;
      };

      if (raw.error) {
        return {
          name: test.name,
          passed: false,
          input: test.hidden ? undefined : test.input,
          expected: test.hidden ? undefined : test.expected,
          actual: null,
          error: extractLastFrame(raw.error),
          hidden: test.hidden ?? false,
        };
      }

      return {
        name: test.name,
        passed: raw.passed,
        input: test.hidden ? undefined : test.input,
        expected: test.hidden ? undefined : test.expected,
        actual: raw.actual,
        hidden: test.hidden ?? false,
      };
    } catch (err) {
      return {
        name: test.name,
        passed: false,
        input: test.hidden ? undefined : test.input,
        expected: test.hidden ? undefined : test.expected,
        actual: null,
        error: String(err),
        hidden: test.hidden ?? false,
      };
    }
  })();

  return Promise.race([runPromise, timeoutPromise]);
}

export function isPyodideLoaded(): boolean {
  return pyodideInstance !== null;
}

// ===========================================================================
// Lesson step runners — all share the single Pyodide instance loaded above.
// Each Python template ends by leaving a JSON string as the last expression so
// runPythonAsync hands us back a plain string.
// ===========================================================================

const STEP_TIMEOUT_MS = 3000;

/** Run a Python template whose last expression is a JSON string; parse it. */
async function runJsonTemplate<T>(template: string, timeoutValue: T): Promise<T> {
  const pyodide = await loadPyodide();

  const timeoutPromise = new Promise<T>(resolve =>
    setTimeout(() => resolve(timeoutValue), STEP_TIMEOUT_MS),
  );

  const runPromise = (async (): Promise<T> => {
    const jsonStr = await pyodide.runPythonAsync(template);
    return JSON.parse(String(jsonStr)) as T;
  })();

  return Promise.race([runPromise, timeoutPromise]);
}

export type PredictResult = {
  stdout: string;
  error?: string;
  timedOut?: boolean;
};

/** Run a self-contained snippet and capture its stdout (for predict-output). */
export async function runPredictOutput(code: string): Promise<PredictResult> {
  const template = `
import io as _io, contextlib as _ctx, json as _json, traceback as _tb
_buf = _io.StringIO()
_out = None
try:
    with _ctx.redirect_stdout(_buf):
        exec(${JSON.stringify(code)}, {})
    _out = _json.dumps({"stdout": _buf.getvalue(), "error": None})
except Exception:
    _out = _json.dumps({"stdout": _buf.getvalue(), "error": _tb.format_exc()})
_out
`;
  return runJsonTemplate<PredictResult>(template, {
    stdout: '',
    error: 'Timeout — possible infinite loop (3s limit)',
    timedOut: true,
  });
}

export type CheckResult = {
  passed: boolean;
  actual?: unknown;
  stdout?: string;
  error?: string;
  timedOut?: boolean;
};

const TIMEOUT_CHECK: CheckResult = {
  passed: false,
  error: 'Timeout — possible infinite loop (3s limit)',
  timedOut: true,
};

/** write-line, expression mode: eval the user's expression against a namespace. */
export async function runWriteLineExpression(
  setup: string,
  expr: string,
  expected: unknown,
): Promise<CheckResult> {
  const template = `
import json as _json, traceback as _tb
_out = None
try:
    _ns = {}
    exec(${JSON.stringify(setup)}, _ns)
    _val = eval(${JSON.stringify(expr)}, _ns)
    _expected = _json.loads(${JSON.stringify(JSON.stringify(expected))})
    _passed = _deep_equal(_val, _expected)
    _out = _json.dumps({"passed": bool(_passed), "actual": _serialize(_val), "error": None})
except Exception:
    _out = _json.dumps({"passed": False, "actual": None, "error": _tb.format_exc()})
_out
`;
  return runJsonTemplate<CheckResult>(template, TIMEOUT_CHECK);
}

/** write-line, statement mode: run setup + statement, then check a variable. */
export async function runWriteLineStatement(
  setup: string,
  statement: string,
  varName: string,
  expected: unknown,
): Promise<CheckResult> {
  const code = `${setup}\n${statement}`;
  const template = `
import json as _json, traceback as _tb
_out = None
try:
    _ns = {}
    exec(${JSON.stringify(code)}, _ns)
    if ${JSON.stringify(varName)} not in _ns:
        raise NameError("Variable '${varName}' was never assigned.")
    _val = _ns[${JSON.stringify(varName)}]
    _expected = _json.loads(${JSON.stringify(JSON.stringify(expected))})
    _passed = _deep_equal(_val, _expected)
    _out = _json.dumps({"passed": bool(_passed), "actual": _serialize(_val), "error": None})
except Exception:
    _out = _json.dumps({"passed": False, "actual": None, "error": _tb.format_exc()})
_out
`;
  return runJsonTemplate<CheckResult>(template, TIMEOUT_CHECK);
}

/**
 * fill-in-blank validation: run the fully assembled code, then check stdout
 * and/or a variable value, depending on which validation fields are present.
 */
export async function runFillInValidation(
  assembledCode: string,
  validation: { expectedStdout?: string; expectedVar?: { name: string; value: unknown } },
): Promise<CheckResult> {
  const varName = validation.expectedVar?.name ?? null;
  const expectedVarJson =
    validation.expectedVar !== undefined
      ? JSON.stringify(JSON.stringify(validation.expectedVar.value))
      : 'null';

  const template = `
import io as _io, contextlib as _ctx, json as _json, traceback as _tb
_buf = _io.StringIO()
_out = None
try:
    _ns = {}
    with _ctx.redirect_stdout(_buf):
        exec(${JSON.stringify(assembledCode)}, _ns)
    _var_ok = True
    _actual = None
    ${
      varName
        ? `if ${JSON.stringify(varName)} not in _ns:
        raise NameError("Variable '${varName}' was never assigned.")
    _actual = _ns[${JSON.stringify(varName)}]
    _var_ok = _deep_equal(_actual, _json.loads(${expectedVarJson}))`
        : ''
    }
    _out = _json.dumps({
        "passed": bool(_var_ok),
        "actual": _serialize(_actual),
        "stdout": _buf.getvalue(),
        "error": None,
    })
except Exception:
    _out = _json.dumps({
        "passed": False, "actual": None, "stdout": _buf.getvalue(),
        "error": _tb.format_exc(),
    })
_out
`;
  const result = await runJsonTemplate<CheckResult>(template, TIMEOUT_CHECK);
  if (result.timedOut || result.error) return result;
  // stdout check is done JS-side so we can rstrip consistently
  if (validation.expectedStdout !== undefined) {
    const stdoutOk = (result.stdout ?? '').replace(/\s+$/, '') === validation.expectedStdout.replace(/\s+$/, '');
    return { ...result, passed: result.passed && stdoutOk };
  }
  return result;
}
