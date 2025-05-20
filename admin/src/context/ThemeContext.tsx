import React, { createContext, useContext, useEffect, useState } from 'react';
import { ChakraProvider, ColorModeScript, extendTheme, type ThemeConfig } from '@chakra-ui/react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const THEME_KEY = 'tori_admin_theme';

// 테마 설정
const themeConfig: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: false,
};

// 테마 확장
const theme = extendTheme({
  config: themeConfig,
  colors: {
    brand: {
      50: '#e5f4ff',
      100: '#b8ddff',
      200: '#8ac5ff',
      300: '#5badff',
      400: '#2d95ff',
      500: '#147be6',
      600: '#0c60b4',
      700: '#054582',
      800: '#022a51',
      900: '#001021',
    },
  },
  fonts: {
    heading: "'Noto Sans KR', sans-serif",
    body: "'Noto Sans KR', sans-serif",
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.500',
          color: 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.600',
          },
        }),
      },
    },
    Card: {
      baseStyle: (props: any) => ({
        bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
        borderRadius: 'md',
        boxShadow: 'md',
      }),
    },
  },
});

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // 로컬 스토리지에서 테마 가져오기
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    return savedTheme || 'light';
  });

  useEffect(() => {
    // 테마 변경 시 로컬 스토리지에 저장
    localStorage.setItem(THEME_KEY, mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setThemeMode }}>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={mode} />
        {children}
      </ChakraProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
