import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { useNetwork } from './useNetwork';
import { 
  ICPTransferParams, 
  ICPTransferResult, 
  BridgeTransferParams, 
  BridgeTransaction, 
  SwapParams, 
  SwapTransaction, 
  Route, 
  RouteParams 
} from '../../../core/types';

/**
 * Custom hook for interfacing with crosschain functionality
 * 
 * Provides methods for interacting with ICP transfers, bridges, and cross-chain swaps
 */
export const useCrosschain = () => {
  const { selectedAccount } = useWallet();
  const { selectedNetwork } = useNetwork();
  
  // Local state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [icpTransferHistory, setIcpTransferHistory] = useState<ICPTransferResult[]>([]);
  const [bridgeTransactionHistory, setBridgeTransactionHistory] = useState<BridgeTransaction[]>([]);
  const [swapHistory, setSwapHistory] = useState<SwapTransaction[]>([]);

  // Load history for the current account
  const loadHistory = useCallback(async (address?: string) => {
    if (!selectedAccount && !address) return;
    
    const accountAddress = address || selectedAccount.address;
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        icpTransfers: ICPTransferResult[];
        bridgeTransactions: BridgeTransaction[];
        swaps: SwapTransaction[];
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_CROSSCHAIN_HISTORY',
            data: { address: accountAddress }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      setIcpTransferHistory(result.icpTransfers || []);
      setBridgeTransactionHistory(result.bridgeTransactions || []);
      setSwapHistory(result.swaps || []);
    } catch (error) {
      console.error('Failed to load crosschain history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount]);

  // Load history when account changes
  useEffect(() => {
    if (selectedAccount) {
      loadHistory();
    }
  }, [selectedAccount, loadHistory]);

  // Initiate an ICP transfer
  const initiateICPTransfer = useCallback(async (params: ICPTransferParams): Promise<ICPTransferResult> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<ICPTransferResult>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'INITIATE_ICP_TRANSFER',
            data: params
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
      
      // Update local history
      setIcpTransferHistory(prev => [result, ...prev]);
      
      return result;
    } catch (error) {
      console.error('Failed to initiate ICP transfer:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get the status of an ICP transfer
  const getICPTransferStatus = useCallback(async (txHash: string): Promise<ICPTransferResult> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<ICPTransferResult>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_ICP_TRANSFER_STATUS',
            data: { txHash }
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
      
      return result;
    } catch (error) {
      console.error('Failed to get ICP transfer status:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initiate a bridge transfer
  const initiateBridgeTransfer = useCallback(async (params: BridgeTransferParams): Promise<BridgeTransaction> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<BridgeTransaction>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'INITIATE_BRIDGE_TRANSFER',
            data: params
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
      
      // Update local history
      setBridgeTransactionHistory(prev => [result, ...prev]);
      
      return result;
    } catch (error) {
      console.error('Failed to initiate bridge transfer:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get the status of a bridge transaction
  const getBridgeTransactionStatus = useCallback(async (id: string): Promise<BridgeTransaction> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<BridgeTransaction>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_BRIDGE_TRANSACTION_STATUS',
            data: { id }
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
      
      return result;
    } catch (error) {
      console.error('Failed to get bridge transaction status:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get bridge providers
  const getBridgeProviders = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<any[]>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_BRIDGE_PROVIDERS'
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.providers);
            }
          }
        );
      });
      
      return result;
    } catch (error) {
      console.error('Failed to get bridge providers:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get bridge quote
  const getBridgeQuote = useCallback(async (params: Omit<BridgeTransferParams, 'toAddress'>) => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<any[]>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_BRIDGE_QUOTE',
            data: params
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.quotes);
            }
          }
        );
      });
      
      return result;
    } catch (error) {
      console.error('Failed to get bridge quote:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Execute a cross-chain swap
  const executeSwap = useCallback(async (params: SwapParams): Promise<SwapTransaction> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<SwapTransaction>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'EXECUTE_SWAP',
            data: params
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
      
      // Update local history
      setSwapHistory(prev => [result, ...prev]);
      
      return result;
    } catch (error) {
      console.error('Failed to execute swap:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get the status of a swap transaction
  const getSwapStatus = useCallback(async (id: string): Promise<SwapTransaction> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<SwapTransaction>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_SWAP_STATUS',
            data: { id }
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
      
      return result;
    } catch (error) {
      console.error('Failed to get swap status:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get swap quote
  const getSwapQuote = useCallback(async (params: Omit<SwapParams, 'toAddress' | 'slippage' | 'route'>) => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<any[]>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_SWAP_QUOTE',
            data: params
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.routes);
            }
          }
        );
      });
      
      return result;
    } catch (error) {
      console.error('Failed to get swap quote:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Find optimal routes
  const findRoutes = useCallback(async (params: RouteParams): Promise<Route[]> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<Route[]>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'FIND_ROUTES',
            data: params
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.routes);
            }
          }
        );
      });
      
      return result;
    } catch (error) {
      console.error('Failed to find routes:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    icpTransferHistory,
    bridgeTransactionHistory,
    swapHistory,
    isLoading,
    loadHistory,
    initiateICPTransfer,
    getICPTransferStatus,
    initiateBridgeTransfer,
    getBridgeTransactionStatus,
    getBridgeProviders,
    getBridgeQuote,
    executeSwap,
    getSwapStatus,
    getSwapQuote,
    findRoutes
  };
};
