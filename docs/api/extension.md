# TORI Wallet 브라우저 확장 프로그램 API 문서

## 소개

TORI Wallet의 Extension 패키지는 브라우저 확장 프로그램 구현을 제공합니다. 이 문서는 Extension 패키지의 API를 설명합니다.

## 설치

Extension 패키지는 다음과 같이 설치할 수 있습니다:

```bash
yarn workspace @tori-wallet/extension install
```

## 개발 빌드

개발 빌드를 실행하려면 다음 명령어를 사용합니다:

```bash
yarn workspace @tori-wallet/extension dev
```

## 프로덕션 빌드

프로덕션 빌드를 생성하려면 다음 명령어를 사용합니다:

```bash
yarn workspace @tori-wallet/extension build
```

## 주요 구성 요소

TORI Wallet 브라우저 확장 프로그램은 다음과 같은 주요 구성 요소로 이루어져 있습니다:

1. **백그라운드 스크립트**: 지갑 관리, 네트워크 연결 등 핵심 기능을 처리합니다.
2. **콘텐츠 스크립트**: 웹 페이지와 상호 작용하고 인페이지 스크립트를 주입합니다.
3. **인페이지 스크립트**: 웹 페이지에 주입되어 Web3 Provider를 제공합니다.
4. **팝업 UI**: 사용자 인터페이스를 제공합니다.

## 목차

1. [구조 개요](./extension/structure.md)
2. [백그라운드 스크립트](./extension/background.md)
3. [콘텐츠 스크립트](./extension/content_script.md)
4. [인페이지 스크립트](./extension/inpage.md)
5. [팝업 UI 컴포넌트](./extension/ui_components.md)
6. [트랜잭션 처리](./extension/transactions.md)
7. [dApp 브라우저 및 연결](./extension/dapp.md)
8. [크로스체인 기능](./extension/crosschain.md)
