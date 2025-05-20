import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 푸시 알림 유형 정의
export enum NotificationType {
  TRANSACTION = 'transaction',
  PRICE_ALERT = 'price_alert',
  STAKING_REWARD = 'staking_reward',
  SECURITY_ALERT = 'security_alert',
  NEWS = 'news',
  MARKETING = 'marketing',
}

// 푸시 알림 설정 인터페이스
export interface NotificationSettings {
  enabled: boolean;
  pushEnabled: boolean;
  priceAlerts: boolean;
  transactionAlerts: boolean;
  stakingAlerts: boolean;
  securityAlerts: boolean;
  newsAlerts: boolean;
  marketingAlerts: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

// 푸시 알림 데이터 인터페이스
export interface PushNotificationData {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  timestamp: number;
}

// 기본 알림 설정
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  pushEnabled: Platform.OS !== 'web',
  priceAlerts: true,
  transactionAlerts: true,
  stakingAlerts: true,
  securityAlerts: true,
  newsAlerts: false,
  marketingAlerts: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

/**
 * 푸시 알림 서비스
 * 
 * 앱 내 알림 및 푸시 알림 관련 기능을 관리하는 서비스 클래스입니다.
 * 알림 설정, 토큰 관리, 알림 전송 등의 기능을 제공합니다.
 * 
 * 참고: 이 구현은 기본적인 구조만 제공하며,
 * 실제 푸시 알림 구현을 위해서는 Firebase Cloud Messaging(FCM)이나
 * Apple Push Notification Service(APNS) 등의 서비스와 연동이 필요합니다.
 */
class NotificationService {
  private fcmToken?: string;
  private settings: NotificationSettings = DEFAULT_NOTIFICATION_SETTINGS;
  private isInitialized = false;
  
  /**
   * 알림 서비스 초기화
   * @returns {Promise<void>}
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // 저장된 설정 불러오기
      await this.loadSettings();
      
      // 푸시 알림 허용 상태 확인 및 설정
      if (this.settings.pushEnabled) {
        await this.requestPermissions();
      }
      
      // FCM 토큰 로드 (실제 구현에서 사용)
      await this.loadFCMToken();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      throw error;
    }
  }
  
  /**
   * 알림 설정 로드
   * @returns {Promise<void>}
   */
  private async loadSettings(): Promise<void> {
    try {
      const settingsJson = await AsyncStorage.getItem('@notification_settings');
      
      if (settingsJson) {
        this.settings = {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          ...JSON.parse(settingsJson),
        };
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      this.settings = DEFAULT_NOTIFICATION_SETTINGS;
    }
  }
  
  /**
   * 알림 설정 저장
   * @returns {Promise<void>}
   */
  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        '@notification_settings',
        JSON.stringify(this.settings)
      );
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }
  
  /**
   * FCM 토큰 로드
   * @returns {Promise<void>}
   */
  private async loadFCMToken(): Promise<void> {
    // 실제 구현에서는 Firebase Messaging에서 토큰을 가져옴
    // 현재는 더미 구현
    try {
      const token = await AsyncStorage.getItem('@fcm_token');
      if (token) {
        this.fcmToken = token;
      } else {
        // 실제로는 Firebase 또는 다른 푸시 서비스에서 토큰 생성
        // messaging().getToken() 등을 사용
        const newToken = 'dummy-fcm-token-' + Date.now();
        await this.saveFCMToken(newToken);
      }
    } catch (error) {
      console.error('Failed to load FCM token:', error);
    }
  }
  
  /**
   * FCM 토큰 저장
   * @param {string} token FCM 토큰
   * @returns {Promise<void>}
   */
  private async saveFCMToken(token: string): Promise<void> {
    try {
      this.fcmToken = token;
      await AsyncStorage.setItem('@fcm_token', token);
      
      // 토큰을 백엔드 서버에 등록하는 로직 (실제 구현에서 추가)
      // await this.registerTokenWithServer(token);
    } catch (error) {
      console.error('Failed to save FCM token:', error);
    }
  }
  
  /**
   * 알림 권한 요청
   * @returns {Promise<boolean>} 권한 승인 여부
   */
  async requestPermissions(): Promise<boolean> {
    // 실제 구현에서는 플랫폼별 알림 권한 요청 로직 추가
    // iOS, Android 등에 따라 다른 방식으로 구현 필요
    try {
      // 예시: Firebase Messaging 권한 요청
      // const authStatus = await messaging().requestPermission();
      // const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      //                authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      // 현재는 더미 구현
      const enabled = true;
      
      // 설정 업데이트
      this.settings.pushEnabled = enabled;
      await this.saveSettings();
      
      return enabled;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      this.settings.pushEnabled = false;
      await this.saveSettings();
      return false;
    }
  }
  
  /**
   * 알림 설정 가져오기
   * @returns {NotificationSettings} 현재 알림 설정
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }
  
  /**
   * 알림 설정 업데이트
   * @param {Partial<NotificationSettings>} newSettings 새 알림 설정
   * @returns {Promise<void>}
   */
  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    try {
      // 이전 푸시 허용 상태
      const wasPushEnabled = this.settings.pushEnabled;
      
      // 설정 업데이트
      this.settings = {
        ...this.settings,
        ...newSettings,
      };
      
      // 설정 저장
      await this.saveSettings();
      
      // 푸시 허용 상태가 변경된 경우 처리
      if (!wasPushEnabled && this.settings.pushEnabled) {
        await this.requestPermissions();
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      throw error;
    }
  }
  
  /**
   * 로컬 알림 전송
   * @param {string} title 알림 제목
   * @param {string} body 알림 내용
   * @param {NotificationType} type 알림 유형
   * @param {Record<string, any>} data 추가 데이터
   * @returns {Promise<void>}
   */
  async showLocalNotification(
    title: string,
    body: string,
    type: NotificationType,
    data?: Record<string, any>
  ): Promise<void> {
    // 알림이 비활성화되어 있으면 표시하지 않음
    if (!this.settings.enabled) return;
    
    // 알림 유형별 설정 확인
    if (
      (type === NotificationType.PRICE_ALERT && !this.settings.priceAlerts) ||
      (type === NotificationType.TRANSACTION && !this.settings.transactionAlerts) ||
      (type === NotificationType.STAKING_REWARD && !this.settings.stakingAlerts) ||
      (type === NotificationType.NEWS && !this.settings.newsAlerts) ||
      (type === NotificationType.MARKETING && !this.settings.marketingAlerts)
    ) {
      return;
    }
    
    try {
      // 실제 구현에서는 로컬 알림 라이브러리 사용 (예: react-native-notifications)
      // NotificationsIOS.localNotification({
      //   alertBody: body,
      //   alertTitle: title,
      //   userInfo: { type, ...data },
      //   soundName: this.settings.soundEnabled ? 'default' : null,
      // });
      
      // 현재는 콘솔 출력으로 시뮬레이션
      console.log(`[Local Notification] ${title}: ${body}`);
      
      // 알림 로컬 저장
      await this.saveNotificationToStorage({
        id: `local-${Date.now()}`,
        title,
        body,
        type,
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to show local notification:', error);
    }
  }
  
  /**
   * 알림 내역 저장
   * @param {PushNotificationData} notification 알림 데이터
   * @returns {Promise<void>}
   */
  private async saveNotificationToStorage(
    notification: PushNotificationData
  ): Promise<void> {
    try {
      // 저장된 알림 내역 가져오기
      const storedNotificationsJson = await AsyncStorage.getItem('@notifications');
      const storedNotifications: PushNotificationData[] = storedNotificationsJson
        ? JSON.parse(storedNotificationsJson)
        : [];
      
      // 새 알림 추가
      const updatedNotifications = [notification, ...storedNotifications];
      
      // 최대 100개까지만 저장 (오래된 알림 삭제)
      const trimmedNotifications = updatedNotifications.slice(0, 100);
      
      // 저장
      await AsyncStorage.setItem(
        '@notifications',
        JSON.stringify(trimmedNotifications)
      );
    } catch (error) {
      console.error('Failed to save notification to storage:', error);
    }
  }
  
  /**
   * 저장된 알림 내역 가져오기
   * @returns {Promise<PushNotificationData[]>} 알림 내역 목록
   */
  async getNotificationHistory(): Promise<PushNotificationData[]> {
    try {
      const storedNotificationsJson = await AsyncStorage.getItem('@notifications');
      return storedNotificationsJson ? JSON.parse(storedNotificationsJson) : [];
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return [];
    }
  }
  
  /**
   * 특정 알림 삭제
   * @param {string} notificationId 삭제할 알림 ID
   * @returns {Promise<void>}
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotificationHistory();
      const updatedNotifications = notifications.filter(
        (notification) => notification.id !== notificationId
      );
      
      await AsyncStorage.setItem(
        '@notifications',
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }
  
  /**
   * 모든 알림 삭제
   * @returns {Promise<void>}
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem('@notifications', JSON.stringify([]));
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      throw error;
    }
  }
  
  /**
   * 가격 알림 생성
   * @param {string} token 토큰 심볼
   * @param {string} price 가격
   * @param {string} condition 조건 ('above' | 'below')
   * @returns {Promise<string>} 알림 ID
   */
  async createPriceAlert(
    token: string,
    price: string,
    condition: 'above' | 'below'
  ): Promise<string> {
    try {
      // 현재는 더미 구현
      const alertId = `price-alert-${Date.now()}`;
      
      // 알림 설정 저장 (실제 구현에서는 더 복잡한 로직이 필요)
      const priceAlerts = await this.getPriceAlerts();
      priceAlerts.push({
        id: alertId,
        token,
        price,
        condition,
        createdAt: Date.now(),
      });
      
      await AsyncStorage.setItem(
        '@price_alerts',
        JSON.stringify(priceAlerts)
      );
      
      return alertId;
    } catch (error) {
      console.error('Failed to create price alert:', error);
      throw error;
    }
  }
  
  /**
   * 가격 알림 목록 가져오기
   * @returns {Promise<Array<{id: string, token: string, price: string, condition: string, createdAt: number}>>} 가격 알림 목록
   */
  async getPriceAlerts(): Promise<
    Array<{
      id: string;
      token: string;
      price: string;
      condition: 'above' | 'below';
      createdAt: number;
    }>
  > {
    try {
      const alertsJson = await AsyncStorage.getItem('@price_alerts');
      return alertsJson ? JSON.parse(alertsJson) : [];
    } catch (error) {
      console.error('Failed to get price alerts:', error);
      return [];
    }
  }
  
  /**
   * 가격 알림 삭제
   * @param {string} alertId 알림 ID
   * @returns {Promise<void>}
   */
  async deletePriceAlert(alertId: string): Promise<void> {
    try {
      const alerts = await this.getPriceAlerts();
      const updatedAlerts = alerts.filter((alert) => alert.id !== alertId);
      
      await AsyncStorage.setItem(
        '@price_alerts',
        JSON.stringify(updatedAlerts)
      );
    } catch (error) {
      console.error('Failed to delete price alert:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export default new NotificationService();
