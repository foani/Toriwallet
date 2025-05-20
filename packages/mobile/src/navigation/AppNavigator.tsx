import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/onboarding/SplashScreen';
import { useWallet } from '../hooks/useWallet';

// 스택 네비게이터 타입 정의
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

/**
 * 앱의 최상위 네비게이션 컴포넌트
 * 
 * 스플래시 화면, 인증 화면, 메인 앱 화면 간의 네비게이션을 관리합니다.
 * 사용자의 인증 상태에 따라 적절한 초기 화면을 결정합니다.
 */
const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isInitialized, hasWallet } = useWallet();

  // 앱 초기화 시 인증 상태 확인
  useEffect(() => {
    const checkAuthState = async () => {
      // 실제 구현에서는 지갑 초기화 상태를 체크하는 로직이 들어갑니다
      // 데모를 위해 짧은 지연 추가
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    };

    checkAuthState();
  }, [isInitialized]);

  if (isLoading) {
    // 앱 초기화 중에는 스플래시 화면 표시
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {hasWallet ? (
        // 지갑이 있으면 메인 화면으로
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        // 지갑이 없으면 인증 화면으로
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
