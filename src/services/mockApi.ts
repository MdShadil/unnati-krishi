// Mock API service to simulate backend functionality
import { User, LoginCredentials, SignupData } from '../types/auth';
import { CropRecommendation, SoilData, WeatherData, MarketData, Farm, CropAnalysis, ChatMessage } from '../types/agriculture';

// Mock data storage
const mockUsers: User[] = [
  {
    id: '1',
    name: 'राम कुमार',
    email: 'ram.farmer@example.com',
    phone: '+91-9876543210',
    role: 'farmer',
    location: {
      state: 'Punjab',
      district: 'Ludhiana',
      coordinates: { lat: 30.9010, lng: 75.8573 }
    },
    language: 'hi',
    createdAt: new Date('2023-01-15'),
    lastActive: new Date()
  },
  {
    id: '2',
    name: 'Dr. Priya Sharma',
    email: 'priya.expert@example.com',
    phone: '+91-9876543211',
    role: 'expert',
    location: {
      state: 'Punjab',
      district: 'Ludhiana'
    },
    language: 'en',
    createdAt: new Date('2022-08-10'),
    lastActive: new Date()
  }
];

const mockSoilData: SoilData[] = [
  {
    id: '1',
    farmerId: '1',
    location: {
      lat: 30.9010,
      lng: 75.8573,
      state: 'Punjab',
      district: 'Ludhiana'
    },
    soilType: 'alluvial',
    ph: 7.2,
    nitrogen: 85,
    phosphorus: 45,
    potassium: 120,
    organicMatter: 3.8,
    moisture: 65,
    temperature: 28,
    predictedAt: new Date(),
    accuracy: 92
  }
];

const mockWeatherData: WeatherData = {
  location: 'Ludhiana, Punjab',
  temperature: {
    current: 28,
    min: 22,
    max: 35
  },
  humidity: 65,
  rainfall: 15,
  forecast: [
    {
      date: new Date(Date.now() + 86400000),
      temperature: { min: 23, max: 34 },
      rainfall: 10,
      humidity: 70,
      conditions: 'Partly cloudy'
    },
    {
      date: new Date(Date.now() + 2 * 86400000),
      temperature: { min: 24, max: 36 },
      rainfall: 0,
      humidity: 60,
      conditions: 'Sunny'
    }
  ]
};

const mockCropRecommendations: CropRecommendation[] = [
  {
    id: '1',
    farmerId: '1',
    soilData: mockSoilData[0],
    weatherData: mockWeatherData,
    marketData: {
      crop: 'wheat',
      currentPrice: 2100,
      predictedPrice: 2300,
      priceChange: 9.5,
      demand: 'high',
      marketTrend: 'rising',
      nearbyMarkets: ['Ludhiana Mandi', 'Khanna Mandi'],
      updatedAt: new Date()
    },
    recommendedCrops: [
      {
        name: 'Wheat',
        hindiName: 'गेहूं',
        scientificName: 'Triticum aestivum',
        suitability: 95,
        expectedYield: 45,
        estimatedProfit: 35000,
        season: 'rabi',
        growthDuration: 120,
        waterRequirement: 'medium',
        fertilizer: ['DAP', 'Urea', 'Potash'],
        benefits: ['High market demand', 'Good storage life', 'Government support'],
        risks: ['Late sowing risk', 'Aphid attack possible']
      },
      {
        name: 'Mustard',
        hindiName: 'सरसों',
        scientificName: 'Brassica juncea',
        suitability: 88,
        expectedYield: 18,
        estimatedProfit: 28000,
        season: 'rabi',
        growthDuration: 100,
        waterRequirement: 'low',
        fertilizer: ['DAP', 'Urea'],
        benefits: ['Less water requirement', 'Good oil content'],
        risks: ['Price fluctuation', 'Pest attacks']
      }
    ],
    generatedAt: new Date(),
    confidence: 92
  }
];

// Mock API functions
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    const user = mockUsers.find(u => u.email === credentials.email);
    if (!user || credentials.password !== 'password123') {
      throw new Error('Invalid credentials');
    }
    
    return {
      user,
      token: 'mock-jwt-token-' + user.id
    };
  },

  signup: async (data: SignupData): Promise<{ user: User; token: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (mockUsers.find(u => u.email === data.email)) {
      throw new Error('User already exists');
    }
    
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      location: {
        state: data.state,
        district: data.district
      },
      language: data.language,
      createdAt: new Date(),
      lastActive: new Date()
    };
    
    mockUsers.push(newUser);
    
    return {
      user: newUser,
      token: 'mock-jwt-token-' + newUser.id
    };
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

export const agricultureApi = {
  getSoilPrediction: async (lat: number, lng: number): Promise<SoilData> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return mockSoilData[0];
  },

  getCropRecommendations: async (farmerId: string): Promise<CropRecommendation> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return mockCropRecommendations[0];
  },

  getWeatherData: async (location: string): Promise<WeatherData> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockWeatherData;
  },

  analyzeCropImage: async (imageFile: File): Promise<CropAnalysis> => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      id: '1',
      farmerId: '1',
      imageUrl: URL.createObjectURL(imageFile),
      cropType: 'wheat',
      analysis: {
        health: 'healthy',
        confidence: 87,
        issues: [],
        recommendations: [
          'Crop appears healthy with good growth',
          'Consider applying potash fertilizer in 2 weeks',
          'Monitor for aphid activity as season progresses'
        ]
      },
      analyzedAt: new Date()
    };
  },

  sendChatMessage: async (message: string, context?: any): Promise<ChatMessage> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Simple response logic based on keywords
    let response = '';
    if (message.toLowerCase().includes('wheat')) {
      response = 'गेहूं की खेती के लिए यह सबसे अच्छा समय है। आपको DAP और यूरिया का उपयोग करना चाहिए।';
    } else if (message.toLowerCase().includes('fertilizer')) {
      response = 'आपकी मिट्टी के अनुसार, मैं DAP, यूरिया, और पोटाश खाद की सलाह देता हूं।';
    } else {
      response = 'मैं आपकी कृषि संबंधी समस्याओं में मदद कर सकता हूं। कृपया अपना सवाल विस्तार से बताएं।';
    }
    
    return {
      id: Date.now().toString(),
      userId: '1',
      message,
      response,
      context,
      isVoice: false,
      timestamp: new Date()
    };
  }
};

export const farmApi = {
  getFarms: async (farmerId: string): Promise<Farm[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: '1',
        farmerId,
        name: 'मुख्य खेत',
        area: 5.5,
        location: {
          lat: 30.9010,
          lng: 75.8573,
          address: 'Village Khanna, Ludhiana, Punjab'
        },
        soilType: 'Alluvial',
        currentCrops: [],
        totalInvestment: 125000,
        expectedRevenue: 185000,
        createdAt: new Date('2023-01-15')
      }
    ];
  }
};