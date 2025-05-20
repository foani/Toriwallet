import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 지원하는 언어 목록
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ko', name: '한국어' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'th', name: 'ไทย' }
];

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LANGUAGE_KEY = 'tori_admin_language';

// i18n 초기화
const initializeI18n = async () => {
  const savedLanguage = localStorage.getItem(LANGUAGE_KEY) || 'ko';
  
  // 언어 리소스 불러오기 (실제로는 여러 언어 리소스를 로드)
  const enTranslation = {
    common: {
      welcome: 'Welcome to TORI Wallet Admin',
      login: 'Login',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success',
      search: 'Search',
      noResults: 'No results found',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      settings: 'Settings',
      profile: 'Profile',
      dashboard: 'Dashboard',
      networks: 'Networks',
      users: 'Users',
      analytics: 'Analytics',
      logs: 'Logs'
    }
  };
  
  const koTranslation = {
    common: {
      welcome: 'TORI 지갑 관리자에 오신 것을 환영합니다',
      login: '로그인',
      logout: '로그아웃',
      email: '이메일',
      password: '비밀번호',
      submit: '제출',
      cancel: '취소',
      save: '저장',
      edit: '편집',
      delete: '삭제',
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      success: '성공',
      search: '검색',
      noResults: '결과가 없습니다',
      back: '뒤로',
      next: '다음',
      previous: '이전',
      settings: '설정',
      profile: '프로필',
      dashboard: '대시보드',
      networks: '네트워크',
      users: '사용자',
      analytics: '분석',
      logs: '로그'
    }
  };
  
  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: enTranslation,
        ko: koTranslation
      },
      fallbackLng: 'ko',
      debug: process.env.NODE_ENV === 'development',
      interpolation: {
        escapeValue: false
      },
      lng: savedLanguage
    });
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(
    localStorage.getItem(LANGUAGE_KEY) || navigator.language.split('-')[0] || 'ko'
  );
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  useEffect(() => {
    const initI18n = async () => {
      await initializeI18n();
      setIsInitialized(true);
    };
    
    initI18n();
  }, []);
  
  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
    setLanguageState(lang);
  };
  
  if (!isInitialized) {
    return <div>Loading translations...</div>;
  }
  
  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, supportedLanguages: SUPPORTED_LANGUAGES }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
