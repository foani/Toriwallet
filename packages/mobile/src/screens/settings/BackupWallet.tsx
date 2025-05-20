import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
import { useTheme } from '../../hooks/useTheme';
import { useWallet } from '../../hooks/useWallet';
import { useSecurity } from '../../hooks/useSecurity';

// 유틸리티
import { showToast } from '../../utils/toast';

const BackupWallet: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // 훅 사용
  const { getMnemonic, verifyPassword, exportPrivateKey, activeWallet, activeAccount } = useWallet();
  const { requirePasswordForTransactions } = useSecurity();
  
  // 상태 관리
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [privateKey, setPrivateKey] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [validated, setValidated] = useState(false);
  const [exportType, setExportType] = useState<'mnemonic' | 'privateKey'>('mnemonic');
  
  // 비밀번호 확인 및 데이터 가져오기
  const handlePasswordSubmit = async () => {
    if (!password) {
      setPasswordError(t('backup.enterPassword'));
      return;
    }
    
    setLoading(true);
    setPasswordError('');
    
    try {
      // 비밀번호 검증
      const isValid = await verifyPassword(password);
      
      if (!isValid) {
        setPasswordError(t('backup.incorrectPassword'));
        return;
      }
      
      // 비밀번호 검증 성공
      setValidated(true);
      
      // 선택한 내보내기 유형에 따라 데이터 가져오기
      if (exportType === 'mnemonic') {
        const retrievedMnemonic = await getMnemonic(password);
        setMnemonic(retrievedMnemonic.split(' '));
      } else {
        const retrievedPrivateKey = await exportPrivateKey(activeAccount?.address || '', password);
        setPrivateKey(retrievedPrivateKey);
      }
      
      // 다음 단계로 이동
      setStep(2);
    } catch (error) {
      console.error('Error verifying password:', error);
      setPasswordError(
        typeof error === 'string' ? error : (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };
  
  // 클립보드에 복사
  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    showToast(t('backup.copiedToClipboard'), 'success');
  };
  
  // 보안 경고 확인
  const handleContinue = () => {
    // 보안 경고 확인 후 실제 데이터 표시
    if (exportType === 'mnemonic') {
      setShowMnemonic(true);
    } else {
      setShowPrivateKey(true);
    }
    setStep(3);
  };
  
  // 백업 완료
  const handleFinish = () => {
    // 모든 상태 초기화
    setPassword('');
    setPasswordError('');
    setMnemonic([]);
    setPrivateKey('');
    setShowMnemonic(false);
    setShowPrivateKey(false);
    setValidated(false);
    
    // 설정 화면으로 돌아가기
    navigation.goBack();
    
    // 성공 메시지
    showToast(t('backup.backupComplete'), 'success');
  };

  // 단계 1: 비밀번호 확인 화면
  const renderStep1 = () => {
    return (
      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          {t('backup.verifyIdentity')}
        </Text>
        
        <Text style={[styles.cardDescription, { color: theme.colors.secondaryText }]}>
          {t('backup.enterPasswordDescription')}
        </Text>
        
        <View style={styles.exportTypeSelector}>
          <TouchableOpacity
            style={[
              styles.exportTypeButton,
              exportType === 'mnemonic' && styles.exportTypeButtonActive,
              {
                backgroundColor: exportType === 'mnemonic' 
                  ? theme.colors.primary + '20' 
                  : theme.colors.cardAlt
              }
            ]}
            onPress={() => setExportType('mnemonic')}
          >
            <Icon 
              name="document-text-outline" 
              size={20} 
              color={exportType === 'mnemonic' ? theme.colors.primary : theme.colors.secondaryText} 
            />
            <Text style={[
              styles.exportTypeText,
              { 
                color: exportType === 'mnemonic' 
                  ? theme.colors.primary 
                  : theme.colors.secondaryText 
              }
            ]}>
              {t('backup.mnemonic')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.exportTypeButton,
              exportType === 'privateKey' && styles.exportTypeButtonActive,
              {
                backgroundColor: exportType === 'privateKey' 
                  ? theme.colors.primary + '20' 
                  : theme.colors.cardAlt
              }
            ]}
            onPress={() => setExportType('privateKey')}
          >
            <Icon 
              name="key-outline" 
              size={20} 
              color={exportType === 'privateKey' ? theme.colors.primary : theme.colors.secondaryText} 
            />
            <Text style={[
              styles.exportTypeText,
              { 
                color: exportType === 'privateKey' 
                  ? theme.colors.primary 
                  : theme.colors.secondaryText 
              }
            ]}>
              {t('backup.privateKey')}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            {t('backup.password')}
          </Text>
          <TextInput
            style={[styles.input, { 
              color: theme.colors.text,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.cardAlt
            }]}
            value={password}
            onChangeText={setPassword}
            placeholder={t('backup.enterPassword')}
            placeholderTextColor={theme.colors.secondaryText}
            secureTextEntry
            autoCapitalize="none"
            onSubmitEditing={handlePasswordSubmit}
          />
          {passwordError ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {passwordError}
            </Text>
          ) : null}
        </View>
        
        <Button
          title={loading ? '' : t('backup.continue')}
          onPress={handlePasswordSubmit}
          disabled={loading || !password}
          style={styles.button}
        >
          {loading && <ActivityIndicator color="#FFFFFF" size="small" />}
        </Button>
      </Card>
    );
  };
  
  // 단계 2: 보안 경고 화면
  const renderStep2 = () => {
    return (
      <Card style={styles.card}>
        <View style={styles.warningIconContainer}>
          <Icon name="warning-outline" size={36} color={theme.colors.warning} />
        </View>
        
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          {t('backup.securityWarning')}
        </Text>
        
        <Text style={[styles.cardDescription, { color: theme.colors.secondaryText }]}>
          {exportType === 'mnemonic'
            ? t('backup.mnemonicWarningDescription')
            : t('backup.privateKeyWarningDescription')}
        </Text>
        
        <View style={styles.warningList}>
          <View style={styles.warningItem}>
            <Icon name="close-circle" size={20} color={theme.colors.error} style={styles.warningIcon} />
            <Text style={[styles.warningText, { color: theme.colors.text }]}>
              {t('backup.warningPoint1')}
            </Text>
          </View>
          
          <View style={styles.warningItem}>
            <Icon name="close-circle" size={20} color={theme.colors.error} style={styles.warningIcon} />
            <Text style={[styles.warningText, { color: theme.colors.text }]}>
              {t('backup.warningPoint2')}
            </Text>
          </View>
          
          <View style={styles.warningItem}>
            <Icon name="close-circle" size={20} color={theme.colors.error} style={styles.warningIcon} />
            <Text style={[styles.warningText, { color: theme.colors.text }]}>
              {t('backup.warningPoint3')}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.secureLocationText, { color: theme.colors.warning }]}>
          {t('backup.secureLocation')}
        </Text>
        
        <Button
          title={t('backup.understand')}
          onPress={handleContinue}
          style={styles.button}
        />
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setStep(1);
            setPassword('');
            setPasswordError('');
          }}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.secondaryText }]}>
            {t('common.goBack')}
          </Text>
        </TouchableOpacity>
      </Card>
    );
  };
  
  // 단계 3: 시드 구문 또는 개인 키 표시 화면
  const renderStep3 = () => {
    return (
      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          {exportType === 'mnemonic'
            ? t('backup.yourRecoveryPhrase')
            : t('backup.yourPrivateKey')}
        </Text>
        
        <Text style={[styles.cardDescription, { color: theme.colors.secondaryText }]}>
          {exportType === 'mnemonic'
            ? t('backup.recoveryPhraseDescription')
            : t('backup.privateKeyDescription')}
        </Text>
        
        {exportType === 'mnemonic' && showMnemonic ? (
          <View style={[styles.mnemonicContainer, { backgroundColor: theme.colors.cardAlt }]}>
            <View style={styles.mnemonicWordsGrid}>
              {mnemonic.map((word, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.mnemonicWordContainer,
                    { borderColor: theme.colors.border }
                  ]}
                >
                  <Text style={[styles.mnemonicIndex, { color: theme.colors.secondaryText }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.mnemonicWord, { color: theme.colors.text }]}>
                    {word}
                  </Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity
              style={[styles.copyButton, { borderColor: theme.colors.border }]}
              onPress={() => copyToClipboard(mnemonic.join(' '))}
            >
              <Icon name="copy-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.copyButtonText, { color: theme.colors.primary }]}>
                {t('backup.copyToClipboard')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : exportType === 'privateKey' && showPrivateKey ? (
          <View style={[styles.privateKeyContainer, { backgroundColor: theme.colors.cardAlt }]}>
            <Text style={[styles.privateKeyText, { color: theme.colors.text }]}>
              {privateKey}
            </Text>
            
            <TouchableOpacity
              style={[styles.copyButton, { borderColor: theme.colors.border }]}
              onPress={() => copyToClipboard(privateKey)}
            >
              <Icon name="copy-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.copyButtonText, { color: theme.colors.primary }]}>
                {t('backup.copyToClipboard')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.hiddenContainer, { backgroundColor: theme.colors.cardAlt }]}>
            <Icon name="eye-off-outline" size={36} color={theme.colors.secondaryText} />
            <Text style={[styles.hiddenText, { color: theme.colors.secondaryText }]}>
              {t('backup.contentHidden')}
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.toggleButton, { borderColor: theme.colors.border }]}
          onPress={() => exportType === 'mnemonic' 
            ? setShowMnemonic(!showMnemonic) 
            : setShowPrivateKey(!showPrivateKey)
          }
        >
          <Icon 
            name={exportType === 'mnemonic'
              ? (showMnemonic ? 'eye-off-outline' : 'eye-outline')
              : (showPrivateKey ? 'eye-off-outline' : 'eye-outline')
            } 
            size={20} 
            color={theme.colors.primary} 
          />
          <Text style={[styles.toggleButtonText, { color: theme.colors.primary }]}>
            {exportType === 'mnemonic'
              ? (showMnemonic ? t('backup.hideMnemonic') : t('backup.showMnemonic'))
              : (showPrivateKey ? t('backup.hidePrivateKey') : t('backup.showPrivateKey'))
            }
          </Text>
        </TouchableOpacity>
        
        <Button
          title={t('backup.done')}
          onPress={handleFinish}
          style={styles.button}
        />
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title={t('backup.title')}
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.stepIndicatorContainer}>
          <View style={[
            styles.stepIndicator,
            step >= 1 && styles.activeStepIndicator,
            { backgroundColor: step >= 1 ? theme.colors.primary : theme.colors.border }
          ]}>
            <Text style={[styles.stepIndicatorText, { color: '#FFFFFF' }]}>1</Text>
          </View>
          <View style={[styles.stepConnector, { backgroundColor: step >= 2 ? theme.colors.primary : theme.colors.border }]} />
          <View style={[
            styles.stepIndicator,
            step >= 2 && styles.activeStepIndicator,
            { backgroundColor: step >= 2 ? theme.colors.primary : theme.colors.border }
          ]}>
            <Text style={[styles.stepIndicatorText, { color: '#FFFFFF' }]}>2</Text>
          </View>
          <View style={[styles.stepConnector, { backgroundColor: step >= 3 ? theme.colors.primary : theme.colors.border }]} />
          <View style={[
            styles.stepIndicator,
            step >= 3 && styles.activeStepIndicator,
            { backgroundColor: step >= 3 ? theme.colors.primary : theme.colors.border }
          ]}>
            <Text style={[styles.stepIndicatorText, { color: '#FFFFFF' }]}>3</Text>
          </View>
        </View>
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
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
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepIndicator: {
    elevation: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
    }),
  },
  stepIndicatorText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepConnector: {
    width: 50,
    height: 2,
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  exportTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  exportTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 4,
  },
  exportTypeButtonActive: {
    borderWidth: 1,
  },
  exportTypeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
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
    marginTop: 8,
  },
  button: {
    marginTop: 8,
  },
  warningIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  warningList: {
    marginVertical: 16,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  warningIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  warningText: {
    fontSize: 14,
    flex: 1,
  },
  secureLocationText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 16,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 14,
  },
  mnemonicContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  mnemonicWordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mnemonicWordContainer: {
    width: '30%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  mnemonicIndex: {
    fontSize: 10,
    marginBottom: 4,
  },
  mnemonicWord: {
    fontSize: 14,
    fontWeight: '500',
  },
  privateKeyContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  privateKeyText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 16,
  },
  hiddenContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  hiddenText: {
    fontSize: 14,
    marginTop: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  copyButtonText: {
    fontSize: 14,
    marginLeft: 8,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  toggleButtonText: {
    fontSize: 14,
    marginLeft: 8,
  },
});

export default BackupWallet;
