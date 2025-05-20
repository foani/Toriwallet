const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: path.join(__dirname, 'assets', 'icon'),
    executableName: 'tori-wallet',
    appCopyright: 'Copyright © 2025 TORI Wallet Team',
    appBundleId: 'com.creatachain.tori-wallet',
    osxSign: {
      identity: process.env.APPLE_IDENTITY,
      hardenedRuntime: true,
      entitlements: 'entitlements.plist',
      'entitlements-inherit': 'entitlements.plist',
      'gatekeeper-assess': false,
    },
    osxNotarize: {
      tool: 'notarytool',
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    },
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'TORI Wallet',
        authors: 'TORI Wallet Team',
        iconUrl: 'https://your-cdn-url.com/icon.ico',
        setupIcon: path.join(__dirname, 'assets', 'icon.ico'),
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'TORI Wallet Team',
          homepage: 'https://creatachain.com',
          icon: path.join(__dirname, 'assets', 'icon.png'),
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: 'TORI Wallet Team',
          homepage: 'https://creatachain.com',
          icon: path.join(__dirname, 'assets', 'icon.png'),
        },
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/renderer/index.html',
              js: './src/renderer/index.tsx',
              name: 'main_window',
              preload: {
                js: './src/preload/index.ts',
              },
            },
          ],
        },
      },
    },
  ],
};
