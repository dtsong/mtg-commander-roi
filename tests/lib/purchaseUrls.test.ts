import { describe, it, expect } from 'vitest';
import { getTCGplayerUrl, getCardMarketUrl, getPurchaseUrls } from '@/lib/purchaseUrls';

describe('getTCGplayerUrl', () => {
  it('returns direct product link when ID provided', () => {
    expect(getTCGplayerUrl('Sol Ring', 12345)).toBe(
      'https://www.tcgplayer.com/product/12345'
    );
  });

  it('returns search URL when no ID', () => {
    expect(getTCGplayerUrl('Sol Ring')).toBe(
      'https://www.tcgplayer.com/search/magic/product?q=Sol%20Ring'
    );
  });

  it('encodes special characters in search', () => {
    expect(getTCGplayerUrl("Jace, the Mind Sculptor")).toBe(
      "https://www.tcgplayer.com/search/magic/product?q=Jace%2C%20the%20Mind%20Sculptor"
    );
  });

  it('encodes apostrophes', () => {
    expect(getTCGplayerUrl("Thalia's Lieutenant")).toContain(
      "Thalia's%20Lieutenant"
    );
  });

  it('returns null for names with HTML tags', () => {
    expect(getTCGplayerUrl('<script>alert(1)</script>')).toBeNull();
  });

  it('returns null for names with javascript: protocol', () => {
    expect(getTCGplayerUrl('javascript:alert(1)')).toBeNull();
  });

  it('returns null for names over 200 chars', () => {
    expect(getTCGplayerUrl('A'.repeat(201))).toBeNull();
  });

  it('still returns product URL for invalid name if ID provided', () => {
    expect(getTCGplayerUrl('<script>', 123)).toBe(
      'https://www.tcgplayer.com/product/123'
    );
  });
});

describe('getCardMarketUrl', () => {
  it('returns direct link when ID provided', () => {
    expect(getCardMarketUrl('Sol Ring', 99)).toBe(
      'https://www.cardmarket.com/en/Magic/Products/Singles/99'
    );
  });

  it('returns search URL when no ID', () => {
    const url = getCardMarketUrl('Sol Ring');
    expect(url).toContain('searchString=');
    expect(url).toContain('Sol');
  });

  it('strips apostrophes and commas from search', () => {
    const url = getCardMarketUrl("Jace, the Mind Sculptor");
    // Apostrophes and commas removed, spaces become +
    expect(url).not.toContain("'");
  });
});

describe('getPurchaseUrls', () => {
  it('returns both URLs', () => {
    const urls = getPurchaseUrls('Sol Ring', { tcgplayerId: 1, cardmarketId: 2 });
    expect(urls.tcgplayer).toContain('tcgplayer.com/product/1');
    expect(urls.cardmarket).toContain('cardmarket.com');
  });

  it('works without IDs', () => {
    const urls = getPurchaseUrls('Sol Ring');
    expect(urls.tcgplayer).toContain('search');
    expect(urls.cardmarket).toContain('searchString');
  });
});
