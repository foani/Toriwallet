import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ViewStyle,
  TextStyle,
} from 'react-native';
import QRCode from 'react-native-qrcode-generator';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/useTheme';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
  label?: string;
  subLabel?: string;
  showShareButton?: boolean;
  showCopyButton?: boolean;
  onCopy?: () => void;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  subLabelStyle?: TextStyle;
}

/**
 * QR 코드 생성 컴포넌트
 * 
 * 지정된 값에 대한 QR 코드를 생성하여 표시하는 컴포넌트입니다.
 * 
 * @param value QR 코드로 인코딩할 문자열 (주소, URL 등)
 * @param size QR 코드 크기 (픽셀)
 * @param backgroundColor QR 코드 배경색
 * @param color QR 코드 색상
 * @param label QR 코드 상단 라벨
 * @param subLabel QR 코드 하단 서브 라벨
 * @param showShareButton 공유 버튼 표시 여부
 * @param showCopyButton 복사 버튼 표시 여부
 * @param onCopy 복사 버튼 클릭 이벤트 핸들러
 * @param containerStyle 컨테이너 추가 스타일 (ViewStyle)
 * @param labelStyle 라벨 추가 스타일 (TextStyle)
 * @param subLabelStyle 서브 라벨 추가 스타일 (TextStyle)
 */
const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
  backgroundColor,
  color,
  label,
  subLabel,
  showShareButton = true,
  showCopyButton = true,
  onCopy,
  containerStyle,
  labelStyle,
  subLabelStyle,
}) => {
  const { theme } = useTheme();
  
  // QR 코드 공유
  const handleShare = async () => {
    try {
      await Share.share({
        message: value,
      });
    } catch (error) {
      console.error('Error sharing QR code value:', error);
    }
  };
  
  return (
    <View
      style={[
        styles.container,
        { padding: theme.spacing.md },
        containerStyle,
      ]}
    >
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.md,
              fontFamily: theme.typography.fontFamily.medium,
              marginBottom: theme.spacing.md,
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
      
      <View
        style={[
          styles.qrContainer,
          {
            backgroundColor: backgroundColor || theme.colors.background,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            ...theme.shadows.sm,
          },
        ]}
      >
        <QRCode
          value={value}
          size={size}
          bgColor={backgroundColor || theme.colors.white}
          fgColor={color || theme.colors.black}
        />
      </View>
      
      {subLabel && (
        <Text
          style={[
            styles.subLabel,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.sm,
              fontFamily: theme.typography.fontFamily.regular,
              marginTop: theme.spacing.md,
            },
            subLabelStyle,
          ]}
        >
          {subLabel}
        </Text>
      )}
      
      {(showShareButton || showCopyButton) && (
        <View style={styles.buttonContainer}>
          {showCopyButton && onCopy && (
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.sm,
                  padding: theme.spacing.sm,
                  marginRight: showShareButton ? theme.spacing.sm : 0,
                },
              ]}
              onPress={onCopy}
            >
              <Icon
                name="copy-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: theme.colors.primary,
                    fontSize: theme.typography.fontSize.sm,
                    fontFamily: theme.typography.fontFamily.medium,
                    marginLeft: 4,
                  },
                ]}
              >
                복사
              </Text>
            </TouchableOpacity>
          )}
          
          {showShareButton && (
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.sm,
                  padding: theme.spacing.sm,
                },
              ]}
              onPress={handleShare}
            >
              <Icon
                name="share-social-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: theme.colors.primary,
                    fontSize: theme.typography.fontSize.sm,
                    fontFamily: theme.typography.fontFamily.medium,
                    marginLeft: 4,
                  },
                ]}
              >
                공유
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subLabel: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  buttonText: {},
});

export default QRCodeGenerator;
