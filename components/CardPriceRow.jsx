import { formatCurrency } from '@/lib/calculations';

export default function CardPriceRow({ card, rank }) {
  const rawPrice = card.price ?? card.total;
  const hasPriceData = rawPrice !== null && rawPrice !== undefined && rawPrice !== 0;
  const price = rawPrice ?? 0;
  const quantity = card.quantity ?? 1;
  const showQuantity = quantity > 1;

  return (
    <div className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
      {rank && (
        <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
          {rank}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white truncate">
          {showQuantity && <span className="text-slate-400 mr-1">{quantity}x</span>}
          {card.name}
        </div>
        {showQuantity && hasPriceData && (
          <div className="text-xs text-slate-400">
            {formatCurrency(card.price ?? 0)} each
          </div>
        )}
      </div>
      <div className="text-right">
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
