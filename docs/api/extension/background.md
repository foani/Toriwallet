# TORI Wallet 브라우저 확장 프로그램 - 백그라운드 스크립트 API

백그라운드 스크립트는 TORI Wallet 브라우저 확장 프로그램의 핵심 로직을 처리하는 부분입니다. 이 스크립트는 지갑 관리, 네트워크 연결, 트랜잭션 처리, 알림 관리 등의 기능을 담당합니다.

## 디렉토리 구조

```
background/
├── index.ts                # 백그라운드 스크립트 진입점
├── messageListener.ts      # 메시지 리스너
├── walletManager.ts        # 지갑 관리자
├── networkManager.ts       # 네트워크 관리자
└── notifications.ts        # 알림 시스템
```

## 모듈 설명

### `index.ts`

백그라운드 스크립트의 진입점으로, 필요한 모듈을 초기화하고 리스너를 설정합니다.

```typescript
import { initMessageListener } from './messageListener';
import { initWalletManager } from './walletManager';
import { initNetworkManager } from './networkManager';
import { initNotifications } from './notifications';
import { logger } from '../utils/logger';

/**
 * 백그라운드 스크립트 초기화 함수
 */
const initialize = async () => {
  try {
    logger.info('백그라운드 스크립트 초기화 시작');

    // 지갑 관리자 초기화
    await initWalletManager();
    
    // 네트워크 관리자 초기화
    await initNetworkManager();
    
    // 알림 시스템 초기화
    initNotifications();
    
    // 메시지 리스너 초기화
    initMessageListener();

    logger.info('백그라운드 스크립트 초기화 완료');
  } catch (error) {
    logger.error('백그라운드 스크립트 초기화 실패', error);
  }
};

// 초기화 실행
initialize();

// 설치 이벤트 리스너
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // 최초 설치 시 수행할 작업
    chrome.tabs.create({ url: 'popup.html#/welcome' });
  } else if (details.reason === 'update') {
    // 업데이트 시 수행할 작업
    logger.info(`확장 프로그램이 버전 ${chrome.runtime.getManifest().version}로 업데이트되었습니다.`);
  }
});

// 확장 프로그램 아이콘 클릭 이벤트 리스너
chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'popup.html' });
});
```

### `messageListener.ts`

팝업 UI 및 콘텐츠 스크립트로부터 오는 메시지를 처리하는 모듈입니다.

```typescript
import { logger } from '../utils/logger';
import { MessageType, ResponseType } from '../types/message';
import { handleWalletMessage } from './walletManager';
import { handleNetworkMessage } from './networkManager';
import { handleNotificationMessage } from './notifications';

/**
 * 메시지 리스너 초기화 함수
 */
export const initMessageListener = () => {
  logger.info('메시지 리스너 초기화');
  
  // 메시지 리스너 등록
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender).then(sendResponse);
    return true; // 비동기 응답을 위해 true 반환
  });
};

/**
 * 메시지 처리 함수
 * @param message 수신된 메시지
 * @param sender 메시지 발신자 정보
 * @returns 응답 객체
 */
const handleMessage = async (message: any, sender: chrome.runtime.MessageSender) => {
  try {
    logger.debug('메시지 수신', { message, sender });

    // 메시지 타입 확인
    if (!message || !message.type) {
      return createErrorResponse('유효하지 않은 메시지 형식');
    }

    // 메시지 종류에 따라 처리
    switch (message.type) {
      // 지갑 관련 메시지
      case MessageType.CREATE_WALLET:
      case MessageType.IMPORT_WALLET:
      case MessageType.UNLOCK_WALLET:
      case MessageType.LOCK_WALLET:
      case MessageType.GET_ACCOUNTS:
      case MessageType.GET_BALANCE:
      case MessageType.SIGN_TRANSACTION:
      case MessageType.SEND_TRANSACTION:
      case MessageType.SIGN_MESSAGE:
      case MessageType.EXPORT_PRIVATE_KEY:
      case MessageType.EXPORT_SEED_PHRASE:
        return await handleWalletMessage(message);

      // 네트워크 관련 메시지
      case MessageType.GET_NETWORKS:
      case MessageType.ADD_NETWORK:
      case MessageType.SWITCH_NETWORK:
      case MessageType.REMOVE_NETWORK:
        return await handleNetworkMessage(message);

      // 알림 관련 메시지
      case MessageType.SEND_NOTIFICATION:
      case MessageType.GET_NOTIFICATIONS:
      case MessageType.CLEAR_NOTIFICATIONS:
        return await handleNotificationMessage(message);

      // 알 수 없는 메시지 타입
      default:
        return createErrorResponse(`알 수 없는 메시지 타입: ${message.type}`);
    }
  } catch (error) {
    logger.error('메시지 처리 중 오류 발생', error);
    return createErrorResponse(error.message || '메시지 처리 중 오류 발생');
  }
};

/**
 * 성공 응답 생성 함수
 * @param data 응답 데이터
 * @returns 성공 응답 객체
 */
export const createSuccessResponse = (data: any) => {
  return {
    success: true,
    data,
    error: null,
  };
};

/**
 * 오류 응답 생성 함수
 * @param errorMessage 오류 메시지
 * @returns 오류 응답 객체
 */
export const createErrorResponse = (errorMessage: string) => {
  return {
    success: false,
    data: null,
    error: errorMessage,
  };
};
```

### `walletManager.ts`

지갑 관리와 관련된 기능을 처리하는 모듈입니다.

```typescript
import { logger } from '../utils/logger';
import { createSuccessResponse, createErrorResponse } from './messageListener';
import { MessageType } from '../types/message';
import { WalletService } from '../services/wallet-service';
import { TransactionService } from '../services/transaction-service';
import { StorageService } from '../services/storage-service';
import { KeyringService } from '../services/crypto/keyring';
import { EncryptionService } from '../services/crypto/encryption';

// 서비스 인스턴스
let walletService: WalletService;
let transactionService: TransactionService;
let storageService: StorageService;
let keyringService: KeyringService;
let encryptionService: EncryptionService;

/**
 * 지갑 관리자 초기화 함수
 */
export const initWalletManager = async () => {
  logger.info('지갑 관리자 초기화');
  
  // 스토리지 서비스 초기화
  storageService = new StorageService();
  
  // 암호화 서비스 초기화
  encryptionService = new EncryptionService();
  
  // 키링 서비스 초기화
  keyringService = new KeyringService(storageService, encryptionService);
  
  // 지갑 서비스 초기화
  walletService = new WalletService(keyringService, storageService);
  
  // 트랜잭션 서비스 초기화
  transactionService = new TransactionService(keyringService);
  
  // 지갑 상태 로드
  await loadWalletState();
};

/**
 * 지갑 상태 로드 함수
 */
const loadWalletState = async () => {
  try {
    // 지갑이 존재하는지 확인
    const hasWallet = await walletService.hasWallet();
    if (hasWallet) {
      logger.info('기존 지갑 발견');
    } else {
      logger.info('생성된 지갑 없음');
    }

    // 자동 잠금 타이머 설정
    setupAutoLockTimer();
  } catch (error) {
    logger.error('지갑 상태 로드 실패', error);
  }
};

/**
 * 자동 잠금 타이머 설정 함수
 */
const setupAutoLockTimer = () => {
  // 설정된 자동 잠금 시간 가져오기
  storageService.get('autoLockTime').then((time) => {
    if (time && time > 0) {
      // 타이머 설정
      setInterval(() => {
        // 마지막 활동 시간 확인
        storageService.get('lastActivityTime').then((lastActivityTime) => {
          const now = Date.now();
          if (lastActivityTime && now - lastActivityTime > time * 60 * 1000) {
            // 시간이 경과하면 지갑 잠금
            walletService.lockWallet();
            logger.info('자동 잠금 활성화');
          }
        });
      }, 60 * 1000); // 1분마다 확인
    }
  });
};

/**
 * 지갑 관련 메시지 처리 함수
 * @param message 수신된 메시지
 * @returns 응답 객체
 */
export const handleWalletMessage = async (message: any) => {
  try {
    // 메시지 타입에 따라 처리
    switch (message.type) {
      case MessageType.CREATE_WALLET:
        const { password, seedPhrase } = message.data;
        const newWallet = await walletService.createWallet(password, seedPhrase);
        return createSuccessResponse(newWallet);

      case MessageType.IMPORT_WALLET:
        const { importType, importData, importPassword } = message.data;
        const importedWallet = await walletService.importWallet(importType, importData, importPassword);
        return createSuccessResponse(importedWallet);

      case MessageType.UNLOCK_WALLET:
        const { unlockPassword } = message.data;
        const unlocked = await walletService.unlockWallet(unlockPassword);
        return createSuccessResponse(unlocked);

      case MessageType.LOCK_WALLET:
        await walletService.lockWallet();
        return createSuccessResponse(true);

      case MessageType.GET_ACCOUNTS:
        const accounts = await walletService.getAccounts();
        return createSuccessResponse(accounts);

      case MessageType.GET_BALANCE:
        const { address, network } = message.data;
        const balance = await walletService.getBalance(address, network);
        return createSuccessResponse(balance);

      case MessageType.SIGN_TRANSACTION:
        const { tx, from } = message.data;
        const signedTx = await transactionService.signTransaction(tx, from);
        return createSuccessResponse(signedTx);

      case MessageType.SEND_TRANSACTION:
        const { transaction } = message.data;
        const txHash = await transactionService.sendTransaction(transaction);
        return createSuccessResponse(txHash);

      case MessageType.SIGN_MESSAGE:
        const { msg, account } = message.data;
        const signature = await walletService.signMessage(msg, account);
        return createSuccessResponse(signature);

      case MessageType.EXPORT_PRIVATE_KEY:
        const { exportAddress, exportPasswordCheck } = message.data;
        const privateKey = await walletService.exportPrivateKey(exportAddress, exportPasswordCheck);
        return createSuccessResponse(privateKey);

      case MessageType.EXPORT_SEED_PHRASE:
        const { passwordCheck } = message.data;
        const seedPhrase = await walletService.exportSeedPhrase(passwordCheck);
        return createSuccessResponse(seedPhrase);

      default:
        return createErrorResponse(`지원하지 않는 지갑 메시지 타입: ${message.type}`);
    }
  } catch (error) {
    logger.error('지갑 메시지 처리 중 오류 발생', error);
    return createErrorResponse(error.message || '지갑 메시지 처리 중 오류 발생');
  }
};
```

### `networkManager.ts`

네트워크 관리와 관련된 기능을 처리하는 모듈입니다.

```typescript
import { logger } from '../utils/logger';
import { createSuccessResponse, createErrorResponse } from './messageListener';
import { MessageType } from '../types/message';
import { NetworkService } from '../services/api/network-service';
import { StorageService } from '../services/storage-service';
import { Network } from '../types/network';
import { NETWORKS } from '../constants/networks';

// 서비스 인스턴스
let networkService: NetworkService;
let storageService: StorageService;

/**
 * 네트워크 관리자 초기화 함수
 */
export const initNetworkManager = async () => {
  logger.info('네트워크 관리자 초기화');
  
  // 스토리지 서비스 초기화
  storageService = new StorageService();
  
  // 네트워크 서비스 초기화
  networkService = new NetworkService(storageService);
  
  // 네트워크 설정 로드
  await loadNetworkSettings();
};

/**
 * 네트워크 설정 로드 함수
 */
const loadNetworkSettings = async () => {
  try {
    // 사용자 정의 네트워크 로드
    const customNetworks = await networkService.getCustomNetworks();
    
    // 현재 선택된 네트워크 로드
    const currentNetwork = await networkService.getCurrentNetwork();
    
    logger.info('네트워크 설정 로드 완료', {
      customNetworksCount: customNetworks.length,
      currentNetwork: currentNetwork?.name || 'None'
    });
    
    // 현재 네트워크가 없으면 기본 네트워크 설정
    if (!currentNetwork) {
      await networkService.setCurrentNetwork(NETWORKS.CATENA_MAINNET);
      logger.info('기본 네트워크로 설정: Catena Mainnet');
    }
  } catch (error) {
    logger.error('네트워크 설정 로드 실패', error);
  }
};

/**
 * 네트워크 관련 메시지 처리 함수
 * @param message 수신된 메시지
 * @returns 응답 객체
 */
export const handleNetworkMessage = async (message: any) => {
  try {
    // 메시지 타입에 따라 처리
    switch (message.type) {
      case MessageType.GET_NETWORKS:
        const networks = await networkService.getAllNetworks();
        return createSuccessResponse(networks);

      case MessageType.ADD_NETWORK:
        const { network } = message.data;
        await validateNetwork(network);
        const addedNetwork = await networkService.addCustomNetwork(network);
        return createSuccessResponse(addedNetwork);

      case MessageType.SWITCH_NETWORK:
        const { networkId } = message.data;
        const selectedNetwork = await networkService.setCurrentNetwork(networkId);
        return createSuccessResponse(selectedNetwork);

      case MessageType.REMOVE_NETWORK:
        const { networkToRemove } = message.data;
        await networkService.removeCustomNetwork(networkToRemove);
        return createSuccessResponse(true);

      default:
        return createErrorResponse(`지원하지 않는 네트워크 메시지 타입: ${message.type}`);
    }
  } catch (error) {
    logger.error('네트워크 메시지 처리 중 오류 발생', error);
    return createErrorResponse(error.message || '네트워크 메시지 처리 중 오류 발생');
  }
};

/**
 * 네트워크 유효성 검증 함수
 * @param network 검증할 네트워크 객체
 * @throws 유효하지 않은 네트워크인 경우 예외 발생
 */
const validateNetwork = async (network: Network) => {
  // 필수 필드 확인
  if (!network.name || !network.rpcUrl || !network.chainId || !network.currencySymbol) {
    throw new Error('필수 네트워크 정보가 누락되었습니다.');
  }

  // 체인 ID 형식 확인
  if (typeof network.chainId !== 'number' && isNaN(parseInt(network.chainId as string))) {
    throw new Error('체인 ID는 숫자여야 합니다.');
  }

  // RPC URL 유효성 확인
  try {
    const response = await fetch(network.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'net_version',
        params: [],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error('RPC 엔드포인트에 연결할 수 없습니다.');
    }
  } catch (error) {
    throw new Error(`RPC 엔드포인트 연결 실패: ${error.message}`);
  }

  // 중복 체인 ID 확인
  const networks = await networkService.getAllNetworks();
  const existingNetwork = networks.find(n => n.chainId === network.chainId);
  
  if (existingNetwork && existingNetwork.name !== network.name) {
    throw new Error(`같은 체인 ID(${network.chainId})를 가진 네트워크가 이미 존재합니다: ${existingNetwork.name}`);
  }
};
```

### `notifications.ts`

알림 관리와 관련된 기능을 처리하는 모듈입니다.

```typescript
import { logger } from '../utils/logger';
import { createSuccessResponse, createErrorResponse } from './messageListener';
import { MessageType } from '../types/message';
import { StorageService } from '../services/storage-service';
import { Notification, NotificationType } from '../types/notification';

// 서비스 인스턴스
let storageService: StorageService;

/**
 * 알림 시스템 초기화 함수
 */
export const initNotifications = () => {
  logger.info('알림 시스템 초기화');
  
  // 스토리지 서비스 초기화
  storageService = new StorageService();
  
  // 브라우저 알림 권한 요청
  requestNotificationPermission();
};

/**
 * 브라우저 알림 권한 요청 함수
 */
const requestNotificationPermission = () => {
  if ('Notification' in window) {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        logger.info(`알림 권한 상태: ${permission}`);
      });
    }
  }
};

/**
 * 알림 관련 메시지 처리 함수
 * @param message 수신된 메시지
 * @returns 응답 객체
 */
export const handleNotificationMessage = async (message: any) => {
  try {
    // 메시지 타입에 따라 처리
    switch (message.type) {
      case MessageType.SEND_NOTIFICATION:
        const { notification } = message.data;
        await sendNotification(notification);
        return createSuccessResponse(true);

      case MessageType.GET_NOTIFICATIONS:
        const notifications = await getNotifications();
        return createSuccessResponse(notifications);

      case MessageType.CLEAR_NOTIFICATIONS:
        const { notificationIds } = message.data;
        await clearNotifications(notificationIds);
        return createSuccessResponse(true);

      default:
        return createErrorResponse(`지원하지 않는 알림 메시지 타입: ${message.type}`);
    }
  } catch (error) {
    logger.error('알림 메시지 처리 중 오류 발생', error);
    return createErrorResponse(error.message || '알림 메시지 처리 중 오류 발생');
  }
};

/**
 * 알림 보내기 함수
 * @param notification 알림 객체
 */
const sendNotification = async (notification: Notification) => {
  try {
    // 알림 ID 및 타임스탬프 할당
    const notificationWithId = {
      ...notification,
      id: notification.id || generateNotificationId(),
      timestamp: notification.timestamp || Date.now(),
    };

    // 알림 저장
    await storeNotification(notificationWithId);

    // 브라우저 알림 표시
    showBrowserNotification(notificationWithId);

    logger.info('알림 전송 완료', notificationWithId);
  } catch (error) {
    logger.error('알림 전송 실패', error);
    throw error;
  }
};

/**
 * 알림 ID 생성 함수
 * @returns 생성된 알림 ID
 */
const generateNotificationId = () => {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 알림 저장 함수
 * @param notification 저장할 알림 객체
 */
const storeNotification = async (notification: Notification) => {
  try {
    // 기존 알림 목록 가져오기
    const notifications = await getNotifications();
    
    // 새 알림 추가
    notifications.push(notification);
    
    // 알림 개수 제한 (최대 50개)
    if (notifications.length > 50) {
      notifications.sort((a, b) => b.timestamp - a.timestamp);
      notifications.splice(50);
    }
    
    // 저장
    await storageService.set('notifications', notifications);
  } catch (error) {
    logger.error('알림 저장 실패', error);
    throw error;
  }
};

/**
 * 브라우저 알림 표시 함수
 * @param notification 표시할 알림 객체
 */
const showBrowserNotification = (notification: Notification) => {
  // 브라우저 알림 기능 확인
  if ('Notification' in window && Notification.permission === 'granted') {
    // 알림 옵션 설정
    const options: any = {
      body: notification.message,
      icon: notification.icon || chrome.runtime.getURL('icons/icon-128.png'),
      silent: notification.silent || false,
    };
    
    // 알림 타입에 따른 추가 설정
    if (notification.type === NotificationType.TRANSACTION) {
      options.requireInteraction = true;
    }
    
    // 브라우저 알림 생성
    const browserNotification = new Notification(notification.title, options);
    
    // 알림 클릭 이벤트 처리
    browserNotification.onclick = () => {
      // 알림 관련 페이지로 이동
      if (notification.link) {
        chrome.tabs.create({ url: notification.link });
      } else {
        chrome.tabs.create({ url: 'popup.html#/notifications' });
      }
      browserNotification.close();
    };
  }
};

/**
 * 알림 목록 가져오기 함수
 * @returns 저장된 알림 목록
 */
const getNotifications = async (): Promise<Notification[]> => {
  try {
    // 저장된 알림 가져오기
    const notifications = await storageService.get('notifications');
    
    // 알림이 없으면 빈 배열 반환
    if (!notifications) {
      return [];
    }
    
    // 최신순 정렬
    return notifications.sort((a: Notification, b: Notification) => b.timestamp - a.timestamp);
  } catch (error) {
    logger.error('알림 조회 실패', error);
    throw error;
  }
};

/**
 * 알림 삭제 함수
 * @param notificationIds 삭제할 알림 ID 배열
 */
const clearNotifications = async (notificationIds: string[]) => {
  try {
    // 모든 알림 삭제인 경우
    if (!notificationIds || notificationIds.length === 0) {
      await storageService.set('notifications', []);
      logger.info('모든 알림 삭제 완료');
      return;
    }
    
    // 특정 알림만 삭제
    const notifications = await getNotifications();
    const remainingNotifications = notifications.filter((n) => !notificationIds.includes(n.id));
    await storageService.set('notifications', remainingNotifications);
    
    logger.info('선택된 알림 삭제 완료', { count: notificationIds.length });
  } catch (error) {
    logger.error('알림 삭제 실패', error);
    throw error;
  }
};
```

## 주요 API 인터페이스

### 지갑 관리

#### 지갑 생성

새로운 지갑을 생성합니다.

**매개변수:**
- `password` (string): 지갑 암호
- `seedPhrase` (string, optional): 선택적 시드 구문. 제공되지 않으면 새로 생성됩니다.

**반환값:**
- 생성된 지갑 정보 객체

#### 지갑 가져오기

기존 지갑을 가져옵니다.

**매개변수:**
- `importType` (string): 가져오기 유형 ('seedPhrase', 'privateKey', 'keystore')
- `importData` (string): 가져오기 데이터 (시드 구문, 개인 키 또는 키스토어 JSON)
- `importPassword` (string): 지갑 암호

**반환값:**
- 가져온 지갑 정보 객체

#### 지갑 잠금 해제

지갑 잠금을 해제합니다.

**매개변수:**
- `unlockPassword` (string): 지갑 암호

**반환값:**
- 잠금 해제 성공 여부 (boolean)

#### 지갑 잠금

지갑을 잠급니다.

**매개변수:** 없음

**반환값:**
- 잠금 성공 여부 (boolean)

### 트랜잭션 관리

#### 트랜잭션 서명

트랜잭션을 서명합니다.

**매개변수:**
- `tx` (object): 서명할 트랜잭션 객체
- `from` (string): 송신자 주소

**반환값:**
- 서명된 트랜잭션 문자열

#### 트랜잭션 전송

서명된 트랜잭션을 전송합니다.

**매개변수:**
- `transaction` (string): 서명된 트랜잭션

**반환값:**
- 트랜잭션 해시 (string)

### 네트워크 관리

#### 네트워크 목록 가져오기

사용 가능한 모든 네트워크 목록을 가져옵니다.

**매개변수:** 없음

**반환값:**
- 네트워크 객체 배열

#### 네트워크 추가

새 네트워크를 추가합니다.

**매개변수:**
- `network` (object): 추가할 네트워크 객체

**반환값:**
- 추가된 네트워크 객체

#### 네트워크 전환

현재 네트워크를 변경합니다.

**매개변수:**
- `networkId` (string): 전환할 네트워크 ID

**반환값:**
- 선택된 네트워크 객체

### 알림 관리

#### 알림 전송

새 알림을 전송합니다.

**매개변수:**
- `notification` (object): 전송할 알림 객체

**반환값:**
- 성공 여부 (boolean)

#### 알림 목록 가져오기

저장된 알림 목록을 가져옵니다.

**매개변수:** 없음

**반환값:**
- 알림 객체 배열

#### 알림 삭제

알림을 삭제합니다.

**매개변수:**
- `notificationIds` (string[]): 삭제할 알림 ID 배열

**반환값:**
- 성공 여부 (boolean)

## 오류 처리

백그라운드 스크립트에서는 다음과 같은 오류 처리 방식을 사용합니다:

1. **try-catch 블록**: 모든 주요 함수는 try-catch 블록으로 감싸져 있어 오류를 포착합니다.
2. **로깅**: 모든 오류는 로그에 기록됩니다.
3. **오류 응답**: 오류가 발생하면 `createErrorResponse` 함수를 사용하여 오류 응답을 생성합니다.
4. **사용자 알림**: 심각한 오류는 사용자에게 알림으로 표시됩니다.

## 보안 고려사항

백그라운드 스크립트에서는 다음과 같은 보안 방법을 사용합니다:

1. **민감한 데이터 암호화**: 개인 키, 시드 구문 등의 민감한 데이터는 항상 암호화하여 메모리에 저장합니다.
2. **자동 잠금**: 일정 시간 동안 활동이 없으면 지갑을 자동으로 잠급니다.
3. **메시지 검증**: 모든 수신 메시지의 형식과 내용을 검증합니다.
4. **네트워크 검증**: 사용자 정의 네트워크를 추가하기 전에 유효성을 검사합니다.
5. **트랜잭션 확인**: 모든 트랜잭션은 실행 전에 사용자 확인을 요구합니다.
