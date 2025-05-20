# TORI 지갑 크로스체인 아키텍처 (Part 3)

### 5.2 크로스체인 스왑 구현

```typescript
// 크로스체인 스왑 서비스 예시 코드
// src/services/crosschain/swap.ts

export class CrosschainSwap {
  // 스왑 견적 가져오기
  static async getQuote(options: SwapQuoteOptions): Promise<SwapQuote> {
    // 옵션 검증
    this.validateQuoteOptions(options);
    
    // 스왑 경로 찾기
    const routes = await this.findSwapRoutes(options);
    
    // 최적의 경로 선택
    const bestRoute = this.findBestRoute(routes);
    
    // 견적 생성
    const quote: SwapQuote = {
      sourceChainId: options.sourceChainId,
      targetChainId: options.targetChainId,
      sourceToken: options.sourceToken,
      targetToken: options.targetToken,
      sourceAmount: options.sourceAmount,
      targetAmount: bestRoute.targetAmount,
      exchangeRate: this.calculateExchangeRate(options.sourceAmount, bestRoute.targetAmount),
      fee: bestRoute.fee,
      estimatedDuration: bestRoute.estimatedDuration,
      route: bestRoute.path,
      slippage: options.slippage || '0.005', // 기본 슬리피지 0.5%
      validUntil: new Date(Date.now() + 60000).toISOString(), // 1분 동안 유효
    };
    
    return quote;
  }
  
  // 스왑 생성
  static async createSwap(options: SwapOptions): Promise<Swap> {
    // 옵션 검증
    this.validateSwapOptions(options);
    
    // 견적 가져오기
    const quote = await this.getQuote({
      sourceChainId: options.sourceChainId,
      targetChainId: options.targetChainId,
      sourceToken: options.sourceToken,
      targetToken: options.targetToken,
      sourceAmount: options.sourceAmount,
      slippage: options.slippage,
    });
    
    // 견적이 만료되었는지 확인
    if (new Date(quote.validUntil).getTime() < Date.now()) {
      throw new Error('Quote has expired');
    }
    
    // 스왑 ID 생성
    const swapId = this.generateSwapId();
    
    // 소스 체인 트랜잭션 생성
    const sourceTx = await this.createSourceTransaction(options, quote);
    
    // 소스 체인에 트랜잭션 전송
    const sourceTxHash = await this.sendTransaction(sourceTx, options.sourceChainId);
    
    // 스왑 상태 생성
    const swap: Swap = {
      id: swapId,
      sourceChainId: options.sourceChainId,
      targetChainId: options.targetChainId,
      senderAddress: options.senderAddress,
      recipientAddress: options.recipientAddress,
      sourceToken: options.sourceToken,
      targetToken: options.targetToken,
      sourceAmount: options.sourceAmount,
      targetAmount: quote.targetAmount,
      sourceTxHash,
      targetTxHash: null,
      route: quote.route,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
      fee: quote.fee,
      exchangeRate: quote.exchangeRate,
      slippage: options.slippage || quote.slippage,
    };
    
    // 스왑 상태 저장
    await this.saveSwap(swap);
    
    return swap;
  }
  
  // 스왑 상태 확인
  static async getSwapStatus(swapId: string): Promise<SwapStatus> {
    // 스왑 정보 가져오기
    const swap = await this.getSwap(swapId);
    
    if (!swap) {
      throw new Error(`Swap with ID ${swapId} not found`);
    }
    
    // 이미 완료된 스왑인 경우
    if (swap.status === 'completed' || swap.status === 'failed') {
      return swap.status;
    }
    
    // 소스 체인 트랜잭션 확인
    const sourceTxStatus = await this.getTransactionStatus(swap.sourceTxHash, swap.sourceChainId);
    
    // 소스 체인 트랜잭션이 실패한 경우
    if (sourceTxStatus === 'failed') {
      swap.status = 'failed';
      await this.updateSwap(swap);
      return 'failed';
    }
    
    // 소스 체인 트랜잭션이 아직 완료되지 않은 경우
    if (sourceTxStatus !== 'confirmed') {
      return 'pending';
    }
    
    // 대상 체인 트랜잭션이 없는 경우
    if (!swap.targetTxHash) {
      // 크로스체인 프로세서 상태 확인
      const processorStatus = await this.getProcessorStatus(swap.id);
      
      // 프로세서 처리 중인 경우
      if (processorStatus === 'processing') {
        return 'processing';
      }
      
      // 프로세서가 대상 체인 트랜잭션을 생성한 경우
      if (processorStatus === 'swapped') {
        swap.targetTxHash = await this.getTargetTxHash(swap.id);
        await this.updateSwap(swap);
      }
    }
    
    // 대상 체인 트랜잭션이 있는 경우
    if (swap.targetTxHash) {
      const targetTxStatus = await this.getTransactionStatus(swap.targetTxHash, swap.targetChainId);
      
      // 대상 체인 트랜잭션이 확인된 경우
      if (targetTxStatus === 'confirmed') {
        // 실제 수령 금액 확인
        const actualAmount = await this.getActualReceivedAmount(swap.targetTxHash, swap.targetChainId);
        
        // 슬리피지 계산
        const minAmount = this.calculateMinimumAmount(swap.targetAmount, swap.slippage);
        
        // 최소 금액보다 작은 경우
        if (parseFloat(actualAmount) < parseFloat(minAmount)) {
          swap.status = 'completed_with_slippage';
        } else {
          swap.status = 'completed';
        }
        
        swap.completedAt = new Date().toISOString();
        swap.targetAmount = actualAmount; // 실제 수령 금액으로 업데이트
        await this.updateSwap(swap);
        
        return swap.status as SwapStatus;
      }
      
      // 대상 체인 트랜잭션이 실패한 경우
      if (targetTxStatus === 'failed') {
        swap.status = 'failed';
        await this.updateSwap(swap);
        return 'failed';
      }
      
      return 'processing';
    }
    
    return 'pending';
  }
  
  // 스왑 목록 가져오기
  static async getSwaps(address: string, options?: SwapListOptions): Promise<Swap[]> {
    // 주소별 스왑 목록 가져오기
    const swaps = await this.getSwapsByAddress(address);
    
    // 옵션에 따라 필터링
    let filteredSwaps = swaps;
    
    if (options?.status) {
      filteredSwaps = filteredSwaps.filter(swap => swap.status === options.status);
    }
    
    if (options?.sourceToken) {
      filteredSwaps = filteredSwaps.filter(swap => swap.sourceToken === options.sourceToken);
    }
    
    if (options?.targetToken) {
      filteredSwaps = filteredSwaps.filter(swap => swap.targetToken === options.targetToken);
    }
    
    if (options?.sourceChainId) {
      filteredSwaps = filteredSwaps.filter(swap => swap.sourceChainId === options.sourceChainId);
    }
    
    if (options?.targetChainId) {
      filteredSwaps = filteredSwaps.filter(swap => swap.targetChainId === options.targetChainId);
    }
    
    // 정렬
    filteredSwaps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // 페이지네이션
    if (options?.limit && options?.offset) {
      filteredSwaps = filteredSwaps.slice(options.offset, options.offset + options.limit);
    } else if (options?.limit) {
      filteredSwaps = filteredSwaps.slice(0, options.limit);
    }
    
    return filteredSwaps;
  }
  
  // 스왑 취소
  static async cancelSwap(swapId: string): Promise<boolean> {
    // 스왑 정보 가져오기
    const swap = await this.getSwap(swapId);
    
    if (!swap) {
      throw new Error(`Swap with ID ${swapId} not found`);
    }
    
    // 이미 완료되거나 실패한 스왑은 취소할 수 없음
    if (swap.status === 'completed' || swap.status === 'failed' || swap.status === 'completed_with_slippage') {
      throw new Error(`Cannot cancel swap with status ${swap.status}`);
    }
    
    // 소스 체인 트랜잭션 상태 확인
    const sourceTxStatus = await this.getTransactionStatus(swap.sourceTxHash, swap.sourceChainId);
    
    // 소스 체인 트랜잭션이 확인된 경우 취소할 수 없음
    if (sourceTxStatus === 'confirmed') {
      throw new Error('Cannot cancel swap after source transaction has been confirmed');
    }
    
    // 소스 체인 트랜잭션 취소 (가속화 트랜잭션 전송)
    const cancelTxHash = await this.cancelTransaction(swap.sourceTxHash, swap.sourceChainId);
    
    // 스왑 상태 업데이트
    swap.status = 'cancelled';
    await this.updateSwap(swap);
    
    return true;
  }
  
  // 그 외 필요한 메서드들...
}

export interface SwapQuoteOptions {
  sourceChainId: number;
  targetChainId: number;
  sourceToken: string;
  targetToken: string;
  sourceAmount: string;
  slippage?: string;
}

export interface SwapQuote {
  sourceChainId: number;
  targetChainId: number;
  sourceToken: string;
  targetToken: string;
  sourceAmount: string;
  targetAmount: string;
  exchangeRate: string;
  fee: string;
  estimatedDuration: number; // 예상 소요 시간 (분)
  route: string[];
  slippage: string;
  validUntil: string;
}

export interface SwapOptions {
  sourceChainId: number;
  targetChainId: number;
  senderAddress: string;
  recipientAddress: string;
  sourceToken: string;
  targetToken: string;
  sourceAmount: string;
  slippage?: string;
}

export interface Swap {
  id: string;
  sourceChainId: number;
  targetChainId: number;
  senderAddress: string;
  recipientAddress: string;
  sourceToken: string;
  targetToken: string;
  sourceAmount: string;
  targetAmount: string;
  sourceTxHash: string;
  targetTxHash: string | null;
  route: string[];
  status: SwapStatus;
  createdAt: string;
  completedAt: string | null;
  fee: string;
  exchangeRate: string;
  slippage: string;
}

export type SwapStatus = 'pending' | 'processing' | 'completed' | 'completed_with_slippage' | 'failed' | 'cancelled';

export interface SwapListOptions {
  status?: SwapStatus;
  sourceToken?: string;
  targetToken?: string;
  sourceChainId?: number;
  targetChainId?: number;
  limit?: number;
  offset?: number;
}
```

### 5.3 크로스체인 라우팅

크로스체인 스왑은 최적의 교환 경로를 찾기 위해 크로스체인 라우팅 알고리즘을 사용합니다:

```typescript
// 크로스체인 라우팅 서비스 예시 코드
// src/services/crosschain/routing.ts

export class CrosschainRouting {
  // 최적 경로 찾기
  static async findBestRoute(options: RouteOptions): Promise<Route[]> {
    // 옵션 검증
    this.validateRouteOptions(options);
    
    // 직접 경로 확인
    const directRoute = await this.findDirectRoute(options);
    
    // 간접 경로 확인
    const indirectRoutes = await this.findIndirectRoutes(options);
    
    // 모든 경로 합치기
    const allRoutes = directRoute ? [directRoute, ...indirectRoutes] : indirectRoutes;
    
    // 경로가 없는 경우
    if (allRoutes.length === 0) {
      throw new Error(`No route found for swap from ${options.sourceToken} on chain ${options.sourceChainId} to ${options.targetToken} on chain ${options.targetChainId}`);
    }
    
    // 각 경로의 비용 계산
    const routesWithCost = await Promise.all(
      allRoutes.map(async route => {
        const cost = await this.calculateRouteCost(route, options.sourceAmount);
        return { ...route, cost };
      })
    );
    
    // 비용에 따라 정렬
    routesWithCost.sort((a, b) => {
      // 더 많은 타겟 금액이 더 좋음
      const aValue = parseFloat(a.cost.targetAmount);
      const bValue = parseFloat(b.cost.targetAmount);
      return bValue - aValue;
    });
    
    return routesWithCost;
  }
  
  // 경로 비용 계산
  static async calculateRouteCost(route: Route, sourceAmount: string): Promise<RouteCost> {
    let currentAmount = sourceAmount;
    let totalFee = '0';
    let totalDuration = 0;
    
    // 각 단계별 비용 계산
    for (const step of route.steps) {
      // 현재 단계의 비용 계산
      let stepCost;
      
      switch (step.type) {
        case 'swap':
          stepCost = await this.calculateSwapCost(step, currentAmount);
          break;
        case 'bridge':
          stepCost = await this.calculateBridgeCost(step, currentAmount);
          break;
        case 'icp':
          stepCost = await this.calculateICPCost(step, currentAmount);
          break;
        default:
          throw new Error(`Unsupported step type: ${step.type}`);
      }
      
      // 현재 금액 업데이트
      currentAmount = stepCost.targetAmount;
      
      // 총 수수료 업데이트
      totalFee = this.addAmounts(totalFee, stepCost.fee);
      
      // 총 소요 시간 업데이트
      totalDuration += stepCost.duration;
    }
    
    return {
      sourceAmount,
      targetAmount: currentAmount,
      fee: totalFee,
      duration: totalDuration,
    };
  }
  
  // 경로 비교
  static compareRoutes(routes: Route[]): Route {
    if (routes.length === 0) {
      throw new Error('No routes provided for comparison');
    }
    
    // 비용에 따라 정렬
    routes.sort((a, b) => {
      // 더 많은 타겟 금액이 더 좋음
      const aValue = parseFloat(a.cost.targetAmount);
      const bValue = parseFloat(b.cost.targetAmount);
      
      if (aValue !== bValue) {
        return bValue - aValue;
      }
      
      // 같은 금액이면 더 짧은 소요 시간이 더 좋음
      return a.cost.duration - b.cost.duration;
    });
    
    return routes[0];
  }
  
  // 그 외 필요한 메서드들...
}

export interface RouteOptions {
  sourceChainId: number;
  targetChainId: number;
  sourceToken: string;
  targetToken: string;
  sourceAmount: string;
}

export interface Route {
  id: string;
  sourceChainId: number;
  targetChainId: number;
  sourceToken: string;
  targetToken: string;
  steps: RouteStep[];
  cost?: RouteCost;
}

export interface RouteStep {
  id: string;
  type: 'swap' | 'bridge' | 'icp';
  sourceChainId: number;
  targetChainId: number;
  sourceToken: string;
  targetToken: string;
  protocol?: string;
}

export interface RouteCost {
  sourceAmount: string;
  targetAmount: string;
  fee: string;
  duration: number; // 예상 소요 시간 (분)
}
```

## 6. 크로스체인 UI 컴포넌트

### 6.1 ICP 전송 컴포넌트

```typescript
// ICP 전송 컴포넌트 예시 코드 (간략화 버전)
// src/components/crosschain/ICPTransfer.tsx

import React, { useState, useEffect } from 'react';
import { useNetwork } from '../../hooks/useNetwork';
import { useWallet } from '../../hooks/useWallet';
import { useCrosschain } from '../../hooks/useCrosschain';

const ICPTransfer: React.FC = () => {
  // 네트워크 및 지갑 훅
  const { networks } = useNetwork();
  const { selectedAccount } = useWallet();
  const { createICPTransfer, getICPTransferStatus } = useCrosschain();
  
  // 상태 관리
  const [sourceChainId, setSourceChainId] = useState<number | null>(null);
  const [targetChainId, setTargetChainId] = useState<number | null>(null);
  const [token, setToken] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transferId, setTransferId] = useState<string | null>(null);
  const [transferStatus, setTransferStatus] = useState<string | null>(null);
  
  // 전송 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력 검증
    if (!sourceChainId || !targetChainId || !token || !amount || !recipientAddress) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    
    // 전송 시작
    setIsSubmitting(true);
    
    try {
      // ICP 전송 생성
      const transfer = await createICPTransfer({
        sourceChainId,
        targetChainId,
        senderAddress: selectedAccount?.address || '',
        recipientAddress,
        token,
        amount,
      });
      
      setTransferId(transfer.id);
      setTransferStatus(transfer.status);
    } catch (error) {
      setError(error instanceof Error ? error.message : '전송에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 전송 폼 렌더링
  return (
    <div>
      <h2>ICP 인터체인 전송</h2>
      <form onSubmit={handleSubmit}>
        {/* 폼 요소들 (간략화) */}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '처리 중...' : '전송'}
        </button>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default ICPTransfer;
```

### 6.2 외부 브릿지 전송 컴포넌트

```typescript
// 외부 브릿지 전송 컴포넌트 예시 코드 (간략화 버전)
// src/components/crosschain/BridgeTransfer.tsx

import React, { useState } from 'react';
import { useCrosschain } from '../../hooks/useCrosschain';

const BridgeTransfer: React.FC = () => {
  // 크로스체인 훅
  const { getSupportedBridges, createBridgeTransfer } = useCrosschain();
  
  // 상태 관리
  const [sourceChainId, setSourceChainId] = useState<number | null>(null);
  const [targetChainId, setTargetChainId] = useState<number | null>(null);
  const [bridgeId, setBridgeId] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  
  // 전송 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 구현 생략
  };
  
  // 전송 폼 렌더링
  return (
    <div>
      <h2>외부 브릿지 전송</h2>
      <form onSubmit={handleSubmit}>
        {/* 폼 요소들 (간략화) */}
        <button type="submit">전송</button>
      </form>
    </div>
  );
};

export default BridgeTransfer;
```

### 6.3 크로스체인 스왑 컴포넌트

```typescript
// 크로스체인 스왑 컴포넌트 예시 코드 (간략화 버전)
// src/components/crosschain/CrosschainSwap.tsx

import React, { useState, useEffect } from 'react';
import { useCrosschain } from '../../hooks/useCrosschain';

const CrosschainSwap: React.FC = () => {
  // 크로스체인 훅
  const { getQuote, createSwap } = useCrosschain();
  
  // 상태 관리
  const [sourceChainId, setSourceChainId] = useState<number | null>(null);
  const [targetChainId, setTargetChainId] = useState<number | null>(null);
  const [sourceToken, setSourceToken] = useState<string>('');
  const [targetToken, setTargetToken] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [slippage, setSlippage] = useState<string>('0.5');
  const [quote, setQuote] = useState<any>(null);
  
  // 견적 가져오기
  const fetchQuote = async () => {
    if (!sourceChainId || !targetChainId || !sourceToken || !targetToken || !amount) {
      return;
    }
    
    try {
      const result = await getQuote({
        sourceChainId,
        targetChainId,
        sourceToken,
        targetToken,
        sourceAmount: amount,
        slippage: (parseFloat(slippage) / 100).toString(),
      });
      
      setQuote(result);
    } catch (error) {
      console.error('Failed to get quote:', error);
    }
  };
  
  // 전송 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 구현 생략
  };
  
  // 스왑 폼 렌더링
  return (
    <div>
      <h2>크로스체인 스왑</h2>
      <form onSubmit={handleSubmit}>
        {/* 폼 요소들 (간략화) */}
        <button type="button" onClick={fetchQuote}>견적 가져오기</button>
        {quote && (
          <div>
            <p>예상 수령 금액: {quote.targetAmount} {quote.targetToken}</p>
            <p>환율: 1 {quote.sourceToken} = {quote.exchangeRate} {quote.targetToken}</p>
            <p>수수료: {quote.fee}</p>
            <p>예상 소요 시간: {quote.estimatedDuration}분</p>
            <button type="submit">스왑</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CrosschainSwap;
```

## 7. 결론

TORI 지갑의 크로스체인 아키텍처는 다양한 블록체인 네트워크 간의 자산 이동 및 상호작용을 가능하게 하는 포괄적인 솔루션을 제공합니다. 세 가지 주요 메커니즘(ICP 릴레이어, 외부 브릿지, 크로스체인 스왑)을 통해 사용자는 다양한 블록체인 네트워크 간에 자산을 쉽게 이동하고 교환할 수 있습니다.

각 메커니즘은 서로 다른 사용 사례와 요구 사항을 충족하도록 설계되었으며, 사용자는 필요에 따라 가장 적합한 방법을 선택할 수 있습니다. 또한, 크로스체인 라우팅 알고리즘을 통해 최적의 교환 경로를 자동으로 찾아 사용자에게 최상의 결과를 제공합니다.

TORI 지갑은 사용자 경험과 보안을 최우선으로 고려하여 모든 크로스체인 기능이 직관적이고 안전하게 사용될 수 있도록 설계되었습니다. 이를 통해 사용자는 복잡한 블록체인 기술에 대한 깊은 이해 없이도 크로스체인 기능을 쉽게 활용할 수 있습니다.
