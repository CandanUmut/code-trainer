import type { Problem } from '../types';

// Vite glob import — adding a new .ts file in any category folder auto-registers it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modules = (import.meta as any).glob('./problems/**/*.ts', { eager: true }) as Record<
  string,
  { default: Problem }
>;

export const allProblems: Problem[] = Object.values(modules)
  .map(m => m.default)
  .filter(Boolean)
  .sort((a, b) => a.id.localeCompare(b.id));

export const problemsById = new Map(allProblems.map(p => [p.id, p]));

export const problemsByCategory = allProblems.reduce<Record<string, Problem[]>>((acc, p) => {
  (acc[p.category] ??= []).push(p);
  return acc;
}, {});
