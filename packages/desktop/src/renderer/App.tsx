import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { lightTheme, darkTheme } from '../../core/src/themes';

// 컴포넌트 임포트
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Home';
import Wallet from './pages/Wallet';
import Staking from './pages/Staking';
import NFT from './pages/NFT';
import Settings from './pages/Settings';

// 글로벌 스타일
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    transition: all 0.3s ease;
  }
  
  button, input, select, textarea {
    font-family: inherit;
  }
`;

// 앱 컨테이너 스타일
const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

// 메인 콘텐츠 영역 스타일
const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

// 타이틀바 스타일 (macOS와 같은 윈도우 컨트롤 스타일)
const TitleBar = styled.div`
  height: 38px;
  background-color: ${props => props.theme.titleBar};
  display: flex;
  justify-content: space-between;
  align-items: center;
  -webkit-app-region: drag;
  position: relative;
  z-index: 100;
`;

const WindowControls = styled.div`
  display: flex;
  -webkit-app-region: no-drag;
  margin-right: 10px;
`;

const ControlButton = styled.button`
  border: none;
  background: none;
  color: ${props => props.theme.text};
  font-size: 18px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 8px;
  
  &:hover {
    background-color: ${props => props.theme.buttonHover};
  }
`;

// 앱 컴포넌트
const App: React.FC = () => {
  const [theme, setTheme] = useState(lightTheme);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  // 앱 초기화
  useEffect(() => {
    // 테마 설정 불러오기 (예시)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setTheme(darkTheme);
    }

    // 메뉴 이벤트 리스너 설정
    const unsubscribe = window.electronEvents.on('menu:navigate', (path) => {
      navigate(path);
    });

    // 초기화 완료
    setIsInitialized(true);

    // 클린업
    return () => {
      unsubscribe();
    };
  }, [navigate]);

  // 테마 토글 핸들러
  const toggleTheme = () => {
    const newTheme = theme === lightTheme ? darkTheme : lightTheme;
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme === darkTheme ? 'dark' : 'light');
  };

  // 윈도우 컨트롤 핸들러
  const handleMinimize = () => {
    window.electronWindow.minimize();
  };

  const handleMaximize = () => {
    window.electronWindow.maximize();
  };

  const handleClose = () => {
    window.electronWindow.close();
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <TitleBar>
        <div style={{ marginLeft: '12px' }}>TORI 지갑</div>
        <WindowControls>
          <ControlButton onClick={handleMinimize} title="최소화">
            &#8722;
          </ControlButton>
          <ControlButton onClick={handleMaximize} title="최대화">
            &#9744;
          </ControlButton>
          <ControlButton onClick={handleClose} title="닫기">
            &#10005;
          </ControlButton>
        </WindowControls>
      </TitleBar>
      <AppContainer>
        <Sidebar />
        <MainContent>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/wallet/*" element={<Wallet />} />
            <Route path="/staking/*" element={<Staking />} />
            <Route path="/nft/*" element={<NFT />} />
            <Route path="/settings/*" element={<Settings />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
