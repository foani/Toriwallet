import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';

// 리소스 임포트
import translationEN from '../../shared/i18n/en/common.json';
import translationKO from '../../shared/i18n/ko/common.json';
import translationJA from '../../shared/i18n/ja/common.json';
import translationZH from '../../shared/i18n/zh-CN/common.json';
import translationZH_TW from '../../shared/i18n/zh-TW/common.json';
import translationVI from '../../shared/i18n/vi/common.json';
import translationTH from '../../shared/i18n/th/common.json';

// 지원하는 언어 목록
export const LANGUAGES = {
  EN: { code: 'en', name: 'English', nativeName: 'English' },
  KO: { code: 'ko', name: 'Korean', nativeName: '한국어' },
  JA: { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  ZH: { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  ZH_TW: { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  VI: { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  TH: { code: 'th', name: 'Thai', nativeName: 'ไทย' },
};

// 리소스 구성
const resources = {
  en: {
    common: translationEN,
  },
  ko: {
    common: translationKO,
  },
  ja: {
    common: translationJA,
  },
  'zh-CN': {
    common: translationZH,
  },
  'zh-TW': {
    common: translationZH_TW,
  },
  vi: {
    common: translationVI,
  },
  th: {
    common: translationTH,
  },
};

// i18n 초기화
i18n.use(initReactI18next).init({
  resources,
  lng: 'en', // 기본 언어
  fallbackLng: 'en', // 번역 키가 없을 경우 사용할 언어
  ns: ['common'], // 네임스페이스
  defaultNS: 'common', // 기본 네임스페이스
  interpolation: {
    escapeValue: false, // React에서는 이미 XSS를 처리하므로 불필요
  },
});

// 디바이스의 기본 언어 가져오기
const getDeviceLanguage = (): string => {
  let deviceLanguage = 'en';
  
  if (Platform.OS === 'ios') {
    deviceLanguage = NativeModules.SettingsManager.settings.AppleLocale || 
                     NativeModules.SettingsManager.settings.AppleLanguages[0] || 
                     'en';
  } else if (Platform.OS === 'android') {
    deviceLanguage = NativeModules.I18nManager.localeIdentifier || 'en';
  }
  
  // 언어 코드만 추출 (예: 'en-US' -> 'en')
  deviceLanguage = deviceLanguage.substring(0, 2);
  
  // 지원하는 언어인지 확인하고, 지원하지 않는다면 기본 영어로 설정
  const supportedCodes = Object.values(LANGUAGES).map(lang => lang.code.substring(0, 2));
  return supportedCodes.includes(deviceLanguage) ? deviceLanguage : 'en';
};

// 언어 컨텍스트 값 타입 정의
interface LanguageContextValue {
  language: string;
  setLanguage: (language: string) => void;
  availableLanguages: typeof LANGUAGES;
}

// 컨텍스트 생성
export const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  availableLanguages: LANGUAGES,
});

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * 앱 전체 언어 설정을 관리하는 프로바이더 컴포넌트
 * 
 * 사용자의 언어 선택을 관리하고 i18next 라이브러리를 통해
 * 적절한 언어 리소스를 적용합니다.
 * 
 * @param children 프로바이더 내부에 렌더링될 컴포넌트
 */
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<string>('en');

  // 초기 언어 설정 (저장된 설정 또는 디바이스 언어)
  useEffect(() => {
    const initLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('@language');
        if (savedLanguage) {
          setLanguageState(savedLanguage);
          i18n.changeLanguage(savedLanguage);
        } else {
          const deviceLang = getDeviceLanguage();
          setLanguageState(deviceLang);
          i18n.changeLanguage(deviceLang);
        }
      } catch (error) {
        console.error('Failed to load language preference:', error);
      }
    };

    initLanguage();
  }, []);

  // 언어 변경 함수
  const setLanguage = async (newLanguage: string) => {
    try {
      await AsyncStorage.setItem('@language', newLanguage);
      setLanguageState(newLanguage);
      i18n.changeLanguage(newLanguage);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, availableLanguages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};
