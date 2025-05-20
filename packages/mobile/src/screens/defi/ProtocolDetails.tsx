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
  Image,
  Dimensions,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../hooks/useTheme';
import { useDefi } from '../../hooks/useDefi';
import { useWallet } from '../../hooks/useWallet';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { DefiStackParamList } from '../../navigation/DefiNavigator';
import { 
  DeFiProtocol, 
  HistoricalData, 
  ProtocolPool, 
  TokenDistribution
} from '../../types/defi';

type ProtocolDetailsRouteProp = RouteProp<DefiStackParamList, 'ProtocolDetails'>;

/**
 * 프로토콜 상세 정보 화면
 * DeFi 프로토콜의 상세 정보, 풀, 통계 등을 보여주는 화면입니다.
 */
const ProtocolDetails: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<ProtocolDetailsRouteProp>();
  const { protocol } = route.params;
  const { activeWallet, activeNetwork } = useWallet();
  const { 
    getProtocolHistory, 
    getProtocolPools, 
    getProtocolTokenDistribution 
  } = useDefi();

  // 상태 관리
  const [loading, setLoading] = useState<boolean>(true);
  const [chartPeriod, setChartPeriod] = useState<'1d' | '1w' | '1m' | 'all'>('1w');
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [pools, setPools] = useState<ProtocolPool[]>([]);
  const [tokenDistribution, setTokenDistribution] = useState<TokenDistribution[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'pools' | 'analytics'>('overview');

  // 데이터 로드 함수
  const loadData = async () => {
    if (!activeNetwork) return;
    
    try {
      setLoading(true);
      
      // 프로토콜 히스토리 데이터 가져오기
      const history = await getProtocolHistory(
        protocol.id,
        activeNetwork.id,
        chartPeriod
      );
      
      // 프로토콜 풀 데이터 가져오기
      const poolsList = await getProtocolPools(
        protocol.id,
        activeNetwork.id
      );
      
      // 토큰 분포 데이터 가져오기
      const distribution = await getProtocolTokenDistribution(
        protocol.id,
        activeNetwork.id
      );
      
      setHistoricalData(history);
      setPools(poolsList);
      setTokenDistribution(distribution);
    } catch (error) {
      console.error('Failed to load protocol data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, [activeWallet, activeNetwork, chartPeriod]);

  // 웹사이트 링크 열기
  const handleOpenWebsite = () => {
    if (protocol.website) {
      Linking.openURL(protocol.website);
    }
  };

  // 풀 선택 처리
  const handlePoolSelect = (pool: ProtocolPool) => {
    navigation.navigate('Liquidity', { pool });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header
          title={protocol.name}
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
        title={protocol.name}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'overview' && {
              borderBottomColor: theme.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab('overview')}
        >
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'overview' ? theme.primary : theme.textSecondary,
              },
            ]}
          >
            {t('defi:overview')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'pools' && {
              borderBottomColor: theme.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab('pools')}
        >
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'pools' ? theme.primary : theme.textSecondary,
              },
            ]}
          >
            {t('defi:pools')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'analytics' && {
              borderBottomColor: theme.primary,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text
            style={[
              styles.tabButtonText,
              {
                color: activeTab === 'analytics' ? theme.primary : theme.textSecondary,
              },
            ]}
          >
            {t('defi:analytics')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'overview' && (
          <>
            {/* 프로토콜 요약 카드 */}
            <Card style={styles.summaryCard}>
              <View style={styles.protocolHeader}>
                {protocol.iconUrl && (
                  <Image
                    source={{ uri: protocol.iconUrl }}
                    style={styles.protocolIcon}
                  />
                )}
                <View style={styles.protocolHeaderInfo}>
                  <Text style={[styles.protocolName, { color: theme.text }]}>
                    {protocol.name}
                  </Text>
                  <Text style={[styles.protocolCategory, { color: theme.textSecondary }]}>
                    {protocol.category}
                  </Text>
                </View>
                {protocol.website && (
                  <TouchableOpacity
                    style={[styles.websiteButton, { borderColor: theme.border }]}
                    onPress={handleOpenWebsite}
                  >
                    <MaterialIcons name="language" size={16} color={theme.primary} />
                    <Text style={[styles.websiteButtonText, { color: theme.primary }]}>
                      {t('common:website')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <Text style={[styles.protocolDescription, { color: theme.text }]}>
                {protocol.description || t('common:noDescription')}
              </Text>
            </Card>
            
            {/* 주요 통계 카드 */}
            <Card style={styles.statsCard}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {t('defi:keyMetrics')}
              </Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    ${protocol.tvl.toLocaleString()}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    {t('defi:tvl')}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    ${protocol.volume24h ? protocol.volume24h.toLocaleString() : 'N/A'}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    {t('defi:volume24h')}
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.success }]}>
                    {protocol.avgApy.toFixed(2)}%
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    {t('defi:avgApy')}
                  </Text>
                </View>
              </View>
            </Card>
            
            {/* TVL 차트 카드 */}
            <Card style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {t('defi:tvlOverTime')}
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
                    decimalPlaces: 0,
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
            
            {/* 인기 풀 카드 */}
            <Card style={styles.topPoolsCard}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {t('defi:topPools')}
              </Text>
              
              {pools.length > 0 ? (
                pools.slice(0, 3).map((pool) => (
                  <TouchableOpacity
                    key={pool.id}
                    style={[styles.poolItem, { borderBottomColor: theme.border }]}
                    onPress={() => handlePoolSelect(pool)}
                  >
                    <View style={styles.poolInfo}>
                      <Text style={[styles.poolName, { color: theme.text }]}>
                        {pool.name}
                      </Text>
                      <Text style={[styles.poolTVL, { color: theme.textSecondary }]}>
                        {t('defi:tvl')}: ${pool.tvl.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.poolAPR}>
                      <Text style={[styles.poolAPRValue, { color: theme.success }]}>
                        {pool.apr.toFixed(2)}%
                      </Text>
                      <Text style={[styles.poolAPRLabel, { color: theme.textSecondary }]}>
                        APR
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
                  {t('defi:noPools')}
                </Text>
              )}
              
              {pools.length > 3 && (
                <TouchableOpacity
                  style={styles.viewMoreButton}
                  onPress={() => setActiveTab('pools')}
                >
                  <Text style={[styles.viewMoreText, { color: theme.primary }]}>
                    {t('common:viewAll')}
                  </Text>
                </TouchableOpacity>
              )}
            </Card>
          </>
        )}
        
        {activeTab === 'pools' && (
          <>
            <Card style={styles.poolsListCard}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {t('defi:availablePools')}
              </Text>
              
              {pools.length > 0 ? (
                pools.map((pool) => (
                  <TouchableOpacity
                    key={pool.id}
                    style={[styles.poolItem, { borderBottomColor: theme.border }]}
                    onPress={() => handlePoolSelect(pool)}
                  >
                    <View style={styles.poolInfo}>
                      <Text style={[styles.poolName, { color: theme.text }]}>
                        {pool.name}
                      </Text>
                      <Text style={[styles.poolTVL, { color: theme.textSecondary }]}>
                        {t('defi:tvl')}: ${pool.tvl.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.poolAPR}>
                      <Text style={[styles.poolAPRValue, { color: theme.success }]}>
                        {pool.apr.toFixed(2)}%
                      </Text>
                      <Text style={[styles.poolAPRLabel, { color: theme.textSecondary }]}>
                        APR
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
                  {t('defi:noPools')}
                </Text>
              )}
            </Card>
            
            <Button
              title={t('defi:provideLiquidity')}
              onPress={() => navigation.navigate('Liquidity')}
              style={styles.actionButton}
            />
          </>
        )}
        
        {activeTab === 'analytics' && (
          <>
            {/* 토큰 분포 차트 */}
            <Card style={styles.distributionCard}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {t('defi:tokenDistribution')}
              </Text>
              
              {tokenDistribution.length > 0 ? (
                <>
                  <PieChart
                    data={tokenDistribution.map((item, index) => ({
                      name: item.token.symbol,
                      value: item.percentage,
                      color: getColorByIndex(index, theme),
                      legendFontColor: theme.text,
                      legendFontSize: 12,
                    }))}
                    width={Dimensions.get('window').width - 48}
                    height={220}
                    chartConfig={{
                      color: () => theme.text,
                    }}
                    accessor="value"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                  
                  <View style={styles.distributionList}>
                    {tokenDistribution.map((item, index) => (
                      <View key={item.token.id} style={styles.distributionItem}>
                        <View style={styles.distributionItemLeft}>
                          <View
                            style={[
                              styles.colorIndicator,
                              { backgroundColor: getColorByIndex(index, theme) },
                            ]}
                          />
                          <Text style={[styles.tokenSymbol, { color: theme.text }]}>
                            {item.token.symbol}
                          </Text>
                        </View>
                        <Text style={[styles.distributionPercentage, { color: theme.text }]}>
                          {item.percentage.toFixed(2)}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
                    {t('defi:noDistributionData')}
                  </Text>
                </View>
              )}
            </Card>
            
            {/* 추가 통계 카드 */}
            <Card style={styles.additionalStatsCard}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {t('defi:additionalMetrics')}
              </Text>
              
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  {t('defi:totalUsers')}
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {protocol.userCount ? protocol.userCount.toLocaleString() : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  {t('defi:dailyActiveUsers')}
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {protocol.dailyActiveUsers ? protocol.dailyActiveUsers.toLocaleString() : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  {t('defi:totalTransactions')}
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {protocol.txCount ? protocol.txCount.toLocaleString() : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  {t('defi:dailyTransactions')}
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {protocol.dailyTxCount ? protocol.dailyTxCount.toLocaleString() : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  {t('defi:feesGenerated24h')}
                </Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  ${protocol.fees24h ? protocol.fees24h.toLocaleString() : 'N/A'}
                </Text>
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// 인덱스에 따른 색상 반환 함수
const getColorByIndex = (index: number, theme: any) => {
  const colors = [
    theme.primary,
    theme.success,
    theme.warning,
    theme.error,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
  ];
  
  return colors[index % colors.length];
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  protocolIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  protocolHeaderInfo: {
    flex: 1,
  },
  protocolName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  protocolCategory: {
    fontSize: 14,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  websiteButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  protocolDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
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
  topPoolsCard: {
    padding: 16,
    marginBottom: 16,
  },
  poolItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  poolInfo: {
    flex: 1,
  },
  poolName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  poolTVL: {
    fontSize: 12,
  },
  poolAPR: {
    alignItems: 'flex-end',
  },
  poolAPRValue: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  poolAPRLabel: {
    fontSize: 12,
  },
  viewMoreButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  poolsListCard: {
    padding: 16,
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 24,
  },
  distributionCard: {
    padding: 16,
    marginBottom: 16,
  },
  distributionList: {
    marginTop: 16,
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  distributionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  tokenSymbol: {
    fontSize: 14,
    fontWeight: '500',
  },
  distributionPercentage: {
    fontSize: 14,
    fontWeight: '500',
  },
  additionalStatsCard: {
    padding: 16,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});

export default ProtocolDetails;
