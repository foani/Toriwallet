/**
 * 텔레그램 알림 관리 모듈
 * 텔레그램 미니앱에서 사용자에게 알림을 보내고 관리하는 기능
 */
import axios from 'axios';
import { getWebApp } from './webApp';

// API 엔드포인트 설정
const API_BASE_URL = process.env.VITE_TELEGRAM_API_URL || 'https://api.example.com/telegram';

// 인증 헤더 생성
const getAuthHeaders = () => {
  const webApp = getWebApp();
  if (!webApp) return {};
  
  return {
    'X-Telegram-Init-Data': webApp.initData,
    'Content-Type': 'application/json'
  };
};

/**
 * 알림 유형 정의
 */
export enum NotificationType {
  TRANSACTION = 'transaction',
  PRICE_ALERT = 'price_alert',
  SECURITY = 'security',
  NEWS = 'news',
  SYSTEM = 'system'
}

/**
 * 알림 설정 가져오기
 */
export const getNotificationSettings = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: `${API_BASE_URL}/notifications/settings`,
      headers: getAuthHeaders()
    });
    
    return response.data.settings;
  } catch (error) {
    console.error('알림 설정 조회 실패:', error);
    throw error;
  }
};

/**
 * 알림 설정 업데이트하기
 * @param settings 알림 설정 객체
 */
export const updateNotificationSettings = async (settings: {
  transaction?: boolean;
  price_alert?: boolean;
  security?: boolean;
  news?: boolean;
  system?: boolean;
}) => {
  try {
    const response = await axios({
      method: 'POST',
      url: `${API_BASE_URL}/notifications/settings`,
      headers: getAuthHeaders(),
      data: settings
    });
    
    return response.data.success;
  } catch (error) {
    console.error('알림 설정 업데이트 실패:', error);
    throw error;
  }
};

/**
 * 가격 알림 생성하기
 * @param token 토큰 심볼 (예: CTA)
 * @param targetPrice 목표 가격
 * @param condition 조건 (above 또는 below)
 */
export const createPriceAlert = async (token: string, targetPrice: number, condition: 'above' | 'below') => {
  try {
    const response = await axios({
      method: 'POST',
      url: `${API_BASE_URL}/notifications/price-alert`,
      headers: getAuthHeaders(),
      data: {
        token,
        targetPrice,
        condition
      }
    });
    
    return response.data.alert;
  } catch (error) {
    console.error('가격 알림 생성 실패:', error);
    throw error;
  }
};

/**
 * 가격 알림 목록 가져오기
 */
export const getPriceAlerts = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: `${API_BASE_URL}/notifications/price-alerts`,
      headers: getAuthHeaders()
    });
    
    return response.data.alerts;
  } catch (error) {
    console.error('가격 알림 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 가격 알림 삭제하기
 * @param alertId 알림 ID
 */
export const deletePriceAlert = async (alertId: string) => {
  try {
    const response = await axios({
      method: 'DELETE',
      url: `${API_BASE_URL}/notifications/price-alert/${alertId}`,
      headers: getAuthHeaders()
    });
    
    return response.data.success;
  } catch (error) {
    console.error('가격 알림 삭제 실패:', error);
    throw error;
  }
};

/**
 * 사용자의 알림 내역 가져오기
 * @param page 페이지 번호
 * @param limit 페이지당 항목 수
 * @param type 알림 유형 (선택적)
 */
export const getNotificationHistory = async (page = 1, limit = 10, type?: NotificationType) => {
  try {
    let url = `${API_BASE_URL}/notifications/history?page=${page}&limit=${limit}`;
    if (type) {
      url += `&type=${type}`;
    }
    
    const response = await axios({
      method: 'GET',
      url,
      headers: getAuthHeaders()
    });
    
    return response.data.notifications;
  } catch (error) {
    console.error('알림 내역 조회 실패:', error);
    throw error;
  }
};

/**
 * 알림 읽음 표시하기
 * @param notificationId 알림 ID
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const response = await axios({
      method: 'POST',
      url: `${API_BASE_URL}/notifications/mark-read/${notificationId}`,
      headers: getAuthHeaders()
    });
    
    return response.data.success;
  } catch (error) {
    console.error('알림 읽음 표시 실패:', error);
    throw error;
  }
};

/**
 * 모든 알림 읽음 표시하기
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios({
      method: 'POST',
      url: `${API_BASE_URL}/notifications/mark-all-read`,
      headers: getAuthHeaders()
    });
    
    return response.data.success;
  } catch (error) {
    console.error('모든 알림 읽음 표시 실패:', error);
    throw error;
  }
};

export default {
  NotificationType,
  getNotificationSettings,
  updateNotificationSettings,
  createPriceAlert,
  getPriceAlerts,
  deletePriceAlert,
  getNotificationHistory,
  markNotificationAsRead,
  markAllNotificationsAsRead
};
