import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import lightTheme from '../styles/themes/light';
import darkTheme from '../styles/themes/dark';

// 테마 종류 정의
export type ThemeType = 'light' | 'dark' | 'system';

// 테마 컨텍스트 값 타입 정의
interface ThemeContextValue {
  theme: typeof lightTheme;
  themeType: ThemeType;
  setThemeType: (type: ThemeType) => void;
  isDarkMode: boolean;
}

// 컨텍스트 생성
export const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  themeType: 'system',
  setThemeType: () => {},
  isDarkMode: false,
});

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * 앱 전체 테마를 관리하는 프로바이더 컴포넌트
 * 
 * 사용자의 테마 선택(라이트, 다크, 시스템)을 관리하고
 * 선택에 따라 적절한 테마를 앱에 적용합니다.
 * 
 * @param children 프로바이더 내부에 렌더링될 컴포넌트
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>('system');
  const [theme, setTheme] = useState(lightTheme);

  // 테마 타입에 따라 실제 테마 설정
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedThemeType = await AsyncStorage.getItem('@theme_type');
        if (savedThemeType) {
          setThemeType(savedThemeType as ThemeType);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };

    loadTheme();
  }, []);

  // 테마 타입이 변경될 때마다 AsyncStorage에 저장
  useEffect(() => {
    const saveThemeType = async () => {
      try {
        await AsyncStorage.setItem('@theme_type', themeType);
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    };

    saveThemeType();
  }, [themeType]);

  // 테마 타입과 시스템 설정에 기반하여 실제 테마 결정
  useEffect(() => {
    const isDark = 
      themeType === 'dark' || 
      (themeType === 'system' && systemColorScheme === 'dark');
    
    setTheme(isDark ? darkTheme : lightTheme);
  }, [themeType, systemColorScheme]);

  // 시스템 테마 변경 감지 (다크모드/라이트모드)
  useEffect(() => {
    if (themeType === 'system') {
      setTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
    }
  }, [systemColorScheme, themeType]);

  const isDarkMode = theme === darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, themeType, setThemeType, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
