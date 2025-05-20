# TORI 지갑 보안 아키텍처

## 1. 소개

TORI 지갑은 사용자의 암호화폐 자산을 안전하게 관리하기 위해 강력한 보안 아키텍처를 구현하고 있습니다. 이 문서는 TORI 지갑의 보안 아키텍처, 주요 보안 기능, 위협 모델, 암호화 구현 및 보안 모범 사례에 대해 설명합니다.

## 2. 보안 원칙

TORI 지갑의 보안 아키텍처는 다음과 같은 핵심 원칙을 기반으로 설계되었습니다:

1. **최소 권한 원칙**: 각 구성 요소는 필요한 최소한의 권한만 가집니다.
2. **심층 방어**: 여러 보안 계층을 통해 보안 위협에 대응합니다.
3. **개인 키 비노출**: 개인 키는 사용자의 기기에만 암호화된 형태로 저장되며, 서버에 전송되지 않습니다.
4. **오픈 소스 암호화**: 검증된 오픈 소스 암호화 라이브러리를 사용합니다.
5. **제로 트러스트**: 모든 입력과 작업은 의심스러운 것으로 간주하고 검증합니다.
6. **사용자 중심 보안**: 사용자가 보안 상태를 쉽게 이해하고 관리할 수 있도록 합니다.
7. **정기적인 보안 감사**: 외부 보안 전문가에 의한 정기적인 보안 감사를 수행합니다.

## 3. 키 관리 및 암호화

### 3.1 키 생성

TORI 지갑은 암호화폐 지갑의 핵심인 개인 키 및 시드 구문을 생성하기 위해 다음과 같은 방법을 사용합니다:

```typescript
// 키 생성 예시 코드
// src/services/crypto/mnemonic.ts

import * as bip39 from 'bip39';
import * as crypto from 'crypto';

export class Mnemonic {
  // 니모닉 시드 구문 생성 (기본 12 단어)
  static generate(strength: number = 128): string {
    // CSPRNG를 사용하여 안전한 랜덤 엔트로피 생성
    const entropy = crypto.randomBytes(strength / 8);
    return bip39.entropyToMnemonic(entropy.toString('hex'));
  }
  
  // 니모닉의 유효성 검사
  static validate(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }
  
  // 니모닉으로부터 시드 생성
  static toSeed(mnemonic: string, passphrase: string = ''): Buffer {
    return Buffer.from(bip39.mnemonicToSeedSync(mnemonic, passphrase));
  }
}
```

### 3.2 키 저장

사용자의 개인 키와 시드 구문은 다음과 같은 방법으로 보호됩니다:

1. **암호화 저장**: 개인 키는 AES-256 암호화를 사용하여 사용자의 기기에 저장됩니다.
2. **암호 보호**: 사용자의 암호를 사용하여 암호화 키를 파생합니다.
3. **암호 없이 저장 금지**: 개인 키는 절대로 암호화되지 않은 상태로 저장되지 않습니다.

```typescript
// 키 저장 예시 코드
// src/services/crypto/encryption.ts

import * as crypto from 'crypto';
import * as scrypt from 'scrypt-js';

export class Encryption {
  // 데이터 암호화
  static async encrypt(data: string, password: string): Promise<string> {
    const salt = crypto.randomBytes(16);
    const derivedKey = await this.deriveKey(password, salt);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey.slice(0, 32), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: 'aes-256-gcm',
      kdf: 'scrypt',
      version: 1,
    });
  }
  
  // 데이터 복호화
  static async decrypt(encryptedData: string, password: string): Promise<string> {
    const data = JSON.parse(encryptedData);
    const salt = Buffer.from(data.salt, 'hex');
    const iv = Buffer.from(data.iv, 'hex');
    const authTag = Buffer.from(data.authTag, 'hex');
    
    const derivedKey = await this.deriveKey(password, salt);
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey.slice(0, 32), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  // 키 파생 함수 (scrypt)
  private static async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    const derivedKey = await scrypt.scrypt(
      Buffer.from(password, 'utf8'),
      salt,
      32768, // N
      8,     // r
      1,     // p
      32     // dkLen
    );
    
    return Buffer.from(derivedKey);
  }
}
```

### 3.3 키스토어 파일 관리

TORI 지갑은 산업 표준을 준수하는 키스토어 파일 형식을 사용하여 지갑을 백업하고 복원할 수 있도록 합니다:

```typescript
// 키스토어 파일 관리 예시 코드
// src/services/crypto/keystore.ts

import * as uuid from 'uuid';
import { Encryption } from './encryption';

export class Keystore {
  // 키스토어 파일 생성
  static async createKeystore(privateKey: string, password: string): Promise<string> {
    const encryptedData = await Encryption.encrypt(privateKey, password);
    const data = JSON.parse(encryptedData);
    
    const keystore = {
      version: data.version,
      id: uuid.v4(),
      address: this.privateKeyToAddress(privateKey).toLowerCase(),
      crypto: {
        ciphertext: data.encrypted,
        cipherparams: {
          iv: data.iv,
        },
        cipher: data.algorithm,
        kdf: data.kdf,
        kdfparams: {
          dklen: 32,
          salt: data.salt,
          n: 32768,
          r: 8,
          p: 1,
        },
        mac: this.calculateMAC(privateKey, data),
      },
    };
    
    return JSON.stringify(keystore, null, 2);
  }
  
  // 키스토어 파일로부터 개인 키 추출
  static async getPrivateKeyFromKeystore(keystore: string, password: string): Promise<string> {
    const data = JSON.parse(keystore);
    
    const encryptedData = JSON.stringify({
      encrypted: data.crypto.ciphertext,
      iv: data.crypto.cipherparams.iv,
      salt: data.crypto.kdfparams.salt,
      authTag: data.crypto.mac,
      algorithm: data.crypto.cipher,
      kdf: data.crypto.kdf,
      version: data.version,
    });
    
    try {
      return await Encryption.decrypt(encryptedData, password);
    } catch (error) {
      throw new Error('잘못된 암호 또는 손상된 키스토어 파일');
    }
  }
  
  // MAC 계산
  private static calculateMAC(privateKey: string, data: any): string {
    const hashData = Buffer.concat([
      Buffer.from(privateKey, 'hex'),
      Buffer.from(data.encrypted, 'hex'),
    ]);
    
    return crypto.createHash('sha256').update(hashData).digest('hex');
  }
  
  // 개인 키에서 주소 생성
  private static privateKeyToAddress(privateKey: string): string {
    // 실제 구현에서는 각 체인에 맞는 주소 생성 로직 사용
    // 예시 코드는 이더리움 주소 생성 로직
    const secp256k1 = require('secp256k1');
    const keccak256 = require('keccak256');
    
    const pubKey = secp256k1.publicKeyCreate(Buffer.from(privateKey, 'hex'), false).slice(1);
    const address = keccak256(pubKey).slice(-20).toString('hex');
    
    return `0x${address}`;
  }
}
```

## 4. 인증 및 승인 메커니즘

### 4.1 암호 인증

TORI 지갑은 사용자 인증을 위해 강력한 암호 해싱 알고리즘을 사용합니다:

```typescript
// 암호 인증 예시 코드
// src/services/security/authentication.ts

import * as bcrypt from 'bcrypt';

export class Authentication {
  // 암호 해시 생성
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
  
  // 암호 검증
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  // 암호 복잡성 검증
  static validatePasswordComplexity(password: string): boolean {
    // 최소 8자, 대문자, 소문자, 숫자, 특수문자 포함
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return regex.test(password);
  }
}
```

### 4.2 생체 인증

모바일 기기에서는 지문 인식 및 Face ID와 같은 생체 인증을 지원합니다:

```typescript
// 생체 인증 예시 코드
// src/services/security/biometrics.ts

import ReactNativeBiometrics from 'react-native-biometrics';

export class Biometrics {
  private static rnBiometrics = new ReactNativeBiometrics();
  
  // 생체 인증 사용 가능 여부 확인
  static async isBiometricsAvailable(): Promise<boolean> {
    const { available } = await this.rnBiometrics.isSensorAvailable();
    return available;
  }
  
  // 생체 인증 키 생성
  static async createBiometricKey(userId: string): Promise<boolean> {
    const { publicKey } = await this.rnBiometrics.createKeys(`TORI_WALLET_${userId}`);
    
    // 공개 키를 서버에 저장 (필요한 경우)
    await this.savePublicKey(userId, publicKey);
    
    return true;
  }
  
  // 생체 인증 검증
  static async authenticate(userId: string, promptMessage: string = '지문을 인식해 주세요'): Promise<boolean> {
    const { success } = await this.rnBiometrics.simplePrompt({ promptMessage });
    return success;
  }
  
  // 생체 인증으로 서명
  static async signWithBiometrics(userId: string, payload: string): Promise<string | null> {
    const { success, signature } = await this.rnBiometrics.createSignature({
      promptMessage: '트랜잭션 서명을 위해 지문을 인식해 주세요',
      payload,
      cancelButtonText: '취소',
    });
    
    return success ? signature : null;
  }
  
  // 공개 키 저장
  private static async savePublicKey(userId: string, publicKey: string): Promise<void> {
    // 공개 키 저장 로직 (로컬 또는 서버)
  }
}
```

### 4.3 2단계 인증(2FA)

TORI 지갑은 시간 기반 일회용 비밀번호(TOTP) 방식의 2단계 인증을 지원합니다:

```typescript
// 2단계 인증 예시 코드
// src/services/security/two-factor.ts

import * as OTPAuth from 'otpauth';
import * as qrcode from 'qrcode';
import { Encryption } from '../crypto/encryption';

export class TwoFactorAuth {
  // 2FA 설정 생성
  static async setupTwoFactor(userId: string, masterPassword: string): Promise<{ secret: string; qrCodeUrl: string }> {
    // TOTP 생성
    const totp = new OTPAuth.TOTP({
      issuer: 'TORI Wallet',
      label: userId,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });
    
    const secret = totp.secret.base32;
    
    // 암호화하여 저장
    const encryptedSecret = await Encryption.encrypt(secret, masterPassword);
    await this.saveTwoFactorSecret(userId, encryptedSecret);
    
    // QR 코드 URL 생성
    const qrCodeUrl = await qrcode.toDataURL(totp.toString());
    
    return { secret, qrCodeUrl };
  }
  
  // 2FA 코드 검증
  static async verifyCode(userId: string, code: string, masterPassword: string): Promise<boolean> {
    // 저장된 비밀 키 가져오기
    const encryptedSecret = await this.getTwoFactorSecret(userId);
    
    if (!encryptedSecret) {
      return false;
    }
    
    try {
      const secret = await Encryption.decrypt(encryptedSecret, masterPassword);
      
      // TOTP 생성
      const totp = new OTPAuth.TOTP({
        issuer: 'TORI Wallet',
        label: userId,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret,
      });
      
      // 코드 검증
      const delta = totp.validate({ token: code, window: 1 });
      
      return delta !== null;
    } catch (error) {
      return false;
    }
  }
  
  // 2FA 비밀 키 저장
  private static async saveTwoFactorSecret(userId: string, encryptedSecret: string): Promise<void> {
    // 암호화된 비밀 키 저장 로직 (로컬 또는 서버)
  }
  
  // 2FA 비밀 키 가져오기
  private static async getTwoFactorSecret(userId: string): Promise<string | null> {
    // 암호화된 비밀 키 가져오기 로직 (로컬 또는 서버)
    return null; // 예시 코드
  }
  
  // 2FA 비활성화
  static async disableTwoFactor(userId: string): Promise<boolean> {
    // 2FA 비활성화 로직
    return true; // 예시 코드
  }
}
```

## 5. 트랜잭션 보안

### 5.1 트랜잭션 서명

TORI 지갑은 사용자의 개인 키로 트랜잭션을 서명하는 안전한 메커니즘을 제공합니다:

```typescript
// 트랜잭션 서명 예시 코드
// src/services/transaction/signer.ts

import { ethers } from 'ethers';

export class TransactionSigner {
  // 이더리움 트랜잭션 서명
  static signEthereumTransaction(privateKey: string, transaction: any): string {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.signTransaction(transaction);
  }
  
  // 메시지 서명
  static signMessage(privateKey: string, message: string): string {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.signMessage(message);
  }
  
  // 구조화된 데이터 서명 (EIP-712)
  static signTypedData(privateKey: string, domain: any, types: any, value: any): string {
    const wallet = new ethers.Wallet(privateKey);
    return wallet._signTypedData(domain, types, value);
  }
  
  // 비트코인 트랜잭션 서명
  static signBitcoinTransaction(privateKey: string, transaction: any): string {
    // 비트코인 트랜잭션 서명 로직
    return ''; // 예시 코드
  }
  
  // 멀티체인 트랜잭션 서명
  static signTransaction(privateKey: string, transaction: any, chainId: number): string {
    // 체인 ID에 따라 적절한 서명 메소드 호출
    switch (chainId) {
      case 1: // 이더리움 메인넷
      case 56: // 바이낸스 스마트 체인
      case 137: // 폴리곤
        return this.signEthereumTransaction(privateKey, transaction);
      case 1000: // 카테나 체인
        return this.signCatenaTransaction(privateKey, transaction);
      case 1:
        return this.signBitcoinTransaction(privateKey, transaction);
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  }
  
  // 카테나 체인 트랜잭션 서명
  private static signCatenaTransaction(privateKey: string, transaction: any): string {
    // 카테나 체인 트랜잭션 서명 로직
    return ''; // 예시 코드
  }
}
```

### 5.2 트랜잭션 확인

모든 트랜잭션은 실행 전에 사용자의 명시적인 확인을 필요로 합니다:

```typescript
// 트랜잭션 확인 예시 코드
// src/services/transaction/confirmation.ts

export class TransactionConfirmation {
  // 트랜잭션 상세 정보 표시 및 사용자 확인 요청
  static async requestConfirmation(transaction: any, chainId: number): Promise<boolean> {
    // 트랜잭션 세부 정보 파싱
    const details = this.parseTransactionDetails(transaction, chainId);
    
    // UI에 트랜잭션 세부 정보 표시 및 사용자 확인 요청
    // (실제 구현에서는 UI 컴포넌트와 연동)
    return new Promise<boolean>((resolve) => {
      // 사용자 확인 결과
      resolve(true); // 예시 코드
    });
  }
  
  // 서명 요청 확인
  static async requestSignatureConfirmation(message: string, address: string): Promise<boolean> {
    // UI에 서명 요청 세부 정보 표시 및 사용자 확인 요청
    return new Promise<boolean>((resolve) => {
      // 사용자 확인 결과
      resolve(true); // 예시 코드
    });
  }
  
  // dApp 연결 확인
  static async requestConnectionConfirmation(dAppInfo: any): Promise<boolean> {
    // UI에 dApp 연결 요청 세부 정보 표시 및 사용자 확인 요청
    return new Promise<boolean>((resolve) => {
      // 사용자 확인 결과
      resolve(true); // 예시 코드
    });
  }
  
  // 트랜잭션 세부 정보 파싱
  private static parseTransactionDetails(transaction: any, chainId: number): any {
    // 체인 ID에 따라 트랜잭션 세부 정보 파싱
    switch (chainId) {
      case 1: // 이더리움 메인넷
        return this.parseEthereumTransaction(transaction);
      case 56: // 바이낸스 스마트 체인
        return this.parseBSCTransaction(transaction);
      case 1000: // 카테나 체인
        return this.parseCatenaTransaction(transaction);
      default:
        return transaction;
    }
  }
  
  // 이더리움 트랜잭션 파싱
  private static parseEthereumTransaction(transaction: any): any {
    // 이더리움 트랜잭션 파싱 로직
    return {
      from: transaction.from,
      to: transaction.to,
      value: transaction.value,
      gas: transaction.gas,
      gasPrice: transaction.gasPrice,
      data: transaction.data,
      // 추가 정보 파싱 (토큰 전송, 계약 호출 등)
    };
  }
  
  // BSC 트랜잭션 파싱
  private static parseBSCTransaction(transaction: any): any {
    // BSC 트랜잭션 파싱 로직 (이더리움과 유사)
    return this.parseEthereumTransaction(transaction);
  }
  
  // 카테나 체인 트랜잭션 파싱
  private static parseCatenaTransaction(transaction: any): any {
    // 카테나 체인 트랜잭션 파싱 로직
    return {
      from: transaction.from,
      to: transaction.to,
      value: transaction.value,
      gas: transaction.gas,
      gasPrice: transaction.gasPrice,
      data: transaction.data,
      // 추가 정보 파싱
    };
  }
}
```

### 5.3 의심스러운 트랜잭션 감지

TORI 지갑은 의심스러운 트랜잭션을 감지하고 사용자에게 경고합니다:

```typescript
// 의심스러운 트랜잭션 감지 예시 코드
// src/services/security/transaction-scanner.ts

export class TransactionScanner {
  // 위험한 계약 주소 목록
  private static knownMaliciousAddresses: string[] = [
    // 악의적인 계약 주소 목록
  ];
  
  // 트랜잭션 스캔
  static scanTransaction(transaction: any, chainId: number): ScanResult {
    const result: ScanResult = {
      isSuspicious: false,
      warnings: [],
      riskLevel: 'low',
    };
    
    // 알려진 악의적인 주소 확인
    if (this.isKnownMaliciousAddress(transaction.to)) {
      result.isSuspicious = true;
      result.warnings.push('이 주소는 알려진 악의적인 주소입니다.');
      result.riskLevel = 'high';
    }
    
    // 승인 트랜잭션 확인
    if (this.isUnlimitedApproval(transaction)) {
      result.isSuspicious = true;
      result.warnings.push('이 트랜잭션은 무제한 토큰 승인을 요청합니다.');
      result.riskLevel = 'medium';
    }
    
    // 비정상적인 가스 가격 확인
    if (this.hasAbnormalGasPrice(transaction, chainId)) {
      result.warnings.push('이 트랜잭션은 비정상적으로 높은 가스 가격을 가지고 있습니다.');
    }
    
    // 계약 호출 데이터 분석
    if (transaction.data && transaction.data !== '0x') {
      const contractAnalysis = this.analyzeContractCall(transaction.data);
      if (contractAnalysis.isSuspicious) {
        result.isSuspicious = true;
        result.warnings.push(...contractAnalysis.warnings);
        result.riskLevel = this.calculateRiskLevel(result.riskLevel, contractAnalysis.riskLevel);
      }
    }
    
    return result;
  }
  
  // 알려진 악의적인 주소 확인
  private static isKnownMaliciousAddress(address: string): boolean {
    return this.knownMaliciousAddresses.some(
      (maliciousAddress) => maliciousAddress.toLowerCase() === address.toLowerCase()
    );
  }
  
  // 무제한 토큰 승인 확인
  private static isUnlimitedApproval(transaction: any): boolean {
    // ERC20 approve 함수 호출 확인
    // 0x095ea7b3 = approve(address,uint256) 함수 시그니처
    if (transaction.data && transaction.data.startsWith('0x095ea7b3')) {
      const approvalAmount = this.decodeApprovalAmount(transaction.data);
      // 무제한 승인 확인 (2^256 - 1)
      return approvalAmount === 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    }
    
    return false;
  }
  
  // 승인 금액 디코딩
  private static decodeApprovalAmount(data: string): string {
    // ERC20 approve 함수 파라미터 디코딩
    // approve(address,uint256) 함수의 두 번째 파라미터(uint256)
    return data.slice(74);
  }
  
  // 비정상적인 가스 가격 확인
  private static hasAbnormalGasPrice(transaction: any, chainId: number): boolean {
    // 체인별 일반적인 가스 가격 범위 확인
    const normalGasPrice = this.getNormalGasPriceRange(chainId);
    
    if (!normalGasPrice || !transaction.gasPrice) {
      return false;
    }
    
    const gasPriceGwei = parseInt(transaction.gasPrice, 16) / 1e9;
    return gasPriceGwei > normalGasPrice.high * 2;
  }
  
  // 일반적인 가스 가격 범위 가져오기
  private static getNormalGasPriceRange(chainId: number): { low: number; average: number; high: number } | null {
    // 체인별 일반적인 가스 가격 범위
    switch (chainId) {
      case 1: // 이더리움 메인넷
        return { low: 20, average: 50, high: 100 }; // Gwei
      case 56: // 바이낸스 스마트 체인
        return { low: 5, average: 10, high: 20 }; // Gwei
      case 137: // 폴리곤
        return { low: 30, average: 50, high: 100 }; // Gwei
      case 1000: // 카테나 체인
        return { low: 1, average: 3, high: 5 }; // Gwei
      default:
        return null;
    }
  }
  
  // 계약 호출 데이터 분석
  private static analyzeContractCall(data: string): { isSuspicious: boolean; warnings: string[]; riskLevel: RiskLevel } {
    const result = {
      isSuspicious: false,
      warnings: [] as string[],
      riskLevel: 'low' as RiskLevel,
    };
    
    // 함수 시그니처 추출
    const functionSignature = data.slice(0, 10);
    
    // 위험한 함수 시그니처 확인
    switch (functionSignature) {
      case '0x23b872dd': // transferFrom(address,address,uint256)
        result.warnings.push('이 트랜잭션은 다른 주소에서 토큰을 전송합니다.');
        break;
      case '0x42842e0e': // safeTransferFrom(address,address,uint256)
        result.warnings.push('이 트랜잭션은 NFT를 전송합니다.');
        break;
      case '0xf2fde38b': // transferOwnership(address)
        result.isSuspicious = true;
        result.warnings.push('이 트랜잭션은 계약 소유권을 이전합니다.');
        result.riskLevel = 'high';
        break;
      // 추가 함수 시그니처 확인
    }
    
    return result;
  }
  
  // 위험 수준 계산
  private static calculateRiskLevel(currentLevel: RiskLevel, newLevel: RiskLevel): RiskLevel {
    const riskLevels: { [key in RiskLevel]: number } = {
      low: 1,
      medium: 2,
      high: 3,
    };
    
    return riskLevels[currentLevel] >= riskLevels[newLevel] ? currentLevel : newLevel;
  }
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface ScanResult {
  isSuspicious: boolean;
  warnings: string[];
  riskLevel: RiskLevel;
}
```

## 6. 네트워크 보안

### 6.1 안전한 연결

TORI 지갑은 블록체인 네트워크에 연결할 때 안전한 연결을 보장합니다:

```typescript
// 안전한 연결 예시 코드
// src/services/api/provider.ts

import { ethers } from 'ethers';

export class SecureProvider {
  // 안전한 연결 생성
  static createSecureConnection(networkInfo: NetworkInfo): Provider {
    // HTTPS 연결 확인
    if (!this.isSecureUrl(networkInfo.rpcUrl)) {
      throw new Error('안전하지 않은 RPC URL입니다. HTTPS 연결이 필요합니다.');
    }
    
    // 제공자 인스턴스 생성
    let provider;
    
    switch (networkInfo.type) {
      case 'ethereum':
        provider = new ethers.providers.JsonRpcProvider(networkInfo.rpcUrl);
        break;
      case 'bitcoin':
        // 비트코인 제공자 생성
        break;
      case 'catena':
        // 카테나 체인 제공자 생성
        break;
      default:
        throw new Error(`지원되지 않는 네트워크 유형: ${networkInfo.type}`);
    }
    
    return provider;
  }
  
  // HTTPS URL 확인
  private static isSecureUrl(url: string): boolean {
    return url.startsWith('https://');
  }
  
  // 연결 상태 확인
  static async checkConnection(provider: Provider): Promise<boolean> {
    try {
      // 네트워크 연결 확인
      const network = await provider.getNetwork();
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // 인증이 필요한 API 호출
  static async callAuthenticatedApi(url: string, method: string, params: any, apiKey: string): Promise<any> {
    // 인증 헤더 생성
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    
    // API 호출
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
    });
    
    // 응답 파싱
    const result = await response.json();
    
    if (result.error) {
      throw new Error(`API 오류: ${result.error.message}`);
    }
    
    return result.result;
  }
}

export interface NetworkInfo {
  type: 'ethereum' | 'bitcoin' | 'catena';
  rpcUrl: string;
  chainId?: number;
  apiKey?: string;
}

export type Provider = ethers.providers.Provider | any;
```

### 6.2 DDoS 방지

TORI 지갑은 DDoS 공격으로부터 보호하기 위한 메커니즘을 구현합니다:

```typescript
// DDoS 방지 예시 코드
// src/services/api/rate-limiter.ts

export class RateLimiter {
  private static requestCounts: { [key: string]: RequestCount } = {};
  
  // 요청 제한 확인
  static checkRateLimit(endpoint: string, ipAddress: string): boolean {
    const key = `${ipAddress}:${endpoint}`;
    const now = Date.now();
    
    // 요청 카운트 초기화
    if (!this.requestCounts[key]) {
      this.requestCounts[key] = {
        count: 0,
        resetTime: now + 60000, // 1분 후 리셋
      };
    }
    
    // 시간 초과 확인
    if (now >= this.requestCounts[key].resetTime) {
      this.requestCounts[key] = {
        count: 0,
        resetTime: now + 60000, // 1분 후 리셋
      };
    }
    
    // 요청 카운트 증가
    this.requestCounts[key].count++;
    
    // 제한 확인
    const limit = this.getEndpointLimit(endpoint);
    return this.requestCounts[key].count <= limit;
  }
  
  // 엔드포인트별 제한 가져오기
  private static getEndpointLimit(endpoint: string): number {
    // 엔드포인트별 요청 제한
    switch (endpoint) {
      case 'getBalance':
        return 10; // 1분당 10회
      case 'sendTransaction':
        return 5; // 1분당 5회
      default:
        return 20; // 기본 1분당 20회
    }
  }
  
  // 모든 제한 초기화
  static resetAllLimits(): void {
    this.requestCounts = {};
  }
}

interface RequestCount {
  count: number;
  resetTime: number;
}
```

## 7. 사회적 복구 메커니즘

TORI 지갑은 Shamir's Secret Sharing 방식을 사용한 사회적 복구 메커니즘을 제공합니다:

```typescript
// 사회적 복구 메커니즘 예시 코드
// src/services/security/social-recovery.ts

import * as secrets from 'secrets.js-grempe';

export class SocialRecovery {
  // 시드 구문 분할
  static splitSeed(seed: string, totalShares: number, threshold: number): string[] {
    // 시드 구문을 16진수로 변환
    const hexSeed = this.stringToHex(seed);
    
    // Shamir's Secret Sharing 알고리즘을 사용하여 분할
    const shares = secrets.share(hexSeed, totalShares, threshold);
    
    return shares;
  }
  
  // 시드 구문 복구
  static recoverSeed(shares: string[]): string {
    // Shamir's Secret Sharing 알고리즘을 사용하여 복구
    const hexSeed = secrets.combine(shares);
    
    // 16진수를 문자열로 변환
    return this.hexToString(hexSeed);
  }
  
  // 복구 설정 생성
  static async createRecoverySetup(seed: string, guardianEmails: string[], threshold: number): Promise<RecoverySetup> {
    // 가디언 수 확인
    if (guardianEmails.length < threshold) {
      throw new Error('가디언 수는 임계값보다 크거나 같아야 합니다.');
    }
    
    // 시드 구문 분할
    const shares = this.splitSeed(seed, guardianEmails.length, threshold);
    
    // 가디언별 공유 생성
    const guardians = guardianEmails.map((email, index) => ({
      email,
      shareId: index + 1,
      share: shares[index],
    }));
    
    // 복구 설정 생성
    const recoverySetup: RecoverySetup = {
      totalShares: guardianEmails.length,
      threshold,
      guardians,
      createdAt: new Date().toISOString(),
    };
    
    return recoverySetup;
  }
  
  // 복구 과정 시작
  static async initiateRecovery(userEmail: string): Promise<string> {
    // 복구 ID 생성
    const recoveryId = this.generateRecoveryId();
    
    // 가디언에게 복구 요청 이메일 전송
    await this.sendRecoveryRequests(userEmail, recoveryId);
    
    return recoveryId;
  }
  
  // 가디언 공유 제출
  static async submitGuardianShare(recoveryId: string, guardianEmail: string, share: string): Promise<void> {
    // 가디언 공유 검증 및 저장
    await this.storeGuardianShare(recoveryId, guardianEmail, share);
  }
  
  // 복구 완료
  static async completeRecovery(recoveryId: string): Promise<string | null> {
    // 제출된 공유 가져오기
    const submittedShares = await this.getSubmittedShares(recoveryId);
    
    // 복구 설정 가져오기
    const recoverySetup = await this.getRecoverySetup(recoveryId);
    
    // 임계값 확인
    if (submittedShares.length < recoverySetup.threshold) {
      return null;
    }
    
    // 시드 구문 복구
    const shares = submittedShares.map((s) => s.share);
    const seed = this.recoverSeed(shares);
    
    return seed;
  }
  
  // 문자열을 16진수로 변환
  private static stringToHex(str: string): string {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
      hex += str.charCodeAt(i).toString(16);
    }
    return hex;
  }
  
  // 16진수를 문자열로 변환
  private static hexToString(hex: string): string {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      const charCode = parseInt(hex.substr(i, 2), 16);
      str += String.fromCharCode(charCode);
    }
    return str;
  }
  
  // 복구 ID 생성
  private static generateRecoveryId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  // 가디언에게 복구 요청 이메일 전송
  private static async sendRecoveryRequests(userEmail: string, recoveryId: string): Promise<void> {
    // 복구 설정 가져오기
    const recoverySetup = await this.getRecoverySetupByUserEmail(userEmail);
    
    // 가디언에게 이메일 전송
    for (const guardian of recoverySetup.guardians) {
      await this.sendRecoveryRequestEmail(guardian.email, userEmail, recoveryId, guardian.shareId);
    }
  }
  
  // 복구 요청 이메일 전송
  private static async sendRecoveryRequestEmail(guardianEmail: string, userEmail: string, recoveryId: string, shareId: number): Promise<void> {
    // 이메일 전송 로직
  }
  
  // 가디언 공유 저장
  private static async storeGuardianShare(recoveryId: string, guardianEmail: string, share: string): Promise<void> {
    // 공유 저장 로직
  }
  
  // 제출된 공유 가져오기
  private static async getSubmittedShares(recoveryId: string): Promise<{ email: string; share: string }[]> {
    // 제출된 공유 가져오기 로직
    return []; // 예시 코드
  }
  
  // 복구 설정 가져오기
  private static async getRecoverySetup(recoveryId: string): Promise<RecoverySetup> {
    // 복구 설정 가져오기 로직
    return {} as RecoverySetup; // 예시 코드
  }
  
  // 사용자 이메일로 복구 설정 가져오기
  private static async getRecoverySetupByUserEmail(userEmail: string): Promise<RecoverySetup> {
    // 사용자 이메일로 복구 설정 가져오기 로직
    return {} as RecoverySetup; // 예시 코드
  }
}

interface RecoverySetup {
  totalShares: number;
  threshold: number;
  guardians: Guardian[];
  createdAt: string;
}

interface Guardian {
  email: string;
  shareId: number;
  share: string;
}
```

## 8. 위협 모델 및 대응 전략

TORI 지갑은 다음과 같은 주요 위협에 대응하기 위한 전략을 구현하고 있습니다:

### 8.1 위협 모델

1. **개인 키 유출**: 사용자의 개인 키가 유출되면 모든 자산에 대한 접근 권한을 잃을 수 있습니다.
2. **피싱 공격**: 공격자가 가짜 지갑이나 웹사이트를 통해 사용자의 개인 키나 시드 구문을 탈취할 수 있습니다.
3. **맬웨어 공격**: 키로거나 스크린 캡처 맬웨어를 통해 사용자의 개인 키나 시드 구문을 탈취할 수 있습니다.
4. **중간자 공격**: 네트워크 통신을 가로채 사용자의 트랜잭션을 변조할 수 있습니다.
5. **서비스 거부 공격**: DDoS 공격을 통해 서비스를 사용할 수 없게 만들 수 있습니다.
6. **사회 공학 공격**: 사용자를 속여 개인 키나 시드 구문을 공유하도록 할 수 있습니다.
7. **스마트 계약 취약점**: 상호작용하는 스마트 계약에 취약점이 있을 수 있습니다.
8. **안전하지 않은 무작위성**: 안전하지 않은 무작위성으로 인해 예측 가능한 키 생성이 될 수 있습니다.

### 8.2 대응 전략

1. **개인 키 유출 대응**:
   - 암호화된 저장소 사용
   - 생체 인증 통합
   - 사회적 복구 메커니즘 제공
   - 2단계 인증 지원

2. **피싱 공격 대응**:
   - 도메인 확인
   - 보안 경고 표시
   - 사용자 교육

3. **맬웨어 공격 대응**:
   - 가상 키보드 제공
   - 화면 보안 마스킹
   - 시스템 무결성 확인

4. **중간자 공격 대응**:
   - HTTPS 사용
   - 인증서 핀닝
   - 트랜잭션 확인

5. **서비스 거부 공격 대응**:
   - 속도 제한
   - 캐싱
   - 다중 서버 설정

6. **사회 공학 공격 대응**:
   - 사용자 교육
   - 보안 팁 제공
   - 지갑 내 경고 표시

7. **스마트 계약 취약점 대응**:
   - 계약 코드 검사
   - 위험한 계약 경고
   - 의심스러운 트랜잭션 감지

8. **안전하지 않은 무작위성 대응**:
   - 안전한 난수 생성기 사용
   - 다중 엔트로피 소스 활용
   - 하드웨어 난수 생성기 통합

## 9. 보안 테스트 및 감사

TORI 지갑은 정기적인 보안 테스트 및 감사를 수행하여 보안을 강화합니다:

### 9.1 자동화된 보안 테스트

```typescript
// 자동화된 보안 테스트 예시 코드
// tests/security/encryption.test.ts

import { Encryption } from '../../src/services/crypto/encryption';

describe('Encryption Service', () => {
  const testData = 'Hello, TORI Wallet!';
  const testPassword = 'StrongPassword123!';
  
  test('encrypt and decrypt should work correctly', async () => {
    // 데이터 암호화
    const encrypted = await Encryption.encrypt(testData, testPassword);
    
    // 암호화된 데이터 복호화
    const decrypted = await Encryption.decrypt(encrypted, testPassword);
    
    // 원본 데이터와 복호화된 데이터 비교
    expect(decrypted).toBe(testData);
  });
  
  test('decrypt should fail with wrong password', async () => {
    // 데이터 암호화
    const encrypted = await Encryption.encrypt(testData, testPassword);
    
    // 잘못된 암호로 복호화 시도
    await expect(
      Encryption.decrypt(encrypted, 'WrongPassword123!')
    ).rejects.toThrow();
  });
  
  test('encrypted data should be in valid format', async () => {
    // 데이터 암호화
    const encrypted = await Encryption.encrypt(testData, testPassword);
    
    // 암호화된 데이터 형식 확인
    const encryptedData = JSON.parse(encrypted);
    
    expect(encryptedData).toHaveProperty('encrypted');
    expect(encryptedData).toHaveProperty('iv');
    expect(encryptedData).toHaveProperty('salt');
    expect(encryptedData).toHaveProperty('authTag');
    expect(encryptedData).toHaveProperty('algorithm');
    expect(encryptedData).toHaveProperty('kdf');
    expect(encryptedData).toHaveProperty('version');
  });
  
  test('should use secure algorithm', async () => {
    // 데이터 암호화
    const encrypted = await Encryption.encrypt(testData, testPassword);
    
    // 암호화된 데이터 형식 확인
    const encryptedData = JSON.parse(encrypted);
    
    // 안전한 알고리즘 확인
    expect(encryptedData.algorithm).toBe('aes-256-gcm');
    expect(encryptedData.kdf).toBe('scrypt');
  });
});
```

### 9.2 침투 테스트

정기적인 침투 테스트를 통해 보안 취약점을 발견하고 수정합니다:

1. **블랙박스 테스트**: 외부 공격자의 관점에서 지갑 애플리케이션의 보안 취약점을 탐색
2. **화이트박스 테스트**: 내부 소스 코드 및 구조에 대한 지식을 가지고 취약점 탐색
3. **그레이박스 테스트**: 일부 내부 정보를 가지고 취약점 탐색

### 9.3 제3자 보안 감사

외부 보안 전문가에 의한 정기적인 보안 감사를 수행하여 보안을 강화합니다:

1. **코드 감사**: 소스 코드의 보안 취약점 검토
2. **아키텍처 검토**: 전체 시스템 아키텍처의 보안 취약점 검토
3. **암호화 구현 검토**: 암호화 구현의 안전성 검토
4. **취약점 평가**: 발견된 취약점의 심각도 및 우선순위 평가
5. **수정 권장 사항**: 발견된 취약점의 수정 방법 제안

## 10. 보안 모범 사례

TORI 지갑은 다음과 같은 보안 모범 사례를 따릅니다:

### 10.1 개발 보안 모범 사례

1. **코드 리뷰**: 모든 코드는 다른 개발자의 리뷰를 받습니다.
2. **정적 코드 분석**: 자동화된 정적 코드 분석 도구를 사용하여 보안 취약점을 식별합니다.
3. **의존성 관리**: 모든 외부 의존성은 정기적으로 업데이트하고 보안 취약점을 확인합니다.
4. **안전한 기본값**: 모든 설정은 기본적으로 가장 안전한 옵션으로 설정됩니다.
5. **최소 권한 원칙**: 각 구성 요소는 필요한 최소한의 권한만 가집니다.

### 10.2 사용자 보안 모범 사례

TORI 지갑은 사용자에게 다음과 같은 보안 모범 사례를 권장합니다:

1. **강력한 암호 사용**: 최소 8자 이상, 대문자, 소문자, 숫자, 특수문자를 포함한 강력한 암호를 사용하세요.
2. **시드 구문 안전 보관**: 시드 구문을 안전한 장소에 보관하고, 온라인에 저장하지 마세요.
3. **2단계 인증 사용**: 가능하면 2단계 인증을 활성화하여 추가 보안 계층을 추가하세요.
4. **정기적인 백업**: 지갑을 정기적으로 백업하여 데이터 손실을 방지하세요.
5. **의심스러운 링크 주의**: 의심스러운 이메일이나 메시지의 링크를 클릭하지 마세요.
6. **공용 Wi-Fi 사용 주의**: 공용 Wi-Fi에서는 지갑 사용을 자제하세요.
7. **소프트웨어 업데이트**: 운영 체제 및 지갑 소프트웨어를 항상 최신 버전으로 유지하세요.
8. **사회적 복구 설정**: 사회적 복구 메커니즘을 설정하여 지갑 복구 옵션을 확장하세요.

## 11. 결론

TORI 지갑은 사용자의 암호화폐 자산을 안전하게 관리하기 위한 강력한 보안 아키텍처를 구현하고 있습니다. 키 관리, 인증 및 승인, 트랜잭션 보안, 네트워크 보안, 사회적 복구 등 다양한 보안 기능을 통해 사용자의 자산을 보호합니다. 정기적인 보안 테스트 및 감사, 보안 모범 사례 준수를 통해 지속적으로 보안을 강화하고 있습니다.
