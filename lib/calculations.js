import { getCardPrice } from './scryfall';

export const calculateROI = (currentValue, msrp) => {
  if (!msrp || msrp === 0) return 0;
  return ((currentValue - msrp) / msrp) * 100;
};

export const calculateTotalValue = (cards) => {
  return cards.reduce((sum, card) => sum + getCardPrice(card), 0);
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const formatPercentage = (value) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export const sortCardsByValue = (cards) => {
  return [...cards].sort((a, b) => getCardPrice(b) - getCardPrice(a));
};

export const getTopValueCards = (cards, count = 5) => {
  return sortCardsByValue(cards).slice(0, count);
};
