'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search, Plus, X } from 'lucide-react';
import { searchCards, getCardImage, getCardPrice } from '@/lib/scryfall';
import { formatCurrency } from '@/lib/calculations';
import { useToast } from '@/components/ui/ToastProvider';
import type { ScryfallCard } from '@/types';

interface CardSearchProps {
  onAddCard: (card: ScryfallCard) => void;
}

export default function CardSearch({ onAddCard }: CardSearchProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (query.length < 2) return;

    setLoading(true);
    setError(null);
    try {
      const cards = await searchCards(query);
      setResults(cards.slice(0, 10));
    } catch {
      setError('Failed to search cards');
      setResults([]);
      toast('Card search failed — please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearResults = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Search className="w-5 h-5" />
        Search Cards
      </h3>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by card name..."
            aria-label="Search cards by name"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 min-h-[44px] text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {query && (
            <button
              onClick={clearResults}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || query.length < 2}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white px-4 py-2 min-h-[44px] rounded-lg transition-colors"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.map(card => (
            <div
              key={card.id}
              className="flex items-center gap-3 p-3 min-h-[44px] bg-slate-700/30 rounded-lg"
            >
              {getCardImage(card) && (
                <Image
                  src={getCardImage(card) || ''}
                  alt={card.name}
                  width={32}
                  height={44}
                  className="rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{card.name}</div>
                <div className="text-xs text-slate-400">{card.set_name}</div>
              </div>
              <div className="text-sm font-medium text-white flex-shrink-0">
                {formatCurrency(getCardPrice(card))}
              </div>
              <button
                onClick={() => onAddCard(card)}
                className="p-2 min-w-[44px] min-h-[44px] bg-green-600 hover:bg-green-700 rounded-lg text-white flex items-center justify-center flex-shrink-0"
                title="Add to deck"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
