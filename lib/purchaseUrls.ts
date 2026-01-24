import type { PurchaseUrls } from '@/types';

function isValidCardName(name: string): boolean {
  if (!name || name.length > 200) return false;
  if (/<|>|javascript:/i.test(name)) return false;
  return true;
}

/**
 * Get TCGplayer URL for a card.
 * Uses direct product link if ID available, otherwise falls back to search.
 */
export function getTCGplayerUrl(cardName: string, tcgplayerId?: number): string | null {
  if (!isValidCardName(cardName) && !tcgplayerId) return null;
  if (tcgplayerId) {
    return `https://www.tcgplayer.com/product/${tcgplayerId}`;
  }
  return `https://www.tcgplayer.com/search/magic/product?q=${encodeURIComponent(cardName)}`;
}

/**
 * Get CardMarket URL for a card.
 * Uses direct product link if ID available, otherwise falls back to search.
 */
export function getCardMarketUrl(cardName: string, cardmarketId?: number): string | null {
  if (!isValidCardName(cardName) && !cardmarketId) return null;
  if (cardmarketId) {
    return `https://www.cardmarket.com/en/Magic/Products/Singles/${cardmarketId}`;
  }
  // CardMarket search uses + for spaces
  const searchName = cardName.replace(/'/g, '').replace(/,/g, '').replace(/\s+/g, '+');
  return `https://www.cardmarket.com/en/Magic/Cards?searchString=${encodeURIComponent(searchName)}`;
}

/**
 * Get all purchase URLs for a card.
 */
export function getPurchaseUrls(
  cardName: string,
  ids?: { tcgplayerId?: number; cardmarketId?: number }
): PurchaseUrls {
  return {
    tcgplayer: getTCGplayerUrl(cardName, ids?.tcgplayerId) ?? undefined,
    cardmarket: getCardMarketUrl(cardName, ids?.cardmarketId) ?? undefined,
  };
}
