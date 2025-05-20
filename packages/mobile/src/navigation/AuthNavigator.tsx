import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Welcome from '../screens/onboarding/Welcome';
import CreateWallet from '../screens/onboarding/CreateWallet';
import ImportWallet from '../screens/onboarding/ImportWallet';
import BackupSeed from '../screens/onboarding/BackupSeed';
import VerifySeed from '../screens/onboarding/VerifySeed';
import SetPasscode from '../screens/onboarding/SetPasscode';
import BiometricSetup from '../screens/onboarding/BiometricSetup';

// 인증 스택 네비게이터 타입 정의
export type AuthStackParamList = {
  Welcome: undefined;
  CreateWallet: undefined;
  ImportWallet: undefined;
  BackupSeed: { mnemonic: string };
  VerifySeed: { mnemonic: string };
  SetPasscode: { mnemonic: string; isImported?: boolean };
  BiometricSetup: { walletId: string };
};

const Stack = createStackNavigator<AuthStackParamList>();

/**
 * 인증 및 온보딩 관련 화면들을 위한 네비게이터
 * 
 * 앱 초기 설정, 지갑 생성/복구, 보안 설정 등을 위한 화면들을 포함합니다.
 */
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="CreateWallet" component={CreateWallet} />
      <Stack.Screen name="ImportWallet" component={ImportWallet} />
      <Stack.Screen name="BackupSeed" component={BackupSeed} />
      <Stack.Screen name="VerifySeed" component={VerifySeed} />
      <Stack.Screen name="SetPasscode" component={SetPasscode} />
      <Stack.Screen name="BiometricSetup" component={BiometricSetup} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
