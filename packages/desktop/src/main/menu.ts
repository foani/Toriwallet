import { Menu, BrowserWindow, app, shell, dialog } from 'electron';

/**
 * 애플리케이션 메뉴 설정
 * OS에 맞는 네이티브 메뉴를 설정합니다.
 */
export function setupMenu(mainWindow: BrowserWindow): void {
  const isMac = process.platform === 'darwin';
  
  const template: Electron.MenuItemConstructorOptions[] = [
    // 애플리케이션 메뉴 (macOS 전용)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    
    // 파일 메뉴
    {
      label: '파일',
      submenu: [
        {
          label: '새 지갑 생성',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu:create-wallet');
          }
        },
        {
          label: '지갑 가져오기',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.send('menu:import-wallet');
          }
        },
        { type: 'separator' },
        {
          label: '백업',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu:backup-wallet');
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    
    // 편집 메뉴
    {
      label: '편집',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startSpeaking' },
              { role: 'stopSpeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    
    // 보기 메뉴
    {
      label: '보기',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: '개발자 도구',
          accelerator: isMac ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: () => { mainWindow.webContents.toggleDevTools(); }
        }
      ]
    },
    
    // 지갑 메뉴
    {
      label: '지갑',
      submenu: [
        {
          label: '보내기',
          click: () => {
            mainWindow.webContents.send('menu:navigate', '/wallet/send');
          }
        },
        {
          label: '받기',
          click: () => {
            mainWindow.webContents.send('menu:navigate', '/wallet/receive');
          }
        },
        { type: 'separator' },
        {
          label: '네트워크 관리',
          click: () => {
            mainWindow.webContents.send('menu:navigate', '/settings/networks');
          }
        },
        {
          label: '계정 관리',
          click: () => {
            mainWindow.webContents.send('menu:navigate', '/settings/accounts');
          }
        },
        { type: 'separator' },
        {
          label: '트랜잭션 내역',
          click: () => {
            mainWindow.webContents.send('menu:navigate', '/wallet/transactions');
          }
        }
      ]
    },
    
    // 도움말 메뉴
    {
      role: 'help',
      submenu: [
        {
          label: '문서',
          click: async () => {
            await shell.openExternal('https://docs.creatachain.com');
          }
        },
        {
          label: '지원',
          click: async () => {
            await shell.openExternal('https://support.creatachain.com');
          }
        },
        { type: 'separator' },
        {
          label: '정보',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              title: 'TORI 지갑 정보',
              message: `TORI Wallet - 버전 ${app.getVersion()}`,
              detail: 'CreataChain 기반의 멀티체인 지갑\nCopyright © 2025 TORI Wallet Team',
              buttons: ['확인'],
              type: 'info',
            });
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
