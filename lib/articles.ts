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
    slug: 'understanding-card-conditions',
    title: 'Understanding Card Conditions: NM, LP, MP, HP, and DMG',
    description: 'Learn about MTG card condition grades and how they affect pricing. Understand when buying LP or MP cards can save you money.',
    publishedAt: '2026-01-18',
    author: 'MTG Commander ROI Team',
    tags: ['Guide', 'Pricing', 'Conditions'],
    content: `
## What Do Card Conditions Mean?

When buying Magic: The Gathering cards, you'll encounter condition grades that describe the physical state of a card. Understanding these grades helps you make informed purchasing decisions and find the best value.

### The Condition Scale

**NM (Near Mint)**
- The card looks almost new
- Minor edge wear or light scratches visible only under close inspection
- No creases, bends, or significant marks
- This is the default condition for price guides and our ROI calculations

**LP (Lightly Played)**
- Visible but minor wear on edges and corners
- Light scratches on the surface
- May have minor whitening on borders
- Typically 10-15% cheaper than NM

**MP (Moderately Played)**
- Noticeable wear including edge wear, scratches, or scuffs
- May have light creasing or minor bends
- Still tournament legal in sleeves
- Typically 20-30% cheaper than NM

**HP (Heavily Played)**
- Significant wear and damage
- May have creases, writing, or heavy scratches
- Cards are still recognizable and playable
- Typically 40-50% cheaper than NM

**DMG (Damaged)**
- Major damage such as tears, water damage, or heavy creasing
- May be bent, warped, or have missing pieces
- Often not tournament legal even in sleeves
- Typically 60%+ cheaper than NM

### Why We Show NM Prices

Our ROI calculations use Near Mint prices because:

1. **Standard baseline** - NM is the industry standard for price guides
2. **Consistent comparisons** - All decks are valued on the same scale
3. **Resale value** - NM cards have the highest and most stable resale value
4. **New product assumption** - Precon decks come with NM cards when purchased new

### When to Buy LP or MP

Buying lower-condition cards can be a smart budget strategy:

**Good candidates for LP/MP:**
- Commander staples you'll sleeve and never resell
- Cards for casual play groups
- High-value cards where savings are substantial
- Cards you plan to alter or customize

**Stick with NM for:**
- Cards you might resell or trade
- Collectible or reserved list cards
- Cards with significant value appreciation potential
- Your deck's most prominent cards (commanders, key pieces)

### Budget Optimization Tips

1. **Check the price gap** - Some cards have minimal LP discount while others have 25%+ savings
2. **Read seller descriptions** - "LP" varies between sellers; check photos when available
3. **Consider the card's role** - A sleeved Lightning Greaves looks the same as NM in play
4. **Buy smart for upgrades** - Put budget savings toward better cards, not just cheaper copies

### Using Our Lowest Listing Feature

When available, we show the lowest current listing price alongside the market price. This helps you:

- Spot cards currently listed below market value
- Find quick deals on high-value cards
- Compare actual buying prices vs. market averages

Remember: The lowest listing may be for LP or MP condition. Always verify the condition before purchasing.
    `,
  },
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
