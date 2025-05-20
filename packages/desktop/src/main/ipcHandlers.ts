import { BrowserWindow, ipcMain, dialog, shell, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

/**
 * IPC(Inter-Process Communication) 핸들러 등록
 * 메인 프로세스와 렌더러 프로세스 간의 통신을 처리합니다.
 */
export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  // 창 관리 관련 핸들러
  ipcMain.handle('window:minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
    return mainWindow.isMaximized();
  });

  ipcMain.handle('window:close', () => {
    mainWindow.close();
  });

  // 앱 정보 관련 핸들러
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  ipcMain.handle('app:getPath', (event, name) => {
    return app.getPath(name as any);
  });

  // 파일 시스템 관련 핸들러
  ipcMain.handle('dialog:openFile', async (event, options) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, options);
    if (canceled) {
      return null;
    } else {
      return filePaths[0];
    }
  });

  ipcMain.handle('dialog:saveFile', async (event, options) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, options);
    if (canceled) {
      return null;
    } else {
      return filePath;
    }
  });

  ipcMain.handle('fs:readFile', async (event, filePath, options) => {
    try {
      const content = await fs.promises.readFile(filePath, options);
      return content.toString('utf-8');
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  });

  ipcMain.handle('fs:writeFile', async (event, filePath, data) => {
    try {
      await fs.promises.writeFile(filePath, data);
      return true;
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  });

  // 시스템 관련 핸들러
  ipcMain.handle('shell:openExternal', (event, url) => {
    return shell.openExternal(url);
  });

  ipcMain.handle('shell:openPath', (event, path) => {
    return shell.openPath(path);
  });

  // 클립보드 관련 핸들러는 렌더러 프로세스에서 navigator.clipboard API를 사용하여 처리

  // 지갑 관련 핸들러
  // 이 부분은 추후 지갑 기능 구현할 때 추가
}
