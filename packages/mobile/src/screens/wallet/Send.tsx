import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

// 컴포넌트
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

// 훅
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { useAssets } from '../../hooks/useAssets';
import { useTheme } from '../../hooks/useTheme';

// 서비스 및 유틸리티
import { validateAddress } from '../../utils/validators';
import { formatAmount, formatFiatValue } from '../../utils/formatters';
import { showToast } from '../../utils/toast';
import { TransactionService } from '../../services/transaction/transaction-service';

// 타입
import { Asset } from '../../types/assets';
import { Network } from '../../types/network';

type SendScreenParams = {
  Send: {
    asset?: Asset;
    address?: string;
    amount?: string;
  };
};

const Send: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<SendScreenParams, 'Send'>>();
  const insets = useSafeAreaInsets();
  
  // 훅 사용
  const { activeWallet, activeAccount } = useWallet();
  const { currentNetwork, networks, switchNetwork } = useNetwork();
  const { assets, refreshAssets, getPriceForAsset } = useAssets();
  
  // 트랜잭션 서비스 초기화
  const transactionService = new TransactionService();

  // 상태 관리
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [recipient, setRecipient] = useState(route.params?.address || '');
  const [amount, setAmount] = useState(route.params?.amount || '');
  const [memo, setMemo] = useState('');
  const [gasOption, setGasOption] = useState('medium'); // 'low', 'medium', 'high'
  const [gasPrice, setGasPrice] = useState('');
  const [gasLimit, setGasLimit] = useState('');
  const [isCustomGas, setIsCustomGas] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [availableNetworks, setAvailableNetworks] = useState<Network[]>([]);
  const [estimatedFee, setEstimatedFee] = useState('0');
  const [amountInFiat, setAmountInFiat] = useState('0');
  const [feeInFiat, setFeeInFiat] = useState('0');
  const [isAddressValid, setIsAddressValid] = useState(true);
  const [isAmountValid, setIsAmountValid] = useState(true);
  const [addressError, setAddressError] = useState('');
  const [amountError, setAmountError] = useState('');

  // 파라미터로부터 초기값 설정
  useEffect(() => {
    if (route.params?.asset) {
      setSelectedAsset(route.params.asset);
    } else if (assets.length > 0) {
      setSelectedAsset(assets[0]);
    }
  }, [route.params, assets]);

  // 가스 가격 업데이트
  useEffect(() => {
    if (currentNetwork && selectedAsset) {
      updateGasPrice();
    }
  }, [currentNetwork, selectedAsset, gasOption]);

  // 선택된 자산의 가격 계산
  useEffect(() => {
    if (selectedAsset && amount) {
      const fiatValue = getPriceForAsset(selectedAsset.symbol) * parseFloat(amount || '0');
      setAmountInFiat(formatFiatValue(fiatValue));
    } else {
      setAmountInFiat('0');
    }
  }, [selectedAsset, amount, getPriceForAsset]);

  // 수수료의 가격 계산
  useEffect(() => {
    if (currentNetwork && estimatedFee) {
      const nativeCoinPrice = getPriceForAsset(currentNetwork.nativeCurrency.symbol);
      const feeFiat = parseFloat(estimatedFee) * nativeCoinPrice;
      setFeeInFiat(formatFiatValue(feeFiat));
    }
  }, [currentNetwork, estimatedFee, getPriceForAsset]);

  // 주소 검증
  useEffect(() => {
    if (recipient) {
      const isValid = validateAddress(recipient, currentNetwork.type);
      setIsAddressValid(isValid);
      setAddressError(isValid ? '' : t('send.invalidAddress'));
    } else {
      setIsAddressValid(true);
      setAddressError('');
    }
  }, [recipient, currentNetwork, t]);

  // 금액 검증
  useEffect(() => {
    if (amount && selectedAsset) {
      const amountNum = parseFloat(amount);
      const balance = parseFloat(selectedAsset.balance);
      
      if (isNaN(amountNum) || amountNum <= 0) {
        setIsAmountValid(false);
        setAmountError(t('send.invalidAmount'));
      } else if (amountNum > balance) {
        setIsAmountValid(false);
        setAmountError(t('send.insufficientBalance'));
      } else {
        setIsAmountValid(true);
        setAmountError('');
      }
    } else {
      setIsAmountValid(true);
      setAmountError('');
    }
  }, [amount, selectedAsset, t]);

  // 사용 가능한 네트워크 필터링
  useEffect(() => {
    if (selectedAsset && networks) {
      const compatibleNetworks = networks.filter(network => 
        network.supportedTokens.includes(selectedAsset.symbol) ||
        network.nativeCurrency.symbol === selectedAsset.symbol
      );
      setAvailableNetworks(compatibleNetworks);
    }
  }, [selectedAsset, networks]);

  // 가스 가격 업데이트 함수
  const updateGasPrice = useCallback(async () => {
    if (!currentNetwork || !selectedAsset) return;

    try {
      // 가스 가격 예측
      const gasPrices = await transactionService.estimateGasPrices(currentNetwork.id);
      
      let selectedGasPrice;
      switch (gasOption) {
        case 'low':
          selectedGasPrice = gasPrices.slow;
          break;
        case 'high':
          selectedGasPrice = gasPrices.fast;
          break;
        case 'medium':
        default:
          selectedGasPrice = gasPrices.average;
          break;
      }
      
      setGasPrice(selectedGasPrice.toString());
      
      // 기본 가스 한도 설정
      const gasLimitValue = await transactionService.estimateGasLimit({
        from: activeAccount?.address || '',
        to: recipient || activeAccount?.address || '',
        value: amount || '0',
        data: '0x',
        network: currentNetwork.id
      });
      
      setGasLimit(gasLimitValue.toString());
      
      // 총 수수료 계산
      const totalFee = parseFloat(selectedGasPrice.toString()) * parseFloat(gasLimitValue.toString());
      setEstimatedFee(formatAmount(totalFee, currentNetwork.nativeCurrency.decimals));
    } catch (error) {
      console.error('Error updating gas price:', error);
      showToast(t('send.gasUpdateError'), 'error');
    }
  }, [currentNetwork, selectedAsset, gasOption, recipient, amount, activeAccount, t]);

  // 자산 선택 변경 핸들러
  const handleAssetChange = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowAssetSelector(false);
    
    // 선택한 자산에 맞는 네트워크 확인 및 변경
    const assetNetwork = networks.find(network => 
      network.supportedTokens.includes(asset.symbol) ||
      network.nativeCurrency.symbol === asset.symbol
    );
    
    if (assetNetwork && assetNetwork.id !== currentNetwork.id) {
      switchNetwork(assetNetwork.id);
    }
  };

  // 네트워크 변경 핸들러
  const handleNetworkChange = (network: Network) => {
    switchNetwork(network.id);
    setShowNetworkSelector(false);
  };

  // QR 코드 스캔 핸들러
  const handleScanQR = () => {
    navigation.navigate('QRCodeScan' as never, { onScan: (data: string) => {
      // QR 코드에서 읽은 데이터를 파싱합니다.
      // 일반적으로 'address' 혹은 'address?amount=value' 형식입니다.
      try {
        if (data.includes('?')) {
          const [address, params] = data.split('?');
          setRecipient(address);
          
          const urlParams = new URLSearchParams(params);
          const amountParam = urlParams.get('amount');
          if (amountParam) {
            setAmount(amountParam);
          }
        } else {
          setRecipient(data);
        }
      } catch (error) {
        console.error('Error parsing QR code:', error);
        showToast(t('send.invalidQRCode'), 'error');
      }
    }} as never);
  };

  // 최대 금액 버튼 핸들러
  const handleMaxAmount = () => {
    if (!selectedAsset) return;
    
    if (selectedAsset.symbol === currentNetwork.nativeCurrency.symbol) {
      // 네이티브 토큰의 경우 수수료를 고려해야 합니다
      const maxAmount = Math.max(
        parseFloat(selectedAsset.balance) - parseFloat(estimatedFee),
        0
      );
      setAmount(maxAmount.toString());
    } else {
      // 토큰의 경우 전체 잔액을 사용할 수 있습니다
      setAmount(selectedAsset.balance);
    }
  };

  // 전송 실행 핸들러
  const handleSend = async () => {
    // 유효성 검사
    if (!selectedAsset || !recipient || !amount || !isAddressValid || !isAmountValid) {
      showToast(t('send.invalidFields'), 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      // 트랜잭션 객체 생성
      const transactionRequest = {
        from: activeAccount?.address || '',
        to: recipient,
        value: amount,
        gasPrice: isCustomGas ? gasPrice : undefined,
        gasLimit: isCustomGas ? gasLimit : undefined,
        memo: memo,
        asset: selectedAsset,
        network: currentNetwork
      };

      // 트랜잭션 확인 다이얼로그 표시
      Alert.alert(
        t('send.confirmTitle'),
        t('send.confirmMessage', {
          amount,
          symbol: selectedAsset.symbol,
          recipient: `${recipient.substring(0, 6)}...${recipient.substring(recipient.length - 4)}`,
          fee: estimatedFee,
          feeSymbol: currentNetwork.nativeCurrency.symbol
        }),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
            onPress: () => setIsSubmitting(false)
          },
          {
            text: t('send.confirm'),
            style: 'default',
            onPress: async () => {
              try {
                // 트랜잭션 전송
                const txHash = await transactionService.sendTransaction(transactionRequest);
                
                setIsSubmitting(false);
                
                // 자산 정보 새로고침
                await refreshAssets();
                
                // 성공 메시지 표시
                showToast(t('send.success'), 'success');
                
                // 트랜잭션 상세 페이지로 이동
                navigation.navigate('TransactionDetails' as never, { txHash } as never);
              } catch (error) {
                console.error('Transaction error:', error);
                setIsSubmitting(false);
                showToast(
                  typeof error === 'string' 
                    ? error
                    : (error as Error).message || t('send.transactionError'),
                  'error'
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Send preparation error:', error);
      setIsSubmitting(false);
      showToast(
        typeof error === 'string' 
          ? error
          : (error as Error).message || t('send.preparationError'),
        'error'
      );
    }
  };

  // 토글 커스텀 가스 설정
  const toggleCustomGas = () => {
    setIsCustomGas(!isCustomGas);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Header
        title={t('send.title')}
        onBack={() => navigation.goBack()}
        rightIcon={
          <TouchableOpacity onPress={handleScanQR} style={styles.scanButton}>
            <Icon name="qr-code-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* 네트워크 선택 */}
        <Card style={styles.card}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('send.network')}
          </Text>
          <TouchableOpacity
            style={[styles.selector, { backgroundColor: theme.colors.card }]}
            onPress={() => setShowNetworkSelector(true)}
          >
            <View style={styles.selectorContent}>
              {currentNetwork.icon && (
                <Icon name={currentNetwork.icon} size={20} color={theme.colors.text} />
              )}
              <Text style={[styles.selectorText, { color: theme.colors.text }]}>
                {currentNetwork.name}
              </Text>
            </View>
            <Icon name="chevron-down" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </Card>

        {/* 자산 선택 */}
        <Card style={styles.card}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('send.asset')}
          </Text>
          <TouchableOpacity
            style={[styles.selector, { backgroundColor: theme.colors.card }]}
            onPress={() => setShowAssetSelector(true)}
          >
            <View style={styles.selectorContent}>
              {selectedAsset && (
                <>
                  <Text style={[styles.selectorText, { color: theme.colors.text }]}>
                    {selectedAsset.symbol}
                  </Text>
                  <Text style={[styles.balanceText, { color: theme.colors.secondaryText }]}>
                    {t('send.balance')}: {formatAmount(selectedAsset.balance, selectedAsset.decimals)} {selectedAsset.symbol}
                  </Text>
                </>
              )}
            </View>
            <Icon name="chevron-down" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </Card>

        {/* 수신자 주소 입력 */}
        <Card style={styles.card}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('send.recipient')}
          </Text>
          <Input
            value={recipient}
            onChangeText={setRecipient}
            placeholder={t('send.recipientPlaceholder')}
            autoCapitalize="none"
            autoCorrect={false}
            error={!isAddressValid}
            errorText={addressError}
            rightIcon={
              <TouchableOpacity onPress={handleScanQR}>
                <Icon name="qr-code" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            }
          />
        </Card>

        {/* 금액 입력 */}
        <Card style={styles.card}>
          <View style={styles.amountHeader}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('send.amount')}
            </Text>
            <TouchableOpacity onPress={handleMaxAmount}>
              <Text style={[styles.maxButton, { color: theme.colors.primary }]}>
                {t('send.max')}
              </Text>
            </TouchableOpacity>
          </View>
          
          <Input
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            error={!isAmountValid}
            errorText={amountError}
          />
          
          {selectedAsset && amount && (
            <Text style={[styles.fiatValue, { color: theme.colors.secondaryText }]}>
              ≈ {amountInFiat}
            </Text>
          )}
        </Card>

        {/* 메모 입력 (선택 사항) */}
        <Card style={styles.card}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('send.memo')} ({t('common.optional')})
          </Text>
          <Input
            value={memo}
            onChangeText={setMemo}
            placeholder={t('send.memoPlaceholder')}
            multiline
          />
        </Card>

        {/* 가스/수수료 설정 */}
        <Card style={styles.card}>
          <View style={styles.feeHeader}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('send.transactionFee')}
            </Text>
            <TouchableOpacity onPress={toggleCustomGas}>
              <Text style={[styles.customButton, { color: theme.colors.primary }]}>
                {isCustomGas ? t('send.useDefault') : t('send.custom')}
              </Text>
            </TouchableOpacity>
          </View>

          {!isCustomGas ? (
            <>
              <View style={styles.gasOptions}>
                <TouchableOpacity
                  style={[
                    styles.gasOption,
                    gasOption === 'low' && styles.selectedGasOption,
                    { backgroundColor: gasOption === 'low' ? theme.colors.primary + '33' : theme.colors.card }
                  ]}
                  onPress={() => setGasOption('low')}
                >
                  <Text style={[
                    styles.gasOptionText,
                    { color: gasOption === 'low' ? theme.colors.primary : theme.colors.text }
                  ]}>
                    {t('send.slow')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.gasOption,
                    gasOption === 'medium' && styles.selectedGasOption,
                    { backgroundColor: gasOption === 'medium' ? theme.colors.primary + '33' : theme.colors.card }
                  ]}
                  onPress={() => setGasOption('medium')}
                >
                  <Text style={[
                    styles.gasOptionText,
                    { color: gasOption === 'medium' ? theme.colors.primary : theme.colors.text }
                  ]}>
                    {t('send.average')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.gasOption,
                    gasOption === 'high' && styles.selectedGasOption,
                    { backgroundColor: gasOption === 'high' ? theme.colors.primary + '33' : theme.colors.card }
                  ]}
                  onPress={() => setGasOption('high')}
                >
                  <Text style={[
                    styles.gasOptionText,
                    { color: gasOption === 'high' ? theme.colors.primary : theme.colors.text }
                  ]}>
                    {t('send.fast')}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.feeInfo}>
                <Text style={[styles.feeText, { color: theme.colors.text }]}>
                  {estimatedFee} {currentNetwork?.nativeCurrency.symbol || ''}
                </Text>
                <Text style={[styles.fiatValue, { color: theme.colors.secondaryText }]}>
                  ≈ {feeInFiat}
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.customGasLabel, { color: theme.colors.text }]}>
                {t('send.gasPrice')}
              </Text>
              <Input
                value={gasPrice}
                onChangeText={setGasPrice}
                placeholder="Gas Price (Gwei)"
                keyboardType="numeric"
              />
              
              <Text style={[styles.customGasLabel, { color: theme.colors.text }]}>
                {t('send.gasLimit')}
              </Text>
              <Input
                value={gasLimit}
                onChangeText={setGasLimit}
                placeholder="Gas Limit"
                keyboardType="numeric"
              />
            </>
          )}
        </Card>

        {/* 전송 버튼 */}
        <Button
          title={isSubmitting ? '' : t('send.sendButton')}
          onPress={handleSend}
          disabled={
            isSubmitting ||
            !recipient ||
            !amount ||
            !isAddressValid ||
            !isAmountValid
          }
          style={styles.sendButton}
        >
          {isSubmitting && <ActivityIndicator color={theme.colors.buttonText} />}
        </Button>
      </ScrollView>

      {/* 자산 선택기 모달 (실제 구현에서는 Modal 컴포넌트로 대체) */}
      {showAssetSelector && (
        <View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {t('send.selectAsset')}
          </Text>
          <ScrollView style={styles.modalScrollView}>
            {assets.map((asset) => (
              <TouchableOpacity
                key={asset.id}
                style={[
                  styles.assetItem,
                  selectedAsset?.id === asset.id && styles.selectedAssetItem,
                  { backgroundColor: theme.colors.card }
                ]}
                onPress={() => handleAssetChange(asset)}
              >
                <View style={styles.assetInfo}>
                  <Text style={[styles.assetSymbol, { color: theme.colors.text }]}>
                    {asset.symbol}
                  </Text>
                  <Text style={[styles.assetBalance, { color: theme.colors.secondaryText }]}>
                    {formatAmount(asset.balance, asset.decimals)}
                  </Text>
                </View>
                {selectedAsset?.id === asset.id && (
                  <Icon name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button
            title={t('common.cancel')}
            onPress={() => setShowAssetSelector(false)}
            variant="secondary"
          />
        </View>
      )}

      {/* 네트워크 선택기 모달 (실제 구현에서는 Modal 컴포넌트로 대체) */}
      {showNetworkSelector && (
        <View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {t('send.selectNetwork')}
          </Text>
          <ScrollView style={styles.modalScrollView}>
            {availableNetworks.map((network) => (
              <TouchableOpacity
                key={network.id}
                style={[
                  styles.networkItem,
                  currentNetwork.id === network.id && styles.selectedNetworkItem,
                  { backgroundColor: theme.colors.card }
                ]}
                onPress={() => handleNetworkChange(network)}
              >
                <View style={styles.networkInfo}>
                  {network.icon && (
                    <Icon name={network.icon} size={20} color={theme.colors.text} />
                  )}
                  <Text style={[styles.networkName, { color: theme.colors.text }]}>
                    {network.name}
                  </Text>
                </View>
                {currentNetwork.id === network.id && (
                  <Icon name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button
            title={t('common.cancel')}
            onPress={() => setShowNetworkSelector(false)}
            variant="secondary"
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 12,
  },
  selectorContent: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  balanceText: {
    fontSize: 12,
    marginTop: 4,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  maxButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  fiatValue: {
    fontSize: 14,
    marginTop: 8,
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  gasOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  gasOption: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedGasOption: {
    borderWidth: 1,
  },
  gasOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  feeInfo: {
    marginTop: 12,
  },
  feeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  customGasLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
  },
  sendButton: {
    marginTop: 16,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'center',
    elevation: 5,
    zIndex: 1000,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 300,
    marginBottom: 16,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedAssetItem: {
    borderWidth: 1,
  },
  assetInfo: {
    flexDirection: 'column',
  },
  assetSymbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  assetBalance: {
    fontSize: 14,
    marginTop: 4,
  },
  networkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedNetworkItem: {
    borderWidth: 1,
  },
  networkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkName: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  scanButton: {
    padding: 8,
  },
});

export default Send;
