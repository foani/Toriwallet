import {
  User,
  UserCreateRequest,
  UserFilters,
  UserUpdateRequest,
  PaginatedUsersResponse
} from '@/types';
import { apiGet, apiPost, apiPut, apiDelete } from './api';

const USER_ENDPOINTS = {
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`
};

/**
 * Get paginated list of users with optional filters
 */
export const getUsers = async (
  page: number = 1,
  limit: number = 10,
  filters?: UserFilters
): Promise<PaginatedUsersResponse> => {
  return apiGet<PaginatedUsersResponse>(USER_ENDPOINTS.USERS, {
    page,
    limit,
    ...filters
  });
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User> => {
  return apiGet<User>(USER_ENDPOINTS.USER_BY_ID(id));
};

/**
 * Create a new user
 */
export const createUser = async (userData: UserCreateRequest): Promise<User> => {
  return apiPost<User>(USER_ENDPOINTS.USERS, userData);
};

/**
 * Update an existing user
 */
export const updateUser = async (id: string, userData: UserUpdateRequest): Promise<User> => {
  return apiPut<User>(USER_ENDPOINTS.USER_BY_ID(id), userData);
};

/**
 * Delete a user
 */
export const deleteUser = async (id: string): Promise<void> => {
  return apiDelete<void>(USER_ENDPOINTS.USER_BY_ID(id));
};

/**
 * Activate a user
 */
export const activateUser = async (id: string): Promise<User> => {
  return apiPost<User>(`${USER_ENDPOINTS.USER_BY_ID(id)}/activate`);
};

/**
 * Deactivate a user
 */
export const deactivateUser = async (id: string): Promise<User> => {
  return apiPost<User>(`${USER_ENDPOINTS.USER_BY_ID(id)}/deactivate`);
};

/**
 * Reset user password (admin function)
 */
export const resetUserPassword = async (id: string): Promise<{ message: string }> => {
  return apiPost<{ message: string }>(`${USER_ENDPOINTS.USER_BY_ID(id)}/reset-password`);
};
