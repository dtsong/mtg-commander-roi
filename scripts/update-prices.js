import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SET_CODES = [
  // 2026
  'ecc',
  // 2025
  'eoc', 'fic', 'tdc', 'drc',
  // 2024
  'dsc', 'blc', 'm3c', 'otc', 'pip', 'mkc',
  // 2023
  'lcc', 'who', 'woc', 'cmm', 'ltc',
  // 2022
  '40k',
];
const BULK_DATA_URL = 'https://api.scryfall.com/bulk-data/default-cards';
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

function filterAndTransform(cards) {
  const setCodeSet = new Set(SET_CODES);
  const sets = {};

  for (const setCode of SET_CODES) {
    sets[setCode] = [];
  }

  let matchCount = 0;
  for (const card of cards) {
    const setCode = card.set?.toLowerCase();
    if (!setCodeSet.has(setCode)) continue;

    matchCount++;
    const usd = card.prices?.usd;
    const usdFoil = card.prices?.usd_foil;
    const price = usd || usdFoil || null;

    sets[setCode].push({
      name: card.name,
      collector_number: card.collector_number,
      usd: price,
    });
  }

  console.log(`Found ${matchCount} cards matching our set codes`);
  return sets;
}

async function main() {
  try {
    const downloadUrl = await getBulkDataUrl();
    const allCards = await downloadBulkData(downloadUrl);
    const sets = filterAndTransform(allCards);

    const output = {
      updatedAt: new Date().toISOString(),
      sets,
    };

    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

    console.log(`Wrote prices to ${OUTPUT_PATH}`);

    let totalCards = 0;
    for (const setCode of SET_CODES) {
      const count = sets[setCode].length;
      totalCards += count;
      console.log(`  ${setCode}: ${count} cards`);
    }
    console.log(`Total: ${totalCards} cards`);
  } catch (error) {
    console.error('Failed to update prices:', error);
    process.exit(1);
  }
}

main();
