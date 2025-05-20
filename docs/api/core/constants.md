# Constants (상수)

Core 패키지에서 사용되는 주요 상수들을 설명합니다.

## networks.ts

네트워크 관련 상수를 정의합니다.

```typescript
import { NetworkType } from '../types/network';

export const NETWORKS: Record<string, NetworkType> = {
  ZENITH_MAINNET: {
    id: 'zenith-mainnet',
    name: 'Zenith Chain Mainnet',
    nativeCurrency: {
      name: 'CTA',
      symbol: 'CTA',
      decimals: 18,
    },
    rpcUrls: ['https://node.creatachain.com'],
    blockExplorerUrls: ['https://explorer.creatachain.com'],
    chainId: '0x1',
    isCVM: false,
    isTestnet: false,
  },
  CATENA_MAINNET: {
    id: 'catena-mainnet',
    name: 'Catena Chain Mainnet',
    nativeCurrency: {
      name: 'CTA',
      symbol: 'CTA',
      decimals: 18,
    },
    rpcUrls: ['https://cvm.node.creatachain.com'],
    blockExplorerUrls: ['https://catena.explorer.creatachain.com'],
    chainId: '0x3E8', // 1000
    isCVM: true,
    isTestnet: false,
  },
  CATENA_TESTNET: {
    id: 'catena-testnet',
    name: 'Catena Chain Testnet',
    nativeCurrency: {
      name: 'CTA',
      symbol: 'CTA',
      decimals: 18,
    },
    rpcUrls: ['https://consensus.testnet.cvm.creatachain.com'],
    blockExplorerUrls: ['https://testnet.cvm.creatachain.com'],
    chainId: '0x2328', // 9000
    isCVM: true,
    isTestnet: true,
  },
  ETHEREUM_MAINNET: {
    id: 'ethereum-mainnet',
    name: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3/${INFURA_API_KEY}'],
    blockExplorerUrls: ['https://etherscan.io'],
    chainId: '0x1',
    isCVM: false,
    isTestnet: false,
  },
  // ... 다른 네트워크 정의
};

export const DEFAULT_NETWORK_ID = 'catena-mainnet';
```

## tokens.ts

토큰 관련 상수를 정의합니다.

```typescript
import { TokenType } from '../types/assets';

export const TOKENS: Record<string, Record<string, TokenType>> = {
  'zenith-mainnet': {
    CTA: {
      address: '0x0000000000000000000000000000000000000000', // Native token
      name: 'Creata',
      symbol: 'CTA',
      decimals: 18,
      logoURI: 'https://assets.creatachain.com/tokens/cta.png',
      isNative: true,
    },
    // ... other tokens on Zenith Chain
  },
  'catena-mainnet': {
    CTA: {
      address: '0x0000000000000000000000000000000000000000', // Native token
      name: 'Creata',
      symbol: 'CTA',
      decimals: 18,
      logoURI: 'https://assets.creatachain.com/tokens/cta.png',
      isNative: true,
    },
    // ... other tokens on Catena Chain
  },
  // ... other networks
};

export const DEFAULT_TOKENS = TOKENS['catena-mainnet'];
```

## config.ts

애플리케이션 구성 관련 상수를 정의합니다.

```typescript
export const CONFIG = {
  APP_NAME: 'TORI Wallet',
  VERSION: '1.0.0',
  STORAGE_KEYS: {
    WALLET: 'tori_wallet',
    SETTINGS: 'tori_settings',
    ACCOUNTS: 'tori_accounts',
    NETWORKS: 'tori_networks',
    TOKENS: 'tori_tokens',
    TRANSACTIONS: 'tori_transactions',
    DAPPS: 'tori_dapps',
    CONTACTS: 'tori_contacts',
  },
  DEFAULT_LANGUAGE: 'en',
  SUPPORTED_LANGUAGES: ['en', 'ko', 'ja', 'zh-CN', 'zh-TW', 'vi', 'th'],
  DEFAULT_THEME: 'light',
  AUTO_LOCK_TIME: 5 * 60 * 1000, // 5 minutes
  GAS_PRICE_UPDATE_INTERVAL: 15 * 1000, // 15 seconds
  TRANSACTION_MONITOR_INTERVAL: 10 * 1000, // 10 seconds
  REFRESH_BALANCE_INTERVAL: 30 * 1000, // 30 seconds
  REFRESH_PRICE_INTERVAL: 60 * 1000, // 1 minute
};
```

## errors.ts

애플리케이션에서 사용되는 오류 유형을 정의합니다.

```typescript
export enum ErrorCode {
  // General errors
  UNKNOWN_ERROR = 'unknown_error',
  NETWORK_ERROR = 'network_error',
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  
  // Wallet errors
  WALLET_NOT_FOUND = 'wallet_not_found',
  INVALID_PASSWORD = 'invalid_password',
  WALLET_ALREADY_EXISTS = 'wallet_already_exists',
  INVALID_MNEMONIC = 'invalid_mnemonic',
  INVALID_PRIVATE_KEY = 'invalid_private_key',
  
  // Transaction errors
  TRANSACTION_FAILED = 'transaction_failed',
  TRANSACTION_TIMEOUT = 'transaction_timeout',
  TRANSACTION_REJECTED = 'transaction_rejected',
  
  // Network errors
  NETWORK_NOT_SUPPORTED = 'network_not_supported',
  INVALID_NETWORK = 'invalid_network',
  
  // DApp errors
  DAPP_CONNECTION_FAILED = 'dapp_connection_failed',
  DAPP_REJECTED = 'dapp_rejected',
  
  // Security errors
  BIOMETRIC_FAILED = 'biometric_failed',
  UNAUTHORIZED = 'unauthorized',
}

export class ToriError extends Error {
  code: ErrorCode;
  details?: any;

  constructor(code: ErrorCode, message?: string, details?: any) {
    super(message || code);
    this.code = code;
    this.details = details;
    this.name = 'ToriError';
  }
}
```
