import type { ProblemProgress, ProblemStatus, LessonProgress, StepResult } from '../types';

const STORAGE_KEY = 'python-trainer-progress';

type ProgressStore = Record<string, ProblemProgress>;

function load(): ProgressStore {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function save(store: ProgressStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getProgress(problemId: string): ProblemProgress {
  const store = load();
  return store[problemId] ?? { status: 'not-started', attempts: 0, lastSeenAt: 0 };
}

export function updateProgress(
  problemId: string,
  update: Partial<ProblemProgress> & { status: ProblemStatus },
): void {
  const store = load();
  const current = store[problemId] ?? { status: 'not-started', attempts: 0, lastSeenAt: 0 };
  store[problemId] = {
    ...current,
    ...update,
    lastSeenAt: Date.now(),
  };
  save(store);
}

export function incrementAttempts(problemId: string): void {
  const store = load();
  const current = store[problemId] ?? { status: 'not-started', attempts: 0, lastSeenAt: 0 };
  store[problemId] = {
    ...current,
    status: current.status === 'not-started' ? 'attempted' : current.status,
    attempts: current.attempts + 1,
    lastSeenAt: Date.now(),
  };
  save(store);
}

export function getAllProgress(): ProgressStore {
  return load();
}

export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ---------------------------------------------------------------------------
// Lesson progress — stored under its own localStorage key.
// ---------------------------------------------------------------------------
const LESSON_KEY = 'python-trainer-lesson-progress';

type LessonStore = Record<string, LessonProgress>;

function loadLessons(): LessonStore {
  try {
    return JSON.parse(localStorage.getItem(LESSON_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveLessons(store: LessonStore): void {
  localStorage.setItem(LESSON_KEY, JSON.stringify(store));
}

function freshLesson(lessonId: string): LessonProgress {
  return { lessonId, status: 'not-started', currentStepIndex: 0, stepResults: {} };
}

export function getLessonProgress(lessonId: string): LessonProgress {
  return loadLessons()[lessonId] ?? freshLesson(lessonId);
}

export function getAllLessonProgress(): LessonStore {
  return loadLessons();
}

export function updateLessonProgress(
  lessonId: string,
  update: Partial<LessonProgress>,
): void {
  const store = loadLessons();
  const current = store[lessonId] ?? freshLesson(lessonId);
  store[lessonId] = { ...current, ...update, lessonId };
  saveLessons(store);
}

/** Record the outcome of one step and advance the cursor. */
export function recordStepResult(
  lessonId: string,
  stepIndex: number,
  result: StepResult,
  totalSteps: number,
): void {
  const store = loadLessons();
  const current = store[lessonId] ?? freshLesson(lessonId);
  const stepResults = { ...current.stepResults, [String(stepIndex)]: result };
  const nextIndex = Math.max(current.currentStepIndex, stepIndex + 1);
  const completed = Object.keys(stepResults).length >= totalSteps;
  store[lessonId] = {
    lessonId,
    status: completed ? 'completed' : 'in-progress',
    // Past the last index when complete, so the route shows the summary on reload.
    currentStepIndex: completed ? totalSteps : nextIndex,
    stepResults,
    startedAt: current.startedAt ?? Date.now(),
    completedAt: completed ? current.completedAt ?? Date.now() : current.completedAt,
  };
  saveLessons(store);
}

export function clearLessonProgress(): void {
  localStorage.removeItem(LESSON_KEY);
}
