/**
 * Price Update Script
 *
 * Primary data source: Scryfall bulk data (free, no API key required)
 * Alternative: JustTCG API provides condition-specific pricing but has rate limits
 *              (free tier: 10 req/min, 100/day) making it unsuitable for bulk updates.
 *              Use lib/justtcg.ts for live/on-demand condition-specific lookups.
 *
 * For lowest listing data, run: bun scripts/fetch-lowest-listings.ts
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { Decklists, CardPrices } from '../types';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BULK_DATA_URL = 'https://api.scryfall.com/bulk-data/default-cards';
const DECKLISTS_PATH = join(__dirname, '..', 'public', 'data', 'decklists.json');
const PRECONS_PATH = join(__dirname, '..', 'lib', 'precons.ts');
const OUTPUT_PATH = join(__dirname, '..', 'public', 'data', 'prices.json');

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

interface BulkDataMetadata {
  download_uri: string;
  updated_at: string;
}

interface BulkCard {
  name: string;
  set: string;
  collector_number: string;
  promo?: boolean;
  prices?: CardPrices;
}

interface ComputedCardPrice {
  name: string;
  quantity: number;
  usd: string | null;
  isCommander?: boolean;
}

interface ComputedDeckPrices {
  totalValue: number;
  cardCount: number;
  cards: ComputedCardPrice[];
}

interface PricesOutput {
  updatedAt: string;
  decks: Record<string, ComputedDeckPrices>;
}

interface DeckSetMap {
  [deckId: string]: string;
}

async function fetchWithRetry(url: string, maxRetries: number = 5): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (error) {
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Attempt ${attempt + 1} failed: ${(error as Error).message}. Retrying in ${delay}ms...`);
      if (attempt === maxRetries - 1) throw error;
      await sleep(delay);
    }
  }
  throw new Error('Max retries reached');
}

function loadDecklists(): Decklists {
  console.log('Loading decklists...');
  const data = JSON.parse(readFileSync(DECKLISTS_PATH, 'utf-8')) as Decklists;
  const deckCount = Object.keys(data).length;
  console.log(`Loaded ${deckCount} decks`);
  return data;
}

function loadDeckSetCodes(): DeckSetMap {
  console.log('Loading deck set codes from precons.ts...');
  const content = readFileSync(PRECONS_PATH, 'utf-8');

  const deckSetMap: DeckSetMap = {};
  const regex = /\{\s*id:\s*'([^']+)'[^}]*setCode:\s*'([^']+)'/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    deckSetMap[match[1]] = match[2];
  }

  console.log(`Found set codes for ${Object.keys(deckSetMap).length} decks`);
  return deckSetMap;
}

function collectNeededCardSets(decklists: Decklists, deckSetMap: DeckSetMap): Map<string, Set<string>> {
  const cardSets = new Map<string, Set<string>>();

  for (const deckId of Object.keys(decklists)) {
    const setCode = deckSetMap[deckId];
    if (!setCode) continue;

    for (const card of decklists[deckId]) {
      if (!cardSets.has(card.name)) {
        cardSets.set(card.name, new Set());
      }
      cardSets.get(card.name)!.add(setCode);
    }
  }

  console.log(`Found ${cardSets.size} unique card names across all decks`);
  return cardSets;
}

async function getBulkDataUrl(): Promise<string> {
  console.log('Fetching bulk data metadata...');
  const response = await fetchWithRetry(BULK_DATA_URL);
  const data = await response.json() as BulkDataMetadata;
  console.log(`Bulk data updated at: ${data.updated_at}`);
  return data.download_uri;
}

async function downloadBulkData(url: string): Promise<BulkCard[]> {
  console.log('Downloading bulk data (this may take a moment)...');
  const response = await fetchWithRetry(url);
  const data = await response.json() as BulkCard[];
  console.log(`Downloaded ${data.length} cards`);
  return data;
}

interface CardVersion {
  price: number;
  priceStr: string;
  collectorNumber: string;
  isPromo: boolean;
  isFoilOnly: boolean;
}

function isSerializedCollectorNumber(cn: string): boolean {
  return /[a-zA-Z]/.test(cn) || parseInt(cn, 10) > 500;
}

function buildSetAwarePriceLookup(
  allCards: BulkCard[],
  neededCardSets: Map<string, Set<string>>
): Map<string, string | null> {
  console.log('Building set-aware price lookup (selecting cheapest versions)...');

  const cardVersions = new Map<string, CardVersion[]>();

  for (const card of allCards) {
    const neededSets = neededCardSets.get(card.name);
    if (!neededSets || !neededSets.has(card.set)) continue;

    const usd = card.prices?.usd ?? null;
    const usdFoil = card.prices?.usd_foil ?? null;

    const priceStr = usd || usdFoil;
    if (!priceStr) continue;

    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) continue;

    const setKey = `${card.name}|${card.set}`;

    if (!cardVersions.has(setKey)) {
      cardVersions.set(setKey, []);
    }

    cardVersions.get(setKey)!.push({
      price,
      priceStr,
      collectorNumber: card.collector_number,
      isPromo: card.promo === true,
      isFoilOnly: usd === null && usdFoil !== null,
    });
  }

  const lookup = new Map<string, string | null>();
  let serializedSkipped = 0;

  for (const [setKey, versions] of cardVersions) {
    const validVersions = versions.filter(v => {
      if (isSerializedCollectorNumber(v.collectorNumber)) {
        serializedSkipped++;
        return false;
      }
      return true;
    });

    const candidates = validVersions.length > 0 ? validVersions : versions;

    candidates.sort((a, b) => {
      if (a.isPromo !== b.isPromo) return a.isPromo ? 1 : -1;
      if (a.isFoilOnly !== b.isFoilOnly) return a.isFoilOnly ? 1 : -1;
      return a.price - b.price;
    });

    if (candidates.length > 0) {
      lookup.set(setKey, candidates[0].priceStr);
    }
  }

  console.log(`Matched prices for ${lookup.size} card+set combinations`);
  console.log(`Skipped ${serializedSkipped} serialized/special versions`);
  return lookup;
}

function computeDeckPrices(
  decklists: Decklists,
  deckSetMap: DeckSetMap,
  priceLookup: Map<string, string | null>
): Record<string, ComputedDeckPrices> {
  console.log('Computing deck prices...');
  const decks: Record<string, ComputedDeckPrices> = {};
  let missingPrices = 0;

  for (const deckId of Object.keys(decklists)) {
    const setCode = deckSetMap[deckId];
    const cards = decklists[deckId];
    const cardPrices: ComputedCardPrice[] = [];
    let totalValue = 0;

    for (const card of cards) {
      const setKey = `${card.name}|${setCode}`;
      const priceStr = priceLookup.get(setKey) ?? null;

      if (!priceStr) {
        missingPrices++;
      }

      const price = priceStr ? parseFloat(priceStr) : 0;
      const lineTotal = price * card.quantity;

      cardPrices.push({
        name: card.name,
        quantity: card.quantity,
        usd: priceStr,
        isCommander: card.isCommander,
      });

      totalValue += lineTotal;
    }

    cardPrices.sort((a, b) => {
      const priceA = a.usd ? parseFloat(a.usd) * a.quantity : 0;
      const priceB = b.usd ? parseFloat(b.usd) * b.quantity : 0;
      return priceB - priceA;
    });

    decks[deckId] = {
      totalValue: Math.round(totalValue * 100) / 100,
      cardCount: cards.reduce((sum, c) => sum + c.quantity, 0),
      cards: cardPrices,
    };
  }

  if (missingPrices > 0) {
    console.log(`Warning: ${missingPrices} cards missing set-specific prices`);
  }

  return decks;
}

async function main(): Promise<void> {
  try {
    const decklists = loadDecklists();

    if (Object.keys(decklists).length === 0) {
      console.error('No decklists found. Run import-decklist.js first.');
      process.exit(1);
    }

    const deckSetMap = loadDeckSetCodes();
    const neededCardSets = collectNeededCardSets(decklists, deckSetMap);

    const downloadUrl = await getBulkDataUrl();
    const allCards = await downloadBulkData(downloadUrl);
    const priceLookup = buildSetAwarePriceLookup(allCards, neededCardSets);
    const decks = computeDeckPrices(decklists, deckSetMap, priceLookup);

    const output: PricesOutput = {
      updatedAt: new Date().toISOString(),
      decks,
    };

    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

    console.log(`\nWrote prices to ${OUTPUT_PATH}`);
    console.log(`Total decks: ${Object.keys(decks).length}`);

    let totalCards = 0;
    for (const deckId of Object.keys(decks)) {
      totalCards += decks[deckId].cardCount;
    }
    console.log(`Total cards across all decks: ${totalCards}`);
  } catch (error) {
    console.error('Failed to update prices:', error);
    process.exit(1);
  }
}

main();
