# React Hooks (리액트 훅) - Part 2

추가적인 React 훅들을 설명합니다.

## useTransaction.ts

트랜잭션 관련 React 훅을 제공합니다.

```typescript
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { TransactionType, TransactionStatus, TransactionOptions } from '../types/transaction';
import { TransactionService } from '../services/transaction/transaction-service';
import { ToriError, ErrorCode } from '../constants/errors';

export function useTransaction(networkId: string, accountAddress: string) {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<TransactionType[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<ToriError | null>(null);
  
  // Initialize transaction service and load transactions
  const initialize = useCallback(async () => {
    if (!networkId || !accountAddress) {
      return;
    }
    
    try {
      const txs = await TransactionService.getTransactions(networkId, accountAddress);
      setTransactions(txs);
      setPendingTransactions(txs.filter(tx => tx.status === TransactionStatus.PENDING));
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to initialize transactions', error));
      }
    }
  }, [networkId, accountAddress]);
  
  // Send a transaction
  const sendTransaction = useCallback(async (
    to: string,
    amount: string,
    privateKey: string,
    options?: TransactionOptions
  ) => {
    if (!networkId || !accountAddress) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Network or account not selected');
    }
    
    setIsSending(true);
    setError(null);
    
    try {
      const txResponse = await TransactionService.sendNativeTransaction(
        networkId,
        accountAddress,
        to,
        amount,
        privateKey,
        options
      );
      
      const newTransaction = TransactionService.createTransactionFromResponse(
        txResponse,
        networkId,
        options?.meta
      );
      
      // Add new transaction to state
      setTransactions(prev => [newTransaction, ...prev]);
      setPendingTransactions(prev => [newTransaction, ...prev]);
      
      // Start monitoring the transaction
      TransactionService.monitorTransaction(
        networkId,
        newTransaction.hash!,
        (status, updatedTx) => {
          if (status !== TransactionStatus.PENDING) {
            // Transaction is confirmed or failed
            updateTransactionStatus(newTransaction.id, status, updatedTx);
          }
        }
      );
      
      return newTransaction;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.TRANSACTION_FAILED, 'Failed to send transaction', error));
      }
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [networkId, accountAddress]);
  
  // Send a token transaction
  const sendTokenTransaction = useCallback(async (
    tokenAddress: string,
    to: string,
    amount: string,
    decimals: number,
    privateKey: string,
    options?: TransactionOptions
  ) => {
    if (!networkId || !accountAddress) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Network or account not selected');
    }
    
    setIsSending(true);
    setError(null);
    
    try {
      const txResponse = await TransactionService.sendTokenTransaction(
        networkId,
        accountAddress,
        tokenAddress,
        to,
        amount,
        decimals,
        privateKey,
        options
      );
      
      const newTransaction = TransactionService.createTransactionFromResponse(
        txResponse,
        networkId,
        {
          ...options?.meta,
          tokenTransfer: {
            tokenAddress,
            tokenSymbol: options?.meta?.tokenTransfer?.tokenSymbol || '',
            tokenDecimals: decimals,
            value: amount,
          },
        }
      );
      
      // Add new transaction to state
      setTransactions(prev => [newTransaction, ...prev]);
      setPendingTransactions(prev => [newTransaction, ...prev]);
      
      // Start monitoring the transaction
      TransactionService.monitorTransaction(
        networkId,
        newTransaction.hash!,
        (status, updatedTx) => {
          if (status !== TransactionStatus.PENDING) {
            // Transaction is confirmed or failed
            updateTransactionStatus(newTransaction.id, status, updatedTx);
          }
        }
      );
      
      return newTransaction;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.TRANSACTION_FAILED, 'Failed to send token transaction', error));
      }
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [networkId, accountAddress]);
  
  // Update transaction status
  const updateTransactionStatus = useCallback((
    txId: string,
    status: TransactionStatus,
    updatedTx?: Partial<TransactionType>
  ) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === txId) {
        return {
          ...tx,
          ...updatedTx,
          status,
        };
      }
      return tx;
    }));
    
    if (status !== TransactionStatus.PENDING) {
      setPendingTransactions(prev => prev.filter(tx => tx.id !== txId));
    }
  }, []);
  
  // Get transaction details
  const getTransactionDetails = useCallback(async (txHash: string) => {
    if (!networkId) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Network not selected');
    }
    
    try {
      const txDetails = await TransactionService.getTransactionDetails(networkId, txHash);
      return txDetails;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to get transaction details', error));
      }
      throw error;
    }
  }, [networkId]);
  
  // Get transaction by id
  const getTransactionById = useCallback((txId: string) => {
    return transactions.find(tx => tx.id === txId);
  }, [transactions]);
  
  // Get transactions by status
  const getTransactionsByStatus = useCallback((status: TransactionStatus) => {
    return transactions.filter(tx => tx.status === status);
  }, [transactions]);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Initialize on mount or when network/account changes
  useEffect(() => {
    initialize();
    
    // Start monitoring pending transactions
    pendingTransactions.forEach(tx => {
      if (tx.hash) {
        TransactionService.monitorTransaction(
          networkId,
          tx.hash,
          (status, updatedTx) => {
            if (status !== TransactionStatus.PENDING) {
              // Transaction is confirmed or failed
              updateTransactionStatus(tx.id, status, updatedTx);
            }
          }
        );
      }
    });
  }, [initialize, networkId, accountAddress, pendingTransactions, updateTransactionStatus]);
  
  return {
    transactions,
    pendingTransactions,
    isSending,
    error,
    sendTransaction,
    sendTokenTransaction,
    getTransactionDetails,
    getTransactionById,
    getTransactionsByStatus,
    clearError,
  };
}
```

## useStaking.ts

스테이킹 관련 React 훅을 제공합니다.

```typescript
import { useState, useEffect, useCallback } from 'react';
import { 
  ValidatorType, 
  DelegationType, 
  StakingOptions, 
  UnstakingOptions, 
  ClaimRewardsOptions 
} from '../types/staking';
import { StakingService } from '../services/staking/staking-service';
import { ToriError, ErrorCode } from '../constants/errors';

export function useStaking(networkId: string, accountAddress: string) {
  const [validators, setValidators] = useState<ValidatorType[]>([]);
  const [delegations, setDelegations] = useState<DelegationType[]>([]);
  const [totalStaked, setTotalStaked] = useState<string>('0');
  const [totalRewards, setTotalRewards] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ToriError | null>(null);
  
  // Initialize staking service and load data
  const initialize = useCallback(async () => {
    if (!networkId || !accountAddress) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load validators
      const validatorsList = await StakingService.getValidators(networkId);
      setValidators(validatorsList);
      
      // Load delegations
      const delegationsList = await StakingService.getDelegations(networkId, accountAddress);
      setDelegations(delegationsList);
      
      // Calculate total staked
      const total = delegationsList.reduce((sum, delegation) => {
        if (delegation.status === 'active') {
          return sum.add(delegation.amount);
        }
        return sum;
      }, ethers.BigNumber.from(0)).toString();
      
      setTotalStaked(total);
      
      // Calculate total rewards
      const rewards = delegationsList.reduce((sum, delegation) => {
        return sum.add(delegation.rewards);
      }, ethers.BigNumber.from(0)).toString();
      
      setTotalRewards(rewards);
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to initialize staking data', error));
      }
    } finally {
      setIsLoading(false);
    }
  }, [networkId, accountAddress]);
  
  // Stake tokens
  const stake = useCallback(async (privateKey: string, options: StakingOptions) => {
    if (!networkId || !accountAddress) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Network or account not selected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const txHash = await StakingService.stake(
        networkId,
        accountAddress,
        privateKey,
        options
      );
      
      // Wait for transaction to be mined
      await StakingService.waitForTransaction(networkId, txHash);
      
      // Refresh delegations
      const delegationsList = await StakingService.getDelegations(networkId, accountAddress);
      setDelegations(delegationsList);
      
      // Update total staked
      const total = delegationsList.reduce((sum, delegation) => {
        if (delegation.status === 'active') {
          return sum.add(delegation.amount);
        }
        return sum;
      }, ethers.BigNumber.from(0)).toString();
      
      setTotalStaked(total);
      
      return txHash;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to stake tokens', error));
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [networkId, accountAddress]);
  
  // Unstake tokens
  const unstake = useCallback(async (privateKey: string, options: UnstakingOptions) => {
    if (!networkId || !accountAddress) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Network or account not selected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const txHash = await StakingService.unstake(
        networkId,
        accountAddress,
        privateKey,
        options
      );
      
      // Wait for transaction to be mined
      await StakingService.waitForTransaction(networkId, txHash);
      
      // Refresh delegations
      const delegationsList = await StakingService.getDelegations(networkId, accountAddress);
      setDelegations(delegationsList);
      
      // Update total staked
      const total = delegationsList.reduce((sum, delegation) => {
        if (delegation.status === 'active') {
          return sum.add(delegation.amount);
        }
        return sum;
      }, ethers.BigNumber.from(0)).toString();
      
      setTotalStaked(total);
      
      return txHash;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to unstake tokens', error));
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [networkId, accountAddress]);
  
  // Claim rewards
  const claimRewards = useCallback(async (privateKey: string, options?: ClaimRewardsOptions) => {
    if (!networkId || !accountAddress) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Network or account not selected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const txHash = await StakingService.claimRewards(
        networkId,
        accountAddress,
        privateKey,
        options
      );
      
      // Wait for transaction to be mined
      await StakingService.waitForTransaction(networkId, txHash);
      
      // Refresh delegations
      const delegationsList = await StakingService.getDelegations(networkId, accountAddress);
      setDelegations(delegationsList);
      
      // Update total rewards
      const rewards = delegationsList.reduce((sum, delegation) => {
        return sum.add(delegation.rewards);
      }, ethers.BigNumber.from(0)).toString();
      
      setTotalRewards(rewards);
      
      return txHash;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to claim rewards', error));
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [networkId, accountAddress]);
  
  // Get validator by id
  const getValidatorById = useCallback((validatorId: string) => {
    return validators.find(validator => validator.id === validatorId);
  }, [validators]);
  
  // Get delegations by validator
  const getDelegationsByValidator = useCallback((validatorId: string) => {
    return delegations.filter(delegation => delegation.validatorId === validatorId);
  }, [delegations]);
  
  // Refresh delegations
  const refreshDelegations = useCallback(async () => {
    if (!networkId || !accountAddress) {
      return;
    }
    
    try {
      const delegationsList = await StakingService.getDelegations(networkId, accountAddress);
      setDelegations(delegationsList);
      
      // Update total staked
      const total = delegationsList.reduce((sum, delegation) => {
        if (delegation.status === 'active') {
          return sum.add(delegation.amount);
        }
        return sum;
      }, ethers.BigNumber.from(0)).toString();
      
      setTotalStaked(total);
      
      // Update total rewards
      const rewards = delegationsList.reduce((sum, delegation) => {
        return sum.add(delegation.rewards);
      }, ethers.BigNumber.from(0)).toString();
      
      setTotalRewards(rewards);
      
      return delegationsList;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to refresh delegations', error));
      }
      throw error;
    }
  }, [networkId, accountAddress]);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Initialize on mount or when network/account changes
  useEffect(() => {
    initialize();
    
    // Start a timer to refresh delegations
    const intervalId = setInterval(refreshDelegations, 60000); // every minute
    
    return () => {
      clearInterval(intervalId);
    };
  }, [initialize, refreshDelegations]);
  
  return {
    validators,
    delegations,
    totalStaked,
    totalRewards,
    isLoading,
    error,
    stake,
    unstake,
    claimRewards,
    getValidatorById,
    getDelegationsByValidator,
    refreshDelegations,
    clearError,
  };
}
```
