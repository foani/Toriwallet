import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

/**
 * 스플래시 화면
 * 
 * 앱 실행 시 처음 표시되는 화면입니다.
 * 앱 로고와 로딩 애니메이션을 표시하고, 초기화 과정이 완료되면 다음 화면으로 이동합니다.
 */
const SplashScreen: React.FC = () => {
  const { theme } = useTheme();
  
  // 애니메이션 값
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);
  const spinValue = new Animated.Value(0);
  
  // 스핀 애니메이션 보간
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  // 애니메이션 시작
  useEffect(() => {
    // 페이드 인 + 스케일 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
    
    // 무한 스핀 애니메이션
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, [fadeAnim, scaleAnim, spinValue]);
  
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <StatusBar
        barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* 실제 구현에서는 앱 로고 이미지를 사용 */}
        <View
          style={[
            styles.logo,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.borderRadius.round,
            },
          ]}
        >
          <Text
            style={[
              styles.logoText,
              {
                color: theme.colors.white,
                fontSize: 40,
                fontFamily: theme.typography.fontFamily.bold,
              },
            ]}
          >
            T
          </Text>
        </View>
        
        <Text
          style={[
            styles.appName,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.xxl,
              fontFamily: theme.typography.fontFamily.bold,
              marginTop: theme.spacing.lg,
            },
          ]}
        >
          TORI Wallet
        </Text>
      </Animated.View>
      
      <Animated.View
        style={[
          styles.loaderContainer,
          {
            opacity: fadeAnim,
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <View
          style={[
            styles.loader,
            {
              borderColor: theme.colors.primary,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    textAlign: 'center',
  },
  appName: {
    textAlign: 'center',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 100,
  },
  loader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderTopColor: 'transparent',
  },
});

export default SplashScreen;
