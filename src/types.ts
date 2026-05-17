export type Difficulty = 'easy' | 'medium' | 'hard';

export type Category =
  | 'arrays-strings-hashmaps'
  | 'trees-graphs-dp'
  | 'pythonic-idioms'
  | 'oop-typing'
  | 'concurrency'
  | 'system-python';

export type TestCase = {
  name: string;
  input: unknown[];
  expected: unknown;
  hidden?: boolean;
};

// ---------------------------------------------------------------------------
// Worked example — now a line-by-line stepper instead of one markdown blob.
// `walkthrough` is kept optional so un-migrated problems still render (the
// stepper falls back to it). New/migrated problems should provide `steps`.
// ---------------------------------------------------------------------------
export type WorkedExampleStep = {
  // 1-indexed inclusive line range of `solution` this step covers.
  lines: [number, number];
  explanation: string; // markdown — explains *why*, not just what
  stateAfter?: { name: string; value: string }[];
};

export type WorkedExample = {
  problem: string;
  solution: string;
  complexity: string;
  steps?: WorkedExampleStep[];
  walkthrough?: string; // legacy fallback for un-migrated problems
};

export type Problem = {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  tags: string[];
  concept: string;
  workedExample: WorkedExample;
  exercise: {
    problem: string;
    functionName: string;
    starterCode: string;
    tests: TestCase[];
    referenceSolution: string;
    hints: string[];
  };
};

export type ProblemStatus = 'not-started' | 'attempted' | 'solved' | 'gave-up';

export type ProblemProgress = {
  status: ProblemStatus;
  attempts: number;
  lastSeenAt: number;
};

export type TestResult = {
  name: string;
  passed: boolean;
  input?: unknown[];
  expected?: unknown;
  actual?: unknown;
  error?: string;
  hidden: boolean;
  timedOut?: boolean;
};

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------
export type GlossaryTerm = {
  // Slug used in `{{term:slug}}` markdown references. Lowercase, hyphenated.
  id: string;
  term: string;
  definition: string;
  example?: string;
};

// ---------------------------------------------------------------------------
// Lessons — a sequence of small, low-stakes steps that teach one concept.
// ---------------------------------------------------------------------------
export type ExplanationStep = {
  kind: 'explanation';
  title: string;
  markdown: string;
  glossary?: { term: string; definition: string }[];
};

export type PredictOutputStep = {
  kind: 'predict-output';
  prompt: string;
  code: string; // fully runnable python snippet
  expected: string; // exact stdout, compared after rstrip()
  explanation: string; // markdown — why it produces that output
  hint?: string;
};

export type FillInBlankStep = {
  kind: 'fill-in-blank';
  prompt: string;
  // Template with __1__, __2__ placeholders, one input per blank.
  template: string;
  blanks: {
    id: string; // matches the placeholder number, e.g. "1"
    accept: string[]; // acceptable answers; first is canonical
    explanation: string;
    hint?: string;
  }[];
  validation?: {
    expectedStdout?: string;
    expectedVar?: { name: string; value: unknown };
  };
};

export type WriteLineStep = {
  kind: 'write-line';
  prompt: string;
  setup: string; // python that runs before the user's line
  mode: 'expression' | 'statement';
  expected?: unknown; // expression mode: eval result to match
  checkVar?: { name: string; value: unknown }; // statement mode: var to check
  referenceAnswer: string;
  explanation: string;
  hint?: string;
};

export type WriteFunctionStep = {
  kind: 'write-function';
  prompt: string;
  functionName: string;
  starterCode: string;
  tests: TestCase[];
  referenceSolution: string;
  hints: string[];
  explanation: string;
};

export type MultipleChoiceStep = {
  kind: 'multiple-choice';
  prompt: string;
  choices: {
    id: string;
    markdown: string;
    correct: boolean;
    whyWrong?: string;
    whyRight?: string;
  }[];
  multi?: boolean;
};

export type ChecklistStep = {
  kind: 'checklist';
  title: string;
  items: string[];
};

export type LessonStep =
  | ExplanationStep
  | PredictOutputStep
  | FillInBlankStep
  | WriteLineStep
  | WriteFunctionStep
  | MultipleChoiceStep
  | ChecklistStep;

export type LessonStepKind = LessonStep['kind'];

export type Lesson = {
  id: string;
  category: Category;
  title: string;
  summary: string;
  estimatedMinutes: number;
  // Position within the category's lesson sequence (1-indexed).
  order: number;
  prerequisites: string[]; // lesson IDs — shown but not hard-blocked
  glossary: { term: string; definition: string; example?: string }[];
  objectives: string[];
  steps: LessonStep[];
  appliesTo: string[]; // problem IDs unlocked / suggested after this lesson
};

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------
export type StepResult = 'solved' | 'revealed' | 'skipped';

export type LessonStatus = 'not-started' | 'in-progress' | 'completed';

export type LessonProgress = {
  lessonId: string;
  status: LessonStatus;
  currentStepIndex: number;
  stepResults: Record<string, StepResult>; // keyed by step index
  startedAt?: number;
  completedAt?: number;
};
