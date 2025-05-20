import {
  AnalyticsPeriod,
  AnalyticsRequest,
  AnalyticsResponse,
  AssetDistribution,
  MetricData,
  MetricType,
  NetworkUsage,
  RegionalDistribution,
  WalletActivity
} from '@/types';
import { apiGet, apiPost } from './api';

const ANALYTICS_ENDPOINTS = {
  OVERVIEW: '/analytics/overview',
  METRICS: '/analytics/metrics',
  NETWORK_USAGE: '/analytics/networks',
  ASSET_DISTRIBUTION: '/analytics/assets',
  REGIONAL_DISTRIBUTION: '/analytics/regions',
  WALLET_ACTIVITY: '/analytics/wallets',
  EXPORT: '/analytics/export'
};

/**
 * Get complete analytics data
 */
export const getAnalytics = async (request: AnalyticsRequest): Promise<AnalyticsResponse> => {
  return apiPost<AnalyticsResponse>('/analytics', request);
};

/**
 * Get analytics overview
 */
export const getAnalyticsOverview = async (
  period: AnalyticsPeriod
): Promise<AnalyticsResponse['overview']> => {
  return apiGet<AnalyticsResponse['overview']>(ANALYTICS_ENDPOINTS.OVERVIEW, { period });
};

/**
 * Get specific metric data
 */
export const getMetricData = async (
  metricType: MetricType,
  period: AnalyticsPeriod
): Promise<MetricData> => {
  return apiGet<MetricData>(ANALYTICS_ENDPOINTS.METRICS, { metricType, period });
};

/**
 * Get network usage statistics
 */
export const getNetworkUsage = async (period: AnalyticsPeriod): Promise<NetworkUsage[]> => {
  return apiGet<NetworkUsage[]>(ANALYTICS_ENDPOINTS.NETWORK_USAGE, { period });
};

/**
 * Get asset distribution data
 */
export const getAssetDistribution = async (period: AnalyticsPeriod): Promise<AssetDistribution[]> => {
  return apiGet<AssetDistribution[]>(ANALYTICS_ENDPOINTS.ASSET_DISTRIBUTION, { period });
};

/**
 * Get regional distribution data
 */
export const getRegionalDistribution = async (period: AnalyticsPeriod): Promise<RegionalDistribution[]> => {
  return apiGet<RegionalDistribution[]>(ANALYTICS_ENDPOINTS.REGIONAL_DISTRIBUTION, { period });
};

/**
 * Get wallet activity data
 */
export const getWalletActivity = async (period: AnalyticsPeriod): Promise<WalletActivity[]> => {
  return apiGet<WalletActivity[]>(ANALYTICS_ENDPOINTS.WALLET_ACTIVITY, { period });
};

/**
 * Export analytics data as CSV
 */
export const exportAnalytics = async (
  request: AnalyticsRequest,
  format: 'csv' | 'excel' = 'csv'
): Promise<Blob> => {
  const response = await apiPost(ANALYTICS_ENDPOINTS.EXPORT, { ...request, format }, {
    responseType: 'blob'
  });
  return response as unknown as Blob;
};
