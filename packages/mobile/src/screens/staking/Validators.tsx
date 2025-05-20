import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { useNetwork } from '../../hooks/useNetwork';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import Icon from 'react-native-vector-icons/Ionicons';

// 검증인 타입 정의
interface Validator {
  id: string;
  name: string;
  address: string;
  totalStaked: string;
  commission: string;
  apr: string;
  status: 'ACTIVE' | 'INACTIVE' | 'JAILED';
  uptime: string;
  identity: string;
  logoUrl?: string;
  website?: string;
  description?: string;
}

// 목업 데이터
const MOCK_VALIDATORS: Validator[] = [
  {
    id: '1',
    name: 'Node Guardian',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    totalStaked: '2,500,000 CTA',
    commission: '5%',
    apr: '12.5%',
    status: 'ACTIVE',
    uptime: '99.98%',
    identity: 'verified',
    logoUrl: 'https://example.com/logo1.png',
    website: 'https://nodeguardian.io',
    description: 'Professional validator with 24/7 monitoring and high-security infrastructure.'
  },
  {
    id: '2',
    name: 'Catena Sentinel',
    address: '0x2345678901abcdef2345678901abcdef23456789',
    totalStaked: '1,800,000 CTA',
    commission: '7%',
    apr: '11.8%',
    status: 'ACTIVE',
    uptime: '99.9%',
    identity: 'verified',
    logoUrl: 'https://example.com/logo2.png',
    website: 'https://catenasentinel.com',
    description: 'Reliable validator service with geo-distributed backup nodes.'
  },
  {
    id: '3',
    name: 'CreataStake',
    address: '0x3456789012abcdef3456789012abcdef34567890',
    totalStaked: '3,200,000 CTA',
    commission: '3%',
    apr: '13.2%',
    status: 'ACTIVE',
    uptime: '100%',
    identity: 'verified',
    logoUrl: 'https://example.com/logo3.png',
    website: 'https://creatastake.io',
    description: 'Official validator run by the Creata Chain team.'
  },
  {
    id: '4',
    name: 'BlockMaster',
    address: '0x4567890123abcdef4567890123abcdef45678901',
    totalStaked: '950,000 CTA',
    commission: '8%',
    apr: '11.2%',
    status: 'ACTIVE',
    uptime: '99.7%',
    identity: 'verified',
    logoUrl: 'https://example.com/logo4.png',
    website: 'https://blockmaster.network',
    description: 'Experienced validator team with proven track record across multiple chains.'
  },
  {
    id: '5',
    name: 'StakeHub',
    address: '0x5678901234abcdef5678901234abcdef56789012',
    totalStaked: '1,250,000 CTA',
    commission: '6%',
    apr: '12.1%',
    status: 'ACTIVE',
    uptime: '99.85%',
    identity: 'verified',
    logoUrl: 'https://example.com/logo5.png',
    website: 'https://stakehub.io',
    description: 'Community-focused validator with regular rewards distribution reports.'
  },
  {
    id: '6',
    name: 'NodeX',
    address: '0x6789012345abcdef6789012345abcdef67890123',
    totalStaked: '780,000 CTA',
    commission: '5.5%',
    apr: '12.3%',
    status: 'INACTIVE',
    uptime: '95.2%',
    identity: 'verified',
    logoUrl: 'https://example.com/logo6.png',
    website: 'https://nodex.network',
    description: 'New validator node with competitive rates and growing infrastructure.'
  },
  {
    id: '7',
    name: 'ValidateChain',
    address: '0x7890123456abcdef7890123456abcdef78901234',
    totalStaked: '2,100,000 CTA',
    commission: '4%',
    apr: '12.9%',
    status: 'ACTIVE',
    uptime: '99.95%',
    identity: 'verified',
    logoUrl: 'https://example.com/logo7.png',
    website: 'https://validatechain.com',
    description: 'Enterprise-grade validation service with advanced security protocols.'
  },
  {
    id: '8',
    name: 'StakeSecure',
    address: '0x8901234567abcdef8901234567abcdef89012345',
    totalStaked: '1,600,000 CTA',
    commission: '6.5%',
    apr: '11.9%',
    status: 'JAILED',
    uptime: '92.1%',
    identity: 'verified',
    logoUrl: 'https://example.com/logo8.png',
    website: 'https://stakesecure.io',
    description: 'Currently undergoing maintenance. Expected to return to active status soon.'
  }
];

const Validators: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { activeNetwork } = useNetwork();
  
  const [validators, setValidators] = useState<Validator[]>([]);
  const [filteredValidators, setFilteredValidators] = useState<Validator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'apr' | 'totalStaked' | 'commission'>('apr');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'JAILED'>('ALL');

  useEffect(() => {
    loadValidators();
  }, []);

  useEffect(() => {
    filterAndSortValidators();
  }, [validators, searchQuery, sortBy, sortOrder, filter]);

  const loadValidators = async () => {
    setIsLoading(true);
    try {
      // In a real app, we would fetch validators from the API
      // const response = await stakingService.getValidators(activeNetwork.id);
      // setValidators(response);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setValidators(MOCK_VALIDATORS);
    } catch (error) {
      console.error('Failed to load validators:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadValidators();
    setIsRefreshing(false);
  };

  const filterAndSortValidators = () => {
    let filtered = [...validators];
    
    // Apply status filter
    if (filter !== 'ALL') {
      filtered = filtered.filter(validator => validator.status === filter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        validator => 
          validator.name.toLowerCase().includes(query) || 
          validator.address.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'apr':
          valueA = parseFloat(a.apr.replace('%', ''));
          valueB = parseFloat(b.apr.replace('%', ''));
          break;
        case 'totalStaked':
          valueA = parseFloat(a.totalStaked.replace(/[^0-9.]/g, ''));
          valueB = parseFloat(b.totalStaked.replace(/[^0-9.]/g, ''));
          break;
        case 'commission':
          valueA = parseFloat(a.commission.replace('%', ''));
          valueB = parseFloat(b.commission.replace('%', ''));
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return valueA - valueB;
      } else {
        return valueB - valueA;
      }
    });
    
    setFilteredValidators(filtered);
  };

  const getStatusColor = (status: 'ACTIVE' | 'INACTIVE' | 'JAILED') => {
    switch (status) {
      case 'ACTIVE':
        return '#4CAF50'; // Green
      case 'INACTIVE':
        return '#FFC107'; // Yellow
      case 'JAILED':
        return '#F44336'; // Red
      default:
        return theme.colors.text;
    }
  };

  const toggleSortOrder = (field: 'apr' | 'totalStaked' | 'commission') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const renderSortIcon = (field: 'apr' | 'totalStaked' | 'commission') => {
    if (sortBy !== field) {
      return <Icon name="swap-vertical-outline" size={16} color={theme.colors.textSecondary} />;
    }
    
    return (
      <Icon 
        name={sortOrder === 'asc' ? 'arrow-up-outline' : 'arrow-down-outline'} 
        size={16} 
        color={theme.colors.primary} 
      />
    );
  };

  const renderValidatorItem = ({ item }: { item: Validator }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('Stake', { validatorId: item.id })}
    >
      <Card style={styles.validatorCard}>
        <View style={styles.validatorHeader}>
          <Text style={[styles.validatorName, { color: theme.colors.text }]}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.validatorDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>APR:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{item.apr}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Total Staked:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{item.totalStaked}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Commission:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{item.commission}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Uptime:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{item.uptime}</Text>
          </View>
        </View>
        
        <View style={styles.validatorFooter}>
          <Text style={[styles.shortAddress, { color: theme.colors.textSecondary }]}>
            {`${item.address.substring(0, 6)}...${item.address.substring(item.address.length - 4)}`}
          </Text>
          <Text style={[styles.viewDetails, { color: theme.colors.primary }]}>
            Stake Now
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderFilterOption = (value: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'JAILED', label: string) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        filter === value && { backgroundColor: theme.colors.primary }
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterText,
          filter === value && { color: 'white' }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <Loading message="Loading validators..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Validators" onBack={() => navigation.goBack()} />
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
          <Icon name="search-outline" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search validators..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {renderFilterOption('ALL', 'All')}
            {renderFilterOption('ACTIVE', 'Active')}
            {renderFilterOption('INACTIVE', 'Inactive')}
            {renderFilterOption('JAILED', 'Jailed')}
          </View>
        </ScrollView>
      </View>
      
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={styles.sortOption}
          onPress={() => toggleSortOrder('apr')}
        >
          <Text style={[
            styles.sortText,
            sortBy === 'apr' && { color: theme.colors.primary }
          ]}>
            APR
          </Text>
          {renderSortIcon('apr')}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.sortOption}
          onPress={() => toggleSortOrder('totalStaked')}
        >
          <Text style={[
            styles.sortText,
            sortBy === 'totalStaked' && { color: theme.colors.primary }
          ]}>
            Staked
          </Text>
          {renderSortIcon('totalStaked')}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.sortOption}
          onPress={() => toggleSortOrder('commission')}
        >
          <Text style={[
            styles.sortText,
            sortBy === 'commission' && { color: theme.colors.primary }
          ]}>
            Commission
          </Text>
          {renderSortIcon('commission')}
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredValidators}
        renderItem={renderValidatorItem}
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
              No validators found
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
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
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    marginRight: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  validatorCard: {
    marginBottom: 16,
    padding: 16,
  },
  validatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  validatorName: {
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
  validatorDetails: {
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
  validatorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  shortAddress: {
    fontSize: 12,
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: '500',
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

export default Validators;
