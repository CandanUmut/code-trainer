"""Runs the checks emitted by validate-content.mjs against real Python."""
import io
import json
import contextlib
import math
import os
import traceback

HERE = os.path.dirname(os.path.abspath(__file__))
checks = json.load(open(os.path.join(HERE, "checks.json")))

fails = []


def deep_equal(a, b):
    if isinstance(a, float) or isinstance(b, float):
        try:
            return math.isclose(float(a), float(b), rel_tol=1e-9, abs_tol=1e-9)
        except (TypeError, ValueError):
            return False
    if isinstance(a, (set, frozenset)) and isinstance(b, (set, frozenset)):
        return set(a) == set(b)
    if isinstance(a, dict) and isinstance(b, dict):
        a_s = {str(k): v for k, v in a.items()}
        b_s = {str(k): v for k, v in b.items()}
        if set(a_s.keys()) != set(b_s.keys()):
            return False
        return all(deep_equal(a_s[k], b_s[k]) for k in a_s)
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(deep_equal(x, y) for x, y in zip(a, b))
    return a == b


def run_capture(code, ns):
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        exec(code, ns)
    return buf.getvalue()


for c in checks:
    tag = c["tag"]
    try:
        if c["kind"] == "predict":
            got = run_capture(c["code"], {})
            if got.rstrip() != str(c["expected"]).rstrip():
                fails.append(f"{tag}: predicted {c['expected']!r} but got {got.rstrip()!r}")

        elif c["kind"] == "fillin":
            ns = {}
            got = run_capture(c["code"], ns)
            if c.get("expectedStdout") is not None:
                if got.rstrip() != str(c["expectedStdout"]).rstrip():
                    fails.append(f"{tag}: stdout {got.rstrip()!r} != {c['expectedStdout']!r}")
            ev = c.get("expectedVar")
            if ev is not None:
                if ev["name"] not in ns:
                    fails.append(f"{tag}: var {ev['name']} never assigned")
                elif not deep_equal(ns[ev["name"]], ev["value"]):
                    fails.append(f"{tag}: {ev['name']}={ns[ev['name']]!r} != {ev['value']!r}")

        elif c["kind"] == "wl-expr":
            ns = {}
            exec(c["setup"], ns)
            val = eval(c["answer"], ns)
            if not deep_equal(val, c["expected"]):
                fails.append(f"{tag}: expr -> {val!r} != {c['expected']!r}")

        elif c["kind"] == "wl-stmt":
            ns = {}
            exec(c["setup"] + "\n" + c["answer"], ns)
            if c["varName"] not in ns:
                fails.append(f"{tag}: var {c['varName']} never assigned")
            elif not deep_equal(ns[c["varName"]], c["value"]):
                fails.append(f"{tag}: {c['varName']}={ns[c['varName']]!r} != {c['value']!r}")

        elif c["kind"] == "wf":
            ns = {}
            exec(c["solution"], ns)
            fn = ns.get(c["functionName"])
            if fn is None:
                fails.append(f"{tag}: function {c['functionName']} not defined")
                continue
            for t in c["tests"]:
                got = fn(*t["input"])
                if not deep_equal(got, t["expected"]):
                    fails.append(
                        f"{tag}: test '{t['name']}' -> {got!r} != {t['expected']!r}"
                    )
    except Exception:
        fails.append(f"{tag}: EXCEPTION\n{traceback.format_exc()}")

if fails:
    print(f"\n{len(fails)} CONTENT FAILURES:\n")
    for f in fails:
        print("  [X] " + f)
    raise SystemExit(1)
print(f"\nAll {len(checks)} runnable content checks passed.")
