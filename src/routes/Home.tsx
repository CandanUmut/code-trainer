import { Link } from 'react-router-dom';
import { allProblems, problemsByCategory } from '../content';
import { allLessons, lessonsFor } from '../content/lessons';
import { getAllProgress, getAllLessonProgress } from '../state/progress';
import type { Category, ProblemStatus } from '../types';
import ProgressBar from '../components/ProgressBar';

const CATEGORY_META: Record<Category, { label: string; emoji: string; desc: string }> = {
  'arrays-strings-hashmaps': {
    label: 'Arrays, Strings & Hash Maps',
    emoji: '🗂',
    desc: 'Sliding windows, prefix sums, hash map lookups',
  },
  'trees-graphs-dp': {
    label: 'Trees, Graphs & DP',
    emoji: '🌲',
    desc: 'DFS, BFS, dynamic programming, topological sort',
  },
  'pythonic-idioms': {
    label: 'Pythonic Idioms',
    emoji: '🐍',
    desc: 'Comprehensions, itertools, generators, decorators',
  },
  'oop-typing': {
    label: 'OOP & Typing',
    emoji: '🏗',
    desc: 'Protocols, generics, ABCs, dataclasses, metaclasses',
  },
  concurrency: {
    label: 'Concurrency',
    emoji: '⚡',
    desc: 'asyncio, threading, queues, resilience patterns',
  },
  'system-python': {
    label: 'System Python',
    emoji: '🔧',
    desc: 'AST, regex, CSV, JSON, in-memory filesystem',
  },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

const STATUS_COLORS: Record<ProblemStatus, string> = {
  'not-started': 'bg-gray-100 text-gray-500',
  attempted: 'bg-blue-100 text-blue-700',
  solved: 'bg-green-100 text-green-700',
  'gave-up': 'bg-orange-100 text-orange-600',
};

export default function Home() {
  const progress = getAllProgress();
  const lessonProgress = getAllLessonProgress();
  const totalSolved = Object.values(progress).filter(p => p.status === 'solved').length;
  const totalProblems = allProblems.length;
  const lessonsDone = Object.values(lessonProgress).filter(l => l.status === 'completed').length;
  const totalLessons = allLessons.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Python Interview Trainer</h1>
            <p className="text-sm text-gray-500">
              Learn by doing — lessons teach the concepts, problems test them. No login, runs in
              your browser.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/glossary"
              className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Glossary
            </Link>
            <Link
              to="/browse"
              className="text-sm bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Open Curriculum
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Lessons</h2>
              <span className="text-sm text-gray-500">
                {lessonsDone} / {totalLessons} complete
              </span>
            </div>
            <ProgressBar value={lessonsDone} max={Math.max(1, totalLessons)} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Problems</h2>
              <span className="text-sm text-gray-500">
                {totalSolved} / {totalProblems} solved
              </span>
            </div>
            <ProgressBar value={totalSolved} max={totalProblems} />
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.entries(CATEGORY_META) as [Category, (typeof CATEGORY_META)[Category]][]).map(
            ([cat, meta]) => {
              const problems = problemsByCategory[cat] ?? [];
              const lessons = lessonsFor(cat);
              const solved = problems.filter(p => progress[p.id]?.status === 'solved').length;
              const catLessonsDone = lessons.filter(
                l => lessonProgress[l.id]?.status === 'completed',
              ).length;

              return (
                <div
                  key={cat}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{meta.emoji}</span>
                        <h3 className="font-semibold text-gray-900">{meta.label}</h3>
                      </div>
                      <p className="text-sm text-gray-500">{meta.desc}</p>
                    </div>
                    <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                      {solved}/{problems.length}
                    </span>
                  </div>

                  <ProgressBar value={solved} max={problems.length} className="mb-3" />

                  {/* Lessons row */}
                  {lessons.length > 0 ? (
                    <Link
                      to="/browse"
                      className="flex items-center justify-between text-sm bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg px-3 py-2 mb-3"
                    >
                      <span>
                        📚 {lessons.length} lessons · {catLessonsDone} done
                      </span>
                      <span>Start →</span>
                    </Link>
                  ) : (
                    <div className="text-xs text-gray-400 italic mb-3">
                      Lessons coming soon — problems only for now.
                    </div>
                  )}

                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {problems.map(p => {
                      const status = progress[p.id]?.status ?? 'not-started';
                      return (
                        <Link
                          key={p.id}
                          to={`/problem/${p.id}`}
                          className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 truncate">
                            {p.title}
                          </span>
                          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[p.difficulty]}`}
                            >
                              {p.difficulty}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}
                            >
                              {status.replace('-', ' ')}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            },
          )}
        </div>
      </main>
    </div>
  );
}
