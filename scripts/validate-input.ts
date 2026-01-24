import type { Decklists, LowestListingsData } from '../types';

export function validateDecklists(data: unknown): Decklists {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('Invalid decklists: expected an object');
  }

  const obj = data as Record<string, unknown>;
  for (const [deckId, cards] of Object.entries(obj)) {
    if (!Array.isArray(cards)) {
      throw new Error(`Invalid decklists: deck "${deckId}" is not an array`);
    }
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (typeof card !== 'object' || card === null) {
        throw new Error(`Invalid decklists: deck "${deckId}" card[${i}] is not an object`);
      }
      if (typeof card.name !== 'string' || card.name.length === 0) {
        throw new Error(`Invalid decklists: deck "${deckId}" card[${i}] missing name`);
      }
      if (typeof card.quantity !== 'number' || card.quantity < 1) {
        throw new Error(`Invalid decklists: deck "${deckId}" card "${card.name}" has invalid quantity`);
      }
    }
  }

  return obj as unknown as Decklists;
}

interface PriceDataShape {
  updatedAt: string;
  decks: Record<string, {
    totalValue: number;
    cardCount: number;
    cards: Array<{
      name: string;
      quantity: number;
      usd?: string | null;
    }>;
  }>;
}

export function validatePriceData(data: unknown): PriceDataShape {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('Invalid price data: expected an object');
  }

  const obj = data as Record<string, unknown>;
  if (typeof obj.updatedAt !== 'string') {
    throw new Error('Invalid price data: missing "updatedAt" string');
  }
  if (typeof obj.decks !== 'object' || obj.decks === null || Array.isArray(obj.decks)) {
    throw new Error('Invalid price data: missing "decks" object');
  }

  const decks = obj.decks as Record<string, unknown>;
  for (const [deckId, deck] of Object.entries(decks)) {
    if (typeof deck !== 'object' || deck === null) {
      throw new Error(`Invalid price data: deck "${deckId}" is not an object`);
    }
    const d = deck as Record<string, unknown>;
    if (typeof d.totalValue !== 'number') {
      throw new Error(`Invalid price data: deck "${deckId}" missing numeric totalValue`);
    }
    if (typeof d.cardCount !== 'number') {
      throw new Error(`Invalid price data: deck "${deckId}" missing numeric cardCount`);
    }
    if (!Array.isArray(d.cards)) {
      throw new Error(`Invalid price data: deck "${deckId}" missing cards array`);
    }
  }

  return data as PriceDataShape;
}

export function validateLowestListings(data: unknown): LowestListingsData {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('Invalid lowest listings: expected an object');
  }

  const obj = data as Record<string, unknown>;
  if (typeof obj.updatedAt !== 'string') {
    throw new Error('Invalid lowest listings: missing "updatedAt" string');
  }
  if (typeof obj.cards !== 'object' || obj.cards === null || Array.isArray(obj.cards)) {
    throw new Error('Invalid lowest listings: missing "cards" object');
  }

  return data as LowestListingsData;
}
