import { Markdown } from '../lib/markdown';
import WorkedExampleStepper from './WorkedExampleStepper';
import { lessonsFor } from '../content/lessons';
import { Link } from 'react-router-dom';
import type { Problem } from '../types';

type Props = {
  problem: Problem;
};

export default function ConceptPane({ problem }: Props) {
  // Lessons whose `appliesTo` includes this problem — the curriculum leading here.
  const relatedLessons = lessonsFor(problem.category).filter(l =>
    l.appliesTo.includes(problem.id),
  );

  return (
    <div className="space-y-6 overflow-y-auto h-full p-6">
      {/* Prerequisite lessons */}
      {relatedLessons.length > 0 && (
        <section className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-amber-700 mb-1">
            Lessons that prepare you for this
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {relatedLessons.map(l => (
              <Link
                key={l.id}
                to={`/lesson/${l.id}`}
                className="text-xs bg-white border border-amber-200 text-amber-800 px-2 py-1 rounded-lg hover:bg-amber-100"
              >
                📚 {l.title}
              </Link>
            ))}
          </div>
        </section>
      )}

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
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Step-by-step solution
            </h3>
            <WorkedExampleStepper example={problem.workedExample} />
          </div>
        </div>
      </section>
    </div>
  );
}
