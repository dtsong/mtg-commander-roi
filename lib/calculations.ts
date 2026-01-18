import type { ROIVerdict, CardWithPrice, ScryfallCard } from '@/types';

export const calculateROI = (currentValue: number, msrp: number): number => {
  if (!msrp || msrp === 0) return 0;
  return ((currentValue - msrp) / msrp) * 100;
};

export const calculateDistroROI = (currentValue: number, distroCost: number): number => {
  if (!distroCost || distroCost === 0) return 0;
  return ((currentValue - distroCost) / distroCost) * 100;
};

export const getDistroCost = (msrp: number, customDiscount: number | null = null): number => {
  const discount = customDiscount ?? 0.40;
  return msrp * (1 - discount);
};

export const getROIVerdict = (roi: number): ROIVerdict => {
  if (roi > 15) return { label: 'BUY', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50' };
  if (roi >= 0) return { label: 'HOLD', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' };
  return { label: 'PASS', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' };
};

interface CardLike {
  id?: string;
  name?: string;
  total?: number | null;
  price?: number | null;
  quantity?: number;
  prices?: {
    usd?: string | null;
    usd_foil?: string | null;
  };
}

export const getCardValue = (card: CardLike): number => {
  if (typeof card.total === 'number') return card.total;
  if (typeof card.price === 'number') {
    const qty = card.quantity ?? 1;
    return card.price * qty;
  }
  const usd = parseFloat(card.prices?.usd || '0');
  const usdFoil = parseFloat(card.prices?.usd_foil || '0');
  return usd || usdFoil || 0;
};

export const calculateTotalValue = (cards: CardLike[]): number => {
  return cards.reduce((sum, card) => sum + getCardValue(card), 0);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export const sortCardsByValue = <T extends CardLike>(cards: T[]): T[] => {
  return [...cards].sort((a, b) => getCardValue(b) - getCardValue(a));
};

export const getTopValueCards = <T extends CardLike>(cards: T[], count: number = 5): T[] => {
  return sortCardsByValue(cards).slice(0, count);
};
