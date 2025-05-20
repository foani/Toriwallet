/**
 * dapp.ts
 * 
 * 이 모듈은 dApp 브라우저 및 연결과 관련된 타입 및 인터페이스를 정의합니다.
 */

import { NetworkType } from '../constants/networks';

// dApp 카테고리 열거
export enum DAppCategory {
  EXCHANGE = 'EXCHANGE',        // 거래소
  DEFI = 'DEFI',                // DeFi
  NFT = 'NFT',                  // NFT
  GAMING = 'GAMING',            // 게임
  SOCIAL = 'SOCIAL',            // 소셜
  GOVERNANCE = 'GOVERNANCE',    // 거버넌스
  UTILITY = 'UTILITY',          // 유틸리티
  OTHER = 'OTHER',              // 기타
}

// dApp 연결 상태 열거
export enum DAppConnectionStatus {
  CONNECTED = 'CONNECTED',      // 연결됨
  DISCONNECTED = 'DISCONNECTED', // 연결 해제됨
  CONNECTING = 'CONNECTING',    // 연결 중
  ERROR = 'ERROR',              // 오류
}

// dApp 권한 열거
export enum DAppPermission {
  VIEW_ACCOUNT = 'VIEW_ACCOUNT',    // 계정 보기
  SIGN_MESSAGE = 'SIGN_MESSAGE',    // 메시지 서명
  SIGN_TRANSACTION = 'SIGN_TRANSACTION', // 트랜잭션 서명
  SEND_TRANSACTION = 'SEND_TRANSACTION', // 트랜잭션 전송
  ALL = 'ALL',                      // 모든 권한
}

// dApp 정보 인터페이스
export interface DAppInfo {
  id: string;                   // dApp ID
  name: string;                 // dApp 이름
  url: string;                  // dApp URL
  description?: string;         // dApp 설명
  category: DAppCategory;       // dApp 카테고리
  icon?: string;                // 아이콘 URL
  supportedNetworks: NetworkType[]; // 지원되는 네트워크
  rating?: number;              // 평점 (5점 만점)
  reviews?: number;             // 리뷰 수
  verified: boolean;            // 검증 여부
  featured?: boolean;           // 주목할만한 dApp 여부
  popular?: boolean;            // 인기 dApp 여부
  installs?: number;            // 설치 수
  version?: string;             // 버전
  lastUpdated?: number;         // 마지막 업데이트 시간
  tags?: string[];              // 태그
  developer?: {                 // 개발자 정보
    name: string;               // 개발자 이름
    website?: string;           // 개발자 웹사이트
    email?: string;             // 개발자 이메일
  };
  audited?: boolean;            // 감사 여부
  contract?: {                  // 컨트랙트 정보
    address: string;            // 컨트랙트 주소
    network: NetworkType;       // 네트워크
  }[];
  createdAt: number;            // 생성 시간
  updatedAt: number;            // 업데이트 시간
}

// dApp 연결 인터페이스
export interface DAppConnection {
  id: string;                   // 연결 ID
  dappId: string;               // dApp ID
  dappName: string;             // dApp 이름
  dappUrl: string;              // dApp URL
  dappIcon?: string;            // dApp 아이콘
  accountId: string;            // 연결된 계정 ID
  accountAddress: string;       // 연결된 계정 주소
  networkType: NetworkType;     // 연결된 네트워크
  status: DAppConnectionStatus; // 연결 상태
  permissions: DAppPermission[]; // 권한 목록
  origin: string;               // 출처 URL
  connectedAt: number;          // 연결 시간
  lastAccessedAt: number;       // 마지막 액세스 시간
  expireAt?: number;            // 만료 시간
  metadata?: any;               // 추가 메타데이터
}

// dApp 브라우저 히스토리 항목 인터페이스
export interface DAppBrowserHistoryItem {
  id: string;                   // 히스토리 항목 ID
  url: string;                  // URL
  title: string;                // 제목
  favicon?: string;             // 파비콘
  timestamp: number;            // 타임스탬프
}

// dApp 브라우저 북마크 인터페이스
export interface DAppBrowserBookmark {
  id: string;                   // 북마크 ID
  url: string;                  // URL
  title: string;                // 제목
  favicon?: string;             // 파비콘
  folder?: string;              // 폴더
  createdAt: number;            // 생성 시간
  updatedAt: number;            // 업데이트 시간
}

// dApp 연결 요청 인터페이스
export interface DAppConnectionRequest {
  id: string;                   // 요청 ID
  dappName: string;             // dApp 이름
  dappUrl: string;              // dApp URL
  dappIcon?: string;            // dApp 아이콘
  networkType: NetworkType;     // 요청 네트워크
  permissions: DAppPermission[]; // 요청 권한
  origin: string;               // 출처 URL
  timestamp: number;            // 타임스탬프
}

// 메시지 서명 요청 인터페이스
export interface SignMessageRequest {
  id: string;                   // 요청 ID
  connectionId: string;         // 연결 ID
  message: string;              // 메시지
  messageType: 'utf8' | 'hex';  // 메시지 유형
  standard?: 'personal_sign' | 'eth_sign' | 'signTypedData'; // 서명 표준
  origin: string;               // 출처 URL
  timestamp: number;            // 타임스탬프
}

// 로컬 스토리지 액세스 요청 인터페이스
export interface StorageAccessRequest {
  id: string;                   // 요청 ID
  connectionId: string;         // 연결 ID
  operation: 'get' | 'set' | 'remove' | 'clear'; // 작업
  key?: string;                 // 키
  value?: any;                  // 값
  origin: string;               // 출처 URL
  timestamp: number;            // 타임스탬프
}

// dApp 브라우저 상태 인터페이스
export interface DAppBrowserState {
  history: DAppBrowserHistoryItem[]; // 히스토리
  bookmarks: DAppBrowserBookmark[]; // 북마크
  currentUrl?: string;          // 현재 URL
  currentTitle?: string;        // 현재 제목
  currentFavicon?: string;      // 현재 파비콘
  currentDApp?: DAppInfo;       // 현재 dApp 정보
  loading: boolean;             // 로딩 중 여부
  error?: string;               // 오류 메시지
  canGoBack: boolean;           // 뒤로 갈 수 있는지 여부
  canGoForward: boolean;        // 앞으로 갈 수 있는지 여부
}

// dApp 관리자 상태 인터페이스
export interface DAppManagerState {
  dapps: Record<string, DAppInfo>; // dApp 맵
  connections: Record<string, DAppConnection>; // 연결 맵
  browserState: DAppBrowserState; // 브라우저 상태
  pendingRequests: {              // 대기 중인 요청
    connections: DAppConnectionRequest[]; // 연결 요청
    signMessages: SignMessageRequest[]; // 메시지 서명 요청
    transactions: any[];         // 트랜잭션 요청
    storageAccess: StorageAccessRequest[]; // 스토리지 액세스 요청
  };
  recentlyUsed: string[];       // 최근 사용한 dApp ID 목록
  favorites: string[];          // 즐겨찾기 dApp ID 목록
  loading: boolean;             // 로딩 중 여부
  error?: string;               // 오류 메시지
  lastUpdated?: number;         // 마지막 업데이트 시간
}

// Web3 공급자 인터페이스
export interface Web3Provider {
  isConnected(): boolean;       // 연결 여부 확인
  request(payload: any): Promise<any>; // 요청 보내기
  on(event: string, listener: any): void; // 이벤트 리스너 등록
  removeListener(event: string, listener: any): void; // 이벤트 리스너 제거
  disconnect(): void;           // 연결 해제
}

// dApp 검색 필터 인터페이스
export interface DAppSearchFilter {
  category?: DAppCategory[];    // 카테고리
  network?: NetworkType[];      // 네트워크
  verified?: boolean;           // 검증 여부
  featured?: boolean;           // 주목할만한 dApp 여부
  popular?: boolean;            // 인기 dApp 여부
  search?: string;              // 검색어
  tags?: string[];              // 태그
  sortBy?: 'name' | 'rating' | 'installs' | 'updated'; // 정렬 기준
  sortDir?: 'asc' | 'desc';     // 정렬 방향
}

// dApp 목록 결과 인터페이스
export interface DAppListResult {
  items: DAppInfo[];            // dApp 목록
  total: number;                // 총 항목 수
  page: number;                 // 현재 페이지
  limit: number;                // 페이지당 항목 수
  pages: number;                // 총 페이지 수
}

// dApp 리뷰 인터페이스
export interface DAppReview {
  id: string;                   // 리뷰 ID
  dappId: string;               // dApp ID
  userId: string;               // 사용자 ID
  username: string;             // 사용자 이름
  rating: number;               // 평점 (5점 만점)
  comment?: string;             // 댓글
  version?: string;             // 리뷰한 버전
  createdAt: number;            // 생성 시간
  updatedAt: number;            // 업데이트 시간
}

// WalletConnect 세션 인터페이스
export interface WalletConnectSession {
  id: string;                   // 세션 ID
  topic: string;                // 세션 토픽
  name: string;                 // dApp 이름
  url: string;                  // dApp URL
  icon?: string;                // dApp 아이콘
  accountId: string;            // 연결된 계정 ID
  accountAddress: string;       // 연결된 계정 주소
  networkType: NetworkType;     // 연결된 네트워크
  permissions: DAppPermission[]; // 권한 목록
  expiry: number;               // 만료 시간
  createdAt: number;            // 생성 시간
  updatedAt: number;            // 업데이트 시간
}
