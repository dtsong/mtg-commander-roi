import { memo } from 'react';
import { ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

interface CardPriceRowCard {
  name: string;
  quantity?: number;
  price?: number | null;
  total?: number | null;
}

interface CardPriceRowProps {
  card: CardPriceRowCard;
  rank?: number;
}

function CardPriceRow({ card, rank }: CardPriceRowProps) {
  const rawPrice = card.price ?? card.total;
  const hasPriceData = rawPrice !== null && rawPrice !== undefined && rawPrice !== 0;
  const price = rawPrice ?? 0;
  const quantity = card.quantity ?? 1;
  const showQuantity = quantity > 1;

  const scryfallUrl = `https://scryfall.com/search?q=!"${encodeURIComponent(card.name)}"`;
  const tcgPlayerUrl = `https://www.tcgplayer.com/search/magic/product?q=${encodeURIComponent(card.name)}`;

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
          <a
            href={tcgPlayerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 px-2 py-1 text-xs bg-slate-600 hover:bg-green-600 text-slate-300 hover:text-white rounded transition-colors flex items-center gap-1 flex-shrink-0"
            title="Search on TCGPlayer"
          >
            TCG
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        {showQuantity && hasPriceData && (
          <div className="text-xs text-slate-400">
            {formatCurrency(card.price ?? 0)} each
          </div>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        {hasPriceData ? (
          <div className={`font-bold ${price > 5 ? 'text-green-400' : 'text-white'}`}>
            {formatCurrency(price)}
          </div>
        ) : (
          <div className="text-slate-500 text-sm">N/A</div>
        )}
      </div>
    </div>
  );
}

export default memo(CardPriceRow);
