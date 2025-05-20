# TORI 지갑 크로스체인 아키텍처 (Part 1)

## 1. 소개

TORI 지갑의 크로스체인 아키텍처는 다양한 블록체인 네트워크 간의 자산 이동 및 상호작용을 가능하게 하는 핵심 구성 요소입니다. 이 문서는 TORI 지갑의 크로스체인 기능의 설계, 구현 및 작동 방식에 대해 상세히 설명합니다.

## 2. 크로스체인 아키텍처 개요

TORI 지갑은 다양한 블록체인 네트워크를 지원하고 이들 사이의 자산 이동을 가능하게 하기 위해 다음과 같은 크로스체인 메커니즘을 구현하고 있습니다:

1. **ICP(Inter-Chain Protocol) 릴레이어**: CreataChain 생태계 내의 Zenith Chain과 Catena Chain 간의 자산 이동을 위한 자체 개발 프로토콜
2. **외부 브릿지**: CreataChain 생태계와 외부 블록체인(이더리움, 바이낸스 스마트 체인, 폴리곤, 솔라나 등) 간의 자산 이동을 위한 타사 브릿지 통합
3. **크로스체인 스왑**: 서로 다른 블록체인의 토큰을 직접 교환할 수 있는 기능

## 3. ICP(Inter-Chain Protocol) 릴레이어

### 3.1 ICP 릴레이어 개요

ICP 릴레이어는 CreataChain의 Zenith Chain과 Catena Chain 간의 자산 이동을 위한 자체 개발 프로토콜입니다. 이 프로토콜은 다음과 같은 특징을 가지고 있습니다:

- 양방향 자산 이동 지원 (Zenith Chain ↔ Catena Chain)
- 빠른 전송 속도 (일반적으로 2-10분)
- 낮은 수수료 (일반적으로 전송 금액의 0.1%)
- 안전한 트랜잭션 확인 메커니즘

### 3.2 ICP 릴레이어 아키텍처

ICP 릴레이어는 다음과 같은 구성 요소로 이루어져 있습니다:

1. **릴레이 노드**: 양쪽 체인의 트랜잭션을 모니터링하고 상호 작용하는 노드
2. **릴레이 스마트 계약**: 양쪽 체인에 배포된 자산 잠금 및 해제를 관리하는 스마트 계약
3. **검증자 세트**: 크로스체인 트랜잭션의 유효성을 검증하는 검증자 노드
4. **오프체인 서명 서버**: 릴레이 노드와 검증자 간의 통신을 관리하는 서버

이러한 구성 요소들은 다음과 같은 워크플로우를 통해 크로스체인 자산 이동을 가능하게 합니다:

```
[사용자 지갑] -> [소스 체인 트랜잭션] -> [릴레이 노드 감지] -> [검증자 검증]
-> [릴레이 노드 실행] -> [대상 체인 트랜잭션] -> [사용자 지갑]
```

### 3.3 ICP 릴레이어 구현

```typescript
// ICP 릴레이어 서비스 예시 코드
// src/services/crosschain/relayer.ts

export class ICPRelayer {
  // ICP 전송 생성
  static async createTransfer(options: ICPTransferOptions): Promise<ICPTransfer> {
    // 전송 옵션 검증
    this.validateTransferOptions(options);
    
    // 전송 ID 생성
    const transferId = this.generateTransferId();
    
    // 소스 체인 트랜잭션 생성
    const sourceTx = await this.createSourceTransaction(options);
    
    // 소스 체인에 트랜잭션 전송
    const sourceTxHash = await this.sendTransaction(sourceTx, options.sourceChainId);
    
    // 전송 상태 생성
    const transfer: ICPTransfer = {
      id: transferId,
      sourceChainId: options.sourceChainId,
      targetChainId: options.targetChainId,
      senderAddress: options.senderAddress,
      recipientAddress: options.recipientAddress,
      token: options.token,
      amount: options.amount,
      sourceTxHash,
      targetTxHash: null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
      fee: this.calculateFee(options.amount),
    };
    
    // 전송 상태 저장
    await this.saveTransfer(transfer);
    
    return transfer;
  }
  
  // ICP 전송 상태 확인
  static async getTransferStatus(transferId: string): Promise<ICPTransferStatus> {
    // 전송 정보 가져오기
    const transfer = await this.getTransfer(transferId);
    
    if (!transfer) {
      throw new Error(`Transfer with ID ${transferId} not found`);
    }
    
    // 이미 완료된 전송인 경우
    if (transfer.status === 'completed' || transfer.status === 'failed') {
      return transfer.status;
    }
    
    // 소스 체인 트랜잭션 확인
    const sourceTxStatus = await this.getTransactionStatus(transfer.sourceTxHash, transfer.sourceChainId);
    
    // 소스 체인 트랜잭션이 실패한 경우
    if (sourceTxStatus === 'failed') {
      transfer.status = 'failed';
      await this.updateTransfer(transfer);
      return 'failed';
    }
    
    // 소스 체인 트랜잭션이 아직 완료되지 않은 경우
    if (sourceTxStatus !== 'confirmed') {
      return 'pending';
    }
    
    // 대상 체인 트랜잭션이 없는 경우
    if (!transfer.targetTxHash) {
      // 릴레이어 상태 확인
      const relayerStatus = await this.getRelayerStatus(transfer.id);
      
      // 릴레이어 처리 중인 경우
      if (relayerStatus === 'processing') {
        return 'processing';
      }
      
      // 릴레이어가 대상 체인 트랜잭션을 생성한 경우
      if (relayerStatus === 'relayed') {
        transfer.targetTxHash = await this.getTargetTxHash(transfer.id);
        await this.updateTransfer(transfer);
      }
    }
    
    // 대상 체인 트랜잭션이 있는 경우
    if (transfer.targetTxHash) {
      const targetTxStatus = await this.getTransactionStatus(transfer.targetTxHash, transfer.targetChainId);
      
      // 대상 체인 트랜잭션이 확인된 경우
      if (targetTxStatus === 'confirmed') {
        transfer.status = 'completed';
        transfer.completedAt = new Date().toISOString();
        await this.updateTransfer(transfer);
        return 'completed';
      }
      
      // 대상 체인 트랜잭션이 실패한 경우
      if (targetTxStatus === 'failed') {
        transfer.status = 'failed';
        await this.updateTransfer(transfer);
        return 'failed';
      }
      
      return 'processing';
    }
    
    return 'pending';
  }
  
  // ICP 전송 목록 가져오기
  static async getTransfers(address: string, options?: ICPTransferListOptions): Promise<ICPTransfer[]> {
    // 주소별 전송 목록 가져오기
    const transfers = await this.getTransfersByAddress(address);
    
    // 옵션에 따라 필터링
    let filteredTransfers = transfers;
    
    if (options?.status) {
      filteredTransfers = filteredTransfers.filter(transfer => transfer.status === options.status);
    }
    
    if (options?.token) {
      filteredTransfers = filteredTransfers.filter(transfer => transfer.token === options.token);
    }
    
    if (options?.startDate) {
      const startDate = new Date(options.startDate).getTime();
      filteredTransfers = filteredTransfers.filter(transfer => new Date(transfer.createdAt).getTime() >= startDate);
    }
    
    if (options?.endDate) {
      const endDate = new Date(options.endDate).getTime();
      filteredTransfers = filteredTransfers.filter(transfer => new Date(transfer.createdAt).getTime() <= endDate);
    }
    
    // 정렬
    filteredTransfers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // 페이지네이션
    if (options?.limit && options?.offset) {
      filteredTransfers = filteredTransfers.slice(options.offset, options.offset + options.limit);
    } else if (options?.limit) {
      filteredTransfers = filteredTransfers.slice(0, options.limit);
    }
    
    return filteredTransfers;
  }
  
  // 전송 옵션 검증
  private static validateTransferOptions(options: ICPTransferOptions): void {
    // 소스 체인 ID 확인
    if (options.sourceChainId !== 1 && options.sourceChainId !== 1000) {
      throw new Error('Invalid source chain ID. Must be 1 (Zenith Chain) or 1000 (Catena Chain)');
    }
    
    // 대상 체인 ID 확인
    if (options.targetChainId !== 1 && options.targetChainId !== 1000) {
      throw new Error('Invalid target chain ID. Must be 1 (Zenith Chain) or 1000 (Catena Chain)');
    }
    
    // 같은 체인으로의 전송 불가
    if (options.sourceChainId === options.targetChainId) {
      throw new Error('Source and target chain IDs must be different');
    }
    
    // 주소 검증
    if (!this.isValidAddress(options.senderAddress, options.sourceChainId)) {
      throw new Error('Invalid sender address');
    }
    
    if (!this.isValidAddress(options.recipientAddress, options.targetChainId)) {
      throw new Error('Invalid recipient address');
    }
    
    // 토큰 지원 확인
    if (!this.isSupportedToken(options.token, options.sourceChainId, options.targetChainId)) {
      throw new Error(`Token ${options.token} is not supported for transfer from chain ${options.sourceChainId} to chain ${options.targetChainId}`);
    }
    
    // 금액 검증
    if (!options.amount || parseFloat(options.amount) <= 0) {
      throw new Error('Invalid amount');
    }
    
    // 최소 전송 금액 확인
    const minAmount = this.getMinTransferAmount(options.token);
    if (parseFloat(options.amount) < minAmount) {
      throw new Error(`Amount is less than minimum transfer amount (${minAmount} ${options.token})`);
    }
    
    // 잔액 확인
    if (!this.hasSufficientBalance(options.senderAddress, options.token, options.amount, options.sourceChainId)) {
      throw new Error('Insufficient balance');
    }
  }
  
  // 그 외 필요한 메서드들...
}

export interface ICPTransferOptions {
  sourceChainId: number;
  targetChainId: number;
  senderAddress: string;
  recipientAddress: string;
  token: string;
  amount: string;
}

export interface ICPTransfer {
  id: string;
  sourceChainId: number;
  targetChainId: number;
  senderAddress: string;
  recipientAddress: string;
  token: string;
  amount: string;
  sourceTxHash: string;
  targetTxHash: string | null;
  status: ICPTransferStatus;
  createdAt: string;
  completedAt: string | null;
  fee: string;
}

export type ICPTransferStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ICPTransferListOptions {
  status?: ICPTransferStatus;
  token?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
```

### 3.4 ICP 릴레이어 보안

ICP 릴레이어는 다음과 같은 보안 메커니즘을 구현하고 있습니다:

1. **다중 서명 검증**: 크로스체인 트랜잭션은 여러 검증자의 서명을 필요로 합니다.
2. **샤딩 기반 검증**: 검증자들은 샤딩 메커니즘을 통해 트랜잭션을 검증합니다.
3. **트랜잭션 재시도 메커니즘**: 실패한 트랜잭션은 자동으로 재시도됩니다.
4. **이중 지불 방지**: 이중 지불을 방지하기 위한 메커니즘이 구현되어 있습니다.
5. **슬래싱 메커니즘**: 악의적인 행동을 하는 검증자는 벌금을 부과받습니다.
