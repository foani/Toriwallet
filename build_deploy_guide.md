# TORI 지갑 빌드 및 배포 가이드

이 문서는 TORI 지갑의 각 플랫폼별 빌드 및 배포 방법을 설명합니다.

## 사전 요구사항

개발 환경 설정을 위해 다음 도구들이 필요합니다:

- Node.js (v16 이상)
- Yarn (v1.22 이상)
- Git
- Visual Studio Code 또는 다른 코드 에디터
- 모바일 앱 개발을 위한 설정:
  - iOS: macOS, Xcode
  - Android: Android Studio, JDK
- 데스크톱 앱을 위한 설정:
  - Windows, macOS 또는 Linux 환경

## 프로젝트 설정

1. 레포지토리 클론:
   ```bash
   git clone https://github.com/your-org/tori-wallet.git
   cd tori-wallet
   ```

2. 의존성 설치:
   ```bash
   yarn install
   ```

3. 환경 변수 설정:
   - `.env.example` 파일을 각 패키지 디렉토리에서 `.env`로 복사하고 필요한 값을 설정합니다.
   - 각 환경(개발, 테스트, 프로덕션)에 따라 `.env.development`, `.env.test`, `.env.production` 파일을 사용합니다.

## 빌드 및 실행 방법

### 코어 패키지

코어 패키지는 다른 모든 패키지에서 사용하는 공통 라이브러리입니다.

```bash
# 코어 패키지 빌드
cd packages/core
yarn build

# 테스트 실행
yarn test
```

### 브라우저 확장 프로그램

브라우저 확장 프로그램은 Chrome, Firefox 등의 브라우저에서 사용할 수 있는 웹 익스텐션입니다.

```bash
# 브라우저 확장 프로그램 개발 모드 실행
cd packages/extension
yarn dev

# 프로덕션 빌드
yarn build
```

#### 배포 방법

1. Chrome Web Store 배포:
   - `packages/extension/build` 디렉토리의 내용을 ZIP 파일로 압축합니다.
   - [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)에 로그인합니다.
   - "새 항목 추가" 버튼을 클릭하고 ZIP 파일을 업로드합니다.
   - 필요한 정보를 입력하고 제출합니다.

2. Firefox Add-ons 배포:
   - `packages/extension/build` 디렉토리의 내용을 ZIP 파일로 압축합니다.
   - [Firefox Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/)에 로그인합니다.
   - "새 부가 기능 제출" 버튼을 클릭하고 ZIP 파일을 업로드합니다.
   - 필요한 정보를 입력하고 제출합니다.

### 모바일 앱

모바일 앱은 iOS 및 Android 플랫폼에서 사용할 수 있는 네이티브 앱입니다.

```bash
# 모바일 앱 개발 모드 실행
cd packages/mobile
yarn start

# iOS 빌드 및 실행
yarn ios

# Android 빌드 및 실행
yarn android

# 프로덕션 빌드
yarn build:ios  # iOS
yarn build:android  # Android
```

#### 배포 방법

1. iOS App Store 배포:
   - Xcode에서 "Product > Archive"를 선택합니다.
   - 아카이브 창에서 "Distribute App"을 클릭합니다.
   - App Store Connect로 배포하는 옵션을 선택하고 단계를 따릅니다.
   - [App Store Connect](https://appstoreconnect.apple.com/)에서 앱 정보를 입력하고 제출합니다.

2. Google Play Store 배포:
   - `yarn build:android`를 실행하여 APK 또는 AAB 파일을 생성합니다.
   - [Google Play Console](https://play.google.com/console/)에 로그인합니다.
   - "앱 만들기"를 클릭하고 필요한 정보를 입력합니다.
   - "프로덕션" 트랙에 APK 또는 AAB 파일을 업로드하고 제출합니다.

### 데스크톱 앱

데스크톱 앱은 Windows, macOS, Linux 플랫폼에서 사용할 수 있는 네이티브 앱입니다.

```bash
# 데스크톱 앱 개발 모드 실행
cd packages/desktop
yarn dev

# 프로덕션 빌드
yarn build  # 모든 플랫폼
yarn build:win  # Windows
yarn build:mac  # macOS
yarn build:linux  # Linux
```

#### 배포 방법

1. Windows:
   - `yarn build:win`을 실행하여 Windows 설치 파일(.exe)을 생성합니다.
   - [Microsoft Partner Center](https://partner.microsoft.com/en-us/dashboard/windows/overview)에 로그인합니다.
   - "앱 제출"을 클릭하고 설치 파일을 업로드합니다.
   - 필요한 정보를 입력하고 제출합니다.

2. macOS:
   - `yarn build:mac`을 실행하여 macOS 앱 번들(.app)과 디스크 이미지(.dmg)를 생성합니다.
   - [Apple Developer](https://developer.apple.com/account/)에 로그인합니다.
   - 앱을 서명하고 공증합니다.
   - 웹사이트 또는 다른 배포 채널을 통해 배포합니다.

3. Linux:
   - `yarn build:linux`을 실행하여 Linux 패키지(.deb, .rpm, .AppImage)를 생성합니다.
   - Linux 패키지 레포지토리를 통해 배포하거나 웹사이트에서 직접 배포합니다.

### 텔레그램 미니앱

텔레그램 미니앱은 텔레그램 메신저 내에서 실행되는 웹 앱입니다.

```bash
# 텔레그램 미니앱 개발 모드 실행
cd packages/telegram
yarn dev

# 프로덕션 빌드
yarn build
```

#### 배포 방법

1. 텔레그램 봇 설정:
   - Telegram의 BotFather와 대화하여 새 봇을 생성합니다.
   - `/newbot` 명령어를 사용하여 봇 이름과 사용자 이름을 지정합니다.
   - 받은 API 토큰을 `.env` 파일에 저장합니다.

2. 텔레그램 미니앱 배포:
   - `yarn build`를 실행하여 프로덕션 빌드를 생성합니다.
   - 웹 서버에 빌드 파일을 업로드합니다.
   - BotFather에서 `/mybots` 명령어를 사용하여 봇을 선택합니다.
   - "Bot Settings > Menu Button > Configure Menu Button"을 선택합니다.
   - 미니앱 URL과 이름을 설정합니다.

### 관리자 패널

관리자 패널은 TORI 지갑 관리를 위한 웹 인터페이스입니다.

```bash
# 관리자 패널 개발 모드 실행
cd admin
yarn dev

# 프로덕션 빌드
yarn build
```

#### 배포 방법

1. 정적 호스팅:
   - `yarn build`를 실행하여 프로덕션 빌드를 생성합니다.
   - 빌드 폴더의 내용을 웹 서버(예: Nginx, Apache)에 업로드합니다.

2. 클라우드 서비스:
   - AWS S3 + CloudFront:
     ```bash
     # AWS CLI 구성
     aws configure

     # S3 버킷에 배포
     aws s3 sync ./build s3://your-bucket-name --delete

     # CloudFront 캐시 무효화
     aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
     ```

   - Firebase Hosting:
     ```bash
     # Firebase CLI 설치
     npm install -g firebase-tools

     # Firebase 로그인
     firebase login

     # 프로젝트 초기화
     firebase init hosting

     # 배포
     firebase deploy --only hosting
     ```

## CI/CD 파이프라인

CI/CD 파이프라인은 GitHub Actions를 사용하여 구현되어 있습니다.

1. 테스트 및 린팅:
   - 모든 풀 리퀘스트와 메인 브랜치 푸시에서 실행됩니다.
   - `yarn test` 및 `yarn lint`를 실행합니다.

2. 빌드:
   - 테스트가 통과한 후 실행됩니다.
   - 각 패키지의 빌드 스크립트를 실행합니다.

3. 배포:
   - 메인 브랜치에 푸시되면 실행됩니다.
   - 태그가 있는 커밋에 대해서만 프로덕션 환경에 배포합니다.
   - 태그가 없는 커밋은 스테이징 환경에 배포합니다.

## 버전 관리

버전 관리는 [Semantic Versioning](https://semver.org/)을 따릅니다:

- MAJOR 버전: 호환되지 않는 API 변경
- MINOR 버전: 기능 추가 (이전 버전과 호환)
- PATCH 버전: 버그 수정

버전 변경 및 릴리스는 다음과 같이 진행합니다:

```bash
# 패치 버전 증가
yarn version:patch

# 마이너 버전 증가
yarn version:minor

# 메이저 버전 증가
yarn version:major

# 릴리스 태그 생성 및 푸시
git tag v1.0.0
git push origin v1.0.0
```

## 문제 해결

빌드 또는 배포 중 발생할 수 있는 일반적인 문제와 해결 방법:

1. 의존성 문제:
   ```bash
   # 의존성 캐시 삭제 및 재설치
   yarn cache clean
   rm -rf node_modules
   yarn install
   ```

2. 빌드 오류:
   ```bash
   # 빌드 캐시 삭제 및 재빌드
   rm -rf packages/*/build packages/*/dist
   yarn build
   ```

3. 모바일 앱 실행 오류:
   - iOS:
     ```bash
     # iOS 빌드 캐시 삭제
     cd packages/mobile/ios
     pod deintegrate
     pod install
     cd ..
     yarn ios
     ```

   - Android:
     ```bash
     # Android 빌드 캐시 삭제
     cd packages/mobile/android
     ./gradlew clean
     cd ..
     yarn android
     ```

4. 데스크톱 앱 빌드 오류:
   ```bash
   # Electron 캐시 삭제
   rm -rf packages/desktop/node_modules/.cache
   yarn build
   ```

5. 텔레그램 미니앱 오류:
   - 텔레그램 봇 API 토큰이 올바르게 설정되었는지 확인합니다.
   - 웹앱 URL이 HTTPS를 사용하는지 확인합니다.

6. 관리자 패널 API 연결 오류:
   - API 엔드포인트가 올바르게 설정되었는지 확인합니다.
   - CORS 설정이 올바른지 확인합니다.

## 보안 고려사항

TORI 지갑 앱 배포 시 다음과 같은 보안 사항을 고려해야 합니다:

1. 개인키 및 니모닉 시드 보호:
   - 항상 디바이스에 암호화된 형태로 저장합니다.
   - 클라이언트 측 암호화를 사용하여 개인키가 절대 서버로 전송되지 않도록 합니다.

2. API 엔드포인트 보안:
   - 모든 API 요청에 HTTPS를 사용합니다.
   - 적절한 인증 및 권한 부여 메커니즘을 구현합니다.

3. 코드 서명 및 앱 무결성:
   - 모든 빌드는 배포 전에 서명해야 합니다.
   - 앱 내 무결성 검사를 구현합니다.

4. 보안 감사:
   - 정기적인 보안 감사를 수행합니다.
   - 취약점이 발견되면 즉시 패치합니다.

## 업데이트 관리

TORI 지갑 앱의 업데이트 관리는 다음과 같이 진행합니다:

1. 변경 사항 추적:
   - 모든 변경 사항은 CHANGELOG.md 파일에 문서화됩니다.
   - 각 버전의 주요 변경 사항, 새 기능, 버그 수정을 기록합니다.

2. 자동 업데이트:
   - 브라우저 확장 프로그램: 스토어를 통해 자동으로 업데이트됩니다.
   - 모바일 앱: 앱 스토어를 통해 업데이트됩니다.
   - 데스크톱 앱: Electron의 `autoUpdater` 모듈을 사용하여 자동 업데이트를 구현합니다.

3. 업데이트 알림:
   - 새 버전이 있을 때 사용자에게 알립니다.
   - 주요 업데이트의 경우 변경 사항을 강조하는 릴리스 노트를 표시합니다.

## 다국어 지원

TORI 지갑은 영어, 한국어, 일본어, 중국어, 베트남어, 태국어를 지원합니다. 다국어 지원을 위한 설정:

1. `shared/i18n` 디렉토리에 언어별 JSON 파일이 있습니다.
2. 새 텍스트가 추가될 때마다 모든 언어 파일에 추가해야 합니다.
3. 번역이 누락된 경우 fallback 언어(영어)가 사용됩니다.

## 문서화

TORI 지갑의 문서는 다음과 같이 관리됩니다:

1. API 문서:
   - TypeDoc을 사용하여 코어 라이브러리 API 문서를 생성합니다.
   - `yarn docs:api` 명령어로 생성하고 `docs/api` 디렉토리에 저장됩니다.

2. 사용자 가이드:
   - Markdown 형식으로 작성됩니다.
   - `docs/guides` 디렉토리에 저장됩니다.
   - 각 플랫폼별 가이드가 제공됩니다.

3. 개발자 문서:
   - 아키텍처, 코드 스타일, 기여 가이드라인 등을 포함합니다.
   - `docs/architecture` 디렉토리에 저장됩니다.

## 결론

TORI 지갑은 다양한 플랫폼을 지원하는 복잡한 프로젝트입니다. 이 가이드를 따라 각 플랫폼별로 빌드하고 배포할 수 있습니다. 개발 과정에서 문제가 발생하면 문제 해결 섹션을 참조하거나 프로젝트 레포지토리의 이슈 트래커에서 도움을 요청하십시오.
