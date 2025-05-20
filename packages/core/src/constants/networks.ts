/**
 * networks.ts
 * 
 * 이 모듈은 지원되는 모든 블록체인 네트워크의 구성 정보를 정의합니다.
 * 각 네트워크에 대한 RPC URL, 체인 ID, 통화 기호 및 블록 탐색기 URL을 포함합니다.
 */

export enum NetworkType {
  CATENA_MAINNET = 'CATENA_MAINNET',
  CATENA_TESTNET = 'CATENA_TESTNET',
  ZENITH_MAINNET = 'ZENITH_MAINNET',
  ETHEREUM_MAINNET = 'ETHEREUM_MAINNET',
  ETHEREUM_GOERLI = 'ETHEREUM_GOERLI',
  BITCOIN_MAINNET = 'BITCOIN_MAINNET',
  BITCOIN_TESTNET = 'BITCOIN_TESTNET',
  BSC_MAINNET = 'BSC_MAINNET',
  BSC_TESTNET = 'BSC_TESTNET',
  POLYGON_MAINNET = 'POLYGON_MAINNET',
  POLYGON_MUMBAI = 'POLYGON_MUMBAI',
  SOLANA_MAINNET = 'SOLANA_MAINNET',
  SOLANA_DEVNET = 'SOLANA_DEVNET',
}

export interface NetworkInfo {
  type: NetworkType;
  name: string;
  rpcUrl: string;
  chainId?: number; // EVM 체인에 필요
  currencySymbol: string;
  currencyName: string;
  blockExplorerUrl: string;
  iconUrl: string;
  isTestnet: boolean;
  decimals: number;
  isEVM: boolean;
}

// 네트워크 정보 정의
export const NETWORKS: Record<NetworkType, NetworkInfo> = {
  [NetworkType.CATENA_MAINNET]: {
    type: NetworkType.CATENA_MAINNET,
    name: 'Catena Mainnet',
    rpcUrl: 'https://cvm.node.creatachain.com',
    chainId: 1000, // 0x3E8
    currencySymbol: 'CTA',
    currencyName: 'Catena',
    blockExplorerUrl: 'https://catena.explorer.creatachain.com',
    iconUrl: 'catena.png',
    isTestnet: false,
    decimals: 18,
    isEVM: true,
  },
  [NetworkType.CATENA_TESTNET]: {
    type: NetworkType.CATENA_TESTNET,
    name: 'Catena Testnet',
    rpcUrl: 'https://consensus.testnet.cvm.creatachain.com',
    chainId: 9000, // 0x2328
    currencySymbol: 'CTA',
    currencyName: 'Catena',
    blockExplorerUrl: 'https://testnet.cvm.creatachain.com',
    iconUrl: 'catena.png',
    isTestnet: true,
    decimals: 18,
    isEVM: true,
  },
  [NetworkType.ZENITH_MAINNET]: {
    type: NetworkType.ZENITH_MAINNET,
    name: 'Zenith Mainnet',
    rpcUrl: 'https://zenith.node.creatachain.com',
    currencySymbol: 'CTA',
    currencyName: 'Creata',
    blockExplorerUrl: 'https://zenith.explorer.creatachain.com',
    iconUrl: 'zenith.png',
    isTestnet: false,
    decimals: 18,
    isEVM: false,
  },
  [NetworkType.ETHEREUM_MAINNET]: {
    type: NetworkType.ETHEREUM_MAINNET,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/${INFURA_API_KEY}',
    chainId: 1,
    currencySymbol: 'ETH',
    currencyName: 'Ethereum',
    blockExplorerUrl: 'https://etherscan.io',
    iconUrl: 'ethereum.png',
    isTestnet: false,
    decimals: 18,
    isEVM: true,
  },
  [NetworkType.ETHEREUM_GOERLI]: {
    type: NetworkType.ETHEREUM_GOERLI,
    name: 'Ethereum Goerli',
    rpcUrl: 'https://goerli.infura.io/v3/${INFURA_API_KEY}',
    chainId: 5,
    currencySymbol: 'ETH',
    currencyName: 'Ethereum',
    blockExplorerUrl: 'https://goerli.etherscan.io',
    iconUrl: 'ethereum.png',
    isTestnet: true,
    decimals: 18,
    isEVM: true,
  },
  [NetworkType.BITCOIN_MAINNET]: {
    type: NetworkType.BITCOIN_MAINNET,
    name: 'Bitcoin Mainnet',
    rpcUrl: 'https://btc.getblock.io/${GETBLOCK_API_KEY}/mainnet/',
    currencySymbol: 'BTC',
    currencyName: 'Bitcoin',
    blockExplorerUrl: 'https://www.blockchain.com/explorer',
    iconUrl: 'bitcoin.png',
    isTestnet: false,
    decimals: 8,
    isEVM: false,
  },
  [NetworkType.BITCOIN_TESTNET]: {
    type: NetworkType.BITCOIN_TESTNET,
    name: 'Bitcoin Testnet',
    rpcUrl: 'https://btc.getblock.io/${GETBLOCK_API_KEY}/testnet/',
    currencySymbol: 'BTC',
    currencyName: 'Bitcoin',
    blockExplorerUrl: 'https://www.blockchain.com/explorer/testnet',
    iconUrl: 'bitcoin.png',
    isTestnet: true,
    decimals: 8,
    isEVM: false,
  },
  [NetworkType.BSC_MAINNET]: {
    type: NetworkType.BSC_MAINNET,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    chainId: 56,
    currencySymbol: 'BNB',
    currencyName: 'BNB',
    blockExplorerUrl: 'https://bscscan.com',
    iconUrl: 'bnb.png',
    isTestnet: false,
    decimals: 18,
    isEVM: true,
  },
  [NetworkType.BSC_TESTNET]: {
    type: NetworkType.BSC_TESTNET,
    name: 'BNB Smart Chain Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    chainId: 97,
    currencySymbol: 'BNB',
    currencyName: 'BNB',
    blockExplorerUrl: 'https://testnet.bscscan.com',
    iconUrl: 'bnb.png',
    isTestnet: true,
    decimals: 18,
    isEVM: true,
  },
  [NetworkType.POLYGON_MAINNET]: {
    type: NetworkType.POLYGON_MAINNET,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 137,
    currencySymbol: 'MATIC',
    currencyName: 'Matic',
    blockExplorerUrl: 'https://polygonscan.com',
    iconUrl: 'polygon.png',
    isTestnet: false,
    decimals: 18,
    isEVM: true,
  },
  [NetworkType.POLYGON_MUMBAI]: {
    type: NetworkType.POLYGON_MUMBAI,
    name: 'Polygon Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    chainId: 80001,
    currencySymbol: 'MATIC',
    currencyName: 'Matic',
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
    iconUrl: 'polygon.png',
    isTestnet: true,
    decimals: 18,
    isEVM: true,
  },
  [NetworkType.SOLANA_MAINNET]: {
    type: NetworkType.SOLANA_MAINNET,
    name: 'Solana Mainnet',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    currencySymbol: 'SOL',
    currencyName: 'Solana',
    blockExplorerUrl: 'https://explorer.solana.com',
    iconUrl: 'solana.png',
    isTestnet: false,
    decimals: 9,
    isEVM: false,
  },
  [NetworkType.SOLANA_DEVNET]: {
    type: NetworkType.SOLANA_DEVNET,
    name: 'Solana Devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    currencySymbol: 'SOL',
    currencyName: 'Solana',
    blockExplorerUrl: 'https://explorer.solana.com/?cluster=devnet',
    iconUrl: 'solana.png',
    isTestnet: true,
    decimals: 9,
    isEVM: false,
  },
};

// 기본 네트워크 타입
export const DEFAULT_NETWORK_TYPE = NetworkType.CATENA_MAINNET;

// 기본 네트워크 정보
export const DEFAULT_NETWORK = NETWORKS[DEFAULT_NETWORK_TYPE];

// 테스트넷 네트워크 가져오기
export const getTestnetNetworks = (): NetworkInfo[] => {
  return Object.values(NETWORKS).filter(network => network.isTestnet);
};

// 메인넷 네트워크 가져오기
export const getMainnetNetworks = (): NetworkInfo[] => {
  return Object.values(NETWORKS).filter(network => !network.isTestnet);
};

// EVM 호환 네트워크 가져오기
export const getEVMNetworks = (): NetworkInfo[] => {
  return Object.values(NETWORKS).filter(network => network.isEVM);
};
