import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  balanceInFiat: string;
  price: string;
  priceChangePercentage24h?: number;
  logoUrl?: string;
  chainId?: string;
  contractAddress?: string;
  tokenType?: 'native' | 'token' | 'nft';
  decimals?: number;
}

interface AssetItemProps {
  asset: Asset;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * 자산 항목 컴포넌트
 * 
 * 지갑 내 자산 목록 항목을 표시하는 컴포넌트입니다.
 * 암호화폐, 토큰 등의 자산 정보를 표시합니다.
 * 
 * @param asset 표시할 자산 정보
 * @param onPress 항목 클릭 이벤트 핸들러
 * @param style 추가 스타일 (ViewStyle)
 */
const AssetItem: React.FC<AssetItemProps> = ({
  asset,
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  
  // 가격 변동률에 따른 색상 결정
  const getPriceChangeColor = () => {
    if (!asset.priceChangePercentage24h) return theme.colors.textSecondary;
    
    return asset.priceChangePercentage24h >= 0
      ? theme.colors.positive
      : theme.colors.negative;
  };
  
  // 가격 변동률 포맷팅
  const formatPriceChange = () => {
    if (!asset.priceChangePercentage24h) return '0.00%';
    
    const sign = asset.priceChangePercentage24h >= 0 ? '+' : '';
    return `${sign}${asset.priceChangePercentage24h.toFixed(2)}%`;
  };
  
  // 로고 URL이 없는 경우 기본 이미지 사용
  const getLogoSource = () => {
    if (asset.logoUrl) {
      return { uri: asset.logoUrl };
    }
    
    // 심볼에 따른 기본 로고 설정 (실제 구현에서는 더 많은 로고 추가)
    const logoMap: { [key: string]: any } = {
      'CTA': require('../../assets/images/catena-logo.png'),
      'ETH': require('../../assets/images/ethereum-logo.png'),
      'BTC': require('../../assets/images/bitcoin-logo.png'),
      // 다른 토큰 로고도 추가
    };
    
    return logoMap[asset.symbol] || require('../../assets/images/default-token-logo.png');
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.sm,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <Image
          source={getLogoSource()}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <View style={styles.nameContainer}>
          <Text
            style={[
              styles.name,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.md,
                fontFamily: theme.typography.fontFamily.medium,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {asset.name}
          </Text>
          
          <Text
            style={[
              styles.symbol,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.sm,
                fontFamily: theme.typography.fontFamily.regular,
              },
            ]}
          >
            {asset.symbol}
          </Text>
        </View>
      </View>
      
      <View style={styles.rightContent}>
        <Text
          style={[
            styles.balance,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.md,
              fontFamily: theme.typography.fontFamily.bold,
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {asset.balance} {asset.symbol}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text
            style={[
              styles.balanceInFiat,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.sm,
                fontFamily: theme.typography.fontFamily.regular,
              },
            ]}
            numberOfLines={1}
          >
            {asset.balanceInFiat}
          </Text>
          
          {asset.priceChangePercentage24h !== undefined && (
            <Text
              style={[
                styles.priceChange,
                {
                  color: getPriceChangeColor(),
                  fontSize: theme.typography.fontSize.sm,
                  fontFamily: theme.typography.fontFamily.medium,
                  marginLeft: theme.spacing.sm,
                },
              ]}
            >
              {formatPriceChange()}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  name: {
    marginBottom: 2,
  },
  symbol: {},
  rightContent: {
    alignItems: 'flex-end',
  },
  balance: {
    marginBottom: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceInFiat: {},
  priceChange: {},
});

export default AssetItem;
