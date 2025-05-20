/**
 * 메시지 브릿지
 * 
 * 인페이지 스크립트와 콘텐츠 스크립트 간의 통신을 처리합니다.
 * 이를 통해 웹 페이지의 dApp과 확장 프로그램이 메시지를 주고받을 수 있습니다.
 */

// 메시지 응답 타입
type ResponseCallback = (error: Error | null, result?: any) => void;

// 이벤트 리스너 타입
type EventListener = (payload: any) => void;

// 메시지 요청 매개변수
interface RequestParams {
  method: string;
  params: any[];
}

/**
 * 메시지 브릿지 클래스
 */
export class MessageBridge {
  private _nextId: number = 0;
  private _pendingRequests: Map<number, ResponseCallback> = new Map();
  private _eventListeners: Map<string, EventListener[]> = new Map();
  
  constructor() {
    // 메시지 리스너 설정
    window.addEventListener('message', this._onMessage.bind(this));
  }
  
  /**
   * 요청 전송
   */
  public request(data: RequestParams): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this._nextId++;
      
      // 응답 콜백 등록
      this._pendingRequests.set(id, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
      
      // 메시지 전송
      window.postMessage({
        target: 'TORI_CONTENT_SCRIPT',
        id,
        type: data.method,
        data: {
          method: data.method,
          params: data.params
        }
      }, '*');
    });
  }
  
  /**
   * 이벤트 리스너 등록
   */
  public on(event: string, listener: EventListener): void {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, []);
    }
    
    this._eventListeners.get(event)!.push(listener);
  }
  
  /**
   * 이벤트 리스너 제거
   */
  public off(event: string, listener: EventListener): void {
    if (!this._eventListeners.has(event)) {
      return;
    }
    
    const listeners = this._eventListeners.get(event)!;
    this._eventListeners.set(
      event,
      listeners.filter((l) => l !== listener)
    );
  }
  
  /**
   * 이벤트 발생
   */
  private _emit(event: string, payload: any): void {
    if (this._eventListeners.has(event)) {
      for (const listener of this._eventListeners.get(event)!) {
        try {
          listener(payload);
        } catch (error) {
          console.error(`TORI Wallet: ${event} 이벤트 처리 중 오류`, error);
        }
      }
    }
  }
  
  /**
   * 메시지 수신 처리
   */
  private _onMessage(event: MessageEvent): void {
    const message = event.data;
    
    // 다른 출처의 메시지나 대상이 다른 메시지는 무시
    if (!message || message.target !== 'TORI_INPAGE') {
      return;
    }
    
    // 요청 응답 처리
    if (message.id !== undefined && this._pendingRequests.has(message.id)) {
      const callback = this._pendingRequests.get(message.id)!;
      this._pendingRequests.delete(message.id);
      
      if (message.error) {
        // 오류 응답
        callback(new Error(message.error));
      } else {
        // 성공 응답
        callback(null, message.data);
      }
      
      return;
    }
    
    // 이벤트 메시지 처리
    if (message.type === 'event' && message.event) {
      this._emit('event', {
        type: message.event,
        data: message.data
      });
    }
  }
}

/**
 * 메시지 브릿지 설정
 */
export const setupMessageBridge = (): MessageBridge => {
  return new MessageBridge();
};
