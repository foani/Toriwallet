import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../hooks/useTheme';
import { useDefi } from '../../hooks/useDefi';
import { useWallet } from '../../hooks/useWallet';
import { useAssets } from '../../hooks/useAssets';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { DefiStackParamList } from '../../navigation/DefiNavigator';
import { LiquidityPosition, HistoricalData } from '../../types/defi';

type PositionDetailsRouteProp = RouteProp<DefiStackParamList, 'PositionDetails'>;

/**
 * 포지션 상세 정보 화면
 * 사용자의 유동성 풀 포지션 상세 정보를 보여주는 화면입니다.
 */
const PositionDetails: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<PositionDetailsRouteProp>();
  const { position } = route.params;
  const { activeWallet, activeNetwork } = useWallet();
  const { removeLiquidity, getPositionHistory } = useDefi();
  const { getAssetBalance } = useAssets();

  // 상태 관리
  const [loading, setLoading] = useState<boolean>(true);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'1d' | '1w' | '1m' | 'all'>('1w');
  const [removePercentage, setRemovePercentage] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 데이터 로드 함수
  const loadData = async () => {
    if (!activeWallet || !activeNetwork) return;
    
    try {
      setLoading(true);
      
      // 포지션 히스토리 데이터 가져오기
      const history = await getPositionHistory(
        position.id,
        activeWallet.address,
        activeNetwork.id,
        chartPeriod
      );
      
      setHistoricalData(history);
    } catch (error) {
      console.error('Failed to load position history:', error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, [activeWallet, activeNetwork, chartPeriod]);

  // 유동성 제거 처리
  const handleRemoveLiquidity = async () => {
    if (!activeWallet || !activeNetwork || removePercentage <= 0) {
      Alert.alert(t('common:error'), t('defi:invalidInputs'));
      return;
    }
    
    try {
      setSubmitting(true);
      
      const tx = await removeLiquidity({
        walletAddress: activeWallet.address,
        networkId: activeNetwork.id,
        poolId: position.poolId,
        percentageToRemove: removePercentage,
      });
      
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
            onPress: () => navigation.goBack(),
          },
        ]
      );
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
        <Header
          title={t('defi:positionDetails')}
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
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
      <Header
        title={t('defi:positionDetails')}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 포지션 요약 카드 */}
        <Card style={styles.summaryCard}>
          <Text style={[styles.poolName, { color: theme.text }]}>
            {position.pairName}
          </Text>
          <Text style={[styles.protocolName, { color: theme.textSecondary }]}>
            {position.protocolName}
          </Text>
          
          <View style={styles.valueRow}>
            <Text style={[styles.valueLabel, { color: theme.textSecondary }]}>
              {t('defi:positionValue')}
            </Text>
            <Text style={[styles.valueAmount, { color: theme.text }]}>
              ${position.value.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.apyRow}>
            <Text style={[styles.apyLabel, { color: theme.textSecondary }]}>
              {t('defi:apy')}
            </Text>
            <Text style={[styles.apyValue, { color: theme.success }]}>
              {position.apy.toFixed(2)}%
            </Text>
          </View>
        </Card>
        
        {/* 토큰 금액 카드 */}
        <Card style={styles.tokensCard}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {t('defi:yourLiquidity')}
          </Text>
          
          <View style={styles.tokenAmountRow}>
            <Text style={[styles.tokenSymbol, { color: theme.text }]}>
              {position.token0Symbol}:
            </Text>
            <Text style={[styles.tokenAmount, { color: theme.text }]}>
              {position.token0Amount.toFixed(6)}
            </Text>
          </View>
          
          <View style={styles.tokenAmountRow}>
            <Text style={[styles.tokenSymbol, { color: theme.text }]}>
              {position.token1Symbol}:
            </Text>
            <Text style={[styles.tokenAmount, { color: theme.text }]}>
              {position.token1Amount.toFixed(6)}
            </Text>
          </View>
        </Card>
        
        {/* 가치 변화 차트 */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {t('defi:valueOverTime')}
            </Text>
            <View style={styles.periodSelector}>
              {(['1d', '1w', '1m', 'all'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    chartPeriod === period && {
                      backgroundColor: theme.primary,
                    },
                  ]}
                  onPress={() => setChartPeriod(period)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      {
                        color:
                          chartPeriod === period
                            ? theme.buttonText
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    {period === '1d'
                      ? t('defi:oneDay')
                      : period === '1w'
                      ? t('defi:oneWeek')
                      : period === '1m'
                      ? t('defi:oneMonth')
                      : t('defi:all')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {historicalData.length > 0 ? (
            <LineChart
              data={{
                labels: historicalData.map((data) => {
                  const date = new Date(data.timestamp);
                  return chartPeriod === '1d'
                    ? `${date.getHours()}:00`
                    : chartPeriod === '1w'
                    ? date.toLocaleDateString('en-US', { weekday: 'short' })
                    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }),
                datasets: [
                  {
                    data: historicalData.map((data) => data.value),
                    color: () => theme.primary,
                  },
                ],
              }}
              width={Dimensions.get('window').width - 48}
              height={220}
              yAxisLabel="$"
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: theme.cardBackground,
                backgroundGradientFrom: theme.cardBackground,
                backgroundGradientTo: theme.cardBackground,
                decimalPlaces: 2,
                color: () => theme.primary,
                labelColor: () => theme.textSecondary,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: theme.primary,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
                {t('defi:noChartData')}
              </Text>
            </View>
          )}
        </Card>
        
        {/* 풀 정보 카드 */}
        <Card style={styles.poolInfoCard}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {t('defi:poolInformation')}
          </Text>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              {t('defi:poolAddress')}
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {position.poolId.slice(0, 8)}...{position.poolId.slice(-6)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              {t('defi:poolFee')}
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {position.fee ? `${position.fee}%` : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              {t('defi:tvl')}
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              ${position.tvl ? position.tvl.toLocaleString() : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              {t('defi:volume24h')}
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              ${position.volume24h ? position.volume24h.toLocaleString() : 'N/A'}
            </Text>
          </View>
        </Card>
        
        {/* 유동성 제거 카드 */}
        <Card style={styles.removeCard}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {t('defi:removeLiquidity')}
          </Text>
          
          <Text style={[styles.removeDescription, { color: theme.textSecondary }]}>
            {t('defi:removeLiquidityDescription')}
          </Text>
          
          <Text style={[styles.percentageLabel, { color: theme.textSecondary }]}>
            {t('defi:percentageToRemove')}: {removePercentage}%
          </Text>
          
          <View style={styles.percentageButtons}>
            {[25, 50, 75, 100].map((percentage) => (
              <TouchableOpacity
                key={`percentage-${percentage}`}
                style={[
                  styles.percentageButton,
                  {
                    backgroundColor:
                      removePercentage === percentage ? theme.primary : theme.cardBackground,
                    borderColor:
                      removePercentage === percentage ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setRemovePercentage(percentage)}
              >
                <Text
                  style={[
                    styles.percentageButtonText,
                    {
                      color:
                        removePercentage === percentage ? theme.buttonText : theme.text,
                    },
                  ]}
                >
                  {percentage}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {removePercentage > 0 && (
            <View style={styles.receiveContainer}>
              <Text style={[styles.receiveTitle, { color: theme.text }]}>
                {t('defi:youWillReceive')}:
              </Text>
              
              <View style={styles.receiveRow}>
                <Text style={[styles.receiveAmount, { color: theme.text }]}>
                  {(position.token0Amount * removePercentage / 100).toFixed(6)} {position.token0Symbol}
                </Text>
              </View>
              
              <View style={styles.receiveRow}>
                <Text style={[styles.receiveAmount, { color: theme.text }]}>
                  {(position.token1Amount * removePercentage / 100).toFixed(6)} {position.token1Symbol}
                </Text>
              </View>
            </View>
          )}
          
          <Button
            title={t('defi:removeLiquidity')}
            onPress={handleRemoveLiquidity}
            disabled={removePercentage <= 0 || submitting}
            loading={submitting}
            style={styles.removeButton}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
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
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  poolName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  protocolName: {
    fontSize: 14,
    marginBottom: 16,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  valueLabel: {
    fontSize: 14,
  },
  valueAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  apyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  apyLabel: {
    fontSize: 14,
  },
  apyValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  tokensCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  tokenAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tokenSymbol: {
    fontSize: 14,
    fontWeight: '500',
  },
  tokenAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartCard: {
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  periodSelector: {
    flexDirection: 'row',
  },
  periodButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 4,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
  },
  poolInfoCard: {
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeCard: {
    padding: 16,
    marginBottom: 24,
  },
  removeDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  percentageLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  percentageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  percentageButton: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  percentageButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  receiveContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  receiveTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  receiveRow: {
    marginBottom: 8,
  },
  receiveAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    marginTop: 8,
  },
});

export default PositionDetails;
