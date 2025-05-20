/**
 * DeFi 서비스 인덱스 파일
 */

import { DefiService } from './defi-service';

export * from './defi-service';
export * from './liquidity-service';
export * from './farming-service';
export * from './lending-service';
export * from './price-service';
export * from './swap-service';

export default new DefiService();
