const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    
    // Fallback data for when API is not available
    this.fallbackData = {
      temperature: { current: 28, min: 22, max: 35 },
      humidity: 65,
      rainfall: 120,
      conditions: 'Partly Cloudy'
    };
  }

  // Get current weather for coordinates
  async getCurrentWeather(lat, lng) {
    try {
      if (!this.apiKey) {
        console.warn('Weather API key not found, using fallback data');
        return this.generateFallbackWeather(lat, lng);
      }

      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon: lng,
          appid: this.apiKey,
          units: 'metric'
        },
        timeout: 5000
      });

      const data = response.data;
      
      return {
        location: `${data.name}, ${data.sys.country}`,
        temperature: {
          current: Math.round(data.main.temp),
          min: Math.round(data.main.temp_min),
          max: Math.round(data.main.temp_max)
        },
        humidity: data.main.humidity,
        rainfall: data.rain?.['1h'] || 0,
        conditions: data.weather[0].description,
        windSpeed: data.wind?.speed || 0,
        pressure: data.main.pressure,
        visibility: data.visibility ? data.visibility / 1000 : 10, // Convert to km
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Weather API error:', error.message);
      return this.generateFallbackWeather(lat, lng);
    }
  }

  // Get weather forecast
  async getForecast(lat, lng, days = 5) {
    try {
      if (!this.apiKey) {
        console.warn('Weather API key not found, using fallback forecast');
        return this.generateFallbackForecast(lat, lng, days);
      }

      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon: lng,
          appid: this.apiKey,
          units: 'metric',
          cnt: days * 8 // 8 forecasts per day (3-hour intervals)
        },
        timeout: 5000
      });

      const data = response.data;
      const current = await this.getCurrentWeather(lat, lng);
      
      // Process forecast data
      const forecast = [];
      const dailyData = {};
      
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = {
            date: date,
            temps: [],
            humidity: [],
            rainfall: 0,
            conditions: []
          };
        }
        
        dailyData[dateKey].temps.push(item.main.temp);
        dailyData[dateKey].humidity.push(item.main.humidity);
        dailyData[dateKey].rainfall += item.rain?.['3h'] || 0;
        dailyData[dateKey].conditions.push(item.weather[0].description);
      });
      
      // Convert to forecast format
      Object.values(dailyData).forEach(day => {
        forecast.push({
          date: day.date,
          temperature: {
            min: Math.round(Math.min(...day.temps)),
            max: Math.round(Math.max(...day.temps))
          },
          rainfall: Math.round(day.rainfall * 10) / 10,
          humidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
          conditions: day.conditions[0] || 'Clear'
        });
      });
      
      return {
        current,
        forecast: forecast.slice(0, days),
        location: data.city.name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Weather forecast API error:', error.message);
      return this.generateFallbackForecast(lat, lng, days);
    }
  }

  // Get weather by city name
  async getWeatherByCity(cityName, countryCode = 'IN') {
    try {
      if (!this.apiKey) {
        return this.generateFallbackWeatherByCity(cityName);
      }

      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: `${cityName},${countryCode}`,
          appid: this.apiKey,
          units: 'metric'
        },
        timeout: 5000
      });

      const data = response.data;
      
      return {
        location: `${data.name}, ${data.sys.country}`,
        coordinates: {
          lat: data.coord.lat,
          lng: data.coord.lon
        },
        temperature: {
          current: Math.round(data.main.temp),
          min: Math.round(data.main.temp_min),
          max: Math.round(data.main.temp_max)
        },
        humidity: data.main.humidity,
        rainfall: data.rain?.['1h'] || 0,
        conditions: data.weather[0].description,
        windSpeed: data.wind?.speed || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('City weather API error:', error.message);
      return this.generateFallbackWeatherByCity(cityName);
    }
  }

  // Get agricultural weather alerts
  async getWeatherAlerts(lat, lng) {
    try {
      // This would typically use a specialized agricultural weather API
      // For now, we'll generate alerts based on current conditions
      const weather = await this.getCurrentWeather(lat, lng);
      const alerts = [];
      
      // Temperature alerts
      if (weather.temperature.current > 40) {
        alerts.push({
          type: 'heat_wave',
          severity: 'high',
          message: 'Heat wave warning - Increase irrigation frequency',
          recommendations: [
            'Provide shade to crops if possible',
            'Increase watering frequency',
            'Apply mulching to retain soil moisture'
          ]
        });
      } else if (weather.temperature.current < 5) {
        alerts.push({
          type: 'frost',
          severity: 'high',
          message: 'Frost warning - Protect sensitive crops',
          recommendations: [
            'Cover young plants',
            'Use frost protection methods',
            'Delay planting if possible'
          ]
        });
      }
      
      // Humidity alerts
      if (weather.humidity > 85) {
        alerts.push({
          type: 'high_humidity',
          severity: 'medium',
          message: 'High humidity - Monitor for fungal diseases',
          recommendations: [
            'Improve air circulation',
            'Apply preventive fungicide',
            'Reduce irrigation frequency'
          ]
        });
      }
      
      // Rainfall alerts
      if (weather.rainfall > 50) {
        alerts.push({
          type: 'heavy_rain',
          severity: 'medium',
          message: 'Heavy rainfall expected - Ensure proper drainage',
          recommendations: [
            'Check field drainage',
            'Postpone fertilizer application',
            'Monitor for waterlogging'
          ]
        });
      }
      
      return alerts;
    } catch (error) {
      console.error('Weather alerts error:', error.message);
      return [];
    }
  }

  // Generate fallback weather data
  generateFallbackWeather(lat, lng) {
    const seasonalAdjustments = this.getSeasonalAdjustments();
    
    return {
      location: `Location ${lat.toFixed(2)}, ${lng.toFixed(2)}`,
      temperature: {
        current: Math.round(this.fallbackData.temperature.current + seasonalAdjustments.temp + (Math.random() - 0.5) * 6),
        min: Math.round(this.fallbackData.temperature.min + seasonalAdjustments.temp + (Math.random() - 0.5) * 4),
        max: Math.round(this.fallbackData.temperature.max + seasonalAdjustments.temp + (Math.random() - 0.5) * 4)
      },
      humidity: Math.round(this.fallbackData.humidity + seasonalAdjustments.humidity + (Math.random() - 0.5) * 20),
      rainfall: Math.round((this.fallbackData.rainfall + seasonalAdjustments.rainfall) * (0.5 + Math.random())),
      conditions: this.getRandomCondition(),
      windSpeed: Math.round(Math.random() * 15 + 5), // 5-20 km/h
      pressure: Math.round(Math.random() * 50 + 1000), // 1000-1050 hPa
      visibility: Math.round(Math.random() * 5 + 8), // 8-13 km
      timestamp: new Date().toISOString(),
      source: 'fallback'
    };
  }

  // Generate fallback forecast
  generateFallbackForecast(lat, lng, days) {
    const current = this.generateFallbackWeather(lat, lng);
    const forecast = [];
    
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date,
        temperature: {
          min: Math.round(current.temperature.min + (Math.random() - 0.5) * 6),
          max: Math.round(current.temperature.max + (Math.random() - 0.5) * 6)
        },
        rainfall: Math.round(Math.random() * 20),
        humidity: Math.round(current.humidity + (Math.random() - 0.5) * 15),
        conditions: this.getRandomCondition()
      });
    }
    
    return {
      current,
      forecast,
      location: current.location,
      timestamp: new Date().toISOString(),
      source: 'fallback'
    };
  }

  // Generate fallback weather by city
  generateFallbackWeatherByCity(cityName) {
    const weather = this.generateFallbackWeather(20.0, 77.0); // Central India coordinates
    weather.location = `${cityName}, India`;
    return weather;
  }

  // Get seasonal adjustments
  getSeasonalAdjustments() {
    const month = new Date().getMonth() + 1;
    
    // Indian seasons
    if (month >= 3 && month <= 6) {
      // Summer
      return { temp: 5, humidity: -10, rainfall: -50 };
    } else if (month >= 7 && month <= 9) {
      // Monsoon
      return { temp: -3, humidity: 20, rainfall: 200 };
    } else if (month >= 10 && month <= 11) {
      // Post-monsoon
      return { temp: 0, humidity: 5, rainfall: -30 };
    } else {
      // Winter
      return { temp: -8, humidity: -5, rainfall: -70 };
    }
  }

  // Get random weather condition
  getRandomCondition() {
    const conditions = [
      'Clear sky', 'Partly cloudy', 'Cloudy', 'Light rain',
      'Moderate rain', 'Sunny', 'Overcast', 'Misty'
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  // Get irrigation recommendation based on weather
  getIrrigationRecommendation(weather, cropType, soilType) {
    const { temperature, humidity, rainfall } = weather;
    let recommendation = '';
    
    if (rainfall > 10) {
      recommendation = 'Reduce or skip irrigation due to recent rainfall';
    } else if (temperature.current > 35 && humidity < 40) {
      recommendation = 'Increase irrigation frequency due to high temperature and low humidity';
    } else if (soilType === 'sandy' && temperature.current > 30) {
      recommendation = 'Sandy soil requires frequent irrigation in current conditions';
    } else if (humidity > 80) {
      recommendation = 'Reduce irrigation to prevent waterlogging and disease';
    } else {
      recommendation = 'Normal irrigation schedule recommended';
    }
    
    return {
      recommendation,
      frequency: this.calculateIrrigationFrequency(weather, cropType, soilType),
      nextIrrigation: this.calculateNextIrrigation(weather)
    };
  }

  // Calculate irrigation frequency
  calculateIrrigationFrequency(weather, cropType, soilType) {
    let baseDays = 3; // Default 3 days
    
    // Adjust for crop type
    const cropAdjustments = {
      rice: -1, // More frequent
      wheat: 0,
      cotton: 1, // Less frequent
      sugarcane: -1,
      maize: 0
    };
    
    baseDays += cropAdjustments[cropType] || 0;
    
    // Adjust for weather
    if (weather.temperature.current > 35) baseDays -= 1;
    if (weather.humidity < 40) baseDays -= 1;
    if (weather.rainfall > 5) baseDays += 2;
    
    // Adjust for soil type
    if (soilType === 'sandy') baseDays -= 1;
    else if (soilType === 'clay') baseDays += 1;
    
    return Math.max(1, Math.min(7, baseDays)); // Between 1-7 days
  }

  // Calculate next irrigation date
  calculateNextIrrigation(weather) {
    const days = this.calculateIrrigationFrequency(weather, 'general', 'loamy');
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate.toISOString().split('T')[0]; // Return date only
  }
}

module.exports = new WeatherService();