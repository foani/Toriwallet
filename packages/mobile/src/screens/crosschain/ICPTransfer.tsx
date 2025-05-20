import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Header } from '../../components/common/Header';
import { Loading } from '../../components/common/Loading';

const ICPTransfer: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { activeWallet, accounts } = useWallet();
  const { networks, activeNetwork, switchNetwork } = useNetwork();
  
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sourceNetwork, setSourceNetwork] = useState('');
  const [targetNetwork, setTargetNetwork] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fee, setFee] = useState('0.001');
  const [estimatedTime, setEstimatedTime] = useState('~2 minutes');

  // Filter only Zenith and Catena networks for ICP Transfer
  const supportedNetworks = networks.filter(
    network => ['Zenith Chain', 'Catena Chain'].includes(network.name)
  );

  useEffect(() => {
    // Set initial networks if available in supported networks
    if (supportedNetworks.length >= 2) {
      setSourceNetwork(supportedNetworks[0].id);
      setTargetNetwork(supportedNetworks[1].id);
    }
  }, [networks]);

  const handleNetworkSwitch = () => {
    const tempSource = sourceNetwork;
    setSourceNetwork(targetNetwork);
    setTargetNetwork(tempSource);
  };

  const validateTransfer = (): boolean => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return false;
    }

    if (!recipient) {
      Alert.alert('Invalid Recipient', 'Please enter a valid recipient address');
      return false;
    }

    if (sourceNetwork === targetNetwork) {
      Alert.alert('Network Error', 'Source and target networks must be different');
      return false;
    }

    return true;
  };

  const handleTransfer = async () => {
    if (!validateTransfer()) return;

    setIsLoading(true);
    try {
      // Simulate ICP transfer process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Implement actual ICP transfer logic with
      // const result = await icpTransferService.transfer({
      //   sourceNetwork,
      //   targetNetwork,
      //   amount,
      //   recipient,
      //   sender: activeWallet?.address,
      // });

      Alert.alert(
        'Transfer Initiated',
        `Your transfer of ${amount} CTA has been initiated. It will arrive in approximately ${estimatedTime}.`,
        [
          {
            text: 'View Details',
            onPress: () => navigation.navigate('CrosschainDetails', {
              txHash: '0x' + Math.random().toString(16).substr(2, 40),
              type: 'ICP_TRANSFER',
              amount,
              sourceNetwork,
              targetNetwork,
              recipient,
              status: 'PENDING',
              timestamp: Date.now(),
            }),
          },
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      Alert.alert('Transfer Failed', error.message || 'Failed to initiate ICP transfer');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading message="Initiating transfer..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="ICP Transfer" onBack={() => navigation.goBack()} />
      <ScrollView>
        <Card style={styles.card}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Transfer between Zenith and Catena Chains
          </Text>
          
          <View style={styles.networkSelector}>
            <View style={styles.networkBox}>
              <Text style={[styles.label, { color: theme.colors.text }]}>From</Text>
              <View style={[styles.networkCard, { backgroundColor: theme.colors.card }]}>
                {supportedNetworks.map(network => (
                  <TouchableOpacity
                    key={network.id}
                    style={[
                      styles.networkOption,
                      sourceNetwork === network.id && { 
                        backgroundColor: theme.colors.primary + '33' 
                      }
                    ]}
                    onPress={() => setSourceNetwork(network.id)}
                  >
                    <Text style={[
                      styles.networkName,
                      { color: sourceNetwork === network.id ? theme.colors.primary : theme.colors.text }
                    ]}>
                      {network.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity onPress={handleNetworkSwitch} style={styles.switchIcon}>
              <Text style={{ fontSize: 24, color: theme.colors.primary }}>⇄</Text>
            </TouchableOpacity>

            <View style={styles.networkBox}>
              <Text style={[styles.label, { color: theme.colors.text }]}>To</Text>
              <View style={[styles.networkCard, { backgroundColor: theme.colors.card }]}>
                {supportedNetworks.map(network => (
                  <TouchableOpacity
                    key={network.id}
                    style={[
                      styles.networkOption,
                      targetNetwork === network.id && { 
                        backgroundColor: theme.colors.primary + '33' 
                      }
                    ]}
                    onPress={() => setTargetNetwork(network.id)}
                  >
                    <Text style={[
                      styles.networkName,
                      { color: targetNetwork === network.id ? theme.colors.primary : theme.colors.text }
                    ]}>
                      {network.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={[styles.label, { color: theme.colors.text }]}>Amount</Text>
          <Input
            placeholder="0.0"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            rightElement={<Text style={{ color: theme.colors.text }}>CTA</Text>}
          />

          <Text style={[styles.label, { color: theme.colors.text }]}>Recipient Address</Text>
          <Input
            placeholder="Enter address or scan QR code"
            value={recipient}
            onChangeText={setRecipient}
          />

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Transfer Fee:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{fee} CTA</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Estimated Time:</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{estimatedTime}</Text>
            </View>
          </View>

          <Button 
            title="Transfer" 
            onPress={handleTransfer} 
            disabled={!amount || !recipient || !sourceNetwork || !targetNetwork}
          />
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  networkSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  networkBox: {
    flex: 1,
  },
  networkCard: {
    borderRadius: 8,
    padding: 8,
  },
  networkOption: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  networkName: {
    fontSize: 16,
    textAlign: 'center',
  },
  switchIcon: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    marginVertical: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ICPTransfer;
