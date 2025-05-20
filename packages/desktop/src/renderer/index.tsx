import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../../core/src/themes';

// 기본 테마 설정 (나중에 사용자 설정에서 가져올 수 있음)
const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const defaultTheme = isDarkMode ? darkTheme : lightTheme;

// 랜더링
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={defaultTheme}>
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
);

// 앱 로드 완료 이벤트 발생
window.dispatchEvent(new Event('app-loaded'));
