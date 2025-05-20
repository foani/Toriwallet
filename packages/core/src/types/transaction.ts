/**
 * transaction.ts
 * 
 * 이 모듈은 트랜잭션 관련 타입 및 인터페이스를 정의합니다.
 */

import { NetworkType } from '../constants/networks';

// 트랜잭션 타입 열거
export enum TransactionType {
  TRANSFER = 'TRANSFER',           // 일반 전송
  TOKEN_TRANSFER = 'TOKEN_TRANSFER', // 토큰 전송
  CONTRACT_DEPLOYMENT = 'CONTRACT_DEPLOYMENT', // 컨트랙트 배포
  CONTRACT_INTERACTION = 'CONTRACT_INTERACTION', // 컨트랙트 상호 작용
  STAKING = 'STAKING',             // 스테이킹
  UNSTAKING = 'UNSTAKING',         // 언스테이킹
  DELEGATE = 'DELEGATE',           // 위임
  UNDELEGATE = 'UNDELEGATE',       // 위임 취소
  CLAIM_REWARDS = 'CLAIM_REWARDS', // 보상 청구
  BRIDGE = 'BRIDGE',               // 브릿지 전송
  SWAP = 'SWAP',                   // 스왑
  NFT_TRANSFER = 'NFT_TRANSFER',   // NFT 전송
  NFT_MINT = 'NFT_MINT',           // NFT 민팅
  APPROVE = 'APPROVE',             // 토큰 승인
  CANCEL = 'CANCEL',               // 트랜잭션 취소
  BATCH = 'BATCH',                 // 배치 트랜잭션
  UNKNOWN = 'UNKNOWN',             // 알 수 없음
}

// 트랜잭션 상태 열거
export enum TransactionStatus {
  PENDING = 'PENDING',             // 대기 중
  CONFIRMING = 'CONFIRMING',       // 확인 중
  CONFIRMED = 'CONFIRMED',         // 확인됨
  FAILED = 'FAILED',               // 실패
  REJECTED = 'REJECTED',           // 거부됨
  CANCELLED = 'CANCELLED',         // 취소됨
  REPLACED = 'REPLACED',           // 대체됨
  UNKNOWN = 'UNKNOWN',             // 알 수 없음
}

// 가스 가격 수준 열거
export enum GasPriceLevel {
  LOW = 'LOW',                     // 낮음
  MEDIUM = 'MEDIUM',               // 중간
  HIGH = 'HIGH',                   // 높음
  CUSTOM = 'CUSTOM',               // 사용자 정의
}

// 트랜잭션 우선순위 열거
export enum TransactionPriority {
  LOW = 'LOW',                     // 낮음
  MEDIUM = 'MEDIUM',               // 중간
  HIGH = 'HIGH',                   // 높음
}

// 가스 정보 인터페이스 (EVM 체인용)
export interface GasInfo {
  gasLimit?: string;               // 가스 한도
  gasPrice?: string;               // 가스 가격 (Legacy)
  maxFeePerGas?: string;           // 최대 수수료 (EIP-1559)
  maxPriorityFeePerGas?: string;   // 최대 우선순위 수수료 (EIP-1559)
  estimatedGasLimit?: string;      // 예상 가스 한도
  estimatedFeeTotal?: string;      // 예상 총 수수료
  feeSymbol?: string;              // 수수료 심볼
  level?: GasPriceLevel;           // 가스 가격 수준
}

// EVM 트랜잭션 데이터 인터페이스
export interface EVMTransactionData {
  to: string;                      // 수신자 주소
  from: string;                    // 발신자 주소
  value: string;                   // 전송 금액 (wei 단위)
  data?: string;                   // 트랜잭션 데이터
  nonce?: number;                  // 논스
  gasLimit?: string;               // 가스 한도
  gasPrice?: string;               // 가스 가격 (Legacy)
  maxFeePerGas?: string;           // 최대 수수료 (EIP-1559)
  maxPriorityFeePerGas?: string;   // 최대 우선순위 수수료 (EIP-1559)
  chainId?: number;                // 체인 ID
}

// 비트코인 트랜잭션 데이터 인터페이스
export interface BitcoinTransactionData {
  to: string;                      // 수신자 주소
  from: string;                    // 발신자 주소
  amount: string;                  // 전송 금액 (satoshi 단위)
  fee: string;                     // 수수료
  feeRate?: string;                // 수수료율 (sat/vB)
  utxos?: any[];                   // 사용할 UTXO
  rbf?: boolean;                   // Replace-By-Fee 활성화 여부
}

// 솔라나 트랜잭션 데이터 인터페이스
export interface SolanaTransactionData {
  to: string;                      // 수신자 주소
  from: string;                    // 발신자 주소
  amount: string;                  // 전송 금액 (lamports 단위)
  rentExemptionAmount?: string;    // 렌트 면제 금액
  fee?: string;                    // 수수료
  durable?: boolean;               // 지속성 논스 사용 여부
}

// 스테이킹 트랜잭션 데이터 인터페이스
export interface StakingTransactionData {
  validatorAddress: string;        // 검증자 주소
  amount: string;                  // 스테이킹 금액
  lockupPeriod?: number;           // 잠금 기간 (일)
  autoCompound?: boolean;          // 자동 복리 여부
}

// 브릿지 트랜잭션 데이터 인터페이스
export interface BridgeTransactionData {
  sourceChain: NetworkType;        // 출발 체인
  destinationChain: NetworkType;   // 도착 체인
  sourceToken: string;             // 출발 토큰 주소
  destinationToken: string;        // 도착 토큰 주소
  amount: string;                  // 금액
  recipient: string;               // 수신자 주소
  slippage?: number;               // 슬리피지 (%)
}

// 토큰 트랜잭션 데이터 인터페이스
export interface TokenTransactionData {
  tokenAddress: string;            // 토큰 계약 주소
  to: string;                      // 수신자 주소
  from: string;                    // 발신자 주소
  amount: string;                  // 금액
  decimals: number;                // 토큰 소수점
  symbol: string;                  // 토큰 심볼
}

// NFT 트랜잭션 데이터 인터페이스
export interface NFTTransactionData {
  contractAddress: string;         // NFT 계약 주소
  tokenId: string;                 // 토큰 ID
  to: string;                      // 수신자 주소
  from: string;                    // 발신자 주소
  tokenType?: string;              // 토큰 유형 (ERC-721, ERC-1155 등)
  amount?: string;                 // 전송 수량 (ERC-1155 전용)
}

// 통합 트랜잭션 데이터 인터페이스
export interface TransactionData {
  evmData?: EVMTransactionData;
  bitcoinData?: BitcoinTransactionData;
  solanaData?: SolanaTransactionData;
  tokenData?: TokenTransactionData;
  nftData?: NFTTransactionData;
  stakingData?: StakingTransactionData;
  bridgeData?: BridgeTransactionData;
  memo?: string;                   // 메모
  referenceId?: string;            // 참조 ID
}

// 송금 매개변수 인터페이스
export interface TransferParams {
  from: string;                    // 발신자 주소
  to: string;                      // 수신자 주소
  amount: string;                  // 금액
  networkType: NetworkType;        // 네트워크 유형
  tokenAddress?: string;           // 토큰 주소 (토큰 전송 시)
  memo?: string;                   // 메모
  gasInfo?: GasInfo;               // 가스 정보
  priority?: TransactionPriority;  // 우선순위
  nonce?: number;                  // 논스
}

// 기본 트랜잭션 인터페이스
export interface Transaction {
  id: string;                      // 트랜잭션 ID (해시)
  type: TransactionType;           // 트랜잭션 유형
  status: TransactionStatus;       // 트랜잭션 상태
  networkType: NetworkType;        // 네트워크 유형
  fromAddress: string;             // 발신자 주소
  toAddress: string;               // 수신자 주소
  amount: string;                  // 금액
  fee?: string;                    // 수수료
  timestamp: number;               // 타임스탬프
  blockNumber?: number;            // 블록 번호
  blockHash?: string;              // 블록 해시
  confirmations?: number;          // 확인 수
  nonce?: number;                  // 논스
  data?: TransactionData;          // 세부 데이터
  gasInfo?: GasInfo;               // 가스 정보
  tokenInfo?: {                    // 토큰 정보
    symbol: string;                // 토큰 심볼
    decimals: number;              // 토큰 소수점
    address: string;               // 토큰 주소
    name?: string;                 // 토큰 이름
  };
  memo?: string;                   // 메모
  explorerUrl?: string;            // 익스플로러 URL
  replaced?: {                     // 대체 정보
    by: string;                    // 대체한 트랜잭션 ID
    reason: string;                // 대체 이유
  };
  failureReason?: string;          // 실패 이유
  retryCount?: number;             // 재시도 횟수
  createdAt: number;               // 생성 시간
  updatedAt: number;               // 업데이트 시간
}

// 트랜잭션 이벤트 인터페이스
export interface TransactionEvent {
  type: 'NEW' | 'UPDATE' | 'PENDING' | 'CONFIRMED' | 'FAILED';
  transaction: Transaction;
}

// 트랜잭션 서명 요청 인터페이스
export interface SignTransactionRequest {
  networkType: NetworkType;        // 네트워크 유형
  data: TransactionData;           // 트랜잭션 데이터
  from: string;                    // 발신자 주소
  type: TransactionType;           // 트랜잭션 유형
  origin?: string;                 // 요청 출처 (dApp URL 등)
  metadata?: any;                  // 추가 메타데이터
}

// 트랜잭션 서명 결과 인터페이스
export interface SignTransactionResult {
  signedTransaction: string;       // 서명된 트랜잭션
  transactionHash?: string;        // 트랜잭션 해시
  transaction?: Transaction;       // 트랜잭션 객체
}

// 트랜잭션 필터 인터페이스
export interface TransactionFilter {
  networkType?: NetworkType;       // 네트워크 유형
  type?: TransactionType[];        // 트랜잭션 유형
  status?: TransactionStatus[];    // 트랜잭션 상태
  fromAddress?: string;            // 발신자 주소
  toAddress?: string;              // 수신자 주소
  startDate?: number;              // 시작 날짜
  endDate?: number;                // 종료 날짜
  tokenAddress?: string;           // 토큰 주소
}

// 트랜잭션 정렬 옵션 인터페이스
export interface TransactionSortOptions {
  field: 'timestamp' | 'amount' | 'fee' | 'blockNumber' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

// 트랜잭션 페이지네이션 옵션 인터페이스
export interface TransactionPaginationOptions {
  page: number;                    // 페이지 번호
  limit: number;                   // 페이지당 항목 수
}

// 트랜잭션 목록 결과 인터페이스
export interface TransactionListResult {
  transactions: Transaction[];     // 트랜잭션 목록
  total: number;                   // 총 트랜잭션 수
  page: number;                    // 현재 페이지
  limit: number;                   // 페이지당 항목 수
  pages: number;                   // 총 페이지 수
}
