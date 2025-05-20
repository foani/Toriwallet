import { BrowserWindow, screen, app } from 'electron';
import * as path from 'path';

/**
 * 앱 창 생성 함수
 * 메인 애플리케이션 창을 생성하고 설정합니다.
 */
export function createAppWindow(): BrowserWindow {
  // 화면 크기 가져오기
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  // 기본 창 크기 (화면의 80% 정도)
  const windowWidth = Math.min(1280, Math.floor(width * 0.8));
  const windowHeight = Math.min(800, Math.floor(height * 0.8));
  
  // BrowserWindow 생성
  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 800,
    minHeight: 600,
    show: false, // 준비될 때까지 숨김
    icon: path.join(app.getAppPath(), 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY, // 전역 변수로 Webpack에 의해 설정됨
      sandbox: true,
      spellcheck: true,
      devTools: !app.isPackaged || process.env.NODE_ENV === 'development',
    },
    backgroundColor: '#f5f5f5', // 로딩 중 배경색
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  });

  // 메인 창의 HTML 로드
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY); // 전역 변수로 Webpack에 의해 설정됨

  // 창이 준비되면 보여주기
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 개발 중일 때 DevTools 자동 열기
  if (!app.isPackaged || process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // 창 닫기 이벤트 처리
  mainWindow.on('close', (event) => {
    // 여기에 저장되지 않은 변경사항 확인 등의 로직 추가 가능
  });

  return mainWindow;
}
