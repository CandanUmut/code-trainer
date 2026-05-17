import { useState } from 'react';
import { Link } from 'react-router-dom';
import { allProblems } from '../content';
import { getAllProgress } from '../state/progress';
import type { Category, Difficulty, ProblemStatus } from '../types';

const CATEGORIES: Category[] = [
  'arrays-strings-hashmaps',
  'trees-graphs-dp',
  'pythonic-idioms',
  'oop-typing',
  'concurrency',
  'system-python',
];

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const STATUSES: ProblemStatus[] = ['not-started', 'attempted', 'solved', 'gave-up'];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export default function Browse() {
  const progress = getAllProgress();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<Category | ''>('');
  const [filterDiff, setFilterDiff] = useState<Difficulty | ''>('');
  const [filterStatus, setFilterStatus] = useState<ProblemStatus | ''>('');

  const filtered = allProblems.filter(p => {
    const status = progress[p.id]?.status ?? 'not-started';
    if (filterCat && p.category !== filterCat) return false;
    if (filterDiff && p.difficulty !== filterDiff) return false;
    if (filterStatus && status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q)) ||
        p.category.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link to="/" className="text-gray-400 hover:text-gray-700 text-sm">← Home</Link>
          <h1 className="text-xl font-bold text-gray-900">Browse Problems</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by title, tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value as Category | '')}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={filterDiff}
            onChange={e => setFilterDiff(e.target.value as Difficulty | '')}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All difficulties</option>
            {DIFFICULTIES.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as ProblemStatus | '')}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Problem list */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-12">No problems match your filters.</p>
          )}
          {filtered.map(p => {
            const status = progress[p.id]?.status ?? 'not-started';
            const attempts = progress[p.id]?.attempts ?? 0;
            return (
              <Link
                key={p.id}
                to={`/problem/${p.id}`}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-3 hover:shadow-sm transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{p.title}</div>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-gray-400">{p.category}</span>
                    {p.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {attempts > 0 && (
                    <span className="text-xs text-gray-400">{attempts} attempts</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[p.difficulty]}`}>
                    {p.difficulty}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    status === 'solved'
                      ? 'bg-green-100 text-green-700'
                      : status === 'attempted'
                      ? 'bg-blue-100 text-blue-700'
                      : status === 'gave-up'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
