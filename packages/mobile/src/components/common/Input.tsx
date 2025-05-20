import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  helper?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secure?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  helperStyle?: TextStyle;
  errorStyle?: TextStyle;
}

/**
 * 입력 필드 컴포넌트
 * 
 * 앱 전체에서 사용되는 일관된 디자인의 입력 필드 컴포넌트입니다.
 * 라벨, 도움말 텍스트, 오류 메시지, 아이콘 등 다양한 옵션을 지원합니다.
 * 
 * @param label 입력 필드 위에 표시될 라벨
 * @param helper 입력 필드 아래에 표시될 도움말 텍스트
 * @param error 입력 필드 아래에 표시될 오류 메시지
 * @param leftIcon 입력 필드 왼쪽에 표시될 아이콘
 * @param rightIcon 입력 필드 오른쪽에 표시될 아이콘
 * @param secure 비밀번호 입력 필드 여부 (보기/가리기 토글 버튼 추가)
 * @param containerStyle 컨테이너 추가 스타일 (ViewStyle)
 * @param labelStyle 라벨 추가 스타일 (TextStyle)
 * @param inputStyle 입력 필드 추가 스타일 (TextStyle)
 * @param helperStyle 도움말 텍스트 추가 스타일 (TextStyle)
 * @param errorStyle 오류 메시지 추가 스타일 (TextStyle)
 */
const Input: React.FC<InputProps> = ({
  label,
  helper,
  error,
  leftIcon,
  rightIcon,
  secure = false,
  containerStyle,
  labelStyle,
  inputStyle,
  helperStyle,
  errorStyle,
  ...rest
}) => {
  const { theme } = useTheme();
  const [secureTextEntry, setSecureTextEntry] = useState(secure);
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = () => {
    setIsFocused(true);
    if (rest.onFocus) {
      rest.onFocus(undefined as any);
    }
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    if (rest.onBlur) {
      rest.onBlur(undefined as any);
    }
  };
  
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };
  
  // 테두리 색상 결정
  const getBorderColor = () => {
    if (error) {
      return theme.colors.error;
    }
    if (isFocused) {
      return theme.colors.primary;
    }
    return theme.colors.border;
  };
  
  const containerStyles = [
    styles.container,
    containerStyle,
  ];
  
  const labelStyles = [
    styles.label,
    {
      color: error ? theme.colors.error : theme.colors.text,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      marginBottom: theme.spacing.xs,
    },
    labelStyle,
  ];
  
  const inputContainerStyles = [
    styles.inputContainer,
    {
      borderColor: getBorderColor(),
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.sm,
    },
    error ? styles.inputError : null,
  ];
  
  const inputStyles = [
    styles.input,
    {
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
    },
    inputStyle,
  ];
  
  const helperStyles = [
    styles.helper,
    {
      color: error ? theme.colors.error : theme.colors.textSecondary,
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.regular,
      marginTop: theme.spacing.xs,
    },
    error ? errorStyle : helperStyle,
  ];
  
  const renderSecureTextToggle = () => {
    if (!secure) return null;
    
    return (
      <TouchableOpacity onPress={toggleSecureEntry} style={styles.secureToggle}>
        <Icon
          name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={containerStyles}>
      {label && <Text style={labelStyles}>{label}</Text>}
      
      <View style={inputContainerStyles}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[
            inputStyles,
            leftIcon ? styles.inputWithLeftIcon : null,
            (rightIcon || secure) ? styles.inputWithRightIcon : null,
          ]}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        {renderSecureTextToggle()}
      </View>
      
      {(helper || error) && (
        <Text style={helperStyles}>
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 0,
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    marginRight: 8,
  },
  inputError: {},
  leftIcon: {
    marginRight: 4,
  },
  rightIcon: {
    marginLeft: 4,
  },
  secureToggle: {
    padding: 4,
  },
  helper: {
    marginTop: 4,
  },
});

export default Input;
