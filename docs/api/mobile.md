# TORI Wallet 모바일 앱 API 문서

TORI Wallet 모바일 앱은 React Native를 기반으로 한 크로스 플랫폼 애플리케이션으로, iOS와 Android 모두에서 동작합니다. 이 문서는 모바일 앱의 주요 API와 컴포넌트에 대한 설명을 제공합니다.

## 목차

1. [앱 구조](#앱-구조)
2. [주요 모듈](#주요-모듈)
3. [서비스 API](#서비스-api)
   - [WalletService](#walletservice)
   - [NetworkService](#networkservice)
   - [TransactionService](#transactionservice)
   - [StakingService](#stakingservice)
   - [CrosschainService](#crosschainservice)
   - [NFTService](#nftservice)
   - [DAppBrowserService](#dappbrowserservice)
4. [훅(Hooks)](#훅hooks)
   - [useWallet](#usewallet)
   - [useNetwork](#usenetwork)
   - [useStaking](#usestaking)
   - [useNFT](#usenft)
   - [useCrosschain](#usecrosschain)
5. [네비게이션](#네비게이션)
6. [생체 인증](#생체-인증)
7. [푸시 알림](#푸시-알림)
8. [QR 코드 기능](#qr-코드-기능)
9. [dApp 브라우저](#dapp-브라우저)
10. [멀티체인 및 크로스체인 기능](#멀티체인-및-크로스체인-기능)
11. [스테이킹 및 DeFi 기능](#스테이킹-및-defi-기능)

## 앱 구조

TORI Wallet 모바일 앱은 다음과 같은 디렉토리 구조를 가집니다:

```
mobile/
├── android/               # Android 네이티브 코드
├── ios/                   # iOS 네이티브 코드
├── src/
│   ├── components/        # UI 컴포넌트
│   │   ├── common/        # 공통 컴포넌트
│   │   ├── wallet/        # 지갑 관련 컴포넌트
│   │   ├── staking/       # 스테이킹 관련 컴포넌트
│   │   ├── nft/           # NFT 관련 컴포넌트
│   │   ├── crosschain/    # 크로스체인 관련 컴포넌트
│   │   └── dapp/          # dApp 관련 컴포넌트
│   ├── screens/           # 화면 컴포넌트
│   │   ├── onboarding/    # 온보딩 화면
│   │   ├── wallet/        # 지갑 화면
│   │   ├── staking/       # 스테이킹 화면
│   │   ├── nft/           # NFT 화면
│   │   ├── settings/      # 설정 화면
│   │   ├── dapp/          # dApp 화면
│   │   └── crosschain/    # 크로스체인 화면
│   ├── navigation/        # 네비게이션 컴포넌트
│   ├── biometrics/        # 생체 인증 관련 모듈
│   ├── services/          # 서비스 모듈
│   ├── hooks/             # 커스텀 훅
│   ├── styles/            # 스타일 정의
│   ├── config/            # 앱 설정
│   ├── utils/             # 유틸리티 함수
│   └── App.tsx            # 앱 진입점
├── app.json               # React Native 앱 설정
├── metro.config.js        # Metro 번들러 설정
├── babel.config.js        # Babel 설정
├── index.js               # 앱 등록 포인트
├── package.json           # 의존성 정의
└── tsconfig.json          # TypeScript 설정
```

## 주요 모듈

### 앱 진입점

`App.tsx`는 앱의 진입점으로, 전역 상태 관리 및 네비게이션 설정을 담당합니다.

```typescript
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { WalletProvider } from './contexts/WalletContext';
import { NetworkProvider } from './contexts/NetworkContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppNavigator from './navigation/AppNavigator';
import { StatusBar } from 'react-native';

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <NetworkProvider>
            <WalletProvider>
              <AuthProvider>
                <NotificationProvider>
                  <StatusBar translucent backgroundColor="transparent" />
                  <AppNavigator />
                </NotificationProvider>
              </AuthProvider>
            </WalletProvider>
          </NetworkProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
```

## 서비스 API

### WalletService

`WalletService`는 지갑 관리와 관련된 기능을 제공합니다.

#### 주요 메서드

```typescript
class WalletService {
  /**
   * 새 지갑 생성
   * @param password 지갑 비밀번호
   * @param seedPhrase 시드 구문 (선택적)
   * @returns 생성된 지갑 정보
   */
  async createWallet(password: string, seedPhrase?: string): Promise<Wallet> {
    // 구현...
  }

  /**
   * 기존 지갑 가져오기
   * @param importType 가져오기 유형 ('seedPhrase', 'privateKey', 'keystore')
   * @param importData 가져오기 데이터 (시드 구문, 개인 키, 키스토어 등)
   * @param password 지갑 비밀번호
   * @returns 가져온 지갑 정보
   */
  async importWallet(importType: ImportType, importData: string, password: string): Promise<Wallet> {
    // 구현...
  }

  /**
   * 지갑 잠금 해제
   * @param password 지갑 비밀번호
   * @returns 성공 여부
   */
  async unlockWallet(password: string): Promise<boolean> {
    // 구현...
  }

  /**
   * 지갑 잠금
   * @returns 성공 여부
   */
  async lockWallet(): Promise<boolean> {
    // 구현...
  }

  /**
   * 계정 목록 가져오기
   * @returns 계정 목록
   */
  async getAccounts(): Promise<Account[]> {
    // 구현...
  }

  /**
   * 계정 잔액 가져오기
   * @param address 계정 주소
   * @param network 네트워크 식별자
   * @returns 계정 잔액
   */
  async getBalance(address: string, network: string): Promise<string> {
    // 구현...
  }

  /**
   * 계정 토큰 목록 가져오기
   * @param address 계정 주소
   * @param network 네트워크 식별자
   * @returns 토큰 목록
   */
  async getTokens(address: string, network: string): Promise<Token[]> {
    // 구현...
  }

  /**
   * 메시지 서명
   * @param message 서명할 메시지
   * @param account 서명할 계정
   * @returns 서명
   */
  async signMessage(message: string, account: string): Promise<string> {
    // 구현...
  }

  /**
   * 개인 키 내보내기
   * @param address 계정 주소
   * @param password 지갑 비밀번호
   * @returns 개인 키
   */
  async exportPrivateKey(address: string, password: string): Promise<string> {
    // 구현...
  }

  /**
   * 시드 구문 내보내기
   * @param password 지갑 비밀번호
   * @returns 시드 구문
   */
  async exportSeedPhrase(password: string): Promise<string> {
    // 구현...
  }
}
```

### NetworkService

`NetworkService`는 네트워크 관리와 관련된 기능을 제공합니다.

#### 주요 메서드

```typescript
class NetworkService {
  /**
   * 모든 네트워크 가져오기
   * @returns 네트워크 목록
   */
  async getAllNetworks(): Promise<Network[]> {
    // 구현...
  }

  /**
   * 현재 선택된 네트워크 가져오기
   * @returns 현재 네트워크
   */
  async getCurrentNetwork(): Promise<Network | null> {
    // 구현...
  }

  /**
   * 네트워크 전환
   * @param networkId 네트워크 식별자
   * @returns 선택된 네트워크
   */
  async setCurrentNetwork(networkId: string | number): Promise<Network> {
    // 구현...
  }

  /**
   * 사용자 정의 네트워크 추가
   * @param network 네트워크 정보
   * @returns 추가된 네트워크
   */
  async addCustomNetwork(network: Network): Promise<Network> {
    // 구현...
  }

  /**
   * 사용자 정의 네트워크 제거
   * @param networkId 네트워크 식별자
   * @returns 성공 여부
   */
  async removeCustomNetwork(networkId: string | number): Promise<boolean> {
    // 구현...
  }
}
```

### TransactionService

`TransactionService`는 트랜잭션 처리와 관련된 기능을 제공합니다.

#### 주요 메서드

```typescript
class TransactionService {
  /**
   * 트랜잭션 서명
   * @param tx 트랜잭션 객체
   * @param from 송신자 주소
   * @returns 서명된 트랜잭션
   */
  async signTransaction(tx: TransactionRequest, from: string): Promise<string> {
    // 구현...
  }

  /**
   * 트랜잭션 전송
   * @param signedTx 서명된 트랜잭션
   * @returns 트랜잭션 해시
   */
  async sendTransaction(signedTx: string): Promise<string> {
    // 구현...
  }

  /**
   * 트랜잭션 상태 확인
   * @param txHash 트랜잭션 해시
   * @param network 네트워크 식별자
   * @returns 트랜잭션 상태
   */
  async getTransactionStatus(txHash: string, network: string): Promise<TransactionStatus> {
    // 구현...
  }

  /**
   * 트랜잭션 이력 가져오기
   * @param address 계정 주소
   * @param network 네트워크 식별자
   * @param page 페이지 번호 (선택적)
   * @param limit 페이지당 항목 수 (선택적)
   * @returns 트랜잭션 목록
   */
  async getTransactionHistory(
    address: string,
    network: string,
    page: number = 1,
    limit: number = 10
  ): Promise<Transaction[]> {
    // 구현...
  }

  /**
   * 가스 가격 추정
   * @param network 네트워크 식별자
   * @returns 가스 가격 정보
   */
  async estimateGasPrice(network: string): Promise<GasPriceEstimation> {
    // 구현...
  }

  /**
   * 가스 한도 추정
   * @param tx 트랜잭션 객체
   * @param network 네트워크 식별자
   * @returns 가스 한도 추정값
   */
  async estimateGasLimit(tx: TransactionRequest, network: string): Promise<string> {
    // 구현...
  }
}
```
