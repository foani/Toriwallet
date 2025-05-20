import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../../hooks/useWallet';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';

// Types for crosschain transactions
type CrosschainTxType = 'ICP_TRANSFER' | 'BRIDGE' | 'SWAP';

type CrosschainTxStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

interface CrosschainTransaction {
  id: string;
  type: CrosschainTxType;
  sourceNetwork: string;
  targetNetwork: string;
  sourceToken?: string;
  targetToken?: string;
  amount: string;
  recipient: string;
  sender: string;
  provider?: string;
  fee: string;
  status: CrosschainTxStatus;
  timestamp: number;
  txHash: string;
  completedAt?: number;
}

// Mock data for crosschain transactions
const MOCK_TRANSACTIONS: CrosschainTransaction[] = [
  {
    id: '1',
    type: 'ICP_TRANSFER',
    sourceNetwork: 'zenith',
    targetNetwork: 'catena',
    amount: '100',
    recipient: '0x1234567890abcdef1234567890abcdef12345678',
    sender: '0xabcdef1234567890abcdef1234567890abcdef12',
    fee: '0.01',
    status: 'COMPLETED',
    timestamp: Date.now() - 3600000, // 1 hour ago
    txHash: '0x7890abcdef1234567890abcdef1234567890abcd',
    completedAt: Date.now() - 3300000, // 55 minutes ago
  },
  {
    id: '2',
    type: 'BRIDGE',
    sourceNetwork: 'catena',
    targetNetwork: 'ethereum',
    sourceToken: 'cta',
    targetToken: 'eth',
    amount: '50',
    recipient: '0x2345678901abcdef2345678901abcdef23456789',
    sender: '0xabcdef1234567890abcdef1234567890abcdef12',
    provider: 'lunar_link',
    fee: '0.1%',
    status: 'PENDING',
    timestamp: Date.now() - 7200000, // 2 hours ago
    txHash: '0x8901abcdef2345678901abcdef2345678901abcd',
  },
  {
    id: '3',
    type: 'BRIDGE',
    sourceNetwork: 'ethereum',
    targetNetwork: 'bsc',
    sourceToken: 'eth',
    targetToken: 'bnb',
    amount: '25',
    recipient: '0x3456789012abcdef3456789012abcdef34567890',
    sender: '0xabcdef1234567890abcdef1234567890abcdef12',
    provider: 'wormhole',
    fee: '0.2%',
    status: 'FAILED',
    timestamp: Date.now() - 86400000, // 1 day ago
    txHash: '0x9012abcdef3456789012abcdef3456789012abcd',
  },
  {
    id: '4',
    type: 'SWAP',
    sourceNetwork: 'bsc',
    targetNetwork: 'bsc',
    sourceToken: 'bnb',
    targetToken: 'usdt',
    amount: '10',
    recipient: '0x4567890123abcdef4567890123abcdef45678901',
    sender: '0xabcdef1234567890abcdef1234567890abcdef12',
    provider: 'multichain',
    fee: '0.15%',
    status: 'COMPLETED',
    timestamp: Date.now() - 172800000, // 2 days ago
    txHash: '0x0123abcdef4567890123abcdef4567890123abcd',
    completedAt: Date.now() - 172500000, // Almost 2 days ago
  },
  {
    id: '5',
    type: 'ICP_TRANSFER',
    sourceNetwork: 'catena',
    targetNetwork: 'zenith',
    amount: '75',
    recipient: '0x5678901234abcdef5678901234abcdef56789012',
    sender: '0xabcdef1234567890abcdef1234567890abcdef12',
    fee: '0.01',
    status: 'COMPLETED',
    timestamp: Date.now() - 259200000, // 3 days ago
    txHash: '0x1234abcdef5678901234abcdef5678901234abcd',
    completedAt: Date.now() - 258900000, // Almost 3 days ago
  },
];

const History: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { activeWallet } = useWallet();
  
  const [transactions, setTransactions] = useState<CrosschainTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    type: 'ALL' as 'ALL' | CrosschainTxType,
    status: 'ALL' as 'ALL' | CrosschainTxStatus,
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      // In a real app, we would fetch from an API or local storage
      // const response = await crosschainService.getTransactions(activeWallet.address);
      // setTransactions(response);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTransactions(MOCK_TRANSACTIONS);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTransactions();
    setIsRefreshing(false);
  };

  const getFilteredTransactions = () => {
    return transactions.filter(tx => {
      if (filters.type !== 'ALL' && tx.type !== filters.type) return false;
      if (filters.status !== 'ALL' && tx.status !== filters.status) return false;
      return true;
    });
  };

  const getStatusColor = (status: CrosschainTxStatus) => {
    switch (status) {
      case 'COMPLETED':
        return '#4CAF50'; // Green
      case 'PENDING':
        return '#FFC107'; // Yellow
      case 'FAILED':
        return '#F44336'; // Red
      default:
        return theme.colors.text;
    }
  };

  const getTypeLabel = (type: CrosschainTxType) => {
    switch (type) {
      case 'ICP_TRANSFER':
        return 'ICP Transfer';
      case 'BRIDGE':
        return 'Bridge';
      case 'SWAP':
        return 'Swap';
      default:
        return type;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatShortAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleTransactionPress = (transaction: CrosschainTransaction) => {
    navigation.navigate('CrosschainDetails', transaction);
  };

  const renderTransactionItem = ({ item }: { item: CrosschainTransaction }) => (
    <TouchableOpacity onPress={() => handleTransactionPress(item)}>
      <Card style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <Text style={[styles.transactionType, { color: theme.colors.text }]}>
            {getTypeLabel(item.type)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.transactionDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>From:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {item.sourceNetwork.toUpperCase()} 
              {item.sourceToken ? ` (${item.sourceToken.toUpperCase()})` : ''}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>To:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {item.targetNetwork.toUpperCase()}
              {item.targetToken ? ` (${item.targetToken.toUpperCase()})` : ''}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Amount:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {item.amount} {item.sourceToken ? item.sourceToken.toUpperCase() : 'CTA'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Date:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {formatDate(item.timestamp)}
            </Text>
          </View>
        </View>
        
        <View style={styles.transactionFooter}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Tx: {formatShortAddress(item.txHash)}
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.primary }]}>View Details</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderFilterOption = (
    filterType: 'type' | 'status',
    value: string,
    label: string
  ) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        filterType === 'type'
          ? filters.type === value && { backgroundColor: theme.colors.primary }
          : filters.status === value && { backgroundColor: theme.colors.primary }
      ]}
      onPress={() => {
        if (filterType === 'type') {
          setFilters({ ...filters, type: value as any });
        } else {
          setFilters({ ...filters, status: value as any });
        }
      }}
    >
      <Text
        style={[
          styles.filterText,
          filterType === 'type'
            ? filters.type === value && { color: 'white' }
            : filters.status === value && { color: 'white' }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <Loading message="Loading transactions..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Crosschain History" onBack={() => navigation.goBack()} />
      
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {renderFilterOption('type', 'ALL', 'All Types')}
            {renderFilterOption('type', 'ICP_TRANSFER', 'ICP Transfer')}
            {renderFilterOption('type', 'BRIDGE', 'Bridge')}
            {renderFilterOption('type', 'SWAP', 'Swap')}
          </View>
        </ScrollView>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {renderFilterOption('status', 'ALL', 'All Status')}
            {renderFilterOption('status', 'PENDING', 'Pending')}
            {renderFilterOption('status', 'COMPLETED', 'Completed')}
            {renderFilterOption('status', 'FAILED', 'Failed')}
          </View>
        </ScrollView>
      </View>
      
      <FlatList
        data={getFilteredTransactions()}
        renderItem={renderTransactionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              No crosschain transactions found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  filtersContainer: {
    padding: 8,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  filterText: {
    color: '#333',
  },
  transactionCard: {
    marginBottom: 16,
    padding: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  transactionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default History;
