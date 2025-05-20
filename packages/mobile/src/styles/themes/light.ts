/**
 * 라이트 테마 정의
 * 
 * 앱 전체에서 사용되는 라이트 모드 테마의 색상, 폰트, 스페이싱 등 디자인 토큰을 정의합니다.
 */
const lightTheme = {
  // 색상
  colors: {
    // 기본 색상
    primary: '#7D44F0', // 주 브랜드 색상 (보라색)
    secondary: '#5F37B6', // 보조 브랜드 색상
    accent: '#F96D6D', // 강조 색상
    
    // 배경 색상
    background: '#FFFFFF', // 기본 배경
    surface: '#F8F9FA', // 표면 배경
    card: '#FFFFFF', // 카드 배경
    modal: '#FFFFFF', // 모달 배경
    
    // 텍스트 색상
    text: '#1A1A1A', // 기본 텍스트
    textSecondary: '#666666', // 보조 텍스트
    textDisabled: '#AAAAAA', // 비활성화된 텍스트
    
    // 경계선 색상
    border: '#EEEEEE', // 기본 경계선
    divider: '#F0F0F0', // 구분선
    
    // 상태 색상
    success: '#4CAF50', // 성공
    warning: '#FFC107', // 경고
    error: '#F44336', // 오류
    info: '#2196F3', // 정보
    
    // 버튼 색상
    buttonPrimary: '#7D44F0', // 주요 버튼
    buttonSecondary: '#EFEFEF', // 보조 버튼
    buttonDisabled: '#CCCCCC', // 비활성화된 버튼
    
    // 암호화폐 관련 색상
    positive: '#4CAF50', // 양수/상승 (녹색)
    negative: '#F44336', // 음수/하락 (빨간색)
    
    // 기타 정의된 색상
    white: '#FFFFFF',
    black: '#000000',
    gray100: '#F8F9FA',
    gray200: '#E9ECEF',
    gray300: '#DEE2E6',
    gray400: '#CED4DA',
    gray500: '#ADB5BD',
    gray600: '#6C757D',
    gray700: '#495057',
    gray800: '#343A40',
    gray900: '#212529',
  },
  
  // 타이포그래피
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
  
  // 스페이싱
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // 그림자
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
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  
  // 둥근 모서리
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    round: 9999,
  },
  
  // 애니메이션
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  // UI 요소별 스타일
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

export default lightTheme;
