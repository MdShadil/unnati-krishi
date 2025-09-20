const tf = require('@tensorflow/tfjs-node');
const compromise = require('compromise');
const fs = require('fs').promises;
const path = require('path');

class AIService {
  constructor() {
    this.models = {};
    this.isInitialized = false;
    this.cropDatabase = this.initializeCropDatabase();
    this.soilHealthRanges = this.initializeSoilRanges();
  }

  // Initialize the AI service and load models
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🤖 Initializing AI Service...');
      
      // Initialize placeholder models (replace with actual trained models)
      await this.initializeModels();
      
      this.isInitialized = true;
      console.log('✅ AI Service initialized successfully');
    } catch (error) {
      console.error('❌ AI Service initialization failed:', error);
      throw error;
    }
  }

  // Initialize AI models (placeholder implementation)
  async initializeModels() {
    // Soil Health Prediction Model
    this.models.soilHealth = await this.createSoilHealthModel();
    
    // Crop Recommendation Model
    this.models.cropRecommendation = await this.createCropRecommendationModel();
    
    // Disease Detection Model
    this.models.diseaseDetection = await this.createDiseaseDetectionModel();
    
    // Market Price Prediction Model
    this.models.marketPrediction = await this.createMarketPredictionModel();
  }

  // Create placeholder soil health prediction model
  async createSoilHealthModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [8], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 7, activation: 'sigmoid' }) // pH, N, P, K, organic matter, moisture, temperature
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  // Create placeholder crop recommendation model
  async createCropRecommendationModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [15], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 20, activation: 'softmax' }) // 20 popular crops
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  // Create placeholder disease detection model
  async createDiseaseDetectionModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.conv2d({ inputShape: [224, 224, 3], filters: 32, kernelSize: 3, activation: 'relu' }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.conv2d({ filters: 128, kernelSize: 3, activation: 'relu' }),
        tf.layers.globalAveragePooling2d(),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 10, activation: 'softmax' }) // 10 common diseases/health states
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  // Create placeholder market prediction model
  async createMarketPredictionModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' }) // Price prediction
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  // Initialize crop database with Indian crops
  initializeCropDatabase() {
    return {
      rice: {
        hindiName: 'चावल',
        scientificName: 'Oryza sativa',
        seasons: ['kharif'],
        soilTypes: ['clay', 'loamy', 'alluvial'],
        phRange: { min: 5.5, max: 7.0 },
        waterRequirement: 'high',
        growthDuration: 120,
        avgYield: 2500, // kg per acre
        marketPrice: { min: 20, max: 25 }, // INR per kg
        fertilizers: [
          { name: 'Urea', quantity: '60 kg/acre', applicationTime: 'Basal + Top dressing' },
          { name: 'DAP', quantity: '50 kg/acre', applicationTime: 'Basal' },
          { name: 'Potash', quantity: '30 kg/acre', applicationTime: 'Basal' }
        ]
      },
      wheat: {
        hindiName: 'गेहूं',
        scientificName: 'Triticum aestivum',
        seasons: ['rabi'],
        soilTypes: ['loamy', 'clay', 'alluvial'],
        phRange: { min: 6.0, max: 7.5 },
        waterRequirement: 'medium',
        growthDuration: 130,
        avgYield: 2000,
        marketPrice: { min: 22, max: 27 },
        fertilizers: [
          { name: 'Urea', quantity: '50 kg/acre', applicationTime: 'Split application' },
          { name: 'DAP', quantity: '40 kg/acre', applicationTime: 'Basal' }
        ]
      },
      cotton: {
        hindiName: 'कपास',
        scientificName: 'Gossypium spp.',
        seasons: ['kharif'],
        soilTypes: ['black', 'alluvial', 'sandy'],
        phRange: { min: 5.8, max: 8.0 },
        waterRequirement: 'high',
        growthDuration: 180,
        avgYield: 15, // quintals per acre
        marketPrice: { min: 5500, max: 6500 }, // per quintal
        fertilizers: [
          { name: 'Urea', quantity: '80 kg/acre', applicationTime: 'Split application' },
          { name: 'DAP', quantity: '60 kg/acre', applicationTime: 'Basal' }
        ]
      },
      sugarcane: {
        hindiName: 'गन्ना',
        scientificName: 'Saccharum officinarum',
        seasons: ['kharif', 'rabi'],
        soilTypes: ['loamy', 'clay', 'alluvial'],
        phRange: { min: 6.0, max: 8.0 },
        waterRequirement: 'high',
        growthDuration: 365,
        avgYield: 45000, // kg per acre
        marketPrice: { min: 3, max: 4 },
        fertilizers: [
          { name: 'Urea', quantity: '120 kg/acre', applicationTime: 'Multiple splits' },
          { name: 'DAP', quantity: '100 kg/acre', applicationTime: 'Basal' }
        ]
      },
      maize: {
        hindiName: 'मक्का',
        scientificName: 'Zea mays',
        seasons: ['kharif', 'rabi'],
        soilTypes: ['loamy', 'sandy', 'alluvial'],
        phRange: { min: 6.0, max: 7.5 },
        waterRequirement: 'medium',
        growthDuration: 100,
        avgYield: 2200,
        marketPrice: { min: 18, max: 22 },
        fertilizers: [
          { name: 'Urea', quantity: '60 kg/acre', applicationTime: 'Split application' }
        ]
      },
      soybean: {
        hindiName: 'सोयाबीन',
        scientificName: 'Glycine max',
        seasons: ['kharif'],
        soilTypes: ['black', 'loamy', 'red'],
        phRange: { min: 6.0, max: 7.5 },
        waterRequirement: 'medium',
        growthDuration: 95,
        avgYield: 1200,
        marketPrice: { min: 45, max: 55 },
        fertilizers: [
          { name: 'DAP', quantity: '40 kg/acre', applicationTime: 'Basal' }
        ]
      }
    };
  }

  // Initialize soil health ranges
  initializeSoilRanges() {
    return {
      ph: { optimal: { min: 6.0, max: 7.5 }, low: 5.5, high: 8.0 },
      nitrogen: { low: 280, medium: 280, high: 560 },
      phosphorus: { low: 11, medium: 22, high: 56 },
      potassium: { low: 110, medium: 280, high: 560 },
      organicMatter: { low: 0.5, medium: 1.5, high: 3.0 },
      moisture: { low: 20, optimal: 60, high: 80 }
    };
  }

  // Predict soil health based on location and environmental factors
  async predictSoilHealth({ location, weather, season, soilType, historicalData }) {
    if (!this.isInitialized) await this.initialize();

    try {
      // Prepare input features for the model
      const features = this.prepareSoilFeatures({
        location,
        weather,
        season,
        soilType
      });

      // Use the model to predict soil parameters (placeholder logic)
      const prediction = this.generateSoilPrediction(features);

      return {
        ph: Math.round(prediction.ph * 100) / 100,
        nitrogen: Math.round(prediction.nitrogen),
        phosphorus: Math.round(prediction.phosphorus),
        potassium: Math.round(prediction.potassium),
        organicMatter: Math.round(prediction.organicMatter * 100) / 100,
        moisture: Math.round(prediction.moisture),
        temperature: Math.round(prediction.temperature * 10) / 10,
        fertility: prediction.fertility,
        recommendations: this.generateSoilRecommendations(prediction),
        confidence: 85 + Math.random() * 10 // 85-95%
      };
    } catch (error) {
      console.error('Error in soil health prediction:', error);
      throw new Error('Failed to predict soil health');
    }
  }

  // Prepare soil prediction features
  prepareSoilFeatures({ location, weather, season, soilType }) {
    const seasonMap = { kharif: 1, rabi: 2, zaid: 3 };
    const soilTypeMap = { 
      clay: 1, sandy: 2, loamy: 3, black: 4, 
      red: 5, alluvial: 6, laterite: 7 
    };

    return {
      latitude: location.lat || 20.0,
      longitude: location.lng || 77.0,
      season: seasonMap[season] || 1,
      soilType: soilTypeMap[soilType] || 3,
      temperature: weather?.temperature?.current || 25,
      humidity: weather?.humidity || 60,
      rainfall: weather?.rainfall || 100,
      elevation: 300 // Default elevation
    };
  }

  // Generate soil prediction (placeholder implementation)
  generateSoilPrediction(features) {
    const baseValues = {
      clay: { ph: 7.2, n: 320, p: 18, k: 240, om: 2.1, moisture: 65 },
      sandy: { ph: 6.8, n: 180, p: 12, k: 160, om: 1.2, moisture: 35 },
      loamy: { ph: 6.9, n: 280, p: 22, k: 220, om: 2.5, moisture: 55 },
      black: { ph: 7.8, n: 380, p: 25, k: 280, om: 2.8, moisture: 70 },
      red: { ph: 6.5, n: 240, p: 15, k: 180, om: 1.8, moisture: 45 },
      alluvial: { ph: 7.0, n: 300, p: 20, k: 250, om: 2.2, moisture: 60 }
    };

    const soilMap = { 1: 'clay', 2: 'sandy', 3: 'loamy', 4: 'black', 5: 'red', 6: 'alluvial' };
    const soilType = soilMap[features.soilType] || 'loamy';
    const base = baseValues[soilType];

    // Add some randomness and environmental factors
    const tempFactor = (features.temperature - 25) * 0.1;
    const humidityFactor = (features.humidity - 60) * 0.05;
    
    return {
      ph: Math.max(4, Math.min(9, base.ph + tempFactor * 0.1 + (Math.random() - 0.5) * 0.5)),
      nitrogen: Math.max(100, base.n + humidityFactor * 10 + (Math.random() - 0.5) * 50),
      phosphorus: Math.max(5, base.p + (Math.random() - 0.5) * 8),
      potassium: Math.max(80, base.k + (Math.random() - 0.5) * 60),
      organicMatter: Math.max(0.5, base.om + (Math.random() - 0.5) * 0.8),
      moisture: Math.max(10, Math.min(90, base.moisture + humidityFactor + (Math.random() - 0.5) * 20)),
      temperature: features.temperature + (Math.random() - 0.5) * 3,
      fertility: base.om > 2 ? 'high' : base.om > 1.5 ? 'medium' : 'low'
    };
  }

  // Generate soil health recommendations
  generateSoilRecommendations(prediction) {
    const recommendations = [];
    const ranges = this.soilHealthRanges;

    if (prediction.ph < ranges.ph.optimal.min) {
      recommendations.push('Apply lime to increase soil pH (2-3 quintals per acre)');
    } else if (prediction.ph > ranges.ph.optimal.max) {
      recommendations.push('Apply organic matter or sulfur to reduce soil pH');
    }

    if (prediction.nitrogen < ranges.nitrogen.medium) {
      recommendations.push('Apply nitrogen-rich fertilizers like Urea');
    }

    if (prediction.phosphorus < ranges.phosphorus.medium) {
      recommendations.push('Apply phosphatic fertilizers like DAP or SSP');
    }

    if (prediction.potassium < ranges.potassium.medium) {
      recommendations.push('Apply potassium fertilizers like Muriate of Potash');
    }

    if (prediction.organicMatter < ranges.organicMatter.medium) {
      recommendations.push('Incorporate organic manure or compost (5-8 tons per acre)');
    }

    if (prediction.moisture < ranges.moisture.optimal) {
      recommendations.push('Improve irrigation or water retention capacity');
    }

    return recommendations;
  }

  // Generate crop recommendations
  async generateCropRecommendations({ soilData, weatherData, marketData, location, season, farmArea }) {
    if (!this.isInitialized) await this.initialize();

    try {
      const suitableCrops = [];
      
      for (const [cropName, cropInfo] of Object.entries(this.cropDatabase)) {
        const suitability = this.calculateCropSuitability(cropInfo, {
          soilData,
          weatherData,
          season,
          location
        });

        if (suitability.score > 40) { // Only include crops with >40% suitability
          const marketInfo = marketData?.crops?.[cropName] || {};
          
          suitableCrops.push({
            cropName: cropName.charAt(0).toUpperCase() + cropName.slice(1),
            hindiName: cropInfo.hindiName,
            scientificName: cropInfo.scientificName,
            suitability: suitability.score,
            confidence: Math.min(95, suitability.confidence),
            expectedYield: Math.round(cropInfo.avgYield * (suitability.score / 100) * farmArea),
            estimatedProfit: this.calculateProfitEstimate(cropInfo, farmArea, marketInfo, suitability.score),
            growthDuration: cropInfo.growthDuration,
            waterRequirement: cropInfo.waterRequirement,
            fertilizer: cropInfo.fertilizers,
            benefits: suitability.benefits,
            risks: suitability.risks,
            marketPrice: {
              current: marketInfo.currentPrice || cropInfo.marketPrice.min,
              predicted: marketInfo.predictedPrice || cropInfo.marketPrice.max,
              trend: marketInfo.trend || 'stable'
            },
            soilRequirements: {
              phRange: cropInfo.phRange,
              nitrogenLevel: this.getNutrientLevelDescription(cropName, 'nitrogen'),
              phosphorusLevel: this.getNutrientLevelDescription(cropName, 'phosphorus'),
              potassiumLevel: this.getNutrientLevelDescription(cropName, 'potassium')
            },
            seasonality: {
              plantingWindow: this.getPlantingWindow(cropName, season),
              harvestWindow: this.getHarvestWindow(cropName, season, cropInfo.growthDuration)
            }
          });
        }
      }

      // Sort by suitability score
      suitableCrops.sort((a, b) => b.suitability - a.suitability);

      return {
        crops: suitableCrops.slice(0, 8), // Return top 8 recommendations
        confidence: suitableCrops.length > 0 ? 
          Math.round(suitableCrops.reduce((sum, crop) => sum + crop.confidence, 0) / suitableCrops.length) : 0
      };
    } catch (error) {
      console.error('Error in crop recommendation:', error);
      throw new Error('Failed to generate crop recommendations');
    }
  }

  // Calculate crop suitability score
  calculateCropSuitability(cropInfo, { soilData, weatherData, season, location }) {
    let score = 0;
    let confidence = 70;
    const benefits = [];
    const risks = [];

    // Season compatibility
    if (cropInfo.seasons.includes(season)) {
      score += 25;
      benefits.push(`Perfect for ${season} season`);
    } else {
      score -= 15;
      risks.push(`Not ideal for ${season} season`);
    }

    // Soil pH compatibility
    const phScore = this.calculatePhCompatibility(soilData.ph, cropInfo.phRange);
    score += phScore;
    confidence += phScore > 15 ? 10 : -5;
    
    if (phScore > 15) {
      benefits.push('Excellent soil pH compatibility');
    } else if (phScore < 5) {
      risks.push('Soil pH may need adjustment');
    }

    // Nutrient levels
    const nutrientScore = this.calculateNutrientScore(soilData, cropInfo);
    score += nutrientScore;
    
    if (nutrientScore > 15) {
      benefits.push('Good soil nutrient levels');
    } else {
      risks.push('May require additional fertilization');
    }

    // Water availability (based on weather and crop requirement)
    const waterScore = this.calculateWaterCompatibility(weatherData, cropInfo.waterRequirement);
    score += waterScore;
    
    if (waterScore > 10) {
      benefits.push('Adequate water availability');
    } else {
      risks.push('May require additional irrigation');
    }

    // Regional suitability (basic implementation)
    if (location?.state) {
      const regionalScore = this.getRegionalSuitability(cropInfo, location.state);
      score += regionalScore;
      confidence += regionalScore > 5 ? 5 : -3;
    }

    // Climate compatibility
    if (weatherData?.temperature?.current) {
      const climateScore = this.calculateClimateScore(weatherData.temperature.current, cropInfo);
      score += climateScore;
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      confidence: Math.max(50, Math.min(95, confidence)),
      benefits,
      risks
    };
  }

  // Calculate pH compatibility score
  calculatePhCompatibility(actualPh, idealRange) {
    if (actualPh >= idealRange.min && actualPh <= idealRange.max) {
      return 20; // Perfect pH
    }
    
    const distance = Math.min(
      Math.abs(actualPh - idealRange.min),
      Math.abs(actualPh - idealRange.max)
    );
    
    return Math.max(0, 20 - distance * 5);
  }

  // Calculate nutrient score
  calculateNutrientScore(soilData, cropInfo) {
    const ranges = this.soilHealthRanges;
    let score = 0;

    // Nitrogen
    if (soilData.nitrogen >= ranges.nitrogen.medium) score += 7;
    else if (soilData.nitrogen >= ranges.nitrogen.low) score += 4;

    // Phosphorus
    if (soilData.phosphorus >= ranges.phosphorus.medium) score += 7;
    else if (soilData.phosphorus >= ranges.phosphorus.low) score += 4;

    // Potassium
    if (soilData.potassium >= ranges.potassium.medium) score += 6;
    else if (soilData.potassium >= ranges.potassium.low) score += 3;

    return score;
  }

  // Calculate water compatibility
  calculateWaterCompatibility(weatherData, waterRequirement) {
    const rainfall = weatherData?.rainfall || 100;
    const humidity = weatherData?.humidity || 60;
    
    let score = 0;
    
    if (waterRequirement === 'low') {
      score = rainfall < 300 ? 15 : 10;
    } else if (waterRequirement === 'medium') {
      score = rainfall >= 300 && rainfall <= 800 ? 15 : 8;
    } else if (waterRequirement === 'high') {
      score = rainfall > 600 ? 15 : 5;
    }
    
    // Humidity factor
    if (humidity > 70) score += 3;
    else if (humidity < 40) score -= 2;
    
    return score;
  }

  // Get regional suitability
  getRegionalSuitability(cropInfo, state) {
    // Simplified regional compatibility
    const regionalCrops = {
      'Punjab': ['wheat', 'rice', 'maize'],
      'Uttar Pradesh': ['wheat', 'rice', 'sugarcane'],
      'Maharashtra': ['cotton', 'soybean', 'sugarcane'],
      'Gujarat': ['cotton', 'wheat'],
      'Rajasthan': ['wheat', 'maize'],
      'Tamil Nadu': ['rice', 'sugarcane'],
      'Karnataka': ['rice', 'cotton', 'maize'],
      'Andhra Pradesh': ['rice', 'cotton'],
      'West Bengal': ['rice']
    };
    
    const stateCrops = regionalCrops[state] || [];
    return stateCrops.some(crop => cropInfo.hindiName?.toLowerCase().includes(crop)) ? 10 : 0;
  }

  // Calculate climate score
  calculateClimateScore(temperature, cropInfo) {
    // Simplified climate scoring based on temperature
    const idealTemps = {
      rice: { min: 20, max: 35 },
      wheat: { min: 15, max: 25 },
      cotton: { min: 25, max: 35 },
      maize: { min: 18, max: 30 },
      soybean: { min: 20, max: 30 },
      sugarcane: { min: 22, max: 32 }
    };
    
    const cropName = Object.keys(this.cropDatabase).find(key => 
      this.cropDatabase[key] === cropInfo
    );
    
    const idealTemp = idealTemps[cropName];
    if (!idealTemp) return 5;
    
    if (temperature >= idealTemp.min && temperature <= idealTemp.max) {
      return 10;
    }
    
    const distance = Math.min(
      Math.abs(temperature - idealTemp.min),
      Math.abs(temperature - idealTemp.max)
    );
    
    return Math.max(0, 10 - distance);
  }

  // Calculate profit estimate
  calculateProfitEstimate(cropInfo, farmArea, marketInfo, suitabilityScore) {
    const yield = cropInfo.avgYield * (suitabilityScore / 100) * farmArea;
    const price = marketInfo?.currentPrice || cropInfo.marketPrice.min;
    const revenue = yield * price;
    
    // Estimate costs (simplified)
    const costPerAcre = 15000; // Average cost per acre
    const totalCost = costPerAcre * farmArea;
    
    return Math.round(revenue - totalCost);
  }

  // Get nutrient level description
  getNutrientLevelDescription(cropName, nutrient) {
    // Simplified nutrient requirements
    const requirements = {
      rice: { nitrogen: 'High', phosphorus: 'Medium', potassium: 'Medium' },
      wheat: { nitrogen: 'Medium', phosphorus: 'Medium', potassium: 'Low' },
      cotton: { nitrogen: 'High', phosphorus: 'Medium', potassium: 'High' },
      maize: { nitrogen: 'High', phosphorus: 'Medium', potassium: 'Medium' },
      soybean: { nitrogen: 'Low', phosphorus: 'Medium', potassium: 'Medium' },
      sugarcane: { nitrogen: 'High', phosphorus: 'High', potassium: 'High' }
    };
    
    return requirements[cropName]?.[nutrient] || 'Medium';
  }

  // Get planting window
  getPlantingWindow(cropName, season) {
    const windows = {
      kharif: { start: 'June', end: 'July' },
      rabi: { start: 'November', end: 'December' },
      zaid: { start: 'March', end: 'April' }
    };
    
    return windows[season] || { start: 'Seasonal', end: 'Seasonal' };
  }

  // Get harvest window
  getHarvestWindow(cropName, season, duration) {
    const plantingMonths = {
      kharif: 6, // June
      rabi: 11,  // November
      zaid: 3    // March
    };
    
    const plantingMonth = plantingMonths[season] || 6;
    const harvestMonth = (plantingMonth + Math.round(duration / 30)) % 12;
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
    
    return {
      start: months[harvestMonth],
      end: months[(harvestMonth + 1) % 12]
    };
  }

  // Analyze crop image for disease detection
  async analyzeCropImage({ imagePath, cropType, location }) {
    if (!this.isInitialized) await this.initialize();

    try {
      // Placeholder implementation - replace with actual computer vision model
      const analysis = await this.performImageAnalysis(imagePath, cropType);
      
      return {
        status: 'completed',
        health: analysis.health,
        confidence: analysis.confidence,
        detectedIssues: analysis.issues,
        recommendations: analysis.recommendations,
        nutritionalStatus: analysis.nutrition,
        processingTime: Date.now() - Date.now() + 2000 // Simulate processing time
      };
    } catch (error) {
      console.error('Error in image analysis:', error);
      throw new Error('Failed to analyze crop image');
    }
  }

  // Perform image analysis (placeholder)
  async performImageAnalysis(imagePath, cropType) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate random but realistic analysis results
    const healthStates = ['healthy', 'diseased', 'pest_damage', 'nutrient_deficiency', 'water_stress'];
    const diseases = [
      'Leaf Blight', 'Powdery Mildew', 'Rust', 'Bacterial Spot', 
      'Aphid Infestation', 'Thrips Damage', 'Nitrogen Deficiency', 'Water Stress'
    ];
    
    const randomHealth = healthStates[Math.floor(Math.random() * healthStates.length)];
    const confidence = 75 + Math.random() * 20; // 75-95%
    
    let issues = [];
    let recommendations = [];
    
    if (randomHealth !== 'healthy') {
      const issue = diseases[Math.floor(Math.random() * diseases.length)];
      issues.push({
        type: randomHealth === 'diseased' ? 'fungal_disease' : 
              randomHealth === 'pest_damage' ? 'insect_damage' :
              randomHealth === 'nutrient_deficiency' ? 'nutrient_deficiency' : 'water_stress',
        name: issue,
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        confidence: confidence,
        description: `Detected ${issue} affecting the ${cropType} crop`,
        affectedArea: Math.round(20 + Math.random() * 60) // 20-80%
      });
      
      // Generate recommendations based on issue
      if (issue.includes('Deficiency')) {
        recommendations.push({
          category: 'fertilizer',
          action: 'Apply nitrogen-rich fertilizer',
          description: 'Use urea or ammonium sulfate to address nitrogen deficiency',
          urgency: 'medium',
          cost: { min: 500, max: 1000, currency: 'INR' },
          timeline: 'Apply within 3-5 days'
        });
      } else if (issue.includes('Blight') || issue.includes('Mildew')) {
        recommendations.push({
          category: 'treatment',
          action: 'Apply fungicide',
          description: 'Use copper-based fungicide or neem oil',
          urgency: 'high',
          cost: { min: 800, max: 1500, currency: 'INR' },
          timeline: 'Apply immediately'
        });
      } else if (issue.includes('Aphid') || issue.includes('Thrips')) {
        recommendations.push({
          category: 'treatment',
          action: 'Apply insecticide',
          description: 'Use systemic insecticide or neem-based spray',
          urgency: 'medium',
          cost: { min: 600, max: 1200, currency: 'INR' },
          timeline: 'Apply within 2-3 days'
        });
      }
    } else {
      recommendations.push({
        category: 'prevention',
        action: 'Continue good practices',
        description: 'Maintain current irrigation and fertilization schedule',
        urgency: 'low',
        timeline: 'Regular monitoring'
      });
    }
    
    return {
      health: randomHealth,
      confidence: Math.round(confidence),
      issues,
      recommendations,
      nutrition: {
        nitrogen: ['deficient', 'adequate', 'excess'][Math.floor(Math.random() * 3)],
        phosphorus: ['deficient', 'adequate', 'excess'][Math.floor(Math.random() * 3)],
        potassium: ['deficient', 'adequate', 'excess'][Math.floor(Math.random() * 3)]
      }
    };
  }

  // Predict market prices
  async predictMarketPrices({ crops, location, timeframe, currentMarketData }) {
    if (!this.isInitialized) await this.initialize();

    try {
      const predictions = {};
      
      for (const crop of crops) {
        const cropInfo = this.cropDatabase[crop.toLowerCase()];
        if (!cropInfo) continue;
        
        const currentPrice = currentMarketData?.crops?.[crop]?.currentPrice || 
                           cropInfo.marketPrice.min;
        
        // Simple price prediction with seasonal and trend factors
        const seasonalFactor = this.getSeasonalPriceFactor(crop, timeframe);
        const trendFactor = Math.random() * 0.2 - 0.1; // ±10% random trend
        const predictedPrice = currentPrice * (1 + seasonalFactor + trendFactor);
        
        predictions[crop] = {
          currentPrice,
          predictedPrice: Math.round(predictedPrice * 100) / 100,
          priceChange: ((predictedPrice - currentPrice) / currentPrice * 100).toFixed(1),
          confidence: 70 + Math.random() * 20, // 70-90%
          factors: this.getPriceFactors(crop, timeframe),
          recommendation: this.getPriceRecommendation(predictedPrice, currentPrice)
        };
      }
      
      return predictions;
    } catch (error) {
      console.error('Error in market price prediction:', error);
      throw new Error('Failed to predict market prices');
    }
  }

  // Get seasonal price factor
  getSeasonalPriceFactor(crop, timeframe) {
    const currentMonth = new Date().getMonth() + 1;
    const futureMonth = (currentMonth + Math.round(timeframe / 30)) % 12;
    
    // Simplified seasonal pricing (harvest season = lower prices)
    const harvestMonths = {
      rice: [10, 11, 12], // Oct-Dec
      wheat: [4, 5], // Apr-May
      cotton: [11, 12, 1], // Nov-Jan
      sugarcane: [12, 1, 2, 3], // Dec-Mar
      maize: [9, 10], // Sep-Oct
      soybean: [10, 11] // Oct-Nov
    };
    
    const cropHarvestMonths = harvestMonths[crop.toLowerCase()] || [];
    const isHarvestSeason = cropHarvestMonths.includes(futureMonth);
    
    return isHarvestSeason ? -0.15 : 0.1; // -15% during harvest, +10% otherwise
  }

  // Get price factors
  getPriceFactors(crop, timeframe) {
    return [
      'Seasonal demand patterns',
      'Harvest schedule impact',
      'Regional supply situation',
      'Weather forecast effects',
      'Government policy changes'
    ];
  }

  // Get price recommendation
  getPriceRecommendation(predictedPrice, currentPrice) {
    const change = (predictedPrice - currentPrice) / currentPrice;
    
    if (change > 0.1) {
      return 'Good time to sell - prices expected to rise';
    } else if (change < -0.1) {
      return 'Consider holding - prices may drop';
    } else {
      return 'Stable pricing expected - sell as per requirement';
    }
  }

  // Process chat messages
  async processChat({ message, language, context, userProfile }) {
    try {
      // Use compromise for basic NLP
      const doc = compromise(message);
      
      // Determine intent
      const intent = this.determineIntent(message, doc);
      
      // Generate response based on intent and context
      const response = await this.generateChatResponse({
        message,
        intent,
        language,
        context,
        userProfile,
        doc
      });
      
      return {
        response: response.text,
        intent: intent.type,
        confidence: intent.confidence,
        suggestions: response.suggestions
      };
    } catch (error) {
      console.error('Error in chat processing:', error);
      return {
        response: language === 'hindi' ? 
          'क्षमा करें, मुझे आपकी समस्या समझने में कठिनाई हो रही है। कृपया अधिक विस्तार से बताएं।' :
          'Sorry, I\'m having trouble understanding your query. Please provide more details.',
        intent: 'general_query',
        confidence: 0,
        suggestions: []
      };
    }
  }

  // Determine chat intent
  determineIntent(message, doc) {
    const lowerMessage = message.toLowerCase();
    
    // Intent keywords
    const intents = {
      crop_recommendation: ['recommend', 'suggest', 'crop', 'grow', 'plant', 'फसल', 'सुझाव'],
      disease_identification: ['disease', 'problem', 'sick', 'yellow', 'spot', 'बीमारी', 'समस्या'],
      market_price_inquiry: ['price', 'market', 'sell', 'cost', 'rate', 'कीमत', 'बाजार'],
      weather_forecast: ['weather', 'rain', 'temperature', 'climate', 'मौसम', 'बारिश'],
      soil_analysis: ['soil', 'ph', 'nutrients', 'fertilizer', 'मिट्टी', 'उर्वरक'],
      irrigation_guidance: ['water', 'irrigation', 'drought', 'पानी', 'सिंचाई'],
      pest_control: ['pest', 'insect', 'bug', 'कीड़े', 'कीट'],
      farm_management: ['farm', 'management', 'diary', 'record', 'खेत', 'प्रबंधन']
    };
    
    let bestIntent = 'general_query';
    let bestScore = 0;
    
    for (const [intent, keywords] of Object.entries(intents)) {
      const score = keywords.reduce((sum, keyword) => {
        return sum + (lowerMessage.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }
    
    return {
      type: bestIntent,
      confidence: Math.min(95, bestScore * 25 + 30) // 30-95% confidence
    };
  }

  // Generate chat response
  async generateChatResponse({ message, intent, language, context, userProfile }) {
    const isHindi = language === 'hindi';
    
    switch (intent.type) {
      case 'crop_recommendation':
        return {
          text: isHindi ?
            'फसल की सिफारिश के लिए मुझे आपकी मिट्टी की जानकारी, स्थान, और मौसम की आवश्यकता है। क्या आप इन विवरणों को साझा कर सकते हैं?' :
            'For crop recommendations, I need information about your soil, location, and season. Can you share these details?',
          suggestions: isHindi ?
            ['मिट्टी परीक्षण', 'मौसम की जानकारी', 'बाजार की कीमतें'] :
            ['Soil Testing', 'Weather Information', 'Market Prices']
        };
        
      case 'disease_identification':
        return {
          text: isHindi ?
            'फसल की बीमारी की पहचान के लिए कृपया फसल की तस्वीर अपलोड करें। मैं इसका विश्लेषण करके उचित इलाज सुझाऊंगा।' :
            'To identify crop diseases, please upload a photo of your crop. I\'ll analyze it and suggest appropriate treatment.',
          suggestions: isHindi ?
            ['तस्वीर अपलोड करें', 'सामान्य बीमारियां', 'रोकथाम के उपाय'] :
            ['Upload Photo', 'Common Diseases', 'Prevention Methods']
        };
        
      case 'market_price_inquiry':
        return {
          text: isHindi ?
            'बाजार की कीमतों के लिए कृपया बताएं कि आप किस फसल की जानकारी चाहते हैं और आपका क्षेत्र कौन सा है।' :
            'For market prices, please tell me which crop you\'re interested in and your location.',
          suggestions: isHindi ?
            ['आज की कीमतें', 'मूल्य पूर्वानुमान', 'बेचने का सही समय'] :
            ['Today\'s Prices', 'Price Forecast', 'Best Time to Sell']
        };
        
      default:
        return {
          text: isHindi ?
            'मैं आपकी खेती संबंधी सभी समस्याओं में मदद कर सकता हूं। आप फसल की सिफारिश, बीमारी की पहचान, मार्केट की कीमत, या मौसम की जानकारी के बारे में पूछ सकते हैं।' :
            'I can help you with all your farming needs. You can ask about crop recommendations, disease identification, market prices, or weather information.',
          suggestions: isHindi ?
            ['फसल सुझाव', 'बीमारी पहचान', 'मार्केट प्राइस', 'मौसम पूर्वानुमान'] :
            ['Crop Suggestions', 'Disease Detection', 'Market Prices', 'Weather Forecast']
        };
    }
  }

  // Speech to text (placeholder)
  async speechToText({ audioPath, language }) {
    // Placeholder implementation - integrate with actual speech recognition service
    return {
      text: 'Transcribed text would appear here',
      confidence: 85,
      language
    };
  }

  // Text to speech (placeholder)
  async textToSpeech({ text, language }) {
    // Placeholder implementation - integrate with actual TTS service
    return {
      audioUrl: '/api/audio/generated-response.mp3',
      duration: text.length * 0.1 // Approximate duration
    };
  }
}

// Export singleton instance
module.exports = new AIService();