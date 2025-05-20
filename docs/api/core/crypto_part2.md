# Crypto Services (암호화 서비스) - Part 2

## encryption.ts

암호화 관련 유틸리티 함수를 제공합니다.

```typescript
import { ethers } from 'ethers';
import * as crypto from 'crypto';
import { ToriError, ErrorCode } from '../../constants/errors';

interface EncryptionParams {
  cipher: string;
  ciphertext: string;
  cipherparams: {
    iv: string;
  };
  kdf: string;
  kdfparams: {
    dklen: number;
    n: number;
    p: number;
    r: number;
    salt: string;
  };
  mac: string;
}

// Encrypt data with a password
export async function encryptWithPassword(data: string, password: string): Promise<EncryptionParams> {
  try {
    // Generate a random salt
    const salt = crypto.randomBytes(32);
    
    // Use scrypt KDF to derive a key
    const kdfparams = {
      dklen: 32,
      n: 8192, // CPU/memory cost parameter
      r: 8,    // Block size parameter
      p: 1,    // Parallelization parameter
      salt: salt.toString('hex'),
    };
    
    // Derive key using scrypt
    const derivedKey = await ethers.utils.scrypt(
      Buffer.from(password),
      salt,
      kdfparams.dklen,
      { N: kdfparams.n, r: kdfparams.r, p: kdfparams.p }
    );
    
    // Generate random IV
    const iv = crypto.randomBytes(16);
    
    // Create cipher and encrypt
    const cipher = crypto.createCipheriv('aes-256-ctr', derivedKey.slice(0, 16), iv);
    let ciphertext = cipher.update(data, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    
    // Calculate MAC
    const mac = ethers.utils.keccak256(
      Buffer.concat([
        Buffer.from(derivedKey.slice(16, 32)),
        Buffer.from(ciphertext, 'hex'),
      ])
    );
    
    return {
      cipher: 'aes-256-ctr',
      ciphertext,
      cipherparams: {
        iv: iv.toString('hex'),
      },
      kdf: 'scrypt',
      kdfparams,
      mac,
    };
  } catch (error) {
    throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Encryption failed', error);
  }
}

// Decrypt data with a password
export async function decryptWithPassword(encryptionParams: EncryptionParams, password: string): Promise<string> {
  try {
    const { cipher, ciphertext, cipherparams, kdf, kdfparams, mac } = encryptionParams;
    
    // Derive key using scrypt
    const derivedKey = await ethers.utils.scrypt(
      Buffer.from(password),
      Buffer.from(kdfparams.salt, 'hex'),
      kdfparams.dklen,
      { N: kdfparams.n, r: kdfparams.r, p: kdfparams.p }
    );
    
    // Verify MAC
    const calculatedMac = ethers.utils.keccak256(
      Buffer.concat([
        Buffer.from(derivedKey.slice(16, 32)),
        Buffer.from(ciphertext, 'hex'),
      ])
    );
    
    if (calculatedMac !== mac) {
      throw new ToriError(ErrorCode.INVALID_PASSWORD, 'Invalid password');
    }
    
    // Decrypt ciphertext
    const decipher = crypto.createDecipheriv(
      cipher,
      derivedKey.slice(0, 16),
      Buffer.from(cipherparams.iv, 'hex')
    );
    
    let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');
    
    return plaintext;
  } catch (error) {
    if (error instanceof ToriError) {
      throw error;
    }
    throw new ToriError(ErrorCode.INVALID_PASSWORD, 'Decryption failed', error);
  }
}
```

## signature.ts

서명 관련 유틸리티 함수를 제공합니다.

```typescript
import { ethers } from 'ethers';
import { ToriError, ErrorCode } from '../../constants/errors';

export class SignatureService {
  // Sign a message
  static signMessage(privateKey: string, message: string): string {
    try {
      const wallet = new ethers.Wallet(privateKey);
      return wallet.signMessage(message);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to sign message', error);
    }
  }

  // Sign a transaction
  static async signTransaction(privateKey: string, transaction: ethers.providers.TransactionRequest): Promise<string> {
    try {
      const wallet = new ethers.Wallet(privateKey);
      return await wallet.signTransaction(transaction);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to sign transaction', error);
    }
  }

  // Sign typed data (EIP-712)
  static signTypedData(privateKey: string, domain: any, types: any, value: any): string {
    try {
      const wallet = new ethers.Wallet(privateKey);
      // @ts-ignore - ethers.js v5 lacks proper types for signTypedData
      return wallet._signTypedData(domain, types, value);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to sign typed data', error);
    }
  }

  // Verify a message signature
  static verifyMessage(message: string, signature: string): string {
    try {
      return ethers.utils.verifyMessage(message, signature);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to verify message', error);
    }
  }

  // Recover public key from signature
  static recoverPublicKey(message: string, signature: string): string {
    try {
      const msgHash = ethers.utils.hashMessage(message);
      const msgBytes = ethers.utils.arrayify(msgHash);
      return ethers.utils.recoverPublicKey(msgBytes, signature);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to recover public key', error);
    }
  }

  // Recover address from signature
  static recoverAddress(message: string, signature: string): string {
    try {
      return ethers.utils.verifyMessage(message, signature);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to recover address', error);
    }
  }
}
```
