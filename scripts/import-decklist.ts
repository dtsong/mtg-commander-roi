import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { DeckCardEntry, Decklists } from '../types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DECKLISTS_PATH = join(__dirname, '..', 'public', 'data', 'decklists.json');
const PRECONS_PATH = join(__dirname, '..', 'lib', 'precons.ts');

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

interface PreconEntry {
  id: string;
  edhrec: string;
}

interface NextDataDeck {
  commander?: string[];
  cards?: Record<string, Array<string | [string, number] | { name: string; quantity?: number }>>;
}

interface NextData {
  props?: {
    pageProps?: {
      data?: {
        deck?: NextDataDeck;
      };
    };
  };
}

async function fetchWithRetry(url: string, maxRetries: number = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MTG-Commander-ROI/1.0 (github.com/dtsong)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (error) {
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`  Attempt ${attempt + 1} failed: ${(error as Error).message}. Retrying in ${delay}ms...`);
      if (attempt === maxRetries - 1) throw error;
      await sleep(delay);
    }
  }
  throw new Error('Max retries reached');
}

function extractNextData(html: string): NextData | null {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as NextData;
  } catch {
    return null;
  }
}

function extractDeckList(nextData: NextData): DeckCardEntry[] | null {
  const deckData = nextData?.props?.pageProps?.data?.deck;
  if (!deckData) return null;

  const cards: DeckCardEntry[] = [];
  const seen = new Map<string, DeckCardEntry>();

  if (deckData.commander && Array.isArray(deckData.commander)) {
    for (const name of deckData.commander) {
      const entry: DeckCardEntry = { name, quantity: 1 };
      cards.push(entry);
      seen.set(name, entry);
    }
  }

  const cardsByType = deckData.cards;
  if (!cardsByType) return cards.length > 0 ? cards : null;

  for (const cardType of Object.keys(cardsByType)) {
    const cardsOfType = cardsByType[cardType];
    if (!Array.isArray(cardsOfType)) continue;

    for (const entry of cardsOfType) {
      let name: string;
      let qty: number;

      if (Array.isArray(entry)) {
        [name, qty] = entry as [string, number];
        qty = qty || 1;
      } else if (typeof entry === 'object' && entry !== null) {
        const objEntry = entry as { name: string; quantity?: number };
        name = objEntry.name;
        qty = objEntry.quantity || 1;
      } else {
        name = entry as string;
        qty = 1;
      }

      if (seen.has(name)) {
        seen.get(name)!.quantity += qty;
      } else {
        const cardEntry: DeckCardEntry = { name, quantity: qty };
        seen.set(name, cardEntry);
        cards.push(cardEntry);
      }
    }
  }

  return cards;
}

async function fetchDeckList(edhrecSlug: string): Promise<DeckCardEntry[] | null> {
  const url = `https://edhrec.com/precon/${edhrecSlug}`;
  console.log(`  Fetching: ${url}`);

  const response = await fetchWithRetry(url);
  const html = await response.text();

  const nextData = extractNextData(html);
  if (!nextData) {
    console.log(`  Warning: Could not find __NEXT_DATA__ for ${edhrecSlug}`);
    return null;
  }

  const cards = extractDeckList(nextData);
  if (!cards || cards.length === 0) {
    console.log(`  Warning: No cards found for ${edhrecSlug}`);
    return null;
  }

  const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);
  console.log(`  Found ${cards.length} unique cards (${totalCards} total)`);
  return cards;
}

function loadPrecons(): PreconEntry[] {
  const content = readFileSync(PRECONS_PATH, 'utf-8');
  const match = content.match(/export const PRECON_DATABASE[^=]*=\s*\[([\s\S]*?)\];/);
  if (!match) throw new Error('Could not parse PRECON_DATABASE');

  const arrayContent = match[1];
  const precons: PreconEntry[] = [];
  const entryRegex = /\{\s*id:\s*'([^']+)'[^}]*edhrec:\s*'([^']+)'[^}]*\}/g;

  let entry;
  while ((entry = entryRegex.exec(arrayContent)) !== null) {
    precons.push({ id: entry[1], edhrec: entry[2] });
  }

  return precons;
}

async function main(): Promise<void> {
  console.log('Loading precon database...');
  const precons = loadPrecons();
  console.log(`Found ${precons.length} precons\n`);

  let decklists: Decklists = {};
  try {
    decklists = JSON.parse(readFileSync(DECKLISTS_PATH, 'utf-8')) as Decklists;
  } catch {
    decklists = {};
  }

  const startIndex = process.argv[2] ? parseInt(process.argv[2], 10) : 0;
  const endIndex = process.argv[3] ? parseInt(process.argv[3], 10) : precons.length;

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (let i = startIndex; i < endIndex && i < precons.length; i++) {
    const precon = precons[i];
    console.log(`[${i + 1}/${precons.length}] ${precon.id}`);

    if (decklists[precon.id] && decklists[precon.id].length > 0) {
      console.log(`  Skipping - already imported\n`);
      skipCount++;
      continue;
    }

    try {
      const cards = await fetchDeckList(precon.edhrec);
      if (cards) {
        decklists[precon.id] = cards;
        successCount++;
        mkdirSync(dirname(DECKLISTS_PATH), { recursive: true });
        writeFileSync(DECKLISTS_PATH, JSON.stringify(decklists, null, 2));
      } else {
        failCount++;
      }
    } catch (error) {
      console.log(`  Error: ${(error as Error).message}`);
      failCount++;
    }

    await sleep(1500);
    console.log('');
  }

  console.log('Import complete!');
  console.log(`  Success: ${successCount}`);
  console.log(`  Skipped: ${skipCount}`);
  console.log(`  Failed:  ${failCount}`);
}

main().catch(console.error);
