import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/**
 * 팝업 진입점
 * 
 * 리액트 앱을 DOM에 렌더링합니다.
 */
const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found in the document.');
}
