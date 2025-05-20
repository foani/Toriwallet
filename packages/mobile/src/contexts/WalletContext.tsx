import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';
import { WalletService } from '@tori-wallet/core';

// 지갑 상태를 위한 타입 정의
export interface WalletAccount {
  id: string;
  name: string;
  address: string;
  networkId: string;
  isActive: boolean;
  derivationPath?: string;
}

export interface WalletState {
  isInitialized: boolean;
  isUnlocked: boolean;
  hasWallet: boolean;
  accounts: WalletAccount[];
  activeAccount: WalletAccount | null;
  walletError: string | null;
  isCreatingWallet: boolean;
  isImportingWallet: boolean;
}

// 지갑 컨텍스트 값 타입 정의
interface WalletContextValue extends WalletState {
  initializeWallet: () => Promise<void>;
  createWallet: (name: string, password: string) => Promise<{ mnemonic: string, walletId: string }>;
  importWallet: (mnemonic: string, name: string, password: string) => Promise<{ walletId: string }>;
  unlockWallet: (password: string) => Promise<boolean>;
  lockWallet: () => Promise<void>;
  addAccount: (name: string, derivationPath?: string) => Promise<WalletAccount>;
  switchAccount: (accountId: string) => Promise<void>;
  renameAccount: (accountId: string, newName: string) => Promise<void>;
  removeAccount: (accountId: string) => Promise<void>;
  exportPrivateKey: (accountId: string, password: string) => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  signTransaction: (txData: any) => Promise<string>;
}

// 기본 상태
const defaultWalletState: WalletState = {
  isInitialized: false,
  isUnlocked: false,
  hasWallet: false,
  accounts: [],
  activeAccount: null,
  walletError: null,
  isCreatingWallet: false,
  isImportingWallet: false,
};

// 컨텍스트 생성
export const WalletContext = createContext<WalletContextValue>({
  ...defaultWalletState,
  initializeWallet: async () => {},
  createWallet: async () => ({ mnemonic: '', walletId: '' }),
  importWallet: async () => ({ walletId: '' }),
  unlockWallet: async () => false,
  lockWallet: async () => {},
  addAccount: async () => ({ id: '', name: '', address: '', networkId: '', isActive: false }),
  switchAccount: async () => {},
  renameAccount: async () => {},
  removeAccount: async () => {},
  exportPrivateKey: async () => '',
  signMessage: async () => '',
  signTransaction: async () => '',
});

interface WalletProviderProps {
  children: ReactNode;
}

/**
 * 지갑 기능을 관리하는 프로바이더 컴포넌트
 * 
 * 지갑 생성, 가져오기, 계정 관리, 트랜잭션 서명 등
 * 암호화폐 지갑의 핵심 기능들을 제공합니다.
 * 
 * @param children 프로바이더 내부에 렌더링될 컴포넌트
 */
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>(defaultWalletState);
  const [walletService, setWalletService] = useState<WalletService | null>(null);

  // 지갑 서비스 초기화
  useEffect(() => {
    const initService = async () => {
      try {
        // 실제 구현에서는 core 패키지의 WalletService를 사용
        // const service = new WalletService();
        // setWalletService(service);
        
        // 임시 구현: 
        // 지갑 존재 여부 확인
        const hasWalletStored = await AsyncStorage.getItem('@wallet_exists');
        
        setWalletState(prev => ({
          ...prev,
          isInitialized: true,
          hasWallet: hasWalletStored === 'true',
        }));
      } catch (error) {
        console.error('Failed to initialize wallet service:', error);
        setWalletState(prev => ({
          ...prev,
          isInitialized: true,
          walletError: 'Failed to initialize wallet',
        }));
      }
    };

    initService();
  }, []);

  // 지갑 초기화
  const initializeWallet = async () => {
    try {
      // 지갑이 이미 초기화되어 있고 잠금 해제된 상태라면 계정 정보 로드
      if (walletState.hasWallet && walletState.isUnlocked && walletService) {
        // 실제 구현에서는 walletService에서 계정 정보 가져오기
        // const accounts = await walletService.getAccounts();
        // const activeAccount = accounts.find(acc => acc.isActive) || accounts[0];
        
        // 임시 구현:
        const mockAccounts = [
          {
            id: '1',
            name: 'Account 1',
            address: '0x1234567890abcdef1234567890abcdef12345678',
            networkId: 'catena-mainnet',
            isActive: true,
          },
        ];
        
        setWalletState(prev => ({
          ...prev,
          accounts: mockAccounts,
          activeAccount: mockAccounts[0],
        }));
      }
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      setWalletState(prev => ({
        ...prev,
        walletError: 'Failed to initialize wallet',
      }));
    }
  };

  // 새 지갑 생성
  const createWallet = async (name: string, password: string) => {
    try {
      setWalletState(prev => ({ ...prev, isCreatingWallet: true, walletError: null }));

      // 실제 구현에서는 walletService를 사용하여 지갑 생성
      // const result = await walletService.createWallet(name, password);
      
      // 임시 구현: 
      // ethers.js를 사용하여 간단한 지갑 생성 시뮬레이션
      const wallet = ethers.Wallet.createRandom();
      const mnemonic = wallet.mnemonic.phrase;
      const walletId = '1';
      
      // 지갑 생성 성공 표시
      await AsyncStorage.setItem('@wallet_exists', 'true');
      
      const newAccount = {
        id: walletId,
        name,
        address: wallet.address,
        networkId: 'catena-mainnet',
        isActive: true,
      };
      
      setWalletState(prev => ({
        ...prev,
        hasWallet: true,
        isUnlocked: true,
        accounts: [newAccount],
        activeAccount: newAccount,
        isCreatingWallet: false,
      }));
      
      return { mnemonic, walletId };
    } catch (error) {
      console.error('Failed to create wallet:', error);
      setWalletState(prev => ({
        ...prev,
        isCreatingWallet: false,
        walletError: 'Failed to create wallet',
      }));
      throw error;
    }
  };

  // 기존 지갑 가져오기
  const importWallet = async (mnemonic: string, name: string, password: string) => {
    try {
      setWalletState(prev => ({ ...prev, isImportingWallet: true, walletError: null }));

      // 실제 구현에서는 walletService를 사용하여 지갑 가져오기
      // const result = await walletService.importWallet(mnemonic, name, password);
      
      // 임시 구현:
      // mnemonic이 유효한지 확인
      const wallet = ethers.Wallet.fromMnemonic(mnemonic);
      const walletId = '1';
      
      // 지갑 생성 성공 표시
      await AsyncStorage.setItem('@wallet_exists', 'true');
      
      const newAccount = {
        id: walletId,
        name,
        address: wallet.address,
        networkId: 'catena-mainnet',
        isActive: true,
      };
      
      setWalletState(prev => ({
        ...prev,
        hasWallet: true,
        isUnlocked: true,
        accounts: [newAccount],
        activeAccount: newAccount,
        isImportingWallet: false,
      }));
      
      return { walletId };
    } catch (error) {
      console.error('Failed to import wallet:', error);
      setWalletState(prev => ({
        ...prev,
        isImportingWallet: false,
        walletError: 'Failed to import wallet: Invalid mnemonic',
      }));
      throw error;
    }
  };

  // 지갑 잠금 해제
  const unlockWallet = async (password: string) => {
    try {
      // 실제 구현에서는 walletService를 사용하여 지갑 잠금 해제
      // const success = await walletService.unlockWallet(password);
      
      // 임시 구현:
      // 패스워드 검증 시뮬레이션 (실제로는 저장된 해시와 비교해야 함)
      const success = true; // 개발 중이므로 항상 성공으로 처리
      
      if (success) {
        // 계정 정보 로드
        await initializeWallet();
        
        setWalletState(prev => ({
          ...prev,
          isUnlocked: true,
          walletError: null,
        }));
        
        return true;
      } else {
        setWalletState(prev => ({
          ...prev,
          walletError: 'Incorrect password',
        }));
        return false;
      }
    } catch (error) {
      console.error('Failed to unlock wallet:', error);
      setWalletState(prev => ({
        ...prev,
        walletError: 'Failed to unlock wallet',
      }));
      return false;
    }
  };

  // 지갑 잠금
  const lockWallet = async () => {
    try {
      // 실제 구현에서는 walletService를 사용하여 지갑 잠금
      // await walletService.lockWallet();
      
      setWalletState(prev => ({
        ...prev,
        isUnlocked: false,
        accounts: [],
        activeAccount: null,
      }));
    } catch (error) {
      console.error('Failed to lock wallet:', error);
    }
  };

  // 계정 추가
  const addAccount = async (name: string, derivationPath?: string) => {
    try {
      // 실제 구현에서는 walletService를 사용하여 계정 추가
      // const newAccount = await walletService.addAccount(name, derivationPath);
      
      // 임시 구현:
      const wallet = ethers.Wallet.createRandom();
      const newAccount: WalletAccount = {
        id: `${walletState.accounts.length + 1}`,
        name,
        address: wallet.address,
        networkId: 'catena-mainnet',
        isActive: false,
        derivationPath,
      };
      
      setWalletState(prev => ({
        ...prev,
        accounts: [...prev.accounts, newAccount],
      }));
      
      return newAccount;
    } catch (error) {
      console.error('Failed to add account:', error);
      setWalletState(prev => ({
        ...prev,
        walletError: 'Failed to add account',
      }));
      throw error;
    }
  };

  // 계정 전환
  const switchAccount = async (accountId: string) => {
    try {
      const accounts = [...walletState.accounts];
      const accountIndex = accounts.findIndex(acc => acc.id === accountId);
      
      if (accountIndex === -1) {
        throw new Error('Account not found');
      }
      
      // 모든 계정을 inactive로 설정
      accounts.forEach(acc => acc.isActive = false);
      
      // 선택한 계정을 active로 설정
      accounts[accountIndex].isActive = true;
      
      setWalletState(prev => ({
        ...prev,
        accounts,
        activeAccount: accounts[accountIndex],
      }));
      
      // 실제 구현에서는 walletService를 사용하여 계정 전환 상태 저장
      // await walletService.switchAccount(accountId);
    } catch (error) {
      console.error('Failed to switch account:', error);
      setWalletState(prev => ({
        ...prev,
        walletError: 'Failed to switch account',
      }));
    }
  };

  // 계정 이름 변경
  const renameAccount = async (accountId: string, newName: string) => {
    try {
      const accounts = [...walletState.accounts];
      const accountIndex = accounts.findIndex(acc => acc.id === accountId);
      
      if (accountIndex === -1) {
        throw new Error('Account not found');
      }
      
      accounts[accountIndex].name = newName;
      
      setWalletState(prev => ({
        ...prev,
        accounts,
        activeAccount: prev.activeAccount?.id === accountId 
          ? accounts[accountIndex] 
          : prev.activeAccount,
      }));
      
      // 실제 구현에서는 walletService를 사용하여 계정 이름 변경 상태 저장
      // await walletService.renameAccount(accountId, newName);
    } catch (error) {
      console.error('Failed to rename account:', error);
      setWalletState(prev => ({
        ...prev,
        walletError: 'Failed to rename account',
      }));
    }
  };

  // 계정 삭제
  const removeAccount = async (accountId: string) => {
    try {
      // 활성 계정은 삭제할 수 없음
      if (walletState.activeAccount?.id === accountId) {
        throw new Error('Cannot remove active account');
      }
      
      // 마지막 계정은 삭제할 수 없음
      if (walletState.accounts.length <= 1) {
        throw new Error('Cannot remove last account');
      }
      
      const filteredAccounts = walletState.accounts.filter(acc => acc.id !== accountId);
      
      setWalletState(prev => ({
        ...prev,
        accounts: filteredAccounts,
      }));
      
      // 실제 구현에서는 walletService를 사용하여 계정 삭제 상태 저장
      // await walletService.removeAccount(accountId);
    } catch (error) {
      console.error('Failed to remove account:', error);
      setWalletState(prev => ({
        ...prev,
        walletError: 'Failed to remove account',
      }));
      throw error;
    }
  };

  // 개인키 내보내기
  const exportPrivateKey = async (accountId: string, password: string) => {
    try {
      // 실제 구현에서는 walletService를 사용하여 개인키 내보내기
      // const privateKey = await walletService.exportPrivateKey(accountId, password);
      
      // 임시 구현:
      // 개발 중이므로 가짜 개인키 반환 (실제 구현에서는 안전하게 처리해야 함)
      return '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    } catch (error) {
      console.error('Failed to export private key:', error);
      setWalletState(prev => ({
        ...prev,
        walletError: 'Failed to export private key',
      }));
      throw error;
    }
  };

  // 메시지 서명
  const signMessage = async (message: string) => {
    try {
      if (!walletState.activeAccount) {
        throw new Error('No active account');
      }
      
      // 실제 구현에서는 walletService를 사용하여 메시지 서명
      // const signature = await walletService.signMessage(message);
      
      // 임시 구현:
      // 개발 중이므로 가짜 서명 반환
      return '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1c';
    } catch (error) {
      console.error('Failed to sign message:', error);
      setWalletState(prev => ({
        ...prev,
        walletError: 'Failed to sign message',
      }));
      throw error;
    }
  };

  // 트랜잭션 서명
  const signTransaction = async (txData: any) => {
    try {
      if (!walletState.activeAccount) {
        throw new Error('No active account');
      }
      
      // 실제 구현에서는 walletService를 사용하여 트랜잭션 서명
      // const signedTx = await walletService.signTransaction(txData);
      
      // 임시 구현:
      // 개발 중이므로 가짜 서명된 트랜잭션 반환
      return '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      setWalletState(prev => ({
        ...prev,
        walletError: 'Failed to sign transaction',
      }));
      throw error;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        ...walletState,
        initializeWallet,
        createWallet,
        importWallet,
        unlockWallet,
        lockWallet,
        addAccount,
        switchAccount,
        renameAccount,
        removeAccount,
        exportPrivateKey,
        signMessage,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
