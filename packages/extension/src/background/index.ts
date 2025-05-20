/**
 * 백그라운드 스크립트
 * 
 * 확장 프로그램의 메인 백그라운드 스크립트입니다.
 * 지갑 상태 관리, 암호화, 트랜잭션 서명 등의 핵심 기능을 처리합니다.
 */

import { setupMessageListener } from './messageListener';
import { initWalletManager } from './walletManager';
import { initNetworkManager } from './networkManager';
import { setupNotifications } from './notifications';

/**
 * 백그라운드 스크립트 초기화 함수
 */
const initialize = async () => {
  try {
    console.log('TORI Wallet: 백그라운드 스크립트 초기화 중...');
    
    // 네트워크 매니저 초기화
    await initNetworkManager();
    
    // 지갑 매니저 초기화
    await initWalletManager();
    
    // 메시지 리스너 설정
    setupMessageListener();
    
    // 알림 시스템 설정
    setupNotifications();
    
    console.log('TORI Wallet: 백그라운드 스크립트 초기화 완료');
  } catch (error) {
    console.error('TORI Wallet: 백그라운드 스크립트 초기화 실패', error);
  }
};

// 백그라운드 스크립트 실행
initialize();

// 확장 프로그램 설치/업데이트 이벤트 리스너
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('TORI Wallet이 설치되었습니다.');
    // 새 탭에서 온보딩 페이지 열기
    chrome.tabs.create({ url: 'onboarding.html' });
  } else if (details.reason === 'update') {
    console.log(`TORI Wallet이 버전 ${chrome.runtime.getManifest().version}로 업데이트되었습니다.`);
  }
});

// 브라우저 종료 시 리소스 정리
chrome.runtime.onSuspend.addListener(() => {
  console.log('TORI Wallet: 종료 중...');
  // 필요한 정리 작업 수행
});

// 서비스 워커 활성화 유지
chrome.runtime.onConnect.addListener(port => {
  port.onDisconnect.addListener(() => {
    console.log(`포트 ${port.name} 연결 해제됨`);
  });
});
