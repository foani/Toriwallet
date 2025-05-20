/**
 * signature.ts
 * 
 * 이 모듈은 다양한 블록체인 네트워크에서 메시지 및 트랜잭션 서명 기능을 제공합니다.
 * EIP-191, EIP-712 등의 표준 메시지 서명 형식도 지원합니다.
 */

import { ethers } from 'ethers';
import { NetworkType } from '../../constants/networks';
import { ErrorCode, ToriWalletError } from '../../constants/errors';

// 서명 타입 열거
export enum SignatureType {
  PERSONAL = 'PERSONAL',     // 개인 서명 (EIP-191)
  EIP712 = 'EIP712',         // 구조화된 데이터 서명 (EIP-712)
  RAW = 'RAW',               // 원시 서명
  TRANSACTION = 'TRANSACTION', // 트랜잭션 서명
  MESSAGE = 'MESSAGE',       // 일반 메시지 서명
}

// EIP-712 도메인 유형
export interface EIP712Domain {
  name?: string;             // 도메인 이름
  version?: string;          // 도메인 버전
  chainId?: number;          // 체인 ID
  verifyingContract?: string; // 검증 컨트랙트 주소
  salt?: string;             // 솔트
}

// EIP-712 타입 정의
export interface TypedData {
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  domain: EIP712Domain;
  message: Record<string, any>;
}

/**
 * 개인 메시지 서명 (EIP-191)
 * 
 * @param privateKey 개인 키
 * @param message 메시지
 * @returns 서명 문자열
 */
export async function signPersonalMessage(privateKey: string, message: string): Promise<string> {
  try {
    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signMessage(message);
  } catch (error) {
    console.error('Failed to sign personal message', error);
    throw new ToriWalletError(ErrorCode.AUTHENTICATION_FAILED, 'Failed to sign personal message', error);
  }
}

/**
 * 구조화된 데이터 서명 (EIP-712)
 * 
 * @param privateKey 개인 키
 * @param typedData 타입드 데이터
 * @returns 서명 문자열
 */
export async function signTypedData(privateKey: string, typedData: TypedData): Promise<string> {
  try {
    const wallet = new ethers.Wallet(privateKey);
    const domain = typedData.domain;
    const types = typedData.types;
    
    // EIP-712 타입에서 'EIP712Domain' 제거 (이미 domain 매개변수로 제공됨)
    const typesWithoutDomain = { ...types };
    delete typesWithoutDomain.EIP712Domain;
    
    // TypedData 서명
    return await wallet.signTypedData(
      domain,
      typesWithoutDomain,
      typedData.message
    );
  } catch (error) {
    console.error('Failed to sign typed data', error);
    throw new ToriWalletError(ErrorCode.AUTHENTICATION_FAILED, 'Failed to sign typed data', error);
  }
}

/**
 * 원시 메시지 서명
 * 
 * @param privateKey 개인 키
 * @param message 바이트 배열 또는 16진수 문자열
 * @returns 서명 문자열
 */
export function signRawMessage(privateKey: string, message: Uint8Array | string): string {
  try {
    const wallet = new ethers.Wallet(privateKey);
    
    // 메시지가 문자열인 경우 바이트 배열로 변환
    const messageBytes = typeof message === 'string'
      ? ethers.toBeArray(message.startsWith('0x') ? message : '0x' + message)
      : message;
    
    // 서명 생성
    const signingKey = new ethers.SigningKey(wallet.privateKey);
    const signatureObj = signingKey.sign(messageBytes);
    
    // 서명 직렬화
    return ethers.Signature.from(signatureObj).serialized;
  } catch (error) {
    console.error('Failed to sign raw message', error);
    throw new ToriWalletError(ErrorCode.AUTHENTICATION_FAILED, 'Failed to sign raw message', error);
  }
}

/**
 * 이더리움 트랜잭션 서명
 * 
 * @param privateKey 개인 키
 * @param transaction 트랜잭션 객체
 * @returns 서명된 트랜잭션
 */
export async function signEthereumTransaction(
  privateKey: string,
  transaction: ethers.TransactionRequest
): Promise<string> {
  try {
    const wallet = new ethers.Wallet(privateKey);
    return await wallet.signTransaction(transaction);
  } catch (error) {
    console.error('Failed to sign Ethereum transaction', error);
    throw new ToriWalletError(ErrorCode.TRANSACTION_FAILED, 'Failed to sign Ethereum transaction', error);
  }
}

/**
 * 메시지 서명
 * 
 * @param privateKey 개인 키
 * @param message 메시지
 * @param networkType 네트워크 유형
 * @param signatureType 서명 유형
 * @returns 서명 문자열
 */
export async function signMessage(
  privateKey: string,
  message: string,
  networkType: NetworkType,
  signatureType: SignatureType = SignatureType.PERSONAL
): Promise<string> {
  try {
    // 이더리움 계열 네트워크
    if (
      networkType === NetworkType.ETHEREUM_MAINNET ||
      networkType === NetworkType.ETHEREUM_GOERLI ||
      networkType === NetworkType.BSC_MAINNET ||
      networkType === NetworkType.BSC_TESTNET ||
      networkType === NetworkType.POLYGON_MAINNET ||
      networkType === NetworkType.POLYGON_MUMBAI ||
      networkType === NetworkType.CATENA_MAINNET ||
      networkType === NetworkType.CATENA_TESTNET
    ) {
      if (signatureType === SignatureType.PERSONAL) {
        return await signPersonalMessage(privateKey, message);
      } else if (signatureType === SignatureType.RAW) {
        return signRawMessage(privateKey, message);
      } else {
        throw new ToriWalletError(
          ErrorCode.UNSUPPORTED_OPERATION,
          `Signature type ${signatureType} not supported for Ethereum networks`
        );
      }
    }
    
    // 비트코인 네트워크
    if (
      networkType === NetworkType.BITCOIN_MAINNET ||
      networkType === NetworkType.BITCOIN_TESTNET
    ) {
      throw new ToriWalletError(
        ErrorCode.NOT_IMPLEMENTED,
        'Bitcoin message signing not implemented'
      );
    }
    
    // 솔라나 네트워크
    if (
      networkType === NetworkType.SOLANA_MAINNET ||
      networkType === NetworkType.SOLANA_DEVNET
    ) {
      throw new ToriWalletError(
        ErrorCode.NOT_IMPLEMENTED,
        'Solana message signing not implemented'
      );
    }
    
    // 제니스 체인
    if (networkType === NetworkType.ZENITH_MAINNET) {
      throw new ToriWalletError(
        ErrorCode.NOT_IMPLEMENTED,
        'Zenith message signing not implemented'
      );
    }
    
    throw new ToriWalletError(
      ErrorCode.UNSUPPORTED_NETWORK,
      `Network type ${networkType} not supported for message signing`
    );
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
 * @param privateKey 개인 키
 * @param transaction 트랜잭션 객체
 * @param networkType 네트워크 유형
 * @returns 서명된 트랜잭션
 */
export async function signTransaction(
  privateKey: string,
  transaction: any,
  networkType: NetworkType
): Promise<string> {
  try {
    // 이더리움 계열 네트워크
    if (
      networkType === NetworkType.ETHEREUM_MAINNET ||
      networkType === NetworkType.ETHEREUM_GOERLI ||
      networkType === NetworkType.BSC_MAINNET ||
      networkType === NetworkType.BSC_TESTNET ||
      networkType === NetworkType.POLYGON_MAINNET ||
      networkType === NetworkType.POLYGON_MUMBAI ||
      networkType === NetworkType.CATENA_MAINNET ||
      networkType === NetworkType.CATENA_TESTNET
    ) {
      return await signEthereumTransaction(privateKey, transaction);
    }
    
    // 비트코인 네트워크
    if (
      networkType === NetworkType.BITCOIN_MAINNET ||
      networkType === NetworkType.BITCOIN_TESTNET
    ) {
      throw new ToriWalletError(
        ErrorCode.NOT_IMPLEMENTED,
        'Bitcoin transaction signing not implemented'
      );
    }
    
    // 솔라나 네트워크
    if (
      networkType === NetworkType.SOLANA_MAINNET ||
      networkType === NetworkType.SOLANA_DEVNET
    ) {
      throw new ToriWalletError(
        ErrorCode.NOT_IMPLEMENTED,
        'Solana transaction signing not implemented'
      );
    }
    
    // 제니스 체인
    if (networkType === NetworkType.ZENITH_MAINNET) {
      throw new ToriWalletError(
        ErrorCode.NOT_IMPLEMENTED,
        'Zenith transaction signing not implemented'
      );
    }
    
    throw new ToriWalletError(
      ErrorCode.UNSUPPORTED_NETWORK,
      `Network type ${networkType} not supported for transaction signing`
    );
  } catch (error) {
    console.error('Failed to sign transaction', error);
    if (error instanceof ToriWalletError) {
      throw error;
    }
    throw new ToriWalletError(ErrorCode.TRANSACTION_FAILED, 'Failed to sign transaction', error);
  }
}

/**
 * 서명 검증 (이더리움 개인 메시지)
 * 
 * @param message 원본 메시지
 * @param signature 서명
 * @returns 서명자 주소
 */
export function verifyPersonalSignature(message: string, signature: string): string {
  try {
    return ethers.verifyMessage(message, signature);
  } catch (error) {
    console.error('Failed to verify personal signature', error);
    throw new ToriWalletError(ErrorCode.SECURITY_VALIDATION_FAILED, 'Failed to verify personal signature', error);
  }
}

/**
 * EIP-712 서명 검증
 * 
 * @param typedData 타입드 데이터
 * @param signature 서명
 * @returns 서명자 주소
 */
export function verifyTypedDataSignature(typedData: TypedData, signature: string): string {
  try {
    // 도메인 해시 계산
    const domain = typedData.domain;
    const types = typedData.types;
    
    // EIP-712 타입에서 'EIP712Domain' 제거 (이미 domain 매개변수로 제공됨)
    const typesWithoutDomain = { ...types };
    delete typesWithoutDomain.EIP712Domain;
    
    // 서명 복구
    return ethers.verifyTypedData(
      domain,
      typesWithoutDomain,
      typedData.message,
      signature
    );
  } catch (error) {
    console.error('Failed to verify typed data signature', error);
    throw new ToriWalletError(ErrorCode.SECURITY_VALIDATION_FAILED, 'Failed to verify typed data signature', error);
  }
}

/**
 * 트랜잭션 서명자 복구 (이더리움)
 * 
 * @param transaction 트랜잭션 객체
 * @param signature 서명
 * @param chainId 체인 ID
 * @returns 서명자 주소
 */
export function recoverTransactionSigner(
  transaction: ethers.TransactionLike,
  signature: string,
  chainId: number
): string {
  try {
    // 서명에서 트랜잭션 해시 계산
    const tx = ethers.Transaction.from({ ...transaction, signature });
    
    // 서명자 주소 복구
    return tx.from;
  } catch (error) {
    console.error('Failed to recover transaction signer', error);
    throw new ToriWalletError(ErrorCode.SECURITY_VALIDATION_FAILED, 'Failed to recover transaction signer', error);
  }
}

/**
 * RSV 형식에서 서명 객체 생성
 * 
 * @param r R 값
 * @param s S 값
 * @param v V 값
 * @returns 서명 문자열
 */
export function createSignatureFromRSV(r: string, s: string, v: number): string {
  try {
    const signature = ethers.Signature.from({
      r: r.startsWith('0x') ? r : '0x' + r,
      s: s.startsWith('0x') ? s : '0x' + s,
      v
    });
    
    return signature.serialized;
  } catch (error) {
    console.error('Failed to create signature from RSV', error);
    throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, 'Failed to create signature from RSV', error);
  }
}

/**
 * 서명 문자열에서 RSV 값 추출
 * 
 * @param signature 서명 문자열
 * @returns RSV 객체
 */
export function getSignatureRSV(signature: string): { r: string; s: string; v: number } {
  try {
    const sig = ethers.Signature.from(signature);
    return {
      r: sig.r,
      s: sig.s,
      v: sig.v
    };
  } catch (error) {
    console.error('Failed to get RSV from signature', error);
    throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, 'Failed to get RSV from signature', error);
  }
}

/**
 * 기본 내보내기
 */
export default {
  signPersonalMessage,
  signTypedData,
  signRawMessage,
  signEthereumTransaction,
  signMessage,
  signTransaction,
  verifyPersonalSignature,
  verifyTypedDataSignature,
  recoverTransactionSigner,
  createSignatureFromRSV,
  getSignatureRSV,
  SignatureType,
};
