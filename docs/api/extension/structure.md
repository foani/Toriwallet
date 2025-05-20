# TORI Wallet 브라우저 확장 프로그램 구조 개요

## 디렉토리 구조

TORI Wallet 브라우저 확장 프로그램은 다음과 같은 디렉토리 구조를 가집니다:

```
extension/
├── public/
│   ├── manifest.json
│   ├── icons/
│   │   ├── icon-16.png
│   │   ├── icon-48.png
│   │   └── icon-128.png
│   └── _locales/
│       ├── en/
│       │   └── messages.json
│       ├── ko/
│       │   └── messages.json
│       ├── ja/
│       │   └── messages.json
│       ├── zh/
│       │   └── messages.json
│       ├── vi/
│       │   └── messages.json
│       └── th/
│           └── messages.json
├── src/
│   ├── background/
│   │   ├── index.ts
│   │   ├── messageListener.ts
│   │   ├── walletManager.ts
│   │   ├── networkManager.ts
│   │   └── notifications.ts
│   ├── contentScript/
│   │   ├── index.ts
│   │   ├── injectProvider.ts
│   │   ├── messageHandler.ts
│   │   └── domWatcher.ts
│   ├── inpage/
│   │   ├── index.ts
│   │   ├── provider.ts
│   │   ├── ethereum.ts
│   │   └── messageBridge.ts
│   ├── popup/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   └── Loading.tsx
│   │   │   ├── wallet/
│   │   │   │   ├── AccountSelector.tsx
│   │   │   │   ├── AssetsList.tsx
│   │   │   │   ├── TransactionItem.tsx
│   │   │   │   ├── NetworkSelector.tsx
│   │   │   │   ├── ReceiveModal.tsx
│   │   │   │   └── SendForm.tsx
│   │   │   ├── staking/
│   │   │   │   ├── ValidatorCard.tsx
│   │   │   │   ├── StakingForm.tsx
│   │   │   │   ├── RewardsCard.tsx
│   │   │   │   └── UnstakeForm.tsx
│   │   │   ├── nft/
│   │   │   │   ├── NFTCard.tsx
│   │   │   │   ├── NFTGallery.tsx
│   │   │   │   ├── NFTDetails.tsx
│   │   │   │   └── TransferNFT.tsx
│   │   │   ├── crosschain/
│   │   │   │   ├── ICPTransfer.tsx
│   │   │   │   ├── BridgeForm.tsx
│   │   │   │   └── CrosschainHistory.tsx
│   │   │   └── dapp/
│   │   │       ├── DAppBrowser.tsx
│   │   │       ├── DAppCard.tsx
│   │   │       ├── ConnectRequest.tsx
│   │   │       └── SignRequest.tsx
│   │   ├── pages/
│   │   │   ├── WelcomePage.tsx
│   │   │   ├── CreateWallet.tsx
│   │   │   ├── ImportWallet.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Send.tsx
│   │   │   ├── Receive.tsx
│   │   │   ├── StakingPage.tsx
│   │   │   ├── NFTPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── ICPTransferPage.tsx
│   │   │   ├── DAppBrowserPage.tsx
│   │   │   └── BackupPage.tsx
│   │   ├── styles/
│   │   │   ├── theme.ts
│   │   │   ├── global.css
│   │   │   └── components.css
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── dapp/
│   │   ├── index.tsx
│   │   ├── Browser.tsx
│   │   ├── WebView.tsx
│   │   └── BrowserControls.tsx
│   └── config/
│       ├── webpack.config.js
│       └── paths.js
├── package.json
├── tsconfig.json
└── README.md
```

## 핵심 컴포넌트

### manifest.json

Chrome 확장 프로그램의 메타데이터를 정의합니다. 이 파일은 확장 프로그램의 이름, 버전, 권한, 아이콘 등을 지정합니다.

```json
{
  "name": "__MSG_appName__",
  "version": "1.0.0",
  "description": "__MSG_appDescription__",
  "default_locale": "en",
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  "browser_action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    },
    "default_title": "TORI Wallet"
  },
  "background": {
    "scripts": ["background.js"],
    "persistent": true
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["contentScript.js"],
      "run_at": "document_start",
      "all_frames": false
    }
  ],
  "permissions": [
    "storage",
    "unlimitedStorage",
    "activeTab",
    "notifications",
    "clipboardWrite"
  ],
  "web_accessible_resources": ["inpage.js"],
  "content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'"
}
```

### 백그라운드 스크립트

백그라운드 스크립트는 확장 프로그램의 핵심 로직을 처리합니다. 지갑 관리, 네트워크 연결, 트랜잭션 처리 등의 기능을 담당합니다.

- `index.ts`: 백그라운드 스크립트의 진입점입니다.
- `messageListener.ts`: 콘텐츠 스크립트와 팝업에서 오는 메시지를 처리합니다.
- `walletManager.ts`: 지갑 관리 기능을 제공합니다.
- `networkManager.ts`: 네트워크 연결 및 관리 기능을 제공합니다.
- `notifications.ts`: 알림 관리 기능을 제공합니다.

### 콘텐츠 스크립트

콘텐츠 스크립트는 웹 페이지에 주입되어 페이지와 확장 프로그램 간의 통신을 담당합니다.

- `index.ts`: 콘텐츠 스크립트의 진입점입니다.
- `injectProvider.ts`: 인페이지 스크립트를 웹 페이지에 주입합니다.
- `messageHandler.ts`: 인페이지 스크립트와 백그라운드 스크립트 간의 메시지를 처리합니다.
- `domWatcher.ts`: DOM 변경을 감시하고 dApp 연결을 처리합니다.

### 인페이지 스크립트

인페이지 스크립트는 웹 페이지에 주입되어 Web3 Provider를 제공합니다.

- `index.ts`: 인페이지 스크립트의 진입점입니다.
- `provider.ts`: Web3 Provider를 구현합니다.
- `ethereum.ts`: 이더리움 호환 Provider를 구현합니다(EIP-1193).
- `messageBridge.ts`: 인페이지 스크립트와 콘텐츠 스크립트 간의 통신을 관리합니다.

### 팝업 UI

팝업 UI는 사용자 인터페이스를 제공합니다.

- `App.tsx`: 팝업 애플리케이션의 루트 컴포넌트입니다.
- `index.tsx`: 팝업 애플리케이션의 진입점입니다.
- `components/`: UI 컴포넌트들을 포함합니다.
- `pages/`: 페이지 컴포넌트들을 포함합니다.
- `styles/`: 스타일 정의를 포함합니다.

### dApp 브라우저

dApp 브라우저는 확장 프로그램 내에서 분산 애플리케이션을 실행할 수 있는 환경을 제공합니다.

- `index.tsx`: dApp 브라우저의 진입점입니다.
- `Browser.tsx`: 브라우저 컴포넌트를 구현합니다.
- `WebView.tsx`: 웹 콘텐츠를 표시하는 웹뷰 컴포넌트를 구현합니다.
- `BrowserControls.tsx`: 브라우저 제어 요소(주소 표시줄, 버튼 등)를 구현합니다.

### 웹팩 설정

`config/webpack.config.js`는 확장 프로그램 빌드를 위한 웹팩 설정을 정의합니다. 개발 모드와 프로덕션 모드에 따른 설정을 포함합니다.

## 통신 흐름

TORI Wallet 브라우저 확장 프로그램의 컴포넌트 간 통신 흐름은 다음과 같습니다:

1. **웹 페이지 → 인페이지 스크립트**: 웹 페이지(dApp)에서 ethereum 객체를 통해 인페이지 스크립트에 요청을 보냅니다.
2. **인페이지 스크립트 → 콘텐츠 스크립트**: 인페이지 스크립트는 window.postMessage를 사용하여 요청을 콘텐츠 스크립트로 전달합니다.
3. **콘텐츠 스크립트 → 백그라운드 스크립트**: 콘텐츠 스크립트는 chrome.runtime.sendMessage를 사용하여 요청을 백그라운드 스크립트로 전달합니다.
4. **백그라운드 스크립트 → 팝업 UI**: 백그라운드 스크립트는 팝업 UI에 정보를 전달하고 사용자 입력을 요청할 수 있습니다.
5. **팝업 UI → 백그라운드 스크립트**: 사용자 입력이 팝업 UI에서 백그라운드 스크립트로 전달됩니다.
6. **백그라운드 스크립트 → 콘텐츠 스크립트**: 백그라운드 스크립트는 chrome.tabs.sendMessage를 사용하여 결과를 콘텐츠 스크립트로 전달합니다.
7. **콘텐츠 스크립트 → 인페이지 스크립트**: 콘텐츠 스크립트는 window.postMessage를 사용하여 결과를 인페이지 스크립트로 전달합니다.
8. **인페이지 스크립트 → 웹 페이지**: 인페이지 스크립트는 결과를 웹 페이지(dApp)로 반환합니다.

## 보안 고려사항

TORI Wallet 브라우저 확장 프로그램은 다음과 같은 보안 방법을 사용합니다:

1. **민감한 데이터 암호화**: 개인 키, 시드 구문 등의 민감한 데이터는 항상 암호화하여 저장합니다.
2. **권한 분리**: 각 스크립트는 필요한 최소한의 권한만 가지도록 설계되었습니다.
3. **CSP(Content Security Policy)**: XSS(Cross-Site Scripting) 공격을 방지하기 위한 콘텐츠 보안 정책을 구현합니다.
4. **입력 검증**: 모든 사용자 입력과 외부 데이터는 처리 전에 검증됩니다.
5. **트랜잭션 확인**: 모든 트랜잭션은 실행 전에 사용자 확인을 요구합니다.
