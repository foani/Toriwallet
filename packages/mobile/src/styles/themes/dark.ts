/**
 * 다크 테마 정의
 * 
 * 앱 전체에서 사용되는 다크 모드 테마의 색상, 폰트, 스페이싱 등 디자인 토큰을 정의합니다.
 * light.ts의 구조를 따르되 색상만 다크 모드에 맞게 변경합니다.
 */
const darkTheme = {
  // 색상
  colors: {
    // 기본 색상
    primary: '#9D65FF', // 주 브랜드 색상 (보라색 - 다크 모드에서 더 밝게)
    secondary: '#7C53D9', // 보조 브랜드 색상
    accent: '#FF7D7D', // 강조 색상
    
    // 배경 색상
    background: '#121212', // 기본 배경
    surface: '#1E1E1E', // 표면 배경
    card: '#2C2C2C', // 카드 배경
    modal: '#2C2C2C', // 모달 배경
    
    // 텍스트 색상
    text: '#FFFFFF', // 기본 텍스트
    textSecondary: '#AAAAAA', // 보조 텍스트
    textDisabled: '#666666', // 비활성화된 텍스트
    
    // 경계선 색상
    border: '#333333', // 기본 경계선
    divider: '#444444', // 구분선
    
    // 상태 색상
    success: '#66BB6A', // 성공
    warning: '#FFCA28', // 경고
    error: '#EF5350', // 오류
    info: '#42A5F5', // 정보
    
    // 버튼 색상
    buttonPrimary: '#9D65FF', // 주요 버튼
    buttonSecondary: '#444444', // 보조 버튼
    buttonDisabled: '#555555', // 비활성화된 버튼
    
    // 암호화폐 관련 색상
    positive: '#66BB6A', // 양수/상승 (녹색)
    negative: '#EF5350', // 음수/하락 (빨간색)
    
    // 기타 정의된 색상
    white: '#FFFFFF',
    black: '#000000',
    gray100: '#212529',
    gray200: '#343A40',
    gray300: '#495057',
    gray400: '#6C757D',
    gray500: '#ADB5BD',
    gray600: '#CED4DA',
    gray700: '#DEE2E6',
    gray800: '#E9ECEF',
    gray900: '#F8F9FA',
  },
  
  // 타이포그래피 (라이트 테마와 동일)
  typography: {
    // 폰트 패밀리
    fontFamily: {
      regular: 'System',
      medium: 'System-Medium',
      bold: 'System-Bold',
    },
    
    // 폰트 크기
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    
    // 폰트 두께
    fontWeight: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
    
    // 라인 높이
    lineHeight: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      xxl: 36,
      xxxl: 40,
    },
  },
  
  // 스페이싱 (라이트 테마와 동일)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // 그림자 (다크 테마에서는 더 강한 대비를 위해 조정)
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  
  // 둥근 모서리 (라이트 테마와 동일)
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    round: 9999,
  },
  
  // 애니메이션 (라이트 테마와 동일)
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // UI 요소별 스타일 (라이트 테마와 동일)
  components: {
    // 버튼 스타일
    button: {
      height: 48,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    
    // 입력 필드 스타일
    input: {
      height: 48,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
    },
    
    // 카드 스타일
    card: {
      padding: 16,
      borderRadius: 12,
    },
    
    // 헤더 스타일
    header: {
      height: 56,
    },
    
    // 탭바 스타일
    tabBar: {
      height: 60,
    },
  },
};

export default darkTheme;
