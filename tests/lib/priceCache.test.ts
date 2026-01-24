import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCachedPrice, setCachedPrice, isCacheStale, clearCache, getCacheAge } from '@/lib/priceCache';

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach(key => delete mockStorage[key]);

  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
      removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
      get length() { return Object.keys(mockStorage).length; },
      key: vi.fn((i: number) => Object.keys(mockStorage)[i] ?? null),
      clear: vi.fn(() => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }),
    },
    writable: true,
    configurable: true,
  });
});

describe('getCachedPrice', () => {
  it('returns null when nothing cached', () => {
    expect(getCachedPrice('deck1')).toBeNull();
  });

  it('returns parsed data when cached', () => {
    const data = { totalValue: 100, topCards: [], cardCount: 10, fetchedAt: new Date().toISOString() };
    mockStorage['deck-prices-deck1'] = JSON.stringify(data);
    const result = getCachedPrice('deck1');
    expect(result?.totalValue).toBe(100);
  });

  it('returns null on invalid JSON', () => {
    mockStorage['deck-prices-deck1'] = 'not-json';
    expect(getCachedPrice('deck1')).toBeNull();
  });
});

describe('setCachedPrice', () => {
  it('stores data with fetchedAt timestamp', () => {
    setCachedPrice('deck1', { totalValue: 50, topCards: [], cardCount: 5 });
    const stored = JSON.parse(mockStorage['deck-prices-deck1']);
    expect(stored.totalValue).toBe(50);
    expect(stored.fetchedAt).toBeDefined();
  });

  it('handles quota exceeded gracefully', () => {
    const originalSetItem = localStorage.setItem;
    (localStorage.setItem as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    // Should not throw
    expect(() => setCachedPrice('deck1', { totalValue: 50, topCards: [], cardCount: 5 })).not.toThrow();
    localStorage.setItem = originalSetItem;
  });
});

describe('getCacheAge', () => {
  it('returns null when no cache', () => {
    expect(getCacheAge('deck1')).toBeNull();
  });

  it('returns age in days', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    mockStorage['deck-prices-deck1'] = JSON.stringify({ totalValue: 0, topCards: [], cardCount: 0, fetchedAt: twoDaysAgo });
    const age = getCacheAge('deck1');
    expect(age).toBeGreaterThan(1.9);
    expect(age).toBeLessThan(2.1);
  });
});

describe('isCacheStale', () => {
  it('returns true when no cache exists', () => {
    expect(isCacheStale('deck1')).toBe(true);
  });

  it('returns false for fresh cache', () => {
    mockStorage['deck-prices-deck1'] = JSON.stringify({ totalValue: 0, topCards: [], cardCount: 0, fetchedAt: new Date().toISOString() });
    expect(isCacheStale('deck1')).toBe(false);
  });

  it('returns true for cache older than 7 days', () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    mockStorage['deck-prices-deck1'] = JSON.stringify({ totalValue: 0, topCards: [], cardCount: 0, fetchedAt: eightDaysAgo });
    expect(isCacheStale('deck1')).toBe(true);
  });
});

describe('clearCache', () => {
  it('removes all deck-prices- keys', () => {
    mockStorage['deck-prices-a'] = '{}';
    mockStorage['deck-prices-b'] = '{}';
    mockStorage['other-key'] = 'keep';
    clearCache();
    expect(mockStorage['other-key']).toBe('keep');
    expect(mockStorage['deck-prices-a']).toBeUndefined();
    expect(mockStorage['deck-prices-b']).toBeUndefined();
  });
});
