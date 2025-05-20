import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DeviceInfo from 'react-native-device-info';

// 컴포넌트
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';

// 훅
import { useTheme } from '../../hooks/useTheme';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { useLanguage } from '../../hooks/useLanguage';
import { useBiometrics } from '../../hooks/useBiometrics';

// 유틸리티
import { showToast } from '../../utils/toast';

// 설정 항목 타입
type SettingItemProps = {
  title: string;
  description?: string;
  icon: string;
  iconType?: 'ionicon' | 'material';
  action: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  isLast?: boolean;
};

// 설정 항목 컴포넌트
const SettingItem: React.FC<SettingItemProps> = ({
  title,
  description,
  icon,
  iconType = 'ionicon',
  action,
  rightElement,
  destructive = false,
  isLast = false,
}) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.settingItem,
        !isLast && [styles.settingItemBorder, { borderBottomColor: theme.colors.border }]
      ]}
      onPress={action}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.cardAlt }]}>
          {iconType === 'ionicon' ? (
            <Icon name={icon as any} size={20} color={
              destructive ? theme.colors.error : theme.colors.primary
            } />
          ) : (
            <MaterialCommunityIcons name={icon as any} size={20} color={
              destructive ? theme.colors.error : theme.colors.primary
            } />
          )}
        </View>
        <View style={styles.settingItemTextContainer}>
          <Text style={[
            styles.settingItemTitle,
            destructive && { color: theme.colors.error },
            { color: destructive ? theme.colors.error : theme.colors.text }
          ]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.settingItemDescription, { color: theme.colors.secondaryText }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      {rightElement ? (
        rightElement
      ) : (
        <Icon name="chevron-forward" size={20} color={
          destructive ? theme.colors.error : theme.colors.secondaryText
        } />
      )}
    </TouchableOpacity>
  );
};

// 설정 그룹 컴포넌트
type SettingGroupProps = {
  title: string;
  children: React.ReactNode;
};

const SettingGroup: React.FC<SettingGroupProps> = ({ title, children }) => {
  const { theme } = useTheme();
  
  return (
    <View style={styles.settingGroup}>
      <Text style={[styles.settingGroupTitle, { color: theme.colors.primaryText }]}>
        {title}
      </Text>
      <Card style={styles.settingGroupCard}>
        {children}
      </Card>
    </View>
  );
};

// 메인 설정 화면
const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 훅 사용
  const { activeWallet, lockWallet, deleteWallet, isWalletLocked } = useWallet();
  const { currentNetwork } = useNetwork();
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const { 
    isBiometricsSupported, 
    isBiometricsEnabled, 
    toggleBiometrics,
    biometricsType
  } = useBiometrics();
  
  // 상태 관리
  const [appVersion, setAppVersion] = useState('');
  const [checkingForUpdates, setCheckingForUpdates] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  // 앱 버전 가져오기
  useEffect(() => {
    const version = DeviceInfo.getVersion();
    const buildNumber = DeviceInfo.getBuildNumber();
    setAppVersion(`${version} (${buildNumber})`);
  }, []);
  
  // 업데이트 확인 (모의 함수)
  const checkForUpdates = async () => {
    setCheckingForUpdates(true);
    
    try {
      // 실제 구현에서는 API 호출로 대체
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 테스트용 랜덤 업데이트 가능 여부
      const hasUpdate = Math.random() > 0.7;
      setUpdateAvailable(hasUpdate);
      
      if (hasUpdate) {
        showToast(t('settings.updateAvailable'), 'info');
      } else {
        showToast(t('settings.noUpdatesAvailable'), 'success');
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      showToast(t('settings.updateCheckFailed'), 'error');
    } finally {
      setCheckingForUpdates(false);
    }
  };
  
  // 앱 업데이트 시작 (앱 스토어 링크)
  const startUpdate = () => {
    // 플랫폼에 따라 다른 스토어 링크 (실제 앱 ID로 대체 필요)
    const url = Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/id123456789'
      : 'https://play.google.com/store/apps/details?id=com.tori.wallet';
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        showToast(t('settings.cantOpenStore'), 'error');
      }
    });
  };

  // 생체 인증 토글
  const handleToggleBiometrics = async () => {
    try {
      await toggleBiometrics();
    } catch (error) {
      console.error('Error toggling biometrics:', error);
      showToast(
        typeof error === 'string' ? error : (error as Error).message,
        'error'
      );
    }
  };
  
  // 지갑 삭제 확인
  const confirmDeleteWallet = () => {
    Alert.alert(
      t('settings.deleteWalletTitle'),
      t('settings.deleteWalletMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('settings.deleteWalletConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWallet();
              // 삭제 후 온보딩 화면으로 이동
              navigation.navigate('Welcome' as never);
            } catch (error) {
              console.error('Error deleting wallet:', error);
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
  
  // 지갑 잠금
  const handleLockWallet = async () => {
    try {
      await lockWallet();
      navigation.navigate('Lock' as never);
    } catch (error) {
      console.error('Error locking wallet:', error);
      showToast(
        typeof error === 'string' ? error : (error as Error).message,
        'error'
      );
    }
  };
  
  // 언어 선택 화면으로 이동
  const navigateToLanguageSelection = () => {
    navigation.navigate('Language' as never);
  };
  
  // 현재 선택된 언어 표시명 가져오기
  const getLanguageDisplayName = () => {
    const languageObj = supportedLanguages.find(lang => lang.code === language);
    return languageObj ? languageObj.name : language;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={t('settings.title')}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* 계정 및 보안 설정 */}
        <SettingGroup title={t('settings.account')}>
          <SettingItem
            title={t('settings.manageAccounts')}
            description={t('settings.manageAccountsDescription')}
            icon="people-outline"
            action={() => navigation.navigate('ManageAccounts' as never)}
          />
          
          <SettingItem
            title={t('settings.backupWallet')}
            description={t('settings.backupWalletDescription')}
            icon="key-outline"
            action={() => navigation.navigate('BackupWallet' as never)}
          />
          
          <SettingItem
            title={t('settings.securitySettings')}
            description={t('settings.securitySettingsDescription')}
            icon="shield-checkmark-outline"
            action={() => navigation.navigate('Security' as never)}
          />
          
          <SettingItem
            title={t('settings.lockWallet')}
            description={t('settings.lockWalletDescription')}
            icon="lock-closed-outline"
            action={handleLockWallet}
            isLast={true}
          />
        </SettingGroup>
        
        {/* 일반 설정 */}
        <SettingGroup title={t('settings.general')}>
          <SettingItem
            title={t('settings.theme')}
            description={t('settings.themeDescription')}
            icon={isDark ? 'moon-outline' : 'sunny-outline'}
            action={() => navigation.navigate('Theme' as never)}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                thumbColor={isDark ? theme.colors.primary : theme.colors.card}
                ios_backgroundColor={theme.colors.border}
              />
            }
          />
          
          <SettingItem
            title={t('settings.language')}
            description={t('settings.languageDescription')}
            icon="language-outline"
            action={navigateToLanguageSelection}
            rightElement={
              <Text style={[styles.settingValue, { color: theme.colors.secondaryText }]}>
                {getLanguageDisplayName()}
              </Text>
            }
          />
          
          <SettingItem
            title={t('settings.currency')}
            description={t('settings.currencyDescription')}
            icon="cash-outline"
            action={() => navigation.navigate('Currency' as never)}
            rightElement={
              <Text style={[styles.settingValue, { color: theme.colors.secondaryText }]}>
                USD
              </Text>
            }
          />
          
          <SettingItem
            title={t('settings.notifications')}
            description={t('settings.notificationsDescription')}
            icon="notifications-outline"
            action={() => navigation.navigate('NotificationSettings' as never)}
            isLast={true}
          />
        </SettingGroup>
        
        {/* 네트워크 설정 */}
        <SettingGroup title={t('settings.network')}>
          <SettingItem
            title={t('settings.networks')}
            description={t('settings.networksDescription')}
            icon="globe-outline"
            action={() => navigation.navigate('Networks' as never)}
            rightElement={
              <Text style={[styles.settingValue, { color: theme.colors.secondaryText }]}>
                {currentNetwork?.name}
              </Text>
            }
          />
          
          <SettingItem
            title={t('settings.addressBook')}
            description={t('settings.addressBookDescription')}
            icon="book-outline"
            action={() => navigation.navigate('AddressBook' as never)}
            isLast={true}
          />
        </SettingGroup>
        
        {/* 생체 인증 설정 (지원되는 경우만) */}
        {isBiometricsSupported && (
          <SettingGroup title={t('settings.biometrics')}>
            <SettingItem
              title={t('settings.useBiometrics')}
              description={t(`settings.${biometricsType.toLowerCase()}Description`)}
              icon={biometricsType === 'FaceID' ? 'face-id' : 'fingerprint', biometricsType === 'FaceID' ? 'material' : 'ionicon'}
              action={handleToggleBiometrics}
              rightElement={
                <Switch
                  value={isBiometricsEnabled}
                  onValueChange={handleToggleBiometrics}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                  thumbColor={isBiometricsEnabled ? theme.colors.primary : theme.colors.card}
                  ios_backgroundColor={theme.colors.border}
                />
              }
              isLast={true}
            />
          </SettingGroup>
        )}
        
        {/* 앱 정보 설정 */}
        <SettingGroup title={t('settings.about')}>
          <SettingItem
            title={t('settings.aboutTori')}
            description={t('settings.aboutToriDescription')}
            icon="information-circle-outline"
            action={() => navigation.navigate('About' as never)}
          />
          
          <SettingItem
            title={t('settings.termsOfService')}
            description={t('settings.termsOfServiceDescription')}
            icon="document-text-outline"
            action={() => navigation.navigate('Terms' as never)}
          />
          
          <SettingItem
            title={t('settings.privacyPolicy')}
            description={t('settings.privacyPolicyDescription')}
            icon="shield-outline"
            action={() => navigation.navigate('Privacy' as never)}
          />
          
          <SettingItem
            title={t('settings.help')}
            description={t('settings.helpDescription')}
            icon="help-circle-outline"
            action={() => navigation.navigate('Help' as never)}
          />
          
          <SettingItem
            title={t('settings.checkForUpdates')}
            description={`${t('settings.currentVersion')}: ${appVersion}`}
            icon="refresh-outline"
            action={checkForUpdates}
            rightElement={
              checkingForUpdates ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : updateAvailable ? (
                <TouchableOpacity
                  style={[styles.updateButton, { backgroundColor: theme.colors.primary }]}
                  onPress={startUpdate}
                >
                  <Text style={[styles.updateButtonText, { color: '#FFFFFF' }]}>
                    {t('settings.update')}
                  </Text>
                </TouchableOpacity>
              ) : null
            }
            isLast={true}
          />
        </SettingGroup>
        
        {/* 위험 영역 설정 */}
        <SettingGroup title={t('settings.dangerZone')}>
          <SettingItem
            title={t('settings.resetApp')}
            description={t('settings.resetAppDescription')}
            icon="refresh-circle-outline"
            action={() => navigation.navigate('ResetApp' as never)}
            destructive={true}
          />
          
          <SettingItem
            title={t('settings.deleteWallet')}
            description={t('settings.deleteWalletDescription')}
            icon="trash-outline"
            action={confirmDeleteWallet}
            destructive={true}
            isLast={true}
          />
        </SettingGroup>
        
        {/* 앱 버전 */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.colors.secondaryText }]}>
            TORI Wallet v{appVersion}
          </Text>
        </View>
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
  settingGroup: {
    marginBottom: 16,
  },
  settingGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  settingGroupCard: {
    borderRadius: 12,
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingItemTextContainer: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingItemDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
    marginRight: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 12,
  },
  updateButton: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  updateButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Settings;
