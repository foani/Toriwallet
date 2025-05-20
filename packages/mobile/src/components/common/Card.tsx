import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  rounded?: boolean;
  border?: boolean;
  noPadding?: boolean;
}

/**
 * 카드 컴포넌트
 * 
 * 앱 전체에서 사용되는 일관된 디자인의 카드 컴포넌트입니다.
 * 컨텐츠를 시각적으로 그룹화하고 강조하는 데 사용됩니다.
 * 
 * @param children 카드 내부에 렌더링될 컴포넌트
 * @param onPress 클릭 이벤트 핸들러 (제공되면 터치 가능한 카드가 됨)
 * @param style 추가 스타일 (ViewStyle)
 * @param elevated 그림자 효과 적용 여부
 * @param rounded 둥근 모서리 적용 여부
 * @param border 테두리 적용 여부
 * @param noPadding 패딩 제거 여부
 */
const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  elevated = true,
  rounded = true,
  border = false,
  noPadding = false,
}) => {
  const { theme } = useTheme();
  
  const cardStyles = [
    styles.card,
    {
      backgroundColor: theme.colors.card,
      padding: noPadding ? 0 : theme.spacing.md,
      borderRadius: rounded ? theme.borderRadius.md : 0,
      ...(border ? { borderWidth: 1, borderColor: theme.colors.border } : {}),
      ...(elevated ? theme.shadows.sm : {}),
    },
    style,
  ];
  
  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginVertical: 8,
  },
});

export default Card;
