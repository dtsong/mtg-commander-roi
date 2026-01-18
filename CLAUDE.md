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

## React Guidelines

Follow `~/.claude/skills/react-best-practices` for performance patterns.
