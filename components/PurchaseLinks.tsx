import { memo } from 'react';
import { ExternalLink } from 'lucide-react';
import { getTCGplayerUrl, getCardMarketUrl } from '@/lib/purchaseUrls';

interface PurchaseLinksProps {
  cardName: string;
  tcgplayerId?: number;
  cardmarketId?: number;
}

function PurchaseLinks({ cardName, tcgplayerId, cardmarketId }: PurchaseLinksProps) {
  const tcgplayerUrl = getTCGplayerUrl(cardName, tcgplayerId);
  const cardmarketUrl = getCardMarketUrl(cardName, cardmarketId);

  if (!tcgplayerUrl && !cardmarketUrl) return null;

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {tcgplayerUrl && (
      <a
        href={tcgplayerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2 py-1 min-h-[44px] min-w-[44px] text-xs bg-slate-600 hover:bg-green-600 text-slate-300 hover:text-white rounded transition-colors flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        aria-label={tcgplayerId ? `View ${cardName} on TCGplayer` : `Search ${cardName} on TCGplayer`}
      >
        TCG
        <ExternalLink className="w-3 h-3" aria-hidden="true" />
      </a>
      )}
      {cardmarketUrl && (
      <a
        href={cardmarketUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2 py-1 min-h-[44px] min-w-[44px] text-xs bg-slate-600 hover:bg-blue-600 text-slate-300 hover:text-white rounded transition-colors flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        aria-label={cardmarketId ? `View ${cardName} on CardMarket` : `Search ${cardName} on CardMarket`}
      >
        CM
        <ExternalLink className="w-3 h-3" aria-hidden="true" />
      </a>
      )}
    </div>
  );
}

export default memo(PurchaseLinks);
