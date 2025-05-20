# TORI 지갑 코어 아키텍처

## 1. 코어 패키지 개요

TORI 지갑의 코어 패키지는 지갑의 핵심 기능을 구현하고 여러 플랫폼(브라우저 확장 프로그램, 모바일 앱, 데스크톱 앱, 텔레그램 미니앱)에서 재사용할 수 있는 공통 로직을 제공합니다. 코어 패키지는 다른 모든 패키지의 기반이 되며, 지갑의 가장 중요한 기능을 담당합니다.

## 2. 디렉토리 구조

코어 패키지는 다음과 같은 디렉토리 구조로 구성됩니다:

```
core/
├── src/
│   ├── constants/      # 상수 및 설정
│   │   ├── networks.ts    # 네트워크 상수 및 유형 정의
│   │   ├── tokens.ts      # 토큰 상수 및 유형 정의
│   │   ├── config.ts      # 설정 상수 정의
│   │   └── errors.ts      # 오류 유형 및 처리 정의
│   ├── services/       # 핵심 서비스
│   │   ├── api/           # API 서비스
│   │   ├── crypto/        # 암호화 서비스
│   │   ├── storage/       # 저장소 서비스
│   │   ├── transaction/   # 트랜잭션 서비스
│   │   ├── crosschain/    # 크로스체인 서비스
│   │   ├── nft/           # NFT 서비스
│   │   ├── staking/       # 스테이킹 서비스
│   │   ├── defi/          # DeFi 서비스
│   │   ├── security/      # 보안 서비스
│   │   ├── dapp/          # dApp 서비스
│   │   ├── monitoring/    # 모니터링 서비스
│   │   ├── compliance/    # 규정 준수 서비스
│   │   └── db/            # 데이터베이스 서비스
│   ├── utils/          # 유틸리티 함수
│   │   ├── crypto.ts      # 암호화 유틸리티
│   │   ├── formatters.ts  # 형식 변환 유틸리티
│   │   ├── validators.ts  # 유효성 검증 유틸리티
│   │   ├── converters.ts  # 단위 변환 유틸리티
│   │   └── addressBook.ts # 주소록 유틸리티
│   ├── hooks/          # React 훅
│   │   ├── useWallet.ts   # 지갑 관리 훅
│   │   ├── useTransaction.ts # 트랜잭션 관리 훅
│   │   ├── useNetwork.ts  # 네트워크 관리 훅
│   │   ├── useNFT.ts      # NFT 관리 훅
│   │   └── useCrosschain.ts # 크로스체인 관리 훅
│   ├── contexts/       # React 컨텍스트
│   │   ├── WalletContext.tsx  # 지갑 컨텍스트
│   │   ├── NetworkContext.tsx # 네트워크 컨텍스트
│   │   └── AuthContext.tsx    # 인증 컨텍스트
│   └── types/          # 타입 정의
│       ├── wallet.ts      # 지갑 관련 타입 정의
│       ├── transaction.ts # 트랜잭션 관련 타입 정의
│       ├── network.ts     # 네트워크 관련 타입 정의
│       ├── nft.ts         # NFT 관련 타입 정의
│       └── staking.ts     # 스테이킹 관련 타입 정의
```

## 3. 주요 모듈

### 3.1 암호화 모듈

암호화 모듈은 지갑의 보안에 관련된 기능을 제공하는 핵심 모듈입니다. 주요 기능은 다음과 같습니다:

#### 3.1.1 keyring.ts

`keyring.ts`는 지갑의 키 관리 기능을 담당합니다.

```typescript
// keyring.ts
export class Keyring {
  // 새 키링 생성
  static create(password: string): Promise<Keyring>;
  
  // 시드 구문으로부터 키링 복구
  static fromMnemonic(mnemonic: string, password: string): Promise<Keyring>;
  
  // 키스토어 파일로부터 키링 복구
  static fromKeystore(keystore: string, password: string): Promise<Keyring>;
  
  // 키스토어 파일 생성
  toKeystore(password: string): Promise<string>;
  
  // 계정 추가
  addAccount(path: string): Promise<Account>;
  
  // 모든 계정 가져오기
  getAccounts(): Account[];
  
  // 특정 계정 가져오기
  getAccount(address: string): Account | undefined;
  
  // 시드 구문 가져오기 (보안상 민감한 작업)
  getMnemonic(password: string): Promise<string>;
  
  // 서명 작업 수행
  sign(address: string, data: Buffer): Promise<Buffer>;
}
```

#### 3.1.2 mnemonic.ts

`mnemonic.ts`는 BIP-39 니모닉 시드 구문 생성 및 관리를 담당합니다.

```typescript
// mnemonic.ts
export class Mnemonic {
  // 새 니모닉 생성 (기본 12 단어)
  static generate(strength: number = 128): string;
  
  // 니모닉의 유효성 검사
  static validate(mnemonic: string): boolean;
  
  // 니모닉으로부터 시드 생성
  static toSeed(mnemonic: string, passphrase: string = ''): Buffer;
  
  // 니모닉을 단어 배열로 변환
  static toWords(mnemonic: string): string[];
  
  // 영어 단어 목록 가져오기
  static getWordlist(): string[];
}
```

#### 3.1.3 hdkey.ts

`hdkey.ts`는 BIP-32/BIP-44 계층 결정적 키 파생을 담당합니다.

```typescript
// hdkey.ts
export class HDKey {
  // 시드로부터 마스터 키 생성
  static fromSeed(seed: Buffer): HDKey;
  
  // 파생 경로를 통해 자식 키 파생
  derive(path: string): HDKey;
  
  // 개인 키 가져오기
  getPrivateKey(): Buffer;
  
  // 공개 키 가져오기
  getPublicKey(): Buffer;
  
  // 주소 가져오기
  getAddress(): string;
  
  // 다양한 체인에 대한 주소 가져오기
  getAddressForChain(chainId: number): string;
}
```

#### 3.1.4 encryption.ts

`encryption.ts`는 데이터 암호화 및 복호화 기능을 제공합니다.

```typescript
// encryption.ts
export class Encryption {
  // 데이터 암호화
  static encrypt(data: string, password: string): Promise<string>;
  
  // 데이터 복호화
  static decrypt(encryptedData: string, password: string): Promise<string>;
  
  // 암호 해시 생성
  static hashPassword(password: string): Promise<string>;
  
  // 암호 검증
  static verifyPassword(password: string, hash: string): Promise<boolean>;
}
```

#### 3.1.5 signature.ts

`signature.ts`는 메시지 서명 및 검증 기능을 제공합니다.

```typescript
// signature.ts
export class Signature {
  // 메시지 서명
  static sign(message: Buffer, privateKey: Buffer): Buffer;
  
  // 서명 검증
  static verify(message: Buffer, signature: Buffer, publicKey: Buffer): boolean;
  
  // 이더리움 스타일 서명
  static signEthereum(message: string, privateKey: Buffer): string;
  
  // 이더리움 스타일 서명 검증
  static verifyEthereum(message: string, signature: string, address: string): boolean;
  
  // 서명 복구 (주소 추출)
  static recoverAddress(message: string, signature: string): string;
}
```

### 3.2 트랜잭션 모듈

트랜잭션 모듈은 블록체인 트랜잭션 생성 및 관리와 관련된 기능을 제공합니다.

#### 3.2.1 builder.ts

`builder.ts`는 다양한 블록체인에 대한 트랜잭션 빌더를 제공합니다.

```typescript
// builder.ts
export interface TxBuilderOptions {
  chainId: number;
  from: string;
  to: string;
  value: string;
  data?: string;
  nonce?: number;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export class TxBuilder {
  // 체인 ID에 맞는 트랜잭션 빌더 생성
  static create(chainId: number): TxBuilder;
  
  // 트랜잭션 객체 생성
  buildTransaction(options: TxBuilderOptions): Transaction;
  
  // 토큰 전송 트랜잭션 생성
  buildTokenTransfer(options: TokenTransferOptions): Transaction;
  
  // NFT 전송 트랜잭션 생성
  buildNFTTransfer(options: NFTTransferOptions): Transaction;
  
  // 스마트 계약 호출 트랜잭션 생성
  buildContractCall(options: ContractCallOptions): Transaction;
}
```

#### 3.2.2 signer.ts

`signer.ts`는 트랜잭션 서명 기능을 제공합니다.

```typescript
// signer.ts
export class TxSigner {
  // 트랜잭션 서명
  static sign(tx: Transaction, privateKey: Buffer): SignedTransaction;
  
  // 다양한 체인에 대한 트랜잭션 서명
  static signForChain(tx: Transaction, privateKey: Buffer, chainId: number): SignedTransaction;
  
  // 서명된 트랜잭션 직렬화
  static serialize(signedTx: SignedTransaction): string;
  
  // 멀티시그 트랜잭션 서명
  static signMultisig(tx: Transaction, privateKeys: Buffer[]): SignedTransaction;
}
```

#### 3.2.3 sender.ts

`sender.ts`는 서명된 트랜잭션을 블록체인에 브로드캐스트하는 기능을 제공합니다.

```typescript
// sender.ts
export class TxSender {
  // 서명된 트랜잭션 전송
  static send(signedTx: SignedTransaction, provider: Provider): Promise<TxReceipt>;
  
  // 트랜잭션 취소 (높은 가스 가격으로 재전송)
  static cancel(txHash: string, provider: Provider, options?: CancelOptions): Promise<TxReceipt>;
  
  // 트랜잭션 가속 (높은 가스 가격으로 재전송)
  static speedUp(txHash: string, provider: Provider, options?: SpeedUpOptions): Promise<TxReceipt>;
}
```

#### 3.2.4 fee.ts

`fee.ts`는 트랜잭션 수수료 계산 및 추정 기능을 제공합니다.

```typescript
// fee.ts
export class TxFee {
  // 가스 비용 추정
  static estimateGas(tx: Transaction, provider: Provider): Promise<string>;
  
  // 현재 가스 가격 가져오기
  static getGasPrice(provider: Provider): Promise<string>;
  
  // EIP-1559 수수료 가져오기
  static getEIP1559Fee(provider: Provider): Promise<EIP1559Fee>;
  
  // 수수료 계산
  static calculateFee(gasLimit: string, gasPrice: string): string;
  
  // 수수료 우선순위 추천 (낮음, 중간, 높음)
  static getFeeRecommendation(provider: Provider): Promise<FeeRecommendation>;
}
```

#### 3.2.5 history.ts

`history.ts`는 트랜잭션 내역 조회 및 관리 기능을 제공합니다.

```typescript
// history.ts
export class TxHistory {
  // 주소의 트랜잭션 내역 가져오기
  static getTransactions(address: string, provider: Provider, options?: HistoryOptions): Promise<Transaction[]>;
  
  // 트랜잭션 상세 정보 가져오기
  static getTransaction(txHash: string, provider: Provider): Promise<Transaction>;
  
  // 트랜잭션 상태 확인
  static getStatus(txHash: string, provider: Provider): Promise<TxStatus>;
  
  // 트랜잭션 내역 필터링
  static filterTransactions(transactions: Transaction[], filter: TxFilter): Transaction[];
  
  // 트랜잭션 내역 CSV 내보내기
  static exportToCSV(transactions: Transaction[]): string;
}
```

### 3.3 네트워크 모듈

네트워크 모듈은 다양한 블록체인 네트워크와의 연결 및 통신을 담당합니다.

#### 3.3.1 provider.ts

`provider.ts`는 블록체인 네트워크와의 통신을 위한 제공자를 관리합니다.

```typescript
// provider.ts
export class Provider {
  // 네트워크 제공자 생성
  static create(network: Network): Provider;
  
  // JSON-RPC 요청 전송
  sendRequest(method: string, params: any[]): Promise<any>;
  
  // 블록 정보 가져오기
  getBlock(blockHash: string): Promise<Block>;
  
  // 현재 블록 번호 가져오기
  getBlockNumber(): Promise<number>;
  
  // 계정 잔액 가져오기
  getBalance(address: string): Promise<string>;
  
  // 네트워크 ID 가져오기
  getNetworkId(): Promise<number>;
  
  // 네트워크 연결 확인
  isConnected(): Promise<boolean>;
}
```

#### 3.3.2 networks.ts

`networks.ts`는 지원되는 네트워크 정보를 관리합니다.

```typescript
// networks.ts
export class Networks {
  // 모든 지원 네트워크 가져오기
  static getAll(): Network[];
  
  // 네트워크 ID로 네트워크 정보 가져오기
  static getById(id: number): Network | undefined;
  
  // 네트워크 추가
  static add(network: Network): void;
  
  // 네트워크 제거
  static remove(id: number): void;
  
  // 네트워크 업데이트
  static update(id: number, updates: Partial<Network>): void;
  
  // 테스트넷 여부 확인
  static isTestnet(id: number): boolean;
}
```

#### 3.3.3 explorer.ts

`explorer.ts`는 블록체인 탐색기 URL 생성 및 관리 기능을 제공합니다.

```typescript
// explorer.ts
export class Explorer {
  // 주소 URL 생성
  static getAddressUrl(address: string, networkId: number): string;
  
  // 트랜잭션 URL 생성
  static getTransactionUrl(txHash: string, networkId: number): string;
  
  // 토큰 URL 생성
  static getTokenUrl(tokenAddress: string, networkId: number): string;
  
  // NFT URL 생성
  static getNFTUrl(tokenAddress: string, tokenId: string, networkId: number): string;
  
  // 블록 URL 생성
  static getBlockUrl(blockHash: string, networkId: number): string;
}
```

### 3.4 크로스체인 모듈

크로스체인 모듈은 서로 다른 블록체인 네트워크 간의 자산 이동을 담당합니다.

#### 3.4.1 relayer.ts

`relayer.ts`는 ICP 릴레이어 서비스와의 통신을 담당합니다.

```typescript
// relayer.ts
export class Relayer {
  // ICP 전송 생성
  static createTransfer(options: ICPTransferOptions): Promise<ICPTransfer>;
  
  // ICP 전송 상태 확인
  static getStatus(transferId: string): Promise<ICPTransferStatus>;
  
  // ICP 전송 목록 가져오기
  static getTransfers(address: string, options?: ICPTransferListOptions): Promise<ICPTransfer[]>;
  
  // ICP 전송 취소
  static cancelTransfer(transferId: string): Promise<boolean>;
}
```

#### 3.4.2 bridge.ts

`bridge.ts`는 외부 블록체인과의 브릿지 기능을 담당합니다.

```typescript
// bridge.ts
export class Bridge {
  // 지원되는 브릿지 목록 가져오기
  static getSupportedBridges(): BridgeInfo[];
  
  // 브릿지 전송 생성
  static createTransfer(options: BridgeTransferOptions): Promise<BridgeTransfer>;
  
  // 브릿지 전송 상태 확인
  static getStatus(transferId: string): Promise<BridgeTransferStatus>;
  
  // 브릿지 전송 목록 가져오기
  static getTransfers(address: string, options?: BridgeTransferListOptions): Promise<BridgeTransfer[]>;
  
  // 브릿지 수수료 계산
  static calculateFee(options: BridgeFeeOptions): Promise<BridgeFee>;
}
```

#### 3.4.3 swap.ts

`swap.ts`는 크로스체인 스왑 기능을 담당합니다.

```typescript
// swap.ts
export class CrosschainSwap {
  // 스왑 견적 가져오기
  static getQuote(options: SwapQuoteOptions): Promise<SwapQuote>;
  
  // 스왑 생성
  static createSwap(options: SwapOptions): Promise<Swap>;
  
  // 스왑 상태 확인
  static getStatus(swapId: string): Promise<SwapStatus>;
  
  // 스왑 목록 가져오기
  static getSwaps(address: string, options?: SwapListOptions): Promise<Swap[]>;
  
  // 스왑 취소
  static cancelSwap(swapId: string): Promise<boolean>;
}
```

#### 3.4.4 routing.ts

`routing.ts`는 최적의 크로스체인 경로를 찾는 기능을 담당합니다.

```typescript
// routing.ts
export class CrosschainRouting {
  // 최적 경로 찾기
  static findBestRoute(options: RouteOptions): Promise<Route[]>;
  
  // 경로 비용 계산
  static calculateRouteCost(route: Route): Promise<RouteCost>;
  
  // 경로 비교
  static compareRoutes(routes: Route[]): Route;
  
  // 경로 실행
  static executeRoute(route: Route): Promise<RouteExecution>;
}
```

### 3.5 스테이킹 모듈

스테이킹 모듈은 토큰 스테이킹 및 보상 관리 기능을 제공합니다.

#### 3.5.1 validators.ts

`validators.ts`는 검증인 정보 관리 기능을 제공합니다.

```typescript
// validators.ts
export class Validators {
  // 모든 검증인 목록 가져오기
  static getAll(provider: Provider): Promise<Validator[]>;
  
  // 특정 검증인 정보 가져오기
  static getValidator(address: string, provider: Provider): Promise<Validator>;
  
  // 검증인 정렬
  static sortValidators(validators: Validator[], sortBy: ValidatorSortOption): Validator[];
  
  // 검증인 필터링
  static filterValidators(validators: Validator[], filter: ValidatorFilter): Validator[];
  
  // 검증인 성능 지표 가져오기
  static getPerformanceMetrics(address: string, provider: Provider): Promise<ValidatorPerformance>;
}
```

#### 3.5.2 delegation.ts

`delegation.ts`는 스테이킹 위임 관리 기능을 제공합니다.

```typescript
// delegation.ts
export class Delegation {
  // 위임 생성
  static createDelegation(options: DelegationOptions, provider: Provider): Promise<Transaction>;
  
  // 위임 목록 가져오기
  static getDelegations(address: string, provider: Provider): Promise<Delegation[]>;
  
  // 위임 취소
  static undelegateTokens(options: UndelegationOptions, provider: Provider): Promise<Transaction>;
  
  // 위임 재위임
  static redelegateTokens(options: RedelegationOptions, provider: Provider): Promise<Transaction>;
  
  // 위임 상태 확인
  static getDelegationStatus(delegationId: string, provider: Provider): Promise<DelegationStatus>;
}
```

#### 3.5.3 rewards.ts

`rewards.ts`는 스테이킹 보상 관리 기능을 제공합니다.

```typescript
// rewards.ts
export class Rewards {
  // 보상 조회
  static getRewards(address: string, provider: Provider): Promise<Reward[]>;
  
  // 보상 청구
  static claimRewards(options: ClaimOptions, provider: Provider): Promise<Transaction>;
  
  // 예상 보상 계산
  static estimateRewards(address: string, period: RewardPeriod, provider: Provider): Promise<string>;
  
  // 보상 내역 가져오기
  static getRewardHistory(address: string, options: RewardHistoryOptions, provider: Provider): Promise<RewardHistory[]>;
  
  // 연간 수익률(APY) 계산
  static calculateAPY(validatorAddress: string, provider: Provider): Promise<string>;
}
```

#### 3.5.4 autocompound.ts

`autocompound.ts`는 스테이킹 보상 자동 복리 기능을 제공합니다.

```typescript
// autocompound.ts
export class Autocompound {
  // 자동 복리 설정
  static setupAutocompound(options: AutocompoundOptions, provider: Provider): Promise<Transaction>;
  
  // 자동 복리 상태 확인
  static getAutocompoundStatus(address: string, provider: Provider): Promise<AutocompoundStatus>;
  
  // 자동 복리 비활성화
  static disableAutocompound(delegationId: string, provider: Provider): Promise<Transaction>;
  
  // 자동 복리 설정 업데이트
  static updateAutocompoundSettings(options: AutocompoundUpdateOptions, provider: Provider): Promise<Transaction>;
  
  // 자동 복리 예상 수익 계산
  static estimateAutocompoundReturns(options: AutocompoundEstimateOptions, provider: Provider): Promise<AutocompoundEstimate>;
}
```

### 3.6 NFT 모듈

NFT 모듈은 비교체 토큰(NFT)의 관리 및 전송 기능을 제공합니다.

#### 3.6.1 collector.ts

`collector.ts`는 NFT 정보 수집 및 관리 기능을 제공합니다.

```typescript
// collector.ts
export class NFTCollector {
  // 주소의 모든 NFT 가져오기
  static getNFTs(address: string, options?: NFTCollectorOptions): Promise<NFT[]>;
  
  // 특정 NFT 정보 가져오기
  static getNFT(contractAddress: string, tokenId: string, options?: NFTCollectorOptions): Promise<NFT>;
  
  // NFT 컬렉션 정보 가져오기
  static getCollection(contractAddress: string, options?: NFTCollectorOptions): Promise<NFTCollection>;
  
  // NFT 컬렉션 내 모든 NFT 가져오기
  static getCollectionNFTs(contractAddress: string, options?: NFTCollectorOptions): Promise<NFT[]>;
  
  // NFT 소유권 확인
  static verifyOwnership(address: string, contractAddress: string, tokenId: string, options?: NFTCollectorOptions): Promise<boolean>;
}
```

#### 3.6.2 metadata.ts

`metadata.ts`는 NFT 메타데이터 관리 기능을 제공합니다.

```typescript
// metadata.ts
export class NFTMetadata {
  // NFT 메타데이터 가져오기
  static getMetadata(uri: string): Promise<NFTMetadataContent>;
  
  // IPFS URL 변환
  static resolveIPFSUrl(ipfsUri: string): string;
  
  // 메타데이터 검증
  static validateMetadata(metadata: NFTMetadataContent): boolean;
  
  // 메타데이터 속성 가져오기
  static getAttribute(metadata: NFTMetadataContent, traitType: string): string | number | undefined;
  
  // 이미지 URL 가져오기
  static getImageUrl(metadata: NFTMetadataContent): string;
}
```

#### 3.6.3 transfers.ts

`transfers.ts`는 NFT 전송 기능을 제공합니다.

```typescript
// transfers.ts
export class NFTTransfers {
  // NFT 전송 트랜잭션 생성
  static createTransfer(options: NFTTransferOptions, provider: Provider): Promise<Transaction>;
  
  // NFT 전송 내역 가져오기
  static getTransferHistory(contractAddress: string, tokenId: string, options?: NFTTransferHistoryOptions): Promise<NFTTransfer[]>;
  
  // NFT 안전 전송 확인
  static isSafeTransfer(contractAddress: string, to: string, provider: Provider): Promise<boolean>;
  
  // 배치 전송 생성
  static createBatchTransfer(options: NFTBatchTransferOptions, provider: Provider): Promise<Transaction>;
}
```

#### 3.6.4 marketplace.ts

`marketplace.ts`는 NFT 마켓플레이스 통합 기능을 제공합니다.

```typescript
// marketplace.ts
export class NFTMarketplace {
  // 지원되는 마켓플레이스 목록 가져오기
  static getSupportedMarketplaces(): Marketplace[];
  
  // NFT 목록 조회
  static getListings(contractAddress: string, tokenId: string): Promise<NFTListing[]>;
  
  // NFT 판매 생성
  static createListing(options: NFTListingOptions, provider: Provider): Promise<Transaction>;
  
  // NFT 구매
  static buyNFT(listingId: string, options: NFTBuyOptions, provider: Provider): Promise<Transaction>;
  
  // NFT 판매 취소
  static cancelListing(listingId: string, provider: Provider): Promise<Transaction>;
}
```

### 3.7 DeFi 모듈

DeFi 모듈은 분산 금융 기능을 제공합니다.

#### 3.7.1 lending.ts

`lending.ts`는 대출 및 차입 기능을 제공합니다.

```typescript
// lending.ts
export class Lending {
  // 지원되는 대출 플랫폼 목록 가져오기
  static getSupportedPlatforms(): LendingPlatform[];
  
  // 자산 예치
  static deposit(options: DepositOptions, provider: Provider): Promise<Transaction>;
  
  // 자산 인출
  static withdraw(options: WithdrawOptions, provider: Provider): Promise<Transaction>;
  
  // 자산 대출
  static borrow(options: BorrowOptions, provider: Provider): Promise<Transaction>;
  
  // 대출 상환
  static repay(options: RepayOptions, provider: Provider): Promise<Transaction>;
  
  // 담보 비율 조회
  static getCollateralRatio(address: string, platform: string, provider: Provider): Promise<string>;
  
  // 청산 위험 확인
  static checkLiquidationRisk(address: string, platform: string, provider: Provider): Promise<LiquidationRisk>;
}
```

#### 3.7.2 yield.ts

`yield.ts`는 수익 농사(Yield Farming) 기능을 제공합니다.

```typescript
// yield.ts
export class YieldFarming {
  // 지원되는 수익 농사 플랫폼 목록 가져오기
  static getSupportedPlatforms(): YieldPlatform[];
  
  // 수익 풀 목록 가져오기
  static getPools(platform: string, provider: Provider): Promise<YieldPool[]>;
  
  // 풀에 자산 예치
  static deposit(options: YieldDepositOptions, provider: Provider): Promise<Transaction>;
  
  // 풀에서 자산 인출
  static withdraw(options: YieldWithdrawOptions, provider: Provider): Promise<Transaction>;
  
  // 예상 수익 계산
  static estimateReturns(options: YieldEstimateOptions, provider: Provider): Promise<YieldEstimate>;
  
  // 보상 청구
  static claimRewards(options: YieldClaimOptions, provider: Provider): Promise<Transaction>;
}
```

#### 3.7.3 liquidity.ts

`liquidity.ts`는 유동성 풀 관리 기능을 제공합니다.

```typescript
// liquidity.ts
export class LiquidityPool {
  // 지원되는 유동성 풀 플랫폼 목록 가져오기
  static getSupportedPlatforms(): LiquidityPlatform[];
  
  // 유동성 풀 목록 가져오기
  static getPools(platform: string, provider: Provider): Promise<Pool[]>;
  
  // 유동성 추가
  static addLiquidity(options: AddLiquidityOptions, provider: Provider): Promise<Transaction>;
  
  // 유동성 제거
  static removeLiquidity(options: RemoveLiquidityOptions, provider: Provider): Promise<Transaction>;
  
  // 유동성 포지션 정보 가져오기
  static getPosition(address: string, poolId: string, platform: string, provider: Provider): Promise<LiquidityPosition>;
  
  // 최적의 유동성 추가 금액 계산
  static calculateOptimalLiquidity(options: OptimalLiquidityOptions, provider: Provider): Promise<OptimalLiquidity>;
}
```

#### 3.7.4 portfolio.ts

`portfolio.ts`는 DeFi 포트폴리오 관리 및 분석 기능을 제공합니다.

```typescript
// portfolio.ts
export class DeFiPortfolio {
  // 포트폴리오 정보 가져오기
  static getPortfolio(address: string, options?: PortfolioOptions): Promise<Portfolio>;
  
  // 포트폴리오 가치 계산
  static calculatePortfolioValue(portfolio: Portfolio): Promise<string>;
  
  // 포트폴리오 분포 분석
  static analyzeDistribution(portfolio: Portfolio): Promise<Distribution>;
  
  // 포트폴리오 성과 분석
  static analyzePerformance(address: string, period: PerformancePeriod, options?: PortfolioOptions): Promise<Performance>;
  
  // 포트폴리오 최적화 제안
  static suggestOptimization(portfolio: Portfolio, riskLevel: RiskLevel): Promise<OptimizationSuggestion[]>;
}
```

### 3.8 dApp 모듈

dApp 모듈은 탈중앙화 애플리케이션과의 연동 기능을 제공합니다.

#### 3.8.1 browser.ts

`browser.ts`는 내장 웹3 브라우저 기능을 제공합니다.

```typescript
// browser.ts
export class DAppBrowser {
  // 브라우저 초기화
  static initialize(options?: BrowserOptions): DAppBrowser;
  
  // URL 로드
  loadUrl(url: string): Promise<void>;
  
  // 웹페이지 이벤트 처리
  handlePageEvent(event: PageEvent): void;
  
  // 주소 확인
  verifyAddress(address: string): boolean;
  
  // 브라우저 내역 가져오기
  getHistory(): BrowserHistory[];
  
  // 북마크 추가
  addBookmark(url: string, title: string): void;
  
  // 북마크 목록 가져오기
  getBookmarks(): Bookmark[];
}
```

#### 3.8.2 connector.ts

`connector.ts`는 dApp 연결 기능을 제공합니다.

```typescript
// connector.ts
export class DAppConnector {
  // dApp 연결 요청 처리
  static handleConnectRequest(request: ConnectRequest): Promise<ConnectResponse>;
  
  // 연결된 dApp 목록 가져오기
  static getConnectedDApps(): ConnectedDApp[];
  
  // dApp 연결 해제
  static disconnectDApp(dappId: string): Promise<boolean>;
  
  // 연결 상태 확인
  static isConnected(dappId: string): boolean;
  
  // WalletConnect 연결 생성
  static createWalletConnectConnection(uri: string): Promise<WalletConnectConnection>;
}
```

#### 3.8.3 permissions.ts

`permissions.ts`는 dApp 권한 관리 기능을 제공합니다.

```typescript
// permissions.ts
export class DAppPermissions {
  // 권한 요청 처리
  static handlePermissionRequest(request: PermissionRequest): Promise<PermissionResponse>;
  
  // dApp 권한 가져오기
  static getPermissions(dappId: string): Permission[];
  
  // 권한 업데이트
  static updatePermission(dappId: string, permission: Permission): Promise<boolean>;
  
  // 권한 철회
  static revokePermission(dappId: string, permissionId: string): Promise<boolean>;
  
  // 권한 확인
  static hasPermission(dappId: string, permissionType: PermissionType): boolean;
}
```

#### 3.8.4 registry.ts

`registry.ts`는 dApp 등록 및 관리 기능을 제공합니다.

```typescript
// registry.ts
export class DAppRegistry {
  // 추천 dApp 목록 가져오기
  static getRecommendedDApps(): Promise<DApp[]>;
  
  // dApp 정보 가져오기
  static getDAppInfo(url: string): Promise<DApp>;
  
  // 카테고리별 dApp 목록 가져오기
  static getDAppsByCategory(category: DAppCategory): Promise<DApp[]>;
  
  // dApp 검색
  static searchDApps(query: string): Promise<DApp[]>;
  
  // 최근 사용 dApp 목록 가져오기
  static getRecentlyUsedDApps(): DApp[];
}
```

## 4. 상태 관리

코어 패키지는 React 애플리케이션에서 상태를 관리하기 위한 컨텍스트와 훅을 제공합니다.

### 4.1 지갑 컨텍스트

`WalletContext.tsx`는 지갑 상태를 관리하는 컨텍스트를 제공합니다.

```typescript
// WalletContext.tsx
export const WalletContext = React.createContext<WalletContextValue>(defaultValue);

export const WalletProvider: React.FC = ({ children }) => {
  // 지갑 상태
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // 지갑 관련 기능
  const createWallet = async (password: string): Promise<void> => { /* ... */ };
  const restoreWallet = async (mnemonic: string, password: string): Promise<void> => { /* ... */ };
  const importWallet = async (privateKey: string, password: string): Promise<void> => { /* ... */ };
  const addAccount = async (): Promise<void> => { /* ... */ };
  const selectAccount = (address: string): void => { /* ... */ };
  const lockWallet = (): void => { /* ... */ };
  const unlockWallet = async (password: string): Promise<void> => { /* ... */ };
  const refreshAssets = async (): Promise<void> => { /* ... */ };
  
  // 컨텍스트 값
  const value = {
    wallet,
    accounts,
    selectedAccount,
    assets,
    loading,
    error,
    createWallet,
    restoreWallet,
    importWallet,
    addAccount,
    selectAccount,
    lockWallet,
    unlockWallet,
    refreshAssets,
  };
  
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => useContext(WalletContext);
```

### 4.2 네트워크 컨텍스트

`NetworkContext.tsx`는 네트워크 상태를 관리하는 컨텍스트를 제공합니다.

```typescript
// NetworkContext.tsx
export const NetworkContext = React.createContext<NetworkContextValue>(defaultValue);

export const NetworkProvider: React.FC = ({ children }) => {
  // 네트워크 상태
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // 네트워크 관련 기능
  const initialize = async (): Promise<void> => { /* ... */ };
  const selectNetwork = async (networkId: number): Promise<void> => { /* ... */ };
  const addNetwork = async (network: Network): Promise<void> => { /* ... */ };
  const removeNetwork = async (networkId: number): Promise<void> => { /* ... */ };
  const updateNetwork = async (networkId: number, updates: Partial<Network>): Promise<void> => { /* ... */ };
  const checkConnection = async (): Promise<void> => { /* ... */ };
  
  // 컨텍스트 값
  const value = {
    networks,
    selectedNetwork,
    provider,
    isConnected,
    loading,
    error,
    initialize,
    selectNetwork,
    addNetwork,
    removeNetwork,
    updateNetwork,
    checkConnection,
  };
  
  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};

export const useNetwork = () => useContext(NetworkContext);
```

### 4.3 인증 컨텍스트

`AuthContext.tsx`는 인증 상태를 관리하는 컨텍스트를 제공합니다.

```typescript
// AuthContext.tsx
export const AuthContext = React.createContext<AuthContextValue>(defaultValue);

export const AuthProvider: React.FC = ({ children }) => {
  // 인증 상태
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // 인증 관련 기능
  const login = async (password: string): Promise<void> => { /* ... */ };
  const logout = (): void => { /* ... */ };
  const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => { /* ... */ };
  const enableBiometrics = async (): Promise<void> => { /* ... */ };
  const loginWithBiometrics = async (): Promise<void> => { /* ... */ };
  
  // 컨텍스트 값
  const value = {
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    changePassword,
    enableBiometrics,
    loginWithBiometrics,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
```

## 5. 유틸리티 함수

코어 패키지는 다양한 유틸리티 함수를 제공합니다.

### 5.1 crypto.ts

`crypto.ts`는 암호화 관련 유틸리티 함수를 제공합니다.

```typescript
// crypto.ts
export function sha256(data: string): string;
export function keccak256(data: string): string;
export function randomBytes(length: number): Buffer;
export function isValidPrivateKey(privateKey: string): boolean;
export function isValidAddress(address: string, chainId?: number): boolean;
export function checksumAddress(address: string): string;
```

### 5.2 formatters.ts

`formatters.ts`는 데이터 형식 변환 유틸리티 함수를 제공합니다.

```typescript
// formatters.ts
export function formatBalance(balance: string, decimals: number, symbol?: string): string;
export function formatAddress(address: string, length?: number): string;
export function formatTxHash(hash: string, length?: number): string;
export function formatDate(timestamp: number, format?: string): string;
export function formatNumber(number: number, options?: NumberFormatOptions): string;
```

### 5.3 validators.ts

`validators.ts`는 유효성 검증 유틸리티 함수를 제공합니다.

```typescript
// validators.ts
export function isValidMnemonic(mnemonic: string): boolean;
export function isValidTransactionData(data: string): boolean;
export function isValidURL(url: string): boolean;
export function isValidEmail(email: string): boolean;
export function isStrongPassword(password: string): boolean;
```

### 5.4 converters.ts

`converters.ts`는 단위 변환 유틸리티 함수를 제공합니다.

```typescript
// converters.ts
export function weiToEther(wei: string): string;
export function etherToWei(ether: string): string;
export function tokenToSmallestUnit(amount: string, decimals: number): string;
export function smallestUnitToToken(amount: string, decimals: number): string;
export function hexToNumber(hex: string): number;
export function numberToHex(number: number): string;
```

### 5.5 addressBook.ts

`addressBook.ts`는 주소록 관리 유틸리티 함수를 제공합니다.

```typescript
// addressBook.ts
export function addContact(contact: Contact): Promise<void>;
export function removeContact(address: string): Promise<void>;
export function updateContact(address: string, updates: Partial<Contact>): Promise<void>;
export function getContact(address: string): Promise<Contact | null>;
export function getAllContacts(): Promise<Contact[]>;
export function findContactByName(name: string): Promise<Contact | null>;
```

## 6. 플러그인 시스템

코어 패키지는 플러그인 시스템을 통해 기능을 확장할 수 있습니다.

```typescript
// plugin-system.ts
export interface Plugin {
  id: string;
  name: string;
  version: string;
  initialize(): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
}

export class PluginManager {
  // 플러그인 등록
  static registerPlugin(plugin: Plugin): void;
  
  // 플러그인 제거
  static unregisterPlugin(pluginId: string): void;
  
  // 플러그인 활성화
  static activatePlugin(pluginId: string): Promise<void>;
  
  // 플러그인 비활성화
  static deactivatePlugin(pluginId: string): Promise<void>;
  
  // 등록된 플러그인 목록 가져오기
  static getRegisteredPlugins(): Plugin[];
  
  // 활성화된 플러그인 목록 가져오기
  static getActivePlugins(): Plugin[];
  
  // 플러그인 호출
  static callPluginMethod(pluginId: string, method: string, args?: any[]): Promise<any>;
}
```

## 7. 국제화(i18n)

코어 패키지는 다국어 지원을 위한 국제화 기능을 제공합니다.

```typescript
// i18n.ts
export class I18n {
  // 언어 설정
  static setLanguage(language: string): void;
  
  // 현재 언어 가져오기
  static getLanguage(): string;
  
  // 번역 가져오기
  static translate(key: string, params?: Record<string, string>): string;
  
  // 지원되는 언어 목록 가져오기
  static getSupportedLanguages(): Language[];
  
  // 언어 리소스 추가
  static addTranslations(language: string, translations: Record<string, string>): void;
}
```

## 8. 테마 시스템

코어 패키지는 테마 변경을 위한 테마 시스템을 제공합니다.

```typescript
// theme.ts
export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
}

export class ThemeManager {
  // 테마 설정
  static setTheme(themeId: string): void;
  
  // 현재 테마 가져오기
  static getTheme(): Theme;
  
  // 테마 추가
  static addTheme(theme: Theme): void;
  
  // 테마 제거
  static removeTheme(themeId: string): void;
  
  // 지원되는 테마 목록 가져오기
  static getSupportedThemes(): Theme[];
}
```

## 9. 로깅 시스템

코어 패키지는 로깅 및 오류 보고 기능을 제공합니다.

```typescript
// logger.ts
export class Logger {
  // 로그 레벨 설정
  static setLogLevel(level: LogLevel): void;
  
  // 디버그 로그
  static debug(message: string, ...args: any[]): void;
  
  // 정보 로그
  static info(message: string, ...args: any[]): void;
  
  // 경고 로그
  static warn(message: string, ...args: any[]): void;
  
  // 오류 로그
  static error(message: string, error?: Error, ...args: any[]): void;
  
  // 오류 보고
  static reportError(error: Error, context?: Record<string, any>): void;
  
  // 로그 내보내기
  static exportLogs(): Promise<string>;
}
```

## 10. 결론

TORI 지갑 코어 패키지는 다양한 블록체인 네트워크를 지원하고 확장 가능한 아키텍처를 갖추고 있습니다. 이 패키지는 지갑 관리, 트랜잭션 처리, 크로스체인 기능, 스테이킹, NFT, DeFi 등 다양한 기능을 제공하여 TORI 지갑의 모든 플랫폼에서 재사용할 수 있는 공통 로직을 제공합니다.
