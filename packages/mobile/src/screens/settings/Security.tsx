import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// 컴포넌트
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

// 훅
import { useTheme } from '../../hooks/useTheme';
import { useWallet } from '../../hooks/useWallet';
import { useBiometrics } from '../../hooks/useBiometrics';
import { useSecurity } from '../../hooks/useSecurity';

// 유틸리티
import { showToast } from '../../utils/toast';

// 설정 항목 컴포넌트
type SecuritySettingItemProps = {
  title: string;
  description?: string;
  icon: string;
  iconType?: 'ionicon' | 'material';
  rightElement: React.ReactNode;
  isLast?: boolean;
};

const SecuritySettingItem: React.FC<SecuritySettingItemProps> = ({
  title,
  description,
  icon,
  iconType = 'ionicon',
  rightElement,
  isLast = false,
}) => {
  const { theme } = useTheme();
  
  return (
    <View
      style={[
        styles.settingItem,
        !isLast && [styles.settingItemBorder, { borderBottomColor: theme.colors.border }]
      ]}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.cardAlt }]}>
          {iconType === 'ionicon' ? (
            <Icon name={icon as any} size={20} color={theme.colors.primary} />
          ) : (
            <MaterialCommunityIcons name={icon as any} size={20} color={theme.colors.primary} />
          )}
        </View>
        <View style={styles.settingItemTextContainer}>
          <Text style={[styles.settingItemTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.settingItemDescription, { color: theme.colors.secondaryText }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      {rightElement}
    </View>
  );
};

// 시간 선택 옵션 타입
type TimeOption = {
  label: string;
  value: number; // 시간(분)
};

// 보안 설정 화면
const Security: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 훅 사용
  const { 
    changePassword,
    verifyPassword
  } = useWallet();
  
  const {
    isBiometricsSupported,
    isBiometricsEnabled,
    toggleBiometrics,
    biometricsType
  } = useBiometrics();
  
  const {
    isPasscodeEnabled,
    enablePasscode,
    disablePasscode,
    changePasscode,
    autoLockTime,
    setAutoLockTime,
    isAppLockEnabled,
    toggleAppLock,
    requirePasswordForTransactions,
    toggleRequirePasswordForTransactions
  } = useSecurity();
  
  // 상태 관리
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // 자동 잠금 시간 옵션
  const autoLockOptions: TimeOption[] = [
    { label: t('security.immediately'), value: 0 },
    { label: t('security.after1Minute'), value: 1 },
    { label: t('security.after5Minutes'), value: 5 },
    { label: t('security.after15Minutes'), value: 15 },
    { label: t('security.after30Minutes'), value: 30 },
    { label: t('security.after1Hour'), value: 60 },
    { label: t('security.never'), value: -1 },
  ];
  
  // 선택된 자동 잠금 시간 레이블 가져오기
  const getSelectedAutoLockTimeLabel = (): string => {
    const option = autoLockOptions.find(opt => opt.value === autoLockTime);
    return option ? option.label : t('security.immediately');
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
  
  // 패스코드 설정 화면으로 이동
  const navigateToPasscode = () => {
    if (isPasscodeEnabled) {
      Alert.alert(
        t('security.passcodeTitle'),
        t('security.passcodeCurrentMessage'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('security.changePasscode'),
            onPress: () => navigation.navigate('Passcode' as never, { mode: 'change' } as never),
          },
          {
            text: t('security.disablePasscode'),
            style: 'destructive',
            onPress: async () => {
              try {
                await disablePasscode();
                showToast(t('security.passcodeDisabled'), 'success');
              } catch (error) {
                console.error('Error disabling passcode:', error);
                showToast(
                  typeof error === 'string' ? error : (error as Error).message,
                  'error'
                );
              }
            },
          },
        ]
      );
    } else {
      navigation.navigate('Passcode' as never, { mode: 'setup' } as never);
    }
  };
  
  // 자동 잠금 시간 설정
  const handleSetAutoLockTime = (time: number) => {
    setAutoLockTime(time);
    setShowTimePicker(false);
  };
  
  // 비밀번호 변경 제출
  const handleChangePassword = async () => {
    // 유효성 검사
    if (!currentPassword) {
      setPasswordError(t('security.currentPasswordRequired'));
      return;
    }
    
    if (!newPassword) {
      setPasswordError(t('security.newPasswordRequired'));
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError(t('security.passwordTooShort'));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError(t('security.passwordsDoNotMatch'));
      return;
    }
    
    setLoading(true);
    setPasswordError('');
    
    try {
      // 현재 비밀번호 확인
      const isValid = await verifyPassword(currentPassword);
      
      if (!isValid) {
        setPasswordError(t('security.currentPasswordIncorrect'));
        setLoading(false);
        return;
      }
      
      // 비밀번호 변경
      await changePassword(currentPassword, newPassword);
      
      // 입력 필드 초기화
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
      
      showToast(t('security.passwordChanged'), 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(
        typeof error === 'string' ? error : (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };
  
  // 앱 잠금 토글
  const handleToggleAppLock = async () => {
    try {
      await toggleAppLock();
    } catch (error) {
      console.error('Error toggling app lock:', error);
      showToast(
        typeof error === 'string' ? error : (error as Error).message,
        'error'
      );
    }
  };
  
  // 트랜잭션 비밀번호 요구 토글
  const handleToggleRequirePasswordForTransactions = async () => {
    try {
      await toggleRequirePasswordForTransactions();
    } catch (error) {
      console.error('Error toggling require password for transactions:', error);
      showToast(
        typeof error === 'string' ? error : (error as Error).message,
        'error'
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={t('security.title')}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* 인증 설정 */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
            {t('security.authentication')}
          </Text>
          
          <Card style={styles.settingsCard}>
            {/* 패스코드 설정 */}
            <SecuritySettingItem
              title={t('security.passcode')}
              description={t('security.passcodeDescription')}
              icon="keypad-outline"
              rightElement={
                <TouchableOpacity
                  style={[styles.actionButton, { 
                    backgroundColor: isPasscodeEnabled 
                      ? theme.colors.primary + '20' 
                      : theme.colors.primary 
                  }]}
                  onPress={navigateToPasscode}
                >
                  <Text style={[styles.actionButtonText, { 
                    color: isPasscodeEnabled 
                      ? theme.colors.primary 
                      : '#FFFFFF' 
                  }]}>
                    {isPasscodeEnabled ? t('security.change') : t('security.setup')}
                  </Text>
                </TouchableOpacity>
              }
            />
            
            {/* 생체 인증 설정 (지원되는 경우만) */}
            {isBiometricsSupported && (
              <SecuritySettingItem
                title={t(`security.${biometricsType.toLowerCase()}`)}
                description={t(`security.${biometricsType.toLowerCase()}Description`)}
                icon={biometricsType === 'FaceID' ? 'face-id' : 'fingerprint', biometricsType === 'FaceID' ? 'material' : 'ionicon'}
                rightElement={
                  <Switch
                    value={isBiometricsEnabled}
                    onValueChange={handleToggleBiometrics}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                    thumbColor={isBiometricsEnabled ? theme.colors.primary : theme.colors.card}
                    ios_backgroundColor={theme.colors.border}
                  />
                }
              />
            )}
            
            {/* 앱 잠금 설정 */}
            <SecuritySettingItem
              title={t('security.appLock')}
              description={t('security.appLockDescription')}
              icon="lock-closed-outline"
              rightElement={
                <Switch
                  value={isAppLockEnabled}
                  onValueChange={handleToggleAppLock}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                  thumbColor={isAppLockEnabled ? theme.colors.primary : theme.colors.card}
                  ios_backgroundColor={theme.colors.border}
                />
              }
            />
            
            {/* 자동 잠금 시간 설정 */}
            <SecuritySettingItem
              title={t('security.autoLockTime')}
              description={t('security.autoLockTimeDescription')}
              icon="timer-outline"
              rightElement={
                <TouchableOpacity
                  style={styles.timeSelectorContainer}
                  onPress={() => setShowTimePicker(!showTimePicker)}
                >
                  <Text style={[styles.timeValue, { color: theme.colors.text }]}>
                    {getSelectedAutoLockTimeLabel()}
                  </Text>
                  <Icon 
                    name={showTimePicker ? 'chevron-up' : 'chevron-down'} 
                    size={16} 
                    color={theme.colors.secondaryText} 
                  />
                </TouchableOpacity>
              }
              isLast={true}
            />
            
            {/* 시간 선택 드롭다운 */}
            {showTimePicker && (
              <View style={[styles.timePickerDropdown, { backgroundColor: theme.colors.cardAlt }]}>
                {autoLockOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeOption,
                      autoLockTime === option.value && [
                        styles.selectedTimeOption,
                        { backgroundColor: theme.colors.primary + '20' }
                      ],
                      index === autoLockOptions.length - 1 && styles.lastTimeOption
                    ]}
                    onPress={() => handleSetAutoLockTime(option.value)}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      { color: theme.colors.text },
                      autoLockTime === option.value && { color: theme.colors.primary, fontWeight: '600' }
                    ]}>
                      {option.label}
                    </Text>
                    {autoLockTime === option.value && (
                      <Icon name="checkmark" size={18} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>
        </View>
        
        {/* 트랜잭션 보안 설정 */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
            {t('security.transactions')}
          </Text>
          
          <Card style={styles.settingsCard}>
            {/* 트랜잭션에 비밀번호 요구 설정 */}
            <SecuritySettingItem
              title={t('security.requirePasswordForTransactions')}
              description={t('security.requirePasswordForTransactionsDescription')}
              icon="shield-checkmark-outline"
              rightElement={
                <Switch
                  value={requirePasswordForTransactions}
                  onValueChange={handleToggleRequirePasswordForTransactions}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                  thumbColor={requirePasswordForTransactions ? theme.colors.primary : theme.colors.card}
                  ios_backgroundColor={theme.colors.border}
                />
              }
              isLast={true}
            />
          </Card>
        </View>
        
        {/* 비밀번호 설정 */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primaryText }]}>
            {t('security.password')}
          </Text>
          
          <Card style={styles.settingsCard}>
            {!showChangePassword ? (
              <TouchableOpacity
                style={styles.passwordButton}
                onPress={() => setShowChangePassword(true)}
              >
                <View style={styles.settingItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: theme.colors.cardAlt }]}>
                    <Icon name="key-outline" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.settingItemTextContainer}>
                    <Text style={[styles.settingItemTitle, { color: theme.colors.text }]}>
                      {t('security.changePassword')}
                    </Text>
                    <Text style={[styles.settingItemDescription, { color: theme.colors.secondaryText }]}>
                      {t('security.changePasswordDescription')}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-forward" size={20} color={theme.colors.secondaryText} />
              </TouchableOpacity>
            ) : (
              <View style={styles.passwordFormContainer}>
                <Text style={[styles.passwordFormTitle, { color: theme.colors.text }]}>
                  {t('security.changePassword')}
                </Text>
                
                {/* 현재 비밀번호 */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                    {t('security.currentPassword')}
                  </Text>
                  <TextInput
                    style={[styles.input, { 
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.cardAlt
                    }]}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder={t('security.enterCurrentPassword')}
                    placeholderTextColor={theme.colors.secondaryText}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
                
                {/* 새 비밀번호 */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                    {t('security.newPassword')}
                  </Text>
                  <TextInput
                    style={[styles.input, { 
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.cardAlt
                    }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={t('security.enterNewPassword')}
                    placeholderTextColor={theme.colors.secondaryText}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
                
                {/* 비밀번호 확인 */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                    {t('security.confirmPassword')}
                  </Text>
                  <TextInput
                    style={[styles.input, { 
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.cardAlt
                    }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('security.enterConfirmPassword')}
                    placeholderTextColor={theme.colors.secondaryText}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
                
                {/* 오류 메시지 */}
                {passwordError ? (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {passwordError}
                  </Text>
                ) : null}
                
                {/* 버튼 */}
                <View style={styles.passwordFormButtons}>
                  <Button
                    title={t('common.cancel')}
                    onPress={() => {
                      setShowChangePassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordError('');
                    }}
                    variant="secondary"
                    style={styles.passwordFormButton}
                  />
                  
                  <Button
                    title={loading ? '' : t('security.changePassword')}
                    onPress={handleChangePassword}
                    disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                    style={styles.passwordFormButton}
                  >
                    {loading && <ActivityIndicator color="#FFFFFF" size="small" />}
                  </Button>
                </View>
              </View>
            )}
          </Card>
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
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    borderRadius: 12,
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
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
  actionButton: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  timePickerDropdown: {
    marginTop: -8,
    marginBottom: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  timeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedTimeOption: {
    borderRadius: 8,
  },
  lastTimeOption: {
    borderBottomWidth: 0,
  },
  timeOptionText: {
    fontSize: 14,
  },
  passwordButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  passwordFormContainer: {
    padding: 16,
  },
  passwordFormTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
  },
  passwordFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passwordFormButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default Security;
