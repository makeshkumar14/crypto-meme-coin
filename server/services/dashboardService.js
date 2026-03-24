import {
  buildInsight,
  buildLaunchAdvisor,
  calculateHypeScore,
  calculateLiquidityScore,
  classifyLiquidity,
  deriveEarlySignal,
  deriveLifecycleStage,
  derivePrediction,
  deriveScoreBreakdown,
  detectFakeHype,
  detectRisk,
  inferChain,
  keywordSentiment,
} from '../../src/lib/analytics.js';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3';
const DEXSCREENER_URL = 'https://api.dexscreener.com/latest/dex';
const LUNARCRUSH_URL = process.env.LUNARCRUSH_BASE_URL || 'https://lunarcrush.com/api4/public';
const LUNARCRUSH_API_KEY = process.env.LUNARCRUSH_API_KEY;
const GENERIC_IMAGE = 'https://www.coingecko.com/favicon.ico';

const curatedFallbackCoins = [
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', current_price: 0.18, market_cap: 26000000000, total_volume: 1800000000, price_change_percentage_24h: 6.5 },
  { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB', image: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png', current_price: 0.000028, market_cap: 16000000000, total_volume: 920000000, price_change_percentage_24h: 4.2 },
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE', image: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg', current_price: 0.000012, market_cap: 5200000000, total_volume: 1600000000, price_change_percentage_24h: 11.4 },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK', image: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg', current_price: 0.000031, market_cap: 2200000000, total_volume: 410000000, price_change_percentage_24h: 8.1 },
  { id: 'dogwifcoin', name: 'dogwifhat', symbol: 'WIF', image: 'https://assets.coingecko.com/coins/images/33566/large/dogwifhat.jpg', current_price: 2.42, market_cap: 2400000000, total_volume: 670000000, price_change_percentage_24h: 9.8 },
  { id: 'floki', name: 'Floki', symbol: 'FLOKI', image: 'https://assets.coingecko.com/coins/images/16746/large/PNG_image.png', current_price: 0.00019, market_cap: 1800000000, total_volume: 250000000, price_change_percentage_24h: -2.1 },
  { id: 'brett', name: 'Brett', symbol: 'BRETT', image: 'https://assets.coingecko.com/coins/images/35090/large/brett-logo.png', current_price: 0.082, market_cap: 810000000, total_volume: 91000000, price_change_percentage_24h: 7.2 },
  { id: 'mog-coin', name: 'Mog Coin', symbol: 'MOG', image: 'https://assets.coingecko.com/coins/images/30713/large/MOG_LOGO_TRANSPARENT-01.png', current_price: 0.0000023, market_cap: 640000000, total_volume: 85000000, price_change_percentage_24h: 5.8 },
  { id: 'cat-in-a-dogs-world', name: 'Cat in a dogs world', symbol: 'MEW', image: 'https://assets.coingecko.com/coins/images/36262/large/mew-new.png', current_price: 0.0062, market_cap: 540000000, total_volume: 73000000, price_change_percentage_24h: 4.7 },
  { id: 'book-of-meme', name: 'Book of Meme', symbol: 'BOME', image: 'https://assets.coingecko.com/coins/images/35987/large/BOME.jpeg', current_price: 0.0098, market_cap: 690000000, total_volume: 150000000, price_change_percentage_24h: 3.5 },
  { id: 'ordi', name: 'ORDI', symbol: 'ORDI', image: 'https://assets.coingecko.com/coins/images/30013/large/ORDI.png', current_price: 42.7, market_cap: 890000000, total_volume: 210000000, price_change_percentage_24h: 6.4 },
  { id: 'sats-ordinals', name: 'SATS', symbol: 'SATS', image: 'https://assets.coingecko.com/coins/images/30014/large/SATS.png', current_price: 0.00000031, market_cap: 620000000, total_volume: 77000000, price_change_percentage_24h: 4.9 },
  { id: 'dog-go-to-the-moon-rune', name: 'DOG GO TO THE MOON', symbol: 'DOG', image: 'https://assets.coingecko.com/coins/images/37397/large/DOG_logo_red_rounded.png', current_price: 0.0059, market_cap: 410000000, total_volume: 65000000, price_change_percentage_24h: 9.6 },
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
    if (!coin?.id || seen.has(coin.id)) {
      return false;
    }
    seen.add(coin.id);
    return true;
  });
}

function sanitizeSparkline(prices = []) {
  return prices.filter((price) => Number.isFinite(price) && price > 0);
}

function sampleSeries(values, sampleCount = 7) {
  if (!values.length) {
    return [];
  }

  if (values.length <= sampleCount) {
    return values;
  }

  return Array.from({ length: sampleCount }).map((_, index) => {
    const ratio = sampleCount === 1 ? 0 : index / (sampleCount - 1);
    const sourceIndex = Math.min(values.length - 1, Math.round(ratio * (values.length - 1)));
    return values[sourceIndex];
  });
}

function buildPriceSeries(coin) {
  const sparkline = sanitizeSparkline(coin.sparkline_in_7d?.price || []);
  if (sparkline.length) {
    return sampleSeries(sparkline, 7);
  }

  const currentPrice = Number(coin.current_price || 0);
  const change = Number(coin.price_change_percentage_24h || 0) / 100;
  const base = currentPrice / Math.max(0.35, 1 + change);

  return Array.from({ length: 7 }).map((_, index) => {
    const factor = 0.88 + index * 0.03 + change * 0.2;
    return Number((base * factor).toFixed(8));
  });
}

function buildSignalTimeSeries({ coin, social }) {
  const prices = buildPriceSeries(coin);
  const startPrice = prices[0] || Number(coin.current_price || 0) || 1;
  const baseMentions = Math.max(240, Math.round(social.mentions * 0.6));
  const baseEngagement = Math.max(600, Math.round(social.engagement * 0.58));

  return prices.map((price, index) => {
    const relativeMove = startPrice > 0 ? price / startPrice : 1;
    const growthFactor = 0.8 + index * 0.05 + (relativeMove - 1) * 0.9;

    return {
      label: `D-${6 - index}`,
      mentions: Math.max(0, Math.round(baseMentions * growthFactor)),
      engagement: Math.max(0, Math.round(baseEngagement * (growthFactor + social.sentiment * 0.15))),
      price: Number(price.toFixed(8)),
    };
  });
}

function normalizeSocialData(social) {
  return {
    mentions: Math.max(0, Number(social?.mentions || 0)),
    engagement: Math.max(0, Number(social?.engagement || 0)),
    sentiment: Math.max(0, Math.min(1, Number(social?.sentiment || 0.5))),
    influencers: Math.max(0, Number(social?.influencers || 0)),
  };
}

function deriveFallbackSocialFromMarket(coin) {
  const priceChange24h = Number(coin.price_change_percentage_24h || 0);
  const volume = Number(coin.total_volume || 0);
  const marketCap = Number(coin.market_cap || 0);
  const mentions = Math.max(320, Math.round(volume / 190000 + marketCap / 90000000));
  const engagement = Math.max(1400, Math.round(mentions * (2.5 + Math.abs(priceChange24h) * 0.1)));
  const influencers = Math.max(4, Math.round(mentions / 260));
  const sentiment = Math.max(0.35, Math.min(0.88, 0.52 + priceChange24h / 55));

  return normalizeSocialData({ mentions, engagement, influencers, sentiment });
}

async function fetchTrendingCoins() {
  try {
    const [searchData, marketData] = await Promise.all([
      fetchJson(`${COINGECKO_URL}/search/trending`),
      fetchJson(
        `${COINGECKO_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=180&page=1&sparkline=true&price_change_percentage=24h,7d`,
      ),
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

  return normalizeSocialData({
    mentions: Number(payload.data[0].social_volume || payload.data[0].posts_created || 0),
    engagement: Number(payload.data[0].interactions_24h || payload.data[0].social_dominance || 0) * 100,
    sentiment: Number(payload.data[0].sentiment || 0.5),
    influencers: Number(payload.data[0].contributors_active || 0),
  });
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

  const relevantPosts = [...moonshots, ...crypto].filter((post) =>
    `${post.title || ''} ${post.selftext || ''}`.toLowerCase().includes(symbol.toLowerCase()),
  );

  if (!relevantPosts.length) {
    return null;
  }

  return {
    social: normalizeSocialData({
      sentiment: keywordSentiment(relevantPosts),
      mentions: Math.max(relevantPosts.length * 120, 300),
      engagement:
        relevantPosts.reduce((sum, post) => sum + (post.ups || 0) + (post.num_comments || 0), 0) * 16,
      influencers: Math.max(1, Math.round(relevantPosts.length / 2)),
    }),
    source: 'Reddit',
  };
}

function selectBestPair(pairs) {
  if (!pairs.length) {
    return null;
  }

  return [...pairs].sort(
    (a, b) => Number(b?.liquidity?.usd || 0) - Number(a?.liquidity?.usd || 0),
  )[0];
}

function deriveLaunchSignal({ prediction, hypeScore, liquidityScore, sentiment, fakeHypeScore }) {
  if (
    (prediction.label === 'Pump' || prediction.label === 'Early Trend') &&
    liquidityScore >= 50 &&
    sentiment >= 0.62 &&
    fakeHypeScore < 60
  ) {
    return {
      label: 'Launch Window Open',
      headline: 'Launch Window Open',
      tone: 'text-emerald-200',
      detail: 'Momentum is rising with enough depth to support discovery.',
      body: 'Momentum is rising with enough depth to support discovery.',
    };
  }

  if (hypeScore >= 70 && (liquidityScore < 45 || fakeHypeScore >= 60)) {
    return {
      label: 'Wait For Better Liquidity',
      headline: 'Wait For Better Liquidity',
      tone: 'text-amber-200',
      detail: 'Attention is there, but liquidity depth or signal quality is still fragile.',
      body: 'Attention is there, but liquidity depth or signal quality is still fragile.',
    };
  }

  return {
    label: 'Monitor Conditions',
    headline: 'Monitor Conditions',
    tone: 'text-cyan-200',
    detail: 'Signals are mixed. Watch for stronger sentiment and volume expansion.',
    body: 'Signals are mixed. Watch for stronger sentiment and volume expansion.',
  };
}

export async function buildDashboardDataset() {
  const trending = await fetchTrendingCoins();

  const enrichedCoins = await Promise.all(
    trending.map(async (coin) => {
      const normalizedSymbol = coin.symbol.toUpperCase();
      const chain = bitcoinSymbols.has(normalizedSymbol) ? 'Bitcoin' : inferChain(coin);
      let social = null;
      let socialSource = 'Market Derived';
      let usingFallbackSocialData = false;

      try {
        social = await fetchLunarCrushSocialData(normalizedSymbol);
        socialSource = 'LunarCrush';
      } catch {
        const fallback = await fetchFallbackSentiment(normalizedSymbol);
        if (fallback) {
          social = fallback.social;
          socialSource = fallback.source;
        }
      }

      if (!social) {
        social = deriveFallbackSocialFromMarket(coin);
        socialSource = 'Market Derived';
        usingFallbackSocialData = true;
      }

      const bestPair = selectBestPair(await fetchDexScreenerPairs(coin.symbol));
      const dex = {
        liquidityUsd: Number(bestPair?.liquidity?.usd || coin.total_volume * 0.12 || 0),
        volume24h: Number(bestPair?.volume?.h24 || coin.total_volume || 0),
        priceChange24h: Number(bestPair?.priceChange?.h24 || coin.price_change_percentage_24h || 0),
        pairLabel:
          bestPair?.baseToken?.symbol && bestPair?.quoteToken?.symbol
            ? `${bestPair.baseToken.symbol}/${bestPair.quoteToken.symbol}`
            : `${normalizedSymbol}/USD`,
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
      const launchSignal = deriveLaunchSignal({
        prediction,
        hypeScore,
        liquidityScore,
        sentiment: social.sentiment,
        fakeHypeScore,
      });
      const lifecycleStage = deriveLifecycleStage({
        prediction,
        mentionsDelta,
        sentiment: social.sentiment,
        priceChange24h: dex.priceChange24h,
        fakeHypeScore,
        hypeScore,
      });
      const earlySignal = deriveEarlySignal({
        mentionsDelta,
        sentiment: social.sentiment,
        hypeScore,
        priceChange24h: dex.priceChange24h,
        fakeHypeScore,
      });
      const scoreBreakdown = deriveScoreBreakdown({ social, dex, fakeHypeScore });
      const timeSeries = buildSignalTimeSeries({ coin, social });

      const explanation = buildInsight([
        `Prediction is ${prediction.label}.`,
        `Mentions trend is ${(mentionsDelta * 100).toFixed(0)}%.`,
        social.sentiment >= 0.6 ? 'Sentiment remains positive.' : 'Sentiment is mixed or weak.',
        `Dex price moved ${dex.priceChange24h.toFixed(2)}% in 24 hours.`,
        `Lifecycle stage is ${lifecycleStage.label}.`,
      ]);

      return {
        id: coin.id,
        name: coin.name,
        symbol: normalizedSymbol,
        image: coin.image || GENERIC_IMAGE,
        chain,
        price: Number(coin.current_price || 0),
        marketCap: Number(coin.market_cap || 0),
        volume: Number(coin.total_volume || 0),
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
        lifecycleStage,
        earlySignal,
        scoreBreakdown,
        timeSeries,
        usingFallbackSocialData,
      };
    }),
  );

  const rankedCoins = enrichedCoins.sort(
    (a, b) =>
      b.hypeScore +
      b.liquidityScore * 0.8 +
      b.sentimentScore * 20 -
      b.fakeHypeScore * 0.45 -
      (a.hypeScore + a.liquidityScore * 0.8 + a.sentimentScore * 20 - a.fakeHypeScore * 0.45),
  );

  return {
    coins: rankedCoins,
    usingFallbackSocialData: rankedCoins.some((coin) => coin.usingFallbackSocialData),
    launchAdvisor: buildLaunchAdvisor(rankedCoins),
  };
}
