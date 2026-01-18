import { PRECON_DATABASE, loadDecklists } from './precons';

let trendingCache = null;

export async function loadTrendingData() {
  if (trendingCache) return trendingCache;

  try {
    const response = await fetch('/data/trending.json');
    if (!response.ok) return null;
    trendingCache = await response.json();
    return trendingCache;
  } catch {
    return null;
  }
}

export async function getTrendingCards() {
  const data = await loadTrendingData();
  return data?.trendingCards || [];
}

export async function getWeeklyCommanders() {
  const data = await loadTrendingData();
  return data?.weeklyCommanders || [];
}

export async function getDailyCommander() {
  const data = await loadTrendingData();
  return data?.dailyCommander || null;
}

export async function findTrendingInPrecons() {
  const [trending, decklists] = await Promise.all([
    getTrendingCards(),
    loadDecklists(),
  ]);

  if (!trending.length || !decklists) return [];

  const results = [];

  for (const trendingCard of trending) {
    const foundIn = [];

    for (const deck of PRECON_DATABASE) {
      const deckCards = decklists[deck.id];
      if (!deckCards) continue;

      const hasCard = deckCards.some(card =>
        card.name.toLowerCase() === trendingCard.name.toLowerCase()
      );

      if (hasCard) {
        foundIn.push({
          id: deck.id,
          name: deck.name,
          set: deck.set,
          year: deck.year,
        });
      }
    }

    if (foundIn.length > 0) {
      results.push({
        card: trendingCard,
        decks: foundIn,
      });
    }
  }

  return results;
}

export function formatTrendingAge(updatedAt) {
  if (!updatedAt) return 'Unknown';

  const updated = new Date(updatedAt);
  const now = new Date();
  const diffMs = now - updated;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}
