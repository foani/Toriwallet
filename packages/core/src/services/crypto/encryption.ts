/**
 * encryption.ts
 * 
 * 이 모듈은 TORI 지갑에서 사용되는 다양한 암호화 및 보안 기능을 제공합니다.
 * 데이터 암호화/복호화, 키 파생, 해싱 등의 기능이 포함됩니다.
 */

import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { ErrorCode, ToriWalletError } from '../../constants/errors';
import { CRYPTO_CONFIG } from '../../constants/config';

// 암호화 버전
export const ENCRYPTION_VERSION = '1';

// 암호화 옵션 인터페이스
export interface EncryptionOptions {
  saltLength?: number;         // 솔트 길이
  ivLength?: number;           // 초기화 벡터 길이
  keyLength?: number;          // 키 길이
  iterations?: number;         // 반복 횟수
  algorithm?: string;          // 알고리즘
}

// 암호화된 데이터 인터페이스
export interface EncryptedData {
  version: string;             // 암호화 버전
  data: string;                // 암호화된 데이터
  salt: string;                // 솔트
  iv: string;                  // 초기화 벡터
  iterations: number;          // 반복 횟수
  algorithm: string;           // 알고리즘
  mac?: string;                // 메시지 인증 코드 (선택적)
  tag?: string;                // 인증 태그 (GCM 모드에서 사용)
}

// 키 파생 결과 인터페이스
export interface DerivedKeyResult {
  key: CryptoJS.lib.WordArray;  // 파생된 키
  salt: string;                // 솔트
}

/**
 * 패스워드 기반 키 파생 함수
 * 
 * @param password 비밀번호
 * @param salt 솔트 (제공되지 않으면 자동 생성)
 * @param options 암호화 옵션
 * @returns 파생된 키 결과
 */
export function deriveKey(
  password: string,
  salt?: string,
  options?: EncryptionOptions
): DerivedKeyResult {
  try {
    const opt = {
      saltLength: CRYPTO_CONFIG.saltLength,
      keyLength: CRYPTO_CONFIG.keyLength,
      iterations: CRYPTO_CONFIG.iterations,
      ...options,
    };

    // 솔트가 없으면 생성
    const usedSalt = salt || CryptoJS.lib.WordArray.random(opt.saltLength).toString(CryptoJS.enc.Hex);
    
    // PBKDF2를 사용하여 키 파생
    const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(usedSalt), {
      keySize: opt.keyLength / 32,
      iterations: opt.iterations,
    });
    
    return {
      key,
      salt: usedSalt,
    };
  } catch (error) {
    console.error('Failed to derive key', error);
    throw new ToriWalletError(ErrorCode.AUTHENTICATION_FAILED, 'Failed to derive key', error);
  }
}

/**
 * 데이터 암호화
 * 
 * @param plaintext 평문 데이터
 * @param password 비밀번호
 * @param options 암호화 옵션
 * @returns 암호화된 데이터
 */
export function encrypt(
  plaintext: string,
  password: string,
  options?: EncryptionOptions
): EncryptedData {
  try {
    const opt = {
      saltLength: CRYPTO_CONFIG.saltLength,
      ivLength: CRYPTO_CONFIG.ivLength,
      keyLength: CRYPTO_CONFIG.keyLength,
      iterations: CRYPTO_CONFIG.iterations,
      algorithm: CRYPTO_CONFIG.algorithm,
      ...options,
    };
    
    // 키 파생
    const { key, salt } = deriveKey(password, undefined, opt);
    
    // 초기화 벡터 생성
    const iv = CryptoJS.lib.WordArray.random(opt.ivLength).toString(CryptoJS.enc.Hex);
    
    // 암호화 알고리즘에 따른 처리
    let ciphertext: string;
    let tag: string | undefined;
    
    if (opt.algorithm === 'aes-256-gcm') {
      // GCM 모드 (인증된 암호화)
      // 참고: CryptoJS는 GCM 모드를 직접 지원하지 않음
      // 외부 라이브러리 사용 또는 다른 알고리즘으로 대체 필요
      throw new ToriWalletError(
        ErrorCode.NOT_IMPLEMENTED,
        'GCM mode is not directly supported by CryptoJS'
      );
    } else {
      // 기본 CBC 모드
      const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      
      ciphertext = encrypted.toString();
      
      // MAC 계산 (HMAC-SHA256)
      const mac = CryptoJS.HmacSHA256(ciphertext, key).toString();
      
      return {
        version: ENCRYPTION_VERSION,
        data: ciphertext,
        salt,
        iv,
        iterations: opt.iterations,
        algorithm: 'aes-256-cbc', // 실제 사용된 알고리즘
        mac,
      };
    }
  } catch (error) {
    console.error('Encryption failed', error);
    throw new ToriWalletError(ErrorCode.STORAGE_WRITE_FAILED, 'Encryption failed', error);
  }
}

/**
 * 데이터 복호화
 * 
 * @param encryptedData 암호화된 데이터
 * @param password 비밀번호
 * @returns 복호화된 데이터
 */
export function decrypt(encryptedData: EncryptedData, password: string): string {
  try {
    // 키 파생
    const { key } = deriveKey(password, encryptedData.salt, {
      keyLength: CRYPTO_CONFIG.keyLength,
      iterations: encryptedData.iterations,
    });
    
    // MAC 검증 (있는 경우)
    if (encryptedData.mac) {
      const calculatedMac = CryptoJS.HmacSHA256(encryptedData.data, key).toString();
      
      if (calculatedMac !== encryptedData.mac) {
        throw new ToriWalletError(ErrorCode.INVALID_PASSWORD, 'MAC verification failed');
      }
    }
    
    // 알고리즘에 따른 복호화
    if (encryptedData.algorithm === 'aes-256-cbc' || encryptedData.algorithm === 'aes-256-gcm') {
      const decrypted = CryptoJS.AES.decrypt(encryptedData.data, key, {
        iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      
      // UTF-8 문자열로 변환
      return decrypted.toString(CryptoJS.enc.Utf8);
    } else {
      throw new ToriWalletError(
        ErrorCode.NOT_IMPLEMENTED,
        `Unsupported algorithm: ${encryptedData.algorithm}`
      );
    }
  } catch (error) {
    console.error('Decryption failed', error);
    
    // 오류 유형에 따른 처리
    if (error instanceof ToriWalletError) {
      throw error;
    } else {
      throw new ToriWalletError(ErrorCode.INVALID_PASSWORD, 'Decryption failed', error);
    }
  }
}

/**
 * 객체 암호화
 * 
 * @param object 암호화할 객체
 * @param password 비밀번호
 * @param options 암호화 옵션
 * @returns 암호화된 데이터
 */
export function encryptObject<T>(
  object: T,
  password: string,
  options?: EncryptionOptions
): EncryptedData {
  try {
    const plaintext = JSON.stringify(object);
    return encrypt(plaintext, password, options);
  } catch (error) {
    console.error('Object encryption failed', error);
    throw new ToriWalletError(ErrorCode.STORAGE_WRITE_FAILED, 'Object encryption failed', error);
  }
}

/**
 * 객체 복호화
 * 
 * @param encryptedData 암호화된 데이터
 * @param password 비밀번호
 * @returns 복호화된 객체
 */
export function decryptObject<T>(encryptedData: EncryptedData, password: string): T {
  try {
    const plaintext = decrypt(encryptedData, password);
    return JSON.parse(plaintext) as T;
  } catch (error) {
    console.error('Object decryption failed', error);
    
    // JSON 파싱 오류 처리
    if (error instanceof SyntaxError) {
      throw new ToriWalletError(ErrorCode.STORAGE_CORRUPT, 'Corrupted data: Invalid JSON', error);
    }
    
    // 다른 오류 전달
    if (error instanceof ToriWalletError) {
      throw error;
    } else {
      throw new ToriWalletError(ErrorCode.STORAGE_READ_FAILED, 'Object decryption failed', error);
    }
  }
}

/**
 * SHA-256 해시 생성
 * 
 * @param data 해시할 데이터
 * @returns 해시 값 (16진수 문자열)
 */
export function sha256(data: string): string {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
}

/**
 * SHA-512 해시 생성
 * 
 * @param data 해시할 데이터
 * @returns 해시 값 (16진수 문자열)
 */
export function sha512(data: string): string {
  return CryptoJS.SHA512(data).toString(CryptoJS.enc.Hex);
}

/**
 * RIPEMD-160 해시 생성
 * 
 * @param data 해시할 데이터
 * @returns 해시 값 (16진수 문자열)
 */
export function ripemd160(data: string): string {
  return CryptoJS.RIPEMD160(data).toString(CryptoJS.enc.Hex);
}

/**
 * HMAC-SHA256 생성
 * 
 * @param data 인증할 데이터
 * @param key 키
 * @returns HMAC 값 (16진수 문자열)
 */
export function hmacSha256(data: string, key: string): string {
  return CryptoJS.HmacSHA256(data, key).toString(CryptoJS.enc.Hex);
}

/**
 * 무작위 바이트 생성
 * 
 * @param length 생성할 바이트 수
 * @returns 16진수 문자열
 */
export function randomBytes(length: number): string {
  return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
}

/**
 * UUID 생성
 * 
 * @returns UUID v4
 */
export function generateUUID(): string {
  return uuidv4();
}

/**
 * 개인 키를 위한 난수 생성
 * 
 * @returns 개인 키 (16진수 문자열)
 */
export function generatePrivateKey(): string {
  // 32바이트(256비트) 무작위 생성
  return randomBytes(32);
}

/**
 * 비밀번호 강도 확인
 * 
 * @param password 비밀번호
 * @returns 점수 (1-5, 높을수록 강함)
 */
export function checkPasswordStrength(password: string): number {
  // 비밀번호 길이에 따른 기본 점수
  let score = 0;
  
  // 길이 확인
  if (password.length >= 8) { score += 1; }
  if (password.length >= 12) { score += 1; }
  
  // 복잡성 확인
  if (/[a-z]/.test(password)) { score += 0.5; } // 소문자
  if (/[A-Z]/.test(password)) { score += 0.5; } // 대문자
  if (/[0-9]/.test(password)) { score += 0.5; } // 숫자
  if (/[^a-zA-Z0-9]/.test(password)) { score += 0.5; } // 특수 문자
  
  // 엔트로피 증가에 따른 추가 점수
  const entropy = calculateEntropy(password);
  if (entropy >= 60) { score += 0.5; }
  if (entropy >= 80) { score += 0.5; }
  
  // 점수 범위 조정 (1-5)
  return Math.min(5, Math.max(1, Math.floor(score)));
}

/**
 * 비밀번호 엔트로피 계산
 * 
 * @param password 비밀번호
 * @returns 엔트로피 (비트)
 */
export function calculateEntropy(password: string): number {
  // 문자 집합 크기 계산
  let charsetSize = 0;
  if (/[a-z]/.test(password)) { charsetSize += 26; } // 소문자
  if (/[A-Z]/.test(password)) { charsetSize += 26; } // 대문자
  if (/[0-9]/.test(password)) { charsetSize += 10; } // 숫자
  if (/[^a-zA-Z0-9]/.test(password)) { charsetSize += 33; } // 특수 문자 (일반적인 키보드 기준)
  
  // 엔트로피 = 길이 * log2(문자 집합 크기)
  return password.length * Math.log2(Math.max(2, charsetSize));
}

/**
 * 비밀번호 해싱 (키 스트레칭 적용)
 * 
 * @param password 비밀번호
 * @param salt 솔트 (제공되지 않으면 자동 생성)
 * @param iterations 반복 횟수
 * @returns 해시된 비밀번호 정보
 */
export function hashPassword(
  password: string,
  salt?: string,
  iterations: number = CRYPTO_CONFIG.iterations
): { hash: string; salt: string; iterations: number } {
  // 키 파생
  const { key, salt: usedSalt } = deriveKey(password, salt, { iterations });
  
  return {
    hash: key.toString(CryptoJS.enc.Hex),
    salt: usedSalt,
    iterations,
  };
}

/**
 * 비밀번호 검증
 * 
 * @param password 검증할 비밀번호
 * @param hash 저장된 해시
 * @param salt 저장된 솔트
 * @param iterations 반복 횟수
 * @returns 비밀번호 일치 여부
 */
export function verifyPassword(
  password: string,
  hash: string,
  salt: string,
  iterations: number = CRYPTO_CONFIG.iterations
): boolean {
  // 키 파생
  const { key } = deriveKey(password, salt, { iterations });
  
  // 해시 비교
  return key.toString(CryptoJS.enc.Hex) === hash;
}

/**
 * 기본 내보내기
 */
export default {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  deriveKey,
  sha256,
  sha512,
  ripemd160,
  hmacSha256,
  randomBytes,
  generateUUID,
  generatePrivateKey,
  checkPasswordStrength,
  calculateEntropy,
  hashPassword,
  verifyPassword,
  ENCRYPTION_VERSION,
};
