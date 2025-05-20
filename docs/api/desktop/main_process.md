# Main Process API

## 개요

Main Process는 Electron 애플리케이션의 핵심부로, Node.js 환경에서 실행됩니다. 이 프로세스는 애플리케이션의 생명주기를 관리하고, 창을 생성하고, 네이티브 운영 체제 기능에 접근하며, Renderer Process와의 통신을 담당합니다.

## 주요 모듈

### index.ts

애플리케이션의 주요 진입점으로, 앱의 초기화와 종료를 관리합니다.

```typescript
/**
 * Main Process 엔트리 포인트
 * 앱 초기화, 윈도우 생성, 이벤트 리스너 설정 등을 담당합니다.
 */
```

#### 주요 함수 및 이벤트 핸들러

```typescript
/**
 * 앱 초기화 시 호출되는 함수
 * 윈도우 생성, 메뉴 설정, IPC 핸들러 등록, 자동 업데이트 설정 등을 수행합니다.
 */
function initApp(): void;

/**
 * 모든 창이 닫힐 때 호출되는 이벤트 핸들러
 * macOS를 제외한 모든 플랫폼에서 애플리케이션 종료
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * 앱이 활성화될 때 호출되는 이벤트 핸들러
 * macOS에서 아이콘 클릭 시 창이 없으면 새 창 생성
 */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/**
 * 앱이 준비되면 호출되는 이벤트 핸들러
 * 앱 초기화 및 창 생성
 */
app.whenReady().then(() => {
  initApp();
});

/**
 * 앱이 종료되기 전 호출되는 이벤트 핸들러
 * 앱 종료 전 정리 작업 수행
 */
app.on('before-quit', () => {
  // 종료 전 정리 작업
});
```

### appWindow.ts

애플리케이션 창 생성 및 관리를 담당하는 모듈입니다.

```typescript
/**
 * 애플리케이션 창 관리 모듈
 * 창 생성, 로드, 이벤트 리스너 설정 등을 담당합니다.
 */
```

#### 주요 함수 및 클래스

```typescript
/**
 * 메인 애플리케이션 창을 생성합니다.
 * @returns {BrowserWindow} 생성된 브라우저 창 인스턴스
 */
export function createWindow(): BrowserWindow;

/**
 * 창이 이미 존재하는 경우 포커스, 그렇지 않으면 새 창 생성
 */
export function createOrFocusWindow(): void;

/**
 * 창 상태(크기, 위치 등)를 저장합니다.
 * @param window 상태를 저장할 브라우저 창 인스턴스
 */
export function saveWindowState(window: BrowserWindow): void;

/**
 * 저장된 창 상태를 로드합니다.
 * @returns 저장된 창 상태 또는 기본값
 */
export function loadWindowState(): WindowState;

/**
 * 창 닫기 이벤트를 처리합니다. 
 * 설정에 따라 트레이로 최소화하거나 앱을 종료합니다.
 * @param window 처리할 브라우저 창 인스턴스
 */
export function handleWindowClose(window: BrowserWindow): void;
```

### ipcHandlers.ts

Main Process와 Renderer Process 간의 IPC(Inter-Process Communication) 통신을 처리하는 모듈입니다.

```typescript
/**
 * IPC 통신 핸들러 모듈
 * Renderer Process로부터 오는 요청을 처리하고 응답을 반환합니다.
 */
```

#### 주요 함수 및 핸들러

```typescript
/**
 * 모든 IPC 핸들러를 설정합니다.
 */
export function setupIPCHandlers(): void;

/**
 * 지갑 관련 IPC 핸들러를 설정합니다.
 */
function setupWalletHandlers(): void;

/**
 * 네트워크 관련 IPC 핸들러를 설정합니다.
 */
function setupNetworkHandlers(): void;

/**
 * 설정 관련 IPC 핸들러를 설정합니다.
 */
function setupSettingsHandlers(): void;

/**
 * 자동 시작 설정 핸들러
 * 시스템 시작 시 앱 자동 실행 설정을 처리합니다.
 */
ipcMain.handle('settings:set-auto-launch', async (_, autoLaunch: boolean) => {
  try {
    // 자동 시작 설정 로직
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * 데이터 내보내기 핸들러
 * 지갑 데이터를 파일로 내보냅니다.
 */
ipcMain.handle('wallet:export-data', async (_, password: string) => {
  try {
    // 데이터 내보내기 로직
    return { success: true, path: exportPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * 데이터 가져오기 핸들러
 * 파일에서 지갑 데이터를 가져옵니다.
 */
ipcMain.handle('wallet:import-data', async (_, { path, password }) => {
  try {
    // 데이터 가져오기 로직
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

### menu.ts

애플리케이션 메뉴를 설정하는 모듈입니다.

```typescript
/**
 * 애플리케이션 메뉴 모듈
 * 기본 메뉴와 컨텍스트 메뉴를 설정합니다.
 */
```

#### 주요 함수 및 객체

```typescript
/**
 * 애플리케이션 메뉴를 설정합니다.
 * 운영 체제에 따라 다른 메뉴를 제공합니다.
 */
export function setupAppMenu(): void;

/**
 * macOS용 메뉴 템플릿을 생성합니다.
 * @returns macOS용 메뉴 템플릿
 */
function createMacMenuTemplate(): (Electron.MenuItemConstructorOptions | Electron.MenuItem)[];

/**
 * Windows/Linux용 메뉴 템플릿을 생성합니다.
 * @returns Windows/Linux용 메뉴 템플릿
 */
function createDefaultMenuTemplate(): (Electron.MenuItemConstructorOptions | Electron.MenuItem)[];

/**
 * 컨텍스트 메뉴를 생성하고 표시합니다.
 * @param window 메뉴를 표시할 창
 */
export function showContextMenu(window: BrowserWindow): void;
```

### autoUpdater.ts

애플리케이션 자동 업데이트를 처리하는 모듈입니다.

```typescript
/**
 * 자동 업데이트 모듈
 * 앱 업데이트 확인, 다운로드, 설치를 처리합니다.
 */
```

#### 주요 함수 및 이벤트 핸들러

```typescript
/**
 * 자동 업데이트를 설정하고 시작합니다.
 * @param window 업데이트 상태를 전송할 창
 */
export function setupAutoUpdater(window: BrowserWindow): void;

/**
 * 업데이트를 수동으로 확인합니다.
 * @returns 업데이트 확인 결과
 */
export async function checkForUpdates(): Promise<UpdateCheckResult>;

/**
 * 다운로드된 업데이트를 설치합니다.
 */
export function installUpdate(): void;

// 이벤트 핸들러

/**
 * 업데이트를 확인할 때 호출되는 이벤트 핸들러
 */
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('checking-for-update');
});

/**
 * 업데이트가 가능할 때 호출되는 이벤트 핸들러
 */
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('update-available', info);
});

/**
 * 업데이트가 없을 때 호출되는 이벤트 핸들러
 */
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('update-not-available', info);
});

/**
 * 업데이트 다운로드 중 호출되는 이벤트 핸들러
 */
autoUpdater.on('download-progress', (progressObj) => {
  sendStatusToWindow('download-progress', progressObj);
});

/**
 * 업데이트 다운로드 완료 시 호출되는 이벤트 핸들러
 */
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('update-downloaded', info);
});

/**
 * 업데이트 오류 발생 시 호출되는 이벤트 핸들러
 */
autoUpdater.on('error', (err) => {
  sendStatusToWindow('error', err);
});
```

## 유틸리티 함수

### 로깅 유틸리티

```typescript
/**
 * 애플리케이션 로거 인스턴스
 */
export const logger = {
  /**
   * 정보 메시지를 로깅합니다.
   * @param message 로깅할 메시지
   * @param data 추가 데이터 (선택 사항)
   */
  info(message: string, data?: any): void;

  /**
   * 경고 메시지를 로깅합니다.
   * @param message 로깅할 메시지
   * @param data 추가 데이터 (선택 사항)
   */
  warn(message: string, data?: any): void;

  /**
   * 오류 메시지를 로깅합니다.
   * @param message 로깅할 메시지
   * @param error 오류 객체 (선택 사항)
   */
  error(message: string, error?: Error): void;

  /**
   * 디버그 메시지를 로깅합니다. 개발 모드에서만 출력됩니다.
   * @param message 로깅할 메시지
   * @param data 추가 데이터 (선택 사항)
   */
  debug(message: string, data?: any): void;
};
```

### 저장소 유틸리티

```typescript
/**
 * 애플리케이션 설정 저장소
 */
export const store = {
  /**
   * 설정 값을 가져옵니다.
   * @param key 설정 키
   * @param defaultValue 기본값 (선택 사항)
   * @returns 설정 값 또는 기본값
   */
  get<T>(key: string, defaultValue?: T): T;

  /**
   * 설정 값을 설정합니다.
   * @param key 설정 키
   * @param value 설정할 값
   */
  set<T>(key: string, value: T): void;

  /**
   * 설정 값이 존재하는지 확인합니다.
   * @param key 설정 키
   * @returns 설정 값 존재 여부
   */
  has(key: string): boolean;

  /**
   * 설정 값을 삭제합니다.
   * @param key 설정 키
   */
  delete(key: string): void;

  /**
   * 모든 설정을 삭제합니다.
   */
  clear(): void;
};
```

## IPC 채널 목록

다음은 Main Process에서 관리하는 IPC 채널 목록입니다:

### 지갑 관련 채널
- `wallet:create` - 새 지갑 생성
- `wallet:import` - 기존 지갑 가져오기
- `wallet:export-data` - 지갑 데이터 내보내기
- `wallet:import-data` - 지갑 데이터 가져오기
- `wallet:backup` - 지갑 백업 생성
- `wallet:get-accounts` - 계정 목록 가져오기
- `wallet:create-account` - 새 계정 생성
- `wallet:remove-account` - 계정 삭제
- `wallet:rename-account` - 계정 이름 변경
- `wallet:get-balance` - 계정 잔액 가져오기
- `wallet:get-transactions` - 트랜잭션 내역 가져오기

### 네트워크 관련 채널
- `network:get-networks` - 지원 네트워크 목록 가져오기
- `network:add-network` - 사용자 정의 네트워크 추가
- `network:remove-network` - 네트워크 삭제
- `network:edit-network` - 네트워크 설정 수정
- `network:switch-network` - 활성 네트워크 변경
- `network:get-gas-price` - 현재 가스 가격 가져오기

### 설정 관련 채널
- `settings:get` - 설정 가져오기
- `settings:set` - 설정 변경
- `settings:set-auto-launch` - 자동 시작 설정
- `settings:set-language` - 언어 설정
- `settings:set-theme` - 테마 설정
- `settings:set-security` - 보안 설정

### 시스템 관련 채널
- `system:open-external` - 외부 URL 열기
- `system:show-item-in-folder` - 파일 탐색기에서 표시
- `system:get-path` - 앱 경로 가져오기
- `system:check-for-updates` - 업데이트 확인
- `system:install-update` - 업데이트 설치

## 보안 고려사항

Main Process는 강력한 권한을 가지며 시스템 리소스에 직접 접근할 수 있으므로 다음과 같은 보안 고려사항을 염두에 두어야 합니다:

1. **Preload 스크립트를 통한 제한된 API 노출**:
   - Renderer Process에 필요한 API만 제한적으로 노출
   - contextBridge를 사용하여 안전한 인터페이스 제공

2. **IPC 통신 검증**:
   - 모든 IPC 메시지의 입력값 검증
   - 악의적인 입력에 대한 방어

3. **외부 리소스 접근 제한**:
   - 신뢰할 수 있는 URL만 허용
   - 파일 시스템 접근 제한

4. **컨텐츠 보안 정책(CSP) 설정**:
   - 웹 보안 강화
   - XSS 및 코드 인젝션 방지

5. **권한 최소화**:
   - 필요한 권한만 사용
   - 권한 있는 작업 수행 전 사용자 확인

이러한 보안 고려사항을 염두에 두고 Main Process 코드를 작성하고 유지보수하는 것이 중요합니다.
