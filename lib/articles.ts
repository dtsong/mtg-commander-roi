export interface Article {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  tags: string[];
  content: string;
}

export const articles: Article[] = [
  {
    slug: 'what-is-commander-precon-roi',
    title: 'What is Commander Precon ROI?',
    description: 'Learn how to evaluate the value of Magic: The Gathering Commander preconstructed decks by calculating return on investment.',
    publishedAt: '2026-01-15',
    author: 'MTG Commander ROI Team',
    tags: ['Guide', 'Basics', 'ROI'],
    content: `
## Understanding ROI in Commander Precons

Return on Investment (ROI) is a metric that helps you understand the value you're getting from a Commander preconstructed deck. It compares the total market value of all cards in the deck against its retail price.

### How We Calculate ROI

The formula is straightforward:

**ROI = ((Total Card Value - MSRP) / MSRP) × 100**

For example, if a deck has an MSRP of $50 and contains cards worth $75 on the secondary market:
- ROI = (($75 - $50) / $50) × 100 = 50%

This means you're getting 50% more value in cards than what you paid for the deck.

### Why ROI Matters

Understanding ROI helps you:

1. **Make informed purchases** - Know which decks offer the best value for your budget
2. **Plan upgrades** - Identify decks with valuable cards you can trade or sell to fund improvements
3. **Compare releases** - See how different sets and releases stack up against each other

### Important Considerations

While ROI is a useful metric, remember:

- **Card prices fluctuate** - Today's valuable card might drop in price tomorrow
- **Playability matters** - A deck with lower ROI might still be more fun to play
- **Personal value** - Cards you'll actually use have more value to you than pure market price suggests
- **Condition and availability** - Market prices assume near-mint condition and available buyers

### Using This Tool

Our ROI analyzer fetches real-time prices from Scryfall to give you accurate, up-to-date valuations. Browse decks, compare options, and find the best value for your next Commander purchase.
    `,
  },
  {
    slug: 'how-to-use-mtg-commander-roi',
    title: 'How to Use MTG Commander ROI',
    description: 'A step-by-step guide to using our Commander precon value analyzer to find the best deals.',
    publishedAt: '2026-01-16',
    author: 'MTG Commander ROI Team',
    tags: ['Guide', 'Tutorial'],
    content: `
## Getting Started with MTG Commander ROI

Our tool makes it easy to analyze and compare Commander preconstructed deck values. Here's how to get the most out of it.

### Browsing Decks

The home page displays all available Commander precons with their current market values and ROI percentages. Each deck card shows:

- **Deck name** and set
- **Total card value** in USD
- **MSRP** (Manufacturer's Suggested Retail Price)
- **ROI percentage** - how much value above or below MSRP

### Viewing Deck Details

Click on any deck to see a detailed breakdown including:

- Complete card list with individual prices
- Price distribution showing high-value cards
- Historical MSRP comparison

### Comparing Decks

Use the Compare feature to see multiple decks side-by-side. This is especially useful when:

- Deciding between decks from the same set
- Comparing decks at similar price points
- Finding the best value across different releases

### Tips for Best Results

1. **Check regularly** - Prices change frequently, so check back before making a purchase
2. **Consider the whole picture** - ROI is important, but so is whether you'll enjoy playing the deck
3. **Look at individual cards** - Sometimes a deck's value is concentrated in just a few cards
4. **Factor in shipping** - Online prices might not include shipping costs

### Adding Custom Decks

Want to analyze a deck that's not in our database? Use the "Add Custom Deck" feature to enter your own deck list and see its calculated value.
    `,
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

export function getAllArticleSlugs(): string[] {
  return articles.map((article) => article.slug);
}
