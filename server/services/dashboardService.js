import {
  buildInsight,
  calculateHypeScore,
  calculateLiquidityScore,
  classifyLiquidity,
  derivePrediction,
  detectRisk,
  detectFakeHype,
  inferChain,
  keywordSentiment,
} from '../../src/lib/analytics.js';
import { buildMockTimeSeries, mockSocialProfiles } from '../../src/lib/mockData.js';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3';
const DEXSCREENER_URL = 'https://api.dexscreener.com/latest/dex';
const LUNARCRUSH_URL = process.env.LUNARCRUSH_BASE_URL || 'https://lunarcrush.com/api4/public';
const LUNARCRUSH_API_KEY = process.env.LUNARCRUSH_API_KEY || process.env.VITE_LUNARCRUSH_API_KEY;
const GENERIC_IMAGE = 'https://www.coingecko.com/favicon.ico';

const curatedFallbackCoins = [
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', current_price: 0.18, market_cap: 26000000000, total_volume: 1800000000, price_change_percentage_24h: 6.5 },
  { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB', image: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png', current_price: 0.000028, market_cap: 16000000000, total_volume: 920000000, price_change_percentage_24h: 4.2 },
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE', image: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg', current_price: 0.000012, market_cap: 5200000000, total_volume: 1600000000, price_change_percentage_24h: 11.4 },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK', image: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg', current_price: 0.000031, market_cap: 2200000000, total_volume: 410000000, price_change_percentage_24h: 8.1 },
  { id: 'dogwifcoin', name: 'dogwifhat', symbol: 'WIF', image: 'https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg', current_price: 2.42, market_cap: 2400000000, total_volume: 670000000, price_change_percentage_24h: 9.8 },
  { id: 'floki', name: 'Floki', symbol: 'FLOKI', image: 'https://assets.coingecko.com/coins/images/16746/large/PNG_image.png', current_price: 0.00019, market_cap: 1800000000, total_volume: 250000000, price_change_percentage_24h: -2.1 },
  { id: 'brett', name: 'Brett', symbol: 'BRETT', image: GENERIC_IMAGE, current_price: 0.082, market_cap: 810000000, total_volume: 91000000, price_change_percentage_24h: 7.2 },
  { id: 'mog-coin', name: 'Mog Coin', symbol: 'MOG', image: GENERIC_IMAGE, current_price: 0.0000023, market_cap: 640000000, total_volume: 85000000, price_change_percentage_24h: 5.8 },
  { id: 'cat-in-a-dogs-world', name: 'Cat in a dogs world', symbol: 'MEW', image: GENERIC_IMAGE, current_price: 0.0062, market_cap: 540000000, total_volume: 73000000, price_change_percentage_24h: 4.7 },
  { id: 'book-of-meme', name: 'Book of Meme', symbol: 'BOME', image: GENERIC_IMAGE, current_price: 0.0098, market_cap: 690000000, total_volume: 150000000, price_change_percentage_24h: 3.5 },
  { id: 'ordi', name: 'ORDI', symbol: 'ORDI', image: GENERIC_IMAGE, current_price: 42.7, market_cap: 890000000, total_volume: 210000000, price_change_percentage_24h: 6.4 },
  { id: 'sats-ordinals', name: 'SATS', symbol: 'SATS', image: GENERIC_IMAGE, current_price: 0.00000031, market_cap: 620000000, total_volume: 77000000, price_change_percentage_24h: 4.9 },
  { id: 'dog-go-to-the-moon-rune', name: 'DOG•GO•TO•THE•MOON', symbol: 'DOG', image: GENERIC_IMAGE, current_price: 0.0059, market_cap: 410000000, total_volume: 65000000, price_change_percentage_24h: 9.6 },
];

const bitcoinSymbols = new Set(['ORDI', 'SATS', 'DOG', 'RATS', 'PUPS']);

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function dedupeCoins(coins) {
  const seen = new Set();
  return coins.filter((coin) => {
    if (seen.has(coin.id)) return false;
    seen.add(coin.id);
    return true;
  });
}

async function fetchTrendingCoins() {
  try {
    const [searchData, marketData] = await Promise.all([
      fetchJson(`${COINGECKO_URL}/search/trending`),
      fetchJson(`${COINGECKO_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=180&page=1&sparkline=false&price_change_percentage=24h`),
    ]);

    const trendingIds = new Set(searchData.coins.map((entry) => entry.item.id));
    const keywords = ['dog', 'pepe', 'meme', 'shib', 'cat', 'frog', 'inu', 'bonk', 'wojak', 'mog', 'brett', 'goat', 'neiro', 'book of meme'];
    const directSymbols = new Set(['DOGE', 'SHIB', 'PEPE', 'BONK', 'WIF', 'FLOKI', 'BRETT', 'MOG', 'MEW', 'BOME', 'ORDI', 'SATS', 'DOG']);

    const matches = marketData.filter((coin) => {
      const haystack = `${coin.name} ${coin.symbol}`.toLowerCase();
      const upperSymbol = coin.symbol.toUpperCase();
      return trendingIds.has(coin.id) || directSymbols.has(upperSymbol) || keywords.some((word) => haystack.includes(word));
    });

    const expanded = dedupeCoins([...matches, ...curatedFallbackCoins]).slice(0, 24);
    return expanded.length ? expanded : curatedFallbackCoins;
  } catch {
    return curatedFallbackCoins;
  }
}

async function fetchDexScreenerPairs(symbol) {
  try {
    const payload = await fetchJson(`${DEXSCREENER_URL}/search?q=${encodeURIComponent(symbol)}`);
    return payload.pairs || [];
  } catch {
    return [];
  }
}

async function fetchLunarCrushSocialData(symbol) {
  if (!LUNARCRUSH_API_KEY) {
    throw new Error('Missing LunarCrush API key.');
  }

  const payload = await fetchJson(`${LUNARCRUSH_URL}/coins/list/v1?symbol=${encodeURIComponent(symbol)}`, {
    headers: {
      Authorization: `Bearer ${LUNARCRUSH_API_KEY}`,
    },
  });

  if (!payload?.data?.length) {
    throw new Error(`LunarCrush returned no social data for ${symbol}.`);
  }

  return payload.data[0];
}

async function fetchRedditHotPosts(subreddit) {
  try {
    const payload = await fetchJson(`https://www.reddit.com/r/${subreddit}/hot.json?limit=12`);
    return payload?.data?.children?.map((child) => child.data) || [];
  } catch {
    return [];
  }
}

async function fetchFallbackSentiment(symbol) {
  const [moonshots, crypto] = await Promise.all([
    fetchRedditHotPosts('CryptoMoonShots'),
    fetchRedditHotPosts('CryptoCurrency'),
  ]);

  const relevantPosts = [...moonshots, ...crypto].filter((post) => `${post.title || ''} ${post.selftext || ''}`.toLowerCase().includes(symbol.toLowerCase()));

  if (!relevantPosts.length) {
    return null;
  }

  return {
    social: {
      sentiment: keywordSentiment(relevantPosts),
      mentions: Math.max(relevantPosts.length * 120, 300),
      engagement: relevantPosts.reduce((sum, post) => sum + (post.ups || 0) + (post.num_comments || 0), 0) * 16,
      influencers: Math.max(1, Math.round(relevantPosts.length / 2)),
    },
    source: 'Reddit Fallback',
  };
}

function selectBestPair(pairs) {
  if (!pairs.length) {
    return null;
  }

  return [...pairs].sort((a, b) => Number(b?.liquidity?.usd || 0) - Number(a?.liquidity?.usd || 0))[0];
}

function deriveLaunchSignal({ prediction, hypeScore, liquidityScore, sentiment, fakeHypeScore }) {
  if ((prediction.label === 'Pump' || prediction.label === 'Early Trend') && liquidityScore >= 50 && sentiment >= 0.62 && fakeHypeScore < 60) {
    return {
      label: 'Launch Window Open',
      headline: '🚀 Launch Window Open',
      tone: 'text-emerald-200',
      detail: 'Momentum is rising with enough depth to support discovery.',
      body: 'Momentum is rising with enough depth to support discovery.',
    };
  }

  if (hypeScore >= 70 && (liquidityScore < 45 || fakeHypeScore >= 60)) {
    return {
      label: 'Wait For Better Liquidity',
      headline: '⚠️ Wait For Better Liquidity',
      tone: 'text-amber-200',
      detail: 'Attention is there, but liquidity depth or signal quality is still too fragile.',
      body: 'Attention is there, but liquidity depth or signal quality is still too fragile.',
    };
  }

  return {
    label: 'Monitor Conditions',
    headline: '🔎 Monitor Conditions',
    tone: 'text-cyan-200',
    detail: 'Signals are mixed. Watch for stronger sentiment and volume expansion.',
    body: 'Signals are mixed. Watch for stronger sentiment and volume expansion.',
  };
}

function diversifyPredictions(coins) {
  if (!coins.length) {
    return coins;
  }

  const nextCoins = coins.map((coin) => ({ ...coin }));
  const topMomentum = [...nextCoins].sort((a, b) => (b.hypeScore + b.priceChange24h + b.sentimentScore * 20) - (a.hypeScore + a.priceChange24h + a.sentimentScore * 20))[0];
  const topSuspicious = [...nextCoins].sort((a, b) => b.fakeHypeScore - a.fakeHypeScore)[0];
  const weakest = [...nextCoins].sort((a, b) => (a.priceChange24h + a.sentimentScore * 10) - (b.priceChange24h + b.sentimentScore * 10))[0];

  if (topMomentum && ['Stable', 'Early Trend'].includes(topMomentum.prediction.label)) {
    topMomentum.prediction = { label: 'Pump', icon: '🚀' };
    topMomentum.explanation = `${topMomentum.explanation} Demo emphasis: this token currently has the strongest combined momentum profile in the tracked set.`;
  }

  if (topSuspicious && topSuspicious.fakeHypeScore >= 45) {
    topSuspicious.prediction = { label: 'Fake Hype', icon: '⚠️' };
    topSuspicious.explanation = `${topSuspicious.explanation} Demo emphasis: social hype quality is weaker than the raw mention spike suggests.`;
  }

  if (weakest && weakest.prediction.label === 'Stable') {
    weakest.prediction = { label: 'Dump', icon: '📉' };
    weakest.explanation = `${weakest.explanation} Demo emphasis: this token has the weakest combined price and sentiment posture in the current set.`;
  }

  return nextCoins;
}

export async function buildDashboardDataset() {
  const trending = await fetchTrendingCoins();

  const enrichedCoins = await Promise.all(
    trending.map(async (coin) => {
      const normalizedSymbol = coin.symbol.toUpperCase();
      const chain = bitcoinSymbols.has(normalizedSymbol) ? 'Bitcoin' : inferChain(coin);
      let social = null;
      let socialSource = 'Mock Profile';
      let usingMockSocialData = false;

      try {
        const lunar = await fetchLunarCrushSocialData(normalizedSymbol);
        social = {
          mentions: Number(lunar.social_volume || lunar.posts_created || 0),
          engagement: Number(lunar.interactions_24h || lunar.social_dominance || 0) * 100,
          sentiment: Number(lunar.sentiment || 0.5),
          influencers: Number(lunar.contributors_active || 0),
        };
        socialSource = 'LunarCrush';
      } catch {
        const fallback = await fetchFallbackSentiment(normalizedSymbol);
        if (fallback) {
          social = fallback.social;
          socialSource = fallback.source;
        }
      }

      if (!social) {
        social = mockSocialProfiles[normalizedSymbol] || { mentions: 2400, engagement: 9200, sentiment: 0.58, influencers: 8 };
        socialSource = 'Mock Profile';
        usingMockSocialData = true;
      }

      const bestPair = selectBestPair(await fetchDexScreenerPairs(coin.symbol));
      const dex = {
        liquidityUsd: Number(bestPair?.liquidity?.usd || coin.total_volume * 0.12 || 0),
        volume24h: Number(bestPair?.volume?.h24 || coin.total_volume || 0),
        priceChange24h: Number(bestPair?.priceChange?.h24 || coin.price_change_percentage_24h || 0),
        pairLabel: bestPair?.baseToken?.symbol && bestPair?.quoteToken?.symbol ? `${bestPair.baseToken.symbol}/${bestPair.quoteToken.symbol}` : `${normalizedSymbol}/USD`,
      };

      const mentionsDelta = (social.sentiment - 0.45) * 0.22 + dex.priceChange24h / 100;
      const hypeScore = calculateHypeScore(social);
      const liquidityScore = calculateLiquidityScore(dex);
      const fakeHypeSignal = detectFakeHype({
        mentionsDelta,
        engagement: social.engagement,
        mentions: social.mentions,
        influencers: social.influencers,
        sentiment: social.sentiment,
        priceChange24h: dex.priceChange24h,
        hypeScore,
        liquidityScore,
      });
      const fakeHypeScore = fakeHypeSignal.score;
      const prediction = derivePrediction({
        mentionsDelta,
        sentiment: social.sentiment,
        priceChange24h: dex.priceChange24h,
        hypeScore,
        liquidityScore,
        fakeHypeScore,
      });
      const liquidityClass = classifyLiquidity(liquidityScore);
      const riskFlag = detectRisk({ hypeScore, liquidityScore });
      const launchSignal = deriveLaunchSignal({ prediction, hypeScore, liquidityScore, sentiment: social.sentiment, fakeHypeScore });
      const timeSeries = buildMockTimeSeries({ price: coin.current_price, social, sentimentScore: social.sentiment });

      const explanation = buildInsight([
        `Prediction: ${prediction.icon} ${prediction.label}.`,
        `Mentions trend is ${(mentionsDelta * 100).toFixed(0)}%.`,
        social.sentiment >= 0.6 ? 'Sentiment remains positive.' : 'Sentiment is mixed or weak.',
        `Dex price moved ${dex.priceChange24h.toFixed(2)}% in 24 hours.`,
      ]);

      return {
        id: coin.id,
        name: coin.name,
        symbol: normalizedSymbol,
        image: coin.image || GENERIC_IMAGE,
        chain,
        price: coin.current_price,
        marketCap: coin.market_cap,
        volume: coin.total_volume,
        priceChange24h: Number(coin.price_change_percentage_24h || 0),
        sentimentScore: social.sentiment,
        hypeScore,
        liquidityScore,
        liquidityClass,
        prediction,
        riskFlag,
        explanation,
        mentionsDelta,
        social,
        socialSource,
        dex,
        fakeHypeScore,
        fakeHypeSignal,
        launchSignal,
        timeSeries,
        usingMockSocialData,
      };
    }),
  );

  const demoReadyCoins = diversifyPredictions(enrichedCoins).sort((a, b) => b.hypeScore - a.hypeScore);

  return {
    coins: demoReadyCoins,
    usingMockSocialData: demoReadyCoins.some((coin) => coin.usingMockSocialData),
  };
}
