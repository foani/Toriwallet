import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAccessToken, clearTokens, refreshAccessToken } from '@utils/auth';

// API endpoint configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.toriwallet.com';
const API_VERSION = 'v1';
const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

// Default headers
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// Initialize axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: DEFAULT_HEADERS,
  timeout: 30000, // 30 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle token expiration (401 Unauthorized)
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      // Mark the request as retried to avoid infinite loops
      (originalRequest as any)._retry = true;
      
      try {
        // Try to refresh the token
        const success = await refreshAccessToken();
        
        if (success) {
          // Update the Authorization header with the new token
          const token = getAccessToken();
          if (token && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          
          // Retry the original request with the new token
          return api(originalRequest);
        } else {
          // Refresh token failed, redirect to login
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Something went wrong with token refresh, redirect to login
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

// API helper methods
export const apiGet = async <T>(url: string, params?: any): Promise<T> => {
  const response = await api.get<T>(url, { params });
  return response.data;
};

export const apiPost = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.post<T>(url, data, config);
  return response.data;
};

export const apiPut = async <T>(url: string, data?: any): Promise<T> => {
  const response = await api.put<T>(url, data);
  return response.data;
};

export const apiPatch = async <T>(url: string, data?: any): Promise<T> => {
  const response = await api.patch<T>(url, data);
  return response.data;
};

export const apiDelete = async <T>(url: string, params?: any): Promise<T> => {
  const response = await api.delete<T>(url, { params });
  return response.data;
};

export default api;
