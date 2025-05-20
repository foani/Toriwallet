import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Modal,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface LoadingProps {
  loading?: boolean;
  message?: string;
  overlay?: boolean;
  size?: 'small' | 'large';
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * 로딩 인디케이터 컴포넌트
 * 
 * 앱 전체에서 사용되는 일관된 디자인의 로딩 인디케이터 컴포넌트입니다.
 * 일반 로딩 상태와 오버레이 모달 형태를 지원합니다.
 * 
 * @param loading 로딩 상태 여부
 * @param message 로딩 중 표시될 메시지
 * @param overlay 전체 화면 오버레이 적용 여부
 * @param size 로딩 인디케이터 크기 ('small', 'large')
 * @param containerStyle 컨테이너 추가 스타일 (ViewStyle)
 * @param textStyle 메시지 추가 스타일 (TextStyle)
 */
const Loading: React.FC<LoadingProps> = ({
  loading = true,
  message,
  overlay = false,
  size = 'large',
  containerStyle,
  textStyle,
}) => {
  const { theme } = useTheme();
  
  if (!loading) {
    return null;
  }
  
  const containerStyles = [
    styles.container,
    {
      backgroundColor: overlay ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
    },
    containerStyle,
  ];
  
  const loaderContainerStyles = [
    styles.loaderContainer,
    {
      backgroundColor: overlay ? theme.colors.background : 'transparent',
      borderRadius: overlay ? theme.borderRadius.md : 0,
      padding: overlay ? theme.spacing.lg : 0,
      ...theme.shadows.md,
    },
  ];
  
  const textStyles = [
    styles.text,
    {
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.medium,
      marginTop: theme.spacing.sm,
    },
    textStyle,
  ];
  
  const loadingContent = (
    <View style={loaderContainerStyles}>
      <ActivityIndicator
        size={size}
        color={theme.colors.primary}
        animating={loading}
      />
      {message && <Text style={textStyles}>{message}</Text>}
    </View>
  );
  
  if (overlay) {
    return (
      <Modal
        transparent
        animationType="fade"
        visible={loading}
        statusBarTranslucent
      >
        <View style={containerStyles}>{loadingContent}</View>
      </Modal>
    );
  }
  
  return <View style={containerStyles}>{loadingContent}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
});

export default Loading;
