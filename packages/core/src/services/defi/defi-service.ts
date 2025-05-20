/**
 * DeFi 서비스 클래스
 * 
 * DeFi 관련 기능을 통합 관리하는 서비스입니다.
 */

import { Pool, LiquidityPosition, FarmingPosition, LendingPool, LendingPosition, DefiTransaction } from '../../types';
import { LiquidityService } from './liquidity-service';
import { FarmingService } from './farming-service';
import { LendingService } from './lending-service';
import { PriceService } from './price-service';
import { SwapService } from './swap-service';

export class DefiService {
  private liquidityService: LiquidityService;
  private farmingService: FarmingService;
  private lendingService: LendingService;
  private priceService: PriceService;
  private swapService: SwapService;

  constructor() {
    this.liquidityService = new LiquidityService();
    this.farmingService = new FarmingService();
    this.lendingService = new LendingService();
    this.priceService = new PriceService();
    this.swapService = new SwapService();
  }

  /**
   * 네트워크에서 사용 가능한 모든 유동성 풀을 가져옵니다.
   * @param networkId 네트워크 ID
   * @param types 필터링할 풀 타입
   * @param status 필터링할 풀 상태
   * @param limit 결과 제한 수
   * @returns 유동성 풀 목록
   */
  async getPools(
    networkId: string,
    types?: ('SWAP' | 'FARM' | 'LENDING')[],
    status?: ('ACTIVE' | 'INACTIVE' | 'DEPRECATED')[],
    limit?: number
  ): Promise<Pool[]> {
    return this.liquidityService.getPools(networkId, types, status, limit);
  }

  /**
   * 특정 주소의 모든 유동성 포지션을 가져옵니다.
   * @param networkId 네트워크 ID
   * @param address 지갑 주소
   * @returns 유동성 포지션 목록
   */
  async getLiquidityPositions(networkId: string, address: string): Promise<LiquidityPosition[]> {
    return this.liquidityService.getPositions(networkId, address);
  }

  /**
   * 특정 주소의 모든 농사(파밍) 포지션을 가져옵니다.
   * @param networkId 네트워크 ID
   * @param address 지갑 주소
   * @returns 농사 포지션 목록
   */
  async getFarmingPositions(networkId: string, address: string): Promise<FarmingPosition[]> {
    return this.farmingService.getPositions(networkId, address);
  }

  /**
   * 특정 주소의 모든 대출 포지션을 가져옵니다.
   * @param networkId 네트워크 ID
   * @param address 지갑 주소
   * @returns 대출 포지션 목록
   */
  async getLendingPositions(networkId: string, address: string): Promise<LendingPosition[]> {
    return this.lendingService.getPositions(networkId, address);
  }

  /**
   * 특정 주소의 모든 DeFi 트랜잭션 기록을 가져옵니다.
   * @param networkId 네트워크 ID
   * @param address 지갑 주소
   * @param limit 결과 제한 수
   * @returns DeFi 트랜잭션 목록
   */
  async getTransactionHistory(
    networkId: string,
    address: string,
    limit?: number
  ): Promise<DefiTransaction[]> {
    const liquidityTxs = await this.liquidityService.getTransactionHistory(networkId, address);
    const farmingTxs = await this.farmingService.getTransactionHistory(networkId, address);
    const lendingTxs = await this.lendingService.getTransactionHistory(networkId, address);

    // 모든 트랜잭션을 타임스탬프 기준으로 정렬
    const allTxs = [...liquidityTxs, ...farmingTxs, ...lendingTxs].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    // 결과 제한
    if (limit && allTxs.length > limit) {
      return allTxs.slice(0, limit);
    }

    return allTxs;
  }

  /**
   * 토큰 가격 정보를 가져옵니다.
   * @param networkId 네트워크 ID
   * @param tokenAddress 토큰 주소
   * @returns 토큰 가격 정보
   */
  async getTokenPrice(networkId: string, tokenAddress: string) {
    return this.priceService.getTokenPrice(networkId, tokenAddress);
  }

  /**
   * 토큰 스왑 견적을 가져옵니다.
   * @param networkId 네트워크 ID
   * @param fromToken 스왑 소스 토큰 주소
   * @param toToken 스왑 대상 토큰 주소
   * @param amount 스왑할 금액
   * @returns 스왑 견적
   */
  async getSwapQuote(
    networkId: string,
    fromToken: string,
    toToken: string,
    amount: string
  ) {
    return this.swapService.getQuote(networkId, fromToken, toToken, amount);
  }

  /**
   * 유동성 추가 트랜잭션을 생성합니다.
   * @param poolId 풀 ID
   * @param fromAddress 발신자 주소
   * @param amounts 각 토큰의 금액 배열
   * @returns 트랜잭션 정보
   */
  async addLiquidity(
    networkId: string,
    poolId: string,
    fromAddress: string,
    amounts: string[]
  ): Promise<DefiTransaction> {
    return this.liquidityService.addLiquidity(networkId, poolId, fromAddress, amounts);
  }

  /**
   * 유동성 제거 트랜잭션을 생성합니다.
   * @param positionId 포지션 ID
   * @param fromAddress 발신자 주소
   * @param percentage 제거할 비율 (0-100)
   * @returns 트랜잭션 정보
   */
  async removeLiquidity(
    networkId: string,
    positionId: string,
    fromAddress: string,
    percentage: number
  ): Promise<DefiTransaction> {
    return this.liquidityService.removeLiquidity(networkId, positionId, fromAddress, percentage);
  }

  /**
   * LP 토큰 스테이킹 트랜잭션을 생성합니다.
   * @param networkId 네트워크 ID
   * @param farmId 파밍 풀 ID
   * @param fromAddress 발신자 주소
   * @param amount 스테이킹할 LP 토큰 양
   * @returns 트랜잭션 정보
   */
  async stakeLpToken(
    networkId: string,
    farmId: string,
    fromAddress: string,
    amount: string
  ): Promise<DefiTransaction> {
    return this.farmingService.stakeLpToken(networkId, farmId, fromAddress, amount);
  }

  /**
   * LP 토큰 언스테이킹 트랜잭션을 생성합니다.
   * @param networkId 네트워크 ID
   * @param positionId 파밍 포지션 ID
   * @param fromAddress 발신자 주소
   * @param percentage 언스테이킹할 비율 (0-100)
   * @returns 트랜잭션 정보
   */
  async unstakeLpToken(
    networkId: string,
    positionId: string,
    fromAddress: string,
    percentage: number
  ): Promise<DefiTransaction> {
    return this.farmingService.unstakeLpToken(networkId, positionId, fromAddress, percentage);
  }

  /**
   * 파밍 보상 수확 트랜잭션을 생성합니다.
   * @param networkId 네트워크 ID
   * @param positionId 파밍 포지션 ID
   * @param fromAddress 발신자 주소
   * @returns 트랜잭션 정보
   */
  async harvestRewards(
    networkId: string,
    positionId: string,
    fromAddress: string
  ): Promise<DefiTransaction> {
    return this.farmingService.harvestRewards(networkId, positionId, fromAddress);
  }

  /**
   * 대출 풀에 자산 공급 트랜잭션을 생성합니다.
   * @param networkId 네트워크 ID
   * @param poolId 대출 풀 ID
   * @param fromAddress 발신자 주소
   * @param amount 공급할 자산 양
   * @returns 트랜잭션 정보
   */
  async supplyAsset(
    networkId: string,
    poolId: string,
    fromAddress: string,
    amount: string
  ): Promise<DefiTransaction> {
    return this.lendingService.supplyAsset(networkId, poolId, fromAddress, amount);
  }

  /**
   * 대출 풀에서 자산 인출 트랜잭션을 생성합니다.
   * @param networkId 네트워크 ID
   * @param positionId 대출 포지션 ID
   * @param fromAddress 발신자 주소
   * @param amount 인출할 자산 양 (0 = 전체 인출)
   * @returns 트랜잭션 정보
   */
  async withdrawAsset(
    networkId: string,
    positionId: string,
    fromAddress: string,
    amount: string
  ): Promise<DefiTransaction> {
    return this.lendingService.withdrawAsset(networkId, positionId, fromAddress, amount);
  }

  /**
   * 자산 대출 트랜잭션을 생성합니다.
   * @param networkId 네트워크 ID
   * @param poolId 대출 풀 ID
   * @param fromAddress 발신자 주소
   * @param amount 대출할 자산 양
   * @returns 트랜잭션 정보
   */
  async borrowAsset(
    networkId: string,
    poolId: string,
    fromAddress: string,
    amount: string
  ): Promise<DefiTransaction> {
    return this.lendingService.borrowAsset(networkId, poolId, fromAddress, amount);
  }

  /**
   * 대출 상환 트랜잭션을 생성합니다.
   * @param networkId 네트워크 ID
   * @param positionId 대출 포지션 ID
   * @param fromAddress 발신자 주소
   * @param amount 상환할 자산 양 (0 = 전체 상환)
   * @returns 트랜잭션 정보
   */
  async repayAsset(
    networkId: string,
    positionId: string,
    fromAddress: string,
    amount: string
  ): Promise<DefiTransaction> {
    return this.lendingService.repayAsset(networkId, positionId, fromAddress, amount);
  }

  /**
   * 토큰 스왑 트랜잭션을 생성합니다.
   * @param networkId 네트워크 ID
   * @param fromAddress 발신자 주소
   * @param fromToken 스왑 소스 토큰 주소
   * @param toToken 스왑 대상 토큰 주소
   * @param amount 스왑할 금액
   * @param slippage 슬리피지 허용 비율
   * @returns 트랜잭션 정보
   */
  async swapTokens(
    networkId: string,
    fromAddress: string,
    fromToken: string,
    toToken: string,
    amount: string,
    slippage: number = 0.5
  ): Promise<DefiTransaction> {
    return this.swapService.swapTokens(
      networkId,
      fromAddress,
      fromToken,
      toToken,
      amount,
      slippage
    );
  }
}
