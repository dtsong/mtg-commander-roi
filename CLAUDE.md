# MTG Commander ROI Tool

MTG Commander precon deck value analyzer - compares market prices against MSRP using Scryfall API.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- Bun

## Structure

```
app/           # Pages (home, /compare, /deck/[id], /about, /contact, /terms, /blog)
components/    # UI components (Header, Footer, ContactForm, etc.)
lib/           # API integration, calculations, caching, articles
scripts/       # CLI utilities
public/data/   # Static price fallback data
```

## Commands

```bash
bun dev        # Dev server
bun build      # Production build
bun lint       # Linting
```

## Key Patterns

### Scryfall API
- 100ms rate limit between requests
- Retry with exponential backoff on failures
- Bulk card lookups: 75 cards per batch via collection endpoint

### Price Caching
- localStorage with TTL for client-side caching
- Static JSON fallback in `public/data/` for offline/initial load

### Static Pages
- About, Contact, Terms, Blog pages in `app/` directory
- Use Next.js metadata export for SEO
- Follow existing prose styling from `/privacy`

### Blog System
- Articles defined in `lib/articles.ts`
- Static generation with `generateStaticParams`
- Content as template literal strings (not MDX)

### ROI Calculations
- MSRP vs current market value
- Distributor pricing: 40% discount from MSRP
- Verdicts: BUY (>15% distro ROI), HOLD (0-15%), PASS (<0%)

### Scripts (`scripts/`)
- `update-prices.ts`: Fetch bulk Scryfall data, generate static pricing
- `import-decklist.ts`: Import deck lists from external sources
- `fetch-trending.ts`: Fetch trending cards from EDHREC

### Data
- 98 precon decks (2022-2026)
- Decklists: `public/data/decklists.json`
- Static prices: `public/data/prices.json`

## React Guidelines

Follow `~/.claude/skills/react-best-practices` for performance patterns.
