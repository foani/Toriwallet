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
import { NotificationType, PushNotificationData } from '../../services/NotificationService';

interface NotificationItemProps {
  notification: PushNotificationData;
  onPress?: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
}

/**
 * 알림 항목 컴포넌트
 * 
 * 알림 목록에서 개별 알림을 표시하는 컴포넌트입니다.
 * 
 * @param notification 표시할 알림 정보
 * @param onPress 알림 클릭 이벤트 핸들러
 * @param onDelete 알림 삭제 이벤트 핸들러
 * @param style 추가 스타일 (ViewStyle)
 */
const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onDelete,
  style,
}) => {
  const { theme } = useTheme();
  
  // 알림 유형별 아이콘 및 색상 결정
  const getNotificationIcon = () => {
    const iconSize = 24;
    
    switch (notification.type) {
      case NotificationType.TRANSACTION:
        return (
          <Icon
            name="swap-horizontal-outline"
            size={iconSize}
            color={theme.colors.primary}
          />
        );
      case NotificationType.PRICE_ALERT:
        return (
          <Icon
            name="trending-up-outline"
            size={iconSize}
            color={theme.colors.info}
          />
        );
      case NotificationType.STAKING_REWARD:
        return (
          <Icon
            name="gift-outline"
            size={iconSize}
            color={theme.colors.success}
          />
        );
      case NotificationType.SECURITY_ALERT:
        return (
          <Icon
            name="shield-outline"
            size={iconSize}
            color={theme.colors.warning}
          />
        );
      case NotificationType.NEWS:
        return (
          <Icon
            name="newspaper-outline"
            size={iconSize}
            color={theme.colors.info}
          />
        );
      case NotificationType.MARKETING:
        return (
          <Icon
            name="megaphone-outline"
            size={iconSize}
            color={theme.colors.secondary}
          />
        );
      default:
        return (
          <Icon
            name="notifications-outline"
            size={iconSize}
            color={theme.colors.primary}
          />
        );
    }
  };
  
  // 날짜 포맷팅
  const formatDate = (timestamp: number) => {
    const now = new Date();
    const date = new Date(timestamp);
    
    // 오늘인 경우 시간만 표시
    if (format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
      return format(date, 'HH:mm');
    }
    
    // 올해인 경우 월, 일 표시
    if (format(date, 'yyyy') === format(now, 'yyyy')) {
      return format(date, 'MM.dd HH:mm');
    }
    
    // 그 외의 경우 연, 월, 일 표시
    return format(date, 'yyyy.MM.dd HH:mm');
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {getNotificationIcon()}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.md,
                fontFamily: theme.typography.fontFamily.bold,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {notification.title}
          </Text>
          
          <Text
            style={[
              styles.time,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.xs,
                fontFamily: theme.typography.fontFamily.regular,
              },
            ]}
          >
            {formatDate(notification.timestamp)}
          </Text>
        </View>
        
        <Text
          style={[
            styles.body,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.sm,
              fontFamily: theme.typography.fontFamily.regular,
              marginTop: theme.spacing.xs,
            },
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {notification.body}
        </Text>
      </View>
      
      {onDelete && (
        <TouchableOpacity
          style={[
            styles.deleteButton,
            { padding: theme.spacing.xs },
          ]}
          onPress={onDelete}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Icon
            name="close-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(125, 68, 240, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  time: {},
  body: {},
  deleteButton: {
    marginLeft: 8,
  },
});

export default NotificationItem;
