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

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <a
        href={tcgplayerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2 py-1 min-h-[44px] min-w-[44px] text-xs bg-slate-600 hover:bg-green-600 text-slate-300 hover:text-white rounded transition-colors flex items-center justify-center gap-1"
        title={tcgplayerId ? 'View on TCGplayer' : 'Search on TCGplayer'}
      >
        TCG
        <ExternalLink className="w-3 h-3" />
      </a>
      <a
        href={cardmarketUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2 py-1 min-h-[44px] min-w-[44px] text-xs bg-slate-600 hover:bg-blue-600 text-slate-300 hover:text-white rounded transition-colors flex items-center justify-center gap-1"
        title={cardmarketId ? 'View on CardMarket' : 'Search on CardMarket'}
      >
        CM
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

export default memo(PurchaseLinks);
