import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { useTelegramConnection } from './services/tg-connection';
import webApp from './telegram-api/webApp';

// 페이지 컴포넌트들 (나중에 구현)
import Home from './pages/Home';
import Send from './pages/Send';
import Receive from './pages/Receive';
import Settings from './pages/Settings';

// 테마 설정
const lightTheme = {
  background: '#F7F9FB',
  cardBackground: '#FFFFFF',
  primary: '#0088CC',
  secondary: '#64B5F6',
  accent: '#4CAF50',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  buttonText: '#FFFFFF',
  shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
};

const darkTheme = {
  background: '#1D293F',
  cardBackground: '#243046',
  primary: '#039BE5',
  secondary: '#64B5F6',
  accent: '#4CAF50',
  text: '#FFFFFF',
  textSecondary: '#B0BEC5',
  border: '#3D4D65',
  success: '#66BB6A',
  warning: '#FFC107',
  error: '#EF5350',
  info: '#42A5F5',
  buttonText: '#FFFFFF',
  shadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
};

// 글로벌 스타일
const GlobalStyle = createGlobalStyle<{ theme: typeof lightTheme }>`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    -webkit-tap-highlight-color: transparent;
  }
  
  body {
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    transition: background-color 0.3s ease, color 0.3s ease;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    font-size: 16px;
    line-height: 1.5;
  }
  
  button {
    cursor: pointer;
  }
  
  a {
    color: ${props => props.theme.primary};
    text-decoration: none;
  }
`;

// 앱 컨테이너
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

// 메인 콘텐츠 영역
const MainContent = styled.main`
  flex: 1;
  padding: 16px;
  padding-bottom: 80px; // 하단 네비게이션 공간 확보
`;

// 하단 네비게이션 바
const BottomNavigation = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: ${props => props.theme.cardBackground};
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

const NavItem = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  color: ${props => (props.active ? props.theme.primary : props.theme.textSecondary)};
  font-size: 12px;
  font-weight: ${props => (props.active ? '500' : '400')};
  transition: color 0.2s ease;
  
  .icon {
    font-size: 24px;
    margin-bottom: 4px;
  }
`;

// 앱 컴포넌트
const App: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const { isConnected, user, wallet } = useTelegramConnection();
  const [theme, setTheme] = useState(isDarkMode ? darkTheme : lightTheme);
  const location = useLocation();
  const navigate = useNavigate();
  
  // 테마 업데이트
  useEffect(() => {
    setTheme(isDarkMode ? darkTheme : lightTheme);
  }, [isDarkMode]);
  
  // 현재 활성 경로 확인
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // 네비게이션 처리
  const handleNavigation = (path: string) => {
    navigate(path);
    
    // 백 버튼 설정
    if (path !== '/') {
      webApp.setupBackButton(() => {
        navigate(-1);
      });
    } else {
      webApp.hideBackButton();
    }
  };
  
  // 초기 로드 시 백 버튼 설정
  useEffect(() => {
    if (location.pathname !== '/') {
      webApp.setupBackButton(() => {
        navigate(-1);
      });
    } else {
      webApp.hideBackButton();
    }
    
    // 경로 변경 시 백 버튼 설정 업데이트
    return () => {
      webApp.hideBackButton();
    };
  }, [location.pathname, navigate]);
  
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <MainContent>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/send" element={<Send />} />
            <Route path="/receive" element={<Receive />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </MainContent>
        
        <BottomNavigation>
          <NavItem 
            active={isActive('/')} 
            onClick={() => handleNavigation('/')}
          >
            <div className="icon">💼</div>
            <span>지갑</span>
          </NavItem>
          <NavItem 
            active={isActive('/send')} 
            onClick={() => handleNavigation('/send')}
          >
            <div className="icon">📤</div>
            <span>보내기</span>
          </NavItem>
          <NavItem 
            active={isActive('/receive')} 
            onClick={() => handleNavigation('/receive')}
          >
            <div className="icon">📥</div>
            <span>받기</span>
          </NavItem>
          <NavItem 
            active={isActive('/settings')} 
            onClick={() => handleNavigation('/settings')}
          >
            <div className="icon">⚙️</div>
            <span>설정</span>
          </NavItem>
        </BottomNavigation>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
