'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import DeckSelector from '@/components/DeckSelector';
import ROISummary from '@/components/ROISummary';
import CardSearch from '@/components/CardSearch';
import BulkImport from '@/components/BulkImport';
import CardList from '@/components/CardList';
import TopValueCards from '@/components/TopValueCards';
import { useToast } from '@/components/ui/ToastProvider';
import { useUrlState } from '@/hooks/useUrlState';

const AddDeckModal = dynamic(() => import('@/components/AddDeckModal'));
import { fetchDeckPrices, getCardPrice, mergeLowestListings, loadLowestListings } from '@/lib/scryfall';
import { getDeckCards, PRECON_DATABASE } from '@/lib/precons';
import { calculateTotalValue } from '@/lib/calculations';
import type { PreconDeck, CardWithPrice, ScryfallCard } from '@/types';

const URL_DEFAULTS = {
  year: null as number | null,
  set: null as string | null,
  deck: null as string | null,
};

function HomeContent() {
  const [selectedYear, setSelectedYear] = useState<number | null>(2026);
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<PreconDeck | null>(null);
  const [cards, setCards] = useState<CardWithPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customDecks, setCustomDecks] = useState<PreconDeck[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const { setParams } = useUrlState({
    defaults: URL_DEFAULTS,
    onUrlChange: useCallback((params: typeof URL_DEFAULTS) => {
      // Only apply URL state on initial load
      if (isInitialized) return;

      if (params.year !== null) {
        setSelectedYear(params.year);
      }
      if (params.set !== null) {
        setSelectedSet(params.set);
      }
      if (params.deck !== null) {
        const deck = PRECON_DATABASE.find((d) => d.id === params.deck);
        if (deck) {
          setSelectedDeck(deck);
        }
      }
      setIsInitialized(true);
    }, [isInitialized]),
  });

  const totalValue = calculateTotalValue(cards);

  const loadDeckCards = useCallback(async (deck: PreconDeck) => {
    if (!deck?.id) return;

    setLoading(true);
    setError(null);
    setCards([]);

    try {
      // Start loading lowest listings early (runs in parallel with price fetch)
      const listingsPromise = loadLowestListings();

      const deckCards = await getDeckCards(deck.id);
      if (!deckCards.length) {
        const errorMsg = `No deck list found for "${deck.name}"`;
        setError(errorMsg);
        toast(errorMsg, 'error');
        setLoading(false);
        return;
      }
      const priceResult = await fetchDeckPrices(deckCards);
      await listingsPromise; // Ensure listings are loaded before merging
      const cardsWithListings = await mergeLowestListings(priceResult.cards);
      setCards(cardsWithListings);
      toast(`Loaded ${cardsWithListings.length} cards for "${deck.name}"`, 'success');
    } catch (err) {
      const errorMsg = `Failed to load prices for "${deck.name}"`;
      setError(errorMsg);
      toast(errorMsg, 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedDeck) {
      loadDeckCards(selectedDeck);
    }
  }, [selectedDeck, loadDeckCards]);

  // Sync state changes to URL
  const handleYearChange = useCallback((year: number | null) => {
    setSelectedYear(year);
    setSelectedSet(null);
    setParams({ year, set: null, deck: selectedDeck?.id ?? null });
  }, [setParams, selectedDeck?.id]);

  const handleSetChange = useCallback((set: string | null) => {
    setSelectedSet(set);
    setParams({ year: selectedYear, set, deck: selectedDeck?.id ?? null });
  }, [setParams, selectedYear, selectedDeck?.id]);

  const handleDeckChange = useCallback((deck: PreconDeck) => {
    setSelectedDeck(deck);
    setParams({ year: selectedYear, set: selectedSet, deck: deck.id });
  }, [setParams, selectedYear, selectedSet]);

  const scryfallToCardWithPrice = (card: ScryfallCard): CardWithPrice => {
    const price = getCardPrice(card);
    return {
      name: card.name,
      quantity: 1,
      price,
      total: price,
      image: card.image_uris?.normal || null,
    };
  };

  const handleAddCard = (card: ScryfallCard) => {
    setCards(prev => [...prev, scryfallToCardWithPrice(card)]);
  };

  const handleBulkImport = (importedCards: ScryfallCard[]) => {
    setCards(prev => [...prev, ...importedCards.map(scryfallToCardWithPrice)]);
  };

  const handleAddCustomDeck = (deck: PreconDeck) => {
    setCustomDecks(prev => [...prev, deck]);
    setSelectedDeck(deck);
    setCards([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header onAddDeck={() => setShowAddModal(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg" role="alert">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 font-medium">{error}</p>
                <p className="text-red-400/80 text-sm mt-1">
                  Check your connection and try again
                </p>
              </div>
              {selectedDeck && (
                <button
                  onClick={() => loadDeckCards(selectedDeck)}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500/30 hover:bg-red-500/40 text-red-200 rounded-lg transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                  Retry
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <DeckSelector
              selectedYear={selectedYear}
              setSelectedYear={handleYearChange}
              selectedSet={selectedSet}
              setSelectedSet={handleSetChange}
              selectedDeck={selectedDeck}
              setSelectedDeck={handleDeckChange}
              customDecks={customDecks}
            />
          </div>

          <div className="lg:col-span-8 space-y-6">
            <ROISummary
              deck={selectedDeck}
              totalValue={totalValue}
              loading={loading}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CardSearch onAddCard={handleAddCard} />
              <BulkImport onImport={handleBulkImport} />
            </div>

            <TopValueCards cards={cards} loading={loading} totalValue={totalValue} />

            <CardList cards={cards} loading={loading} />
          </div>
        </div>

        <footer className="mt-8 pt-6 border-t border-slate-700 text-center text-sm text-slate-500">
          Card data and prices provided by{' '}
          <a
            href="https://scryfall.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
          >
            Scryfall
          </a>
          . Prices update daily.
        </footer>
      </main>

      <AddDeckModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCustomDeck}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-slate-800/50 border-b border-slate-700 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto h-10" />
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="animate-pulse">
          <div className="h-96 bg-slate-800/50 rounded-xl" />
        </div>
      </main>
    </div>
  );
}
