import { Package, Star } from 'lucide-react';
import { getYears, getPreconsByYear, PRECON_DATABASE } from '@/lib/precons';
import ColorIndicator from './ColorIndicator';
import type { PreconDeck } from '@/types';

interface DeckSelectorProps {
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
  selectedSet: string | null;
  setSelectedSet: (set: string | null) => void;
  selectedDeck: PreconDeck | null;
  setSelectedDeck: (deck: PreconDeck) => void;
  customDecks: PreconDeck[];
}

export default function DeckSelector({
  selectedYear,
  setSelectedYear,
  selectedSet,
  setSelectedSet,
  selectedDeck,
  setSelectedDeck,
  customDecks,
}: DeckSelectorProps) {
  const years = getYears();
  const yearFiltered = selectedYear ? getPreconsByYear(selectedYear) : PRECON_DATABASE;
  const sets = [...new Set(yearFiltered.map(d => d.set))].sort();
  const precons = selectedSet ? yearFiltered.filter(d => d.set === selectedSet) : yearFiltered;

  const handleYearChange = (year: number | null) => {
    setSelectedYear(year);
    setSelectedSet(null);
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 h-full">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Package className="w-5 h-5" />
        Select Deck
      </h2>

      <div className="mb-4">
        <label className="block text-sm text-slate-400 mb-2">Filter by Year</label>
        <select
          value={selectedYear || ''}
          onChange={(e) => handleYearChange(e.target.value ? Number(e.target.value) : null)}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 min-h-[44px] text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Years</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-slate-400 mb-2">Filter by Set</label>
        <select
          value={selectedSet || ''}
          onChange={(e) => setSelectedSet(e.target.value || null)}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 min-h-[44px] text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Sets</option>
          {sets.map(set => (
            <option key={set} value={set}>{set}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {precons.map(deck => (
          <button
            key={deck.id}
            onClick={() => setSelectedDeck(deck)}
            className={`w-full text-left p-3 min-h-[44px] rounded-lg border transition-colors ${
              selectedDeck?.id === deck.id
                ? 'bg-purple-600/30 border-purple-500'
                : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-white truncate">{deck.name}</div>
                <div className="text-sm text-slate-400 truncate">{deck.set}</div>
              </div>
              <ColorIndicator colors={deck.colors} />
            </div>
            <div className="text-xs text-slate-500 mt-1">MSRP: ${deck.msrp}</div>
          </button>
        ))}
      </div>

      {customDecks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-1">
            <Star className="w-4 h-4" />
            Custom Decks
          </h3>
          <div className="space-y-2">
            {customDecks.map(deck => (
              <button
                key={deck.id}
                onClick={() => setSelectedDeck(deck)}
                className={`w-full text-left p-3 min-h-[44px] rounded-lg border transition-colors ${
                  selectedDeck?.id === deck.id
                    ? 'bg-purple-600/30 border-purple-500'
                    : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                }`}
              >
                <div className="font-medium text-white truncate">{deck.name}</div>
                <div className="text-xs text-slate-500 mt-1">MSRP: ${deck.msrp}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
