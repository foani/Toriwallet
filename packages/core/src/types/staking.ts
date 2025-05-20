/**
 * staking.ts
 * 
 * 이 모듈은 스테이킹 관련 타입 및 인터페이스를 정의합니다.
 */

import { NetworkType } from '../constants/networks';

// 검증자 상태 열거
export enum ValidatorStatus {
  ACTIVE = 'ACTIVE',           // 활성
  INACTIVE = 'INACTIVE',       // 비활성
  JAILED = 'JAILED',           // 제재
  UNBONDING = 'UNBONDING',     // 언본딩 중
  WAITING = 'WAITING',         // 대기 중
}

// 스테이킹 상태 열거
export enum StakingStatus {
  ACTIVE = 'ACTIVE',           // 활성
  UNBONDING = 'UNBONDING',     // 언본딩 중
  UNLOCKED = 'UNLOCKED',       // 잠금 해제
  CLAIMED = 'CLAIMED',         // 청구됨
}

// 스테이킹 리워드 주기 열거
export enum RewardPeriod {
  DAILY = 'DAILY',             // 일별
  WEEKLY = 'WEEKLY',           // 주별
  MONTHLY = 'MONTHLY',         // 월별
  ANNUALLY = 'ANNUALLY',       // 연별
  EPOCH = 'EPOCH',             // 에포크별
}

// 검증자 인터페이스
export interface Validator {
  address: string;             // 검증자 주소
  name: string;                // 검증자 이름
  description?: string;        // 검증자 설명
  website?: string;            // 웹사이트
  identity?: string;           // 신원 정보
  imageUrl?: string;           // 이미지 URL
  status: ValidatorStatus;     // 검증자 상태
  commission: string;          // 수수료 (소수로 표시, 예: 0.05는 5%)
  totalStake: string;          // 총 스테이킹 금액
  selfStake?: string;          // 자체 스테이킹 금액
  delegatorCount?: number;     // 위임자 수
  uptime?: number;             // 가동 시간 (%)
  missedBlocks?: number;       // 누락된 블록 수
  rewardsPool?: string;        // 보상 풀
  votingPower?: string;        // 투표 파워
  networkType: NetworkType;    // 네트워크 유형
  apy?: string;                // 연간 수익률
  updatedAt: number;           // 업데이트 시간
}

// 스테이킹 잠금 기간 인터페이스
export interface StakingLockupPeriod {
  days: number;                // 잠금 기간 (일)
  multiplier: number;          // 보상 승수
  apy?: string;                // 연간 수익률
}

// 스테이킹 인터페이스
export interface Staking {
  id: string;                  // 스테이킹 ID
  accountId: string;           // 계정 ID
  validatorAddress: string;    // 검증자 주소
  amount: string;              // 스테이킹 금액
  networkType: NetworkType;    // 네트워크 유형
  status: StakingStatus;       // 스테이킹 상태
  lockupPeriod: number;        // 잠금 기간 (일)
  startTime: number;           // 시작 시간
  endTime: number;             // 종료 시간
  rewardsEarned?: string;      // 획득한 보상
  rewardsClaimed?: string;     // 청구한 보상
  apy?: string;                // 연간 수익률
  autoCompound?: boolean;      // 자동 복리 여부
  transactionHash?: string;    // 트랜잭션 해시
  unbondingTime?: number;      // 언본딩 시간
}

// 스테이킹 보상 인터페이스
export interface StakingReward {
  id: string;                  // 보상 ID
  stakingId: string;           // 스테이킹 ID
  amount: string;              // 보상 금액
  currency: string;            // 통화
  timestamp: number;           // 타임스탬프
  claimed: boolean;            // 청구 여부
  claimedAt?: number;          // 청구 시간
  transactionHash?: string;    // 트랜잭션 해시
}

// 스테이킹 매개변수 인터페이스
export interface StakingParams {
  accountId: string;           // 계정 ID
  validatorAddress: string;    // 검증자 주소
  amount: string;              // 스테이킹 금액
  networkType: NetworkType;    // 네트워크 유형
  lockupPeriod: number;        // 잠금 기간 (일)
  autoCompound?: boolean;      // 자동 복리 여부
  gas?: any;                   // 가스 정보
}

// 언스테이킹 매개변수 인터페이스
export interface UnstakingParams {
  stakingId: string;           // 스테이킹 ID
  amount?: string;             // 언스테이킹 금액 (부분 언스테이킹 시)
  gas?: any;                   // 가스 정보
}

// 보상 청구 매개변수 인터페이스
export interface ClaimRewardsParams {
  stakingId: string;           // 스테이킹 ID
  gas?: any;                   // 가스 정보
}

// 위임 매개변수 인터페이스
export interface DelegationParams {
  accountId: string;           // 계정 ID
  fromValidatorAddress: string; // 이전 검증자 주소
  toValidatorAddress: string;  // 새 검증자 주소
  amount: string;              // 위임 금액
  networkType: NetworkType;    // 네트워크 유형
  gas?: any;                   // 가스 정보
}

// 스테이킹 통계 인터페이스
export interface StakingStats {
  networkType: NetworkType;    // 네트워크 유형
  totalStaked: string;         // 총 스테이킹 금액
  activeValidators: number;    // 활성 검증자 수
  totalValidators: number;     // 총 검증자 수
  averageApy: string;          // 평균 연간 수익률
  inflationRate?: string;      // 인플레이션율
  stakingRatio?: string;       // 스테이킹 비율
  minStake?: string;           // 최소 스테이킹 금액
  unbondingTime?: number;      // 언본딩 시간 (일)
  epochLength?: number;        // 에포크 길이 (블록)
  currentEpoch?: number;       // 현재 에포크
  nextEpochTime?: number;      // 다음 에포크 시간
  updatedAt: number;           // 업데이트 시간
}

// 스테이킹 예측 인터페이스
export interface StakingProjection {
  principal: string;           // 원금
  stakingPeriod: number;       // 스테이킹 기간 (일)
  apy: string;                 // 연간 수익률
  estimatedRewards: string;    // 예상 보상
  estimatedTotal: string;      // 예상 총액
  rewardSchedule: {            // 보상 일정
    time: number;              // 시간
    reward: string;            // 보상
    total: string;             // 총액
  }[];
  compoundEffect?: string;     // 복리 효과
}

// 검증자 필터 인터페이스
export interface ValidatorFilter {
  networkType?: NetworkType;   // 네트워크 유형
  status?: ValidatorStatus[];  // 검증자 상태
  minCommission?: number;      // 최소 수수료
  maxCommission?: number;      // 최대 수수료
  search?: string;             // 검색어
  sortBy?: 'stake' | 'name' | 'commission' | 'apy' | 'uptime'; // 정렬 기준
  sortDir?: 'asc' | 'desc';    // 정렬 방향
}

// 스테이킹 필터 인터페이스
export interface StakingFilter {
  networkType?: NetworkType;   // 네트워크 유형
  status?: StakingStatus[];    // 스테이킹 상태
  validatorAddress?: string;   // 검증자 주소
  accountId?: string;          // 계정 ID
  minAmount?: string;          // 최소 금액
  maxAmount?: string;          // 최대 금액
  startDateFrom?: number;      // 시작 날짜 (시작)
  startDateTo?: number;        // 시작 날짜 (종료)
  endDateFrom?: number;        // 종료 날짜 (시작)
  endDateTo?: number;          // 종료 날짜 (종료)
  sortBy?: 'amount' | 'startTime' | 'endTime' | 'apy'; // 정렬 기준
  sortDir?: 'asc' | 'desc';    // 정렬 방향
}

// 스테이킹 목록 결과 인터페이스
export interface StakingListResult {
  items: Staking[];            // 스테이킹 목록
  total: number;               // 총 항목 수
  page: number;                // 현재 페이지
  limit: number;               // 페이지당 항목 수
  pages: number;               // 총 페이지 수
}

// 검증자 목록 결과 인터페이스
export interface ValidatorListResult {
  items: Validator[];          // 검증자 목록
  total: number;               // 총 항목 수
  page: number;                // 현재 페이지
  limit: number;               // 페이지당 항목 수
  pages: number;               // 총 페이지 수
}

// 스테이킹 상태 인터페이스
export interface StakingState {
  validators: Record<NetworkType, Record<string, Validator>>; // 검증자 맵
  stakings: Record<string, Staking>; // 스테이킹 맵
  rewards: Record<string, StakingReward[]>; // 보상 맵
  stats: Record<NetworkType, StakingStats>; // 통계 맵
  lockupPeriods: Record<NetworkType, StakingLockupPeriod[]>; // 잠금 기간 맵
  loading: boolean;            // 로딩 중 여부
  error?: string;              // 오류 메시지
  lastUpdated?: number;        // 마지막 업데이트 시간
}

// 스테이킹 관리자 상태 인터페이스
export interface StakingManagerState {
  stakingState: StakingState;  // 스테이킹 상태
  selectedValidator?: string;  // 선택된 검증자
  selectedStaking?: string;    // 선택된 스테이킹
  validatorFilter: ValidatorFilter; // 검증자 필터
  stakingFilter: StakingFilter; // 스테이킹 필터
  pendingTransactions: Record<string, any>; // 대기 중인 트랜잭션
}
