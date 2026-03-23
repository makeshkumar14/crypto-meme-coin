import {
  buildInsight,
  calculateHypeScore,
  calculateLiquidityScore,
  classifyLiquidity,
  derivePrediction,
  detectRisk,
  inferChain,
  keywordSentiment,
} from './analytics';
import {
  fetchDexScreenerPairs,
  fetchLunarCrushSocialData,
  fetchRedditHotPosts,
  fetchTrendingCoins,
} from './api';
import { buildMockTimeSeries, mockSocialProfiles } from './mockData';

async function fetchFallbackSentiment(symbol) {
  try {
    const [moonshots, crypto] = await Promise.all([
      fetchRedditHotPosts('CryptoMoonShots'),
      fetchRedditHotPosts('CryptoCurrency'),
    ]);

    const relevantPosts = [...moonshots, ...crypto].filter((post) =>
      `${post.title || ''} ${post.selftext || ''}`.toLowerCase().includes(symbol.toLowerCase()),
    );

    return {
      social: {
        sentiment: keywordSentiment(relevantPosts),
        mentions: Math.max(relevantPosts.length * 120, 300),
        engagement: relevantPosts.reduce((sum, post) => sum + (post.ups || 0) + (post.num_comments || 0), 0) * 16,
        influencers: Math.max(1, Math.round(relevantPosts.length / 2)),
      },
      source: relevantPosts.length ? 'Reddit Fallback' : 'Reddit Scan',
    };
  } catch {
    return null;
  }
}

function selectBestPair(pairs) {
  if (!pairs.length) {
    return null;
  }

  return [...pairs].sort((a, b) => {
    const liquidityA = Number(a?.liquidity?.usd || 0);
    const liquidityB = Number(b?.liquidity?.usd || 0);
    return liquidityB - liquidityA;
  })[0];
}

function deriveLaunchSignal({ prediction, hypeScore, liquidityScore, sentiment }) {
  if ((prediction.label === 'Pump' || prediction.label === 'Early Trend') && liquidityScore >= 50 && sentiment >= 0.62) {
    return {
      label: 'Launch Window Open',
      tone: 'text-emerald-200',
      detail: 'Momentum is rising with enough depth to support discovery.',
    };
  }

  if (hypeScore >= 70 && liquidityScore < 45) {
    return {
      label: 'Wait For Better Liquidity',
      tone: 'text-amber-200',
      detail: 'Attention is there, but liquidity depth is still too fragile.',
    };
  }

  return {
    label: 'Monitor Conditions',
    tone: 'text-cyan-200',
    detail: 'Signals are mixed. Watch for stronger sentiment and volume expansion.',
  };
}

export async function buildDashboardDataset() {
  const trending = await fetchTrendingCoins();

  const enrichedCoins = await Promise.all(
    trending.map(async (coin) => {
      const chain = inferChain(coin);
      let social = null;
      let socialSource = 'Mock Profile';
      let usingMockSocialData = false;

      try {
        const lunar = await fetchLunarCrushSocialData(coin.symbol.toUpperCase());
        if (lunar) {
          social = {
            mentions: Number(lunar.social_volume || lunar.posts_created || 0),
            engagement: Number(lunar.interactions_24h || lunar.social_dominance || 0) * 100,
            sentiment: Number(lunar.sentiment || 0.5),
            influencers: Number(lunar.contributors_active || 0),
          };
          socialSource = 'LunarCrush';
        }
      } catch {
        const fallback = await fetchFallbackSentiment(coin.symbol.toUpperCase());
        if (fallback) {
          social = fallback.social;
          socialSource = fallback.source;
        }
      }

      if (!social) {
        social = mockSocialProfiles[coin.symbol.toUpperCase()] || {
          mentions: 2400,
          engagement: 9200,
          sentiment: 0.58,
          influencers: 8,
        };
        socialSource = 'Mock Profile';
        usingMockSocialData = true;
      }

      const pairs = await fetchDexScreenerPairs(coin.symbol);
      const bestPair = selectBestPair(pairs);

      const dex = {
        liquidityUsd: Number(bestPair?.liquidity?.usd || coin.total_volume * 0.12 || 0),
        volume24h: Number(bestPair?.volume?.h24 || coin.total_volume || 0),
        priceChange24h: Number(bestPair?.priceChange?.h24 || coin.price_change_percentage_24h || 0),
        pairLabel:
          bestPair?.baseToken?.symbol && bestPair?.quoteToken?.symbol
            ? `${bestPair.baseToken.symbol}/${bestPair.quoteToken.symbol}`
            : `${coin.symbol.toUpperCase()}/USD`,
      };

      const mentionsDelta = (social.sentiment - 0.45) * 0.22 + dex.priceChange24h / 100;
      const hypeScore = calculateHypeScore(social);
      const liquidityScore = calculateLiquidityScore(dex);
      const prediction = derivePrediction({
        mentionsDelta,
        sentiment: social.sentiment,
        priceChange24h: dex.priceChange24h,
      });
      const liquidityClass = classifyLiquidity(liquidityScore);
      const riskFlag = detectRisk({ hypeScore, liquidityScore });
      const launchSignal = deriveLaunchSignal({
        prediction,
        hypeScore,
        liquidityScore,
        sentiment: social.sentiment,
      });
      const timeSeries = buildMockTimeSeries({
        price: coin.current_price,
        social,
        sentimentScore: social.sentiment,
      });

      const explanation = buildInsight([
        `Prediction: ${prediction.icon} ${prediction.label}.`,
        `Mentions trend is ${(mentionsDelta * 100).toFixed(0)}%`,
        social.sentiment >= 0.6 ? 'with strong positive sentiment' : 'with mixed to weak sentiment',
        `and 24h price movement of ${dex.priceChange24h.toFixed(2)}%.`,
      ]);

      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        image: coin.image,
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
        launchSignal,
        timeSeries,
        usingMockSocialData,
      };
    }),
  );

  return {
    coins: enrichedCoins.sort((a, b) => b.hypeScore - a.hypeScore),
    usingMockSocialData: enrichedCoins.some((coin) => coin.usingMockSocialData),
  };
}
