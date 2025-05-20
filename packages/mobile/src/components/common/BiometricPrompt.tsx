import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useBiometrics } from '../../hooks/useBiometrics';
import { useTheme } from '../../hooks/useTheme';
import Button from './Button';

interface BiometricPromptProps {
  visible: boolean;
  onSuccess: (password?: string) => void;
  onCancel: () => void;
  promptMessage?: string;
  cancelable?: boolean;
  style?: ViewStyle;
}

/**
 * 생체 인증 프롬프트 컴포넌트
 * 
 * 사용자에게 생체 인증을 요청하는 모달 컴포넌트입니다.
 * Face ID, 지문 인식 등의 생체 인증을 시작하고 결과를 처리합니다.
 * 
 * @param visible 모달 표시 여부
 * @param onSuccess 인증 성공 시 콜백 함수
 * @param onCancel 인증 취소 시 콜백 함수
 * @param promptMessage 인증 시 표시할 메시지
 * @param cancelable 취소 가능 여부
 * @param style 추가 스타일 (ViewStyle)
 */
const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  visible,
  onSuccess,
  onCancel,
  promptMessage = '생체 인증을 사용하여 인증해주세요',
  cancelable = true,
  style,
}) => {
  const { theme } = useTheme();
  const {
    biometryTypeName,
    getPassword,
    authenticate,
    isAvailable,
    isEnabled,
  } = useBiometrics();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // 프롬프트가 표시될 때 자동으로 인증 시작
  useEffect(() => {
    if (visible && isAvailable && isEnabled) {
      startAuthentication();
    }
  }, [visible, isAvailable, isEnabled]);
  
  // 생체 인증 시작
  const startAuthentication = async () => {
    if (!visible || loading) return;
    
    setLoading(true);
    setErrorMessage(null);
    
    try {
      // 저장된 비밀번호 가져오기
      const credentials = await getPassword(promptMessage);
      
      if (credentials) {
        // 비밀번호 있을 경우 성공 콜백에 비밀번호 전달
        onSuccess(credentials.password);
      } else {
        // 비밀번호 없을 경우 단순 인증만 시도
        const success = await authenticate(promptMessage);
        
        if (success) {
          onSuccess();
        } else {
          setErrorMessage('인증에 실패했습니다');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setErrorMessage('인증 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };
  
  // 생체 인증 다시 시도
  const retryAuthentication = () => {
    setErrorMessage(null);
    startAuthentication();
  };
  
  // 생체 인증 아이콘 결정
  const getBiometricIcon = () => {
    const iconSize = 60;
    
    if (biometryTypeName === 'Face ID') {
      return (
        <Icon
          name="scan-outline"
          size={iconSize}
          color={theme.colors.primary}
        />
      );
    } else {
      return (
        <Icon
          name="finger-print-outline"
          size={iconSize}
          color={theme.colors.primary}
        />
      );
    }
  };
  
  if (!visible) {
    return null;
  }
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (cancelable && !loading) {
          onCancel();
        }
      }}
    >
      <View
        style={[
          styles.modalContainer,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        ]}
      >
        <View
          style={[
            styles.promptContainer,
            {
              backgroundColor: theme.colors.background,
              borderRadius: theme.borderRadius.lg,
              ...theme.shadows.lg,
              padding: theme.spacing.lg,
            },
            style,
          ]}
        >
          <View style={styles.iconContainer}>
            {getBiometricIcon()}
          </View>
          
          <Text
            style={[
              styles.titleText,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.lg,
                fontFamily: theme.typography.fontFamily.bold,
                marginTop: theme.spacing.md,
                marginBottom: theme.spacing.sm,
              },
            ]}
          >
            {biometryTypeName} 인증
          </Text>
          
          <Text
            style={[
              styles.messageText,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.md,
                fontFamily: theme.typography.fontFamily.regular,
                marginBottom: theme.spacing.lg,
                textAlign: 'center',
              },
            ]}
          >
            {promptMessage}
          </Text>
          
          {errorMessage && (
            <Text
              style={[
                styles.errorText,
                {
                  color: theme.colors.error,
                  fontSize: theme.typography.fontSize.sm,
                  fontFamily: theme.typography.fontFamily.medium,
                  marginBottom: theme.spacing.md,
                  textAlign: 'center',
                },
              ]}
            >
              {errorMessage}
            </Text>
          )}
          
          {loading ? (
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              style={styles.loader}
            />
          ) : (
            <View style={styles.buttonsContainer}>
              {errorMessage && (
                <Button
                  title="다시 시도"
                  onPress={retryAuthentication}
                  variant="primary"
                  style={{ marginBottom: theme.spacing.sm }}
                />
              )}
              
              {cancelable && (
                <Button
                  title="취소"
                  onPress={onCancel}
                  variant={errorMessage ? 'text' : 'outline'}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptContainer: {
    width: '80%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(125, 68, 240, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    textAlign: 'center',
  },
  messageText: {
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
  buttonsContainer: {
    width: '100%',
  },
});

export default BiometricPrompt;
