import { useState, useEffect, useCallback } from 'react';
import { Network } from '../../../core/types';

/**
 * Custom hook for accessing network functionality
 * 
 * Provides methods for interacting with blockchain networks,
 * including switching networks and getting network information
 */
export const useNetwork = () => {
  // Local state
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load networks from background script
  const loadNetworks = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        networks: Network[];
        selectedNetwork: Network | null;
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_NETWORKS'
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      setNetworks(result.networks || []);
      setSelectedNetwork(result.selectedNetwork || null);
    } catch (error) {
      console.error('Failed to load networks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select a network
  const selectNetwork = useCallback(async (networkId: string): Promise<void> => {
    try {
      // Use postMessage to communicate with background script
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'SELECT_NETWORK',
            data: { networkId }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve();
            }
          }
        );
      });
      
      // Update local state
      const network = networks.find(net => net.id === networkId);
      if (network) {
        setSelectedNetwork(network);
      }
    } catch (error) {
      console.error('Failed to select network:', error);
      throw error;
    }
  }, [networks]);

  // Add a custom network
  const addNetwork = useCallback(async (network: Omit<Network, 'id'>): Promise<Network> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<Network>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'ADD_NETWORK',
            data: { network }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.network);
            }
          }
        );
      });
      
      // Update local state
      setNetworks(prev => [...prev, result]);
      
      return result;
    } catch (error) {
      console.error('Failed to add network:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remove a custom network
  const removeNetwork = useCallback(async (networkId: string): Promise<boolean> => {
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{ success: boolean }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'REMOVE_NETWORK',
            data: { networkId }
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
      
      // Update local state if successful
      if (result.success) {
        setNetworks(prev => prev.filter(net => net.id !== networkId));
        
        // If removed network was selected, select the default network
        if (selectedNetwork && selectedNetwork.id === networkId) {
          const defaultNetwork = networks.find(net => net.isDefault);
          if (defaultNetwork) {
            setSelectedNetwork(defaultNetwork);
          } else if (networks.length > 0) {
            setSelectedNetwork(networks[0]);
          } else {
            setSelectedNetwork(null);
          }
        }
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to remove network:', error);
      throw error;
    }
  }, [networks, selectedNetwork]);

  // Edit a custom network
  const editNetwork = useCallback(async (networkId: string, updates: Partial<Network>): Promise<Network> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<Network>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'EDIT_NETWORK',
            data: { networkId, updates }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.network);
            }
          }
        );
      });
      
      // Update local state
      setNetworks(prev => prev.map(net => net.id === networkId ? result : net));
      
      // Update selected network if it was edited
      if (selectedNetwork && selectedNetwork.id === networkId) {
        setSelectedNetwork(result);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to edit network:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [networks, selectedNetwork]);

  // Get a network by ID
  const getNetworkById = useCallback((networkId: string): Network | undefined => {
    return networks.find(net => net.id === networkId);
  }, [networks]);

  // Check if a network is mainnet
  const isMainnet = useCallback((networkId?: string): boolean => {
    const networkToCheck = networkId 
      ? networks.find(net => net.id === networkId) 
      : selectedNetwork;
      
    return networkToCheck ? !networkToCheck.isTestnet : false;
  }, [networks, selectedNetwork]);

  // Get chain ID for selected network
  const getChainId = useCallback((): string => {
    return selectedNetwork ? selectedNetwork.chainId : '';
  }, [selectedNetwork]);

  // Get chain name for selected network
  const getChainName = useCallback((): string => {
    return selectedNetwork ? selectedNetwork.name : '';
  }, [selectedNetwork]);

  // Initialize the hook
  useEffect(() => {
    loadNetworks();
  }, [loadNetworks]);

  return {
    networks,
    selectedNetwork,
    isLoading,
    loadNetworks,
    selectNetwork,
    addNetwork,
    removeNetwork,
    editNetwork,
    getNetworkById,
    isMainnet,
    getChainId,
    getChainName
  };
};
