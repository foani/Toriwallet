import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

// 컴포넌트
import Header from '../../components/common/Header';
import EmptyState from '../../components/common/EmptyState';
import TransactionItem from '../../components/wallet/TransactionItem';

// 훅
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { useTheme } from '../../hooks/useTheme';

// 서비스
import { TransactionService } from '../../services/transaction/transaction-service';

// 타입
import { Transaction, TransactionType, TransactionStatus } from '../../types/transaction';
import { Asset } from '../../types/assets';

// 트랜잭션 필터 타입
type TransactionFilter = 'all' | 'sent' | 'received' | 'swapped' | 'staked';

const TransactionHistory: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 훅 사용
  const { activeWallet, activeAccount } = useWallet();
  const { currentNetwork, networks } = useNetwork();
  
  // 트랜잭션 서비스 초기화
  const transactionService = new TransactionService();

  // 상태 관리
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<TransactionFilter>('all');
  const [selectedNetworkIndex, setSelectedNetworkIndex] = useState(0);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAssetSelector, setShowAssetSelector] = useState(false);

  // 필터 옵션
  const filterOptions: TransactionFilter[] = ['all', 'sent', 'received', 'swapped', 'staked'];
  
  // 네트워크 목록
  const availableNetworks = [{ id: 'all', name: t('transactions.allNetworks') }, ...networks];

  // 트랜잭션 목록 가져오기
  const fetchTransactions = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setPage(1);
    } else if (!isRefresh && page === 1) {
      setLoading(true);
    } else {
      setLoadMoreLoading(true);
    }

    try {
      if (!activeAccount) {
        setTransactions([]);
        return;
      }

      const params = {
        address: activeAccount.address,
        network: selectedNetworkIndex === 0 ? undefined : availableNetworks[selectedNetworkIndex].id,
        asset: selectedAsset?.id,
        type: selectedFilter === 'all' ? undefined : selectedFilter,
        page: isRefresh ? 1 : page,
        limit: 20,
      };

      const result = await transactionService.getTransactions(params);
      
      // 새로고침 또는 첫 페이지인 경우 결과를 대체, 그렇지 않으면 결과를 추가
      if (isRefresh || page === 1) {
        setTransactions(result.transactions);
      } else {
        setTransactions(prev => [...prev, ...result.transactions]);
      }
      
      // 더 불러올 트랜잭션이 있는지 확인
      setHasMoreTransactions(result.hasMore);
      
      // 페이지 증가 (더 불러오기 함수에서 사용)
      if (!isRefresh && result.hasMore) {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadMoreLoading(false);
    }
  }, [activeAccount, selectedNetworkIndex, availableNetworks, selectedAsset, selectedFilter, page, transactionService]);

  // 컴포넌트 마운트 또는 의존성 변경 시 트랜잭션 가져오기
  useEffect(() => {
    fetchTransactions(false);
  }, [fetchTransactions, selectedNetworkIndex, selectedFilter, selectedAsset]);

  // 새로고침 핸들러
  const handleRefresh = () => {
    fetchTransactions(true);
  };

  // 더 불러오기 핸들러
  const handleLoadMore = () => {
    if (!loadMoreLoading && hasMoreTransactions) {
      fetchTransactions(false);
    }
  };

  // 트랜잭션 필터 변경 핸들러
  const handleFilterChange = (filter: TransactionFilter) => {
    setSelectedFilter(filter);
  };

  // 네트워크 변경 핸들러
  const handleNetworkChange = (index: number) => {
    setSelectedNetworkIndex(index);
  };

  // 자산 선택 변경 핸들러
  const handleAssetChange = (asset: Asset | null) => {
    setSelectedAsset(asset);
    setShowAssetSelector(false);
  };

  // 트랜잭션 항목 클릭 핸들러
  const handleTransactionPress = (transaction: Transaction) => {
    navigation.navigate('TransactionDetails' as never, { txHash: transaction.hash } as never);
  };

  // 트랜잭션 필터링 버튼 렌더링
  const renderFilterButtons = () => {
    return (
      <View style={styles.filterButtonsContainer}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.selectedFilterButton,
              {
                backgroundColor: selectedFilter === filter 
                  ? theme.colors.primary + '33' 
                  : theme.colors.card,
                borderColor: selectedFilter === filter 
                  ? theme.colors.primary 
                  : theme.colors.border,
              }
            ]}
            onPress={() => handleFilterChange(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                {
                  color: selectedFilter === filter 
                    ? theme.colors.primary 
                    : theme.colors.secondaryText
                }
              ]}
            >
              {t(`transactions.filters.${filter}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 네트워크 선택기 렌더링
  const renderNetworkSelector = () => {
    return (
      <View style={styles.networkSelectorContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('transactions.network')}
        </Text>
        <SegmentedControl
          values={availableNetworks.map(network => network.name)}
          selectedIndex={selectedNetworkIndex}
          onChange={(event) => {
            handleNetworkChange(event.nativeEvent.selectedSegmentIndex);
          }}
          appearance={theme.dark ? 'dark' : 'light'}
          tintColor={theme.colors.primary}
          fontStyle={{ color: theme.colors.text }}
          style={[styles.segmentedControl, { borderColor: theme.colors.border }]}
        />
      </View>
    );
  };

  // 자산 선택기 렌더링
  const renderAssetSelector = () => {
    return (
      <View style={styles.assetSelectorContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('transactions.asset')}
        </Text>
        <TouchableOpacity
          style={[styles.assetSelector, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          onPress={() => setShowAssetSelector(true)}
        >
          <Text style={[styles.assetSelectorText, { color: theme.colors.text }]}>
            {selectedAsset ? selectedAsset.symbol : t('transactions.allAssets')}
          </Text>
          <Icon name="chevron-down" size={16} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    );
  };

  // 빈 상태 렌더링 (트랜잭션이 없을 때)
  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <EmptyState
        icon="document-text-outline"
        title={t('transactions.noTransactionsTitle')}
        description={t('transactions.noTransactionsDescription')}
        action={{
          label: t('transactions.clearFilters'),
          onPress: () => {
            setSelectedFilter('all');
            setSelectedNetworkIndex(0);
            setSelectedAsset(null);
          },
        }}
      />
    );
  };

  // 푸터 로딩 인디케이터 렌더링 (더 불러오기)
  const renderFooter = () => {
    if (!loadMoreLoading) return null;
    
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  // 트랜잭션 아이템 렌더링
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    return (
      <TransactionItem
        transaction={item}
        address={activeAccount?.address || ''}
        onPress={() => handleTransactionPress(item)}
      />
    );
  };

  // 트랜잭션 목록 구분선 렌더링
  const renderItemSeparator = () => {
    return <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={t('transactions.title')}
        onBack={() => navigation.goBack()}
      />
      
      <View style={styles.filtersContainer}>
        {renderNetworkSelector()}
        {renderAssetSelector()}
        {renderFilterButtons()}
      </View>
      
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.hash}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 },
          transactions.length === 0 && styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={renderItemSeparator}
        initialNumToRender={10}
      />
      
      {/* 자산 선택기 모달 (실제 구현에서는 Modal 컴포넌트로 대체) */}
      {showAssetSelector && (
        <View style={[styles.modal, { backgroundColor: theme.colors.modalBackground }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('transactions.selectAsset')}
            </Text>
            
            <TouchableOpacity
              style={[styles.assetItem, { borderColor: theme.colors.border }]}
              onPress={() => handleAssetChange(null)}
            >
              <Text style={[styles.assetItemText, { color: theme.colors.text }]}>
                {t('transactions.allAssets')}
              </Text>
              {selectedAsset === null && (
                <Icon name="checkmark" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
            
            <FlatList
              data={activeAccount?.assets || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.assetItem, { borderColor: theme.colors.border }]}
                  onPress={() => handleAssetChange(item)}
                >
                  <View style={styles.assetItemContent}>
                    <Text style={[styles.assetItemText, { color: theme.colors.text }]}>
                      {item.symbol}
                    </Text>
                    <Text style={[styles.assetItemSubtext, { color: theme.colors.secondaryText }]}>
                      {item.name}
                    </Text>
                  </View>
                  {selectedAsset?.id === item.id && (
                    <Icon name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              style={styles.assetList}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: theme.colors.border }]}
                onPress={() => setShowAssetSelector(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  networkSelectorContainer: {
    marginBottom: 16,
  },
  assetSelectorContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  segmentedControl: {
    height: 40,
  },
  assetSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  assetSelectorText: {
    fontSize: 15,
    fontWeight: '500',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFilterButton: {
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    marginVertical: 8,
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  assetList: {
    maxHeight: 300,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  assetItemContent: {
    flex: 1,
  },
  assetItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  assetItemSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TransactionHistory;
