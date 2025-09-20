import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Thermometer, 
  Droplets, 
  Sun, 
  Calendar,
  MapPin,
  IndianRupee,
  Wheat,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { agricultureApi, farmApi } from '@/services/mockApi';
import { CropRecommendation, WeatherData, Farm } from '@/types/agriculture';

export const FarmerDashboard: React.FC = () => {
  const { auth } = useAuth();
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!auth.user) return;
      
      try {
        setLoading(true);
        const [recommendations, weather, farmData] = await Promise.all([
          agricultureApi.getCropRecommendations(auth.user.id),
          agricultureApi.getWeatherData(auth.user.location?.state || 'Punjab'),
          farmApi.getFarms(auth.user.id)
        ]);
        
        setCropRecommendations(recommendations);
        setWeatherData(weather);
        setFarms(farmData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [auth.user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalFarmArea = farms.reduce((sum, farm) => sum + farm.area, 0);
  const totalInvestment = farms.reduce((sum, farm) => sum + farm.totalInvestment, 0);
  const expectedRevenue = farms.reduce((sum, farm) => sum + farm.expectedRevenue, 0);
  const profitMargin = expectedRevenue - totalInvestment;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-xl p-6 text-white shadow-strong">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              नमस्कार, {auth.user?.name}! 🌾
            </h1>
            <p className="text-white/90 text-lg">
              आज आपके खेत के लिए बेहतरीन सुझाव तैयार हैं
            </p>
            <div className="flex items-center mt-4 space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{auth.user?.location?.district}, {auth.user?.location?.state}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('hi-IN')}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Wheat className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-medium hover:shadow-strong transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">कुल खेत क्षेत्र</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalFarmArea} एकड़</div>
            <p className="text-xs text-muted-foreground">
              {farms.length} खेत पंजीकृत
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium hover:shadow-strong transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">कुल निवेश</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">₹{totalInvestment.toLocaleString('hi-IN')}</div>
            <p className="text-xs text-muted-foreground">
              इस सीज़न में
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium hover:shadow-strong transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">अपेक्षित आय</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₹{expectedRevenue.toLocaleString('hi-IN')}</div>
            <p className="text-xs text-muted-foreground">
              फसल बेचने पर
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium hover:shadow-strong transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">लाभ मार्जिन</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitMargin > 0 ? 'text-success' : 'text-destructive'}`}>
              ₹{profitMargin.toLocaleString('hi-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              {profitMargin > 0 ? 'लाभ की स्थिति' : 'नुकसान की स्थिति'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Crop Recommendations */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wheat className="w-5 h-5 text-primary" />
                <span>फसल सुझाव</span>
                <Badge variant="default" className="ml-auto bg-success text-success-foreground">
                  {cropRecommendations?.confidence}% सटीक
                </Badge>
              </CardTitle>
              <CardDescription>
                आपकी मिट्टी और मौसम के अनुसार सबसे अच्छी फसलें
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cropRecommendations ? (
                <div className="space-y-4">
                  {cropRecommendations.recommendedCrops.slice(0, 2).map((crop, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{crop.name} ({crop.hindiName})</h3>
                          <Badge variant="outline">{crop.season}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{crop.scientificName}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="text-success">उत्पादन: {crop.expectedYield} क्विंटल/एकड़</span>
                          <span className="text-primary">लाभ: ₹{crop.estimatedProfit.toLocaleString('hi-IN')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{crop.suitability}%</div>
                        <div className="text-xs text-muted-foreground">उपयुक्तता</div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    सभी सुझाव देखें
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">फसल सुझाव लोड हो रहे हैं...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Farm Status */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>खेत की स्थिति</CardTitle>
              <CardDescription>आपके सभी खेतों का विवरण</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {farms.map((farm) => (
                  <div key={farm.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{farm.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {farm.area} एकड़ • {farm.soilType} मिट्टी
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-sm text-success">स्वस्थ</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      विवरण देखें
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sun className="w-5 h-5 text-accent" />
                <span>मौसम</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weatherData ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{weatherData.temperature.current}°C</div>
                    <p className="text-muted-foreground">{weatherData.location}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="w-4 h-4 text-warning" />
                      <span>{weatherData.temperature.min}°C - {weatherData.temperature.max}°C</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span>{weatherData.humidity}% नमी</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>बारिश की संभावना</span>
                      <span>{weatherData.rainfall}%</span>
                    </div>
                    <Progress value={weatherData.rainfall} className="h-2" />
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">आने वाले दिन</h4>
                    <div className="space-y-2">
                      {weatherData.forecast.slice(0, 2).map((day, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{day.date.toLocaleDateString('hi-IN', { weekday: 'short' })}</span>
                          <span>{day.temperature.min}° - {day.temperature.max}°</span>
                          <span className="text-muted-foreground">{day.conditions}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">मौसम डेटा लोड हो रहा है...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>त्वरित कार्य</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="farmer" className="w-full justify-start" size="sm">
                <Wheat className="w-4 h-4 mr-2" />
                नई फसल जोड़ें
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                समस्या रिपोर्ट करें
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                कैलेंडर देखें
              </Button>
            </CardContent>
          </Card>

          {/* Market Prices */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>आज के भाव</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">गेहूं</span>
                  <div className="text-right">
                    <div className="font-semibold text-success">₹2,100</div>
                    <div className="text-xs text-success">+9.5%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">धान</span>
                  <div className="text-right">
                    <div className="font-semibold text-destructive">₹1,850</div>
                    <div className="text-xs text-destructive">-2.3%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">सरसों</span>
                  <div className="text-right">
                    <div className="font-semibold text-success">₹5,200</div>
                    <div className="text-xs text-success">+12.1%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};