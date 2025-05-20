# TORI 지갑 프로젝트 계획

## 1. 프로젝트 개요

TORI 지갑은 CreataChain 생태계를 기반으로 하는 다기능 멀티체인 암호화폐 지갑입니다. 이 지갑은 익스텐션, 모바일 앱, 텔레그램 미니앱 등 다양한 플랫폼에서 일관된 사용자 경험을 제공합니다. 주요 기능으로는 멀티체인 지원, 계정 및 지갑 관리, 자산 관리, 다양한 트랜잭션 기능, 크로스체인 기능, 스테이킹 및 수익 창출, dApp 브라우저 및 연결, 분석 및 시장 정보 등이 있습니다.

## 2. 기술 스택

### 공통 (Core)
- 언어: TypeScript
- 암호화: ethers.js, bitcoinjs-lib, web3.js
- 상태 관리: Redux/Redux Toolkit
- 테스트: Jest, React Testing Library

### 브라우저 확장 프로그램
- React.js
- Chrome Extension API
- Webpack

### 모바일 앱
- React Native
- React Navigation
- Biometrics: react-native-biometrics

### 데스크톱 앱
- Electron
- React.js

### 텔레그램 미니앱
- React.js
- Telegram Mini App API

### 관리자 패널
- React.js
- Material-UI/Chakra UI

## 3. 프로젝트 구조

프로젝트는 모노레포(Monorepo) 구조로 설계되어 코드 재사용성을 극대화합니다.

```
tori-wallet/
├── packages/
│   ├── core/           # 공통 핵심 로직
│   ├── extension/      # 브라우저 확장 프로그램
│   ├── mobile/         # 모바일 앱 (React Native)
│   ├── desktop/        # 데스크톱 앱 (Electron)
│   └── telegram/       # 텔레그램 미니앱
├── shared/             # 공유 자원 (이미지, 다국어 등)
├── tools/              # 빌드 도구 및 스크립트
├── admin/              # 관리자 패널
├── tests/              # 통합 테스트
├── docs/               # 문서
├── security/           # 보안 감사 보고서
└── legal/              # 법적 문서
```

## 4. 개발 단계 Part 1

### 1단계: 프로젝트 설정 및 코어 라이브러리 개발 (100% 완료)
- [x] 프로젝트 구조 설정 및 모노레포 환경 구성
- [x] 상수 및 타입 정의 파일 작성
  - [x] networks.ts: 네트워크 상수 및 유형 정의
  - [x] tokens.ts: 토큰 상수 및 유형 정의
  - [x] config.ts: 설정 상수 정의
  - [x] errors.ts: 오류 유형 및 처리 정의
  - [x] wallet.ts: 지갑 관련 타입 정의
  - [x] transaction.ts: 트랜잭션 관련 타입 정의
  - [x] network.ts: 네트워크 관련 타입 정의
  - [x] nft.ts: NFT 관련 타입 정의
  - [x] staking.ts: 스테이킹 관련 타입 정의
  - [x] dapp.ts: dApp 관련 타입 정의
- [x] 핵심 암호화 모듈 개발
  - [x] keyring.ts: 키 관리 서비스
  - [x] mnemonic.ts: 니모닉 시드 처리
  - [x] hdkey.ts: HD 키 파생
  - [x] encryption.ts: 암호화 유틸리티
  - [x] signature.ts: 서명 유틸리티
- [x] 지갑 생성 및 복구 기능 개발
  - [x] wallet-service.ts: 지갑 관리 서비스
- [x] 트랜잭션 서명 및 전송 로직 개발
  - [x] transaction-service.ts: 트랜잭션 관리 서비스
- [x] 네트워크 연결 준비
- [x] 보안 기능 구현 (암호화 저장소 등)
  - [x] storage-service.ts: 저장소 서비스

### 2단계: 브라우저 확장 프로그램 개발 (Part 1) (100% 완료)
- [x] 확장 프로그램 기본 구조 설정
  - [x] manifest.json: 확장 프로그램 메타데이터
  - [x] 다국어 지원 파일 (messages.json)
  - [x] 백그라운드 스크립트 구조 설정
  - [x] 콘텐츠 스크립트 구조 설정
  - [x] 인페이지 스크립트 구조 설정
  - [x] 웹팩 구성 설정
- [x] 백그라운드 스크립트 및 콘텐츠 스크립트 개발
  - [x] background/index.ts: 기본 백그라운드 스크립트
  - [x] background/messageListener.ts: 메시지 리스너
  - [x] background/walletManager.ts: 지갑 관리자
  - [x] background/networkManager.ts: 네트워크 관리자
  - [x] background/notifications.ts: 알림 시스템
  - [x] contentScript/index.ts: 기본 콘텐츠 스크립트
  - [x] contentScript/injectProvider.ts: 프로바이더 주입
  - [x] contentScript/messageHandler.ts: 메시지 핸들러
  - [x] contentScript/domWatcher.ts: DOM 감시자
  - [x] inpage/index.ts: 기본 인페이지 스크립트
  - [x] inpage/provider.ts: 웹3 프로바이더
  - [x] inpage/messageBridge.ts: 메시지 브릿지
  - [x] inpage/ethereum.ts: 이더리움 호환 프로바이더

## 10. 완료를 위한 남은 추가 작업

### 1. 보안 감사 마무리
- [x] 내부 보안 감사 1차: 코어 라이브러리 감사 (완료)
- [x] 내부 보안 감사 2차: 브라우저 확장 프로그램 감사 (완료)
- [x] 내부 보안 감사 3차: 모바일 앱 감사 (완료)
- [ ] 내부 보안 감사 4차: 데스크톱 앱 및 텔레그램 미니앱 감사 (기한: 2025년 5월 13일)
- [ ] 내부 보안 감사 5차: 크로스체인 기능 및 API 감사 (기한: 2025년 5월 15일)
- [ ] 외부 보안 전문 기관 감사 (기한: 2025년 5월 16일 ~ 5월 23일)
- [ ] 취약점 수정 및 개선 (기한: 2025년 5월 24일 ~ 5월 27일)

### 2. 최종 배포 준비
- [ ] 최종 릴리스 빌드 (기한: 2025년 5월 28일)
- [ ] 브라우저 확장 프로그램 스토어 업로드 (기한: 2025년 5월 29일)
- [ ] 모바일 앱 스토어 업로드 (기한: 2025년 5월 29일)
- [ ] 데스크톱 앱 웹사이트 배포 (기한: 2025년 5월 30일)
- [ ] 텔레그램 미니앱 배포 (기한: 2025년 5월 30일)
- [ ] 최종 공식 배포 및 발표 (기한: 2025년 5월 31일)

## 11. 마무리

TORI 지갑 프로젝트는 개발 최종 지점에 도달했습니다. 멀티체인 지원, 계정 및 지갑 관리, 자산 관리, 트랜잭션 기능, 크로스체인 기능, 스테이킹 및 DeFi 기능, dApp 브라우저 및 연결 기능 등 모든 핵심 기능이 성공적으로 구현되었습니다.

현재는 보안 감사와 최종 배포를 준비하고 있으며, 2025년 5월 31일 최종 배포를 목표로 진행하고 있습니다. 배포 후에도 추가 블록체인 네트워크 지원, 향상된 DeFi 통합, 가상 카드 및 결제 기능 등의 추가 기능 개발과 지속적인 보안 강화 및 사용자 경험 개선 작업을 계획하고 있습니다.