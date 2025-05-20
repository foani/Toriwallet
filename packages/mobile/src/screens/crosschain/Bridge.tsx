import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
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

// Mock data for bridge providers
const BRIDGE_PROVIDERS = [
  { id: 'lunar_link', name: 'Lunar Link', fee: '0.1%', minAmount: '10 CTA', logo: null },
  { id: 'wormhole', name: 'Wormhole', fee: '0.2%', minAmount: '5 CTA', logo: null },
  { id: 'multichain', name: 'Multichain', fee: '0.15%', minAmount: '1 CTA', logo: null },
];

const SUPPORTED_NETWORKS = [
  { id: 'catena', name: 'Catena Chain', logo: null },
  { id: 'ethereum', name: 'Ethereum', logo: null },
  { id: 'bsc', name: 'Binance Smart Chain', logo: null },
  { id: 'polygon', name: 'Polygon', logo: null },
  { id: 'solana', name: 'Solana', logo: null },
];

const SUPPORTED_TOKENS = [
  { id: 'cta', name: 'CTA', logo: null },
  { id: 'eth', name: 'ETH', logo: null },
  { id: 'bnb', name: 'BNB', logo: null },
  { id: 'matic', name: 'MATIC', logo: null },
  { id: 'sol', name: 'SOL', logo: null },
  { id: 'usdt', name: 'USDT', logo: null },
  { id: 'usdc', name: 'USDC', logo: null },
];

type Route = {
  sourceNetwork: string;
  targetNetwork: string;
  sourceToken: string;
  targetToken: string;
  provider: string;
  fee: string;
  estimatedTime: string;
};

const Bridge: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { activeWallet } = useWallet();
  
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sourceNetwork, setSourceNetwork] = useState(SUPPORTED_NETWORKS[0].id);
  const [targetNetwork, setTargetNetwork] = useState(SUPPORTED_NETWORKS[1].id);
  const [sourceToken, setSourceToken] = useState(SUPPORTED_TOKENS[0].id);
  const [targetToken, setTargetToken] = useState(SUPPORTED_TOKENS[0].id);
  const [selectedProvider, setSelectedProvider] = useState(BRIDGE_PROVIDERS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [selectorType, setSelectorType] = useState<'source' | 'target' | null>(null);
  const [isTokenSelection, setIsTokenSelection] = useState(false);

  useEffect(() => {
    // Sample routes based on selection
    const sampleRoutes: Route[] = [
      {
        sourceNetwork,
        targetNetwork,
        sourceToken,
        targetToken,
        provider: 'lunar_link',
        fee: '0.1%',
        estimatedTime: '10-30 minutes',
      },
      {
        sourceNetwork,
        targetNetwork,
        sourceToken,
        targetToken,
        provider: 'wormhole',
        fee: '0.2%',
        estimatedTime: '5-20 minutes',
      },
      {
        sourceNetwork,
        targetNetwork,
        sourceToken,
        targetToken,
        provider: 'multichain',
        fee: '0.15%',
        estimatedTime: '15-45 minutes',
      },
    ];

    setRoutes(sampleRoutes);
  }, [sourceNetwork, targetNetwork, sourceToken, targetToken]);

  const handleNetworkSwitch = () => {
    const tempNetwork = sourceNetwork;
    const tempToken = sourceToken;
    
    setSourceNetwork(targetNetwork);
    setTargetNetwork(tempNetwork);
    
    setSourceToken(targetToken);
    setTargetToken(tempToken);
  };

  const openSelector = (type: 'source' | 'target', isToken: boolean) => {
    setSelectorType(type);
    setIsTokenSelection(isToken);
    if (isToken) {
      setShowTokenSelector(true);
    } else {
      setShowNetworkSelector(true);
    }
  };

  const selectNetwork = (networkId: string) => {
    if (selectorType === 'source') {
      setSourceNetwork(networkId);
    } else {
      setTargetNetwork(networkId);
    }
    setShowNetworkSelector(false);
  };

  const selectToken = (tokenId: string) => {
    if (selectorType === 'source') {
      setSourceToken(tokenId);
    } else {
      setTargetToken(tokenId);
    }
    setShowTokenSelector(false);
  };

  const getNetworkById = (id: string) => {
    return SUPPORTED_NETWORKS.find(n => n.id === id) || SUPPORTED_NETWORKS[0];
  };

  const getTokenById = (id: string) => {
    return SUPPORTED_TOKENS.find(t => t.id === id) || SUPPORTED_TOKENS[0];
  };

  const getProviderById = (id: string) => {
    return BRIDGE_PROVIDERS.find(p => p.id === id) || BRIDGE_PROVIDERS[0];
  };

  const validateBridgeTransfer = (): boolean => {
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

  const handleBridgeTransfer = async () => {
    if (!validateBridgeTransfer()) return;

    setIsLoading(true);
    try {
      // Simulate bridge transfer process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Implement actual bridge transfer logic
      // const result = await bridgeService.transfer({
      //   sourceNetwork,
      //   targetNetwork,
      //   sourceToken,
      //   targetToken,
      //   amount,
      //   recipient,
      //   sender: activeWallet?.address,
      //   provider: selectedProvider,
      // });

      const selectedRoute = routes.find(route => route.provider === selectedProvider);

      Alert.alert(
        'Bridge Transfer Initiated',
        `Your transfer of ${amount} ${getTokenById(sourceToken).name} from ${getNetworkById(sourceNetwork).name} to ${getNetworkById(targetNetwork).name} has been initiated.`,
        [
          {
            text: 'View Details',
            onPress: () => navigation.navigate('CrosschainDetails', {
              txHash: '0x' + Math.random().toString(16).substr(2, 40),
              type: 'BRIDGE',
              amount,
              sourceNetwork,
              targetNetwork,
              sourceToken,
              targetToken,
              recipient,
              provider: selectedProvider,
              fee: selectedRoute?.fee || '0.1%',
              estimatedTime: selectedRoute?.estimatedTime || '10-30 minutes',
              status: 'PENDING',
              timestamp: Date.now(),
            }),
          },
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      Alert.alert('Bridge Failed', error.message || 'Failed to initiate bridge transfer');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading message="Initiating bridge transfer..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Cross-Chain Bridge" onBack={() => navigation.goBack()} />
      <ScrollView>
        <Card style={styles.card}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Bridge Assets Across Chains
          </Text>
          
          <View style={styles.bridgeContainer}>
            <View style={styles.networkBox}>
              <Text style={[styles.label, { color: theme.colors.text }]}>From</Text>
              <TouchableOpacity 
                style={[styles.selector, { backgroundColor: theme.colors.card }]}
                onPress={() => openSelector('source', false)}
              >
                <Text style={[styles.selectorText, { color: theme.colors.text }]}>
                  {getNetworkById(sourceNetwork).name}
                </Text>
              </TouchableOpacity>
              
              <Text style={[styles.label, { color: theme.colors.text, marginTop: 8 }]}>Token</Text>
              <TouchableOpacity 
                style={[styles.selector, { backgroundColor: theme.colors.card }]}
                onPress={() => openSelector('source', true)}
              >
                <Text style={[styles.selectorText, { color: theme.colors.text }]}>
                  {getTokenById(sourceToken).name}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleNetworkSwitch} style={styles.switchIcon}>
              <Text style={{ fontSize: 24, color: theme.colors.primary }}>⇄</Text>
            </TouchableOpacity>

            <View style={styles.networkBox}>
              <Text style={[styles.label, { color: theme.colors.text }]}>To</Text>
              <TouchableOpacity 
                style={[styles.selector, { backgroundColor: theme.colors.card }]}
                onPress={() => openSelector('target', false)}
              >
                <Text style={[styles.selectorText, { color: theme.colors.text }]}>
                  {getNetworkById(targetNetwork).name}
                </Text>
              </TouchableOpacity>
              
              <Text style={[styles.label, { color: theme.colors.text, marginTop: 8 }]}>Token</Text>
              <TouchableOpacity 
                style={[styles.selector, { backgroundColor: theme.colors.card }]}
                onPress={() => openSelector('target', true)}
              >
                <Text style={[styles.selectorText, { color: theme.colors.text }]}>
                  {getTokenById(targetToken).name}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.label, { color: theme.colors.text }]}>Amount</Text>
          <Input
            placeholder="0.0"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            rightElement={
              <Text style={{ color: theme.colors.text }}>
                {getTokenById(sourceToken).name}
              </Text>
            }
          />

          <Text style={[styles.label, { color: theme.colors.text }]}>Recipient Address</Text>
          <Input
            placeholder="Enter address or scan QR code"
            value={recipient}
            onChangeText={setRecipient}
          />

          <Text style={[styles.label, { color: theme.colors.text, marginTop: 16 }]}>Route Options</Text>
          <View style={styles.routesContainer}>
            {routes.map((route) => (
              <TouchableOpacity
                key={route.provider}
                style={[
                  styles.routeOption,
                  selectedProvider === route.provider && { 
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => setSelectedProvider(route.provider)}
              >
                <Text style={[styles.providerName, { color: theme.colors.text }]}>
                  {getProviderById(route.provider).name}
                </Text>
                <View style={styles.routeDetails}>
                  <Text style={{ color: theme.colors.text }}>Fee: {route.fee}</Text>
                  <Text style={{ color: theme.colors.text }}>Time: {route.estimatedTime}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Button 
            title="Bridge" 
            onPress={handleBridgeTransfer} 
            disabled={!amount || !recipient || !sourceNetwork || !targetNetwork || !sourceToken || !targetToken}
          />
        </Card>
      </ScrollView>

      {/* Network Selector Modal */}
      {showNetworkSelector && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Select Network
            </Text>
            <ScrollView>
              {SUPPORTED_NETWORKS.map((network) => (
                <TouchableOpacity
                  key={network.id}
                  style={[styles.modalOption, { borderBottomColor: theme.colors.border }]}
                  onPress={() => selectNetwork(network.id)}
                >
                  <Text style={{ color: theme.colors.text }}>{network.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button title="Cancel" onPress={() => setShowNetworkSelector(false)} />
          </View>
        </View>
      )}

      {/* Token Selector Modal */}
      {showTokenSelector && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Select Token
            </Text>
            <ScrollView>
              {SUPPORTED_TOKENS.map((token) => (
                <TouchableOpacity
                  key={token.id}
                  style={[styles.modalOption, { borderBottomColor: theme.colors.border }]}
                  onPress={() => selectToken(token.id)}
                >
                  <Text style={{ color: theme.colors.text }}>{token.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button title="Cancel" onPress={() => setShowTokenSelector(false)} />
          </View>
        </View>
      )}
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
  },
  bridgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  networkBox: {
    flex: 1,
  },
  selector: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  selectorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  switchIcon: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routesContainer: {
    marginVertical: 12,
  },
  routeOption: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
  },
});

export default Bridge;
