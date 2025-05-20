import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Clipboard from '@react-native-clipboard/clipboard';

// 컴포넌트
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

// 훅
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { useTheme } from '../../hooks/useTheme';

// 서비스
import { TransactionService } from '../../services/transaction/transaction-service';

// 유틸리티
import { formatAmount, formatFiatValue, formatDate } from '../../utils/formatters';
import { truncateAddress } from '../../utils/address';
import { showToast } from '../../utils/toast';

// 타입
import { Transaction, TransactionStatus } from '../../types/transaction';

type TransactionDetailsParams = {
  TransactionDetails: {
    txHash: string;
  };
};

const TransactionDetails: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<TransactionDetailsParams, 'TransactionDetails'>>();
  const insets = useSafeAreaInsets();
  const txHash = route.params?.txHash;
  
  // 훅 사용
  const { activeWallet, activeAccount } = useWallet();
  const { currentNetwork, getNetworkById } = useNetwork();
  
  // 트랜잭션 서비스 초기화
  const transactionService = new TransactionService();

  // 상태 관리
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  // 트랜잭션 데이터 가져오기
  const fetchTransactionDetails = useCallback(async () => {
    if (!txHash) {
      setError(t('transactionDetails.invalidHash'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await transactionService.getTransactionDetails(txHash);
      setTransaction(result);
      setIsPending(result.status === TransactionStatus.PENDING);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      setError(typeof error === 'string' ? error : (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [txHash, transactionService, t]);

  // 컴포넌트 마운트 시 트랜잭션 데이터 가져오기
  useEffect(() => {
    fetchTransactionDetails();
  }, [fetchTransactionDetails]);

  // 대기 중인 트랜잭션 폴링 업데이트
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isPending) {
      intervalId = setInterval(() => {
        fetchTransactionDetails();
      }, 10000); // 10초마다 업데이트
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPending, fetchTransactionDetails]);

  // 클립보드에 복사
  const copyToClipboard = (text: string, message: string) => {
    Clipboard.setString(text);
    showToast(message, 'success');
  };

  // 블록 익스플로러에서 보기
  const viewInExplorer = () => {
    if (!transaction || !transaction.network) return;
    
    const network = getNetworkById(transaction.network);
    if (!network || !network.explorerUrl) {
      showToast(t('transactionDetails.noExplorer'), 'error');
      return;
    }
    
    const url = `${network.explorerUrl}/tx/${transaction.hash}`;
    Linking.openURL(url).catch((err) => {
      console.error('Error opening explorer:', err);
      showToast(t('common.errorOpeningLink'), 'error');
    });
  };

  // 트랜잭션 공유
  const shareTransaction = () => {
    if (!transaction || !transaction.network) return;
    
    const network = getNetworkById(transaction.network);
    if (!network || !network.explorerUrl) {
      showToast(t('transactionDetails.noExplorer'), 'error');
      return;
    }
    
    const url = `${network.explorerUrl}/tx/${transaction.hash}`;
    const message = t('transactionDetails.shareMessage', {
      amount: formatAmount(transaction.value, transaction.asset.decimals),
      symbol: transaction.asset.symbol,
      network: network.name,
    });
    
    Share.share({
      message: `${message}\n${url}`,
      url: Platform.OS === 'ios' ? url : undefined,
    }).catch((error) => {
      console.error('Error sharing transaction:', error);
      showToast(t('common.errorSharing'), 'error');
    });
  };

  // 트랜잭션 가속
  const speedUpTransaction = () => {
    if (!transaction) return;
    
    Alert.alert(
      t('transactionDetails.speedUpTitle'),
      t('transactionDetails.speedUpMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('transactionDetails.speedUpConfirm'),
          style: 'default',
          onPress: async () => {
            try {
              await transactionService.speedUpTransaction(transaction.hash);
              showToast(t('transactionDetails.speedUpSuccess'), 'success');
              fetchTransactionDetails();
            } catch (error) {
              console.error('Error speeding up transaction:', error);
              showToast(
                typeof error === 'string' ? error : (error as Error).message,
                'error'
              );
            }
          },
        },
      ]
    );
  };

  // 트랜잭션 취소
  const cancelTransaction = () => {
    if (!transaction) return;
    
    Alert.alert(
      t('transactionDetails.cancelTitle'),
      t('transactionDetails.cancelMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('transactionDetails.cancelConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await transactionService.cancelTransaction(transaction.hash);
              showToast(t('transactionDetails.cancelSuccess'), 'success');
              fetchTransactionDetails();
            } catch (error) {
              console.error('Error canceling transaction:', error);
              showToast(
                typeof error === 'string' ? error : (error as Error).message,
                'error'
              );
            }
          },
        },
      ]
    );
  };

  // 트랜잭션 상태 아이콘 및 색상 결정
  const getStatusIconAndColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.CONFIRMED:
        return { icon: 'checkmark-circle', color: theme.colors.success };
      case TransactionStatus.PENDING:
        return { icon: 'time', color: theme.colors.warning };
      case TransactionStatus.FAILED:
        return { icon: 'close-circle', color: theme.colors.error };
      case TransactionStatus.CANCELED:
        return { icon: 'ban', color: theme.colors.error };
      default:
        return { icon: 'help-circle', color: theme.colors.secondaryText };
    }
  };

  // 트랜잭션 유형에 따른 아이콘 결정
  const getTypeIcon = (tx: Transaction) => {
    const isSelf = tx.from === tx.to && tx.from === activeAccount?.address;
    
    if (isSelf) {
      return 'sync';
    }
    
    const isSent = tx.from === activeAccount?.address;
    
    switch (tx.type) {
      case 'sent':
        return 'arrow-up';
      case 'received':
        return 'arrow-down';
      case 'swap':
        return 'swap-horizontal';
      case 'stake':
        return 'lock-closed';
      case 'unstake':
        return 'lock-open';
      case 'reward':
        return 'gift';
      default:
        return isSent ? 'arrow-up' : 'arrow-down';
    }
  };

  // 로딩 화면 렌더링
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header
          title={t('transactionDetails.title')}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {t('transactionDetails.loading')}
          </Text>
        </View>
      </View>
    );
  }

  // 에러 화면 렌더링
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header
          title={t('transactionDetails.title')}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            {error}
          </Text>
          <Button
            title={t('common.tryAgain')}
            onPress={fetchTransactionDetails}
            style={styles.retryButton}
          />
        </View>
      </View>
    );
  }

  // 트랜잭션이 없는 경우
  if (!transaction) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header
          title={t('transactionDetails.title')}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Icon name="document-text-outline" size={48} color={theme.colors.secondaryText} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            {t('transactionDetails.notFound')}
          </Text>
          <Button
            title={t('transactionDetails.goBack')}
            onPress={() => navigation.goBack()}
            style={styles.retryButton}
          />
        </View>
      </View>
    );
  }

  const { icon: statusIcon, color: statusColor } = getStatusIconAndColor(transaction.status);
  const typeIcon = getTypeIcon(transaction);
  const network = getNetworkById(transaction.network);
  const isMyAddress = (address: string) => address === activeAccount?.address;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={t('transactionDetails.title')}
        onBack={() => navigation.goBack()}
        rightIcon={
          <TouchableOpacity onPress={shareTransaction} style={styles.shareButton}>
            <Icon name="share-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* 트랜잭션 상태 헤더 */}
        <Card style={[styles.statusCard, { borderColor: statusColor }]}>
          <View style={styles.statusHeader}>
            <Icon name={statusIcon as string} size={30} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {t(`transactionDetails.status.${transaction.status.toLowerCase()}`)}
            </Text>
          </View>
          
          <View style={styles.transactionAmount}>
            <Icon name={typeIcon as string} size={24} color={theme.colors.text} style={styles.typeIcon} />
            <Text style={[styles.amountText, { color: theme.colors.text }]}>
              {transaction.type === 'sent' ? '-' : '+'}{formatAmount(transaction.value, transaction.asset.decimals)} {transaction.asset.symbol}
            </Text>
          </View>
          
          {transaction.fiatValue && (
            <Text style={[styles.fiatValue, { color: theme.colors.secondaryText }]}>
              ≈ {formatFiatValue(transaction.fiatValue)}
            </Text>
          )}
          
          {transaction.status === TransactionStatus.PENDING && (
            <View style={styles.pendingActions}>
              <Button
                title={t('transactionDetails.speedUp')}
                onPress={speedUpTransaction}
                variant="secondary"
                style={styles.actionButton}
              />
              <Button
                title={t('transactionDetails.cancel')}
                onPress={cancelTransaction}
                variant="danger"
                style={styles.actionButton}
              />
            </View>
          )}
        </Card>

        {/* 트랜잭션 기본 정보 */}
        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
              {t('transactionDetails.type')}
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {t(`transactionDetails.types.${transaction.type.toLowerCase()}`)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
              {t('transactionDetails.date')}
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {formatDate(transaction.timestamp)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
              {t('transactionDetails.network')}
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {network?.name || transaction.network}
            </Text>
          </View>
          
          <View style={styles.addressRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
              {t('transactionDetails.from')}
            </Text>
            <View style={styles.addressContainer}>
              <Text style={[
                styles.detailValue, 
                { color: theme.colors.text },
                isMyAddress(transaction.from) && styles.myAddress,
                isMyAddress(transaction.from) && { color: theme.colors.primary }
              ]}>
                {isMyAddress(transaction.from) 
                  ? t('transactionDetails.myWallet') 
                  : truncateAddress(transaction.from)}
              </Text>
              <TouchableOpacity 
                onPress={() => copyToClipboard(transaction.from, t('common.addressCopied'))}
                style={styles.copyButton}
              >
                <Icon name="copy-outline" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.addressRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
              {t('transactionDetails.to')}
            </Text>
            <View style={styles.addressContainer}>
              <Text style={[
                styles.detailValue, 
                { color: theme.colors.text },
                isMyAddress(transaction.to) && styles.myAddress,
                isMyAddress(transaction.to) && { color: theme.colors.primary }
              ]}>
                {isMyAddress(transaction.to) 
                  ? t('transactionDetails.myWallet') 
                  : truncateAddress(transaction.to)}
              </Text>
              <TouchableOpacity 
                onPress={() => copyToClipboard(transaction.to, t('common.addressCopied'))}
                style={styles.copyButton}
              >
                <Icon name="copy-outline" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          
          {transaction.memo && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
                {t('transactionDetails.memo')}
              </Text>
              <Text style={[styles.detailValue, styles.memoText, { color: theme.colors.text }]}>
                {transaction.memo}
              </Text>
            </View>
          )}
        </Card>

        {/* 트랜잭션 수수료 정보 */}
        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
              {t('transactionDetails.fee')}
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {formatAmount(transaction.fee, network?.nativeCurrency.decimals || 18)} {network?.nativeCurrency.symbol || 'ETH'}
            </Text>
          </View>
          
          {transaction.feeFiatValue && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
                {t('transactionDetails.feeFiat')}
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {formatFiatValue(transaction.feeFiatValue)}
              </Text>
            </View>
          )}
        </Card>

        {/* 고급 트랜잭션 세부 정보 */}
        <Card style={styles.detailsCard}>
          <TouchableOpacity 
            style={styles.advancedHeader}
            onPress={() => setShowAdvancedDetails(!showAdvancedDetails)}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('transactionDetails.advancedDetails')}
            </Text>
            <Icon 
              name={showAdvancedDetails ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
          
          {showAdvancedDetails && (
            <>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
                  {t('transactionDetails.hash')}
                </Text>
                <View style={styles.hashContainer}>
                  <Text style={[styles.detailValue, styles.hashText, { color: theme.colors.text }]}>
                    {truncateAddress(transaction.hash, 10, 10)}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => copyToClipboard(transaction.hash, t('transactionDetails.hashCopied'))}
                    style={styles.copyButton}
                  >
                    <Icon name="copy-outline" size={18} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {transaction.blockNumber && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
                    {t('transactionDetails.blockNumber')}
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {transaction.blockNumber}
                  </Text>
                </View>
              )}
              
              {transaction.nonce !== undefined && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
                    {t('transactionDetails.nonce')}
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {transaction.nonce}
                  </Text>
                </View>
              )}
              
              {transaction.gasUsed && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
                    {t('transactionDetails.gasUsed')}
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {transaction.gasUsed}
                  </Text>
                </View>
              )}
              
              {transaction.gasLimit && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
                    {t('transactionDetails.gasLimit')}
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {transaction.gasLimit}
                  </Text>
                </View>
              )}
              
              {transaction.gasPrice && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>
                    {t('transactionDetails.gasPrice')}
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {transaction.gasPrice} Gwei
                  </Text>
                </View>
              )}
            </>
          )}
        </Card>

        {/* 익스플로러 버튼 */}
        <Button
          title={t('transactionDetails.viewInExplorer')}
          onPress={viewInExplorer}
          variant="secondary"
          icon="open-outline"
          style={styles.explorerButton}
        />
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
    gap: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    minWidth: 120,
  },
  statusCard: {
    padding: 16,
    borderLeftWidth: 4,
    borderRadius: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  transactionAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    marginRight: 8,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  fiatValue: {
    fontSize: 16,
    marginTop: 4,
  },
  pendingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  detailsCard: {
    padding: 16,
    borderRadius: 12,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  addressRow: {
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  myAddress: {
    fontWeight: 'bold',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  memoText: {
    fontWeight: 'normal',
  },
  advancedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  hashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hashText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  explorerButton: {
    marginTop: 8,
  },
  shareButton: {
    padding: 8,
  },
});

export default TransactionDetails;
