const CACHE_PREFIX = 'deck-prices-';
const STALE_DAYS = 7;

export const getCachedPrice = (deckId) => {
  if (typeof window === 'undefined') return null;

  const key = CACHE_PREFIX + deckId;
  const cached = localStorage.getItem(key);

  if (!cached) return null;

  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
};

export const setCachedPrice = (deckId, data) => {
  if (typeof window === 'undefined') return;

  const key = CACHE_PREFIX + deckId;
  const cacheData = {
    ...data,
    fetchedAt: new Date().toISOString(),
  };

  localStorage.setItem(key, JSON.stringify(cacheData));
};

export const getCacheAge = (deckId) => {
  const cached = getCachedPrice(deckId);
  if (!cached?.fetchedAt) return null;

  const fetchedDate = new Date(cached.fetchedAt);
  const now = new Date();
  const diffMs = now - fetchedDate;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays;
};

export const isCacheStale = (deckId) => {
  const age = getCacheAge(deckId);
  if (age === null) return true;
  return age > STALE_DAYS;
};

export const clearCache = () => {
  if (typeof window === 'undefined') return;

  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
};

export const formatCacheAge = (deckId) => {
  const age = getCacheAge(deckId);
  if (age === null) return null;

  if (age < 1) {
    const hours = Math.floor(age * 24);
    if (hours < 1) return 'Just now';
    return `${hours}h ago`;
  }

  const days = Math.floor(age);
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};

export const formatStaticPriceAge = (updatedAt) => {
  if (!updatedAt) return null;

  const updatedDate = new Date(updatedAt);
  const now = new Date();
  const diffMs = now - updatedDate;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};
