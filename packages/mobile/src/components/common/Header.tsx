import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  transparent?: boolean;
}

/**
 * 헤더 컴포넌트
 * 
 * 앱 전체에서 사용되는 일관된 디자인의 헤더 컴포넌트입니다.
 * 화면 제목, 뒤로 가기 버튼, 오른쪽 액션 버튼 등을 지원합니다.
 * 
 * @param title 헤더 제목
 * @param showBackButton 뒤로 가기 버튼 표시 여부
 * @param rightComponent 헤더 오른쪽에 표시될 컴포넌트
 * @param onBackPress 뒤로 가기 버튼 클릭 이벤트 핸들러 (제공되지 않으면 기본 네비게이션 동작 사용)
 * @param containerStyle 컨테이너 추가 스타일 (ViewStyle)
 * @param titleStyle 제목 추가 스타일 (TextStyle)
 * @param transparent 투명 배경 적용 여부
 */
const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  rightComponent,
  onBackPress,
  containerStyle,
  titleStyle,
  transparent = false,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };
  
  const containerStyles = [
    styles.headerContainer,
    {
      backgroundColor: transparent ? 'transparent' : theme.colors.background,
      borderBottomWidth: transparent ? 0 : StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      height: theme.components.header.height,
      paddingHorizontal: theme.spacing.md,
    },
    containerStyle,
  ];
  
  const titleStyles = [
    styles.title,
    {
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
    },
    titleStyle,
  ];
  
  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        { backgroundColor: transparent ? 'transparent' : theme.colors.background },
      ]}
    >
      <StatusBar
        barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={transparent ? 'transparent' : theme.colors.background}
        translucent={transparent}
      />
      <View style={containerStyles}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity
              onPress={handleBackPress}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              style={styles.backButton}
            >
              <Icon
                name="chevron-back"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={titleStyles} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        
        <View style={styles.rightContainer}>
          {rightComponent}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    justifyContent: 'flex-start',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    justifyContent: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
  },
});

export default Header;
