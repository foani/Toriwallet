/**
 * Provider 주입
 * 
 * 웹 페이지에 웹3 프로바이더를 주입합니다.
 * 이를 통해 웹사이트와 dApp이 TORI 지갑과 상호작용할 수 있습니다.
 */

/**
 * inpage.js 스크립트를 웹 페이지에 주입
 */
export const injectProvider = async (): Promise<boolean> => {
  try {
    // 이미 주입되었는지 확인
    if (window.toriWallet) {
      console.log('TORI Wallet 프로바이더가 이미 주입되었습니다');
      return true;
    }
    
    // inpage.js 스크립트 요소 생성
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inpage.js');
    script.type = 'text/javascript';
    script.onload = () => {
      // 스크립트 로드 후 삭제 (코드는 이미 실행됨)
      script.remove();
    };
    
    // document head에 스크립트 추가
    (document.head || document.documentElement).appendChild(script);
    
    // 프로바이더 주입 완료 확인을 위한 대기
    await waitForProvider();
    
    console.log('TORI Wallet 프로바이더가 성공적으로 주입되었습니다');
    return true;
  } catch (error) {
    console.error('TORI Wallet 프로바이더 주입 실패:', error);
    return false;
  }
};

/**
 * 웹 페이지에 프로바이더가 주입될 때까지 대기
 */
const waitForProvider = async (): Promise<void> => {
  // 최대 5초 동안 대기
  const maxAttempts = 50; // 100ms 간격으로 최대 50회 시도
  
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkProvider = () => {
      attempts++;
      
      if (window.toriWallet) {
        // 프로바이더가 주입됨
        resolve();
      } else if (attempts >= maxAttempts) {
        // 최대 시도 횟수 초과
        reject(new Error('프로바이더 주입 시간 초과'));
      } else {
        // 다시 시도
        setTimeout(checkProvider, 100);
      }
    };
    
    checkProvider();
  });
};
