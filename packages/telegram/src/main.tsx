import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import telegramWebApp from './telegram-api/webApp';

// 색상 테마 확인 (다크 모드 여부)
const isDarkMode = telegramWebApp.isDarkMode();

// 앱 렌더링
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App isDarkMode={isDarkMode} />
    </BrowserRouter>
  </React.StrictMode>,
);

// WebApp이 로드되었음을 알림
if (telegramWebApp.isWebAppAvailable()) {
  telegramWebApp.ready();
}
