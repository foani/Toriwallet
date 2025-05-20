import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LoginRequest, LoginResponse } from '@/types';
import { login as apiLogin, getCurrentUser } from '@/services/auth';
import {
  storeTokens,
  clearTokens,
  isAuthenticated,
  storeUser,
  getUser
} from '@/utils/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getUser());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(isAuthenticated());
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        try {
          await refreshUser();
        } catch (error) {
          setError('세션이 만료되었습니다. 다시 로그인해주세요.');
          handleLogout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      storeUser(userData);
      setIsLoggedIn(true);
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('사용자 정보를 가져오는 중 오류가 발생했습니다.');
      }
      throw error;
    }
  };

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response: LoginResponse = await apiLogin(credentials);
      storeTokens(response.token, response.refreshToken);
      storeUser(response.user);
      setUser(response.user);
      setIsLoggedIn(true);
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('로그인 중 오류가 발생했습니다.');
      }
      return false;
    }
  };

  const handleLogout = () => {
    clearTokens();
    setUser(null);
    setIsLoggedIn(false);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    error,
    isLoggedIn,
    login,
    logout: handleLogout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
