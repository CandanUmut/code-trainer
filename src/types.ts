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

export type Problem = {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  tags: string[];
  concept: string;
  workedExample: {
    problem: string;
    solution: string;
    walkthrough: string;
    complexity: string;
  };
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
