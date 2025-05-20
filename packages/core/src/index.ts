/**
 * core 패키지의 엔트리 포인트
 * 
 * 이 파일은 TORI 지갑의 핵심 기능을 내보내어 다른 패키지에서 사용할 수 있게 합니다.
 */

// 상수 내보내기
export * from './constants/networks';
export * from './constants/tokens';
export * from './constants/config';
export * from './constants/errors';

// 타입 내보내기
export * from './types/wallet';
export * from './types/transaction';
export * from './types/network';
export * from './types/nft';
export * from './types/staking';
export * from './types/dapp';

// 서비스 내보내기
// 암호화 서비스
export * from './services/crypto/keyring';
export * from './services/crypto/mnemonic';
export * from './services/crypto/hdkey';
export * from './services/crypto/encryption';
export * from './services/crypto/signature';

// 저장소 서비스
export * from './services/storage/storage-service';

// 지갑 서비스
export * from './services/wallet/wallet-service';

// 트랜잭션 서비스
export * from './services/transaction/transaction-service';

// 네트워크 서비스
export * from './services/network';

// 유틸리티 내보내기 (아직 구현되지 않음)
// export * from './utils/crypto';
// export * from './utils/formatters';
// 등등...

/**
 * 지갑 코어 버전
 */
export const VERSION = '1.0.0';

/**
 * 지갑 코어 라이브러리 초기화
 * 
 * @param config 초기화 설정
 * @returns 초기화 성공 여부
 */
export function initialize(config?: any): boolean {
  // 초기화 로직 구현 예정
  console.log('TORI Wallet Core initialized', config);
  
  return true;
}
