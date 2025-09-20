const axios = require('axios');

class MarketService {
  constructor() {
    this.apiKey = process.env.MARKET_API_KEY;
    this.fallbackPrices = {
      rice: { min: 20, max: 25, current: 22 },
      wheat: { min: 22, max: 27, current: 24 },
      cotton: { min: 5500, max: 6500, current: 6000 },
      sugarcane: { min: 280, max: 320, current: 300 },
      maize: { min: 18, max: 22, current: 20 },
      soybean: { min: 45, max: 55, current: 50 }
    };
  }

  async getRegionalMarketData(state, district) {
    try {
      // Mock implementation - replace with actual market data API
      return this.generateMarketData(state, district);
    } catch (error) {
      console.error('Market data error:', error);
      return this.generateMarketData(state, district);
    }
  }

  generateMarketData(state, district) {
    const crops = {};
    
    Object.entries(this.fallbackPrices).forEach(([crop, prices]) => {
      const variation = (Math.random() - 0.5) * 0.2; // ±20% variation
      const currentPrice = prices.current * (1 + variation);
      const predictedPrice = currentPrice * (1 + (Math.random() - 0.5) * 0.3);
      
      crops[crop] = {
        currentPrice: Math.round(currentPrice * 100) / 100,
        predictedPrice: Math.round(predictedPrice * 100) / 100,
        priceChange: Math.round(((predictedPrice - currentPrice) / currentPrice * 100) * 100) / 100,
        demand: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        marketTrend: predictedPrice > currentPrice ? 'rising' : 'falling',
        nearbyMarkets: [`${district} Mandi`, `${state} APMC`, 'Regional Market'],
        updatedAt: new Date()
      };
    });

    return {
      crops,
      summary: {
        region: `${district}, ${state}`,
        overallTrend: 'stable',
        avgPriceChange: 2.5,
        marketActivity: 'moderate'
      }
    };
  }
}

module.exports = new MarketService();