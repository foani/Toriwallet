/**
 * wallet-service.ts
 * 
 * 이 모듈은 TORI 지갑의 지갑 서비스를 제공합니다.
 * 지갑 생성, 복구, 계정 관리, 정보 조회 등의 기능을 담당합니다.
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { ethers } from 'ethers';

import { NetworkType } from '../../constants/networks';
import { ErrorCode, ToriWalletError } from '../../constants/errors';
import { AccountType, BaseAccount, CreateAccountParams, CreateWalletParams, ImportWalletParams, WalletType } from '../../types/wallet';
import { keyringInstance } from '../crypto/keyring';
import mnemonicService from '../crypto/mnemonic';
import hdkeyService from '../crypto/hdkey';
import signatureService from '../crypto/signature';
import encryptionService from '../crypto/encryption';
import { StorageService } from '../storage/storage-service';

// 지갑 서비스 이벤트 타입
export enum WalletServiceEvent {
  WALLET_CREATED = 'walletCreated',
  WALLET_IMPORTED = 'walletImported',
  WALLET_UPDATED = 'walletUpdated',
  WALLET_DELETED = 'walletDeleted',
  ACCOUNT_CREATED = 'accountCreated',
  ACCOUNT_UPDATED = 'accountUpdated',
  ACCOUNT_DELETED = 'accountDeleted',
  WALLET_LOCKED = 'walletLocked',
  WALLET_UNLOCKED = 'walletUnlocked',
  NETWORKS_CHANGED = 'networksChanged',
  ERROR = 'error',
}

// 지갑 서비스 설정 인터페이스
export interface WalletServiceOptions {
  storage?: StorageService;
}

/**
 * TORI 지갑 서비스 클래스
 * 
 * 지갑 생성, 복구, 계정 관리, 정보 조회 등의 기능을 제공합니다.
 */
export class WalletService extends EventEmitter {
  private isInitialized: boolean = false;
  private storage: StorageService | null = null;
  
  /**
   * 지갑 서비스 생성자
   * 
   * @param options 지갑 서비스 설정
   */
  constructor(options?: WalletServiceOptions) {
    super();
    if (options?.storage) {
      this.storage = options.storage;
    }
  }
  
  /**
   * 지갑 서비스 초기화
   * 
   * @param storage 스토리지 서비스 (선택적)
   * @returns 초기화 성공 여부
   */
  public async initialize(storage?: StorageService): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }
      
      // 스토리지 설정
      if (storage) {
        this.storage = storage;
      }
      
      if (!this.storage) {
        throw new ToriWalletError(ErrorCode.STORAGE_NOT_AVAILABLE, 'Storage service is not available');
      }
      
      // 키링 초기화
      const encryptedVault = await this.storage.getItem('encryptedVault');
      if (encryptedVault) {
        keyringInstance.initialize(JSON.parse(encryptedVault));
      } else {
        keyringInstance.initialize();
      }
      
      // 이벤트 리스너 등록
      this.registerEvents();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize wallet service', error);
      throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, 'Failed to initialize wallet service', error);
    }
  }
  
  /**
   * 키링 이벤트 리스너 등록
   */
  private registerEvents(): void {
    // 볼트 업데이트 이벤트
    keyringInstance.on('vaultUpdated', async ({ encryptedVault }) => {
      if (this.storage) {
        await this.storage.setItem('encryptedVault', JSON.stringify(encryptedVault));
      }
    });
    
    // 지갑 생성 이벤트
    keyringInstance.on('walletCreated', ({ walletId }) => {
      this.emit(WalletServiceEvent.WALLET_CREATED, { walletId });
    });
    
    // 지갑 잠금 이벤트
    keyringInstance.on('lock', () => {
      this.emit(WalletServiceEvent.WALLET_LOCKED);
    });
    
    // 지갑 잠금 해제 이벤트
    keyringInstance.on('unlock', () => {
      this.emit(WalletServiceEvent.WALLET_UNLOCKED);
    });
    
    // 계정 추가 이벤트
    keyringInstance.on('accountAdded', ({ walletId, accountId }) => {
      this.emit(WalletServiceEvent.ACCOUNT_CREATED, { walletId, accountId });
    });
    
    // 계정 삭제 이벤트
    keyringInstance.on('accountDeleted', ({ accountId }) => {
      this.emit(WalletServiceEvent.ACCOUNT_DELETED, { accountId });
    });
  }
  
  /**
   * 새 지갑 생성
   * 
   * @param params 지갑 생성 매개변수
   * @returns 생성된 지갑 ID
   */
  public async createWallet(params: CreateWalletParams): Promise<string> {
    try {
      if (!this.isInitialized) {
        throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, 'Wallet service is not initialized');
      }
      
      let walletId: string;
      
      // 지갑 유형에 따른 생성 로직
      switch (params.type) {
        case WalletType.HD_WALLET:
          // HD 지갑 생성
          walletId = keyringInstance.createHDWallet(params.password, params.mnemonic);
          
          // 계정 생성 (첫 번째 계정)
          const networkType = params.networkType || NetworkType.ETHEREUM_MAINNET;
          const accountId = keyringInstance.addAccount(walletId, networkType, 'Account 1', 0);
          
          break;
        
        case WalletType.PRIVATE_KEY:
          // 개인 키 필요
          if (!params.privateKey) {
            throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, 'Private key is required');
          }
          
          // 개인 키 지갑 생성
          walletId = keyringInstance.createPrivateKeyWallet(params.password, params.privateKey);
          break;
        
        case WalletType.KEYSTORE:
          // 키스토어 및 비밀번호 필요
          if (!params.keystoreJson || !params.keystorePassword) {
            throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, 'Keystore and password are required');
          }
          
          // JSON 파싱
          const keystoreData = JSON.parse(params.keystoreJson);
          
          // 키스토어에서 개인 키 추출 (외부 라이브러리 필요)
          const wallet = await ethers.Wallet.fromEncryptedJson(params.keystoreJson, params.keystorePassword);
          const privateKey = wallet.privateKey;
          
          // 개인 키 지갑으로 생성
          walletId = keyringInstance.createPrivateKeyWallet(params.password, privateKey);
          break;
        
        default:
          throw new ToriWalletError(ErrorCode.UNSUPPORTED_OPERATION, 'Unsupported wallet type');
      }
      
      return walletId;
    } catch (error) {
      console.error('Failed to create wallet', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, 'Failed to create wallet', error);
    }
  }
  
  /**
   * 지갑 가져오기
   * 
   * @param params 지갑 가져오기 매개변수
   * @returns 가져온 지갑 ID
   */
  public async importWallet(params: ImportWalletParams): Promise<string> {
    try {
      // 지갑 생성과 유사한 로직 사용
      return await this.createWallet(params as CreateWalletParams);
    } catch (error) {
      console.error('Failed to import wallet', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.WALLET_IMPORT_FAILED, 'Failed to import wallet', error);
    }
  }
  
  /**
   * 지갑 잠금 해제
   * 
   * @param password 비밀번호
   * @returns 잠금 해제 성공 여부
   */
  public unlockWallet(password: string): boolean {
    try {
      return keyringInstance.unlock(password);
    } catch (error) {
      console.error('Failed to unlock wallet', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.INVALID_PASSWORD, 'Failed to unlock wallet', error);
    }
  }
  
  /**
   * 지갑 잠금
   * 
   * @returns 잠금 성공 여부
   */
  public lockWallet(): boolean {
    try {
      return keyringInstance.lock();
    } catch (error) {
      console.error('Failed to lock wallet', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.WALLET_LOCKED, 'Failed to lock wallet', error);
    }
  }
  
  /**
   * 계정 생성
   * 
   * @param params 계정 생성 매개변수
   * @returns 생성된 계정 ID
   */
  public createAccount(params: CreateAccountParams): string {
    try {
      const { walletId, name, networkType, index } = params;
      
      // 계정 추가
      return keyringInstance.addAccount(walletId, networkType, name || `Account ${index || 0}`, index);
    } catch (error) {
      console.error('Failed to create account', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, 'Failed to create account', error);
    }
  }
  
  /**
   * 지갑 목록 가져오기
   * 
   * @returns 지갑 ID 목록
   */
  public getWallets(): string[] {
    try {
      return keyringInstance.getWallets();
    } catch (error) {
      console.error('Failed to get wallets', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, 'Failed to get wallets', error);
    }
  }
  
  /**
   * 계정 목록 가져오기
   * 
   * @returns 계정 정보 목록
   */
  public getAccounts(): BaseAccount[] {
    try {
      return keyringInstance.getAccounts();
    } catch (error) {
      console.error('Failed to get accounts', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.ACCOUNT_NOT_FOUND, 'Failed to get accounts', error);
    }
  }
  
  /**
   * 지갑의 계정 목록 가져오기
   * 
   * @param walletId 지갑 ID
   * @returns 계정 ID 목록
   */
  public getWalletAccounts(walletId: string): string[] {
    try {
      return keyringInstance.getWalletAccounts(walletId);
    } catch (error) {
      console.error('Failed to get wallet accounts', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.ACCOUNT_NOT_FOUND, 'Failed to get wallet accounts', error);
    }
  }
  
  /**
   * 계정의 개인 키 가져오기
   * 
   * @param accountId 계정 ID
   * @returns 개인 키
   */
  public getPrivateKey(accountId: string): string {
    try {
      return keyringInstance.getPrivateKey(accountId);
    } catch (error) {
      console.error('Failed to get private key', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.INVALID_PRIVATE_KEY, 'Failed to get private key', error);
    }
  }
  
  /**
   * 지갑 삭제
   * 
   * @param walletId 지갑 ID
   * @returns 삭제 성공 여부
   */
  public deleteWallet(walletId: string): boolean {
    try {
      return keyringInstance.deleteWallet(walletId);
    } catch (error) {
      console.error('Failed to delete wallet', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, 'Failed to delete wallet', error);
    }
  }
  
  /**
   * 계정 삭제
   * 
   * @param accountId 계정 ID
   * @returns 삭제 성공 여부
   */
  public deleteAccount(accountId: string): boolean {
    try {
      return keyringInstance.deleteAccount(accountId);
    } catch (error) {
      console.error('Failed to delete account', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.ACCOUNT_NOT_FOUND, 'Failed to delete account', error);
    }
  }
  
  /**
   * 지갑 내보내기
   * 
   * @param walletId 지갑 ID
   * @param type 내보내기 유형 (mnemonic, privateKey)
   * @returns 내보내기 데이터
   */
  public exportWallet(walletId: string, type: 'mnemonic' | 'privateKey'): string {
    try {
      return keyringInstance.exportWallet(walletId, type);
    } catch (error) {
      console.error('Failed to export wallet', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.WALLET_EXPORT_FAILED, 'Failed to export wallet', error);
    }
  }
  
  /**
   * 니모닉 구문 생성
   * 
   * @param wordCount 단어 수 (12, 15, 18, 24)
   * @returns 니모닉 구문
   */
  public generateMnemonic(wordCount: 12 | 15 | 18 | 24 = 12): string {
    try {
      // 단어 수에 따른 강도 설정
      let strength;
      switch (wordCount) {
        case 12:
          strength = mnemonicService.MnemonicStrength.LOW;
          break;
        case 15:
          strength = mnemonicService.MnemonicStrength.MEDIUM;
          break;
        case 18:
          strength = mnemonicService.MnemonicStrength.HIGH;
          break;
        case 24:
          strength = mnemonicService.MnemonicStrength.VERY_HIGH;
          break;
        default:
          strength = mnemonicService.MnemonicStrength.LOW;
      }
      
      return mnemonicService.generateMnemonic({ strength });
    } catch (error) {
      console.error('Failed to generate mnemonic', error);
      throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, 'Failed to generate mnemonic', error);
    }
  }
  
  /**
   * 니모닉 구문 검증
   * 
   * @param mnemonic 니모닉 구문
   * @returns 유효성 여부
   */
  public validateMnemonic(mnemonic: string): boolean {
    return mnemonicService.validateMnemonic(mnemonic);
  }
  
  /**
   * 메시지 서명
   * 
   * @param accountId 계정 ID
   * @param message 메시지
   * @param networkType 네트워크 유형
   * @returns 서명 문자열
   */
  public async signMessage(
    accountId: string,
    message: string,
    networkType: NetworkType
  ): Promise<string> {
    try {
      const privateKey = this.getPrivateKey(accountId);
      return await signatureService.signMessage(privateKey, message, networkType);
    } catch (error) {
      console.error('Failed to sign message', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.AUTHENTICATION_FAILED, 'Failed to sign message', error);
    }
  }
  
  /**
   * 트랜잭션 서명
   * 
   * @param accountId 계정 ID
   * @param transaction 트랜잭션 객체
   * @param networkType 네트워크 유형
   * @returns 서명된 트랜잭션
   */
  public async signTransaction(
    accountId: string,
    transaction: any,
    networkType: NetworkType
  ): Promise<string> {
    try {
      const privateKey = this.getPrivateKey(accountId);
      return await signatureService.signTransaction(privateKey, transaction, networkType);
    } catch (error) {
      console.error('Failed to sign transaction', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.TRANSACTION_FAILED, 'Failed to sign transaction', error);
    }
  }
  
  /**
   * 계정 주소 가져오기
   * 
   * @param accountId 계정 ID
   * @returns 계정 주소
   */
  public getAccountAddress(accountId: string): string {
    try {
      const accounts = this.getAccounts();
      const account = accounts.find(acc => acc.id === accountId);
      
      if (!account) {
        throw new ToriWalletError(ErrorCode.ACCOUNT_NOT_FOUND, 'Account not found');
      }
      
      return account.address;
    } catch (error) {
      console.error('Failed to get account address', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.ACCOUNT_NOT_FOUND, 'Failed to get account address', error);
    }
  }
  
  /**
   * 계정 이름 변경
   * 
   * @param accountId 계정 ID
   * @param name 새 이름
   * @returns 성공 여부
   */
  public async renameAccount(accountId: string, name: string): Promise<boolean> {
    try {
      // 계정 목록 가져오기
      const accounts = this.getAccounts();
      const account = accounts.find(acc => acc.id === accountId);
      
      if (!account) {
        throw new ToriWalletError(ErrorCode.ACCOUNT_NOT_FOUND, 'Account not found');
      }
      
      // 이름 변경 (키링 내부 로직 구현 필요)
      // 현재는 지원되지 않음
      throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Rename account not implemented');
    } catch (error) {
      console.error('Failed to rename account', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, 'Failed to rename account', error);
    }
  }
  
  /**
   * 비밀번호 변경
   * 
   * @param oldPassword 이전 비밀번호
   * @param newPassword 새 비밀번호
   * @returns 성공 여부
   */
  public changePassword(oldPassword: string, newPassword: string): boolean {
    try {
      return keyringInstance.changePassword(oldPassword, newPassword);
    } catch (error) {
      console.error('Failed to change password', error);
      if (error instanceof ToriWalletError) {
        throw error;
      }
      throw new ToriWalletError(ErrorCode.INVALID_PASSWORD, 'Failed to change password', error);
    }
  }
  
  /**
   * 자동 잠금 타임아웃 설정
   * 
   * @param timeout 타임아웃 (분)
   */
  public setAutoLockTimeout(timeout: number): void {
    try {
      keyringInstance.setAutoLockTimeout(timeout);
    } catch (error) {
      console.error('Failed to set auto lock timeout', error);
      throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, 'Failed to set auto lock timeout', error);
    }
  }
}

// 지갑 서비스 싱글톤 인스턴스
export const walletServiceInstance = new WalletService();

// 기본 내보내기
export default walletServiceInstance;
