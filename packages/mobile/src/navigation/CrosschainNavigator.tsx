import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// 크로스체인 화면 임포트
import { ICPTransfer, Bridge, History, CrosschainDetails } from '../screens/crosschain';

// 크로스체인 스택 네비게이터 타입 정의
export type CrosschainStackParamList = {
  ICPTransfer: undefined;
  Bridge: undefined;
  History: undefined;
  CrosschainDetails: {
    txHash: string;
    type: 'ICP_TRANSFER' | 'BRIDGE' | 'SWAP';
    sourceNetwork: string;
    targetNetwork: string;
    sourceToken?: string;
    targetToken?: string;
    amount: string;
    recipient: string;
    sender?: string;
    provider?: string;
    fee: string;
    estimatedTime?: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    timestamp: number;
    completedAt?: number;
    error?: string;
    blockExplorerUrlSource?: string;
    blockExplorerUrlTarget?: string;
  };
};

// 크로스체인 스택 네비게이터 생성
const CrosschainStack = createStackNavigator<CrosschainStackParamList>();

/**
 * 크로스체인 관련 화면을 위한 스택 네비게이터
 * 
 * ICP 전송, 브릿지, 히스토리, 트랜잭션 상세 화면에 접근할 수 있습니다.
 */
const CrosschainNavigator = () => {
  return (
    <CrosschainStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <CrosschainStack.Screen name="History" component={History} />
      <CrosschainStack.Screen name="ICPTransfer" component={ICPTransfer} />
      <CrosschainStack.Screen name="Bridge" component={Bridge} />
      <CrosschainStack.Screen name="CrosschainDetails" component={CrosschainDetails} />
    </CrosschainStack.Navigator>
  );
};

export default CrosschainNavigator;
