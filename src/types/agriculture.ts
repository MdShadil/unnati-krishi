export interface SoilData {
  id: string;
  farmerId: string;
  location: {
    lat: number;
    lng: number;
    state: string;
    district: string;
  };
  soilType: 'clay' | 'sandy' | 'loamy' | 'black' | 'red' | 'alluvial';
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  moisture: number;
  temperature: number;
  predictedAt: Date;
  accuracy: number;
}

export interface CropRecommendation {
  id: string;
  farmerId: string;
  soilData: SoilData;
  weatherData: WeatherData;
  marketData: MarketData;
  recommendedCrops: Array<{
    name: string;
    hindiName: string;
    scientificName: string;
    suitability: number;
    expectedYield: number;
    estimatedProfit: number;
    season: 'kharif' | 'rabi' | 'zaid';
    growthDuration: number;
    waterRequirement: 'low' | 'medium' | 'high';
    fertilizer: string[];
    benefits: string[];
    risks: string[];
  }>;
  generatedAt: Date;
  confidence: number;
}

export interface WeatherData {
  location: string;
  temperature: {
    current: number;
    min: number;
    max: number;
  };
  humidity: number;
  rainfall: number;
  forecast: Array<{
    date: Date;
    temperature: { min: number; max: number };
    rainfall: number;
    humidity: number;
    conditions: string;
  }>;
}

export interface MarketData {
  crop: string;
  currentPrice: number;
  predictedPrice: number;
  priceChange: number;
  demand: 'low' | 'medium' | 'high';
  marketTrend: 'rising' | 'falling' | 'stable';
  nearbyMarkets: string[];
  updatedAt: Date;
}

export interface Farm {
  id: string;
  farmerId: string;
  name: string;
  area: number; // in acres
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  soilType: string;
  currentCrops: CropField[];
  totalInvestment: number;
  expectedRevenue: number;
  createdAt: Date;
}

export interface CropField {
  id: string;
  farmId: string;
  cropName: string;
  variety: string;
  area: number;
  plantingDate: Date;
  expectedHarvest: Date;
  stage: 'planted' | 'growing' | 'flowering' | 'maturity' | 'harvested';
  expenses: Expense[];
  estimatedYield: number;
  actualYield?: number;
  healthStatus: 'healthy' | 'warning' | 'disease' | 'pest';
}

export interface Expense {
  id: string;
  type: 'seeds' | 'fertilizer' | 'pesticide' | 'labor' | 'irrigation' | 'machinery' | 'other';
  description: string;
  amount: number;
  date: Date;
  supplier?: string;
  receipt?: string;
}

export interface CropAnalysis {
  id: string;
  farmerId: string;
  imageUrl: string;
  cropType: string;
  analysis: {
    health: 'healthy' | 'diseased' | 'pest_damage' | 'nutrient_deficiency';
    confidence: number;
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      treatment: string[];
    }>;
    recommendations: string[];
  };
  analyzedAt: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  response: string;
  context?: {
    location?: string;
    cropType?: string;
    soilData?: Partial<SoilData>;
    weatherData?: Partial<WeatherData>;
  };
  isVoice: boolean;
  timestamp: Date;
}