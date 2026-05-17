import { useState } from 'react';
import { Markdown } from '../lib/markdown';
import type { WorkedExample } from '../types';

/**
 * Walks through a solution line-by-line. Each step highlights a line range,
 * explains *why* those lines exist, and optionally shows variable state.
 * Falls back to the legacy `walkthrough` markdown for un-migrated problems.
 */
export default function WorkedExampleStepper({ example }: { example: WorkedExample }) {
  const [idx, setIdx] = useState(0);
  const lines = example.solution.split('\n');

  if (!example.steps || example.steps.length === 0) {
    return (
      <div>
        <Markdown>{'```python\n' + example.solution + '\n```'}</Markdown>
        {example.walkthrough && (
          <div className="mt-3">
            <Markdown>{example.walkthrough}</Markdown>
          </div>
        )}
        <div className="mt-3 text-xs text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
          {example.complexity}
        </div>
      </div>
    );
  }

  const steps = example.steps;
  const step = steps[idx];
  const isLast = idx === steps.length - 1;
  const [lo, hi] = step.lines;

  return (
    <div className="space-y-3">
      {/* Code with the current step's lines highlighted */}
      <div className="bg-gray-900 rounded-lg overflow-hidden text-xs font-mono">
        {lines.map((line, i) => {
          const n = i + 1;
          const active = n >= lo && n <= hi;
          return (
            <div
              key={i}
              className={`flex ${active ? 'bg-yellow-400/20' : ''}`}
            >
              <span className="select-none w-8 text-right pr-2 text-gray-600 flex-shrink-0">
                {n}
              </span>
              <span
                className={`whitespace-pre pl-2 ${
                  active ? 'text-yellow-100' : 'text-gray-500'
                }`}
              >
                {line || ' '}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step explanation */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <div className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">
          Step {idx + 1} of {steps.length} · lines {lo}
          {hi !== lo ? `–${hi}` : ''}
        </div>
        <Markdown>{step.explanation}</Markdown>
      </div>

      {/* Optional variable-state table */}
      {step.stateAfter && step.stateAfter.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500">
            State at this point
          </div>
          <table className="w-full text-xs">
            <tbody>
              {step.stateAfter.map(s => (
                <tr key={s.name} className="border-t border-gray-100">
                  <td className="px-3 py-1.5 font-mono text-gray-500 w-1/3">{s.name}</td>
                  <td className="px-3 py-1.5 font-mono text-gray-800">{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIdx(i => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40"
        >
          ‹ Prev
        </button>
        <button
          onClick={() => setIdx(i => Math.min(steps.length - 1, i + 1))}
          disabled={isLast}
          className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white disabled:bg-gray-200 disabled:text-gray-400"
        >
          Next step ›
        </button>
        {isLast && (
          <span className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-lg ml-auto">
            {example.complexity}
          </span>
        )}
      </div>
    </div>
  );
}
