import { buildLaunchAdvisor, buildReminderFeed } from '../../src/lib/analytics.js';
import { answerEducationalQuestion } from './educationService.js';
import { maybeGenerateGeminiReply } from './geminiService.js';

function findCoinMatch(coins, input) {
  const normalized = input.toLowerCase();
  return coins.find((coin) => {
    const haystack = `${coin.name} ${coin.symbol}`.toLowerCase();
    return (
      haystack.includes(normalized) ||
      normalized.includes(coin.name.toLowerCase()) ||
      normalized.includes(coin.symbol.toLowerCase())
    );
  });
}

function buildCoinAnswer(coin) {
  return `${coin.name} is currently rated ${coin.prediction.label} with hype ${coin.hypeScore}/100, liquidity ${coin.liquidityScore}/100, fake-hype risk ${coin.fakeHypeScore}/100, and lifecycle stage ${coin.lifecycleStage.label}. ${coin.explanation}`;
}

function buildFallbackSuggestions(message, localSuggestions) {
  if (Array.isArray(localSuggestions) && localSuggestions.length) {
    return localSuggestions;
  }

  const normalized = String(message || '').toLowerCase();

  if (normalized.includes('what is') || normalized.includes('explain') || normalized.includes('learn')) {
    return [
      'What is fake hype?',
      'What is a pump and dump?',
      'What is launch window?',
    ];
  }

  if (normalized.includes('launch') || normalized.includes('name')) {
    return [
      'What is the best launch window now?',
      'Which meme theme is strongest right now?',
      'Suggest names based on trending memes',
    ];
  }

  return [
    'What is a meme coin?',
    'What is the best meme to launch around right now?',
    'Explain liquidity in simple words',
  ];
}

function buildLocalChatResponse({ message, coins, user }) {
  const trimmed = String(message || '').trim();

  if (!trimmed) {
    return {
      reply:
        'Ask about any tracked meme coin, crypto basics, the best launch window, a possible name idea, or watchlist reminders.',
      suggestions: [
        'What is a meme coin?',
        'What is the best meme to launch around right now?',
        'Explain liquidity in simple words',
      ],
      referencedCoins: [],
    };
  }

  const normalized = trimmed.toLowerCase();
  const launchAdvisor = buildLaunchAdvisor(coins);
  const topCoins = [...coins].slice(0, 3);
  const matchedCoin = findCoinMatch(coins, normalized);

  if (matchedCoin) {
    return {
      reply: buildCoinAnswer(matchedCoin),
      suggestions: [
        `Should I watch ${matchedCoin.symbol} for dump risk?`,
        `Why is ${matchedCoin.symbol} in ${matchedCoin.lifecycleStage.label.toLowerCase()} stage?`,
        `What launch signal does ${matchedCoin.symbol} show?`,
      ],
      referencedCoins: [matchedCoin.id],
    };
  }

  const educationalResponse = answerEducationalQuestion(trimmed);
  if (educationalResponse) {
    return educationalResponse;
  }

  if (normalized.includes('launch') && normalized.includes('name')) {
    return {
      reply: `The strongest meme lane right now is around ${launchAdvisor.bestCoinName}. Suggested names: ${launchAdvisor.nameSuggestions.join(', ')}. Best window: ${launchAdvisor.bestWindow}.`,
      suggestions: [
        'Why is that the best launch window?',
        'Which meme theme is strongest right now?',
        'What is the safest launch setup today?',
      ],
      referencedCoins: launchAdvisor.bestCoinId ? [launchAdvisor.bestCoinId] : [],
    };
  }

  if (normalized.includes('launch') || normalized.includes('best time')) {
    return {
      reply: `${launchAdvisor.headline}. Best window: ${launchAdvisor.bestWindow}. ${launchAdvisor.reason}`,
      suggestions: [
        'Suggest coin names from that meme trend',
        'Which coin is leading that narrative?',
        'What are the biggest risks right now?',
      ],
      referencedCoins: launchAdvisor.bestCoinId ? [launchAdvisor.bestCoinId] : [],
    };
  }

  if (normalized.includes('name') || normalized.includes('branding')) {
    return {
      reply: `Based on the dominant meme themes, these names look strongest right now: ${launchAdvisor.nameSuggestions.join(', ')}.`,
      suggestions: [
        'What is the best time to launch one of these?',
        'Which theme is strongest right now?',
        'What meme coin is leading the market?',
      ],
      referencedCoins: launchAdvisor.bestCoinId ? [launchAdvisor.bestCoinId] : [],
    };
  }

  if (normalized.includes('watchlist') || normalized.includes('reminder')) {
    const reminders = user
      ? buildReminderFeed({
          coins,
          watchlist: user.watchlist,
          alertPreferences: user.alertPreferences,
          reminderSettings: user.reminderSettings,
        })
      : [];

    if (!user) {
      return {
        reply:
          'Sign in to get personal watchlist reminders. Once you are signed in, I can summarize your hottest saved coins and risk alerts.',
        suggestions: [
          'What is the best meme coin to watch now?',
          'Suggest names based on the current meme trend',
          'Is the market in a launch window?',
        ],
        referencedCoins: [],
      };
    }

    if (!reminders.length) {
      return {
        reply:
          'Your watchlist does not have any urgent reminders right now. The saved coins are being monitored, but nothing has crossed your alert thresholds.',
        suggestions: [
          'Which saved coin is closest to a launch window?',
          'Show my riskiest watchlist coin',
          'What are the best current meme themes?',
        ],
        referencedCoins: [],
      };
    }

    return {
      reply: reminders
        .slice(0, 3)
        .map((reminder, index) => `${index + 1}. ${reminder.title}: ${reminder.message}`)
        .join(' '),
      suggestions: [
        'Which watchlist coin has fake hype risk?',
        'What is the best launch window right now?',
        'Suggest names based on the hottest trend',
      ],
      referencedCoins: reminders.map((reminder) => reminder.coinId),
    };
  }

  if (normalized.includes('fake hype') || normalized.includes('risk') || normalized.includes('bot')) {
    const suspicious = [...coins].sort((a, b) => b.fakeHypeScore - a.fakeHypeScore).slice(0, 3);
    return {
      reply: suspicious
        .map(
          (coin) =>
            `${coin.name} has fake-hype risk ${coin.fakeHypeScore}/100 with ${coin.fakeHypeSignal.label.toLowerCase()}.`,
        )
        .join(' '),
      suggestions: [
        'Which coin looks most organic?',
        'What is the best launch window now?',
        'Explain the top meme coin today',
      ],
      referencedCoins: suspicious.map((coin) => coin.id),
    };
  }

  if (normalized.includes('top') || normalized.includes('trend') || normalized.includes('best meme coin')) {
    return {
      reply: topCoins
        .map(
          (coin, index) =>
            `${index + 1}. ${coin.name} is ${coin.prediction.label} with hype ${coin.hypeScore}/100 and sentiment ${Math.round(coin.sentimentScore * 100)}%.`,
        )
        .join(' '),
      suggestions: [
        'Which one is safest?',
        'What meme theme is strongest right now?',
        'Give me launch name ideas',
      ],
      referencedCoins: topCoins.map((coin) => coin.id),
    };
  }

  return {
    reply: `${launchAdvisor.headline}. The top tracked coins right now are ${topCoins
      .map((coin) => coin.name)
      .join(', ')}. Ask me about a specific coin, crypto basics, launch timing, name ideas, or watchlist reminders.`,
    suggestions: [
      'What is fake hype?',
      'What is the best launch window now?',
      'What is a rug pull?',
    ],
    referencedCoins: topCoins.map((coin) => coin.id),
  };
}

export async function answerChatMessage({ message, coins, user }) {
  const localResponse = buildLocalChatResponse({ message, coins, user });

  try {
    const geminiReply = await maybeGenerateGeminiReply({
      message,
      coins,
      user,
      localResponse,
    });

    if (geminiReply) {
      return {
        ...localResponse,
        reply: geminiReply,
        suggestions: buildFallbackSuggestions(message, localResponse.suggestions),
      };
    }
  } catch {
    // Fall back to the local response if Gemini is not configured or fails.
  }

  return localResponse;
}
