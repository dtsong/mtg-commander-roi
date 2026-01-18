import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { Decklists } from '../types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DECKLISTS_PATH = join(__dirname, '..', 'public', 'data', 'decklists.json');
const PRICES_PATH = join(__dirname, '..', 'public', 'data', 'prices.json');

interface PricesCard {
  name: string;
  quantity: number;
  usd: string | null;
  isCommander?: boolean;
}

interface PricesDeck {
  totalValue: number;
  cardCount: number;
  cards: PricesCard[];
}

interface PricesData {
  updatedAt: string;
  decks: Record<string, PricesDeck>;
}

function main(): void {
  console.log('Loading decklists...');
  const decklists: Decklists = JSON.parse(readFileSync(DECKLISTS_PATH, 'utf-8'));

  console.log('Loading prices...');
  const prices: PricesData = JSON.parse(readFileSync(PRICES_PATH, 'utf-8'));

  let updatedCount = 0;

  for (const deckId of Object.keys(prices.decks)) {
    const deckCards = decklists[deckId];
    if (!deckCards) continue;

    const commanderNames = new Set(
      deckCards.filter(c => c.isCommander).map(c => c.name)
    );

    for (const card of prices.decks[deckId].cards) {
      if (commanderNames.has(card.name)) {
        card.isCommander = true;
        updatedCount++;
      }
    }
  }

  console.log('\nWriting updated prices...');
  writeFileSync(PRICES_PATH, JSON.stringify(prices, null, 2));

  console.log(`\nPatched ${updatedCount} commander cards in prices.json`);
}

main();
