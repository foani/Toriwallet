import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import { createAppWindow } from './appWindow';
import { registerIpcHandlers } from './ipcHandlers';
import { setupMenu } from './menu';
import { setupAutoUpdater } from './autoUpdater';

// 단일 인스턴스 강제
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  // 다른 인스턴스가 실행되었을 때, 기존 창을 활성화합니다.
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // 앱이 준비되었을 때 실행되는 코드
  app.on('ready', async () => {
    // 메인 윈도우 생성
    const mainWindow = createAppWindow();
    
    // 메뉴 설정
    setupMenu(mainWindow);
    
    // IPC 핸들러 등록
    registerIpcHandlers(mainWindow);
    
    // 자동 업데이트 설정 (배포 환경에서만)
    if (app.isPackaged) {
      setupAutoUpdater(mainWindow);
    }
  });

  // 모든 창이 닫혔을 때 앱을 종료합니다.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // macOS에서는 창이 모두 닫혀도 앱이 종료되지 않습니다.
    // Dock 아이콘 클릭 시 새 창을 생성합니다.
    if (BrowserWindow.getAllWindows().length === 0) {
      createAppWindow();
    }
  });

  // Electron 보안 경고 비활성화 (개발 환경에서만)
  if (!app.isPackaged) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
  }

  // 외부 링크는 기본 브라우저에서 열리도록 설정
  app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      // 앱 내부 URL이 아니면 기본 브라우저로 열기
      if (parsedUrl.origin !== 'app://') {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    });

    contents.setWindowOpenHandler(({ url }) => {
      // 외부 링크를 기본 브라우저로 열기
      shell.openExternal(url);
      return { action: 'deny' };
    });
  });
}
