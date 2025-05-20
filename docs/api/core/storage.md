# Storage Services (저장소 서비스)

Core 패키지에서 사용되는 저장소 관련 서비스를 설명합니다.

## local.ts

로컬 스토리지 서비스를 제공합니다.

```typescript
import { ToriError, ErrorCode } from '../../constants/errors';

export class LocalStorageService {
  private prefix: string;

  constructor(prefix: string = 'tori_') {
    this.prefix = prefix;
  }

  async setItem(key: string, value: any): Promise<void> {
    try {
      const fullKey = this.prefix + key;
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(fullKey, stringValue);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to save data to local storage', error);
    }
  }

  async getItem<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const fullKey = this.prefix + key;
      const value = localStorage.getItem(fullKey);
      
      if (value === null) {
        return defaultValue || null;
      }
      
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to retrieve data from local storage', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const fullKey = this.prefix + key;
      localStorage.removeItem(fullKey);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to remove data from local storage', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to clear local storage', error);
    }
  }

  async hasItem(key: string): Promise<boolean> {
    try {
      const fullKey = this.prefix + key;
      return localStorage.getItem(fullKey) !== null;
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to check if item exists in local storage', error);
    }
  }
}
```

## secure.ts

보안 스토리지 서비스를 제공합니다.

```typescript
import { encryptWithPassword, decryptWithPassword } from '../crypto/encryption';
import { LocalStorageService } from './local';
import { ToriError, ErrorCode } from '../../constants/errors';

export class SecureStorageService {
  private localStorage: LocalStorageService;
  private password: string;

  constructor(password: string, prefix: string = 'tori_secure_') {
    this.localStorage = new LocalStorageService(prefix);
    this.password = password;
  }

  async setItem(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const encryptedData = await encryptWithPassword(stringValue, this.password);
      await this.localStorage.setItem(key, encryptedData);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to securely store data', error);
    }
  }

  async getItem<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const encryptedData = await this.localStorage.getItem(key);
      
      if (!encryptedData) {
        return defaultValue || null;
      }
      
      const decryptedString = await decryptWithPassword(encryptedData, this.password);
      
      try {
        return JSON.parse(decryptedString) as T;
      } catch {
        return decryptedString as unknown as T;
      }
    } catch (error) {
      if (error instanceof ToriError && error.code === ErrorCode.INVALID_PASSWORD) {
        throw error;
      }
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to retrieve securely stored data', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.localStorage.removeItem(key);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to remove securely stored data', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.localStorage.clear();
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to clear securely stored data', error);
    }
  }

  async hasItem(key: string): Promise<boolean> {
    try {
      return await this.localStorage.hasItem(key);
    } catch (error) {
      throw new ToriError(ErrorCode.UNKNOWN_ERROR, 'Failed to check if secure item exists', error);
    }
  }
}
```
