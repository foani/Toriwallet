import {
  Network,
  NetworkCreateRequest,
  NetworkFilters,
  NetworkStats,
  NetworkUpdateRequest,
  PaginatedNetworksResponse
} from '@/types';
import { apiGet, apiPost, apiPut, apiDelete } from './api';

const NETWORK_ENDPOINTS = {
  NETWORKS: '/networks',
  NETWORK_BY_ID: (id: string) => `/networks/${id}`,
  NETWORK_STATS: '/networks/stats',
  NETWORK_STATS_BY_ID: (id: string) => `/networks/${id}/stats`
};

/**
 * Get paginated list of networks with optional filters
 */
export const getNetworks = async (
  page: number = 1,
  limit: number = 10,
  filters?: NetworkFilters
): Promise<PaginatedNetworksResponse> => {
  return apiGet<PaginatedNetworksResponse>(NETWORK_ENDPOINTS.NETWORKS, {
    page,
    limit,
    ...filters
  });
};

/**
 * Get network by ID
 */
export const getNetworkById = async (id: string): Promise<Network> => {
  return apiGet<Network>(NETWORK_ENDPOINTS.NETWORK_BY_ID(id));
};

/**
 * Create a new network
 */
export const createNetwork = async (networkData: NetworkCreateRequest): Promise<Network> => {
  return apiPost<Network>(NETWORK_ENDPOINTS.NETWORKS, networkData);
};

/**
 * Update an existing network
 */
export const updateNetwork = async (id: string, networkData: NetworkUpdateRequest): Promise<Network> => {
  return apiPut<Network>(NETWORK_ENDPOINTS.NETWORK_BY_ID(id), networkData);
};

/**
 * Delete a network
 */
export const deleteNetwork = async (id: string): Promise<void> => {
  return apiDelete<void>(NETWORK_ENDPOINTS.NETWORK_BY_ID(id));
};

/**
 * Get stats for all networks
 */
export const getAllNetworkStats = async (): Promise<NetworkStats[]> => {
  return apiGet<NetworkStats[]>(NETWORK_ENDPOINTS.NETWORK_STATS);
};

/**
 * Get stats for a specific network
 */
export const getNetworkStats = async (id: string): Promise<NetworkStats> => {
  return apiGet<NetworkStats>(NETWORK_ENDPOINTS.NETWORK_STATS_BY_ID(id));
};

/**
 * Activate a network
 */
export const activateNetwork = async (id: string): Promise<Network> => {
  return apiPost<Network>(`${NETWORK_ENDPOINTS.NETWORK_BY_ID(id)}/activate`);
};

/**
 * Deactivate a network
 */
export const deactivateNetwork = async (id: string): Promise<Network> => {
  return apiPost<Network>(`${NETWORK_ENDPOINTS.NETWORK_BY_ID(id)}/deactivate`);
};

/**
 * Set network to maintenance mode
 */
export const setNetworkMaintenance = async (id: string): Promise<Network> => {
  return apiPost<Network>(`${NETWORK_ENDPOINTS.NETWORK_BY_ID(id)}/maintenance`);
};

/**
 * Set network as default for its type
 */
export const setDefaultNetwork = async (id: string): Promise<Network> => {
  return apiPost<Network>(`${NETWORK_ENDPOINTS.NETWORK_BY_ID(id)}/default`);
};
