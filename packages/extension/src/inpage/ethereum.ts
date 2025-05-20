/**
 * 이더리움 호환 프로바이더
 * 
 * EIP-1193 인터페이스를 구현하여 이더리움 DApp과의 호환성을 제공합니다.
 * TORI 지갑 프로바이더를 래핑하여 이더리움 웹3 API로 변환합니다.
 */

import { ToriProvider, ProviderMethod, ProviderEvent } from './provider';

// EIP-1193 이더리움 프로바이더 인터페이스
export interface EIP1193Provider {
  isConnected(): boolean;
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(eventName: string, listener: (...args: any[]) => void): void;
  removeListener(eventName: string, listener: (...args: any[]) => void): void;
}

// 이더리움 메서드 정의
export enum EthereumMethod {
  // 계정 관련
  REQUEST_ACCOUNTS = 'eth_requestAccounts',
  GET_ACCOUNTS = 'eth_accounts',
  
  // 네트워크 관련
  CHAIN_ID = 'eth_chainId',
  NET_VERSION = 'net_version',
  SWITCH_CHAIN = 'wallet_switchEthereumChain',
  ADD_CHAIN = 'wallet_addEthereumChain',
  
  // 서명 관련
  SIGN = 'eth_sign',
  PERSONAL_SIGN = 'personal_sign',
  SIGN_TYPED_DATA = 'eth_signTypedData',
  SIGN_TYPED_DATA_V3 = 'eth_signTypedData_v3',
  SIGN_TYPED_DATA_V4 = 'eth_signTypedData_v4',
  
  // 트랜잭션 관련
  SIGN_TRANSACTION = 'eth_signTransaction',
  SEND_TRANSACTION = 'eth_sendTransaction',
  SEND_RAW_TRANSACTION = 'eth_sendRawTransaction',
  
  // 읽기 전용 관련
  GET_BALANCE = 'eth_getBalance',
  GET_BLOCK_NUMBER = 'eth_blockNumber',
  GET_BLOCK_BY_HASH = 'eth_getBlockByHash',
  GET_BLOCK_BY_NUMBER = 'eth_getBlockByNumber',
  GET_TRANSACTION_COUNT = 'eth_getTransactionCount',
  GET_TRANSACTION_BY_HASH = 'eth_getTransactionByHash',
  GET_TRANSACTION_RECEIPT = 'eth_getTransactionReceipt',
  CALL = 'eth_call',
  ESTIMATE_GAS = 'eth_estimateGas',
  GET_LOGS = 'eth_getLogs',
  GET_CODE = 'eth_getCode',
  GAS_PRICE = 'eth_gasPrice',
  GET_STORAGE_AT = 'eth_getStorageAt'
}

/**
 * 이더리움 호환 프로바이더 클래스
 */
export class EthereumProvider implements EIP1193Provider {
  // 이더리움 관련 속성
  public isMetaMask: boolean = true;
  public autoRefreshOnNetworkChange: boolean = false;
  public chainId: string | null = null;
  public selectedAddress: string | null = null;
  public networkVersion: string | null = null;
  
  constructor(private readonly toriProvider: ToriProvider) {
    // TORI 프로바이더에서 이벤트 수신
    this._setupEventHandlers();
    
    // 초기 상태 설정
    this._initializeState();
  }
  
  /**
   * 프로바이더 연결 상태 확인
   */
  public isConnected(): boolean {
    return this.toriProvider.isConnected();
  }
  
  /**
   * dApp의 메서드 요청 처리
   */
  public async request(args: { method: string; params?: any[] }): Promise<any> {
    if (!args || typeof args !== 'object' || !args.method) {
      throw new Error('요청 인자가 유효하지 않습니다');
    }
    
    const { method, params = [] } = args;
    
    try {
      // 이더리움 메서드를 TORI 메서드로 변환
      return await this._handleEthereumMethod(method, params);
    } catch (error) {
      console.error(`이더리움 프로바이더: ${method} 메서드 요청 중 오류`, error);
      throw error;
    }
  }
  
  /**
   * 이벤트 리스너 등록
   */
  public on(eventName: string, listener: (...args: any[]) => void): void {
    this.toriProvider.on(eventName, listener);
  }
  
  /**
   * 이벤트 리스너 제거
   */
  public removeListener(eventName: string, listener: (...args: any[]) => void): void {
    this.toriProvider.removeListener(eventName, listener);
  }
  
  /**
   * 이벤트 핸들러 설정
   */
  private _setupEventHandlers(): void {
    // 계정 변경 이벤트
    this.toriProvider.on(ProviderEvent.ACCOUNTS_CHANGED, (accounts) => {
      this.selectedAddress = accounts && accounts.length > 0 ? accounts[0] : null;
    });
    
    // 체인 변경 이벤트
    this.toriProvider.on(ProviderEvent.CHAIN_CHANGED, (chainId) => {
      this.chainId = chainId;
      this.networkVersion = parseInt(chainId, 16).toString();
    });
    
    // 연결 이벤트
    this.toriProvider.on(ProviderEvent.CONNECT, ({ chainId }) => {
      this.chainId = chainId;
      this.networkVersion = parseInt(chainId, 16).toString();
    });
    
    // 연결 해제 이벤트
    this.toriProvider.on(ProviderEvent.DISCONNECT, () => {
      this.selectedAddress = null;
    });
  }
  
  /**
   * 초기 상태 설정
   */
  private async _initializeState(): Promise<void> {
    try {
      // 계정 정보 요청
      const accounts = await this.toriProvider.request({
        method: ProviderMethod.GET_ACCOUNTS,
        params: []
      });
      
      this.selectedAddress = accounts && accounts.length > 0 ? accounts[0] : null;
      
      // 체인 ID 요청
      const chainId = await this.toriProvider.request({
        method: ProviderMethod.REQUEST_CHAIN_ID,
        params: []
      });
      
      this.chainId = chainId;
      this.networkVersion = parseInt(chainId, 16).toString();
    } catch (error) {
      console.error('이더리움 프로바이더: 초기 상태 설정 중 오류', error);
    }
  }
  
  /**
   * 이더리움 메서드 처리
   */
  private async _handleEthereumMethod(method: string, params: any[]): Promise<any> {
    switch (method) {
      // 계정 관련
      case EthereumMethod.REQUEST_ACCOUNTS:
        return await this.toriProvider.request({
          method: ProviderMethod.REQUEST_ACCOUNTS,
          params
        });
        
      case EthereumMethod.GET_ACCOUNTS:
        return await this.toriProvider.request({
          method: ProviderMethod.GET_ACCOUNTS,
          params
        });
        
      // 네트워크 관련
      case EthereumMethod.CHAIN_ID:
        return await this.toriProvider.request({
          method: ProviderMethod.REQUEST_CHAIN_ID,
          params
        });
        
      case EthereumMethod.NET_VERSION:
        const chainId = await this.toriProvider.request({
          method: ProviderMethod.REQUEST_CHAIN_ID,
          params
        });
        return parseInt(chainId, 16).toString();
        
      case EthereumMethod.SWITCH_CHAIN:
        return await this.toriProvider.request({
          method: ProviderMethod.SWITCH_CHAIN,
          params
        });
        
      case EthereumMethod.ADD_CHAIN:
        return await this.toriProvider.request({
          method: ProviderMethod.ADD_CHAIN,
          params
        });
        
      // 서명 관련
      case EthereumMethod.PERSONAL_SIGN:
        return await this.toriProvider.request({
          method: ProviderMethod.SIGN_MESSAGE,
          params
        });
        
      case EthereumMethod.SIGN:
        // eth_sign과 personal_sign은 매개변수 순서가 다름
        // eth_sign: [address, message]
        // personal_sign: [message, address]
        if (params.length >= 2) {
          const [address, message] = params;
          return await this.toriProvider.request({
            method: ProviderMethod.SIGN_MESSAGE,
            params: [message, address]
          });
        }
        throw new Error('유효하지 않은 매개변수');
        
      case EthereumMethod.SIGN_TYPED_DATA:
      case EthereumMethod.SIGN_TYPED_DATA_V3:
      case EthereumMethod.SIGN_TYPED_DATA_V4:
        return await this.toriProvider.request({
          method: ProviderMethod.SIGN_TYPED_DATA,
          params
        });
        
      // 트랜잭션 관련
      case EthereumMethod.SIGN_TRANSACTION:
        return await this.toriProvider.request({
          method: ProviderMethod.SIGN_TRANSACTION,
          params
        });
        
      case EthereumMethod.SEND_TRANSACTION:
        return await this.toriProvider.request({
          method: ProviderMethod.SEND_TRANSACTION,
          params
        });
        
      // 읽기 전용 RPC 호출은 직접 전달
      default:
        // 메서드를 그대로 전달 (백엔드에서 처리)
        return await this.toriProvider.request({
          method,
          params
        });
    }
  }
}
