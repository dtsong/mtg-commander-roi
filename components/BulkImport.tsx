'use client';

import { useState } from 'react';
import { FileText, Upload, AlertTriangle } from 'lucide-react';
import { getCardsByNames } from '@/lib/scryfall';
import { parseDecklistText, MAX_CARDS } from '@/lib/validation';
import type { ScryfallCard, BulkImportProgress } from '@/types';

interface BulkImportProps {
  onImport: (cards: ScryfallCard[]) => void;
}

export default function BulkImport({ onImport }: BulkImportProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<BulkImportProgress>({ current: 0, total: 0 });
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!text.trim()) return;

    setWarning(null);
    setError(null);

    const parseResult = parseDecklistText(text);

    if (!parseResult.success) {
      setError(parseResult.errors.join('. '));
      return;
    }

    const { data: cardList, warnings } = parseResult;

    if (warnings.length > 0) {
      setWarning(warnings.slice(0, 3).join('. '));
    }

    setLoading(true);
    setProgress({ current: 0, total: cardList.length });

    const uniqueNames = [...new Set(cardList.map((c) => c.name))];
    const quantityMap = new Map<string, number>();
    for (const { name, quantity } of cardList) {
      quantityMap.set(name, (quantityMap.get(name) || 0) + quantity);
    }

    const { found, notFound } = await getCardsByNames(uniqueNames, (current, total) => {
      setProgress({ current, total });
    });

    const cardMap = new Map<string, ScryfallCard>();
    for (const card of found) {
      cardMap.set(card.name.toLowerCase(), card);
    }

    const importedCards: ScryfallCard[] = [];
    for (const { name, quantity } of cardList) {
      const card = cardMap.get(name.toLowerCase());
      if (card) {
        for (let q = 0; q < quantity; q++) {
          importedCards.push(card);
        }
      }
    }

    if (notFound.length > 0) {
      const existingWarning = warning ? warning + '. ' : '';
      setWarning(`${existingWarning}${notFound.length} card(s) not found`);
    }

    setLoading(false);
    setProgress({ current: 0, total: 0 });
    setText('');
    onImport(importedCards);
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" aria-hidden="true" />
        Bulk Import
      </h3>

      <label htmlFor="bulk-import-input" className="sr-only">
        Paste decklist
      </label>
      <textarea
        id="bulk-import-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Paste decklist here (max ${MAX_CARDS} cards)…\nFormat: 1 Sol Ring\nor just: Sol Ring`}
        autoComplete="off"
        className="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        maxLength={50000}
      />

      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-400 text-sm" role="alert">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {warning && (
        <div className="mt-2 flex items-center gap-2 text-amber-400 text-sm" role="status">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{warning}</span>
        </div>
      )}

      {loading && (
        <div className="mt-2" aria-live="polite">
          <div
            className="h-2 bg-slate-700 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progress.current}
            aria-valuemin={0}
            aria-valuemax={progress.total}
          >
            <div
              className="h-full bg-purple-600 transition-[width] duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1 tabular-nums">
            Loading card {progress.current} of {progress.total}…
          </p>
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={loading || !text.trim()}
        className="mt-3 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        <Upload className="w-4 h-4" aria-hidden="true" />
        {loading ? 'Importing…' : 'Import Cards'}
      </button>
    </div>
  );
}
