import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 알림 타입 정의
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 알림 아이템 타입 정의
export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  link?: string;
  data?: any;
}

// 알림 설정 타입 정의
export interface NotificationSettings {
  enabled: boolean;
  pushEnabled: boolean;
  priceAlerts: boolean;
  transactionAlerts: boolean;
  stakingAlerts: boolean;
  newsAlerts: boolean;
  marketingAlerts: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

// 알림 상태 타입 정의
export interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  settings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
}

// 알림 컨텍스트 값 타입 정의
interface NotificationContextValue extends NotificationState {
  showNotification: (
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    data?: any
  ) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

// 기본 알림 설정
const defaultSettings: NotificationSettings = {
  enabled: true,
  pushEnabled: Platform.OS !== 'web',
  priceAlerts: true,
  transactionAlerts: true,
  stakingAlerts: true,
  newsAlerts: false,
  marketingAlerts: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

// 기본 알림 상태
const defaultNotificationState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  settings: defaultSettings,
  isLoading: true,
  error: null,
};

// 컨텍스트 생성
export const NotificationContext = createContext<NotificationContextValue>({
  ...defaultNotificationState,
  showNotification: () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  deleteAllNotifications: async () => {},
  updateSettings: async () => {},
  refreshNotifications: async () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * 앱 내 알림을 관리하는 프로바이더 컴포넌트
 * 
 * 앱 내 토스트 메시지, 저장된 알림 목록, 푸시 알림 설정 등을
 * 관리하고 앱 전체에서 알림 관련 기능을 제공합니다.
 * 
 * @param children 프로바이더 내부에 렌더링될 컴포넌트
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notificationState, setNotificationState] = useState<NotificationState>(defaultNotificationState);

  // 알림 데이터 로드
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem('@notifications');
        const storedSettings = await AsyncStorage.getItem('@notification_settings');
        
        let notifications: NotificationItem[] = [];
        let settings = defaultSettings;
        
        if (storedNotifications) {
          notifications = JSON.parse(storedNotifications);
        }
        
        if (storedSettings) {
          settings = { ...defaultSettings, ...JSON.parse(storedSettings) };
        }
        
        const unreadCount = notifications.filter(n => !n.read).length;
        
        setNotificationState({
          notifications,
          unreadCount,
          settings,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotificationState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load notifications',
        }));
      }
    };
    
    loadNotifications();
  }, []);

  // 새 알림 생성 및 표시
  const showNotification = (
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    data?: any
  ) => {
    const newNotification: NotificationItem = {
      id: `notification-${Date.now()}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      link,
      data,
    };
    
    setNotificationState(prev => {
      const updatedNotifications = [newNotification, ...prev.notifications];
      
      // 알림 저장 (비동기로 처리하고 오류는 무시)
      AsyncStorage.setItem('@notifications', JSON.stringify(updatedNotifications))
        .catch(err => console.error('Failed to save notification:', err));
      
      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount: prev.unreadCount + 1,
      };
    });
    
    // 여기서 토스트 메시지 표시 또는 푸시 알림 처리를 추가할 수 있음
    // Toast.show({ ... }) 또는 PushNotification.localNotification({ ... })
  };

  // 알림을 읽음으로 표시
  const markAsRead = async (id: string) => {
    try {
      setNotificationState(prev => {
        const updatedNotifications = prev.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        );
        
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        
        // 읽음 상태 저장
        AsyncStorage.setItem('@notifications', JSON.stringify(updatedNotifications))
          .catch(err => console.error('Failed to update notification:', err));
        
        return {
          ...prev,
          notifications: updatedNotifications,
          unreadCount,
        };
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      setNotificationState(prev => ({
        ...prev,
        error: 'Failed to update notification',
      }));
    }
  };

  // 모든 알림을 읽음으로 표시
  const markAllAsRead = async () => {
    try {
      setNotificationState(prev => {
        const updatedNotifications = prev.notifications.map(n => ({ ...n, read: true }));
        
        // 읽음 상태 저장
        AsyncStorage.setItem('@notifications', JSON.stringify(updatedNotifications))
          .catch(err => console.error('Failed to update notifications:', err));
        
        return {
          ...prev,
          notifications: updatedNotifications,
          unreadCount: 0,
        };
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      setNotificationState(prev => ({
        ...prev,
        error: 'Failed to update notifications',
      }));
    }
  };

  // 알림 삭제
  const deleteNotification = async (id: string) => {
    try {
      setNotificationState(prev => {
        const updatedNotifications = prev.notifications.filter(n => n.id !== id);
        const deletedNotification = prev.notifications.find(n => n.id === id);
        const unreadCount = deletedNotification?.read ? prev.unreadCount : prev.unreadCount - 1;
        
        // 삭제된 알림 목록 저장
        AsyncStorage.setItem('@notifications', JSON.stringify(updatedNotifications))
          .catch(err => console.error('Failed to delete notification:', err));
        
        return {
          ...prev,
          notifications: updatedNotifications,
          unreadCount: Math.max(0, unreadCount),
        };
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      setNotificationState(prev => ({
        ...prev,
        error: 'Failed to delete notification',
      }));
    }
  };

  // 모든 알림 삭제
  const deleteAllNotifications = async () => {
    try {
      setNotificationState(prev => {
        // 알림 목록 초기화
        AsyncStorage.setItem('@notifications', JSON.stringify([]))
          .catch(err => console.error('Failed to delete all notifications:', err));
        
        return {
          ...prev,
          notifications: [],
          unreadCount: 0,
        };
      });
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      setNotificationState(prev => ({
        ...prev,
        error: 'Failed to delete notifications',
      }));
    }
  };

  // 알림 설정 업데이트
  const updateSettings = async (settings: Partial<NotificationSettings>) => {
    try {
      setNotificationState(prev => {
        const updatedSettings = { ...prev.settings, ...settings };
        
        // 설정 저장
        AsyncStorage.setItem('@notification_settings', JSON.stringify(updatedSettings))
          .catch(err => console.error('Failed to update notification settings:', err));
        
        return {
          ...prev,
          settings: updatedSettings,
        };
      });
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      setNotificationState(prev => ({
        ...prev,
        error: 'Failed to update notification settings',
      }));
    }
  };

  // 알림 목록 새로고침
  const refreshNotifications = async () => {
    try {
      // 실제 구현에서는 서버에서 새 알림을 가져오는 로직이 추가될 수 있음
      // 현재는 로컬 저장소에서 가져오는 것으로 시뮬레이션
      setNotificationState(prev => ({
        ...prev,
        isLoading: true,
      }));
      
      const storedNotifications = await AsyncStorage.getItem('@notifications');
      let notifications: NotificationItem[] = [];
      
      if (storedNotifications) {
        notifications = JSON.parse(storedNotifications);
      }
      
      const unreadCount = notifications.filter(n => !n.read).length;
      
      setNotificationState(prev => ({
        ...prev,
        notifications,
        unreadCount,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
      setNotificationState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to refresh notifications',
      }));
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        ...notificationState,
        showNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        updateSettings,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
