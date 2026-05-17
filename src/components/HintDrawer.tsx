import { useState } from 'react';
import { Markdown } from '../lib/markdown';

type Props = {
  hints: string[];
};

export default function HintDrawer({ hints }: Props) {
  const [revealed, setRevealed] = useState(0);

  if (hints.length === 0) return null;

  return (
    <div className="border border-amber-200 rounded-xl bg-amber-50 p-4">
      <h4 className="text-sm font-semibold text-amber-800 mb-3">
        Hints ({revealed}/{hints.length} revealed)
      </h4>
      <div className="space-y-3">
        {hints.slice(0, revealed).map((hint, i) => (
          <div key={i} className="bg-white rounded-lg p-3 border border-amber-200">
            <div className="text-xs text-amber-600 font-medium mb-1">Hint {i + 1}</div>
            <Markdown className="text-sm">{hint}</Markdown>
          </div>
        ))}
      </div>
      {revealed < hints.length && (
        <button
          onClick={() => setRevealed(r => r + 1)}
          className="mt-3 text-sm text-amber-700 hover:text-amber-900 underline"
        >
          Reveal hint {revealed + 1}
        </button>
      )}
    </div>
  );
}
