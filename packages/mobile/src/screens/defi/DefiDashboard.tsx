import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { useDefi } from '../../hooks/useDefi';
import { useWallet } from '../../hooks/useWallet';
import Card from '../../components/common/Card';
import Header from '../../components/common/Header';
import { DeFiPortfolioData, DeFiProtocol, LiquidityPosition } from '../../types/defi';

/**
 * DeFi 대시보드 화면
 * 사용자의 DeFi 포트폴리오 및 각종 DeFi 프로토콜 통계를 보여줍니다.
 */
const DefiDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { activeWallet, activeNetwork } = useWallet();
  const { 
    getPortfolioData, 
    getProtocols, 
    getYieldOpportunities,
    getLiquidityPositions 
  } = useDefi();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [portfolioData, setPortfolioData] = useState<DeFiPortfolioData | null>(null);
  const [protocols, setProtocols] = useState<DeFiProtocol[]>([]);
  const [liquidityPositions, setLiquidityPositions] = useState<LiquidityPosition[]>([]);

  // 데이터 로드 함수
  const loadData = async () => {
    if (!activeWallet || !activeNetwork) return;
    
    try {
      setLoading(true);
      const portfolio = await getPortfolioData(activeWallet.address, activeNetwork.id);
      const protocolsList = await getProtocols(activeNetwork.id);
      const positions = await getLiquidityPositions(activeWallet.address, activeNetwork.id);
      
      setPortfolioData(portfolio);
      setProtocols(protocolsList);
      setLiquidityPositions(positions);
    } catch (error) {
      console.error('Failed to load DeFi data:', error);
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

  // 메뉴 항목 핸들러
  const handleMenuPress = (screen: string) => {
    navigation.navigate(screen);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title={t('defi:dashboard')} />
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
      <Header title={t('defi:dashboard')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* 포트폴리오 요약 섹션 */}
        <Card style={styles.portfolioCard}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {t('defi:portfolioSummary')}
          </Text>
          <View style={styles.portfolioStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                ${portfolioData?.totalValue.toFixed(2) || '0.00'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t('defi:totalValue')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                ${portfolioData?.totalYield.toFixed(2) || '0.00'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t('defi:totalYield')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      (portfolioData?.yieldPercentage || 0) >= 0
                        ? theme.success
                        : theme.error,
                  },
                ]}
              >
                {(portfolioData?.yieldPercentage || 0).toFixed(2)}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t('defi:apy')}
              </Text>
            </View>
          </View>
        </Card>

        {/* DeFi 메뉴 섹션 */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.cardBackground }]}
            onPress={() => handleMenuPress('Swap')}
          >
            <Text style={[styles.menuTitle, { color: theme.text }]}>
              {t('defi:swap')}
            </Text>
            <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>
              {t('defi:swapDescription')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.cardBackground }]}
            onPress={() => handleMenuPress('Liquidity')}
          >
            <Text style={[styles.menuTitle, { color: theme.text }]}>
              {t('defi:liquidity')}
            </Text>
            <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>
              {t('defi:liquidityDescription')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.cardBackground }]}
            onPress={() => handleMenuPress('Lending')}
          >
            <Text style={[styles.menuTitle, { color: theme.text }]}>
              {t('defi:lending')}
            </Text>
            <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>
              {t('defi:lendingDescription')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.cardBackground }]}
            onPress={() => handleMenuPress('Farms')}
          >
            <Text style={[styles.menuTitle, { color: theme.text }]}>
              {t('defi:farms')}
            </Text>
            <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>
              {t('defi:farmsDescription')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 활성 포지션 */}
        {liquidityPositions.length > 0 && (
          <Card style={styles.positionsCard}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {t('defi:activePositions')}
            </Text>
            {liquidityPositions.map((position, index) => (
              <TouchableOpacity
                key={`position-${index}`}
                style={styles.positionItem}
                onPress={() =>
                  navigation.navigate('PositionDetails', { position })
                }
              >
                <View style={styles.positionLeft}>
                  <Text style={[styles.positionTitle, { color: theme.text }]}>
                    {position.pairName}
                  </Text>
                  <Text
                    style={[styles.positionSubtitle, { color: theme.textSecondary }]}
                  >
                    {position.protocolName}
                  </Text>
                </View>
                <View style={styles.positionRight}>
                  <Text style={[styles.positionValue, { color: theme.text }]}>
                    ${position.value.toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.positionAPY,
                      {
                        color: position.apy >= 0 ? theme.success : theme.error,
                      },
                    ]}
                  >
                    {position.apy.toFixed(2)}% APY
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('AllPositions')}
            >
              <Text style={[styles.viewAllText, { color: theme.primary }]}>
                {t('common:viewAll')}
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* DeFi 프로토콜 리스트 */}
        <Card style={styles.protocolsCard}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {t('defi:protocols')}
          </Text>
          {protocols.map((protocol, index) => (
            <TouchableOpacity
              key={`protocol-${index}`}
              style={styles.protocolItem}
              onPress={() =>
                navigation.navigate('ProtocolDetails', { protocol })
              }
            >
              <View style={styles.protocolLeft}>
                <Text style={[styles.protocolName, { color: theme.text }]}>
                  {protocol.name}
                </Text>
                <Text
                  style={[
                    styles.protocolCategory,
                    { color: theme.textSecondary },
                  ]}
                >
                  {protocol.category}
                </Text>
              </View>
              <View style={styles.protocolRight}>
                <Text style={[styles.protocolTVL, { color: theme.text }]}>
                  TVL: ${protocol.tvl.toLocaleString()}
                </Text>
                <Text
                  style={[styles.protocolAPY, { color: theme.success }]}
                >
                  {protocol.avgApy.toFixed(2)}% APY
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
  portfolioCard: {
    marginTop: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  menuContainer: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 12,
  },
  positionsCard: {
    marginTop: 8,
    padding: 16,
  },
  positionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  positionLeft: {},
  positionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  positionSubtitle: {
    fontSize: 12,
  },
  positionRight: {
    alignItems: 'flex-end',
  },
  positionValue: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  positionAPY: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewAllButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  protocolsCard: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
  },
  protocolItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  protocolLeft: {},
  protocolName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  protocolCategory: {
    fontSize: 12,
  },
  protocolRight: {
    alignItems: 'flex-end',
  },
  protocolTVL: {
    fontSize: 14,
    marginBottom: 4,
  },
  protocolAPY: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default DefiDashboard;
