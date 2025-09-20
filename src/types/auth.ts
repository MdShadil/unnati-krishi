export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'farmer' | 'expert';
  location?: {
    state: string;
    district: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  language: string;
  avatar?: string;
  createdAt: Date;
  lastActive: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'farmer' | 'expert';
  state: string;
  district: string;
  language: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}