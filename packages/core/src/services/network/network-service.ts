/**
 * network-service.ts
 * 
 * 이 모듈은 다양한 블록체인 네트워크와의 통신을 관리하는 서비스를 제공합니다.
 * 다양한 블록체인 네트워크(Catena, Ethereum, Bitcoin, BSC, Polygon, Solana 등)에 대한
 * 연결 관리, 잔액 조회, 트랜잭션 전송 등의 기능을 제공합니다.
 */

import { ethers } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { NetworkInfo, NetworkType, NETWORKS } from '../../constants/networks';
import { ToriError, ErrorCode } from '../../constants/errors';

/**
 * 네트워크 서비스 클래스
 * 블록체인 네트워크와의 통신을 관리합니다.
 */
export class NetworkService {
  private providers: Map<NetworkType, any> = new Map();
  private currentNetwork: NetworkInfo;

  /**
   * NetworkService 생성자
   * @param initialNetwork 초기 네트워크 (기본값: CATENA_MAINNET)
   */
  constructor(initialNetworkType: NetworkType = NetworkType.CATENA_MAINNET) {
    this.currentNetwork = NETWORKS[initialNetworkType];
    this.initializeProvider(initialNetworkType);
  }

  /**
   * 네트워크 공급자 초기화
   * @param networkType 네트워크 유형
   * @returns Promise<void>
   */
  private async initializeProvider(networkType: NetworkType): Promise<void> {
    if (this.providers.has(networkType)) {
      return;
    }

    const networkInfo = NETWORKS[networkType];
    
    if (!networkInfo) {
      throw new ToriError(ErrorCode.NETWORK_NOT_SUPPORTED, `Network ${networkType} is not supported`);
    }

    try {
      let provider;

      // 네트워크 유형에 따라 다른 공급자 생성
      if (networkInfo.isEVM) {
        // EVM 호환 체인 (Catena, Ethereum, BSC, Polygon 등)
        provider = new ethers.JsonRpcProvider(networkInfo.rpcUrl);
      } else if (networkType === NetworkType.BITCOIN_MAINNET || networkType === NetworkType.BITCOIN_TESTNET) {
        // Bitcoin 네트워크는 별도 처리 필요
        // 참고: 실제 구현 시 비트코인 라이브러리(bitcoinjs-lib 등) 사용
        provider = { type: 'bitcoin', url: networkInfo.rpcUrl };
      } else if (networkType === NetworkType.SOLANA_MAINNET || networkType === NetworkType.SOLANA_DEVNET) {
        // Solana 네트워크는 별도 처리 필요
        // 참고: 실제 구현 시 솔라나 라이브러리(@solana/web3.js 등) 사용
        provider = { type: 'solana', url: networkInfo.rpcUrl };
      } else if (networkType === NetworkType.ZENITH_MAINNET) {
        // Zenith 체인은 별도 처리 필요
        provider = { type: 'zenith', url: networkInfo.rpcUrl };
      } else {
        throw new ToriError(ErrorCode.NETWORK_NOT_SUPPORTED, `Network ${networkType} is not supported`);
      }

      this.providers.set(networkType, provider);
    } catch (error) {
      throw new ToriError(
        ErrorCode.NETWORK_CONNECTION_ERROR,
        `Failed to connect to network ${networkType}: ${error.message}`
      );
    }
  }

  /**
   * 현재 네트워크 변경
   * @param networkType 변경할 네트워크 유형
   * @returns Promise<void>
   */
  public async switchNetwork(networkType: NetworkType): Promise<void> {
    if (!NETWORKS[networkType]) {
      throw new ToriError(ErrorCode.NETWORK_NOT_SUPPORTED, `Network ${networkType} is not supported`);
    }

    await this.initializeProvider(networkType);
    this.currentNetwork = NETWORKS[networkType];
  }

  /**
   * 현재 네트워크 정보 가져오기
   * @returns NetworkInfo
   */
  public getCurrentNetwork(): NetworkInfo {
    return this.currentNetwork;
  }

  /**
   * 현재 네트워크의 Provider 가져오기
   * @returns Provider
   */
  public getProvider(): any {
    return this.providers.get(this.currentNetwork.type);
  }

  /**
   * 특정 네트워크의 Provider 가져오기
   * @param networkType 네트워크 유형
   * @returns Provider
   */
  public getProviderForNetwork(networkType: NetworkType): any {
    if (!this.providers.has(networkType)) {
      this.initializeProvider(networkType);
    }
    return this.providers.get(networkType);
  }

  /**
   * 네트워크 연결 테스트
   * @returns Promise<boolean> 연결 성공 여부
   */
  public async testConnection(): Promise<boolean> {
    try {
      const provider = this.getProvider();
      
      if (this.currentNetwork.isEVM) {
        // EVM 호환 체인의 경우 블록 번호 조회로 연결 테스트
        await provider.getBlockNumber();
      } else if (this.currentNetwork.type === NetworkType.BITCOIN_MAINNET || 
                this.currentNetwork.type === NetworkType.BITCOIN_TESTNET) {
        // Bitcoin 네트워크는 별도 테스트 로직 필요
        // 실제 구현 필요
      } else if (this.currentNetwork.type === NetworkType.SOLANA_MAINNET || 
                 this.currentNetwork.type === NetworkType.SOLANA_DEVNET) {
        // Solana 네트워크는 별도 테스트 로직 필요
        // 실제 구현 필요
      } else if (this.currentNetwork.type === NetworkType.ZENITH_MAINNET) {
        // Zenith 체인은 별도 테스트 로직 필요
        // 실제 구현 필요
      }
      
      return true;
    } catch (error) {
      console.error(`Connection test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * 주소의 네이티브 토큰 잔액 조회
   * @param address 지갑 주소
   * @returns Promise<string> 잔액 (문자열 형태)
   */
  public async getBalance(address: string): Promise<string> {
    try {
      const provider = this.getProvider();

      if (this.currentNetwork.isEVM) {
        // EVM 호환 체인의 경우
        const balance = await provider.getBalance(address);
        return ethers.formatUnits(balance, this.currentNetwork.decimals);
      } else if (this.currentNetwork.type === NetworkType.BITCOIN_MAINNET || 
                this.currentNetwork.type === NetworkType.BITCOIN_TESTNET) {
        // Bitcoin 네트워크는 별도 잔액 조회 로직 필요
        // 실제 구현 필요
        return '0';
      } else if (this.currentNetwork.type === NetworkType.SOLANA_MAINNET || 
                 this.currentNetwork.type === NetworkType.SOLANA_DEVNET) {
        // Solana 네트워크는 별도 잔액 조회 로직 필요
        // 실제 구현 필요
        return '0';
      } else if (this.currentNetwork.type === NetworkType.ZENITH_MAINNET) {
        // Zenith 체인은 별도 잔액 조회 로직 필요
        // 실제 구현 필요
        return '0';
      }

      throw new ToriError(
        ErrorCode.NETWORK_NOT_SUPPORTED,
        `Balance check not implemented for network ${this.currentNetwork.type}`
      );
    } catch (error) {
      throw new ToriError(
        ErrorCode.NETWORK_REQUEST_FAILED,
        `Failed to get balance: ${error.message}`
      );
    }
  }

  /**
   * 트랜잭션 상태 확인
   * @param txHash 트랜잭션 해시
   * @returns Promise<boolean> 트랜잭션 성공 여부
   */
  public async getTransactionStatus(txHash: string): Promise<boolean> {
    try {
      const provider = this.getProvider();

      if (this.currentNetwork.isEVM) {
        // EVM 호환 체인의 경우
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) {
          return false; // 아직 처리되지 않음
        }
        return receipt.status === 1; // 1: 성공, 0: 실패
      } else if (this.currentNetwork.type === NetworkType.BITCOIN_MAINNET || 
                this.currentNetwork.type === NetworkType.BITCOIN_TESTNET) {
        // Bitcoin 네트워크는 별도 트랜잭션 상태 확인 로직 필요
        // 실제 구현 필요
        return false;
      } else if (this.currentNetwork.type === NetworkType.SOLANA_MAINNET || 
                 this.currentNetwork.type === NetworkType.SOLANA_DEVNET) {
        // Solana 네트워크는 별도 트랜잭션 상태 확인 로직 필요
        // 실제 구현 필요
        return false;
      } else if (this.currentNetwork.type === NetworkType.ZENITH_MAINNET) {
        // Zenith 체인은 별도 트랜잭션 상태 확인 로직 필요
        // 실제 구현 필요
        return false;
      }

      throw new ToriError(
        ErrorCode.NETWORK_NOT_SUPPORTED,
        `Transaction status check not implemented for network ${this.currentNetwork.type}`
      );
    } catch (error) {
      throw new ToriError(
        ErrorCode.NETWORK_REQUEST_FAILED,
        `Failed to get transaction status: ${error.message}`
      );
    }
  }

  /**
   * 현재 가스 가격 조회 (EVM 호환 체인 전용)
   * @returns Promise<string> 가스 가격 (Gwei 단위)
   */
  public async getGasPrice(): Promise<string> {
    try {
      if (!this.currentNetwork.isEVM) {
        throw new ToriError(
          ErrorCode.NETWORK_NOT_SUPPORTED,
          `Gas price not applicable for non-EVM network ${this.currentNetwork.type}`
        );
      }

      const provider = this.getProvider();
      const gasPrice = await provider.getFeeData();
      
      // gasPrice는 wei 단위로 반환됨, Gwei로 변환
      return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei');
    } catch (error) {
      throw new ToriError(
        ErrorCode.NETWORK_REQUEST_FAILED,
        `Failed to get gas price: ${error.message}`
      );
    }
  }

  /**
   * 네트워크 체인 ID 조회 (EVM 호환 체인 전용)
   * @returns Promise<number> 체인 ID
   */
  public async getChainId(): Promise<number> {
    try {
      if (!this.currentNetwork.isEVM) {
        // Non-EVM 체인은 체인 ID 개념이 없거나 다를 수 있음
        return 0;
      }

      const provider = this.getProvider();
      const network = await provider.getNetwork();
      return Number(network.chainId);
    } catch (error) {
      throw new ToriError(
        ErrorCode.NETWORK_REQUEST_FAILED,
        `Failed to get chain ID: ${error.message}`
      );
    }
  }

  /**
   * 트랜잭션 조회
   * @param txHash 트랜잭션 해시
   * @returns Promise<any> 트랜잭션 정보
   */
  public async getTransaction(txHash: string): Promise<any> {
    try {
      const provider = this.getProvider();

      if (this.currentNetwork.isEVM) {
        // EVM 호환 체인의 경우
        return await provider.getTransaction(txHash);
      } else if (this.currentNetwork.type === NetworkType.BITCOIN_MAINNET || 
                this.currentNetwork.type === NetworkType.BITCOIN_TESTNET) {
        // Bitcoin 네트워크는 별도 트랜잭션 조회 로직 필요
        // 실제 구현 필요
        return null;
      } else if (this.currentNetwork.type === NetworkType.SOLANA_MAINNET || 
                 this.currentNetwork.type === NetworkType.SOLANA_DEVNET) {
        // Solana 네트워크는 별도 트랜잭션 조회 로직 필요
        // 실제 구현 필요
        return null;
      } else if (this.currentNetwork.type === NetworkType.ZENITH_MAINNET) {
        // Zenith 체인은 별도 트랜잭션 조회 로직 필요
        // 실제 구현 필요
        return null;
      }

      throw new ToriError(
        ErrorCode.NETWORK_NOT_SUPPORTED,
        `Transaction retrieval not implemented for network ${this.currentNetwork.type}`
      );
    } catch (error) {
      throw new ToriError(
        ErrorCode.NETWORK_REQUEST_FAILED,
        `Failed to get transaction: ${error.message}`
      );
    }
  }

  /**
   * 계정의 논스 조회 (EVM 호환 체인 전용)
   * @param address 계정 주소
   * @returns Promise<number> 논스
   */
  public async getNonce(address: string): Promise<number> {
    try {
      if (!this.currentNetwork.isEVM) {
        throw new ToriError(
          ErrorCode.NETWORK_NOT_SUPPORTED,
          `Nonce not applicable for non-EVM network ${this.currentNetwork.type}`
        );
      }

      const provider = this.getProvider();
      return await provider.getTransactionCount(address);
    } catch (error) {
      throw new ToriError(
        ErrorCode.NETWORK_REQUEST_FAILED,
        `Failed to get nonce: ${error.message}`
      );
    }
  }

  /**
   * 트랜잭션 브로드캐스트 (EVM 호환 체인 전용)
   * @param signedTx 서명된 트랜잭션
   * @returns Promise<string> 트랜잭션 해시
   */
  public async broadcastTransaction(signedTx: string): Promise<string> {
    try {
      if (!this.currentNetwork.isEVM) {
        throw new ToriError(
          ErrorCode.NETWORK_NOT_SUPPORTED,
          `Transaction broadcast not implemented for network ${this.currentNetwork.type}`
        );
      }

      const provider = this.getProvider();
      const tx = await provider.broadcastTransaction(signedTx);
      return tx.hash;
    } catch (error) {
      throw new ToriError(
        ErrorCode.TRANSACTION_BROADCAST_FAILED,
        `Failed to broadcast transaction: ${error.message}`
      );
    }
  }

  /**
   * 토큰 잔액 조회 (EVM 호환 체인의 ERC20 토큰)
   * @param tokenAddress 토큰 계약 주소
   * @param walletAddress 지갑 주소
   * @param decimals 토큰 소수점 자리수
   * @returns Promise<string> 토큰 잔액
   */
  public async getTokenBalance(
    tokenAddress: string,
    walletAddress: string,
    decimals: number = 18
  ): Promise<string> {
    try {
      if (!this.currentNetwork.isEVM) {
        throw new ToriError(
          ErrorCode.NETWORK_NOT_SUPPORTED,
          `Token balance check not implemented for network ${this.currentNetwork.type}`
        );
      }

      // ERC20 토큰 표준 인터페이스의 balanceOf 함수를 호출하기 위한 ABI
      const tokenAbi = [
        // ERC20 토큰의 balanceOf 함수 ABI
        {
          constant: true,
          inputs: [{ name: '_owner', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: 'balance', type: 'uint256' }],
          type: 'function',
        },
      ];

      const provider = this.getProvider();
      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
      const balance = await tokenContract.balanceOf(walletAddress);
      
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      throw new ToriError(
        ErrorCode.TOKEN_BALANCE_CHECK_FAILED,
        `Failed to get token balance: ${error.message}`
      );
    }
  }

  /**
   * NFT 소유권 조회 (EVM 호환 체인의 ERC721 NFT)
   * @param nftAddress NFT 계약 주소
   * @param tokenId 토큰 ID
   * @returns Promise<string> 소유자 주소
   */
  public async getNFTOwner(nftAddress: string, tokenId: string): Promise<string> {
    try {
      if (!this.currentNetwork.isEVM) {
        throw new ToriError(
          ErrorCode.NETWORK_NOT_SUPPORTED,
          `NFT ownership check not implemented for network ${this.currentNetwork.type}`
        );
      }

      // ERC721 토큰 표준 인터페이스의 ownerOf 함수를 호출하기 위한 ABI
      const nftAbi = [
        // ERC721 토큰의 ownerOf 함수 ABI
        {
          constant: true,
          inputs: [{ name: 'tokenId', type: 'uint256' }],
          name: 'ownerOf',
          outputs: [{ name: 'owner', type: 'address' }],
          type: 'function',
        },
      ];

      const provider = this.getProvider();
      const nftContract = new ethers.Contract(nftAddress, nftAbi, provider);
      
      return await nftContract.ownerOf(tokenId);
    } catch (error) {
      throw new ToriError(
        ErrorCode.NFT_OWNERSHIP_CHECK_FAILED,
        `Failed to get NFT owner: ${error.message}`
      );
    }
  }

  /**
   * 블록 정보 조회
   * @param blockNumber 블록 번호 (undefined인 경우 최신 블록)
   * @returns Promise<any> 블록 정보
   */
  public async getBlock(blockNumber?: number): Promise<any> {
    try {
      const provider = this.getProvider();

      if (this.currentNetwork.isEVM) {
        // EVM 호환 체인의 경우
        return await provider.getBlock(blockNumber);
      } else if (this.currentNetwork.type === NetworkType.BITCOIN_MAINNET || 
                this.currentNetwork.type === NetworkType.BITCOIN_TESTNET) {
        // Bitcoin 네트워크는 별도 블록 조회 로직 필요
        // 실제 구현 필요
        return null;
      } else if (this.currentNetwork.type === NetworkType.SOLANA_MAINNET || 
                 this.currentNetwork.type === NetworkType.SOLANA_DEVNET) {
        // Solana 네트워크는 별도 블록 조회 로직 필요
        // 실제 구현 필요
        return null;
      } else if (this.currentNetwork.type === NetworkType.ZENITH_MAINNET) {
        // Zenith 체인은 별도 블록 조회 로직 필요
        // 실제 구현 필요
        return null;
      }

      throw new ToriError(
        ErrorCode.NETWORK_NOT_SUPPORTED,
        `Block retrieval not implemented for network ${this.currentNetwork.type}`
      );
    } catch (error) {
      throw new ToriError(
        ErrorCode.NETWORK_REQUEST_FAILED,
        `Failed to get block information: ${error.message}`
      );
    }
  }

  /**
   * 커스텀 네트워크 추가 (사용자 정의 네트워크)
   * @param network 네트워크 정보
   * @returns boolean 성공 여부
   */
  public addCustomNetwork(network: Omit<NetworkInfo, 'type'>): boolean {
    try {
      // 실제 구현 시, 사용자 정의 네트워크를 저장하는 로직 필요
      // 현재는 단순 예시로 표현
      console.log(`Custom network added: ${network.name}`);
      return true;
    } catch (error) {
      console.error(`Failed to add custom network: ${error.message}`);
      return false;
    }
  }
}
