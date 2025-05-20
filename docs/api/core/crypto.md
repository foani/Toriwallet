# Crypto Services (암호화 서비스)

Core 패키지에서 사용되는 암호화 관련 서비스를 설명합니다.

## keyring.ts

키 관리 서비스는 지갑과 계정의 키를 관리합니다.

```typescript
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { HDNode } from 'ethers/lib/utils';
import { ToriError, ErrorCode } from '../../constants/errors';
import { EncryptedWallet, HDWallet, ImportedWallet, Account } from '../../types/wallet';
import { encryptWithPassword, decryptWithPassword } from './encryption';

export class Keyring {
  // Create a new HD wallet with a random mnemonic
  static async createHDWallet(name: string, password: string): Promise<{ wallet: HDWallet; encryptedWallet: EncryptedWallet; mnemonic: string }> {
    const mnemonic = bip39.generateMnemonic(256); // 24 words
    return Keyring.importHDWallet(name, mnemonic, password);
  }

  // Import an existing wallet from a mnemonic
  static async importHDWallet(name: string, mnemonic: string, password: string): Promise<{ wallet: HDWallet; encryptedWallet: EncryptedWallet; mnemonic: string }> {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new ToriError(ErrorCode.INVALID_MNEMONIC, 'Invalid mnemonic phrase');
    }

    const wallet: HDWallet = {
      id: ethers.utils.id(Date.now().toString() + Math.random().toString()),
      name,
      type: 'hd',
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    };

    const encryptedMnemonic = await encryptWithPassword(mnemonic, password);
    const encryptedWallet: EncryptedWallet = {
      id: wallet.id,
      version: '1',
      crypto: encryptedMnemonic,
    };

    return { wallet, encryptedWallet, mnemonic };
  }

  // Import an existing wallet from a private key
  static async importPrivateKey(name: string, privateKey: string, password: string): Promise<{ wallet: ImportedWallet; encryptedWallet: EncryptedWallet; privateKey: string }> {
    try {
      // Validate private key
      new ethers.Wallet(privateKey);
    } catch (error) {
      throw new ToriError(ErrorCode.INVALID_PRIVATE_KEY, 'Invalid private key');
    }

    const wallet: ImportedWallet = {
      id: ethers.utils.id(Date.now().toString() + Math.random().toString()),
      name,
      type: 'imported',
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    };

    const encryptedPrivateKey = await encryptWithPassword(privateKey, password);
    const encryptedWallet: EncryptedWallet = {
      id: wallet.id,
      version: '1',
      crypto: encryptedPrivateKey,
    };

    return { wallet, encryptedWallet, privateKey };
  }

  // Create a new account from an HD wallet
  static async createAccount(walletId: string, mnemonic: string, name: string, path: string): Promise<Account> {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new ToriError(ErrorCode.INVALID_MNEMONIC, 'Invalid mnemonic phrase');
    }

    const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
    const derivedNode = hdNode.derivePath(path);
    const privateKey = derivedNode.privateKey;
    const wallet = new ethers.Wallet(privateKey);

    const account: Account = {
      id: ethers.utils.id(Date.now().toString() + Math.random().toString()),
      walletId,
      name,
      path,
      address: wallet.address,
      networkIds: [],
      isHidden: false,
      isDefault: false,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    };

    return account;
  }

  // Create a new account from a private key
  static async importAccount(walletId: string, privateKey: string, name: string): Promise<Account> {
    try {
      const wallet = new ethers.Wallet(privateKey);

      const account: Account = {
        id: ethers.utils.id(Date.now().toString() + Math.random().toString()),
        walletId,
        name,
        address: wallet.address,
        networkIds: [],
        isHidden: false,
        isDefault: false,
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
      };

      return account;
    } catch (error) {
      throw new ToriError(ErrorCode.INVALID_PRIVATE_KEY, 'Invalid private key');
    }
  }

  // Get private key from account
  static async getPrivateKey(account: Account, mnemonic?: string, privateKey?: string): Promise<string> {
    if (account.path && mnemonic) {
      // HD wallet account
      const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
      const derivedNode = hdNode.derivePath(account.path);
      return derivedNode.privateKey;
    } else if (privateKey) {
      // Imported wallet account
      return privateKey;
    } else {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Cannot get private key');
    }
  }

  // Decrypt wallet data
  static async decryptWallet(encryptedWallet: EncryptedWallet, password: string): Promise<string> {
    try {
      return await decryptWithPassword(encryptedWallet.crypto, password);
    } catch (error) {
      throw new ToriError(ErrorCode.INVALID_PASSWORD, 'Invalid password');
    }
  }
}
```

## mnemonic.ts

니모닉 관련 유틸리티 함수를 제공합니다.

```typescript
import * as bip39 from 'bip39';
import { ToriError, ErrorCode } from '../../constants/errors';

export class MnemonicService {
  // Generate a new mnemonic phrase
  static generateMnemonic(strength: number = 256): string {
    return bip39.generateMnemonic(strength);
  }

  // Validate a mnemonic phrase
  static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  // Convert mnemonic to seed
  static mnemonicToSeed(mnemonic: string, password: string = ''): Promise<Buffer> {
    if (!this.validateMnemonic(mnemonic)) {
      throw new ToriError(ErrorCode.INVALID_MNEMONIC, 'Invalid mnemonic phrase');
    }
    return bip39.mnemonicToSeed(mnemonic, password);
  }

  // Get English word list
  static getWordlist(): string[] {
    return bip39.wordlists.english;
  }

  // Create a mnemonic from entropy
  static entropyToMnemonic(entropy: Buffer): string {
    return bip39.entropyToMnemonic(entropy);
  }

  // Convert mnemonic to entropy
  static mnemonicToEntropy(mnemonic: string): string {
    if (!this.validateMnemonic(mnemonic)) {
      throw new ToriError(ErrorCode.INVALID_MNEMONIC, 'Invalid mnemonic phrase');
    }
    return bip39.mnemonicToEntropy(mnemonic);
  }
}
```

## hdkey.ts

HD 키 파생 관련 유틸리티 함수를 제공합니다.

```typescript
import { ethers } from 'ethers';
import { MnemonicService } from './mnemonic';
import { ToriError, ErrorCode } from '../../constants/errors';

export enum DerivationPath {
  ETHEREUM = "m/44'/60'/0'/0",
  BITCOIN = "m/44'/0'/0'/0",
  CREATA_ZENITH = "m/44'/60'/0'/0",
  CREATA_CATENA = "m/44'/60'/0'/0",
  BSC = "m/44'/60'/0'/0",
  POLYGON = "m/44'/60'/0'/0",
  SOLANA = "m/44'/501'/0'",
}

export class HDKeyService {
  // Get derivation path for a specific account index and network
  static getDerivationPath(network: string, accountIndex: number = 0): string {
    let basePath = DerivationPath.ETHEREUM;
    
    switch (network) {
      case 'bitcoin':
        basePath = DerivationPath.BITCOIN;
        break;
      case 'zenith-mainnet':
        basePath = DerivationPath.CREATA_ZENITH;
        break;
      case 'catena-mainnet':
        basePath = DerivationPath.CREATA_CATENA;
        break;
      case 'bsc-mainnet':
        basePath = DerivationPath.BSC;
        break;
      case 'polygon-mainnet':
        basePath = DerivationPath.POLYGON;
        break;
      case 'solana-mainnet':
        basePath = DerivationPath.SOLANA;
        break;
      default:
        basePath = DerivationPath.ETHEREUM;
    }
    
    return `${basePath}/${accountIndex}`;
  }

  // Derive a key from mnemonic and path
  static deriveKeyFromMnemonic(mnemonic: string, path: string): ethers.utils.HDNode {
    if (!MnemonicService.validateMnemonic(mnemonic)) {
      throw new ToriError(ErrorCode.INVALID_MNEMONIC, 'Invalid mnemonic phrase');
    }
    
    const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);
    return hdNode.derivePath(path);
  }

  // Get private key from mnemonic and path
  static getPrivateKeyFromMnemonic(mnemonic: string, path: string): string {
    const hdNode = this.deriveKeyFromMnemonic(mnemonic, path);
    return hdNode.privateKey;
  }

  // Get address from mnemonic and path
  static getAddressFromMnemonic(mnemonic: string, path: string): string {
    const hdNode = this.deriveKeyFromMnemonic(mnemonic, path);
    return hdNode.address;
  }

  // Get multiple accounts from a single mnemonic
  static getMultipleAccounts(mnemonic: string, network: string, startIndex: number = 0, count: number = 1): Array<{ address: string; path: string }> {
    if (!MnemonicService.validateMnemonic(mnemonic)) {
      throw new ToriError(ErrorCode.INVALID_MNEMONIC, 'Invalid mnemonic phrase');
    }
    
    const accounts = [];
    
    for (let i = startIndex; i < startIndex + count; i++) {
      const path = this.getDerivationPath(network, i);
      const address = this.getAddressFromMnemonic(mnemonic, path);
      accounts.push({ address, path });
    }
    
    return accounts;
  }
}
```
