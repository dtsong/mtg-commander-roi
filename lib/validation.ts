import { z } from 'zod';

const MAX_CARDS = 150;
const MAX_QUANTITY_PER_CARD = 10;
const MAX_CARD_NAME_LENGTH = 200;

const dangerousPatterns = /[<>{}[\]\\]/g;

function sanitizeCardName(name: string): string {
  return name
    .replace(dangerousPatterns, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const CardNameSchema = z
  .string()
  .min(1, 'Card name cannot be empty')
  .max(MAX_CARD_NAME_LENGTH, `Card name cannot exceed ${MAX_CARD_NAME_LENGTH} characters`)
  .transform(sanitizeCardName)
  .refine((name) => name.length > 0, 'Card name cannot be empty after sanitization');

const CardQuantitySchema = z
  .number()
  .int('Quantity must be a whole number')
  .min(1, 'Quantity must be at least 1')
  .max(MAX_QUANTITY_PER_CARD, `Quantity cannot exceed ${MAX_QUANTITY_PER_CARD}`);

export const DeckEntrySchema = z.object({
  name: CardNameSchema,
  quantity: CardQuantitySchema,
});

export const DeckListSchema = z
  .array(DeckEntrySchema)
  .max(MAX_CARDS, `Decklist cannot exceed ${MAX_CARDS} cards`);

export type DeckEntry = z.infer<typeof DeckEntrySchema>;
export type DeckList = z.infer<typeof DeckListSchema>;

export interface ParsedDeckResult {
  success: true;
  data: DeckList;
  warnings: string[];
}

export interface ParsedDeckError {
  success: false;
  errors: string[];
}

export type ParseDeckResponse = ParsedDeckResult | ParsedDeckError;

export function parseDecklistText(text: string): ParseDeckResponse {
  const lines = text.split('\n').filter((line) => line.trim());
  const entries: { name: string; quantity: number }[] = [];
  const warnings: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    const match = line.match(/^(\d+)?\s*x?\s*(.+)$/i);
    if (!match) {
      warnings.push(`Line ${lineNum}: Could not parse "${line.slice(0, 30)}..."`);
      continue;
    }

    const rawQuantity = parseInt(match[1]) || 1;
    const rawName = match[2].trim();

    const quantityResult = CardQuantitySchema.safeParse(rawQuantity);
    if (!quantityResult.success) {
      const clampedQty = Math.min(Math.max(rawQuantity, 1), MAX_QUANTITY_PER_CARD);
      warnings.push(`Line ${lineNum}: Quantity clamped to ${clampedQty}`);
      entries.push({ name: rawName, quantity: clampedQty });
      continue;
    }

    const nameResult = CardNameSchema.safeParse(rawName);
    if (!nameResult.success) {
      warnings.push(`Line ${lineNum}: Skipped invalid card name`);
      continue;
    }

    entries.push({ name: nameResult.data, quantity: quantityResult.data });
  }

  if (entries.length === 0) {
    return { success: false, errors: ['No valid cards found in decklist'] };
  }

  if (entries.length > MAX_CARDS) {
    warnings.push(`Decklist truncated from ${entries.length} to ${MAX_CARDS} cards`);
    entries.length = MAX_CARDS;
  }

  const result = DeckListSchema.safeParse(entries);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map((issue) => issue.message),
    };
  }

  return { success: true, data: result.data, warnings };
}

export { MAX_CARDS, MAX_QUANTITY_PER_CARD, MAX_CARD_NAME_LENGTH };
