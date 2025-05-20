/**
 * evm-api.ts
 * 
 * 이 모듈은 EVM 호환 네트워크(Catena, Ethereum, BSC, Polygon 등)와의 통신을 위한
 * API 클래스를 제공합니다. ethers.js를 사용하여 EVM 호환 블록체인과 상호작용합니다.
 */

import { ethers } from 'ethers';
import { NetworkInfo } from '../../constants/networks';
import { ToriError, ErrorCode } from '../../constants/errors';

/**
 * EVM 호환 네트워크 API 클래스
 */
export class EVMApi {
  private provider: ethers.JsonRpcProvider;
  private network: NetworkInfo;

  /**
   * EVMApi 생성자
   * @param network 네트워크 정보
   */
  constructor(network: NetworkInfo) {
    if (!network.isEVM) {
      throw new ToriError(
        ErrorCode.NETWORK_NOT_SUPPORTED,
        `Network ${network.name} is not EVM compatible`
      );
    }

    this.network = network;
    this.provider = new ethers.JsonRpcProvider(network.rpcUrl);
  }

  /**
   * 프로바이더 반환
   * @returns ethers.JsonRpcProvider
   */
  public getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  /**
   * 계정 잔액 조회
   * @param address 계정 주소
   * @returns Promise<string> 잔액 (ETH/CTA/BNB 등)
   */
  public async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatUnits(balance, this.network.decimals);
    } catch (error) {
      throw new ToriError(
        ErrorCode.NETWORK_REQUEST_FAILED,
        `Failed to get balance for ${address}: ${error.message}`
      );
    }
  }

  /**
   * 트랜잭션 전송
   * @param signedTx 서명된 트랜잭션
   * @returns Promise<string> 트랜잭션 해시
   */
  public async sendTransaction(signedTx: string): Promise<string> {
    try {
      const tx = await this.provider.broadcastTransaction(signedTx);
      return tx.hash;
    } catch (error) {
      throw new ToriError(
        ErrorCode.TRANSACTION_BROADCAST_FAILED,
        `Failed to send transaction: ${error.message}`
      );
    }
  }

  /**
   * 트랜잭션 정보 조회
   * @param txHash 트랜잭션 해시
   * @returns Promise<any> 트랜잭션 정보
   */
  public async getTransaction(txHash: string): Promise<any> {
    try {
      return await this.provider.getTransaction(txHash);
    } catch (error) {
      throw new ToriError(
        ErrorCode.NETWORK_REQUEST_FAILED,
        `Failed to get transaction ${txHash}: ${error.message}`
      );
    }
  }

  /**
   * 트랜잭션 영수증 조회
   * @param txHash 트랜잭션 해시
   * @returns Promise<any> 트랜잭션 영수증
   */
  public async getTransactionReceipt(txHash: string): Promise<any> {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      throw new ToriError(
        ErrorCode.NETWORK_REQUEST_FAILED,
        `Failed to get transaction receipt ${txHash}: ${error.message}`
      );
    }
  }

  /**
   * 블록 정보 조회
   * @param blockNumber 블록 번호 또는 해시
   * @returns Promise<any> 블록 정보
   */
  public async getBlock(blockNumber: number | string): Promise<any> {
    try {
      return await this.provider.getBlock(blockNumber);
    } catch (error) {
      throw new ToriError(
        ErrorCode.NETWORK_REQUEST_FAILED,
        `Failed to get block ${blockNumber}: ${error.message}`
      );
    }
  }

  /**
   * 현재 가스 가격 조회
   * @returns Promise<string> 가스 가격 (Gwei 단위)
   */
  public async getGasPrice(): Promise<string> {
    try {
      const feeData = await this.provider.getFeeData();
      return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
    } catch (error) {
      throw new ToriError(
        ErrorCode.NETWORK_REQUEST_FAILED,
        `Failed to get gas price: ${error.message}`
      );
    }
  }

  /**
   * 계정 논스 조회
   * @param address 계정 주소
   * @returns Promise<number> 논스 값
   */
  public async getNonce(address: string): Promise<number> {
    try {
      return await this.provider.getTransactionCount(address);
    } catch (error) {
      throw new ToriError(
        ErrorCode.NETWORK_REQUEST_FAILED,
        `Failed to get nonce for ${address}: ${error.message}`
      );
    }
  }

  /**
   * 체인 ID 조회
   * @returns Promise<number> 체인 ID
   */
  public async getChainId(): Promise<number> {
    try {
      const network = await this.provider.getNetwork();
      return Number(network.chainId);
    } catch (error) {
      throw new ToriError(
        ErrorCode.NETWORK_REQUEST_FAILED,
        `Failed to get chain ID: ${error.message}`
      );
    }
  }

  /**
   * 스마트 계약 인스턴스 생성
   * @param address 계약 주소
   * @param abi 계약 ABI
   * @returns ethers.Contract 계약 인스턴스
   */
  public getContract(address: string, abi: any): ethers.Contract {
    try {
      return new ethers.Contract(address, abi, this.provider);
    } catch (error) {
      throw new ToriError(
        ErrorCode.CONTRACT_CREATION_FAILED,
        `Failed to create contract instance: ${error.message}`
      );
    }
  }

  /**
   * ERC20 토큰 잔액 조회
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

      const tokenContract = this.getContract(tokenAddress, tokenAbi);
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
   * ERC721 NFT 소유자 조회
   * @param nftAddress NFT 계약 주소
   * @param tokenId 토큰 ID
   * @returns Promise<string> 소유자 주소
   */
  public async getNFTOwner(nftAddress: string, tokenId: string): Promise<string> {
    try {
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

      const nftContract = this.getContract(nftAddress, nftAbi);
      return await nftContract.ownerOf(tokenId);
    } catch (error) {
      throw new ToriError(
        ErrorCode.NFT_OWNERSHIP_CHECK_FAILED,
        `Failed to get NFT owner: ${error.message}`
      );
    }
  }

  /**
   * 네트워크 상태 조회
   * @returns Promise<boolean> 네트워크 연결 상태
   */
  public async getNetworkStatus(): Promise<boolean> {
    try {
      // 간단히 블록 번호를 조회하여 네트워크 연결 상태 확인
      await this.provider.getBlockNumber();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 예상 트랜잭션 가스 사용량 계산
   * @param txObject 트랜잭션 객체
   * @returns Promise<string> 예상 가스 사용량
   */
  public async estimateGas(txObject: any): Promise<string> {
    try {
      const gas = await this.provider.estimateGas(txObject);
      return gas.toString();
    } catch (error) {
      throw new ToriError(
        ErrorCode.GAS_ESTIMATION_FAILED,
        `Failed to estimate gas: ${error.message}`
      );
    }
  }

  /**
   * 블록체인 트랜잭션 기록 조회 (간단한 구현)
   * @param address 주소
   * @param startBlock 시작 블록 (옵션)
   * @param endBlock 종료 블록 (옵션)
   * @returns Promise<any[]> 트랜잭션 목록
   */
  public async getTransactionHistory(
    address: string,
    startBlock?: number,
    endBlock?: number
  ): Promise<any[]> {
    try {
      // 참고: 실제 구현에서는 외부 API나 직접 블록체인 스캔이 필요합니다.
      // 예: Etherscan, BSCScan 등의 API 사용
      // 현재는 계정의 최신 5개의 트랜잭션을 가져오는 간단한 예시를 제공합니다.
      
      // 참고: 이 메서드는 실제 구현 시 확장 필요
      console.warn('getTransactionHistory is a simplified implementation. For production, integrate with blockchain explorer APIs.');
      
      // 단순 예시: 빈 배열 반환
      return [];
    } catch (error) {
      throw new ToriError(
        ErrorCode.TRANSACTION_HISTORY_FETCH_FAILED,
        `Failed to get transaction history: ${error.message}`
      );
    }
  }

  /**
   * 이벤트 로그 조회
   * @param filter 이벤트 필터
   * @returns Promise<any[]> 이벤트 로그 목록
   */
  public async getLogs(filter: any): Promise<any[]> {
    try {
      return await this.provider.getLogs(filter);
    } catch (error) {
      throw new ToriError(
        ErrorCode.EVENT_LOGS_FETCH_FAILED,
        `Failed to get event logs: ${error.message}`
      );
    }
  }
}
