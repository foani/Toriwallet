/**
 * TORI 지갑 프로바이더
 * 
 * TORI 지갑의 메인 프로바이더입니다.
 * dApp과 지갑 간의 상호작용을 가능하게 합니다.
 */

import { MessageBridge } from './messageBridge';

// 지원되는 메서드 정의
export enum ProviderMethod {
  // 계정 관련
  REQUEST_ACCOUNTS = 'tori_requestAccounts',
  GET_ACCOUNTS = 'tori_getAccounts',
  
  // 네트워크 관련
  REQUEST_CHAIN_ID = 'tori_requestChainId',
  SWITCH_CHAIN = 'tori_switchChain',
  ADD_CHAIN = 'tori_addChain',
  
  // 서명 관련
  SIGN_MESSAGE = 'tori_signMessage',
  SIGN_TYPED_DATA = 'tori_signTypedData',
  
  // 트랜잭션 관련
  SIGN_TRANSACTION = 'tori_signTransaction',
  SEND_TRANSACTION = 'tori_sendTransaction',
  
  // 기타
  GET_BALANCE = 'tori_getBalance',
  GET_TOKEN_BALANCE = 'tori_getTokenBalance',
  IS_CONNECTED = 'tori_isConnected'
}

// 이벤트 정의
export enum ProviderEvent {
  ACCOUNTS_CHANGED = 'accountsChanged',
  CHAIN_CHANGED = 'chainChanged',
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  MESSAGE = 'message'
}

// 프로바이더 인터페이스
export interface ProviderInterface {
  isConnected(): boolean;
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(eventName: string, listener: (...args: any[]) => void): void;
  removeListener(eventName: string, listener: (...args: any[]) => void): void;
}

/**
 * TORI 지갑 프로바이더 클래스
 */
export class ToriProvider implements ProviderInterface {
  private _chainId: string | null = null;
  private _accounts: string[] = [];
  private _isConnected: boolean = false;
  private _eventListeners: Record<string, ((...args: any[]) => void)[]> = {};
  
  constructor(private readonly messageBridge: MessageBridge) {
    // 이벤트 리스너 초기화
    this._eventListeners = {
      [ProviderEvent.ACCOUNTS_CHANGED]: [],
      [ProviderEvent.CHAIN_CHANGED]: [],
      [ProviderEvent.CONNECT]: [],
      [ProviderEvent.DISCONNECT]: [],
      [ProviderEvent.MESSAGE]: []
    };
    
    // 메시지 브릿지에서 이벤트 수신
    this.messageBridge.on('event', this._handleEvent.bind(this));
    
    // 초기 상태 요청
    this._initializeState();
  }
  
  /**
   * 프로바이더 연결 상태 확인
   */
  public isConnected(): boolean {
    return this._isConnected;
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
      // 특별히 처리해야 하는 메서드
      switch (method) {
        case ProviderMethod.REQUEST_ACCOUNTS:
          return await this._requestAccounts();
          
        case ProviderMethod.GET_ACCOUNTS:
          return this._getAccounts();
          
        case ProviderMethod.IS_CONNECTED:
          return this.isConnected();
          
        // 그 외 메서드는 메시지 브릿지를 통해 처리
        default:
          return await this.messageBridge.request({
            method,
            params
          });
      }
    } catch (error) {
      console.error(`TORI Wallet: ${method} 메서드 요청 중 오류`, error);
      throw error;
    }
  }
  
  /**
   * 이벤트 리스너 등록
   */
  public on(eventName: string, listener: (...args: any[]) => void): void {
    if (!this._eventListeners[eventName]) {
      this._eventListeners[eventName] = [];
    }
    
    this._eventListeners[eventName].push(listener);
  }
  
  /**
   * 이벤트 리스너 제거
   */
  public removeListener(eventName: string, listener: (...args: any[]) => void): void {
    if (!this._eventListeners[eventName]) {
      return;
    }
    
    this._eventListeners[eventName] = this._eventListeners[eventName].filter(
      (l) => l !== listener
    );
  }
  
  /**
   * 이벤트 발생 처리
   */
  private _handleEvent(payload: { type: string; data: any }): void {
    const { type, data } = payload;
    
    if (!type || !this._eventListeners[type]) {
      return;
    }
    
    console.log(`TORI Wallet: ${type} 이벤트 수신`, data);
    
    // 내부 상태 업데이트
    this._updateState(type, data);
    
    // 이벤트 리스너 호출
    for (const listener of this._eventListeners[type]) {
      try {
        listener(data);
      } catch (error) {
        console.error(`TORI Wallet: ${type} 이벤트 리스너 실행 중 오류`, error);
      }
    }
  }
  
  /**
   * 내부 상태 업데이트
   */
  private _updateState(eventType: string, data: any): void {
    switch (eventType) {
      case ProviderEvent.ACCOUNTS_CHANGED:
        this._accounts = data;
        break;
        
      case ProviderEvent.CHAIN_CHANGED:
        this._chainId = data;
        break;
        
      case ProviderEvent.CONNECT:
        this._isConnected = true;
        this._chainId = data.chainId;
        break;
        
      case ProviderEvent.DISCONNECT:
        this._isConnected = false;
        break;
    }
  }
  
  /**
   * 초기 상태 요청
   */
  private async _initializeState(): Promise<void> {
    try {
      const state = await this.messageBridge.request({
        method: 'tori_getProviderState',
        params: []
      });
      
      if (state) {
        this._chainId = state.chainId || null;
        this._isConnected = !!state.isConnected;
        this._accounts = state.accounts || [];
      }
    } catch (error) {
      console.error('TORI Wallet: 초기 상태 요청 중 오류', error);
    }
  }
  
  /**
   * 계정 요청 (연결 승인 필요)
   */
  private async _requestAccounts(): Promise<string[]> {
    try {
      const accounts = await this.messageBridge.request({
        method: ProviderMethod.REQUEST_ACCOUNTS,
        params: []
      });
      
      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        this._accounts = accounts;
        this._isConnected = true;
        
        // 연결 이벤트 발생
        this._handleEvent({
          type: ProviderEvent.CONNECT,
          data: { chainId: this._chainId }
        });
        
        // 계정 변경 이벤트 발생
        this._handleEvent({
          type: ProviderEvent.ACCOUNTS_CHANGED,
          data: accounts
        });
      }
      
      return accounts;
    } catch (error) {
      console.error('TORI Wallet: 계정 요청 중 오류', error);
      throw error;
    }
  }
  
  /**
   * 현재 계정 목록 반환
   */
  private _getAccounts(): string[] {
    return this._accounts;
  }
}
