import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

// Types for crosschain transactions
type CrosschainTxType = 'ICP_TRANSFER' | 'BRIDGE' | 'SWAP';
type CrosschainTxStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

interface CrosschainTransaction {
  id?: string;
  txHash: string;
  type: CrosschainTxType;
  sourceNetwork: string;
  targetNetwork: string;
  sourceToken?: string;
  targetToken?: string;
  amount: string;
  recipient: string;
  sender?: string;
  provider?: string;
  fee: string;
  estimatedTime?: string;
  status: CrosschainTxStatus;
  timestamp: number;
  completedAt?: number;
  error?: string;
  blockExplorerUrlSource?: string;
  blockExplorerUrlTarget?: string;
}

type CrosschainDetailsRouteProp = RouteProp<{
  Details: CrosschainTransaction;
}, 'Details'>;

const CrosschainDetails: React.FC = () => {
  const route = useRoute<CrosschainDetailsRouteProp>();
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  const [transaction, setTransaction] = useState<CrosschainTransaction>(route.params);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  useEffect(() => {
    // If transaction is pending, simulate progress update
    if (transaction.status === 'PENDING') {
      const intervalId = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 0.01;
          
          // Update time remaining based on progress
          const estimatedTimeMs = getEstimatedTimeInMs(transaction.estimatedTime);
          const elapsed = (Date.now() - transaction.timestamp);
          
          const remaining = estimatedTimeMs - elapsed;
          if (remaining > 0) {
            setTimeRemaining(formatTimeRemaining(remaining));
          } else {
            setTimeRemaining('Almost complete');
          }
          
          // Simulate completion at 100%
          if (newProgress >= 1) {
            clearInterval(intervalId);
            handleRefresh();
            return 1;
          }
          
          return Math.min(newProgress, 1);
        });
      }, 2000);

      return () => clearInterval(intervalId);
    }
  }, [transaction.status]);

  const getEstimatedTimeInMs = (estimatedTime?: string): number => {
    if (!estimatedTime) return 300000; // Default 5 minutes
    
    // Parse time ranges like "10-30 minutes"
    const match = estimatedTime.match(/(\d+)-(\d+)\s+minutes/);
    if (match) {
      const minMinutes = parseInt(match[1], 10);
      const maxMinutes = parseInt(match[2], 10);
      const avgMinutes = (minMinutes + maxMinutes) / 2;
      return avgMinutes * 60 * 1000;
    }
    
    // Parse simple time like "~2 minutes"
    const simpleMatch = estimatedTime.match(/~?(\d+)\s+minutes/);
    if (simpleMatch) {
      const minutes = parseInt(simpleMatch[1], 10);
      return minutes * 60 * 1000;
    }
    
    return 300000; // Default 5 minutes
  };

  const formatTimeRemaining = (ms: number): string => {
    if (ms <= 0) return 'Almost complete';
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes > 0) {
      return `~${minutes} min${minutes > 1 ? 's' : ''} ${seconds} sec${seconds > 1 ? 's' : ''}`;
    }
    
    return `~${seconds} seconds`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // In a real app, fetch updated transaction details
      // const updatedTransaction = await crosschainService.getTransactionByHash(transaction.txHash);
      // setTransaction(updatedTransaction);
      
      // Simulate update for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate random status update with 30% chance of completion if pending
      if (transaction.status === 'PENDING' && Math.random() < 0.3) {
        setTransaction({
          ...transaction,
          status: 'COMPLETED',
          completedAt: Date.now(),
        });
        setProgress(1);
        setTimeRemaining(null);
      }
    } catch (error) {
      console.error('Failed to refresh transaction:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewInExplorer = (network: string) => {
    let explorerUrl;
    
    switch (network.toLowerCase()) {
      case 'catena':
        explorerUrl = `https://catena.explorer.creatachain.com/tx/${transaction.txHash}`;
        break;
      case 'zenith':
        explorerUrl = `https://zenith.explorer.creatachain.com/tx/${transaction.txHash}`;
        break;
      case 'ethereum':
        explorerUrl = `https://etherscan.io/tx/${transaction.txHash}`;
        break;
      case 'bsc':
        explorerUrl = `https://bscscan.com/tx/${transaction.txHash}`;
        break;
      case 'polygon':
        explorerUrl = `https://polygonscan.com/tx/${transaction.txHash}`;
        break;
      case 'solana':
        explorerUrl = `https://explorer.solana.com/tx/${transaction.txHash}`;
        break;
      default:
        Alert.alert('Explorer Not Available', 'Block explorer not available for this network');
        return;
    }
    
    Linking.openURL(explorerUrl).catch(err => {
      Alert.alert('Error', 'Could not open URL: ' + err.message);
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
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  const formatFullAddress = (address: string) => {
    return (
      <Text>
        {formatShortAddress(address)}
        <Text
          style={{ color: theme.colors.primary }}
          onPress={() => {
            Alert.alert('Address Copied', 'Address copied to clipboard!');
            // In real app: Clipboard.setString(address);
          }}
        >
          {' '}(Copy)
        </Text>
      </Text>
    );
  };

  const networkName = (networkId: string) => {
    return networkId.charAt(0).toUpperCase() + networkId.slice(1);
  };

  const getProgressMessage = () => {
    if (transaction.status === 'COMPLETED') {
      return 'Transaction completed successfully';
    } else if (transaction.status === 'FAILED') {
      return transaction.error || 'Transaction failed';
    } else {
      if (timeRemaining) {
        return `In progress... (${timeRemaining} remaining)`;
      } else {
        return 'In progress...';
      }
    }
  };

  const getProviderName = (providerId?: string) => {
    if (!providerId) return '';
    
    switch (providerId) {
      case 'lunar_link':
        return 'Lunar Link';
      case 'wormhole':
        return 'Wormhole';
      case 'multichain':
        return 'Multichain';
      default:
        return providerId;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Transaction Details" onBack={() => navigation.goBack()} />
      
      <ScrollView>
        <Card style={styles.card}>
          <View style={styles.header}>
            <Text style={[styles.typeLabel, { color: theme.colors.text }]}>
              {getTypeLabel(transaction.type)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
              <Text style={styles.statusText}>{transaction.status}</Text>
            </View>
          </View>
          
          {transaction.status === 'PENDING' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progress * 100}%`,
                      backgroundColor: theme.colors.primary
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: theme.colors.text }]}>
                {getProgressMessage()}
              </Text>
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Transaction Info</Text>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Transaction Hash:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {formatShortAddress(transaction.txHash)}
                <Text
                  style={{ color: theme.colors.primary }}
                  onPress={() => {
                    Alert.alert('Hash Copied', 'Transaction hash copied to clipboard!');
                    // In real app: Clipboard.setString(transaction.txHash);
                  }}
                >
                  {' '}(Copy)
                </Text>
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Status:</Text>
              <Text style={{ color: getStatusColor(transaction.status), fontWeight: 'bold' }}>
                {transaction.status}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Initiated:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {formatDate(transaction.timestamp)}
              </Text>
            </View>
            
            {transaction.completedAt && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Completed:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {formatDate(transaction.completedAt)}
                </Text>
              </View>
            )}
            
            {transaction.provider && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Provider:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {getProviderName(transaction.provider)}
                </Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Fee:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {transaction.fee}
              </Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Transfer Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text }]}>From Network:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {networkName(transaction.sourceNetwork)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text }]}>To Network:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {networkName(transaction.targetNetwork)}
              </Text>
            </View>
            
            {transaction.sourceToken && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text }]}>From Token:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {transaction.sourceToken.toUpperCase()}
                </Text>
              </View>
            )}
            
            {transaction.targetToken && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text }]}>To Token:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {transaction.targetToken.toUpperCase()}
                </Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Amount:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {transaction.amount} {transaction.sourceToken ? transaction.sourceToken.toUpperCase() : 'CTA'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Recipient:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {formatFullAddress(transaction.recipient)}
              </Text>
            </View>
            
            {transaction.sender && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Sender:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {formatFullAddress(transaction.sender)}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.actionsContainer}>
            {transaction.status === 'PENDING' && (
              <Button
                title="Refresh"
                onPress={handleRefresh}
                loading={isRefreshing}
                style={styles.actionButton}
              />
            )}
            
            <View style={styles.explorerButtons}>
              <TouchableOpacity
                style={[styles.explorerButton, { backgroundColor: theme.colors.card }]}
                onPress={() => handleViewInExplorer(transaction.sourceNetwork)}
              >
                <Text style={{ color: theme.colors.primary }}>
                  View on {networkName(transaction.sourceNetwork)} Explorer
                </Text>
              </TouchableOpacity>
              
              {transaction.sourceNetwork !== transaction.targetNetwork && (
                <TouchableOpacity
                  style={[styles.explorerButton, { backgroundColor: theme.colors.card }]}
                  onPress={() => handleViewInExplorer(transaction.targetNetwork)}
                >
                  <Text style={{ color: theme.colors.primary }}>
                    View on {networkName(transaction.targetNetwork)} Explorer
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
  },
  section: {
    marginVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    maxWidth: '60%',
    textAlign: 'right',
  },
  actionsContainer: {
    marginTop: 24,
  },
  actionButton: {
    marginBottom: 16,
  },
  explorerButtons: {
    gap: 12,
  },
  explorerButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default CrosschainDetails;
