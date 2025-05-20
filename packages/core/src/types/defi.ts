/**
 * DeFi 관련 타입 정의
 */

// 유동성 풀 상태
export type PoolStatus = 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';

// 유동성 풀 정보
export interface Pool {
  id: string;
  name: string;
  platform: string;
  platformLogo?: string;
  protocol: string;
  type: 'SWAP' | 'FARM' | 'LENDING';
  status: PoolStatus;
  tokens: {
    symbol: string;
    address: string;
    decimals: number;
    logo?: string;
    price?: number;
    weight?: number;
    balance?: string;
  }[];
  tvl: string;
  tvlUsd: string;
  apr: number;
  apy: number;
  rewardTokens?: {
    symbol: string;
    address: string;
    decimals: number;
    logo?: string;
    price?: number;
  }[];
  url?: string;
  createdAt: number;
  updatedAt: number;
}

// 유동성 포지션
export interface LiquidityPosition {
  id: string;
  poolId: string;
  pool: Pool;
  owner: string;
  network: string;
  tokens: {
    symbol: string;
    address: string;
    amount: string;
    amountUsd: string;
  }[];
  totalValueLocked: string;
  totalValueLockedUsd: string;
  share: number;
  rewards?: {
    token: string;
    address: string;
    amount: string;
    amountUsd: string;
  }[];
  pendingRewards?: {
    token: string;
    address: string;
    amount: string;
    amountUsd: string;
  }[];
  startTime: number;
  lastHarvestTime?: number;
  createdAt: number;
  updatedAt: number;
}

// 농사(파밍) 포지션
export interface FarmingPosition {
  id: string;
  poolId: string;
  pool: Pool;
  owner: string;
  network: string;
  stakedLpTokens: {
    address: string;
    amount: string;
    amountUsd: string;
  };
  totalValueLocked: string;
  totalValueLockedUsd: string;
  rewards?: {
    token: string;
    address: string;
    amount: string;
    amountUsd: string;
  }[];
  pendingRewards?: {
    token: string;
    address: string;
    amount: string;
    amountUsd: string;
  }[];
  apr: number;
  apy: number;
  startTime: number;
  endTime?: number;
  lastHarvestTime?: number;
  createdAt: number;
  updatedAt: number;
}

// 대출 정보
export interface LendingPool {
  id: string;
  name: string;
  platform: string;
  platformLogo?: string;
  protocol: string;
  status: PoolStatus;
  token: {
    symbol: string;
    address: string;
    decimals: number;
    logo?: string;
    price?: number;
  };
  totalSupply: string;
  totalSupplyUsd: string;
  totalBorrow: string;
  totalBorrowUsd: string;
  supplyApy: number;
  borrowApy: number;
  utilizationRate: number;
  collateralFactor: number;
  liquidationThreshold: number;
  ltv: number;
  url?: string;
  createdAt: number;
  updatedAt: number;
}

// 대출 포지션
export interface LendingPosition {
  id: string;
  poolId: string;
  pool: LendingPool;
  owner: string;
  network: string;
  isSupplying: boolean;
  isBorrowing: boolean;
  supplyAmount?: string;
  supplyAmountUsd?: string;
  borrowAmount?: string;
  borrowAmountUsd?: string;
  healthFactor?: number;
  startTime: number;
  createdAt: number;
  updatedAt: number;
}

// DeFi 트랜잭션 유형
export type DefiTransactionType = 
  | 'ADD_LIQUIDITY' 
  | 'REMOVE_LIQUIDITY' 
  | 'STAKE_LP_TOKEN'
  | 'UNSTAKE_LP_TOKEN' 
  | 'HARVEST_REWARDS' 
  | 'SUPPLY' 
  | 'WITHDRAW' 
  | 'BORROW' 
  | 'REPAY';

// DeFi 트랜잭션 상태
export type DefiTransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

// DeFi 트랜잭션
export interface DefiTransaction {
  id: string;
  type: DefiTransactionType;
  status: DefiTransactionStatus;
  timestamp: number;
  network: string;
  fromAddress: string;
  poolId: string;
  poolName?: string;
  platformName?: string;
  tokens?: {
    symbol: string;
    amount: string;
    amountUsd: string;
  }[];
  fee?: string;
  feeUsd?: string;
  transactionHash?: string;
  blockExplorerUrl?: string;
}

// 토큰 가격 정보
export interface TokenPrice {
  symbol: string;
  address: string;
  network: string;
  price: number;
  priceChangePercentage24h?: number;
  priceChangePercentage7d?: number;
  priceChangePercentage30d?: number;
  lastUpdated: number;
}

// 토큰 스왑 견적
export interface SwapQuote {
  id: string;
  fromToken: {
    symbol: string;
    address: string;
    decimals: number;
    amount: string;
    amountUsd: string;
  };
  toToken: {
    symbol: string;
    address: string;
    decimals: number;
    amount: string;
    amountUsd: string;
  };
  rate: number;
  priceImpact: number;
  platform: string;
  fee: string;
  feeUsd: string;
  estimatedGas: string;
  estimatedGasUsd: string;
  route?: {
    path: string[];
    pools: string[];
  };
  expiresAt: number;
}
