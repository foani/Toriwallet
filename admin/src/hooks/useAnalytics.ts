import { useState, useEffect, useCallback } from 'react';
import {
  AnalyticsPeriod,
  AnalyticsRequest,
  AnalyticsResponse,
  MetricType
} from '@/types';
import {
  getAnalytics,
  getAnalyticsOverview,
  getMetricData,
  getNetworkUsage,
  getAssetDistribution,
  getRegionalDistribution,
  getWalletActivity,
  exportAnalytics
} from '@/services/analytics';
import { useNotification } from '@/context';

export const useAnalytics = (initialPeriod: AnalyticsPeriod = AnalyticsPeriod.MONTH) => {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod);
  const [timeRange, setTimeRange] = useState<{ startDate: string; endDate: string } | undefined>(
    undefined
  );
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>([
    MetricType.USERS,
    MetricType.TRANSACTIONS,
    MetricType.VOLUME
  ]);
  const [selectedNetworkIds, setSelectedNetworkIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { showNotification } = useNotification();

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const request: AnalyticsRequest = {
        period,
        timeRange,
        metrics: selectedMetrics,
        networkIds: selectedNetworkIds.length > 0 ? selectedNetworkIds : undefined
      };
      
      const data = await getAnalytics(request);
      setAnalytics(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '분석 데이터 조회 실패', 
          description: error.message 
        });
      } else {
        setError('분석 데이터를 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '분석 데이터 조회 실패', 
          description: '분석 데이터를 가져오는 중 오류가 발생했습니다.' 
        });
      }
    }
  }, [period, timeRange, selectedMetrics, selectedNetworkIds, showNotification]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleChangePeriod = (newPeriod: AnalyticsPeriod) => {
    setPeriod(newPeriod);
    
    // 사용자 정의 기간(custom)이 아닌 경우 timeRange 초기화
    if (newPeriod !== 'custom') {
      setTimeRange(undefined);
    }
  };

  const handleSetTimeRange = (startDate: string, endDate: string) => {
    setTimeRange({ startDate, endDate });
    // 사용자 정의 기간을 선택한 경우 period를 'custom'으로 설정
    setPeriod('custom' as AnalyticsPeriod);
  };

  const handleToggleMetric = (metric: MetricType) => {
    setSelectedMetrics((prevMetrics) => {
      if (prevMetrics.includes(metric)) {
        return prevMetrics.filter((m) => m !== metric);
      } else {
        return [...prevMetrics, metric];
      }
    });
  };

  const handleSelectNetworks = (networkIds: string[]) => {
    setSelectedNetworkIds(networkIds);
  };

  const handleClearNetworkSelection = () => {
    setSelectedNetworkIds([]);
  };

  const handleExportAnalytics = async (format: 'csv' | 'excel' = 'csv') => {
    setLoading(true);
    setError(null);
    
    try {
      const request: AnalyticsRequest = {
        period,
        timeRange,
        metrics: selectedMetrics,
        networkIds: selectedNetworkIds.length > 0 ? selectedNetworkIds : undefined
      };
      
      const blob = await exportAnalytics(request, format);
      
      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setLoading(false);
      showNotification('success', { 
        title: '분석 데이터 내보내기 성공', 
        description: '분석 데이터가 성공적으로 내보내기되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '분석 데이터 내보내기 실패', 
          description: error.message 
        });
      } else {
        setError('분석 데이터를 내보내는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '분석 데이터 내보내기 실패', 
          description: '분석 데이터를 내보내는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  // 개별 데이터 조회 함수
  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAnalyticsOverview(period);
      setAnalytics((prev) => prev ? { ...prev, overview: data } : null);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '개요 데이터 조회 실패', 
          description: error.message 
        });
      } else {
        setError('개요 데이터를 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '개요 데이터 조회 실패', 
          description: '개요 데이터를 가져오는 중 오류가 발생했습니다.' 
        });
      }
      return null;
    }
  };

  const fetchMetricData = async (metricType: MetricType) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getMetricData(metricType, period);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '지표 데이터 조회 실패', 
          description: error.message 
        });
      } else {
        setError('지표 데이터를 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '지표 데이터 조회 실패', 
          description: '지표 데이터를 가져오는 중 오류가 발생했습니다.' 
        });
      }
      return null;
    }
  };

  const fetchNetworkUsage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getNetworkUsage(period);
      setAnalytics((prev) => prev ? { ...prev, networkUsage: data } : null);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '네트워크 사용 데이터 조회 실패', 
          description: error.message 
        });
      } else {
        setError('네트워크 사용 데이터를 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '네트워크 사용 데이터 조회 실패', 
          description: '네트워크 사용 데이터를 가져오는 중 오류가 발생했습니다.' 
        });
      }
      return null;
    }
  };

  const fetchAssetDistribution = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAssetDistribution(period);
      setAnalytics((prev) => prev ? { ...prev, assetDistribution: data } : null);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '자산 분포 데이터 조회 실패', 
          description: error.message 
        });
      } else {
        setError('자산 분포 데이터를 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '자산 분포 데이터 조회 실패', 
          description: '자산 분포 데이터를 가져오는 중 오류가 발생했습니다.' 
        });
      }
      return null;
    }
  };

  const fetchRegionalDistribution = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getRegionalDistribution(period);
      setAnalytics((prev) => prev ? { ...prev, regionalDistribution: data } : null);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '지역 분포 데이터 조회 실패', 
          description: error.message 
        });
      } else {
        setError('지역 분포 데이터를 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '지역 분포 데이터 조회 실패', 
          description: '지역 분포 데이터를 가져오는 중 오류가 발생했습니다.' 
        });
      }
      return null;
    }
  };

  const fetchWalletActivity = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getWalletActivity(period);
      setAnalytics((prev) => prev ? { ...prev, walletActivity: data } : null);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '지갑 활동 데이터 조회 실패', 
          description: error.message 
        });
      } else {
        setError('지갑 활동 데이터를 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '지갑 활동 데이터 조회 실패', 
          description: '지갑 활동 데이터를 가져오는 중 오류가 발생했습니다.' 
        });
      }
      return null;
    }
  };

  return {
    analytics,
    period,
    timeRange,
    selectedMetrics,
    selectedNetworkIds,
    loading,
    error,
    fetchAnalyticsData,
    changePeriod: handleChangePeriod,
    setTimeRange: handleSetTimeRange,
    toggleMetric: handleToggleMetric,
    selectNetworks: handleSelectNetworks,
    clearNetworkSelection: handleClearNetworkSelection,
    exportAnalytics: handleExportAnalytics,
    fetchOverview,
    fetchMetricData,
    fetchNetworkUsage,
    fetchAssetDistribution,
    fetchRegionalDistribution,
    fetchWalletActivity
  };
};
