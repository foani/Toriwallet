import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SettingsStackParamList } from '../../navigation/MainNavigator';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../hooks/useNotifications';
import Header from '../../components/common/Header';
import Loading from '../../components/common/Loading';

type NotificationSettingsScreenNavigationProp = StackNavigationProp<
  SettingsStackParamList,
  'NotificationSettings'
>;

type NotificationSettingsScreenRouteProp = RouteProp<
  SettingsStackParamList,
  'NotificationSettings'
>;

interface NotificationSettingsProps {
  navigation: NotificationSettingsScreenNavigationProp;
  route: NotificationSettingsScreenRouteProp;
}

/**
 * 알림 설정 화면
 * 
 * 사용자가 알림 설정을 관리할 수 있는 화면입니다.
 * 알림 활성화/비활성화, 알림 유형별 설정, 알림 소리 및 진동 설정 등을 제공합니다.
 */
const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const {
    settings,
    updateSettings,
    isLoading,
    clearAllNotifications,
  } = useNotifications();
  
  const [updatingSettings, setUpdatingSettings] = useState<boolean>(false);
  
  // 알림 설정 토글 처리
  const handleToggleSetting = async (
    settingKey: keyof typeof settings,
    value: boolean
  ) => {
    try {
      setUpdatingSettings(true);
      
      // 푸시 알림 설정 처리
      if (settingKey === 'pushEnabled' && value) {
        const updated = await updateSettings({ [settingKey]: value });
        
        // 푸시 알림 권한이 거부된 경우
        if (!updated) {
          Alert.alert(
            '알림 권한 필요',
            '푸시 알림을 활성화하려면 기기 설정에서 TORI 지갑 앱에 알림 권한을 허용해야 합니다.',
            [{ text: '확인' }]
          );
          return;
        }
      } else {
        // 그 외 설정 업데이트
        await updateSettings({ [settingKey]: value });
      }
    } catch (error) {
      console.error('Failed to update notification setting:', error);
      Alert.alert(
        '오류',
        '알림 설정을 업데이트하는 중 오류가 발생했습니다. 다시 시도해주세요.'
      );
    } finally {
      setUpdatingSettings(false);
    }
  };
  
  // 모든 알림 삭제 처리
  const handleClearAllNotifications = () => {
    Alert.alert(
      '모든 알림 삭제',
      '모든 알림 내역을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllNotifications();
              Alert.alert('완료', '모든 알림이 삭제되었습니다.');
            } catch (error) {
              console.error('Failed to clear all notifications:', error);
              Alert.alert(
                '오류',
                '알림을 삭제하는 중 오류가 발생했습니다. 다시 시도해주세요.'
              );
            }
          },
        },
      ]
    );
  };
  
  // 설정 그룹 렌더링
  const renderSettingGroup = (
    title: string,
    description?: string,
    icon?: string
  ) => (
    <View
      style={[
        styles.settingGroup,
        {
          marginTop: theme.spacing.lg,
          marginBottom: theme.spacing.sm,
        },
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={18}
          color={theme.colors.primary}
          style={{ marginRight: theme.spacing.xs }}
        />
      )}
      
      <Text
        style={[
          styles.settingGroupTitle,
          {
            color: theme.colors.primary,
            fontSize: theme.typography.fontSize.md,
            fontFamily: theme.typography.fontFamily.bold,
          },
        ]}
      >
        {title}
      </Text>
      
      {description && (
        <Text
          style={[
            styles.settingGroupDescription,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.sm,
              fontFamily: theme.typography.fontFamily.regular,
              marginTop: theme.spacing.xs,
            },
          ]}
        >
          {description}
        </Text>
      )}
    </View>
  );
  
  // 설정 항목 렌더링
  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    disabled: boolean = false
  ) => (
    <View
      style={[
        styles.settingItem,
        {
          paddingVertical: theme.spacing.md,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.border,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <View style={styles.settingItemTextContainer}>
        <Text
          style={[
            styles.settingItemTitle,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.md,
              fontFamily: theme.typography.fontFamily.medium,
              marginBottom: theme.spacing.xs,
            },
          ]}
        >
          {title}
        </Text>
        
        <Text
          style={[
            styles.settingItemDescription,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.sm,
              fontFamily: theme.typography.fontFamily.regular,
            },
          ]}
        >
          {description}
        </Text>
      </View>
      
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || updatingSettings}
        trackColor={{
          false: theme.colors.gray300,
          true: theme.colors.primary + '80',
        }}
        thumbColor={value ? theme.colors.primary : theme.colors.gray400}
      />
    </View>
  );
  
  // 로딩 중 처리
  if (isLoading) {
    return <Loading loading message="설정 로드 중..." />;
  }
  
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Header
        title="알림 설정"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { padding: theme.spacing.md },
        ]}
      >
        {/* 알림 활성화 설정 */}
        {renderSettingGroup('알림 설정', '알림 표시 및 푸시 알림 설정을 관리합니다', 'notifications-outline')}
        
        {renderSettingItem(
          '알림 활성화',
          '앱 내 알림 및 푸시 알림을 활성화합니다',
          settings.enabled,
          (value) => handleToggleSetting('enabled', value)
        )}
        
        {renderSettingItem(
          '푸시 알림',
          '앱을 사용하지 않을 때도 알림을 받습니다',
          settings.pushEnabled,
          (value) => handleToggleSetting('pushEnabled', value),
          !settings.enabled
        )}
        
        {/* 알림 유형 설정 */}
        {renderSettingGroup('알림 유형', '어떤 유형의 알림을 받을지 설정합니다')}
        
        {renderSettingItem(
          '거래 알림',
          '거래가 발생하거나 확인될 때 알림을 받습니다',
          settings.transactionAlerts,
          (value) => handleToggleSetting('transactionAlerts', value),
          !settings.enabled
        )}
        
        {renderSettingItem(
          '스테이킹 알림',
          '스테이킹 보상이 발생할 때 알림을 받습니다',
          settings.stakingAlerts,
          (value) => handleToggleSetting('stakingAlerts', value),
          !settings.enabled
        )}
        
        {renderSettingItem(
          '가격 알림',
          '가격 변동 및 설정한 가격 알림을 받습니다',
          settings.priceAlerts,
          (value) => handleToggleSetting('priceAlerts', value),
          !settings.enabled
        )}
        
        {renderSettingItem(
          '보안 알림',
          '중요한 보안 이벤트에 대한 알림을 받습니다',
          settings.securityAlerts,
          (value) => handleToggleSetting('securityAlerts', value),
          !settings.enabled
        )}
        
        {renderSettingItem(
          '뉴스 알림',
          'CreataChain 생태계 관련 뉴스 알림을 받습니다',
          settings.newsAlerts,
          (value) => handleToggleSetting('newsAlerts', value),
          !settings.enabled
        )}
        
        {renderSettingItem(
          '마케팅 알림',
          '프로모션 및 마케팅 알림을 받습니다',
          settings.marketingAlerts,
          (value) => handleToggleSetting('marketingAlerts', value),
          !settings.enabled
        )}
        
        {/* 알림 효과 설정 */}
        {renderSettingGroup('알림 효과', '알림 소리 및 진동 설정을 관리합니다')}
        
        {renderSettingItem(
          '알림 소리',
          '알림이 도착할 때 소리를 재생합니다',
          settings.soundEnabled,
          (value) => handleToggleSetting('soundEnabled', value),
          !settings.enabled || !settings.pushEnabled
        )}
        
        {renderSettingItem(
          '알림 진동',
          '알림이 도착할 때 진동을 울립니다',
          settings.vibrationEnabled,
          (value) => handleToggleSetting('vibrationEnabled', value),
          !settings.enabled || !settings.pushEnabled
        )}
        
        {/* 알림 관리 설정 */}
        {renderSettingGroup('알림 관리', '알림 내역을 관리합니다')}
        
        <View
          style={[
            styles.clearButtonContainer,
            {
              marginTop: theme.spacing.md,
              marginBottom: theme.spacing.lg,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.clearButton,
              {
                backgroundColor: theme.colors.error + '10',
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                borderRadius: theme.borderRadius.md,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
            onPress={handleClearAllNotifications}
          >
            <Icon
              name="trash-outline"
              size={20}
              color={theme.colors.error}
              style={{ marginRight: theme.spacing.sm }}
            />
            
            <Text
              style={[
                styles.clearButtonText,
                {
                  color: theme.colors.error,
                  fontSize: theme.typography.fontSize.md,
                  fontFamily: theme.typography.fontFamily.medium,
                },
              ]}
            >
              모든 알림 삭제
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 40,
  },
  settingGroup: {},
  settingGroupTitle: {},
  settingGroupDescription: {},
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingItemTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingItemTitle: {},
  settingItemDescription: {},
  clearButtonContainer: {
    alignItems: 'center',
  },
  clearButton: {},
  clearButtonText: {},
});

export default NotificationSettings;
