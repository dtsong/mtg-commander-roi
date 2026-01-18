export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C';

export interface CardPrices {
  usd: string | null;
  usd_foil: string | null;
  usd_etched?: string | null;
  eur?: string | null;
  eur_foil?: string | null;
  tix?: string | null;
}

export interface ImageUris {
  small?: string;
  normal?: string;
  large?: string;
  png?: string;
  art_crop?: string;
  border_crop?: string;
}

export interface CardFace {
  name: string;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  image_uris?: ImageUris;
}

export interface ScryfallCard {
  id: string;
  name: string;
  set: string;
  set_name: string;
  collector_number: string;
  prices: CardPrices;
  image_uris?: ImageUris;
  card_faces?: CardFace[];
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  rarity?: string;
  colors?: string[];
  color_identity?: string[];
}

export interface PreconDeck {
  id: string;
  name: string;
  set: string;
  year: number;
  msrp: number;
  setCode: string;
  colors: ManaColor[];
  edhrec?: string;
  isCustom?: boolean;
}

export interface DeckCardEntry {
  name: string;
  quantity: number;
}

export interface CardWithPrice {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  image?: string | null;
}

export interface TopCard {
  name: string;
  price: number;
}

export interface DeckPriceResult {
  cards: CardWithPrice[];
  totalValue: number;
  topCards: CardWithPrice[];
  cardCount: number;
}

export type ROIVerdictLabel = 'BUY' | 'HOLD' | 'PASS';

export interface ROIVerdict {
  label: ROIVerdictLabel;
  color: string;
  bg: string;
  border: string;
}

export interface CachedPriceData {
  totalValue: number;
  topCards: TopCard[];
  cardCount: number;
  fetchedAt?: string;
}

export interface StaticPricesData {
  updatedAt: string;
  decks: Record<string, StaticDeckData>;
  sets?: Record<string, StaticCardData[]>;
}

export interface StaticDeckData {
  totalValue: number;
  cardCount: number;
  cards: StaticCardEntry[];
}

export interface StaticCardData {
  name: string;
  collector_number: string;
  usd?: string;
}

export interface StaticCardEntry {
  name: string;
  quantity: number;
  usd?: string | null;
}

export interface TrendingCard {
  name: string;
  sanitized: string;
  url?: string;
}

export interface TrendingData {
  updatedAt: string;
  dailyCommander: TrendingCard | null;
  trendingCards: TrendingCard[];
  weeklyCommanders: TrendingCard[];
}

export interface TrendingDeckInfo {
  id: string;
  name: string;
  set: string;
  year: number;
}

export interface TrendingInPrecons {
  card: TrendingCard;
  decks: TrendingDeckInfo[];
}

export interface LoadProgress {
  loaded?: number;
  hasMore?: boolean;
  fetched?: number;
  total?: number;
}

export interface FetchProgress {
  fetched: number;
  total: number;
}

export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  year: string;
  set: string;
  roiThreshold: string;
}

export interface CustomDeckFormData {
  name: string;
  set: string;
  year: number | string;
  msrp: number | string;
  setCode: string;
}

export interface BulkImportProgress {
  current: number;
  total: number;
}

export interface ParsedDeckEntry {
  name: string;
  quantity: number;
}

export type Decklists = Record<string, DeckCardEntry[]>;
