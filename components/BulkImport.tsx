'use client';

import { useState } from 'react';
import { FileText, Upload, AlertTriangle } from 'lucide-react';
import { getCardsByNames } from '@/lib/scryfall';
import type { ScryfallCard, ParsedDeckEntry, BulkImportProgress } from '@/types';

const MAX_CARDS = 150;
const MAX_QUANTITY_PER_CARD = 10;

interface BulkImportProps {
  onImport: (cards: ScryfallCard[]) => void;
}

export default function BulkImport({ onImport }: BulkImportProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<BulkImportProgress>({ current: 0, total: 0 });
  const [warning, setWarning] = useState<string | null>(null);

  const parseDecklist = (text: string): ParsedDeckEntry[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const cards: ParsedDeckEntry[] = [];

    for (const line of lines) {
      const match = line.match(/^(\d+)?\s*x?\s*(.+)$/i);
      if (match) {
        const rawQuantity = parseInt(match[1]) || 1;
        const quantity = Math.min(rawQuantity, MAX_QUANTITY_PER_CARD);
        const name = match[2].trim();
        if (name && name.length <= 200) {
          cards.push({ name, quantity });
        }
      }
    }

    return cards;
  };

  const handleImport = async () => {
    let cardList = parseDecklist(text);
    if (cardList.length === 0) return;

    setWarning(null);

    if (cardList.length > MAX_CARDS) {
      setWarning(`Decklist truncated to ${MAX_CARDS} cards (was ${cardList.length})`);
      cardList = cardList.slice(0, MAX_CARDS);
    }

    setLoading(true);
    setProgress({ current: 0, total: cardList.length });

    const uniqueNames = [...new Set(cardList.map(c => c.name))];
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
        <FileText className="w-5 h-5" />
        Bulk Import
      </h3>

      <label htmlFor="bulk-import-input" className="sr-only">Paste decklist</label>
      <textarea
        id="bulk-import-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Paste decklist here (max ${MAX_CARDS} cards)...\nFormat: 1 Sol Ring\nor just: Sol Ring`}
        className="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
        maxLength={50000}
      />

      {warning && (
        <div className="mt-2 flex items-center gap-2 text-amber-400 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{warning}</span>
        </div>
      )}

      {loading && (
        <div className="mt-2">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Loading card {progress.current} of {progress.total}...
          </p>
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={loading || !text.trim()}
        className="mt-3 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <Upload className="w-4 h-4" />
        {loading ? 'Importing...' : 'Import Cards'}
      </button>
    </div>
  );
}
