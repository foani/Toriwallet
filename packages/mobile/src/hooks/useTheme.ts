import { useContext } from 'react';
import { ThemeContext, ThemeType } from '../contexts/ThemeContext';

/**
 * 테마 관련 기능을 사용하기 위한 훅
 * 
 * 이 훅은 ThemeContext를 통해 현재 테마 정보와 테마 변경 기능을 제공합니다.
 * 
 * @returns {Object} 테마 객체와 테마 관련 함수들
 * @returns {Object} theme - 현재 적용된 테마 객체
 * @returns {string} themeType - 현재 테마 타입 ('light', 'dark', 'system')
 * @returns {Function} setThemeType - 테마 타입을 변경하는 함수
 * @returns {boolean} isDarkMode - 현재 다크모드 적용 여부
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
