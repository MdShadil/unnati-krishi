import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Star,
  Calendar,
  FileText,
  Camera
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

export const ExpertDashboard: React.FC = () => {
  const { auth } = useAuth();
  const [activeRequests] = useState(12);
  const [resolvedToday] = useState(8);
  const [avgRating] = useState(4.8);

  const recentQueries = [
    {
      id: 1,
      farmer: 'राम कुमार',
      location: 'Ludhiana, Punjab',
      issue: 'गेहूं की पत्तियों पर पीले धब्बे दिख रहे हैं',
      time: '10 मिनट पहले',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 2,
      farmer: 'सुरेश सिंह',
      location: 'Bhatinda, Punjab',
      issue: 'मिट्टी की जांच रिपोर्ट समझने में मदद चाहिए',
      time: '25 मिनट पहले',
      status: 'in-progress',
      priority: 'medium'
    },
    {
      id: 3,
      farmer: 'गीता देवी',
      location: 'Patiala, Punjab',
      issue: 'कपास में कीड़े का प्रकोप हो रहा है',
      time: '1 घंटे पहले',
      status: 'resolved',
      priority: 'high'
    }
  ];

  const farmerAnalytics = [
    { location: 'Punjab', farmers: 245, activeIssues: 12 },
    { location: 'Haryana', farmers: 189, activeIssues: 8 },
    { location: 'Uttar Pradesh', farmers: 312, activeIssues: 15 },
    { location: 'Madhya Pradesh', farmers: 156, activeIssues: 6 }
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-accent rounded-xl p-6 text-accent-foreground shadow-strong">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              नमस्कार, Dr. {auth.user?.name}! 👨‍🌾
            </h1>
            <p className="text-accent-foreground/90 text-lg">
              आज {activeRequests} किसानों को आपकी सहायता की आवश्यकता है
            </p>
            <div className="flex items-center mt-4 space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>{avgRating}/5.0 रेटिंग</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>आज {resolvedToday} समस्याएं हल की</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-medium hover:shadow-strong transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">सक्रिय अनुरोध</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{activeRequests}</div>
            <p className="text-xs text-muted-foreground">
              आपका तत्काल ध्यान चाहिए
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium hover:shadow-strong transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">आज हल किए गए</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{resolvedToday}</div>
            <p className="text-xs text-muted-foreground">
              कल से 25% अधिक
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium hover:shadow-strong transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">कुल किसान</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">902</div>
            <p className="text-xs text-muted-foreground">
              आपसे जुड़े हुए
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-medium hover:shadow-strong transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">रेटिंग</CardTitle>
            <Star className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{avgRating}/5.0</div>
            <p className="text-xs text-muted-foreground">
              246 समीक्षाओं के आधार पर
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Queries */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span>हाल की समस्याएं</span>
              </CardTitle>
              <CardDescription>
                किसानों की नवीनतम समस्याएं और सवाल
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentQueries.map((query) => (
                  <div key={query.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {query.farmer.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{query.farmer}</h3>
                        <Badge 
                          variant={query.priority === 'high' ? 'destructive' : query.priority === 'medium' ? 'secondary' : 'secondary'}
                          className="text-xs"
                        >
                          {query.priority === 'high' ? 'अत्यावश्यक' : query.priority === 'medium' ? 'महत्वपूर्ण' : 'सामान्य'}
                        </Badge>
                        <Badge 
                          variant={query.status === 'pending' ? 'destructive' : query.status === 'in-progress' ? 'secondary' : 'default'}
                          className="text-xs"
                        >
                          {query.status === 'pending' ? 'लंबित' : query.status === 'in-progress' ? 'प्रगति में' : 'हल हो गया'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{query.location}</span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>{query.time}</span>
                      </div>
                      <p className="text-sm mt-2">{query.issue}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        जवाब दें
                      </Button>
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-1" />
                        विश्लेषण
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  सभी अनुरोध देखें
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <span>क्षेत्रीय विश्लेषण</span>
              </CardTitle>
              <CardDescription>राज्यवार किसान गतिविधि</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {farmerAnalytics.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">{region.location}</h3>
                      <p className="text-sm text-muted-foreground">{region.farmers} किसान पंजीकृत</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{region.activeIssues}</div>
                      <div className="text-xs text-muted-foreground">सक्रिय समस्याएं</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-accent" />
                <span>आज का कार्यक्रम</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-2 bg-muted/50 rounded">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">वीडियो कॉल</p>
                  <p className="text-xs text-muted-foreground">10:00 AM - राम कुमार</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-muted/50 rounded">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">फील्ड विज़िट</p>
                  <p className="text-xs text-muted-foreground">2:00 PM - सुरेश सिंह</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-muted/50 rounded">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">रिपोर्ट समीक्षा</p>
                  <p className="text-xs text-muted-foreground">4:00 PM - मिट्टी विश्लेषण</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>त्वरित कार्य</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="expert" className="w-full justify-start" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                नई सलाह दें
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                रिपोर्ट बनाएं
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Users className="w-4 h-4 mr-2" />
                किसान जोड़ें
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics देखें
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>हाल की गतिविधि</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>गीता देवी की समस्या हल की</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span>3 नए सवाल मिले</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-accent" />
                  <span>साप्ताहिक रिपोर्ट तैयार</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-accent" />
                  <span>नई 5-स्टार समीक्षा</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};