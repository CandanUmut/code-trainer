import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Markdown } from '../lib/markdown';
import TestResults from './TestResults';
import HintDrawer from './HintDrawer';
import type { Problem, TestResult, ProblemStatus } from '../types';
import { runUserCode } from '../pyodide/runner';
import { incrementAttempts, updateProgress } from '../state/progress';

type Props = {
  problem: Problem;
  status: ProblemStatus;
  onStatusChange: (s: ProblemStatus) => void;
};

export default function ExercisePane({ problem, status, onStatusChange }: Props) {
  const [code, setCode] = useState(problem.exercise.starterCode);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(status === 'gave-up' || status === 'solved');
  const [pyodideLoading, setPyodideLoading] = useState(false);

  const allPassed = results.length > 0 && results.every(r => r.passed);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setPyodideLoading(true);
    try {
      incrementAttempts(problem.id);
      const res = await runUserCode(code, problem.exercise.functionName, problem.exercise.tests);
      setResults(res);
      const passed = res.every(r => r.passed);
      if (passed) {
        updateProgress(problem.id, { status: 'solved' });
        onStatusChange('solved');
        setShowSolution(true);
      } else if (status === 'not-started') {
        updateProgress(problem.id, { status: 'attempted' });
        onStatusChange('attempted');
      }
    } finally {
      setIsRunning(false);
      setPyodideLoading(false);
    }
  }, [code, problem, status, onStatusChange]);

  const handleShowSolution = useCallback(() => {
    if (
      window.confirm(
        "Showing the reference solution marks this problem as 'gave up'. Are you sure?",
      )
    ) {
      setShowSolution(true);
      updateProgress(problem.id, { status: 'gave-up' });
      onStatusChange('gave-up');
    }
  }, [problem.id, onStatusChange]);

  return (
    <div className="flex flex-col h-full">
      {/* Problem statement */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Exercise</h2>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <Markdown>{problem.exercise.problem}</Markdown>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={v => setCode(v ?? '')}
          theme="vs"
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            folding: false,
            wordWrap: 'on',
            tabSize: 4,
          }}
        />
      </div>

      {/* Controls + results */}
      <div className="p-4 border-t border-gray-200 space-y-4 overflow-y-auto max-h-96">
        <div className="flex items-center gap-3">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {pyodideLoading ? 'Loading Python…' : 'Running…'}
              </>
            ) : (
              'Run Tests'
            )}
          </button>

          {!showSolution && status !== 'solved' && (
            <button
              onClick={handleShowSolution}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Show solution
            </button>
          )}

          {allPassed && (
            <span className="text-green-600 text-sm font-medium">All tests passed!</span>
          )}
        </div>

        <TestResults results={results} isRunning={isRunning} />

        {/* Hints */}
        <HintDrawer hints={problem.exercise.hints} />

        {/* Reference solution — shown after passing or giving up */}
        {showSolution && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Reference Solution</span>
              {allPassed && (
                <span className="text-xs text-green-600 font-medium">Compare with yours above</span>
              )}
            </div>
            <div className="p-4">
              <Markdown>{`\`\`\`python\n${problem.exercise.referenceSolution}\n\`\`\``}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
