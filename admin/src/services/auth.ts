import { 
  AuthUser, 
  ChangePasswordRequest, 
  LoginRequest, 
  LoginResponse, 
  ResetPasswordRequest,
  User 
} from '@/types';
import { apiGet, apiPost } from './api';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  ME: '/auth/me',
  ENABLE_2FA: '/auth/2fa/enable',
  VERIFY_2FA: '/auth/2fa/verify',
  DISABLE_2FA: '/auth/2fa/disable'
};

/**
 * Authenticate user with email and password
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  return apiPost<LoginResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  return apiPost<void>(AUTH_ENDPOINTS.LOGOUT);
};

/**
 * Get current authenticated user details
 */
export const getCurrentUser = async (): Promise<User> => {
  return apiGet<User>(AUTH_ENDPOINTS.ME);
};

/**
 * Request password reset for a user email
 */
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  return apiPost<{ message: string }>(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
};

/**
 * Reset user password using token from email
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<{ message: string }> => {
  return apiPost<{ message: string }>(AUTH_ENDPOINTS.RESET_PASSWORD, data);
};

/**
 * Change authenticated user's password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<{ message: string }> => {
  return apiPost<{ message: string }>(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
};

/**
 * Enable two-factor authentication for user
 */
export const enable2FA = async (): Promise<{ qrCode: string; secret: string }> => {
  return apiPost<{ qrCode: string; secret: string }>(AUTH_ENDPOINTS.ENABLE_2FA);
};

/**
 * Verify two-factor authentication code
 */
export const verify2FA = async (code: string, secret: string): Promise<{ message: string }> => {
  return apiPost<{ message: string }>(AUTH_ENDPOINTS.VERIFY_2FA, { code, secret });
};

/**
 * Disable two-factor authentication for user
 */
export const disable2FA = async (code: string): Promise<{ message: string }> => {
  return apiPost<{ message: string }>(AUTH_ENDPOINTS.DISABLE_2FA, { code });
};
