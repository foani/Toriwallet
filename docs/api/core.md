# TORI Wallet Core API 문서

## 소개

TORI Wallet의 Core 패키지는 TORI 지갑의 핵심 기능을 제공하는 모듈입니다. 이 문서는 Core 패키지의 API를 설명합니다.

## 설치

TORI Wallet은 모노레포 구조로 되어 있으며, Yarn 워크스페이스를 사용하여 관리됩니다. Core 패키지는 다음과 같이 설치할 수 있습니다:

```bash
yarn workspace @tori-wallet/core install
```

다른 패키지에서 Core 패키지를 사용하려면 다음과 같이 의존성을 추가합니다:

```bash
yarn workspace @tori-wallet/extension add @tori-wallet/core
```

## 목차

1. [Constants (상수)](./core/constants.md)
2. [Types (타입)](./core/types.md)
3. [Crypto Services (암호화 서비스)](./core/crypto.md)
4. [Storage Services (저장소 서비스)](./core/storage.md) 
5. [Transaction Services (트랜잭션 서비스)](./core/transaction.md)
6. [React Hooks (리액트 훅)](./core/hooks.md)
