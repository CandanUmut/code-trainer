import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { glossaryEntries } from '../lib/glossary';
import { lessonsById } from '../content/lessons';

export default function Glossary() {
  const [params] = useSearchParams();
  const target = params.get('t');
  const [search, setSearch] = useState('');
  const targetRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return glossaryEntries;
    return glossaryEntries.filter(
      e => e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q),
    );
  }, [search]);

  useEffect(() => {
    if (target && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [target]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link to="/" className="text-gray-400 hover:text-gray-700 text-sm">
            ← Home
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Glossary</h1>
          <span className="text-sm text-gray-400">{glossaryEntries.length} terms</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <input
          type="text"
          placeholder="Search terms…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />

        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-12">No terms match “{search}”.</p>
          )}
          {filtered.map(entry => {
            const isTarget = entry.id === target;
            return (
              <div
                key={entry.id}
                id={entry.id}
                ref={isTarget ? targetRef : undefined}
                className={`bg-white rounded-xl border p-4 ${
                  isTarget ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
                }`}
              >
                <h2 className="font-semibold text-gray-900">{entry.term}</h2>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{entry.definition}</p>
                {entry.example && (
                  <code className="block text-xs bg-gray-50 text-gray-700 rounded-lg px-3 py-2 mt-2 font-mono whitespace-pre-wrap">
                    {entry.example}
                  </code>
                )}
                {entry.appearsIn.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs text-gray-400">Appears in:</span>
                    {entry.appearsIn.map(lid => {
                      const lesson = lessonsById.get(lid);
                      return (
                        <Link
                          key={lid}
                          to={`/lesson/${lid}`}
                          className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-100"
                        >
                          {lesson?.title ?? lid}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
