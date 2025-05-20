# Types (타입)

Core 패키지에서 사용되는 주요 타입들을 설명합니다.

## wallet.ts

지갑 관련 타입을 정의합니다.

```typescript
export interface EncryptedWallet {
  id: string;
  version: string;
  crypto: {
    cipher: string;
    ciphertext: string;
    cipherparams: {
      iv: string;
    };
    kdf: string;
    kdfparams: {
      dklen: number;
      n: number;
      p: number;
      r: number;
      salt: string;
    };
    mac: string;
  };
}

export interface Wallet {
  id: string;
  name: string;
  type: 'hd' | 'imported';
  createdAt: number;
  lastUsedAt: number;
}

export interface HDWallet extends Wallet {
  type: 'hd';
  mnemonic?: string; // Only stored in memory, never in storage
}

export interface ImportedWallet extends Wallet {
  type: 'imported';
  privateKey?: string; // Only stored in memory, never in storage
}

export interface Account {
  id: string;
  walletId: string;
  name: string;
  path?: string; // For HD wallets
  address: string;
  privateKey?: string; // Only stored in memory, never in storage
  networkIds: string[];
  isHidden: boolean;
  isDefault: boolean;
  createdAt: number;
  lastUsedAt: number;
}
```

## transaction.ts

트랜잭션 관련 타입을 정의합니다.

```typescript
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export interface TransactionType {
  id: string;
  networkId: string;
  hash?: string;
  from: string;
  to: string;
  value: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
  nonce?: number;
  status: TransactionStatus;
  timestamp: number;
  blockNumber?: number;
  confirmations?: number;
  type?: string;
  errorMessage?: string;
  meta?: {
    title?: string;
    description?: string;
    tokenTransfer?: {
      tokenAddress: string;
      tokenSymbol: string;
      tokenDecimals: number;
      value: string;
    };
    nftTransfer?: {
      tokenAddress: string;
      tokenId: string;
    };
    // For cross-chain transactions
    crosschain?: {
      sourceNetworkId: string;
      destinationNetworkId: string;
      relayerTxHash?: string;
      status: 'pending' | 'completed' | 'failed';
    };
  };
}

export interface TransactionOptions {
  gasLimit?: string;
  gasPrice?: string;
  nonce?: number;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  meta?: any;
}

export interface TransactionFee {
  slow: {
    gasPrice: string;
    estimatedTime: number;
  };
  average: {
    gasPrice: string;
    estimatedTime: number;
  };
  fast: {
    gasPrice: string;
    estimatedTime: number;
  };
}
```

## network.ts

네트워크 관련 타입을 정의합니다.

```typescript
export interface Currency {
  name: string;
  symbol: string;
  decimals: number;
}

export interface NetworkType {
  id: string;
  name: string;
  nativeCurrency: Currency;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  chainId: string;
  isCVM: boolean;
  isTestnet: boolean;
  iconUrl?: string;
}

export interface NetworkStatus {
  id: string;
  isConnected: boolean;
  latestBlockNumber?: number;
  gasPrice?: string;
  error?: string;
  lastUpdated: number;
}
```

## assets.ts

자산 관련 타입을 정의합니다.

```typescript
export interface TokenType {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  isNative?: boolean;
  isCustom?: boolean;
}

export interface TokenBalance {
  token: TokenType;
  balance: string;
  value?: string; // Value in USD or other fiat currency
}

export interface NFTType {
  tokenId: string;
  contractAddress: string;
  name?: string;
  description?: string;
  image?: string;
  attributes?: {
    trait_type: string;
    value: string;
  }[];
  tokenURI?: string;
  standard: 'ERC721' | 'ERC1155';
  owner: string;
}

export interface NFTCollection {
  id: string;
  name: string;
  contractAddress: string;
  description?: string;
  image?: string;
  items: NFTType[];
}
```

## staking.ts

스테이킹 관련 타입을 정의합니다.

```typescript
export interface ValidatorType {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'inactive' | 'jailed';
  commission: string; // Percentage as a string, e.g. "5.00"
  totalStaked: string;
  selfStaked: string;
  uptime: string; // Percentage as a string, e.g. "99.5"
  website?: string;
  description?: string;
  iconUrl?: string;
}

export interface DelegationType {
  validatorId: string;
  accountAddress: string;
  amount: string;
  rewards: string;
  unbondingCompletionTime?: number; // For unbonding delegations
  status: 'active' | 'unbonding';
}

export interface StakingOptions {
  validatorId: string;
  amount: string;
  lockupPeriod?: number; // Days
  autoCompound?: boolean;
}

export interface UnstakingOptions {
  validatorId: string;
  amount: string;
}

export interface ClaimRewardsOptions {
  validatorId?: string; // If undefined, claim from all validators
}
```

## dapp.ts

dApp 관련 타입을 정의합니다.

```typescript
export interface DAppType {
  id: string;
  name: string;
  url: string;
  description?: string;
  iconUrl?: string;
  categories: string[];
  lastUsed?: number;
  isBookmarked: boolean;
}

export interface DAppPermission {
  dappId: string;
  dappUrl: string;
  accountId: string;
  permissions: {
    eth_accounts: boolean;
    eth_sign: boolean;
    personal_sign: boolean;
    eth_signTypedData: boolean;
    eth_signTransaction: boolean;
    eth_sendTransaction: boolean;
    wallet_switchEthereumChain: boolean;
    wallet_addEthereumChain: boolean;
  };
  createdAt: number;
  lastUsedAt: number;
}
```
