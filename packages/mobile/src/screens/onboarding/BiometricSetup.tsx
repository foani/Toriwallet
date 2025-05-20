import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useTheme } from '../../hooks/useTheme';
import { useBiometrics } from '../../hooks/useBiometrics';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

type BiometricSetupScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'BiometricSetup'
>;

type BiometricSetupScreenRouteProp = RouteProp<
  AuthStackParamList,
  'BiometricSetup'
>;

interface BiometricSetupProps {
  navigation: BiometricSetupScreenNavigationProp;
  route: BiometricSetupScreenRouteProp;
}

/**
 * 생체 인증 설정 화면
 * 
 * 사용자가 생체 인증(Face ID, 지문 인식 등)을 활성화하는 화면입니다.
 * 생체 인증 장치가 있는지 확인하고, 있다면 활성화 과정을 진행합니다.
 */
const BiometricSetup: React.FC<BiometricSetupProps> = ({ navigation, route }) => {
  const { walletId } = route.params;
  const { theme } = useTheme();
  const {
    isAvailable,
    biometryTypeName,
    isLoading,
    enableBiometrics,
  } = useBiometrics();
  
  const [loading, setLoading] = useState<boolean>(false);
  
  // 생체 인증 활성화
  const handleEnableBiometrics = async () => {
    setLoading(true);
    
    try {
      // 실제 구현에서는 지갑 서비스에서 비밀번호를 가져와야 함
      // 이 예제에서는 더미 비밀번호를 사용
      const dummyPassword = 'password123';
      
      const success = await enableBiometrics(dummyPassword, walletId);
      
      if (success) {
        Alert.alert(
          '성공',
          `${biometryTypeName}가 성공적으로 활성화되었습니다.`,
          [
            {
              text: '확인',
              onPress: handleFinish,
            },
          ]
        );
      } else {
        Alert.alert(
          '오류',
          `${biometryTypeName} 활성화에 실패했습니다. 다시 시도해주세요.`
        );
      }
    } catch (error) {
      console.error('Error enabling biometrics:', error);
      Alert.alert(
        '오류',
        '생체 인증 활성화 중 오류가 발생했습니다. 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // 설정 완료 처리
  const handleFinish = () => {
    // 온보딩이 완료되었으므로 메인 화면으로 이동
    // 실제 구현에서는 Context를 통해 전역 상태 업데이트 필요
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }], // 메인 화면으로 이동하도록 수정 필요
    });
  };
  
  // 생체 인증 건너뛰기
  const handleSkip = () => {
    Alert.alert(
      '생체 인증 건너뛰기',
      '생체 인증을 사용하지 않으면 앱을 열 때마다 비밀번호를 입력해야 합니다. 계속하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '건너뛰기',
          onPress: handleFinish,
        },
      ]
    );
  };
  
  // 생체 인증이 사용 불가능한 경우 렌더링
  if (!isAvailable && !isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.content}>
          <Icon
            name="alert-circle-outline"
            size={80}
            color={theme.colors.warning}
            style={styles.icon}
          />
          
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.xl,
                fontFamily: theme.typography.fontFamily.bold,
                marginBottom: theme.spacing.md,
              },
            ]}
          >
            생체 인증을 사용할 수 없습니다
          </Text>
          
          <Text
            style={[
              styles.description,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.md,
                fontFamily: theme.typography.fontFamily.regular,
                marginBottom: theme.spacing.xl,
                textAlign: 'center',
              },
            ]}
          >
            이 기기에서는 지문 인식이나 Face ID와 같은 생체 인증 기능을 사용할 수 없습니다.
            계속 진행하려면 '계속' 버튼을 눌러주세요.
          </Text>
          
          <Button
            title="계속"
            onPress={handleFinish}
            variant="primary"
            size="large"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }
  
  // 로딩 중인 경우 렌더링
  if (isLoading || loading) {
    return <Loading loading message="생체 인증 확인 중..." />;
  }
  
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: 'rgba(125, 68, 240, 0.1)',
                marginBottom: theme.spacing.xl,
              },
            ]}
          >
            {biometryTypeName === 'Face ID' ? (
              <Icon
                name="scan-outline"
                size={80}
                color={theme.colors.primary}
              />
            ) : (
              <Icon
                name="finger-print-outline"
                size={80}
                color={theme.colors.primary}
              />
            )}
          </View>
          
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.xl,
                fontFamily: theme.typography.fontFamily.bold,
                marginBottom: theme.spacing.md,
              },
            ]}
          >
            {biometryTypeName} 설정
          </Text>
          
          <Text
            style={[
              styles.description,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.md,
                fontFamily: theme.typography.fontFamily.regular,
                marginBottom: theme.spacing.xl,
                textAlign: 'center',
              },
            ]}
          >
            {biometryTypeName}를 사용하여 TORI 지갑에 더 빠르고 안전하게 접근할 수 있습니다.
            {'\n\n'}
            지갑 잠금 해제, 트랜잭션 승인 등에 사용됩니다.
          </Text>
          
          <Button
            title={`${biometryTypeName} 활성화`}
            onPress={handleEnableBiometrics}
            variant="primary"
            size="large"
            fullWidth
            style={{ marginBottom: theme.spacing.md }}
          />
          
          <Button
            title="건너뛰기"
            onPress={handleSkip}
            variant="text"
            size="medium"
            fullWidth
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
});

export default BiometricSetup;
