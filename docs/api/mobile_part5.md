# TORI Wallet 모바일 앱 API 문서 (Part 5)

## 멀티체인 및 크로스체인 기능

TORI Wallet 모바일 앱은 다양한 블록체인 네트워크를 지원하며, 크로스체인 기능을 통해 네트워크 간 자산 이동을 가능하게 합니다.

### 크로스체인 구성 요소

#### ICPTransferScreen

`ICPTransferScreen`은 ICP(Inter-Chain Protocol)를 통한 자산 전송 화면을 구현합니다.

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { useCrosschain } from '../../hooks/useCrosschain';
import { InputField } from '../../components/common/InputField';
import { NetworkSelector } from '../../components/crosschain/NetworkSelector';
import { BalanceDisplay } from '../../components/wallet/BalanceDisplay';
import { Button } from '../../components/common/Button';
import { TransactionSummary } from '../../components/crosschain/TransactionSummary';

const ICPTransferScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { selectedAccount } = useWallet();
  const { currentNetwork, networks } = useNetwork();
  const { transferICP, isLoading, error } = useCrosschain();
  
  const [targetNetwork, setTargetNetwork] = useState(null);
  const [availableNetworks, setAvailableNetworks] = useState([]);
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [estimatedFee, setEstimatedFee] = useState('0');
  const [showSummary, setShowSummary] = useState(false);
  
  // 대상 네트워크 목록 설정
  useEffect(() => {
    if (currentNetwork && networks) {
      // ICP 전송이 가능한 네트워크 필터링 (예: Zenith Chain과 Catena Chain 간)
      const icpSupportedNetworks = networks.filter(network => {
        return network.icpSupported && network.id !== currentNetwork.id;
      });
      
      setAvailableNetworks(icpSupportedNetworks);
      
      // 기본 대상 네트워크 설정
      if (icpSupportedNetworks.length > 0 && !targetNetwork) {
        setTargetNetwork(icpSupportedNetworks[0]);
      }
    }
  }, [currentNetwork, networks]);
  
  // 수수료 추정
  useEffect(() => {
    if (currentNetwork && targetNetwork && amount) {
      // 여기에서 크로스체인 전송 수수료 추정 로직 구현
      // 예시: 네트워크 간 전송 수수료는 고정 또는 동적 계산
      const fee = '0.001'; // 예시 수수료
      setEstimatedFee(fee);
    }
  }, [currentNetwork, targetNetwork, amount]);
  
  // 전송 유효성 검사
  const isTransferValid = () => {
    return (
      selectedAccount &&
      currentNetwork &&
      targetNetwork &&
      recipientAddress.trim() !== '' &&
      parseFloat(amount) > 0
    );
  };
  
  // 전송 요약 표시
  const showTransferSummary = () => {
    if (!isTransferValid()) {
      Alert.alert(
        t('Invalid Input'),
        t('Please fill all required fields with valid values.'),
        [{ text: t('OK') }]
      );
      return;
    }
    
    setShowSummary(true);
  };
  
  // 전송 수행
  const handleTransfer = async () => {
    try {
      if (!isTransferValid()) return;
      
      const txHash = await transferICP(
        targetNetwork.id,
        recipientAddress,
        amount
      );
      
      // 성공 후 결과 화면으로 이동
      navigation.navigate('TransactionSuccess', {
        txHash,
        fromNetwork: currentNetwork.name,
        toNetwork: targetNetwork.name,
        amount,
        recipientAddress,
        type: 'ICP_TRANSFER',
      });
    } catch (error) {
      console.error('ICP transfer failed:', error);
      Alert.alert(
        t('Transfer Failed'),
        error.message || t('Failed to complete the transfer. Please try again.'),
        [{ text: t('OK') }]
      );
    } finally {
      setShowSummary(false);
    }
  };
  
  // 메인 렌더링
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('ICP Inter-Chain Transfer')}
      </Text>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('Source Network')}
        </Text>
        <View style={[styles.networkCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.networkName, { color: theme.colors.text }]}>
            {currentNetwork?.name || t('Not Selected')}
          </Text>
          {selectedAccount && currentNetwork && (
            <BalanceDisplay
              address={selectedAccount.address}
              network={currentNetwork.id}
            />
          )}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('Target Network')}
        </Text>
        <NetworkSelector
          networks={availableNetworks}
          selectedNetwork={targetNetwork}
          onSelectNetwork={setTargetNetwork}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('Recipient Address')}
        </Text>
        <InputField
          value={recipientAddress}
          onChangeText={setRecipientAddress}
          placeholder={t('Enter recipient address')}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => {
            navigation.navigate('QRScan', {
              onScan: (data) => setRecipientAddress(data),
            });
          }}
        >
          <Text style={[styles.scanButtonText, { color: theme.colors.primary }]}>
            {t('Scan QR Code')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('Amount')}
        </Text>
        <InputField
          value={amount}
          onChangeText={setAmount}
          placeholder={t('Enter amount')}
          keyboardType="numeric"
        />
        <Text style={[styles.feeText, { color: theme.colors.textSecondary }]}>
          {t('Estimated Fee')}: {estimatedFee} {currentNetwork?.currencySymbol || ''}
        </Text>
      </View>
      
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
      
      <Button
        title={t('Continue')}
        onPress={showTransferSummary}
        disabled={!isTransferValid() || isLoading}
        loading={isLoading}
        style={styles.button}
      />
      
      {/* 전송 요약 모달 */}
      {showSummary && (
        <TransactionSummary
          visible={showSummary}
          fromNetwork={currentNetwork}
          toNetwork={targetNetwork}
          amount={amount}
          fee={estimatedFee}
          recipientAddress={recipientAddress}
          onConfirm={handleTransfer}
          onCancel={() => setShowSummary(false)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  networkCard: {
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  networkName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scanButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  feeText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    marginTop: 16,
    marginBottom: 32,
  },
});

export default ICPTransferScreen;
```

#### BridgeScreen

`BridgeScreen`은 크로스체인 브릿지를 통한 자산 전송 화면을 구현합니다.

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { useCrosschain } from '../../hooks/useCrosschain';
import { useTokens } from '../../hooks/useTokens';
import { InputField } from '../../components/common/InputField';
import { NetworkSelector } from '../../components/crosschain/NetworkSelector';
import { TokenSelector } from '../../components/wallet/TokenSelector';
import { Button } from '../../components/common/Button';
import { TransactionSummary } from '../../components/crosschain/TransactionSummary';

const BridgeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { selectedAccount } = useWallet();
  const { currentNetwork, networks } = useNetwork();
  const { bridgeTransfer, isLoading, error } = useCrosschain();
  const { tokens, getTokenBalance } = useTokens();
  
  const [targetNetwork, setTargetNetwork] = useState(null);
  const [availableNetworks, setAvailableNetworks] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [bridgeableTokens, setBridgeableTokens] = useState([]);
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [estimatedFee, setEstimatedFee] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [showSummary, setShowSummary] = useState(false);
  
  // 대상 네트워크 목록 설정
  useEffect(() => {
    if (currentNetwork && networks) {
      // 브릿지 가능한 네트워크 필터링
      const bridgeSupportedNetworks = networks.filter(network => {
        return network.bridgeSupported && network.id !== currentNetwork.id;
      });
      
      setAvailableNetworks(bridgeSupportedNetworks);
      
      // 기본 대상 네트워크 설정
      if (bridgeSupportedNetworks.length > 0 && !targetNetwork) {
        setTargetNetwork(bridgeSupportedNetworks[0]);
      }
    }
  }, [currentNetwork, networks]);
  
  // 브릿지 가능 토큰 목록 설정
  useEffect(() => {
    if (currentNetwork && targetNetwork && tokens) {
      // 브릿지 가능한 토큰 필터링
      const bridgeableTokensList = tokens.filter(token => {
        return token.bridgeSupported && 
               token.networks.includes(currentNetwork.id) && 
               token.networks.includes(targetNetwork.id);
      });
      
      setBridgeableTokens(bridgeableTokensList);
      
      // 기본 토큰 설정
      if (bridgeableTokensList.length > 0 && !selectedToken) {
        setSelectedToken(bridgeableTokensList[0]);
      }
    }
  }, [currentNetwork, targetNetwork, tokens]);
  
  // 토큰 잔액 가져오기
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (selectedToken && selectedAccount && currentNetwork) {
        try {
          const balance = await getTokenBalance(
            selectedToken.address,
            selectedAccount.address,
            currentNetwork.id
          );
          setTokenBalance(balance);
        } catch (error) {
          console.error('Failed to fetch token balance:', error);
          setTokenBalance('0');
        }
      }
    };
    
    fetchTokenBalance();
  }, [selectedToken, selectedAccount, currentNetwork]);
  
  // 수수료 추정
  useEffect(() => {
    if (currentNetwork && targetNetwork && selectedToken && amount) {
      // 여기에서 브릿지 전송 수수료 추정 로직 구현
      // 예시: 브릿지 수수료는 고정 또는 동적 계산
      const fee = '0.002'; // 예시 수수료
      setEstimatedFee(fee);
    }
  }, [currentNetwork, targetNetwork, selectedToken, amount]);
  
  // 전송 유효성 검사
  const isTransferValid = () => {
    return (
      selectedAccount &&
      currentNetwork &&
      targetNetwork &&
      selectedToken &&
      recipientAddress.trim() !== '' &&
      parseFloat(amount) > 0 &&
      parseFloat(amount) <= parseFloat(tokenBalance)
    );
  };
  
  // 전송 요약 표시
  const showTransferSummary = () => {
    if (!isTransferValid()) {
      Alert.alert(
        t('Invalid Input'),
        t('Please fill all required fields with valid values.'),
        [{ text: t('OK') }]
      );
      return;
    }
    
    setShowSummary(true);
  };
  
  // 전송 수행
  const handleTransfer = async () => {
    try {
      if (!isTransferValid()) return;
      
      const txHash = await bridgeTransfer(
        targetNetwork.id,
        selectedToken,
        recipientAddress,
        amount
      );
      
      // 성공 후 결과 화면으로 이동
      navigation.navigate('TransactionSuccess', {
        txHash,
        fromNetwork: currentNetwork.name,
        toNetwork: targetNetwork.name,
        token: selectedToken.symbol,
        amount,
        recipientAddress,
        type: 'BRIDGE_TRANSFER',
      });
    } catch (error) {
      console.error('Bridge transfer failed:', error);
      Alert.alert(
        t('Transfer Failed'),
        error.message || t('Failed to complete the transfer. Please try again.'),
        [{ text: t('OK') }]
      );
    } finally {
      setShowSummary(false);
    }
  };
  
  // 최대 금액 설정
  const setMaxAmount = () => {
    if (tokenBalance) {
      setAmount(tokenBalance);
    }
  };
  
  // 메인 렌더링
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('Cross-Chain Bridge')}
      </Text>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('Source Network')}
        </Text>
        <View style={[styles.networkCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.networkName, { color: theme.colors.text }]}>
            {currentNetwork?.name || t('Not Selected')}
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('Target Network')}
        </Text>
        <NetworkSelector
          networks={availableNetworks}
          selectedNetwork={targetNetwork}
          onSelectNetwork={setTargetNetwork}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('Token')}
        </Text>
        <TokenSelector
          tokens={bridgeableTokens}
          selectedToken={selectedToken}
          onSelectToken={setSelectedToken}
        />
        {selectedToken && (
          <Text style={[styles.balanceText, { color: theme.colors.textSecondary }]}>
            {t('Balance')}: {tokenBalance} {selectedToken.symbol}
          </Text>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('Recipient Address')}
        </Text>
        <InputField
          value={recipientAddress}
          onChangeText={setRecipientAddress}
          placeholder={t('Enter recipient address')}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => {
            navigation.navigate('QRScan', {
              onScan: (data) => setRecipientAddress(data),
            });
          }}
        >
          <Text style={[styles.scanButtonText, { color: theme.colors.primary }]}>
            {t('Scan QR Code')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <View style={styles.amountHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('Amount')}
          </Text>
          <TouchableOpacity onPress={setMaxAmount}>
            <Text style={[styles.maxButton, { color: theme.colors.primary }]}>
              {t('MAX')}
            </Text>
          </TouchableOpacity>
        </View>
        <InputField
          value={amount}
          onChangeText={setAmount}
          placeholder={t('Enter amount')}
          keyboardType="numeric"
        />
        <Text style={[styles.feeText, { color: theme.colors.textSecondary }]}>
          {t('Estimated Fee')}: {estimatedFee} {selectedToken?.symbol || ''}
        </Text>
      </View>
      
      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
      
      <Button
        title={t('Continue')}
        onPress={showTransferSummary}
        disabled={!isTransferValid() || isLoading}
        loading={isLoading}
        style={styles.button}
      />
      
      {/* 전송 요약 모달 */}
      {showSummary && (
        <TransactionSummary
          visible={showSummary}
          fromNetwork={currentNetwork}
          toNetwork={targetNetwork}
          token={selectedToken}
          amount={amount}
          fee={estimatedFee}
          recipientAddress={recipientAddress}
          onConfirm={handleTransfer}
          onCancel={() => setShowSummary(false)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  networkCard: {
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  networkName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balanceText: {
    marginTop: 8,
    fontSize: 14,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  maxButton: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  scanButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  feeText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    marginTop: 16,
    marginBottom: 32,
  },
});

export default BridgeScreen;
```

## 스테이킹 및 DeFi 기능

TORI Wallet 모바일 앱은 스테이킹 및 DeFi 기능을 제공합니다.

### 스테이킹 구성 요소

#### StakingScreen

`StakingScreen`은 스테이킹 대시보드 화면을 구현합니다.

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { useStaking } from '../../hooks/useStaking';
import { Card } from '../../components/common/Card';
import { ValidatorCard } from '../../components/staking/ValidatorCard';
import { StakingPositionCard } from '../../components/staking/StakingPositionCard';
import { StakingStats } from '../../components/staking/StakingStats';
import Icon from 'react-native-vector-icons/Ionicons';

const StakingScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { selectedAccount } = useWallet();
  const { currentNetwork } = useNetwork();
  const {
    validators,
    stakingPositions,
    isLoading,
    error,
    refreshValidators,
    refreshStakingPositions,
  } = useStaking();
  
  const [activeTab, setActiveTab] = useState('positions');
  const [refreshing, setRefreshing] = useState(false);
  
  // 새로고침 처리
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshValidators(), refreshStakingPositions()]);
    setRefreshing(false);
  };
  
  // 검증인 선택 처리
  const handleValidatorSelect = (validator) => {
    navigation.navigate('ValidatorDetails', { validator });
  };
  
  // 스테이킹 화면 이동 처리
  const navigateToStake = () => {
    navigation.navigate('Stake');
  };
  
  // 메인 렌더링
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('Staking')}
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={navigateToStake}
        >
          <Icon name="add-circle" size={24} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
            {t('Stake')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <StakingStats
        stakingPositions={stakingPositions}
        network={currentNetwork}
      />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'positions' && [
              styles.activeTab,
              { borderBottomColor: theme.colors.primary },
            ],
          ]}
          onPress={() => setActiveTab('positions')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'positions' ? theme.colors.primary : theme.colors.text },
            ]}
          >
            {t('Your Positions')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'validators' && [
              styles.activeTab,
              { borderBottomColor: theme.colors.primary },
            ],
          ]}
          onPress={() => setActiveTab('validators')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'validators' ? theme.colors.primary : theme.colors.text },
            ]}
          >
            {t('Validators')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <Card style={styles.errorCard}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        </Card>
      )}
      
      {activeTab === 'positions' && (
        <FlatList
          data={stakingPositions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StakingPositionCard
              position={item}
              onPress={() => navigation.navigate('StakingDetails', { position: item })}
              onUnstake={() => navigation.navigate('Unstake', { position: item })}
              onClaimReward={() => navigation.navigate('ClaimRewards', { position: item })}
            />
          )}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {isLoading
                  ? t('Loading staking positions...')
                  : t('You don\'t have any active staking positions.')}
              </Text>
              {!isLoading && (
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
                  onPress={navigateToStake}
                >
                  <Text style={[styles.emptyButtonText, { color: theme.colors.white }]}>
                    {t('Stake Now')}
                  </Text>
                </TouchableOpacity>
              )}
            </Card>
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
      
      {activeTab === 'validators' && (
        <FlatList
          data={validators}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ValidatorCard
              validator={item}
              onPress={() => handleValidatorSelect(item)}
            />
          )}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {isLoading
                  ? t('Loading validators...')
                  : t('No validators available for the current network.')}
              </Text>
            </Card>
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  errorCard: {
    margin: 16,
    padding: 16,
  },
  errorText: {
    fontSize: 14,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StakingScreen;
```

## 결론

TORI Wallet 모바일 앱은 다양한 블록체인 네트워크를 지원하는 포괄적인 암호화폐 지갑 애플리케이션입니다. 이 문서에서는 앱의 주요 API와 컴포넌트에 대한 설명을 제공했습니다.

주요 기능:

1. **멀티체인 지원**: 다양한 블록체인 네트워크(Zenith Chain, Catena Chain, 이더리움, 비트코인, BSC, 폴리곤, 솔라나 등)를 지원합니다.
2. **계정 및 지갑 관리**: 지갑 생성, 가져오기, 백업, 복원 및 다중 계정 관리 기능을 제공합니다.
3. **자산 관리**: 암호화폐 토큰 및 NFT 자산 관리 기능을 제공합니다.
4. **트랜잭션 기능**: 기본 트랜잭션 및 고급 트랜잭션 기능을 제공합니다.
5. **크로스체인 기능**: ICP 인터체인 전송, 크로스체인 브릿지, 크로스체인 스왑 기능을 제공합니다.
6. **스테이킹 및 수익 창출**: CTA 스테이킹, DeFi 통합 기능을 제공합니다.
7. **dApp 브라우저 및 연결**: 내장 웹3 브라우저, WalletConnect 통합 기능을 제공합니다.
8. **생체 인증**: 지문 인식, Face ID 등 생체 인증 기능을 제공합니다.
9. **푸시 알림**: 트랜잭션 알림, 스테이킹 보상 알림 등을 제공합니다.
10. **QR 코드 기능**: QR 코드 스캔 및 생성 기능을 제공합니다.

이 문서를 통해 개발자들은 TORI Wallet 모바일 앱의 구조와 주요 API를 이해하고, 앱의 기능을 확장하거나 커스터마이징할 수 있습니다.
