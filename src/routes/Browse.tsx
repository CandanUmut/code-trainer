import { Link } from 'react-router-dom';
import { problemsByCategory } from '../content';
import { lessonsFor } from '../content/lessons';
import { getAllProgress, getAllLessonProgress } from '../state/progress';
import type { Category, Difficulty, Lesson, Problem } from '../types';

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'arrays-strings-hashmaps', label: 'Arrays, Strings & Hash Maps', emoji: '🗂' },
  { id: 'pythonic-idioms', label: 'Pythonic Idioms', emoji: '🐍' },
  { id: 'trees-graphs-dp', label: 'Trees, Graphs & DP', emoji: '🌲' },
  { id: 'oop-typing', label: 'OOP & Typing', emoji: '🏗' },
  { id: 'concurrency', label: 'Concurrency', emoji: '⚡' },
  { id: 'system-python', label: 'System Python', emoji: '🔧' },
];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export default function Browse() {
  const problemProgress = getAllProgress();
  const lessonProgress = getAllLessonProgress();

  function lessonIcon(lesson: Lesson): string {
    const status = lessonProgress[lesson.id]?.status ?? 'not-started';
    return status === 'completed' ? '✅' : status === 'in-progress' ? '🔵' : '⚪';
  }

  function problemIcon(p: Problem): string {
    const prog = problemProgress[p.id];
    if (!prog || prog.status === 'not-started') return '⚪';
    if (prog.status === 'solved') return '✅';
    if (prog.status === 'gave-up') return '❌';
    // 'attempted' — 3+ failed attempts counts as stuck
    if (prog.attempts >= 3) return '❌';
    return '🔵';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link to="/" className="text-gray-400 hover:text-gray-700 text-sm">
            ← Home
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Curriculum</h1>
          <Link to="/glossary" className="ml-auto text-sm text-blue-600 hover:text-blue-800">
            📖 Glossary
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <p className="text-sm text-gray-500">
          Work through the lessons in order — they teach the concepts — then apply them on the
          problems. Lessons are short (10–20 min) and low-stakes.
        </p>

        {CATEGORIES.map(cat => {
          const lessons = lessonsFor(cat.id);
          const problems = problemsByCategory[cat.id] ?? [];
          const lessonsDone = lessons.filter(
            l => lessonProgress[l.id]?.status === 'completed',
          ).length;
          const allLessonsDone = lessons.length > 0 && lessonsDone === lessons.length;

          return (
            <section
              key={cat.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="text-lg">{cat.emoji}</span>
                <h2 className="font-semibold text-gray-900">{cat.label}</h2>
              </div>

              <div className="p-5 space-y-5">
                {/* Lessons */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    📚 Lessons (in order){' '}
                    {lessons.length > 0 && (
                      <span className="text-gray-400 normal-case font-normal">
                        — {lessonsDone}/{lessons.length} complete
                      </span>
                    )}
                  </h3>
                  {lessons.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">
                      Lessons not authored yet — this category is still problem-only.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {lessons.map(lesson => (
                        <Link
                          key={lesson.id}
                          to={`/lesson/${lesson.id}`}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50"
                        >
                          <span>{lessonIcon(lesson)}</span>
                          <span className="text-sm text-gray-400 w-5">{lesson.order}.</span>
                          <span className="text-sm text-gray-800 flex-1 truncate">
                            {lesson.title}
                          </span>
                          <span className="text-xs text-gray-400">
                            {lesson.estimatedMinutes} min
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Problems */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    🎯 Problems (apply what you learned)
                  </h3>
                  <div className="space-y-1">
                    {problems.map(p => {
                      // A problem's prerequisite lessons are those naming it in appliesTo.
                      const prereqs = lessons.filter(l => l.appliesTo.includes(p.id));
                      const prereqsMet =
                        prereqs.length === 0 ||
                        prereqs.every(l => lessonProgress[l.id]?.status === 'completed');
                      const dimmed = lessons.length > 0 && !prereqsMet && !allLessonsDone;
                      return (
                        <Link
                          key={p.id}
                          to={`/problem/${p.id}`}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 ${
                            dimmed ? 'opacity-50' : ''
                          }`}
                          title={
                            dimmed
                              ? "You haven't done the lessons for this yet — you can still try."
                              : undefined
                          }
                        >
                          <span>{problemIcon(p)}</span>
                          <span className="text-sm text-gray-800 flex-1 truncate">{p.title}</span>
                          {dimmed && <span className="text-xs text-amber-500">lessons first</span>}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[p.difficulty]}`}
                          >
                            {p.difficulty}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
