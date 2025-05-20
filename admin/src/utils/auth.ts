import jwt_decode from 'jwt-decode';
import { apiPost } from '@/services/api';

// Storage keys
const ACCESS_TOKEN_KEY = 'tori_admin_access_token';
const REFRESH_TOKEN_KEY = 'tori_admin_refresh_token';
const USER_KEY = 'tori_admin_user';

// Token interface
interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

/**
 * Store tokens in localStorage
 */
export const storeTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Clear tokens from localStorage
 */
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const decodedToken = jwt_decode<TokenPayload>(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decodedToken.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Store user data in localStorage
 */
export const storeUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get user data from localStorage
 */
export const getUser = (): any | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Get user role from token
 */
export const getUserRole = (): string | null => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decodedToken = jwt_decode<TokenPayload>(token);
    return decodedToken.role;
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decodedToken = jwt_decode<TokenPayload>(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return false;
  }
  
  try {
    const response = await apiPost<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken }
    );
    
    storeTokens(response.accessToken, response.refreshToken);
    return true;
  } catch (error) {
    clearTokens();
    return false;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpirationTime = (): number | null => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decodedToken = jwt_decode<TokenPayload>(token);
    return decodedToken.exp;
  } catch (error) {
    return null;
  }
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (requiredPermission: string): boolean => {
  const user = getUser();
  if (!user || !user.permissions) return false;
  
  return user.permissions.includes(requiredPermission);
};

/**
 * Check if user has admin role
 */
export const isAdmin = (): boolean => {
  const role = getUserRole();
  return role === 'admin';
};
