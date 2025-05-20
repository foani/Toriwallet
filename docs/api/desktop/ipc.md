# IPC 통신

## 개요

IPC(Inter-Process Communication)는 Electron 애플리케이션에서 Main Process와 Renderer Process 간의 통신 메커니즘입니다. TORI 지갑 데스크톱 앱은 보안을 강화하기 위해 contextBridge를 사용하여 Renderer Process에 안전한 IPC 인터페이스를 제공합니다.

본 문서는 TORI 지갑 데스크톱 앱에서 사용하는 IPC 통신 메커니즘, 채널, 메시지 형식, 이벤트 등을 설명합니다.

## 통신 구조

TORI 지갑 데스크톱 앱의 IPC 통신 구조는 다음과 같습니다:

1. **Main Process**: IPC 핸들러를 등록하여 Renderer Process로부터의 요청을 처리합니다.
2. **Preload Script**: contextBridge를 통해 Renderer Process에 안전한 API 인터페이스를 제공합니다.
3. **Renderer Process**: Preload Script가 노출한 API를 통해 Main Process와 통신합니다.

이러한 구조는 Renderer Process가 Node.js API에 직접 접근하지 않고도 필요한 기능을 사용할 수 있게 합니다.

## IPC API 인터페이스

Preload Script는 `window.toriAPI` 객체를 통해 다음과 같은 API 그룹을 Renderer Process에 노출합니다:

- `wallet`: 지갑 관련 API
- `network`: 네트워크 관련 API
- `settings`: 설정 관련 API
- `system`: 시스템 관련 API
- `events`: 이벤트 구독 관련 API
- `dialog`: 대화 상자 관련 API

각 API 그룹에는 특정 작업을 수행하는 여러 메서드가 포함되어 있습니다.

## 지갑 API (wallet)

### create

**설명**: 새 지갑을 생성합니다.

**요청 파라미터**: 
- `password`: string - 지갑 암호

**응답 형식**:
```typescript
{
  success: boolean;
  accounts?: AccountInfo[];
  seed?: string;
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.wallet.create('my-secure-password');
if (result.success) {
  console.log('지갑 생성 성공:', result.accounts);
} else {
  console.error('지갑 생성 실패:', result.error);
}
```

### import

**설명**: 기존 지갑을 가져옵니다.

**요청 파라미터**:
- `params`: WalletImportParams - 가져오기 파라미터
  - `type`: 'mnemonic' | 'privateKey' | 'keystore' - 가져오기 유형
  - `mnemonic?`: string - 시드 구문 (type이 'mnemonic'인 경우)
  - `privateKey?`: string - 개인 키 (type이 'privateKey'인 경우)
  - `keystore?`: string - 키스토어 JSON (type이 'keystore'인 경우)
  - `password?`: string - 키스토어 암호 (type이 'keystore'인 경우)
  - `hdPath?`: string - HD 경로 (선택 사항)

**응답 형식**:
```typescript
{
  success: boolean;
  accounts?: AccountInfo[];
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.wallet.import({
  type: 'mnemonic',
  mnemonic: 'your mnemonic phrase here',
  password: 'my-secure-password'
});

if (result.success) {
  console.log('지갑 가져오기 성공:', result.accounts);
} else {
  console.error('지갑 가져오기 실패:', result.error);
}
```

### unlock

**설명**: 지갑을 잠금 해제합니다.

**요청 파라미터**:
- `password`: string - 지갑 암호

**응답 형식**:
```typescript
{
  success: boolean;
  accounts?: AccountInfo[];
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.wallet.unlock('my-secure-password');
if (result.success) {
  console.log('지갑 잠금 해제 성공:', result.accounts);
} else {
  console.error('지갑 잠금 해제 실패:', result.error);
}
```

### getBalances

**설명**: 계정의 토큰 잔액을 가져옵니다.

**요청 파라미터**:
- `address`: string - 계정 주소
- `networkId`: string - 네트워크 ID

**응답 형식**:
```typescript
Record<string, BalanceInfo>
```
여기서 `BalanceInfo`는 다음과 같은 구조를 가집니다:
```typescript
{
  token: TokenInfo;
  amount: string;
  usdValue?: number;
}
```

**예시**:
```typescript
const balances = await window.toriAPI.wallet.getBalances('0x123...', 'network-1');
console.log('계정 잔액:', balances);
```

### getTransactions

**설명**: 계정의 트랜잭션 내역을 가져옵니다.

**요청 파라미터**:
- `address`: string - 계정 주소
- `networkId`: string - 네트워크 ID
- `page`: number - 페이지 번호
- `limit`: number - 항목 수 제한

**응답 형식**:
```typescript
{
  transactions: TransactionInfo[];
  hasMore: boolean;
  total?: number;
}
```

**예시**:
```typescript
const result = await window.toriAPI.wallet.getTransactions('0x123...', 'network-1', 1, 10);
console.log('트랜잭션 내역:', result.transactions);
console.log('추가 트랜잭션 존재 여부:', result.hasMore);
```

### sendTransaction

**설명**: 트랜잭션을 전송합니다.

**요청 파라미터**:
- `request`: TransactionRequest
  - `from`: string - 발신자 주소
  - `to`: string - 수신자 주소
  - `amount`: string - 금액
  - `token`: string - 토큰 주소 또는 심볼
  - `networkId`: string - 네트워크 ID
  - `gasPrice?`: string - 가스 가격 (선택 사항)
  - `gasLimit?`: string - 가스 제한 (선택 사항)
  - `data?`: string - 추가 데이터 (선택 사항)

**응답 형식**:
```typescript
{
  success: boolean;
  hash?: string;
  gasPrice?: string;
  gasLimit?: string;
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.wallet.sendTransaction({
  from: '0x123...',
  to: '0x456...',
  amount: '1.0',
  token: 'CTA',
  networkId: 'network-1',
  gasPrice: '5',
  gasLimit: '21000'
});

if (result.success) {
  console.log('트랜잭션 전송 성공:', result.hash);
} else {
  console.error('트랜잭션 전송 실패:', result.error);
}
```

### getTransactionStatus

**설명**: 트랜잭션 상태를 확인합니다.

**요청 파라미터**:
- `hash`: string - 트랜잭션 해시
- `networkId`: string - 네트워크 ID

**응답 형식**:
```typescript
{
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  from?: string;
  to?: string;
  error?: string;
}
```

**예시**:
```typescript
const status = await window.toriAPI.wallet.getTransactionStatus('0xabc...', 'network-1');
console.log('트랜잭션 상태:', status);
```

### exportData

**설명**: 지갑 데이터를 내보냅니다.

**요청 파라미터**:
- `password`: string - 지갑 암호

**응답 형식**:
```typescript
{
  success: boolean;
  path?: string;
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.wallet.exportData('my-secure-password');
if (result.success) {
  console.log('지갑 데이터 내보내기 성공:', result.path);
} else {
  console.error('지갑 데이터 내보내기 실패:', result.error);
}
```

### importData

**설명**: 지갑 데이터를 가져옵니다.

**요청 파라미터**:
- `path`: string - 파일 경로
- `password`: string - 지갑 암호

**응답 형식**:
```typescript
{
  success: boolean;
  accounts?: AccountInfo[];
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.wallet.importData('/path/to/backup.json', 'my-secure-password');
if (result.success) {
  console.log('지갑 데이터 가져오기 성공:', result.accounts);
} else {
  console.error('지갑 데이터 가져오기 실패:', result.error);
}
```

## 네트워크 API (network)

### getNetworks

**설명**: 지원되는 네트워크 목록을 가져옵니다.

**요청 파라미터**: 없음

**응답 형식**:
```typescript
NetworkInfo[]
```

**예시**:
```typescript
const networks = await window.toriAPI.network.getNetworks();
console.log('지원되는 네트워크 목록:', networks);
```

### addNetwork

**설명**: 사용자 정의 네트워크를 추가합니다.

**요청 파라미터**:
- `network`: NetworkInfo - 네트워크 정보

**응답 형식**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.network.addNetwork({
  id: 'custom-1',
  name: '사용자 정의 네트워크',
  type: 'mainnet',
  chainId: 1234,
  rpcUrl: 'https://custom.network.rpc',
  symbol: 'CUSTOM',
  decimals: 18,
  isBuiltIn: false
});

if (result.success) {
  console.log('네트워크 추가 성공');
} else {
  console.error('네트워크 추가 실패:', result.error);
}
```

### removeNetwork

**설명**: 네트워크를 삭제합니다.

**요청 파라미터**:
- `networkId`: string - 네트워크 ID

**응답 형식**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.network.removeNetwork('custom-1');
if (result.success) {
  console.log('네트워크 삭제 성공');
} else {
  console.error('네트워크 삭제 실패:', result.error);
}
```

### switchNetwork

**설명**: 활성 네트워크를 변경합니다.

**요청 파라미터**:
- `networkId`: string - 네트워크 ID

**응답 형식**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.network.switchNetwork('network-1');
if (result.success) {
  console.log('네트워크 전환 성공');
} else {
  console.error('네트워크 전환 실패:', result.error);
}
```

### getGasPrice

**설명**: 현재 가스 가격을 가져옵니다.

**요청 파라미터**:
- `networkId`: string - 네트워크 ID

**응답 형식**:
```typescript
{
  slow: string;
  average: string;
  fast: string;
  lastUpdated: number;
}
```

**예시**:
```typescript
const gasPrice = await window.toriAPI.network.getGasPrice('network-1');
console.log('현재 가스 가격:', gasPrice);
```

## 설정 API (settings)

### get

**설명**: 설정을 가져옵니다.

**요청 파라미터**:
- `key?`: string - 설정 키 (지정하지 않으면, 모든 설정 반환)

**응답 형식**:
```typescript
any
```

**예시**:
```typescript
// 특정 설정 가져오기
const language = await window.toriAPI.settings.get('language');
console.log('언어 설정:', language);

// 모든 설정 가져오기
const allSettings = await window.toriAPI.settings.get();
console.log('모든 설정:', allSettings);
```

### set

**설명**: 설정을 변경합니다.

**요청 파라미터**:
- `key`: string - 설정 키
- `value`: any - 설정 값

**응답 형식**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.settings.set('language', 'ko');
if (result.success) {
  console.log('언어 설정 변경 성공');
} else {
  console.error('언어 설정 변경 실패:', result.error);
}
```

### setAutoLaunch

**설명**: 자동 시작 설정을 변경합니다.

**요청 파라미터**:
- `autoLaunch`: boolean - 자동 시작 활성화 여부

**응답 형식**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.settings.setAutoLaunch(true);
if (result.success) {
  console.log('자동 시작 설정 변경 성공');
} else {
  console.error('자동 시작 설정 변경 실패:', result.error);
}
```

### setTheme

**설명**: 테마 설정을 변경합니다.

**요청 파라미터**:
- `theme`: 'light' | 'dark' | 'system' - 테마

**응답 형식**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.settings.setTheme('dark');
if (result.success) {
  console.log('테마 설정 변경 성공');
} else {
  console.error('테마 설정 변경 실패:', result.error);
}
```

## 시스템 API (system)

### openExternal

**설명**: 외부 URL을 엽니다.

**요청 파라미터**:
- `url`: string - 열 URL

**응답 형식**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.system.openExternal('https://creatachain.com');
if (result.success) {
  console.log('URL 열기 성공');
} else {
  console.error('URL 열기 실패:', result.error);
}
```

### showItemInFolder

**설명**: 파일 탐색기에서 항목을 표시합니다.

**요청 파라미터**:
- `path`: string - 파일 경로

**응답 형식**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.system.showItemInFolder('/path/to/file.txt');
if (result.success) {
  console.log('파일 탐색기에서 표시 성공');
} else {
  console.error('파일 탐색기에서 표시 실패:', result.error);
}
```

### checkForUpdates

**설명**: 업데이트를 확인합니다.

**요청 파라미터**: 없음

**응답 형식**:
```typescript
{
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion?: string;
  releaseNotes?: string;
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.system.checkForUpdates();
if (result.updateAvailable) {
  console.log('업데이트 가능:', result.latestVersion);
  console.log('릴리스 노트:', result.releaseNotes);
} else {
  console.log('최신 버전 사용 중:', result.currentVersion);
}
```

### installUpdate

**설명**: 업데이트를 설치합니다.

**요청 파라미터**: 없음

**응답 형식**:
```typescript
{
  success: boolean;
  error?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.system.installUpdate();
if (result.success) {
  console.log('업데이트 설치 성공');
} else {
  console.error('업데이트 설치 실패:', result.error);
}
```

## 대화 상자 API (dialog)

### showOpenDialog

**설명**: 파일 열기 대화 상자를 표시합니다.

**요청 파라미터**:
- `options`: OpenDialogOptions - 대화 상자 옵션

**응답 형식**:
```typescript
{
  canceled: boolean;
  filePaths: string[];
}
```

**예시**:
```typescript
const result = await window.toriAPI.dialog.showOpenDialog({
  title: '파일 열기',
  filters: [
    { name: 'JSON 파일', extensions: ['json'] }
  ],
  multiSelections: false
});

if (!result.canceled) {
  console.log('선택한 파일:', result.filePaths[0]);
}
```

### showSaveDialog

**설명**: 파일 저장 대화 상자를 표시합니다.

**요청 파라미터**:
- `options`: SaveDialogOptions - 대화 상자 옵션

**응답 형식**:
```typescript
{
  canceled: boolean;
  filePath?: string;
}
```

**예시**:
```typescript
const result = await window.toriAPI.dialog.showSaveDialog({
  title: '파일 저장',
  defaultPath: 'wallet-backup.json',
  filters: [
    { name: 'JSON 파일', extensions: ['json'] }
  ]
});

if (!result.canceled) {
  console.log('저장 경로:', result.filePath);
}
```

### showMessageBox

**설명**: 메시지 상자를 표시합니다.

**요청 파라미터**:
- `options`: MessageBoxOptions - 메시지 상자 옵션

**응답 형식**:
```typescript
{
  response: number;
  checkboxChecked?: boolean;
}
```

**예시**:
```typescript
const result = await window.toriAPI.dialog.showMessageBox({
  type: 'question',
  title: '확인',
  message: '작업을 계속하시겠습니까?',
  buttons: ['예', '아니오'],
  defaultId: 0,
  checkboxLabel: '다시 묻지 않음'
});

if (result.response === 0) {
  console.log('사용자가 "예"를 선택했습니다.');
  if (result.checkboxChecked) {
    console.log('다시 묻지 않음 체크됨');
  }
}
```

## 이벤트 API (events)

### on

**설명**: 이벤트 리스너를 등록합니다.

**요청 파라미터**:
- `channel`: string - 채널 이름
- `listener`: Function - 리스너 함수

**유효한 채널**:
- `update-status`: 업데이트 상태 변경 이벤트
- `network-change`: 네트워크 변경 이벤트
- `account-change`: 계정 변경 이벤트
- `transaction-status`: 트랜잭션 상태 변경 이벤트
- `wallet-locked`: 지갑 잠금 이벤트
- `wallet-unlocked`: 지갑 잠금 해제 이벤트

**예시**:
```typescript
// 트랜잭션 상태 변경 이벤트 구독
window.toriAPI.events.on('transaction-status', (status) => {
  console.log('트랜잭션 상태 변경:', status);
});

// 네트워크 변경 이벤트 구독
window.toriAPI.events.on('network-change', (network) => {
  console.log('네트워크 변경:', network);
});
```

### once

**설명**: 이벤트 리스너를 한 번만 등록합니다.

**요청 파라미터**:
- `channel`: string - 채널 이름
- `listener`: Function - 리스너 함수

**예시**:
```typescript
// 지갑 잠금 해제 이벤트를 한 번만 구독
window.toriAPI.events.once('wallet-unlocked', () => {
  console.log('지갑이 잠금 해제되었습니다.');
});
```

### off

**설명**: 이벤트 리스너를 제거합니다.

**요청 파라미터**:
- `channel`: string - 채널 이름
- `listener`: Function - 제거할 리스너 함수

**예시**:
```typescript
const handleTransactionStatus = (status) => {
  console.log('트랜잭션 상태:', status);
};

// 이벤트 구독
window.toriAPI.events.on('transaction-status', handleTransactionStatus);

// 이벤트 구독 해제
window.toriAPI.events.off('transaction-status', handleTransactionStatus);
```

## 이벤트 목록

### update-status

**설명**: 앱 업데이트 상태 변경 시 발생합니다.

**이벤트 데이터**:
```typescript
{
  status: 'checking-for-update' | 'update-available' | 'update-not-available' | 'download-progress' | 'update-downloaded' | 'error';
  info?: any;
  error?: string;
}
```

### network-change

**설명**: 활성 네트워크 변경 시 발생합니다.

**이벤트 데이터**:
```typescript
NetworkInfo
```

### account-change

**설명**: 선택된 계정 변경 시 발생합니다.

**이벤트 데이터**:
```typescript
AccountInfo
```

### transaction-status

**설명**: 트랜잭션 상태 변경 시 발생합니다.

**이벤트 데이터**:
```typescript
{
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
}
```

### wallet-locked

**설명**: 지갑이 잠길 때 발생합니다.

**이벤트 데이터**: 없음

### wallet-unlocked

**설명**: 지갑이 잠금 해제될 때 발생합니다.

**이벤트 데이터**:
```typescript
{
  accounts: AccountInfo[];
}
```

## 보안 고려사항

IPC 통신에서 보안을 유지하기 위한 고려사항:

1. **채널 이름 검증**:
   - Main Process에서는 사전 정의된 채널 이름만 처리합니다.
   - Preload Script에서 이벤트 등록 시 유효한 채널 이름만 허용합니다.

2. **입력 검증**:
   - Main Process에서 모든 IPC 메시지의 입력값을 검증합니다.
   - 특히 파일 경로, URL 등 외부 리소스 접근과 관련된 입력은 철저히 검증합니다.

3. **권한 제한**:
   - 권한이 필요한 작업(예: 개인 키 접근)은 사용자 인증 후에만 허용합니다.
   - 중요 작업(예: 트랜잭션 서명)은 별도의 확인 절차를 거칩니다.

4. **암호화 데이터 전송**:
   - 민감한 정보는 IPC 채널을 통해 직접 전송하지 않습니다.
   - 불가피하게 전송해야 하는 경우 암호화를 적용합니다.

5. **오류 처리**:
   - 모든 IPC 통신에서 적절한 오류 처리를 구현합니다.
   - 오류 메시지에 민감한 정보가 포함되지 않도록 합니다.
