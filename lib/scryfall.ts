import type {
  ScryfallCard,
  DeckCardEntry,
  CardWithPrice,
  DeckPriceResult,
  LoadProgress,
  FetchProgress,
  StaticPricesData,
  StaticCardData,
  LowestListingsData,
} from '@/types';
import { deduplicatedFetch } from './deduplicator';

const SCRYFALL_API = 'https://api.scryfall.com';
const RATE_LIMIT_MS = 100;
const MAX_RETRIES = 4;
const CLIENT_RATE_LIMIT = 50;
const CLIENT_RATE_WINDOW_MS = 60 * 1000;
const USER_AGENT = 'MTG-Commander-ROI/1.0';
const FETCH_TIMEOUT_MS = 30000;

const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

let lastRequestTime = 0;
let clientRequestCount = 0;
let clientRateLimitReset = Date.now() + CLIENT_RATE_WINDOW_MS;

interface PriceInfo {
  name: string;
  price: number;
  image: string | null;
  foilPrice: number | null;
  isFoilOnly: boolean;
}

const SESSION_CACHE_MAX = 5000;
const sessionPriceCache = new Map<string, PriceInfo>();

function cacheGet(key: string): PriceInfo | undefined {
  const value = sessionPriceCache.get(key);
  if (value !== undefined) {
    sessionPriceCache.delete(key);
    sessionPriceCache.set(key, value);
  }
  return value;
}

function cacheSet(key: string, value: PriceInfo): void {
  if (sessionPriceCache.has(key)) {
    sessionPriceCache.delete(key);
  } else if (sessionPriceCache.size >= SESSION_CACHE_MAX) {
    const oldest = sessionPriceCache.keys().next().value;
    if (oldest !== undefined) sessionPriceCache.delete(oldest);
  }
  sessionPriceCache.set(key, value);
}

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

const checkClientRateLimit = (): boolean => {
  const now = Date.now();
  if (now > clientRateLimitReset) {
    clientRequestCount = 0;
    clientRateLimitReset = now + CLIENT_RATE_WINDOW_MS;
  }

  if (clientRequestCount >= CLIENT_RATE_LIMIT) {
    console.warn(`Client rate limit reached (${CLIENT_RATE_LIMIT}/min). Please wait.`);
    return false;
  }

  clientRequestCount++;

  if (clientRequestCount >= CLIENT_RATE_LIMIT - 10) {
    console.warn(`Approaching client rate limit: ${clientRequestCount}/${CLIENT_RATE_LIMIT} requests`);
  }

  return true;
};

const rateLimitedFetchImpl = async <T>(url: string, retryCount: number = 0): Promise<T> => {
  if (!checkClientRateLimit()) {
    throw new Error('Client rate limit exceeded. Please wait before making more requests.');
  }

  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await sleep(RATE_LIMIT_MS - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': USER_AGENT,
      },
    });

    if (response.status === 429 && retryCount < MAX_RETRIES) {
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`Rate limited, retrying in ${delay}ms...`);
      await sleep(delay);
      return rateLimitedFetchImpl<T>(url, retryCount + 1);
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Card not found');
      }
      if (response.status === 503) {
        throw new Error('Scryfall is temporarily unavailable. Please try again.');
      }
      throw new Error(`Scryfall API Error: ${response.status} - ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

const rateLimitedFetch = <T>(url: string, retryCount: number = 0): Promise<T> => {
  return deduplicatedFetch<T>(url, () => rateLimitedFetchImpl<T>(url, retryCount));
};

let staticPricesCache: StaticPricesData | null = null;

export const loadStaticPrices = async (): Promise<StaticPricesData | null> => {
  if (staticPricesCache) return staticPricesCache;

  return deduplicatedFetch<StaticPricesData | null>('static:prices.json', async () => {
    try {
      const response = await fetchWithTimeout('/data/prices.json');
      if (!response.ok) return null;
      staticPricesCache = await response.json() as StaticPricesData;
      return staticPricesCache;
    } catch {
      return null;
    }
  });
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
  const mapCard = (card: typeof deckData.cards[0]): CardWithPrice => ({
    name: card.name,
    quantity: card.quantity,
    price: card.usd ? parseFloat(card.usd) : 0,
    total: card.usd ? parseFloat(card.usd) * card.quantity : 0,
    isCommander: card.isCommander,
    tcgplayerId: card.tcgplayerId,
    cardmarketId: card.cardmarketId,
    foilPrice: card.usd_foil ? parseFloat(card.usd_foil) : null,
    isFoilOnly: card.isFoilOnly,
  });

  return {
    totalValue: deckData.totalValue,
    cardCount: deckData.cardCount,
    cards: deckData.cards.map(mapCard),
    topCards: deckData.cards
      .filter(c => c.usd)
      .slice(0, 5)
      .map(mapCard),
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

const BATCH_SIZE = 75;
const DELAY_BETWEEN_BATCHES_MS = 100;
const COLLECTION_MAX_RETRIES = 3;

const collectionFetchWithRetry = async (
  batch: Record<string, string | undefined>[],
  maxRetries = COLLECTION_MAX_RETRIES
): Promise<ScryfallCollectionResponse> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(`${SCRYFALL_API}/cards/collection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': USER_AGENT,
        },
        body: JSON.stringify({ identifiers: batch }),
      });

      if (response.status === 429 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        await sleep(delay);
        continue;
      }

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Scryfall is temporarily unavailable. Please try again.');
        }
        throw new Error(`Scryfall Collection API Error: ${response.status} - ${response.statusText}`);
      }

      return await response.json() as ScryfallCollectionResponse;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await sleep(delay);
          continue;
        }
        throw new Error('Request timed out. Please try again.');
      }
      if (attempt < maxRetries && !(error instanceof Error && error.message.includes('temporarily unavailable'))) {
        const delay = Math.pow(2, attempt) * 1000;
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded for collection fetch');
};

export interface BatchCardResult {
  found: ScryfallCard[];
  notFound: string[];
}

export const getCardsByNames = async (
  names: string[],
  onProgress?: (current: number, total: number) => void
): Promise<BatchCardResult> => {
  const found: ScryfallCard[] = [];
  const notFound: string[] = [];
  const identifiers = names.map(name => ({ name }));

  for (let i = 0; i < identifiers.length; i += BATCH_SIZE) {
    const batch = identifiers.slice(i, i + BATCH_SIZE);
    const data = await collectionFetchWithRetry(batch);
    found.push(...(data.data || []));

    if (data.not_found) {
      notFound.push(...data.not_found.map(nf => nf.name));
    }

    if (onProgress) {
      onProgress(Math.min(i + BATCH_SIZE, names.length), names.length);
    }

    if (i + BATCH_SIZE < identifiers.length) {
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  return { found, notFound };
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
    const cached = cacheGet(cacheKey);
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
    const data = await collectionFetchWithRetry(batch);
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
    const usd = card.prices?.usd ?? null;
    const usdFoil = card.prices?.usd_foil ?? null;
    const foilPrice = usdFoil ? parseFloat(usdFoil) : null;
    const isFoilOnly = usd === null && usdFoil !== null;
    const priceInfo: PriceInfo = {
      name: card.name,
      price,
      image: getCardImage(card),
      foilPrice: foilPrice && foilPrice !== price ? foilPrice : null,
      isFoilOnly,
    };
    priceMap.set(card.name, priceInfo);
    const cacheKey = card.set
      ? `${card.name.toLowerCase()}|${card.set.toLowerCase()}`
      : card.name.toLowerCase();
    cacheSet(cacheKey, priceInfo);
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
      isCommander: card.isCommander,
      foilPrice: priceInfo?.foilPrice ?? null,
      isFoilOnly: priceInfo?.isFoilOnly,
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

let lowestListingsCache: LowestListingsData | null = null;

export const loadLowestListings = async (): Promise<LowestListingsData | null> => {
  if (lowestListingsCache) return lowestListingsCache;

  return deduplicatedFetch<LowestListingsData | null>('static:lowest-listings.json', async () => {
    try {
      const response = await fetchWithTimeout('/data/lowest-listings.json');
      if (!response.ok) return null;
      lowestListingsCache = await response.json() as LowestListingsData;
      return lowestListingsCache;
    } catch {
      return null;
    }
  });
};

export const getLowestListingForCard = async (cardName: string): Promise<number | null> => {
  const data = await loadLowestListings();
  if (!data?.cards?.[cardName]) return null;
  return data.cards[cardName].lowestListing;
};

export const mergeLowestListings = async (
  cards: CardWithPrice[]
): Promise<CardWithPrice[]> => {
  const listings = await loadLowestListings();
  if (!listings) return cards;

  return cards.map(card => {
    const listing = listings.cards[card.name];
    return {
      ...card,
      lowestListing: listing?.lowestListing ?? null,
    };
  });
};
