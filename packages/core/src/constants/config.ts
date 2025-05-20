/**
 * config.ts
 * 
 * 이 모듈은 TORI 지갑 애플리케이션의 전역 구성 설정을 정의합니다.
 * 환경 변수, API 키, 타임아웃 설정 등의 구성 값을 포함합니다.
 */

// 환경 설정
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

// 현재 환경 설정
export const CURRENT_ENV = process.env.NODE_ENV === 'production'
  ? Environment.PRODUCTION
  : process.env.NODE_ENV === 'staging'
    ? Environment.STAGING
    : Environment.DEVELOPMENT;

// 앱 설정
export const APP_CONFIG = {
  name: 'TORI Wallet',
  version: '1.0.0',
  supportedLanguages: ['en', 'ko', 'ja', 'zh', 'vi', 'th'],
  defaultLanguage: 'en',
};

// 저장소 키
export const STORAGE_KEYS = {
  WALLET: 'tori_wallet',
  ACCOUNTS: 'tori_accounts',
  SELECTED_ACCOUNT: 'tori_selected_account',
  SELECTED_NETWORK: 'tori_selected_network',
  USER_SETTINGS: 'tori_user_settings',
  TOKENS: 'tori_tokens',
  TRANSACTION_HISTORY: 'tori_tx_history',
  ADDRESS_BOOK: 'tori_address_book',
  CUSTOM_NETWORKS: 'tori_custom_networks',
  CUSTOM_TOKENS: 'tori_custom_tokens',
};

// 네트워크 타임아웃 설정
export const NETWORK_CONFIG = {
  requestTimeout: 30000, // 밀리초
  retryAttempts: 3,
  retryDelay: 1000, // 밀리초
};

// 암호화 설정
export const CRYPTO_CONFIG = {
  saltLength: 16,
  ivLength: 16,
  keyLength: 32,
  iterations: 10000,
  algorithm: 'aes-256-gcm',
};

// 보안 설정
export const SECURITY_CONFIG = {
  passwordMinLength: 8,
  autoLockTimeOptions: [1, 5, 15, 30, 60, 0], // 분 (0은 자동 잠금 없음)
  defaultAutoLockTime: 5, // 분
  biometricsEnabled: true,
};

// 트랜잭션 설정
export const TRANSACTION_CONFIG = {
  defaultGasLimit: 21000,
  defaultGasLimitERC20: 60000,
  maxGasLimit: 10000000,
  gasPriceMultipliers: {
    low: 0.9,
    medium: 1.0,
    high: 1.5,
  },
};

// API 키 (실제 배포에서는 환경 변수를 사용해야 함)
export const API_KEYS = {
  infura: process.env.INFURA_API_KEY || '',
  etherscan: process.env.ETHERSCAN_API_KEY || '',
  bscscan: process.env.BSCSCAN_API_KEY || '',
  polygonscan: process.env.POLYGONSCAN_API_KEY || '',
  solanascan: process.env.SOLANASCAN_API_KEY || '',
  coingecko: process.env.COINGECKO_API_KEY || '',
};

// 지원되는 파일 형식
export const SUPPORTED_FILE_TYPES = {
  KEYSTORE: ['application/json', 'text/plain'],
  IMAGE: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
};

// dApp 브라우저 설정
export const DAPP_BROWSER_CONFIG = {
  homepageUrl: 'https://creatachain.com/dapps',
  defaultApps: [
    {
      name: 'CreataChain DEX',
      url: 'https://dex.creatachain.com',
      description: 'Decentralized exchange on CreataChain',
      icon: 'dex.png',
      category: 'Exchange',
    },
    {
      name: 'CreataChain NFT Marketplace',
      url: 'https://nft.creatachain.com',
      description: 'NFT marketplace on CreataChain',
      icon: 'nft.png',
      category: 'NFT',
    },
  ],
};

// 스테이킹 설정
export const STAKING_CONFIG = {
  defaultLockupPeriods: [10, 30, 60, 80, 90], // 일
  minStakeAmount: {
    CTA: '1',
  },
  delegationFee: 0.02, // 2%
};

// DeFi 설정
export const DEFI_CONFIG = {
  defaultSlippage: 0.5, // 0.5%
  maxSlippage: 5, // 5%
};

// API 엔드포인트
export const API_ENDPOINTS = {
  market: 'https://api.creatachain.com/market',
  nodes: {
    catena: 'https://api.creatachain.com/nodes/catena',
    zenith: 'https://api.creatachain.com/nodes/zenith',
  },
  staking: 'https://api.creatachain.com/staking',
  bridge: 'https://api.creatachain.com/bridge',
};

// 캐시 설정
export const CACHE_CONFIG = {
  tokenListTTL: 3600, // 초
  priceTTL: 60, // 초
  balanceTTL: 30, // 초
};

// 블록체인 세부 정보
export const BLOCKCHAIN_DETAILS = {
  averageBlockTime: {
    catena: 3, // 초
    zenith: 3, // 초
    ethereum: 13, // 초
    bitcoin: 600, // 초
    bsc: 3, // 초
    polygon: 2, // 초
    solana: 0.4, // 초
  },
  confirmations: {
    catena: 1,
    zenith: 1,
    ethereum: 12,
    bitcoin: 6,
    bsc: 1,
    polygon: 5,
    solana: 32,
  },
};
