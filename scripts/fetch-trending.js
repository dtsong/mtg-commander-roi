import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', 'public', 'data', 'trending.json');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MTG-Commander-ROI/1.0',
          'Accept': 'text/html',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (error) {
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
      if (attempt === maxRetries - 1) throw error;
      await sleep(delay);
    }
  }
}

function extractNextData(html) {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function extractTrendingCards(nextData) {
  const initialDaily = nextData?.props?.pageProps?.initialDaily;
  if (!initialDaily?.trending) return null;

  return initialDaily.trending.map(card => ({
    name: card.name,
    sanitized: card.sanitized,
    url: card.url,
  }));
}

function extractWeeklyCommanders(nextData) {
  const initialDaily = nextData?.props?.pageProps?.initialDaily;
  if (!initialDaily?.weekly) return null;

  return initialDaily.weekly.map(commander => ({
    name: commander.name,
    sanitized: commander.sanitized,
    url: commander.url,
  }));
}

function extractDailyCommander(nextData) {
  const initialDaily = nextData?.props?.pageProps?.initialDaily;
  if (!initialDaily?.daily) return null;

  return {
    name: initialDaily.daily.name,
    sanitized: initialDaily.daily.sanitized,
    url: initialDaily.daily.url,
  };
}

async function main() {
  console.log('Fetching EDHREC homepage...');

  try {
    const response = await fetchWithRetry('https://edhrec.com');
    const html = await response.text();

    const nextData = extractNextData(html);
    if (!nextData) {
      throw new Error('Could not find __NEXT_DATA__ on EDHREC homepage');
    }

    const trendingCards = extractTrendingCards(nextData);
    const weeklyCommanders = extractWeeklyCommanders(nextData);
    const dailyCommander = extractDailyCommander(nextData);

    const output = {
      updatedAt: new Date().toISOString(),
      dailyCommander,
      trendingCards: trendingCards || [],
      weeklyCommanders: weeklyCommanders || [],
    };

    mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

    console.log(`\nWrote trending data to ${OUTPUT_PATH}`);
    console.log(`Trending cards: ${output.trendingCards.length}`);
    console.log(`Weekly commanders: ${output.weeklyCommanders.length}`);

    if (output.trendingCards.length > 0) {
      console.log('\nTop 5 trending cards:');
      output.trendingCards.slice(0, 5).forEach((card, i) => {
        console.log(`  ${i + 1}. ${card.name}`);
      });
    }
  } catch (error) {
    console.error('Failed to fetch trending data:', error);
    process.exit(1);
  }
}

main();
