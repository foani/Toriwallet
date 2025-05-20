import { useState, useEffect, useCallback } from 'react';
import { WalletAccount, WalletBalance, Transaction, TransactionStatus } from '../../../core/types';

/**
 * Custom hook for accessing wallet functionality
 * 
 * Provides methods for interacting with the wallet, including account management,
 * balance checking, and transaction handling
 */
export const useWallet = () => {
  // Local state
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null);
  const [balances, setBalances] = useState<Record<string, WalletBalance[]>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unlocked, setUnlocked] = useState<boolean>(false);

  // Load accounts from background script
  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        accounts: WalletAccount[];
        selectedAccount: WalletAccount | null;
        unlocked: boolean;
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_ACCOUNTS'
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      setAccounts(result.accounts || []);
      setSelectedAccount(result.selectedAccount || null);
      setUnlocked(result.unlocked || false);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load balances for a specific account
  const loadBalances = useCallback(async (address?: string) => {
    if (!selectedAccount && !address) return;
    
    const accountAddress = address || selectedAccount.address;
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        balances: WalletBalance[];
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_BALANCES',
            data: { address: accountAddress }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      setBalances(prev => ({
        ...prev,
        [accountAddress]: result.balances || []
      }));
    } catch (error) {
      console.error('Failed to load balances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount]);

  // Load transactions for a specific account
  const loadTransactions = useCallback(async (address?: string) => {
    if (!selectedAccount && !address) return;
    
    const accountAddress = address || selectedAccount.address;
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{
        transactions: Transaction[];
      }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_TRANSACTIONS',
            data: { address: accountAddress }
          },
          (response) => {
            resolve(response);
          }
        );
      });
      
      setTransactions(result.transactions || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount]);

  // Create a new account
  const createAccount = useCallback(async (name: string): Promise<WalletAccount> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<WalletAccount>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'CREATE_ACCOUNT',
            data: { name }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.account);
            }
          }
        );
      });
      
      // Update local state
      setAccounts(prev => [...prev, result]);
      
      return result;
    } catch (error) {
      console.error('Failed to create account:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Import an account using private key
  const importAccount = useCallback(async (privateKey: string, name: string): Promise<WalletAccount> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<WalletAccount>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'IMPORT_ACCOUNT',
            data: { privateKey, name }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.account);
            }
          }
        );
      });
      
      // Update local state
      setAccounts(prev => [...prev, result]);
      
      return result;
    } catch (error) {
      console.error('Failed to import account:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Import an account using mnemonic phrase
  const importAccountFromMnemonic = useCallback(async (mnemonic: string, name: string, path?: string): Promise<WalletAccount> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<WalletAccount>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'IMPORT_ACCOUNT_FROM_MNEMONIC',
            data: { mnemonic, name, path }
          },
          (response) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.account);
            }
          }
        );
      });
      
      // Update local state
      setAccounts(prev => [...prev, result]);
      
      return result;
    } catch (error) {
      console.error('Failed to import account from mnemonic:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select an account
  const selectAccount = useCallback(async (address: string): Promise<void> => {
    try {
      // Use postMessage to communicate with background script
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'SELECT_ACCOUNT',
            data: { address }
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
      const account = accounts.find(acc => acc.address === address);
      if (account) {
        setSelectedAccount(account);
      }
    } catch (error) {
      console.error('Failed to select account:', error);
      throw error;
    }
  }, [accounts]);

  // Unlock wallet
  const unlockWallet = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{ success: boolean }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'UNLOCK_WALLET',
            data: { password }
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
      
      setUnlocked(result.success);
      
      // If wallet was unlocked successfully, load accounts
      if (result.success) {
        await loadAccounts();
      }
      
      return result.success;
    } catch (error) {
      console.error('Failed to unlock wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadAccounts]);

  // Lock wallet
  const lockWallet = useCallback(async (): Promise<boolean> => {
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{ success: boolean }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'LOCK_WALLET'
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
      
      setUnlocked(false);
      return result.success;
    } catch (error) {
      console.error('Failed to lock wallet:', error);
      throw error;
    }
  }, []);

  // Send transaction
  const sendTransaction = useCallback(async (tx: Partial<Transaction>): Promise<Transaction> => {
    setIsLoading(true);
    
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<Transaction>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'SEND_TRANSACTION',
            data: { transaction: tx }
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
      setTransactions(prev => [result, ...prev]);
      
      return result;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get transaction status
  const getTransactionStatus = useCallback(async (hash: string): Promise<TransactionStatus> => {
    try {
      // Use postMessage to communicate with background script
      const result = await new Promise<{ status: TransactionStatus }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'GET_TRANSACTION_STATUS',
            data: { hash }
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
      
      return result.status;
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      throw error;
    }
  }, []);

  // Initialize the hook
  useEffect(() => {
    // Check if wallet is initialized
    const checkWalletStatus = async () => {
      try {
        const result = await new Promise<{ initialized: boolean; unlocked: boolean }>((resolve) => {
          chrome.runtime.sendMessage(
            {
              type: 'CHECK_WALLET_STATUS'
            },
            (response) => {
              resolve(response);
            }
          );
        });
        
        // If wallet is initialized and unlocked, load accounts
        if (result.initialized && result.unlocked) {
          setUnlocked(true);
          await loadAccounts();
        }
      } catch (error) {
        console.error('Failed to check wallet status:', error);
      }
    };
    
    checkWalletStatus();
  }, [loadAccounts]);

  // Load balances and transactions when selected account changes
  useEffect(() => {
    if (selectedAccount) {
      loadBalances();
      loadTransactions();
    }
  }, [selectedAccount, loadBalances, loadTransactions]);

  return {
    accounts,
    selectedAccount,
    balances,
    transactions,
    isLoading,
    unlocked,
    loadAccounts,
    loadBalances,
    loadTransactions,
    createAccount,
    importAccount,
    importAccountFromMnemonic,
    selectAccount,
    unlockWallet,
    lockWallet,
    sendTransaction,
    getTransactionStatus
  };
};
