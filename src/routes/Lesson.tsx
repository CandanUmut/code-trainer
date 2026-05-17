import { useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { lessonsById } from '../content/lessons';
import { problemsById } from '../content';
import { getLessonProgress, recordStepResult, updateLessonProgress } from '../state/progress';
import { StepRenderer, stepSummary, stepKindLabel } from '../components/LessonSteps';
import type { StepResult } from '../types';

const RESULT_ICON: Record<StepResult, string> = {
  solved: '✅',
  revealed: '👁',
  skipped: '⏭',
};

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const lesson = id ? lessonsById.get(id) : undefined;

  const initial = useMemo(
    () => (lesson ? getLessonProgress(lesson.id) : null),
    [lesson],
  );

  const [currentIndex, setCurrentIndex] = useState(initial?.currentStepIndex ?? 0);
  const [results, setResults] = useState<Record<string, StepResult>>(
    initial?.stepResults ?? {},
  );
  const [pending, setPending] = useState<StepResult | null>(null);

  if (!lesson) return <Navigate to="/" replace />;

  const total = lesson.steps.length;
  const finished = currentIndex >= total;
  const doneCount = Object.keys(results).length;

  function advance(result: StepResult) {
    recordStepResult(lesson!.id, currentIndex, result, total);
    setResults(r => ({ ...r, [String(currentIndex)]: result }));
    setPending(null);
    setCurrentIndex(i => i + 1);
  }

  function onSatisfied(result: StepResult) {
    setPending(result);
    if (initial?.status === 'not-started') {
      updateLessonProgress(lesson!.id, { status: 'in-progress', startedAt: Date.now() });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/browse" className="text-gray-400 hover:text-gray-700 text-sm">
            ← Curriculum
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="font-semibold text-gray-900 text-sm truncate flex-1">{lesson.title}</h1>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {finished ? 'Complete' : `Step ${currentIndex + 1} of ${total}`}
          </span>
        </div>
        <div className="max-w-3xl mx-auto mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${(doneCount / total) * 100}%` }}
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {/* Objectives — shown until the learner is underway */}
        {currentIndex === 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-2">{lesson.summary}</p>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
              After this lesson you will be able to
            </div>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
              {lesson.objectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Completed steps — collapsed */}
        {lesson.steps.slice(0, Math.min(currentIndex, total)).map((step, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-2 text-sm"
          >
            <span>{RESULT_ICON[results[String(i)] ?? 'skipped']}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              {stepKindLabel(step.kind)}
            </span>
            <span className="text-gray-600 truncate">{stepSummary(step)}</span>
          </div>
        ))}

        {/* Current step — interactive */}
        {!finished && (
          <div className="bg-white border-2 border-blue-200 rounded-xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-3">
              {stepKindLabel(lesson.steps[currentIndex].kind)}
            </div>
            <StepRenderer
              key={currentIndex}
              step={lesson.steps[currentIndex]}
              onSatisfied={onSatisfied}
            />
            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
              <button
                onClick={() => advance(pending ?? 'solved')}
                disabled={!pending}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-5 py-2 rounded-lg text-sm font-medium"
              >
                {currentIndex === total - 1 ? 'Finish lesson' : 'Next step'}
              </button>
              {!pending && (
                <button
                  onClick={() => advance('skipped')}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Skip this step
                </button>
              )}
            </div>
          </div>
        )}

        {/* End-of-lesson summary */}
        {finished && <LessonSummary lesson={lesson} results={results} />}
      </main>
    </div>
  );
}

function LessonSummary({
  lesson,
  results,
}: {
  lesson: NonNullable<ReturnType<typeof lessonsById.get>>;
  results: Record<string, StepResult>;
}) {
  const solved = Object.values(results).filter(r => r === 'solved').length;
  const problems = lesson.appliesTo.map(pid => problemsById.get(pid)).filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-3xl mb-1">🎉</div>
        <h2 className="text-lg font-bold text-gray-900">Lesson complete</h2>
        <p className="text-sm text-gray-600 mt-1">
          You solved {solved} of {lesson.steps.length} steps on your own.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-gray-900 mb-2">What you learned</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
          {lesson.objectives.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </div>

      {lesson.glossary.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-2">Terms introduced</h3>
          <dl className="space-y-1.5">
            {lesson.glossary.map(g => (
              <div key={g.term} className="text-sm">
                <dt className="font-semibold text-gray-800 inline">{g.term}: </dt>
                <dd className="text-gray-600 inline">{g.definition}</dd>
              </div>
            ))}
          </dl>
          <Link to="/glossary" className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block">
            Browse the full glossary →
          </Link>
        </div>
      )}

      {problems.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-2">Now try these problems</h3>
          <div className="space-y-1.5">
            {problems.map(p => (
              <Link
                key={p!.id}
                to={`/problem/${p!.id}`}
                className="block text-sm text-blue-600 hover:text-blue-800"
              >
                🎯 {p!.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link
        to="/browse"
        className="block text-center bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700"
      >
        Back to curriculum
      </Link>
    </div>
  );
}
