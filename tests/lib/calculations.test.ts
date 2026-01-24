import { describe, it, expect } from 'vitest';
import {
  calculateROI,
  calculateDistroROI,
  getDistroCost,
  getROIVerdict,
  formatCurrency,
  formatPercentage,
  getCardValue,
  sortCardsByValue,
} from '@/lib/calculations';

describe('calculateROI', () => {
  it('returns positive ROI when value exceeds MSRP', () => {
    expect(calculateROI(150, 100)).toBe(50);
  });

  it('returns negative ROI when value below MSRP', () => {
    expect(calculateROI(80, 100)).toBe(-20);
  });

  it('returns 0 when MSRP is 0', () => {
    expect(calculateROI(100, 0)).toBe(0);
  });

  it('returns 0 when MSRP is falsy', () => {
    expect(calculateROI(100, NaN)).toBe(0);
  });

  it('returns 0 when value equals MSRP', () => {
    expect(calculateROI(100, 100)).toBe(0);
  });
});

describe('calculateDistroROI', () => {
  it('returns positive ROI when value exceeds distro cost', () => {
    expect(calculateDistroROI(100, 60)).toBeCloseTo(66.67, 1);
  });

  it('returns negative ROI when value below distro cost', () => {
    expect(calculateDistroROI(40, 60)).toBeCloseTo(-33.33, 1);
  });

  it('returns 0 when distro cost is 0', () => {
    expect(calculateDistroROI(100, 0)).toBe(0);
  });
});

describe('getDistroCost', () => {
  it('applies default 40% discount', () => {
    expect(getDistroCost(100)).toBe(60);
  });

  it('applies custom discount', () => {
    expect(getDistroCost(100, 0.5)).toBe(50);
  });

  it('handles 0% discount', () => {
    expect(getDistroCost(100, 0)).toBe(100);
  });
});

describe('getROIVerdict', () => {
  it('returns BUY when distro ROI > 15 and MSRP ROI > 0', () => {
    const verdict = getROIVerdict(20, 5);
    expect(verdict.label).toBe('BUY');
  });

  it('returns BUY when distro ROI > 15 and no MSRP ROI provided', () => {
    const verdict = getROIVerdict(20);
    expect(verdict.label).toBe('BUY');
  });

  it('returns DISTRO when distro ROI > 15 but MSRP ROI <= 0', () => {
    const verdict = getROIVerdict(20, -5);
    expect(verdict.label).toBe('DISTRO');
  });

  it('returns HOLD when distro ROI between 0 and 15', () => {
    const verdict = getROIVerdict(10);
    expect(verdict.label).toBe('HOLD');
  });

  it('returns HOLD when distro ROI is exactly 0', () => {
    const verdict = getROIVerdict(0);
    expect(verdict.label).toBe('HOLD');
  });

  it('returns PASS when distro ROI < 0', () => {
    const verdict = getROIVerdict(-5);
    expect(verdict.label).toBe('PASS');
  });
});

describe('formatCurrency', () => {
  it('formats positive value', () => {
    expect(formatCurrency(42.5)).toBe('$42.50');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats large values with commas', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
});

describe('formatPercentage', () => {
  it('formats positive with + sign', () => {
    expect(formatPercentage(25.123)).toBe('+25.1%');
  });

  it('formats negative with - sign', () => {
    expect(formatPercentage(-10.567)).toBe('-10.6%');
  });

  it('formats zero with + sign', () => {
    expect(formatPercentage(0)).toBe('+0.0%');
  });
});

describe('getCardValue', () => {
  it('uses total if available', () => {
    expect(getCardValue({ total: 5.5 })).toBe(5.5);
  });

  it('uses price * quantity', () => {
    expect(getCardValue({ price: 2.0, quantity: 3 })).toBe(6.0);
  });

  it('defaults quantity to 1', () => {
    expect(getCardValue({ price: 3.5 })).toBe(3.5);
  });

  it('falls back to prices.usd', () => {
    expect(getCardValue({ prices: { usd: '4.99' } })).toBe(4.99);
  });

  it('falls back to prices.usd_foil when usd missing', () => {
    expect(getCardValue({ prices: { usd: null, usd_foil: '7.50' } })).toBe(7.5);
  });

  it('returns 0 when no price info', () => {
    expect(getCardValue({})).toBe(0);
  });

  it('treats null total as no total', () => {
    expect(getCardValue({ total: null, price: 2.0 })).toBe(2.0);
  });
});

describe('sortCardsByValue', () => {
  it('sorts cards descending by value', () => {
    const cards = [
      { name: 'A', total: 1 },
      { name: 'B', total: 10 },
      { name: 'C', total: 5 },
    ];
    const sorted = sortCardsByValue(cards);
    expect(sorted.map(c => c.name)).toEqual(['B', 'C', 'A']);
  });

  it('does not mutate original array', () => {
    const cards = [{ total: 1 }, { total: 2 }];
    const sorted = sortCardsByValue(cards);
    expect(sorted).not.toBe(cards);
  });
});
