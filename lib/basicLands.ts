const BASIC_LAND_NAMES = new Set([
  'Plains',
  'Island',
  'Swamp',
  'Mountain',
  'Forest',
  'Wastes',
]);

export function isBasicLand(cardName: string): boolean {
  return BASIC_LAND_NAMES.has(cardName);
}
