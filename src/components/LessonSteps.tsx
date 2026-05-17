import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Markdown } from '../lib/markdown';
import TestResults from './TestResults';
import {
  runPredictOutput,
  runWriteLineExpression,
  runWriteLineStatement,
  runFillInValidation,
  runUserCode,
} from '../pyodide/runner';
import type {
  LessonStep,
  StepResult,
  TestResult,
  ExplanationStep,
  PredictOutputStep,
  FillInBlankStep,
  WriteLineStep,
  WriteFunctionStep,
  MultipleChoiceStep,
  ChecklistStep,
} from '../types';

// Each step view calls `onSatisfied` exactly once, when the learner has either
// answered correctly or revealed the answer. The lesson route then enables Next.
type StepViewProps<T> = {
  step: T;
  onSatisfied: (result: StepResult) => void;
};

const norm = (s: string) => s.replace(/\r\n/g, '\n').replace(/\s+$/, '');

function pyBlock(code: string) {
  return '```python\n' + code + '\n```';
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------
function HintButton({ hint }: { hint?: string }) {
  const [open, setOpen] = useState(false);
  if (!hint) return null;
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="text-xs text-amber-600 hover:text-amber-800 font-medium"
      >
        {open ? 'Hide hint' : '💡 Hint'}
      </button>
      {open && (
        <div className="mt-1 text-xs bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-amber-900">
          <Markdown>{hint}</Markdown>
        </div>
      )}
    </div>
  );
}

function Feedback({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        ok
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// explanation
// ---------------------------------------------------------------------------
function ExplanationStepView({ step, onSatisfied }: StepViewProps<ExplanationStep>) {
  useEffect(() => {
    onSatisfied('solved'); // reading is the action — satisfied on view
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
      <Markdown>{step.markdown}</Markdown>
      {step.glossary && step.glossary.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Terms
          </div>
          <dl className="space-y-1.5">
            {step.glossary.map(g => (
              <div key={g.term} className="text-xs">
                <dt className="font-semibold text-slate-800 inline">{g.term}: </dt>
                <dd className="text-slate-600 inline">{g.definition}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// predict-output
// ---------------------------------------------------------------------------
function PredictOutputStepView({ step, onSatisfied }: StepViewProps<PredictOutputStep>) {
  const [guess, setGuess] = useState('');
  const [running, setRunning] = useState(false);
  const [actual, setActual] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [revealed, setRevealed] = useState(false);

  async function check() {
    setRunning(true);
    try {
      const res = await runPredictOutput(step.code);
      setActual(res.stdout);
      setError(res.error ?? null);
      // Grade against the real runtime output so authored `expected` can't drift.
      const ok = norm(guess) === norm(res.stdout) && !res.error;
      setCorrect(ok);
      if (ok) onSatisfied('solved');
    } finally {
      setRunning(false);
    }
  }

  async function reveal() {
    if (actual === null) {
      const res = await runPredictOutput(step.code);
      setActual(res.stdout);
      setError(res.error ?? null);
    }
    setRevealed(true);
    onSatisfied('revealed');
  }

  const done = correct || revealed;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-800">{step.prompt}</p>
      <Markdown>{pyBlock(step.code)}</Markdown>
      <textarea
        value={guess}
        onChange={e => setGuess(e.target.value)}
        placeholder="Type exactly what you think this prints…"
        rows={3}
        disabled={done}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
      />
      <div className="flex items-center gap-3">
        {!done && (
          <button
            onClick={check}
            disabled={running || !guess}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
          >
            {running ? 'Running…' : 'Check'}
          </button>
        )}
        {!done && (
          <button onClick={reveal} className="text-sm text-gray-400 hover:text-gray-600 underline">
            Show me how
          </button>
        )}
      </div>
      <HintButton hint={step.hint} />
      {correct === false && !revealed && (
        <Feedback ok={false}>
          Not quite. Try again, or click “Show me how”.
        </Feedback>
      )}
      {done && (
        <div className="space-y-2">
          <Feedback ok={!!correct}>
            {correct ? 'Correct!' : 'Here is the actual output:'}
            <pre className="mt-1 bg-white/60 rounded px-2 py-1 font-mono text-xs whitespace-pre-wrap">
              {error ? error : actual || '(no output)'}
            </pre>
          </Feedback>
          <Markdown>{step.explanation}</Markdown>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// fill-in-blank
// ---------------------------------------------------------------------------
function FillInBlankStepView({ step, onSatisfied }: StepViewProps<FillInBlankStep>) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(step.blanks.map(b => [b.id, ''])),
  );
  const [checked, setChecked] = useState<Record<string, boolean> | null>(null);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const parts = step.template.split(/(__\d+__)/g);

  function blankCorrect(id: string, val: string): boolean {
    const blank = step.blanks.find(b => b.id === id);
    if (!blank) return false;
    return blank.accept.some(a => a.trim() === val.trim());
  }

  function assemble(): string {
    let code = step.template;
    for (const b of step.blanks) {
      code = code.replace(new RegExp(`__${b.id}__`, 'g'), values[b.id] ?? '');
    }
    return code;
  }

  async function check() {
    const result: Record<string, boolean> = {};
    for (const b of step.blanks) result[b.id] = blankCorrect(b.id, values[b.id] ?? '');
    setChecked(result);
    const allBlanksOk = step.blanks.every(b => result[b.id]);
    if (!allBlanksOk) {
      setValidationMsg(null);
      return;
    }
    if (step.validation) {
      setRunning(true);
      try {
        const v = await runFillInValidation(assemble(), step.validation);
        if (v.timedOut || v.error) {
          setValidationMsg(`The assembled code failed: ${v.error ?? 'timed out'}`);
          return;
        }
        if (!v.passed) {
          setValidationMsg('Blanks look right, but the assembled code did not produce the expected result.');
          return;
        }
      } finally {
        setRunning(false);
      }
    }
    setValidationMsg(null);
    onSatisfied('solved');
  }

  function reveal() {
    setValues(Object.fromEntries(step.blanks.map(b => [b.id, b.accept[0]])));
    setChecked(Object.fromEntries(step.blanks.map(b => [b.id, true])));
    setRevealed(true);
    onSatisfied('revealed');
  }

  const solved = checked !== null && step.blanks.every(b => checked[b.id]) && !validationMsg;
  const done = solved || revealed;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-800">{step.prompt}</p>
      <div className="bg-gray-900 text-gray-100 rounded-lg p-3 font-mono text-sm leading-7 whitespace-pre-wrap">
        {parts.map((part, i) => {
          const m = part.match(/^__(\d+)__$/);
          if (!m) return <span key={i}>{part}</span>;
          const id = m[1];
          const state = checked?.[id];
          return (
            <input
              key={i}
              value={values[id] ?? ''}
              onChange={e => setValues(v => ({ ...v, [id]: e.target.value }))}
              disabled={done}
              spellCheck={false}
              style={{ width: `${Math.max(3, (values[id] ?? '').length + 1)}ch` }}
              className={`mx-0.5 px-1 rounded text-center font-mono outline-none ${
                state === true
                  ? 'bg-green-200 text-green-900'
                  : state === false
                    ? 'bg-red-200 text-red-900'
                    : 'bg-amber-200 text-amber-900'
              }`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        {!done && (
          <button
            onClick={check}
            disabled={running || step.blanks.some(b => !values[b.id])}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
          >
            {running ? 'Checking…' : 'Check'}
          </button>
        )}
        {!done && (
          <button onClick={reveal} className="text-sm text-gray-400 hover:text-gray-600 underline">
            Show me how
          </button>
        )}
      </div>
      {validationMsg && <Feedback ok={false}>{validationMsg}</Feedback>}
      {checked &&
        step.blanks.map(b =>
          checked[b.id] && !revealed ? null : (
            <div
              key={b.id}
              className={`text-xs rounded-lg px-3 py-2 border ${
                checked[b.id]
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <span className="font-semibold">Blank {b.id}: </span>
              <Markdown>{b.explanation}</Markdown>
              {b.hint && !checked[b.id] && (
                <div className="mt-1">
                  <HintButton hint={b.hint} />
                </div>
              )}
            </div>
          ),
        )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// write-line
// ---------------------------------------------------------------------------
function WriteLineStepView({ step, onSatisfied }: StepViewProps<WriteLineStep>) {
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [actual, setActual] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  async function check() {
    setRunning(true);
    try {
      const res =
        step.mode === 'expression'
          ? await runWriteLineExpression(step.setup, input, step.expected)
          : await runWriteLineStatement(
              step.setup,
              input,
              step.checkVar!.name,
              step.checkVar!.value,
            );
      setActual(JSON.stringify(res.actual));
      setError(res.error ?? null);
      setCorrect(res.passed);
      if (res.passed) onSatisfied('solved');
    } finally {
      setRunning(false);
    }
  }

  function reveal() {
    setInput(step.referenceAnswer);
    setRevealed(true);
    onSatisfied('revealed');
  }

  const done = correct || revealed;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-800">{step.prompt}</p>
      {step.setup.trim() && (
        <div>
          <div className="text-xs text-gray-400 mb-1">Already defined for you:</div>
          <Markdown>{pyBlock(step.setup)}</Markdown>
        </div>
      )}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={done}
        spellCheck={false}
        placeholder={step.mode === 'expression' ? 'an expression…' : 'a statement…'}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
      />
      <div className="flex items-center gap-3">
        {!done && (
          <button
            onClick={check}
            disabled={running || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
          >
            {running ? 'Running…' : 'Check'}
          </button>
        )}
        {!done && (
          <button onClick={reveal} className="text-sm text-gray-400 hover:text-gray-600 underline">
            Show me how
          </button>
        )}
      </div>
      <HintButton hint={step.hint} />
      {correct === false && !revealed && (
        <Feedback ok={false}>
          Not yet.
          {error ? (
            <pre className="mt-1 font-mono text-xs whitespace-pre-wrap">{error}</pre>
          ) : (
            <> Your line produced <code>{actual}</code>.</>
          )}
        </Feedback>
      )}
      {done && (
        <div className="space-y-2">
          <Feedback ok={!!correct}>
            {correct ? 'Correct!' : 'Reference answer:'}
            <code className="block mt-1 bg-white/60 rounded px-2 py-1 font-mono text-xs">
              {step.referenceAnswer}
            </code>
          </Feedback>
          <Markdown>{step.explanation}</Markdown>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// write-function (a focused drill — same runner as full problems)
// ---------------------------------------------------------------------------
function WriteFunctionStepView({ step, onSatisfied }: StepViewProps<WriteFunctionStep>) {
  const [code, setCode] = useState(step.starterCode);
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);

  async function run() {
    setRunning(true);
    try {
      const res = await runUserCode(code, step.functionName, step.tests);
      setResults(res);
      if (res.every(r => r.passed)) {
        setSolved(true);
        onSatisfied('solved');
      }
    } finally {
      setRunning(false);
    }
  }

  function reveal() {
    setCode(step.referenceSolution);
    setRevealed(true);
    onSatisfied('revealed');
  }

  const done = solved || revealed;

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Drill</span>
        <div className="mt-1">
          <Markdown>{step.prompt}</Markdown>
        </div>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: 220 }}>
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
      <div className="flex items-center gap-3">
        <button
          onClick={run}
          disabled={running}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
        >
          {running ? 'Running…' : 'Run tests'}
        </button>
        {!done && hintIdx < step.hints.length && (
          <button
            onClick={() => setHintIdx(i => i + 1)}
            className="text-sm text-amber-600 hover:text-amber-800"
          >
            💡 Hint ({hintIdx + 1}/{step.hints.length})
          </button>
        )}
        {!done && (
          <button onClick={reveal} className="text-sm text-gray-400 hover:text-gray-600 underline">
            Show me how
          </button>
        )}
      </div>
      {step.hints.slice(0, hintIdx).map((h, i) => (
        <div
          key={i}
          className="text-xs bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-amber-900"
        >
          <Markdown>{h}</Markdown>
        </div>
      ))}
      <TestResults results={results} isRunning={running} />
      {done && (
        <div className="space-y-2">
          <Markdown>{step.explanation}</Markdown>
          {revealed && (
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="text-xs font-semibold text-gray-500 mb-1">Reference solution</div>
              <Markdown>{pyBlock(step.referenceSolution)}</Markdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// multiple-choice
// ---------------------------------------------------------------------------
function MultipleChoiceStepView({ step, onSatisfied }: StepViewProps<MultipleChoiceStep>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);

  function toggle(id: string) {
    if (checked) return;
    setSelected(prev => {
      const next = new Set(step.multi ? prev : []);
      if (prev.has(id) && step.multi) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function check() {
    setChecked(true);
    const correct = step.choices.every(c => c.correct === selected.has(c.id));
    onSatisfied(correct ? 'solved' : 'revealed');
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-800">
        <Markdown>{step.prompt}</Markdown>
      </div>
      {step.multi && <p className="text-xs text-gray-400">Select all that apply.</p>}
      <div className="space-y-2">
        {step.choices.map(c => {
          const isSel = selected.has(c.id);
          const reveal = checked;
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              disabled={checked}
              className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                reveal && c.correct
                  ? 'border-green-300 bg-green-50'
                  : reveal && isSel && !c.correct
                    ? 'border-red-300 bg-red-50'
                    : isSel
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm">
                <Markdown>{c.markdown}</Markdown>
              </div>
              {reveal && (isSel || c.correct) && (
                <div
                  className={`text-xs mt-1 ${c.correct ? 'text-green-700' : 'text-red-700'}`}
                >
                  {c.correct ? c.whyRight ?? 'Correct.' : c.whyWrong ?? 'Incorrect.'}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {!checked && (
        <button
          onClick={check}
          disabled={selected.size === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
        >
          Check answer
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// checklist
// ---------------------------------------------------------------------------
function ChecklistStepView({ step, onSatisfied }: StepViewProps<ChecklistStep>) {
  const [ticked, setTicked] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (ticked.size === step.items.length) onSatisfied('solved');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticked]);

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
      <p className="text-xs text-gray-400">Tick each point to confirm you've got it.</p>
      <div className="space-y-2">
        {step.items.map((item, i) => (
          <label
            key={i}
            className="flex items-start gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={ticked.has(i)}
              onChange={() =>
                setTicked(prev => {
                  const next = new Set(prev);
                  if (next.has(i)) next.delete(i);
                  else next.add(i);
                  return next;
                })
              }
              className="mt-1"
            />
            <span className="text-sm text-gray-700 flex-1">
              <Markdown>{item}</Markdown>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------
export function StepRenderer({
  step,
  onSatisfied,
}: {
  step: LessonStep;
  onSatisfied: (result: StepResult) => void;
}) {
  switch (step.kind) {
    case 'explanation':
      return <ExplanationStepView step={step} onSatisfied={onSatisfied} />;
    case 'predict-output':
      return <PredictOutputStepView step={step} onSatisfied={onSatisfied} />;
    case 'fill-in-blank':
      return <FillInBlankStepView step={step} onSatisfied={onSatisfied} />;
    case 'write-line':
      return <WriteLineStepView step={step} onSatisfied={onSatisfied} />;
    case 'write-function':
      return <WriteFunctionStepView step={step} onSatisfied={onSatisfied} />;
    case 'multiple-choice':
      return <MultipleChoiceStepView step={step} onSatisfied={onSatisfied} />;
    case 'checklist':
      return <ChecklistStepView step={step} onSatisfied={onSatisfied} />;
  }
}

const KIND_LABEL: Record<LessonStep['kind'], string> = {
  explanation: 'Read',
  'predict-output': 'Predict the output',
  'fill-in-blank': 'Fill in the blank',
  'write-line': 'Write one line',
  'write-function': 'Drill',
  'multiple-choice': 'Multiple choice',
  checklist: 'Recap',
};

/** Short one-line summary used to render collapsed (already-done) steps. */
export function stepSummary(step: LessonStep): string {
  switch (step.kind) {
    case 'explanation':
      return step.title;
    case 'checklist':
      return step.title;
    default:
      return step.prompt;
  }
}

export function stepKindLabel(kind: LessonStep['kind']): string {
  return KIND_LABEL[kind];
}
