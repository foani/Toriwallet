/**
 * network/index.ts
 * 
 * 이 모듈은 다양한 네트워크 API 및 서비스를 내보냅니다.
 * 다양한 블록체인 네트워크(Catena, Ethereum, Bitcoin, BSC, Polygon, Solana 등)와의
 * 통신을 위한, API 클래스 및 서비스를 제공합니다.
 */

// 메인 네트워크 서비스
export * from './network-service';

// 네트워크별 API
export * from './evm-api';
export * from './bitcoin-api';
export * from './solana-api';
export * from './zenith-api';

// 네트워크 타입 및 상수
export { NetworkType, NetworkInfo, NETWORKS } from '../../constants/networks';
