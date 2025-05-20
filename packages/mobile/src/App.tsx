import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import { StatusBar } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { WalletProvider } from './contexts/WalletContext';
import { NetworkProvider } from './contexts/NetworkContext';
import { NotificationProvider } from './contexts/NotificationContext';

/**
 * 토리(TORI) 지갑 앱의 메인 컴포넌트
 * 
 * 이 컴포넌트는 애플리케이션의 최상위 컴포넌트로서 다양한 Context Provider와
 * 네비게이션 컨테이너를 설정하고 관리합니다.
 */
const App = () => {
  // 앱이 처음 로드될 때 스플래시 화면 숨기기
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <LanguageProvider>
        <ThemeProvider>
          <WalletProvider>
            <NetworkProvider>
              <NotificationProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              </NotificationProvider>
            </NetworkProvider>
          </WalletProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
};

export default App;
