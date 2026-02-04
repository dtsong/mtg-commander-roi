import { memo } from 'react';
import { Info } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';
import Link from 'next/link';
import PurchaseLinks from './PurchaseLinks';

interface CardPriceRowCard {
  name: string;
  quantity?: number;
  price?: number | null;
  total?: number | null;
  lowestListing?: number | null;
  tcgplayerId?: number;
  cardmarketId?: number;
  foilPrice?: number | null;
  isFoilOnly?: boolean;
}

interface CardPriceRowProps {
  card: CardPriceRowCard;
  rank?: number;
  showConditionInfo?: boolean;
}

function CardPriceRow({ card, rank, showConditionInfo = false }: CardPriceRowProps) {
  const rawPrice = card.price ?? card.total;
  const hasPriceData = rawPrice !== null && rawPrice !== undefined && rawPrice !== 0;
  const price = rawPrice ?? 0;
  const quantity = card.quantity ?? 1;
  const showQuantity = quantity > 1;

  const hasLowestListing = card.lowestListing !== null && card.lowestListing !== undefined;
  const lowestListing = card.lowestListing ?? 0;
  const savingsPercent = hasLowestListing && price > 0
    ? ((price - lowestListing) / price) * 100
    : 0;
  const hasSignificantSavings = savingsPercent >= 10;

  const isFoilOnly = card.isFoilOnly === true;
  const hasFoilPrice = card.foilPrice !== null && card.foilPrice !== undefined && card.foilPrice > 0;
  const foilPremiumPercent = hasFoilPrice && price > 0
    ? ((card.foilPrice! - price) / price) * 100
    : 0;
  const hasSignificantFoilPremium = foilPremiumPercent > 10;

  const scryfallUrl = `https://scryfall.com/search?q=!"${encodeURIComponent(card.name)}"`;

  return (
    <div className="flex items-center gap-3 p-3 min-h-[44px] bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
      {rank && (
        <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {rank}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white truncate flex items-center gap-1 flex-wrap">
          {showQuantity && <span className="text-slate-400 mr-1">{quantity}x</span>}
          <a
            href={scryfallUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400 transition-colors truncate"
            title="View on Scryfall"
          >
            {card.name}
          </a>
          <PurchaseLinks
            cardName={card.name}
            tcgplayerId={card.tcgplayerId}
            cardmarketId={card.cardmarketId}
          />
          {isFoilOnly && (
            <span className="text-[9px] px-1 py-0.5 bg-amber-900/50 text-amber-400 rounded font-medium whitespace-nowrap">
              FOIL ONLY
            </span>
          )}
        </div>
        {showQuantity && hasPriceData && (
          <div className="text-xs text-slate-400">
            {formatCurrency(card.price ?? 0)} each
          </div>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        {hasPriceData ? (
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className={`font-bold tabular-nums ${price > 5 ? 'text-green-400' : 'text-white'}`}>
                {formatCurrency(price)}
              </span>
              <span className={`text-[10px] px-1 py-0.5 rounded font-medium ${
                isFoilOnly
                  ? 'bg-amber-900/50 text-amber-400'
                  : 'bg-slate-600 text-slate-300'
              }`}>
                {isFoilOnly ? 'FOIL' : 'NM'}
              </span>
              {showConditionInfo && (
                <Link
                  href="/blog/understanding-card-conditions"
                  className="text-slate-500 hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
                  aria-label="Learn about card conditions"
                >
                  <Info className="w-3 h-3" aria-hidden="true" />
                </Link>
              )}
            </div>
            {hasFoilPrice && !isFoilOnly && (
              <div className="flex items-center gap-1 text-xs">
                <span className={`tabular-nums ${hasSignificantFoilPremium ? 'text-amber-400' : 'text-slate-400'}`}>
                  Foil: {formatCurrency(card.foilPrice!)}
                </span>
                {hasSignificantFoilPremium && (
                  <span className="text-amber-400 font-medium tabular-nums">
                    (+{foilPremiumPercent.toFixed(0)}%)
                  </span>
                )}
              </div>
            )}
            {hasLowestListing && lowestListing < price && (
              <div className="flex items-center gap-1 text-xs">
                <span className={`tabular-nums ${hasSignificantSavings ? 'text-yellow-400' : 'text-slate-400'}`}>
                  Low: {formatCurrency(lowestListing)}
                </span>
                {hasSignificantSavings && (
                  <span className="text-yellow-400 font-medium tabular-nums">
                    (-{savingsPercent.toFixed(0)}%)
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-slate-500 text-sm">N/A</div>
        )}
      </div>
    </div>
  );
}

export default memo(CardPriceRow);
