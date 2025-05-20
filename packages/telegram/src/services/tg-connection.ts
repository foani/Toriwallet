/**
 * 텔레그램 연결 관리 서비스
 * 텔레그램 WebApp API와의 연결 관리 및 상태 유지
 */
import { useEffect, useState } from 'react';
import webApp, { isDarkMode } from '../telegram-api/webApp';
import telegramClient from '../telegram-api/client';

// 상태 관리를 위한 싱글톤 인스턴스
class TelegramConnectionManager {
  private static instance: TelegramConnectionManager;
  private isInitialized: boolean = false;
  private isConnected: boolean = false;
  private user: any = null;
  private wallet: any = null;
  private isDarkTheme: boolean = false;
  private listeners: { [key: string]: Function[] } = {
    'connection-change': [],
    'user-change': [],
    'wallet-change': [],
    'theme-change': []
  };

  private constructor() {
    // 싱글톤 패턴을 위한 비공개 생성자
    this.init();
  }

  // 싱글톤 인스턴스 접근 메서드
  public static getInstance(): TelegramConnectionManager {
    if (!TelegramConnectionManager.instance) {
      TelegramConnectionManager.instance = new TelegramConnectionManager();
    }
    return TelegramConnectionManager.instance;
  }

  // 초기화 함수
  private async init() {
    if (this.isInitialized) return;
    
    try {
      // WebApp API 연결 확인
      const isAvailable = webApp.isWebAppAvailable();
      this.isConnected = isAvailable;
      this.notifyListeners('connection-change', this.isConnected);
      
      if (isAvailable) {
        // 다크 모드 설정
        this.isDarkTheme = isDarkMode();
        this.notifyListeners('theme-change', this.isDarkTheme);
        
        // 사용자 정보 가져오기
        await this.loadUserInfo();
        
        // 지갑 정보 가져오기
        await this.loadWalletInfo();
        
        // WebApp이 준비됨을 알림
        webApp.ready();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('텔레그램 연결 초기화 실패:', error);
      this.isConnected = false;
      this.notifyListeners('connection-change', this.isConnected);
    }
  }

  // 사용자 정보 로드
  private async loadUserInfo() {
    try {
      // 첫 번째로 WebApp에서 직접 사용자 정보를 가져옴
      const webAppUser = webApp.getUser();
      
      if (webAppUser) {
        this.user = webAppUser;
      } else {
        // WebApp에서 사용자 정보를 가져올 수 없는 경우 서버에 검증 요청
        const verifiedUser = await telegramClient.verifyUser();
        this.user = verifiedUser;
      }
      
      this.notifyListeners('user-change', this.user);
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
      this.user = null;
      this.notifyListeners('user-change', this.user);
    }
  }

  // 지갑 정보 로드
  private async loadWalletInfo() {
    try {
      if (!this.user) return;
      
      const wallet = await telegramClient.getUserWallet();
      this.wallet = wallet;
      this.notifyListeners('wallet-change', this.wallet);
    } catch (error) {
      console.error('지갑 정보 로드 실패:', error);
      this.wallet = null;
      this.notifyListeners('wallet-change', this.wallet);
    }
  }

  // 이벤트 리스너 등록
  public addEventListener(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // 현재 상태를 즉시 콜백에 전달
    switch (event) {
      case 'connection-change':
        callback(this.isConnected);
        break;
      case 'user-change':
        callback(this.user);
        break;
      case 'wallet-change':
        callback(this.wallet);
        break;
      case 'theme-change':
        callback(this.isDarkTheme);
        break;
    }
  }

  // 이벤트 리스너 제거
  public removeEventListener(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    
    this.listeners[event] = this.listeners[event].filter(
      listener => listener !== callback
    );
  }

  // 리스너에게 알림
  private notifyListeners(event: string, data: any) {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`리스너 실행 오류 (${event}):`, error);
      }
    });
  }

  // 연결 상태 가져오기
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // 사용자 정보 가져오기
  public getUserInfo(): any {
    return this.user;
  }

  // 지갑 정보 가져오기
  public getWalletInfo(): any {
    return this.wallet;
  }

  // 테마 모드 가져오기
  public isDarkMode(): boolean {
    return this.isDarkTheme;
  }

  // 지갑 정보 새로고침
  public async refreshWalletInfo() {
    await this.loadWalletInfo();
    return this.wallet;
  }
}

// React에서 사용하기 위한 훅
export const useTelegramConnection = () => {
  const manager = TelegramConnectionManager.getInstance();
  const [isConnected, setIsConnected] = useState<boolean>(manager.getConnectionStatus());
  const [user, setUser] = useState<any>(manager.getUserInfo());
  const [wallet, setWallet] = useState<any>(manager.getWalletInfo());
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(manager.isDarkMode());

  useEffect(() => {
    // 이벤트 리스너 등록
    const connectionListener = (status: boolean) => setIsConnected(status);
    const userListener = (userData: any) => setUser(userData);
    const walletListener = (walletData: any) => setWallet(walletData);
    const themeListener = (isDark: boolean) => setIsDarkTheme(isDark);
    
    manager.addEventListener('connection-change', connectionListener);
    manager.addEventListener('user-change', userListener);
    manager.addEventListener('wallet-change', walletListener);
    manager.addEventListener('theme-change', themeListener);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      manager.removeEventListener('connection-change', connectionListener);
      manager.removeEventListener('user-change', userListener);
      manager.removeEventListener('wallet-change', walletListener);
      manager.removeEventListener('theme-change', themeListener);
    };
  }, []);

  // 지갑 정보 새로고침 함수
  const refreshWallet = async () => {
    await manager.refreshWalletInfo();
  };

  return {
    isConnected,
    user,
    wallet,
    isDarkTheme,
    refreshWallet
  };
};

export default TelegramConnectionManager.getInstance();
