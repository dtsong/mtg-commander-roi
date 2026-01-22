/**
 * TCGplayer Scraper Module
 *
 * Requires playwright to be installed:
 *   bun add playwright
 *   bunx playwright install chromium
 *
 * Usage:
 *   bun scripts/fetch-lowest-listings.ts
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const RATE_LIMIT_MS = 1500;
const MAX_RETRIES = 2;

let lastRequestTime = 0;

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];

const getRandomUserAgent = (): string => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

export interface LowestListingResult {
  cardName: string;
  lowestListing: number | null;
  condition: string | null;
  seller: string | null;
  tcgplayerUrl: string;
  error?: string;
}

export interface ScraperOptions {
  headless?: boolean;
  proxy?: string;
  timeout?: number;
}

const rateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await sleep(RATE_LIMIT_MS - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();
};

const buildSearchUrl = (cardName: string): string => {
  const encodedName = encodeURIComponent(cardName);
  return `https://www.tcgplayer.com/search/magic/product?q=${encodedName}&view=grid&ProductTypeName=Cards`;
};

const buildProductUrl = (productId: string): string => {
  return `https://www.tcgplayer.com/product/${productId}`;
};

export const createBrowser = async (options: ScraperOptions = {}): Promise<any> => {
  const playwright = await import('playwright');
  const launchOptions: { headless: boolean; proxy?: { server: string } } = {
    headless: options.headless ?? true,
  };

  if (options.proxy) {
    launchOptions.proxy = { server: options.proxy };
  }

  return playwright.chromium.launch(launchOptions);
};

export const createPage = async (browser: any): Promise<any> => {
  const context = await browser.newContext({
    userAgent: getRandomUserAgent(),
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
  });

  const page = await context.newPage();

  await page.route('**/*.{png,jpg,jpeg,gif,svg,webp,ico,woff,woff2,ttf,otf}', (route: any) => route.abort());
  await page.route('**/analytics**', (route: any) => route.abort());
  await page.route('**/tracking**', (route: any) => route.abort());
  await page.route('**/ads**', (route: any) => route.abort());

  return page;
};

export const scrapeLowestListing = async (
  page: any,
  cardName: string,
  options: ScraperOptions = {},
  retryCount = 0
): Promise<LowestListingResult> => {
  const searchUrl = buildSearchUrl(cardName);
  const timeout = options.timeout ?? 30000;

  try {
    await rateLimit();

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout });

    await page.waitForSelector('.search-result, .product-card, [data-testid="product-card"]', {
      timeout: 10000,
    }).catch(() => null);

    const productLink = await page.$eval(
      '.search-result a[href*="/product/"], .product-card a[href*="/product/"], a[href*="/product/"][class*="product"]',
      (el: Element) => el.getAttribute('href')
    ).catch(() => null);

    if (!productLink) {
      return {
        cardName,
        lowestListing: null,
        condition: null,
        seller: null,
        tcgplayerUrl: searchUrl,
        error: 'Product not found in search results',
      };
    }

    const productUrl = productLink.startsWith('http')
      ? productLink
      : `https://www.tcgplayer.com${productLink}`;

    await rateLimit();
    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout });

    await page.waitForSelector('.listing-item, [data-testid="listing-item"], .price-point', {
      timeout: 10000,
    }).catch(() => null);

    const listingData = await page.evaluate(() => {
      const priceSelectors = [
        '.listing-item__price',
        '[data-testid="listing-price"]',
        '.price-point__price',
        '.listing-item .price',
        '[class*="listing"] [class*="price"]',
      ];

      for (const selector of priceSelectors) {
        const priceEl = document.querySelector(selector);
        if (priceEl) {
          const priceText = priceEl.textContent?.trim() || '';
          const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
          if (priceMatch) {
            const conditionEl = document.querySelector(
              '.listing-item__condition, [data-testid="listing-condition"], .condition'
            );
            const sellerEl = document.querySelector(
              '.listing-item__seller, [data-testid="seller-name"], .seller-name'
            );

            return {
              price: parseFloat(priceMatch[1].replace(',', '')),
              condition: conditionEl?.textContent?.trim() || null,
              seller: sellerEl?.textContent?.trim() || null,
            };
          }
        }
      }

      const allText = document.body.innerText;
      const priceMatches = allText.match(/\$(\d+\.\d{2})/g);
      if (priceMatches && priceMatches.length > 0) {
        const prices = priceMatches
          .map(p => parseFloat(p.replace('$', '')))
          .filter(p => p > 0.01 && p < 10000)
          .sort((a, b) => a - b);

        if (prices.length > 0) {
          return {
            price: prices[0],
            condition: null,
            seller: null,
          };
        }
      }

      return null;
    });

    if (!listingData) {
      return {
        cardName,
        lowestListing: null,
        condition: null,
        seller: null,
        tcgplayerUrl: productUrl,
        error: 'Could not extract listing price from page',
      };
    }

    return {
      cardName,
      lowestListing: listingData.price,
      condition: listingData.condition,
      seller: listingData.seller,
      tcgplayerUrl: productUrl,
    };
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await sleep(2000 * (retryCount + 1));
      return scrapeLowestListing(page, cardName, options, retryCount + 1);
    }

    return {
      cardName,
      lowestListing: null,
      condition: null,
      seller: null,
      tcgplayerUrl: searchUrl,
      error: error instanceof Error ? error.message : 'Unknown scraping error',
    };
  }
};

export const scrapeMultipleCards = async (
  cardNames: string[],
  options: ScraperOptions = {},
  onProgress?: (current: number, total: number, result: LowestListingResult) => void
): Promise<LowestListingResult[]> => {
  const browser = await createBrowser(options);
  const page = await createPage(browser);
  const results: LowestListingResult[] = [];

  try {
    for (let i = 0; i < cardNames.length; i++) {
      const cardName = cardNames[i];
      const result = await scrapeLowestListing(page, cardName, options);
      results.push(result);

      if (onProgress) {
        onProgress(i + 1, cardNames.length, result);
      }
    }
  } finally {
    await browser.close();
  }

  return results;
};

export const scrapeByProductId = async (
  page: any,
  productId: string,
  cardName: string,
  options: ScraperOptions = {}
): Promise<LowestListingResult> => {
  const productUrl = buildProductUrl(productId);
  const timeout = options.timeout ?? 30000;

  try {
    await rateLimit();
    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout });

    await page.waitForSelector('.listing-item, [data-testid="listing-item"], .price-point', {
      timeout: 10000,
    }).catch(() => null);

    const listingData = await page.evaluate(() => {
      const priceSelectors = [
        '.listing-item__price',
        '[data-testid="listing-price"]',
        '.price-point__price',
      ];

      for (const selector of priceSelectors) {
        const priceEl = document.querySelector(selector);
        if (priceEl) {
          const priceText = priceEl.textContent?.trim() || '';
          const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
          if (priceMatch) {
            return {
              price: parseFloat(priceMatch[1].replace(',', '')),
              condition: null,
              seller: null,
            };
          }
        }
      }
      return null;
    });

    return {
      cardName,
      lowestListing: listingData?.price ?? null,
      condition: listingData?.condition ?? null,
      seller: listingData?.seller ?? null,
      tcgplayerUrl: productUrl,
    };
  } catch (error) {
    return {
      cardName,
      lowestListing: null,
      condition: null,
      seller: null,
      tcgplayerUrl: productUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
