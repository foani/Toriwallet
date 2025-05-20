/**
 * hdkey.ts
 * 
 * 이 모듈은 계층 결정적 키(HD Key) 관리를 위한 유틸리티를 제공합니다.
 * BIP-32, BIP-44, BIP-49, BIP-84 표준을 기반으로 다양한 암호화폐의 키 파생 기능을 지원합니다.
 */

import { ethers } from 'ethers';
import { NetworkType } from '../../constants/networks';
import { ErrorCode, ToriWalletError } from '../../constants/errors';

// 코인 타입 열거 (BIP-44 표준)
export enum CoinType {
  BITCOIN = 0,
  TESTNET = 1,
  LITECOIN = 2,
  DOGECOIN = 3,
  ETHEREUM = 60,
  ETHEREUM_CLASSIC = 61,
  CREATA_ZENITH = 999, // 크리에타체인 제니스
  SOLANA = 501,
}

// 계정 목적 열거 (BIP-44 표준)
export enum Purpose {
  BIP44 = 44, // 레거시 주소 (P2PKH)
  BIP49 = 49, // 세그윗 호환 주소 (P2SH-P2WPKH)
  BIP84 = 84, // 네이티브 세그윗 주소 (P2WPKH)
}

// 키 타입 열거
export enum KeyType {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

// HD 노드 인터페이스
export interface HDNode {
  privateKey?: string;
  publicKey: string;
  chainCode: string;
  depth: number;
  index: number;
  parentFingerprint: string;
}

/**
 * 시드에서 마스터 키 생성
 * 
 * @param seed 시드 (16진수 문자열)
 * @returns HD 노드
 */
export function getMasterKeyFromSeed(seed: string): ethers.HDNodeWallet {
  try {
    return ethers.HDNodeWallet.fromSeed(Buffer.from(seed, 'hex'));
  } catch (error) {
    console.error('Failed to derive master key from seed', error);
    throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, 'Failed to derive master key from seed', error);
  }
}

/**
 * BIP-44 경로에서 키 파생
 * 
 * m / purpose' / coin_type' / account' / change / address_index
 * 
 * @param seed 시드 (16진수 문자열)
 * @param coinType 코인 타입
 * @param account 계정 인덱스
 * @param change 외부(0)/내부(1) 체인
 * @param addressIndex 주소 인덱스
 * @param purpose 목적 (BIP-44, BIP-49, BIP-84)
 * @returns HD 노드
 */
export function deriveBIP44(
  seed: string,
  coinType: CoinType,
  account: number = 0,
  change: number = 0,
  addressIndex: number = 0,
  purpose: Purpose = Purpose.BIP44
): ethers.HDNodeWallet {
  try {
    const masterKey = getMasterKeyFromSeed(seed);
    const path = `m/${purpose}'/${coinType}'/${account}'/${change}/${addressIndex}`;
    return masterKey.derivePath(path);
  } catch (error) {
    console.error(`Failed to derive BIP-44 key: ${error}`);
    throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, 'Failed to derive BIP-44 key', error);
  }
}

/**
 * 네트워크 유형에 따른 BIP-44 경로에서 키 파생
 * 
 * @param seed 시드 (16진수 문자열)
 * @param networkType 네트워크 유형
 * @param account 계정 인덱스
 * @param change 외부(0)/내부(1) 체인
 * @param addressIndex 주소 인덱스
 * @returns HD 노드
 */
export function deriveKeyFromNetwork(
  seed: string,
  networkType: NetworkType,
  account: number = 0,
  change: number = 0,
  addressIndex: number = 0
): ethers.HDNodeWallet {
  const coinType = getCoinTypeForNetwork(networkType);
  const purpose = getPurposeForNetwork(networkType);
  
  return deriveBIP44(seed, coinType, account, change, addressIndex, purpose);
}

/**
 * 네트워크 유형에 따른 기본 경로 가져오기
 * 
 * @param networkType 네트워크 유형
 * @param account 계정 인덱스
 * @param change 외부(0)/내부(1) 체인
 * @param addressIndex 주소 인덱스
 * @returns 파생 경로
 */
export function getPathForNetwork(
  networkType: NetworkType,
  account: number = 0,
  change: number = 0,
  addressIndex: number = 0
): string {
  const coinType = getCoinTypeForNetwork(networkType);
  const purpose = getPurposeForNetwork(networkType);
  
  return `m/${purpose}'/${coinType}'/${account}'/${change}/${addressIndex}`;
}

/**
 * 네트워크 유형에 따른 코인 타입 가져오기
 * 
 * @param networkType 네트워크 유형
 * @returns 코인 타입
 */
export function getCoinTypeForNetwork(networkType: NetworkType): CoinType {
  switch (networkType) {
    case NetworkType.ETHEREUM_MAINNET:
    case NetworkType.ETHEREUM_GOERLI:
    case NetworkType.BSC_MAINNET:
    case NetworkType.BSC_TESTNET:
    case NetworkType.POLYGON_MAINNET:
    case NetworkType.POLYGON_MUMBAI:
    case NetworkType.CATENA_MAINNET:
    case NetworkType.CATENA_TESTNET:
      return CoinType.ETHEREUM;
    case NetworkType.BITCOIN_MAINNET:
      return CoinType.BITCOIN;
    case NetworkType.BITCOIN_TESTNET:
      return CoinType.TESTNET;
    case NetworkType.SOLANA_MAINNET:
    case NetworkType.SOLANA_DEVNET:
      return CoinType.SOLANA;
    case NetworkType.ZENITH_MAINNET:
      return CoinType.CREATA_ZENITH;
    default:
      return CoinType.ETHEREUM;
  }
}

/**
 * 네트워크 유형에 따른 목적 가져오기
 * 
 * @param networkType 네트워크 유형
 * @returns 목적
 */
export function getPurposeForNetwork(networkType: NetworkType): Purpose {
  switch (networkType) {
    case NetworkType.BITCOIN_MAINNET:
    case NetworkType.BITCOIN_TESTNET:
      return Purpose.BIP84; // 네이티브 세그윗
    default:
      return Purpose.BIP44; // 기본 BIP-44
  }
}

/**
 * 개인 키에서 주소 생성
 * 
 * @param privateKey 개인 키 (16진수 문자열)
 * @param networkType 네트워크 유형
 * @returns 주소
 */
export function getAddressFromPrivateKey(privateKey: string, networkType: NetworkType): string {
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
      const wallet = new ethers.Wallet(privateKey);
      return wallet.address;
    }
    
    // 비트코인 네트워크 (외부 라이브러리 필요)
    if (
      networkType === NetworkType.BITCOIN_MAINNET ||
      networkType === NetworkType.BITCOIN_TESTNET
    ) {
      throw new Error('Bitcoin address derivation not implemented');
    }
    
    // 솔라나 네트워크 (외부 라이브러리 필요)
    if (
      networkType === NetworkType.SOLANA_MAINNET ||
      networkType === NetworkType.SOLANA_DEVNET
    ) {
      throw new Error('Solana address derivation not implemented');
    }
    
    // 제니스 체인 (외부 라이브러리 필요)
    if (networkType === NetworkType.ZENITH_MAINNET) {
      throw new Error('Zenith address derivation not implemented');
    }
    
    throw new Error(`Address derivation not supported for network: ${networkType}`);
  } catch (error) {
    console.error('Failed to derive address from private key', error);
    throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, 'Failed to derive address from private key', error);
  }
}

/**
 * 공개 키에서 주소 생성
 * 
 * @param publicKey 공개 키 (16진수 문자열)
 * @param networkType 네트워크 유형
 * @returns 주소
 */
export function getAddressFromPublicKey(publicKey: string, networkType: NetworkType): string {
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
      // ethers.js에서 공개 키에서 주소 생성
      const compressedPublicKey = publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`;
      return ethers.computeAddress(compressedPublicKey);
    }
    
    // 비트코인 네트워크 (외부 라이브러리 필요)
    if (
      networkType === NetworkType.BITCOIN_MAINNET ||
      networkType === NetworkType.BITCOIN_TESTNET
    ) {
      throw new Error('Bitcoin address derivation not implemented');
    }
    
    // 솔라나 네트워크 (외부 라이브러리 필요)
    if (
      networkType === NetworkType.SOLANA_MAINNET ||
      networkType === NetworkType.SOLANA_DEVNET
    ) {
      throw new Error('Solana address derivation not implemented');
    }
    
    // 제니스 체인 (외부 라이브러리 필요)
    if (networkType === NetworkType.ZENITH_MAINNET) {
      throw new Error('Zenith address derivation not implemented');
    }
    
    throw new Error(`Address derivation not supported for network: ${networkType}`);
  } catch (error) {
    console.error('Failed to derive address from public key', error);
    throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, 'Failed to derive address from public key', error);
  }
}

/**
 * 확장 키 직렬화
 * 
 * @param node HD 노드
 * @param type 키 타입 (private 또는 public)
 * @param isTestnet 테스트넷 여부
 * @returns 확장 키 (xprv 또는 xpub)
 */
export function serializeExtendedKey(
  node: ethers.HDNodeWallet,
  type: KeyType = KeyType.PRIVATE,
  isTestnet: boolean = false
): string {
  try {
    // 개인 키 직렬화 (xprv)
    if (type === KeyType.PRIVATE) {
      return node.extendedKey;
    }
    
    // 공개 키 직렬화 (xpub)
    return node.neuter().extendedKey;
  } catch (error) {
    console.error('Failed to serialize extended key', error);
    throw new ToriWalletError(ErrorCode.WALLET_EXPORT_FAILED, 'Failed to serialize extended key', error);
  }
}

/**
 * 확장 키 파싱
 * 
 * @param extendedKey 확장 키 (xprv 또는 xpub)
 * @returns HD 노드
 */
export function parseExtendedKey(extendedKey: string): ethers.HDNodeWallet {
  try {
    return ethers.HDNodeWallet.fromExtendedKey(extendedKey);
  } catch (error) {
    console.error('Failed to parse extended key', error);
    throw new ToriWalletError(ErrorCode.WALLET_IMPORT_FAILED, 'Failed to parse extended key', error);
  }
}

/**
 * 지갑 생성
 * 
 * @param seed 시드 (16진수 문자열)
 * @param networkType 네트워크 유형
 * @param account 계정 인덱스
 * @returns 지갑 객체
 */
export function createWalletFromSeed(
  seed: string,
  networkType: NetworkType,
  account: number = 0
): ethers.HDNodeWallet {
  try {
    const hdNode = deriveKeyFromNetwork(seed, networkType, account);
    return hdNode;
  } catch (error) {
    console.error('Failed to create wallet from seed', error);
    throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, 'Failed to create wallet from seed', error);
  }
}

/**
 * 자식 키 파생
 * 
 * @param parentNode 부모 HD 노드
 * @param index 인덱스
 * @param hardened 하드닝 여부
 * @returns 자식 HD 노드
 */
export function deriveChildKey(
  parentNode: ethers.HDNodeWallet,
  index: number,
  hardened: boolean = false
): ethers.HDNodeWallet {
  try {
    if (hardened) {
      // 하드닝된 파생 (인덱스 + 2^31)
      return parentNode.deriveChild(index + 0x80000000);
    } else {
      // 일반 파생
      return parentNode.deriveChild(index);
    }
  } catch (error) {
    console.error('Failed to derive child key', error);
    throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, 'Failed to derive child key', error);
  }
}

/**
 * 니모닉에서 직접 지갑 생성
 * 
 * @param mnemonic 니모닉 구문
 * @param path 파생 경로
 * @param passphrase 추가 패스프레이즈 (선택적)
 * @returns 지갑 객체
 */
export function createWalletFromMnemonic(
  mnemonic: string,
  path?: string,
  passphrase?: string
): ethers.HDNodeWallet {
  try {
    return ethers.Wallet.fromPhrase(mnemonic, path);
  } catch (error) {
    console.error('Failed to create wallet from mnemonic', error);
    throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, 'Failed to create wallet from mnemonic', error);
  }
}

/**
 * 개인 키에서 지갑 생성
 * 
 * @param privateKey 개인 키 (16진수 문자열)
 * @returns 지갑 객체
 */
export function createWalletFromPrivateKey(privateKey: string): ethers.Wallet {
  try {
    return new ethers.Wallet(privateKey);
  } catch (error) {
    console.error('Failed to create wallet from private key', error);
    throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, 'Failed to create wallet from private key', error);
  }
}

/**
 * 기본 내보내기
 */
export default {
  getMasterKeyFromSeed,
  deriveBIP44,
  deriveKeyFromNetwork,
  getPathForNetwork,
  getCoinTypeForNetwork,
  getPurposeForNetwork,
  getAddressFromPrivateKey,
  getAddressFromPublicKey,
  serializeExtendedKey,
  parseExtendedKey,
  createWalletFromSeed,
  deriveChildKey,
  createWalletFromMnemonic,
  createWalletFromPrivateKey,
  CoinType,
  Purpose,
  KeyType,
};
