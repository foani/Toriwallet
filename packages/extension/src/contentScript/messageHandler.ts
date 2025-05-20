/**
 * 메시지 핸들러
 * 
 * 웹 페이지(inpage.js)와 백그라운드 스크립트 간의 메시지를 처리합니다.
 * dApp의 요청을 백그라운드 스크립트로 전달하고, 결과를 다시 웹 페이지로 반환합니다.
 */

// 메시지 타입 정의
export enum MessageType {
  // dApp 관련 메시지
  CONNECT_REQUEST = 'CONNECT_REQUEST',
  REQUEST_ACCOUNTS = 'REQUEST_ACCOUNTS',
  SIGN_MESSAGE = 'SIGN_MESSAGE',
  SIGN_TRANSACTION = 'SIGN_TRANSACTION',
  SEND_TRANSACTION = 'SEND_TRANSACTION',
  
  // 응답 메시지
  RESPONSE = 'RESPONSE',
  ERROR = 'ERROR'
}

// 메시지 포트 및 리스너 저장
let port: chrome.runtime.Port | null = null;
const pendingRequests = new Map<string, (response: any) => void>();

/**
 * 메시지 핸들러 설정
 */
export const setupMessageHandler = (): void => {
  // 웹 페이지(inpage.js)에서 콘텐츠 스크립트로의 메시지 리스너
  window.addEventListener('message', onWindowMessage);
  
  // 백그라운드 스크립트로의 연결 설정
  connectToBackground();
};

/**
 * 백그라운드 스크립트에 연결
 */
const connectToBackground = (): void => {
  // 이미 연결된 경우 기존 연결 해제
  if (port) {
    port.disconnect();
  }
  
  // 새로운 연결 설정
  port = chrome.runtime.connect({ name: 'tori-wallet-content-script' });
  
  // 백그라운드 스크립트에서의 메시지 리스너
  port.onMessage.addListener(onBackgroundMessage);
  
  // 연결 해제 리스너
  port.onDisconnect.addListener(() => {
    console.log('TORI Wallet: 백그라운드 스크립트와의 연결이 해제되었습니다');
    port = null;
    
    // 연결 종료 시 모든 대기 중인 요청에 오류 응답
    pendingRequests.forEach((callback) => {
      callback({ error: '확장 프로그램 연결이 해제되었습니다' });
    });
    pendingRequests.clear();
    
    // 연결 재시도
    setTimeout(connectToBackground, 1000);
  });
};

/**
 * 웹 페이지(inpage.js)에서 오는 메시지 처리
 */
const onWindowMessage = (event: MessageEvent): void => {
  // 다른 출처의 메시지 무시
  if (event.source !== window) {
    return;
  }
  
  const message = event.data;
  
  // TORI 지갑 메시지가 아닌 경우 무시
  if (!message || message.target !== 'TORI_CONTENT_SCRIPT') {
    return;
  }
  
  console.log('TORI Wallet: 웹 페이지에서 메시지 수신', message);
  
  // 메시지 타입에 따라 처리
  switch (message.type) {
    case MessageType.CONNECT_REQUEST:
    case MessageType.REQUEST_ACCOUNTS:
    case MessageType.SIGN_MESSAGE:
    case MessageType.SIGN_TRANSACTION:
    case MessageType.SEND_TRANSACTION:
      // 요청을 백그라운드 스크립트로 전달
      forwardRequestToBackground(message);
      break;
      
    default:
      console.warn('TORI Wallet: 알 수 없는 메시지 타입', message.type);
  }
};

/**
 * 백그라운드 스크립트에서 오는 메시지 처리
 */
const onBackgroundMessage = (message: any): void => {
  console.log('TORI Wallet: 백그라운드 스크립트에서 메시지 수신', message);
  
  // 요청 ID가 있는 경우 해당 요청 콜백 호출
  if (message.id && pendingRequests.has(message.id)) {
    const callback = pendingRequests.get(message.id)!;
    pendingRequests.delete(message.id);
    callback(message);
    return;
  }
  
  // 요청 ID가 없거나 매칭되는 요청이 없는 경우: 브로드캐스트 메시지로 처리
  forwardMessageToPage(message);
};

/**
 * 요청을 백그라운드 스크립트로 전달
 */
const forwardRequestToBackground = (message: any): void => {
  if (!port) {
    console.error('TORI Wallet: 백그라운드 스크립트와 연결되지 않았습니다');
    
    // 웹 페이지에 오류 전달
    window.postMessage({
      target: 'TORI_INPAGE',
      type: MessageType.ERROR,
      id: message.id,
      error: '지갑 확장 프로그램과 연결할 수 없습니다'
    }, '*');
    
    return;
  }
  
  // 요청 ID가 있는 경우 콜백 등록
  if (message.id) {
    pendingRequests.set(message.id, (response: any) => {
      // 응답을 웹 페이지로 전달
      window.postMessage({
        target: 'TORI_INPAGE',
        ...response
      }, '*');
    });
  }
  
  // 요청 전달
  port.postMessage({
    source: 'tori-wallet-content-script',
    ...message
  });
};

/**
 * 메시지를 웹 페이지로 전달
 */
const forwardMessageToPage = (message: any): void => {
  window.postMessage({
    target: 'TORI_INPAGE',
    ...message
  }, '*');
};
