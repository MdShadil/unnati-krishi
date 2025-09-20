import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/layout/Navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { FarmerDashboard } from "@/pages/FarmerDashboard";
import { ExpertDashboard } from "@/pages/ExpertDashboard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = useAuth();
  
  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-earth">
        {children}
      </main>
    </>
  );
};

// Public Route component (redirects if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = useAuth();
  
  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (auth.isAuthenticated) {
    const redirectPath = auth.user?.role === 'farmer' ? '/dashboard' : '/expert-dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { auth } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <Index />
          </PublicRoute>
        } 
      />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <SignupForm />
          </PublicRoute>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <FarmerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/expert-dashboard" 
        element={
          <ProtectedRoute>
            <ExpertDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Placeholder routes for other features */}
      <Route 
        path="/calculator" 
        element={
          <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold">Farm Calculator - Coming Soon</h1>
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/crop-analysis" 
        element={
          <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold">Crop Analysis - Coming Soon</h1>
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold">AI Chat - Coming Soon</h1>
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/farm-diary" 
        element={
          <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold">Farm Diary - Coming Soon</h1>
            </div>
          </ProtectedRoute>
        } 
      />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
