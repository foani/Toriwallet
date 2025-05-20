# Transaction Services (트랜잭션 서비스)

Core 패키지에서 사용되는 트랜잭션 관련 서비스를 설명합니다.

## builder.ts

트랜잭션 빌더 서비스를 제공합니다.

```typescript
import { ethers } from 'ethers';
import { ToriError, ErrorCode } from '../../constants/errors';
import { TransactionOptions } from '../../types/transaction';
import { erc20Abi, erc721Abi } from '../../constants/abis';

export class TransactionBuilder {
  // Build a token transfer transaction
  static buildTokenTransfer(tokenAddress: string, to: string, amount: string, decimals: number = 18): ethers.utils.Deferrable<ethers.providers.TransactionRequest> {
    try {
      const contract = new ethers.utils.Interface(erc20Abi);
      const data = contract.encodeFunctionData('transfer', [
        to,
        ethers.utils.parseUnits(amount, decimals)
      ]);
      
      return {
        to: tokenAddress,
        data,
        value: '0x0',
      };
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to build token transfer transaction', error);
    }
  }

  // Build an NFT transfer transaction
  static buildNFTTransfer(contractAddress: string, from: string, to: string, tokenId: string): ethers.utils.Deferrable<ethers.providers.TransactionRequest> {
    try {
      const contract = new ethers.utils.Interface(erc721Abi);
      const data = contract.encodeFunctionData('transferFrom', [from, to, tokenId]);
      
      return {
        to: contractAddress,
        data,
        value: '0x0',
      };
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to build NFT transfer transaction', error);
    }
  }

  // Build a native currency transfer transaction
  static buildNativeTransfer(to: string, amount: string): ethers.utils.Deferrable<ethers.providers.TransactionRequest> {
    try {
      return {
        to,
        value: ethers.utils.parseEther(amount).toHexString(),
        data: '0x',
      };
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to build native transfer transaction', error);
    }
  }

  // Build a complete transaction
  static async buildTransaction(
    from: string,
    txRequest: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
    provider: ethers.providers.Provider,
    options: TransactionOptions = {}
  ): Promise<ethers.providers.TransactionRequest> {
    try {
      // Get the latest nonce for the sender address
      const nonce = options.nonce !== undefined
        ? options.nonce
        : await provider.getTransactionCount(from, 'pending');
      
      // Get gas price if not provided
      let gasPrice = options.gasPrice;
      if (!gasPrice) {
        // Check if EIP-1559 is supported
        try {
          const feeData = await provider.getFeeData();
          if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
            // Use EIP-1559 fees
            return {
              ...txRequest,
              from,
              nonce,
              type: 2, // EIP-1559 transaction
              maxFeePerGas: options.maxFeePerGas || feeData.maxFeePerGas.toHexString(),
              maxPriorityFeePerGas: options.maxPriorityFeePerGas || feeData.maxPriorityFeePerGas.toHexString(),
              gasLimit: options.gasLimit || await this.estimateGas(txRequest, provider, from),
              chainId: (await provider.getNetwork()).chainId,
            };
          }
        } catch {
          // Fallback to legacy transactions if EIP-1559 not supported
        }
        
        // Legacy transaction
        gasPrice = (await provider.getGasPrice()).toHexString();
      }
      
      return {
        ...txRequest,
        from,
        nonce,
        gasPrice,
        gasLimit: options.gasLimit || await this.estimateGas(txRequest, provider, from),
        chainId: (await provider.getNetwork()).chainId,
      };
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to build transaction', error);
    }
  }

  // Estimate gas for a transaction
  private static async estimateGas(
    txRequest: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
    provider: ethers.providers.Provider,
    from: string
  ): Promise<string> {
    try {
      const gasLimit = await provider.estimateGas({
        ...txRequest,
        from,
      });
      
      // Add 20% buffer to the estimated gas limit
      return gasLimit.mul(120).div(100).toHexString();
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to estimate gas', error);
    }
  }
}
```

## signer.ts

트랜잭션 서명 서비스를 제공합니다.

```typescript
import { ethers } from 'ethers';
import { ToriError, ErrorCode } from '../../constants/errors';
import { SignatureService } from '../crypto/signature';

export class TransactionSigner {
  // Sign a transaction with a private key
  static async signTransaction(
    privateKey: string,
    transaction: ethers.providers.TransactionRequest
  ): Promise<string> {
    try {
      return await SignatureService.signTransaction(privateKey, transaction);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to sign transaction', error);
    }
  }

  // Sign a transaction with a wallet
  static async signTransactionWithWallet(
    wallet: ethers.Wallet,
    transaction: ethers.providers.TransactionRequest
  ): Promise<string> {
    try {
      return await wallet.signTransaction(transaction);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to sign transaction with wallet', error);
    }
  }

  // Sign a typed data (EIP-712) with a private key
  static signTypedData(
    privateKey: string,
    domain: any,
    types: any,
    value: any
  ): string {
    try {
      return SignatureService.signTypedData(privateKey, domain, types, value);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to sign typed data', error);
    }
  }

  // Sign a message with a private key
  static signMessage(
    privateKey: string,
    message: string
  ): string {
    try {
      return SignatureService.signMessage(privateKey, message);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to sign message', error);
    }
  }

  // Sign a message with a wallet
  static signMessageWithWallet(
    wallet: ethers.Wallet,
    message: string
  ): Promise<string> {
    try {
      return wallet.signMessage(message);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to sign message with wallet', error);
    }
  }
}
```
