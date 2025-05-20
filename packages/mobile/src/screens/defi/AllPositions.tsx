import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform,
  StatusBar,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { useDefi } from '../../hooks/useDefi';
import { useWallet } from '../../hooks/useWallet';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import TabView from '../../components/common/TabView';
import { LiquidityPosition, FarmingPosition, LendingPosition } from '../../../core/src/types/defi';

type PositionType = 'all' | 'liquidity' | 'farming' | 'lending';

/**
 * 모든 DeFi 포지션을 보여주는 화면
 * 사용자의 모든 유동성, 농사(파밍), 대출 포지션을 카테고리별로 나누어 표시합니다.
 */
const AllPositions: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { activeWallet, activeNetwork } = useWallet();
  const { 
    getLiquidityPositions, 
    getFarmingPositions, 
    getLendingPositions 
  } = useDefi();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<PositionType>('all');
  const [liquidityPositions, setLiquidityPositions] = useState<LiquidityPosition[]>([]);
  const [farmingPositions, setFarmingPositions] = useState<FarmingPosition[]>([]);
  const [lendingPositions, setLendingPositions] = useState<LendingPosition[]>([]);

  // 데이터 로드 함수
  const loadData = async () => {
    if (!activeWallet || !activeNetwork) return;
    
    try {
      setLoading(true);
      
      const liquidityData = await getLiquidityPositions(activeWallet.address, activeNetwork.id);
      const farmingData = await getFarmingPositions(activeWallet.address, activeNetwork.id);
      const lendingData = await getLendingPositions(activeWallet.address, activeNetwork.id);
      
      setLiquidityPositions(liquidityData);
      setFarmingPositions(farmingData);
      setLendingPositions(lendingData);
    } catch (error) {
      console.error('Failed to load positions data:', error);
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

  // 필터링된 포지션 가져오기
  const getFilteredPositions = () => {
    switch(activeTab) {
      case 'liquidity':
        return liquidityPositions;
      case 'farming':
        return farmingPositions;
      case 'lending':
        return lendingPositions;
      case 'all':
      default:
        // 모든 포지션을 유형별로 구분하여 표시
        return [
          ...liquidityPositions.map(p => ({ ...p, type: 'liquidity' as const })),
          ...farmingPositions.map(p => ({ ...p, type: 'farming' as const })),
          ...lendingPositions.map(p => ({ ...p, type: 'lending' as const })),
        ];
    }
  };

  // 탭 메뉴 구성
  const tabs = [
    { key: 'all', title: t('defi:allPositions') },
    { key: 'liquidity', title: t('defi:liquidityPositions') },
    { key: 'farming', title: t('defi:farmingPositions') },
    { key: 'lending', title: t('defi:lendingPositions') },
  ];

  // 포지션 항목 렌더링
  const renderPositionItem = ({ item, index }: { item: any, index: number }) => {
    const positionType = item.type || activeTab;
    
    // 포지션 타입에 따라 다른 UI 렌더링
    switch(positionType) {
      case 'liquidity': {
        const liquidityItem = item as LiquidityPosition;
        return (
          <TouchableOpacity
            style={[styles.positionItem, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate('PositionDetails', { position: liquidityItem, type: 'liquidity' })}
          >
            <View style={styles.positionHeader}>
              <Text style={[styles.positionTitle, { color: theme.text }]}>
                {liquidityItem.pool.name}
              </Text>
              <View style={[styles.positionTypeBadge, { backgroundColor: theme.primary }]}>
                <Text style={[styles.positionTypeBadgeText, { color: theme.white }]}>
                  {t('defi:liquidity')}
                </Text>
              </View>
            </View>
            <Text style={[styles.positionSubtitle, { color: theme.textSecondary }]}>
              {liquidityItem.pool.platform}
            </Text>
            <View style={styles.positionDetails}>
              <View style={styles.positionDetailItem}>
                <Text style={[styles.positionDetailLabel, { color: theme.textSecondary }]}>
                  {t('defi:value')}
                </Text>
                <Text style={[styles.positionDetailValue, { color: theme.text }]}>
                  ${parseFloat(liquidityItem.totalValueLockedUsd).toFixed(2)}
                </Text>
              </View>
              <View style={styles.positionDetailItem}>
                <Text style={[styles.positionDetailLabel, { color: theme.textSecondary }]}>
                  {t('defi:apy')}
                </Text>
                <Text style={[styles.positionDetailValue, { color: theme.success }]}>
                  {liquidityItem.pool.apy.toFixed(2)}%
                </Text>
              </View>
              <View style={styles.positionDetailItem}>
                <Text style={[styles.positionDetailLabel, { color: theme.textSecondary }]}>
                  {t('defi:share')}
                </Text>
                <Text style={[styles.positionDetailValue, { color: theme.text }]}>
                  {liquidityItem.share.toFixed(4)}%
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }
      
      case 'farming': {
        const farmingItem = item as FarmingPosition;
        return (
          <TouchableOpacity
            style={[styles.positionItem, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate('PositionDetails', { position: farmingItem, type: 'farming' })}
          >
            <View style={styles.positionHeader}>
              <Text style={[styles.positionTitle, { color: theme.text }]}>
                {farmingItem.pool.name}
              </Text>
              <View style={[styles.positionTypeBadge, { backgroundColor: theme.accent }]}>
                <Text style={[styles.positionTypeBadgeText, { color: theme.white }]}>
                  {t('defi:farming')}
                </Text>
              </View>
            </View>
            <Text style={[styles.positionSubtitle, { color: theme.textSecondary }]}>
              {farmingItem.pool.platform}
            </Text>
            <View style={styles.positionDetails}>
              <View style={styles.positionDetailItem}>
                <Text style={[styles.positionDetailLabel, { color: theme.textSecondary }]}>
                  {t('defi:value')}
                </Text>
                <Text style={[styles.positionDetailValue, { color: theme.text }]}>
                  ${parseFloat(farmingItem.totalValueLockedUsd).toFixed(2)}
                </Text>
              </View>
              <View style={styles.positionDetailItem}>
                <Text style={[styles.positionDetailLabel, { color: theme.textSecondary }]}>
                  {t('defi:apy')}
                </Text>
                <Text style={[styles.positionDetailValue, { color: theme.success }]}>
                  {farmingItem.apy.toFixed(2)}%
                </Text>
              </View>
              {farmingItem.pendingRewards && farmingItem.pendingRewards.length > 0 && (
                <View style={styles.positionDetailItem}>
                  <Text style={[styles.positionDetailLabel, { color: theme.textSecondary }]}>
                    {t('defi:rewards')}
                  </Text>
                  <Text style={[styles.positionDetailValue, { color: theme.warning }]}>
                    ${farmingItem.pendingRewards.reduce((sum, reward) => sum + parseFloat(reward.amountUsd), 0).toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      }
      
      case 'lending': {
        const lendingItem = item as LendingPosition;
        return (
          <TouchableOpacity
            style={[styles.positionItem, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate('PositionDetails', { position: lendingItem, type: 'lending' })}
          >
            <View style={styles.positionHeader}>
              <Text style={[styles.positionTitle, { color: theme.text }]}>
                {lendingItem.pool.token.symbol}
              </Text>
              <View style={[styles.positionTypeBadge, { backgroundColor: lendingItem.isSupplying ? theme.info : theme.warning }]}>
                <Text style={[styles.positionTypeBadgeText, { color: theme.white }]}>
                  {lendingItem.isSupplying ? t('defi:supply') : t('defi:borrow')}
                </Text>
              </View>
            </View>
            <Text style={[styles.positionSubtitle, { color: theme.textSecondary }]}>
              {lendingItem.pool.platform}
            </Text>
            <View style={styles.positionDetails}>
              {lendingItem.isSupplying && (
                <View style={styles.positionDetailItem}>
                  <Text style={[styles.positionDetailLabel, { color: theme.textSecondary }]}>
                    {t('defi:supplied')}
                  </Text>
                  <Text style={[styles.positionDetailValue, { color: theme.text }]}>
                    ${parseFloat(lendingItem.supplyAmountUsd || '0').toFixed(2)}
                  </Text>
                </View>
              )}
              {lendingItem.isBorrowing && (
                <View style={styles.positionDetailItem}>
                  <Text style={[styles.positionDetailLabel, { color: theme.textSecondary }]}>
                    {t('defi:borrowed')}
                  </Text>
                  <Text style={[styles.positionDetailValue, { color: theme.text }]}>
                    ${parseFloat(lendingItem.borrowAmountUsd || '0').toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={styles.positionDetailItem}>
                <Text style={[styles.positionDetailLabel, { color: theme.textSecondary }]}>
                  {lendingItem.isSupplying ? t('defi:supplyApy') : t('defi:borrowApr')}
                </Text>
                <Text style={[styles.positionDetailValue, { 
                  color: lendingItem.isSupplying ? theme.success : theme.error 
                }]}>
                  {lendingItem.isSupplying 
                    ? lendingItem.pool.supplyApy.toFixed(2) 
                    : lendingItem.pool.borrowApy.toFixed(2)}%
                </Text>
              </View>
              {lendingItem.healthFactor !== undefined && (
                <View style={styles.positionDetailItem}>
                  <Text style={[styles.positionDetailLabel, { color: theme.textSecondary }]}>
                    {t('defi:healthFactor')}
                  </Text>
                  <Text style={[styles.positionDetailValue, { 
                    color: lendingItem.healthFactor > 1.5 
                      ? theme.success 
                      : lendingItem.healthFactor > 1.1 
                      ? theme.warning 
                      : theme.error 
                  }]}>
                    {lendingItem.healthFactor.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      }
      
      default:
        return null;
    }
  };

  // 빈 상태 렌더링
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        {t('defi:noPositionsFound')}
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('DefiDashboard')}
      >
        <Text style={[styles.emptyButtonText, { color: theme.white }]}>
          {t('defi:exploreDeFi')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title={t('defi:positions')} showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            {t('common:loading')}
          </Text>
        </View>
      </View>
    );
  }

  const filteredPositions = getFilteredPositions();
  const totalValue = filteredPositions.reduce((sum, position) => {
    if ('totalValueLockedUsd' in position) {
      return sum + parseFloat(position.totalValueLockedUsd);
    } else if (position.type === 'lending') {
      const lendingPos = position as unknown as LendingPosition;
      const supplyValue = parseFloat(lendingPos.supplyAmountUsd || '0');
      return sum + supplyValue;
    }
    return sum;
  }, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={t('defi:positions')} showBackButton />
      
      {/* 총 포트폴리오 가치 요약 */}
      <Card style={styles.summaryCard}>
        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
          {t('defi:totalPortfolioValue')}
        </Text>
        <Text style={[styles.summaryValue, { color: theme.text }]}>
          ${totalValue.toFixed(2)}
        </Text>
        <Text style={[styles.summaryCount, { color: theme.textSecondary }]}>
          {t('defi:totalPositionsCount', { count: filteredPositions.length })}
        </Text>
      </Card>
      
      {/* 포지션 탭 메뉴 */}
      <TabView
        tabs={tabs}
        activeKey={activeTab}
        onTabChange={(key) => setActiveTab(key as PositionType)}
      />
      
      {/* 포지션 목록 */}
      <FlatList
        data={filteredPositions}
        keyExtractor={(item, index) => `position-${item.id || index}`}
        renderItem={renderPositionItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
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
  summaryCard: {
    margin: 16,
    padding: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  positionItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  positionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  positionTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  positionTypeBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  positionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  positionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  positionDetailItem: {
    minWidth: '30%',
    marginVertical: 4,
  },
  positionDetailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  positionDetailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AllPositions;
