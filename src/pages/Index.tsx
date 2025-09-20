import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  Brain, 
  Calculator, 
  Camera, 
  MessageSquare, 
  TrendingUp,
  Shield,
  Smartphone,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Recommendations',
      titleHi: 'AI आधारित सुझाव',
      description: 'Advanced machine learning algorithms analyze your soil, weather, and market data to provide the best crop recommendations.',
      descriptionHi: 'उन्नत AI तकनीक आपकी मिट्टी, मौसम और बाज़ार के डेटा का विश्लेषण करके सबसे बेहतर फसल सुझाती है।'
    },
    {
      icon: Calculator,
      title: 'Smart Farm Calculator',
      titleHi: 'स्मार्ट खेती कैलकुलेटर',
      description: 'Calculate fertilizer requirements, water needs, and profit margins with precision.',
      descriptionHi: 'उर्वरक की आवश्यकता, पानी की ज़रूरत और लाभ मार्जिन की सटीक गणना करें।'
    },
    {
      icon: Camera,
      title: 'Crop Disease Detection',
      titleHi: 'फसल रोग पहचान',
      description: 'Upload crop images to instantly detect diseases and get treatment recommendations.',
      descriptionHi: 'फसल की तस्वीरें अपलोड करके तुरंत रोगों की पहचान करें और इलाज की सलाह पाएं।'
    },
    {
      icon: MessageSquare,
      title: 'AI Agricultural Assistant',
      titleHi: 'AI कृषि सहायक',
      description: '24/7 voice-enabled chat support in your preferred Indian language.',
      descriptionHi: '24/7 आवाज़ सहित चैट सपोर्ट आपकी पसंदीदा भारतीय भाषा में।'
    },
    {
      icon: TrendingUp,
      title: 'Market Price Prediction',
      titleHi: 'बाज़ार भाव पूर्वानुमान',
      description: 'Get accurate crop price predictions to maximize your profits.',
      descriptionHi: 'अधिकतम लाभ के लिए सटीक फसल भाव का पूर्वानुमान पाएं।'
    },
    {
      icon: Smartphone,
      title: 'Offline Support',
      titleHi: 'ऑफलाइन सहायता',
      description: 'Access essential farming tools even without internet connectivity.',
      descriptionHi: 'इंटरनेट के बिना भी आवश्यक खेती के उपकरण का उपयोग करें।'
    }
  ];

  const testimonials = [
    {
      name: 'राम कुमार',
      location: 'Ludhiana, Punjab',
      text: 'इस ऐप से मेरी फसल की पैदावार 30% बढ़ गई है। AI सुझाव बहुत सटीक हैं।',
      rating: 5
    },
    {
      name: 'सुनीता देवी',
      location: 'Bhatinda, Punjab', 
      text: 'बहुत आसान है उपयोग करना। अब मैं सही समय पर सही फसल उगा सकती हूं।',
      rating: 5
    },
    {
      name: 'गुरदीप सिंह',
      location: 'Patiala, Punjab',
      text: 'मार्केट की जानकारी मिलने से अब बेहतर दाम मिलते हैं।',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                कृषि सहायक
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">लॉगिन</Button>
              </Link>
              <Link to="/signup">
                <Button variant="farmer">रजिस्टर करें</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              <Globe className="w-4 h-4 mr-2" />
              भारतीय किसानों के लिए AI-पावर्ड समाधान
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
              स्मार्ट खेती का
              <br />
              भविष्य यहाँ है
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              AI तकनीक के साथ अपनी फसल की पैदावार बढ़ाएं। मिट्टी की जांच से लेकर बाज़ार के भाव तक, 
              सभी जानकारी एक ही जगह।
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/signup">
                <Button variant="farmer" size="xl" className="shadow-strong hover:shadow-strong">
                  मुफ्त में शुरू करें
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="shadow-soft">
                डेमो देखें
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-muted-foreground">10,000+ खुश किसान</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-muted-foreground">95% सटीक भविष्यवाणी</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-muted-foreground">12 भारतीय भाषाएं</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              आपकी खेती के लिए <span className="text-primary">स्मार्ट समाधान</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              आधुनिक तकनीक का उपयोग करके अपनी कृषि को और भी बेहतर बनाएं
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="shadow-medium hover:shadow-strong transition-all duration-300 animate-grow hover:scale-105 border-0 bg-card/80 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 shadow-soft">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.titleHi}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {feature.descriptionHi}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              किसान भाइयों के <span className="text-primary">अनुभव</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              देखिए कैसे हमारे AI समाधान ने उनकी खेती को बदल दिया
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-medium hover:shadow-strong transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <CardDescription className="text-base text-foreground mb-4">
                    "{testimonial.text}"
                  </CardDescription>
                  <div>
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-hero text-white shadow-strong border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                आज ही शुरू करें अपनी स्मार्ट खेती
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                हजारों किसान भाइयों के साथ जुड़ें और AI की मदद से अपनी फसल की पैदावार बढ़ाएं
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button variant="secondary" size="xl" className="shadow-strong">
                    <Users className="w-5 h-5 mr-2" />
                    किसान के रूप में जुड़ें
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline" size="xl" className="border-white text-white hover:bg-white hover:text-primary">
                    <Shield className="w-5 h-5 mr-2" />
                    विशेषज्ञ के रूप में जुड़ें
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/60 backdrop-blur-sm py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                कृषि सहायक
              </span>
            </div>
            <div className="text-center text-muted-foreground">
              <p>&copy; 2024 कृषि सहायक. सभी अधिकार सुरक्षित.</p>
              <p className="text-sm mt-1">भारतीय किसानों के लिए बनाया गया</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
