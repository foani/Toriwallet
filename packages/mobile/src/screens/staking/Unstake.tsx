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
type UnstakeRouteParams = {
  validatorId: string;
  stakedAmount: string;
  lockEndDate: number;
};

type UnstakeRouteProp = RouteProp<{ Unstake: UnstakeRouteParams }, 'Unstake'>;

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
];

const Unstake: React.FC = () => {
  const route = useRoute<UnstakeRouteProp>();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { activeWallet } = useWallet();
  const { activeNetwork } = useNetwork();
  
  const { validatorId, stakedAmount, lockEndDate } = route.params;
  const [validator, setValidator] = useState<Validator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isEarlyUnstake, setIsEarlyUnstake] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState('0');
  const [estimatedReturn, setEstimatedReturn] = useState('0');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadValidatorDetails();
    checkLockPeriod();
  }, [validatorId, lockEndDate]);

  useEffect(() => {
    calculatePenaltyAndReturn();
  }, [unstakeAmount, isEarlyUnstake]);

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

  const checkLockPeriod = () => {
    const now = Date.now();
    setIsEarlyUnstake(now < lockEndDate);
  };

  const calculatePenaltyAndReturn = () => {
    if (!unstakeAmount || isNaN(Number(unstakeAmount))) {
      setPenaltyAmount('0');
      setEstimatedReturn('0');
      return;
    }

    const amount = Number(unstakeAmount);
    
    if (isEarlyUnstake) {
      // Calculate penalty for early unstaking (example: 10% penalty)
      const penalty = amount * 0.1;
      setPenaltyAmount(penalty.toFixed(2));
      setEstimatedReturn((amount - penalty).toFixed(2));
    } else {
      setPenaltyAmount('0');
      setEstimatedReturn(amount.toFixed(2));
    }
  };

  const validateUnstake = (): boolean => {
    if (!unstakeAmount || isNaN(Number(unstakeAmount)) || Number(unstakeAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid unstake amount');
      return false;
    }

    // Parse amount and staked amount for comparison
    const amount = Number(unstakeAmount);
    const staked = Number(stakedAmount.replace(/[^0-9.]/g, ''));
    
    if (amount > staked) {
      Alert.alert('Invalid Amount', 'Unstake amount cannot exceed your staked amount');
      return false;
    }

    if (isEarlyUnstake) {
      // Ask for confirmation when unstaking early
      return true; // Will show confirmation dialog later
    }

    return true;
  };

  const handleUnstake = async () => {
    if (!validateUnstake()) return;
    
    // Show confirmation dialog for early unstaking
    if (isEarlyUnstake) {
      Alert.alert(
        'Early Unstaking Penalty',
        `You are unstaking before the lock period ends. A penalty of ${penaltyAmount} CTA will be applied. You will receive ${estimatedReturn} CTA. Do you want to proceed?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Proceed', onPress: () => processUnstake() }
        ]
      );
    } else {
      processUnstake();
    }
  };

  const processUnstake = async () => {
    setIsProcessing(true);
    try {
      // In a real app, we would call staking service
      // const result = await stakingService.unstake({
      //   validatorId,
      //   amount: unstakeAmount,
      //   sender: activeWallet?.address,
      // });
      
      // Simulate unstaking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Unstaking Successful',
        `You have successfully unstaked ${unstakeAmount} CTA from ${validator?.name}. You will receive ${estimatedReturn} CTA.`,
        [
          { text: 'OK', onPress: () => navigation.navigate('StakingScreen') }
        ]
      );
    } catch (error) {
      Alert.alert('Unstaking Failed', error.message || 'Failed to unstake CTA');
    } finally {
      setIsProcessing(false);
    }
  };

  const setMaxAmount = () => {
    setUnstakeAmount(stakedAmount.replace(/[^0-9.]/g, ''));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRemainingDays = () => {
    if (!isEarlyUnstake) return 0;
    
    const now = Date.now();
    const remainingMs = lockEndDate - now;
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    return remainingDays;
  };

  if (isLoading) {
    return <Loading message="Loading validator details..." />;
  }

  if (!validator) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Unstake" onBack={() => navigation.goBack()} />
        <View style={styles.centerContainer}>
          <Text style={[styles.message, { color: theme.colors.text }]}>
            Validator not found
          </Text>
          <Button title="Back to Staking" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Unstake" onBack={() => navigation.goBack()} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView}>
          <Card style={styles.validatorCard}>
            <Text style={[styles.validatorName, { color: theme.colors.text }]}>{validator.name}</Text>
            <Text style={[styles.validatorAddress, { color: theme.colors.textSecondary }]}>
              {`${validator.address.substring(0, 6)}...${validator.address.substring(validator.address.length - 4)}`}
            </Text>
          </Card>
          
          <Card style={styles.unstakeCard}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Unstake CTA</Text>
            
            <View style={styles.stakeInfoContainer}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                  Currently Staked:
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {stakedAmount} CTA
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                  Lock End Date:
                </Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {formatDate(lockEndDate)}
                </Text>
              </View>
              
              {isEarlyUnstake && (
                <View style={[styles.warningContainer, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Icon name="alert-circle-outline" size={20} color={theme.colors.warning} />
                  <Text style={[styles.warningText, { color: theme.colors.warning }]}>
                    {`Early unstaking (${getRemainingDays()} days remaining). A 10% penalty will apply.`}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.amountContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Amount to Unstake</Text>
              <View style={styles.amountInputRow}>
                <TextInput
                  style={[styles.amountInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder="0.0"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="decimal-pad"
                  value={unstakeAmount}
                  onChangeText={setUnstakeAmount}
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
            
            <View style={[styles.summaryContainer, { backgroundColor: theme.colors.card }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Unstake Amount:</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  {unstakeAmount || '0'} CTA
                </Text>
              </View>
              
              {isEarlyUnstake && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Penalty (10%):</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
                    -{penaltyAmount} CTA
                  </Text>
                </View>
              )}
              
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={[styles.totalLabel, { color: theme.colors.text }]}>You Will Receive:</Text>
                <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                  {estimatedReturn} CTA
                </Text>
              </View>
            </View>
            
            <Button
              title="Unstake Now"
              onPress={handleUnstake}
              loading={isProcessing}
              disabled={!unstakeAmount || Number(unstakeAmount) <= 0 || isProcessing}
            />
            
            <Text style={[styles.disclaimer, { color: theme.colors.textSecondary }]}>
              Note: Unstaking takes approximately 7 days to process. Your funds will be available in your wallet after the unstaking period.
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
    alignItems: 'center',
  },
  validatorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  validatorAddress: {
    fontSize: 14,
  },
  unstakeCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stakeInfoContainer: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
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
  summaryContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default Unstake;
