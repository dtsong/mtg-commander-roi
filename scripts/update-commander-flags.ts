import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { Decklists } from '../types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DECKLISTS_PATH = join(__dirname, '..', 'public', 'data', 'decklists.json');

function main(): void {
  console.log('Loading decklists...');
  const decklists: Decklists = JSON.parse(readFileSync(DECKLISTS_PATH, 'utf-8'));

  const deckIds = Object.keys(decklists);
  console.log(`Found ${deckIds.length} decks\n`);

  let updatedCount = 0;
  let alreadyFlaggedCount = 0;

  for (const deckId of deckIds) {
    const cards = decklists[deckId];
    if (!cards || cards.length === 0) continue;

    const firstCard = cards[0];
    if (firstCard.isCommander) {
      alreadyFlaggedCount++;
      continue;
    }

    firstCard.isCommander = true;
    updatedCount++;
    console.log(`[${deckId}] Marked "${firstCard.name}" as commander`);
  }

  console.log('\nWriting updated decklists...');
  writeFileSync(DECKLISTS_PATH, JSON.stringify(decklists, null, 2));

  console.log('\nMigration complete!');
  console.log(`  Updated: ${updatedCount} decks`);
  console.log(`  Already flagged: ${alreadyFlaggedCount} decks`);
}

main();
