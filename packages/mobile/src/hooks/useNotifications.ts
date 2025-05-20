import { useEffect, useState, useCallback } from 'react';
import NotificationService, {
  NotificationSettings,
  NotificationType,
  PushNotificationData,
} from '../services/NotificationService';

/**
 * 푸시 알림 기능을 사용하기 위한 훅
 * 
 * 이 훅은 알림 서비스를 통해 푸시 알림 관련 기능을 쉽게 사용할 수 있게 해줍니다.
 * 
 * @returns {Object} 알림 관련 상태와 함수들
 * @returns {NotificationSettings} settings - 알림 설정
 * @returns {PushNotificationData[]} notifications - 알림 내역
 * @returns {boolean} isLoading - 로딩 상태
 * @returns {Function} updateSettings - 알림 설정 업데이트 함수
 * @returns {Function} showNotification - 로컬 알림 표시 함수
 * @returns {Function} createPriceAlert - 가격 알림 생성 함수
 * @returns {Function} getPriceAlerts - 가격 알림 목록 가져오기 함수
 * @returns {Function} deletePriceAlert - 가격 알림 삭제 함수
 * @returns {Function} deleteNotification - 알림 삭제 함수
 * @returns {Function} clearAllNotifications - 모든 알림 삭제 함수
 * @returns {Function} refreshNotifications - 알림 내역 새로고침 함수
 */
export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>(
    NotificationService.getSettings()
  );
  const [notifications, setNotifications] = useState<PushNotificationData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 초기화 및 알림 내역 로드
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await NotificationService.initialize();
        
        // 설정 및 알림 내역 로드
        setSettings(NotificationService.getSettings());
        const history = await NotificationService.getNotificationHistory();
        setNotifications(history);
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);
  
  // 알림 설정 업데이트
  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>) => {
      try {
        await NotificationService.updateSettings(newSettings);
        setSettings(NotificationService.getSettings());
      } catch (error) {
        console.error('Failed to update notification settings:', error);
        throw error;
      }
    },
    []
  );
  
  // 로컬 알림 표시
  const showNotification = useCallback(
    async (
      title: string,
      body: string,
      type: NotificationType,
      data?: Record<string, any>
    ) => {
      try {
        await NotificationService.showLocalNotification(title, body, type, data);
        // 알림 내역 새로고침
        refreshNotifications();
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    },
    []
  );
  
  // 가격 알림 생성
  const createPriceAlert = useCallback(
    async (token: string, price: string, condition: 'above' | 'below') => {
      try {
        return await NotificationService.createPriceAlert(token, price, condition);
      } catch (error) {
        console.error('Failed to create price alert:', error);
        throw error;
      }
    },
    []
  );
  
  // 가격 알림 목록 가져오기
  const getPriceAlerts = useCallback(async () => {
    try {
      return await NotificationService.getPriceAlerts();
    } catch (error) {
      console.error('Failed to get price alerts:', error);
      return [];
    }
  }, []);
  
  // 가격 알림 삭제
  const deletePriceAlert = useCallback(async (alertId: string) => {
    try {
      await NotificationService.deletePriceAlert(alertId);
    } catch (error) {
      console.error('Failed to delete price alert:', error);
      throw error;
    }
  }, []);
  
  // 알림 삭제
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await NotificationService.deleteNotification(notificationId);
        // 알림 내역 새로고침
        refreshNotifications();
      } catch (error) {
        console.error('Failed to delete notification:', error);
        throw error;
      }
    },
    []
  );
  
  // 모든 알림 삭제
  const clearAllNotifications = useCallback(async () => {
    try {
      await NotificationService.clearAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      throw error;
    }
  }, []);
  
  // 알림 내역 새로고침
  const refreshNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const history = await NotificationService.getNotificationHistory();
      setNotifications(history);
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    settings,
    notifications,
    isLoading,
    updateSettings,
    showNotification,
    createPriceAlert,
    getPriceAlerts,
    deletePriceAlert,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications,
  };
};
