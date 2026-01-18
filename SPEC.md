# MTG Commander Deck ROI Assessment Tool - Specification

## Project Overview

**Project Name:** MTG Commander ROI Analyzer  
**Client:** JinkiesCo (Frank)  
**Purpose:** Assess the ROI (Return on Investment) of Magic: The Gathering Commander preconstructed decks by comparing current card market values against original MSRP.

---

## Core Requirements

### Functional Requirements

1. **Deck Database Management**
   - Pre-loaded database of Commander precons (2022-2024+)
   - Ability to add custom decks with name, set, MSRP, and year
   - Filter decks by release year
   - Easy process to add new precons as they release

2. **Card Price Retrieval**
   - Integration with Scryfall API for real-time card prices
   - Support for loading all cards in a set by set code
   - Individual card search by name
   - Bulk card import from pasted decklists

3. **ROI Calculation**
   - Calculate total deck value from individual card prices
   - Compare current value against original MSRP
   - Display ROI as percentage (positive/negative)
   - Show value difference in dollars

4. **User Interface**
   - Deck selection panel with precon list
   - ROI summary dashboard
   - Card list sorted by value
   - Top 5 most valuable cards display
   - Card images from Scryfall

---

## Technical Specification

### Technology Stack

```
Frontend:     React 18+
Styling:      Tailwind CSS
Icons:        Lucide React
API:          Scryfall REST API (https://api.scryfall.com)
State:        React hooks (useState, useEffect, useCallback)
```

### Scryfall API Integration

**Base URL:** `https://api.scryfall.com`

**Required Headers:**
```javascript
{
  'Accept': 'application/json',
  'User-Agent': 'JinkiesCo-MTG-ROI-Tool/1.0'
}
```

**Rate Limiting:** 100ms minimum delay between requests

**Endpoints Used:**

| Endpoint | Purpose |
|----------|---------|
| `GET /cards/search?q=set:{code}&unique=cards` | Load all cards in a set |
| `GET /cards/search?q={query}&unique=prints` | Search cards by name |
| `GET /cards/named?fuzzy={name}` | Get specific card by name |

**Price Fields:**
- `prices.usd` - Non-foil USD price
- `prices.usd_foil` - Foil USD price
- `prices.eur` - EUR price
- `prices.tix` - MTGO tickets

---

## Data Models

### Deck Object

```typescript
interface Deck {
  id: string;           // Unique identifier (format: "setcode-deckname")
  name: string;         // Display name
  set: string;          // Parent set name
  year: number;         // Release year
  msrp: number;         // Original retail price in USD
  setCode: string;      // Scryfall 3-letter set code
  colors: string[];     // Color identity: 'W', 'U', 'B', 'R', 'G', 'C'
  isCustom?: boolean;   // True for user-added decks
}
```

### Card Object (Scryfall Response)

```typescript
interface Card {
  id: string;
  name: string;
  set: string;
  set_name: string;
  collector_number: string;
  prices: {
    usd: string | null;
    usd_foil: string | null;
    eur: string | null;
    tix: string | null;
  };
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    art_crop: string;
  };
  card_faces?: CardFace[];  // For double-faced cards
}
```

---

## Precon Database

### Structure

Add new precons to the `PRECON_DATABASE` array:

```javascript
const PRECON_DATABASE = [
  {
    id: 'dsk-endless-punishment',
    name: 'Endless Punishment',
    set: 'Duskmourn',
    year: 2024,
    msrp: 47.99,
    setCode: 'dsc',
    colors: ['B', 'R']
  },
  // ... more decks
];
```

### Current Database (2022-2024)

**2024 Releases:**
- Duskmourn (4 decks) - setCode: `dsc` - MSRP: $47.99
- Bloomburrow (4 decks) - setCode: `blc` - MSRP: $47.99
- Modern Horizons 3 (4 decks) - setCode: `m3c` - MSRP: $59.99
- Outlaws of Thunder Junction (4 decks) - setCode: `otc` - MSRP: $47.99
- Fallout (4 decks) - setCode: `pip` - MSRP: $59.99
- Murders at Karlov Manor (4 decks) - setCode: `mkc` - MSRP: $47.99

**2023 Releases:**
- Lost Caverns of Ixalan (4 decks) - setCode: `lcc` - MSRP: $44.99
- Doctor Who (4 decks) - setCode: `who` - MSRP: $54.99
- Wilds of Eldraine (2 decks) - setCode: `woc` - MSRP: $44.99
- Commander Masters (4 decks) - setCode: `cmc` - MSRP: $64.99
- LOTR: Tales of Middle-earth (4 decks) - setCode: `ltc` - MSRP: $54.99

**2022 Releases:**
- Warhammer 40,000 (4 decks) - setCode: `40k` - MSRP: $59.99

### Adding New Precons

1. Find set code at: https://scryfall.com/sets?type=commander
2. Add entry to `PRECON_DATABASE` array
3. Required fields: id, name, set, year, msrp, setCode, colors

---

## UI Components

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                 │
│  - Logo & Title                                         │
│  - "Add Custom Deck" button                             │
├──────────────────┬──────────────────────────────────────┤
│  Left Panel      │  Right Panel                         │
│  (col-span-4)    │  (col-span-8)                        │
│                  │                                      │
│  - Year Filter   │  - ROI Summary Card                  │
│  - Precon List   │  - Card Search                       │
│  - Custom Decks  │  - Bulk Import                       │
│                  │  - Card List                         │
│                  │  - Top 5 Value Cards                 │
└──────────────────┴──────────────────────────────────────┘
```

### Component Hierarchy

```
MTGROITool (root)
├── Header
├── DeckSelector
│   ├── YearFilter
│   ├── PreconList
│   └── CustomDeckList
├── ROISummary
│   ├── MSRPDisplay
│   ├── CurrentValueDisplay
│   ├── ROIBadge
│   └── ValueDifference
├── CardSearch
│   └── SearchResults
├── BulkImport
├── CardList
│   └── CardPriceRow
├── TopValueCards
└── AddDeckModal
```

### Color Scheme

```css
/* Primary */
--purple-600: #7C3AED;
--purple-700: #6D28D9;

/* Success/Positive ROI */
--green-600: #16A34A;

/* Danger/Negative ROI */
--red-600: #DC2626;

/* Background */
--gradient: from-slate-900 via-purple-900 to-slate-900;

/* MTG Colors */
--white-mana: #F9FAFB (amber-100)
--blue-mana: #DBEAFE (blue-100)
--black-mana: #1F2937 (gray-800)
--red-mana: #FEE2E2 (red-100)
--green-mana: #DCFCE7 (green-100)
--colorless: #E5E7EB (gray-200)
```

---

## Key Functions

### Rate-Limited Fetch

```javascript
const RATE_LIMIT_MS = 100;
let lastRequestTime = 0;

const rateLimitedFetch = async (url) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise(resolve => 
      setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest)
    );
  }
  lastRequestTime = Date.now();
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });
  
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
};
```

### ROI Calculation

```javascript
const calculateROI = (currentValue, originalMSRP) => {
  return ((currentValue - originalMSRP) / originalMSRP) * 100;
};

const calculateTotalValue = (cards) => {
  return cards.reduce((sum, card) => {
    const price = parseFloat(card.prices?.usd || card.prices?.usd_foil || 0);
    return sum + price;
  }, 0);
};
```

### Load Set Cards

```javascript
const loadSetCards = async (setCode) => {
  let allCards = [];
  let url = `${SCRYFALL_API}/cards/search?q=set:${setCode}&unique=cards`;
  
  while (url) {
    const data = await rateLimitedFetch(url);
    allCards = [...allCards, ...(data.data || [])];
    url = data.next_page || null;
  }
  
  return allCards;
};
```

---

## File Structure (Target)

```
mtg-roi-tool/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── DeckSelector.jsx
│   │   ├── ROISummary.jsx
│   │   ├── CardSearch.jsx
│   │   ├── CardList.jsx
│   │   ├── CardPriceRow.jsx
│   │   ├── TopValueCards.jsx
│   │   ├── BulkImport.jsx
│   │   ├── AddDeckModal.jsx
│   │   ├── ColorIndicator.jsx
│   │   └── ROIBadge.jsx
│   ├── data/
│   │   └── precons.js
│   ├── utils/
│   │   ├── scryfall.js
│   │   └── calculations.js
│   ├── hooks/
│   │   └── useScryfall.js
│   └── styles/
│       └── index.css
├── public/
│   └── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── SPEC.md
└── README.md
```

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.2",
    "vite": "^4.3.9"
  }
}
```

---

## API Compliance

### Scryfall Requirements (Must Follow)

1. **Rate Limiting:** 50-100ms delay between requests
2. **User-Agent:** Must include application name
3. **Attribution:** Credit Scryfall in UI
4. **No Paywalling:** Data must be freely accessible
5. **Image Guidelines:** Don't crop/modify card images

### Attribution Text

```
Card data and prices provided by Scryfall. Prices update daily.
```

---

## Future Enhancements (Backlog)

### Phase 2
- [ ] Price history charts (line graph over time)
- [ ] Export analysis to PDF/CSV
- [ ] Side-by-side deck comparison
- [ ] TCGPlayer/CardMarket purchase links
- [ ] Price threshold alerts

### Phase 3
- [ ] User authentication
- [ ] Saved deck portfolios
- [ ] Backend API with caching
- [ ] Auto-discovery of new precons
- [ ] Mobile-responsive design

---

## Development Notes

### Known Scryfall Set Codes

| Set | Code | Year |
|-----|------|------|
| Duskmourn Commander | dsc | 2024 |
| Bloomburrow Commander | blc | 2024 |
| Modern Horizons 3 Commander | m3c | 2024 |
| Thunder Junction Commander | otc | 2024 |
| Fallout | pip | 2024 |
| Karlov Manor Commander | mkc | 2024 |
| Lost Caverns Commander | lcc | 2023 |
| Doctor Who | who | 2023 |
| Wilds of Eldraine Commander | woc | 2023 |
| Commander Masters | cmc | 2023 |
| LOTR Commander | ltc | 2023 |
| Warhammer 40k | 40k | 2022 |

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Cards not loading | Verify set code at scryfall.com/sets |
| $0 prices | New cards may lack market data (wait 1 week) |
| 429 errors | Increase RATE_LIMIT_MS |
| CORS errors | Deploy to proper hosting (not file://) |
| Missing images | Check card_faces array for DFCs |

---

## Quick Commands

### Option A: Using Bun (Recommended)

Bun is a fast all-in-one JavaScript runtime and package manager.

```bash
# Install Bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# Create project with Bun
bun create vite mtg-roi-tool --template react
cd mtg-roi-tool

# Install dependencies (much faster than npm)
bun add lucide-react
bun add -d tailwindcss postcss autoprefixer

# Initialize Tailwind
bunx tailwindcss init -p

# Development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

**Why Bun?**
- 10-25x faster package installs than npm
- Built-in TypeScript support
- Faster dev server startup
- Drop-in replacement for npm/node

### Option B: Using npm (Traditional)

```bash
# Initialize project
npm create vite@latest mtg-roi-tool -- --template react
cd mtg-roi-tool
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview
```

---

*Specification v1.0 - January 2026*
