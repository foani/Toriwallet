/**
 * 알림 관리자
 * 
 * 확장 프로그램 내 알림 시스템을 관리합니다:
 * - 브라우저 알림 표시
 * - 인앱 알림 관리
 */

// 알림 타입
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  TRANSACTION = 'transaction',
  CONNECTION = 'connection'
}

// 알림 인터페이스
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

// 알림 저장소
let notifications: Notification[] = [];

/**
 * 알림 시스템 설정
 */
export const setupNotifications = () => {
  console.log('알림 시스템 초기화 중...');
  
  // 저장된 알림 로드
  loadNotifications();
  
  // 새 트랜잭션 이벤트 리스너
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TX_CONFIRMED' || message.type === 'TX_FAILED') {
      const txHash = message.data?.hash;
      const status = message.type === 'TX_CONFIRMED' ? '성공' : '실패';
      
      createNotification({
        type: message.type === 'TX_CONFIRMED' ? NotificationType.SUCCESS : NotificationType.ERROR,
        title: `트랜잭션 ${status}`,
        message: `트랜잭션 해시: ${txHash}`,
        actionUrl: message.data?.blockExplorerUrl
      });
      
      sendResponse({ success: true });
    }
    
    return true; // 비동기 응답을 위해 true 반환
  });
  
  console.log('알림 시스템 초기화 완료');
};

/**
 * 알림 생성
 */
export const createNotification = async (params: {
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}): Promise<Notification> => {
  const notification: Notification = {
    id: `notification-${Date.now()}`,
    type: params.type,
    title: params.title,
    message: params.message,
    timestamp: Date.now(),
    read: false,
    actionUrl: params.actionUrl
  };
  
  // 알림 목록에 추가
  notifications.unshift(notification);
  
  // 목록 최대 50개로 제한
  if (notifications.length > 50) {
    notifications = notifications.slice(0, 50);
  }
  
  // 알림 저장
  await saveNotifications();
  
  // 브라우저 알림 표시 (선택적)
  showBrowserNotification(notification);
  
  // 팝업이 열려있으면 알림 전파
  chrome.runtime.sendMessage({
    type: 'NOTIFICATION_CREATED',
    data: notification
  }).catch(() => {
    // 수신자가 없으면 무시 (팝업이 닫혀있는 경우)
  });
  
  return notification;
};

/**
 * 브라우저 알림 표시
 */
const showBrowserNotification = (notification: Notification) => {
  chrome.notifications.create(notification.id, {
    type: 'basic',
    iconUrl: '/icons/icon-128.png',
    title: notification.title,
    message: notification.message,
    priority: 2
  });
  
  // 알림 클릭 이벤트 리스너
  chrome.notifications.onClicked.addListener((notificationId) => {
    if (notificationId === notification.id && notification.actionUrl) {
      chrome.tabs.create({ url: notification.actionUrl });
    }
  });
};

/**
 * 모든 알림 가져오기
 */
export const getNotifications = async (): Promise<Notification[]> => {
  return notifications;
};

/**
 * 알림 읽음 표시
 */
export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  const notification = notifications.find(n => n.id === id);
  if (!notification) {
    return false;
  }
  
  notification.read = true;
  
  // 알림 저장
  await saveNotifications();
  
  return true;
};

/**
 * 모든 알림 읽음 표시
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  notifications.forEach(notification => {
    notification.read = true;
  });
  
  // 알림 저장
  await saveNotifications();
  
  return true;
};

/**
 * 알림 삭제
 */
export const deleteNotification = async (id: string): Promise<boolean> => {
  const initialLength = notifications.length;
  notifications = notifications.filter(n => n.id !== id);
  
  // 알림 저장
  await saveNotifications();
  
  return notifications.length < initialLength;
};

/**
 * 모든 알림 삭제
 */
export const clearAllNotifications = async (): Promise<boolean> => {
  notifications = [];
  
  // 알림 저장
  await saveNotifications();
  
  return true;
};

/**
 * 알림 저장
 */
const saveNotifications = async (): Promise<void> => {
  try {
    await chrome.storage.local.set({ notifications });
  } catch (error) {
    console.error('알림 저장 실패:', error);
  }
};

/**
 * 저장된 알림 로드
 */
const loadNotifications = async (): Promise<void> => {
  try {
    const result = await chrome.storage.local.get('notifications');
    if (result.notifications) {
      notifications = result.notifications;
    }
  } catch (error) {
    console.error('알림 로드 실패:', error);
  }
};
