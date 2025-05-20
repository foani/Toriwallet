import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
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
interface StakingStats {
  totalStaked: string;
  totalRewards: string;
  stakedPercentage: number;
  annualizedReturns: string;
  stakingPositions: number;
  networkAPR: string;
  networkTotalStaked: string;
  networkValidators: number;
}

interface RecentReward {
  id: string;
  validatorName: string;
  amount: string;
  timestamp: number;
}

// 목업 데이터
const MOCK_STAKING_STATS: StakingStats = {
  totalStaked: '2,800',
  totalRewards: '68.07',
  stakedPercentage: 18.67, // % of wallet balance
  annualizedReturns: '12.4%',
  stakingPositions: 5,
  networkAPR: '11.8%',
  networkTotalStaked: '126,450,000',
  networkValidators: 48,
};

const MOCK_RECENT_REWARDS: RecentReward[] = [
  {
    id: '1',
    validatorName: 'Node Guardian',
    amount: '7.25',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
  },
  {
    id: '2',
    validatorName: 'CreataStake',
    amount: '4.12',
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
  },
  {
    id: '3',
    validatorName: 'StakeHub',
    amount: '3.89',
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
  },
];

const StakingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { activeWallet } = useWallet();
  const { activeNetwork } = useNetwork();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<StakingStats | null>(null);
  const [recentRewards, setRecentRewards] = useState<RecentReward[]>([]);

  useEffect(() => {
    loadStakingData();
  }, []);

  const loadStakingData = async () => {
    setIsLoading(true);
    try {
      // In a real app, we would fetch staking data from the API
      // const statsResponse = await stakingService.getStakingStats(activeWallet?.address);
      // const rewardsResponse = await stakingService.getRecentRewards(activeWallet?.address);
      // setStats(statsResponse);
      // setRecentRewards(rewardsResponse);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(MOCK_STAKING_STATS);
      setRecentRewards(MOCK_RECENT_REWARDS);
    } catch (error) {
      console.error('Failed to load staking data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStakingData();
    setIsRefreshing(false);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
    
    if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    if (diffMinutes > 0) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    return 'Just now';
  };

  if (isLoading) {
    return <Loading message="Loading staking information..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Staking" />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <Card style={styles.overviewCard}>
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
              Total Staked
            </Text>
            <Text style={[styles.balanceValue, { color: theme.colors.text }]}>
              {stats?.totalStaked} CTA
            </Text>
            
            <View style={styles.balanceDetails}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailValue, { color: theme.colors.primary }]}>
                  {stats?.totalRewards} CTA
                </Text>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Total Rewards
                </Text>
              </View>
              
              <View style={styles.detailDivider} />
              
              <View style={styles.detailItem}>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {stats?.annualizedReturns}
                </Text>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Avg. APR
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Validators')}
            >
              <Icon name="trending-up-outline" size={20} color="white" />
              <Text style={styles.actionButtonText}>Stake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
              onPress={() => navigation.navigate('Rewards')}
            >
              <Icon name="cash-outline" size={20} color={theme.colors.text} />
              <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Rewards</Text>
            </TouchableOpacity>
          </View>
        </Card>
        
        {recentRewards.length > 0 && (
          <Card style={styles.recentRewardsCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Rewards</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Rewards')}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {recentRewards.map((reward) => (
              <View key={reward.id} style={styles.rewardItem}>
                <View style={styles.rewardInfo}>
                  <Text style={[styles.rewardValidator, { color: theme.colors.text }]}>
                    {reward.validatorName}
                  </Text>
                  <Text style={[styles.rewardTime, { color: theme.colors.textSecondary }]}>
                    {formatTimeAgo(reward.timestamp)}
                  </Text>
                </View>
                <Text style={[styles.rewardAmount, { color: theme.colors.primary }]}>
                  +{reward.amount} CTA
                </Text>
              </View>
            ))}
          </Card>
        )}
        
        <Card style={styles.networkCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Network Status</Text>
          
          <View style={styles.networkStats}>
            <View style={styles.networkStat}>
              <Text style={[styles.networkStatValue, { color: theme.colors.text }]}>
                {stats?.networkAPR}
              </Text>
              <Text style={[styles.networkStatLabel, { color: theme.colors.textSecondary }]}>
                Network APR
              </Text>
            </View>
            
            <View style={styles.networkStat}>
              <Text style={[styles.networkStatValue, { color: theme.colors.text }]}>
                {stats?.networkTotalStaked}
              </Text>
              <Text style={[styles.networkStatLabel, { color: theme.colors.textSecondary }]}>
                Total Staked CTA
              </Text>
            </View>
            
            <View style={styles.networkStat}>
              <Text style={[styles.networkStatValue, { color: theme.colors.text }]}>
                {stats?.networkValidators}
              </Text>
              <Text style={[styles.networkStatLabel, { color: theme.colors.textSecondary }]}>
                Active Validators
              </Text>
            </View>
          </View>
        </Card>
        
        <Card style={styles.learnCard}>
          <Text style={[styles.learnTitle, { color: theme.colors.text }]}>
            What is Staking?
          </Text>
          <Text style={[styles.learnText, { color: theme.colors.textSecondary }]}>
            Staking is the process of actively participating in transaction validation on a blockchain. 
            When you stake your CTA, you contribute to the security and efficiency of the network while 
            earning rewards in return.
          </Text>
          <TouchableOpacity 
            style={[styles.learnButton, { borderColor: theme.colors.primary }]}
            onPress={() => {
              // Navigate to learn more page or open external link
            }}
          >
            <Text style={[styles.learnButtonText, { color: theme.colors.primary }]}>
              Learn More
            </Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  overviewCard: {
    margin: 16,
    padding: 16,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#e0e0e0',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  recentRewardsCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardValidator: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  rewardTime: {
    fontSize: 12,
  },
  rewardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  networkCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  networkStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  networkStat: {
    alignItems: 'center',
    flex: 1,
  },
  networkStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  networkStatLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  learnCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  learnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  learnText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  learnButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  learnButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default StakingScreen;
