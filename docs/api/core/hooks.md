# React Hooks (리액트 훅)

Core 패키지에서 제공하는 React 훅들을 설명합니다.

## useWallet.ts

지갑 관련 React 훅을 제공합니다.

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Wallet, Account } from '../types/wallet';
import { WalletService } from '../services/wallet/wallet-service';
import { ToriError, ErrorCode } from '../constants/errors';

export function useWallet() {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [error, setError] = useState<ToriError | null>(null);
  
  // Initialize wallet service and load data
  const initialize = useCallback(async () => {
    try {
      await WalletService.initialize();
      setIsInitialized(true);
      
      // Check if wallet is unlocked
      const unlocked = WalletService.isUnlocked();
      setIsUnlocked(unlocked);
      
      if (unlocked) {
        // Load wallets and accounts
        const loadedWallets = await WalletService.getWallets();
        setWallets(loadedWallets);
        
        const loadedAccounts = await WalletService.getAccounts();
        setAccounts(loadedAccounts);
        
        // Set selected wallet and account
        const wallet = await WalletService.getSelectedWallet();
        setSelectedWallet(wallet);
        
        const account = await WalletService.getSelectedAccount();
        setSelectedAccount(account);
      }
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to initialize wallet', error));
      }
    }
  }, []);
  
  // Unlock wallet
  const unlock = useCallback(async (password: string) => {
    try {
      await WalletService.unlock(password);
      setIsUnlocked(true);
      
      // Load wallets and accounts
      const loadedWallets = await WalletService.getWallets();
      setWallets(loadedWallets);
      
      const loadedAccounts = await WalletService.getAccounts();
      setAccounts(loadedAccounts);
      
      // Set selected wallet and account
      const wallet = await WalletService.getSelectedWallet();
      setSelectedWallet(wallet);
      
      const account = await WalletService.getSelectedAccount();
      setSelectedAccount(account);
      
      return true;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to unlock wallet', error));
      }
      return false;
    }
  }, []);
  
  // Lock wallet
  const lock = useCallback(async () => {
    try {
      await WalletService.lock();
      setIsUnlocked(false);
      setWallets([]);
      setAccounts([]);
      setSelectedWallet(null);
      setSelectedAccount(null);
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to lock wallet', error));
      }
    }
  }, []);
  
  // Create a new wallet
  const createWallet = useCallback(async (name: string, password: string) => {
    try {
      const { wallet, mnemonic } = await WalletService.createWallet(name, password);
      
      // Update state
      setWallets(prev => [...prev, wallet]);
      
      // If this is the first wallet, select it
      if (wallets.length === 0) {
        setSelectedWallet(wallet);
      }
      
      return { wallet, mnemonic };
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to create wallet', error));
      }
      throw error;
    }
  }, [wallets]);
  
  // Import a wallet from mnemonic
  const importWalletFromMnemonic = useCallback(async (name: string, mnemonic: string, password: string) => {
    try {
      const { wallet } = await WalletService.importWalletFromMnemonic(name, mnemonic, password);
      
      // Update state
      setWallets(prev => [...prev, wallet]);
      
      // If this is the first wallet, select it
      if (wallets.length === 0) {
        setSelectedWallet(wallet);
      }
      
      return { wallet };
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to import wallet', error));
      }
      throw error;
    }
  }, [wallets]);
  
  // Import a wallet from private key
  const importWalletFromPrivateKey = useCallback(async (name: string, privateKey: string, password: string) => {
    try {
      const { wallet } = await WalletService.importWalletFromPrivateKey(name, privateKey, password);
      
      // Update state
      setWallets(prev => [...prev, wallet]);
      
      // If this is the first wallet, select it
      if (wallets.length === 0) {
        setSelectedWallet(wallet);
      }
      
      return { wallet };
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to import wallet', error));
      }
      throw error;
    }
  }, [wallets]);
  
  // Create a new account
  const createAccount = useCallback(async (name: string, networkIds: string[] = []) => {
    if (!selectedWallet) {
      setError(new ToriError(ErrorCode.WALLET_NOT_FOUND, 'No wallet selected'));
      throw new ToriError(ErrorCode.WALLET_NOT_FOUND, 'No wallet selected');
    }
    
    try {
      const account = await WalletService.createAccount(selectedWallet.id, name, networkIds);
      
      // Update state
      setAccounts(prev => [...prev, account]);
      
      // If this is the first account, select it
      if (accounts.length === 0) {
        setSelectedAccount(account);
      }
      
      return account;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to create account', error));
      }
      throw error;
    }
  }, [selectedWallet, accounts]);
  
  // Import an account from private key
  const importAccountFromPrivateKey = useCallback(async (name: string, privateKey: string, networkIds: string[] = []) => {
    if (!selectedWallet) {
      setError(new ToriError(ErrorCode.WALLET_NOT_FOUND, 'No wallet selected'));
      throw new ToriError(ErrorCode.WALLET_NOT_FOUND, 'No wallet selected');
    }
    
    try {
      const account = await WalletService.importAccountFromPrivateKey(selectedWallet.id, name, privateKey, networkIds);
      
      // Update state
      setAccounts(prev => [...prev, account]);
      
      // If this is the first account, select it
      if (accounts.length === 0) {
        setSelectedAccount(account);
      }
      
      return account;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to import account', error));
      }
      throw error;
    }
  }, [selectedWallet, accounts]);
  
  // Select a wallet
  const selectWallet = useCallback(async (walletId: string) => {
    try {
      const wallet = await WalletService.selectWallet(walletId);
      setSelectedWallet(wallet);
      
      // Load accounts for the selected wallet
      const walletAccounts = await WalletService.getAccounts(walletId);
      setAccounts(walletAccounts);
      
      // Select the default account or the first account
      const defaultAccount = walletAccounts.find(account => account.isDefault);
      setSelectedAccount(defaultAccount || walletAccounts[0] || null);
      
      return wallet;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to select wallet', error));
      }
      throw error;
    }
  }, []);
  
  // Select an account
  const selectAccount = useCallback(async (accountId: string) => {
    try {
      const account = await WalletService.selectAccount(accountId);
      setSelectedAccount(account);
      return account;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to select account', error));
      }
      throw error;
    }
  }, []);
  
  // Check if there are any wallets
  const hasWallets = useCallback(() => {
    return wallets.length > 0;
  }, [wallets]);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  return {
    isInitialized,
    isUnlocked,
    wallets,
    accounts,
    selectedWallet,
    selectedAccount,
    error,
    initialize,
    unlock,
    lock,
    createWallet,
    importWalletFromMnemonic,
    importWalletFromPrivateKey,
    createAccount,
    importAccountFromPrivateKey,
    selectWallet,
    selectAccount,
    hasWallets,
    clearError,
  };
}
```

## useNetwork.ts

네트워크 관련 React 훅을 제공합니다.

```typescript
import { useState, useEffect, useCallback } from 'react';
import { NetworkType, NetworkStatus } from '../types/network';
import { NetworkService } from '../services/network/network-service';
import { ToriError, ErrorCode } from '../constants/errors';

export function useNetwork() {
  const [networks, setNetworks] = useState<NetworkType[]>([]);
  const [customNetworks, setCustomNetworks] = useState<NetworkType[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType | null>(null);
  const [networkStatuses, setNetworkStatuses] = useState<Record<string, NetworkStatus>>({});
  const [error, setError] = useState<ToriError | null>(null);
  
  // Initialize network service and load data
  const initialize = useCallback(async () => {
    try {
      await NetworkService.initialize();
      
      // Load networks
      const defaultNetworks = await NetworkService.getDefaultNetworks();
      const userNetworks = await NetworkService.getCustomNetworks();
      
      setNetworks(defaultNetworks);
      setCustomNetworks(userNetworks);
      
      // Get selected network
      const selected = await NetworkService.getSelectedNetwork();
      setSelectedNetwork(selected);
      
      // Get network statuses
      const statuses = await NetworkService.getNetworkStatuses();
      setNetworkStatuses(statuses);
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to initialize networks', error));
      }
    }
  }, []);
  
  // Select a network
  const selectNetwork = useCallback(async (networkId: string) => {
    try {
      const network = await NetworkService.selectNetwork(networkId);
      setSelectedNetwork(network);
      return network;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to select network', error));
      }
      throw error;
    }
  }, []);
  
  // Add a custom network
  const addCustomNetwork = useCallback(async (network: NetworkType) => {
    try {
      const addedNetwork = await NetworkService.addCustomNetwork(network);
      setCustomNetworks(prev => [...prev, addedNetwork]);
      return addedNetwork;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to add custom network', error));
      }
      throw error;
    }
  }, []);
  
  // Remove a custom network
  const removeCustomNetwork = useCallback(async (networkId: string) => {
    try {
      await NetworkService.removeCustomNetwork(networkId);
      setCustomNetworks(prev => prev.filter(network => network.id !== networkId));
      
      // If the selected network is removed, select a default network
      if (selectedNetwork && selectedNetwork.id === networkId) {
        const defaultNetwork = await NetworkService.getDefaultNetwork();
        setSelectedNetwork(defaultNetwork);
      }
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to remove custom network', error));
      }
      throw error;
    }
  }, [selectedNetwork]);
  
  // Update network statuses
  const updateNetworkStatuses = useCallback(async () => {
    try {
      const statuses = await NetworkService.getNetworkStatuses();
      setNetworkStatuses(statuses);
      return statuses;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to update network statuses', error));
      }
      throw error;
    }
  }, []);
  
  // Get all networks (default + custom)
  const getAllNetworks = useCallback(() => {
    return [...networks, ...customNetworks];
  }, [networks, customNetworks]);
  
  // Get a network by id
  const getNetworkById = useCallback((networkId: string) => {
    return getAllNetworks().find(network => network.id === networkId);
  }, [getAllNetworks]);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Initialize on mount
  useEffect(() => {
    initialize();
    
    // Start a timer to update network statuses
    const intervalId = setInterval(updateNetworkStatuses, 30000); // every 30 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [initialize, updateNetworkStatuses]);
  
  return {
    networks,
    customNetworks,
    selectedNetwork,
    networkStatuses,
    error,
    initialize,
    selectNetwork,
    addCustomNetwork,
    removeCustomNetwork,
    updateNetworkStatuses,
    getAllNetworks,
    getNetworkById,
    clearError,
  };
}
```

## useAssets.ts

자산 관련 React 훅을 제공합니다.

```typescript
import { useState, useEffect, useCallback } from 'react';
import { TokenType, TokenBalance, NFTType, NFTCollection } from '../types/assets';
import { AssetService } from '../services/asset/asset-service';
import { ToriError, ErrorCode } from '../constants/errors';

export function useAssets(accountAddress: string, networkId: string) {
  const [tokens, setTokens] = useState<TokenType[]>([]);
  const [customTokens, setCustomTokens] = useState<TokenType[]>([]);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [nftCollections, setNftCollections] = useState<NFTCollection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ToriError | null>(null);
  
  // Initialize asset service and load data
  const initialize = useCallback(async () => {
    if (!accountAddress || !networkId) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load tokens for the network
      const defaultTokens = await AssetService.getDefaultTokens(networkId);
      const userTokens = await AssetService.getCustomTokens(networkId);
      
      setTokens(defaultTokens);
      setCustomTokens(userTokens);
      
      // Load token balances
      const balances = await AssetService.getTokenBalances(accountAddress, networkId);
      setTokenBalances(balances);
      
      // Load NFT collections
      const collections = await AssetService.getNFTCollections(accountAddress, networkId);
      setNftCollections(collections);
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to initialize assets', error));
      }
    } finally {
      setIsLoading(false);
    }
  }, [accountAddress, networkId]);
  
  // Add a custom token
  const addCustomToken = useCallback(async (token: TokenType) => {
    try {
      const addedToken = await AssetService.addCustomToken(token, networkId);
      setCustomTokens(prev => [...prev, addedToken]);
      
      // Update token balances
      if (accountAddress) {
        const balance = await AssetService.getTokenBalance(accountAddress, addedToken.address, networkId);
        setTokenBalances(prev => [...prev, balance]);
      }
      
      return addedToken;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to add custom token', error));
      }
      throw error;
    }
  }, [accountAddress, networkId]);
  
  // Remove a custom token
  const removeCustomToken = useCallback(async (tokenAddress: string) => {
    try {
      await AssetService.removeCustomToken(tokenAddress, networkId);
      setCustomTokens(prev => prev.filter(token => token.address !== tokenAddress));
      setTokenBalances(prev => prev.filter(balance => balance.token.address !== tokenAddress));
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to remove custom token', error));
      }
      throw error;
    }
  }, [networkId]);
  
  // Refresh token balances
  const refreshTokenBalances = useCallback(async () => {
    if (!accountAddress || !networkId) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const balances = await AssetService.getTokenBalances(accountAddress, networkId);
      setTokenBalances(balances);
      return balances;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to refresh token balances', error));
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [accountAddress, networkId]);
  
  // Refresh NFT collections
  const refreshNFTCollections = useCallback(async () => {
    if (!accountAddress || !networkId) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const collections = await AssetService.getNFTCollections(accountAddress, networkId);
      setNftCollections(collections);
      return collections;
    } catch (error) {
      if (error instanceof ToriError) {
        setError(error);
      } else {
        setError(new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to refresh NFT collections', error));
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [accountAddress, networkId]);
  
  // Get all tokens (default + custom)
  const getAllTokens = useCallback(() => {
    return [...tokens, ...customTokens];
  }, [tokens, customTokens]);
  
  // Get token by address
  const getTokenByAddress = useCallback((address: string) => {
    return getAllTokens().find(token => token.address.toLowerCase() === address.toLowerCase());
  }, [getAllTokens]);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Initialize on mount or when account/network changes
  useEffect(() => {
    initialize();
    
    // Start a timer to refresh token balances
    const balanceIntervalId = setInterval(refreshTokenBalances, 30000); // every 30 seconds
    
    // Start a timer to refresh NFT collections
    const nftIntervalId = setInterval(refreshNFTCollections, 60000); // every minute
    
    return () => {
      clearInterval(balanceIntervalId);
      clearInterval(nftIntervalId);
    };
  }, [initialize, refreshTokenBalances, refreshNFTCollections]);
  
  return {
    tokens,
    customTokens,
    tokenBalances,
    nftCollections,
    isLoading,
    error,
    initialize,
    addCustomToken,
    removeCustomToken,
    refreshTokenBalances,
    refreshNFTCollections,
    getAllTokens,
    getTokenByAddress,
    clearError,
  };
}
```
