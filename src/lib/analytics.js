export const BLOCKCHAINS = ['Ethereum', 'Solana', 'Bitcoin'];

const POSITIVE_KEYWORDS = ['moon', 'pump', 'bullish', 'breakout', 'gem', 'send', 'rally'];
const NEGATIVE_KEYWORDS = ['dump', 'scam', 'rug', 'rugpull', 'bot', 'dead', 'exit'];

const THEME_LIBRARY = [
  {
    key: 'dog',
    label: 'Dog',
    terms: ['doge', 'dog', 'shib', 'inu', 'wif', 'floki', 'pup', 'dogwif'],
    tokens: ['Doge', 'Inu', 'Shib', 'Pup', 'Wif'],
  },
  {
    key: 'frog',
    label: 'Frog',
    terms: ['pepe', 'frog', 'swamp'],
    tokens: ['Pepe', 'Frog', 'Swamp', 'Ribbit'],
  },
  {
    key: 'cat',
    label: 'Cat',
    terms: ['cat', 'mew', 'popcat', 'kitty', 'purr'],
    tokens: ['Cat', 'Mew', 'Purr', 'Kitty'],
  },
  {
    key: 'degen',
    label: 'Degen',
    terms: ['bonk', 'brett', 'mog', 'wojak', 'goat', 'neiro', 'degen'],
    tokens: ['Bonk', 'Mog', 'Degen', 'Wojak'],
  },
  {
    key: 'culture',
    label: 'Culture',
    terms: ['meme', 'book', 'bome', 'viral', 'trend'],
    tokens: ['Meme', 'Viral', 'Lore', 'Trend'],
  },
];

const NAME_SUFFIXES = ['Pulse', 'Forge', 'Rush', 'Wave', 'Verse', 'Lab', 'Mint'];

export function inferChain(coin) {
  const text = `${coin.name} ${coin.symbol}`.toLowerCase();

  if (['bonk', 'wif', 'popcat', 'catsol', 'mew'].some((term) => text.includes(term))) {
    return 'Solana';
  }
  if (['ordi', 'sats', 'rats', 'dog'].some((term) => text.includes(term))) {
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

export function derivePrediction({
  mentionsDelta,
  sentiment,
  priceChange24h,
  hypeScore = 0,
  liquidityScore = 0,
  fakeHypeScore = 0,
}) {
  if (
    (mentionsDelta > 0.12 && sentiment >= 0.58 && priceChange24h > 1.5) ||
    (hypeScore >= 74 && liquidityScore >= 50 && sentiment >= 0.56)
  ) {
    return { label: 'Pump', icon: '🚀' };
  }
  if ((mentionsDelta > 0.1 && sentiment < 0.52) || (fakeHypeScore >= 60 && hypeScore >= 58)) {
    return { label: 'Fake Hype', icon: '⚠️' };
  }
  if ((mentionsDelta < -0.03 && sentiment < 0.48) || priceChange24h < -6) {
    return { label: 'Dump', icon: '📉' };
  }
  if (
    (mentionsDelta > 0.05 && Math.abs(priceChange24h) <= 3.5) ||
    (hypeScore >= 58 && sentiment >= 0.55)
  ) {
    return { label: 'Early Trend', icon: '🔥' };
  }
  return { label: 'Stable', icon: '🧊' };
}

export function detectRisk({ hypeScore, liquidityScore }) {
  return hypeScore >= 72 && liquidityScore <= 42;
}

export function detectFakeHype({
  mentionsDelta,
  engagement,
  mentions,
  influencers,
  sentiment,
  priceChange24h,
  hypeScore,
  liquidityScore,
}) {
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
      explanation:
        'Mentions are rising faster than engagement quality and liquidity depth. This often looks more manufactured than organic.',
    };
  }

  if (finalScore >= 45) {
    return {
      score: finalScore,
      label: 'Suspicious activity',
      tone: 'border border-amber-400/20 bg-amber-400/10 text-amber-200',
      explanation:
        'The token has some authentic traction, but the signal mix suggests part of the hype may be low-quality or inorganic.',
    };
  }

  return {
    score: finalScore,
    label: 'Mostly organic',
    tone: 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    explanation:
      'Engagement quality and liquidity look healthier, so the current hype appears more organic than bot-driven.',
  };
}

export function buildInsight(copy) {
  return copy.join(' ');
}

export function deriveLifecycleStage({
  prediction,
  mentionsDelta,
  sentiment,
  priceChange24h,
  fakeHypeScore,
  hypeScore,
}) {
  if (prediction.label === 'Dump' || priceChange24h <= -6) {
    return {
      label: 'Decline',
      tone: 'text-rose-300',
      detail: 'Momentum is fading and the market is rotating away from this meme.',
    };
  }

  if (prediction.label === 'Fake Hype' || fakeHypeScore >= 70) {
    return {
      label: 'Distorted',
      tone: 'text-amber-300',
      detail: 'Attention is elevated, but quality looks weak and the cycle may be manipulated.',
    };
  }

  if (mentionsDelta >= 0.08 && priceChange24h <= 4.5 && sentiment >= 0.54) {
    return {
      label: 'Early',
      tone: 'text-cyan-300',
      detail: 'Conversation is accelerating before a full breakout has matured.',
    };
  }

  if (priceChange24h >= 4 && sentiment >= 0.56 && hypeScore >= 62) {
    return {
      label: 'Growth',
      tone: 'text-emerald-300',
      detail: 'Price, engagement, and sentiment are moving together in a healthier expansion phase.',
    };
  }

  if (priceChange24h >= 12 || hypeScore >= 82) {
    return {
      label: 'Peak',
      tone: 'text-fuchsia-300',
      detail: 'Attention is near a local high and late entries need tighter risk control.',
    };
  }

  return {
    label: 'Steady',
    tone: 'text-slate-300',
    detail: 'The meme is still active, but signals are balanced rather than explosive.',
  };
}

export function deriveEarlySignal({
  mentionsDelta,
  sentiment,
  hypeScore,
  priceChange24h,
  fakeHypeScore,
}) {
  const confidence = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        mentionsDelta * 380 +
          sentiment * 34 +
          Math.max(0, 16 - Math.abs(priceChange24h) * 2) +
          Math.max(0, 18 - fakeHypeScore * 0.18) +
          hypeScore * 0.12,
      ),
    ),
  );

  if (mentionsDelta >= 0.08 && sentiment >= 0.55 && priceChange24h <= 5 && fakeHypeScore < 60) {
    return {
      detected: true,
      confidence,
      label: 'Detected Early',
      detail: 'Social momentum is building before the move looks overcrowded.',
    };
  }

  if (priceChange24h > 8 || hypeScore > 78) {
    return {
      detected: false,
      confidence,
      label: 'Already Extended',
      detail: 'The move is visible now, but a large part of the early edge may already be gone.',
    };
  }

  return {
    detected: false,
    confidence,
    label: 'Monitor',
    detail: 'Signals are present, but they still need stronger confirmation before this becomes a clean early call.',
  };
}

export function deriveScoreBreakdown({ social, dex, fakeHypeScore }) {
  const hype = [
    { label: 'Mentions', value: Math.round(Math.min(social.mentions / 25000, 1) * 45) },
    { label: 'Engagement', value: Math.round(Math.min(social.engagement / 100000, 1) * 35) },
    { label: 'Sentiment', value: Math.round(Math.min(social.sentiment, 1) * 20) },
  ];

  const liquidity = [
    { label: 'Pool Depth', value: Math.round(Math.min(dex.liquidityUsd / 2_000_000, 1) * 45) },
    { label: '24h Volume', value: Math.round(Math.min(dex.volume24h / 8_000_000, 1) * 35) },
    { label: 'Stability', value: Math.round(Math.max(0, 20 - Math.min(Math.abs(dex.priceChange24h), 20))) },
  ];

  const risk = [
    { label: 'Manipulation Risk', value: fakeHypeScore },
    { label: 'Signal Quality', value: Math.max(0, 100 - fakeHypeScore) },
  ];

  return {
    hype,
    liquidity,
    risk,
  };
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

function findThemeForText(text) {
  return THEME_LIBRARY.filter((theme) => theme.terms.some((term) => text.includes(term)));
}

export function getDominantThemes(coins) {
  const scores = new Map();

  coins.forEach((coin, index) => {
    const weight = Math.max(1, 8 - index) + coin.hypeScore / 20;
    const haystack = `${coin.name} ${coin.symbol}`.toLowerCase();
    const matches = findThemeForText(haystack);

    matches.forEach((theme) => {
      scores.set(theme.key, (scores.get(theme.key) || 0) + weight);
    });
  });

  return [...scores.entries()]
    .map(([key, score]) => {
      const theme = THEME_LIBRARY.find((entry) => entry.key === key);
      return {
        key,
        label: theme?.label || key,
        score: Math.round(score),
        tokens: theme?.tokens || [],
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function buildCoinNameSuggestions(coins) {
  const dominantThemes = getDominantThemes(coins).slice(0, 3);
  const baseTokens = dominantThemes.flatMap((theme) => theme.tokens).filter(Boolean);
  const fallbackTokens = ['Meme', 'Signal', 'Launch'];
  const tokens = [...new Set([...baseTokens, ...fallbackTokens])].slice(0, 4);
  const suggestions = [];

  tokens.forEach((token, tokenIndex) => {
    const suffix = NAME_SUFFIXES[tokenIndex % NAME_SUFFIXES.length];
    suggestions.push(`${token}${suffix}`);
  });

  if (tokens.length >= 2) {
    suggestions.push(`${tokens[0]}${tokens[1]}`);
  }

  return [...new Set(suggestions)].slice(0, 5);
}

export function buildLaunchAdvisor(coins, now = new Date()) {
  const rankedCoins = [...coins].sort(
    (a, b) =>
      b.hypeScore +
      b.liquidityScore * 0.7 +
      b.sentimentScore * 20 -
      b.fakeHypeScore * 0.5 -
      (a.hypeScore + a.liquidityScore * 0.7 + a.sentimentScore * 20 - a.fakeHypeScore * 0.5),
  );
  const leader = rankedCoins.find((coin) => coin.fakeHypeScore < 65 && coin.prediction.label !== 'Dump') || rankedCoins[0];
  const launchReady = rankedCoins.find(
    (coin) =>
      coin.launchSignal?.label === 'Launch Window Open' &&
      coin.fakeHypeScore < 60 &&
      coin.liquidityScore >= 45 &&
      coin.sentimentScore >= 0.56,
  );
  const dominantThemes = getDominantThemes(rankedCoins.slice(0, 8));
  const nameSuggestions = buildCoinNameSuggestions(rankedCoins.slice(0, 8));
  const supportingCoins = rankedCoins.slice(0, 3).map((coin) => coin.name);
  const leadingTheme = dominantThemes[0]?.label || 'Mixed';
  const currentHour = now.getUTCHours();
  const highAttentionWindow = currentHour >= 12 && currentHour <= 20;

  if (launchReady) {
    return {
      status: 'open',
      headline: `Launch around ${launchReady.name} while attention is concentrated`,
      body: `${launchReady.name} is leading the ${leadingTheme.toLowerCase()} meme lane with positive sentiment, healthier liquidity, and more organic-looking momentum. If you launch now, mirror that narrative while the crowd is still discovering it instead of chasing a fully crowded top.`,
      bestWindow: highAttentionWindow ? 'Now through the next 4 hours' : 'Prepare now and target the next 6-10 hours',
      reason:
        'Social and market signals are aligned enough to support discovery without looking purely inorganic.',
      confidence: Math.min(96, Math.round(launchReady.hypeScore * 0.55 + launchReady.liquidityScore * 0.35)),
      bestCoinId: launchReady.id,
      bestCoinName: launchReady.name,
      leadingTheme,
      supportingCoins,
      dominantThemes,
      nameSuggestions,
    };
  }

  if (leader && leader.prediction.label === 'Early Trend') {
    return {
      status: 'prepare',
      headline: `Prepare a launch concept around the ${leader.name} meme lane`,
      body: `${leader.name} is still in the early trend phase inside the ${leadingTheme.toLowerCase()} narrative. Momentum exists, but it has not fully matured into a broad breakout yet, so this is better for concept prep than a hard launch.`,
      bestWindow: 'Watch the next 8-12 hours',
      reason: 'Mentions are improving, but the market still needs stronger liquidity confirmation.',
      confidence: Math.min(88, Math.round(leader.hypeScore * 0.5 + leader.sentimentScore * 30)),
      bestCoinId: leader.id,
      bestCoinName: leader.name,
      leadingTheme,
      supportingCoins,
      dominantThemes,
      nameSuggestions,
    };
  }

  return {
    status: 'wait',
    headline: 'Wait for a cleaner meme narrative before launching',
    body: `The tracked meme market is still fragmented across ${supportingCoins.join(', ')}. There is attention in the market, but not enough clean leadership inside one narrative lane to give a new launch easy discovery.`,
    bestWindow: 'Recheck in 12-24 hours',
    reason: 'Either liquidity is thin, fake-hype risk is elevated, or there is no clean leader yet.',
    confidence: leader ? Math.max(40, Math.round(leader.hypeScore * 0.42)) : 32,
    bestCoinId: leader?.id || '',
    bestCoinName: leader?.name || 'the market',
    leadingTheme,
    supportingCoins,
    dominantThemes,
    nameSuggestions,
  };
}

export function buildReminderFeed({
  coins,
  watchlist,
  alertPreferences,
  reminderSettings,
}) {
  if (!watchlist?.length || reminderSettings?.enabled === false || reminderSettings?.wishlistAlerts === false) {
    return [];
  }

  const watchlistCoins = coins.filter((coin) => watchlist.includes(coin.id));
  const reminders = [];

  watchlistCoins.forEach((coin) => {
    if (alertPreferences?.newTrends && (coin.prediction.label === 'Pump' || coin.prediction.label === 'Early Trend')) {
      reminders.push({
        id: `${coin.id}-trend`,
        coinId: coin.id,
        level: 'trend',
        priority: coin.prediction.label === 'Pump' ? 95 : 80,
        title: `${coin.name} is heating up`,
        message: `${coin.prediction.icon} ${coin.prediction.label} with hype ${coin.hypeScore}/100 and sentiment ${Math.round(coin.sentimentScore * 100)}%.`,
      });
    }

    if (alertPreferences?.fakeHype && reminderSettings?.riskAlerts !== false && coin.fakeHypeScore >= 60) {
      reminders.push({
        id: `${coin.id}-fake-hype`,
        coinId: coin.id,
        level: 'warning',
        priority: 90,
        title: `${coin.name} looks suspicious`,
        message: `Fake-hype risk is ${coin.fakeHypeScore}/100, which means the spike may be less organic than it appears.`,
      });
    }

    if (alertPreferences?.dumps && reminderSettings?.riskAlerts !== false && coin.prediction.label === 'Dump') {
      reminders.push({
        id: `${coin.id}-dump`,
        coinId: coin.id,
        level: 'danger',
        priority: 85,
        title: `${coin.name} is weakening`,
        message: `Price and sentiment are both slipping, so this watchlist coin needs a closer look.`,
      });
    }

    if (alertPreferences?.launchWindows && coin.launchSignal?.label === 'Launch Window Open') {
      reminders.push({
        id: `${coin.id}-launch`,
        coinId: coin.id,
        level: 'launch',
        priority: 82,
        title: `${coin.name} has a favorable launch window`,
        message: `${coin.launchSignal.detail} This can help you benchmark when to launch or promote a related meme coin.`,
      });
    }
  });

  return reminders.sort((a, b) => b.priority - a.priority).slice(0, 8);
}

export function summarizeSignals(coins) {
  const alerts = [];
  const riskyCoin = coins.find((coin) => coin.riskFlag);
  const pumpCoin = coins.find((coin) => coin.prediction.label === 'Pump');
  const earlyCoin = coins.find((coin) => coin.prediction.label === 'Early Trend');
  const suspiciousCoin = coins.find((coin) => coin.fakeHypeScore >= 70);
  const launchAdvisor = buildLaunchAdvisor(coins);

  if (pumpCoin) {
    alerts.push({ level: 'success', message: `New trend detected around ${pumpCoin.name}` });
  }
  if (suspiciousCoin) {
    alerts.push({ level: 'warning', message: `Bot-like fake hype suspected for ${suspiciousCoin.name}` });
  }
  if (riskyCoin) {
    alerts.push({ level: 'warning', message: `Potential pump and dump risk detected for ${riskyCoin.name}` });
  }
  if (!pumpCoin && !earlyCoin) {
    alerts.push({ level: 'info', message: 'Market momentum is cooling across tracked meme coins' });
  }
  if (coins.some((coin) => coin.prediction.label === 'Dump')) {
    alerts.push({ level: 'danger', message: 'Possible dump incoming on at least one tracked asset' });
  }

  const launchWindow =
    launchAdvisor.status === 'open'
      ? {
          open: true,
          headline: 'Launch Window Open',
          body: `${launchAdvisor.body} Best window: ${launchAdvisor.bestWindow}.`,
          bestWindow: launchAdvisor.bestWindow,
          confidence: launchAdvisor.confidence,
          bestCoinName: launchAdvisor.bestCoinName,
          leadingTheme: launchAdvisor.leadingTheme,
          supportingCoins: launchAdvisor.supportingCoins,
          nameSuggestions: launchAdvisor.nameSuggestions,
          reason: launchAdvisor.reason,
        }
      : {
          open: false,
          headline: 'Launch Window Narrow',
          body: `${launchAdvisor.body} Best window: ${launchAdvisor.bestWindow}.`,
          bestWindow: launchAdvisor.bestWindow,
          confidence: launchAdvisor.confidence,
          bestCoinName: launchAdvisor.bestCoinName,
          leadingTheme: launchAdvisor.leadingTheme,
          supportingCoins: launchAdvisor.supportingCoins,
          nameSuggestions: launchAdvisor.nameSuggestions,
          reason: launchAdvisor.reason,
        };

  return {
    alerts,
    launchWindow,
    launchAdvisor,
    headline: pumpCoin
      ? `${pumpCoin.name} leads the hype cycle with a ${pumpCoin.hypeScore}/100 hype score.`
      : 'No clear leader yet. The market is rotating without a decisive breakout.',
    body: suspiciousCoin
      ? `${suspiciousCoin.name} is drawing attention, but the fake-hype detector sees inorganic behavior patterns.`
      : 'Liquidity and sentiment are aligned well enough to support measured speculative interest.',
  };
}
