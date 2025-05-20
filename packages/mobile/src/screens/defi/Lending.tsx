import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useDefi } from '../../hooks/useDefi';
import { useWallet } from '../../hooks/useWallet';
import { useAssets } from '../../hooks/useAssets';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TokenSelector from '../../components/defi/TokenSelector';
import TokenAmountInput from '../../components/common/TokenAmountInput';
import ProgressBar from '../../components/common/ProgressBar';
import { Token } from '../../types/assets';
import { 
  LendingMarket, 
  LendingPosition, 
  LendingAction, 
  BorrowPosition 
} from '../../types/defi';

/**
 * 대출/예치 화면
 * 사용자가 자산을 대출하거나 예치할 수 있는 화면입니다.
 */
const Lending: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { activeWallet, activeNetwork } = useWallet();
  const { getAssetBalance, getTokens } = useAssets();
  const { 
    getLendingMarkets, 
    getLendingPositions, 
    getBorrowPositions,
    deposit, 
    withdraw,
    borrow,
    repay
  } = useDefi();

  // 상태 관리
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [markets, setMarkets] = useState<LendingMarket[]>([]);
  const [supplyPositions, setSupplyPositions] = useState<LendingPosition[]>([]);
  const [borrowPositions, setBorrowPositions] = useState<BorrowPosition[]>([]);
  const [activeTab, setActiveTab] = useState<'supply' | 'borrow'>('supply');
  const [actionType, setActionType] = useState<'deposit' | 'withdraw' | 'borrow' | 'repay'>('deposit');
  const [selectedMarket, setSelectedMarket] = useState<LendingMarket | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<LendingPosition | BorrowPosition | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [showTokenSelector, setShowTokenSelector] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // 계산된 값
  const [healthFactor, setHealthFactor] = useState<number | null>(null);
  const [borrowLimit, setBorrowLimit] = useState<number>(0);
  const [borrowLimitUsed, setBorrowLimitUsed] = useState<number>(0);

  // 데이터 로드 함수
  const loadData = async () => {
    if (!activeWallet || !activeNetwork) return;
    
    try {
      setLoading(true);
      
      // 대출 시장, 포지션 및 토큰 데이터 가져오기
      const marketsList = await getLendingMarkets(activeNetwork.id);
      const supplyPositionsList = await getLendingPositions(
        activeWallet.address,
        activeNetwork.id
      );
      const borrowPositionsList = await getBorrowPositions(
        activeWallet.address,
        activeNetwork.id
      );
      const tokensList = await getTokens(activeNetwork.id);
      
      setMarkets(marketsList);
      setSupplyPositions(supplyPositionsList);
      setBorrowPositions(borrowPositionsList);
      setAvailableTokens(tokensList);
      
      // 대출 한도 및 사용량 계산
      const totalDepositValue = supplyPositionsList.reduce(
        (sum, position) => sum + position.valueUSD,
        0
      );
      const totalBorrowValue = borrowPositionsList.reduce(
        (sum, position) => sum + position.valueUSD,
        0
      );
      
      // 건전성 지표 계산 (1 이상이면 안전)
      const newHealthFactor = totalBorrowValue > 0 
        ? (totalDepositValue * 0.8) / totalBorrowValue 
        : null;
      
      setBorrowLimit(totalDepositValue * 0.8); // 담보율 80% 가정
      setBorrowLimitUsed(totalBorrowValue);
      setHealthFactor(newHealthFactor);
      
    } catch (error) {
      console.error('Failed to load lending data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, [activeWallet, activeNetwork]);

  // 새로고침 처리
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // 마켓 선택 처리
  const handleMarketSelect = (market: LendingMarket) => {
    setSelectedMarket(market);
    setSelectedPosition(null);
    setAmount('');
  };

  // 포지션 선택 처리
  const handlePositionSelect = (position: LendingPosition | BorrowPosition) => {
    setSelectedPosition(position);
    setSelectedMarket(null);
    setAmount('');
  };

  // 최대 금액 설정
  const handleMaxAmount = () => {
    if (actionType === 'deposit' && selectedMarket) {
      const balance = getAssetBalance(selectedMarket.token.id);
      setAmount(balance.toString());
    } else if (actionType === 'withdraw' && selectedPosition) {
      // 인출 가능한 최대 금액 설정
      const position = selectedPosition as LendingPosition;
      setAmount(position.depositedAmount.toString());
    } else if (actionType === 'borrow' && selectedMarket) {
      // 대출 가능한 최대 금액 설정
      const maxBorrowAmount = (borrowLimit - borrowLimitUsed) / selectedMarket.token.price;
      setAmount(Math.max(0, maxBorrowAmount).toFixed(6));
    } else if (actionType === 'repay' && selectedPosition) {
      // 상환 가능한 최대 금액 설정
      const position = selectedPosition as BorrowPosition;
      const balance = getAssetBalance(position.token.id);
      setAmount(Math.min(balance, position.borrowedAmount).toString());
    }
  };

  // 예치 처리
  const handleDeposit = async () => {
    if (!activeWallet || !selectedMarket || !amount || parseFloat(amount) <= 0) {
      Alert.alert(t('common:error'), t('defi:invalidInputs'));
      return;
    }
    
    try {
      setSubmitting(true);
      
      const depositParams: LendingAction = {
        walletAddress: activeWallet.address,
        networkId: activeNetwork?.id || '',
        marketId: selectedMarket.id,
        tokenId: selectedMarket.token.id,
        amount: parseFloat(amount),
      };
      
      const tx = await deposit(depositParams);
      
      // 트랜잭션 성공 후 화면 업데이트
      Alert.alert(
        t('common:success'),
        t('defi:depositSuccess', {
          amount,
          symbol: selectedMarket.token.symbol,
        }),
        [
          {
            text: t('common:viewDetails'),
            onPress: () => navigation.navigate('TransactionDetails', { tx }),
          },
          { 
            text: t('common:ok'),
            onPress: () => loadData(),
          },
        ]
      );
      
      // 입력 초기화
      setAmount('');
      
    } catch (error) {
      console.error('Failed to deposit:', error);
      Alert.alert(t('common:error'), t('defi:depositFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  // 인출 처리
  const handleWithdraw = async () => {
    if (!activeWallet || !selectedPosition || !amount || parseFloat(amount) <= 0) {
      Alert.alert(t('common:error'), t('defi:invalidInputs'));
      return;
    }
    
    try {
      setSubmitting(true);
      
      const position = selectedPosition as LendingPosition;
      const withdrawParams: LendingAction = {
        walletAddress: activeWallet.address,
        networkId: activeNetwork?.id || '',
        marketId: position.marketId,
        tokenId: position.token.id,
        amount: parseFloat(amount),
      };
      
      const tx = await withdraw(withdrawParams);
      
      // 트랜잭션 성공 후 화면 업데이트
      Alert.alert(
        t('common:success'),
        t('defi:withdrawSuccess', {
          amount,
          symbol: position.token.symbol,
        }),
        [
          {
            text: t('common:viewDetails'),
            onPress: () => navigation.navigate('TransactionDetails', { tx }),
          },
          { 
            text: t('common:ok'),
            onPress: () => loadData(),
          },
        ]
      );
      
      // 입력 초기화
      setAmount('');
      
    } catch (error) {
      console.error('Failed to withdraw:', error);
      Alert.alert(t('common:error'), t('defi:withdrawFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  // 대출 처리
  const handleBorrow = async () => {
    if (!activeWallet || !selectedMarket || !amount || parseFloat(amount) <= 0) {
      Alert.alert(t('common:error'), t('defi:invalidInputs'));
      return;
    }
    
    try {
      setSubmitting(true);
      
      const borrowParams: LendingAction = {
        walletAddress: activeWallet.address,
        networkId: activeNetwork?.id || '',
        marketId: selectedMarket.id,
        tokenId: selectedMarket.token.id,
        amount: parseFloat(amount),
      };
      
      const tx = await borrow(borrowParams);
      
      // 트랜잭션 성공 후 화면 업데이트
      Alert.alert(
        t('common:success'),
        t('defi:borrowSuccess', {
          amount,
          symbol: selectedMarket.token.symbol,
        }),
        [
          {
            text: t('common:viewDetails'),
            onPress: () => navigation.navigate('TransactionDetails', { tx }),
          },
          { 
            text: t('common:ok'),
            onPress: () => loadData(),
          },
        ]
      );
      
      // 입력 초기화
      setAmount('');
      
    } catch (error) {
      console.error('Failed to borrow:', error);
      Alert.alert(t('common:error'), t('defi:borrowFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  // 상환 처리
  const handleRepay = async () => {
    if (!activeWallet || !selectedPosition || !amount || parseFloat(amount) <= 0) {
      Alert.alert(t('common:error'), t('defi:invalidInputs'));
      return;
    }
    
    try {
      setSubmitting(true);
      
      const position = selectedPosition as BorrowPosition;
      const repayParams: LendingAction = {
        walletAddress: activeWallet.address,
        networkId: activeNetwork?.id || '',
        marketId: position.marketId,
        tokenId: position.token.id,
        amount: parseFloat(amount),
      };
      
      const tx = await repay(repayParams);
      
      // 트랜잭션 성공 후 화면 업데이트
      Alert.alert(
        t('common:success'),
        t('defi:repaySuccess', {
          amount,
          symbol: position.token.symbol,
        }),
        [
          {
            text: t('common:viewDetails'),
            onPress: () => navigation.navigate('TransactionDetails', { tx }),
          },
          { 
            text: t('common:ok'),
            onPress: () => loadData(),
          },
        ]
      );
      
      // 입력 초기화
      setAmount('');
      
    } catch (error) {
      console.error('Failed to repay:', error);
      Alert.alert(t('common:error'), t('defi:repayFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  // 액션 실행
  const executeAction = () => {
    switch (actionType) {
      case 'deposit':
        handleDeposit();
        break;
      case 'withdraw':
        handleWithdraw();
        break;
      case 'borrow':
        handleBorrow();
        break;
      case 'repay':
        handleRepay();
        break;
    }
  };

  // 액션 버튼 텍스트 생성
  const getActionButtonText = () => {
    switch (actionType) {
      case 'deposit':
        return t('defi:deposit');
      case 'withdraw':
        return t('defi:withdraw');
      case 'borrow':
        return t('defi:borrow');
      case 'repay':
        return t('defi:repay');
    }
  };

  // 버튼 비활성화 여부 확인
  const isActionButtonDisabled = () => {
    if (submitting) return true;
    if (!amount || parseFloat(amount) <= 0) return true;
    
    switch (actionType) {
      case 'deposit':
        return !selectedMarket || 
          (selectedMarket && parseFloat(amount) > getAssetBalance(selectedMarket.token.id));
      case 'withdraw':
        if (!selectedPosition) return true;
        const supplyPosition = selectedPosition as LendingPosition;
        return parseFloat(amount) > supplyPosition.depositedAmount;
      case 'borrow':
        if (!selectedMarket) return true;
        const borrowAmount = parseFloat(amount) * selectedMarket.token.price;
        return borrowAmount > (borrowLimit - borrowLimitUsed);
      case 'repay':
        if (!selectedPosition) return true;
        const borrowPosition = selectedPosition as BorrowPosition;
        return parseFloat(amount) > Math.min(
          getAssetBalance(borrowPosition.token.id),
          borrowPosition.borrowedAmount
        );
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title={t('defi:lending')} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            {t('common:loading')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('defi:lending')} />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'supply' && {
              backgroundColor: theme.primary,
              borderColor: theme.primary,
            },
          ]}
          onPress={() => {
            setActiveTab('supply');
            setActionType('deposit');
            setSelectedMarket(null);
            setSelectedPosition(null);
            setAmount('');
          }}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'supply' ? theme.buttonText : theme.textSecondary,
              },
            ]}
          >
            {t('defi:supply')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'borrow' && {
              backgroundColor: theme.primary,
              borderColor: theme.primary,
            },
          ]}
          onPress={() => {
            setActiveTab('borrow');
            setActionType('borrow');
            setSelectedMarket(null);
            setSelectedPosition(null);
            setAmount('');
          }}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'borrow' ? theme.buttonText : theme.textSecondary,
              },
            ]}
          >
            {t('defi:borrow')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* 대출 한도 요약 */}
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryTitle, { color: theme.text }]}>
            {t('defi:borrowSummary')}
          </Text>
          
          <View style={styles.borrowLimitContainer}>
            <View style={styles.borrowLimitRow}>
              <Text style={[styles.borrowLimitLabel, { color: theme.textSecondary }]}>
                {t('defi:borrowLimit')}
              </Text>
              <Text style={[styles.borrowLimitValue, { color: theme.text }]}>
                ${borrowLimit.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.borrowLimitRow}>
              <Text style={[styles.borrowLimitLabel, { color: theme.textSecondary }]}>
                {t('defi:borrowLimitUsed')}
              </Text>
              <Text style={[styles.borrowLimitValue, { color: theme.text }]}>
                ${borrowLimitUsed.toFixed(2)}
              </Text>
            </View>
            
            <ProgressBar
              progress={borrowLimit > 0 ? (borrowLimitUsed / borrowLimit) : 0}
              height={8}
              backgroundColor={theme.cardBackground}
              progressColor={
                borrowLimitUsed / borrowLimit > 0.8
                  ? theme.error
                  : borrowLimitUsed / borrowLimit > 0.6
                  ? theme.warning
                  : theme.success
              }
              style={styles.progressBar}
            />
          </View>
          
          {healthFactor !== null && (
            <View style={styles.healthFactorContainer}>
              <Text style={[styles.healthFactorLabel, { color: theme.textSecondary }]}>
                {t('defi:healthFactor')}
              </Text>
              <Text
                style={[
                  styles.healthFactorValue,
                  {
                    color:
                      healthFactor < 1.1
                        ? theme.error
                        : healthFactor < 1.5
                        ? theme.warning
                        : theme.success,
                  },
                ]}
              >
                {healthFactor.toFixed(2)}
              </Text>
            </View>
          )}
        </Card>
        
        {/* 액션 선택 */}
        {activeTab === 'supply' ? (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                actionType === 'deposit' && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => {
                setActionType('deposit');
                setSelectedPosition(null);
                setAmount('');
              }}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: actionType === 'deposit' ? theme.buttonText : theme.text,
                  },
                ]}
              >
                {t('defi:deposit')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                actionType === 'withdraw' && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => {
                setActionType('withdraw');
                setSelectedMarket(null);
                setAmount('');
              }}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: actionType === 'withdraw' ? theme.buttonText : theme.text,
                  },
                ]}
              >
                {t('defi:withdraw')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                actionType === 'borrow' && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => {
                setActionType('borrow');
                setSelectedPosition(null);
                setAmount('');
              }}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: actionType === 'borrow' ? theme.buttonText : theme.text,
                  },
                ]}
              >
                {t('defi:borrow')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                actionType === 'repay' && {
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => {
                setActionType('repay');
                setSelectedMarket(null);
                setAmount('');
              }}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: actionType === 'repay' ? theme.buttonText : theme.text,
                  },
                ]}
              >
                {t('defi:repay')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* 대출 시장 목록 */}
        {(actionType === 'deposit' || actionType === 'borrow') && (
          <Card style={styles.marketsCard}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {actionType === 'deposit' ? t('defi:supplyMarkets') : t('defi:borrowMarkets')}
            </Text>
            
            {markets.length > 0 ? (
              markets.map((market) => (
                <TouchableOpacity
                  key={market.id}
                  style={[
                    styles.marketItem,
                    {
                      backgroundColor:
                        selectedMarket?.id === market.id
                          ? theme.selectedItem
                          : theme.cardBackground,
                      borderColor:
                        selectedMarket?.id === market.id
                          ? theme.primary
                          : theme.border,
                    },
                  ]}
                  onPress={() => handleMarketSelect(market)}
                >
                  <View style={styles.marketLeft}>
                    <Text style={[styles.tokenName, { color: theme.text }]}>
                      {market.token.symbol}
                    </Text>
                    <Text style={[styles.marketDetail, { color: theme.textSecondary }]}>
                      {actionType === 'deposit'
                        ? `${t('defi:supplyAPY')}: ${market.supplyAPY.toFixed(2)}%`
                        : `${t('defi:borrowAPY')}: ${market.borrowAPY.toFixed(2)}%`}
                    </Text>
                  </View>
                  <View style={styles.marketRight}>
                    <Text style={[styles.marketTVL, { color: theme.text }]}>
                      ${market.totalSupply.toLocaleString()}
                    </Text>
                    <Text style={[styles.marketDetail, { color: theme.textSecondary }]}>
                      {t('defi:totalSupply')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.noMarketsText, { color: theme.textSecondary }]}>
                {t('defi:noMarkets')}
              </Text>
            )}
          </Card>
        )}
        
        {/* 유저 포지션 목록 */}
        {actionType === 'withdraw' && (
          <Card style={styles.positionsCard}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('defi:yourSupplies')}
            </Text>
            
            {supplyPositions.length > 0 ? (
              supplyPositions.map((position) => (
                <TouchableOpacity
                  key={position.id}
                  style={[
                    styles.positionItem,
                    {
                      backgroundColor:
                        selectedPosition?.id === position.id
                          ? theme.selectedItem
                          : theme.cardBackground,
                      borderColor:
                        selectedPosition?.id === position.id
                          ? theme.primary
                          : theme.border,
                    },
                  ]}
                  onPress={() => handlePositionSelect(position)}
                >
                  <View style={styles.positionLeft}>
                    <Text style={[styles.tokenName, { color: theme.text }]}>
                      {position.token.symbol}
                    </Text>
                    <Text
                      style={[styles.positionDetail, { color: theme.textSecondary }]}
                    >
                      {t('defi:apy')}: {position.apy.toFixed(2)}%
                    </Text>
                  </View>
                  <View style={styles.positionRight}>
                    <Text style={[styles.positionAmount, { color: theme.text }]}>
                      {position.depositedAmount.toFixed(6)} {position.token.symbol}
                    </Text>
                    <Text
                      style={[styles.positionValue, { color: theme.textSecondary }]}
                    >
                      ${position.valueUSD.toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.noPositionsText, { color: theme.textSecondary }]}>
                {t('defi:noSupplies')}
              </Text>
            )}
          </Card>
        )}
        
        {/* 대출 포지션 목록 */}
        {actionType === 'repay' && (
          <Card style={styles.positionsCard}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('defi:yourBorrows')}
            </Text>
            
            {borrowPositions.length > 0 ? (
              borrowPositions.map((position) => (
                <TouchableOpacity
                  key={position.id}
                  style={[
                    styles.positionItem,
                    {
                      backgroundColor:
                        selectedPosition?.id === position.id
                          ? theme.selectedItem
                          : theme.cardBackground,
                      borderColor:
                        selectedPosition?.id === position.id
                          ? theme.primary
                          : theme.border,
                    },
                  ]}
                  onPress={() => handlePositionSelect(position)}
                >
                  <View style={styles.positionLeft}>
                    <Text style={[styles.tokenName, { color: theme.text }]}>
                      {position.token.symbol}
                    </Text>
                    <Text
                      style={[styles.positionDetail, { color: theme.textSecondary }]}
                    >
                      {t('defi:apr')}: {position.apr.toFixed(2)}%
                    </Text>
                  </View>
                  <View style={styles.positionRight}>
                    <Text style={[styles.positionAmount, { color: theme.text }]}>
                      {position.borrowedAmount.toFixed(6)} {position.token.symbol}
                    </Text>
                    <Text
                      style={[styles.positionValue, { color: theme.textSecondary }]}
                    >
                      ${position.valueUSD.toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={[styles.noPositionsText, { color: theme.textSecondary }]}>
                {t('defi:noBorrows')}
              </Text>
            )}
          </Card>
        )}
        
        {/* 액션 양식 */}
        {((actionType === 'deposit' && selectedMarket) || 
         (actionType === 'withdraw' && selectedPosition) || 
         (actionType === 'borrow' && selectedMarket) || 
         (actionType === 'repay' && selectedPosition)) && (
          <Card style={styles.actionCard}>
            <Text style={[styles.actionTitle, { color: theme.text }]}>
              {actionType === 'deposit'
                ? t('defi:depositAsset', { symbol: selectedMarket?.token.symbol })
                : actionType === 'withdraw'
                ? t('defi:withdrawAsset', { symbol: (selectedPosition as LendingPosition).token.symbol })
                : actionType === 'borrow'
                ? t('defi:borrowAsset', { symbol: selectedMarket?.token.symbol })
                : t('defi:repayAsset', { symbol: (selectedPosition as BorrowPosition).token.symbol })}
            </Text>
            
            <View style={styles.amountInputContainer}>
              <View style={styles.amountInputHeader}>
                <Text style={[styles.amountInputLabel, { color: theme.textSecondary }]}>
                  {t('defi:amount')}
                </Text>
                <TouchableOpacity onPress={handleMaxAmount}>
                  <Text style={[styles.maxButton, { color: theme.primary }]}>
                    {t('common:max')}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TokenAmountInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.0"
                keyboardType="decimal-pad"
                maxAmount={
                  actionType === 'deposit' && selectedMarket
                    ? getAssetBalance(selectedMarket.token.id)
                    : actionType === 'withdraw' && selectedPosition
                    ? (selectedPosition as LendingPosition).depositedAmount
                    : actionType === 'borrow' && selectedMarket
                    ? (borrowLimit - borrowLimitUsed) / selectedMarket.token.price
                    : actionType === 'repay' && selectedPosition
                    ? Math.min(
                        getAssetBalance((selectedPosition as BorrowPosition).token.id),
                        (selectedPosition as BorrowPosition).borrowedAmount
                      )
                    : 0
                }
                symbol={
                  actionType === 'deposit'
                    ? selectedMarket?.token.symbol || ''
                    : actionType === 'withdraw'
                    ? (selectedPosition as LendingPosition)?.token.symbol || ''
                    : actionType === 'borrow'
                    ? selectedMarket?.token.symbol || ''
                    : (selectedPosition as BorrowPosition)?.token.symbol || ''
                }
              />
            </View>
            
            {/* 액션 세부 정보 */}
            <View style={styles.actionDetailsContainer}>
              {actionType === 'deposit' && selectedMarket && (
                <>
                  <View style={styles.actionDetailRow}>
                    <Text style={[styles.actionDetailLabel, { color: theme.textSecondary }]}>
                      {t('defi:depositAPY')}
                    </Text>
                    <Text style={[styles.actionDetailValue, { color: theme.success }]}>
                      {selectedMarket.supplyAPY.toFixed(2)}%
                    </Text>
                  </View>
                  <View style={styles.actionDetailRow}>
                    <Text style={[styles.actionDetailLabel, { color: theme.textSecondary }]}>
                      {t('defi:collateralFactor')}
                    </Text>
                    <Text style={[styles.actionDetailValue, { color: theme.text }]}>
                      {selectedMarket.collateralFactor * 100}%
                    </Text>
                  </View>
                </>
              )}
              
              {actionType === 'withdraw' && selectedPosition && (
                <>
                  <View style={styles.actionDetailRow}>
                    <Text style={[styles.actionDetailLabel, { color: theme.textSecondary }]}>
                      {t('defi:currentAPY')}
                    </Text>
                    <Text style={[styles.actionDetailValue, { color: theme.success }]}>
                      {(selectedPosition as LendingPosition).apy.toFixed(2)}%
                    </Text>
                  </View>
                  <View style={styles.actionDetailRow}>
                    <Text style={[styles.actionDetailLabel, { color: theme.textSecondary }]}>
                      {t('defi:healthFactorAfter')}
                    </Text>
                    <Text
                      style={[
                        styles.actionDetailValue,
                        {
                          color: amount && parseFloat(amount) > 0
                            ? calculateNewHealthFactor() < 1.1
                              ? theme.error
                              : calculateNewHealthFactor() < 1.5
                              ? theme.warning
                              : theme.success
                            : theme.text,
                        },
                      ]}
                    >
                      {amount && parseFloat(amount) > 0
                        ? calculateNewHealthFactor().toFixed(2)
                        : healthFactor ? healthFactor.toFixed(2) : 'N/A'}
                    </Text>
                  </View>
                </>
              )}
              
              {actionType === 'borrow' && selectedMarket && (
                <>
                  <View style={styles.actionDetailRow}>
                    <Text style={[styles.actionDetailLabel, { color: theme.textSecondary }]}>
                      {t('defi:borrowAPY')}
                    </Text>
                    <Text style={[styles.actionDetailValue, { color: theme.error }]}>
                      {selectedMarket.borrowAPY.toFixed(2)}%
                    </Text>
                  </View>
                  <View style={styles.actionDetailRow}>
                    <Text style={[styles.actionDetailLabel, { color: theme.textSecondary }]}>
                      {t('defi:healthFactorAfter')}
                    </Text>
                    <Text
                      style={[
                        styles.actionDetailValue,
                        {
                          color: amount && parseFloat(amount) > 0
                            ? calculateNewHealthFactor() < 1.1
                              ? theme.error
                              : calculateNewHealthFactor() < 1.5
                              ? theme.warning
                              : theme.success
                            : theme.text,
                        },
                      ]}
                    >
                      {amount && parseFloat(amount) > 0
                        ? calculateNewHealthFactor().toFixed(2)
                        : healthFactor ? healthFactor.toFixed(2) : 'N/A'}
                    </Text>
                  </View>
                </>
              )}
              
              {actionType === 'repay' && selectedPosition && (
                <>
                  <View style={styles.actionDetailRow}>
                    <Text style={[styles.actionDetailLabel, { color: theme.textSecondary }]}>
                      {t('defi:currentAPR')}
                    </Text>
                    <Text style={[styles.actionDetailValue, { color: theme.error }]}>
                      {(selectedPosition as BorrowPosition).apr.toFixed(2)}%
                    </Text>
                  </View>
                  <View style={styles.actionDetailRow}>
                    <Text style={[styles.actionDetailLabel, { color: theme.textSecondary }]}>
                      {t('defi:healthFactorAfter')}
                    </Text>
                    <Text
                      style={[
                        styles.actionDetailValue,
                        {
                          color: amount && parseFloat(amount) > 0
                            ? calculateNewHealthFactor() < 1.1
                              ? theme.error
                              : calculateNewHealthFactor() < 1.5
                              ? theme.warning
                              : theme.success
                            : theme.text,
                        },
                      ]}
                    >
                      {amount && parseFloat(amount) > 0
                        ? calculateNewHealthFactor().toFixed(2)
                        : healthFactor ? healthFactor.toFixed(2) : 'N/A'}
                    </Text>
                  </View>
                </>
              )}
            </View>
            
            <Button
              title={getActionButtonText()}
              onPress={executeAction}
              disabled={isActionButtonDisabled()}
              loading={submitting}
              style={styles.actionButton}
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  // 액션 후 건전성 지표 계산 함수
  function calculateNewHealthFactor(): number {
    if (!amount || parseFloat(amount) <= 0 || !healthFactor) return healthFactor || 0;
    
    let newSupplyValue = supplyPositions.reduce(
      (sum, position) => sum + position.valueUSD,
      0
    );
    let newBorrowValue = borrowPositions.reduce(
      (sum, position) => sum + position.valueUSD,
      0
    );
    
    switch (actionType) {
      case 'deposit':
        if (selectedMarket) {
          newSupplyValue += parseFloat(amount) * selectedMarket.token.price;
        }
        break;
      case 'withdraw':
        if (selectedPosition) {
          const position = selectedPosition as LendingPosition;
          newSupplyValue -= parseFloat(amount) * position.token.price;
        }
        break;
      case 'borrow':
        if (selectedMarket) {
          newBorrowValue += parseFloat(amount) * selectedMarket.token.price;
        }
        break;
      case 'repay':
        if (selectedPosition) {
          const position = selectedPosition as BorrowPosition;
          newBorrowValue -= parseFloat(amount) * position.token.price;
        }
        break;
    }
    
    // 새로운 값으로 건전성 지표 계산
    return newBorrowValue > 0 ? (newSupplyValue * 0.8) / newBorrowValue : 999;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  borrowLimitContainer: {
    marginBottom: 16,
  },
  borrowLimitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  borrowLimitLabel: {
    fontSize: 14,
  },
  borrowLimitValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    marginTop: 8,
  },
  healthFactorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  healthFactorLabel: {
    fontSize: 14,
  },
  healthFactorValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  marketsCard: {
    padding: 16,
    marginBottom: 16,
  },
  positionsCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  marketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  marketLeft: {
    flex: 1,
  },
  marketRight: {
    alignItems: 'flex-end',
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  marketDetail: {
    fontSize: 14,
  },
  marketTVL: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  noMarketsText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  positionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  positionLeft: {
    flex: 1,
  },
  positionRight: {
    alignItems: 'flex-end',
  },
  positionDetail: {
    fontSize: 14,
  },
  positionAmount: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  positionValue: {
    fontSize: 14,
  },
  noPositionsText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  actionCard: {
    padding: 16,
    marginBottom: 24,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  amountInputContainer: {
    marginBottom: 16,
  },
  amountInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountInputLabel: {
    fontSize: 14,
  },
  maxButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionDetailsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  actionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionDetailLabel: {
    fontSize: 14,
  },
  actionDetailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Lending;
