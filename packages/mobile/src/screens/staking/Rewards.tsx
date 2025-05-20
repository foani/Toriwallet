import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import Icon from 'react-native-vector-icons/Ionicons';

// 타입 정의
interface Delegation {
  id: string;
  validatorId: string;
  validatorName: string;
  amount: string;
  apr: string;
  rewards: string;
  lockPeriod: number; // days
  startDate: number; // timestamp
  endDate: number; // timestamp
  status: 'ACTIVE' | 'UNSTAKING' | 'COMPLETED';
}

// 목업 데이터
const MOCK_DELEGATIONS: Delegation[] = [
  {
    id: '1',
    validatorId: '1',
    validatorName: 'Node Guardian',
    amount: '1,000',
    apr: '12.5%',
    rewards: '32.45',
    lockPeriod: 30,
    startDate: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
    endDate: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 days from now
    status: 'ACTIVE',
  },
  {
    id: '2',
    validatorId: '3',
    validatorName: 'CreataStake',
    amount: '500',
    apr: '13.2%',
    rewards: '18.67',
    lockPeriod: 60,
    startDate: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
    endDate: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 days from now
    status: 'ACTIVE',
  },
  {
    id: '3',
    validatorId: '2',
    validatorName: 'Catena Sentinel',
    amount: '750',
    apr: '11.8%',
    rewards: '0',
    lockPeriod: 30,
    startDate: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    endDate: Date.now() + 28 * 24 * 60 * 60 * 1000, // 28 days from now
    status: 'ACTIVE',
  },
  {
    id: '4',
    validatorId: '4',
    validatorName: 'BlockMaster',
    amount: '250',
    apr: '11.2%',
    rewards: '7.83',
    lockPeriod: 10,
    startDate: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
    endDate: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days from now
    status: 'ACTIVE',
  },
  {
    id: '5',
    validatorId: '5',
    validatorName: 'StakeHub',
    amount: '300',
    apr: '12.1%',
    rewards: '9.12',
    lockPeriod: 90,
    startDate: Date.now() - 70 * 24 * 60 * 60 * 1000, // 70 days ago
    endDate: Date.now() + 20 * 24 * 60 * 60 * 1000, // 20 days from now
    status: 'ACTIVE',
  }
];

const Rewards: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { activeWallet } = useWallet();
  const { activeNetwork } = useNetwork();
  
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalStaked, setTotalStaked] = useState('0');
  const [totalRewards, setTotalRewards] = useState('0');
  const [isClaimingAll, setIsClaimingAll] = useState(false);

  useEffect(() => {
    loadDelegations();
  }, []);

  const loadDelegations = async () => {
    setIsLoading(true);
    try {
      // In a real app, we would fetch delegations from the API
      // const response = await stakingService.getDelegations(activeWallet?.address);
      // setDelegations(response);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDelegations(MOCK_DELEGATIONS);
      
      // Calculate totals
      const staked = MOCK_DELEGATIONS.reduce((sum, delegation) => {
        return sum + Number(delegation.amount.replace(/,/g, ''));
      }, 0);
      
      const rewards = MOCK_DELEGATIONS.reduce((sum, delegation) => {
        return sum + Number(delegation.rewards);
      }, 0);
      
      setTotalStaked(staked.toLocaleString());
      setTotalRewards(rewards.toFixed(2));
    } catch (error) {
      console.error('Failed to load delegations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDelegations();
    setIsRefreshing(false);
  };

  const handleClaimRewards = async (delegationId: string) => {
    try {
      // In a real app, we would call staking service
      // const result = await stakingService.claimRewards(delegationId);
      
      // Simulate claiming rewards
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the local state
      setDelegations(prev => {
        return prev.map(delegation => {
          if (delegation.id === delegationId) {
            return {
              ...delegation,
              rewards: '0',
            };
          }
          return delegation;
        });
      });
      
      // Update total rewards
      const rewards = delegations.reduce((sum, delegation) => {
        if (delegation.id === delegationId) {
          return sum;
        }
        return sum + Number(delegation.rewards);
      }, 0);
      
      setTotalRewards(rewards.toFixed(2));
      
      Alert.alert('Success', 'Rewards claimed successfully!');
    } catch (error) {
      Alert.alert('Failed to Claim', error.message || 'Failed to claim rewards');
    }
  };

  const handleClaimAllRewards = async () => {
    setIsClaimingAll(true);
    try {
      // In a real app, we would call staking service
      // const result = await stakingService.claimAllRewards();
      
      // Simulate claiming all rewards
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the local state
      setDelegations(prev => {
        return prev.map(delegation => {
          return {
            ...delegation,
            rewards: '0',
          };
        });
      });
      
      setTotalRewards('0');
      
      Alert.alert('Success', 'All rewards claimed successfully!');
    } catch (error) {
      Alert.alert('Failed to Claim', error.message || 'Failed to claim all rewards');
    } finally {
      setIsClaimingAll(false);
    }
  };

  const handleUnstake = (delegation: Delegation) => {
    navigation.navigate('Unstake', {
      validatorId: delegation.validatorId,
      stakedAmount: delegation.amount,
      lockEndDate: delegation.endDate,
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRemainingDays = (endDate: number) => {
    const now = Date.now();
    const remainingMs = endDate - now;
    
    if (remainingMs <= 0) {
      return 'Ended';
    }
    
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    return `${remainingDays} days`;
  };

  const renderDelegationItem = ({ item }: { item: Delegation }) => (
    <Card style={styles.delegationCard}>
      <View style={styles.delegationHeader}>
        <Text style={[styles.validatorName, { color: theme.colors.text }]}>{item.validatorName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.stakedInfo}>
        <Text style={[styles.stakedAmount, { color: theme.colors.text }]}>{item.amount} CTA</Text>
        <Text style={[styles.stakedLabel, { color: theme.colors.textSecondary }]}>Staked</Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailColumn}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>APR</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{item.apr}</Text>
        </View>
        
        <View style={styles.detailColumn}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Lock Period</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{item.lockPeriod} Days</Text>
        </View>
        
        <View style={styles.detailColumn}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Remaining</Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>{getRemainingDays(item.endDate)}</Text>
        </View>
      </View>
      
      <View style={styles.delegationFooter}>
        <View style={styles.rewardsContainer}>
          <Text style={[styles.rewardsLabel, { color: theme.colors.textSecondary }]}>Rewards:</Text>
          <Text style={[styles.rewardsValue, { color: theme.colors.primary }]}>{item.rewards} CTA</Text>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { 
              backgroundColor: Number(item.rewards) > 0 ? theme.colors.primary : theme.colors.border,
            }]}
            onPress={() => handleClaimRewards(item.id)}
            disabled={Number(item.rewards) <= 0}
          >
            <Text style={[
              styles.actionButtonText, 
              { color: Number(item.rewards) > 0 ? 'white' : theme.colors.textSecondary },
            ]}>
              Claim
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
            onPress={() => handleUnstake(item)}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Unstake</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (isLoading) {
    return <Loading message="Loading staking rewards..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Staking Rewards" onBack={() => navigation.goBack()} />
      
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{totalStaked} CTA</Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total Staked</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>{totalRewards} CTA</Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Total Rewards</Text>
          </View>
        </View>
        
        <Button
          title="Claim All Rewards"
          onPress={handleClaimAllRewards}
          loading={isClaimingAll}
          disabled={Number(totalRewards) <= 0 || isClaimingAll}
          style={styles.claimAllButton}
        />
      </Card>
      
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: theme.colors.text }]}>Your Delegations</Text>
          <TouchableOpacity
            style={styles.newStakeButton}
            onPress={() => navigation.navigate('Validators')}
          >
            <Icon name="add-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.newStakeText, { color: theme.colors.primary }]}>New Stake</Text>
          </TouchableOpacity>
        </View>
        
        {delegations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              You don't have any active delegations.
            </Text>
            <Button
              title="Stake Now"
              onPress={() => navigation.navigate('Validators')}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <FlatList
            data={delegations}
            renderItem={renderDelegationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    margin: 16,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
  },
  claimAllButton: {
    marginTop: 8,
  },
  listContainer: {
    flex: 1,
    marginTop: 8,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  newStakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newStakeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  delegationCard: {
    marginBottom: 16,
    padding: 16,
  },
  delegationHeader: {
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
  stakedInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stakedAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stakedLabel: {
    fontSize: 14,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailColumn: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  delegationFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rewardsLabel: {
    fontSize: 14,
  },
  rewardsValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    minWidth: 160,
  },
});

export default Rewards;
