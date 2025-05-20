import {
  AllSettings,
  CrosschainSettings,
  DappSettings,
  DefiSettings,
  GeneralSettings,
  NotificationSettings,
  SecuritySettings,
  Setting,
  SettingCategory,
  SettingUpdateRequest,
  StakingSettings
} from '@/types';
import { apiGet, apiPut } from './api';

const SETTINGS_ENDPOINTS = {
  ALL: '/settings',
  BY_CATEGORY: (category: SettingCategory) => `/settings/${category}`,
  BY_KEY: (key: string) => `/settings/key/${key}`
};

/**
 * Get all system settings
 */
export const getAllSettings = async (): Promise<AllSettings> => {
  return apiGet<AllSettings>(SETTINGS_ENDPOINTS.ALL);
};

/**
 * Get settings by category
 */
export const getSettingsByCategory = async (category: SettingCategory): Promise<Setting[]> => {
  return apiGet<Setting[]>(SETTINGS_ENDPOINTS.BY_CATEGORY(category));
};

/**
 * Get setting by key
 */
export const getSettingByKey = async (key: string): Promise<Setting> => {
  return apiGet<Setting>(SETTINGS_ENDPOINTS.BY_KEY(key));
};

/**
 * Update a specific setting
 */
export const updateSetting = async (key: string, data: SettingUpdateRequest): Promise<Setting> => {
  return apiPut<Setting>(SETTINGS_ENDPOINTS.BY_KEY(key), data);
};

/**
 * Get general settings
 */
export const getGeneralSettings = async (): Promise<GeneralSettings> => {
  return apiGet<GeneralSettings>(SETTINGS_ENDPOINTS.BY_CATEGORY(SettingCategory.GENERAL));
};

/**
 * Update general settings
 */
export const updateGeneralSettings = async (settings: Partial<GeneralSettings>): Promise<GeneralSettings> => {
  return apiPut<GeneralSettings>(SETTINGS_ENDPOINTS.BY_CATEGORY(SettingCategory.GENERAL), settings);
};

/**
 * Get security settings
 */
export const getSecuritySettings = async (): Promise<SecuritySettings> => {
  return apiGet<SecuritySettings>(SETTINGS_ENDPOINTS.BY_CATEGORY(SettingCategory.SECURITY));
};

/**
 * Update security settings
 */
export const updateSecuritySettings = async (settings: Partial<SecuritySettings>): Promise<SecuritySettings> => {
  return apiPut<SecuritySettings>(SETTINGS_ENDPOINTS.BY_CATEGORY(SettingCategory.SECURITY), settings);
};

/**
 * Get notification settings
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  return apiGet<NotificationSettings>(SETTINGS_ENDPOINTS.BY_CATEGORY(SettingCategory.NOTIFICATION));
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
  return apiPut<NotificationSettings>(SETTINGS_ENDPOINTS.BY_CATEGORY(SettingCategory.NOTIFICATION), settings);
};

/**
 * Get staking settings
 */
export const getStakingSettings = async (): Promise<StakingSettings> => {
  return apiGet<StakingSettings>(SETTINGS_ENDPOINTS.BY_CATEGORY(SettingCategory.STAKING));
};

/**
 * Update staking settings
 */
export const updateStakingSettings = async (settings: Partial<StakingSettings>): Promise<StakingSettings> => {
  return apiPut<StakingSettings>(SETTINGS_ENDPOINTS.BY_CATEGORY(SettingCategory.STAKING), settings);
};

/**
 * Get crosschain settings
 */
export const getCrosschainSettings = async (): Promise<CrosschainSettings> => {
  return apiGet<CrosschainSettings>(SETTINGS_ENDPOINTS.BY_CATEGORY(SettingCategory.CROSSCHAIN));
};

/**
 * Update crosschain settings
 */
export const updateCrosschainSettings = async (settings: Partial<CrosschainSettings>): Promise<CrosschainSettings> => {
  return apiPut<CrosschainSettings>(SETTINGS_ENDPOINTS.BY_CATEGORY(SettingCategory.CROSSCHAIN), settings);
};

/**
 * Get DeFi settings
 */
export const getDefiSettings = async (): Promise<DefiSettings> => {
  return apiGet<DefiSettings>(SETTINGS_ENDPOINTS.BY_CATEGORY(SettingCategory.DEFI));
};

/**
 * Update DeFi settings
 */
export const updateDefiSettings = async (settings: Partial<DefiSettings>): Promise<DefiSettings> => {
  return apiPut<DefiSettings>(SETTINGS_ENDPOINTS.BY_CATEGORY(SettingCategory.DEFI), settings);
};

/**
 * Get dApp settings
 */
export const getDappSettings = async (): Promise<DappSettings> => {
  return apiGet<DappSettings>(SETTINGS_ENDPOINTS.BY_CATEGORY(SettingCategory.DAPP));
};

/**
 * Update dApp settings
 */
export const updateDappSettings = async (settings: Partial<DappSettings>): Promise<DappSettings> => {
  return apiPut<DappSettings>(SETTINGS_ENDPOINTS.BY_CATEGORY(SettingCategory.DAPP), settings);
};
