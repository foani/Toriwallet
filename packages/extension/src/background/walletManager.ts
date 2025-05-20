/**
 * 지갑 매니저
 * 
 * 지갑 관련 기능을 관리합니다:
 * - 지갑 생성 및 가져오기
 * - 계정 관리
 * - 잔액 조회
 * - 지갑 잠금/잠금 해제
 */

import { MessageType } from './messageListener';

// 지갑 상태 인터페이스
interface WalletState {
  initialized: boolean;
  locked: boolean;
  accounts: string[];
  selectedAccount: string | null;
  vault: string | null; // 암호화된 시드 구문
}

// 초기 지갑 상태
let walletState: WalletState = {
  initialized: false,
  locked: true,
  accounts: [],
  selectedAccount: null,
  vault: null
};

/**
 * 지갑 매니저 초기화
 */
export const initWalletManager = async (): Promise<void> => {
  try {
    console.log('지갑 매니저 초기화 중...');
    
    // 저장된 지갑 상태 로드
    const storedState = await loadState();
    if (storedState) {
      walletState = { ...walletState, ...storedState };
    }
    
    walletState.initialized = true;
    console.log('지갑 매니저 초기화 완료');
  } catch (error) {
    console.error('지갑 매니저 초기화 실패:', error);
    throw error;
  }
};

/**
 * 지갑 관련 메시지 처리
 */
export const handleWalletMessages = async (message: any) => {
  switch (message.type) {
    case MessageType.WALLET_CREATE:
      return await createWallet(message.data?.password);
      
    case MessageType.WALLET_IMPORT:
      return await importWallet(message.data?.mnemonic, message.data?.password);
      
    case MessageType.WALLET_GET_ACCOUNTS:
      return await getAccounts();
      
    case MessageType.WALLET_SELECT_ACCOUNT:
      return await selectAccount(message.data?.address);
      
    case MessageType.WALLET_LOCK:
      return await lockWallet();
      
    case MessageType.WALLET_UNLOCK:
      return await unlockWallet(message.data?.password);
      
    case MessageType.WALLET_GET_BALANCE:
      return await getBalance(message.data?.address, message.data?.tokenAddress);
      
    default:
      throw new Error(`지원되지 않는 지갑 메시지 타입: ${message.type}`);
  }
};

/**
 * 새 지갑 생성
 */
const createWallet = async (password: string): Promise<any> => {
  if (!password) {
    throw new Error('비밀번호가 필요합니다');
  }
  
  try {
    // TODO: 코어 라이브러리에서 지갑 생성 로직 가져오기
    // const { mnemonic, accounts } = await walletService.createWallet(password);
    
    // 임시 구현: 실제 구현 시 제거
    const mnemonic = 'test test test test test test test test test test test test';
    const accounts = ['0x1234567890123456789012345678901234567890'];
    
    // 지갑 상태 업데이트
    walletState = {
      ...walletState,
      initialized: true,
      locked: false,
      accounts,
      selectedAccount: accounts[0],
      vault: `encrypted:${mnemonic}` // 실제로는 적절히 암호화되어야 함
    };
    
    // 상태 저장
    await saveState();
    
    return {
      mnemonic,
      accounts,
      selectedAccount: accounts[0]
    };
  } catch (error) {
    console.error('지갑 생성 실패:', error);
    throw error;
  }
};

/**
 * 기존 지갑 가져오기
 */
const importWallet = async (mnemonic: string, password: string): Promise<any> => {
  if (!mnemonic || !password) {
    throw new Error('니모닉 구문과 비밀번호가 필요합니다');
  }
  
  try {
    // TODO: 코어 라이브러리에서 지갑 가져오기 로직 가져오기
    // const { accounts } = await walletService.importWallet(mnemonic, password);
    
    // 임시 구현: 실제 구현 시 제거
    const accounts = ['0x1234567890123456789012345678901234567890'];
    
    // 지갑 상태 업데이트
    walletState = {
      ...walletState,
      initialized: true,
      locked: false,
      accounts,
      selectedAccount: accounts[0],
      vault: `encrypted:${mnemonic}` // 실제로는 적절히 암호화되어야 함
    };
    
    // 상태 저장
    await saveState();
    
    return {
      accounts,
      selectedAccount: accounts[0]
    };
  } catch (error) {
    console.error('지갑 가져오기 실패:', error);
    throw error;
  }
};

/**
 * 계정 목록 가져오기
 */
const getAccounts = async (): Promise<string[]> => {
  if (walletState.locked) {
    throw new Error('지갑이 잠겨 있습니다');
  }
  
  return walletState.accounts;
};

/**
 * 계정 선택
 */
const selectAccount = async (address: string): Promise<string> => {
  if (walletState.locked) {
    throw new Error('지갑이 잠겨 있습니다');
  }
  
  if (!address || !walletState.accounts.includes(address)) {
    throw new Error('유효하지 않은 계정 주소');
  }
  
  walletState.selectedAccount = address;
  
  // 상태 저장
  await saveState();
  
  return address;
};

/**
 * 지갑 잠금
 */
const lockWallet = async (): Promise<boolean> => {
  walletState.locked = true;
  
  // 상태 저장
  await saveState();
  
  return true;
};

/**
 * 지갑 잠금 해제
 */
const unlockWallet = async (password: string): Promise<boolean> => {
  if (!password) {
    throw new Error('비밀번호가 필요합니다');
  }
  
  try {
    // TODO: 코어 라이브러리에서 지갑 잠금 해제 로직 가져오기
    // const success = await walletService.unlockWallet(password);
    
    // 임시 구현: 실제 구현 시 제거
    const success = true;
    
    if (success) {
      walletState.locked = false;
      
      // 상태 저장
      await saveState();
      
      return true;
    } else {
      throw new Error('잘못된 비밀번호');
    }
  } catch (error) {
    console.error('지갑 잠금 해제 실패:', error);
    throw error;
  }
};

/**
 * 계정 잔액 조회
 */
const getBalance = async (address: string, tokenAddress?: string): Promise<string> => {
  if (walletState.locked) {
    throw new Error('지갑이 잠겨 있습니다');
  }
  
  const accountAddress = address || walletState.selectedAccount;
  if (!accountAddress) {
    throw new Error('계정 주소가 선택되지 않았습니다');
  }
  
  try {
    // TODO: 코어 라이브러리에서 잔액 조회 로직 가져오기
    // const balance = await walletService.getBalance(accountAddress, tokenAddress);
    
    // 임시 구현: 실제 구현 시 제거
    const balance = '1000000000000000000'; // 1 ETH (wei 단위)
    
    return balance;
  } catch (error) {
    console.error('잔액 조회 실패:', error);
    throw error;
  }
};

/**
 * 지갑 상태 저장
 */
const saveState = async (): Promise<void> => {
  try {
    const state = {
      initialized: walletState.initialized,
      locked: walletState.locked,
      accounts: walletState.accounts,
      selectedAccount: walletState.selectedAccount,
      vault: walletState.vault
    };
    
    await chrome.storage.local.set({ walletState: state });
  } catch (error) {
    console.error('지갑 상태 저장 실패:', error);
    throw error;
  }
};

/**
 * 저장된 지갑 상태 로드
 */
const loadState = async (): Promise<WalletState | null> => {
  try {
    const result = await chrome.storage.local.get('walletState');
    return result.walletState || null;
  } catch (error) {
    console.error('지갑 상태 로드 실패:', error);
    return null;
  }
};
