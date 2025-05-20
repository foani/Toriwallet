# Renderer Process API

## 개요

Renderer Process는 Electron 애플리케이션의 사용자 인터페이스를 담당하는 부분으로, 웹 기술(HTML, CSS, JavaScript)을 사용하여 UI를 구현합니다. TORI 지갑 데스크톱 앱의 Renderer Process는 React와 TypeScript를 기반으로 구축되었으며, 상태 관리에는 Redux/Redux Toolkit을 사용합니다.

본 문서는 TORI 지갑 데스크톱 앱의 Renderer Process에서 사용하는 주요 컴포넌트, 상태 관리, 커스텀 훅, 유틸리티 함수 등의 API를 설명합니다.

## 주요 컴포넌트

### App

**설명**: 애플리케이션의 루트 컴포넌트로, 라우팅 설정과 전역 상태 관리를 담당합니다.

**주요 기능**:
- Redux 스토어 제공
- 테마 및 다국어 지원 설정
- 인증 및 보안 라우팅 관리
- 글로벌 알림 시스템 관리

**위치**: `src/renderer/App.tsx`

### 레이아웃 컴포넌트

#### MainLayout

**설명**: 인증된 사용자를 위한 메인 레이아웃을 제공합니다.

**Props**:
- `children`: React.ReactNode - 레이아웃 내부에 렌더링할 컴포넌트

**위치**: `src/renderer/components/layouts/MainLayout.tsx`

#### AuthLayout

**설명**: 인증되지 않은 사용자를 위한 인증 관련 레이아웃을 제공합니다.

**Props**:
- `children`: React.ReactNode - 레이아웃 내부에 렌더링할 컴포넌트

**위치**: `src/renderer/components/layouts/AuthLayout.tsx`

### 네비게이션 컴포넌트

#### Sidebar

**설명**: 애플리케이션의 주요 네비게이션 메뉴를 제공하는 사이드바 컴포넌트입니다.

**주요 기능**:
- 기본 네비게이션 링크 제공 (홈, 지갑, 스테이킹, NFT, 설정 등)
- 현재 활성 경로 강조 표시
- 네트워크 및 계정 선택기 포함

**위치**: `src/renderer/components/Sidebar.tsx`

#### NetworkSelector

**설명**: 지원되는 블록체인 네트워크 간 전환 기능을 제공하는 드롭다운 컴포넌트입니다.

**주요 기능**:
- 지원 네트워크 목록 표시
- 네트워크 전환 기능
- 사용자 정의 네트워크 추가 및 관리

**위치**: `src/renderer/components/NetworkSelector.tsx`

### 계정 관련 컴포넌트

#### AccountSelector

**설명**: 사용자 계정 간 전환 기능을 제공하는 드롭다운 컴포넌트입니다.

**주요 기능**:
- 계정 목록 표시
- 계정 전환 기능
- 계정 세부 정보 표시

**위치**: `src/renderer/components/AccountSelector.tsx`

#### AccountCard

**설명**: 계정 정보를 카드 형태로 표시하는 컴포넌트입니다.

**Props**:
- `account`: AccountInfo - 표시할 계정 정보
- `isSelected`: boolean - 선택된 계정 여부
- `onClick`: () => void - 클릭 이벤트 핸들러

**위치**: `src/renderer/components/wallet/AccountCard.tsx`

### 자산 관리 컴포넌트

#### TokenCard

**설명**: 토큰 정보와 잔액을 카드 형태로 표시하는 컴포넌트입니다.

**Props**:
- `token`: TokenInfo - 토큰 정보
- `amount`: string - 토큰 보유량
- `value`: number - 현재 통화 가치 (선택 사항)
- `network`: NetworkInfo - 네트워크 정보 (선택 사항)

**위치**: `src/renderer/components/wallet/TokenCard.tsx`

#### AssetsList

**설명**: 사용자의 자산 목록을 표시하는 컴포넌트입니다.

**Props**:
- `balances`: Record<string, BalanceInfo> - 잔액 정보
- `onSend`: (token: TokenInfo) => void - 전송 버튼 클릭 핸들러
- `onReceive`: () => void - 수신 버튼 클릭 핸들러

**위치**: `src/renderer/components/wallet/AssetsList.tsx`

### 트랜잭션 관련 컴포넌트

#### TransactionItem

**설명**: 트랜잭션 항목을 표시하는 컴포넌트입니다.

**Props**:
- `transaction`: TransactionInfo - 트랜잭션 정보
- `onClick`: () => void - 클릭 이벤트 핸들러 (선택 사항)

**위치**: `src/renderer/components/wallet/TransactionItem.tsx`

#### TransactionList

**설명**: 트랜잭션 목록을 표시하는 컴포넌트입니다.

**Props**:
- `transactions`: TransactionInfo[] - 트랜잭션 목록
- `hasMore`: boolean - 더 많은 트랜잭션이 있는지 여부
- `isLoading`: boolean - 로딩 중 여부
- `onLoadMore`: () => void - 더 불러오기 버튼 클릭 핸들러
- `onTransactionClick`: (tx: TransactionInfo) => void - 트랜잭션 클릭 핸들러 (선택 사항)

**위치**: `src/renderer/components/wallet/TransactionList.tsx`

#### SendForm

**설명**: 자산 전송을 위한 폼 컴포넌트입니다.

**주요 기능**:
- 받는 사람 주소 입력
- 금액 입력 및 토큰 선택
- 가스 가격 설정
- 트랜잭션 전송 및 상태 모니터링

**위치**: `src/renderer/components/wallet/SendForm.tsx`

### 스테이킹 관련 컴포넌트

#### ValidatorCard

**설명**: 검증인 정보를 카드 형태로 표시하는 컴포넌트입니다.

**Props**:
- `validator`: ValidatorInfo - 검증인 정보
- `onStake`: (validator: ValidatorInfo) => void - 스테이킹 버튼 클릭 핸들러
- `onUnstake`: (validator: ValidatorInfo) => void - 언스테이킹 버튼 클릭 핸들러 (선택 사항)
- `showDetails`: boolean - 세부 정보 표시 여부 (선택 사항)

**위치**: `src/renderer/components/staking/ValidatorCard.tsx`

#### StakingForm

**설명**: 스테이킹을 위한 폼 컴포넌트입니다.

**Props**:
- `validator`: ValidatorInfo - 스테이킹할 검증인
- `onSubmit`: (amount: string, duration: number) => void - 제출 핸들러
- `onCancel`: () => void - 취소 핸들러

**위치**: `src/renderer/components/staking/StakingForm.tsx`

### NFT 관련 컴포넌트

#### NFTCard

**설명**: NFT 정보를 카드 형태로 표시하는 컴포넌트입니다.

**Props**:
- `nft`: NFTInfo - NFT 정보
- `onClick`: () => void - 클릭 이벤트 핸들러

**위치**: `src/renderer/components/nft/NFTCard.tsx`

#### NFTGrid

**설명**: NFT 갤러리를 그리드 형태로 표시하는 컴포넌트입니다.

**Props**:
- `nfts`: NFTInfo[] - NFT 목록
- `onSelect`: (nft: NFTInfo) => void - NFT 선택 핸들러

**위치**: `src/renderer/components/nft/NFTGrid.tsx`

### 공통 컴포넌트

#### Button

**설명**: 애플리케이션 전반에서 사용되는 버튼 컴포넌트입니다.

**Props**:
- `variant`: 'primary' | 'secondary' | 'text' - 버튼 스타일 (기본값: 'primary')
- `size`: 'small' | 'medium' | 'large' - 버튼 크기 (기본값: 'medium')
- `disabled`: boolean - 비활성화 여부
- `onClick`: () => void - 클릭 이벤트 핸들러
- `children`: React.ReactNode - 버튼 내용

**위치**: `src/renderer/components/common/Button.tsx`

#### Input

**설명**: 애플리케이션 전반에서 사용되는 입력 필드 컴포넌트입니다.

**Props**:
- `label`: string - 레이블 (선택 사항)
- `type`: string - 입력 타입 (기본값: 'text')
- `value`: string - 입력 값
- `onChange`: (e: React.ChangeEvent<HTMLInputElement>) => void - 변경 이벤트 핸들러
- `placeholder`: string - 플레이스홀더 (선택 사항)
- `error`: string - 오류 메시지 (선택 사항)
- `disabled`: boolean - 비활성화 여부

**위치**: `src/renderer/components/common/Input.tsx`

#### Modal

**설명**: 모달 대화 상자 컴포넌트입니다.

**Props**:
- `title`: string - 모달 제목
- `onClose`: () => void - 닫기 핸들러
- `children`: React.ReactNode - 모달 내용
- `actions`: React.ReactNode - 모달 하단 액션 버튼 (선택 사항)

**위치**: `src/renderer/components/common/Modal.tsx`

## 페이지 컴포넌트

### HomeScreen

**설명**: 애플리케이션의 대시보드 화면으로, 자산 개요와 최근 활동을 표시합니다.

**주요 기능**:
- 총 자산 가치 표시
- 토큰별 잔액 표시
- 최근 트랜잭션 목록
- 스테이킹 요약 정보

**위치**: `src/renderer/pages/HomeScreen.tsx`

### WalletScreen

**설명**: 사용자의 계정 및 자산 관리 화면입니다.

**주요 기능**:
- 계정 목록 및 관리
- 자산 목록 및 잔액 표시
- 트랜잭션 내역 표시
- 전송 및 수신 기능

**위치**: `src/renderer/pages/WalletScreen.tsx`

### SendScreen

**설명**: 자산 전송 화면입니다.

**주요 기능**:
- 받는 사람 주소 입력
- 금액 입력 및 토큰 선택
- 가스 가격 설정
- 트랜잭션 확인 및 전송

**위치**: `src/renderer/pages/SendScreen.tsx`

### ReceiveScreen

**설명**: 자산 수신 화면입니다.

**주요 기능**:
- 계정 주소 QR 코드 표시
- 주소 복사 기능
- 계정 선택 기능

**위치**: `src/renderer/pages/ReceiveScreen.tsx`

### StakingScreen

**설명**: 스테이킹 관리 화면입니다.

**주요 기능**:
- 검증인 목록 표시
- 스테이킹 및 언스테이킹 기능
- 보상 정보 표시
- 스테이킹 히스토리

**위치**: `src/renderer/pages/StakingScreen.tsx`

### NFTScreen

**설명**: NFT 갤러리 화면입니다.

**주요 기능**:
- NFT 컬렉션 표시
- NFT 상세 정보 표시
- NFT 전송 기능

**위치**: `src/renderer/pages/NFTScreen.tsx`

### SettingsScreen

**설명**: 앱 설정 화면입니다.

**주요 기능**:
- 언어 설정
- 테마 설정
- 보안 설정
- 네트워크 관리
- 백업 및 복원 기능

**위치**: `src/renderer/pages/SettingsScreen.tsx`

## 상태 관리

TORI 지갑 데스크톱 앱은 Redux와 Redux Toolkit을 사용하여 상태를 관리합니다. 주요 상태 슬라이스는 다음과 같습니다:

### walletSlice

**설명**: 지갑, 계정, 잔액, 트랜잭션 등의 상태를 관리합니다.

**주요 상태**:
- `initialized`: 지갑 초기화 여부
- `locked`: 지갑 잠금 여부
- `accounts`: 계정 목록
- `selectedAccount`: 선택된 계정
- `balances`: 토큰별 잔액
- `transactions`: 트랜잭션 목록
- `pendingTransactions`: 처리 중인 트랜잭션

**주요 액션**:
- `initializeWallet`: 지갑 초기화
- `createWallet`: 새 지갑 생성
- `importWallet`: 기존 지갑 가져오기
- `unlockWallet`: 지갑 잠금 해제
- `lockWallet`: 지갑 잠금
- `createAccount`: 새 계정 생성
- `fetchBalances`: 잔액 가져오기
- `fetchTransactions`: 트랜잭션 내역 가져오기
- `sendTransaction`: 트랜잭션 전송

**위치**: `src/renderer/store/walletSlice.ts`

### networkSlice

**설명**: 네트워크 목록 및 활성 네트워크를 관리합니다.

**주요 상태**:
- `networks`: 지원되는 네트워크 목록
- `activeNetwork`: 현재 활성 네트워크
- `isLoading`: 로딩 상태
- `error`: 오류 메시지

**주요 액션**:
- `fetchNetworks`: 네트워크 목록 가져오기
- `switchNetwork`: 네트워크 전환
- `addNetwork`: 사용자 정의 네트워크 추가
- `removeNetwork`: 네트워크 삭제

**위치**: `src/renderer/store/networkSlice.ts`

### stakingSlice

**설명**: 스테이킹 관련 상태를 관리합니다.

**주요 상태**:
- `validators`: 검증인 목록
- `stakes`: 스테이킹 목록
- `rewards`: 보상 정보
- `isLoading`: 로딩 상태
- `error`: 오류 메시지

**주요 액션**:
- `fetchValidators`: 검증인 목록 가져오기
- `fetchStakes`: 스테이킹 목록 가져오기
- `fetchRewards`: 보상 정보 가져오기
- `stake`: 스테이킹 실행
- `unstake`: 언스테이킹 실행
- `claimRewards`: 보상 수령

**위치**: `src/renderer/store/stakingSlice.ts`

### nftSlice

**설명**: NFT 관련 상태를 관리합니다.

**주요 상태**:
- `nfts`: NFT 목록
- `selectedNft`: 선택된 NFT
- `isLoading`: 로딩 상태
- `error`: 오류 메시지

**주요 액션**:
- `fetchNfts`: NFT 목록 가져오기
- `selectNft`: NFT 선택
- `transferNft`: NFT 전송

**위치**: `src/renderer/store/nftSlice.ts`

### settingsSlice

**설명**: 앱 설정 관련 상태를 관리합니다.

**주요 상태**:
- `language`: 언어 설정
- `theme`: 테마 설정
- `currency`: 통화 설정
- `security`: 보안 설정

**주요 액션**:
- `fetchSettings`: 설정 가져오기
- `updateSettings`: 설정 업데이트
- `setLanguage`: 언어 설정 변경
- `setTheme`: 테마 설정 변경
- `setCurrency`: 통화 설정 변경
- `setSecuritySettings`: 보안 설정 변경

**위치**: `src/renderer/store/settingsSlice.ts`

## 커스텀 훅

TORI 지갑 데스크톱 앱은 UI 컴포넌트에서 Redux 상태와 비즈니스 로직을 쉽게 사용할 수 있도록 다양한 커스텀 훅을 제공합니다.

### useWallet

**설명**: 지갑 관련 상태와 기능을 제공합니다.

**반환값**:
- `initialized`: 지갑 초기화 여부
- `locked`: 지갑 잠금 여부
- `accounts`: 계정 목록
- `selectedAccount`: 선택된 계정
- `initializeWallet`: 지갑 초기화 함수
- `createWallet`: 지갑 생성 함수
- `importWallet`: 지갑 가져오기 함수
- `unlockWallet`: 지갑 잠금 해제 함수
- `lockWallet`: 지갑 잠금 함수
- `createAccount`: 계정 생성 함수
- `selectAccount`: 계정 선택 함수

**위치**: `src/renderer/hooks/useWallet.ts`

### useNetwork

**설명**: 네트워크 관련 상태와 기능을 제공합니다.

**반환값**:
- `networks`: 지원되는 네트워크 목록
- `activeNetwork`: 현재 활성 네트워크
- `isLoading`: 로딩 상태
- `error`: 오류 메시지
- `fetchNetworks`: 네트워크 목록 가져오기 함수
- `switchNetwork`: 네트워크 전환 함수
- `addNetwork`: 네트워크 추가 함수
- `removeNetwork`: 네트워크 삭제 함수

**위치**: `src/renderer/hooks/useNetwork.ts`

### useBalances

**설명**: 잔액 관련 상태와 기능을 제공합니다.

**반환값**:
- `balances`: 토큰별 잔액
- `isLoading`: 로딩 상태
- `error`: 오류 메시지
- `fetchBalances`: 잔액 가져오기 함수
- `getTotalValue`: 총 자산 가치 계산 함수

**위치**: `src/renderer/hooks/useBalances.ts`

### useTransactions

**설명**: 트랜잭션 관련 상태와 기능을 제공합니다.

**반환값**:
- `transactions`: 트랜잭션 목록
- `pendingTransactions`: 처리 중인 트랜잭션
- `hasMoreTransactions`: 추가 트랜잭션 존재 여부
- `isLoading`: 로딩 상태
- `isLoadingMore`: 추가 로딩 상태
- `fetchTransactions`: 트랜잭션 가져오기 함수
- `fetchMore`: 추가 트랜잭션 가져오기 함수
- `sendTransaction`: 트랜잭션 전송 함수

**위치**: `src/renderer/hooks/useTransactions.ts`

### useStaking

**설명**: 스테이킹 관련 상태와 기능을 제공합니다.

**반환값**:
- `validators`: 검증인 목록
- `stakes`: 스테이킹 목록
- `rewards`: 보상 정보
- `isLoading`: 로딩 상태
- `error`: 오류 메시지
- `fetchValidators`: 검증인 목록 가져오기 함수
- `fetchStakingInfo`: 스테이킹 정보 가져오기 함수
- `stake`: 스테이킹 함수
- `unstake`: 언스테이킹 함수
- `claimRewards`: 보상 수령 함수

**위치**: `src/renderer/hooks/useStaking.ts`

### useNFT

**설명**: NFT 관련 상태와 기능을 제공합니다.

**반환값**:
- `nfts`: NFT 목록
- `selectedNft`: 선택된 NFT
- `isLoading`: 로딩 상태
- `error`: 오류 메시지
- `fetchNfts`: NFT 목록 가져오기 함수
- `selectNft`: NFT 선택 함수
- `transferNft`: NFT 전송 함수

**위치**: `src/renderer/hooks/useNFT.ts`

### useSettings

**설명**: 앱 설정 관련 상태와 기능을 제공합니다.

**반환값**:
- `settings`: 앱 설정
- `isLoading`: 로딩 상태
- `error`: 오류 메시지
- `fetchSettings`: 설정 가져오기 함수
- `updateSettings`: 설정 업데이트 함수
- `setLanguage`: 언어 설정 변경 함수
- `setTheme`: 테마 설정 변경 함수
- `setCurrency`: 통화 설정 변경 함수
- `setSecuritySettings`: 보안 설정 변경 함수

**위치**: `src/renderer/hooks/useSettings.ts`

## 유틸리티 함수

### 포맷팅 유틸리티

**설명**: 데이터 포맷팅을 위한 유틸리티 함수들입니다.

**주요 함수**:
- `formatAmount`: 금액 포맷팅
- `formatCurrency`: 화폐 금액 포맷팅
- `shortenAddress`: 주소 축약 표시
- `formatRelativeTime`: 상대적 시간 포맷팅
- `formatDate`: 날짜 포맷팅
- `formatDateTime`: 날짜 및 시간 포맷팅
- `formatGasPrice`: 가스 가격 포맷팅

**위치**: `src/renderer/utils/formatters.ts`

### 검증 유틸리티

**설명**: 입력값 검증을 위한 유틸리티 함수들입니다.

**주요 함수**:
- `isValidEthereumAddress`: 이더리움 주소 유효성 검사
- `isValidAmount`: 금액 유효성 검사
- `isValidUrl`: URL 유효성 검사
- `isValidChainId`: 체인 ID 유효성 검사
- `isValidPrivateKey`: 개인 키 유효성 검사
- `isValidMnemonic`: 시드 구문 유효성 검사

**위치**: `src/renderer/utils/validators.ts`

### 암호화 유틸리티

**설명**: 데이터 암호화 및 보안 관련 유틸리티 함수들입니다.

**주요 함수**:
- `encryptData`: 데이터 암호화
- `decryptData`: 데이터 복호화
- `hashPassword`: 비밀번호 해싱
- `verifyPassword`: 비밀번호 검증
- `generateRandomBytes`: 랜덤 바이트 생성

**위치**: `src/renderer/utils/crypto.ts`

## IPC 통신

Renderer Process는 Main Process와 통신하기 위해 Preload 스크립트에서 노출한 `window.toriAPI` 객체를 사용합니다. 이 API는 Electron의 contextBridge를 통해 안전하게 노출됩니다.

**예시 사용법**:

```typescript
// 지갑 생성
async function createWallet(password: string) {
  try {
    const result = await window.toriAPI.wallet.create(password);
    if (result.success) {
      // 성공 처리
    } else {
      // 오류 처리
    }
  } catch (error) {
    // 예외 처리
  }
}

// 네트워크 전환
async function switchNetwork(networkId: string) {
  try {
    const result = await window.toriAPI.network.switchNetwork(networkId);
    if (result.success) {
      // 성공 처리
    } else {
      // 오류 처리
    }
  } catch (error) {
    // 예외 처리
  }
}

// 이벤트 리스닝
useEffect(() => {
  // 트랜잭션 상태 변경 이벤트 구독
  const handleTransactionStatus = (status: TransactionStatus) => {
    // 상태 변경 처리
  };
  
  window.toriAPI.events.on('transaction-status', handleTransactionStatus);
  
  return () => {
    // 구독 해제
    window.toriAPI.events.off('transaction-status', handleTransactionStatus);
  };
}, []);
```

자세한 IPC API 목록은 [IPC 통신](./ipc.md) 문서를 참조하세요.

## 보안 고려사항

Renderer Process에서 보안을 유지하기 위한 고려사항:

1. **개인 키 및 시드 구문 노출 방지**:
   - 개인 키, 시드 구문 등의 민감한 정보는 UI에 직접 표시하지 않거나 최소한으로 표시합니다.
   - 민감한 데이터는 메모리에 필요 이상으로 오래 저장하지 않습니다.

2. **입력 검증**:
   - 모든 사용자 입력은 Renderer Process에서 1차 검증 후 Main Process로 전달합니다.
   - 주소, 금액 등 중요 데이터는 적절한 검증 함수를 통해 확인합니다.

3. **상태 관리**:
   - 중요 상태 변경은 Redux 액션을 통해 투명하게 관리합니다.
   - 중요 데이터의 변경 이력을 추적할 수 있도록 합니다.

4. **UI 보안**:
   - 중요 작업 수행 전 사용자 확인을 요청합니다.
   - 트랜잭션 세부 정보를 명확하게 표시하여 사용자가 의도치 않은 작업을 방지합니다.
   - 자동 로그아웃 및 화면 잠금 기능을 구현합니다.

5. **오류 처리**:
   - 모든 오류를 적절히 처리하고 사용자에게 명확한 피드백을 제공합니다.
   - 민감한 오류 정보는 사용자에게 노출하지 않습니다.
