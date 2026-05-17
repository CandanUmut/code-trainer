import type { GlossaryTerm } from '../types';
import { seedGlossary } from '../content/glossary/terms';
import { allLessons } from '../content/lessons';

/** Normalize a term name to a stable slug used in `{{term:slug}}` references. */
export function slugifyTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export type GlossaryEntry = GlossaryTerm & {
  /** Lesson IDs that introduce or use this term. */
  appearsIn: string[];
};

function build(): { entries: GlossaryEntry[]; byId: Map<string, GlossaryEntry> } {
  const byId = new Map<string, GlossaryEntry>();

  function add(term: Omit<GlossaryTerm, 'id'> & { id?: string }, lessonId?: string) {
    const id = term.id || slugifyTerm(term.term);
    const existing = byId.get(id);
    if (existing) {
      // Keep the first/seed definition; only accumulate backlinks and fill gaps.
      if (lessonId && !existing.appearsIn.includes(lessonId)) existing.appearsIn.push(lessonId);
      if (!existing.example && term.example) existing.example = term.example;
      return;
    }
    byId.set(id, {
      id,
      term: term.term,
      definition: term.definition,
      example: term.example,
      appearsIn: lessonId ? [lessonId] : [],
    });
  }

  for (const t of seedGlossary) add(t);

  for (const lesson of allLessons) {
    for (const g of lesson.glossary) add(g, lesson.id);
    for (const step of lesson.steps) {
      if (step.kind === 'explanation' && step.glossary) {
        for (const g of step.glossary) add({ id: slugifyTerm(g.term), ...g }, lesson.id);
      }
    }
  }

  const entries = [...byId.values()].sort((a, b) => a.term.localeCompare(b.term));
  return { entries, byId };
}

const { entries, byId } = build();

export const glossaryEntries: GlossaryEntry[] = entries;
export const glossaryById: Map<string, GlossaryEntry> = byId;

/** Look up a term by slug, or by its display name as a fallback. */
export function lookupTerm(ref: string): GlossaryEntry | undefined {
  return glossaryById.get(ref) ?? glossaryById.get(slugifyTerm(ref));
}
