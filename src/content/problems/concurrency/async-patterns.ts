import type { Problem } from '../../../types';

const problem: Problem = {
  id: 'async-patterns',
  title: 'Async Patterns: Timeout, Retry, and Circuit Breaker',
  category: 'concurrency',
  difficulty: 'hard',
  tags: ['asyncio', 'timeout', 'retry', 'circuit-breaker', 'resilience'],
  concept: `## Resilience Patterns for Async Code

**Timeout:** \`asyncio.wait_for(coro, timeout)\` raises \`asyncio.TimeoutError\` if the coroutine doesn't complete in time.

\`\`\`python
import asyncio

async def with_timeout(coro, seconds: float):
    try:
        return await asyncio.wait_for(coro, timeout=seconds)
    except asyncio.TimeoutError:
        raise TimeoutError(f"Operation timed out after {seconds}s")
\`\`\`

**Retry with exponential backoff:**
\`\`\`python
async def retry(coro_factory, max_attempts: int, base_delay: float = 0.1):
    for attempt in range(max_attempts):
        try:
            return await coro_factory()
        except Exception:
            if attempt == max_attempts - 1:
                raise
            await asyncio.sleep(base_delay * (2 ** attempt))
\`\`\`

**Circuit breaker:** stops calling a failing service after N failures, lets it "recover" after a timeout. Three states: Closed (normal), Open (rejecting all), Half-Open (testing recovery).`,

  workedExample: {
    problem: `Implement an async \`retry_with_backoff(fn, max_attempts, base_delay)\` function. \`fn\` is a callable returning a coroutine (factory). Retry on any exception with exponential backoff. Return the result on success or raise the last exception.`,
    solution: `import asyncio

async def retry_with_backoff(
    fn: callable,
    max_attempts: int,
    base_delay: float = 0.1,
) -> object:
    last_exc: Exception | None = None
    for attempt in range(max_attempts):
        try:
            return await fn()
        except Exception as e:
            last_exc = e
            if attempt < max_attempts - 1:
                await asyncio.sleep(base_delay * (2 ** attempt))
    raise last_exc`,
    steps: [
      {
        lines: [1, 7],
        explanation: '`fn` is typed as a **callable** (a factory) rather than a coroutine. Coroutines can only be awaited once — passing a coroutine object directly would fail on the second retry. The factory pattern lets each attempt call `fn()` to get a fresh coroutine.',
      },
      {
        lines: [8, 9],
        explanation: '`last_exc` is initialized to `None` and updated on each failure. This is necessary because we need to `raise` the exception after the loop, outside of any `except` block — a bare `raise` only works inside an active exception handler.',
      },
      {
        lines: [10, 13],
        explanation: 'Each attempt calls the factory `fn()` to get a fresh coroutine and awaits it. On success, return immediately. On any exception, capture it in `last_exc` — this preserves the exception for later re-raising.',
        stateAfter: [
          { name: 'attempt (on failure)', value: '0' },
          { name: 'last_exc', value: 'Exception(...)' },
        ],
      },
      {
        lines: [14, 15],
        explanation: 'The exponential backoff delay: `base_delay * (2 ** attempt)` gives 0.1s, 0.2s, 0.4s, 0.8s... We only sleep if there are more attempts remaining — no point sleeping after the final failure.',
      },
      {
        lines: [16, 16],
        explanation: 'After exhausting all attempts, raise the last captured exception. This ensures the caller sees the actual error. A bare `raise` here would fail because we\'re not inside an `except` block at this point.',
      },
    ],
    complexity: 'O(max_attempts) attempts, O(2^max_attempts * base_delay) worst-case time',
  },

  exercise: {
    problem: `Implement an async \`CircuitBreaker\` class that wraps calls to a potentially failing function:

- **Closed** (normal): calls pass through
- **Open**: after \`failure_threshold\` consecutive failures, open the circuit — all calls raise \`CircuitOpenError\` immediately without calling the function
- **Half-Open**: after \`recovery_timeout\` seconds, try one call. Success → Close; failure → re-Open

\`\`\`python
cb = CircuitBreaker(failure_threshold=3, recovery_timeout=1.0)
result = await cb.call(my_async_fn, arg1, arg2)
\`\`\``,
    functionName: 'test_circuit_breaker',
    starterCode: `import asyncio
import time

class CircuitOpenError(Exception):
    pass

class CircuitBreaker:
    def __init__(self, failure_threshold: int, recovery_timeout: float) -> None: ...

    async def call(self, fn, *args, **kwargs): ...

async def _failing_fn():
    raise ConnectionError("service down")

async def _ok_fn():
    return "ok"

def test_circuit_breaker() -> dict:
    async def _run():
        cb = CircuitBreaker(failure_threshold=2, recovery_timeout=0.05)
        errors = []
        results = []
        # Trip the breaker with 2 failures
        for _ in range(2):
            try:
                await cb.call(_failing_fn)
            except (ConnectionError, CircuitOpenError) as e:
                errors.append(type(e).__name__)
        # Third call should be rejected immediately (circuit open)
        try:
            await cb.call(_ok_fn)
        except CircuitOpenError:
            errors.append("CircuitOpenError")
        # Wait for recovery timeout
        await asyncio.sleep(0.1)
        # Now half-open: one test call succeeds → circuit closes
        try:
            results.append(await cb.call(_ok_fn))
        except Exception as e:
            errors.append(str(e))
        # Circuit should be closed again
        results.append(await cb.call(_ok_fn))
        return {"errors": errors, "results": results}
    return asyncio.run(_run())`,
    tests: [
      {
        name: 'Circuit breaker lifecycle',
        input: [],
        expected: {
          errors: ['ConnectionError', 'ConnectionError', 'CircuitOpenError'],
          results: ['ok', 'ok'],
        },
      },
    ],
    referenceSolution: `import asyncio
import time

class CircuitOpenError(Exception):
    pass

class CircuitBreaker:
    def __init__(self, failure_threshold: int, recovery_timeout: float) -> None:
        self._threshold = failure_threshold
        self._recovery_timeout = recovery_timeout
        self._failures = 0
        self._state = "closed"   # "closed", "open", "half-open"
        self._opened_at: float = 0.0

    async def call(self, fn, *args, **kwargs):
        if self._state == "open":
            if time.monotonic() - self._opened_at >= self._recovery_timeout:
                self._state = "half-open"
            else:
                raise CircuitOpenError("Circuit is open")
        try:
            result = await fn(*args, **kwargs)
            # Success: reset
            self._failures = 0
            self._state = "closed"
            return result
        except Exception:
            self._failures += 1
            if self._failures >= self._threshold or self._state == "half-open":
                self._state = "open"
                self._opened_at = time.monotonic()
            raise

async def _failing_fn():
    raise ConnectionError("service down")

async def _ok_fn():
    return "ok"

def test_circuit_breaker() -> dict:
    async def _run():
        cb = CircuitBreaker(failure_threshold=2, recovery_timeout=0.05)
        errors = []
        results = []
        for _ in range(2):
            try:
                await cb.call(_failing_fn)
            except (ConnectionError, CircuitOpenError) as e:
                errors.append(type(e).__name__)
        try:
            await cb.call(_ok_fn)
        except CircuitOpenError:
            errors.append("CircuitOpenError")
        await asyncio.sleep(0.1)
        try:
            results.append(await cb.call(_ok_fn))
        except Exception as e:
            errors.append(str(e))
        results.append(await cb.call(_ok_fn))
        return {"errors": errors, "results": results}
    return asyncio.run(_run())`,
    hints: [
      'Track state as a string: "closed", "open", "half-open". Track `_failures` count and `_opened_at` timestamp.',
      'At the start of `call`: if open, check if recovery_timeout has elapsed → transition to half-open. Still open → raise CircuitOpenError.',
      'On success: reset `_failures = 0`, set state to "closed". On failure: increment failures. If failures >= threshold OR currently half-open, open the circuit.',
    ],
  },
};

export default problem;
