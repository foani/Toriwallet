import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { WalletStackParamList } from '../../navigation/MainNavigator';
import { useTheme } from '../../hooks/useTheme';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { useNotification } from '../../hooks/useNotifications';
import { Asset } from '../../components/wallet/AssetItem';
import AssetsList from '../../components/wallet/AssetsList';
import AccountCard from '../../components/wallet/AccountCard';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';

type DashboardScreenNavigationProp = StackNavigationProp<
  WalletStackParamList,
  'Dashboard'
>;

type DashboardScreenRouteProp = RouteProp<
  WalletStackParamList,
  'Dashboard'
>;

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
  route: DashboardScreenRouteProp;
}

/**
 * 지갑 대시보드 화면
 * 
 * 사용자의 지갑 계정, 자산 목록, 주요 기능 버튼 등을 표시하는 메인 화면입니다.
 */
const Dashboard: React.FC<DashboardScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { activeAccount, isUnlocked } = useWallet();
  const { activeNetwork } = useNetwork();
  const { showNotification } = useNotification();
  
  const [totalBalance, setTotalBalance] = useState<string>('0');
  const [totalBalanceInFiat, setTotalBalanceInFiat] = useState<string>('$0.00');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // 자산 데이터 로드
  const loadAssets = useCallback(async () => {
    try {
      // 실제 구현에서는 지갑 서비스를 통해 자산 데이터를 가져옴
      // 현재는 더미 데이터 사용
      
      // 로딩 표시 (실제 구현에서는 새로고침 상태에 따라 결정)
      if (!refreshing) {
        setLoading(true);
      }
      
      // 더미 데이터 생성
      setTimeout(() => {
        const dummyAssets: Asset[] = [
          {
            id: '1',
            name: activeNetwork?.name === 'Catena Chain Mainnet' ? 'Catena' : 'Ethereum',
            symbol: activeNetwork?.currencySymbol || 'CTA',
            balance: '1.2345',
            balanceInFiat: '$1,234.50',
            price: '$1,000.00',
            priceChangePercentage24h: 2.5,
            logoUrl: '',
            tokenType: 'native',
            decimals: 18,
          },
          {
            id: '2',
            name: 'TORI Token',
            symbol: 'TORI',
            balance: '1000.00',
            balanceInFiat: '$100.00',
            price: '$0.10',
            priceChangePercentage24h: -1.2,
            logoUrl: '',
            tokenType: 'token',
            contractAddress: '0x123...',
            decimals: 18,
          },
          {
            id: '3',
            name: 'USDT',
            symbol: 'USDT',
            balance: '500.00',
            balanceInFiat: '$500.00',
            price: '$1.00',
            priceChangePercentage24h: 0.01,
            logoUrl: '',
            tokenType: 'token',
            contractAddress: '0x456...',
            decimals: 6,
          },
        ];
        
        // 총 잔액 계산
        const totalBalanceValue = dummyAssets.reduce(
          (sum, asset) => sum + parseFloat(asset.balanceInFiat.replace('$', '').replace(',', '')),
          0
        );
        
        setAssets(dummyAssets);
        setTotalBalance('1,734.5');
        setTotalBalanceInFiat(`$${totalBalanceValue.toFixed(2)}`);
        setLoading(false);
        setRefreshing(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to load assets:', error);
      setLoading(false);
      setRefreshing(false);
      
      // 오류 알림 표시
      showNotification(
        'error',
        '자산 로드 실패',
        '자산 정보를 가져오는 중 오류가 발생했습니다.'
      );
    }
  }, [activeNetwork, refreshing, showNotification]);
  
  // 화면이 포커스될 때마다 자산 데이터 로드
  useFocusEffect(
    useCallback(() => {
      if (isUnlocked && activeAccount) {
        loadAssets();
      }
    }, [isUnlocked, activeAccount, loadAssets])
  );
  
  // 새로고침 처리
  const handleRefresh = () => {
    setRefreshing(true);
    loadAssets();
  };
  
  // 계정 선택 처리
  const handleAccountPress = () => {
    // 실제 구현에서는 계정 선택 화면으로 이동
    // navigation.navigate('AccountSelect');
    // 개발 중이므로 콘솔 출력으로 대체
    console.log('Navigate to AccountSelect');
  };
  
  // 자산 항목 클릭 처리
  const handleAssetPress = (asset: Asset) => {
    // 실제 구현에서는 자산 상세 화면으로 이동
    // navigation.navigate('AssetDetails', { assetId: asset.id });
    // 개발 중이므로 콘솔 출력으로 대체
    console.log('Navigate to AssetDetails:', asset.id);
  };
  
  // 전송 버튼 클릭 처리
  const handleSendPress = () => {
    navigation.navigate('Send');
  };
  
  // 수신 버튼 클릭 처리
  const handleReceivePress = () => {
    navigation.navigate('Receive');
  };
  
  // 스왑 버튼 클릭 처리
  const handleSwapPress = () => {
    // 실제 구현에서는 스왑 화면으로 이동
    // navigation.navigate('Swap');
    // 개발 중이므로 콘솔 출력으로 대체
    console.log('Navigate to Swap');
  };
  
  // 히스토리 버튼 클릭 처리
  const handleHistoryPress = () => {
    navigation.navigate('TransactionHistory');
  };
  
  // 지갑이 잠겨 있거나 활성 계정이 없는 경우 로딩 표시
  if (!isUnlocked || !activeAccount) {
    return <Loading loading message="지갑 로드 중..." />;
  }
  
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <StatusBar
        barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      
      <View
        style={[
          styles.header,
          {
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.md,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.accountButton}
          onPress={handleAccountPress}
        >
          <View
            style={[
              styles.accountIconContainer,
              {
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.colors.primary + '20',
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            <Icon
              name="person-outline"
              size={24}
              color={theme.colors.primary}
            />
          </View>
          
          <View style={styles.accountInfo}>
            <Text
              style={[
                styles.accountName,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.md,
                  fontFamily: theme.typography.fontFamily.bold,
                },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {activeAccount.name}
            </Text>
            
            <Text
              style={[
                styles.networkName,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.sm,
                  fontFamily: theme.typography.fontFamily.regular,
                },
              ]}
            >
              {activeNetwork?.name || 'Catena Chain'}
            </Text>
          </View>
          
          <Icon
            name="chevron-down-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('QRCodeScan', { mode: 'any' })}
        >
          <Icon name="scan-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View
          style={[
            styles.balanceSection,
            {
              padding: theme.spacing.lg,
              alignItems: 'center',
            },
          ]}
        >
          <Text
            style={[
              styles.balanceLabel,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.md,
                fontFamily: theme.typography.fontFamily.regular,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            총 자산 가치
          </Text>
          
          <Text
            style={[
              styles.totalBalance,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.xxxl,
                fontFamily: theme.typography.fontFamily.bold,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            {totalBalanceInFiat}
          </Text>
          
          <Text
            style={[
              styles.cryptoBalance,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.md,
                fontFamily: theme.typography.fontFamily.medium,
                marginBottom: theme.spacing.lg,
              },
            ]}
          >
            {totalBalance} CTA
          </Text>
          
          <View
            style={[
              styles.actionButtons,
              {
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                maxWidth: 320,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30%',
                },
              ]}
              onPress={handleSendPress}
            >
              <Icon
                name="arrow-up-outline"
                size={24}
                color={theme.colors.white}
                style={{ marginBottom: theme.spacing.xs }}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: theme.colors.white,
                    fontSize: theme.typography.fontSize.sm,
                    fontFamily: theme.typography.fontFamily.medium,
                  },
                ]}
              >
                보내기
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30%',
                },
              ]}
              onPress={handleReceivePress}
            >
              <Icon
                name="arrow-down-outline"
                size={24}
                color={theme.colors.white}
                style={{ marginBottom: theme.spacing.xs }}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: theme.colors.white,
                    fontSize: theme.typography.fontSize.sm,
                    fontFamily: theme.typography.fontFamily.medium,
                  },
                ]}
              >
                받기
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30%',
                },
              ]}
              onPress={handleSwapPress}
            >
              <Icon
                name="swap-horizontal-outline"
                size={24}
                color={theme.colors.white}
                style={{ marginBottom: theme.spacing.xs }}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  {
                    color: theme.colors.white,
                    fontSize: theme.typography.fontSize.sm,
                    fontFamily: theme.typography.fontFamily.medium,
                  },
                ]}
              >
                스왑
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View
          style={[
            styles.assetsSection,
            {
              padding: theme.spacing.md,
            },
          ]}
        >
          <View
            style={[
              styles.assetsSectionHeader,
              {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing.md,
              },
            ]}
          >
            <Text
              style={[
                styles.assetsSectionTitle,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.lg,
                  fontFamily: theme.typography.fontFamily.bold,
                },
              ]}
            >
              자산
            </Text>
            
            <TouchableOpacity
              style={styles.historyButton}
              onPress={handleHistoryPress}
            >
              <Text
                style={[
                  styles.historyButtonText,
                  {
                    color: theme.colors.primary,
                    fontSize: theme.typography.fontSize.sm,
                    fontFamily: theme.typography.fontFamily.medium,
                  },
                ]}
              >
                거래 내역
              </Text>
              <Icon
                name="chevron-forward-outline"
                size={16}
                color={theme.colors.primary}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
          
          <AssetsList
            assets={assets}
            loading={loading}
            onAssetPress={handleAssetPress}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            emptyMessage="자산이 없습니다"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIconContainer: {},
  accountInfo: {
    marginLeft: 12,
    marginRight: 8,
    flex: 1,
  },
  accountName: {},
  networkName: {},
  scanButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  balanceSection: {},
  balanceLabel: {},
  totalBalance: {},
  cryptoBalance: {},
  actionButtons: {},
  actionButton: {},
  actionButtonText: {},
  assetsSection: {
    flex: 1,
  },
  assetsSectionHeader: {},
  assetsSectionTitle: {},
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyButtonText: {},
});

export default Dashboard;
