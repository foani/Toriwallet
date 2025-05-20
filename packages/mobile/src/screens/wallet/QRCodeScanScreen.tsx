import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { WalletStackParamList } from '../../navigation/MainNavigator';
import QRCodeScanner, { QRScanResult } from '../../components/common/QRCodeScanner';
import { useTheme } from '../../hooks/useTheme';

type QRCodeScanScreenNavigationProp = StackNavigationProp<
  WalletStackParamList,
  'QRCodeScan'
>;

type QRCodeScanScreenRouteProp = RouteProp<
  WalletStackParamList,
  'QRCodeScan'
>;

type QRScanMode = 'address' | 'wc' | 'any';

interface QRCodeScanScreenProps {
  navigation: QRCodeScanScreenNavigationProp;
  route: QRCodeScanScreenRouteProp;
}

/**
 * QR 코드 스캔 화면
 * 
 * 지갑 주소, WalletConnect 연결 등을 위한 QR 코드를 스캔하는 화면입니다.
 */
const QRCodeScanScreen: React.FC<QRCodeScanScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { mode = 'any', onScanSuccess } = route.params || {};
  const [scanning, setScanning] = useState(true);
  
  // QR 코드 스캔 처리
  const handleScan = (result: QRScanResult) => {
    // 이미 처리 중인 경우 무시
    if (!scanning) return;
    
    setScanning(false);
    
    // 스캔 모드에 따른 처리
    switch (mode) {
      case 'address':
        handleAddressScan(result.data);
        break;
      case 'wc':
        handleWalletConnectScan(result.data);
        break;
      case 'any':
      default:
        handleAnyScan(result.data);
        break;
    }
  };
  
  // 지갑 주소 스캔 처리
  const handleAddressScan = (data: string) => {
    // 주소 유효성 검사 (간단한 예시)
    const isValidAddress = /^(0x)?[0-9a-fA-F]{40}$/.test(data); // 이더리움 주소 형식
    
    if (isValidAddress) {
      // 콜백 함수가 있으면 호출
      if (onScanSuccess) {
        onScanSuccess(data);
        navigation.goBack();
      } else {
        // 기본 처리: Send 화면으로 이동
        navigation.navigate('Send', { address: data });
      }
    } else {
      // 유효하지 않은 주소인 경우 알림 표시
      Alert.alert(
        '유효하지 않은 주소',
        '스캔한 QR 코드에서 유효한 암호화폐 주소를 찾을 수 없습니다.',
        [
          {
            text: '다시 시도',
            onPress: () => setScanning(true),
          },
          {
            text: '취소',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    }
  };
  
  // WalletConnect QR 코드 스캔 처리
  const handleWalletConnectScan = (data: string) => {
    // WalletConnect URI 유효성 검사
    const isWalletConnectURI = data.startsWith('wc:');
    
    if (isWalletConnectURI) {
      // 콜백 함수가 있으면 호출
      if (onScanSuccess) {
        onScanSuccess(data);
        navigation.goBack();
      } else {
        // 기본 처리 (실제 구현 필요)
        Alert.alert(
          'WalletConnect',
          '해당 dApp에 연결하시겠습니까?',
          [
            {
              text: '취소',
              onPress: () => {
                setScanning(true);
              },
              style: 'cancel',
            },
            {
              text: '연결',
              onPress: () => {
                // 실제 구현: WalletConnect 연결 처리
                console.log('WalletConnect URI:', data);
                navigation.goBack();
              },
            },
          ]
        );
      }
    } else {
      // 유효하지 않은 WalletConnect URI인 경우 알림 표시
      Alert.alert(
        '유효하지 않은 QR 코드',
        'WalletConnect QR 코드가 아닙니다.',
        [
          {
            text: '다시 시도',
            onPress: () => setScanning(true),
          },
          {
            text: '취소',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    }
  };
  
  // 모든 유형의 QR 코드 스캔 처리
  const handleAnyScan = (data: string) => {
    // 데이터 유형 확인
    if (data.startsWith('ethereum:') || /^(0x)?[0-9a-fA-F]{40}$/.test(data)) {
      // 이더리움 형식 주소
      handleAddressScan(data.replace('ethereum:', ''));
    } else if (data.startsWith('wc:')) {
      // WalletConnect URI
      handleWalletConnectScan(data);
    } else if (data.startsWith('http://') || data.startsWith('https://')) {
      // URL
      Alert.alert(
        'URL 감지됨',
        '이 URL을 브라우저에서 열까요?',
        [
          {
            text: '취소',
            onPress: () => setScanning(true),
            style: 'cancel',
          },
          {
            text: '열기',
            onPress: () => {
              // 실제 구현: 내장 브라우저에서 URL 열기
              // navigation.navigate('DAppBrowser', { url: data });
              // 개발 중이므로 콘솔 출력으로 대체
              console.log('URL:', data);
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      // 기타 유형의 데이터
      Alert.alert(
        'QR 코드 스캔됨',
        `스캔된 데이터: ${data}`,
        [
          {
            text: '다시 스캔',
            onPress: () => setScanning(true),
          },
          {
            text: '닫기',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    }
  };
  
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <QRCodeScanner
        visible={true}
        onClose={() => navigation.goBack()}
        onScan={handleScan}
        title={
          mode === 'address'
            ? '주소 스캔'
            : mode === 'wc'
            ? 'WalletConnect 스캔'
            : 'QR 코드 스캔'
        }
        description={
          mode === 'address'
            ? '암호화폐 주소 QR 코드를 스캔하세요'
            : mode === 'wc'
            ? 'WalletConnect QR 코드를 스캔하세요'
            : 'QR 코드를 스캔 영역 안에 위치시키면 자동으로 인식됩니다'
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default QRCodeScanScreen;
