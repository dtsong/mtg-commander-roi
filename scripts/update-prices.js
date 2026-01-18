import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BULK_DATA_URL = 'https://api.scryfall.com/bulk-data/default-cards';
const DECKLISTS_PATH = join(__dirname, '..', 'public', 'data', 'decklists.json');
const OUTPUT_PATH = join(__dirname, '..', 'public', 'data', 'prices.json');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (error) {
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
      if (attempt === maxRetries - 1) throw error;
      await sleep(delay);
    }
  }
}

function loadDecklists() {
  console.log('Loading decklists...');
  const data = JSON.parse(readFileSync(DECKLISTS_PATH, 'utf-8'));
  const deckCount = Object.keys(data).length;
  console.log(`Loaded ${deckCount} decks`);
  return data;
}

function collectUniqueCardNames(decklists) {
  const names = new Set();
  for (const deckId of Object.keys(decklists)) {
    for (const card of decklists[deckId]) {
      names.add(card.name);
    }
  }
  console.log(`Found ${names.size} unique card names across all decks`);
  return names;
}

async function getBulkDataUrl() {
  console.log('Fetching bulk data metadata...');
  const response = await fetchWithRetry(BULK_DATA_URL);
  const data = await response.json();
  console.log(`Bulk data updated at: ${data.updated_at}`);
  return data.download_uri;
}

async function downloadBulkData(url) {
  console.log('Downloading bulk data (this may take a moment)...');
  const response = await fetchWithRetry(url);
  const data = await response.json();
  console.log(`Downloaded ${data.length} cards`);
  return data;
}

function buildPriceLookup(allCards, neededNames) {
  console.log('Building price lookup...');
  const lookup = new Map();
  let matchCount = 0;

  for (const card of allCards) {
    if (!neededNames.has(card.name)) continue;
    if (lookup.has(card.name)) continue;

    const usd = card.prices?.usd;
    const usdFoil = card.prices?.usd_foil;
    const price = usd || usdFoil || null;

    lookup.set(card.name, price);
    matchCount++;
  }

  console.log(`Matched prices for ${matchCount}/${neededNames.size} cards`);
  return lookup;
}

function computeDeckPrices(decklists, priceLookup) {
  console.log('Computing deck prices...');
  const decks = {};

  for (const deckId of Object.keys(decklists)) {
    const cards = decklists[deckId];
    const cardPrices = [];
    let totalValue = 0;

    for (const card of cards) {
      const priceStr = priceLookup.get(card.name);
      const price = priceStr ? parseFloat(priceStr) : 0;
      const lineTotal = price * card.quantity;

      cardPrices.push({
        name: card.name,
        quantity: card.quantity,
        usd: priceStr,
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

  return decks;
}

async function main() {
  try {
    const decklists = loadDecklists();

    if (Object.keys(decklists).length === 0) {
      console.error('No decklists found. Run import-decklist.js first.');
      process.exit(1);
    }

    const neededNames = collectUniqueCardNames(decklists);

    const downloadUrl = await getBulkDataUrl();
    const allCards = await downloadBulkData(downloadUrl);
    const priceLookup = buildPriceLookup(allCards, neededNames);
    const decks = computeDeckPrices(decklists, priceLookup);

    const output = {
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
