# MTG Commander ROI Analyzer

Analyze the return on investment of Magic: The Gathering Commander preconstructed decks by comparing current card market values against original MSRP. Built for collectors and resellers who want data-driven purchase decisions.

## Features

- **98 Precon Decks** - Complete coverage of Commander precons from 2022-2026
- **Deck Comparison Table** - Side-by-side comparison with sortable columns and filters
- **Distributor ROI Calculations** - Calculate ROI at wholesale pricing (40% discount default)
- **BUY/HOLD/PASS Verdicts** - Clear recommendations based on configurable ROI thresholds
- **Card Search** - Find specific cards across all decks
- **Bulk Import** - Import decklists from external sources
- **Custom Deck Creation** - Build and analyze your own deck configurations
- **Deck Detail Pages** - Individual deck breakdowns with card-by-card pricing
- **Live Price Fallback** - Automatic Scryfall API queries when static data is unavailable

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) runtime

### Installation

```bash
git clone <repository-url>
cd mtg-commander-roi
bun install
```

### Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Home Page** - Select a deck from the dropdown to see instant ROI analysis with market value vs MSRP
2. **Comparison Page** - Browse all precons in a sortable table, filter by year/set, adjust distributor discount
3. **Deck Detail Pages** - Click any deck for card-by-card pricing breakdown and top value cards

## Roadmap

### Sprint 1 (Complete)

- Deck comparison table with sortable columns
- Distributor ROI calculations (40% discount default)
- BUY/HOLD/PASS verdict system
- ROI threshold filters
- Missing price handling (N/A display)
- Live Scryfall fallback when static data unavailable

### Sprint 2 (Complete)

- **TypeScript migration** - Full conversion to .tsx with strict mode
- **Comparison page enhancements** - Year/set filters, sortable columns, batch refresh
- **Loading state polish** - Progress tracking, skeleton states

### Sprint 3 (Complete)

- **Mobile responsiveness** - Responsive layouts across all pages
- **Security hardening** - Rate limiting, CSP headers, clickjacking protection
- **Production tooling** - ESLint, pre-commit hooks, Vercel Analytics
- **Image optimization** - Next.js Image component for Scryfall images

### Backlog

- Historical ROI trends (requires database)
- TCGplayer/CardMarket purchase links
- Play Booster EV analysis

## Routes

- `/` - Main ROI analyzer
- `/compare` - Deck comparison table
- `/deck/[id]` - Individual deck details
- `/about` - About page
- `/contact` - Contact form
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/blog` - Blog index
- `/blog/[slug]` - Blog posts

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- Bun

## Data Sources

Card data and prices provided by [Scryfall](https://scryfall.com). Prices update daily.
