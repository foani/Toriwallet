/**
 * 네트워크 매니저
 * 
 * 블록체인 네트워크 관련 기능을 관리합니다:
 * - 네트워크 목록 관리
 * - 네트워크 전환
 * - 네트워크 추가/제거
 * - 네트워크 연결 상태 모니터링
 */

import { MessageType } from './messageListener';

// 네트워크 인터페이스
export interface Network {
  id: string;
  name: string;
  rpcUrl: string;
  chainId: number;
  symbol: string;
  blockExplorerUrl?: string;
  isTestnet?: boolean;
  isCustom?: boolean;
}

// 네트워크 상태 인터페이스
interface NetworkState {
  networks: Network[];
  selectedNetwork: string; // 네트워크 ID
  isConnected: boolean;
}

// 초기 네트워크 (CreataChain의 Catena 메인넷)
const CATENA_MAINNET: Network = {
  id: 'catena-mainnet',
  name: 'Catena (CIP-20) Chain Mainnet',
  rpcUrl: 'https://cvm.node.creatachain.com',
  chainId: 1000, // 0x3E8
  symbol: 'CTA',
  blockExplorerUrl: 'https://catena.explorer.creatachain.com',
  isTestnet: false,
  isCustom: false
};

// CreataChain의 Catena 테스트넷
const CATENA_TESTNET: Network = {
  id: 'catena-testnet',
  name: 'Catena (CIP-20) Chain Testnet',
  rpcUrl: 'https://consensus.testnet.cvm.creatachain.com',
  chainId: 9000, // 0x2328
  symbol: 'CTA',
  blockExplorerUrl: 'https://testnet.cvm.creatachain.com',
  isTestnet: true,
  isCustom: false
};

// 기본 네트워크 목록
const DEFAULT_NETWORKS: Network[] = [
  CATENA_MAINNET,
  CATENA_TESTNET,
  {
    id: 'zenith-mainnet',
    name: 'Zenith Chain Mainnet',
    rpcUrl: 'https://zenith.node.creatachain.com', // 임시 URL (실제 URL로 변경 필요)
    chainId: 2000, // 임시 체인 ID (실제 값으로 변경 필요)
    symbol: 'ZNT',
    blockExplorerUrl: 'https://zenith.explorer.creatachain.com', // 임시 URL (실제 URL로 변경 필요)
    isTestnet: false,
    isCustom: false
  },
  {
    id: 'ethereum-mainnet',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY', // 실제 키로 변경 필요
    chainId: 1,
    symbol: 'ETH',
    blockExplorerUrl: 'https://etherscan.io',
    isTestnet: false,
    isCustom: false
  },
  {
    id: 'bsc-mainnet',
    name: 'Binance Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    chainId: 56,
    symbol: 'BNB',
    blockExplorerUrl: 'https://bscscan.com',
    isTestnet: false,
    isCustom: false
  },
  {
    id: 'polygon-mainnet',
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 137,
    symbol: 'MATIC',
    blockExplorerUrl: 'https://polygonscan.com',
    isTestnet: false,
    isCustom: false
  }
];

// 네트워크 상태
let networkState: NetworkState = {
  networks: [...DEFAULT_NETWORKS],
  selectedNetwork: CATENA_MAINNET.id,
  isConnected: false
};

/**
 * 네트워크 매니저 초기화
 */
export const initNetworkManager = async (): Promise<void> => {
  try {
    console.log('네트워크 매니저 초기화 중...');
    
    // 저장된 네트워크 상태 로드
    const storedState = await loadState();
    if (storedState) {
      networkState = { ...networkState, ...storedState };
    }
    
    // 현재 선택된 네트워크에 연결
    await connectToNetwork(networkState.selectedNetwork);
    
    console.log('네트워크 매니저 초기화 완료');
  } catch (error) {
    console.error('네트워크 매니저 초기화 실패:', error);
    throw error;
  }
};

/**
 * 네트워크 관련 메시지 처리
 */
export const handleNetworkMessages = async (message: any) => {
  switch (message.type) {
    case MessageType.NETWORK_GET_LIST:
      return getNetworks();
      
    case MessageType.NETWORK_SELECT:
      return await selectNetwork(message.data?.networkId);
      
    case MessageType.NETWORK_ADD:
      return await addNetwork(message.data?.network);
      
    case MessageType.NETWORK_REMOVE:
      return await removeNetwork(message.data?.networkId);
      
    default:
      throw new Error(`지원되지 않는 네트워크 메시지 타입: ${message.type}`);
  }
};

/**
 * 네트워크 목록 가져오기
 */
const getNetworks = (): { networks: Network[], selectedNetwork: string } => {
  return {
    networks: networkState.networks,
    selectedNetwork: networkState.selectedNetwork
  };
};

/**
 * 네트워크 선택 (전환)
 */
const selectNetwork = async (networkId: string): Promise<Network> => {
  if (!networkId) {
    throw new Error('네트워크 ID가 필요합니다');
  }
  
  const network = networkState.networks.find(n => n.id === networkId);
  if (!network) {
    throw new Error(`네트워크를 찾을 수 없음: ${networkId}`);
  }
  
  try {
    // 선택된 네트워크로 연결
    await connectToNetwork(networkId);
    
    // 상태 업데이트 및 저장
    networkState.selectedNetwork = networkId;
    await saveState();
    
    return network;
  } catch (error) {
    console.error(`네트워크 선택 실패: ${networkId}`, error);
    throw error;
  }
};

/**
 * 사용자 정의 네트워크 추가
 */
const addNetwork = async (network: Network): Promise<Network> => {
  if (!network || !network.name || !network.rpcUrl || !network.chainId) {
    throw new Error('유효한 네트워크 정보가 필요합니다');
  }
  
  // 네트워크 ID 생성 (없는 경우)
  if (!network.id) {
    network.id = `custom-${Date.now()}`;
  }
  
  // 사용자 정의 네트워크로 표시
  network.isCustom = true;
  
  // 중복 체크
  const existing = networkState.networks.find(n => 
    n.chainId === network.chainId || n.id === network.id);
  
  if (existing) {
    throw new Error('동일한 체인 ID 또는 네트워크 ID를 가진 네트워크가 이미 존재합니다');
  }
  
  try {
    // 네트워크 연결 가능 여부 테스트
    await testNetworkConnection(network);
    
    // 네트워크 목록에 추가
    networkState.networks.push(network);
    
    // 상태 저장
    await saveState();
    
    return network;
  } catch (error) {
    console.error('네트워크 추가 실패:', error);
    throw error;
  }
};

/**
 * 사용자 정의 네트워크 제거
 */
const removeNetwork = async (networkId: string): Promise<boolean> => {
  if (!networkId) {
    throw new Error('네트워크 ID가 필요합니다');
  }
  
  const network = networkState.networks.find(n => n.id === networkId);
  if (!network) {
    throw new Error(`네트워크를 찾을 수 없음: ${networkId}`);
  }
  
  // 기본 네트워크는 제거할 수 없음
  if (!network.isCustom) {
    throw new Error('기본 네트워크는 제거할 수 없습니다');
  }
  
  // 현재 선택된 네트워크인 경우 기본 네트워크로 전환
  if (networkState.selectedNetwork === networkId) {
    await selectNetwork(CATENA_MAINNET.id);
  }
  
  // 네트워크 목록에서 제거
  networkState.networks = networkState.networks.filter(n => n.id !== networkId);
  
  // 상태 저장
  await saveState();
  
  return true;
};

/**
 * 네트워크 연결 테스트
 */
const testNetworkConnection = async (network: Network): Promise<boolean> => {
  try {
    // TODO: 네트워크 연결 테스트 로직 구현
    // const connected = await networkService.testConnection(network);
    
    // 임시 구현: 실제 구현 시 제거
    const connected = true;
    
    if (!connected) {
      throw new Error(`네트워크에 연결할 수 없음: ${network.name}`);
    }
    
    return true;
  } catch (error) {
    console.error(`네트워크 연결 테스트 실패: ${network.name}`, error);
    throw error;
  }
};

/**
 * 선택된 네트워크에 연결
 */
const connectToNetwork = async (networkId: string): Promise<boolean> => {
  const network = networkState.networks.find(n => n.id === networkId);
  if (!network) {
    throw new Error(`네트워크를 찾을 수 없음: ${networkId}`);
  }
  
  try {
    // TODO: 네트워크 연결 로직 구현
    // const connected = await networkService.connect(network);
    
    // 임시 구현: 실제 구현 시 제거
    const connected = true;
    
    if (connected) {
      networkState.isConnected = true;
      networkState.selectedNetwork = networkId;
      
      // 상태 저장
      await saveState();
      
      return true;
    } else {
      throw new Error(`네트워크에 연결할 수 없음: ${network.name}`);
    }
  } catch (error) {
    console.error(`네트워크 연결 실패: ${network.name}`, error);
    networkState.isConnected = false;
    throw error;
  }
};

/**
 * 네트워크 상태 저장
 */
const saveState = async (): Promise<void> => {
  try {
    const state = {
      networks: networkState.networks.filter(n => n.isCustom), // 사용자 정의 네트워크만 저장
      selectedNetwork: networkState.selectedNetwork,
      isConnected: networkState.isConnected
    };
    
    await chrome.storage.local.set({ networkState: state });
  } catch (error) {
    console.error('네트워크 상태 저장 실패:', error);
    throw error;
  }
};

/**
 * 저장된 네트워크 상태 로드
 */
const loadState = async (): Promise<NetworkState | null> => {
  try {
    const result = await chrome.storage.local.get('networkState');
    
    if (result.networkState) {
      // 기본 네트워크와 저장된 사용자 정의 네트워크 합치기
      const customNetworks = result.networkState.networks || [];
      const networks = [...DEFAULT_NETWORKS];
      
      // 중복을 방지하면서 사용자 정의 네트워크 추가
      for (const customNetwork of customNetworks) {
        if (!networks.some(n => n.id === customNetwork.id)) {
          networks.push(customNetwork);
        }
      }
      
      return {
        ...result.networkState,
        networks
      };
    }
    
    return null;
  } catch (error) {
    console.error('네트워크 상태 로드 실패:', error);
    return null;
  }
};
