'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import DeckComparisonTable from '@/components/DeckComparisonTable';
import TrendingCards from '@/components/TrendingCards';
import { PRECON_DATABASE, getDeckCards } from '@/lib/precons';
import { loadStaticPrices, fetchDeckPrices } from '@/lib/scryfall';
import { getCachedPrice, setCachedPrice, clearCache, formatStaticPriceAge } from '@/lib/priceCache';
import type { PreconDeck, CachedPriceData } from '@/types';

export default function ComparePage() {
  const [priceData, setPriceData] = useState<Record<string, CachedPriceData>>({});
  const [loadingDeck, setLoadingDeck] = useState<string | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [staticUpdatedAt, setStaticUpdatedAt] = useState<string | null>(null);
  const [loadingStatic, setLoadingStatic] = useState(true);

  useEffect(() => {
    const loadPrices = async () => {
      const staticData = await loadStaticPrices();

      if (staticData?.decks) {
        setStaticUpdatedAt(staticData.updatedAt);
        const pricesFromStatic: Record<string, CachedPriceData> = {};

        PRECON_DATABASE.forEach(deck => {
          const deckData = staticData.decks[deck.id];
          if (deckData) {
            const topCards = deckData.cards
              .filter(c => c.usd)
              .slice(0, 5)
              .map(card => ({
                name: card.name,
                price: parseFloat(card.usd || '0'),
              }));

            pricesFromStatic[deck.id] = {
              totalValue: deckData.totalValue,
              topCards,
              cardCount: deckData.cardCount,
              fetchedAt: staticData.updatedAt,
            };
          }
        });

        setPriceData(pricesFromStatic);
      } else {
        const cached: Record<string, CachedPriceData> = {};
        PRECON_DATABASE.forEach(deck => {
          const data = getCachedPrice(deck.id);
          if (data) {
            cached[deck.id] = data;
          }
        });
        setPriceData(cached);
      }

      setLoadingStatic(false);
    };

    loadPrices();
  }, []);

  const fetchDeckPrice = useCallback(async (deck: PreconDeck) => {
    setLoadingDeck(deck.id);

    try {
      const deckCards = await getDeckCards(deck.id);
      if (!deckCards.length) {
        console.warn(`No deck list found for ${deck.name}`);
        return;
      }

      const priceResult = await fetchDeckPrices(deckCards);

      const data: Omit<CachedPriceData, 'fetchedAt'> = {
        totalValue: priceResult.totalValue,
        topCards: priceResult.topCards.map(c => ({
          name: c.name,
          price: c.total,
        })),
        cardCount: priceResult.cardCount,
      };

      setCachedPrice(deck.id, data);

      setPriceData(prev => ({
        ...prev,
        [deck.id]: {
          ...data,
          fetchedAt: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error(`Failed to load prices for ${deck.name}:`, error);
    } finally {
      setLoadingDeck(null);
    }
  }, []);

  const handleRefreshAll = async () => {
    setRefreshingAll(true);

    for (const deck of PRECON_DATABASE) {
      await fetchDeckPrice(deck);
    }

    setRefreshingAll(false);
  };

  const handleClearCache = () => {
    clearCache();
    setPriceData({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </Link>
              <div className="h-6 w-px bg-slate-600" />
              <div>
                <h1 className="text-xl font-bold text-white">Deck Comparison</h1>
                <p className="text-sm text-slate-400">
                  Compare all {PRECON_DATABASE.length} precon decks by ROI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {staticUpdatedAt && (
                <span className="text-sm text-slate-400">
                  Updated: {formatStaticPriceAge(staticUpdatedAt)}
                </span>
              )}

              {!staticUpdatedAt && (
                <button
                  onClick={handleRefreshAll}
                  disabled={refreshingAll || !!loadingDeck || loadingStatic}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    refreshingAll || loadingDeck || loadingStatic
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {refreshingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {refreshingAll ? 'Loading All...' : 'Fetch Prices'}
                </button>
              )}

              <button
                onClick={handleClearCache}
                disabled={refreshingAll || !!loadingDeck || loadingStatic}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-1">
            <TrendingCards />
          </div>
          <div className="lg:col-span-3">
            <DeckComparisonTable
              decks={PRECON_DATABASE}
              priceData={priceData}
              loadingDeck={loadingDeck}
              onLoadPrice={fetchDeckPrice}
              onRefreshPrice={fetchDeckPrice}
            />
          </div>
        </div>

        <footer className="mt-8 pt-6 border-t border-slate-700 text-center text-sm text-slate-500">
          Card data and prices provided by{' '}
          <a
            href="https://scryfall.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300"
          >
            Scryfall
          </a>
          . Prices update daily.
        </footer>
      </main>
    </div>
  );
}
