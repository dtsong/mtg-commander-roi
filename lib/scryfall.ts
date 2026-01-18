import type {
  ScryfallCard,
  DeckCardEntry,
  CardWithPrice,
  DeckPriceResult,
  LoadProgress,
  FetchProgress,
  StaticPricesData,
  StaticCardData,
} from '@/types';

const SCRYFALL_API = 'https://api.scryfall.com';
const RATE_LIMIT_MS = 100;
const MAX_RETRIES = 4;
let lastRequestTime = 0;

interface PriceInfo {
  name: string;
  price: number;
  image: string | null;
}

const sessionPriceCache = new Map<string, PriceInfo>();

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

interface ScryfallSearchResponse {
  data: ScryfallCard[];
  has_more: boolean;
  next_page?: string;
}

interface ScryfallCollectionResponse {
  data: ScryfallCard[];
  not_found?: { name: string }[];
}

const rateLimitedFetch = async <T>(url: string, retryCount: number = 0): Promise<T> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await sleep(RATE_LIMIT_MS - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });

  if (response.status === 429 && retryCount < MAX_RETRIES) {
    const delay = Math.pow(2, retryCount) * 1000;
    console.log(`Rate limited, retrying in ${delay}ms...`);
    await sleep(delay);
    return rateLimitedFetch<T>(url, retryCount + 1);
  }

  if (!response.ok) {
    throw new Error(`Scryfall API Error: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

let staticPricesCache: StaticPricesData | null = null;

export const loadStaticPrices = async (): Promise<StaticPricesData | null> => {
  if (staticPricesCache) return staticPricesCache;

  try {
    const response = await fetch('/data/prices.json');
    if (!response.ok) return null;
    staticPricesCache = await response.json() as StaticPricesData;
    return staticPricesCache;
  } catch {
    return null;
  }
};

export const getStaticSetPrices = async (setCode: string): Promise<StaticCardData[] | null> => {
  const data = await loadStaticPrices();
  if (!data?.sets?.[setCode]) return null;

  return data.sets[setCode].map(card => ({
    name: card.name,
    collector_number: card.collector_number,
    usd: card.usd,
  }));
};

interface StaticDeckPriceResult {
  totalValue: number;
  cardCount: number;
  cards: CardWithPrice[];
  topCards: CardWithPrice[];
}

export const getStaticDeckPrices = async (deckId: string): Promise<StaticDeckPriceResult | null> => {
  const data = await loadStaticPrices();
  if (!data?.decks?.[deckId]) return null;

  const deckData = data.decks[deckId];
  return {
    totalValue: deckData.totalValue,
    cardCount: deckData.cardCount,
    cards: deckData.cards.map(card => ({
      name: card.name,
      quantity: card.quantity,
      price: card.usd ? parseFloat(card.usd) : 0,
      total: card.usd ? parseFloat(card.usd) * card.quantity : 0,
    })),
    topCards: deckData.cards
      .filter(c => c.usd)
      .slice(0, 5)
      .map(card => ({
        name: card.name,
        quantity: card.quantity,
        price: card.usd ? parseFloat(card.usd) : 0,
        total: card.usd ? parseFloat(card.usd) * card.quantity : 0,
      })),
  };
};

export const loadSetCards = async (
  setCode: string,
  onProgress?: (progress: LoadProgress) => void
): Promise<ScryfallCard[]> => {
  let allCards: ScryfallCard[] = [];
  let url: string | null = `${SCRYFALL_API}/cards/search?q=set:${setCode}&unique=cards`;

  while (url) {
    const data: ScryfallSearchResponse = await rateLimitedFetch<ScryfallSearchResponse>(url);
    allCards = [...allCards, ...(data.data || [])];
    if (onProgress) {
      onProgress({ loaded: allCards.length, hasMore: data.has_more });
    }
    url = data.has_more ? data.next_page || null : null;
  }

  return allCards;
};

export const searchCards = async (query: string): Promise<ScryfallCard[]> => {
  if (!query || query.length < 2) return [];

  const encodedQuery = encodeURIComponent(query);
  const url = `${SCRYFALL_API}/cards/search?q=${encodedQuery}&unique=cards`;

  try {
    const data = await rateLimitedFetch<ScryfallSearchResponse>(url);
    return data.data || [];
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return [];
    }
    throw error;
  }
};

export const getCardByName = async (name: string): Promise<ScryfallCard | null> => {
  const encodedName = encodeURIComponent(name);
  const url = `${SCRYFALL_API}/cards/named?fuzzy=${encodedName}`;

  try {
    return await rateLimitedFetch<ScryfallCard>(url);
  } catch {
    return null;
  }
};

export const getCardImage = (card: ScryfallCard): string | null => {
  if (card.image_uris) {
    return card.image_uris.normal || card.image_uris.small || null;
  }
  if (card.card_faces && card.card_faces[0]?.image_uris) {
    return card.card_faces[0].image_uris.normal || card.card_faces[0].image_uris.small || null;
  }
  return null;
};

export const getCardPrice = (card: ScryfallCard): number => {
  const usd = parseFloat(card.prices?.usd || '0');
  const usdFoil = parseFloat(card.prices?.usd_foil || '0');
  return usd || usdFoil || 0;
};

export const fetchCardsPrices = async (
  cardList: DeckCardEntry[],
  onProgress?: (progress: FetchProgress) => void
): Promise<Map<string, PriceInfo>> => {
  const BATCH_SIZE = 75;
  const priceMap = new Map<string, PriceInfo>();
  const uncachedCards: DeckCardEntry[] = [];

  for (const card of cardList) {
    const cacheKey = card.setCode
      ? `${card.name.toLowerCase()}|${card.setCode.toLowerCase()}`
      : card.name.toLowerCase();
    const cached = sessionPriceCache.get(cacheKey);
    if (cached) {
      priceMap.set(card.name, cached);
    } else {
      uncachedCards.push(card);
    }
  }

  if (uncachedCards.length === 0) {
    if (onProgress) {
      onProgress({ fetched: cardList.length, total: cardList.length });
    }
    return priceMap;
  }

  const results: ScryfallCard[] = [];
  const identifiers = uncachedCards.map(card => {
    if (card.setCode) {
      return { name: card.name, set: card.setCode };
    }
    return { name: card.name };
  });

  for (let i = 0; i < identifiers.length; i += BATCH_SIZE) {
    const batch = identifiers.slice(i, i + BATCH_SIZE);

    const response = await fetch(`${SCRYFALL_API}/cards/collection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ identifiers: batch }),
    });

    if (!response.ok) {
      throw new Error(`Scryfall Collection API Error: ${response.status}`);
    }

    const data = await response.json() as ScryfallCollectionResponse;
    results.push(...(data.data || []));

    if (onProgress) {
      const cachedCount = cardList.length - uncachedCards.length;
      onProgress({ fetched: cachedCount + Math.min(i + BATCH_SIZE, identifiers.length), total: cardList.length });
    }

    if (i + BATCH_SIZE < identifiers.length) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  for (const card of results) {
    const price = getCardPrice(card);
    const priceInfo: PriceInfo = {
      name: card.name,
      price,
      image: getCardImage(card),
    };
    priceMap.set(card.name, priceInfo);
    const cacheKey = card.set
      ? `${card.name.toLowerCase()}|${card.set.toLowerCase()}`
      : card.name.toLowerCase();
    sessionPriceCache.set(cacheKey, priceInfo);
  }

  return priceMap;
};

export const fetchDeckPrices = async (
  deckCards: DeckCardEntry[],
  onProgress?: (progress: FetchProgress) => void
): Promise<DeckPriceResult> => {
  const priceMap = await fetchCardsPrices(deckCards, onProgress);

  const cardPrices: CardWithPrice[] = [];
  let totalValue = 0;

  for (const card of deckCards) {
    const priceInfo = priceMap.get(card.name);
    const cardPrice = priceInfo?.price || 0;
    const lineTotal = cardPrice * card.quantity;

    cardPrices.push({
      name: card.name,
      quantity: card.quantity,
      price: cardPrice,
      total: lineTotal,
      image: priceInfo?.image || null,
    });

    totalValue += lineTotal;
  }

  cardPrices.sort((a, b) => b.total - a.total);

  return {
    cards: cardPrices,
    totalValue,
    topCards: cardPrices.slice(0, 5),
    cardCount: deckCards.reduce((sum, c) => sum + c.quantity, 0),
  };
};
