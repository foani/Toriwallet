# Preload API

## 개요

Preload 스크립트는 Electron 애플리케이션에서 Main Process와 Renderer Process 사이의 안전한 브릿지 역할을 합니다. 이 스크립트는 Node.js 환경과 브라우저 환경 모두에 접근할 수 있어, Main Process의 기능을 Renderer Process에 안전하게 노출할 수 있습니다.

TORI 지갑의 Preload 스크립트는 다음과 같은 역할을 수행합니다:

1. **IPC 통신 채널 제공**: Renderer Process가 Main Process와 통신할 수 있는 안전한 방법 제공
2. **제한된 Node.js API 노출**: 필요한 Node.js 기능만 선택적으로 노출
3. **보안 강화**: contextBridge를 통해 샌드박스 환경에서 안전한 API 제공

## 주요 모듈

### index.ts

Preload 스크립트의 진입점으로, 초기화 및 API 노출을 담당합니다.

```typescript
/**
 * Preload 스크립트 엔트리 포인트
 * contextBridge를 통해 Renderer Process에 노출할 API를 설정합니다.
 */
```

#### 주요 함수 및 초기화 코드

```typescript
/**
 * Preload 스크립트 초기화 함수
 * API 등록 및 이벤트 리스너 설정
 */
function initialize(): void;

// window 객체가 정의되어 있고 process.contextIsolated가 true인 경우에만 API 노출
if (process.contextIsolated) {
  try {
    // API 등록
    initialize();
  } catch (error) {
    console.error('Preload 스크립트 초기화 오류:', error);
  }
}
```

### api.ts

Renderer Process에 노출할 API를 정의하는 모듈입니다.

```typescript
/**
 * Renderer Process에 노출할 API 정의 모듈
 * IPC 통신, 시스템 유틸리티, 파일 시스템 접근 등의 API를 정의합니다.
 */
```

#### 노출된 API 객체 및 함수

```typescript
/**
 * 노출된 API 객체
 * Renderer Process에서 window.toriAPI로 접근 가능
 */
export const toriAPI = {
  // 버전 정보
  version: {
    /**
     * 앱 버전을 가져옵니다.
     * @returns 현재 앱 버전
     */
    getAppVersion: () => app.getVersion(),
    
    /**
     * 빌드 정보를 가져옵니다.
     * @returns 빌드 번호 및 정보
     */
    getBuildInfo: () => ({
      buildNumber: process.env.BUILD_NUMBER || 'dev',
      buildDate: process.env.BUILD_DATE || new Date().toISOString()
    })
  },
  
  // 지갑 관련 API
  wallet: {
    /**
     * 새 지갑을 생성합니다.
     * @param password 지갑 암호
     * @returns 생성된 지갑 정보 및 시드 구문
     */
    create: (password: string) => ipcRenderer.invoke('wallet:create', password),
    
    /**
     * 기존 지갑을 가져옵니다.
     * @param params 가져오기 파라미터 (시드 구문, 키스토어 등)
     * @returns 가져온 지갑 정보
     */
    import: (params: WalletImportParams) => ipcRenderer.invoke('wallet:import', params),
    
    /**
     * 지갑 데이터를 내보냅니다.
     * @param password 지갑 암호
     * @returns 내보내기 결과
     */
    exportData: (password: string) => ipcRenderer.invoke('wallet:export-data', password),
    
    /**
     * 지갑 데이터를 가져옵니다.
     * @param path 파일 경로
     * @param password 지갑 암호
     * @returns 가져오기 결과
     */
    importData: (path: string, password: string) => 
      ipcRenderer.invoke('wallet:import-data', { path, password }),
    
    /**
     * 지갑을 백업합니다.
     * @returns 백업 결과
     */
    backup: () => ipcRenderer.invoke('wallet:backup'),
    
    /**
     * 계정 목록을 가져옵니다.
     * @returns 계정 목록
     */
    getAccounts: () => ipcRenderer.invoke('wallet:get-accounts'),
    
    /**
     * 새 계정을 생성합니다.
     * @param name 계정 이름
     * @returns 생성된 계정 정보
     */
    createAccount: (name: string) => ipcRenderer.invoke('wallet:create-account', name),
    
    /**
     * 계정을 삭제합니다.
     * @param address 계정 주소
     * @returns 삭제 결과
     */
    removeAccount: (address: string) => ipcRenderer.invoke('wallet:remove-account', address),
    
    /**
     * 계정 이름을 변경합니다.
     * @param address 계정 주소
     * @param name 새 이름
     * @returns 변경 결과
     */
    renameAccount: (address: string, name: string) => 
      ipcRenderer.invoke('wallet:rename-account', { address, name }),
    
    /**
     * 계정 잔액을 가져옵니다.
     * @param address 계정 주소
     * @param networkId 네트워크 ID
     * @returns 계정 잔액
     */
    getBalance: (address: string, networkId: string) => 
      ipcRenderer.invoke('wallet:get-balance', { address, networkId }),
    
    /**
     * 트랜잭션 내역을 가져옵니다.
     * @param address 계정 주소
     * @param networkId 네트워크 ID
     * @param page 페이지 번호
     * @param limit 항목 수 제한
     * @returns 트랜잭션 내역
     */
    getTransactions: (address: string, networkId: string, page: number, limit: number) => 
      ipcRenderer.invoke('wallet:get-transactions', { address, networkId, page, limit })
  },
  
  // 네트워크 관련 API
  network: {
    /**
     * 지원되는 네트워크 목록을 가져옵니다.
     * @returns 네트워크 목록
     */
    getNetworks: () => ipcRenderer.invoke('network:get-networks'),
    
    /**
     * 사용자 정의 네트워크를 추가합니다.
     * @param network 네트워크 정보
     * @returns 추가 결과
     */
    addNetwork: (network: NetworkInfo) => ipcRenderer.invoke('network:add-network', network),
    
    /**
     * 네트워크를 삭제합니다.
     * @param networkId 네트워크 ID
     * @returns 삭제 결과
     */
    removeNetwork: (networkId: string) => ipcRenderer.invoke('network:remove-network', networkId),
    
    /**
     * 네트워크 설정을 수정합니다.
     * @param networkId 네트워크 ID
     * @param network 수정된 네트워크 정보
     * @returns 수정 결과
     */
    editNetwork: (networkId: string, network: NetworkInfo) => 
      ipcRenderer.invoke('network:edit-network', { networkId, network }),
    
    /**
     * 활성 네트워크를 변경합니다.
     * @param networkId 네트워크 ID
     * @returns 변경 결과
     */
    switchNetwork: (networkId: string) => ipcRenderer.invoke('network:switch-network', networkId),
    
    /**
     * 현재 가스 가격을 가져옵니다.
     * @param networkId 네트워크 ID
     * @returns 가스 가격 정보
     */
    getGasPrice: (networkId: string) => ipcRenderer.invoke('network:get-gas-price', networkId)
  },
  
  // 설정 관련 API
  settings: {
    /**
     * 설정을 가져옵니다.
     * @param key 설정 키 (선택 사항, 지정하지 않으면 모든 설정 반환)
     * @returns 설정 값 또는 모든 설정
     */
    get: (key?: string) => ipcRenderer.invoke('settings:get', key),
    
    /**
     * 설정을 변경합니다.
     * @param key 설정 키
     * @param value 설정 값
     * @returns 변경 결과
     */
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', { key, value }),
    
    /**
     * 자동 시작 설정을 변경합니다.
     * @param autoLaunch 자동 시작 활성화 여부
     * @returns 변경 결과
     */
    setAutoLaunch: (autoLaunch: boolean) => 
      ipcRenderer.invoke('settings:set-auto-launch', autoLaunch),
    
    /**
     * 언어 설정을 변경합니다.
     * @param language 언어 코드
     * @returns 변경 결과
     */
    setLanguage: (language: string) => ipcRenderer.invoke('settings:set-language', language),
    
    /**
     * 테마 설정을 변경합니다.
     * @param theme 테마 ('light', 'dark', 'system')
     * @returns 변경 결과
     */
    setTheme: (theme: 'light' | 'dark' | 'system') => 
      ipcRenderer.invoke('settings:set-theme', theme),
    
    /**
     * 보안 설정을 변경합니다.
     * @param securitySettings 보안 설정
     * @returns 변경 결과
     */
    setSecurity: (securitySettings: SecuritySettings) => 
      ipcRenderer.invoke('settings:set-security', securitySettings)
  },
  
  // 시스템 관련 API
  system: {
    /**
     * 외부 URL을 엽니다.
     * @param url 열 URL
     * @returns 작업 결과
     */
    openExternal: (url: string) => ipcRenderer.invoke('system:open-external', url),
    
    /**
     * 파일 탐색기에서 항목을 표시합니다.
     * @param path 파일 경로
     * @returns 작업 결과
     */
    showItemInFolder: (path: string) => ipcRenderer.invoke('system:show-item-in-folder', path),
    
    /**
     * 앱 경로를 가져옵니다.
     * @param name 경로 이름
     * @returns 앱 경로
     */
    getPath: (name: string) => ipcRenderer.invoke('system:get-path', name),
    
    /**
     * 업데이트를 확인합니다.
     * @returns 업데이트 확인 결과
     */
    checkForUpdates: () => ipcRenderer.invoke('system:check-for-updates'),
    
    /**
     * 업데이트를 설치합니다.
     * @returns 설치 결과
     */
    installUpdate: () => ipcRenderer.invoke('system:install-update')
  },
  
  // 이벤트 관련 API
  events: {
    /**
     * 이벤트 리스너를 등록합니다.
     * @param channel 채널 이름
     * @param listener 리스너 함수
     */
    on: (channel: string, listener: (...args: any[]) => void) => {
      const validChannels = [
        'update-status',
        'network-change',
        'account-change',
        'transaction-status',
        'wallet-locked',
        'wallet-unlocked'
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (_, ...args) => listener(...args));
      }
    },
    
    /**
     * 이벤트 리스너를 한 번만 등록합니다.
     * @param channel 채널 이름
     * @param listener 리스너 함수
     */
    once: (channel: string, listener: (...args: any[]) => void) => {
      const validChannels = [
        'update-status',
        'network-change',
        'account-change',
        'transaction-status',
        'wallet-locked',
        'wallet-unlocked'
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.once(channel, (_, ...args) => listener(...args));
      }
    },
    
    /**
     * 이벤트 리스너를 제거합니다.
     * @param channel 채널 이름
     * @param listener 리스너 함수
     */
    off: (channel: string, listener: (...args: any[]) => void) => {
      const validChannels = [
        'update-status',
        'network-change',
        'account-change',
        'transaction-status',
        'wallet-locked',
        'wallet-unlocked'
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, listener);
      }
    }
  },
  
  // 대화 상자 관련 API
  dialog: {
    /**
     * 파일 열기 대화 상자를 표시합니다.
     * @param options 대화 상자 옵션
     * @returns 선택한 파일 경로
     */
    showOpenDialog: (options: OpenDialogOptions) => 
      ipcRenderer.invoke('dialog:show-open-dialog', options),
    
    /**
     * 파일 저장 대화 상자를 표시합니다.
     * @param options 대화 상자 옵션
     * @returns 저장할 파일 경로
     */
    showSaveDialog: (options: SaveDialogOptions) => 
      ipcRenderer.invoke('dialog:show-save-dialog', options),
    
    /**
     * 메시지 상자를 표시합니다.
     * @param options 메시지 상자 옵션
     * @returns 사용자 응답
     */
    showMessageBox: (options: MessageBoxOptions) => 
      ipcRenderer.invoke('dialog:show-message-box', options)
  }
};

// contextBridge를 통해 API 노출
contextBridge.exposeInMainWorld('toriAPI', toriAPI);
```

## 인터페이스 정의

### 지갑 관련 인터페이스

```typescript
/**
 * 지갑 가져오기 파라미터 인터페이스
 */
interface WalletImportParams {
  /**
   * 가져오기 유형: 'mnemonic', 'privateKey', 'keystore'
   */
  type: 'mnemonic' | 'privateKey' | 'keystore';
  
  /**
   * 시드 구문 (type이 'mnemonic'인 경우)
   */
  mnemonic?: string;
  
  /**
   * 개인 키 (type이 'privateKey'인 경우)
   */
  privateKey?: string;
  
  /**
   * 키스토어 JSON (type이 'keystore'인 경우)
   */
  keystore?: string;
  
  /**
   * 키스토어 암호 (type이 'keystore'인 경우)
   */
  password?: string;
  
  /**
   * HD 경로 (선택 사항)
   */
  hdPath?: string;
}

/**
 * 계정 정보 인터페이스
 */
interface AccountInfo {
  /**
   * 계정 주소
   */
  address: string;
  
  /**
   * 계정 이름
   */
  name: string;
  
  /**
   * 계정 타입 (외부, 하드웨어, 지갑 등)
   */
  type: 'wallet' | 'hardware' | 'external';
  
  /**
   * 계정 생성 시간
   */
  createdAt: number;
}

/**
 * 트랜잭션 정보 인터페이스
 */
interface TransactionInfo {
  /**
   * 트랜잭션 해시
   */
  hash: string;
  
  /**
   * 발신자 주소
   */
  from: string;
  
  /**
   * 수신자 주소
   */
  to: string;
  
  /**
   * 가치 (양)
   */
  value: string;
  
  /**
   * 가스 가격
   */
  gasPrice: string;
  
  /**
   * 가스 사용량
   */
  gasUsed: string;
  
  /**
   * 블록 번호
   */
  blockNumber: number;
  
  /**
   * 트랜잭션 시간
   */
  timestamp: number;
  
  /**
   * 상태 ('pending', 'confirmed', 'failed')
   */
  status: 'pending' | 'confirmed' | 'failed';
}
```

### 네트워크 관련 인터페이스

```typescript
/**
 * 네트워크 정보 인터페이스
 */
interface NetworkInfo {
  /**
   * 네트워크 ID
   */
  id: string;
  
  /**
   * 네트워크 이름
   */
  name: string;
  
  /**
   * 네트워크 유형 ('mainnet', 'testnet')
   */
  type: 'mainnet' | 'testnet';
  
  /**
   * 네트워크 체인 ID
   */
  chainId: number;
  
  /**
   * RPC URL
   */
  rpcUrl: string;
  
  /**
   * 블록 탐색기 URL
   */
  explorerUrl?: string;
  
  /**
   * 통화 기호
   */
  symbol: string;
  
  /**
   * 소수점 자릿수
   */
  decimals: number;
  
  /**
   * 기본 제공 네트워크 여부
   */
  isBuiltIn: boolean;
}

/**
 * 가스 가격 정보 인터페이스
 */
interface GasPriceInfo {
  /**
   * 느린 가스 가격
   */
  slow: string;
  
  /**
   * 평균 가스 가격
   */
  average: string;
  
  /**
   * 빠른 가스 가격
   */
  fast: string;
  
  /**
   * 최근 업데이트 시간
   */
  lastUpdated: number;
}
```

### 설정 관련 인터페이스

```typescript
/**
 * 보안 설정 인터페이스
 */
interface SecuritySettings {
  /**
   * 자동 잠금 시간 (분)
   */
  autoLockTimeout: number;
  
  /**
   * 생체 인증 사용 여부
   */
  useBiometrics: boolean;
  
  /**
   * 트랜잭션 서명 시 항상 비밀번호 확인 여부
   */
  alwaysConfirmTransactions: boolean;
  
  /**
   * 개인 데이터 암호화 방식
   */
  encryptionMethod: 'aes-256-gcm' | 'argon2id';
}

/**
 * 앱 설정 인터페이스
 */
interface AppSettings {
  /**
   * 언어 설정
   */
  language: string;
  
  /**
   * 테마 설정
   */
  theme: 'light' | 'dark' | 'system';
  
  /**
   * 통화 설정
   */
  currency: string;
  
  /**
   * 자동 시작 설정
   */
  autoLaunch: boolean;
  
  /**
   * 트레이에 최소화 설정
   */
  minimizeToTray: boolean;
  
  /**
   * 시작 시 잠금 설정
   */
  lockOnStart: boolean;
  
  /**
   * 보안 설정
   */
  security: SecuritySettings;
}
```

### 대화 상자 관련 인터페이스

```typescript
/**
 * 파일 열기 대화 상자 옵션 인터페이스
 */
interface OpenDialogOptions {
  /**
   * 대화 상자 제목
   */
  title?: string;
  
  /**
   * 기본 경로
   */
  defaultPath?: string;
  
  /**
   * 버튼 레이블
   */
  buttonLabel?: string;
  
  /**
   * 파일 필터
   */
  filters?: FileFilter[];
  
  /**
   * 다중 선택 여부
   */
  multiSelections?: boolean;
}

/**
 * 파일 저장 대화 상자 옵션 인터페이스
 */
interface SaveDialogOptions {
  /**
   * 대화 상자 제목
   */
  title?: string;
  
  /**
   * 기본 경로
   */
  defaultPath?: string;
  
  /**
   * 버튼 레이블
   */
  buttonLabel?: string;
  
  /**
   * 파일 필터
   */
  filters?: FileFilter[];
}

/**
 * 메시지 상자 옵션 인터페이스
 */
interface MessageBoxOptions {
  /**
   * 대화 상자 유형
   */
  type: 'none' | 'info' | 'error' | 'question' | 'warning';
  
  /**
   * 버튼 배열
   */
  buttons?: string[];
  
  /**
   * 기본 버튼 인덱스
   */
  defaultId?: number;
  
  /**
   * 대화 상자 제목
   */
  title?: string;
  
  /**
   * 대화 상자 메시지
   */
  message: string;
  
  /**
   * 상세 메시지
   */
  detail?: string;
  
  /**
   * 체크박스 레이블
   */
  checkboxLabel?: string;
  
  /**
   * 체크박스 초기 상태
   */
  checkboxChecked?: boolean;
}

/**
 * 파일 필터 인터페이스
 */
interface FileFilter {
  /**
   * 필터 이름
   */
  name: string;
  
  /**
   * 확장자 배열
   */
  extensions: string[];
}
```

## 보안 고려사항

Preload 스크립트는 두 개의 서로 다른 실행 환경 사이에서 작동하므로 보안에 신중한 주의를 기울여야 합니다:

1. **contextIsolation 사용**:
   - contextBridge를 통해 안전하게 API 노출
   - 렌더러 컨텍스트와 Node.js 컨텍스트 분리

2. **노출된 API 제한**:
   - 필요한 기능만 명시적으로 노출
   - 위험한 API 직접 노출 방지

3. **입력 검증**:
   - 모든 IPC 메시지의 입력값 검증
   - 유효하지 않은 입력 거부

4. **채널 이름 검증**:
   - 이벤트 리스너 등록 시 유효한 채널 이름만 허용
   - 채널 이름 목록 명시적 관리

5. **타입 안전성**:
   - TypeScript를 사용한 정적 타입 검사
   - 인터페이스 정의를 통한 명확한 API 계약

6. **오류 처리**:
   - 모든 API 호출에 대한 적절한 오류 처리
   - 에러 메시지에 민감한 정보 노출 방지

이러한 보안 고려사항을 염두에 두고 Preload 스크립트를 개발하고 유지보수하는 것이 중요합니다.
