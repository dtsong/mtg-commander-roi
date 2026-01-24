const JUSTTCG_API = 'https://api.justtcg.com';
const FREE_TIER_RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;
const MAX_RETRIES = 3;
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

let requestCount = 0;
let rateLimitReset = Date.now() + RATE_WINDOW_MS;

export type CardCondition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG';

export interface JustTCGPriceByCondition {
  condition: CardCondition;
  price: number | null;
  quantity?: number;
}

export interface JustTCGPriceTrend {
  change24h: number | null;
  change7d: number | null;
  change30d: number | null;
}

export interface JustTCGCard {
  tcgplayerId?: number;
  scryfallId?: string;
  name: string;
  setCode?: string;
  setName?: string;
  prices: JustTCGPriceByCondition[];
  marketPrice: number | null;
  lowPrice: number | null;
  trends?: JustTCGPriceTrend;
  lastUpdated?: string;
}

export interface JustTCGResponse {
  success: boolean;
  data: JustTCGCard[];
  errors?: { identifier: string; message: string }[];
}

export interface JustTCGIdentifier {
  tcgplayerId?: number;
  scryfallId?: string;
  mtgjsonId?: string;
  name?: string;
  setCode?: string;
}

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const checkRateLimit = (): boolean => {
  const now = Date.now();
  if (now > rateLimitReset) {
    requestCount = 0;
    rateLimitReset = now + RATE_WINDOW_MS;
  }

  if (requestCount >= FREE_TIER_RATE_LIMIT) {
    return false;
  }

  requestCount++;
  return true;
};

const getApiKey = (): string => {
  const key = process.env.JUSTTCG_API_KEY;
  if (!key) {
    throw new Error('JUSTTCG_API_KEY environment variable is not set');
  }
  return key;
};

export const fetchJustTCGCard = async (
  identifier: JustTCGIdentifier,
  retryCount = 0,
  waitAttempts = 0
): Promise<JustTCGCard | null> => {
  if (!checkRateLimit()) {
    if (waitAttempts >= 3) {
      throw new Error('JustTCG rate limit: max wait attempts exceeded');
    }
    const waitTime = rateLimitReset - Date.now();
    console.warn(`JustTCG rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`);
    await sleep(waitTime);
    return fetchJustTCGCard(identifier, retryCount, waitAttempts + 1);
  }

  const params = new URLSearchParams();
  if (identifier.tcgplayerId) params.set('tcgplayerId', identifier.tcgplayerId.toString());
  if (identifier.scryfallId) params.set('scryfallId', identifier.scryfallId);
  if (identifier.name) params.set('name', identifier.name);
  if (identifier.setCode) params.set('setCode', identifier.setCode);

  try {
    const response = await fetchWithTimeout(`${JUSTTCG_API}/v1/card?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
        'Accept': 'application/json',
      },
    });

    if (response.status === 429 && retryCount < MAX_RETRIES) {
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`JustTCG rate limited, retrying in ${delay}ms...`);
      await sleep(delay);
      return fetchJustTCGCard(identifier, retryCount + 1);
    }

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`JustTCG API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = Math.pow(2, retryCount) * 1000;
      await sleep(delay);
      return fetchJustTCGCard(identifier, retryCount + 1);
    }
    throw error;
  }
};

export const fetchJustTCGCards = async (
  identifiers: JustTCGIdentifier[],
  onProgress?: (current: number, total: number) => void,
  waitAttempts = 0,
  retryCount = 0
): Promise<JustTCGResponse> => {
  if (!checkRateLimit()) {
    if (waitAttempts >= 3) {
      throw new Error('JustTCG rate limit: max wait attempts exceeded');
    }
    const waitTime = rateLimitReset - Date.now();
    console.warn(`JustTCG rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`);
    await sleep(waitTime);
    return fetchJustTCGCards(identifiers, onProgress, waitAttempts + 1);
  }

  try {
    const response = await fetchWithTimeout(`${JUSTTCG_API}/v1/cards`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ identifiers }),
    });

    if (response.status === 429) {
      if (retryCount >= MAX_RETRIES) {
        throw new Error('JustTCG batch rate limit: max retries exceeded');
      }
      const delay = Math.pow(2, retryCount) * 1000;
      await sleep(delay);
      return fetchJustTCGCards(identifiers, onProgress, waitAttempts, retryCount + 1);
    }

    if (!response.ok) {
      throw new Error(`JustTCG Batch API Error: ${response.status}`);
    }

    const data: JustTCGResponse = await response.json();

    if (onProgress) {
      onProgress(data.data.length, identifiers.length);
    }

    return data;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = Math.pow(2, retryCount) * 1000;
      await sleep(delay);
      return fetchJustTCGCards(identifiers, onProgress, waitAttempts, retryCount + 1);
    }
    console.error('JustTCG batch fetch error:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

export const getPriceByCondition = (
  card: JustTCGCard,
  condition: CardCondition = 'NM'
): number | null => {
  const priceEntry = card.prices.find(p => p.condition === condition);
  return priceEntry?.price ?? null;
};

export const getNearMintPrice = (card: JustTCGCard): number | null => {
  return getPriceByCondition(card, 'NM') ?? card.marketPrice;
};

export const getAllConditionPrices = (card: JustTCGCard): Record<CardCondition, number | null> => {
  const conditions: CardCondition[] = ['NM', 'LP', 'MP', 'HP', 'DMG'];
  const prices: Record<CardCondition, number | null> = {
    NM: null,
    LP: null,
    MP: null,
    HP: null,
    DMG: null,
  };

  for (const condition of conditions) {
    prices[condition] = getPriceByCondition(card, condition);
  }

  return prices;
};

export const mapJustTCGToCardPrice = (card: JustTCGCard): {
  usd: string | null;
  usd_nm: string | null;
  usd_lp: string | null;
  marketPrice: string | null;
  lowPrice: string | null;
} => {
  const nmPrice = getNearMintPrice(card);
  const lpPrice = getPriceByCondition(card, 'LP');

  return {
    usd: nmPrice !== null ? nmPrice.toFixed(2) : null,
    usd_nm: nmPrice !== null ? nmPrice.toFixed(2) : null,
    usd_lp: lpPrice !== null ? lpPrice.toFixed(2) : null,
    marketPrice: card.marketPrice !== null ? card.marketPrice.toFixed(2) : null,
    lowPrice: card.lowPrice !== null ? card.lowPrice.toFixed(2) : null,
  };
};

export const isJustTCGAvailable = (): boolean => {
  return !!process.env.JUSTTCG_API_KEY;
};
