import { useState, useEffect, useCallback } from 'react';
import { LogEntry, LogFilters, LogLevel, PaginatedLogsResponse } from '@/services/logs';
import { getLogs, getLogSources, getLogStats, exportLogs } from '@/services/logs';
import { useNotification } from '@/context';

export const useLogs = (initialPage: number = 1, initialLimit: number = 50) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [filters, setFilters] = useState<LogFilters>({});
  const [sources, setSources] = useState<string[]>([]);
  const [stats, setStats] = useState<{
    byLevel: Record<LogLevel, number>;
    bySource: Record<string, number>;
    byTime: { timestamp: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { showNotification } = useNotification();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response: PaginatedLogsResponse = await getLogs(page, limit, filters);
      setLogs(response.logs);
      setTotal(response.total);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '로그 목록 조회 실패', 
          description: error.message 
        });
      } else {
        setError('로그 목록을 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '로그 목록 조회 실패', 
          description: '로그 목록을 가져오는 중 오류가 발생했습니다.' 
        });
      }
    }
  }, [page, limit, filters, showNotification]);

  const fetchLogSources = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const logSources = await getLogSources();
      setSources(logSources);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '로그 소스 조회 실패', 
          description: error.message 
        });
      } else {
        setError('로그 소스를 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '로그 소스 조회 실패', 
          description: '로그 소스를 가져오는 중 오류가 발생했습니다.' 
        });
      }
    }
  }, [showNotification]);

  const fetchLogStats = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const logStats = await getLogStats(startDate, endDate);
      setStats(logStats);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '로그 통계 조회 실패', 
          description: error.message 
        });
      } else {
        setError('로그 통계를 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '로그 통계 조회 실패', 
          description: '로그 통계를 가져오는 중 오류가 발생했습니다.' 
        });
      }
    }
  }, [showNotification]);

  const handleExportLogs = async (format: 'csv' | 'json' = 'csv') => {
    setLoading(true);
    setError(null);
    
    try {
      const blob = await exportLogs(filters, format);
      
      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `logs_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setLoading(false);
      showNotification('success', { 
        title: '로그 내보내기 성공', 
        description: '로그가 성공적으로 내보내기되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '로그 내보내기 실패', 
          description: error.message 
        });
      } else {
        setError('로그를 내보내는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '로그 내보내기 실패', 
          description: '로그를 내보내는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeLimit = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // 페이지 크기가 변경되면 첫 페이지로 이동
  };

  const handleApplyFilters = (newFilters: LogFilters) => {
    setFilters(newFilters);
    setPage(1); // 필터가 변경되면 첫 페이지로 이동
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchLogSources();
  }, [fetchLogSources]);

  return {
    logs,
    total,
    page,
    limit,
    filters,
    sources,
    stats,
    loading,
    error,
    fetchLogs,
    fetchLogSources,
    fetchLogStats,
    exportLogs: handleExportLogs,
    changePage: handleChangePage,
    changeLimit: handleChangeLimit,
    applyFilters: handleApplyFilters,
    resetFilters: handleResetFilters
  };
};
