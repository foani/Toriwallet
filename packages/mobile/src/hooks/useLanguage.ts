import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../contexts/LanguageContext';

/**
 * 다국어 지원 기능을 사용하기 위한 훅
 * 
 * 이 훅은 LanguageContext와 react-i18next의 useTranslation을 결합하여
 * 다국어 관련 기능들을 쉽게 사용할 수 있도록 합니다.
 * 
 * @returns {Object} 언어 관련 객체와 함수들
 * @returns {Function} t - 번역 함수 (react-i18next의 t 함수)
 * @returns {string} language - 현재 사용 중인 언어 코드
 * @returns {Function} setLanguage - 언어를 변경하는 함수
 * @returns {Object} availableLanguages - 사용 가능한 언어 목록
 * @returns {Function} i18n - i18next 인스턴스 (고급 기능 사용 시 필요)
 */
export const useLanguage = () => {
  const { t, i18n } = useTranslation('common');
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return {
    t,
    i18n,
    ...context,
  };
};
