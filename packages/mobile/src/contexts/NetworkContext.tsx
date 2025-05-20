import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetworkService } from '@tori-wallet/core';

// 네트워크 정보를 위한 타입 정의
export interface Network {
  id: string;
  name: string;
  rpcUrl: string;
  chainId: number;
  currencySymbol: string;
  explorerUrl: string;
  type: 'evm' | 'bitcoin' | 'solana' | 'zenith';
  isTestnet: boolean;
  isCustom: boolean;
}

export interface NetworkState {
  networks: Network[];
  activeNetwork: Network | null;
  isLoadingNetworks: boolean;
  networkError: string | null;
}

// 네트워크 컨텍스트 값 타입 정의
interface NetworkContextValue extends NetworkState {
  switchNetwork: (networkId: string) => Promise<void>;
  addCustomNetwork: (network: Omit<Network, 'id' | 'isCustom'>) => Promise<Network>;
  editCustomNetwork: (
    networkId: string,
    updates: Partial<Omit<Network, 'id' | 'isCustom'>>
  ) => Promise<Network>;
  removeCustomNetwork: (networkId: string) => Promise<void>;
}

// 기본 상태
const defaultNetworkState: NetworkState = {
  networks: [],
  activeNetwork: null,
  isLoadingNetworks: true,
  networkError: null,
};

// 컨텍스트 생성
export const NetworkContext = createContext<NetworkContextValue>({
  ...defaultNetworkState,
  switchNetwork: async () => {},
  addCustomNetwork: async () => ({
    id: '',
    name: '',
    rpcUrl: '',
    chainId: 0,
    currencySymbol: '',
    explorerUrl: '',
    type: 'evm',
    isTestnet: false,
    isCustom: true,
  }),
  editCustomNetwork: async () => ({
    id: '',
    name: '',
    rpcUrl: '',
    chainId: 0,
    currencySymbol: '',
    explorerUrl: '',
    type: 'evm',
    isTestnet: false,
    isCustom: true,
  }),
  removeCustomNetwork: async () => {},
});

interface NetworkProviderProps {
  children: ReactNode;
}

/**
 * 블록체인 네트워크를 관리하는 프로바이더 컴포넌트
 * 
 * 지원되는 블록체인 네트워크들을 관리하고, 활성 네트워크 전환,
 * 사용자 정의 네트워크 추가/편집/삭제 기능을 제공합니다.
 * 
 * @param children 프로바이더 내부에 렌더링될 컴포넌트
 */
export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [networkState, setNetworkState] = useState<NetworkState>(defaultNetworkState);
  const [networkService, setNetworkService] = useState<NetworkService | null>(null);

  // 내장 네트워크 목록
  const builtInNetworks: Network[] = [
    {
      id: 'catena-mainnet',
      name: 'Catena Chain Mainnet',
      rpcUrl: 'https://cvm.node.creatachain.com',
      chainId: 1000,
      currencySymbol: 'CTA',
      explorerUrl: 'https://catena.explorer.creatachain.com',
      type: 'evm',
      isTestnet: false,
      isCustom: false,
    },
    {
      id: 'catena-testnet',
      name: 'Catena Chain Testnet',
      rpcUrl: 'https://consensus.testnet.cvm.creatachain.com',
      chainId: 9000,
      currencySymbol: 'CTA',
      explorerUrl: 'https://testnet.cvm.creatachain.com',
      type: 'evm',
      isTestnet: true,
      isCustom: false,
    },
    {
      id: 'zenith-mainnet',
      name: 'Zenith Chain Mainnet',
      rpcUrl: 'https://zenith.node.creatachain.com',
      chainId: 2000,
      currencySymbol: 'CTA',
      explorerUrl: 'https://zenith.explorer.creatachain.com',
      type: 'zenith',
      isTestnet: false,
      isCustom: false,
    },
    {
      id: 'ethereum-mainnet',
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
      chainId: 1,
      currencySymbol: 'ETH',
      explorerUrl: 'https://etherscan.io',
      type: 'evm',
      isTestnet: false,
      isCustom: false,
    },
    {
      id: 'bsc-mainnet',
      name: 'Binance Smart Chain',
      rpcUrl: 'https://bsc-dataseed.binance.org',
      chainId: 56,
      currencySymbol: 'BNB',
      explorerUrl: 'https://bscscan.com',
      type: 'evm',
      isTestnet: false,
      isCustom: false,
    },
    {
      id: 'polygon-mainnet',
      name: 'Polygon Mainnet',
      rpcUrl: 'https://polygon-rpc.com',
      chainId: 137,
      currencySymbol: 'MATIC',
      explorerUrl: 'https://polygonscan.com',
      type: 'evm',
      isTestnet: false,
      isCustom: false,
    },
    {
      id: 'bitcoin-mainnet',
      name: 'Bitcoin Mainnet',
      rpcUrl: 'https://api.blockcypher.com/v1/btc/main',
      chainId: 0,
      currencySymbol: 'BTC',
      explorerUrl: 'https://www.blockchain.com/explorer',
      type: 'bitcoin',
      isTestnet: false,
      isCustom: false,
    },
    {
      id: 'solana-mainnet',
      name: 'Solana Mainnet',
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      chainId: 0,
      currencySymbol: 'SOL',
      explorerUrl: 'https://explorer.solana.com',
      type: 'solana',
      isTestnet: false,
      isCustom: false,
    },
  ];

  // 네트워크 초기화
  useEffect(() => {
    const initNetworks = async () => {
      try {
        // 실제 구현에서는 networkService를 사용하여 네트워크 정보 가져오기
        // const service = new NetworkService();
        // setNetworkService(service);
        // const networks = await service.getNetworks();
        // const activeNetworkId = await service.getActiveNetworkId();
        
        // 임시 구현:
        // 저장된 사용자 정의 네트워크 가져오기
        const customNetworksJson = await AsyncStorage.getItem('@custom_networks');
        let customNetworks: Network[] = [];
        
        if (customNetworksJson) {
          customNetworks = JSON.parse(customNetworksJson);
        }
        
        // 활성 네트워크 ID 가져오기
        const activeNetworkId = await AsyncStorage.getItem('@active_network');
        const defaultActiveId = 'catena-mainnet';
        const networkId = activeNetworkId || defaultActiveId;
        
        // 모든 네트워크 병합
        const allNetworks = [...builtInNetworks, ...customNetworks];
        const active = allNetworks.find(n => n.id === networkId) || builtInNetworks[0];
        
        setNetworkState({
          networks: allNetworks,
          activeNetwork: active,
          isLoadingNetworks: false,
          networkError: null,
        });
      } catch (error) {
        console.error('Failed to initialize networks:', error);
        setNetworkState({
          networks: builtInNetworks,
          activeNetwork: builtInNetworks[0],
          isLoadingNetworks: false,
          networkError: 'Failed to load custom networks',
        });
      }
    };

    initNetworks();
  }, []);

  // 네트워크 전환
  const switchNetwork = async (networkId: string) => {
    try {
      const network = networkState.networks.find(n => n.id === networkId);
      
      if (!network) {
        throw new Error('Network not found');
      }
      
      // 활성 네트워크 저장
      await AsyncStorage.setItem('@active_network', networkId);
      
      // 실제 구현에서는 networkService를 사용하여 네트워크 전환
      // await networkService.switchNetwork(networkId);
      
      setNetworkState(prev => ({
        ...prev,
        activeNetwork: network,
      }));
    } catch (error) {
      console.error('Failed to switch network:', error);
      setNetworkState(prev => ({
        ...prev,
        networkError: 'Failed to switch network',
      }));
    }
  };

  // 사용자 정의 네트워크 추가
  const addCustomNetwork = async (network: Omit<Network, 'id' | 'isCustom'>) => {
    try {
      // ID 생성
      const id = `custom-${Date.now()}`;
      
      const newNetwork: Network = {
        ...network,
        id,
        isCustom: true,
      };
      
      // 새 네트워크 추가
      const updatedNetworks = [...networkState.networks, newNetwork];
      
      // 사용자 정의 네트워크만 필터링
      const customNetworks = updatedNetworks.filter(n => n.isCustom);
      
      // 사용자 정의 네트워크 저장
      await AsyncStorage.setItem('@custom_networks', JSON.stringify(customNetworks));
      
      // 실제 구현에서는 networkService를 사용하여 네트워크 추가
      // await networkService.addNetwork(newNetwork);
      
      setNetworkState(prev => ({
        ...prev,
        networks: updatedNetworks,
      }));
      
      return newNetwork;
    } catch (error) {
      console.error('Failed to add custom network:', error);
      setNetworkState(prev => ({
        ...prev,
        networkError: 'Failed to add custom network',
      }));
      throw error;
    }
  };

  // 사용자 정의 네트워크 편집
  const editCustomNetwork = async (
    networkId: string,
    updates: Partial<Omit<Network, 'id' | 'isCustom'>>
  ) => {
    try {
      const index = networkState.networks.findIndex(n => n.id === networkId);
      
      if (index === -1) {
        throw new Error('Network not found');
      }
      
      const network = networkState.networks[index];
      
      if (!network.isCustom) {
        throw new Error('Cannot edit built-in network');
      }
      
      // 네트워크 업데이트
      const updatedNetwork: Network = {
        ...network,
        ...updates,
      };
      
      const updatedNetworks = [...networkState.networks];
      updatedNetworks[index] = updatedNetwork;
      
      // 사용자 정의 네트워크만 필터링
      const customNetworks = updatedNetworks.filter(n => n.isCustom);
      
      // 사용자 정의 네트워크 저장
      await AsyncStorage.setItem('@custom_networks', JSON.stringify(customNetworks));
      
      // 실제 구현에서는 networkService를 사용하여 네트워크 업데이트
      // await networkService.updateNetwork(updatedNetwork);
      
      // 활성 네트워크가 업데이트된 네트워크라면 함께 업데이트
      const newActiveNetwork = 
        networkState.activeNetwork?.id === networkId 
          ? updatedNetwork 
          : networkState.activeNetwork;
      
      setNetworkState(prev => ({
        ...prev,
        networks: updatedNetworks,
        activeNetwork: newActiveNetwork,
      }));
      
      return updatedNetwork;
    } catch (error) {
      console.error('Failed to edit custom network:', error);
      setNetworkState(prev => ({
        ...prev,
        networkError: 'Failed to edit custom network',
      }));
      throw error;
    }
  };

  // 사용자 정의 네트워크 삭제
  const removeCustomNetwork = async (networkId: string) => {
    try {
      const network = networkState.networks.find(n => n.id === networkId);
      
      if (!network) {
        throw new Error('Network not found');
      }
      
      if (!network.isCustom) {
        throw new Error('Cannot remove built-in network');
      }
      
      // 활성 네트워크가 삭제 대상이면 기본 네트워크로 전환
      if (networkState.activeNetwork?.id === networkId) {
        await AsyncStorage.setItem('@active_network', 'catena-mainnet');
        
        // 실제 구현에서는 networkService를 사용하여 기본 네트워크로 전환
        // await networkService.switchNetwork('catena-mainnet');
      }
      
      // 네트워크 삭제
      const updatedNetworks = networkState.networks.filter(n => n.id !== networkId);
      
      // 사용자 정의 네트워크만 필터링
      const customNetworks = updatedNetworks.filter(n => n.isCustom);
      
      // 사용자 정의 네트워크 저장
      await AsyncStorage.setItem('@custom_networks', JSON.stringify(customNetworks));
      
      // 실제 구현에서는 networkService를 사용하여 네트워크 삭제
      // await networkService.removeNetwork(networkId);
      
      // 활성 네트워크가 삭제 대상이면 기본 네트워크로 설정
      const newActiveNetwork = 
        networkState.activeNetwork?.id === networkId 
          ? builtInNetworks[0] 
          : networkState.activeNetwork;
      
      setNetworkState(prev => ({
        ...prev,
        networks: updatedNetworks,
        activeNetwork: newActiveNetwork,
      }));
    } catch (error) {
      console.error('Failed to remove custom network:', error);
      setNetworkState(prev => ({
        ...prev,
        networkError: 'Failed to remove custom network',
      }));
      throw error;
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        ...networkState,
        switchNetwork,
        addCustomNetwork,
        editCustomNetwork,
        removeCustomNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
