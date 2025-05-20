import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress: () => void;
}

/**
 * 버튼 컴포넌트
 * 
 * 앱 전체에서 사용되는 일관된 디자인의 버튼 컴포넌트입니다.
 * 다양한 변형과 크기를 지원하며 커스터마이징이 가능합니다.
 * 
 * @param title 버튼에 표시될 텍스트
 * @param variant 버튼 스타일 변형 ('primary', 'secondary', 'outline', 'text', 'danger')
 * @param size 버튼 크기 ('small', 'medium', 'large')
 * @param icon 버튼에 표시될 아이콘 컴포넌트
 * @param iconPosition 아이콘 위치 ('left', 'right')
 * @param loading 로딩 상태 여부
 * @param disabled 비활성화 여부
 * @param fullWidth 전체 너비 사용 여부
 * @param style 추가 스타일 (ViewStyle)
 * @param textStyle 텍스트 추가 스타일 (TextStyle)
 * @param onPress 클릭 이벤트 핸들러
 */
const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  onPress,
  ...rest
}) => {
  const { theme } = useTheme();
  
  // 버튼 배경색 결정
  const getBackgroundColor = () => {
    if (disabled) {
      return theme.colors.buttonDisabled;
    }
    
    switch (variant) {
      case 'primary':
        return theme.colors.buttonPrimary;
      case 'secondary':
        return theme.colors.buttonSecondary;
      case 'outline':
      case 'text':
        return 'transparent';
      case 'danger':
        return theme.colors.error;
      default:
        return theme.colors.buttonPrimary;
    }
  };
  
  // 버튼 텍스트 색상 결정
  const getTextColor = () => {
    if (disabled) {
      return theme.colors.textDisabled;
    }
    
    switch (variant) {
      case 'primary':
        return theme.colors.white;
      case 'secondary':
        return theme.colors.text;
      case 'outline':
        return theme.colors.primary;
      case 'text':
        return theme.colors.primary;
      case 'danger':
        return theme.colors.white;
      default:
        return theme.colors.white;
    }
  };
  
  // 버튼 테두리 스타일 결정
  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1,
        borderColor: disabled ? theme.colors.buttonDisabled : theme.colors.primary,
      };
    }
    return {};
  };
  
  // 버튼 크기에 따른 패딩 결정
  const getPadding = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
        };
      case 'medium':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.xl,
        };
      default:
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
        };
    }
  };
  
  // 버튼 크기에 따른 텍스트 크기 결정
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return theme.typography.fontSize.sm;
      case 'medium':
        return theme.typography.fontSize.md;
      case 'large':
        return theme.typography.fontSize.lg;
      default:
        return theme.typography.fontSize.md;
    }
  };
  
  // 로딩 인디케이터 색상 결정
  const getLoadingColor = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return theme.colors.white;
      case 'secondary':
        return theme.colors.text;
      case 'outline':
      case 'text':
        return theme.colors.primary;
      default:
        return theme.colors.white;
    }
  };
  
  const buttonStyles = [
    styles.button,
    {
      backgroundColor: getBackgroundColor(),
      ...getPadding(),
      ...getBorderStyle(),
      borderRadius: theme.borderRadius.md,
      width: fullWidth ? '100%' : undefined,
    },
    style,
  ];
  
  const textStyles = [
    styles.text,
    {
      color: getTextColor(),
      fontSize: getTextSize(),
      fontFamily: theme.typography.fontFamily.medium,
    },
    textStyle,
  ];
  
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getLoadingColor()} />;
    }
    
    if (!icon) {
      return <Text style={textStyles}>{title}</Text>;
    }
    
    if (iconPosition === 'left') {
      return (
        <>
          {icon}
          <Text style={[textStyles, styles.textWithLeftIcon]}>{title}</Text>
        </>
      );
    } else {
      return (
        <>
          <Text style={[textStyles, styles.textWithRightIcon]}>{title}</Text>
          {icon}
        </>
      );
    }
  };
  
  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  textWithLeftIcon: {
    marginLeft: 8,
  },
  textWithRightIcon: {
    marginRight: 8,
  },
});

export default Button;
