import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

/**
 * 알림 관련 기능을 사용하기 위한 훅
 * 
 * 이 훅은 NotificationContext를 통해 알림 상태와 알림 관련 함수들을 제공합니다.
 * 앱 내 알림 표시, 알림 목록 관리, 알림 설정 등의 기능을 사용할 수 있습니다.
 * 
 * @returns {Object} 알림 상태와 알림 관련 함수들
 * @returns {Array} notifications - 알림 목록
 * @returns {number} unreadCount - 읽지 않은 알림 개수
 * @returns {Object} settings - 알림 설정
 * @returns {boolean} isLoading - 알림 로딩 중 여부
 * @returns {string|null} error - 오류 메시지
 * @returns {Function} showNotification - 알림 표시 함수
 * @returns {Function} markAsRead - 알림을 읽음으로 표시하는 함수
 * @returns {Function} markAllAsRead - 모든 알림을 읽음으로 표시하는 함수
 * @returns {Function} deleteNotification - 알림 삭제 함수
 * @returns {Function} deleteAllNotifications - 모든 알림 삭제 함수
 * @returns {Function} updateSettings - 알림 설정 업데이트 함수
 * @returns {Function} refreshNotifications - 알림 목록 새로고침 함수
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};
