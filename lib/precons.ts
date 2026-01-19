import type { PreconDeck, DeckCardEntry, Decklists } from '@/types';

export const PRECON_DATABASE: PreconDeck[] = [
  // 2026 - Lorwyn Eclipsed
  { id: 'ecc-dance-of-the-elements', name: 'Dance of the Elements', set: 'Lorwyn Eclipsed', year: 2026, msrp: 49.99, setCode: 'ecc', colors: ['W', 'U', 'B', 'R', 'G'], edhrec: 'dance-of-the-elements' },
  { id: 'ecc-blight-curse', name: 'Blight Curse', set: 'Lorwyn Eclipsed', year: 2026, msrp: 49.99, setCode: 'ecc', colors: ['B', 'R', 'G'], edhrec: 'blight-curse' },

  // 2025 - Edge of Eternities
  { id: 'eoc-counter-intelligence', name: 'Counter Intelligence', set: 'Edge of Eternities', year: 2025, msrp: 47.99, setCode: 'eoc', colors: ['W', 'U', 'R'], edhrec: 'counter-intelligence' },
  { id: 'eoc-world-shaper', name: 'World Shaper', set: 'Edge of Eternities', year: 2025, msrp: 47.99, setCode: 'eoc', colors: ['B', 'R', 'G'], edhrec: 'world-shaper' },

  // 2025 - Final Fantasy
  { id: 'fic-revival-trance', name: 'Revival Trance', set: 'Final Fantasy', year: 2025, msrp: 69.99, setCode: 'fic', colors: ['W', 'B', 'R'], edhrec: 'revival-trance' },
  { id: 'fic-limit-break', name: 'Limit Break', set: 'Final Fantasy', year: 2025, msrp: 69.99, setCode: 'fic', colors: ['W', 'R', 'G'], edhrec: 'limit-break' },
  { id: 'fic-counter-blitz', name: 'Counter Blitz', set: 'Final Fantasy', year: 2025, msrp: 69.99, setCode: 'fic', colors: ['W', 'U', 'G'], edhrec: 'counter-blitz' },
  { id: 'fic-scions-and-spellcraft', name: 'Scions & Spellcraft', set: 'Final Fantasy', year: 2025, msrp: 69.99, setCode: 'fic', colors: ['W', 'U', 'B'], edhrec: 'scions-spellcraft' },

  // 2025 - Tarkir: Dragonstorm
  { id: 'tdc-temur-roar', name: 'Temur Roar', set: 'Tarkir: Dragonstorm', year: 2025, msrp: 47.99, setCode: 'tdc', colors: ['U', 'R', 'G'], edhrec: 'temur-roar' },
  { id: 'tdc-abzan-armor', name: 'Abzan Armor', set: 'Tarkir: Dragonstorm', year: 2025, msrp: 47.99, setCode: 'tdc', colors: ['W', 'B', 'G'], edhrec: 'abzan-armor' },
  { id: 'tdc-jeskai-striker', name: 'Jeskai Striker', set: 'Tarkir: Dragonstorm', year: 2025, msrp: 47.99, setCode: 'tdc', colors: ['W', 'U', 'R'], edhrec: 'jeskai-striker' },
  { id: 'tdc-sultai-arisen', name: 'Sultai Arisen', set: 'Tarkir: Dragonstorm', year: 2025, msrp: 47.99, setCode: 'tdc', colors: ['U', 'B', 'G'], edhrec: 'sultai-arisen' },
  { id: 'tdc-mardu-surge', name: 'Mardu Surge', set: 'Tarkir: Dragonstorm', year: 2025, msrp: 47.99, setCode: 'tdc', colors: ['W', 'B', 'R'], edhrec: 'mardu-surge' },

  // 2025 - Aetherdrift
  { id: 'drc-living-energy', name: 'Living Energy', set: 'Aetherdrift', year: 2025, msrp: 47.99, setCode: 'drc', colors: ['U', 'R', 'G'], edhrec: 'living-energy' },
  { id: 'drc-eternal-might', name: 'Eternal Might', set: 'Aetherdrift', year: 2025, msrp: 47.99, setCode: 'drc', colors: ['W', 'U', 'B'], edhrec: 'eternal-might' },

  // 2024 - Duskmourn
  { id: 'dsc-endless-punishment', name: 'Endless Punishment', set: 'Duskmourn', year: 2024, msrp: 47.99, setCode: 'dsc', colors: ['B', 'R'], edhrec: 'endless-punishment' },
  { id: 'dsc-jump-scare', name: 'Jump Scare!', set: 'Duskmourn', year: 2024, msrp: 47.99, setCode: 'dsc', colors: ['W', 'U'], edhrec: 'jump-scare' },
  { id: 'dsc-miracle-worker', name: 'Miracle Worker', set: 'Duskmourn', year: 2024, msrp: 47.99, setCode: 'dsc', colors: ['W', 'B'], edhrec: 'miracle-worker' },
  { id: 'dsc-haunted-lands', name: 'Haunted Lands', set: 'Duskmourn', year: 2024, msrp: 47.99, setCode: 'dsc', colors: ['B', 'G'], edhrec: 'haunted-lands' },

  // 2024 - Bloomburrow
  { id: 'blc-squirreled-away', name: 'Squirreled Away', set: 'Bloomburrow', year: 2024, msrp: 47.99, setCode: 'blc', colors: ['B', 'G'], edhrec: 'squirreled-away' },
  { id: 'blc-family-matters', name: 'Family Matters', set: 'Bloomburrow', year: 2024, msrp: 47.99, setCode: 'blc', colors: ['W', 'R'], edhrec: 'family-matters' },
  { id: 'blc-animated-army', name: 'Animated Army', set: 'Bloomburrow', year: 2024, msrp: 47.99, setCode: 'blc', colors: ['W', 'U'], edhrec: 'animated-army' },
  { id: 'blc-peace-offering', name: 'Peace Offering', set: 'Bloomburrow', year: 2024, msrp: 47.99, setCode: 'blc', colors: ['W', 'B'], edhrec: 'peace-offering' },

  // 2024 - Modern Horizons 3
  { id: 'm3c-graveyard-overdrive', name: 'Graveyard Overdrive', set: 'Modern Horizons 3', year: 2024, msrp: 59.99, setCode: 'm3c', colors: ['B', 'R'], edhrec: 'graveyard-overdrive' },
  { id: 'm3c-creative-energy', name: 'Creative Energy', set: 'Modern Horizons 3', year: 2024, msrp: 59.99, setCode: 'm3c', colors: ['W', 'U', 'R'], edhrec: 'creative-energy' },
  { id: 'm3c-tricky-terrain', name: 'Tricky Terrain', set: 'Modern Horizons 3', year: 2024, msrp: 59.99, setCode: 'm3c', colors: ['U', 'G'], edhrec: 'tricky-terrain' },
  { id: 'm3c-eldrazi-incursion', name: 'Eldrazi Incursion', set: 'Modern Horizons 3', year: 2024, msrp: 59.99, setCode: 'm3c', colors: ['C'], edhrec: 'eldrazi-incursion' },

  // 2024 - Outlaws of Thunder Junction
  { id: 'otc-quick-draw', name: 'Quick Draw', set: 'Outlaws of Thunder Junction', year: 2024, msrp: 47.99, setCode: 'otc', colors: ['U', 'R'], edhrec: 'quick-draw' },
  { id: 'otc-most-wanted', name: 'Most Wanted', set: 'Outlaws of Thunder Junction', year: 2024, msrp: 47.99, setCode: 'otc', colors: ['W', 'B', 'G'], edhrec: 'most-wanted' },
  { id: 'otc-grand-larceny', name: 'Grand Larceny', set: 'Outlaws of Thunder Junction', year: 2024, msrp: 47.99, setCode: 'otc', colors: ['U', 'B', 'G'], edhrec: 'grand-larceny' },
  { id: 'otc-desert-bloom', name: 'Desert Bloom', set: 'Outlaws of Thunder Junction', year: 2024, msrp: 47.99, setCode: 'otc', colors: ['R', 'G', 'W'], edhrec: 'desert-bloom' },

  // 2024 - Fallout
  { id: 'pip-scrappy-survivors', name: 'Scrappy Survivors', set: 'Fallout', year: 2024, msrp: 59.99, setCode: 'pip', colors: ['R', 'G', 'W'], edhrec: 'scrappy-survivors' },
  { id: 'pip-mutant-menace', name: 'Mutant Menace', set: 'Fallout', year: 2024, msrp: 59.99, setCode: 'pip', colors: ['U', 'B', 'G'], edhrec: 'mutant-menace' },
  { id: 'pip-science', name: 'Science!', set: 'Fallout', year: 2024, msrp: 59.99, setCode: 'pip', colors: ['U', 'R', 'W'], edhrec: 'science' },
  { id: 'pip-hail-caesar', name: 'Hail, Caesar', set: 'Fallout', year: 2024, msrp: 59.99, setCode: 'pip', colors: ['R', 'W', 'B'], edhrec: 'hail-caesar' },

  // 2024 - Murders at Karlov Manor
  { id: 'mkc-deadly-disguise', name: 'Deadly Disguise', set: 'Murders at Karlov Manor', year: 2024, msrp: 47.99, setCode: 'mkc', colors: ['B', 'G', 'U'], edhrec: 'deadly-disguise' },
  { id: 'mkc-blame-game', name: 'Blame Game', set: 'Murders at Karlov Manor', year: 2024, msrp: 47.99, setCode: 'mkc', colors: ['R', 'W'], edhrec: 'blame-game' },
  { id: 'mkc-deep-clue-sea', name: 'Deep Clue Sea', set: 'Murders at Karlov Manor', year: 2024, msrp: 47.99, setCode: 'mkc', colors: ['U', 'W'], edhrec: 'deep-clue-sea' },
  { id: 'mkc-revenant-recon', name: 'Revenant Recon', set: 'Murders at Karlov Manor', year: 2024, msrp: 47.99, setCode: 'mkc', colors: ['W', 'B'], edhrec: 'revenant-recon' },

  // 2023 - Lost Caverns of Ixalan
  { id: 'lcc-ahoy-mateys', name: 'Ahoy Mateys', set: 'Lost Caverns of Ixalan', year: 2023, msrp: 44.99, setCode: 'lcc', colors: ['U', 'B'], edhrec: 'ahoy-mateys' },
  { id: 'lcc-blood-rites', name: 'Blood Rites', set: 'Lost Caverns of Ixalan', year: 2023, msrp: 44.99, setCode: 'lcc', colors: ['R', 'W', 'B'], edhrec: 'blood-rites' },
  { id: 'lcc-explorers-of-the-deep', name: 'Explorers of the Deep', set: 'Lost Caverns of Ixalan', year: 2023, msrp: 44.99, setCode: 'lcc', colors: ['U', 'G'], edhrec: 'explorers-of-the-deep' },
  { id: 'lcc-veloci-ramp-tor', name: 'Veloci-Ramp-Tor', set: 'Lost Caverns of Ixalan', year: 2023, msrp: 44.99, setCode: 'lcc', colors: ['R', 'G'], edhrec: 'veloci-ramp-tor' },

  // 2023 - Doctor Who
  { id: 'who-blast-from-the-past', name: 'Blast from the Past', set: 'Doctor Who', year: 2023, msrp: 54.99, setCode: 'who', colors: ['R', 'G', 'W'], edhrec: 'blast-from-the-past' },
  { id: 'who-timey-wimey', name: 'Timey-Wimey', set: 'Doctor Who', year: 2023, msrp: 54.99, setCode: 'who', colors: ['W', 'U'], edhrec: 'timey-wimey' },
  { id: 'who-paradox-power', name: 'Paradox Power', set: 'Doctor Who', year: 2023, msrp: 54.99, setCode: 'who', colors: ['U', 'R', 'G'], edhrec: 'paradox-power' },
  { id: 'who-masters-of-evil', name: 'Masters of Evil', set: 'Doctor Who', year: 2023, msrp: 54.99, setCode: 'who', colors: ['U', 'B', 'R'], edhrec: 'masters-of-evil' },

  // 2023 - Wilds of Eldraine
  { id: 'woc-fae-dominion', name: 'Fae Dominion', set: 'Wilds of Eldraine', year: 2023, msrp: 44.99, setCode: 'woc', colors: ['U', 'B'], edhrec: 'fae-dominion' },
  { id: 'woc-virtue-and-valor', name: 'Virtue and Valor', set: 'Wilds of Eldraine', year: 2023, msrp: 44.99, setCode: 'woc', colors: ['G', 'W'], edhrec: 'virtue-and-valor' },

  // 2023 - Commander Masters
  { id: 'cmc-eldrazi-unbound', name: 'Eldrazi Unbound', set: 'Commander Masters', year: 2023, msrp: 64.99, setCode: 'cmm', colors: ['C'], edhrec: 'eldrazi-unbound' },
  { id: 'cmc-enduring-enchantments', name: 'Enduring Enchantments', set: 'Commander Masters', year: 2023, msrp: 64.99, setCode: 'cmm', colors: ['W', 'B', 'G'], edhrec: 'enduring-enchantments' },
  { id: 'cmc-planeswalker-party', name: 'Planeswalker Party', set: 'Commander Masters', year: 2023, msrp: 64.99, setCode: 'cmm', colors: ['W', 'U', 'R'], edhrec: 'planeswalker-party' },
  { id: 'cmc-sliver-swarm', name: 'Sliver Swarm', set: 'Commander Masters', year: 2023, msrp: 64.99, setCode: 'cmm', colors: ['W', 'U', 'B', 'R', 'G'], edhrec: 'sliver-swarm' },

  // 2023 - LOTR: Tales of Middle-earth
  { id: 'ltc-riders-of-rohan', name: 'Riders of Rohan', set: 'LOTR: Tales of Middle-earth', year: 2023, msrp: 54.99, setCode: 'ltc', colors: ['U', 'R', 'W'], edhrec: 'riders-of-rohan' },
  { id: 'ltc-elven-council', name: 'Elven Council', set: 'LOTR: Tales of Middle-earth', year: 2023, msrp: 54.99, setCode: 'ltc', colors: ['U', 'G'], edhrec: 'elven-council' },
  { id: 'ltc-food-and-fellowship', name: 'Food and Fellowship', set: 'LOTR: Tales of Middle-earth', year: 2023, msrp: 54.99, setCode: 'ltc', colors: ['W', 'B', 'G'], edhrec: 'food-and-fellowship' },
  { id: 'ltc-hosts-of-mordor', name: 'Hosts of Mordor', set: 'LOTR: Tales of Middle-earth', year: 2023, msrp: 54.99, setCode: 'ltc', colors: ['U', 'B', 'R'], edhrec: 'hosts-of-mordor' },

  // 2022 - Warhammer 40,000
  { id: '40k-forces-of-the-imperium', name: 'Forces of the Imperium', set: 'Warhammer 40,000', year: 2022, msrp: 59.99, setCode: '40k', colors: ['W', 'U', 'B'], edhrec: 'forces-of-the-imperium' },
  { id: '40k-necron-dynasties', name: 'Necron Dynasties', set: 'Warhammer 40,000', year: 2022, msrp: 59.99, setCode: '40k', colors: ['B'], edhrec: 'necron-dynasties' },
  { id: '40k-the-ruinous-powers', name: 'The Ruinous Powers', set: 'Warhammer 40,000', year: 2022, msrp: 59.99, setCode: '40k', colors: ['U', 'B', 'R'], edhrec: 'the-ruinous-powers' },
  { id: '40k-tyranid-swarm', name: 'Tyranid Swarm', set: 'Warhammer 40,000', year: 2022, msrp: 59.99, setCode: '40k', colors: ['R', 'G'], edhrec: 'tyranid-swarm' },
];

export const getYears = (): number[] => [...new Set(PRECON_DATABASE.map(d => d.year))].sort((a, b) => b - a);

export const getPreconsByYear = (year: number): PreconDeck[] => PRECON_DATABASE.filter(d => d.year === year);

export const getPreconById = (id: string): PreconDeck | undefined => PRECON_DATABASE.find(d => d.id === id);

let decklistsCache: Decklists | null = null;

export async function loadDecklists(): Promise<Decklists> {
  if (decklistsCache) return decklistsCache;

  if (typeof window !== 'undefined') {
    const res = await fetch('/data/decklists.json');
    decklistsCache = await res.json() as Decklists;
  } else {
    const { readFile } = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'public', 'data', 'decklists.json');
    decklistsCache = JSON.parse(await readFile(filePath, 'utf-8')) as Decklists;
  }
  return decklistsCache;
}

export async function getDeckCards(deckId: string): Promise<DeckCardEntry[]> {
  const decklists = await loadDecklists();
  const cards = decklists[deckId] || [];

  const deck = getPreconById(deckId);
  if (!deck) return cards;

  return cards.map(card => ({
    ...card,
    setCode: deck.setCode,
  }));
}

export async function hasDeckList(deckId: string): Promise<boolean> {
  const decklists = await loadDecklists();
  return deckId in decklists && decklists[deckId].length > 0;
}
