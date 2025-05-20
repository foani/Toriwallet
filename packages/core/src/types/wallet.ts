/**
 * wallet.ts
 * 
 * 이 모듈은 지갑과 계정 관련 타입 및 인터페이스를 정의합니다.
 */

import { NetworkType } from '../constants/networks';

// 지갑 타입 열거
export enum WalletType {
  HD_WALLET = 'HD_WALLET',      // 계층결정적 지갑 (HD Wallet)
  KEYSTORE = 'KEYSTORE',        // 키스토어 파일
  PRIVATE_KEY = 'PRIVATE_KEY',  // 개인키
  HARDWARE = 'HARDWARE',        // 하드웨어 지갑
  SOCIAL = 'SOCIAL',            // 소셜 복구 지갑
  WATCH_ONLY = 'WATCH_ONLY',    // 조회 전용 지갑
}

// 계정 타입 열거
export enum AccountType {
  NORMAL = 'NORMAL',            // 일반 계정
  HARDWARE = 'HARDWARE',        // 하드웨어 계정
  MULTISIG = 'MULTISIG',        // 다중 서명 계정
  SMART_CONTRACT = 'SMART_CONTRACT',  // 스마트 컨트랙트 계정
  WATCH_ONLY = 'WATCH_ONLY',    // 조회 전용 계정
}

// 하드웨어 지갑 종류
export enum HardwareWalletType {
  LEDGER = 'LEDGER',
  TREZOR = 'TREZOR',
}

// 기본 계정 인터페이스
export interface BaseAccount {
  id: string;                 // 계정 고유 ID
  name: string;               // 계정 이름
  address: string;            // 계정 주소
  networkType: NetworkType;   // 계정 네트워크 유형
  type: AccountType;          // 계정 유형
  index?: number;             // HD 지갑에서의 계정 인덱스
  path?: string;              // 파생 경로
  publicKey?: string;         // 공개키 (선택적)
  hardwareType?: HardwareWalletType; // 하드웨어 지갑 유형 (하드웨어 계정인 경우)
  isImported?: boolean;       // 가져온 계정 여부
  isLocked?: boolean;         // 계정 잠금 상태
  icon?: string;              // 계정 아이콘 또는 색상
  createdAt: number;          // 계정 생성 시간
  lastUsedAt?: number;        // 마지막 사용 시간
}

// 계정 잔액 인터페이스
export interface AccountBalance {
  native: string;             // 네이티브 코인 잔액 (문자열로 된 정밀한 금액)
  tokens: {                   // 토큰 잔액 맵
    [tokenAddress: string]: string;
  };
  totalFiatValue?: string;    // 총 법정화폐 가치 (선택적)
}

// 계정 정보 인터페이스 (확장된 계정 세부 정보)
export interface AccountInfo extends BaseAccount {
  balance?: AccountBalance;   // 계정 잔액
  transactions?: string[];    // 트랜잭션 ID 목록
  nfts?: string[];            // NFT ID 목록
  nonce?: number;             // 계정 논스
  stake?: {                   // 스테이킹 정보
    amount: string;
    validator: string;
    unlockTime?: number;
    rewards?: string;
  }[];
}

// 지갑 인터페이스
export interface Wallet {
  id: string;                 // 지갑 고유 ID
  type: WalletType;           // 지갑 유형
  name: string;               // 지갑 이름
  accounts: BaseAccount[];    // 계정 목록
  defaultAccountId?: string;  // 기본 계정 ID
  vault?: {                   // 암호화된 민감 정보 저장소
    encryptedSeed?: string;   // 암호화된 시드
    encryptedMnemonic?: string; // 암호화된 니모닉
    encryptedPrivateKey?: string; // 암호화된 개인키
    version: string;          // 암호화 버전
    salt?: string;            // 솔트
    iv?: string;              // 초기화 벡터
  };
  primaryNetworkType: NetworkType; // 기본 네트워크 유형
  createdAt: number;          // 지갑 생성 시간
  lastBackupAt?: number;      // 마지막 백업 시간
  securityLevel?: number;     // 보안 수준 (1-5)
  recoveryOptions?: {         // 복구 옵션
    socialRecovery?: boolean;  // 소셜 복구 활성화 여부
    recoveryContacts?: string[]; // 복구 연락처 (암호화됨)
    securityQuestions?: boolean; // 보안 질문 활성화 여부
  };
}

// 지갑 생성 매개변수
export interface CreateWalletParams {
  name: string;               // 지갑 이름
  password: string;           // 지갑 비밀번호
  type: WalletType;           // 지갑 유형
  mnemonic?: string;          // 니모닉 구문 (선택적)
  privateKey?: string;        // 개인키 (선택적)
  keystoreJson?: string;      // 키스토어 JSON (선택적)
  keystorePassword?: string;  // 키스토어 비밀번호 (선택적)
  hardwareType?: HardwareWalletType; // 하드웨어 지갑 유형 (선택적)
  networkType?: NetworkType;  // 네트워크 유형 (선택적)
  derivationPath?: string;    // 파생 경로 (선택적)
}

// 지갑 가져오기 매개변수
export interface ImportWalletParams {
  name: string;               // 지갑 이름
  password: string;           // 지갑 비밀번호
  type: WalletType;           // 지갑 유형
  mnemonic?: string;          // 니모닉 구문 (선택적)
  privateKey?: string;        // 개인키 (선택적)
  keystoreJson?: string;      // 키스토어 JSON (선택적)
  keystorePassword?: string;  // 키스토어 비밀번호 (선택적)
  networkType?: NetworkType;  // 네트워크 유형 (선택적)
  derivationPath?: string;    // 파생 경로 (선택적)
}

// 계정 생성 매개변수
export interface CreateAccountParams {
  walletId: string;           // 지갑 ID
  name: string;               // 계정 이름
  networkType: NetworkType;   // 네트워크 유형
  index?: number;             // 계정 인덱스 (HD 지갑)
  password?: string;          // 지갑 비밀번호 (필요한 경우)
  type?: AccountType;         // 계정 유형
  privateKey?: string;        // 개인키 (가져오기 시)
  hardwareType?: HardwareWalletType; // 하드웨어 지갑 유형
  derivationPath?: string;    // 파생 경로
}

// 백업 데이터 인터페이스
export interface BackupData {
  wallets: Wallet[];          // 지갑 목록
  version: string;            // 백업 데이터 버전
  timestamp: number;          // 백업 시간
  encrypted: boolean;         // 암호화 여부
}

// 주소록 항목 인터페이스
export interface AddressBookEntry {
  id: string;                 // 항목 ID
  name: string;               // 이름
  address: string;            // 주소
  networkType: NetworkType;   // 네트워크 유형
  notes?: string;             // 메모
  emoji?: string;             // 이모지
  createdAt: number;          // 생성 시간
  lastUsedAt?: number;        // 마지막 사용 시간
  isFavorite?: boolean;       // 즐겨찾기 여부
  tags?: string[];            // 태그
}

// 지갑 상태 인터페이스
export interface WalletState {
  currentWalletId: string | null;   // 현재 지갑 ID
  currentAccountId: string | null;  // 현재 계정 ID
  wallets: { [id: string]: Wallet }; // 지갑 맵
  accounts: { [id: string]: AccountInfo }; // 계정 맵
  isLocked: boolean;                // 지갑 잠금 상태
  isInitialized: boolean;           // 지갑 초기화 상태
  lastUnlock: number | null;        // 마지막 잠금 해제 시간
  addressBook: { [id: string]: AddressBookEntry }; // 주소록
}

// 블록체인 계정 인터페이스 (여러 체인 유형에 대한 기본 인터페이스)
export interface BlockchainAccount {
  getAddress(): string;           // 주소 가져오기
  getPublicKey(): string;         // 공개키 가져오기
  sign(message: string): Promise<string>; // 메시지 서명
  signTransaction(transaction: any): Promise<string>; // 트랜잭션 서명
  verifySignature(message: string, signature: string): boolean; // 서명 검증
}
