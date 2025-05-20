/**
 * storage-service.ts
 * 
 * 이 모듈은 TORI 지갑의 데이터 저장을 위한 스토리지 서비스 인터페이스 및 구현체를 제공합니다.
 * 로컬 스토리지, 브라우저 스토리지, 파일 스토리지 등 다양한 스토리지 백엔드를 지원합니다.
 */

import { ErrorCode, ToriWalletError } from '../../constants/errors';

/**
 * 스토리지 서비스 인터페이스
 * 
 * 다양한 스토리지 백엔드를 위한 공통 인터페이스입니다.
 */
export interface StorageService {
  /**
   * 항목 가져오기
   * 
   * @param key 항목 키
   * @returns 항목 값
   */
  getItem(key: string): Promise<string | null>;
  
  /**
   * 항목 설정하기
   * 
   * @param key 항목 키
   * @param value 항목 값
   * @returns 성공 여부
   */
  setItem(key: string, value: string): Promise<boolean>;
  
  /**
   * 항목 삭제하기
   * 
   * @param key 항목 키
   * @returns 성공 여부
   */
  removeItem(key: string): Promise<boolean>;
  
  /**
   * 모든 항목 가져오기
   * 
   * @returns 모든 항목의 키-값 쌍
   */
  getAllItems(): Promise<Record<string, string>>;
  
  /**
   * 모든 항목 삭제하기
   * 
   * @returns 성공 여부
   */
  clear(): Promise<boolean>;
  
  /**
   * 모든 키 가져오기
   * 
   * @returns 모든 키 배열
   */
  keys(): Promise<string[]>;
}

/**
 * 메모리 스토리지 서비스 클래스
 * 
 * 테스트 및 개발용 메모리 기반 스토리지 서비스입니다.
 */
export class MemoryStorageService implements StorageService {
  private store: Record<string, string> = {};
  
  /**
   * 항목 가져오기
   * 
   * @param key 항목 키
   * @returns 항목 값
   */
  public async getItem(key: string): Promise<string | null> {
    return this.store[key] || null;
  }
  
  /**
   * 항목 설정하기
   * 
   * @param key 항목 키
   * @param value 항목 값
   * @returns 성공 여부
   */
  public async setItem(key: string, value: string): Promise<boolean> {
    this.store[key] = value;
    return true;
  }
  
  /**
   * 항목 삭제하기
   * 
   * @param key 항목 키
   * @returns 성공 여부
   */
  public async removeItem(key: string): Promise<boolean> {
    if (key in this.store) {
      delete this.store[key];
      return true;
    }
    return false;
  }
  
  /**
   * 모든 항목 가져오기
   * 
   * @returns 모든 항목의 키-값 쌍
   */
  public async getAllItems(): Promise<Record<string, string>> {
    return { ...this.store };
  }
  
  /**
   * 모든 항목 삭제하기
   * 
   * @returns 성공 여부
   */
  public async clear(): Promise<boolean> {
    this.store = {};
    return true;
  }
  
  /**
   * 모든 키 가져오기
   * 
   * @returns 모든 키 배열
   */
  public async keys(): Promise<string[]> {
    return Object.keys(this.store);
  }
}

/**
 * 로컬 스토리지 서비스 클래스
 * 
 * 브라우저 환경의 localStorage를 사용하는 스토리지 서비스입니다.
 */
export class LocalStorageService implements StorageService {
  private prefix: string;
  
  /**
   * 로컬 스토리지 서비스 생성자
   * 
   * @param prefix 키 접두사 (선택적)
   */
  constructor(prefix: string = 'tori_') {
    this.prefix = prefix;
  }
  
  /**
   * 항목 가져오기
   * 
   * @param key 항목 키
   * @returns 항목 값
   */
  public async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(this.prefix + key);
    } catch (error) {
      console.error('Failed to get item from local storage', error);
      throw new ToriWalletError(ErrorCode.STORAGE_READ_FAILED, 'Failed to get item from local storage', error);
    }
  }
  
  /**
   * 항목 설정하기
   * 
   * @param key 항목 키
   * @param value 항목 값
   * @returns 성공 여부
   */
  public async setItem(key: string, value: string): Promise<boolean> {
    try {
      localStorage.setItem(this.prefix + key, value);
      return true;
    } catch (error) {
      console.error('Failed to set item in local storage', error);
      throw new ToriWalletError(ErrorCode.STORAGE_WRITE_FAILED, 'Failed to set item in local storage', error);
    }
  }
  
  /**
   * 항목 삭제하기
   * 
   * @param key 항목 키
   * @returns 성공 여부
   */
  public async removeItem(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Failed to remove item from local storage', error);
      throw new ToriWalletError(ErrorCode.STORAGE_DELETE_FAILED, 'Failed to remove item from local storage', error);
    }
  }
  
  /**
   * 모든 항목 가져오기
   * 
   * @returns 모든 항목의 키-값 쌍
   */
  public async getAllItems(): Promise<Record<string, string>> {
    try {
      const result: Record<string, string> = {};
      const keys = await this.keys();
      
      for (const key of keys) {
        const value = await this.getItem(key);
        if (value !== null) {
          result[key] = value;
        }
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get all items from local storage', error);
      throw new ToriWalletError(ErrorCode.STORAGE_READ_FAILED, 'Failed to get all items from local storage', error);
    }
  }
  
  /**
   * 모든 항목 삭제하기
   * 
   * @returns 성공 여부
   */
  public async clear(): Promise<boolean> {
    try {
      const keys = await this.keys();
      
      for (const key of keys) {
        await this.removeItem(key);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear local storage', error);
      throw new ToriWalletError(ErrorCode.STORAGE_DELETE_FAILED, 'Failed to clear local storage', error);
    }
  }
  
  /**
   * 모든 키 가져오기
   * 
   * @returns 모든 키 배열
   */
  public async keys(): Promise<string[]> {
    try {
      const keys: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      
      return keys;
    } catch (error) {
      console.error('Failed to get keys from local storage', error);
      throw new ToriWalletError(ErrorCode.STORAGE_READ_FAILED, 'Failed to get keys from local storage', error);
    }
  }
}

/**
 * 세션 스토리지 서비스 클래스
 * 
 * 브라우저 환경의 sessionStorage를 사용하는 스토리지 서비스입니다.
 */
export class SessionStorageService implements StorageService {
  private prefix: string;
  
  /**
   * 세션 스토리지 서비스 생성자
   * 
   * @param prefix 키 접두사 (선택적)
   */
  constructor(prefix: string = 'tori_') {
    this.prefix = prefix;
  }
  
  /**
   * 항목 가져오기
   * 
   * @param key 항목 키
   * @returns 항목 값
   */
  public async getItem(key: string): Promise<string | null> {
    try {
      return sessionStorage.getItem(this.prefix + key);
    } catch (error) {
      console.error('Failed to get item from session storage', error);
      throw new ToriWalletError(ErrorCode.STORAGE_READ_FAILED, 'Failed to get item from session storage', error);
    }
  }
  
  /**
   * 항목 설정하기
   * 
   * @param key 항목 키
   * @param value 항목 값
   * @returns 성공 여부
   */
  public async setItem(key: string, value: string): Promise<boolean> {
    try {
      sessionStorage.setItem(this.prefix + key, value);
      return true;
    } catch (error) {
      console.error('Failed to set item in session storage', error);
      throw new ToriWalletError(ErrorCode.STORAGE_WRITE_FAILED, 'Failed to set item in session storage', error);
    }
  }
  
  /**
   * 항목 삭제하기
   * 
   * @param key 항목 키
   * @returns 성공 여부
   */
  public async removeItem(key: string): Promise<boolean> {
    try {
      sessionStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Failed to remove item from session storage', error);
      throw new ToriWalletError(ErrorCode.STORAGE_DELETE_FAILED, 'Failed to remove item from session storage', error);
    }
  }
  
  /**
   * 모든 항목 가져오기
   * 
   * @returns 모든 항목의 키-값 쌍
   */
  public async getAllItems(): Promise<Record<string, string>> {
    try {
      const result: Record<string, string> = {};
      const keys = await this.keys();
      
      for (const key of keys) {
        const value = await this.getItem(key);
        if (value !== null) {
          result[key] = value;
        }
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get all items from session storage', error);
      throw new ToriWalletError(ErrorCode.STORAGE_READ_FAILED, 'Failed to get all items from session storage', error);
    }
  }
  
  /**
   * 모든 항목 삭제하기
   * 
   * @returns 성공 여부
   */
  public async clear(): Promise<boolean> {
    try {
      const keys = await this.keys();
      
      for (const key of keys) {
        await this.removeItem(key);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear session storage', error);
      throw new ToriWalletError(ErrorCode.STORAGE_DELETE_FAILED, 'Failed to clear session storage', error);
    }
  }
  
  /**
   * 모든 키 가져오기
   * 
   * @returns 모든 키 배열
   */
  public async keys(): Promise<string[]> {
    try {
      const keys: string[] = [];
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      
      return keys;
    } catch (error) {
      console.error('Failed to get keys from session storage', error);
      throw new ToriWalletError(ErrorCode.STORAGE_READ_FAILED, 'Failed to get keys from session storage', error);
    }
  }
}

/**
 * 암호화된 스토리지 서비스 클래스
 * 
 * 다른 스토리지 서비스 위에 암호화 레이어를 추가하는 데코레이터 클래스입니다.
 */
export class EncryptedStorageService implements StorageService {
  private storageService: StorageService;
  private password: string;
  
  /**
   * 암호화된 스토리지 서비스 생성자
   * 
   * @param storageService 기본 스토리지 서비스
   * @param password 암호화 비밀번호
   */
  constructor(storageService: StorageService, password: string) {
    this.storageService = storageService;
    this.password = password;
  }
  
  /**
   * 암호화된 항목 가져오기
   * 
   * @param key 항목 키
   * @returns 복호화된 항목 값
   */
  public async getItem(key: string): Promise<string | null> {
    try {
      const encryptedItem = await this.storageService.getItem(key);
      
      if (!encryptedItem) {
        return null;
      }
      
      // JSON 파싱 및 복호화
      const encryptedData = JSON.parse(encryptedItem);
      const decrypted = this.decrypt(encryptedData);
      
      return decrypted;
    } catch (error) {
      console.error('Failed to get encrypted item', error);
      throw new ToriWalletError(ErrorCode.STORAGE_READ_FAILED, 'Failed to get encrypted item', error);
    }
  }
  
  /**
   * 항목 암호화 및 저장
   * 
   * @param key 항목 키
   * @param value 항목 값
   * @returns 성공 여부
   */
  public async setItem(key: string, value: string): Promise<boolean> {
    try {
      // 항목 암호화
      const encryptedData = this.encrypt(value);
      
      // JSON 문자열로 변환 및 저장
      const serialized = JSON.stringify(encryptedData);
      return await this.storageService.setItem(key, serialized);
    } catch (error) {
      console.error('Failed to set encrypted item', error);
      throw new ToriWalletError(ErrorCode.STORAGE_WRITE_FAILED, 'Failed to set encrypted item', error);
    }
  }
  
  /**
   * 항목 삭제하기
   * 
   * @param key 항목 키
   * @returns 성공 여부
   */
  public async removeItem(key: string): Promise<boolean> {
    try {
      return await this.storageService.removeItem(key);
    } catch (error) {
      console.error('Failed to remove encrypted item', error);
      throw new ToriWalletError(ErrorCode.STORAGE_DELETE_FAILED, 'Failed to remove encrypted item', error);
    }
  }
  
  /**
   * 모든 암호화된 항목 가져오기 및 복호화
   * 
   * @returns 모든 복호화된 항목의 키-값 쌍
   */
  public async getAllItems(): Promise<Record<string, string>> {
    try {
      const encryptedItems = await this.storageService.getAllItems();
      const decryptedItems: Record<string, string> = {};
      
      for (const [key, value] of Object.entries(encryptedItems)) {
        try {
          // JSON 파싱 및 복호화
          const encryptedData = JSON.parse(value);
          const decrypted = this.decrypt(encryptedData);
          
          decryptedItems[key] = decrypted;
        } catch (e) {
          console.warn(`Failed to decrypt item: ${key}`, e);
        }
      }
      
      return decryptedItems;
    } catch (error) {
      console.error('Failed to get all encrypted items', error);
      throw new ToriWalletError(ErrorCode.STORAGE_READ_FAILED, 'Failed to get all encrypted items', error);
    }
  }
  
  /**
   * 모든 항목 삭제하기
   * 
   * @returns 성공 여부
   */
  public async clear(): Promise<boolean> {
    try {
      return await this.storageService.clear();
    } catch (error) {
      console.error('Failed to clear encrypted storage', error);
      throw new ToriWalletError(ErrorCode.STORAGE_DELETE_FAILED, 'Failed to clear encrypted storage', error);
    }
  }
  
  /**
   * 모든 키 가져오기
   * 
   * @returns 모든 키 배열
   */
  public async keys(): Promise<string[]> {
    try {
      return await this.storageService.keys();
    } catch (error) {
      console.error('Failed to get keys from encrypted storage', error);
      throw new ToriWalletError(ErrorCode.STORAGE_READ_FAILED, 'Failed to get keys from encrypted storage', error);
    }
  }
  
  /**
   * 암호화 비밀번호 변경
   * 
   * @param newPassword 새 비밀번호
   * @returns 성공 여부
   */
  public async changePassword(newPassword: string): Promise<boolean> {
    try {
      // 모든 항목 가져오기
      const items = await this.getAllItems();
      
      // 새 비밀번호 설정
      const oldPassword = this.password;
      this.password = newPassword;
      
      // 모든 항목 다시 암호화하여 저장
      for (const [key, value] of Object.entries(items)) {
        await this.setItem(key, value);
      }
      
      return true;
    } catch (error) {
      // 실패 시 이전 비밀번호로 롤백
      this.password = this.password;
      
      console.error('Failed to change encryption password', error);
      throw new ToriWalletError(ErrorCode.STORAGE_WRITE_FAILED, 'Failed to change encryption password', error);
    }
  }
  
  /**
   * 데이터 암호화
   * 
   * @param data 암호화할 데이터
   * @returns 암호화된 데이터
   */
  private encrypt(data: string): any {
    // TODO: 실제 암호화 구현
    // 여기서는 간단한 암호화만 수행 (실제로는 encryption.ts 모듈 활용)
    return {
      data: btoa(data), // Base64 인코딩 (실제로는 더 강력한 암호화 필요)
      version: '1',
    };
  }
  
  /**
   * 데이터 복호화
   * 
   * @param encryptedData 암호화된 데이터
   * @returns 복호화된 데이터
   */
  private decrypt(encryptedData: any): string {
    // TODO: 실제 복호화 구현
    // 여기서는 간단한 복호화만 수행 (실제로는 encryption.ts 모듈 활용)
    return atob(encryptedData.data); // Base64 디코딩
  }
}

/**
 * 스토리지 서비스 팩토리
 * 
 * 환경에 따라 적절한 스토리지 서비스를 생성합니다.
 */
export class StorageServiceFactory {
  /**
   * 스토리지 서비스 생성
   * 
   * @param type 스토리지 유형
   * @param options 스토리지 옵션
   * @returns 스토리지 서비스
   */
  public static createStorage(
    type: 'memory' | 'local' | 'session' | 'encrypted',
    options?: {
      prefix?: string;
      password?: string;
      baseStorage?: 'memory' | 'local' | 'session';
    }
  ): StorageService {
    switch (type) {
      case 'memory':
        return new MemoryStorageService();
      
      case 'local':
        return new LocalStorageService(options?.prefix);
      
      case 'session':
        return new SessionStorageService(options?.prefix);
      
      case 'encrypted':
        if (!options?.password) {
          throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, 'Password is required for encrypted storage');
        }
        
        // 기본 스토리지 생성
        const baseStorage = options.baseStorage || 'local';
        const storage = this.createStorage(baseStorage, { prefix: options.prefix });
        
        // 암호화 스토리지 래핑
        return new EncryptedStorageService(storage, options.password);
      
      default:
        throw new ToriWalletError(ErrorCode.INVALID_PARAMETER, `Unsupported storage type: ${type}`);
    }
  }
}

// 기본 내보내기
export default StorageServiceFactory;
