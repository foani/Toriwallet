import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/useTheme';
import Card from '../common/Card';
import { WalletAccount } from '../../contexts/WalletContext';
import { Network } from '../../contexts/NetworkContext';

interface AccountCardProps {
  account: WalletAccount;
  network?: Network;
  balance?: string;
  balanceInFiat?: string;
  isActive?: boolean;
  onPress?: () => void;
  onCopy?: () => void;
  style?: ViewStyle;
}

/**
 * 계정 카드 컴포넌트
 * 
 * 지갑 계정 정보를 표시하는 카드 컴포넌트입니다.
 * 계정 이름, 주소, 잔액 등을 표시합니다.
 * 
 * @param account 표시할 계정 정보
 * @param network 계정의 네트워크 정보
 * @param balance 계정 잔액 (코인/토큰 단위)
 * @param balanceInFiat 계정 잔액 (법정화폐 단위)
 * @param isActive 활성 계정 여부
 * @param onPress 카드 클릭 이벤트 핸들러
 * @param onCopy 주소 복사 버튼 클릭 이벤트 핸들러
 * @param style 추가 스타일 (ViewStyle)
 */
const AccountCard: React.FC<AccountCardProps> = ({
  account,
  network,
  balance = '0',
  balanceInFiat = '$0.00',
  isActive = false,
  onPress,
  onCopy,
  style,
}) => {
  const { theme } = useTheme();
  
  // 주소 포맷팅 (앞 6자, 뒤 4자만 표시)
  const formatAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 블록체인 로고 선택
  const getNetworkLogo = () => {
    if (!network) return null;
    
    // 실제 구현에서는 각 네트워크에 맞는 로고 이미지 사용
    const logoMap: { [key: string]: any } = {
      'catena-mainnet': require('../../assets/images/catena-logo.png'),
      'ethereum-mainnet': require('../../assets/images/ethereum-logo.png'),
      // 다른 네트워크 로고도 추가
    };
    
    // 네트워크 ID에 따라 로고 반환 (없으면 기본 이미지)
    const logo = logoMap[network.id] || require('../../assets/images/default-chain-logo.png');
    return logo;
  };
  
  return (
    <Card
      style={[styles.card, style]}
      onPress={onPress}
      elevated={true}
      border={isActive}
    >
      <View style={styles.cardHeader}>
        <View style={styles.accountInfo}>
          <Text
            style={[
              styles.accountName,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.lg,
                fontFamily: theme.typography.fontFamily.bold,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {account.name}
          </Text>
          
          <View style={styles.addressContainer}>
            <Text
              style={[
                styles.address,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.sm,
                  fontFamily: theme.typography.fontFamily.regular,
                },
              ]}
            >
              {formatAddress(account.address)}
            </Text>
            
            {onCopy && (
              <TouchableOpacity
                onPress={onCopy}
                style={styles.copyButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="copy-outline" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {isActive && (
          <View
            style={[
              styles.activeIndicator,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text
              style={[
                styles.activeText,
                {
                  color: theme.colors.white,
                  fontSize: theme.typography.fontSize.xs,
                  fontFamily: theme.typography.fontFamily.medium,
                },
              ]}
            >
              활성
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.balanceContainer}>
          <Text
            style={[
              styles.balance,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.xl,
                fontFamily: theme.typography.fontFamily.bold,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {balance} {network?.currencySymbol || 'CTA'}
          </Text>
          
          <Text
            style={[
              styles.balanceInFiat,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.md,
                fontFamily: theme.typography.fontFamily.regular,
              },
            ]}
          >
            {balanceInFiat}
          </Text>
        </View>
        
        {network && (
          <View style={styles.networkContainer}>
            {getNetworkLogo() && (
              <Image
                source={getNetworkLogo()}
                style={styles.networkLogo}
                resizeMode="contain"
              />
            )}
            <Text
              style={[
                styles.networkName,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.sm,
                  fontFamily: theme.typography.fontFamily.medium,
                },
              ]}
            >
              {network.name}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    marginRight: 4,
  },
  copyButton: {
    padding: 2,
  },
  activeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  activeText: {
    textAlign: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceContainer: {
    flex: 1,
  },
  balance: {
    marginBottom: 2,
  },
  balanceInFiat: {
    marginBottom: 2,
  },
  networkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  networkLogo: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  networkName: {
    marginLeft: 4,
  },
});

export default AccountCard;
