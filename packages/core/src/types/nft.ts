/**
 * nft.ts
 * 
 * 이 모듈은 NFT(Non-Fungible Token) 관련 타입 및 인터페이스를 정의합니다.
 */

import { NetworkType } from '../constants/networks';

// NFT 타입 열거
export enum NFTType {
  ERC721 = 'ERC721',        // ERC-721 표준 (이더리움)
  ERC1155 = 'ERC1155',      // ERC-1155 표준 (이더리움)
  CIP721 = 'CIP721',        // CIP-721 표준 (크리에타체인)
  SPL = 'SPL',              // SPL 표준 (솔라나)
  UNKNOWN = 'UNKNOWN',      // 알 수 없음
}

// NFT 표준 속성 인터페이스
export interface NFTMetadata {
  name?: string;            // NFT 이름
  description?: string;     // NFT 설명
  image?: string;           // 이미지 URL
  animation_url?: string;   // 애니메이션 URL (비디오, 3D 등)
  external_url?: string;    // 외부 URL
  background_color?: string; // 배경색
  attributes?: NFTAttribute[]; // 속성 목록
  properties?: any;         // 추가 속성
}

// NFT 속성 인터페이스
export interface NFTAttribute {
  trait_type: string;       // 속성 유형
  value: string | number;   // 속성 값
  display_type?: string;    // 표시 유형 (date, number, boost_percentage 등)
  max_value?: number;       // 최대 값
  rarity?: number;          // 희귀도 점수
}

// NFT 컬렉션 인터페이스
export interface NFTCollection {
  id: string;               // 컬렉션 ID
  contractAddress: string;  // 컨트랙트 주소
  name: string;             // 컬렉션 이름
  symbol?: string;          // 컬렉션 심볼
  description?: string;     // 컬렉션 설명
  imageUrl?: string;        // 대표 이미지 URL
  bannerUrl?: string;       // 배너 이미지 URL
  externalUrl?: string;     // 외부 URL
  networkType: NetworkType; // 네트워크 유형
  type: NFTType;            // NFT 타입
  floorPrice?: {            // 최저가 정보
    value: string;          // 가격
    currency: string;       // 통화
  };
  totalSupply?: string;     // 총 발행량
  ownerAddress?: string;    // 소유자 주소
  creatorAddress?: string;  // 창작자 주소
  verified?: boolean;       // 검증 여부
  createdAt?: number;       // 생성 시간
  updatedAt?: number;       // 업데이트 시간
  stats?: {                 // 통계 정보
    items: number;          // 항목 수
    owners: number;         // 소유자 수
    volume: string;         // 거래량
    sales: number;          // 판매 수
    averagePrice: string;   // 평균 가격
  };
}

// NFT 아이템 인터페이스
export interface NFTItem {
  id: string;                // NFT ID (고유 식별자)
  tokenId: string;           // 토큰 ID
  contractAddress: string;   // 컨트랙트 주소
  collectionId?: string;     // 컬렉션 ID
  networkType: NetworkType;  // 네트워크 유형
  type: NFTType;             // NFT 타입
  ownerAddress: string;      // 소유자 주소
  creatorAddress?: string;   // 창작자 주소
  metadata?: NFTMetadata;    // 메타데이터
  contentType?: string;      // 콘텐츠 유형 (image/jpeg, video/mp4 등)
  contentUrl?: string;       // 콘텐츠 URL
  thumbnailUrl?: string;     // 썸네일 URL
  name?: string;             // 이름
  description?: string;      // 설명
  amount?: string;           // 수량 (ERC-1155 전용)
  lastTransferredAt?: number; // 마지막 전송 시간
  mintedAt?: number;         // 발행 시간
  acquiredAt?: number;       // 획득 시간
  listing?: {                // 판매 정보
    marketplace: string;      // 마켓플레이스 이름
    price: string;            // 가격
    currency: string;         // 통화
    expiresAt?: number;       // 만료 시간
    url: string;              // 판매 URL
  };
  rarity?: {                 // 희귀도 정보
    rank?: number;            // 순위
    score?: number;           // 점수
    total?: number;           // 총 항목 수
  };
  cached?: boolean;          // 캐시 여부
  lastUpdated?: number;      // 마지막 업데이트 시간
}

// NFT 전송 매개변수 인터페이스
export interface NFTTransferParams {
  fromAddress: string;       // 발신자 주소
  toAddress: string;         // 수신자 주소
  contractAddress: string;   // 컨트랙트 주소
  tokenId: string;           // 토큰 ID
  networkType: NetworkType;  // 네트워크 유형
  amount?: string;           // 수량 (ERC-1155 전용)
  gasInfo?: any;             // 가스 정보
}

// NFT 민팅 매개변수 인터페이스
export interface NFTMintParams {
  toAddress: string;          // 수신자 주소
  contractAddress: string;    // 컨트랙트 주소
  metadata: NFTMetadata;      // 메타데이터
  networkType: NetworkType;   // 네트워크 유형
  contentFile?: File;         // 콘텐츠 파일
  amount?: string;            // 수량 (ERC-1155 전용)
  royalty?: number;           // 로열티 비율 (%)
  gasInfo?: any;              // 가스 정보
}

// NFT 필터 인터페이스
export interface NFTFilter {
  networkType?: NetworkType;  // 네트워크 유형
  type?: NFTType[];          // NFT 타입
  ownerAddress?: string;     // 소유자 주소
  collectionId?: string;     // 컬렉션 ID
  contractAddress?: string;  // 컨트랙트 주소
  search?: string;           // 검색어
  attributes?: {             // 속성 필터
    [trait: string]: string | number;
  };
  minPrice?: string;         // 최소 가격
  maxPrice?: string;         // 최대 가격
  sortBy?: 'name' | 'acquired' | 'tokenId' | 'price'; // 정렬 기준
  sortDir?: 'asc' | 'desc';  // 정렬 방향
}

// NFT 목록 결과 인터페이스
export interface NFTListResult {
  items: NFTItem[];          // NFT 항목 목록
  total: number;             // 총 항목 수
  page: number;              // 현재 페이지
  limit: number;             // 페이지당 항목 수
  pages: number;             // 총 페이지 수
}

// NFT 마켓플레이스 인터페이스
export interface NFTMarketplace {
  id: string;                // 마켓플레이스 ID
  name: string;              // 마켓플레이스 이름
  url: string;               // 마켓플레이스 URL
  logoUrl?: string;          // 로고 URL
  supportedNetworks: NetworkType[]; // 지원되는 네트워크
  supportedTypes: NFTType[]; // 지원되는 NFT 타입
  fees?: {                   // 수수료 정보
    buyer?: number;          // 구매자 수수료 (%)
    seller?: number;         // 판매자 수수료 (%)
  };
  verified: boolean;         // 검증 여부
}

// NFT 거래 이벤트 인터페이스
export interface NFTTradeEvent {
  id: string;                // 이벤트 ID
  nftId: string;             // NFT ID
  eventType: 'sale' | 'bid' | 'list' | 'unlist' | 'offer' | 'transfer'; // 이벤트 타입
  fromAddress: string;       // 발신자 주소
  toAddress: string;         // 수신자 주소
  price?: string;            // 가격
  currency?: string;         // 통화
  transactionHash?: string;  // 트랜잭션 해시
  marketplace?: string;      // 마켓플레이스
  timestamp: number;         // 타임스탬프
}

// NFT 컬렉션 통계 인터페이스
export interface NFTCollectionStats {
  collectionId: string;      // 컬렉션 ID
  floorPrice: string;        // 최저가
  volume24h: string;         // 24시간 거래량
  volumeTotal: string;       // 총 거래량
  items: number;             // 항목 수
  owners: number;            // 소유자 수
  sales: number;             // 판매 수
  averagePrice: string;      // 평균 가격
  listed: number;            // 판매 중인 항목 수
  listedPercent: number;     // 판매 중인 항목 비율 (%)
  updatedAt: number;         // 업데이트 시간
}

// NFT 가스 정보 인터페이스
export interface NFTGasInfo {
  mint: {                    // 민팅 관련 가스 정보
    gasLimit: string;        // 가스 한도
    gasPrice: string;        // 가스 가격
  };
  transfer: {                // 전송 관련 가스 정보
    gasLimit: string;        // 가스 한도
    gasPrice: string;        // 가스 가격
  };
  approval: {                // 승인 관련 가스 정보
    gasLimit: string;        // 가스 한도
    gasPrice: string;        // 가스 가격
  };
}

// NFT 상태 인터페이스
export interface NFTState {
  collections: Record<string, NFTCollection>; // 컬렉션 맵
  items: Record<string, NFTItem>; // 항목 맵
  ownedItems: string[];      // 소유한 항목 ID 목록
  marketplaces: NFTMarketplace[]; // 마켓플레이스 목록
  recentlyViewed: string[];  // 최근 본 항목 ID 목록
  favorites: string[];       // 즐겨찾기 항목 ID 목록
  gasInfo: Record<NetworkType, NFTGasInfo>; // 가스 정보 맵
  loading: boolean;          // 로딩 중 여부
  error?: string;            // 오류 메시지
  lastUpdated?: number;      // 마지막 업데이트 시간
}

// NFT 관리자 상태 인터페이스
export interface NFTManagerState {
  nftState: NFTState;        // NFT 상태
  currentView: 'gallery' | 'collection' | 'item' | 'marketplace'; // 현재 보기
  selectedCollection?: string; // 선택된 컬렉션
  selectedItem?: string;     // 선택된 항목
  filter: NFTFilter;         // 필터
  search: string;            // 검색어
}
