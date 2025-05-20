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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { useDefi } from '../../hooks/useDefi';
import { useWallet } from '../../hooks/useWallet';
import { useAssets } from '../../hooks/useAssets';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import AssetSelector from '../../components/wallet/AssetSelector';
import TokenAmountInput from '../../components/common/TokenAmountInput';
import { 
  LiquidityPool, 
  LiquidityPosition, 
  DeFiTransaction,
  LiquidityAction
} from '../../types/defi';

/**
 * 유동성 풀 화면
 * 사용자가 유동성 풀에 자산을 추가하거나 제거할 수 있는 화면입니다.
 */
const Liquidity: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<RouteProp<any, any>>();
  const { activeWallet, activeNetwork } = useWallet();
  const { getAssetBalance, getTokenPrice } = useAssets();
  const { 
    getLiquidityPools, 
    getLiquidityPositions, 
    addLiquidity, 
    removeLiquidity 
  } = useDefi();

  // 상태 관리
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [positions, setPositions] = useState<LiquidityPosition[]>([]);
  const [activeTab, setActiveTab] = useState<'provide' | 'remove'>('provide');
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<LiquidityPosition | null>(null);
  const [amount0, setAmount0] = useState<string>('');
  const [amount1, setAmount1] = useState<string>('');
  const [removePercentage, setRemovePercentage] = useState<number>(0);
  const [isTokenSelectorVisible, setIsTokenSelectorVisible] = useState<boolean>(false);
  const [currentTokenSelect, setCurrentTokenSelect] = useState<'token0' | 'token1'>('token0');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 데이터 로드 함수
  const loadData = async () => {
    if (!activeWallet || !activeNetwork) return;
    
    try {
      setLoading(true);
      
      // 유동성 풀과 현재 포지션 데이터 가져오기
      const poolsList = await getLiquidityPools(activeNetwork.id);
      const positionsList = await getLiquidityPositions(
        activeWallet.address,
        activeNetwork.id
      );
      
      setPools(poolsList);
      setPositions(positionsList);
      
      // 라우트 파라미터에서 특정 풀/포지션 초기값 받기
      const initialPool = route.params?.pool;
      const initialPosition = route.params?.position;
      
      if (initialPool) {
        setSelectedPool(initialPool);
      }
      
      if (initialPosition) {
        setSelectedPosition(initialPosition);
        setActiveTab('remove');
      }
    } catch (error) {
      console.error('Failed to load liquidity data:', error);
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

  // 풀 선택 핸들러
  const handlePoolSelect = (pool: LiquidityPool) => {
    setSelectedPool(pool);
    setAmount0('');
    setAmount1('');
  };

  // 유동성 포지션 선택 핸들러
  const handlePositionSelect = (position: LiquidityPosition) => {
    setSelectedPosition(position);
    setRemovePercentage(0);
  };

  // 토큰 금액 변경 핸들러
  const handleAmount0Change = (value: string) => {
    setAmount0(value);
    if (selectedPool) {
      const amount0Value = parseFloat(value) || 0;
      const amount1Value = amount0Value * selectedPool.price;
      setAmount1(amount1Value.toFixed(6));
    }
  };

  const handleAmount1Change = (value: string) => {
    setAmount1(value);
    if (selectedPool) {
      const amount1Value = parseFloat(value) || 0;
      const amount0Value = amount1Value / selectedPool.price;
      setAmount0(amount0Value.toFixed(6));
    }
  };

  // 유동성 제거 비율 설정
  const handlePercentageChange = (percentage: number) => {
    setRemovePercentage(percentage);
  };

  // 유동성 추가 처리
  const handleAddLiquidity = async () => {
    if (!activeWallet || !selectedPool || !amount0 || !amount1) {
      Alert.alert(t('common:error'), t('defi:invalidInputs'));
      return;
    }
    
    try {
      setSubmitting(true);
      
      const addLiquidityParams: LiquidityAction = {
        walletAddress: activeWallet.address,
        networkId: activeNetwork?.id || '',
        poolId: selectedPool.id,
        token0Amount: parseFloat(amount0),
        token1Amount: parseFloat(amount1),
      };
      
      const tx = await addLiquidity(addLiquidityParams);
      
      // 트랜잭션 성공 후 화면 업데이트
      Alert.alert(
        t('common:success'),
        t('defi:liquidityAddedSuccess'),
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
      setAmount0('');
      setAmount1('');
    } catch (error) {
      console.error('Failed to add liquidity:', error);
      Alert.alert(t('common:error'), t('defi:liquidityAddFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  // 유동성 제거 처리
  const handleRemoveLiquidity = async () => {
    if (!activeWallet || !selectedPosition || removePercentage <= 0) {
      Alert.alert(t('common:error'), t('defi:invalidInputs'));
      return;
    }
    
    try {
      setSubmitting(true);
      
      const removeLiquidityParams: LiquidityAction = {
        walletAddress: activeWallet.address,
        networkId: activeNetwork?.id || '',
        poolId: selectedPosition.poolId,
        percentageToRemove: removePercentage,
      };
      
      const tx = await removeLiquidity(removeLiquidityParams);
      
      // 트랜잭션 성공 후 화면 업데이트
      Alert.alert(
        t('common:success'),
        t('defi:liquidityRemovedSuccess'),
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
      setRemovePercentage(0);
      setSelectedPosition(null);
    } catch (error) {
      console.error('Failed to remove liquidity:', error);
      Alert.alert(t('common:error'), t('defi:liquidityRemoveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title={t('defi:liquidity')} />
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
      <Header title={t('defi:liquidity')} />
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'provide' && {
              backgroundColor: theme.primary,
              borderColor: theme.primary,
            },
          ]}
          onPress={() => setActiveTab('provide')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'provide' ? theme.buttonText : theme.textSecondary,
              },
            ]}
          >
            {t('defi:provide')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'remove' && {
              backgroundColor: theme.primary,
              borderColor: theme.primary,
            },
          ]}
          onPress={() => setActiveTab('remove')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'remove' ? theme.buttonText : theme.textSecondary,
              },
            ]}
          >
            {t('defi:remove')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'provide' ? (
          // 유동성 추가 폼
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('defi:selectPool')}
            </Text>
            <Card style={styles.poolsContainer}>
              {pools.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.poolsScrollContent}
                >
                  {pools.map((pool) => (
                    <TouchableOpacity
                      key={pool.id}
                      style={[
                        styles.poolItem,
                        {
                          backgroundColor:
                            selectedPool?.id === pool.id
                              ? theme.selectedItem
                              : theme.cardBackground,
                          borderColor:
                            selectedPool?.id === pool.id
                              ? theme.primary
                              : theme.border,
                        },
                      ]}
                      onPress={() => handlePoolSelect(pool)}
                    >
                      <Text style={[styles.poolName, { color: theme.text }]}>
                        {pool.name}
                      </Text>
                      <Text
                        style={[styles.poolStats, { color: theme.textSecondary }]}
                      >
                        TVL: ${pool.tvl.toLocaleString()}
                      </Text>
                      <Text style={[styles.poolAPR, { color: theme.success }]}>
                        APR: {pool.apr.toFixed(2)}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <Text style={[styles.noPools, { color: theme.textSecondary }]}>
                  {t('defi:noPools')}
                </Text>
              )}
            </Card>

            {selectedPool && (
              <Card style={styles.addLiquidityCard}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {t('defi:addLiquidity')}
                </Text>
                <Text style={[styles.poolDetail, { color: theme.textSecondary }]}>
                  {selectedPool.name} • {t('defi:fee')}: {selectedPool.fee}%
                </Text>

                {/* 첫 번째 토큰 입력 */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    {t('defi:firstToken')}
                  </Text>
                  <View style={styles.tokenInputRow}>
                    <TouchableOpacity
                      style={[styles.tokenSelector, { borderColor: theme.border }]}
                      onPress={() => {
                        setCurrentTokenSelect('token0');
                        // setIsTokenSelectorVisible(true);
                      }}
                    >
                      <Text style={[styles.tokenSymbol, { color: theme.text }]}>
                        {selectedPool.token0.symbol}
                      </Text>
                    </TouchableOpacity>
                    <TokenAmountInput
                      value={amount0}
                      onChangeText={handleAmount0Change}
                      placeholder="0.0"
                      keyboardType="decimal-pad"
                      containerStyle={styles.amountInput}
                      maxAmount={getAssetBalance(selectedPool.token0.id)}
                      symbol={selectedPool.token0.symbol}
                    />
                  </View>
                </View>

                {/* 두 번째 토큰 입력 */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    {t('defi:secondToken')}
                  </Text>
                  <View style={styles.tokenInputRow}>
                    <TouchableOpacity
                      style={[styles.tokenSelector, { borderColor: theme.border }]}
                      onPress={() => {
                        setCurrentTokenSelect('token1');
                        // setIsTokenSelectorVisible(true);
                      }}
                    >
                      <Text style={[styles.tokenSymbol, { color: theme.text }]}>
                        {selectedPool.token1.symbol}
                      </Text>
                    </TouchableOpacity>
                    <TokenAmountInput
                      value={amount1}
                      onChangeText={handleAmount1Change}
                      placeholder="0.0"
                      keyboardType="decimal-pad"
                      containerStyle={styles.amountInput}
                      maxAmount={getAssetBalance(selectedPool.token1.id)}
                      symbol={selectedPool.token1.symbol}
                    />
                  </View>
                </View>

                {/* 유동성 추가 예상 정보 */}
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                      {t('defi:shareOfPool')}:
                    </Text>
                    <Text style={[styles.summaryValue, { color: theme.text }]}>
                      {parseFloat(amount0) > 0
                        ? ((parseFloat(amount0) * selectedPool.token0.price) /
                            (selectedPool.tvl + parseFloat(amount0) * selectedPool.token0.price) *
                            100).toFixed(4)
                        : '0.0000'}%
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                      {t('defi:expectedAPR')}:
                    </Text>
                    <Text style={[styles.summaryValue, { color: theme.success }]}>
                      {selectedPool.apr.toFixed(2)}%
                    </Text>
                  </View>
                </View>

                <Button
                  title={t('defi:addLiquidity')}
                  onPress={handleAddLiquidity}
                  disabled={!amount0 || !amount1 || submitting}
                  loading={submitting}
                  style={styles.actionButton}
                />
              </Card>
            )}
          </View>
        ) : (
          // 유동성 제거 폼
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t('defi:yourPositions')}
            </Text>
            <Card style={styles.positionsContainer}>
              {positions.length > 0 ? (
                positions.map((position) => (
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
                    <View style={styles.positionDetails}>
                      <Text style={[styles.poolName, { color: theme.text }]}>
                        {position.pairName}
                      </Text>
                      <Text
                        style={[
                          styles.positionStats,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {t('defi:value')}: ${position.value.toFixed(2)}
                      </Text>
                      <View style={styles.tokenAmounts}>
                        <Text style={[styles.tokenAmount, { color: theme.text }]}>
                          {position.token0Amount.toFixed(6)} {position.token0Symbol}
                        </Text>
                        <Text style={[styles.tokenAmount, { color: theme.text }]}>
                          {position.token1Amount.toFixed(6)} {position.token1Symbol}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.positionAPY, { color: theme.success }]}>
                      APY: {position.apy.toFixed(2)}%
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text
                  style={[styles.noPositions, { color: theme.textSecondary }]}
                >
                  {t('defi:noPositions')}
                </Text>
              )}
            </Card>

            {selectedPosition && (
              <Card style={styles.removeLiquidityCard}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {t('defi:removeLiquidity')}
                </Text>
                <Text style={[styles.poolDetail, { color: theme.textSecondary }]}>
                  {selectedPosition.pairName} • {t('defi:value')}: ${selectedPosition.value.toFixed(2)}
                </Text>

                {/* 제거할 비율 선택 */}
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  {t('defi:percentageToRemove')}: {removePercentage}%
                </Text>
                <View style={styles.percentageButtons}>
                  {[25, 50, 75, 100].map((percentage) => (
                    <TouchableOpacity
                      key={`percentage-${percentage}`}
                      style={[
                        styles.percentButton,
                        {
                          backgroundColor:
                            removePercentage === percentage
                              ? theme.primary
                              : theme.cardBackground,
                          borderColor:
                            removePercentage === percentage
                              ? theme.primary
                              : theme.border,
                        },
                      ]}
                      onPress={() => handlePercentageChange(percentage)}
                    >
                      <Text
                        style={[
                          styles.percentButtonText,
                          {
                            color:
                              removePercentage === percentage
                                ? theme.buttonText
                                : theme.text,
                          },
                        ]}
                      >
                        {percentage}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 제거 예상 정보 */}
                <View style={styles.summaryContainer}>
                  <Text style={[styles.summaryTitle, { color: theme.text }]}>
                    {t('defi:youWillReceive')}:
                  </Text>
                  <View style={styles.receiveList}>
                    <View style={styles.receiveItem}>
                      <Text style={[styles.receiveValue, { color: theme.text }]}>
                        {(selectedPosition.token0Amount * removePercentage / 100).toFixed(6)}
                      </Text>
                      <Text style={[styles.receiveSymbol, { color: theme.textSecondary }]}>
                        {selectedPosition.token0Symbol}
                      </Text>
                    </View>
                    <View style={styles.receiveItem}>
                      <Text style={[styles.receiveValue, { color: theme.text }]}>
                        {(selectedPosition.token1Amount * removePercentage / 100).toFixed(6)}
                      </Text>
                      <Text style={[styles.receiveSymbol, { color: theme.textSecondary }]}>
                        {selectedPosition.token1Symbol}
                      </Text>
                    </View>
                  </View>
                </View>

                <Button
                  title={t('defi:removeLiquidity')}
                  onPress={handleRemoveLiquidity}
                  disabled={removePercentage <= 0 || submitting}
                  loading={submitting}
                  style={styles.actionButton}
                />
              </Card>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  poolsContainer: {
    padding: 16,
    marginBottom: 16,
  },
  poolsScrollContent: {
    paddingBottom: 8,
  },
  poolItem: {
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    borderWidth: 1,
  },
  poolName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  poolStats: {
    fontSize: 14,
    marginBottom: 6,
  },
  poolAPR: {
    fontSize: 14,
    fontWeight: '500',
  },
  noPools: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  addLiquidityCard: {
    padding: 16,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  poolDetail: {
    fontSize: 14,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  tokenInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenSelector: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '500',
  },
  amountInput: {
    flex: 1,
  },
  summaryContainer: {
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    marginTop: 8,
  },
  positionsContainer: {
    padding: 16,
    marginBottom: 16,
  },
  positionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  positionDetails: {
    flex: 1,
  },
  positionStats: {
    fontSize: 14,
    marginVertical: 4,
  },
  tokenAmounts: {
    marginTop: 8,
  },
  tokenAmount: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  positionAPY: {
    fontSize: 14,
    fontWeight: '600',
  },
  noPositions: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  removeLiquidityCard: {
    padding: 16,
    marginBottom: 24,
  },
  percentageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  percentButton: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  percentButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  receiveList: {
    marginTop: 8,
  },
  receiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiveValue: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  receiveSymbol: {
    fontSize: 14,
  },
});

export default Liquidity;
