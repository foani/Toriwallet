import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// 스테이킹 화면 임포트
import { StakingScreen, Validators, Stake, Unstake, Rewards } from '../screens/staking';

// 스테이킹 스택 네비게이터 타입 정의
export type StakingStackParamList = {
  StakingScreen: undefined;
  Validators: undefined;
  Stake: { validatorId: string };
  Unstake: { 
    validatorId: string;
    stakedAmount: string;
    lockEndDate: number;
  };
  Rewards: undefined;
};

// 스테이킹 스택 네비게이터 생성
const StakingStack = createStackNavigator<StakingStackParamList>();

/**
 * 스테이킹 관련 화면을 위한 스택 네비게이터
 * 
 * 스테이킹 대시보드, 검증인 목록, 스테이킹, 언스테이킹, 보상 화면에 접근할 수 있습니다.
 */
const StakingNavigator = () => {
  return (
    <StakingStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <StakingStack.Screen name="StakingScreen" component={StakingScreen} />
      <StakingStack.Screen name="Validators" component={Validators} />
      <StakingStack.Screen name="Stake" component={Stake} />
      <StakingStack.Screen name="Unstake" component={Unstake} />
      <StakingStack.Screen name="Rewards" component={Rewards} />
    </StakingStack.Navigator>
  );
};

export default StakingNavigator;
