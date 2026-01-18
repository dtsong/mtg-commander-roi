'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { loadTrendingData, findTrendingInPrecons, formatTrendingAge } from '@/lib/trending';
import type { TrendingData, TrendingInPrecons } from '@/types';

export default function TrendingCards() {
  const [trendingData, setTrendingData] = useState<TrendingData | null>(null);
  const [trendingInPrecons, setTrendingInPrecons] = useState<TrendingInPrecons[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [data, inPrecons] = await Promise.all([
        loadTrendingData(),
        findTrendingInPrecons(),
      ]);
      setTrendingData(data);
      setTrendingInPrecons(inPrecons);
      setLoading(false);
    };
    loadData();
  }, []);

  const preconsByCardName = useMemo(() => {
    const map = new Map<string, TrendingInPrecons>();
    for (const item of trendingInPrecons) {
      map.set(item.card.name.toLowerCase(), item);
    }
    return map;
  }, [trendingInPrecons]);

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center gap-2 text-white mb-4">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold">Trending Cards</h3>
        </div>
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500" />
          <span className="ml-3 text-slate-400 text-sm">Loading trending data...</span>
        </div>
      </div>
    );
  }

  if (!trendingData?.trendingCards?.length) {
    return null;
  }

  const displayCards = expanded
    ? trendingData.trendingCards
    : trendingData.trendingCards.slice(0, 5);

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Trending on EDHREC</h3>
        </div>
        {trendingData.updatedAt && (
          <span className="text-xs text-slate-500">
            {formatTrendingAge(trendingData.updatedAt)}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {displayCards.map((card, index) => {
          const inPrecons = preconsByCardName.get(card.name.toLowerCase());

          return (
            <div
              key={card.name}
              className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-green-600/20 text-green-400 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <div>
                  <a
                    href={`https://edhrec.com${card.url || `/cards/${card.sanitized}`}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-purple-400 transition-colors flex items-center gap-1"
                  >
                    {card.name}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                  {inPrecons && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {inPrecons.decks.slice(0, 3).map(deck => (
                        <Link
                          key={deck.id}
                          href={`/deck/${deck.id}`}
                          className="text-xs px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded hover:bg-purple-600/50 transition-colors"
                        >
                          {deck.name}
                        </Link>
                      ))}
                      {inPrecons.decks.length > 3 && (
                        <span className="text-xs px-2 py-0.5 text-slate-400">
                          +{inPrecons.decks.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {inPrecons && (
                <span className="text-xs px-2 py-1 bg-green-600/20 text-green-400 rounded">
                  In {inPrecons.decks.length} precon{inPrecons.decks.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {trendingData.trendingCards.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 flex items-center justify-center gap-1 text-sm text-slate-400 hover:text-white transition-colors py-2"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show all {trendingData.trendingCards.length} trending cards
            </>
          )}
        </button>
      )}
    </div>
  );
}
