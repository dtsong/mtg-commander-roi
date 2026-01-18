import { getCardImage, getCardPrice } from '@/lib/scryfall';
import { formatCurrency } from '@/lib/calculations';

export default function CardPriceRow({ card, rank }) {
  const imageUrl = getCardImage(card);
  const price = getCardPrice(card);

  return (
    <div className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
      {rank && (
        <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
          {rank}
        </span>
      )}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={card.name}
          className="w-10 h-14 rounded object-cover"
          loading="lazy"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white truncate">{card.name}</div>
        <div className="text-xs text-slate-400">
          {card.set_name} #{card.collector_number}
        </div>
      </div>
      <div className="text-right">
        <div className={`font-bold ${price > 5 ? 'text-green-400' : 'text-white'}`}>
          {formatCurrency(price)}
        </div>
      </div>
    </div>
  );
}
