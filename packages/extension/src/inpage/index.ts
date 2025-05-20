/**
 * 인페이지 스크립트
 * 
 * 웹 페이지에 주입되어 dApp과 TORI 지갑 간의 통신을 가능하게 합니다.
 * 이더리움과 호환되는 API를 제공하여 기존 dApp과의 호환성을 보장합니다.
 */

import { ToriProvider } from './provider';
import { setupMessageBridge } from './messageBridge';
import { EthereumProvider } from './ethereum';

// 글로벌 상태
let initialized = false;

// 인페이지 스크립트 초기화
const initialize = (): void => {
  if (initialized) {
    return;
  }
  
  try {
    console.log('TORI Wallet: 인페이지 스크립트 초기화 중...');
    
    // 메시지 브릿지 설정
    const messageBridge = setupMessageBridge();
    
    // TORI 프로바이더 인스턴스 생성
    const toriProvider = new ToriProvider(messageBridge);
    
    // 이더리움 호환 프로바이더 생성
    const ethProvider = new EthereumProvider(toriProvider);
    
    // window 객체에 프로바이더 주입
    injectProviders(toriProvider, ethProvider);
    
    initialized = true;
    console.log('TORI Wallet: 인페이지 스크립트 초기화 완료');
  } catch (error) {
    console.error('TORI Wallet: 인페이지 스크립트 초기화 실패', error);
  }
};

// 프로바이더 주입
const injectProviders = (toriProvider: ToriProvider, ethProvider: EthereumProvider): void => {
  // TORI 프로바이더 주입
  (window as any).toriWallet = toriProvider;
  
  // 이더리움 호환 프로바이더 주입
  const ethereum = (window as any).ethereum;
  
  if (!ethereum) {
    // 이더리움 프로바이더가 없는 경우 주입
    (window as any).ethereum = ethProvider;
  } else {
    console.log('TORI Wallet: 기존 이더리움 프로바이더 감지됨, 기능 확장');
    
    // 기존 프로바이더 속성 복사
    for (const key in ethereum) {
      if (!(key in ethProvider)) {
        (ethProvider as any)[key] = ethereum[key];
      }
    }
    
    // 확장된 프로바이더로 교체
    (window as any).ethereum = ethProvider;
  }
  
  // isMetaMask 플래그 설정 (MetaMask 호환성)
  (window as any).ethereum.isMetaMask = true;
  
  // 주입 완료 이벤트 발생
  window.dispatchEvent(new Event('toriWalletInjected'));
  window.dispatchEvent(new Event('ethereum#initialized'));
};

// 초기화 실행
initialize();

// 페이지 리로드 시 스크립트가 다시 주입되도록 초기화 플래그 관리
window.addEventListener('beforeunload', () => {
  initialized = false;
});
