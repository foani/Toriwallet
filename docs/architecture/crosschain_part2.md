# TORI 지갑 크로스체인 아키텍처 (Part 2)

## 4. 외부 브릿지

### 4.1 외부 브릿지 개요

TORI 지갑은 CreataChain 생태계와 외부 블록체인(이더리움, 바이낸스 스마트 체인, 폴리곤, 솔라나 등) 간의 자산 이동을 위해 다양한 타사 브릿지를 통합하고 있습니다. 이러한 브릿지는 다음과 같은 특징을 가지고 있습니다:

- 다양한 블록체인 지원
- 안전한 크로스체인 자산 이동
- 다양한 토큰 지원
- 사용자 친화적인 인터페이스

지원되는 주요 브릿지는 다음과 같습니다:

- **Multichain**: 다양한 블록체인 간의 자산 이동을 지원하는 인기 있는 크로스체인 브릿지
- **Wormhole**: 솔라나, 이더리움, 테라, 바이낸스 스마트 체인 등 다양한 블록체인을 지원하는 브릿지
- **Celer Network**: 다양한 블록체인을 지원하는 크로스체인 브릿지

### 4.2 외부 브릿지 통합

```typescript
// 외부 브릿지 서비스 예시 코드
// src/services/crosschain/bridge.ts

export class ExternalBridge {
  // 지원되는 브릿지 목록
  private static supportedBridges: BridgeInfo[] = [
    {
      id: 'multichain',
      name: 'Multichain',
      supportedChains: [1, 56, 137, 1000, 1],
      supportedTokens: ['CTA', 'ETH', 'BNB', 'MATIC', 'BTC'],
      website: 'https://multichain.xyz',
    },
    {
      id: 'wormhole',
      name: 'Wormhole',
      supportedChains: [1, 56, 137, 1000],
      supportedTokens: ['CTA', 'ETH', 'BNB', 'MATIC'],
      website: 'https://wormhole.com',
    },
    {
      id: 'celer',
      name: 'Celer Network',
      supportedChains: [1, 56, 137, 1000],
      supportedTokens: ['CTA', 'ETH', 'BNB', 'MATIC'],
      website: 'https://celer.network',
    },
  ];
  
  // 지원되는 브릿지 목록 가져오기
  static getSupportedBridges(): BridgeInfo[] {
    return this.supportedBridges;
  }
  
  // 브릿지 전송 생성
  static async createTransfer(options: BridgeTransferOptions): Promise<BridgeTransfer> {
    // 옵션 검증
    this.validateTransferOptions(options);
    
    // 브릿지 선택
    const bridge = this.selectBridge(options.sourceChainId, options.targetChainId, options.token);
    
    // 전송 ID 생성
    const transferId = this.generateTransferId();
    
    // 소스 체인 트랜잭션 생성
    const sourceTx = await this.createSourceTransaction(options, bridge);
    
    // 소스 체인에 트랜잭션 전송
    const sourceTxHash = await this.sendTransaction(sourceTx, options.sourceChainId);
    
    // 브릿지 전송 수수료 계산
    const fee = await this.calculateBridgeFee(options, bridge);
    
    // 전송 상태 생성
    const transfer: BridgeTransfer = {
      id: transferId,
      bridgeId: bridge.id,
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
      fee: fee.total,
      estimatedDuration: fee.estimatedDuration,
    };
    
    // 전송 상태 저장
    await this.saveTransfer(transfer);
    
    return transfer;
  }
  
  // 브릿지 전송 상태 확인
  static async getTransferStatus(transferId: string): Promise<BridgeTransferStatus> {
    // 전송 정보 가져오기
    const transfer = await this.getTransfer(transferId);
    
    if (!transfer) {
      throw new Error(`Transfer with ID ${transferId} not found`);
    }
    
    // 이미 완료된 전송인 경우
    if (transfer.status === 'completed' || transfer.status === 'failed') {
      return transfer.status;
    }
    
    // 브릿지 타입에 따라 상태 확인
    switch (transfer.bridgeId) {
      case 'multichain':
        return await this.getMultichainTransferStatus(transfer);
      case 'wormhole':
        return await this.getWormholeTransferStatus(transfer);
      case 'celer':
        return await this.getCelerTransferStatus(transfer);
      default:
        throw new Error(`Unsupported bridge ID: ${transfer.bridgeId}`);
    }
  }
  
  // 브릿지 전송 목록 가져오기
  static async getTransfers(address: string, options?: BridgeTransferListOptions): Promise<BridgeTransfer[]> {
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
    
    if (options?.bridgeId) {
      filteredTransfers = filteredTransfers.filter(transfer => transfer.bridgeId === options.bridgeId);
    }
    
    if (options?.sourceChainId) {
      filteredTransfers = filteredTransfers.filter(transfer => transfer.sourceChainId === options.sourceChainId);
    }
    
    if (options?.targetChainId) {
      filteredTransfers = filteredTransfers.filter(transfer => transfer.targetChainId === options.targetChainId);
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
  
  // 브릿지 수수료 계산
  static async calculateBridgeFee(options: BridgeFeeOptions): Promise<BridgeFee> {
    // 브릿지 선택
    const bridge = this.selectBridge(options.sourceChainId, options.targetChainId, options.token);
    
    // 브릿지별 수수료 계산
    switch (bridge.id) {
      case 'multichain':
        return await this.calculateMultichainFee(options);
      case 'wormhole':
        return await this.calculateWormholeFee(options);
      case 'celer':
        return await this.calculateCelerFee(options);
      default:
        throw new Error(`Unsupported bridge ID: ${bridge.id}`);
    }
  }
  
  // 브릿지 선택
  private static selectBridge(sourceChainId: number, targetChainId: number, token: string): BridgeInfo {
    // 지원되는 브릿지 찾기
    const supportedBridges = this.supportedBridges.filter(bridge => {
      return (
        bridge.supportedChains.includes(sourceChainId) &&
        bridge.supportedChains.includes(targetChainId) &&
        bridge.supportedTokens.includes(token)
      );
    });
    
    if (supportedBridges.length === 0) {
      throw new Error(`No supported bridge found for transfer from chain ${sourceChainId} to chain ${targetChainId} with token ${token}`);
    }
    
    // 최적의 브릿지 선택 (수수료, 속도, 신뢰성 등 고려)
    // 현재는 간단히 첫 번째 지원 브릿지 선택
    return supportedBridges[0];
  }
  
  // 그 외 필요한 메서드들...
}

export interface BridgeInfo {
  id: string;
  name: string;
  supportedChains: number[];
  supportedTokens: string[];
  website: string;
}

export interface BridgeTransferOptions {
  sourceChainId: number;
  targetChainId: number;
  senderAddress: string;
  recipientAddress: string;
  token: string;
  amount: string;
}

export interface BridgeTransfer {
  id: string;
  bridgeId: string;
  sourceChainId: number;
  targetChainId: number;
  senderAddress: string;
  recipientAddress: string;
  token: string;
  amount: string;
  sourceTxHash: string;
  targetTxHash: string | null;
  status: BridgeTransferStatus;
  createdAt: string;
  completedAt: string | null;
  fee: string;
  estimatedDuration: number; // 예상 소요 시간 (분)
}

export type BridgeTransferStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface BridgeTransferListOptions {
  status?: BridgeTransferStatus;
  token?: string;
  bridgeId?: string;
  sourceChainId?: number;
  targetChainId?: number;
  limit?: number;
  offset?: number;
}

export interface BridgeFeeOptions {
  sourceChainId: number;
  targetChainId: number;
  token: string;
  amount: string;
}

export interface BridgeFee {
  bridgeFee: string; // 브릿지 수수료
  gasFee: string; // 가스 수수료
  total: string; // 총 수수료
  estimatedDuration: number; // 예상 소요 시간 (분)
}
```

### 4.3 브릿지 보안

외부 브릿지를 사용할 때는 다음과 같은 보안 고려사항을 염두에 두어야 합니다:

1. **신뢰할 수 있는 브릿지 선택**: 검증된 브릿지만 통합합니다.
2. **스마트 계약 감사**: 통합된 브릿지의 스마트 계약 감사 결과를 확인합니다.
3. **트랜잭션 모니터링**: 모든 크로스체인 트랜잭션을 지속적으로 모니터링합니다.
4. **위험 경고**: 사용자에게 브릿지 사용의 잠재적 위험을 경고합니다.
5. **금액 제한**: 초기에는 큰 금액의 전송을 제한합니다.

## 5. 크로스체인 스왑

### 5.1 크로스체인 스왑 개요

크로스체인 스왑은 서로 다른 블록체인의 토큰을 직접 교환할 수 있는 기능입니다. 예를 들어, 이더리움의 ETH를 CreataChain의 CTA로 직접 교환할 수 있습니다. 크로스체인 스왑은 다음과 같은 특징을 가지고 있습니다:

- 단일 트랜잭션으로 토큰 교환
- 최적의 교환 경로 자동 찾기
- 다양한 토큰 페어 지원
- 경쟁력 있는 환율
