import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useDefi } from '../../hooks/useDefi';
import { useWallet } from '../../hooks/useWallet';
import Header from '../../components/common/Header';
import { SwapTransaction } from '../../types/defi';

/**
 * 스왑 내역 화면
 * 사용자의 토큰 스왑 내역을 보여주는 화면입니다.
 */
const SwapHistory: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { activeWallet, activeNetwork } = useWallet();
  const { getSwapHistory } = useDefi();

  // 상태 관리
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [swapHistory, setSwapHistory] = useState<SwapTransaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  // 데이터 로드 함수
  const loadData = async () => {
    if (!activeWallet || !activeNetwork) return;
    
    try {
      setLoading(true);
      
      const history = await getSwapHistory(
        activeWallet.address,
        activeNetwork.id
      );
      
      setSwapHistory(history);
    } catch (error) {
      console.error('Failed to load swap history:', error);
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

  // 필터링된 스왑 내역
  const filteredSwaps = swapHistory.filter(
    (swap) => filter === 'all' || swap.status === filter
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header 
          title={t('defi:swapHistory')} 
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
        title={t('defi:swapHistory')} 
        showBackButton 
        onBackPress={() => navigation.goBack()}
      />
      
      {/* 필터 버튼 */}
      <View style={styles.filterContainer}>
        <ScrollableFilter
          options={[
            { value: 'all', label: t('common:all') },
            { value: 'completed', label: t('common:completed') },
            { value: 'pending', label: t('common:pending') },
            { value: 'failed', label: t('common:failed') },
          ]}
          selectedValue={filter}
          onSelect={(value) => setFilter(value as any)}
          theme={theme}
        />
      </View>
      
      {/* 스왑 내역 목록 */}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={filteredSwaps}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SwapHistoryItem
            swap={item}
            onPress={() => navigation.navigate('TransactionDetails', { tx: item.txHash })}
            theme={theme}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="history"
              size={48}
              color={theme.textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {t('defi:noSwapHistory')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

// 스크롤 가능한 필터 컴포넌트
type FilterOption = {
  value: string;
  label: string;
};

type ScrollableFilterProps = {
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  theme: any;
};

const ScrollableFilter: React.FC<ScrollableFilterProps> = ({
  options,
  selectedValue,
  onSelect,
  theme,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterScrollContent}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.filterButton,
            {
              backgroundColor:
                selectedValue === option.value
                  ? theme.primary
                  : theme.cardBackground,
              borderColor:
                selectedValue === option.value ? theme.primary : theme.border,
            },
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text
            style={[
              styles.filterButtonText,
              {
                color:
                  selectedValue === option.value
                    ? theme.buttonText
                    : theme.textSecondary,
              },
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// 스왑 내역 항목 컴포넌트
type SwapHistoryItemProps = {
  swap: SwapTransaction;
  onPress: () => void;
  theme: any;
};

const SwapHistoryItem: React.FC<SwapHistoryItemProps> = ({
  swap,
  onPress,
  theme,
}) => {
  return (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: theme.cardBackground }]}
      onPress={onPress}
    >
      <View style={styles.historyItemHeader}>
        <View style={styles.tokenPair}>
          <Text style={[styles.tokenPairText, { color: theme.text }]}>
            {swap.fromToken.symbol} → {swap.toToken.symbol}
          </Text>
        </View>
        <StatusBadge status={swap.status} theme={theme} />
      </View>
      
      <View style={styles.swapDetails}>
        <View style={styles.swapAmount}>
          <Text style={[styles.amountText, { color: theme.text }]}>
            {swap.fromAmount.toFixed(6)} {swap.fromToken.symbol}
          </Text>
          <MaterialIcons
            name="arrow-right-alt"
            size={16}
            color={theme.textSecondary}
            style={styles.arrowIcon}
          />
          <Text style={[styles.amountText, { color: theme.text }]}>
            {swap.toAmount.toFixed(6)} {swap.toToken.symbol}
          </Text>
        </View>
        <Text style={[styles.timeText, { color: theme.textSecondary }]}>
          {new Date(swap.timestamp).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// 상태 배지 컴포넌트
type StatusBadgeProps = {
  status: string;
  theme: any;
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, theme }) => {
  let backgroundColor;
  let textColor = theme.buttonText;
  
  switch (status) {
    case 'completed':
      backgroundColor = theme.success;
      break;
    case 'pending':
      backgroundColor = theme.warning;
      break;
    case 'failed':
      backgroundColor = theme.error;
      break;
    default:
      backgroundColor = theme.textSecondary;
  }
  
  return (
    <View style={[styles.statusBadge, { backgroundColor }]}>
      <Text style={[styles.statusText, { color: textColor }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
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
  filterContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  filterScrollContent: {
    paddingBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  historyItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenPair: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenPairText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  swapDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  swapAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '500',
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  timeText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SwapHistory;
