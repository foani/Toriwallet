/**
 * 토큰 가격 관련 서비스
 * 
 * 실시간 토큰 가격, 변동률 등의 정보를 제공합니다.
 */

import { TokenPrice } from '../../types';
import { getProvider } from '../network/provider';

export class PriceService {
  /**
   * 특정 토큰의 가격 정보를 가져옵니다.
   * @param networkId 네트워크 ID
   * @param tokenAddress 토큰 주소
   * @returns 토큰 가격 정보
   */
  async getTokenPrice(networkId: string, tokenAddress: string): Promise<TokenPrice | null> {
    try {
      const provider = getProvider(networkId);
      
      // 테스트 데이터
      const mockPrices: { [key: string]: TokenPrice } = {
        '0x1234567890123456789012345678901234567890': {
          symbol: 'CTA',
          address: '0x1234567890123456789012345678901234567890',
          network: networkId,
          price: 2.05,
          priceChangePercentage24h: 3.2,
          priceChangePercentage7d: -1.5,
          priceChangePercentage30d: 8.7,
          lastUpdated: Date.now()
        },
        '0x0987654321098765432109876543210987654321': {
          symbol: 'ETH',
          address: '0x0987654321098765432109876543210987654321',
          network: networkId,
          price: 1900,
          priceChangePercentage24h: 1.8,
          priceChangePercentage7d: 5.2,
          priceChangePercentage30d: 12.5,
          lastUpdated: Date.now()
        },
        '0x5678901234567890123456789012345678901234': {
          symbol: 'USDT',
          address: '0x5678901234567890123456789012345678901234',
          network: networkId,
          price: 1,
          priceChangePercentage24h: 0.01,
          priceChangePercentage7d: -0.02,
          priceChangePercentage30d: 0.05,
          lastUpdated: Date.now()
        }
      };
      
      return mockPrices[tokenAddress.toLowerCase()] || null;
    } catch (error) {
      console.error('Error getting token price:', error);
      throw new Error('Failed to get token price');
    }
  }
  
  /**
   * 여러 토큰의 가격 정보를 한 번에 가져옵니다.
   * @param networkId 네트워크 ID
   * @param tokenAddresses 토큰 주소 배열
   * @returns 토큰 주소를 키로 하는 가격 정보 맵
   */
  async getTokenPrices(networkId: string, tokenAddresses: string[]): Promise<{ [address: string]: TokenPrice }> {
    try {
      const result: { [address: string]: TokenPrice } = {};
      
      for (const address of tokenAddresses) {
        const price = await this.getTokenPrice(networkId, address);
        if (price) {
          result[address.toLowerCase()] = price;
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error getting token prices:', error);
      throw new Error('Failed to get token prices');
    }
  }
  
  /**
   * 네트워크의 기본 토큰(네이티브 토큰) 가격을 가져옵니다.
   * @param networkId 네트워크 ID
   * @returns 토큰 가격 정보
   */
  async getNativeTokenPrice(networkId: string): Promise<TokenPrice | null> {
    try {
      const provider = getProvider(networkId);
      
      // 네트워크별 네이티브 토큰 주소 매핑
      const nativeTokenAddresses: { [key: string]: string } = {
        'catena-mainnet': '0x1234567890123456789012345678901234567890', // CTA
        'zenith-mainnet': '0xabcdef1234567890abcdef1234567890abcdef12', // ZNT
        'ethereum-mainnet': '0x0987654321098765432109876543210987654321', // ETH
        'binance-smart-chain': '0x456789abcdef0123456789abcdef0123456789', // BNB
        'polygon-mainnet': '0x789abcdef0123456789abcdef0123456789abcde' // MATIC
      };
      
      const nativeAddress = nativeTokenAddresses[networkId];
      if (!nativeAddress) {
        return null;
      }
      
      return await this.getTokenPrice(networkId, nativeAddress);
    } catch (error) {
      console.error('Error getting native token price:', error);
      throw new Error('Failed to get native token price');
    }
  }
  
  /**
   * 토큰의 가격 변동 내역을 가져옵니다.
   * @param networkId 네트워크 ID
   * @param tokenAddress 토큰 주소
   * @param days 기간(일)
   * @returns 가격 변동 내역
   */
  async getPriceHistory(
    networkId: string,
    tokenAddress: string,
    days: number
  ): Promise<{ timestamp: number; price: number }[]> {
    try {
      const provider = getProvider(networkId);
      const now = Date.now();
      
      // 테스트 데이터 생성
      const mockHistory: { timestamp: number; price: number }[] = [];
      
      // 초기 가격 설정 (현재 가격)
      let basePrice = 0;
      
      if (tokenAddress.toLowerCase() === '0x1234567890123456789012345678901234567890'.toLowerCase()) {
        basePrice = 2.05; // CTA
      } else if (tokenAddress.toLowerCase() === '0x0987654321098765432109876543210987654321'.toLowerCase()) {
        basePrice = 1900; // ETH
      } else if (tokenAddress.toLowerCase() === '0x5678901234567890123456789012345678901234'.toLowerCase()) {
        basePrice = 1; // USDT
      } else {
        basePrice = 10; // 기본값
      }
      
      // 기간 내 가격 변동 생성
      for (let i = days; i >= 0; i--) {
        const timestamp = now - (i * 24 * 60 * 60 * 1000);
        
        // 가격 변동 시뮬레이션 (랜덤 변동)
        const volatility = tokenAddress.toLowerCase() === '0x5678901234567890123456789012345678901234'.toLowerCase() ? 0.001 : 0.02;
        const change = basePrice * volatility * (Math.random() * 2 - 1);
        const price = basePrice + (basePrice * change);
        
        mockHistory.push({
          timestamp,
          price
        });
        
        // 가격 업데이트
        basePrice = price;
      }
      
      return mockHistory;
    } catch (error) {
      console.error('Error getting price history:', error);
      throw new Error('Failed to get price history');
    }
  }
}
