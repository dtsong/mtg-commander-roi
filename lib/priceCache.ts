import type { CachedPriceData } from '@/types';

const CACHE_PREFIX = 'deck-prices-';
const STALE_DAYS = 7;

export const getCachedPrice = (deckId: string): CachedPriceData | null => {
  if (typeof window === 'undefined') return null;

  const key = CACHE_PREFIX + deckId;
  const cached = localStorage.getItem(key);

  if (!cached) return null;

  try {
    return JSON.parse(cached) as CachedPriceData;
  } catch {
    return null;
  }
};

export const setCachedPrice = (deckId: string, data: Omit<CachedPriceData, 'fetchedAt'>): boolean => {
  if (typeof window === 'undefined') return false;

  const key = CACHE_PREFIX + deckId;
  const cacheData: CachedPriceData = {
    ...data,
    fetchedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(key, JSON.stringify(cacheData));
    return true;
  } catch {
    return false;
  }
};

export const getCacheAge = (deckId: string): number | null => {
  const cached = getCachedPrice(deckId);
  if (!cached?.fetchedAt) return null;

  const fetchedDate = new Date(cached.fetchedAt);
  const now = new Date();
  const diffMs = now.getTime() - fetchedDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays;
};

export const isCacheStale = (deckId: string): boolean => {
  const age = getCacheAge(deckId);
  if (age === null) return true;
  return age > STALE_DAYS;
};

export const clearCache = (): void => {
  if (typeof window === 'undefined') return;

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
};

export const formatCacheAge = (deckId: string): string | null => {
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

export const formatStaticPriceAge = (updatedAt: string | null | undefined): string | null => {
  if (!updatedAt) return null;

  const updatedDate = new Date(updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - updatedDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};

export const isTimestampStale = (fetchedAt: string | null | undefined): boolean => {
  if (!fetchedAt) return true;

  const fetchedDate = new Date(fetchedAt);
  const now = new Date();
  const diffMs = now.getTime() - fetchedDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays > STALE_DAYS;
};
