/**
 * 콘텐츠 스크립트
 * 
 * 웹 페이지에 주입되어 웹 페이지와 확장 프로그램 간의 통신을 중계합니다.
 * dApp과 지갑의 연결을 가능하게 합니다.
 */

import { injectProvider } from './injectProvider';
import { setupMessageHandler } from './messageHandler';
import { setupDomWatcher } from './domWatcher';

// 콘텐츠 스크립트가 이미 실행 중인지 확인 (중복 실행 방지)
if (!window.toriWalletContentScriptInjected) {
  console.log('TORI Wallet: 콘텐츠 스크립트 초기화 중...');
  
  // 글로벌 플래그 설정
  window.toriWalletContentScriptInjected = true;
  
  // 웹 페이지에 주입
  (async function initialize() {
    try {
      // Provider 주입
      await injectProvider();
      
      // 메시지 핸들러 설정
      setupMessageHandler();
      
      // DOM 변경 감지 (주소 및 QR 코드 감지)
      setupDomWatcher();
      
      console.log('TORI Wallet: 콘텐츠 스크립트 초기화 완료');
    } catch (error) {
      console.error('TORI Wallet: 콘텐츠 스크립트 초기화 실패', error);
    }
  })();
}

// TypeScript가 전역 속성을 인식할 수 있도록 확장
declare global {
  interface Window {
    toriWalletContentScriptInjected?: boolean;
    toriWallet?: any;
  }
}
