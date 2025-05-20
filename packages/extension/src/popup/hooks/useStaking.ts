import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { useNetwork } from './useNetwork';
import { 
  Validator,
  Delegation,
  StakingReward,
  AutocompoundSetting,
  StakingTransaction,
  StakingTransactionType,
  StakingPeriod
} from '../../../core/types';

/**
 * Custom hook for interfacing with staking functionality
 * 
 * Provides methods for interacting with validators, delegations, rewards, and autocompound
 */
export const useStaking = () => {
  const { selectedAccount } = useWallet();
  const { selectedNetwork } = useNetwork();
  
  // Local state
  const [validators, setValidators] = useState<Validator[]>([]);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [pendingRewards, setPendingRewards] = useState<StakingReward[]>([]);
  const [autocompoundSettings, setAutocompoundSettings] = useState<AutocompoundSetting[]>([]);
  const [stakingHistory, setStakingHistory] = useState<StakingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAutocompoundSupported, setIsAutocompoundSupported] = useState<boolean>(false);
  
  // Load validators for the current network
  const loadValidators = useCallback(async (status?: string, limit?: number) => {
    if (!selectedNetwork) return;
    
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        validators: Validator[];
        total: number;
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_VALIDATORS',
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
      
      setValidators(result.validators || []);
    } catch (error) {
      console.error('Failed to load validators:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedNetwork]);

  // Load delegations for the current account
  const loadDelegations = useCallback(async () => {
    if (!selectedAccount || !selectedNetwork) return;
    
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        delegations: Delegation[];
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_DELEGATIONS',
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
      
      setDelegations(result.delegations || []);
    } catch (error) {
      console.error('Failed to load delegations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);

  // Load pending rewards for the current account
  const loadPendingRewards = useCallback(async () => {
    if (!selectedAccount || !selectedNetwork) return;
    
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        rewards: StakingReward[];
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_PENDING_REWARDS',
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
      
      setPendingRewards(result.rewards || []);
    } catch (error) {
      console.error('Failed to load pending rewards:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);

  // Load autocompound settings for the current account
  const loadAutocompoundSettings = useCallback(async () => {
    if (!selectedAccount || !selectedNetwork) return;
    
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        settings: AutocompoundSetting[];
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_AUTOCOMPOUND_SETTINGS',
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
      
      setAutocompoundSettings(result.settings || []);
    } catch (error) {
      console.error('Failed to load autocompound settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);

  // Load staking history for the current account
  const loadStakingHistory = useCallback(async () => {
    if (!selectedAccount || !selectedNetwork) return;
    
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        transactions: StakingTransaction[];
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_STAKING_HISTORY',
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
      
      setStakingHistory(result.transactions || []);
    } catch (error) {
      console.error('Failed to load staking history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);

  // Check if autocompound is supported for the current network
  const checkAutocompoundSupport = useCallback(async () => {
    if (!selectedNetwork) return;
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        supported: boolean;
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'IS_AUTOCOMPOUND_SUPPORTED',
            data: { networkId: selectedNetwork.id }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      setIsAutocompoundSupported(result.supported || false);
    } catch (error) {
      console.error('Failed to check autocompound support:', error);
      setIsAutocompoundSupported(false);
    }
  }, [selectedNetwork]);

  // Search for validators
  const searchValidators = useCallback(async (query: string, limit?: number): Promise<Validator[]> => {
    if (!selectedNetwork) return [];
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        validators: Validator[];
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'SEARCH_VALIDATORS',
            data: { 
              networkId: selectedNetwork.id,
              query,
              limit
            }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      return result.validators || [];
    } catch (error) {
      console.error('Failed to search validators:', error);
      return [];
    }
  }, [selectedNetwork]);

  // Get validator details
  const getValidatorDetails = useCallback(async (validatorAddress: string): Promise<Validator | null> => {
    if (!selectedNetwork) return null;
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        validator: Validator | null;
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_VALIDATOR_DETAILS',
            data: { 
              networkId: selectedNetwork.id,
              validatorAddress
            }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      return result.validator;
    } catch (error) {
      console.error('Failed to get validator details:', error);
      return null;
    }
  }, [selectedNetwork]);

  // Stake tokens
  const stake = useCallback(async (
    validatorAddress: string,
    amount: string,
    period?: StakingPeriod,
    autoCompound?: boolean
  ): Promise<StakingTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('No account or network selected');
    }
    
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<StakingTransaction>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'STAKE',
            data: { 
              networkId: selectedNetwork.id,
              fromAddress: selectedAccount.address,
              validatorAddress,
              amount,
              period,
              autoCompound
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.transaction);
            }
          }
        );
      });
      
      // Update local state
      setStakingHistory(prev => [result, ...prev]);
      
      return result;
    } catch (error) {
      console.error('Failed to stake:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);

  // Unstake tokens
  const unstake = useCallback(async (delegationId: string): Promise<StakingTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('No account or network selected');
    }
    
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<StakingTransaction>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'UNSTAKE',
            data: { 
              networkId: selectedNetwork.id,
              fromAddress: selectedAccount.address,
              delegationId
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.transaction);
            }
          }
        );
      });
      
      // Update local state
      setStakingHistory(prev => [result, ...prev]);
      
      return result;
    } catch (error) {
      console.error('Failed to unstake:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);

  // Redelegate tokens
  const redelegate = useCallback(async (
    delegationId: string, 
    newValidatorAddress: string
  ): Promise<StakingTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('No account or network selected');
    }
    
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<StakingTransaction>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'REDELEGATE',
            data: { 
              networkId: selectedNetwork.id,
              fromAddress: selectedAccount.address,
              delegationId,
              newValidatorAddress
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.transaction);
            }
          }
        );
      });
      
      // Update local state
      setStakingHistory(prev => [result, ...prev]);
      
      return result;
    } catch (error) {
      console.error('Failed to redelegate:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);

  // Claim rewards
  const claimRewards = useCallback(async (
    validatorAddress: string, 
    amount?: string
  ): Promise<StakingTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('No account or network selected');
    }
    
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<StakingTransaction>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'CLAIM_REWARDS',
            data: { 
              networkId: selectedNetwork.id,
              fromAddress: selectedAccount.address,
              validatorAddress,
              amount
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.transaction);
            }
          }
        );
      });
      
      // Update local state
      setStakingHistory(prev => [result, ...prev]);
      
      return result;
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);

  // Claim all rewards
  const claimAllRewards = useCallback(async (): Promise<StakingTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('No account or network selected');
    }
    
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<StakingTransaction>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'CLAIM_ALL_REWARDS',
            data: { 
              networkId: selectedNetwork.id,
              fromAddress: selectedAccount.address
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.transaction);
            }
          }
        );
      });
      
      // Update local state
      setStakingHistory(prev => [result, ...prev]);
      
      return result;
    } catch (error) {
      console.error('Failed to claim all rewards:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);

  // Enable autocompound
  const enableAutocompound = useCallback(async (
    validatorAddress: string,
    percentage?: number
  ): Promise<StakingTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('No account or network selected');
    }
    
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<StakingTransaction>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'ENABLE_AUTOCOMPOUND',
            data: { 
              networkId: selectedNetwork.id,
              fromAddress: selectedAccount.address,
              validatorAddress,
              percentage
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.transaction);
            }
          }
        );
      });
      
      // Update local state
      setStakingHistory(prev => [result, ...prev]);
      
      return result;
    } catch (error) {
      console.error('Failed to enable autocompound:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);

  // Disable autocompound
  const disableAutocompound = useCallback(async (
    validatorAddress: string
  ): Promise<StakingTransaction> => {
    if (!selectedAccount || !selectedNetwork) {
      throw new Error('No account or network selected');
    }
    
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<StakingTransaction>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'DISABLE_AUTOCOMPOUND',
            data: { 
              networkId: selectedNetwork.id,
              fromAddress: selectedAccount.address,
              validatorAddress
            }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.transaction);
            }
          }
        );
      });
      
      // Update local state
      setStakingHistory(prev => [result, ...prev]);
      
      return result;
    } catch (error) {
      console.error('Failed to disable autocompound:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);

  // Get total rewards
  const getTotalRewards = useCallback(async (): Promise<{
    total: string;
    totalUsd: string;
    pendingTotal: string;
    pendingTotalUsd: string;
    claimedTotal: string;
    claimedTotalUsd: string;
  }> => {
    if (!selectedAccount || !selectedNetwork) {
      return {
        total: '0',
        totalUsd: '0',
        pendingTotal: '0',
        pendingTotalUsd: '0',
        claimedTotal: '0',
        claimedTotalUsd: '0'
      };
    }
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        total: string;
        totalUsd: string;
        pendingTotal: string;
        pendingTotalUsd: string;
        claimedTotal: string;
        claimedTotalUsd: string;
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_TOTAL_REWARDS',
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
      
      return result;
    } catch (error) {
      console.error('Failed to get total rewards:', error);
      return {
        total: '0',
        totalUsd: '0',
        pendingTotal: '0',
        pendingTotalUsd: '0',
        claimedTotal: '0',
        claimedTotalUsd: '0'
      };
    }
  }, [selectedAccount, selectedNetwork]);

  // Get autocompound stats
  const getAutocompoundStats = useCallback(async (): Promise<{
    totalAutocompounded: string;
    totalAutocompoundedUsd: string;
    autocompoundedByValidator: {
      validatorAddress: string;
      validatorName: string;
      totalAutocompounded: string;
      totalAutocompoundedUsd: string;
    }[];
  }> => {
    if (!selectedAccount || !selectedNetwork) {
      return {
        totalAutocompounded: '0',
        totalAutocompoundedUsd: '0',
        autocompoundedByValidator: []
      };
    }
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        totalAutocompounded: string;
        totalAutocompoundedUsd: string;
        autocompoundedByValidator: {
          validatorAddress: string;
          validatorName: string;
          totalAutocompounded: string;
          totalAutocompoundedUsd: string;
        }[];
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_AUTOCOMPOUND_STATS',
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
      
      return result;
    } catch (error) {
      console.error('Failed to get autocompound stats:', error);
      return {
        totalAutocompounded: '0',
        totalAutocompoundedUsd: '0',
        autocompoundedByValidator: []
      };
    }
  }, [selectedAccount, selectedNetwork]);

  // Initialize data when account or network changes
  useEffect(() => {
    if (selectedAccount && selectedNetwork) {
      loadValidators();
      loadDelegations();
      loadPendingRewards();
      loadStakingHistory();
      checkAutocompoundSupport();
      
      if (isAutocompoundSupported) {
        loadAutocompoundSettings();
      }
    }
  }, [
    selectedAccount, 
    selectedNetwork, 
    loadValidators, 
    loadDelegations, 
    loadPendingRewards, 
    loadStakingHistory, 
    checkAutocompoundSupport, 
    isAutocompoundSupported, 
    loadAutocompoundSettings
  ]);

  return {
    validators,
    delegations,
    pendingRewards,
    autocompoundSettings,
    stakingHistory,
    isLoading,
    isAutocompoundSupported,
    loadValidators,
    loadDelegations,
    loadPendingRewards,
    loadAutocompoundSettings,
    loadStakingHistory,
    searchValidators,
    getValidatorDetails,
    stake,
    unstake,
    redelegate,
    claimRewards,
    claimAllRewards,
    enableAutocompound,
    disableAutocompound,
    getTotalRewards,
    getAutocompoundStats
  };
};
