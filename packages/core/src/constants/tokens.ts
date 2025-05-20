/**
 * tokens.ts
 * 
 * 이 모듈은 지원되는 모든 토큰의 구성 정보를 정의합니다.
 * 각 네트워크에 대한 기본 토큰 목록과 토큰 관련 유틸리티 함수를 포함합니다.
 */

import { NetworkType } from './networks';

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  isNative?: boolean;
  isStable?: boolean;
  networkType: NetworkType;
}

// CIP-20 토큰 규격의 메타데이터 모델
export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply?: string;
  balanceOf?: string;
}

// 주요 네트워크별 기본 토큰 정의
export const TOKENS_BY_NETWORK: Record<NetworkType, TokenInfo[]> = {
  [NetworkType.CATENA_MAINNET]: [
    {
      address: '0x0000000000000000000000000000000000000000', // 네이티브 토큰 주소
      symbol: 'CTA',
      name: 'Catena',
      decimals: 18,
      isNative: true,
      networkType: NetworkType.CATENA_MAINNET,
    },
    {
      address: '0x1234567890123456789012345678901234567890', // 예시 주소
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      isStable: true,
      networkType: NetworkType.CATENA_MAINNET,
    },
    {
      address: '0x0987654321098765432109876543210987654321', // 예시 주소
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      isStable: true,
      networkType: NetworkType.CATENA_MAINNET,
    },
  ],
  [NetworkType.CATENA_TESTNET]: [
    {
      address: '0x0000000000000000000000000000000000000000', // 네이티브 토큰 주소
      symbol: 'CTA',
      name: 'Catena',
      decimals: 18,
      isNative: true,
      networkType: NetworkType.CATENA_TESTNET,
    },
    {
      address: '0xTestUSDT567890123456789012345678901234567890', // 예시 주소
      symbol: 'USDT',
      name: 'Test Tether USD',
      decimals: 6,
      isStable: true,
      networkType: NetworkType.CATENA_TESTNET,
    },
  ],
  [NetworkType.ZENITH_MAINNET]: [
    {
      address: '0x0000000000000000000000000000000000000000', // 네이티브 토큰 주소
      symbol: 'CTA',
      name: 'Creata',
      decimals: 18,
      isNative: true,
      networkType: NetworkType.ZENITH_MAINNET,
    },
  ],
  [NetworkType.ETHEREUM_MAINNET]: [
    {
      address: '0x0000000000000000000000000000000000000000', // 네이티브 토큰 주소
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      isNative: true,
      networkType: NetworkType.ETHEREUM_MAINNET,
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      isStable: true,
      networkType: NetworkType.ETHEREUM_MAINNET,
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      isStable: true,
      networkType: NetworkType.ETHEREUM_MAINNET,
    },
  ],
  [NetworkType.ETHEREUM_GOERLI]: [
    {
      address: '0x0000000000000000000000000000000000000000', // 네이티브 토큰 주소
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      isNative: true,
      networkType: NetworkType.ETHEREUM_GOERLI,
    },
  ],
  [NetworkType.BITCOIN_MAINNET]: [
    {
      address: '', // 비트코인은 컨트랙트 주소가 없음
      symbol: 'BTC',
      name: 'Bitcoin',
      decimals: 8,
      isNative: true,
      networkType: NetworkType.BITCOIN_MAINNET,
    },
  ],
  [NetworkType.BITCOIN_TESTNET]: [
    {
      address: '', // 비트코인은 컨트랙트 주소가 없음
      symbol: 'BTC',
      name: 'Bitcoin',
      decimals: 8,
      isNative: true,
      networkType: NetworkType.BITCOIN_TESTNET,
    },
  ],
  [NetworkType.BSC_MAINNET]: [
    {
      address: '0x0000000000000000000000000000000000000000', // 네이티브 토큰 주소
      symbol: 'BNB',
      name: 'BNB',
      decimals: 18,
      isNative: true,
      networkType: NetworkType.BSC_MAINNET,
    },
    {
      address: '0x55d398326f99059fF775485246999027B3197955',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 18,
      isStable: true,
      networkType: NetworkType.BSC_MAINNET,
    },
    {
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 18,
      isStable: true,
      networkType: NetworkType.BSC_MAINNET,
    },
  ],
  [NetworkType.BSC_TESTNET]: [
    {
      address: '0x0000000000000000000000000000000000000000', // 네이티브 토큰 주소
      symbol: 'BNB',
      name: 'BNB',
      decimals: 18,
      isNative: true,
      networkType: NetworkType.BSC_TESTNET,
    },
  ],
  [NetworkType.POLYGON_MAINNET]: [
    {
      address: '0x0000000000000000000000000000000000000000', // 네이티브 토큰 주소
      symbol: 'MATIC',
      name: 'Matic',
      decimals: 18,
      isNative: true,
      networkType: NetworkType.POLYGON_MAINNET,
    },
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      isStable: true,
      networkType: NetworkType.POLYGON_MAINNET,
    },
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      isStable: true,
      networkType: NetworkType.POLYGON_MAINNET,
    },
  ],
  [NetworkType.POLYGON_MUMBAI]: [
    {
      address: '0x0000000000000000000000000000000000000000', // 네이티브 토큰 주소
      symbol: 'MATIC',
      name: 'Matic',
      decimals: 18,
      isNative: true,
      networkType: NetworkType.POLYGON_MUMBAI,
    },
  ],
  [NetworkType.SOLANA_MAINNET]: [
    {
      address: '', // 솔라나는 다른 주소 체계 사용
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      isNative: true,
      networkType: NetworkType.SOLANA_MAINNET,
    },
    {
      address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
      isStable: true,
      networkType: NetworkType.SOLANA_MAINNET,
    },
    {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      isStable: true,
      networkType: NetworkType.SOLANA_MAINNET,
    },
  ],
  [NetworkType.SOLANA_DEVNET]: [
    {
      address: '', // 솔라나는 다른 주소 체계 사용
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      isNative: true,
      networkType: NetworkType.SOLANA_DEVNET,
    },
  ],
};

// 토큰 주소로 토큰 정보 조회
export const getTokenByAddress = (networkType: NetworkType, address: string): TokenInfo | undefined => {
  const normalizedAddress = address.toLowerCase();
  return TOKENS_BY_NETWORK[networkType].find(
    token => token.address.toLowerCase() === normalizedAddress
  );
};

// 네이티브 토큰 정보 조회
export const getNativeToken = (networkType: NetworkType): TokenInfo | undefined => {
  return TOKENS_BY_NETWORK[networkType].find(token => token.isNative);
};

// 모든 안정화 코인 목록 가져오기
export const getStablecoins = (networkType: NetworkType): TokenInfo[] => {
  return TOKENS_BY_NETWORK[networkType].filter(token => token.isStable);
};

// 모든 지원되는 토큰 목록 가져오기
export const getAllTokens = (): TokenInfo[] => {
  return Object.values(TOKENS_BY_NETWORK).flat();
};
