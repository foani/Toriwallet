import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { 
  DefiDashboard, 
  Liquidity, 
  Swap, 
  Lending 
} from '../screens/defi';
import SwapHistory from '../screens/defi/SwapHistory';
import PositionDetails from '../screens/defi/PositionDetails';
import ProtocolDetails from '../screens/defi/ProtocolDetails';
import AllPositions from '../screens/defi/AllPositions';

// DeFi 스택 네비게이션 파라미터 타입 정의
export type DefiStackParamList = {
  DefiDashboard: undefined;
  Swap: undefined;
  SwapHistory: undefined;
  Liquidity: { pool?: any; position?: any };
  Lending: undefined;
  PositionDetails: { position: any };
  ProtocolDetails: { protocol: any };
  AllPositions: undefined;
};

const Stack = createStackNavigator<DefiStackParamList>();

/**
 * DeFi 네비게이션 스택
 * DeFi 관련 화면들 사이의 네비게이션을 관리합니다.
 */
const DefiNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="DefiDashboard" component={DefiDashboard} />
      <Stack.Screen name="Swap" component={Swap} />
      <Stack.Screen name="SwapHistory" component={SwapHistory} />
      <Stack.Screen name="Liquidity" component={Liquidity} />
      <Stack.Screen name="Lending" component={Lending} />
      <Stack.Screen name="PositionDetails" component={PositionDetails} />
      <Stack.Screen name="ProtocolDetails" component={ProtocolDetails} />
      <Stack.Screen name="AllPositions" component={AllPositions} />
    </Stack.Navigator>
  );
};

export default DefiNavigator;
