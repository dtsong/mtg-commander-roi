import { describe, it, expect, vi, afterEach } from 'vitest';
import { getCardPrice, getCardImage, getCardByName, getCardsByNames } from '@/lib/scryfall';
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
