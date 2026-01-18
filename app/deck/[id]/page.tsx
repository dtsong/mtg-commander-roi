'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getPreconById, getDeckCards } from '@/lib/precons';
import { getStaticDeckPrices, fetchDeckPrices } from '@/lib/scryfall';
import ColorIndicator from '@/components/ColorIndicator';
import ROISummary from '@/components/ROISummary';
import TopValueCards from '@/components/TopValueCards';
import CardList from '@/components/CardList';
import type { PreconDeck, CardWithPrice } from '@/types';

interface FormattedCard extends CardWithPrice {
  id: string;
}

export default function DeckDetailPage() {
  const params = useParams<{ id: string }>();
  const [deck, setDeck] = useState<PreconDeck | null>(null);
  const [cards, setCards] = useState<FormattedCard[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchSource, setFetchSource] = useState<string | null>(null);
  const [excludedCount, setExcludedCount] = useState(0);

  useEffect(() => {
    const loadDeckData = async () => {
      const deckInfo = getPreconById(params.id);
      if (!deckInfo) {
        setError('Deck not found');
        setLoading(false);
        return;
      }
      setDeck(deckInfo);

      const deckPrices = await getStaticDeckPrices(params.id);

      if (deckPrices) {
        setFetchSource('static');
        const formattedCards: FormattedCard[] = deckPrices.cards.map((card, index) => ({
          id: `${card.name}-${index}`,
          name: card.name,
          quantity: card.quantity,
          price: card.price,
          total: card.total,
        }));
        const cardsWithoutPrice = formattedCards.filter(c => c.price === 0 || c.price === null);
        setExcludedCount(cardsWithoutPrice.length);
        setCards(formattedCards);
        setTotalValue(deckPrices.totalValue);
        setLoading(false);
        return;
      }

      const deckCards = await getDeckCards(params.id);
      if (!deckCards || deckCards.length === 0) {
        setError('No decklist available for this deck');
        setLoading(false);
        return;
      }

      try {
        setFetchSource('live');
        const liveData = await fetchDeckPrices(deckCards);
        const formattedCards: FormattedCard[] = liveData.cards.map((card, index) => ({
          id: `${card.name}-${index}`,
          name: card.name,
          quantity: card.quantity,
          price: card.price,
          total: card.total,
        }));
        const cardsWithoutPrice = formattedCards.filter(c => c.price === 0 || c.price === null);
        setExcludedCount(cardsWithoutPrice.length);
        setCards(formattedCards);
        setTotalValue(liveData.totalValue);
      } catch (err) {
        setError('Failed to fetch card prices from Scryfall');
      }

      setLoading(false);
    };

    loadDeckData();
  }, [params.id]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <Link
            href="/compare"
            className="text-purple-400 hover:text-purple-300 flex items-center gap-2 justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Compare
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-slate-800/50 border-b border-slate-700 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/compare"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>
            <div className="h-6 w-px bg-slate-600" />
            {deck ? (
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-bold text-white">{deck.name}</h1>
                  <p className="text-sm text-slate-400">{deck.set} ({deck.year})</p>
                </div>
                <ColorIndicator colors={deck.colors} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                <span className="text-slate-400">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        <ROISummary deck={deck} totalValue={totalValue} loading={loading} excludedCount={excludedCount} />
        <TopValueCards cards={cards} loading={loading} />
        <CardList cards={cards} loading={loading} />

        <footer className="pt-6 border-t border-slate-700 text-center text-sm text-slate-500">
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
