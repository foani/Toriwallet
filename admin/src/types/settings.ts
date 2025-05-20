export enum SettingCategory {
  GENERAL = 'general',
  SECURITY = 'security',
  NOTIFICATION = 'notification',
  STAKING = 'staking',
  CROSSCHAIN = 'crosschain',
  DEFI = 'defi',
  DAPP = 'dapp'
}

export interface Setting {
  id: string;
  category: SettingCategory;
  key: string;
  value: string | number | boolean | object;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingUpdateRequest {
  value: string | number | boolean | object;
}

export interface SecuritySettings {
  requireTwoFactor: boolean;
  sessionTimeout: number;
  maxFailedAttempts: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  ipWhitelist: string[];
}

export interface GeneralSettings {
  platformName: string;
  supportEmail: string;
  termsUrl: string;
  privacyUrl: string;
  defaultLanguage: string;
  defaultFiatCurrency: string;
  maintenanceMode: boolean;
  logoUrl: string;
  faviconUrl: string;
}

export interface NotificationSettings {
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  notifyOnLogin: boolean;
  notifyOnPasswordChange: boolean;
  notifyOnCriticalActions: boolean;
  transactionNotifications: boolean;
  marketAlerts: boolean;
  newsletterEnabled: boolean;
}

export interface StakingSettings {
  enabledNetworks: string[];
  minStakeAmount: number;
  maxStakeAmount: number;
  stakingFee: number;
  lockupPeriods: {
    period: number;
    apy: number;
  }[];
  autoCompoundEnabled: boolean;
}

export interface CrosschainSettings {
  enabledBridges: string[];
  maxTransferAmount: number;
  bridgeFee: number;
  bridgeTimeoutMinutes: number;
}

export interface DefiSettings {
  enabledProtocols: string[];
  maxLeverageRatio: number;
  liquidationThreshold: number;
  defiWarningEnabled: boolean;
}

export interface DappSettings {
  enabledCategories: string[];
  defaultFeaturedDapps: string[];
  dappBrowserEnabled: boolean;
  whitelistedDomains: string[];
  blacklistedDomains: string[];
}

export interface AllSettings {
  general: GeneralSettings;
  security: SecuritySettings;
  notification: NotificationSettings;
  staking: StakingSettings;
  crosschain: CrosschainSettings;
  defi: DefiSettings;
  dapp: DappSettings;
}
