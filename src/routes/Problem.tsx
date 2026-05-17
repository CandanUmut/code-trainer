import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { problemsById, allProblems } from '../content';
import { getProgress } from '../state/progress';
import ConceptPane from '../components/ConceptPane';
import ExercisePane from '../components/ExercisePane';
import type { ProblemStatus } from '../types';

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  hard: 'text-red-600 bg-red-50',
};

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const problem = id ? problemsById.get(id) : undefined;

  const [status, setStatus] = useState<ProblemStatus>('not-started');
  const [activeTab, setActiveTab] = useState<'concept' | 'exercise'>('concept');

  useEffect(() => {
    if (problem) {
      const p = getProgress(problem.id);
      setStatus(p.status);
    }
  }, [problem]);

  if (!problem) return <Navigate to="/" replace />;

  const idx = allProblems.findIndex(p => p.id === problem.id);
  const prev = idx > 0 ? allProblems[idx - 1] : null;
  const next = idx < allProblems.length - 1 ? allProblems[idx + 1] : null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Link to="/" className="text-gray-400 hover:text-gray-700 text-sm font-medium">
          ← Home
        </Link>
        <span className="text-gray-300">/</span>
        <Link to="/browse" className="text-gray-400 hover:text-gray-700 text-sm">
          Browse
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="font-semibold text-gray-900 text-sm truncate">{problem.title}</h1>

        <div className="flex items-center gap-2 ml-auto">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          {problem.tags.slice(0, 3).map(t => (
            <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            status === 'solved' ? 'bg-green-100 text-green-700' :
            status === 'attempted' ? 'bg-blue-100 text-blue-700' :
            status === 'gave-up' ? 'bg-orange-100 text-orange-600' :
            'bg-gray-100 text-gray-500'
          }`}>
            {status}
          </span>
        </div>

        {/* Prev/Next navigation */}
        <div className="flex gap-1 ml-2">
          {prev && (
            <Link
              to={`/problem/${prev.id}`}
              title={prev.title}
              className="text-gray-400 hover:text-gray-700 px-2 py-1 rounded text-sm"
            >
              ‹
            </Link>
          )}
          {next && (
            <Link
              to={`/problem/${next.id}`}
              title={next.title}
              className="text-gray-400 hover:text-gray-700 px-2 py-1 rounded text-sm"
            >
              ›
            </Link>
          )}
        </div>
      </header>

      {/* Mobile tab switcher */}
      <div className="md:hidden bg-white border-b border-gray-200 flex">
        <button
          onClick={() => setActiveTab('concept')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'concept'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500'
          }`}
        >
          Learn
        </button>
        <button
          onClick={() => setActiveTab('exercise')}
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'exercise'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500'
          }`}
        >
          Exercise
        </button>
      </div>

      {/* Main two-pane layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left pane — concept (hidden on mobile when exercise tab active) */}
        <div
          className={`w-full md:w-1/2 border-r border-gray-200 bg-white overflow-y-auto ${
            activeTab === 'exercise' ? 'hidden md:block' : 'block'
          }`}
        >
          <ConceptPane problem={problem} />
        </div>

        {/* Right pane — exercise */}
        <div
          className={`w-full md:w-1/2 bg-white flex flex-col overflow-hidden ${
            activeTab === 'concept' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <ExercisePane
            key={problem.id}
            problem={problem}
            status={status}
            onStatusChange={setStatus}
          />
        </div>
      </div>
    </div>
  );
}
