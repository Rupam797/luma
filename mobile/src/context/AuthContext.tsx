import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  bio?: string;
  gender?: string;
  photos?: string[];
  interests?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app launch
  useEffect(() => {
    const restore = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('luma_token');
        const savedUser = await AsyncStorage.getItem('luma_user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          apiService.setAuthToken(savedToken);
        }
      } catch (e) {
        console.log('Session restore failed:', e);
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const data = await apiService.login(email);
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        await AsyncStorage.setItem('luma_token', data.token);
        await AsyncStorage.setItem('luma_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: 'Login failed — no token received.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      AsyncStorage.setItem('luma_user', JSON.stringify(updated));
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove(['luma_token', 'luma_user']);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
