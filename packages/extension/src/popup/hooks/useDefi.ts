import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { useNetwork } from './useNetwork';
import {
  Pool,
  LiquidityPosition,
  FarmingPosition,
  LendingPool,
  LendingPosition,
  DefiTransaction,
  SwapQuote,
  TokenPrice
} from '../../core/types';

/**
 * DeFi 기능을 사용하기 위한 커스텀 훅
 * 
 * 유동성 풀, 파밍, 대출, 스왑 등의 기능을 제공합니다.
 */
export const useDefi = () => {
  const { selectedAccount } = useWallet();
  const { selectedNetwork } = useNetwork();
  
  // 상태 관리
  const [pools, setPools] = useState<Pool[]>([]);
  const [liquidityPositions, setLiquidityPositions] = useState<LiquidityPosition[]>([]);
  const [farmingPositions, setFarmingPositions] = useState<FarmingPosition[]>([]);
  const [lendingPools, setLendingPools] = useState<LendingPool[]>([]);
  const [lendingPositions, setLendingPositions] = useState<LendingPosition[]>([]);
  const [defiTransactions, setDefiTransactions] = useState<DefiTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 풀 로딩
  const loadPools = useCallback(async (
    types?: ('SWAP' | 'FARM' | 'LENDING')[],
    status?: ('ACTIVE' | 'INACTIVE' | 'DEPRECATED')[],
    limit?: number
  ) => {
    if (!selectedNetwork) return;
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        pools: Pool[]
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_DEFI_POOLS',
            data: {
              networkId: selectedNetwork.id,
              types,
              status,
              limit
            }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      setPools(result.pools || []);
    } catch (error) {
      console.error('유동성 풀 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedNetwork]);
  
  // 유동성 포지션 로딩
  const loadLiquidityPositions = useCallback(async () => {
    if (!selectedAccount || !selectedNetwork) return;
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        positions: LiquidityPosition[]
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_LIQUIDITY_POSITIONS',
            data: {
              networkId: selectedNetwork.id,
              address: selectedAccount.address
            }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      setLiquidityPositions(result.positions || []);
    } catch (error) {
      console.error('유동성 포지션 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);
  
  // 파밍 포지션 로딩
  const loadFarmingPositions = useCallback(async () => {
    if (!selectedAccount || !selectedNetwork) return;
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        positions: FarmingPosition[]
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_FARMING_POSITIONS',
            data: {
              networkId: selectedNetwork.id,
              address: selectedAccount.address
            }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      setFarmingPositions(result.positions || []);
    } catch (error) {
      console.error('파밍 포지션 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);
  
  // 대출 풀 로딩
  const loadLendingPools = useCallback(async (
    status?: ('ACTIVE' | 'INACTIVE' | 'DEPRECATED')[],
    limit?: number
  ) => {
    if (!selectedNetwork) return;
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        pools: LendingPool[]
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_LENDING_POOLS',
            data: {
              networkId: selectedNetwork.id,
              status,
              limit
            }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      setLendingPools(result.pools || []);
    } catch (error) {
      console.error('대출 풀 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedNetwork]);
  
  // 대출 포지션 로딩
  const loadLendingPositions = useCallback(async () => {
    if (!selectedAccount || !selectedNetwork) return;
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        positions: LendingPosition[]
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_LENDING_POSITIONS',
            data: {
              networkId: selectedNetwork.id,
              address: selectedAccount.address
            }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      setLendingPositions(result.positions || []);
    } catch (error) {
      console.error('대출 포지션 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);
  
  // 트랜잭션 히스토리 로딩
  const loadTransactionHistory = useCallback(async (limit?: number) => {
    if (!selectedAccount || !selectedNetwork) return;
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        transactions: DefiTransaction[]
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_DEFI_TRANSACTION_HISTORY',
            data: {
              networkId: selectedNetwork.id,
              address: selectedAccount.address,
              limit
            }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      setDefiTransactions(result.transactions || []);
    } catch (error) {
      console.error('DeFi 트랜잭션 히스토리 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);
  
  // 토큰 가격 조회
  const getTokenPrice = useCallback(async (tokenAddress: string): Promise<TokenPrice | null> => {
    if (!selectedNetwork) return null;
    
    try {
      const result = await new Promise<{
        price: TokenPrice | null
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_TOKEN_PRICE',
            data: {
              networkId: selectedNetwork.id,
              tokenAddress
            }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      return result.price;
    } catch (error) {
      console.error('토큰 가격 조회 실패:', error);
      return null;
    }
  }, [selectedNetwork]);
  
  // 토큰 스왑 견적 가져오기
  const getSwapQuote = useCallback(async (
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<SwapQuote | null> => {
    if (!selectedNetwork) return null;
    
    try {
      const result = await new Promise<{
        quote: SwapQuote | null
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_SWAP_QUOTE',
            data: {
              networkId: selectedNetwork.id,
              fromToken,
              toToken,
              amount
            }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      return result.quote;
    } catch (error) {
      console.error('스왑 견적 가져오기 실패:', error);
      return null;
    }
  }, [selectedNetwork]);
  
  // 유동성 추가
  const addLiquidity = useCallback(async (
    poolId: string,
    amounts: string[]
  ): Promise<DefiTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('계정 또는 네트워크가 선택되지 않았습니다');
    }
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        transaction: DefiTransaction;
        error?: string;
      }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'ADD_LIQUIDITY',
            data: {
              networkId: selectedNetwork.id,
              poolId,
              fromAddress: selectedAccount.address,
              amounts
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });
      
      // 트랜잭션 상태 업데이트
      setDefiTransactions(prev => [result.transaction, ...prev]);
      
      return result.transaction;
    } catch (error) {
      console.error('유동성 추가 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);
  
  // 유동성 제거
  const removeLiquidity = useCallback(async (
    positionId: string,
    percentage: number
  ): Promise<DefiTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('계정 또는 네트워크가 선택되지 않았습니다');
    }
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        transaction: DefiTransaction;
        error?: string;
      }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'REMOVE_LIQUIDITY',
            data: {
              networkId: selectedNetwork.id,
              positionId,
              fromAddress: selectedAccount.address,
              percentage
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });
      
      // 트랜잭션 상태 업데이트
      setDefiTransactions(prev => [result.transaction, ...prev]);
      
      return result.transaction;
    } catch (error) {
      console.error('유동성 제거 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);
  
  // LP 토큰 스테이킹
  const stakeLpToken = useCallback(async (
    farmId: string,
    amount: string
  ): Promise<DefiTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('계정 또는 네트워크가 선택되지 않았습니다');
    }
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        transaction: DefiTransaction;
        error?: string;
      }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'STAKE_LP_TOKEN',
            data: {
              networkId: selectedNetwork.id,
              farmId,
              fromAddress: selectedAccount.address,
              amount
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });
      
      // 트랜잭션 상태 업데이트
      setDefiTransactions(prev => [result.transaction, ...prev]);
      
      return result.transaction;
    } catch (error) {
      console.error('LP 토큰 스테이킹 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);
  
  // LP 토큰 언스테이킹
  const unstakeLpToken = useCallback(async (
    positionId: string,
    percentage: number
  ): Promise<DefiTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('계정 또는 네트워크가 선택되지 않았습니다');
    }
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        transaction: DefiTransaction;
        error?: string;
      }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'UNSTAKE_LP_TOKEN',
            data: {
              networkId: selectedNetwork.id,
              positionId,
              fromAddress: selectedAccount.address,
              percentage
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });
      
      // 트랜잭션 상태 업데이트
      setDefiTransactions(prev => [result.transaction, ...prev]);
      
      return result.transaction;
    } catch (error) {
      console.error('LP 토큰 언스테이킹 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);
  
  // 파밍 보상 수확
  const harvestRewards = useCallback(async (
    positionId: string
  ): Promise<DefiTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('계정 또는 네트워크가 선택되지 않았습니다');
    }
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        transaction: DefiTransaction;
        error?: string;
      }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'HARVEST_REWARDS',
            data: {
              networkId: selectedNetwork.id,
              positionId,
              fromAddress: selectedAccount.address
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });
      
      // 트랜잭션 상태 업데이트
      setDefiTransactions(prev => [result.transaction, ...prev]);
      
      return result.transaction;
    } catch (error) {
      console.error('파밍 보상 수확 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);
  
  // 자산 대출 풀에 공급
  const supplyAsset = useCallback(async (
    poolId: string,
    amount: string
  ): Promise<DefiTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('계정 또는 네트워크가 선택되지 않았습니다');
    }
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        transaction: DefiTransaction;
        error?: string;
      }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'SUPPLY_ASSET',
            data: {
              networkId: selectedNetwork.id,
              poolId,
              fromAddress: selectedAccount.address,
              amount
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });
      
      // 트랜잭션 상태 업데이트
      setDefiTransactions(prev => [result.transaction, ...prev]);
      
      return result.transaction;
    } catch (error) {
      console.error('자산 공급 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);
  
  // 자산 인출
  const withdrawAsset = useCallback(async (
    positionId: string,
    amount: string
  ): Promise<DefiTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('계정 또는 네트워크가 선택되지 않았습니다');
    }
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        transaction: DefiTransaction;
        error?: string;
      }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'WITHDRAW_ASSET',
            data: {
              networkId: selectedNetwork.id,
              positionId,
              fromAddress: selectedAccount.address,
              amount
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });
      
      // 트랜잭션 상태 업데이트
      setDefiTransactions(prev => [result.transaction, ...prev]);
      
      return result.transaction;
    } catch (error) {
      console.error('자산 인출 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);
  
  // 자산 대출
  const borrowAsset = useCallback(async (
    poolId: string,
    amount: string
  ): Promise<DefiTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('계정 또는 네트워크가 선택되지 않았습니다');
    }
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        transaction: DefiTransaction;
        error?: string;
      }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'BORROW_ASSET',
            data: {
              networkId: selectedNetwork.id,
              poolId,
              fromAddress: selectedAccount.address,
              amount
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });
      
      // 트랜잭션 상태 업데이트
      setDefiTransactions(prev => [result.transaction, ...prev]);
      
      return result.transaction;
    } catch (error) {
      console.error('자산 대출 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);
  
  // 대출 상환
  const repayAsset = useCallback(async (
    positionId: string,
    amount: string
  ): Promise<DefiTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('계정 또는 네트워크가 선택되지 않았습니다');
    }
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        transaction: DefiTransaction;
        error?: string;
      }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'REPAY_ASSET',
            data: {
              networkId: selectedNetwork.id,
              positionId,
              fromAddress: selectedAccount.address,
              amount
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });
      
      // 트랜잭션 상태 업데이트
      setDefiTransactions(prev => [result.transaction, ...prev]);
      
      return result.transaction;
    } catch (error) {
      console.error('대출 상환 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);
  
  // 토큰 스왑
  const swapTokens = useCallback(async (
    fromToken: string,
    toToken: string,
    amount: string,
    slippage: number = 0.5
  ): Promise<DefiTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('계정 또는 네트워크가 선택되지 않았습니다');
    }
    
    setIsLoading(true);
    
    try {
      const result = await new Promise<{
        transaction: DefiTransaction;
        error?: string;
      }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'SWAP_TOKENS',
            data: {
              networkId: selectedNetwork.id,
              fromAddress: selectedAccount.address,
              fromToken,
              toToken,
              amount,
              slippage
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          }
        );
      });
      
      // 트랜잭션 상태 업데이트
      setDefiTransactions(prev => [result.transaction, ...prev]);
      
      return result.transaction;
    } catch (error) {
      console.error('토큰 스왑 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);
  
  // 데이터 초기화
  useEffect(() => {
    if (selectedAccount && selectedNetwork) {
      // 유동성 풀, 파밍 포지션, 대출 포지션 등 로드
      loadPools(['SWAP', 'FARM'], ['ACTIVE']);
      loadLiquidityPositions();
      loadFarmingPositions();
      loadLendingPools(['ACTIVE']);
      loadLendingPositions();
      loadTransactionHistory();
    }
  }, [
    selectedAccount,
    selectedNetwork,
    loadPools,
    loadLiquidityPositions,
    loadFarmingPositions,
    loadLendingPools,
    loadLendingPositions,
    loadTransactionHistory
  ]);
  
  return {
    pools,
    liquidityPositions,
    farmingPositions,
    lendingPools,
    lendingPositions,
    defiTransactions,
    isLoading,
    loadPools,
    loadLiquidityPositions,
    loadFarmingPositions,
    loadLendingPools,
    loadLendingPositions,
    loadTransactionHistory,
    getTokenPrice,
    getSwapQuote,
    addLiquidity,
    removeLiquidity,
    stakeLpToken,
    unstakeLpToken,
    harvestRewards,
    supplyAsset,
    withdrawAsset,
    borrowAsset,
    repayAsset,
    swapTokens
  };
};
