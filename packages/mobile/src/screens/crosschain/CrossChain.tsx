import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// 컴포넌트
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

// 훅
import { useTheme } from '../../hooks/useTheme';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { useCrossChain } from '../../hooks/useCrossChain';

// 유틸리티
import { formatAmount, formatFiatValue } from '../../utils/formatters';
import { showToast } from '../../utils/toast';

// 타입
import { Asset } from '../../types/assets';
import { Network } from '../../types/network';
import { CrossChainProvider, BridgeInfo } from '../../types/crosschain';

// 브릿지 카드 컴포넌트
type BridgeCardProps = {
  bridge: BridgeInfo;
  onPress: (bridge: BridgeInfo) => void;
};

const BridgeCard: React.FC<BridgeCardProps> = ({ bridge, onPress }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  return (
    <TouchableOpacity
      style={[styles.bridgeCard, { backgroundColor: theme.colors.card }]}
      onPress={() => onPress(bridge)}
    >
      <View style={styles.bridgeHeader}>
        <Image 
          source={{ uri: bridge.logoUrl }} 
          style={styles.bridgeLogo}
          defaultSource={require('../../../assets/images/default-bridge-icon.png')}
        />
        <Text style={[styles.bridgeName, { color: theme.colors.text }]}>
          {bridge.name}
        </Text>
      </View>
      
      <View style={styles.bridgeNetworks}>
        {bridge.supportedNetworks.slice(0, 4).map((network, index, arr) => (
          <React.Fragment key={network.id}>
            <View style={styles.networkIcon}>
              {network.icon ? (
                <Image 
                  source={{ uri: network.iconUrl }} 
                  style={styles.networkLogo}
                  defaultSource={require('../../../assets/images/default-network-icon.png')}
                />
              ) : (
                <View 
                  style={[
                    styles.defaultNetworkIcon, 
                    { backgroundColor: theme.colors.primaryLight }
                  ]}
                >
                  <Text style={[styles.defaultNetworkText, { color: theme.colors.primary }]}>
                    {network.name.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            
            {index < arr.length - 1 && (
              <View style={styles.networkConnector}>
                <View style={[styles.connectorLine, { backgroundColor: theme.colors.border }]} />
              </View>
            )}
          </React.Fragment>
        ))}
        
        {bridge.supportedNetworks.length > 4 && (
          <View style={[styles.moreNetworks, { backgroundColor: theme.colors.cardAlt }]}>
            <Text style={[styles.moreNetworksText, { color: theme.colors.secondaryText }]}>
              +{bridge.supportedNetworks.length - 4}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.bridgeInfo}>
        <View style={styles.bridgeInfoItem}>
          <Text style={[styles.bridgeInfoLabel, { color: theme.colors.secondaryText }]}>
            {t('crossChain.fee')}
          </Text>
          <Text style={[styles.bridgeInfoValue, { color: theme.colors.text }]}>
            {bridge.fee ? `${bridge.fee}%` : t('crossChain.variesByToken')}
          </Text>
        </View>
        
        <View style={styles.bridgeInfoItem}>
          <Text style={[styles.bridgeInfoLabel, { color: theme.colors.secondaryText }]}>
            {t('crossChain.time')}
          </Text>
          <Text style={[styles.bridgeInfoValue, { color: theme.colors.text }]}>
            {bridge.time}
          </Text>
        </View>
      </View>
      
      <Icon name="chevron-forward" size={20} color={theme.colors.secondaryText} style={styles.bridgeArrow} />
    </TouchableOpacity>
  );
};

// Recent CrossChain Transaction 컴포넌트
type RecentTransactionProps = {
  transaction: any; // 실제 구현에서는 더 구체적인 타입 정의 필요
  onPress: (transaction: any) => void;
};

const RecentTransaction: React.FC<RecentTransactionProps> = ({ transaction, onPress }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  // 트랜잭션 상태에 따른 아이콘 및 색상
  const getStatusIconAndColor = () => {
    switch (transaction.status) {
      case 'completed':
        return { icon: 'checkmark-circle', color: theme.colors.success };
      case 'pending':
        return { icon: 'time', color: theme.colors.warning };
      case 'failed':
        return { icon: 'close-circle', color: theme.colors.error };
      default:
        return { icon: 'help-circle', color: theme.colors.secondaryText };
    }
  };
  
  const { icon, color } = getStatusIconAndColor();
  
  return (
    <TouchableOpacity
      style={[styles.transactionCard, { backgroundColor: theme.colors.card }]}
      onPress={() => onPress(transaction)}
    >
      <View style={styles.transactionNetworks}>
        <View style={styles.networkWithSymbol}>
          {transaction.fromNetwork.icon ? (
            <Image 
              source={{ uri: transaction.fromNetwork.iconUrl }} 
              style={styles.transactionNetworkIcon}
              defaultSource={require('../../../assets/images/default-network-icon.png')}
            />
          ) : (
            <View 
              style={[
                styles.defaultTransactionNetworkIcon, 
                { backgroundColor: theme.colors.primaryLight }
              ]}
            >
              <Text style={[styles.defaultNetworkText, { color: theme.colors.primary }]}>
                {transaction.fromNetwork.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={[styles.networkSymbol, { color: theme.colors.text }]}>
            {transaction.asset.symbol}
          </Text>
        </View>
        
        <Icon name="arrow-forward" size={16} color={theme.colors.secondaryText} style={styles.transactionArrow} />
        
        <View style={styles.networkWithSymbol}>
          {transaction.toNetwork.icon ? (
            <Image 
              source={{ uri: transaction.toNetwork.iconUrl }} 
              style={styles.transactionNetworkIcon}
              defaultSource={require('../../../assets/images/default-network-icon.png')}
            />
          ) : (
            <View 
              style={[
                styles.defaultTransactionNetworkIcon, 
                { backgroundColor: theme.colors.primaryLight }
              ]}
            >
              <Text style={[styles.defaultNetworkText, { color: theme.colors.primary }]}>
                {transaction.toNetwork.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={[styles.networkSymbol, { color: theme.colors.text }]}>
            {transaction.asset.symbol}
          </Text>
        </View>
      </View>
      
      <View style={styles.transactionDetails}>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionAmount, { color: theme.colors.text }]}>
            {formatAmount(transaction.amount, transaction.asset.decimals)} {transaction.asset.symbol}
          </Text>
          <Text style={[styles.transactionDate, { color: theme.colors.secondaryText }]}>
            {new Date(transaction.timestamp).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.transactionStatus}>
          <Icon name={icon as any} size={16} color={color} />
          <Text style={[styles.transactionStatusText, { color }]}>
            {t(`crossChain.status.${transaction.status}`)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// 크로스체인 메인 화면
const CrossChain: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 훅 사용
  const { activeWallet, activeAccount } = useWallet();
  const { currentNetwork, networks } = useNetwork();
  const { 
    bridges, 
    providers, 
    recentTransactions, 
    fetchBridges, 
    fetchProviders, 
    fetchRecentTransactions
  } = useCrossChain();
  
  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<CrossChainProvider | null>(null);
  
  // 데이터 가져오기
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBridges(),
        fetchProviders(),
        fetchRecentTransactions()
      ]);
      
      // 기본 제공자 선택 (Catena 기반)
      const defaultProvider = providers.find(p => p.id === 'catena-icp') || providers[0];
      setSelectedProvider(defaultProvider);
    } catch (error) {
      console.error('Error fetching cross-chain data:', error);
      showToast(t('crossChain.fetchError'), 'error');
    } finally {
      setLoading(false);
    }
  }, [fetchBridges, fetchProviders, fetchRecentTransactions, providers, t]);
  
  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // 새로고침 핸들러
  const handleRefresh = () => {
    fetchData();
  };
  
  // 제공자 선택 핸들러
  const handleProviderSelect = (provider: CrossChainProvider) => {
    setSelectedProvider(provider);
  };
  
  // 브릿지 선택 핸들러
  const handleBridgeSelect = (bridge: BridgeInfo) => {
    navigation.navigate('BridgeDetail' as never, { bridgeId: bridge.id } as never);
  };
  
  // ICP 전송 화면으로 이동
  const navigateToICPTransfer = () => {
    navigation.navigate('ICPTransfer' as never);
  };
  
  // 크로스체인 스왑 화면으로 이동
  const navigateToCrossChainSwap = () => {
    navigation.navigate('CrossChainSwap' as never);
  };
  
  // 트랜잭션 기록 화면으로 이동
  const navigateToTransactionHistory = () => {
    navigation.navigate('CrossChainHistory' as never);
  };
  
  // 트랜잭션 상세 화면으로 이동
  const handleTransactionPress = (transaction: any) => {
    navigation.navigate('CrossChainTxDetail' as never, { txId: transaction.id } as never);
  };
  
  // 로딩 인디케이터 렌더링
  const renderLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          {t('crossChain.loading')}
        </Text>
      </View>
    );
  };
  
  // 필터링된 브릿지 목록
  const filteredBridges = selectedProvider
    ? bridges.filter(bridge => bridge.providerId === selectedProvider.id)
    : bridges;
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header
          title={t('crossChain.title')}
          onBack={() => navigation.goBack()}
        />
        {renderLoading()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={t('crossChain.title')}
        onBack={() => navigation.goBack()}
        rightIcon={
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={navigateToTransactionHistory}
          >
            <Icon name="time-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        refreshing={loading}
        onRefresh={handleRefresh}
      >
        {/* 크로스체인 방법 섹션 */}
        <View style={styles.methodsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('crossChain.methods')}
          </Text>
          
          <View style={styles.methodsGrid}>
            <TouchableOpacity
              style={[styles.methodCard, { backgroundColor: theme.colors.card }]}
              onPress={navigateToICPTransfer}
            >
              <View style={[styles.methodIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Icon name="swap-vertical" size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.methodTitle, { color: theme.colors.text }]}>
                {t('crossChain.icpTransfer')}
              </Text>
              <Text style={[styles.methodDescription, { color: theme.colors.secondaryText }]}>
                {t('crossChain.icpTransferDescription')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.methodCard, { backgroundColor: theme.colors.card }]}
              onPress={navigateToCrossChainSwap}
            >
              <View style={[styles.methodIconContainer, { backgroundColor: theme.colors.success + '20' }]}>
                <Icon name="repeat" size={24} color={theme.colors.success} />
              </View>
              <Text style={[styles.methodTitle, { color: theme.colors.text }]}>
                {t('crossChain.crossChainSwap')}
              </Text>
              <Text style={[styles.methodDescription, { color: theme.colors.secondaryText }]}>
                {t('crossChain.crossChainSwapDescription')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* 제공자 선택 섹션 */}
        <View style={styles.providersSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('crossChain.providers')}
          </Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.providersScrollContent}
          >
            {providers.map(provider => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerButton,
                  selectedProvider?.id === provider.id && styles.selectedProviderButton,
                  {
                    backgroundColor: selectedProvider?.id === provider.id 
                      ? theme.colors.primary + '20' 
                      : theme.colors.card,
                    borderColor: selectedProvider?.id === provider.id 
                      ? theme.colors.primary 
                      : theme.colors.border
                  }
                ]}
                onPress={() => handleProviderSelect(provider)}
              >
                <Image 
                  source={{ uri: provider.logoUrl }} 
                  style={styles.providerLogo}
                  defaultSource={require('../../../assets/images/default-provider-icon.png')}
                />
                <Text 
                  style={[
                    styles.providerName,
                    { 
                      color: selectedProvider?.id === provider.id 
                        ? theme.colors.primary 
                        : theme.colors.text 
                    }
                  ]}
                >
                  {provider.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* 브릿지 목록 섹션 */}
        <View style={styles.bridgesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('crossChain.bridges')}
            </Text>
            
            <Text style={[styles.sectionSubtitle, { color: theme.colors.secondaryText }]}>
              {selectedProvider 
                ? t('crossChain.filteredBridges', { provider: selectedProvider.name })
                : t('crossChain.allBridges')}
            </Text>
          </View>
          
          {filteredBridges.length > 0 ? (
            filteredBridges.map(bridge => (
              <BridgeCard
                key={bridge.id}
                bridge={bridge}
                onPress={handleBridgeSelect}
              />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Icon name="alert-circle-outline" size={32} color={theme.colors.secondaryText} style={styles.emptyIcon} />
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                {t('crossChain.noBridgesFound')}
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.secondaryText }]}>
                {selectedProvider
                  ? t('crossChain.tryDifferentProvider')
                  : t('crossChain.tryAgainLater')}
              </Text>
            </Card>
          )}
        </View>
        
        {/* 최근 거래 섹션 */}
        {recentTransactions.length > 0 && (
          <View style={styles.recentTransactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('crossChain.recentTransactions')}
              </Text>
              
              <TouchableOpacity onPress={navigateToTransactionHistory}>
                <Text style={[styles.viewAllButton, { color: theme.colors.primary }]}>
                  {t('crossChain.viewAll')}
                </Text>
              </TouchableOpacity>
            </View>
            
            {recentTransactions.slice(0, 3).map(tx => (
              <RecentTransaction
                key={tx.id}
                transaction={tx}
                onPress={handleTransactionPress}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  historyButton: {
    padding: 8,
  },
  methodsSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  methodsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  methodCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  methodDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  providersSection: {
    marginBottom: 8,
  },
  providersScrollContent: {
    paddingRight: 16,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  selectedProviderButton: {
    borderWidth: 1,
  },
  providerLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '500',
  },
  bridgesSection: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 12,
  },
  bridgeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bridgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bridgeLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  bridgeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  bridgeNetworks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  networkIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  networkLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  defaultNetworkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultNetworkText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  networkConnector: {
    width: 16,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectorLine: {
    width: 12,
    height: 1,
  },
  moreNetworks: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  moreNetworksText: {
    fontSize: 10,
    fontWeight: '500',
  },
  bridgeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bridgeInfoItem: {},
  bridgeInfoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  bridgeInfoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  bridgeArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  recentTransactionsSection: {
    marginBottom: 8,
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionNetworks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  networkWithSymbol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionNetworkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  defaultTransactionNetworkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  networkSymbol: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionArrow: {
    marginHorizontal: 12,
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  transactionInfo: {},
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default CrossChain;
