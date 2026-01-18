'use client';

import { useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import { getCardByName } from '@/lib/scryfall';

export default function BulkImport({ onImport }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const parseDecklist = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const cards = [];

    for (const line of lines) {
      const match = line.match(/^(\d+)?\s*x?\s*(.+)$/i);
      if (match) {
        const quantity = parseInt(match[1]) || 1;
        const name = match[2].trim();
        if (name) {
          cards.push({ name, quantity });
        }
      }
    }

    return cards;
  };

  const handleImport = async () => {
    const cardList = parseDecklist(text);
    if (cardList.length === 0) return;

    setLoading(true);
    setProgress({ current: 0, total: cardList.length });

    const importedCards = [];

    for (let i = 0; i < cardList.length; i++) {
      const { name, quantity } = cardList[i];
      setProgress({ current: i + 1, total: cardList.length });

      const card = await getCardByName(name);
      if (card) {
        for (let q = 0; q < quantity; q++) {
          importedCards.push(card);
        }
      }
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

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste decklist here...&#10;Format: 1 Sol Ring&#10;or just: Sol Ring"
        className="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
      />

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
