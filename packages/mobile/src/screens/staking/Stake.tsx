import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import Icon from 'react-native-vector-icons/Ionicons';

// 타입 정의
type StakeRouteParams = {
  validatorId: string;
};

type StakeRouteProp = RouteProp<{ Stake: StakeRouteParams }, 'Stake'>;

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
];

const Stake: React.FC = () => {
  const route = useRoute<StakeRouteProp>();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { activeWallet, balances } = useWallet();
  const { activeNetwork } = useNetwork();
  
  const { validatorId } = route.params;
  const [validator, setValidator] = useState<Validator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState<number>(30); // Default 30 days
  const [estimatedReward, setEstimatedReward] = useState('0');
  const [availableBalance, setAvailableBalance] = useState('0');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadValidatorDetails();
    loadWalletBalance();
  }, [validatorId]);

  useEffect(() => {
    calculateEstimatedReward();
  }, [amount, validator, lockPeriod]);

  const loadValidatorDetails = async () => {
    setIsLoading(true);
    try {
      // In a real app, we would fetch validator details from the API
      // const response = await stakingService.getValidatorById(validatorId);
      // setValidator(response);
      
      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      const found = MOCK_VALIDATORS.find(v => v.id === validatorId);
      setValidator(found || null);
    } catch (error) {
      console.error('Failed to load validator details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWalletBalance = async () => {
    try {
      // In a real app, we would fetch balance from the wallet service
      // const balance = await walletService.getBalance(activeWallet?.address, 'CTA');
      // setAvailableBalance(balance);
      
      // Using mock data
      setAvailableBalance('15,000.00');
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  };

  const calculateEstimatedReward = () => {
    if (!validator || !amount || isNaN(Number(amount))) {
      setEstimatedReward('0');
      return;
    }
    
    // Extract APR percentage (remove % sign and parse as float)
    const apr = parseFloat(validator.apr.replace('%', '')) / 100;
    
    // Calculate daily reward rate
    const dailyRate = apr / 365;
    
    // Calculate rewards based on lock period
    const periodReward = Number(amount) * dailyRate * lockPeriod;
    
    // Format with 2 decimal places
    setEstimatedReward(periodReward.toFixed(2));
  };

  const validateStake = (): boolean => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid stake amount');
      return false;
    }

    // Parse amount and available balance for comparison
    const stakeAmount = Number(amount);
    const available = Number(availableBalance.replace(/[^0-9.]/g, ''));
    
    if (stakeAmount > available) {
      Alert.alert('Insufficient Balance', 'Your stake amount exceeds your available balance');
      return false;
    }

    if (!validator || validator.status !== 'ACTIVE') {
      Alert.alert('Validator Not Active', 'You can only stake with active validators');
      return false;
    }

    return true;
  };

  const handleStake = async () => {
    if (!validateStake()) return;
    
    setIsProcessing(true);
    try {
      // In a real app, we would call staking service
      // const result = await stakingService.stake({
      //   validatorId,
      //   amount,
      //   lockPeriod,
      //   sender: activeWallet?.address,
      // });
      
      // Simulate staking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Staking Successful',
        `You have successfully staked ${amount} CTA with ${validator?.name} for ${lockPeriod} days. Your estimated reward is ${estimatedReward} CTA.`,
        [
          { text: 'OK', onPress: () => navigation.navigate('Rewards') }
        ]
      );
    } catch (error) {
      Alert.alert('Staking Failed', error.message || 'Failed to stake CTA');
    } finally {
      setIsProcessing(false);
    }
  };

  const setMaxAmount = () => {
    const maxAmount = Number(availableBalance.replace(/[^0-9.]/g, ''));
    setAmount(maxAmount.toString());
  };

  const handleLockPeriodChange = (period: number) => {
    setLockPeriod(period);
  };

  if (isLoading) {
    return <Loading message="Loading validator details..." />;
  }

  if (!validator) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Stake" onBack={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <Text style={[styles.message, { color: theme.colors.text }]}>
            Validator not found
          </Text>
          <Button title="Back to Validators" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Stake" onBack={() => navigation.goBack()} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView}>
          <Card style={styles.validatorCard}>
            <View style={styles.validatorHeader}>
              <Text style={[styles.validatorName, { color: theme.colors.text }]}>{validator.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(validator.status) }]}>
                <Text style={styles.statusText}>{validator.status}</Text>
              </View>
            </View>
            
            <View style={styles.validatorDetails}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text }]}>APR:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{validator.apr}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Commission:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{validator.commission}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Total Staked:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{validator.totalStaked}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Uptime:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{validator.uptime}</Text>
              </View>
            </View>
            
            {validator.description && (
              <View style={styles.descriptionContainer}>
                <Text style={[styles.description, { color: theme.colors.text }]}>
                  {validator.description}
                </Text>
              </View>
            )}
          </Card>
          
          <Card style={styles.stakeCard}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Stake CTA</Text>
            
            <View style={styles.balanceRow}>
              <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
                Available Balance:
              </Text>
              <Text style={[styles.balanceValue, { color: theme.colors.text }]}>
                {availableBalance} CTA
              </Text>
            </View>
            
            <View style={styles.amountContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Amount</Text>
              <View style={styles.amountInputRow}>
                <TextInput
                  style={[styles.amountInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder="0.0"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
                <View style={styles.amountRight}>
                  <Text style={[styles.tokenSymbol, { color: theme.colors.text }]}>CTA</Text>
                  <TouchableOpacity
                    style={[styles.maxButton, { backgroundColor: theme.colors.primary }]}
                    onPress={setMaxAmount}
                  >
                    <Text style={styles.maxButtonText}>MAX</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.lockPeriodContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Lock Period</Text>
              <View style={styles.lockPeriodOptions}>
                {[10, 30, 60, 90].map(period => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodOption,
                      lockPeriod === period && { 
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                      },
                      { borderColor: theme.colors.border }
                    ]}
                    onPress={() => handleLockPeriodChange(period)}
                  >
                    <Text
                      style={[
                        styles.periodText,
                        lockPeriod === period ? { color: 'white' } : { color: theme.colors.text }
                      ]}
                    >
                      {period} Days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={[styles.rewardContainer, { backgroundColor: theme.colors.card }]}>
              <View style={styles.rewardRow}>
                <Text style={[styles.rewardLabel, { color: theme.colors.text }]}>Estimated Reward:</Text>
                <Text style={[styles.rewardValue, { color: theme.colors.primary }]}>
                  {estimatedReward} CTA
                </Text>
              </View>
              <Text style={[styles.rewardNote, { color: theme.colors.textSecondary }]}>
                Based on current APR and lock period
              </Text>
            </View>
            
            <Button
              title="Stake Now"
              onPress={handleStake}
              loading={isProcessing}
              disabled={!amount || Number(amount) <= 0 || isProcessing}
            />
            
            <Text style={[styles.disclaimer, { color: theme.colors.textSecondary }]}>
              Note: Once staked, your funds will be locked for the entire lock period. Early unstaking may result in penalties.
            </Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  validatorCard: {
    margin: 16,
    padding: 16,
  },
  validatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  validatorName: {
    fontSize: 18,
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
    marginBottom: 16,
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
  descriptionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  stakeCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  amountContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  amountRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  maxButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  maxButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lockPeriodContainer: {
    marginBottom: 16,
  },
  lockPeriodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rewardContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rewardLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rewardNote: {
    fontSize: 12,
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default Stake;
