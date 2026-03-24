function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const LEARNING_TOPICS = [
  {
    id: 'meme-coins',
    title: 'Meme Coins',
    keywords: ['meme coin', 'meme coins'],
    answer:
      'A meme coin is a crypto token whose attention comes mainly from internet culture, jokes, community energy, and viral narratives rather than deep utility. Prices often move fast because hype, timing, and social sentiment matter a lot.',
    suggestions: [
      'Why are meme coins so volatile?',
      'What is fake hype in meme coins?',
      'What is a pump and dump?',
    ],
  },
  {
    id: 'liquidity',
    title: 'Liquidity',
    keywords: ['liquidity', 'liquid market', 'liquidity pool'],
    answer:
      'Liquidity is how easily a coin can be bought or sold without causing a huge price jump. Higher liquidity usually means smoother trading, while low liquidity makes meme coins easier to manipulate and more dangerous during hype spikes.',
    suggestions: [
      'Why does liquidity matter for meme coins?',
      'What is market cap?',
      'What is a pump and dump?',
    ],
  },
  {
    id: 'market-cap',
    title: 'Market Cap',
    keywords: ['market cap', 'market capitalization'],
    answer:
      'Market cap is the coin price multiplied by circulating supply. It gives a rough sense of size, but it does not tell you whether the coin is safe, liquid, or easy to trade. In meme coins, market cap can look big while liquidity is still weak.',
    suggestions: [
      'What is the difference between market cap and liquidity?',
      'What is liquidity?',
      'Why are meme coins volatile?',
    ],
  },
  {
    id: 'sentiment',
    title: 'Sentiment',
    keywords: ['sentiment', 'social sentiment'],
    answer:
      'Sentiment measures whether the overall crowd tone looks positive, negative, or mixed. In meme coins, positive sentiment can support momentum, but strong sentiment alone is not enough if liquidity is weak or the hype looks inorganic.',
    suggestions: [
      'What is fake hype?',
      'How do I read hype score?',
      'What is an early signal?',
    ],
  },
  {
    id: 'hype-score',
    title: 'Hype Score',
    keywords: ['hype score', 'hype'],
    answer:
      'The hype score is a combined view of mentions, engagement, and sentiment. A high score means the meme is getting attention, but you still need to check liquidity and fake-hype risk to decide whether that attention looks healthy or dangerous.',
    suggestions: [
      'What is fake hype score?',
      'What is liquidity?',
      'What is launch window?',
    ],
  },
  {
    id: 'fake-hype',
    title: 'Fake Hype',
    keywords: ['fake hype', 'bot activity', 'inorganic hype', 'bot like activity'],
    answer:
      'Fake hype is attention that looks manipulated rather than organic. Common signs include sudden mention spikes, weak engagement quality, thin liquidity, and price action that does not match the social buzz. It often appears in pump-and-dump setups.',
    suggestions: [
      'What is a pump and dump?',
      'Why does low liquidity matter?',
      'How do I read fake hype score?',
    ],
  },
  {
    id: 'pump-and-dump',
    title: 'Pump And Dump',
    keywords: ['pump and dump', 'pump dump', 'dump', 'pump'],
    answer:
      'A pump and dump is when attention and price are pushed up quickly so late buyers enter at high prices, then early holders sell into that demand. In meme coins, this usually shows up as sharp hype, weak quality signals, and fast reversals.',
    suggestions: [
      'What is fake hype?',
      'What is a rug pull?',
      'Why is liquidity important?',
    ],
  },
  {
    id: 'rug-pull',
    title: 'Rug Pull',
    keywords: ['rug pull', 'rugpull', 'rug'],
    answer:
      'A rug pull is a scam where developers or insiders drain liquidity, abandon the token, or exploit holders after attracting money and attention. It is more severe than normal volatility because the project itself is designed to break trust.',
    suggestions: [
      'What is a pump and dump?',
      'How does fake hype look?',
      'Why is liquidity important?',
    ],
  },
  {
    id: 'launch-window',
    title: 'Launch Window',
    keywords: ['launch window', 'best time to launch', 'launch timing'],
    answer:
      'A launch window is a period when social interest, engagement quality, and market structure are aligned enough to give a new meme coin a better chance of discovery. A good window usually means rising attention with manageable fake-hype risk and decent liquidity context.',
    suggestions: [
      'How do you choose the best launch window?',
      'What is an early signal?',
      'Suggest names based on trending memes',
    ],
  },
  {
    id: 'early-signal',
    title: 'Early Signal',
    keywords: ['early signal', 'early trend', 'detected early'],
    answer:
      'An early signal means social and market activity are improving before the meme looks fully crowded. It tries to catch the phase where mentions and sentiment are rising, but the move has not already become obvious to everyone.',
    suggestions: [
      'What is launch window?',
      'What is lifecycle stage?',
      'How do I read hype score?',
    ],
  },
  {
    id: 'lifecycle-stage',
    title: 'Lifecycle Stage',
    keywords: ['lifecycle stage', 'hype cycle', 'growth stage', 'decline stage', 'peak stage'],
    answer:
      'Lifecycle stage describes where a meme appears in its attention cycle: early, growth, peak, distorted, steady, or decline. It helps users see whether they are looking at a fresh narrative, a mature breakout, or a fading setup.',
    suggestions: [
      'What is an early signal?',
      'What is fake hype?',
      'What is launch window?',
    ],
  },
  {
    id: 'volatility',
    title: 'Volatility',
    keywords: ['volatile', 'volatility'],
    answer:
      'Volatility means the price moves up and down quickly. Meme coins are usually volatile because small changes in attention, liquidity, and trader behavior can move the price much more than in larger, more established assets.',
    suggestions: [
      'Why do meme coins move so fast?',
      'What is liquidity?',
      'What is fake hype?',
    ],
  },
];

const EDUCATION_INTENTS = [
  'what is',
  'what are',
  'explain',
  'define',
  'meaning of',
  'how does',
  'how do i',
  'teach me',
  'learn',
  'beginner',
  'basics',
  'guide',
  'simple terms',
  'easy words',
];

function hasEducationIntent(normalized) {
  return EDUCATION_INTENTS.some((intent) => normalized.includes(intent));
}

function buildTopicResponse(topic) {
  return {
    reply: `${topic.title}: ${topic.answer}`,
    suggestions: topic.suggestions,
    referencedCoins: [],
  };
}

export function answerEducationalQuestion(message) {
  const normalized = normalizeText(message);

  if (!normalized) {
    return null;
  }

  if (
    normalized.includes('difference between market cap and liquidity') ||
    ((normalized.includes('market cap') || normalized.includes('market capitalization')) &&
      normalized.includes('liquidity') &&
      (normalized.includes('difference') || normalized.includes('vs') || normalized.includes('compare')))
  ) {
    return {
      reply:
        'Market cap estimates a coin’s size by multiplying price by circulating supply. Liquidity measures how easily the coin can actually be bought or sold without moving the price too much. In meme coins, market cap can look impressive while liquidity is still weak, so liquidity is often the more practical risk signal for traders.',
      suggestions: [
        'What is liquidity?',
        'What is market cap?',
        'Why does low liquidity matter?',
      ],
      referencedCoins: [],
    };
  }

  if (
    normalized.includes('what can you teach') ||
    normalized.includes('what can you explain') ||
    normalized.includes('learning topics') ||
    normalized.includes('crypto basics') ||
    normalized.includes('teach me crypto')
  ) {
    return {
      reply:
        'I can explain meme coins, liquidity, market cap, sentiment, hype score, fake hype, pump and dump setups, rug pulls, launch windows, early signals, lifecycle stages, and volatility in beginner-friendly language.',
      suggestions: [
        'What is a meme coin?',
        'What is liquidity?',
        'What is fake hype?',
      ],
      referencedCoins: [],
    };
  }

  if (!hasEducationIntent(normalized)) {
    return null;
  }

  const scoredTopics = LEARNING_TOPICS.map((topic) => {
    const score = topic.keywords.reduce((total, keyword) => {
      return total + (normalized.includes(keyword) ? Math.max(1, keyword.split(' ').length) : 0);
    }, 0);

    return {
      topic,
      score,
    };
  }).sort((left, right) => right.score - left.score);

  if (!scoredTopics[0] || scoredTopics[0].score === 0) {
    return {
      reply:
        'I can explain common meme coin concepts in simple terms. Try asking about meme coins, liquidity, market cap, fake hype, launch windows, pump and dump setups, or rug pulls.',
      suggestions: [
        'What is a meme coin?',
        'What is liquidity?',
        'What is a rug pull?',
      ],
      referencedCoins: [],
    };
  }

  return buildTopicResponse(scoredTopics[0].topic);
}
