const SCRYFALL_API = 'https://api.scryfall.com';
const RATE_LIMIT_MS = 100;
const MAX_RETRIES = 4;
let lastRequestTime = 0;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const rateLimitedFetch = async (url, retryCount = 0) => {
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
    return rateLimitedFetch(url, retryCount + 1);
  }

  if (!response.ok) {
    throw new Error(`Scryfall API Error: ${response.status}`);
  }
  return response.json();
};

let staticPricesCache = null;

export const loadStaticPrices = async () => {
  if (staticPricesCache) return staticPricesCache;

  try {
    const response = await fetch('/data/prices.json');
    if (!response.ok) return null;
    staticPricesCache = await response.json();
    return staticPricesCache;
  } catch {
    return null;
  }
};

export const getStaticSetPrices = async (setCode) => {
  const data = await loadStaticPrices();
  if (!data?.sets?.[setCode]) return null;

  return data.sets[setCode].map(card => ({
    name: card.name,
    collector_number: card.collector_number,
    prices: { usd: card.usd },
  }));
};

export const getStaticDeckPrices = async (deckId) => {
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

export const loadSetCards = async (setCode, onProgress) => {
  let allCards = [];
  let url = `${SCRYFALL_API}/cards/search?q=set:${setCode}&unique=cards`;
  let page = 1;

  while (url) {
    const data = await rateLimitedFetch(url);
    allCards = [...allCards, ...(data.data || [])];
    if (onProgress) {
      onProgress({ loaded: allCards.length, hasMore: data.has_more });
    }
    url = data.has_more ? data.next_page : null;
    page++;
  }

  return allCards;
};

export const searchCards = async (query) => {
  if (!query || query.length < 2) return [];

  const encodedQuery = encodeURIComponent(query);
  const url = `${SCRYFALL_API}/cards/search?q=${encodedQuery}&unique=cards`;

  try {
    const data = await rateLimitedFetch(url);
    return data.data || [];
  } catch (error) {
    if (error.message.includes('404')) {
      return [];
    }
    throw error;
  }
};

export const getCardByName = async (name) => {
  const encodedName = encodeURIComponent(name);
  const url = `${SCRYFALL_API}/cards/named?fuzzy=${encodedName}`;

  try {
    return await rateLimitedFetch(url);
  } catch (error) {
    return null;
  }
};

export const getCardImage = (card) => {
  if (card.image_uris) {
    return card.image_uris.normal || card.image_uris.small;
  }
  if (card.card_faces && card.card_faces[0]?.image_uris) {
    return card.card_faces[0].image_uris.normal || card.card_faces[0].image_uris.small;
  }
  return null;
};

export const getCardPrice = (card) => {
  const usd = parseFloat(card.prices?.usd || 0);
  const usdFoil = parseFloat(card.prices?.usd_foil || 0);
  return usd || usdFoil || 0;
};

export const fetchCardsPrices = async (cardList, onProgress) => {
  const BATCH_SIZE = 75;
  const results = [];

  const identifiers = cardList.map(card => ({ name: card.name }));

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

    const data = await response.json();
    results.push(...(data.data || []));

    if (onProgress) {
      onProgress({ fetched: Math.min(i + BATCH_SIZE, identifiers.length), total: identifiers.length });
    }

    if (i + BATCH_SIZE < identifiers.length) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  const priceMap = new Map();
  for (const card of results) {
    const price = getCardPrice(card);
    priceMap.set(card.name, {
      name: card.name,
      price,
      image: getCardImage(card),
    });
  }

  return priceMap;
};

export const fetchDeckPrices = async (deckCards, onProgress) => {
  const priceMap = await fetchCardsPrices(deckCards, onProgress);

  const cardPrices = [];
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
