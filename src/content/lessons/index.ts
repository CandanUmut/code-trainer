import type { Lesson, Category } from '../../types';

// Vite glob import — dropping a new .ts file under lessons/<category>/ auto-registers it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modules = (import.meta as any).glob('./**/*.ts', { eager: true }) as Record<
  string,
  { default?: Lesson }
>;

export const allLessons: Lesson[] = Object.entries(modules)
  // index.ts itself has no default Lesson export — filter it and any stray files out.
  .filter(([path]) => !path.endsWith('/index.ts'))
  .map(([, m]) => m.default)
  .filter((l): l is Lesson => Boolean(l))
  .sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order);

export const lessonsById = new Map(allLessons.map(l => [l.id, l]));

export const lessonsByCategory = allLessons.reduce<Record<string, Lesson[]>>((acc, l) => {
  (acc[l.category] ??= []).push(l);
  return acc;
}, {});

/** Lessons within a category, in curriculum order. */
export function lessonsFor(category: Category): Lesson[] {
  return (lessonsByCategory[category] ?? []).slice().sort((a, b) => a.order - b.order);
}
