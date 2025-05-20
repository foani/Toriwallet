import { BrowserWindow, autoUpdater, dialog } from 'electron';
import * as os from 'os';

/**
 * 자동 업데이트 관리자 설정
 * Electron의 autoUpdater를 사용해 앱 업데이트를 관리합니다.
 */
export function setupAutoUpdater(mainWindow: BrowserWindow): void {
  // 개발 환경에서는 자동 업데이트를 사용하지 않음
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  // 서버 URL 설정 (실제 배포 시 수정 필요)
  const server = 'https://update.creatachain.com';
  const platform = os.platform();
  const arch = os.arch();
  const version = process.env.npm_package_version;
  const updateURL = `${server}/update/${platform}/${arch}/${version}`;
  
  // 업데이트 서버 설정
  autoUpdater.setFeedURL({ url: updateURL });
  
  // 4시간마다 업데이트 확인
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 4 * 60 * 60 * 1000);
  
  // 시작 시 업데이트 확인
  autoUpdater.checkForUpdates();

  // 업데이트 이벤트 리스너
  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['지금 업데이트', '나중에'],
      title: '업데이트 준비 완료',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: '새 버전이 다운로드되었습니다. 지금 업데이트하시겠습니까?'
    };

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  // 업데이트 오류 처리
  autoUpdater.on('error', (error) => {
    console.error('업데이트 오류:', error);
    // 자동 업데이트에 실패해도 앱 실행에는 영향을 주지 않음
  });

  // 업데이트 상태 이벤트
  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('update-status', { status: 'checking' });
  });

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update-status', { status: 'available' });
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('update-status', { status: 'not-available' });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('update-status', {
      status: 'downloading',
      progress: progressObj
    });
  });
}
