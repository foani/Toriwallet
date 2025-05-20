import { useState, useEffect, useCallback } from 'react';
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
import {
  getAllSettings,
  getSettingsByCategory,
  getSettingByKey,
  updateSetting,
  getGeneralSettings,
  updateGeneralSettings,
  getSecuritySettings,
  updateSecuritySettings,
  getNotificationSettings,
  updateNotificationSettings,
  getStakingSettings,
  updateStakingSettings,
  getCrosschainSettings,
  updateCrosschainSettings,
  getDefiSettings,
  updateDefiSettings,
  getDappSettings,
  updateDappSettings
} from '@/services/settings';
import { useNotification } from '@/context';

export const useSettings = () => {
  const [allSettings, setAllSettings] = useState<AllSettings | null>(null);
  const [categorySettings, setCategorySettings] = useState<Record<SettingCategory, Setting[]>>({
    [SettingCategory.GENERAL]: [],
    [SettingCategory.SECURITY]: [],
    [SettingCategory.NOTIFICATION]: [],
    [SettingCategory.STAKING]: [],
    [SettingCategory.CROSSCHAIN]: [],
    [SettingCategory.DEFI]: [],
    [SettingCategory.DAPP]: []
  });
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [stakingSettings, setStakingSettings] = useState<StakingSettings | null>(null);
  const [crosschainSettings, setCrosschainSettings] = useState<CrosschainSettings | null>(null);
  const [defiSettings, setDefiSettings] = useState<DefiSettings | null>(null);
  const [dappSettings, setDappSettings] = useState<DappSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<SettingCategory>(SettingCategory.GENERAL);

  const { showNotification } = useNotification();

  const fetchAllSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await getAllSettings();
      setAllSettings(settings);
      
      // 카테고리별 설정도 업데이트
      setGeneralSettings(settings.general);
      setSecuritySettings(settings.security);
      setNotificationSettings(settings.notification);
      setStakingSettings(settings.staking);
      setCrosschainSettings(settings.crosschain);
      setDefiSettings(settings.defi);
      setDappSettings(settings.dapp);
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '설정 정보 조회 실패', 
          description: error.message 
        });
      } else {
        setError('설정 정보를 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '설정 정보 조회 실패', 
          description: '설정 정보를 가져오는 중 오류가 발생했습니다.' 
        });
      }
    }
  }, [showNotification]);

  const fetchSettingsByCategory = useCallback(async (category: SettingCategory) => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await getSettingsByCategory(category);
      setCategorySettings((prev) => ({
        ...prev,
        [category]: settings
      }));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '카테고리 설정 조회 실패', 
          description: error.message 
        });
      } else {
        setError('카테고리 설정을 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '카테고리 설정 조회 실패', 
          description: '카테고리 설정을 가져오는 중 오류가 발생했습니다.' 
        });
      }
    }
  }, [showNotification]);

  const handleUpdateSetting = async (key: string, value: string | number | boolean | object) => {
    setLoading(true);
    setError(null);
    
    try {
      const data: SettingUpdateRequest = { value };
      const updatedSetting = await updateSetting(key, data);
      
      // 모든 설정 다시 불러오기
      await fetchAllSettings();
      
      setLoading(false);
      showNotification('success', { 
        title: '설정 업데이트 성공', 
        description: '설정이 성공적으로 업데이트되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '설정 업데이트 실패', 
          description: error.message 
        });
      } else {
        setError('설정을 업데이트하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '설정 업데이트 실패', 
          description: '설정을 업데이트하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleFetchGeneralSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await getGeneralSettings();
      setGeneralSettings(settings);
      setLoading(false);
      return settings;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '일반 설정 조회 실패', 
          description: error.message 
        });
      } else {
        setError('일반 설정을 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '일반 설정 조회 실패', 
          description: '일반 설정을 가져오는 중 오류가 발생했습니다.' 
        });
      }
      return null;
    }
  };

  const handleUpdateGeneralSettings = async (settings: Partial<GeneralSettings>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSettings = await updateGeneralSettings(settings);
      setGeneralSettings(updatedSettings);
      
      // 전체 설정 업데이트
      if (allSettings) {
        setAllSettings({
          ...allSettings,
          general: updatedSettings
        });
      }
      
      setLoading(false);
      showNotification('success', { 
        title: '일반 설정 업데이트 성공', 
        description: '일반 설정이 성공적으로 업데이트되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '일반 설정 업데이트 실패', 
          description: error.message 
        });
      } else {
        setError('일반 설정을 업데이트하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '일반 설정 업데이트 실패', 
          description: '일반 설정을 업데이트하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleFetchSecuritySettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await getSecuritySettings();
      setSecuritySettings(settings);
      setLoading(false);
      return settings;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '보안 설정 조회 실패', 
          description: error.message 
        });
      } else {
        setError('보안 설정을 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '보안 설정 조회 실패', 
          description: '보안 설정을 가져오는 중 오류가 발생했습니다.' 
        });
      }
      return null;
    }
  };

  const handleUpdateSecuritySettings = async (settings: Partial<SecuritySettings>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSettings = await updateSecuritySettings(settings);
      setSecuritySettings(updatedSettings);
      
      // 전체 설정 업데이트
      if (allSettings) {
        setAllSettings({
          ...allSettings,
          security: updatedSettings
        });
      }
      
      setLoading(false);
      showNotification('success', { 
        title: '보안 설정 업데이트 성공', 
        description: '보안 설정이 성공적으로 업데이트되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '보안 설정 업데이트 실패', 
          description: error.message 
        });
      } else {
        setError('보안 설정을 업데이트하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '보안 설정 업데이트 실패', 
          description: '보안 설정을 업데이트하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleFetchNotificationSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await getNotificationSettings();
      setNotificationSettings(settings);
      setLoading(false);
      return settings;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '알림 설정 조회 실패', 
          description: error.message 
        });
      } else {
        setError('알림 설정을 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '알림 설정 조회 실패', 
          description: '알림 설정을 가져오는 중 오류가 발생했습니다.' 
        });
      }
      return null;
    }
  };

  const handleUpdateNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSettings = await updateNotificationSettings(settings);
      setNotificationSettings(updatedSettings);
      
      // 전체 설정 업데이트
      if (allSettings) {
        setAllSettings({
          ...allSettings,
          notification: updatedSettings
        });
      }
      
      setLoading(false);
      showNotification('success', { 
        title: '알림 설정 업데이트 성공', 
        description: '알림 설정이 성공적으로 업데이트되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '알림 설정 업데이트 실패', 
          description: error.message 
        });
      } else {
        setError('알림 설정을 업데이트하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '알림 설정 업데이트 실패', 
          description: '알림 설정을 업데이트하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleFetchStakingSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await getStakingSettings();
      setStakingSettings(settings);
      setLoading(false);
      return settings;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '스테이킹 설정 조회 실패', 
          description: error.message 
        });
      } else {
        setError('스테이킹 설정을 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '스테이킹 설정 조회 실패', 
          description: '스테이킹 설정을 가져오는 중 오류가 발생했습니다.' 
        });
      }
      return null;
    }
  };

  const handleUpdateStakingSettings = async (settings: Partial<StakingSettings>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSettings = await updateStakingSettings(settings);
      setStakingSettings(updatedSettings);
      
      // 전체 설정 업데이트
      if (allSettings) {
        setAllSettings({
          ...allSettings,
          staking: updatedSettings
        });
      }
      
      setLoading(false);
      showNotification('success', { 
        title: '스테이킹 설정 업데이트 성공', 
        description: '스테이킹 설정이 성공적으로 업데이트되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '스테이킹 설정 업데이트 실패', 
          description: error.message 
        });
      } else {
        setError('스테이킹 설정을 업데이트하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '스테이킹 설정 업데이트 실패', 
          description: '스테이킹 설정을 업데이트하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleFetchCrosschainSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await getCrosschainSettings();
      setCrosschainSettings(settings);
      setLoading(false);
      return settings;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '크로스체인 설정 조회 실패', 
          description: error.message 
        });
      } else {
        setError('크로스체인 설정을 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '크로스체인 설정 조회 실패', 
          description: '크로스체인 설정을 가져오는 중 오류가 발생했습니다.' 
        });
      }
      return null;
    }
  };

  const handleUpdateCrosschainSettings = async (settings: Partial<CrosschainSettings>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSettings = await updateCrosschainSettings(settings);
      setCrosschainSettings(updatedSettings);
      
      // 전체 설정 업데이트
      if (allSettings) {
        setAllSettings({
          ...allSettings,
          crosschain: updatedSettings
        });
      }
      
      setLoading(false);
      showNotification('success', { 
        title: '크로스체인 설정 업데이트 성공', 
        description: '크로스체인 설정이 성공적으로 업데이트되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '크로스체인 설정 업데이트 실패', 
          description: error.message 
        });
      } else {
        setError('크로스체인 설정을 업데이트하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '크로스체인 설정 업데이트 실패', 
          description: '크로스체인 설정을 업데이트하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleFetchDefiSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await getDefiSettings();
      setDefiSettings(settings);
      setLoading(false);
      return settings;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: 'DeFi 설정 조회 실패', 
          description: error.message 
        });
      } else {
        setError('DeFi 설정을 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: 'DeFi 설정 조회 실패', 
          description: 'DeFi 설정을 가져오는 중 오류가 발생했습니다.' 
        });
      }
      return null;
    }
  };

  const handleUpdateDefiSettings = async (settings: Partial<DefiSettings>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSettings = await updateDefiSettings(settings);
      setDefiSettings(updatedSettings);
      
      // 전체 설정 업데이트
      if (allSettings) {
        setAllSettings({
          ...allSettings,
          defi: updatedSettings
        });
      }
      
      setLoading(false);
      showNotification('success', { 
        title: 'DeFi 설정 업데이트 성공', 
        description: 'DeFi 설정이 성공적으로 업데이트되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: 'DeFi 설정 업데이트 실패', 
          description: error.message 
        });
      } else {
        setError('DeFi 설정을 업데이트하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: 'DeFi 설정 업데이트 실패', 
          description: 'DeFi 설정을 업데이트하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleFetchDappSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await getDappSettings();
      setDappSettings(settings);
      setLoading(false);
      return settings;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: 'dApp 설정 조회 실패', 
          description: error.message 
        });
      } else {
        setError('dApp 설정을 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: 'dApp 설정 조회 실패', 
          description: 'dApp 설정을 가져오는 중 오류가 발생했습니다.' 
        });
      }
      return null;
    }
  };

  const handleUpdateDappSettings = async (settings: Partial<DappSettings>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSettings = await updateDappSettings(settings);
      setDappSettings(updatedSettings);
      
      // 전체 설정 업데이트
      if (allSettings) {
        setAllSettings({
          ...allSettings,
          dapp: updatedSettings
        });
      }
      
      setLoading(false);
      showNotification('success', { 
        title: 'dApp 설정 업데이트 성공', 
        description: 'dApp 설정이 성공적으로 업데이트되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: 'dApp 설정 업데이트 실패', 
          description: error.message 
        });
      } else {
        setError('dApp 설정을 업데이트하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: 'dApp 설정 업데이트 실패', 
          description: 'dApp 설정을 업데이트하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleChangeActiveCategory = (category: SettingCategory) => {
    setActiveCategory(category);
  };

  useEffect(() => {
    fetchAllSettings();
  }, [fetchAllSettings]);

  return {
    allSettings,
    categorySettings,
    generalSettings,
    securitySettings,
    notificationSettings,
    stakingSettings,
    crosschainSettings,
    defiSettings,
    dappSettings,
    loading,
    error,
    activeCategory,
    fetchAllSettings,
    fetchSettingsByCategory,
    updateSetting: handleUpdateSetting,
    fetchGeneralSettings: handleFetchGeneralSettings,
    updateGeneralSettings: handleUpdateGeneralSettings,
    fetchSecuritySettings: handleFetchSecuritySettings,
    updateSecuritySettings: handleUpdateSecuritySettings,
    fetchNotificationSettings: handleFetchNotificationSettings,
    updateNotificationSettings: handleUpdateNotificationSettings,
    fetchStakingSettings: handleFetchStakingSettings,
    updateStakingSettings: handleUpdateStakingSettings,
    fetchCrosschainSettings: handleFetchCrosschainSettings,
    updateCrosschainSettings: handleUpdateCrosschainSettings,
    fetchDefiSettings: handleFetchDefiSettings,
    updateDefiSettings: handleUpdateDefiSettings,
    fetchDappSettings: handleFetchDappSettings,
    updateDappSettings: handleUpdateDappSettings,
    changeActiveCategory: handleChangeActiveCategory
  };
};
