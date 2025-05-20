import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/useTheme';
import { format } from 'date-fns';

export type TransactionType = 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'contract' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  hash: string;
  from: string;
  to: string;
  amount: string;
  asset: {
    symbol: string;
    name?: string;
    logoUrl?: string;
  };
  fee?: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations?: number;
  networkId: string;
  contractAddress?: string;
  data?: string;
  note?: string;
}

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * 트랜잭션 항목 컴포넌트
 * 
 * 트랜잭션 목록 항목을 표시하는 컴포넌트입니다.
 * 트랜잭션 유형, 금액, 날짜 등의 정보를 표시합니다.
 * 
 * @param transaction 표시할 트랜잭션 정보
 * @param onPress 항목 클릭 이벤트 핸들러
 * @param style 추가 스타일 (ViewStyle)
 */
const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  
  // 트랜잭션 유형별 아이콘 및 색상 결정
  const getTransactionIcon = () => {
    const iconSize = 20;
    
    switch (transaction.type) {
      case 'send':
        return (
          <Icon
            name="arrow-up-outline"
            size={iconSize}
            color={theme.colors.negative}
          />
        );
      case 'receive':
        return (
          <Icon
            name="arrow-down-outline"
            size={iconSize}
            color={theme.colors.positive}
          />
        );
      case 'swap':
        return (
          <Icon
            name="swap-horizontal-outline"
            size={iconSize}
            color={theme.colors.info}
          />
        );
      case 'stake':
        return (
          <Icon
            name="lock-closed-outline"
            size={iconSize}
            color={theme.colors.primary}
          />
        );
      case 'unstake':
        return (
          <Icon
            name="lock-open-outline"
            size={iconSize}
            color={theme.colors.secondary}
          />
        );
      case 'contract':
        return (
          <Icon
            name="document-text-outline"
            size={iconSize}
            color={theme.colors.textSecondary}
          />
        );
      case 'failed':
        return (
          <Icon
            name="close-circle-outline"
            size={iconSize}
            color={theme.colors.error}
          />
        );
      default:
        return (
          <Icon
            name="ellipsis-horizontal-circle-outline"
            size={iconSize}
            color={theme.colors.textSecondary}
          />
        );
    }
  };
  
  // 트랜잭션 유형에 따른 텍스트 결정
  const getTransactionTypeText = () => {
    switch (transaction.type) {
      case 'send':
        return '보냄';
      case 'receive':
        return '받음';
      case 'swap':
        return '스왑';
      case 'stake':
        return '스테이킹';
      case 'unstake':
        return '언스테이킹';
      case 'contract':
        return '컨트랙트';
      case 'failed':
        return '실패';
      default:
        return '트랜잭션';
    }
  };
  
  // 금액 앞에 플러스/마이너스 기호 표시
  const getAmountPrefix = () => {
    switch (transaction.type) {
      case 'send':
      case 'failed':
        return '-';
      case 'receive':
        return '+';
      default:
        return '';
    }
  };
  
  // 금액 텍스트 색상 결정
  const getAmountColor = () => {
    switch (transaction.type) {
      case 'send':
      case 'failed':
        return theme.colors.negative;
      case 'receive':
        return theme.colors.positive;
      default:
        return theme.colors.text;
    }
  };
  
  // 날짜 포맷팅
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return format(date, 'yyyy.MM.dd HH:mm');
  };
  
  // 상태에 따른 스타일 결정
  const getStatusIndicator = () => {
    let color;
    let text;
    
    switch (transaction.status) {
      case 'pending':
        color = theme.colors.warning;
        text = '대기 중';
        break;
      case 'confirmed':
        color = theme.colors.success;
        text = '확인됨';
        break;
      case 'failed':
        color = theme.colors.error;
        text = '실패';
        break;
      default:
        color = theme.colors.textSecondary;
        text = transaction.status;
    }
    
    return (
      <View
        style={[
          styles.statusIndicator,
          {
            backgroundColor: color + '30', // 색상에 투명도 추가
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 4,
          },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            {
              color: color,
              fontSize: theme.typography.fontSize.xs,
              fontFamily: theme.typography.fontFamily.medium,
            },
          ]}
        >
          {text}
        </Text>
      </View>
    );
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
        <View style={styles.iconContainer}>{getTransactionIcon()}</View>
        
        <View style={styles.infoContainer}>
          <View style={styles.typeAndStatusContainer}>
            <Text
              style={[
                styles.typeText,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.md,
                  fontFamily: theme.typography.fontFamily.medium,
                },
              ]}
            >
              {getTransactionTypeText()}
            </Text>
            
            {transaction.status !== 'confirmed' && getStatusIndicator()}
          </View>
          
          <Text
            style={[
              styles.dateText,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.sm,
                fontFamily: theme.typography.fontFamily.regular,
              },
            ]}
          >
            {formatDate(transaction.timestamp)}
          </Text>
        </View>
      </View>
      
      <View style={styles.rightContent}>
        <Text
          style={[
            styles.amountText,
            {
              color: getAmountColor(),
              fontSize: theme.typography.fontSize.md,
              fontFamily: theme.typography.fontFamily.bold,
            },
          ]}
        >
          {getAmountPrefix()} {transaction.amount} {transaction.asset.symbol}
        </Text>
        
        {transaction.note && (
          <Text
            style={[
              styles.noteText,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.sm,
                fontFamily: theme.typography.fontFamily.regular,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {transaction.note}
          </Text>
        )}
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    justifyContent: 'center',
  },
  typeAndStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeText: {
    marginRight: 8,
  },
  statusIndicator: {
    marginLeft: 4,
  },
  statusText: {
    textAlign: 'center',
  },
  dateText: {},
  rightContent: {
    alignItems: 'flex-end',
  },
  amountText: {
    marginBottom: 4,
  },
  noteText: {
    maxWidth: 150,
  },
});

export default TransactionItem;
