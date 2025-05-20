/**
 * transaction-service.ts
 * 
 * 이 모듈은 TORI 지갑의 트랜잭션 서비스를 제공합니다.
 * 트랜잭션 생성, 서명, 전송, 추적 등의 기능을 담당합니다.
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';

import { NetworkType } from '../../constants/networks';
import { ErrorCode, ToriWalletError } from '../../constants/errors';
import { GasInfo, Transaction, TransactionFilter, TransactionListResult, TransactionPaginationOptions, TransactionSortOptions, TransactionStatus, TransactionType, TransferParams } from '../../types/transaction';
import { WalletService } from '../wallet/wallet-service';
import { NetworkService } from '../network/network-service';
import { StorageService } from '../storage/storage-service';
import { TRANSACTION_CONFIG } from '../../constants/config';

// 트랜잭션 서비스 이벤트 타입
export enum TransactionServiceEvent {
  TRANSACTION_CREATED = 'transactionCreated',
  TRANSACTION_SIGNED = 'transactionSigned',
  TRANSACTION_SENT = 'transactionSent',
  TRANSACTION_CONFIRMED = 'transactionConfirmed',
  TRANSACTION_FAILED = 'transactionFailed',
  TRANSACTION_DROPPED = 'transactionDropped',
  TRANSACTION_REPLACED = 'transactionReplaced',
  ERROR = 'error',
}

// 트랜잭션 서비스 설정 인터페이스
export interface TransactionServiceOptions {
  walletService: WalletService;
  networkService: NetworkService;
  storage?: StorageService;
}

/**
 * TORI 지갑 트랜잭션 서비스 클래스
 * 
 * 트랜잭션 생성, 서명, 전송, 추적 등의 기능을 제공합니다.
 */
export class TransactionService extends EventEmitter {
  private isInitialized: boolean = false;
  private walletService: WalletService;
  private networkService: NetworkService;
  private storage: StorageService | null = null;
  private transactions: Record<string, Transaction> = {};
  private pendingTransactions: Record<string, Transaction> = {};
  
  /**
   * 트랜잭션 서비스 생성자
   * 
   * @param options 트랜잭션 서비스 설정
   */
  constructor(options: TransactionServiceOptions) {
    super();
    this.walletService = options.walletService;
    this.networkService = options.networkService;
    
    if (options.storage) {
      this.storage = options.storage;
    }
  }
  
  /**
   * 트랜잭션 서비스 초기화
   * 
   * @param storage 스토리지 서비스 (선택적)
   * @returns 초기화 성공 여부
   */
  public async initialize(storage?: StorageService): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }
      
      // 스토리지 설정
      if (storage) {
        this.storage = storage;
      }
      
      if (this.storage) {
        // 저장된 트랜잭션 불러오기
        const transactionsJson = await this.storage.getItem('transactions');
        if (transactionsJson) {
          this.transactions = JSON.parse(transactionsJson);
          
          // 대기 중인 트랜잭션 분류
          this.pendingTransactions = Object.entries(this.transactions)
            .filter(([_, tx]) => tx.status === TransactionStatus.PENDING || tx.status === TransactionStatus.CONFIRMING)
            .reduce((acc, [id, tx]) => ({ ...acc, [id]: tx }), {});
          
          // 대기 중인 트랜잭션 상태 확인 시작
          this.startPendingTransactionChecker();
        }
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize transaction service', error);
      throw new ToriWalletError(ErrorCode.UNKNOWN_ERROR, 'Failed to initialize transaction service', error);
    }
  }
  
  /**
   * 트랜잭션 전송
   * 
   * @param params 송금 매개변수
   * @returns 트랜잭션 객체
   */
  public async transfer(params: TransferParams): Promise<Transaction> {
    try {
      if (!this.isInitialized) {
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Transaction service is not initialized');
      }
      
      const { from, to, amount, networkType, tokenAddress, memo, gasInfo, priority, nonce } = params;
      
      // 네트워크에 따른 트랜잭션 생성
      let transaction: Transaction;
      
      // 네트워크별 구현 분기
      if (this.isEVMNetwork(networkType)) {
        // EVM 호환 네트워크에서의 트랜잭션 생성
        transaction = await this.createEVMTransaction(
          from, to, amount, networkType, tokenAddress, memo, gasInfo, priority, nonce
        );
      } else if (this.isBitcoinNetwork(networkType)) {
        // 비트코인 네트워크에서의 트랜잭션 생성
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Bitcoin transaction not implemented');
      } else if (this.isSolanaNetwork(networkType)) {
        // 솔라나 네트워크에서의 트랜잭션 생성
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Solana transaction not implemented');
      } else if (networkType === NetworkType.ZENITH_MAINNET) {
        // 제니스 체인에서의 트랜잭션 생성
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Zenith transaction not implemented');
      } else {
        throw new ToriWalletError(ErrorCode.UNSUPPORTED_NETWORK, `Unsupported network type: ${networkType}`);
      }
      
      // 트랜잭션 서명
      const signedTransaction = await this.signTransaction(transaction);
      
      // 트랜잭션 전송
      const sentTransaction = await this.sendTransaction(signedTransaction);
      
      // 트랜잭션 저장
      await this.saveTransaction(sentTransaction);
      
      // 이벤트 발생
      this.emit(TransactionServiceEvent.TRANSACTION_SENT, sentTransaction);
      
      return sentTransaction;
    } catch (error) {
      console.error('Failed to transfer', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.TRANSACTION_FAILED, 'Failed to transfer', error);
    }
  }
  
  /**
   * EVM 트랜잭션 생성
   * 
   * @param from 발신자 주소
   * @param to 수신자 주소
   * @param amount 금액
   * @param networkType 네트워크 유형
   * @param tokenAddress 토큰 주소 (선택적)
   * @param memo 메모 (선택적)
   * @param gasInfo 가스 정보 (선택적)
   * @param priority 우선순위 (선택적)
   * @param nonce 논스 (선택적)
   * @returns 트랜잭션 객체
   */
  private async createEVMTransaction(
    from: string,
    to: string,
    amount: string,
    networkType: NetworkType,
    tokenAddress?: string,
    memo?: string,
    gasInfo?: GasInfo,
    priority?: string,
    nonce?: number
  ): Promise<Transaction> {
    try {
      // 트랜잭션 ID 생성
      const id = uuidv4();
      
      // 트랜잭션 유형 결정
      const type = tokenAddress ? TransactionType.TOKEN_TRANSFER : TransactionType.TRANSFER;
      
      // 트랜잭션 시간
      const timestamp = Date.now();
      
      // 네트워크 제공자 가져오기
      const provider = this.networkService.getProvider(networkType) as ethers.JsonRpcProvider;
      
      // 논스 가져오기
      const currentNonce = nonce !== undefined 
        ? nonce 
        : await provider.getTransactionCount(from);
      
      // 가스 정보 설정
      let txGasInfo = gasInfo || {};
      
      if (!txGasInfo.gasLimit) {
        // 기본 가스 한도 설정
        txGasInfo.gasLimit = tokenAddress 
          ? TRANSACTION_CONFIG.defaultGasLimitERC20.toString() 
          : TRANSACTION_CONFIG.defaultGasLimit.toString();
      }
      
      if (!txGasInfo.gasPrice && !txGasInfo.maxFeePerGas) {
        // 현재 가스 가격 조회
        const feeData = await provider.getFeeData();
        
        // EIP-1559 지원 여부 확인
        if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
          // EIP-1559 지원
          txGasInfo.maxFeePerGas = feeData.maxFeePerGas.toString();
          txGasInfo.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas.toString();
        } else if (feeData.gasPrice) {
          // 레거시 가스 가격
          txGasInfo.gasPrice = feeData.gasPrice.toString();
        }
      }
      
      // 트랜잭션 데이터 생성
      let data: any = {
        evmData: {
          to,
          from,
          value: tokenAddress ? '0' : amount, // 토큰 전송이면 0, 아니면 금액
          nonce: currentNonce,
          gasLimit: txGasInfo.gasLimit,
        },
      };
      
      // EIP-1559 가스 정보 추가
      if (txGasInfo.maxFeePerGas && txGasInfo.maxPriorityFeePerGas) {
        data.evmData.maxFeePerGas = txGasInfo.maxFeePerGas;
        data.evmData.maxPriorityFeePerGas = txGasInfo.maxPriorityFeePerGas;
      } else if (txGasInfo.gasPrice) {
        data.evmData.gasPrice = txGasInfo.gasPrice;
      }
      
      // 메모 추가
      if (memo) {
        data.memo = memo;
      }
      
      // 토큰 전송인 경우 토큰 데이터 추가
      if (tokenAddress) {
        try {
          // 토큰 컨트랙트 인스턴스 생성
          const tokenContract = new ethers.Contract(
            tokenAddress,
            ['function transfer(address to, uint256 amount) returns (bool)'],
            provider
          );
          
          // 토큰 전송 데이터 생성
          const transferData = tokenContract.interface.encodeFunctionData(
            'transfer',
            [to, ethers.parseUnits(amount, 18)] // 소수점을 18로 가정 (실제로는 토큰별 소수점 확인 필요)
          );
          
          // 트랜잭션 데이터에 추가
          data.evmData.to = tokenAddress;
          data.evmData.data = transferData;
          
          // 토큰 정보 추가
          data.tokenInfo = {
            address: tokenAddress,
            symbol: 'TOKEN', // 실제로는 토큰 심볼 조회 필요
            decimals: 18, // 실제로는 토큰 소수점 조회 필요
          };
        } catch (error) {
          console.error('Failed to create token transfer data', error);
          throw new ToriWalletError(ErrorCode.INVALID_TOKEN_ADDRESS, 'Failed to create token transfer data', error);
        }
      }
      
      // 트랜잭션 객체 생성
      const transaction: Transaction = {
        id,
        type,
        status: TransactionStatus.PENDING,
        networkType,
        fromAddress: from,
        toAddress: to,
        amount,
        timestamp,
        data,
        gasInfo: txGasInfo,
        memo,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      
      return transaction;
    } catch (error) {
      console.error('Failed to create EVM transaction', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.TRANSACTION_FAILED, 'Failed to create EVM transaction', error);
    }
  }
  
  /**
   * 트랜잭션 서명
   * 
   * @param transaction 트랜잭션 객체
   * @returns 서명된 트랜잭션 객체
   */
  private async signTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      // 네트워크에 따른 트랜잭션 서명
      let signedTx: string;
      
      if (this.isEVMNetwork(transaction.networkType)) {
        // EVM 호환 네트워크에서의 트랜잭션 서명
        
        // 계정 ID 찾기 (실제로는 주소에 해당하는 계정 ID를 가져와야 함)
        const accounts = this.walletService.getAccounts();
        const account = accounts.find(acc => acc.address.toLowerCase() === transaction.fromAddress.toLowerCase());
        
        if (!account) {
          throw new ToriWalletError(ErrorCode.ACCOUNT_NOT_FOUND, 'Account not found for the address');
        }
        
        // 트랜잭션 객체 생성
        const evmData = transaction.data?.evmData;
        if (!evmData) {
          throw new ToriWalletError(ErrorCode.INVALID_TRANSACTION, 'Invalid transaction data');
        }
        
        const txRequest: ethers.TransactionRequest = {
          to: evmData.to,
          from: evmData.from,
          value: evmData.value ? ethers.parseEther(evmData.value) : undefined,
          data: evmData.data,
          nonce: evmData.nonce,
          gasLimit: evmData.gasLimit ? ethers.toBigInt(evmData.gasLimit) : undefined,
          chainId: this.networkService.getChainId(transaction.networkType),
        };
        
        // EIP-1559 가스 정보 추가
        if (evmData.maxFeePerGas && evmData.maxPriorityFeePerGas) {
          txRequest.maxFeePerGas = ethers.toBigInt(evmData.maxFeePerGas);
          txRequest.maxPriorityFeePerGas = ethers.toBigInt(evmData.maxPriorityFeePerGas);
        } else if (evmData.gasPrice) {
          txRequest.gasPrice = ethers.toBigInt(evmData.gasPrice);
        }
        
        // 트랜잭션 서명
        signedTx = await this.walletService.signTransaction(account.id, txRequest, transaction.networkType);
      } else if (this.isBitcoinNetwork(transaction.networkType)) {
        // 비트코인 네트워크에서의 트랜잭션 서명
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Bitcoin transaction signing not implemented');
      } else if (this.isSolanaNetwork(transaction.networkType)) {
        // 솔라나 네트워크에서의 트랜잭션 서명
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Solana transaction signing not implemented');
      } else if (transaction.networkType === NetworkType.ZENITH_MAINNET) {
        // 제니스 체인에서의 트랜잭션 서명
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Zenith transaction signing not implemented');
      } else {
        throw new ToriWalletError(ErrorCode.UNSUPPORTED_NETWORK, `Unsupported network type: ${transaction.networkType}`);
      }
      
      // 서명된 트랜잭션 객체 업데이트
      const signedTransaction: Transaction = {
        ...transaction,
        data: {
          ...transaction.data,
          signedTx,
        },
        updatedAt: Date.now(),
      };
      
      // 이벤트 발생
      this.emit(TransactionServiceEvent.TRANSACTION_SIGNED, signedTransaction);
      
      return signedTransaction;
    } catch (error) {
      console.error('Failed to sign transaction', error);
      
      // 트랜잭션 상태 업데이트
      const failedTransaction: Transaction = {
        ...transaction,
        status: TransactionStatus.FAILED,
        failureReason: error instanceof ToriWalletError 
          ? error.message 
          : error instanceof Error 
            ? error.message 
            : 'Unknown error',
        updatedAt: Date.now(),
      };
      
      // 이벤트 발생
      this.emit(TransactionServiceEvent.TRANSACTION_FAILED, failedTransaction);
      
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.TRANSACTION_FAILED, 'Failed to sign transaction', error);
    }
  }
  
  /**
   * 트랜잭션 전송
   * 
   * @param transaction 서명된 트랜잭션 객체
   * @returns 전송된 트랜잭션 객체
   */
  private async sendTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      if (!transaction.data?.signedTx) {
        throw new ToriWalletError(ErrorCode.INVALID_TRANSACTION, 'Transaction is not signed');
      }
      
      // 트랜잭션 해시
      let txHash: string;
      
      // 네트워크별 구현 분기
      if (this.isEVMNetwork(transaction.networkType)) {
        // EVM 호환 네트워크에서의 트랜잭션 전송
        
        // 네트워크 제공자 가져오기
        const provider = this.networkService.getProvider(transaction.networkType) as ethers.JsonRpcProvider;
        
        // 트랜잭션 전송
        const tx = await provider.broadcastTransaction(transaction.data.signedTx);
        txHash = tx.hash;
        
        // 익스플로러 URL 생성
        const explorerUrl = this.networkService.getExplorerUrl(transaction.networkType, txHash);
        
        // 트랜잭션 객체 업데이트
        const sentTransaction: Transaction = {
          ...transaction,
          id: txHash, // 트랜잭션 ID를 해시로 업데이트
          status: TransactionStatus.PENDING,
          explorerUrl,
          updatedAt: Date.now(),
        };
        
        // 대기 중인 트랜잭션에 추가
        this.pendingTransactions[txHash] = sentTransaction;
        
        return sentTransaction;
      } else if (this.isBitcoinNetwork(transaction.networkType)) {
        // 비트코인 네트워크에서의 트랜잭션 전송
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Bitcoin transaction sending not implemented');
      } else if (this.isSolanaNetwork(transaction.networkType)) {
        // 솔라나 네트워크에서의 트랜잭션 전송
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Solana transaction sending not implemented');
      } else if (transaction.networkType === NetworkType.ZENITH_MAINNET) {
        // 제니스 체인에서의 트랜잭션 전송
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Zenith transaction sending not implemented');
      } else {
        throw new ToriWalletError(ErrorCode.UNSUPPORTED_NETWORK, `Unsupported network type: ${transaction.networkType}`);
      }
    } catch (error) {
      console.error('Failed to send transaction', error);
      
      // 트랜잭션 상태 업데이트
      const failedTransaction: Transaction = {
        ...transaction,
        status: TransactionStatus.FAILED,
        failureReason: error instanceof ToriWalletError 
          ? error.message 
          : error instanceof Error 
            ? error.message 
            : 'Unknown error',
        updatedAt: Date.now(),
      };
      
      // 이벤트 발생
      this.emit(TransactionServiceEvent.TRANSACTION_FAILED, failedTransaction);
      
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.TRANSACTION_FAILED, 'Failed to send transaction', error);
    }
  }
  
  /**
   * 트랜잭션 저장
   * 
   * @param transaction 트랜잭션 객체
   */
  private async saveTransaction(transaction: Transaction): Promise<void> {
    try {
      // 트랜잭션 목록에 추가
      this.transactions[transaction.id] = transaction;
      
      // 스토리지에 저장
      if (this.storage) {
        await this.storage.setItem('transactions', JSON.stringify(this.transactions));
      }
    } catch (error) {
      console.error('Failed to save transaction', error);
      throw new ToriWalletError(ErrorCode.STORAGE_WRITE_FAILED, 'Failed to save transaction', error);
    }
  }
  
  /**
   * 트랜잭션 상태 업데이트
   * 
   * @param txId 트랜잭션 ID
   * @param status 새 상태
   * @param data 추가 데이터
   */
  private async updateTransactionStatus(
    txId: string,
    status: TransactionStatus,
    data?: {
      blockNumber?: number;
      blockHash?: string;
      confirmations?: number;
      fee?: string;
      failureReason?: string;
      replaced?: { by: string; reason: string };
    }
  ): Promise<void> {
    try {
      // 트랜잭션 가져오기
      const transaction = this.transactions[txId];
      if (!transaction) {
        throw new ToriWalletError(ErrorCode.TRANSACTION_NOT_FOUND, 'Transaction not found');
      }
      
      // 상태 업데이트
      const updatedTransaction: Transaction = {
        ...transaction,
        status,
        updatedAt: Date.now(),
        ...(data?.blockNumber && { blockNumber: data.blockNumber }),
        ...(data?.blockHash && { blockHash: data.blockHash }),
        ...(data?.confirmations && { confirmations: data.confirmations }),
        ...(data?.fee && { fee: data.fee }),
        ...(data?.failureReason && { failureReason: data.failureReason }),
        ...(data?.replaced && { replaced: data.replaced }),
      };
      
      // 트랜잭션 저장
      this.transactions[txId] = updatedTransaction;
      
      // 상태에 따른 대기 중인 트랜잭션 처리
      if (status === TransactionStatus.CONFIRMED || 
          status === TransactionStatus.FAILED || 
          status === TransactionStatus.REJECTED ||
          status === TransactionStatus.CANCELLED || 
          status === TransactionStatus.REPLACED) {
        // 대기 중인 트랜잭션에서 제거
        delete this.pendingTransactions[txId];
      } else {
        // 대기 중인 트랜잭션 업데이트
        this.pendingTransactions[txId] = updatedTransaction;
      }
      
      // 스토리지에 저장
      if (this.storage) {
        await this.storage.setItem('transactions', JSON.stringify(this.transactions));
      }
      
      // 이벤트 발생
      switch (status) {
        case TransactionStatus.CONFIRMED:
          this.emit(TransactionServiceEvent.TRANSACTION_CONFIRMED, updatedTransaction);
          break;
        case TransactionStatus.FAILED:
          this.emit(TransactionServiceEvent.TRANSACTION_FAILED, updatedTransaction);
          break;
        case TransactionStatus.REPLACED:
          this.emit(TransactionServiceEvent.TRANSACTION_REPLACED, updatedTransaction);
          break;
        case TransactionStatus.CANCELLED:
        case TransactionStatus.REJECTED:
          this.emit(TransactionServiceEvent.TRANSACTION_DROPPED, updatedTransaction);
          break;
      }
    } catch (error) {
      console.error('Failed to update transaction status', error);
      throw new ToriWalletError(ErrorCode.STORAGE_WRITE_FAILED, 'Failed to update transaction status', error);
    }
  }
  
  /**
   * 대기 중인 트랜잭션 확인 시작
   */
  private startPendingTransactionChecker(): void {
    // 주기적으로 대기 중인 트랜잭션 상태 확인
    setInterval(() => {
      this.checkPendingTransactions();
    }, 15000); // 15초마다 확인
  }
  
  /**
   * 대기 중인 트랜잭션 상태 확인
   */
  private async checkPendingTransactions(): Promise<void> {
    try {
      const pendingTxIds = Object.keys(this.pendingTransactions);
      
      if (pendingTxIds.length === 0) {
        return;
      }
      
      // 각 트랜잭션 상태 확인
      for (const txId of pendingTxIds) {
        const tx = this.pendingTransactions[txId];
        
        try {
          // 네트워크별 구현 분기
          if (this.isEVMNetwork(tx.networkType)) {
            await this.checkEVMTransaction(tx);
          } else if (this.isBitcoinNetwork(tx.networkType)) {
            // 비트코인 트랜잭션 확인
            // TODO: 구현
          } else if (this.isSolanaNetwork(tx.networkType)) {
            // 솔라나 트랜잭션 확인
            // TODO: 구현
          } else if (tx.networkType === NetworkType.ZENITH_MAINNET) {
            // 제니스 체인 트랜잭션 확인
            // TODO: 구현
          }
        } catch (error) {
          console.error(`Failed to check transaction ${txId}`, error);
        }
      }
    } catch (error) {
      console.error('Failed to check pending transactions', error);
    }
  }
  
  /**
   * EVM 트랜잭션 상태 확인
   * 
   * @param transaction 트랜잭션 객체
   */
  private async checkEVMTransaction(transaction: Transaction): Promise<void> {
    try {
      // 네트워크 제공자 가져오기
      const provider = this.networkService.getProvider(transaction.networkType) as ethers.JsonRpcProvider;
      
      // 트랜잭션 조회
      const tx = await provider.getTransaction(transaction.id);
      
      if (!tx) {
        // 트랜잭션이 없는 경우 (드롭 또는 대체)
        
        // 대체 트랜잭션 확인
        const nonce = transaction.data?.evmData?.nonce;
        if (nonce !== undefined) {
          const latestTx = await this.findReplacementTransaction(transaction.fromAddress, nonce, transaction.networkType);
          
          if (latestTx) {
            // 대체된 경우
            await this.updateTransactionStatus(transaction.id, TransactionStatus.REPLACED, {
              replaced: {
                by: latestTx.hash,
                reason: 'Transaction was replaced by a new transaction',
              },
            });
            
            return;
          }
        }
        
        // 일정 시간이 지나면 실패로 처리
        const currentTime = Date.now();
        const elapsed = currentTime - transaction.createdAt;
        
        if (elapsed > 3600000) { // 1시간 이상 경과
          await this.updateTransactionStatus(transaction.id, TransactionStatus.FAILED, {
            failureReason: 'Transaction was dropped from the mempool',
          });
        }
        
        return;
      }
      
      // 트랜잭션이 블록에 포함됨
      if (tx.blockNumber) {
        // 영수증 조회
        const receipt = await provider.getTransactionReceipt(transaction.id);
        
        if (receipt) {
          // 확인된 경우
          const latestBlock = await provider.getBlockNumber();
          const confirmations = latestBlock - receipt.blockNumber + 1;
          
          // 상태 확인
          const status = receipt.status === 1 ? TransactionStatus.CONFIRMED : TransactionStatus.FAILED;
          
          // 수수료 계산
          const gasUsed = receipt.gasUsed;
          let fee: string | undefined;
          
          if (receipt.effectiveGasPrice && gasUsed) {
            const feeWei = receipt.effectiveGasPrice * gasUsed;
            fee = ethers.formatEther(feeWei);
          }
          
          // 상태 업데이트
          await this.updateTransactionStatus(transaction.id, status, {
            blockNumber: receipt.blockNumber,
            blockHash: receipt.blockHash,
            confirmations,
            fee,
            failureReason: status === TransactionStatus.FAILED ? 'Transaction execution failed' : undefined,
          });
        } else if (tx.status === TransactionStatus.PENDING) {
          // 블록에 포함됐지만 영수증이 없는 경우
          await this.updateTransactionStatus(transaction.id, TransactionStatus.CONFIRMING, {
            blockNumber: tx.blockNumber,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to check EVM transaction ${transaction.id}`, error);
    }
  }
  
  /**
   * 대체 트랜잭션 찾기
   * 
   * @param address 주소
   * @param nonce 논스
   * @param networkType 네트워크 유형
   * @returns 트랜잭션 또는 null
   */
  private async findReplacementTransaction(
    address: string,
    nonce: number,
    networkType: NetworkType
  ): Promise<{ hash: string } | null> {
    try {
      // 네트워크 제공자 가져오기
      const provider = this.networkService.getProvider(networkType) as ethers.JsonRpcProvider;
      
      // 현재 논스 조회
      const currentNonce = await provider.getTransactionCount(address);
      
      // 논스가 이미 사용된 경우
      if (currentNonce > nonce) {
        // TODO: 논스에 해당하는 트랜잭션 해시를 찾는 로직 필요
        // 현재는 이더리움 네트워크에서 이를 직접 조회하는 API가 없어 구현이 어려움
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to find replacement transaction', error);
      return null;
    }
  }
  
  /**
   * 트랜잭션 취소
   * 
   * @param txId 트랜잭션 ID
   * @returns 트랜잭션 객체
   */
  public async cancelTransaction(txId: string): Promise<Transaction> {
    try {
      // 트랜잭션 가져오기
      const transaction = this.transactions[txId];
      if (!transaction) {
        throw new ToriWalletError(ErrorCode.TRANSACTION_NOT_FOUND, 'Transaction not found');
      }
      
      // 취소 가능한 상태인지 확인
      if (transaction.status !== TransactionStatus.PENDING && transaction.status !== TransactionStatus.CONFIRMING) {
        throw new ToriWalletError(
          ErrorCode.UNSUPPORTED_OPERATION,
          'Only pending transactions can be cancelled'
        );
      }
      
      // 네트워크별 구현 분기
      if (this.isEVMNetwork(transaction.networkType)) {
        // EVM 호환 네트워크에서의 트랜잭션 취소
        
        const nonce = transaction.data?.evmData?.nonce;
        if (nonce === undefined) {
          throw new ToriWalletError(ErrorCode.INVALID_TRANSACTION, 'Transaction nonce not found');
        }
        
        // 0 값 트랜잭션 생성 (자신에게 보내는 빈 트랜잭션)
        const cancelParams: TransferParams = {
          from: transaction.fromAddress,
          to: transaction.fromAddress,
          amount: '0',
          networkType: transaction.networkType,
          nonce,
          gasInfo: {
            // 가스 가격 증가 (기존의 1.5배)
            gasPrice: transaction.data?.evmData?.gasPrice
              ? (BigInt(transaction.data.evmData.gasPrice) * 15n / 10n).toString()
              : undefined,
            maxFeePerGas: transaction.data?.evmData?.maxFeePerGas
              ? (BigInt(transaction.data.evmData.maxFeePerGas) * 15n / 10n).toString()
              : undefined,
            maxPriorityFeePerGas: transaction.data?.evmData?.maxPriorityFeePerGas
              ? (BigInt(transaction.data.evmData.maxPriorityFeePerGas) * 15n / 10n).toString()
              : undefined,
            gasLimit: transaction.data?.evmData?.gasLimit,
          },
        };
        
        // 취소 트랜잭션 전송
        const cancelTx = await this.transfer(cancelParams);
        
        // 원본 트랜잭션 상태 업데이트
        await this.updateTransactionStatus(txId, TransactionStatus.CANCELLED, {
          replaced: {
            by: cancelTx.id,
            reason: 'Transaction was cancelled by user',
          },
        });
        
        return cancelTx;
      } else if (this.isBitcoinNetwork(transaction.networkType)) {
        // 비트코인 네트워크에서의 트랜잭션 취소
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Bitcoin transaction cancellation not implemented');
      } else if (this.isSolanaNetwork(transaction.networkType)) {
        // 솔라나 네트워크에서의 트랜잭션 취소
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Solana transaction cancellation not implemented');
      } else if (transaction.networkType === NetworkType.ZENITH_MAINNET) {
        // 제니스 체인에서의 트랜잭션 취소
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Zenith transaction cancellation not implemented');
      } else {
        throw new ToriWalletError(ErrorCode.UNSUPPORTED_NETWORK, `Unsupported network type: ${transaction.networkType}`);
      }
    } catch (error) {
      console.error('Failed to cancel transaction', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.TRANSACTION_FAILED, 'Failed to cancel transaction', error);
    }
  }
  
  /**
   * 트랜잭션 가속
   * 
   * @param txId 트랜잭션 ID
   * @returns 트랜잭션 객체
   */
  public async speedUpTransaction(txId: string): Promise<Transaction> {
    try {
      // 트랜잭션 가져오기
      const transaction = this.transactions[txId];
      if (!transaction) {
        throw new ToriWalletError(ErrorCode.TRANSACTION_NOT_FOUND, 'Transaction not found');
      }
      
      // 가속 가능한 상태인지 확인
      if (transaction.status !== TransactionStatus.PENDING) {
        throw new ToriWalletError(
          ErrorCode.UNSUPPORTED_OPERATION,
          'Only pending transactions can be sped up'
        );
      }
      
      // 네트워크별 구현 분기
      if (this.isEVMNetwork(transaction.networkType)) {
        // EVM 호환 네트워크에서의 트랜잭션 가속
        
        // 같은 트랜잭션 데이터로 가스 가격만 증가시켜 재전송
        const evmData = transaction.data?.evmData;
        if (!evmData) {
          throw new ToriWalletError(ErrorCode.INVALID_TRANSACTION, 'Invalid transaction data');
        }
        
        const nonce = evmData.nonce;
        if (nonce === undefined) {
          throw new ToriWalletError(ErrorCode.INVALID_TRANSACTION, 'Transaction nonce not found');
        }
        
        // 새 트랜잭션 매개변수 생성
        const speedUpParams: TransferParams = {
          from: transaction.fromAddress,
          to: transaction.toAddress,
          amount: transaction.amount,
          networkType: transaction.networkType,
          tokenAddress: transaction.data?.tokenInfo?.address,
          memo: transaction.memo,
          nonce,
          gasInfo: {
            // 가스 가격 증가 (기존의 1.5배)
            gasPrice: evmData.gasPrice
              ? (BigInt(evmData.gasPrice) * 15n / 10n).toString()
              : undefined,
            maxFeePerGas: evmData.maxFeePerGas
              ? (BigInt(evmData.maxFeePerGas) * 15n / 10n).toString()
              : undefined,
            maxPriorityFeePerGas: evmData.maxPriorityFeePerGas
              ? (BigInt(evmData.maxPriorityFeePerGas) * 15n / 10n).toString()
              : undefined,
            gasLimit: evmData.gasLimit,
          },
        };
        
        // 가속 트랜잭션 전송
        const speedUpTx = await this.transfer(speedUpParams);
        
        // 원본 트랜잭션 상태 업데이트
        await this.updateTransactionStatus(txId, TransactionStatus.REPLACED, {
          replaced: {
            by: speedUpTx.id,
            reason: 'Transaction was sped up by user',
          },
        });
        
        return speedUpTx;
      } else if (this.isBitcoinNetwork(transaction.networkType)) {
        // 비트코인 네트워크에서의 트랜잭션 가속
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Bitcoin transaction speed up not implemented');
      } else if (this.isSolanaNetwork(transaction.networkType)) {
        // 솔라나 네트워크에서의 트랜잭션 가속
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Solana transaction speed up not implemented');
      } else if (transaction.networkType === NetworkType.ZENITH_MAINNET) {
        // 제니스 체인에서의 트랜잭션 가속
        throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Zenith transaction speed up not implemented');
      } else {
        throw new ToriWalletError(ErrorCode.UNSUPPORTED_NETWORK, `Unsupported network type: ${transaction.networkType}`);
      }
    } catch (error) {
      console.error('Failed to speed up transaction', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.TRANSACTION_FAILED, 'Failed to speed up transaction', error);
    }
  }
  
  /**
   * 트랜잭션 가져오기
   * 
   * @param txId 트랜잭션 ID
   * @returns 트랜잭션 객체
   */
  public getTransaction(txId: string): Transaction {
    try {
      const transaction = this.transactions[txId];
      if (!transaction) {
        throw new ToriWalletError(ErrorCode.TRANSACTION_NOT_FOUND, 'Transaction not found');
      }
      
      return transaction;
    } catch (error) {
      console.error('Failed to get transaction', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.TRANSACTION_NOT_FOUND, 'Failed to get transaction', error);
    }
  }
  
  /**
   * 트랜잭션 목록 가져오기
   * 
   * @param filter 필터 (선택적)
   * @param sort 정렬 옵션 (선택적)
   * @param pagination 페이지네이션 옵션 (선택적)
   * @returns 트랜잭션 목록 결과
   */
  public getTransactions(
    filter?: TransactionFilter,
    sort?: TransactionSortOptions,
    pagination?: TransactionPaginationOptions
  ): TransactionListResult {
    try {
      // 트랜잭션 배열로 변환
      let transactions = Object.values(this.transactions);
      
      // 필터링
      if (filter) {
        if (filter.networkType) {
          transactions = transactions.filter(tx => tx.networkType === filter.networkType);
        }
        
        if (filter.type && filter.type.length > 0) {
          transactions = transactions.filter(tx => filter.type!.includes(tx.type));
        }
        
        if (filter.status && filter.status.length > 0) {
          transactions = transactions.filter(tx => filter.status!.includes(tx.status));
        }
        
        if (filter.fromAddress) {
          transactions = transactions.filter(tx => tx.fromAddress.toLowerCase() === filter.fromAddress!.toLowerCase());
        }
        
        if (filter.toAddress) {
          transactions = transactions.filter(tx => tx.toAddress.toLowerCase() === filter.toAddress!.toLowerCase());
        }
        
        if (filter.startDate) {
          transactions = transactions.filter(tx => tx.timestamp >= filter.startDate!);
        }
        
        if (filter.endDate) {
          transactions = transactions.filter(tx => tx.timestamp <= filter.endDate!);
        }
        
        if (filter.tokenAddress) {
          transactions = transactions.filter(tx => 
            tx.data?.tokenInfo?.address.toLowerCase() === filter.tokenAddress!.toLowerCase()
          );
        }
      }
      
      // 정렬
      if (sort) {
        const { field, direction } = sort;
        const sortMultiplier = direction === 'asc' ? 1 : -1;
        
        transactions.sort((a, b) => {
          let aValue: any;
          let bValue: any;
          
          switch (field) {
            case 'timestamp':
              aValue = a.timestamp;
              bValue = b.timestamp;
              break;
            case 'amount':
              aValue = parseFloat(a.amount) || 0;
              bValue = parseFloat(b.amount) || 0;
              break;
            case 'fee':
              aValue = parseFloat(a.fee || '0');
              bValue = parseFloat(b.fee || '0');
              break;
            case 'blockNumber':
              aValue = a.blockNumber || 0;
              bValue = b.blockNumber || 0;
              break;
            case 'createdAt':
              aValue = a.createdAt;
              bValue = b.createdAt;
              break;
            case 'updatedAt':
              aValue = a.updatedAt;
              bValue = b.updatedAt;
              break;
            default:
              return 0;
          }
          
          return (aValue - bValue) * sortMultiplier;
        });
      } else {
        // 기본 정렬: 시간 내림차순 (최신순)
        transactions.sort((a, b) => b.timestamp - a.timestamp);
      }
      
      // 페이지네이션
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const total = transactions.length;
      const pages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const end = page * limit;
      
      const pagedTransactions = transactions.slice(start, end);
      
      return {
        transactions: pagedTransactions,
        total,
        page,
        limit,
        pages,
      };
    } catch (error) {
      console.error('Failed to get transactions', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.UNKNOWN_ERROR, 'Failed to get transactions', error);
    }
  }
  
  /**
   * 계정의 트랜잭션 목록 가져오기
   * 
   * @param address 계정 주소
   * @param networkType 네트워크 유형
   * @param pagination 페이지네이션 옵션 (선택적)
   * @returns 트랜잭션 목록 결과
   */
  public getAccountTransactions(
    address: string,
    networkType: NetworkType,
    pagination?: TransactionPaginationOptions
  ): TransactionListResult {
    try {
      // 필터 생성
      const filter: TransactionFilter = {
        networkType,
        fromAddress: address,
        // 또는 수신자로도 검색
        // toAddress: address,
      };
      
      // 정렬 옵션
      const sort: TransactionSortOptions = {
        field: 'timestamp',
        direction: 'desc',
      };
      
      return this.getTransactions(filter, sort, pagination);
    } catch (error) {
      console.error('Failed to get account transactions', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.UNKNOWN_ERROR, 'Failed to get account transactions', error);
    }
  }
  
  /**
   * 트랜잭션 기록 초기화
   * 
   * @returns 성공 여부
   */
  public async clearTransactionHistory(): Promise<boolean> {
    try {
      // 트랜잭션 목록 초기화
      this.transactions = {};
      this.pendingTransactions = {};
      
      // 스토리지에 저장
      if (this.storage) {
        await this.storage.setItem('transactions', JSON.stringify(this.transactions));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear transaction history', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.STORAGE_DELETE_FAILED, 'Failed to clear transaction history', error);
    }
  }
  
  /**
   * EVM 네트워크 여부 확인
   * 
   * @param networkType 네트워크 유형
   * @returns EVM 호환 여부
   */
  private isEVMNetwork(networkType: NetworkType): boolean {
    return (
      networkType === NetworkType.ETHEREUM_MAINNET ||
      networkType === NetworkType.ETHEREUM_GOERLI ||
      networkType === NetworkType.BSC_MAINNET ||
      networkType === NetworkType.BSC_TESTNET ||
      networkType === NetworkType.POLYGON_MAINNET ||
      networkType === NetworkType.POLYGON_MUMBAI ||
      networkType === NetworkType.CATENA_MAINNET ||
      networkType === NetworkType.CATENA_TESTNET
    );
  }
  
  /**
   * 비트코인 네트워크 여부 확인
   * 
   * @param networkType 네트워크 유형
   * @returns 비트코인 네트워크 여부
   */
  private isBitcoinNetwork(networkType: NetworkType): boolean {
    return (
      networkType === NetworkType.BITCOIN_MAINNET ||
      networkType === NetworkType.BITCOIN_TESTNET
    );
  }
  
  /**
   * 솔라나 네트워크 여부 확인
   * 
   * @param networkType 네트워크 유형
   * @returns 솔라나 네트워크 여부
   */
  private isSolanaNetwork(networkType: NetworkType): boolean {
    return (
      networkType === NetworkType.SOLANA_MAINNET ||
      networkType === NetworkType.SOLANA_DEVNET
    );
  }
}

// 트랜잭션 서비스 싱글톤 인스턴스 (실제 앱에서는 초기화 필요)
// export const transactionServiceInstance = new TransactionService({
//   walletService: walletServiceInstance,
//   networkService: networkServiceInstance,
// });

// 기본 내보내기
export default TransactionService;
