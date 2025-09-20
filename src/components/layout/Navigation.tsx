import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  Home, 
  Calculator, 
  MessageSquare, 
  Camera, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  Bell,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';

interface NavigationProps {
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ className = '' }) => {
  const { auth, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const farmerNavItems = [
    { icon: Home, label: 'डैशबोर्ड', path: '/dashboard', key: 'dashboard' },
    { icon: Calculator, label: 'कैलकुलेटर', path: '/calculator', key: 'calculator' },
    { icon: Camera, label: 'फसल विश्लेषण', path: '/crop-analysis', key: 'analysis' },
    { icon: MessageSquare, label: 'AI सहायक', path: '/chat', key: 'chat' },
    { icon: BarChart3, label: 'खेत डायरी', path: '/farm-diary', key: 'diary' },
  ];

  const expertNavItems = [
    { icon: Home, label: 'डैशबोर्ड', path: '/expert-dashboard', key: 'dashboard' },
    { icon: User, label: 'किसान', path: '/farmers', key: 'farmers' },
    { icon: MessageSquare, label: 'सलाह', path: '/expert-chat', key: 'chat' },
    { icon: BarChart3, label: 'रिपोर्ट्स', path: '/reports', key: 'reports' },
  ];

  const navItems = auth.user?.role === 'farmer' ? farmerNavItems : expertNavItems;

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`${mobile ? 'flex flex-col space-y-2' : 'hidden md:flex items-center space-x-1'}`}>
      {navItems.map((item) => (
        <Link
          key={item.key}
          to={item.path}
          className={`
            ${mobile ? 'w-full' : ''}
            flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${isActive(item.path) 
              ? 'bg-primary text-primary-foreground shadow-soft' 
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }
          `}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <nav className={`border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={auth.user?.role === 'farmer' ? '/dashboard' : '/expert-dashboard'} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              कृषि सहायक
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavItems />

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={auth.user?.avatar} />
                    <AvatarFallback className="bg-gradient-primary text-white text-sm">
                      {auth.user?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">{auth.user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-strong">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{auth.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{auth.user?.email}</p>
                    <Badge variant="secondary" className="w-fit text-xs">
                      {auth.user?.role === 'farmer' ? 'किसान' : 'विशेषज्ञ'}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    प्रोफाइल
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    सेटिंग्स
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  लॉग आउट
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="py-4">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">{auth.user?.name}</h3>
                    <p className="text-sm text-muted-foreground">{auth.user?.email}</p>
                  </div>
                  <NavItems mobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};