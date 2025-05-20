/**
 * 메시지 리스너
 * 
 * 익스텐션의 다른 부분(팝업, 콘텐츠 스크립트, 인페이지 스크립트)과
 * 통신하기 위한 메시지 리스너를 설정합니다.
 */

import { handleWalletMessages } from './walletManager';
import { handleNetworkMessages } from './networkManager';

// 메시지 타입 정의
export enum MessageType {
  // 지갑 관련 메시지
  WALLET_CREATE = 'WALLET_CREATE',
  WALLET_IMPORT = 'WALLET_IMPORT',
  WALLET_GET_ACCOUNTS = 'WALLET_GET_ACCOUNTS',
  WALLET_SELECT_ACCOUNT = 'WALLET_SELECT_ACCOUNT',
  WALLET_LOCK = 'WALLET_LOCK',
  WALLET_UNLOCK = 'WALLET_UNLOCK',
  WALLET_GET_BALANCE = 'WALLET_GET_BALANCE',
  
  // 네트워크 관련 메시지
  NETWORK_GET_LIST = 'NETWORK_GET_LIST',
  NETWORK_SELECT = 'NETWORK_SELECT',
  NETWORK_ADD = 'NETWORK_ADD',
  NETWORK_REMOVE = 'NETWORK_REMOVE',
  
  // 트랜잭션 관련 메시지
  TX_CREATE = 'TX_CREATE',
  TX_SIGN = 'TX_SIGN',
  TX_SEND = 'TX_SEND',
  TX_GET_HISTORY = 'TX_GET_HISTORY',
  
  // dApp 관련 메시지
  DAPP_CONNECT = 'DAPP_CONNECT',
  DAPP_DISCONNECT = 'DAPP_DISCONNECT',
  DAPP_REQUEST_ACCOUNTS = 'DAPP_REQUEST_ACCOUNTS',
  DAPP_SIGN_MESSAGE = 'DAPP_SIGN_MESSAGE',
  DAPP_SIGN_TRANSACTION = 'DAPP_SIGN_TRANSACTION',
  DAPP_SEND_TRANSACTION = 'DAPP_SEND_TRANSACTION',
  
  // 기타 메시지
  GET_STATE = 'GET_STATE',
  NOTIFICATION = 'NOTIFICATION',
  ERROR = 'ERROR'
}

/**
 * 메시지 리스너 설정
 */
export const setupMessageListener = () => {
  // 확장 프로그램 내 메시지 리스너 (팝업 <-> 백그라운드)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender, sendResponse);
    return true; // 비동기 응답을 위해 true 반환
  });

  // 외부 연결 리스너 (콘텐츠 스크립트 <-> 백그라운드)
  chrome.runtime.onConnect.addListener((port) => {
    console.log(`포트 연결됨: ${port.name}`);
    
    port.onMessage.addListener((message) => {
      handlePortMessage(message, port);
    });
    
    port.onDisconnect.addListener(() => {
      console.log(`포트 연결 해제됨: ${port.name}`);
      // 필요한 정리 작업 수행
    });
  });
};

/**
 * 일반 메시지 핸들러
 */
const handleMessage = async (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  try {
    console.log('메시지 수신:', message);
    
    if (!message || !message.type) {
      throw new Error('유효하지 않은 메시지 형식');
    }
    
    let response;
    
    // 메시지 타입에 따라 적절한 핸들러로 라우팅
    if (message.type.startsWith('WALLET_')) {
      response = await handleWalletMessages(message);
    } else if (message.type.startsWith('NETWORK_')) {
      response = await handleNetworkMessages(message);
    } else if (message.type.startsWith('TX_')) {
      // 트랜잭션 메시지 핸들러 호출
      // response = await handleTransactionMessages(message);
      response = { error: '아직 구현되지 않음' };
    } else if (message.type.startsWith('DAPP_')) {
      // dApp 메시지 핸들러 호출
      // response = await handleDAppMessages(message);
      response = { error: '아직 구현되지 않음' };
    } else if (message.type === MessageType.GET_STATE) {
      // 상태 요청 처리
      response = await getState();
    } else {
      throw new Error(`알 수 없는 메시지 타입: ${message.type}`);
    }
    
    sendResponse({ success: true, data: response });
  } catch (error) {
    console.error('메시지 처리 오류:', error);
    sendResponse({ 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류' 
    });
  }
};

/**
 * 포트 메시지 핸들러
 */
const handlePortMessage = async (message: any, port: chrome.runtime.Port) => {
  try {
    console.log(`포트 ${port.name}에서 메시지 수신:`, message);
    
    if (!message || !message.type) {
      throw new Error('유효하지 않은 메시지 형식');
    }
    
    let response;
    
    // 메시지 타입에 따라 적절한 핸들러로 라우팅
    if (message.type.startsWith('DAPP_')) {
      // dApp 메시지 핸들러 호출
      // response = await handleDAppMessages(message);
      response = { error: '아직 구현되지 않음' };
    } else {
      throw new Error(`포트에서 지원되지 않는 메시지 타입: ${message.type}`);
    }
    
    port.postMessage({ id: message.id, success: true, data: response });
  } catch (error) {
    console.error('포트 메시지 처리 오류:', error);
    port.postMessage({ 
      id: message.id,
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류' 
    });
  }
};

/**
 * 현재 지갑 상태 조회
 */
const getState = async () => {
  // 필요한 상태 정보 수집 및 반환
  return {
    // 상태 정보
    initialized: true,
    // 추가 상태 정보...
  };
};
