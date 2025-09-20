import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, LoginCredentials, SignupData, AuthState } from '../types/auth';
import { authApi } from '../services/mockApi';

const AuthContext = createContext<{
  auth: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
} | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Check for stored auth on app load
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuth({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuth(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setAuth(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user, token } = await authApi.login(credentials);
      
      if (credentials.rememberMe) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('user', JSON.stringify(user));
      }
      
      setAuth({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    setAuth(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user, token } = await authApi.signup(data);
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuth({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Signup failed'
      }));
      throw error;
    }
  };

  const logout = async () => {
    setAuth(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authApi.logout();
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      
      setAuth({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      }));
    }
  };

  const clearError = () => {
    setAuth(prev => ({ ...prev, error: null }));
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { auth, login, signup, logout, clearError } },
    children
  );
};