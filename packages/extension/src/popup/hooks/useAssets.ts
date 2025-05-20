import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { useNetwork } from './useNetwork';
import { Token, NFTAsset, NFTCollection } from '../../../core/types';

/**
 * Custom hook for accessing asset functionality
 * 
 * Provides methods for interacting with tokens and NFTs,
 * including fetching balances and transfers
 */
export const useAssets = () => {
  const { selectedAccount } = useWallet();
  const { selectedNetwork } = useNetwork();
  
  // Local state
  const [tokens, setTokens] = useState<Token[]>([]);
  const [nfts, setNfts] = useState<NFTAsset[]>([]);
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load tokens for the current network
  const loadTokens = useCallback(async () => {
    if (!selectedNetwork) return;
    
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        tokens: Token[];
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_TOKENS',
            data: { networkId: selectedNetwork.id }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      setTokens(result.tokens || []);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedNetwork]);

  // Load NFTs for the current account and network
  const loadNFTs = useCallback(async () => {
    if (!selectedAccount || !selectedNetwork) return;
    
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        nfts: NFTAsset[];
        collections: NFTCollection[];
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_NFTS',
            data: { 
              address: selectedAccount.address,
              networkId: selectedNetwork.id
            }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      setNfts(result.nfts || []);
      setCollections(result.collections || []);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);

  // Get token by symbol
  const getTokenBySymbol = useCallback((symbol: string): Token | undefined => {
    return tokens.find(token => token.symbol.toLowerCase() === symbol.toLowerCase());
  }, [tokens]);

  // Get token by address
  const getTokenByAddress = useCallback((address: string): Token | undefined => {
    return tokens.find(token => token.address.toLowerCase() === address.toLowerCase());
  }, [tokens]);

  // Add a custom token
  const addToken = useCallback(async (token: Omit<Token, 'id'>): Promise<Token> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<Token>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'ADD_TOKEN',
            data: { token }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.token);
            }
          }
        );
      });
      
      // Update local state
      setTokens(prev => [...prev, result]);
      
      return result;
    } catch (error) {
      console.error('Failed to add token:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hide a token
  const hideToken = useCallback(async (tokenId: string): Promise<boolean> => {
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{ success: boolean }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'HIDE_TOKEN',
            data: { tokenId }
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
        setTokens(prev => prev.map(token => 
          token.id === tokenId 
            ? { ...token, hidden: true } 
            : token
        ));
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to hide token:', error);
      throw error;
    }
  }, []);

  // Show a hidden token
  const showToken = useCallback(async (tokenId: string): Promise<boolean> => {
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{ success: boolean }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'SHOW_TOKEN',
            data: { tokenId }
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
        setTokens(prev => prev.map(token => 
          token.id === tokenId 
            ? { ...token, hidden: false } 
            : token
        ));
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to show token:', error);
      throw error;
    }
  }, []);

  // Get NFT by ID
  const getNFTById = useCallback((nftId: string): NFTAsset | undefined => {
    return nfts.find(nft => nft.id === nftId);
  }, [nfts]);

  // Get collection by ID
  const getCollectionById = useCallback((collectionId: string): NFTCollection | undefined => {
    return collections.find(collection => collection.id === collectionId);
  }, [collections]);

  // Transfer an NFT
  const transferNFT = useCallback(async (
    nftId: string, 
    toAddress: string
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{ success: boolean }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'TRANSFER_NFT',
            data: { 
              nftId,
              fromAddress: selectedAccount.address,
              toAddress
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
      
      // Update local state if successful
      if (result.success) {
        setNfts(prev => prev.filter(nft => nft.id !== nftId));
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to transfer NFT:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount]);

  // Import an NFT collection
  const importNFTCollection = useCallback(async (
    contractAddress: string
  ): Promise<NFTCollection> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        collection: NFTCollection;
        nfts: NFTAsset[];
      }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'IMPORT_NFT_COLLECTION',
            data: { 
              contractAddress,
              networkId: selectedNetwork.id,
              ownerAddress: selectedAccount.address
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
      
      // Update local state
      setCollections(prev => [...prev, result.collection]);
      setNfts(prev => [...prev, ...result.nfts]);
      
      return result.collection;
    } catch (error) {
      console.error('Failed to import NFT collection:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount, selectedNetwork]);

  // Initialize the hook
  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  return {
    tokens,
    nfts,
    collections,
    isLoading,
    loadTokens,
    loadNFTs,
    getTokenBySymbol,
    getTokenByAddress,
    addToken,
    hideToken,
    showToken,
    getNFTById,
    getCollectionById,
    transferNFT,
    importNFTCollection
  };
};
