import type { TestResult } from '../types';
import { computeDiff } from '../lib/diff';

type Props = {
  results: TestResult[];
  isRunning: boolean;
};

export default function TestResults({ results, isRunning }: Props) {
  if (isRunning) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        Running tests…
      </div>
    );
  }

  if (results.length === 0) return null;

  const passed = results.filter(r => r.passed).length;
  const allPassed = passed === results.length;

  return (
    <div className="space-y-2">
      <div className={`text-sm font-medium ${allPassed ? 'text-green-600' : 'text-red-600'}`}>
        {passed}/{results.length} tests passed
      </div>
      {results.map((r, i) => (
        <div
          key={i}
          className={`border rounded-lg text-sm overflow-hidden ${
            r.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-center gap-2 px-3 py-2">
            <span className={r.passed ? 'text-green-500' : 'text-red-500'}>
              {r.passed ? '✓' : '✗'}
            </span>
            <span className="font-medium text-gray-800">{r.name}</span>
            {r.timedOut && (
              <span className="ml-auto text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                timeout
              </span>
            )}
          </div>
          {!r.passed && (
            <div className="border-t border-red-200 px-3 py-2 space-y-2">
              {r.error ? (
                <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono overflow-x-auto">
                  {r.error}
                </pre>
              ) : r.hidden ? (
                <p className="text-xs text-gray-500 italic">
                  Hidden test — input withheld until you pass
                </p>
              ) : (
                <FailureDiff expected={r.expected} actual={r.actual} input={r.input} />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FailureDiff({
  expected,
  actual,
  input,
}: {
  expected: unknown;
  actual: unknown;
  input: unknown[] | undefined;
}) {
  const { expectedStr, actualStr } = computeDiff(expected, actual);
  return (
    <div className="space-y-1.5">
      {input !== undefined && (
        <div>
          <span className="text-xs text-gray-500 font-medium">Input: </span>
          <code className="text-xs text-gray-700">{JSON.stringify(input)}</code>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs text-gray-500 mb-1">Expected</div>
          <pre className="text-xs bg-green-100 text-green-800 p-2 rounded font-mono overflow-x-auto">
            {expectedStr}
          </pre>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Got</div>
          <pre className="text-xs bg-red-100 text-red-800 p-2 rounded font-mono overflow-x-auto">
            {actualStr}
          </pre>
        </div>
      </div>
    </div>
  );
}
