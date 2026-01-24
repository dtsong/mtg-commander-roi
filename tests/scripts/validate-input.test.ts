import { describe, it, expect } from 'vitest';
import { validateDecklists, validatePriceData, validateLowestListings } from '../../scripts/validate-input';

describe('validateDecklists', () => {
  it('accepts valid decklists', () => {
    const data = {
      'deck-1': [{ name: 'Sol Ring', quantity: 1 }],
      'deck-2': [{ name: 'Command Tower', quantity: 1, isCommander: false }],
    };
    expect(validateDecklists(data)).toEqual(data);
  });

  it('rejects non-object input', () => {
    expect(() => validateDecklists(null)).toThrow('expected an object');
    expect(() => validateDecklists([])).toThrow('expected an object');
    expect(() => validateDecklists('string')).toThrow('expected an object');
  });

  it('rejects deck that is not an array', () => {
    expect(() => validateDecklists({ 'deck-1': 'not-array' })).toThrow('is not an array');
  });

  it('rejects card missing name', () => {
    expect(() => validateDecklists({ 'deck-1': [{ quantity: 1 }] })).toThrow('missing name');
  });

  it('rejects card with empty name', () => {
    expect(() => validateDecklists({ 'deck-1': [{ name: '', quantity: 1 }] })).toThrow('missing name');
  });

  it('rejects card with invalid quantity', () => {
    expect(() => validateDecklists({ 'deck-1': [{ name: 'Sol Ring', quantity: 0 }] })).toThrow('invalid quantity');
    expect(() => validateDecklists({ 'deck-1': [{ name: 'Sol Ring', quantity: -1 }] })).toThrow('invalid quantity');
  });
});

describe('validatePriceData', () => {
  it('accepts valid price data', () => {
    const data = {
      updatedAt: '2026-01-24T00:00:00.000Z',
      decks: {
        'deck-1': { totalValue: 100, cardCount: 100, cards: [] },
      },
    };
    expect(validatePriceData(data)).toEqual(data);
  });

  it('rejects non-object input', () => {
    expect(() => validatePriceData(null)).toThrow('expected an object');
  });

  it('rejects missing updatedAt', () => {
    expect(() => validatePriceData({ decks: {} })).toThrow('missing "updatedAt"');
  });

  it('rejects missing decks', () => {
    expect(() => validatePriceData({ updatedAt: '2026-01-24' })).toThrow('missing "decks" object');
  });

  it('rejects deck missing totalValue', () => {
    expect(() => validatePriceData({
      updatedAt: '2026-01-24',
      decks: { 'deck-1': { cardCount: 1, cards: [] } },
    })).toThrow('missing numeric totalValue');
  });

  it('rejects deck missing cardCount', () => {
    expect(() => validatePriceData({
      updatedAt: '2026-01-24',
      decks: { 'deck-1': { totalValue: 100, cards: [] } },
    })).toThrow('missing numeric cardCount');
  });

  it('rejects deck missing cards array', () => {
    expect(() => validatePriceData({
      updatedAt: '2026-01-24',
      decks: { 'deck-1': { totalValue: 100, cardCount: 1 } },
    })).toThrow('missing cards array');
  });
});

describe('validateLowestListings', () => {
  it('accepts valid lowest listings', () => {
    const data = {
      updatedAt: '2026-01-24T00:00:00.000Z',
      cards: { 'Sol Ring': { name: 'Sol Ring', lowestListing: 1.5 } },
    };
    expect(validateLowestListings(data)).toEqual(data);
  });

  it('rejects non-object input', () => {
    expect(() => validateLowestListings(null)).toThrow('expected an object');
  });

  it('rejects missing updatedAt', () => {
    expect(() => validateLowestListings({ cards: {} })).toThrow('missing "updatedAt"');
  });

  it('rejects missing cards object', () => {
    expect(() => validateLowestListings({ updatedAt: '2026-01-24' })).toThrow('missing "cards" object');
  });
});
