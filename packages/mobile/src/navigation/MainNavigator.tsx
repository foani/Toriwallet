import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

// 스크린 임포트
import Dashboard from '../screens/wallet/Dashboard';
import Send from '../screens/wallet/Send';
import Receive from '../screens/wallet/Receive';
import TransactionHistory from '../screens/wallet/TransactionHistory';
import TransactionDetails from '../screens/wallet/TransactionDetails';
import NFTGallery from '../screens/nft/NFTGallery';
import NFTDetails from '../screens/nft/NFTDetails';
import SendNFT from '../screens/nft/SendNFT';
import BrowserScreen from '../screens/dapp/BrowserScreen';
import DAppsList from '../screens/dapp/DAppsList';
import Settings from '../screens/settings/Settings';
import Security from '../screens/settings/Security';
import Networks from '../screens/settings/Networks';
import Language from '../screens/settings/Language';
import Theme from '../screens/settings/Theme';
import About from '../screens/settings/About';
import CrosschainNavigator from './CrosschainNavigator';
import StakingNavigator from './StakingNavigator';
import { useTheme } from '../hooks/useTheme';

// 중첩 스택 네비게이터 타입 정의
export type WalletStackParamList = {
  Dashboard: undefined;
  Send: { address?: string; amount?: string; tokenSymbol?: string };
  Receive: undefined;
  TransactionHistory: undefined;
  TransactionDetails: { txHash: string };
};

// 스테이킹 타입은 StakingNavigator에서 정의됨

export type NFTStackParamList = {
  NFTGallery: undefined;
  NFTDetails: { tokenId: string; contractAddress: string };
  SendNFT: { tokenId: string; contractAddress: string };
};

export type DAppStackParamList = {
  DAppsList: undefined;
  BrowserScreen: { url: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
  Security: undefined;
  Networks: undefined;
  Language: undefined;
  Theme: undefined;
  About: undefined;
};

// 탭 네비게이터 타입 정의
export type MainTabParamList = {
  WalletStack: undefined;
  CrosschainStack: undefined;
  StakingStack: undefined;
  NFTStack: undefined;
  DAppStack: undefined;
  SettingsStack: undefined;
};

// 스택 네비게이터 생성
const WalletStack = createStackNavigator<WalletStackParamList>();
// StakingNavigator로 대체
const NFTStack = createStackNavigator<NFTStackParamList>();
const DAppStack = createStackNavigator<DAppStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();

// 중첩 스택 네비게이터
const WalletStackNavigator = () => {
  return (
    <WalletStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <WalletStack.Screen name="Dashboard" component={Dashboard} />
      <WalletStack.Screen name="Send" component={Send} />
      <WalletStack.Screen name="Receive" component={Receive} />
      <WalletStack.Screen name="TransactionHistory" component={TransactionHistory} />
      <WalletStack.Screen name="TransactionDetails" component={TransactionDetails} />
    </WalletStack.Navigator>
  );
};

// StakingNavigator로 대체됨

const NFTStackNavigator = () => {
  return (
    <NFTStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <NFTStack.Screen name="NFTGallery" component={NFTGallery} />
      <NFTStack.Screen name="NFTDetails" component={NFTDetails} />
      <NFTStack.Screen name="SendNFT" component={SendNFT} />
    </NFTStack.Navigator>
  );
};

const DAppStackNavigator = () => {
  return (
    <DAppStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <DAppStack.Screen name="DAppsList" component={DAppsList} />
      <DAppStack.Screen name="BrowserScreen" component={BrowserScreen} />
    </DAppStack.Navigator>
  );
};

const SettingsStackNavigator = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <SettingsStack.Screen name="Settings" component={Settings} />
      <SettingsStack.Screen name="Security" component={Security} />
      <SettingsStack.Screen name="Networks" component={Networks} />
      <SettingsStack.Screen name="Language" component={Language} />
      <SettingsStack.Screen name="Theme" component={Theme} />
      <SettingsStack.Screen name="About" component={About} />
    </SettingsStack.Navigator>
  );
};

// 탭 네비게이터 생성
const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * 메인 앱 네비게이션을 위한 탭 네비게이터
 * 
 * 지갑, 크로스체인, 스테이킹, NFT, dApp, 설정 등 앱의 주요 섹션에 대한 접근을 제공합니다.
 * 각 탭은 자체 내비게이션 스택을 가지고 있어 세부 화면으로의 이동이 가능합니다.
 */
const MainNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'WalletStack') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'CrosschainStack') {
            iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
          } else if (route.name === 'StakingStack') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'NFTStack') {
            iconName = focused ? 'image' : 'image-outline';
          } else if (route.name === 'DAppStack') {
            iconName = focused ? 'globe' : 'globe-outline';
          } else if (route.name === 'SettingsStack') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="WalletStack"
        component={WalletStackNavigator}
        options={{ tabBarLabel: 'Wallet' }}
      />
      <Tab.Screen
        name="CrosschainStack"
        component={CrosschainNavigator}
        options={{ tabBarLabel: 'Crosschain' }}
      />
      <Tab.Screen
        name="StakingStack"
        component={StakingNavigator}
        options={{ tabBarLabel: 'Staking' }}
      />
      <Tab.Screen
        name="NFTStack"
        component={NFTStackNavigator}
        options={{ tabBarLabel: 'NFT' }}
      />
      <Tab.Screen
        name="DAppStack"
        component={DAppStackNavigator}
        options={{ tabBarLabel: 'dApps' }}
      />
      <Tab.Screen
        name="SettingsStack"
        component={SettingsStackNavigator}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
