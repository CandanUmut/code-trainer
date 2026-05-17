import { Markdown } from '../lib/markdown';
import type { Problem } from '../types';

type Props = {
  problem: Problem;
};

export default function ConceptPane({ problem }: Props) {
  return (
    <div className="space-y-6 overflow-y-auto h-full p-6">
      {/* Concept */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Concept</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <Markdown>{problem.concept}</Markdown>
        </div>
      </section>

      {/* Worked Example */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Worked Example</h2>

        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Problem
            </h3>
            <Markdown>{problem.workedExample.problem}</Markdown>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Solution
            </h3>
            <Markdown>{`\`\`\`python\n${problem.workedExample.solution}\n\`\`\``}</Markdown>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Walkthrough
            </h3>
            <Markdown>{problem.workedExample.walkthrough}</Markdown>
            <div className="mt-3 text-xs text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
              {problem.workedExample.complexity}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
