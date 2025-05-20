import { useState, useEffect, useCallback } from 'react';
import {
  Network,
  NetworkCreateRequest,
  NetworkFilters,
  NetworkStats,
  NetworkUpdateRequest,
  PaginatedNetworksResponse
} from '@/types';
import {
  getNetworks,
  getNetworkById,
  createNetwork,
  updateNetwork,
  deleteNetwork,
  activateNetwork,
  deactivateNetwork,
  setNetworkMaintenance,
  setDefaultNetwork,
  getNetworkStats
} from '@/services/networks';
import { useNotification } from '@/context';

export const useNetworks = (initialPage: number = 1, initialLimit: number = 10) => {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [filters, setFilters] = useState<NetworkFilters>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);

  const { showNotification } = useNotification();

  const fetchNetworks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response: PaginatedNetworksResponse = await getNetworks(page, limit, filters);
      setNetworks(response.networks);
      setTotal(response.total);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '네트워크 목록 조회 실패', 
          description: error.message 
        });
      } else {
        setError('네트워크 목록을 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '네트워크 목록 조회 실패', 
          description: '네트워크 목록을 가져오는 중 오류가 발생했습니다.' 
        });
      }
    }
  }, [page, limit, filters, showNotification]);

  useEffect(() => {
    fetchNetworks();
  }, [fetchNetworks]);

  const handleSelectNetwork = async (networkId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const network = await getNetworkById(networkId);
      setSelectedNetwork(network);
      
      // 네트워크 통계 정보 가져오기
      const stats = await getNetworkStats(networkId);
      setNetworkStats(stats);
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '네트워크 정보 조회 실패', 
          description: error.message 
        });
      } else {
        setError('네트워크 정보를 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '네트워크 정보 조회 실패', 
          description: '네트워크 정보를 가져오는 중 오류가 발생했습니다.' 
        });
      }
    }
  };

  const handleCreateNetwork = async (networkData: NetworkCreateRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const newNetwork = await createNetwork(networkData);
      setNetworks((prevNetworks) => [...prevNetworks, newNetwork]);
      setTotal((prevTotal) => prevTotal + 1);
      setLoading(false);
      showNotification('success', { 
        title: '네트워크 생성 성공', 
        description: '새 네트워크가 생성되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '네트워크 생성 실패', 
          description: error.message 
        });
      } else {
        setError('네트워크를 생성하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '네트워크 생성 실패', 
          description: '네트워크를 생성하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleUpdateNetwork = async (networkId: string, networkData: NetworkUpdateRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedNetwork = await updateNetwork(networkId, networkData);
      setNetworks((prevNetworks) =>
        prevNetworks.map((network) => (network.id === networkId ? updatedNetwork : network))
      );
      
      if (selectedNetwork && selectedNetwork.id === networkId) {
        setSelectedNetwork(updatedNetwork);
      }
      
      setLoading(false);
      showNotification('success', { 
        title: '네트워크 업데이트 성공', 
        description: '네트워크 정보가 업데이트되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '네트워크 업데이트 실패', 
          description: error.message 
        });
      } else {
        setError('네트워크 정보를 업데이트하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '네트워크 업데이트 실패', 
          description: '네트워크 정보를 업데이트하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleDeleteNetwork = async (networkId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteNetwork(networkId);
      setNetworks((prevNetworks) => prevNetworks.filter((network) => network.id !== networkId));
      setTotal((prevTotal) => prevTotal - 1);
      
      if (selectedNetwork && selectedNetwork.id === networkId) {
        setSelectedNetwork(null);
        setNetworkStats(null);
      }
      
      setLoading(false);
      showNotification('success', { 
        title: '네트워크 삭제 성공', 
        description: '네트워크가 삭제되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '네트워크 삭제 실패', 
          description: error.message 
        });
      } else {
        setError('네트워크를 삭제하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '네트워크 삭제 실패', 
          description: '네트워크를 삭제하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleActivateNetwork = async (networkId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedNetwork = await activateNetwork(networkId);
      setNetworks((prevNetworks) =>
        prevNetworks.map((network) => (network.id === networkId ? updatedNetwork : network))
      );
      
      if (selectedNetwork && selectedNetwork.id === networkId) {
        setSelectedNetwork(updatedNetwork);
      }
      
      setLoading(false);
      showNotification('success', { 
        title: '네트워크 활성화 성공', 
        description: '네트워크가 활성화되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '네트워크 활성화 실패', 
          description: error.message 
        });
      } else {
        setError('네트워크를 활성화하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '네트워크 활성화 실패', 
          description: '네트워크를 활성화하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleDeactivateNetwork = async (networkId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedNetwork = await deactivateNetwork(networkId);
      setNetworks((prevNetworks) =>
        prevNetworks.map((network) => (network.id === networkId ? updatedNetwork : network))
      );
      
      if (selectedNetwork && selectedNetwork.id === networkId) {
        setSelectedNetwork(updatedNetwork);
      }
      
      setLoading(false);
      showNotification('success', { 
        title: '네트워크 비활성화 성공', 
        description: '네트워크가 비활성화되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '네트워크 비활성화 실패', 
          description: error.message 
        });
      } else {
        setError('네트워크를 비활성화하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '네트워크 비활성화 실패', 
          description: '네트워크를 비활성화하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleSetNetworkMaintenance = async (networkId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedNetwork = await setNetworkMaintenance(networkId);
      setNetworks((prevNetworks) =>
        prevNetworks.map((network) => (network.id === networkId ? updatedNetwork : network))
      );
      
      if (selectedNetwork && selectedNetwork.id === networkId) {
        setSelectedNetwork(updatedNetwork);
      }
      
      setLoading(false);
      showNotification('success', { 
        title: '네트워크 점검 모드 설정 성공', 
        description: '네트워크가 점검 모드로 설정되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '네트워크 점검 모드 설정 실패', 
          description: error.message 
        });
      } else {
        setError('네트워크를 점검 모드로 설정하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '네트워크 점검 모드 설정 실패', 
          description: '네트워크를 점검 모드로 설정하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleSetDefaultNetwork = async (networkId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedNetwork = await setDefaultNetwork(networkId);
      
      // 현재 네트워크 타입의 기존 기본 네트워크 상태 업데이트
      const networkType = updatedNetwork.type;
      setNetworks((prevNetworks) =>
        prevNetworks.map((network) => {
          if (network.type === networkType) {
            return {
              ...network,
              isDefaultNetwork: network.id === networkId
            };
          }
          return network;
        })
      );
      
      if (selectedNetwork && selectedNetwork.id === networkId) {
        setSelectedNetwork(updatedNetwork);
      }
      
      setLoading(false);
      showNotification('success', { 
        title: '기본 네트워크 설정 성공', 
        description: '네트워크가 기본 네트워크로 설정되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '기본 네트워크 설정 실패', 
          description: error.message 
        });
      } else {
        setError('네트워크를 기본 네트워크로 설정하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '기본 네트워크 설정 실패', 
          description: '네트워크를 기본 네트워크로 설정하는 중 오류가 발생했습니다.' 
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

  const handleApplyFilters = (newFilters: NetworkFilters) => {
    setFilters(newFilters);
    setPage(1); // 필터가 변경되면 첫 페이지로 이동
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  return {
    networks,
    total,
    page,
    limit,
    filters,
    loading,
    error,
    selectedNetwork,
    networkStats,
    fetchNetworks,
    selectNetwork: handleSelectNetwork,
    createNetwork: handleCreateNetwork,
    updateNetwork: handleUpdateNetwork,
    deleteNetwork: handleDeleteNetwork,
    activateNetwork: handleActivateNetwork,
    deactivateNetwork: handleDeactivateNetwork,
    setNetworkMaintenance: handleSetNetworkMaintenance,
    setDefaultNetwork: handleSetDefaultNetwork,
    changePage: handleChangePage,
    changeLimit: handleChangeLimit,
    applyFilters: handleApplyFilters,
    resetFilters: handleResetFilters
  };
};
