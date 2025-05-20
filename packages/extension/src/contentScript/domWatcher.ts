/**
 * DOM 감시자
 * 
 * 웹 페이지의 DOM을 감시하여 특정 패턴(암호화폐 주소, QR 코드 등)을 감지합니다.
 * 감지된 요소에 대한 추가 기능을 제공합니다.
 */

/**
 * DOM 감시자 설정
 */
export const setupDomWatcher = (): void => {
  console.log('TORI Wallet: DOM 감시자 설정 중...');
  
  // 초기 스캔
  scanForAddresses();
  
  // MutationObserver를 사용하여 DOM 변경 감지
  const observer = new MutationObserver((mutations) => {
    // 일정 시간 동안 여러 변경 사항을 한 번에 처리하기 위한 디바운싱
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      scanForAddresses();
    }, 1000);
  });
  
  // 전체 문서 관찰
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  console.log('TORI Wallet: DOM 감시자 설정 완료');
};

// 디바운싱을 위한 타이머
let debounceTimer: number;

/**
 * 페이지에서 암호화폐 주소 스캔
 */
const scanForAddresses = (): void => {
  try {
    // 텍스트 노드에서 주소 패턴 검색
    findAddressesInTextNodes();
    
    // QR 코드 이미지 검색
    findQRCodes();
  } catch (error) {
    console.error('TORI Wallet: DOM 스캔 중 오류', error);
  }
};

/**
 * 텍스트 노드에서 암호화폐 주소 패턴 찾기
 */
const findAddressesInTextNodes = (): void => {
  // 이미 처리된 노드를 기록하기 위한 Set
  const processedNodes = new Set<Node>();
  
  // 텍스트 노드를 재귀적으로 스캔하는 함수
  const scanNode = (node: Node): void => {
    // 이미 처리된 노드인 경우 건너뛰기
    if (processedNodes.has(node)) {
      return;
    }
    
    // 텍스트 노드인 경우
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      // Ethereum 주소 패턴 (0x로 시작하는 40자 16진수)
      const ethAddressPattern = /\b(0x[a-fA-F0-9]{40})\b/g;
      const nodeText = node.textContent;
      let match;
      
      while ((match = ethAddressPattern.exec(nodeText)) !== null) {
        const address = match[1];
        wrapAddressWithAction(node, address, match.index, ethAddressPattern.lastIndex);
      }
      
      // Bitcoin 주소 패턴 (1, 3, bc1로 시작하는 주소)
      // 다른 블록체인 주소 패턴도 필요에 따라 추가...
      
      // 처리된 노드로 표시
      processedNodes.add(node);
    }
    
    // 자식 노드들을 재귀적으로 스캔
    for (let i = 0; i < node.childNodes.length; i++) {
      scanNode(node.childNodes[i]);
    }
  };
  
  // body부터 스캔 시작
  if (document.body) {
    scanNode(document.body);
  }
};

/**
 * 주소에 액션 기능 추가
 */
const wrapAddressWithAction = (
  textNode: Node,
  address: string,
  startIndex: number,
  endIndex: number
): void => {
  // 텍스트 노드의 부모 요소
  const parent = textNode.parentNode;
  if (!parent) return;
  
  // 특정 요소(input, textarea, pre 등) 내부는 처리하지 않음
  const nodeName = parent.nodeName.toLowerCase();
  if (['input', 'textarea', 'pre', 'code', 'script', 'style', 'a'].includes(nodeName)) {
    return;
  }
  
  // 이미 처리된 주소인지 확인
  const isAlreadyProcessed = parent.classList?.contains('tori-wallet-address');
  if (isAlreadyProcessed) {
    return;
  }
  
  try {
    // 텍스트 노드를 3개로 분할: 주소 이전, 주소, 주소 이후
    const before = textNode.textContent!.substring(0, startIndex);
    const addressText = textNode.textContent!.substring(startIndex, endIndex);
    const after = textNode.textContent!.substring(endIndex);
    
    // 원본 텍스트 노드 제거
    parent.removeChild(textNode);
    
    // 주소 이전 텍스트
    if (before) {
      parent.appendChild(document.createTextNode(before));
    }
    
    // 주소를 포함하는 span 요소 생성
    const addressSpan = document.createElement('span');
    addressSpan.textContent = addressText;
    addressSpan.className = 'tori-wallet-address';
    addressSpan.style.cursor = 'pointer';
    addressSpan.style.position = 'relative';
    
    // 호버 시 툴팁 표시
    addressSpan.addEventListener('mouseenter', (event) => {
      const tooltip = document.createElement('div');
      tooltip.textContent = 'TORI 지갑으로 보내기';
      tooltip.className = 'tori-wallet-tooltip';
      tooltip.style.position = 'absolute';
      tooltip.style.top = '-25px';
      tooltip.style.left = '0';
      tooltip.style.backgroundColor = '#333';
      tooltip.style.color = '#fff';
      tooltip.style.padding = '3px 8px';
      tooltip.style.borderRadius = '4px';
      tooltip.style.fontSize = '12px';
      tooltip.style.zIndex = '10000';
      addressSpan.appendChild(tooltip);
    });
    
    // 호버 종료 시 툴팁 제거
    addressSpan.addEventListener('mouseleave', () => {
      const tooltip = addressSpan.querySelector('.tori-wallet-tooltip');
      if (tooltip) {
        addressSpan.removeChild(tooltip);
      }
    });
    
    // 클릭 시 지갑 실행
    addressSpan.addEventListener('click', () => {
      // 지갑 팝업 열기 요청
      chrome.runtime.sendMessage({
        type: 'OPEN_WALLET_WITH_ADDRESS',
        data: { address }
      });
    });
    
    // 주소 span 추가
    parent.appendChild(addressSpan);
    
    // 주소 이후 텍스트
    if (after) {
      parent.appendChild(document.createTextNode(after));
    }
  } catch (error) {
    console.error('TORI Wallet: 주소 래핑 중 오류', error);
  }
};

/**
 * QR 코드 이미지 찾기
 */
const findQRCodes = (): void => {
  // QR 코드 감지는 이미지 분석이 필요하며 복잡할 수 있으므로
  // 일반적인 DOM 조작으로는 어렵습니다.
  // 필요한 경우 외부 라이브러리나 API를 활용해야 할 수 있습니다.
  
  // 현재는 구현하지 않고 향후 개발 예정으로 표시합니다.
  console.log('TORI Wallet: QR 코드 감지 기능은 아직 구현되지 않았습니다');
};
