import type { ProblemProgress, ProblemStatus } from '../types';

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
