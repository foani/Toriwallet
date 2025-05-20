import { contextBridge, ipcRenderer } from 'electron';
import { exposeAPIToRenderer } from './api';

// API 노출 설정
exposeAPIToRenderer();

// 창 컨트롤 API
contextBridge.exposeInMainWorld('electronWindow', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
});

// 앱 정보 API
contextBridge.exposeInMainWorld('electronApp', {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),
});

// 파일 시스템 API
contextBridge.exposeInMainWorld('electronFS', {
  openFile: (options: Electron.OpenDialogOptions) => ipcRenderer.invoke('dialog:openFile', options),
  saveFile: (options: Electron.SaveDialogOptions) => ipcRenderer.invoke('dialog:saveFile', options),
  readFile: (filePath: string, options?: any) => ipcRenderer.invoke('fs:readFile', filePath, options),
  writeFile: (filePath: string, data: string) => ipcRenderer.invoke('fs:writeFile', filePath, data),
});

// 셸 API
contextBridge.exposeInMainWorld('electronShell', {
  openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  openPath: (path: string) => ipcRenderer.invoke('shell:openPath', path),
});

// 이벤트 리스너 설정
contextBridge.exposeInMainWorld('electronEvents', {
  // 이벤트 구독
  on: (channel: string, callback: (...args: any[]) => void) => {
    // 허용된 채널 목록
    const validChannels = [
      'menu:navigate',
      'menu:create-wallet',
      'menu:import-wallet',
      'menu:backup-wallet',
      'update-status',
    ];
    
    if (validChannels.includes(channel)) {
      // 원본 콜백을 래핑하여 IPC 이벤트 객체 제거
      const subscription = (_event: any, ...args: any[]) => callback(...args);
      ipcRenderer.on(channel, subscription);
      
      // 구독 취소 함수 반환
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    }
    
    return () => {}; // 유효하지 않은 채널에 대한 더미 정리 함수
  },
  
  // 이벤트 발생
  send: (channel: string, data: any) => {
    // 허용된 채널 목록
    const validChannels = [
      'wallet:created',
      'wallet:imported',
      'wallet:updated',
      'transaction:sent',
    ];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  }
});
