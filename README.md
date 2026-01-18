# MTG Commander ROI Analyzer

Analyze the return on investment of Magic: The Gathering Commander preconstructed decks by comparing current card market values against original MSRP. Built for collectors and resellers who want data-driven purchase decisions.

## Features

- **Deck Comparison Table** - Side-by-side comparison of all Commander precons with sortable columns
- **Distributor ROI Calculations** - Calculate ROI at wholesale pricing (40% discount default)
- **BUY/HOLD/PASS Verdicts** - Clear recommendations based on configurable ROI thresholds
- **ROI Threshold Filters** - Filter decks by minimum ROI percentage
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

1. Browse the comparison table on the home page to see all precons ranked by ROI
2. Adjust the distributor discount slider to match your wholesale pricing
3. Use ROI filters to show only decks meeting your investment criteria
4. Click any deck to view detailed card breakdowns and top value cards

## Roadmap

### Sprint 1 (Complete)

- Deck comparison table with sortable columns
- Distributor ROI calculations (40% discount default)
- BUY/HOLD/PASS verdict system
- ROI threshold filters
- Missing price handling (N/A display)
- Live Scryfall fallback when static data unavailable

### Sprint 2 (Planned)

- **TypeScript migration** - Convert .jsx to .tsx for type safety
- Comparison page enhancements
- Loading state polish

### Backlog

- Velocity metric (blocked - no free sales velocity API)
- Distributor spend tracker
- Expand beyond Commander precons
- Historical ROI trends (requires database)
- Mobile responsiveness
- TCGplayer/CardMarket purchase links

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- Bun

## Data Sources

Card data and prices provided by [Scryfall](https://scryfall.com). Prices update daily.
