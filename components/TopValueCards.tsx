import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import CardPriceRow from './CardPriceRow';
import { getTopValueCards } from '@/lib/calculations';
import { SkeletonCard } from './ui/Skeleton';

const TOP_CARDS_COUNT = 5;

interface TopValueCardsCard {
  id?: string;
  name: string;
  quantity?: number;
  price?: number | null;
  total?: number | null;
  lowestListing?: number | null;
}

interface TopValueCardsProps {
  cards: TopValueCardsCard[];
  loading: boolean;
  totalValue?: number;
}

export default function TopValueCards({ cards, loading, totalValue = 0 }: TopValueCardsProps) {
  const topCards = useMemo(
    () => getTopValueCards(cards, TOP_CARDS_COUNT) as TopValueCardsCard[],
    [cards]
  );

  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2 text-balance">
          <Trophy className="w-5 h-5 text-yellow-400" aria-hidden="true" />
          Top {TOP_CARDS_COUNT} Most Valuable Cards
        </h3>
        <p className="text-sm text-slate-400 mb-4">Highest value singles in this deck</p>
        <div className="space-y-2">
          {Array.from({ length: TOP_CARDS_COUNT }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2 text-balance">
        <Trophy className="w-5 h-5 text-yellow-400" aria-hidden="true" />
        Top {TOP_CARDS_COUNT} Most Valuable Cards
      </h3>
      <p className="text-sm text-slate-400 mb-4">Highest value singles in this deck</p>
      <div className="space-y-2">
        {topCards.map((card, index) => {
          const cardValue = card.total ?? card.price ?? 0;
          const percentage = totalValue > 0 ? (cardValue / totalValue) * 100 : 0;
          return (
            <div key={card.name} className="relative">
              <CardPriceRow card={card} rank={index + 1} />
              {totalValue > 0 && percentage >= 1 && (
                <span className="absolute top-3 right-24 text-xs text-slate-400 tabular-nums">
                  {percentage.toFixed(0)}% of total
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
