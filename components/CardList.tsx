import { useMemo } from 'react';
import { List, Package } from 'lucide-react';
import CardPriceRow from './CardPriceRow';
import { sortCardsByValue } from '@/lib/calculations';

interface CardListCard {
  id?: string;
  name: string;
  quantity?: number;
  price?: number | null;
  total?: number | null;
  lowestListing?: number | null;
}

interface CardListProps {
  cards: CardListCard[];
  loading: boolean;
}

export default function CardList({ cards, loading }: CardListProps) {
  const sortedCards = useMemo(
    () => sortCardsByValue(cards) as CardListCard[],
    [cards]
  );

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <List className="w-5 h-5" />
          All Cards
        </h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-slate-400">Loading cards...</span>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <List className="w-5 h-5" />
          All Cards
        </h3>
        <div className="text-center py-8">
          <Package className="w-8 h-8 mx-auto text-slate-500 mb-2" />
          <p className="text-slate-400">No cards loaded</p>
          <p className="text-sm text-slate-500 mt-1">
            Select a deck from the sidebar to view its cards
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <List className="w-5 h-5" />
        All Cards ({cards.length})
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {sortedCards.map(card => (
          <div key={card.name} style={{ contentVisibility: 'auto', containIntrinsicSize: '0 48px' }}>
            <CardPriceRow card={card} />
          </div>
        ))}
      </div>
    </div>
  );
}
