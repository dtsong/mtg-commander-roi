import { describe, it, expect, vi, afterEach } from 'vitest';
import { getCardPrice, getCardImage, getCardByName, getCardsByNames, searchCards, loadSetCards } from '@/lib/scryfall';
import type { ScryfallCard } from '@/types';

const mockCard = (overrides: Partial<ScryfallCard> = {}): ScryfallCard => ({
  id: 'test-id',
  name: 'Sol Ring',
  set: 'c21',
  collector_number: '1',
  prices: { usd: '3.50', usd_foil: '8.00' },
  image_uris: { normal: 'https://img.scryfall.com/normal.jpg', small: 'https://img.scryfall.com/small.jpg' },
  ...overrides,
} as ScryfallCard);

describe('getCardPrice', () => {
  it('returns usd price when available', () => {
    expect(getCardPrice(mockCard())).toBe(3.5);
  });

  it('falls back to foil price when usd is null', () => {
    expect(getCardPrice(mockCard({ prices: { usd: null, usd_foil: '5.00' } }))).toBe(5);
  });

  it('returns 0 when no prices', () => {
    expect(getCardPrice(mockCard({ prices: { usd: null, usd_foil: null } }))).toBe(0);
  });

  it('returns 0 when prices undefined', () => {
    expect(getCardPrice(mockCard({ prices: undefined }))).toBe(0);
  });
});

describe('getCardImage', () => {
  it('returns normal image URI', () => {
    expect(getCardImage(mockCard())).toBe('https://img.scryfall.com/normal.jpg');
  });

  it('falls back to small when normal missing', () => {
    const card = mockCard({ image_uris: { small: 'https://img.scryfall.com/small.jpg' } as ScryfallCard['image_uris'] });
    expect(getCardImage(card)).toBe('https://img.scryfall.com/small.jpg');
  });

  it('uses card_faces for DFC', () => {
    const card = mockCard({
      image_uris: undefined,
      card_faces: [
        { image_uris: { normal: 'https://img.scryfall.com/front.jpg', small: 'https://img.scryfall.com/front-sm.jpg' } },
        { image_uris: { normal: 'https://img.scryfall.com/back.jpg', small: 'https://img.scryfall.com/back-sm.jpg' } },
      ] as ScryfallCard['card_faces'],
    });
    expect(getCardImage(card)).toBe('https://img.scryfall.com/front.jpg');
  });

  it('returns null when no images', () => {
    const card = mockCard({ image_uris: undefined, card_faces: undefined });
    expect(getCardImage(card)).toBeNull();
  });
});

describe('getCardByName', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns card on success', async () => {
    const card = mockCard();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(card),
    }));

    const result = await getCardByName('Sol Ring');
    expect(result?.name).toBe('Sol Ring');
  });

  it('returns null on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    }));

    const result = await getCardByName('Nonexistent Card');
    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const result = await getCardByName('Sol Ring');
    expect(result).toBeNull();
  });
});

describe('getCardsByNames', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns found cards', async () => {
    const cards = [mockCard({ name: 'Sol Ring' }), mockCard({ name: 'Command Tower' })];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: cards, not_found: [] }),
    }));

    const result = await getCardsByNames(['Sol Ring', 'Command Tower']);
    expect(result.found).toHaveLength(2);
    expect(result.notFound).toHaveLength(0);
  });

  it('reports not found cards', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [], not_found: [{ name: 'Fake Card' }] }),
    }));

    const result = await getCardsByNames(['Fake Card']);
    expect(result.notFound).toContain('Fake Card');
  });

  it('splits into batches of 75', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [], not_found: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const names = Array.from({ length: 160 }, (_, i) => `Card ${i}`);
    await getCardsByNames(names);

    // 160 cards = 3 batches (75 + 75 + 10)
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('calls progress callback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [], not_found: [] }),
    }));

    const onProgress = vi.fn();
    await getCardsByNames(['Sol Ring', 'Command Tower'], onProgress);
    expect(onProgress).toHaveBeenCalledWith(2, 2);
  });

  it('throws on 429 with retry exhaustion', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    }));

    await expect(getCardsByNames(['Sol Ring'])).rejects.toThrow('Scryfall is temporarily unavailable');
  });
});

describe('searchCards', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty array for short query', async () => {
    const result = await searchCards('a');
    expect(result).toEqual([]);
  });

  it('returns empty array for empty query', async () => {
    const result = await searchCards('');
    expect(result).toEqual([]);
  });

  it('returns cards from search', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [{ name: 'Sol Ring' }],
        has_more: false,
      }),
    }));

    const result = await searchCards('sol ring');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Sol Ring');
  });

  it('returns empty array on 404', async () => {
    // The searchCards function catches errors containing '404' in the message
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('404 Not Found')));

    const result = await searchCards('xyznonexistent');
    expect(result).toEqual([]);
  });
});

describe('loadSetCards', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads all cards from set', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [{ name: 'Sol Ring' }, { name: 'Command Tower' }],
        has_more: false,
      }),
    }));

    const result = await loadSetCards('c21');
    expect(result.length).toBe(2);
  });

  it('paginates through multiple pages', async () => {
    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: [{ name: 'Card 1' }],
            has_more: true,
            next_page: 'https://api.scryfall.com/cards/search?page=2',
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: [{ name: 'Card 2' }],
          has_more: false,
        }),
      });
    }));

    const result = await loadSetCards('c21');
    expect(result.length).toBe(2);
  });

  it('calls progress callback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [{ name: 'Sol Ring' }],
        has_more: false,
      }),
    }));

    const onProgress = vi.fn();
    await loadSetCards('c21', onProgress);
    expect(onProgress).toHaveBeenCalledWith({ loaded: 1, hasMore: false });
  });
});

describe('static price loading', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('loadStaticPrices returns cached data on subsequent calls', async () => {
    const mockData = { updatedAt: '2024-01-01', sets: {}, decks: {} };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    }));

    vi.resetModules();
    const { loadStaticPrices } = await import('@/lib/scryfall');
    const first = await loadStaticPrices();
    const second = await loadStaticPrices();
    expect(first).toEqual(second);
  });

  it('loadStaticPrices returns null on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    vi.resetModules();
    const { loadStaticPrices } = await import('@/lib/scryfall');
    const result = await loadStaticPrices();
    expect(result).toBeNull();
  });

  it('getPriceDataTimestamp returns timestamp', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ updatedAt: '2024-01-15T10:00:00Z', sets: {}, decks: {} }),
    }));

    vi.resetModules();
    const { getPriceDataTimestamp } = await import('@/lib/scryfall');
    const result = await getPriceDataTimestamp();
    expect(result).toBe('2024-01-15T10:00:00Z');
  });

  it('getStaticSetPrices returns set prices', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        updatedAt: '2024-01-01',
        sets: { dsc: [{ name: 'Sol Ring', collector_number: '1', usd: '2.50' }] },
        decks: {},
      }),
    }));

    vi.resetModules();
    const { getStaticSetPrices } = await import('@/lib/scryfall');
    const result = await getStaticSetPrices('dsc');
    expect(result?.[0].name).toBe('Sol Ring');
  });

  it('getStaticSetPrices returns null for unknown set', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ updatedAt: '2024-01-01', sets: {}, decks: {} }),
    }));

    vi.resetModules();
    const { getStaticSetPrices } = await import('@/lib/scryfall');
    const result = await getStaticSetPrices('unknown');
    expect(result).toBeNull();
  });

  it('getStaticDeckPrices returns deck prices', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        updatedAt: '2024-01-01',
        sets: {},
        decks: {
          'test-deck': {
            totalValue: 100,
            cardCount: 100,
            cards: [{ name: 'Sol Ring', quantity: 1, usd: '2.50', isCommander: false }],
          },
        },
      }),
    }));

    vi.resetModules();
    const { getStaticDeckPrices } = await import('@/lib/scryfall');
    const result = await getStaticDeckPrices('test-deck');
    expect(result?.totalValue).toBe(100);
  });

  it('getStaticDeckPrices returns null for unknown deck', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ updatedAt: '2024-01-01', sets: {}, decks: {} }),
    }));

    vi.resetModules();
    const { getStaticDeckPrices } = await import('@/lib/scryfall');
    const result = await getStaticDeckPrices('unknown');
    expect(result).toBeNull();
  });
});

describe('fetchCardsPrices', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('fetches prices for cards', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [{ name: 'Sol Ring', prices: { usd: '2.50' }, set: 'c21' }],
      }),
    }));

    vi.resetModules();
    const { fetchCardsPrices } = await import('@/lib/scryfall');

    const cards = [{ name: 'Sol Ring', quantity: 1 }];
    const result = await fetchCardsPrices(cards as never[]);
    expect(result.get('Sol Ring')?.price).toBe(2.5);
  });

  it('calls progress callback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [{ name: 'Sol Ring', prices: { usd: '2.50' } }],
      }),
    }));

    vi.resetModules();
    const { fetchCardsPrices } = await import('@/lib/scryfall');

    const onProgress = vi.fn();
    const cards = [{ name: 'Sol Ring', quantity: 1 }];
    await fetchCardsPrices(cards as never[], onProgress);

    expect(onProgress).toHaveBeenCalled();
  });

  it('handles foil-only cards', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [{ name: 'Foil Card', prices: { usd: null, usd_foil: '10.00' }, set: 'c21' }],
      }),
    }));

    vi.resetModules();
    const { fetchCardsPrices } = await import('@/lib/scryfall');

    const cards = [{ name: 'Foil Card', quantity: 1 }];
    const result = await fetchCardsPrices(cards as never[]);
    expect(result.get('Foil Card')?.isFoilOnly).toBe(true);
  });

  it('uses set code when provided', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [{ name: 'Sol Ring', prices: { usd: '2.50' }, set: 'dsc' }],
      }),
    }));

    vi.resetModules();
    const { fetchCardsPrices } = await import('@/lib/scryfall');

    const cards = [{ name: 'Sol Ring', quantity: 1, setCode: 'dsc' }];
    const result = await fetchCardsPrices(cards as never[]);
    expect(result.get('Sol Ring')?.price).toBe(2.5);
  });
});

describe('fetchDeckPrices', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('returns deck pricing result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [
          { name: 'Sol Ring', prices: { usd: '2.50' }, set: 'c21' },
          { name: 'Command Tower', prices: { usd: '0.50' }, set: 'c21' },
        ],
      }),
    }));

    vi.resetModules();
    const { fetchDeckPrices } = await import('@/lib/scryfall');

    const cards = [
      { name: 'Sol Ring', quantity: 1 },
      { name: 'Command Tower', quantity: 1 },
    ];
    const result = await fetchDeckPrices(cards as never[]);

    expect(result.totalValue).toBe(3);
    expect(result.cards.length).toBe(2);
    expect(result.cardCount).toBe(2);
  });

  it('sorts cards by value descending', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [
          { name: 'Cheap Card', prices: { usd: '0.10' }, set: 'c21' },
          { name: 'Expensive Card', prices: { usd: '50.00' }, set: 'c21' },
        ],
      }),
    }));

    vi.resetModules();
    const { fetchDeckPrices } = await import('@/lib/scryfall');

    const cards = [
      { name: 'Cheap Card', quantity: 1 },
      { name: 'Expensive Card', quantity: 1 },
    ];
    const result = await fetchDeckPrices(cards as never[]);

    expect(result.cards[0].name).toBe('Expensive Card');
    expect(result.cards[1].name).toBe('Cheap Card');
  });

  it('includes top 5 cards', async () => {
    const mockCards = Array.from({ length: 10 }, (_, i) => ({
      name: `Card ${i}`,
      prices: { usd: `${10 - i}.00` },
      set: 'c21',
    }));

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockCards }),
    }));

    vi.resetModules();
    const { fetchDeckPrices } = await import('@/lib/scryfall');

    const cards = Array.from({ length: 10 }, (_, i) => ({ name: `Card ${i}`, quantity: 1 }));
    const result = await fetchDeckPrices(cards as never[]);

    expect(result.topCards.length).toBe(5);
  });

  it('handles commander cards', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [{ name: 'Atraxa', prices: { usd: '15.00' }, set: 'c21' }],
      }),
    }));

    vi.resetModules();
    const { fetchDeckPrices } = await import('@/lib/scryfall');

    const cards = [{ name: 'Atraxa', quantity: 1, isCommander: true }];
    const result = await fetchDeckPrices(cards as never[]);

    expect(result.cards[0].isCommander).toBe(true);
  });
});

describe('lowest listings', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('loadLowestListings returns data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        updatedAt: '2024-01-01',
        cards: { 'Sol Ring': { lowestListing: 1.99 } },
      }),
    }));

    vi.resetModules();
    const { loadLowestListings } = await import('@/lib/scryfall');
    const result = await loadLowestListings();
    expect(result?.cards['Sol Ring'].lowestListing).toBe(1.99);
  });

  it('loadLowestListings returns null on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    vi.resetModules();
    const { loadLowestListings } = await import('@/lib/scryfall');
    const result = await loadLowestListings();
    expect(result).toBeNull();
  });

  it('getLowestListingForCard returns price', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        updatedAt: '2024-01-01',
        cards: { 'Sol Ring': { lowestListing: 1.99 } },
      }),
    }));

    vi.resetModules();
    const { getLowestListingForCard } = await import('@/lib/scryfall');
    const result = await getLowestListingForCard('Sol Ring');
    expect(result).toBe(1.99);
  });

  it('getLowestListingForCard returns null for unknown card', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ updatedAt: '2024-01-01', cards: {} }),
    }));

    vi.resetModules();
    const { getLowestListingForCard } = await import('@/lib/scryfall');
    const result = await getLowestListingForCard('Unknown Card');
    expect(result).toBeNull();
  });

  it('mergeLowestListings adds listings to cards', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        updatedAt: '2024-01-01',
        cards: { 'Sol Ring': { lowestListing: 1.99 } },
      }),
    }));

    vi.resetModules();
    const { mergeLowestListings } = await import('@/lib/scryfall');
    const cards = [{ name: 'Sol Ring', price: 2.50 }] as never[];
    const result = await mergeLowestListings(cards);
    expect((result[0] as { lowestListing?: number }).lowestListing).toBe(1.99);
  });

  it('mergeLowestListings returns cards unchanged when no listings', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    vi.resetModules();
    const { mergeLowestListings } = await import('@/lib/scryfall');
    const cards = [{ name: 'Sol Ring', price: 2.50 }] as never[];
    const result = await mergeLowestListings(cards);
    expect(result).toEqual(cards);
  });
});
