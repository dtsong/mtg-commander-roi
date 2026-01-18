'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import DeckSelector from '@/components/DeckSelector';
import ROISummary from '@/components/ROISummary';
import CardSearch from '@/components/CardSearch';
import BulkImport from '@/components/BulkImport';
import CardList from '@/components/CardList';
import TopValueCards from '@/components/TopValueCards';
import AddDeckModal from '@/components/AddDeckModal';
import { loadSetCards } from '@/lib/scryfall';
import { calculateTotalValue } from '@/lib/calculations';

export default function Home() {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customDecks, setCustomDecks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const totalValue = calculateTotalValue(cards);

  const loadDeckCards = useCallback(async (deck) => {
    if (!deck?.setCode) return;

    setLoading(true);
    setError(null);
    setCards([]);

    try {
      const loadedCards = await loadSetCards(deck.setCode, (progress) => {
        console.log(`Loaded ${progress.loaded} cards...`);
      });
      setCards(loadedCards);
    } catch (err) {
      setError('Failed to load cards from Scryfall');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDeck) {
      loadDeckCards(selectedDeck);
    }
  }, [selectedDeck, loadDeckCards]);

  const handleAddCard = (card) => {
    setCards(prev => [...prev, card]);
  };

  const handleBulkImport = (importedCards) => {
    setCards(prev => [...prev, ...importedCards]);
  };

  const handleAddCustomDeck = (deck) => {
    setCustomDecks(prev => [...prev, deck]);
    setSelectedDeck(deck);
    setCards([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header onAddDeck={() => setShowAddModal(true)} />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4">
            <DeckSelector
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedDeck={selectedDeck}
              setSelectedDeck={setSelectedDeck}
              customDecks={customDecks}
            />
          </div>

          <div className="col-span-8 space-y-6">
            <ROISummary
              deck={selectedDeck}
              totalValue={totalValue}
              loading={loading}
            />

            <div className="grid grid-cols-2 gap-6">
              <CardSearch onAddCard={handleAddCard} />
              <BulkImport onImport={handleBulkImport} />
            </div>

            <TopValueCards cards={cards} loading={loading} />

            <CardList cards={cards} loading={loading} />
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

      <AddDeckModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCustomDeck}
      />
    </div>
  );
}
