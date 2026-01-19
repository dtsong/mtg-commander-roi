'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getPreconById, getDeckCards } from '@/lib/precons';
import { getStaticDeckPrices, fetchDeckPrices, getCardByName, getCardImage, mergeLowestListings } from '@/lib/scryfall';
import ColorIndicator from '@/components/ColorIndicator';
import ROISummary from '@/components/ROISummary';
import TopValueCards from '@/components/TopValueCards';
import CardList from '@/components/CardList';
import type { PreconDeck, CardWithPrice } from '@/types';

interface FormattedCard extends CardWithPrice {
  id: string;
  isCommander?: boolean;
  lowestListing?: number | null;
}

export default function DeckContent({ deckId }: { deckId: string }) {
  const [deck, setDeck] = useState<PreconDeck | null>(null);
  const [cards, setCards] = useState<FormattedCard[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setFetchSource] = useState<string | null>(null);
  const [excludedCount, setExcludedCount] = useState(0);
  const [commanderImage, setCommanderImage] = useState<string | null>(null);

  useEffect(() => {
    const loadDeckData = async () => {
      const deckInfo = getPreconById(deckId);
      if (!deckInfo) {
        setError('Deck not found');
        setLoading(false);
        return;
      }
      setDeck(deckInfo);

      const deckPrices = await getStaticDeckPrices(deckId);

      if (deckPrices) {
        setFetchSource('static');
        const cardsWithListings = await mergeLowestListings(deckPrices.cards);
        const formattedCards: FormattedCard[] = cardsWithListings.map((card, index) => ({
          id: `${card.name}-${index}`,
          name: card.name,
          quantity: card.quantity,
          price: card.price,
          total: card.total,
          isCommander: card.isCommander,
          lowestListing: card.lowestListing,
        }));
        const cardsWithoutPrice = formattedCards.filter(c => c.price === 0 || c.price === null);
        setExcludedCount(cardsWithoutPrice.length);
        setCards(formattedCards);
        setTotalValue(deckPrices.totalValue);
        setLoading(false);

        const commanderCard = formattedCards.find(c => c.isCommander) || formattedCards[0];
        if (commanderCard) {
          getCardByName(commanderCard.name).then(commander => {
            if (commander) setCommanderImage(getCardImage(commander));
          });
        }
        return;
      }

      const deckCards = await getDeckCards(deckId);
      if (!deckCards || deckCards.length === 0) {
        setError('No decklist available for this deck');
        setLoading(false);
        return;
      }

      try {
        setFetchSource('live');
        const liveData = await fetchDeckPrices(deckCards);
        const cardsWithListings = await mergeLowestListings(liveData.cards);
        const formattedCards: FormattedCard[] = cardsWithListings.map((card, index) => ({
          id: `${card.name}-${index}`,
          name: card.name,
          quantity: card.quantity,
          price: card.price,
          total: card.total,
          isCommander: card.isCommander,
          lowestListing: card.lowestListing,
        }));
        const cardsWithoutPrice = formattedCards.filter(c => c.price === 0 || c.price === null);
        setExcludedCount(cardsWithoutPrice.length);
        setCards(formattedCards);
        setTotalValue(liveData.totalValue);

        const commanderCard = liveData.cards.find(c => c.isCommander);
        if (commanderCard?.image) {
          setCommanderImage(commanderCard.image);
        } else if (liveData.cards.length > 0 && liveData.cards[0].image) {
          setCommanderImage(liveData.cards[0].image);
        }
      } catch {
        setError('Failed to fetch card prices from Scryfall');
      }

      setLoading(false);
    };

    loadDeckData();
  }, [deckId]);

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
      <header className="bg-slate-800/50 border-b border-slate-700 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/compare"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors min-h-[44px]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="h-6 w-px bg-slate-600" />
            {deck ? (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-bold text-white truncate">{deck.name}</h1>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {commanderImage && (
            <div className="flex-shrink-0 flex flex-col items-center sm:items-start">
              <Image
                src={commanderImage}
                alt={`${deck?.name} Commander`}
                width={192}
                height={268}
                className="rounded-lg shadow-lg shadow-purple-500/20 border border-slate-600"
              />
              <p className="text-xs text-slate-500 text-center mt-2">Face Commander</p>
            </div>
          )}
          <div className="flex-1">
            <ROISummary deck={deck} totalValue={totalValue} loading={loading} excludedCount={excludedCount} />
          </div>
        </div>
        <TopValueCards cards={cards} loading={loading} />
        <CardList cards={cards} loading={loading} />

        <footer className="pt-6 border-t border-slate-700 text-center text-sm text-slate-500">
          <p>
            Card data provided by{' '}
            <a
              href="https://scryfall.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              Scryfall
            </a>
            . Market prices update daily.
          </p>
          <p className="mt-1">
            All prices shown are for{' '}
            <Link
              href="/blog/understanding-card-conditions"
              className="text-purple-400 hover:text-purple-300"
            >
              Near Mint (NM)
            </Link>
            {' '}condition.
          </p>
        </footer>
      </main>
    </div>
  );
}
