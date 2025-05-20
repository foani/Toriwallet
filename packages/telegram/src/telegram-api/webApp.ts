/**
 * 텔레그램 WebApp API 인터페이스 정의 및 래퍼 함수
 * 텔레그램 웹앱 API: https://core.telegram.org/bots/webapps
 */

// telegram-web-app.js에서 노출된 전역 객체에 대한 인터페이스
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
    auth_date: number;
    hash: string;
    start_param?: string;
    chat_type?: string;
    chat_instance?: string;
    can_send_after?: number;
  };
  version: string;
  platform: string;
  colorScheme: string;
  themeParams: {
    bg_color: string;
    text_color: string;
    hint_color: string;
    link_color: string;
    button_color: string;
    button_text_color: string;
    secondary_bg_color: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive: boolean): void;
    hideProgress(): void;
    setText(text: string): void;
    setParams(params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }): void;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  isVersionAtLeast(version: string): boolean;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  onEvent(eventType: string, eventHandler: (event: any) => void): void;
  offEvent(eventType: string, eventHandler: (event: any) => void): void;
  sendData(data: string): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: 'paid' | 'cancelled' | 'failed') => void): void;
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }, callback?: (buttonId: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  ready(): void;
  expand(): void;
  close(): void;
}

// 전역으로 사용 가능한 window.Telegram.WebApp 객체에 대한 인터페이스 확장
declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

// WebApp 객체 인스턴스 접근
export const getWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

// 유저 정보 가져오기
export const getUser = () => {
  const webApp = getWebApp();
  return webApp?.initDataUnsafe.user || null;
};

// 유저 ID 가져오기
export const getUserId = (): number | null => {
  const user = getUser();
  return user ? user.id : null;
};

// 테마 컬러 가져오기
export const getThemeParams = () => {
  const webApp = getWebApp();
  return webApp?.themeParams || null;
};

// 메인 버튼 설정 함수
export const setupMainButton = (
  text: string,
  onClick: () => void,
  options?: {
    color?: string;
    textColor?: string;
    showProgress?: boolean;
  }
) => {
  const webApp = getWebApp();
  if (!webApp) return;

  const { MainButton } = webApp;
  MainButton.setText(text);
  if (options?.color) {
    MainButton.color = options.color;
  }
  if (options?.textColor) {
    MainButton.textColor = options.textColor;
  }
  
  // 이전 핸들러가 있으면 제거
  MainButton.offClick(onClick);
  // 새 핸들러 등록
  MainButton.onClick(onClick);
  
  if (options?.showProgress) {
    MainButton.showProgress(true);
  } else {
    MainButton.hideProgress();
  }
  
  // 버튼 활성화 및 표시
  MainButton.enable();
  MainButton.show();
};

// 백 버튼 설정 함수
export const setupBackButton = (onClick: () => void) => {
  const webApp = getWebApp();
  if (!webApp) return;

  const { BackButton } = webApp;
  // 이전 핸들러가 있으면 제거
  BackButton.offClick(onClick);
  // 새 핸들러 등록
  BackButton.onClick(onClick);
  // 백 버튼 표시
  BackButton.show();
};

// 메인 버튼 숨기기
export const hideMainButton = () => {
  const webApp = getWebApp();
  if (!webApp) return;
  webApp.MainButton.hide();
};

// 백 버튼 숨기기
export const hideBackButton = () => {
  const webApp = getWebApp();
  if (!webApp) return;
  webApp.BackButton.hide();
};

// 햅틱 피드백 제공 함수
export const hapticFeedback = (type: 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
  const webApp = getWebApp();
  if (!webApp) return;

  if (['success', 'error', 'warning'].includes(type)) {
    webApp.HapticFeedback.notificationOccurred(type as 'success' | 'error' | 'warning');
  } else if (['light', 'medium', 'heavy', 'rigid', 'soft'].includes(type)) {
    webApp.HapticFeedback.impactOccurred(type as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft');
  }
};

// 팝업 표시 함수
export const showPopup = (
  message: string,
  title?: string,
  buttons?: Array<{
    id?: string;
    type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
    text: string;
  }>,
  callback?: (buttonId: string) => void
) => {
  const webApp = getWebApp();
  if (!webApp) return;

  webApp.showPopup(
    {
      title,
      message,
      buttons
    },
    callback
  );
};

// 알림 표시 함수
export const showAlert = (message: string, callback?: () => void) => {
  const webApp = getWebApp();
  if (!webApp) return;

  webApp.showAlert(message, callback);
};

// 확인 대화상자 표시 함수
export const showConfirm = (message: string, callback?: (confirmed: boolean) => void) => {
  const webApp = getWebApp();
  if (!webApp) return;

  webApp.showConfirm(message, callback);
};

// 링크 열기 함수
export const openLink = (url: string, tryInstantView?: boolean) => {
  const webApp = getWebApp();
  if (!webApp) {
    window.open(url, '_blank');
    return;
  }

  webApp.openLink(url, { try_instant_view: tryInstantView });
};

// 텔레그램 링크 열기 함수 (t.me 링크)
export const openTelegramLink = (url: string) => {
  const webApp = getWebApp();
  if (!webApp) {
    window.open(url, '_blank');
    return;
  }

  webApp.openTelegramLink(url);
};

// WebApp 준비 상태 알림 함수
export const ready = () => {
  const webApp = getWebApp();
  if (!webApp) return;

  webApp.ready();
};

// WebApp 최대화 함수
export const expand = () => {
  const webApp = getWebApp();
  if (!webApp) return;

  webApp.expand();
};

// WebApp 종료 함수
export const close = () => {
  const webApp = getWebApp();
  if (!webApp) return;

  webApp.close();
};

// 데이터 전송 함수
export const sendData = (data: string | object) => {
  const webApp = getWebApp();
  if (!webApp) return;
  
  // 객체인 경우 JSON 문자열로 변환
  const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
  webApp.sendData(dataStr);
};

// WebApp이 사용 가능한지 확인
export const isWebAppAvailable = (): boolean => {
  return !!getWebApp();
};

// 다크 모드 확인
export const isDarkMode = (): boolean => {
  const webApp = getWebApp();
  if (!webApp) return window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return webApp.colorScheme === 'dark';
};

// 모든 기능을 기본 내보내기로 묶어서 제공
export default {
  getWebApp,
  getUser,
  getUserId,
  getThemeParams,
  setupMainButton,
  setupBackButton,
  hideMainButton,
  hideBackButton,
  hapticFeedback,
  showPopup,
  showAlert,
  showConfirm,
  openLink,
  openTelegramLink,
  ready,
  expand,
  close,
  sendData,
  isWebAppAvailable,
  isDarkMode
};
