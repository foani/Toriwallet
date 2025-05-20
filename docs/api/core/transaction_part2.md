# Transaction Services (트랜잭션 서비스) - Part 2

## sender.ts

트랜잭션 전송 서비스를 제공합니다.

```typescript
import { ethers } from 'ethers';
import { ToriError, ErrorCode } from '../../constants/errors';
import { TransactionType, TransactionStatus } from '../../types/transaction';

export class TransactionSender {
  // Send a signed transaction
  static async sendSignedTransaction(
    signedTransaction: string,
    provider: ethers.providers.Provider
  ): Promise<ethers.providers.TransactionResponse> {
    try {
      return await provider.sendTransaction(signedTransaction);
    } catch (error) {
      throw new ToriError(ErrorCode.TRANSACTION_FAILED, 'Failed to send signed transaction', error);
    }
  }

  // Send a transaction directly using a wallet
  static async sendTransaction(
    wallet: ethers.Wallet,
    transaction: ethers.providers.TransactionRequest
  ): Promise<ethers.providers.TransactionResponse> {
    try {
      return await wallet.sendTransaction(transaction);
    } catch (error) {
      throw new ToriError(ErrorCode.TRANSACTION_FAILED, 'Failed to send transaction', error);
    }
  }

  // Wait for a transaction to be mined
  static async waitForTransaction(
    txHash: string,
    provider: ethers.providers.Provider,
    confirmations: number = 1
  ): Promise<ethers.providers.TransactionReceipt> {
    try {
      return await provider.waitForTransaction(txHash, confirmations);
    } catch (error) {
      throw new ToriError(ErrorCode.TRANSACTION_FAILED, 'Failed to wait for transaction', error);
    }
  }

  // Monitor a transaction
  static async monitorTransaction(
    txHash: string,
    provider: ethers.providers.Provider,
    onUpdate: (status: TransactionStatus, receipt?: ethers.providers.TransactionReceipt) => void,
    confirmations: number = 1,
    timeoutMs: number = 300000 // 5 minutes
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkInterval = setInterval(async () => {
        try {
          // Check if transaction has been mined
          const receipt = await provider.getTransactionReceipt(txHash);
          
          if (receipt) {
            // Transaction has been mined
            if (receipt.confirmations >= confirmations) {
              // Transaction has enough confirmations
              clearInterval(checkInterval);
              onUpdate(
                receipt.status === 1 ? TransactionStatus.CONFIRMED : TransactionStatus.FAILED,
                receipt
              );
              resolve();
            } else {
              // Transaction is mined but waiting for confirmations
              onUpdate(TransactionStatus.PENDING, receipt);
            }
          } else {
            // Transaction is still pending
            onUpdate(TransactionStatus.PENDING);
          }
          
          // Check for timeout
          if (Date.now() - startTime > timeoutMs) {
            clearInterval(checkInterval);
            onUpdate(TransactionStatus.FAILED);
            reject(new ToriError(ErrorCode.TRANSACTION_TIMEOUT, 'Transaction monitoring timed out'));
          }
        } catch (error) {
          clearInterval(checkInterval);
          onUpdate(TransactionStatus.FAILED);
          reject(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to monitor transaction', error));
        }
      }, 5000); // Check every 5 seconds
    });
  }

  // Create a transaction object from a transaction response
  static createTransactionObject(
    txResponse: ethers.providers.TransactionResponse,
    networkId: string,
    meta?: any
  ): TransactionType {
    return {
      id: `${networkId}-${txResponse.hash}`,
      networkId,
      hash: txResponse.hash,
      from: txResponse.from,
      to: txResponse.to || '',
      value: txResponse.value.toString(),
      data: txResponse.data,
      gas: txResponse.gasLimit.toString(),
      gasPrice: txResponse.gasPrice?.toString(),
      nonce: txResponse.nonce,
      status: TransactionStatus.PENDING,
      timestamp: Date.now(),
      meta,
    };
  }
}
```
