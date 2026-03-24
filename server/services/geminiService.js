import { buildLaunchAdvisor, buildReminderFeed } from '../../src/lib/analytics.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function extractTextFromCandidate(candidate) {
  const parts = candidate?.content?.parts || [];
  return parts
    .map((part) => part?.text || '')
    .join('')
    .trim();
}

function buildCoinSnapshot(coin) {
  return {
    name: coin.name,
    symbol: coin.symbol,
    price: coin.price,
    chain: coin.chain,
    prediction: coin.prediction.label,
    lifecycleStage: coin.lifecycleStage.label,
    launchSignal: coin.launchSignal.label,
    hypeScore: coin.hypeScore,
    liquidityScore: coin.liquidityScore,
    fakeHypeScore: coin.fakeHypeScore,
    sentimentScore: Number(coin.sentimentScore?.toFixed?.(2) || coin.sentimentScore || 0),
    priceChange24h: coin.priceChange24h,
    explanation: coin.explanation,
  };
}

function buildContextPayload({ coins, user, localResponse }) {
  const launchAdvisor = buildLaunchAdvisor(coins);
  const reminders = user
    ? buildReminderFeed({
        coins,
        watchlist: user.watchlist,
        alertPreferences: user.alertPreferences,
        reminderSettings: user.reminderSettings,
      }).slice(0, 4)
    : [];

  return {
    topCoins: coins.slice(0, 6).map(buildCoinSnapshot),
    launchAdvisor: {
      headline: launchAdvisor.headline,
      bestWindow: launchAdvisor.bestWindow,
      reason: launchAdvisor.reason,
      bestCoinName: launchAdvisor.bestCoinName,
      nameSuggestions: launchAdvisor.nameSuggestions,
    },
    user: user
      ? {
          name: user.name,
          watchlistCount: user.watchlist.length,
          watchlist: user.watchlist,
          reminders,
        }
      : null,
    fallbackAnswer: localResponse.reply,
  };
}

function buildSystemInstruction() {
  return [
    'You are MemeSense AI, a beginner-friendly assistant inside a meme coin intelligence dashboard.',
    'You answer in clear, non-hyped language.',
    'When the question is educational, teach the concept simply and directly.',
    'When the question is about current meme coins or launch timing, stay grounded in the supplied app context only.',
    'Do not invent real-time facts beyond the provided context.',
    'Do not promise profits or give reckless financial advice.',
    'Keep replies concise, useful, and natural, usually 3 to 7 sentences.',
    'If the supplied fallback answer contains a concrete claim from the app, do not contradict it.',
  ].join(' ');
}

function buildUserPrompt({ message, coins, user, localResponse }) {
  const context = buildContextPayload({ coins, user, localResponse });

  return [
    `User question: ${message}`,
    '',
    'App context:',
    JSON.stringify(context, null, 2),
    '',
    'Write a helpful answer for the in-app chat assistant.',
    'If the question is educational, explain it simply.',
    'If the question is market-specific, use the supplied context and mention uncertainty where appropriate.',
    'Return only the answer text, with no JSON and no markdown bullets unless they genuinely help.',
  ].join('\n');
}

export async function maybeGenerateGeminiReply({ message, coins, user, localResponse }) {
  if (!hasGeminiKey() || !String(message || '').trim()) {
    return null;
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const endpoint = `${GEMINI_API_URL}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: buildSystemInstruction() }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: buildUserPrompt({ message, coins, user, localResponse }) }],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 400,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const text = payload?.candidates?.map(extractTextFromCandidate).find(Boolean) || '';

  return text.trim() || null;
}
