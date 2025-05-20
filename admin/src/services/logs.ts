import { apiGet, apiPost } from './api';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source: string;
  userId?: string;
  userEmail?: string;
  metadata?: Record<string, any>;
}

export interface LogFilters {
  level?: LogLevel;
  startDate?: string;
  endDate?: string;
  source?: string;
  userId?: string;
  search?: string;
}

export interface PaginatedLogsResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  limit: number;
}

const LOG_ENDPOINTS = {
  LOGS: '/logs',
  LOG_SOURCES: '/logs/sources',
  LOG_STATS: '/logs/stats',
  LOG_EXPORT: '/logs/export'
};

/**
 * Get paginated system logs with optional filters
 */
export const getLogs = async (
  page: number = 1,
  limit: number = 50,
  filters?: LogFilters
): Promise<PaginatedLogsResponse> => {
  return apiGet<PaginatedLogsResponse>(LOG_ENDPOINTS.LOGS, {
    page,
    limit,
    ...filters
  });
};

/**
 * Get all available log sources
 */
export const getLogSources = async (): Promise<string[]> => {
  return apiGet<string[]>(LOG_ENDPOINTS.LOG_SOURCES);
};

/**
 * Get log statistics (count by level, source, time)
 */
export const getLogStats = async (
  startDate?: string,
  endDate?: string
): Promise<{
  byLevel: Record<LogLevel, number>;
  bySource: Record<string, number>;
  byTime: { timestamp: string; count: number }[];
}> => {
  return apiGet<{
    byLevel: Record<LogLevel, number>;
    bySource: Record<string, number>;
    byTime: { timestamp: string; count: number }[];
  }>(LOG_ENDPOINTS.LOG_STATS, { startDate, endDate });
};

/**
 * Export logs as CSV or JSON
 */
export const exportLogs = async (
  filters?: LogFilters,
  format: 'csv' | 'json' = 'csv'
): Promise<Blob> => {
  const response = await apiPost(LOG_ENDPOINTS.LOG_EXPORT, { ...filters, format }, {
    responseType: 'blob'
  });
  return response as unknown as Blob;
};
