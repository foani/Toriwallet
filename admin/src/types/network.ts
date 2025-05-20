export enum NetworkType {
  EVM = 'evm',
  BITCOIN = 'bitcoin',
  SOLANA = 'solana',
  ZENITH = 'zenith',
  CATENA = 'catena'
}

export enum NetworkStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance'
}

export interface Network {
  id: string;
  name: string;
  type: NetworkType;
  chainId: string;
  rpcUrl: string;
  symbol: string;
  blockExplorerUrl: string;
  iconUrl?: string;
  status: NetworkStatus;
  isTestnet: boolean;
  isDefaultNetwork: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NetworkCreateRequest {
  name: string;
  type: NetworkType;
  chainId: string;
  rpcUrl: string;
  symbol: string;
  blockExplorerUrl: string;
  iconUrl?: string;
  status: NetworkStatus;
  isTestnet: boolean;
  isDefaultNetwork: boolean;
}

export interface NetworkUpdateRequest {
  name?: string;
  rpcUrl?: string;
  blockExplorerUrl?: string;
  iconUrl?: string;
  status?: NetworkStatus;
  isDefaultNetwork?: boolean;
}

export interface NetworkFilters {
  type?: NetworkType;
  status?: NetworkStatus;
  search?: string;
  isTestnet?: boolean;
}

export interface NetworkStats {
  networkId: string;
  networkName: string;
  activeUsers: number;
  totalTransactions: number;
  transactionVolume: number;
  averageGasPrice?: number;
  blockHeight: number;
  lastUpdate: string;
}

export interface PaginatedNetworksResponse {
  networks: Network[];
  total: number;
  page: number;
  limit: number;
}
