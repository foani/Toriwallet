import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/useTheme';

// QR 코드 인식 결과 타입 정의
export type QRScanResult = {
  type: string;
  data: string;
};

interface QRCodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (result: QRScanResult) => void;
  title?: string;
  description?: string;
  cameraType?: 'front' | 'back';
  scanInterval?: number;
}

/**
 * QR 코드 스캐너 컴포넌트
 * 
 * 카메라를 사용하여 QR 코드를 스캔하는 모달 컴포넌트입니다.
 * 
 * @param visible 모달 표시 여부
 * @param onClose 닫기 버튼 클릭 이벤트 핸들러
 * @param onScan QR 코드 인식 성공 시 콜백 함수
 * @param title 스캐너 상단 제목
 * @param description 스캐너 하단 설명 텍스트
 * @param cameraType 카메라 유형 ('front' | 'back')
 * @param scanInterval 스캔 간격 (ms)
 */
const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  visible,
  onClose,
  onScan,
  title = 'QR 코드 스캔',
  description = 'QR 코드를 스캔 영역 안에 위치시키면 자동으로 인식됩니다.',
  cameraType = 'back',
  scanInterval = 2000,
}) => {
  const { theme } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastScanTime, setLastScanTime] = useState(0);
  
  const { width } = Dimensions.get('window');
  const frameSize = width * 0.7;
  
  // 카메라 권한 요청
  useEffect(() => {
    if (!visible) return;
    
    const checkPermission = async () => {
      try {
        const permission = Platform.select({
          ios: PERMISSIONS.IOS.CAMERA,
          android: PERMISSIONS.ANDROID.CAMERA,
          default: PERMISSIONS.ANDROID.CAMERA,
        });
        
        const result = await request(permission);
        
        if (result === RESULTS.GRANTED) {
          setHasPermission(true);
        } else {
          setHasPermission(false);
          Alert.alert(
            '카메라 권한 필요',
            'QR 코드 스캔을 위해 카메라 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
            [{ text: '확인' }]
          );
        }
      } catch (error) {
        console.error('Failed to check camera permission:', error);
        setHasPermission(false);
      }
    };
    
    checkPermission();
  }, [visible]);
  
  // QR 코드 인식 처리
  const handleBarCodeRead = ({ type, data }: QRScanResult) => {
    const now = Date.now();
    
    // 연속 스캔 방지 (스캔 간격 적용)
    if (now - lastScanTime < scanInterval) {
      return;
    }
    
    setLastScanTime(now);
    
    // 콜백 호출
    onScan({ type, data });
  };
  
  if (!visible) {
    return null;
  }
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Icon
              name="close-outline"
              size={28}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.lg,
                fontFamily: theme.typography.fontFamily.bold,
              },
            ]}
          >
            {title}
          </Text>
          
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.cameraContainer}>
          {hasPermission ? (
            <RNCamera
              style={styles.camera}
              type={
                cameraType === 'front'
                  ? RNCamera.Constants.Type.front
                  : RNCamera.Constants.Type.back
              }
              captureAudio={false}
              androidCameraPermissionOptions={{
                title: '카메라 권한 필요',
                message: 'QR 코드 스캔을 위해 카메라 접근 권한이 필요합니다',
                buttonPositive: '확인',
                buttonNegative: '취소',
              }}
              onBarCodeRead={handleBarCodeRead}
            >
              <View style={styles.overlay}>
                <View style={styles.unfocusedContainer}></View>
                
                <View style={styles.middleContainer}>
                  <View style={styles.unfocusedContainer}></View>
                  <View
                    style={[
                      styles.focusedContainer,
                      {
                        width: frameSize,
                        height: frameSize,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.corner,
                        styles.cornerTopLeft,
                        { borderColor: theme.colors.primary },
                      ]}
                    />
                    <View
                      style={[
                        styles.corner,
                        styles.cornerTopRight,
                        { borderColor: theme.colors.primary },
                      ]}
                    />
                    <View
                      style={[
                        styles.corner,
                        styles.cornerBottomLeft,
                        { borderColor: theme.colors.primary },
                      ]}
                    />
                    <View
                      style={[
                        styles.corner,
                        styles.cornerBottomRight,
                        { borderColor: theme.colors.primary },
                      ]}
                    />
                  </View>
                  <View style={styles.unfocusedContainer}></View>
                </View>
                
                <View style={styles.unfocusedContainer}></View>
              </View>
            </RNCamera>
          ) : (
            <View
              style={[
                styles.noCameraContainer,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Icon
                name="camera-off-outline"
                size={60}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.noCameraText,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.md,
                    fontFamily: theme.typography.fontFamily.medium,
                    marginTop: theme.spacing.md,
                  },
                ]}
              >
                카메라를 사용할 수 없습니다
              </Text>
              <Text
                style={[
                  styles.noCameraSubText,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.sm,
                    fontFamily: theme.typography.fontFamily.regular,
                    marginTop: theme.spacing.sm,
                  },
                ]}
              >
                카메라 접근 권한을 확인해주세요
              </Text>
            </View>
          )}
        </View>
        
        <View
          style={[
            styles.footer,
            { padding: theme.spacing.lg },
          ]}
        >
          <Text
            style={[
              styles.description,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.md,
                fontFamily: theme.typography.fontFamily.regular,
                textAlign: 'center',
              },
            ]}
          >
            {description}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  placeholder: {
    width: 44,
  },
  title: {
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  unfocusedContainer: {
    flex: 1,
  },
  middleContainer: {
    flexDirection: 'row',
  },
  focusedContainer: {
    borderWidth: 2,
  },
  corner: {
    position: 'absolute',
    borderWidth: 3,
    width: 20,
    height: 20,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  noCameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noCameraText: {
    textAlign: 'center',
  },
  noCameraSubText: {
    textAlign: 'center',
  },
  footer: {},
  description: {},
});

export default QRCodeScanner;
