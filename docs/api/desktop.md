# TORI 지갑 데스크톱 앱 API 문서

## 개요

TORI 지갑 데스크톱 앱은 Electron 프레임워크를 기반으로 구축된 멀티체인 암호화폐 지갑입니다. 이 문서는 TORI 지갑 데스크톱 앱의 아키텍처, API, 주요 컴포넌트 및 모듈에 대한 정보를 제공합니다.

데스크톱 앱은 다음과 같은 세 가지 주요 부분으로 구성됩니다:
1. **Main Process**: Electron의 주요 프로세스로, 애플리케이션의 생명주기를 관리하고 시스템 수준의 기능을 제공합니다.
2. **Preload**: Main Process와 Renderer Process 사이의 보안 브릿지 역할을 하는 스크립트입니다.
3. **Renderer Process**: 사용자 인터페이스를 렌더링하고 사용자 상호작용을 처리합니다.

이 문서는 각 부분의 API와 주요 기능을 상세히 설명합니다. 전체 문서는 다음과 같은 부분으로 구성되어 있습니다:

- [Main Process API](./api/desktop/main_process.md)
- [Preload API](./api/desktop/preload.md)
- [Renderer Process API](./api/desktop/renderer.md)
- [IPC 통신](./api/desktop/ipc.md)
- [유틸리티 및 헬퍼 함수](./api/desktop/utils.md)

## 설치 및 개발 환경 설정

### 필수 요구사항

- Node.js 18.x 이상
- npm 9.x 이상 또는 yarn 1.22.x 이상
- Git

### 개발 환경 설정

1. 리포지토리 클론:
   ```bash
   git clone https://github.com/creatachain/tori-wallet.git
   cd tori-wallet
   ```

2. 의존성 설치:
   ```bash
   yarn install
   ```

3. 데스크톱 앱 개발 모드 실행:
   ```bash
   yarn workspace @tori-wallet/desktop dev
   ```

### 빌드

다양한 플랫폼용 데스크톱 앱을 빌드하려면:

1. Windows 빌드:
   ```bash
   yarn workspace @tori-wallet/desktop build:win
   ```

2. macOS 빌드:
   ```bash
   yarn workspace @tori-wallet/desktop build:mac
   ```

3. Linux 빌드:
   ```bash
   yarn workspace @tori-wallet/desktop build:linux
   ```

## 기술 스택

TORI 지갑 데스크톱 앱은 다음과 같은 기술 스택을 사용합니다:

- **Electron**: 크로스 플랫폼 데스크톱 애플리케이션을 위한 프레임워크
- **React**: 사용자 인터페이스 구축을 위한 JavaScript 라이브러리
- **TypeScript**: 정적 타입 지원을 추가한 JavaScript의 상위 집합
- **Redux/Redux Toolkit**: 상태 관리 라이브러리
- **electron-forge**: Electron 애플리케이션 배포를 위한 도구
- **electron-store**: 데스크톱 앱의 설정 및 데이터 저장을 위한 라이브러리
- **electron-log**: 로깅을 위한 라이브러리
- **electron-updater**: 자동 업데이트를 위한 라이브러리

## 프로젝트 구조

데스크톱 앱의 디렉토리 구조는 다음과 같습니다:

```
packages/desktop/
├── src/
│   ├── main/             # Main Process 코드
│   │   ├── index.ts      # 엔트리 포인트
│   │   ├── appWindow.ts  # 앱 창 관리
│   │   ├── ipcHandlers.ts # IPC 통신 핸들러
│   │   ├── menu.ts       # 애플리케이션 메뉴
│   │   └── autoUpdater.ts # 자동 업데이트 모듈
│   ├── preload/          # Preload 스크립트
│   │   ├── index.ts      # Preload 엔트리 포인트
│   │   └── api.ts        # Renderer에 노출할 API
│   └── renderer/         # Renderer Process 코드 (React)
│       ├── components/   # React 컴포넌트
│       ├── pages/        # 페이지 컴포넌트
│       ├── hooks/        # 커스텀 React 훅
│       ├── store/        # Redux 저장소
│       ├── utils/        # 유틸리티 함수
│       └── App.tsx       # 메인 React 앱 컴포넌트
├── electron-builder.yml  # electron-builder 설정
├── forge.config.js       # electron-forge 설정
├── package.json          # 패키지 정보 및 스크립트
└── tsconfig.json         # TypeScript 설정
```

## 아키텍처 개요

TORI 지갑 데스크톱 앱의 아키텍처는 다음과 같은 주요 구성 요소로 이루어져 있습니다:

1. **Main Process**:
   - 애플리케이션 생명주기 관리
   - 창 생성 및 관리
   - 시스템 메뉴 설정
   - 자동 업데이트 처리
   - 파일 시스템 접근
   - IPC 통신 핸들러

2. **Preload 스크립트**:
   - Main Process와 Renderer Process 간의 보안 브릿지
   - 제한된 Node.js API 및 Electron API를 Renderer에 안전하게 노출

3. **Renderer Process**:
   - React 기반 사용자 인터페이스
   - Redux를 통한 상태 관리
   - 코어 지갑 로직과의 통합
   - 사용자 상호작용 처리

4. **IPC 통신**:
   - Main Process와 Renderer Process 간의 메시지 패싱
   - 비동기 및 동기 통신 채널
   - 보안 통신 프로토콜

5. **사용자 인터페이스 컴포넌트**:
   - 대시보드
   - 지갑 관리
   - 트랜잭션 기능
   - 스테이킹 및 DeFi 기능
   - 설정 및 보안 기능

자세한 API 문서는 다음 섹션에서 확인할 수 있습니다:

- [Main Process API](./api/desktop/main_process.md)
- [Preload API](./api/desktop/preload.md)
- [Renderer Process API](./api/desktop/renderer.md)
- [IPC 통신](./api/desktop/ipc.md)
- [유틸리티 및 헬퍼 함수](./api/desktop/utils.md)
