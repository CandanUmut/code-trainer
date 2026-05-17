import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { lookupTerm } from '../lib/glossary';

type Props = {
  slug: string;
  children: ReactNode;
};

/**
 * Renders a glossary term with a dotted underline. Clicking opens a small
 * popover with the definition; "Full entry →" jumps to the global glossary.
 */
export default function TermTooltip({ slug, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const entry = lookupTerm(slug);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // Unknown term — render plain text so authoring typos are visible but harmless.
  if (!entry) return <span className="text-gray-700">{children}</span>;

  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="text-blue-700 border-b border-dotted border-blue-400 hover:bg-blue-50 cursor-help"
      >
        {children}
      </button>
      {open && (
        <span className="absolute z-30 left-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-left block not-prose">
          <span className="block text-sm font-semibold text-gray-900 mb-1">{entry.term}</span>
          <span className="block text-xs text-gray-600 leading-relaxed">{entry.definition}</span>
          {entry.example && (
            <code className="block text-xs bg-gray-50 text-gray-700 rounded px-2 py-1 mt-2 font-mono whitespace-pre-wrap">
              {entry.example}
            </code>
          )}
          <Link
            to={`/glossary?t=${entry.id}`}
            onClick={() => setOpen(false)}
            className="inline-block text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
          >
            Full entry →
          </Link>
        </span>
      )}
    </span>
  );
}
