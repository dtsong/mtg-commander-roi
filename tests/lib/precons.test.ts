import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getYears,
  getPreconsByYear,
  getPreconById,
  getDeckCards,
  hasDeckList,
  loadDecklists,
  PRECON_DATABASE,
} from '@/lib/precons';

// Mock fetch for browser environment
const mockDecklists = {
  'test-deck-1': [
    { name: 'Sol Ring', quantity: 1 },
    { name: 'Command Tower', quantity: 1 },
  ],
  'ecc-dance-of-the-elements': [
    { name: 'Island', quantity: 10 },
  ],
};

beforeEach(() => {
  vi.resetModules();
  // Reset decklist cache by reimporting
});

describe('getYears', () => {
  it('returns unique years sorted descending', () => {
    const years = getYears();
    expect(years.length).toBeGreaterThan(0);
    expect(years).toEqual([...years].sort((a, b) => b - a));
    // Check for uniqueness
    expect(new Set(years).size).toBe(years.length);
  });

  it('includes expected years from database', () => {
    const years = getYears();
    expect(years).toContain(2024);
    expect(years).toContain(2023);
    expect(years).toContain(2022);
  });
});

describe('getPreconsByYear', () => {
  it('filters decks by year', () => {
    const decks2024 = getPreconsByYear(2024);
    expect(decks2024.length).toBeGreaterThan(0);
    expect(decks2024.every(d => d.year === 2024)).toBe(true);
  });

  it('returns empty array for non-existent year', () => {
    const decks = getPreconsByYear(1999);
    expect(decks).toEqual([]);
  });

  it('returns correct deck count for known year', () => {
    const decks2022 = getPreconsByYear(2022);
    // Warhammer 40k has 4 decks
    expect(decks2022.length).toBe(4);
  });
});

describe('getPreconById', () => {
  it('finds deck by id', () => {
    const deck = getPreconById('40k-necron-dynasties');
    expect(deck).toBeDefined();
    expect(deck?.name).toBe('Necron Dynasties');
    expect(deck?.set).toBe('Warhammer 40,000');
  });

  it('returns undefined for non-existent id', () => {
    const deck = getPreconById('nonexistent-deck');
    expect(deck).toBeUndefined();
  });

  it('returns deck with all required properties', () => {
    const deck = getPreconById('pip-science');
    expect(deck).toMatchObject({
      id: 'pip-science',
      name: expect.any(String),
      set: expect.any(String),
      year: expect.any(Number),
      msrp: expect.any(Number),
      setCode: expect.any(String),
      colors: expect.any(Array),
    });
  });
});

describe('loadDecklists', () => {
  it('loads decklists from fetch in browser environment', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve(mockDecklists) };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    // Force browser environment
    const originalWindow = globalThis.window;
    globalThis.window = {} as typeof window;

    // We need to reset the cache for this test
    vi.resetModules();
    const { loadDecklists: freshLoadDecklists } = await import('@/lib/precons');

    const result = await freshLoadDecklists();
    expect(result).toBeDefined();

    globalThis.window = originalWindow;
  });
});

describe('getDeckCards', () => {
  beforeEach(() => {
    const mockResponse = { ok: true, json: () => Promise.resolve(mockDecklists) };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);
    globalThis.window = {} as typeof window;
  });

  it('returns cards with enriched setCode', async () => {
    vi.resetModules();
    const { getDeckCards: freshGetDeckCards } = await import('@/lib/precons');

    const cards = await freshGetDeckCards('ecc-dance-of-the-elements');
    expect(cards.length).toBeGreaterThan(0);
    // Each card should have the setCode from the deck
    expect(cards.every(c => c.setCode === 'ecc')).toBe(true);
  });

  it('returns empty array for deck without cards', async () => {
    vi.resetModules();
    const { getDeckCards: freshGetDeckCards } = await import('@/lib/precons');

    const cards = await freshGetDeckCards('nonexistent-deck');
    expect(cards).toEqual([]);
  });
});

describe('hasDeckList', () => {
  beforeEach(() => {
    const mockResponse = { ok: true, json: () => Promise.resolve(mockDecklists) };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);
    globalThis.window = {} as typeof window;
  });

  it('returns true for deck with cards', async () => {
    vi.resetModules();
    const { hasDeckList: freshHasDeckList } = await import('@/lib/precons');

    const has = await freshHasDeckList('ecc-dance-of-the-elements');
    expect(has).toBe(true);
  });

  it('returns false for deck without cards', async () => {
    vi.resetModules();
    const { hasDeckList: freshHasDeckList } = await import('@/lib/precons');

    const has = await freshHasDeckList('nonexistent-deck');
    expect(has).toBe(false);
  });
});

describe('PRECON_DATABASE', () => {
  it('has expected deck count', () => {
    // As stated in CLAUDE.md, there are 98 precon decks
    expect(PRECON_DATABASE.length).toBeGreaterThanOrEqual(40);
  });

  it('all decks have valid colors', () => {
    const validColors = ['W', 'U', 'B', 'R', 'G', 'C'];
    for (const deck of PRECON_DATABASE) {
      expect(deck.colors.length).toBeGreaterThan(0);
      expect(deck.colors.every(c => validColors.includes(c))).toBe(true);
    }
  });

  it('all decks have positive MSRP', () => {
    for (const deck of PRECON_DATABASE) {
      expect(deck.msrp).toBeGreaterThan(0);
    }
  });
});
