import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { Decklists, LowestListingsData, LowestListingEntry } from '../types';
import {
  createBrowser,
  createPage,
  scrapeLowestListing,
  type LowestListingResult,
} from '../lib/tcgplayer-scraper';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DECKLISTS_PATH = join(__dirname, '..', 'public', 'data', 'decklists.json');
const PRICES_PATH = join(__dirname, '..', 'public', 'data', 'prices.json');
const PRECONS_PATH = join(__dirname, '..', 'lib', 'precons.ts');
const OUTPUT_PATH = join(__dirname, '..', 'public', 'data', 'lowest-listings.json');
const WATCHLIST_PATH = join(__dirname, '..', 'public', 'data', 'watchlist.json');

const DEFAULT_MIN_CARD_VALUE = 5;
const DEFAULT_BATCH_SIZE = 50;
const DISTRO_DISCOUNT = 0.4;

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

interface PriceData {
  updatedAt: string;
  decks: Record<string, {
    totalValue: number;
    cardCount: number;
    cards: Array<{
      name: string;
      quantity: number;
      usd?: string | null;
      isCommander?: boolean;
    }>;
  }>;
}

interface DeckMsrp {
  [deckId: string]: number;
}

interface Watchlist {
  cards: string[];
}

function loadWatchlist(): string[] {
  if (!existsSync(WATCHLIST_PATH)) {
    console.log('No watchlist file found, skipping watchlist');
    return [];
  }

  try {
    const data = JSON.parse(readFileSync(WATCHLIST_PATH, 'utf-8')) as Watchlist;
    console.log(`Loaded ${data.cards.length} cards from watchlist`);
    return data.cards;
  } catch {
    console.log('Failed to parse watchlist, skipping');
    return [];
  }
}

function loadDecklists(): Decklists {
  console.log('Loading decklists...');
  const data = JSON.parse(readFileSync(DECKLISTS_PATH, 'utf-8')) as Decklists;
  console.log(`Loaded ${Object.keys(data).length} decks`);
  return data;
}

function loadPrices(): PriceData {
  console.log('Loading prices...');
  const data = JSON.parse(readFileSync(PRICES_PATH, 'utf-8')) as PriceData;
  console.log(`Loaded prices for ${Object.keys(data.decks).length} decks`);
  return data;
}

function loadDeckMsrps(): DeckMsrp {
  console.log('Loading deck MSRPs from precons.ts...');
  const content = readFileSync(PRECONS_PATH, 'utf-8');

  const msrpMap: DeckMsrp = {};
  const regex = /\{\s*id:\s*'([^']+)'[^}]*msrp:\s*(\d+(?:\.\d+)?)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    msrpMap[match[1]] = parseFloat(match[2]);
  }

  console.log(`Found MSRPs for ${Object.keys(msrpMap).length} decks`);
  return msrpMap;
}

function calculateDistroROI(totalValue: number, msrp: number): number {
  const distroCost = msrp * (1 - DISTRO_DISCOUNT);
  return ((totalValue - distroCost) / distroCost) * 100;
}

function getPositiveROIDecks(priceData: PriceData, msrpMap: DeckMsrp): string[] {
  const positiveDecks: string[] = [];

  for (const deckId of Object.keys(priceData.decks)) {
    const msrp = msrpMap[deckId];
    if (!msrp) continue;

    const { totalValue } = priceData.decks[deckId];
    const distroROI = calculateDistroROI(totalValue, msrp);

    if (distroROI > 0) {
      positiveDecks.push(deckId);
    }
  }

  console.log(`Found ${positiveDecks.length} decks with positive distro ROI`);
  return positiveDecks;
}

interface CardValueInfo {
  name: string;
  price: number;
  deckIds: string[];
}

function extractHighValueCards(
  priceData: PriceData,
  positiveROIDecks: string[],
  minValue: number = DEFAULT_MIN_CARD_VALUE
): CardValueInfo[] {
  const cardMap = new Map<string, CardValueInfo>();

  for (const deckId of positiveROIDecks) {
    const deck = priceData.decks[deckId];
    if (!deck) continue;

    for (const card of deck.cards) {
      const price = card.usd ? parseFloat(card.usd) : 0;
      if (price < minValue) continue;

      const existing = cardMap.get(card.name);
      if (existing) {
        if (price > existing.price) {
          existing.price = price;
        }
        if (!existing.deckIds.includes(deckId)) {
          existing.deckIds.push(deckId);
        }
      } else {
        cardMap.set(card.name, {
          name: card.name,
          price,
          deckIds: [deckId],
        });
      }
    }
  }

  const cards = Array.from(cardMap.values()).sort((a, b) => b.price - a.price);
  console.log(`Found ${cards.length} unique cards with value >= $${minValue}`);
  return cards;
}

function loadExistingListings(): LowestListingsData | null {
  if (!existsSync(OUTPUT_PATH)) return null;

  try {
    const data = JSON.parse(readFileSync(OUTPUT_PATH, 'utf-8')) as LowestListingsData;
    console.log(`Loaded existing listings for ${Object.keys(data.cards).length} cards`);
    return data;
  } catch {
    return null;
  }
}

function formatResults(
  results: LowestListingResult[],
  existingData: LowestListingsData | null
): LowestListingsData {
  const cards: Record<string, LowestListingEntry> = existingData?.cards ?? {};

  for (const result of results) {
    if (result.lowestListing !== null) {
      cards[result.cardName] = {
        name: result.cardName,
        lowestListing: result.lowestListing,
        tcgplayerUrl: result.tcgplayerUrl,
      };
    }
  }

  return {
    updatedAt: new Date().toISOString(),
    cards,
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const limit = args.includes('--limit')
    ? parseInt(args[args.indexOf('--limit') + 1], 10)
    : undefined;
  const minPrice = args.includes('--min-price')
    ? parseInt(args[args.indexOf('--min-price') + 1], 10)
    : DEFAULT_MIN_CARD_VALUE;
  const skipExisting = args.includes('--skip-existing');
  const watchlistOnly = args.includes('--watchlist-only');
  const batchPause = args.includes('--batch-pause')
    ? parseInt(args[args.indexOf('--batch-pause') + 1], 10)
    : undefined;
  const headless = !args.includes('--visible');

  try {
    const watchlist = loadWatchlist();
    loadDecklists();
    const priceData = loadPrices();
    const msrpMap = loadDeckMsrps();

    let highValueCards: CardValueInfo[] = [];

    if (watchlistOnly) {
      if (watchlist.length === 0) {
        console.log('Watchlist is empty. Exiting.');
        return;
      }
      highValueCards = watchlist.map(name => ({
        name,
        price: 0,
        deckIds: [],
      }));
      console.log(`Using ${highValueCards.length} cards from watchlist only`);
    } else {
      const positiveROIDecks = getPositiveROIDecks(priceData, msrpMap);

      if (positiveROIDecks.length === 0 && watchlist.length === 0) {
        console.log('No decks with positive ROI found and no watchlist. Exiting.');
        return;
      }

      const autoDiscovered = extractHighValueCards(priceData, positiveROIDecks, minPrice);
      const autoDiscoveredNames = new Set(autoDiscovered.map(c => c.name));

      const watchlistCards: CardValueInfo[] = watchlist
        .filter(name => !autoDiscoveredNames.has(name))
        .map(name => ({
          name,
          price: 0,
          deckIds: [],
        }));

      highValueCards = [...watchlistCards, ...autoDiscovered];
      if (watchlistCards.length > 0) {
        console.log(`Added ${watchlistCards.length} watchlist cards (prioritized)`);
      }
    }

    const existingData = loadExistingListings();

    if (skipExisting && existingData) {
      const existingNames = new Set(Object.keys(existingData.cards));
      const beforeCount = highValueCards.length;
      highValueCards = highValueCards.filter(c => !existingNames.has(c.name));
      console.log(`Skipping ${beforeCount - highValueCards.length} cards with existing listings`);
    }

    if (limit && limit > 0) {
      highValueCards = highValueCards.slice(0, limit);
      console.log(`Limited to ${limit} cards`);
    }

    if (highValueCards.length === 0) {
      console.log('No cards to scrape. Exiting.');
      return;
    }

    console.log(`\nScraping lowest listings for ${highValueCards.length} cards...`);
    console.log('This may take a while due to rate limiting.\n');

    const browser = await createBrowser({ headless });
    const page = await createPage(browser);
    const results: LowestListingResult[] = [];

    try {
      for (let i = 0; i < highValueCards.length; i++) {
        const card = highValueCards[i];
        console.log(`[${i + 1}/${highValueCards.length}] Scraping: ${card.name} (market: $${card.price.toFixed(2)})`);

        const result = await scrapeLowestListing(page, card.name, { headless });
        results.push(result);

        if (result.lowestListing !== null) {
          const savings = card.price - result.lowestListing;
          const savingsPercent = (savings / card.price) * 100;
          console.log(`  → Lowest: $${result.lowestListing.toFixed(2)} (${savingsPercent > 0 ? '-' : '+'}${Math.abs(savingsPercent).toFixed(1)}% vs market)`);
        } else {
          console.log(`  → Error: ${result.error || 'Could not find listing'}`);
        }

        if (batchPause && (i + 1) % DEFAULT_BATCH_SIZE === 0 && i + 1 < highValueCards.length) {
          console.log(`\n⏸ Batch complete. Pausing for ${batchPause} seconds...\n`);
          await sleep(batchPause * 1000);
        }
      }
    } finally {
      await browser.close();
    }

    const output = formatResults(results, skipExisting ? existingData : null);

    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

    const successCount = results.filter(r => r.lowestListing !== null).length;
    console.log(`\nWrote ${Object.keys(output.cards).length} card listings to ${OUTPUT_PATH}`);
    console.log(`Success rate: ${successCount}/${results.length} (${((successCount / results.length) * 100).toFixed(1)}%)`);

    const totalSavings = results
      .filter(r => r.lowestListing !== null)
      .reduce((sum, r) => {
        const card = highValueCards.find(c => c.name === r.cardName);
        if (card && r.lowestListing !== null) {
          return sum + (card.price - r.lowestListing);
        }
        return sum;
      }, 0);

    if (totalSavings > 0) {
      console.log(`Potential savings found: $${totalSavings.toFixed(2)}`);
    }
  } catch (error) {
    console.error('Failed to fetch lowest listings:', error);
    process.exit(1);
  }
}

main();
