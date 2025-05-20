/**
 * network.ts
 * 
 * 이 모듈은 네트워크 관련 타입 및 인터페이스를 정의합니다.
 */

import { NetworkType } from '../constants/networks';

// 네트워크 상태 열거
export enum NetworkStatus {
  ONLINE = 'ONLINE',         // 온라인
  CONNECTING = 'CONNECTING', // 연결 중
  OFFLINE = 'OFFLINE',       // 오프라인
  ERROR = 'ERROR',           // 오류
  UNKNOWN = 'UNKNOWN',       // 알 수 없음
}

// 네트워크 제공자 타입 열거
export enum NetworkProviderType {
  RPC = 'RPC',               // JSON-RPC
  REST = 'REST',             // REST API
  WEBSOCKET = 'WEBSOCKET',   // WebSocket
  CUSTOM = 'CUSTOM',         // 사용자 정의
}

// 네트워크 제공자 인터페이스
export interface NetworkProvider {
  type: NetworkProviderType;  // 제공자 유형
  url: string;                // 제공자 URL
  timeout?: number;           // 타임아웃 (밀리초)
  apiKey?: string;            // API 키
  apiSecret?: string;         // API 시크릿
  headers?: Record<string, string>; // 추가 헤더
  options?: any;              // 추가 옵션
}

// 네트워크 연결 설정 인터페이스
export interface NetworkConnectionConfig {
  networkType: NetworkType;      // 네트워크 유형
  providers: NetworkProvider[];  // 제공자 목록
  chainId?: number;              // 체인 ID (EVM 체인용)
  fallbackStrategy?: 'sequential' | 'random'; // 폴백 전략
  maxRetries?: number;           // 최대 재시도 횟수
  retryDelay?: number;           // 재시도 지연 (밀리초)
}

// 네트워크 상태 인터페이스
export interface NetworkState {
  networkType: NetworkType;      // 네트워크 유형
  status: NetworkStatus;         // 네트워크 상태
  latency?: number;              // 지연 시간 (밀리초)
  blockHeight?: number;          // 블록 높이
  lastBlockTime?: number;        // 마지막 블록 시간
  peersCount?: number;           // 피어 수
  syncing?: boolean;             // 동기화 중 여부
  currentProvider?: string;      // 현재 사용 중인 제공자 URL
  error?: string;                // 오류 메시지
  updatedAt: number;             // 업데이트 시간
}

// 네트워크 수수료 정보 인터페이스
export interface NetworkFeeInfo {
  networkType: NetworkType;      // 네트워크 유형
  lowFee: string;                // 낮은 수수료
  mediumFee: string;             // 중간 수수료
  highFee: string;               // 높은 수수료
  baseFee?: string;              // 기본 수수료 (EIP-1559)
  maxPriorityFee?: {             // 최대 우선순위 수수료 (EIP-1559)
    low: string;
    medium: string;
    high: string;
  };
  feeUnit: string;               // 수수료 단위
  updatedAt: number;             // 업데이트 시간
}

// 블록 정보 인터페이스
export interface BlockInfo {
  networkType: NetworkType;      // 네트워크 유형
  blockNumber: number;           // 블록 번호
  blockHash: string;             // 블록 해시
  timestamp: number;             // 타임스탬프
  transactions: number;          // 트랜잭션 수
  size?: number;                 // 블록 크기
  gasUsed?: number;              // 사용된 가스
  gasLimit?: number;             // 가스 한도
  difficulty?: number;           // 난이도
  miner?: string;                // 채굴자 주소
}

// 사용자 정의 네트워크 인터페이스
export interface CustomNetwork {
  id: string;                    // 네트워크 ID
  name: string;                  // 네트워크 이름
  networkType: NetworkType;      // 네트워크 유형
  rpcUrl: string;                // RPC URL
  chainId?: number;              // 체인 ID (EVM 체인용)
  currencySymbol: string;        // 통화 기호
  currencyName: string;          // 통화 이름
  blockExplorerUrl?: string;     // 블록 탐색기 URL
  iconUrl?: string;              // 아이콘 URL
  isTestnet: boolean;            // 테스트넷 여부
  decimals: number;              // 소수점 자릿수
  isEVM: boolean;                // EVM 호환 여부
  createdAt: number;             // 생성 시간
  updatedAt: number;             // 업데이트 시간
}

// 네트워크 설정 인터페이스
export interface NetworkSettings {
  currentNetwork: NetworkType;   // 현재 네트워크
  customNetworks: CustomNetwork[]; // 사용자 정의 네트워크 목록
  autoSwitchNetwork: boolean;    // 자동 네트워크 전환 여부
  networkPreferences: {          // 네트워크별 설정
    [networkType in NetworkType]?: {
      defaultGasLimit?: string;  // 기본 가스 한도
      defaultGasPrice?: string;  // 기본 가스 가격
      preferredCurrency?: string; // 선호 통화
    };
  };
}

// 네트워크 이벤트 인터페이스
export interface NetworkEvent {
  type: 'CONNECTED' | 'DISCONNECTED' | 'CHANGED' | 'ERROR' | 'BLOCK';
  data: any;                     // 이벤트 데이터
  timestamp: number;             // 타임스탬프
}

// 네트워크 지원 기능 인터페이스
export interface NetworkFeatures {
  supportsENS: boolean;          // ENS 지원 여부
  supportsEIP1559: boolean;      // EIP-1559 지원 여부
  supportsMulticall: boolean;    // Multicall 지원 여부
  supportsOfflineTransactions: boolean; // 오프라인 트랜잭션 지원 여부
  supportsBatchTransactions: boolean; // 배치 트랜잭션 지원 여부
  supportsScheduledTransactions: boolean; // 예약 트랜잭션 지원 여부
  supportsSmartContracts: boolean; // 스마트 컨트랙트 지원 여부
  supportsCrossChainBridge: boolean; // 크로스체인 브릿지 지원 여부
  supportsStaking: boolean;      // 스테이킹 지원 여부
  supportsNFT: boolean;          // NFT 지원 여부
}

// 네트워크 브릿지 정보 인터페이스
export interface NetworkBridgeInfo {
  sourceNetwork: NetworkType;    // 출발 네트워크
  destNetwork: NetworkType;      // 도착 네트워크
  supportedTokens: string[];     // 지원되는 토큰 주소
  minAmount: string;             // 최소 금액
  maxAmount: string;             // 최대 금액
  fee: string;                   // 수수료
  processingTime: number;        // 처리 시간 (분)
  enabled: boolean;              // 활성화 여부
}

// 네트워크 통계 인터페이스
export interface NetworkStats {
  networkType: NetworkType;      // 네트워크 유형
  tps: number;                   // 초당 트랜잭션 수
  avgBlockTime: number;          // 평균 블록 시간 (초)
  avgGasPrice?: string;          // 평균 가스 가격
  activeAddresses?: number;      // 활성 주소 수
  marketCap?: string;            // 시가총액
  totalValueLocked?: string;     // 총 잠긴 가치
  updatedAt: number;             // 업데이트 시간
}

// 네트워크 관리자 상태 인터페이스
export interface NetworkManagerState {
  networks: Record<NetworkType, NetworkState>; // 네트워크 상태 맵
  currentNetwork: NetworkType;   // 현재 네트워크
  feeInfo: Record<NetworkType, NetworkFeeInfo>; // 수수료 정보 맵
  settings: NetworkSettings;     // 네트워크 설정
  features: Record<NetworkType, NetworkFeatures>; // 기능 지원 현황 맵
}
