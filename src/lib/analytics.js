export const BLOCKCHAINS = ['Ethereum', 'Solana', 'Bitcoin'];

const POSITIVE_KEYWORDS = ['moon', 'pump', 'bullish', 'breakout', 'gem'];
const NEGATIVE_KEYWORDS = ['dump', 'scam', 'rug', 'rugpull', 'bot'];

export function inferChain(coin) {
  const text = `${coin.name} ${coin.symbol}`.toLowerCase();

  if (['bonk', 'wif', 'popcat', 'catsol'].some((term) => text.includes(term))) {
    return 'Solana';
  }
  if (['ordi', 'sats', 'rats'].some((term) => text.includes(term))) {
    return 'Bitcoin';
  }
  return 'Ethereum';
}

export function keywordSentiment(posts) {
  if (!posts.length) {
    return 0.5;
  }

  let score = 0;

  posts.forEach((post) => {
    const text = `${post.title || ''} ${post.selftext || ''}`.toLowerCase();
    POSITIVE_KEYWORDS.forEach((word) => {
      if (text.includes(word)) {
        score += 1;
      }
    });
    NEGATIVE_KEYWORDS.forEach((word) => {
      if (text.includes(word)) {
        score -= 1;
      }
    });
  });

  return Math.max(0, Math.min(1, 0.5 + score / Math.max(posts.length * 4, 1)));
}

export function calculateHypeScore({ mentions, engagement, sentiment }) {
  const mentionScore = Math.min(mentions / 25000, 1) * 45;
  const engagementScore = Math.min(engagement / 100000, 1) * 35;
  const sentimentScore = Math.min(sentiment, 1) * 20;
  return Math.round(mentionScore + engagementScore + sentimentScore);
}

export function calculateLiquidityScore({ liquidityUsd, volume24h, priceChange24h }) {
  const liquidityWeight = Math.min(liquidityUsd / 2_000_000, 1) * 45;
  const volumeWeight = Math.min(volume24h / 8_000_000, 1) * 35;
  const stabilityWeight = Math.max(0, 20 - Math.min(Math.abs(priceChange24h), 20));
  return Math.round(liquidityWeight + volumeWeight + stabilityWeight);
}

export function classifyLiquidity(score) {
  if (score >= 70) {
    return { label: 'High Liquidity', color: 'text-emerald-300', icon: '🟢' };
  }
  if (score >= 45) {
    return { label: 'Moderate Liquidity', color: 'text-amber-300', icon: '🟡' };
  }
  return { label: 'Low Liquidity', color: 'text-rose-300', icon: '🔴' };
}

export function derivePrediction({ mentionsDelta, sentiment, priceChange24h, hypeScore = 0, liquidityScore = 0, fakeHypeScore = 0 }) {
  if ((mentionsDelta > 0.12 && sentiment >= 0.58 && priceChange24h > 1.5) || (hypeScore >= 74 && liquidityScore >= 50 && sentiment >= 0.56)) {
    return { label: 'Pump', icon: '🚀' };
  }
  if ((mentionsDelta > 0.1 && sentiment < 0.52) || (fakeHypeScore >= 60 && hypeScore >= 58)) {
    return { label: 'Fake Hype', icon: '⚠️' };
  }
  if ((mentionsDelta < -0.03 && sentiment < 0.48) || priceChange24h < -6) {
    return { label: 'Dump', icon: '📉' };
  }
  if ((mentionsDelta > 0.05 && Math.abs(priceChange24h) <= 3.5) || (hypeScore >= 58 && sentiment >= 0.55)) {
    return { label: 'Early Trend', icon: '🔥' };
  }
  return { label: 'Stable', icon: '🧊' };
}

export function detectRisk({ hypeScore, liquidityScore }) {
  return hypeScore >= 72 && liquidityScore <= 42;
}

export function detectFakeHype({ mentionsDelta, engagement, mentions, influencers, sentiment, priceChange24h, hypeScore, liquidityScore }) {
  const engagementPerMention = engagement / Math.max(mentions, 1);
  const influencerDensity = influencers / Math.max(mentions, 1);
  let score = 0;

  if (mentionsDelta > 0.45) score += 30;
  if (engagementPerMention < 2.2) score += 22;
  if (influencerDensity < 0.0012) score += 14;
  if (sentiment > 0.72 && priceChange24h < 1.5) score += 12;
  if (hypeScore > 72 && liquidityScore < 45) score += 25;
  if (Math.abs(priceChange24h) > 18 && liquidityScore < 38) score += 10;

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  if (finalScore >= 70) {
    return {
      score: finalScore,
      label: 'High fake-hype risk',
      tone: 'border border-rose-400/20 bg-rose-400/10 text-rose-200',
      explanation: 'Mentions are rising faster than engagement quality and liquidity depth. This often looks more manufactured than organic.',
    };
  }

  if (finalScore >= 45) {
    return {
      score: finalScore,
      label: 'Suspicious activity',
      tone: 'border border-amber-400/20 bg-amber-400/10 text-amber-200',
      explanation: 'The token has some authentic traction, but the signal mix suggests part of the hype may be low-quality or inorganic.',
    };
  }

  return {
    score: finalScore,
    label: 'Mostly organic',
    tone: 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    explanation: 'Engagement quality and liquidity look healthier, so the current hype appears more organic than bot-driven.',
  };
}

export function buildInsight(copy) {
  return copy.join(' ');
}

export function getMarketPulse(coins) {
  const totalHype = coins.reduce((sum, coin) => sum + coin.hypeScore, 0);
  const totalLiquidity = coins.reduce((sum, coin) => sum + coin.liquidityScore, 0);
  const avgSentiment = coins.length > 0 ? coins.reduce((sum, coin) => sum + coin.sentimentScore, 0) / coins.length : 0;

  return {
    avgHype: coins.length ? Math.round(totalHype / coins.length) : 0,
    avgLiquidity: coins.length ? Math.round(totalLiquidity / coins.length) : 0,
    avgSentiment: avgSentiment.toFixed(2),
    trendStrength: coins.filter((coin) => coin.prediction.label === 'Pump' || coin.prediction.label === 'Early Trend').length,
  };
}

export function summarizeSignals(coins) {
  const alerts = [];
  const riskyCoin = coins.find((coin) => coin.riskFlag);
  const pumpCoin = coins.find((coin) => coin.prediction.label === 'Pump');
  const earlyCoin = coins.find((coin) => coin.prediction.label === 'Early Trend');
  const suspiciousCoin = coins.find((coin) => coin.fakeHypeScore >= 70);

  if (pumpCoin) {
    alerts.push({ level: 'success', message: `🔥 New trend detected around ${pumpCoin.name}` });
  }
  if (suspiciousCoin) {
    alerts.push({ level: 'warning', message: `🤖 Bot-like fake hype suspected for ${suspiciousCoin.name}` });
  }
  if (riskyCoin) {
    alerts.push({ level: 'warning', message: `⚠️ Potential pump & dump detected for ${riskyCoin.name}` });
  }
  if (!pumpCoin && !earlyCoin) {
    alerts.push({ level: 'info', message: '🧊 Market momentum is cooling across tracked meme coins' });
  }
  if (coins.some((coin) => coin.prediction.label === 'Dump')) {
    alerts.push({ level: 'danger', message: '📉 Possible dump incoming on at least one tracked asset' });
  }

  const launchReadyCoin = [...coins]
    .sort((a, b) => b.hypeScore - a.hypeScore)
    .find((coin) => coin.prediction.label !== 'Dump' && coin.liquidityScore >= 45 && coin.fakeHypeScore < 60);

  const launchWindow = launchReadyCoin
    ? {
        open: true,
        headline: '🚀 Launch Window Open',
        body: `Strong upward trend around ${launchReadyCoin.name} with solid engagement and manageable competition.`,
      }
    : {
        open: false,
        headline: '⏳ Launch Window Narrow',
        body: 'Momentum is fragmented right now. Wait for engagement expansion with stronger liquidity support.',
      };

  return {
    alerts,
    launchWindow,
    headline: pumpCoin
      ? `${pumpCoin.name} leads the hype cycle with a ${pumpCoin.hypeScore}/100 hype score.`
      : 'No clear leader yet. The market is rotating without a decisive breakout.',
    body: suspiciousCoin
      ? `${suspiciousCoin.name} is drawing attention, but the fake-hype detector sees inorganic behavior patterns.`
      : 'Liquidity and sentiment are aligned well enough to support measured speculative interest.',
  };
}
