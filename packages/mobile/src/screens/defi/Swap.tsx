import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useDefi } from '../../hooks/useDefi';
import { useWallet } from '../../hooks/useWallet';
import { useAssets } from '../../hooks/useAssets';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import TokenSelector from '../../components/defi/TokenSelector';
import TokenAmountInput from '../../components/common/TokenAmountInput';
import SwapSettingsModal from '../../components/defi/SwapSettingsModal';
import { Token, AssetType } from '../../types/assets';
import { SwapQuote, SwapSettings, SwapTransaction } from '../../types/defi';

/**
 * 토큰 스왑 화면
 * 사용자가 토큰을 다른 토큰으로 교환할 수 있는 화면입니다.
 */
const Swap: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { activeWallet, activeNetwork } = useWallet();
  const { getTokens, getAssetBalance, getTokenPrice } = useAssets();
  const { getSwapQuote, executeSwap } = useDefi();

  // 상태 관리
  const [loading, setLoading] = useState<boolean>(true);
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [receiveAmount, setReceiveAmount] = useState<string>('');
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [showTokenSelector, setShowTokenSelector] = useState<boolean>(false);
  const [tokenSelectorType, setTokenSelectorType] = useState<'from' | 'to'>('from');
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState<boolean>(false);
  const [swapLoading, setSwapLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [swapSettings, setSwapSettings] = useState<SwapSettings>({
    slippageTolerance: 0.5,
    deadline: 20, // 분 단위
    autoRouting: true,
  });
  const [recentSwaps, setRecentSwaps] = useState<SwapTransaction[]>([]);

  // 토큰 데이터 로드
  useEffect(() => {
    const loadTokens = async () => {
      try {
        setLoading(true);
        if (!activeNetwork) return;
        
        const tokens = await getTokens(activeNetwork.id);
        setAvailableTokens(tokens);
        
        // 기본 토큰 설정 (네트워크 기본 토큰과 가장 인기 있는 토큰)
        if (tokens.length > 0) {
          const defaultToken = tokens.find(token => token.isNative) || tokens[0];
          const secondToken = tokens.find(token => !token.isNative && token.symbol !== defaultToken.symbol) || (tokens.length > 1 ? tokens[1] : null);
          
          setFromToken(defaultToken);
          setToToken(secondToken);
        }
        
        // 최근 스왑 내역 로드 (예시 데이터)
        // TODO: 실제 스왑 내역 데이터 로드 구현
        const mockRecentSwaps: SwapTransaction[] = [
          {
            id: '1',
            fromToken: {
              id: 'cta',
              symbol: 'CTA',
              name: 'Catena',
              decimals: 18,
              iconUrl: 'https://example.com/cta.png',
              price: 0.5,
              type: AssetType.TOKEN,
              isNative: true,
            },
            toToken: {
              id: 'eth',
              symbol: 'ETH',
              name: 'Ethereum',
              decimals: 18,
              iconUrl: 'https://example.com/eth.png',
              price: 2000,
              type: AssetType.TOKEN,
              isNative: false,
            },
            fromAmount: 100,
            toAmount: 0.025,
            timestamp: Date.now() - 3600000, // 1 hour ago
            status: 'completed',
            txHash: '0x123456789abcdef',
          },
          {
            id: '2',
            fromToken: {
              id: 'eth',
              symbol: 'ETH',
              name: 'Ethereum',
              decimals: 18,
              iconUrl: 'https://example.com/eth.png',
              price: 2000,
              type: AssetType.TOKEN,
              isNative: false,
            },
            toToken: {
              id: 'usdt',
              symbol: 'USDT',
              name: 'Tether',
              decimals: 6,
              iconUrl: 'https://example.com/usdt.png',
              price: 1,
              type: AssetType.TOKEN,
              isNative: false,
            },
            fromAmount: 0.5,
            toAmount: 995,
            timestamp: Date.now() - 86400000, // 1 day ago
            status: 'completed',
            txHash: '0xabcdef123456789',
          },
        ];
        
        setRecentSwaps(mockRecentSwaps);
      } catch (error) {
        console.error('Failed to load tokens:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTokens();
  }, [activeNetwork]);

  // 견적 가져오기
  useEffect(() => {
    const fetchQuote = async () => {
      if (!activeWallet || !fromToken || !toToken || !tokenAmount || parseFloat(tokenAmount) <= 0) {
        setSwapQuote(null);
        setReceiveAmount('');
        return;
      }
      
      try {
        setQuoteLoading(true);
        
        const quote = await getSwapQuote({
          fromTokenId: fromToken.id,
          toTokenId: toToken.id,
          amount: parseFloat(tokenAmount),
          walletAddress: activeWallet.address,
          networkId: activeNetwork?.id || '',
          slippageTolerance: swapSettings.slippageTolerance,
        });
        
        setSwapQuote(quote);
        setReceiveAmount(quote.toAmount.toString());
      } catch (error) {
        console.error('Failed to fetch swap quote:', error);
        setSwapQuote(null);
        setReceiveAmount('');
      } finally {
        setQuoteLoading(false);
      }
    };
    
    // 디바운스 적용
    const debounceTimeout = setTimeout(() => {
      fetchQuote();
    }, 500);
    
    return () => clearTimeout(debounceTimeout);
  }, [fromToken, toToken, tokenAmount, activeWallet, activeNetwork, swapSettings.slippageTolerance]);

  // 토큰 선택기 열기
  const openTokenSelector = (type: 'from' | 'to') => {
    setTokenSelectorType(type);
    setShowTokenSelector(true);
  };

  // 토큰 선택 처리
  const handleTokenSelect = (token: Token) => {
    if (tokenSelectorType === 'from') {
      // 만약 선택한 토큰이 toToken과 같으면 서로 바꿈
      if (toToken && token.id === toToken.id) {
        setFromToken(toToken);
        setToToken(token);
      } else {
        setFromToken(token);
      }
    } else {
      // 만약 선택한 토큰이 fromToken과 같으면 서로 바꿈
      if (fromToken && token.id === fromToken.id) {
        setToToken(fromToken);
        setFromToken(token);
      } else {
        setToToken(token);
      }
    }
    setShowTokenSelector(false);
    setTokenAmount(''); // 금액 초기화
  };

  // 토큰 위치 바꾸기
  const handleSwitchTokens = () => {
    if (!fromToken || !toToken) return;
    
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setTokenAmount(''); // 금액 초기화
  };

  // 최대 금액 설정
  const handleMaxAmount = () => {
    if (!fromToken || !activeWallet) return;
    
    const balance = getAssetBalance(fromToken.id);
    setTokenAmount(balance.toString());
  };

  // 스왑 실행
  const handleSwap = async () => {
    if (!activeWallet || !fromToken || !toToken || !swapQuote) {
      Alert.alert(t('common:error'), t('defi:invalidSwapData'));
      return;
    }
    
    try {
      setSwapLoading(true);
      
      const result = await executeSwap({
        quote: swapQuote,
        walletAddress: activeWallet.address,
        networkId: activeNetwork?.id || '',
        settings: swapSettings,
      });
      
      // 스왑 성공 후 화면 업데이트
      Alert.alert(
        t('common:success'),
        t('defi:swapSuccess', {
          amount: swapQuote.fromAmount,
          fromSymbol: fromToken.symbol,
          toAmount: swapQuote.toAmount,
          toSymbol: toToken.symbol,
        }),
        [
          {
            text: t('common:viewDetails'),
            onPress: () => navigation.navigate('TransactionDetails', { tx: result.txHash }),
          },
          { text: t('common:ok') },
        ]
      );
      
      // 입력 초기화
      setTokenAmount('');
      setReceiveAmount('');
      setSwapQuote(null);
      
      // 최근 스왑 내역 업데이트
      const newSwap: SwapTransaction = {
        id: result.txHash,
        fromToken,
        toToken,
        fromAmount: swapQuote.fromAmount,
        toAmount: swapQuote.toAmount,
        timestamp: Date.now(),
        status: 'completed',
        txHash: result.txHash,
      };
      
      setRecentSwaps([newSwap, ...recentSwaps]);
    } catch (error) {
      console.error('Failed to execute swap:', error);
      Alert.alert(t('common:error'), t('defi:swapFailed'));
    } finally {
      setSwapLoading(false);
    }
  };

  // 스왑 설정 업데이트
  const handleUpdateSettings = (newSettings: SwapSettings) => {
    setSwapSettings(newSettings);
    setShowSettings(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Header title={t('defi:swap')} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            {t('common:loading')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header 
        title={t('defi:swap')} 
        rightComponent={
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <MaterialIcons name="settings" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.swapCard}>
          {/* 스왑 헤더 - 네트워크 정보 */}
          <View style={styles.swapHeader}>
            <Text style={[styles.networkName, { color: theme.text }]}>
              {activeNetwork?.name || ''}
            </Text>
            <TouchableOpacity
              style={[styles.historyButton, { borderColor: theme.border }]}
              onPress={() => navigation.navigate('SwapHistory')}
            >
              <Text style={[styles.historyButtonText, { color: theme.textSecondary }]}>
                {t('defi:history')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* 내보내는 토큰 섹션 */}
          <View style={styles.tokenSection}>
            <View style={styles.tokenSectionHeader}>
              <Text style={[styles.tokenSectionTitle, { color: theme.textSecondary }]}>
                {t('defi:from')}
              </Text>
              {fromToken && (
                <TouchableOpacity onPress={handleMaxAmount}>
                  <Text style={[styles.maxButton, { color: theme.primary }]}>
                    {t('common:max')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.tokenInputContainer}>
              <TouchableOpacity
                style={[styles.tokenSelectButton, { borderColor: theme.border }]}
                onPress={() => openTokenSelector('from')}
              >
                {fromToken ? (
                  <View style={styles.selectedToken}>
                    {fromToken.iconUrl ? (
                      <Image
                        source={{ uri: fromToken.iconUrl }}
                        style={styles.tokenIcon}
                      />
                    ) : (
                      <View
                        style={[
                          styles.tokenIconPlaceholder,
                          { backgroundColor: theme.cardBackground },
                        ]}
                      />
                    )}
                    <Text style={[styles.tokenSymbol, { color: theme.text }]}>
                      {fromToken.symbol}
                    </Text>
                    <MaterialIcons
                      name="keyboard-arrow-down"
                      size={20}
                      color={theme.textSecondary}
                    />
                  </View>
                ) : (
                  <Text style={[styles.selectTokenText, { color: theme.text }]}>
                    {t('defi:selectToken')}
                  </Text>
                )}
              </TouchableOpacity>
              
              <TokenAmountInput
                value={tokenAmount}
                onChangeText={setTokenAmount}
                placeholder="0.0"
                keyboardType="decimal-pad"
                containerStyle={styles.amountInput}
                maxAmount={fromToken ? getAssetBalance(fromToken.id) : 0}
                symbol={fromToken?.symbol || ''}
                fiatValue={
                  fromToken && tokenAmount
                    ? parseFloat(tokenAmount) * (fromToken.price || 0)
                    : undefined
                }
              />
            </View>
            
            {fromToken && (
              <Text style={[styles.balanceText, { color: theme.textSecondary }]}>
                {t('defi:balance')}: {getAssetBalance(fromToken.id).toFixed(6)} {fromToken.symbol}
              </Text>
            )}
          </View>
          
          {/* 토큰 전환 버튼 */}
          <View style={styles.switchButtonContainer}>
            <TouchableOpacity
              style={[styles.switchButton, { backgroundColor: theme.primary }]}
              onPress={handleSwitchTokens}
            >
              <MaterialIcons name="swap-vert" size={24} color={theme.buttonText} />
            </TouchableOpacity>
          </View>
          
          {/* 받는 토큰 섹션 */}
          <View style={styles.tokenSection}>
            <View style={styles.tokenSectionHeader}>
              <Text style={[styles.tokenSectionTitle, { color: theme.textSecondary }]}>
                {t('defi:to')}
              </Text>
            </View>
            
            <View style={styles.tokenInputContainer}>
              <TouchableOpacity
                style={[styles.tokenSelectButton, { borderColor: theme.border }]}
                onPress={() => openTokenSelector('to')}
              >
                {toToken ? (
                  <View style={styles.selectedToken}>
                    {toToken.iconUrl ? (
                      <Image
                        source={{ uri: toToken.iconUrl }}
                        style={styles.tokenIcon}
                      />
                    ) : (
                      <View
                        style={[
                          styles.tokenIconPlaceholder,
                          { backgroundColor: theme.cardBackground },
                        ]}
                      />
                    )}
                    <Text style={[styles.tokenSymbol, { color: theme.text }]}>
                      {toToken.symbol}
                    </Text>
                    <MaterialIcons
                      name="keyboard-arrow-down"
                      size={20}
                      color={theme.textSecondary}
                    />
                  </View>
                ) : (
                  <Text style={[styles.selectTokenText, { color: theme.text }]}>
                    {t('defi:selectToken')}
                  </Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.amountInput}>
                <Text style={[styles.receiveAmountText, { color: theme.text }]}>
                  {quoteLoading ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : receiveAmount ? (
                    receiveAmount
                  ) : (
                    '0.0'
                  )}
                </Text>
                {toToken && receiveAmount && parseFloat(receiveAmount) > 0 && (
                  <Text style={[styles.fiatValue, { color: theme.textSecondary }]}>
                    ≈ ${(parseFloat(receiveAmount) * (toToken.price || 0)).toFixed(2)}
                  </Text>
                )}
              </View>
            </View>
            
            {toToken && (
              <Text style={[styles.balanceText, { color: theme.textSecondary }]}>
                {t('defi:balance')}: {getAssetBalance(toToken.id).toFixed(6)} {toToken.symbol}
              </Text>
            )}
          </View>
          
          {/* 스왑 세부 정보 */}
          {swapQuote && (
            <View style={styles.swapDetailsContainer}>
              <View style={styles.swapDetailRow}>
                <Text style={[styles.swapDetailLabel, { color: theme.textSecondary }]}>
                  {t('defi:rate')}
                </Text>
                <Text style={[styles.swapDetailValue, { color: theme.text }]}>
                  1 {fromToken?.symbol} ≈ {swapQuote.exchangeRate.toFixed(6)} {toToken?.symbol}
                </Text>
              </View>
              
              <View style={styles.swapDetailRow}>
                <Text style={[styles.swapDetailLabel, { color: theme.textSecondary }]}>
                  {t('defi:priceImpact')}
                </Text>
                <Text
                  style={[
                    styles.swapDetailValue,
                    {
                      color:
                        swapQuote.priceImpact < 1
                          ? theme.success
                          : swapQuote.priceImpact < 5
                          ? theme.warning
                          : theme.error,
                    },
                  ]}
                >
                  {swapQuote.priceImpact.toFixed(2)}%
                </Text>
              </View>
              
              <View style={styles.swapDetailRow}>
                <Text style={[styles.swapDetailLabel, { color: theme.textSecondary }]}>
                  {t('defi:minimumReceived')}
                </Text>
                <Text style={[styles.swapDetailValue, { color: theme.text }]}>
                  {swapQuote.minimumReceived.toFixed(6)} {toToken?.symbol}
                </Text>
              </View>
              
              <View style={styles.swapDetailRow}>
                <Text style={[styles.swapDetailLabel, { color: theme.textSecondary }]}>
                  {t('defi:fee')}
                </Text>
                <Text style={[styles.swapDetailValue, { color: theme.text }]}>
                  {swapQuote.fee.toFixed(6)} {fromToken?.symbol}
                </Text>
              </View>
              
              <View style={styles.swapDetailRow}>
                <Text style={[styles.swapDetailLabel, { color: theme.textSecondary }]}>
                  {t('defi:route')}
                </Text>
                <Text style={[styles.swapDetailValue, { color: theme.primary }]}>
                  {swapQuote.route.join(' > ')}
                </Text>
              </View>
            </View>
          )}
          
          {/* 스왑 버튼 */}
          <Button
            title={
              !fromToken || !toToken
                ? t('defi:selectTokens')
                : !tokenAmount || parseFloat(tokenAmount) <= 0
                ? t('defi:enterAmount')
                : fromToken &&
                  parseFloat(tokenAmount) > getAssetBalance(fromToken.id)
                ? t('defi:insufficientBalance')
                : t('defi:swap')
            }
            onPress={handleSwap}
            loading={swapLoading}
            disabled={
              !fromToken ||
              !toToken ||
              !tokenAmount ||
              parseFloat(tokenAmount) <= 0 ||
              !swapQuote ||
              (fromToken &&
                parseFloat(tokenAmount) > getAssetBalance(fromToken.id)) ||
              swapLoading
            }
            style={styles.swapButton}
          />
        </Card>
        
        {/* 최근 스왑 내역 */}
        {recentSwaps.length > 0 && (
          <Card style={styles.recentSwapsCard}>
            <Text style={[styles.recentSwapsTitle, { color: theme.text }]}>
              {t('defi:recentSwaps')}
            </Text>
            
            {recentSwaps.slice(0, 3).map((swap) => (
              <TouchableOpacity
                key={swap.id}
                style={styles.recentSwapItem}
                onPress={() =>
                  navigation.navigate('TransactionDetails', { tx: swap.txHash })
                }
              >
                <View style={styles.recentSwapTokens}>
                  <Text style={[styles.recentSwapAmount, { color: theme.text }]}>
                    {swap.fromAmount.toFixed(6)} {swap.fromToken.symbol}
                  </Text>
                  <MaterialIcons
                    name="arrow-right-alt"
                    size={18}
                    color={theme.textSecondary}
                    style={styles.arrowIcon}
                  />
                  <Text style={[styles.recentSwapAmount, { color: theme.text }]}>
                    {swap.toAmount.toFixed(6)} {swap.toToken.symbol}
                  </Text>
                </View>
                <Text style={[styles.recentSwapTime, { color: theme.textSecondary }]}>
                  {new Date(swap.timestamp).toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
            
            {recentSwaps.length > 3 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('SwapHistory')}
              >
                <Text style={[styles.viewAllText, { color: theme.primary }]}>
                  {t('common:viewAll')}
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        )}
      </ScrollView>
      
      {/* 토큰 선택 모달 */}
      <TokenSelector
        visible={showTokenSelector}
        tokens={availableTokens}
        onClose={() => setShowTokenSelector(false)}
        onSelect={handleTokenSelect}
        excludeTokenIds={
          tokenSelectorType === 'from' && toToken
            ? [toToken.id]
            : tokenSelectorType === 'to' && fromToken
            ? [fromToken.id]
            : []
        }
      />
      
      {/* 스왑 설정 모달 */}
      <SwapSettingsModal
        visible={showSettings}
        settings={swapSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleUpdateSettings}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  swapCard: {
    padding: 16,
    marginBottom: 16,
  },
  swapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  networkName: {
    fontSize: 16,
    fontWeight: '500',
  },
  historyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  historyButtonText: {
    fontSize: 12,
  },
  tokenSection: {
    marginBottom: 16,
  },
  tokenSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenSectionTitle: {
    fontSize: 14,
  },
  maxButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  tokenInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenSelectButton: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    borderWidth: 1,
    minWidth: 120,
  },
  selectedToken: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  tokenIconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  selectTokenText: {
    fontSize: 16,
  },
  amountInput: {
    flex: 1,
    marginLeft: 12,
    height: 48,
    justifyContent: 'center',
  },
  receiveAmountText: {
    fontSize: 18,
    fontWeight: '500',
  },
  fiatValue: {
    fontSize: 12,
    marginTop: 4,
  },
  balanceText: {
    fontSize: 12,
  },
  switchButtonContainer: {
    alignItems: 'center',
    marginVertical: -8,
    zIndex: 1,
  },
  switchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swapDetailsContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  swapDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  swapDetailLabel: {
    fontSize: 14,
  },
  swapDetailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  swapButton: {
    marginTop: 16,
  },
  recentSwapsCard: {
    padding: 16,
    marginBottom: 24,
  },
  recentSwapsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  recentSwapItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  recentSwapTokens: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentSwapAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  recentSwapTime: {
    fontSize: 12,
  },
  viewAllButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Swap;
