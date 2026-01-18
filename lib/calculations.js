export const calculateROI = (currentValue, msrp) => {
  if (!msrp || msrp === 0) return 0;
  return ((currentValue - msrp) / msrp) * 100;
};

export const getCardValue = (card) => {
  if (typeof card.total === 'number') return card.total;
  if (typeof card.price === 'number') {
    const qty = card.quantity ?? 1;
    return card.price * qty;
  }
  const usd = parseFloat(card.prices?.usd || 0);
  const usdFoil = parseFloat(card.prices?.usd_foil || 0);
  return usd || usdFoil || 0;
};

export const calculateTotalValue = (cards) => {
  return cards.reduce((sum, card) => sum + getCardValue(card), 0);
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
  return [...cards].sort((a, b) => getCardValue(b) - getCardValue(a));
};

export const getTopValueCards = (cards, count = 5) => {
  return sortCardsByValue(cards).slice(0, count);
};
