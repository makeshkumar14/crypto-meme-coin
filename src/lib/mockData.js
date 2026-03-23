export const mockSocialProfiles = {
  DOGE: { mentions: 18200, engagement: 72400, sentiment: 0.79, influencers: 38 },
  SHIB: { mentions: 14300, engagement: 63100, sentiment: 0.73, influencers: 31 },
  PEPE: { mentions: 19700, engagement: 88400, sentiment: 0.81, influencers: 44 },
  BONK: { mentions: 11600, engagement: 50200, sentiment: 0.69, influencers: 22 },
  WIF: { mentions: 13900, engagement: 59100, sentiment: 0.76, influencers: 28 },
  FLOKI: { mentions: 9700, engagement: 38800, sentiment: 0.67, influencers: 19 },
  BRETT: { mentions: 7600, engagement: 30300, sentiment: 0.64, influencers: 16 },
  POPCAT: { mentions: 8900, engagement: 34100, sentiment: 0.71, influencers: 18 },
};

export function buildMockTimeSeries(coin) {
  const baseMentions = Math.round(coin.social.mentions * 0.52);
  const baseEngagement = Math.round(coin.social.engagement * 0.48);
  const basePrice = coin.price * 0.88;

  return Array.from({ length: 7 }).map((_, index) => {
    const factor = 0.84 + index * 0.05 + (coin.sentimentScore - 0.5) * 0.08;
    return {
      label: `D-${6 - index}`,
      mentions: Math.round(baseMentions * factor),
      engagement: Math.round(baseEngagement * factor),
      price: Number((basePrice * factor).toFixed(6)),
    };
  });
}
