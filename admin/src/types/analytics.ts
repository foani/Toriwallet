export interface TimeRange {
  startDate: string;
  endDate: string;
}

export enum AnalyticsPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}

export enum MetricType {
  USERS = 'users',
  TRANSACTIONS = 'transactions',
  VOLUME = 'volume',
  ACTIVE_WALLETS = 'active_wallets',
  STAKING = 'staking',
  DEFI = 'defi'
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface MetricData {
  type: MetricType;
  data: DataPoint[];
  total: number;
  change: number;
  changePercentage: number;
}

export interface AnalyticsOverview {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalTransactions: number;
  transactionVolume: number;
  avgTransactionValue: number;
  totalStakedValue: number;
  totalDefiValue: number;
  userRetention: number;
  userChangePercentage: number;
  transactionChangePercentage: number;
  volumeChangePercentage: number;
}

export interface NetworkUsage {
  networkId: string;
  networkName: string;
  users: number;
  transactions: number;
  volume: number;
  percentage: number;
}

export interface AssetDistribution {
  assetId: string;
  assetName: string;
  assetSymbol: string;
  totalValue: number;
  percentage: number;
}

export interface RegionalDistribution {
  country: string;
  users: number;
  percentage: number;
}

export interface WalletActivity {
  walletType: string;
  activeUsers: number;
  transactions: number;
  percentage: number;
}

export interface AnalyticsResponse {
  overview: AnalyticsOverview;
  userMetrics: MetricData;
  transactionMetrics: MetricData;
  volumeMetrics: MetricData;
  networkUsage: NetworkUsage[];
  assetDistribution: AssetDistribution[];
  regionalDistribution: RegionalDistribution[];
  walletActivity: WalletActivity[];
}

export interface AnalyticsRequest {
  period: AnalyticsPeriod;
  timeRange?: TimeRange;
  metrics?: MetricType[];
  networkIds?: string[];
}
