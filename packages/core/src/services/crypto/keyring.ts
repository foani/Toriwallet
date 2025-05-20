/**
 * keyring.ts
 * 
 * 이 모듈은 키링 서비스를 제공합니다. 키링은 지갑의 개인 키, 니모닉 구문, 시드 등을 관리하는 중요한 구성 요소입니다.
 * 보안을 위해 키링은 암호화된 형태로 저장되고, 사용자의 비밀번호로 복호화됩니다.
 */

import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { ERROR_MESSAGES, ErrorCode, ToriWalletError } from '../../constants/errors';
import { CRYPTO_CONFIG } from '../../constants/config';
import { AccountType, BaseAccount, WalletType } from '../../types/wallet';
import { NetworkType } from '../../constants/networks';

// 키링 상태 열거
export enum KeyringStatus {
  LOCKED = 'LOCKED',       // 잠김
  UNLOCKED = 'UNLOCKED',   // 잠금 해제됨
  UNINITIALIZED = 'UNINITIALIZED', // 초기화되지 않음
}

// 키링 설정 인터페이스
export interface KeyringOptions {
  encryptionVersion?: string;  // 암호화 버전
  saltLength?: number;         // 솔트 길이
  ivLength?: number;           // 초기화 벡터 길이
  keyLength?: number;          // 키 길이
  iterations?: number;         // 반복 횟수
  algorithm?: string;          // 알고리즘
}

// 암호화된 볼트 인터페이스
export interface EncryptedVault {
  version: string;             // 암호화 버전
  data: string;                // 암호화된 데이터
  salt: string;                // 솔트
  iv: string;                  // 초기화 벡터
  iterations: number;          // 반복 횟수
  algorithm: string;           // 알고리즘
}

// 볼트 데이터 인터페이스
export interface VaultData {
  wallets: {                    // 지갑 맵
    [id: string]: {             // 지갑 ID
      id: string;               // 지갑 ID
      type: WalletType;         // 지갑 유형
      mnemonic?: string;        // 니모닉 구문 (HD 지갑)
      privateKeys?: {           // 개인 키 맵
        [accountId: string]: string; // 계정 ID별 개인 키
      };
      seed?: string;            // 시드 (HD 지갑)
    };
  };
  accounts: {                   // 계정 맵
    [id: string]: BaseAccount;  // 계정 ID별 기본 계정 정보
  };
  defaultWalletId?: string;     // 기본 지갑 ID
  createdAt: number;            // 생성 시간
  updatedAt: number;            // 업데이트 시간
}

/**
 * 키링 클래스
 * 
 * 키링은 지갑의 개인 키, 니모닉 구문, 시드 등을 안전하게 관리하는 클래스입니다.
 */
export class Keyring {
  private vault: VaultData | null = null;
  private password: string | null = null;
  private encryptedVault: EncryptedVault | null = null;
  private status: KeyringStatus = KeyringStatus.UNINITIALIZED;
  private options: KeyringOptions;
  private listeners: { [event: string]: Function[] } = {};
  private unlockTime: number = 0;
  private autoLockTimeout: number = 0;
  private autoLockTimer: NodeJS.Timeout | null = null;

  /**
   * 키링 생성자
   * 
   * @param options 키링 설정 옵션
   */
  constructor(options?: KeyringOptions) {
    this.options = {
      encryptionVersion: '1',
      saltLength: CRYPTO_CONFIG.saltLength,
      ivLength: CRYPTO_CONFIG.ivLength,
      keyLength: CRYPTO_CONFIG.keyLength,
      iterations: CRYPTO_CONFIG.iterations,
      algorithm: CRYPTO_CONFIG.algorithm,
      ...options,
    };
  }

  /**
   * 키링 초기화
   * 
   * @param encryptedVault 암호화된 볼트
   * @returns 초기화 성공 여부
   */
  public initialize(encryptedVault?: EncryptedVault): boolean {
    try {
      if (encryptedVault) {
        this.encryptedVault = encryptedVault;
        this.status = KeyringStatus.LOCKED;
      } else {
        // 볼트 초기화
        this.vault = {
          wallets: {},
          accounts: {},
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        this.status = KeyringStatus.UNLOCKED;
      }

      this.emit('initialized', { status: this.status });
      return true;
    } catch (error) {
      console.error('Failed to initialize keyring', error);
      this.status = KeyringStatus.UNINITIALIZED;
      throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, ERROR_MESSAGES[ErrorCode.WALLET_CREATION_FAILED], error);
    }
  }

  /**
   * 키링 상태 확인
   * 
   * @returns 키링 상태
   */
  public getStatus(): KeyringStatus {
    return this.status;
  }

  /**
   * 키링 잠금 해제
   * 
   * @param password 비밀번호
   * @returns 잠금 해제 성공 여부
   */
  public unlock(password: string): boolean {
    if (!this.encryptedVault) {
      throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, ERROR_MESSAGES[ErrorCode.WALLET_NOT_FOUND]);
    }

    try {
      const vaultData = this.decrypt(this.encryptedVault, password);
      this.vault = JSON.parse(vaultData);
      this.password = password;
      this.status = KeyringStatus.UNLOCKED;
      this.unlockTime = Date.now();
      
      // 자동 잠금 타이머 설정
      this.setupAutoLock();

      this.emit('unlock', { status: this.status });
      return true;
    } catch (error) {
      console.error('Failed to unlock keyring', error);
      throw new ToriWalletError(ErrorCode.INVALID_PASSWORD, ERROR_MESSAGES[ErrorCode.INVALID_PASSWORD], error);
    }
  }

  /**
   * 키링 잠금
   * 
   * @returns 잠금 성공 여부
   */
  public lock(): boolean {
    if (this.status !== KeyringStatus.UNLOCKED) {
      return false;
    }

    try {
      // 자동 잠금 타이머 해제
      this.clearAutoLock();

      this.password = null;
      this.status = KeyringStatus.LOCKED;
      this.emit('lock', { status: this.status });
      return true;
    } catch (error) {
      console.error('Failed to lock keyring', error);
      throw new ToriWalletError(ErrorCode.WALLET_LOCKED, ERROR_MESSAGES[ErrorCode.WALLET_LOCKED], error);
    }
  }

  /**
   * HD 지갑 생성
   * 
   * @param password 비밀번호
   * @param mnemonic 니모닉 구문 (선택적, 제공되지 않으면 자동 생성)
   * @returns 지갑 ID
   */
  public createHDWallet(password: string, mnemonic?: string): string {
    if (this.status !== KeyringStatus.UNLOCKED && this.status !== KeyringStatus.UNINITIALIZED) {
      throw new ToriWalletError(ErrorCode.WALLET_LOCKED, ERROR_MESSAGES[ErrorCode.WALLET_LOCKED]);
    }

    try {
      // 볼트 초기화
      if (!this.vault) {
        this.vault = {
          wallets: {},
          accounts: {},
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      }

      // 니모닉 생성 또는 검증
      let mnemonicToUse = mnemonic;
      if (!mnemonicToUse) {
        // 새 니모닉 생성
        mnemonicToUse = bip39.generateMnemonic(128); // 12 단어 시드
      } else {
        // 니모닉 검증
        if (!bip39.validateMnemonic(mnemonicToUse)) {
          throw new ToriWalletError(ErrorCode.INVALID_MNEMONIC, ERROR_MESSAGES[ErrorCode.INVALID_MNEMONIC]);
        }
      }

      // 시드 생성
      const seed = bip39.mnemonicToSeedSync(mnemonicToUse).toString('hex');

      // 지갑 ID 생성
      const walletId = uuidv4();

      // 지갑 추가
      this.vault.wallets[walletId] = {
        id: walletId,
        type: WalletType.HD_WALLET,
        mnemonic: mnemonicToUse,
        seed,
        privateKeys: {},
      };

      // 첫 번째 지갑이면 기본 지갑으로 설정
      if (!this.vault.defaultWalletId) {
        this.vault.defaultWalletId = walletId;
      }

      // 볼트 업데이트
      this.vault.updatedAt = Date.now();

      // 상태 변경
      this.status = KeyringStatus.UNLOCKED;
      this.password = password;

      // 볼트 암호화 및 저장
      this.encryptAndSave(password);

      this.emit('walletCreated', { walletId });
      return walletId;
    } catch (error) {
      console.error('Failed to create HD wallet', error);
      throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, ERROR_MESSAGES[ErrorCode.WALLET_CREATION_FAILED], error);
    }
  }

  /**
   * 개인 키 지갑 생성
   * 
   * @param password 비밀번호
   * @param privateKey 개인 키
   * @returns 지갑 ID
   */
  public createPrivateKeyWallet(password: string, privateKey: string): string {
    if (this.status !== KeyringStatus.UNLOCKED && this.status !== KeyringStatus.UNINITIALIZED) {
      throw new ToriWalletError(ErrorCode.WALLET_LOCKED, ERROR_MESSAGES[ErrorCode.WALLET_LOCKED]);
    }

    try {
      // 볼트 초기화
      if (!this.vault) {
        this.vault = {
          wallets: {},
          accounts: {},
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      }

      // 개인 키 검증
      try {
        new ethers.Wallet(privateKey);
      } catch (error) {
        throw new ToriWalletError(ErrorCode.INVALID_PRIVATE_KEY, ERROR_MESSAGES[ErrorCode.INVALID_PRIVATE_KEY]);
      }

      // 지갑 ID 생성
      const walletId = uuidv4();

      // 계정 ID 생성
      const accountId = uuidv4();

      // 지갑 추가
      this.vault.wallets[walletId] = {
        id: walletId,
        type: WalletType.PRIVATE_KEY,
        privateKeys: {
          [accountId]: privateKey,
        },
      };

      // 계정 생성
      const wallet = new ethers.Wallet(privateKey);
      const address = wallet.address;

      // 계정 추가
      this.vault.accounts[accountId] = {
        id: accountId,
        name: `Account 1`,
        address,
        networkType: NetworkType.ETHEREUM_MAINNET, // 기본 네트워크
        type: AccountType.NORMAL,
        isImported: true,
        createdAt: Date.now(),
      };

      // 첫 번째 지갑이면 기본 지갑으로 설정
      if (!this.vault.defaultWalletId) {
        this.vault.defaultWalletId = walletId;
      }

      // 볼트 업데이트
      this.vault.updatedAt = Date.now();

      // 상태 변경
      this.status = KeyringStatus.UNLOCKED;
      this.password = password;

      // 볼트 암호화 및 저장
      this.encryptAndSave(password);

      this.emit('walletCreated', { walletId, accountId });
      return walletId;
    } catch (error) {
      console.error('Failed to create private key wallet', error);
      throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, ERROR_MESSAGES[ErrorCode.WALLET_CREATION_FAILED], error);
    }
  }

  /**
   * 지갑 목록 가져오기
   * 
   * @returns 지갑 ID 목록
   */
  public getWallets(): string[] {
    if (this.status !== KeyringStatus.UNLOCKED) {
      throw new ToriWalletError(ErrorCode.WALLET_LOCKED, ERROR_MESSAGES[ErrorCode.WALLET_LOCKED]);
    }

    if (!this.vault) {
      return [];
    }

    return Object.keys(this.vault.wallets);
  }

  /**
   * 계정 목록 가져오기
   * 
   * @returns 계정 정보 목록
   */
  public getAccounts(): BaseAccount[] {
    if (this.status !== KeyringStatus.UNLOCKED) {
      throw new ToriWalletError(ErrorCode.WALLET_LOCKED, ERROR_MESSAGES[ErrorCode.WALLET_LOCKED]);
    }

    if (!this.vault) {
      return [];
    }

    return Object.values(this.vault.accounts);
  }

  /**
   * 지갑의 계정 목록 가져오기
   * 
   * @param walletId 지갑 ID
   * @returns 계정 ID 목록
   */
  public getWalletAccounts(walletId: string): string[] {
    if (this.status !== KeyringStatus.UNLOCKED) {
      throw new ToriWalletError(ErrorCode.WALLET_LOCKED, ERROR_MESSAGES[ErrorCode.WALLET_LOCKED]);
    }

    if (!this.vault) {
      return [];
    }

    const wallet = this.vault.wallets[walletId];
    if (!wallet) {
      throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, ERROR_MESSAGES[ErrorCode.WALLET_NOT_FOUND]);
    }

    if (wallet.type === WalletType.PRIVATE_KEY) {
      return Object.keys(wallet.privateKeys || {});
    }

    // HD 지갑의 경우 계정 목록 반환
    return Object.values(this.vault.accounts)
      .filter(account => {
        // 계정의 지갑 ID 확인
        return account.path && account.path.startsWith(`m/44'/wallets/${walletId}`);
      })
      .map(account => account.id);
  }

  /**
   * 특정 계정의 개인 키 가져오기
   * 
   * @param accountId 계정 ID
   * @returns 개인 키
   */
  public getPrivateKey(accountId: string): string {
    if (this.status !== KeyringStatus.UNLOCKED) {
      throw new ToriWalletError(ErrorCode.WALLET_LOCKED, ERROR_MESSAGES[ErrorCode.WALLET_LOCKED]);
    }

    if (!this.vault) {
      throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, ERROR_MESSAGES[ErrorCode.WALLET_NOT_FOUND]);
    }

    const account = this.vault.accounts[accountId];
    if (!account) {
      throw new ToriWalletError(ErrorCode.ACCOUNT_NOT_FOUND, ERROR_MESSAGES[ErrorCode.ACCOUNT_NOT_FOUND]);
    }

    // 계정 유형에 따라 개인 키 반환
    if (account.type === AccountType.NORMAL) {
      // 지갑 유형 확인
      let walletId = '';
      
      // HD 지갑의 경우 경로에서 지갑 ID 추출
      if (account.path) {
        const match = account.path.match(/^m\/44'\/wallets\/([^\/]+)/);
        if (match) {
          walletId = match[1];
        }
      }
      
      // 지갑 ID를 찾지 못한 경우 모든 지갑에서 계정 찾기
      if (!walletId) {
        for (const id of Object.keys(this.vault.wallets)) {
          const wallet = this.vault.wallets[id];
          if (wallet.privateKeys && wallet.privateKeys[accountId]) {
            walletId = id;
            break;
          }
        }
      }

      if (!walletId) {
        throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, ERROR_MESSAGES[ErrorCode.WALLET_NOT_FOUND]);
      }

      const wallet = this.vault.wallets[walletId];
      
      // 개인 키 지갑
      if (wallet.type === WalletType.PRIVATE_KEY) {
        if (wallet.privateKeys && wallet.privateKeys[accountId]) {
          return wallet.privateKeys[accountId];
        }
      }
      // HD 지갑
      else if (wallet.type === WalletType.HD_WALLET) {
        if (!account.path) {
          throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, 'Account has no derivation path');
        }

        // HD 지갑에서 개인 키 파생
        if (!wallet.seed) {
          throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, 'Wallet seed not found');
        }
        
        // 경로 형식: m/44'/coinType'/0'/0/index
        const path = account.path.replace(`m/44'/wallets/${walletId}`, `m/44'/${this.getCoinType(account.networkType)}'`);
        
        // 시드에서 HD 노드 생성
        const hdNode = ethers.HDNodeWallet.fromSeed(Buffer.from(wallet.seed, 'hex'));
        
        // 경로에서 개인 키 파생
        const privateKey = hdNode.derivePath(path).privateKey;
        if (!privateKey) {
          throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, 'Failed to derive private key');
        }
        
        return privateKey;
      }
    }

    throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, 'Unsupported account type');
  }

  /**
   * 특정 계정의 서명 메시지
   * 
   * @param accountId 계정 ID
   * @param message 메시지
   * @returns 서명
   */
  public async signMessage(accountId: string, message: string): Promise<string> {
    const privateKey = this.getPrivateKey(accountId);
    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signMessage(message);
  }

  /**
   * 특정 계정의 트랜잭션 서명
   * 
   * @param accountId 계정 ID
   * @param transaction 트랜잭션 데이터
   * @returns 서명된 트랜잭션
   */
  public async signTransaction(accountId: string, transaction: ethers.TransactionRequest): Promise<string> {
    const privateKey = this.getPrivateKey(accountId);
    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signTransaction(transaction);
  }

  /**
   * 지갑 내보내기
   * 
   * @param walletId 지갑 ID
   * @param type 내보내기 유형 (mnemonic, privateKey)
   * @returns 내보내기 데이터
   */
  public exportWallet(walletId: string, type: 'mnemonic' | 'privateKey'): string {
    if (this.status !== KeyringStatus.UNLOCKED) {
      throw new ToriWalletError(ErrorCode.WALLET_LOCKED, ERROR_MESSAGES[ErrorCode.WALLET_LOCKED]);
    }

    if (!this.vault) {
      throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, ERROR_MESSAGES[ErrorCode.WALLET_NOT_FOUND]);
    }

    const wallet = this.vault.wallets[walletId];
    if (!wallet) {
      throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, ERROR_MESSAGES[ErrorCode.WALLET_NOT_FOUND]);
    }

    if (type === 'mnemonic') {
      if (wallet.type !== WalletType.HD_WALLET || !wallet.mnemonic) {
        throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, 'Wallet has no mnemonic');
      }
      return wallet.mnemonic;
    } else if (type === 'privateKey') {
      if (wallet.type !== WalletType.PRIVATE_KEY || !wallet.privateKeys) {
        throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, 'Wallet has no private key');
      }
      // 첫 번째 개인 키 반환
      const accountIds = Object.keys(wallet.privateKeys);
      if (accountIds.length === 0) {
        throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, 'Wallet has no accounts');
      }
      return wallet.privateKeys[accountIds[0]];
    }

    throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, 'Invalid export type');
  }

  /**
   * 지갑 삭제
   * 
   * @param walletId 지갑 ID
   * @returns 삭제 성공 여부
   */
  public deleteWallet(walletId: string): boolean {
    if (this.status !== KeyringStatus.UNLOCKED) {
      throw new ToriWalletError(ErrorCode.WALLET_LOCKED, ERROR_MESSAGES[ErrorCode.WALLET_LOCKED]);
    }

    if (!this.vault) {
      throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, ERROR_MESSAGES[ErrorCode.WALLET_NOT_FOUND]);
    }

    const wallet = this.vault.wallets[walletId];
    if (!wallet) {
      throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, ERROR_MESSAGES[ErrorCode.WALLET_NOT_FOUND]);
    }

    // 지갑에 속한 계정 삭제
    const accountIds = this.getWalletAccounts(walletId);
    for (const accountId of accountIds) {
      delete this.vault.accounts[accountId];
    }

    // 지갑 삭제
    delete this.vault.wallets[walletId];

    // 기본 지갑이었다면 새 기본 지갑 설정
    if (this.vault.defaultWalletId === walletId) {
      const walletIds = Object.keys(this.vault.wallets);
      if (walletIds.length > 0) {
        this.vault.defaultWalletId = walletIds[0];
      } else {
        delete this.vault.defaultWalletId;
      }
    }

    // 볼트 업데이트
    this.vault.updatedAt = Date.now();

    // 볼트 암호화 및 저장
    this.encryptAndSave(this.password!);

    this.emit('walletDeleted', { walletId });
    return true;
  }

  /**
   * 계정 추가
   * 
   * @param walletId 지갑 ID
   * @param networkType 네트워크 유형
   * @param name 계정 이름
   * @param index 인덱스 (HD 지갑 전용)
   * @returns 계정 ID
   */
  public addAccount(walletId: string, networkType: NetworkType, name: string, index?: number): string {
    if (this.status !== KeyringStatus.UNLOCKED) {
      throw new ToriWalletError(ErrorCode.WALLET_LOCKED, ERROR_MESSAGES[ErrorCode.WALLET_LOCKED]);
    }

    if (!this.vault) {
      throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, ERROR_MESSAGES[ErrorCode.WALLET_NOT_FOUND]);
    }

    const wallet = this.vault.wallets[walletId];
    if (!wallet) {
      throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, ERROR_MESSAGES[ErrorCode.WALLET_NOT_FOUND]);
    }

    try {
      if (wallet.type === WalletType.HD_WALLET) {
        // HD 지갑에서 계정 파생
        if (!wallet.seed) {
          throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, 'Wallet seed not found');
        }

        // 현재 계정 수 확인
        const accountIds = this.getWalletAccounts(walletId);
        const accountCount = accountIds.length;

        // 인덱스 확인
        const accountIndex = index !== undefined ? index : accountCount;

        // 계정 경로 생성
        const coinType = this.getCoinType(networkType);
        const path = `m/44'/${coinType}'/0'/0/${accountIndex}`;
        const walletPath = `m/44'/wallets/${walletId}/0'/0/${accountIndex}`;

        // 시드에서 HD 노드 생성
        const hdNode = ethers.HDNodeWallet.fromSeed(Buffer.from(wallet.seed, 'hex'));

        // 경로에서 주소 파생
        const account = hdNode.derivePath(path);
        const address = account.address;

        // 계정 ID 생성
        const accountId = uuidv4();

        // 계정 추가
        this.vault.accounts[accountId] = {
          id: accountId,
          name: name || `Account ${accountCount + 1}`,
          address,
          networkType,
          type: AccountType.NORMAL,
          index: accountIndex,
          path: walletPath,
          createdAt: Date.now(),
        };

        // 볼트 업데이트
        this.vault.updatedAt = Date.now();

        // 볼트 암호화 및 저장
        this.encryptAndSave(this.password!);

        this.emit('accountAdded', { walletId, accountId });
        return accountId;
      } else if (wallet.type === WalletType.PRIVATE_KEY) {
        throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, 'Cannot add accounts to private key wallet');
      }

      throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, 'Unsupported wallet type');
    } catch (error) {
      console.error('Failed to add account', error);
      throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, ERROR_MESSAGES[ErrorCode.WALLET_CREATION_FAILED], error);
    }
  }

  /**
   * 계정 삭제
   * 
   * @param accountId 계정 ID
   * @returns 삭제 성공 여부
   */
  public deleteAccount(accountId: string): boolean {
    if (this.status !== KeyringStatus.UNLOCKED) {
      throw new ToriWalletError(ErrorCode.WALLET_LOCKED, ERROR_MESSAGES[ErrorCode.WALLET_LOCKED]);
    }

    if (!this.vault) {
      throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, ERROR_MESSAGES[ErrorCode.WALLET_NOT_FOUND]);
    }

    const account = this.vault.accounts[accountId];
    if (!account) {
      throw new ToriWalletError(ErrorCode.ACCOUNT_NOT_FOUND, ERROR_MESSAGES[ErrorCode.ACCOUNT_NOT_FOUND]);
    }

    // 개인 키 지갑의 경우 지갑에서도 제거
    for (const walletId of Object.keys(this.vault.wallets)) {
      const wallet = this.vault.wallets[walletId];
      if (wallet.privateKeys && wallet.privateKeys[accountId]) {
        delete wallet.privateKeys[accountId];
        
        // 개인 키가 없는 경우 지갑 삭제
        if (Object.keys(wallet.privateKeys).length === 0) {
          delete this.vault.wallets[walletId];
          
          // 기본 지갑이었다면 새 기본 지갑 설정
          if (this.vault.defaultWalletId === walletId) {
            const walletIds = Object.keys(this.vault.wallets);
            if (walletIds.length > 0) {
              this.vault.defaultWalletId = walletIds[0];
            } else {
              delete this.vault.defaultWalletId;
            }
          }
        }
      }
    }

    // 계정 삭제
    delete this.vault.accounts[accountId];

    // 볼트 업데이트
    this.vault.updatedAt = Date.now();

    // 볼트 암호화 및 저장
    this.encryptAndSave(this.password!);

    this.emit('accountDeleted', { accountId });
    return true;
  }

  /**
   * 볼트 암호화 및 저장
   * 
   * @param password 비밀번호
   * @returns 암호화된 볼트
   */
  private encryptAndSave(password: string): EncryptedVault {
    if (!this.vault) {
      throw new ToriWalletError(ErrorCode.WALLET_NOT_FOUND, ERROR_MESSAGES[ErrorCode.WALLET_NOT_FOUND]);
    }

    // 볼트 데이터를 JSON 문자열로 변환
    const vaultData = JSON.stringify(this.vault);

    // 볼트 데이터 암호화
    const encryptedVault = this.encrypt(vaultData, password);
    this.encryptedVault = encryptedVault;

    // 암호화된 볼트 이벤트 발생
    this.emit('vaultUpdated', { encryptedVault });

    return encryptedVault;
  }

  /**
   * 데이터 암호화
   * 
   * @param data 암호화할 데이터
   * @param password 비밀번호
   * @returns 암호화된 데이터
   */
  private encrypt(data: string, password: string): EncryptedVault {
    // 솔트 생성
    const salt = CryptoJS.lib.WordArray.random(this.options.saltLength!).toString();

    // 초기화 벡터 생성
    const iv = CryptoJS.lib.WordArray.random(this.options.ivLength!).toString();

    // 키 생성
    const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
      keySize: this.options.keyLength! / 32,
      iterations: this.options.iterations!,
    });

    // 암호화
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return {
      version: this.options.encryptionVersion!,
      data: encrypted.toString(),
      salt,
      iv,
      iterations: this.options.iterations!,
      algorithm: this.options.algorithm!,
    };
  }

  /**
   * 데이터 복호화
   * 
   * @param encryptedVault 암호화된 볼트
   * @param password 비밀번호
   * @returns 복호화된 데이터
   */
  private decrypt(encryptedVault: EncryptedVault, password: string): string {
    try {
      // 키 생성
      const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(encryptedVault.salt), {
        keySize: this.options.keyLength! / 32,
        iterations: encryptedVault.iterations,
      });

      // 복호화
      const decrypted = CryptoJS.AES.decrypt(encryptedVault.data, key, {
        iv: CryptoJS.enc.Hex.parse(encryptedVault.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Failed to decrypt data', error);
      throw new ToriWalletError(ErrorCode.INVALID_PASSWORD, ERROR_MESSAGES[ErrorCode.INVALID_PASSWORD], error);
    }
  }

  /**
   * 자동 잠금 설정
   * 
   * @param timeout 타임아웃 (분)
   */
  public setAutoLockTimeout(timeout: number): void {
    this.autoLockTimeout = timeout * 60 * 1000; // 분을 밀리초로 변환
    
    // 이미 잠금 해제된 경우 타이머 재설정
    if (this.status === KeyringStatus.UNLOCKED) {
      this.setupAutoLock();
    }

    this.emit('autoLockTimeoutSet', { timeout });
  }

  /**
   * 자동 잠금 타이머 설정
   */
  private setupAutoLock(): void {
    // 기존 타이머 제거
    this.clearAutoLock();

    // 타임아웃이 0이면 자동 잠금 비활성화
    if (this.autoLockTimeout <= 0) {
      return;
    }

    // 타이머 설정
    this.autoLockTimer = setTimeout(() => {
      this.lock();
    }, this.autoLockTimeout);
  }

  /**
   * 자동 잠금 타이머 해제
   */
  private clearAutoLock(): void {
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer);
      this.autoLockTimer = null;
    }
  }

  /**
   * 네트워크 유형에 따른 코인 타입 가져오기
   * 
   * @param networkType 네트워크 유형
   * @returns 코인 타입
   */
  private getCoinType(networkType: NetworkType): number {
    switch (networkType) {
      case NetworkType.ETHEREUM_MAINNET:
      case NetworkType.ETHEREUM_GOERLI:
        return 60; // Ethereum
      case NetworkType.BITCOIN_MAINNET:
      case NetworkType.BITCOIN_TESTNET:
        return 0; // Bitcoin
      case NetworkType.BSC_MAINNET:
      case NetworkType.BSC_TESTNET:
        return 60; // BSC uses Ethereum's path
      case NetworkType.POLYGON_MAINNET:
      case NetworkType.POLYGON_MUMBAI:
        return 60; // Polygon uses Ethereum's path
      case NetworkType.SOLANA_MAINNET:
      case NetworkType.SOLANA_DEVNET:
        return 501; // Solana
      case NetworkType.CATENA_MAINNET:
      case NetworkType.CATENA_TESTNET:
        return 60; // CreataChain CIP-20 uses Ethereum's path
      case NetworkType.ZENITH_MAINNET:
        return 999; // CreataChain Zenith
      default:
        return 60; // Default to Ethereum
    }
  }

  /**
   * 이벤트 리스너 등록
   * 
   * @param event 이벤트 이름
   * @param listener 리스너 함수
   */
  public on(event: string, listener: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  /**
   * 이벤트 리스너 제거
   * 
   * @param event 이벤트 이름
   * @param listener 리스너 함수
   */
  public off(event: string, listener: Function): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  /**
   * 이벤트 발생
   * 
   * @param event 이벤트 이름
   * @param data 이벤트 데이터
   */
  private emit(event: string, data: any): void {
    if (!this.listeners[event]) {
      return;
    }
    for (const listener of this.listeners[event]) {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in ${event} listener`, error);
      }
    }
  }

  /**
   * 암호화된 볼트 가져오기
   * 
   * @returns 암호화된 볼트
   */
  public getEncryptedVault(): EncryptedVault | null {
    return this.encryptedVault;
  }

  /**
   * 암호 변경
   * 
   * @param oldPassword 이전 비밀번호
   * @param newPassword 새 비밀번호
   * @returns 암호 변경 성공 여부
   */
  public changePassword(oldPassword: string, newPassword: string): boolean {
    if (this.status !== KeyringStatus.UNLOCKED) {
      // 잠겨있는 경우 먼저 잠금 해제
      this.unlock(oldPassword);
    } else {
      // 잠금 해제된 경우 이전 비밀번호 확인
      if (this.password !== oldPassword) {
        throw new ToriWalletError(ErrorCode.INVALID_PASSWORD, ERROR_MESSAGES[ErrorCode.INVALID_PASSWORD]);
      }
    }

    // 새 비밀번호로 암호화 및 저장
    this.password = newPassword;
    this.encryptAndSave(newPassword);

    this.emit('passwordChanged', {});
    return true;
  }
}

// 키링 싱글톤 인스턴스
export const keyringInstance = new Keyring();

// 기본 내보내기
export default keyringInstance;
