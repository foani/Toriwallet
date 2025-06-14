# TORI 지갑 아키텍처 개요 (Part 2)

## 핵심 컴포넌트

### Core 패키지

Core 패키지는 TORI 지갑의 핵심 기능을 제공하며, 다른 모든 패키지에서 재사용됩니다.

#### 주요 모듈

1. **Crypto 서비스**
   - `keyring.ts`: 키 관리 서비스
   - `mnemonic.ts`: 니모닉 시드 관리
   - `hdkey.ts`: HD 키 파생
   - `encryption.ts`: 암호화 및 복호화
   - `signature.ts`: 트랜잭션 서명

2. **Storage 서비스**
   - `local.ts`: 로컬 스토리지 관리
   - `secure.ts`: 보안 스토리지 관리
   - `sync.ts`: 데이터 동기화 관리

3. **Transaction 서비스**
   - `builder.ts`: 트랜잭션 생성
   - `signer.ts`: 트랜잭션 서명
   - `sender.ts`: 트랜잭션 전송
   - `gas.ts`: 가스 계산 및 추정

4. **Crosschain 서비스**
   - `relayer.ts`: ICP 릴레이어 서비스
   - `bridge.ts`: 크로스체인 브릿지 서비스
   - `swap.ts`: 크로스체인 스왑 서비스

5. **Network 서비스**
   - 각 지원 네트워크별 API 모듈
   - 네트워크 상태 모니터링
   - RPC 요청 처리

### Extension 패키지

브라우저 확장 프로그램은 다음과 같은 주요 구성 요소로 이루어져 있습니다:

1. **Background 스크립트**
   - 확장 프로그램의 메인 프로세스
   - 지갑 상태 관리 및 영구 저장
   - 백그라운드 작업 처리

2. **Content 스크립트**
   - 웹페이지와 확장 프로그램 간의 브릿지
   - 웹페이지에 웹3 프로바이더 주입

3. **Inpage 스크립트**
   - 웹페이지에 주입되는 웹3 프로바이더
   - dApp과의 통신 처리

4. **Popup UI**
   - 사용자 인터페이스 구현
   - 지갑 관리, 트랜잭션 서명 등

5. **dApp 브라우저**
   - 확장 프로그램 내 웹3 브라우저
   - dApp과 직접 통합

### Mobile 패키지

모바일 앱은 React Native를 사용하여 구현되며, 다음과 같은 주요 구성 요소를 포함합니다:

1. **화면 및 컴포넌트**
   - 모든 화면 및 UI 컴포넌트
   - 반응형 디자인

2. **네이티브 모듈**
   - 생체 인증
   - 푸시 알림
   - QR 코드 스캔
   - 딥 링크 처리

3. **네비게이션**
   - 앱의 화면 이동 및 라우팅 구성

### Desktop 패키지

데스크톱 앱은 Electron을 사용하여 구현되며, 다음과 같은 주요 구성 요소를 포함합니다:

1. **Main 프로세스**
   - 앱 라이프사이클 관리
   - 윈도우 관리
   - 시스템 통합

2. **Renderer 프로세스**
   - UI 렌더링
   - 사용자 상호작용 처리

3. **IPC 통신**
   - Main 프로세스와 Renderer 프로세스 간의 통신

### Telegram 패키지

텔레그램 미니앱은 웹 기반으로 구현되며, 다음과 같은 주요 구성 요소를 포함합니다:

1. **텔레그램 API 통합**
   - 텔레그램 WebApp API 사용
   - 텔레그램 사용자 인증

2. **UI 컴포넌트**
   - 텔레그램 UI 가이드라인에 맞는 컴포넌트

3. **P2P 송금 기능**
   - 텔레그램 사용자 간 송금 처리

## 데이터 흐름

### 지갑 생성 및 복구 흐름

1. 사용자가 새 지갑 생성 또는 복구 요청
2. Core의 Crypto 서비스에서 니모닉 시드 생성 또는 검증
3. HD 키 파생 및 계정 생성
4. 암호화된 형태로 키 저장 (Storage 서비스 사용)
5. 사용자에게 지갑 대시보드 표시

### 트랜잭션 처리 흐름

1. 사용자가 트랜잭션 요청
2. Transaction 서비스에서 트랜잭션 객체 생성
3. 가스비 추정 및 사용자 확인
4. 사용자 승인 후 개인 키로 트랜잭션 서명
5. 서명된 트랜잭션을 네트워크에 전송
6. 트랜잭션 결과 모니터링 및 상태 업데이트

### dApp 연결 흐름

1. 사용자가 dApp 방문
2. dApp이 지갑 연결 요청
3. Content 스크립트가 요청을 Background 스크립트로 전달
4. Background 스크립트가 연결 요청 팝업 표시
5. 사용자가 승인하면 dApp에 계정 정보 제공
6. dApp이 트랜잭션 요청 시 사용자 승인 후 처리

### 크로스체인 트랜잭션 흐름

1. 사용자가 크로스체인 전송 요청
2. Crosschain 서비스에서 소스 체인 트랜잭션 준비
3. 사용자 승인 후 소스 체인 트랜잭션 전송
4. ICP 릴레이어가 트랜잭션 모니터링
5. 대상 체인에 상응하는 트랜잭션 실행
6. 전체 크로스체인 트랜잭션 상태 업데이트

## 보안 아키텍처

TORI 지갑은 다음과 같은 보안 원칙을 따릅니다:

1. **개인 키 보호**
   - 개인 키는 항상 사용자 기기에 암호화된 형태로 저장
   - 개인 키는 절대 서버로 전송되지 않음
   - 메모리에서 사용하지 않을 때는 안전하게 제거

2. **멀티 레이어 보안**
   - 암호 보호: 지갑 접근 시 암호 요구
   - 생체 인증: 지원 기기에서 생체 인증 통합
   - 2FA: 선택적 2단계 인증 지원
   - 자동 잠금: 일정 시간 후 자동 잠금

3. **트랜잭션 보안**
   - 모든 트랜잭션은 사용자 명시적 승인 필요
   - 트랜잭션 세부 정보를 명확하게 표시
   - 이상 거래 탐지 및 경고

4. **dApp 연결 보안**
   - 권한 기반 접근 제어
   - 연결된 dApp 및 권한 관리
   - 악성 dApp 탐지 및 차단

5. **네트워크 보안**
   - 모든 통신은 HTTPS 사용
   - 인증서 핀닝 구현
   - API 요청 서명 및 검증

더 자세한 보안 아키텍처는 [보안 아키텍처](security.md) 문서를 참조하세요.

## 확장성 및 유지 관리

TORI 지갑 아키텍처는 다음과 같은 확장성 및 유지 관리를 위한 설계 원칙을 따릅니다:

1. **모듈형 설계**
   - 각 기능은 독립적인 모듈로 구현
   - 모듈 간 명확한 인터페이스 정의
   - 새로운 기능을 쉽게 추가할 수 있는 구조

2. **플러그인 시스템**
   - 코어 기능 외 추가 기능은 플러그인으로 구현
   - 플러그인 API를 통한 확장 가능성

3. **테스트 자동화**
   - 단위 테스트, 통합 테스트, E2E 테스트 구현
   - CI/CD 파이프라인 통합

4. **버전 관리**
   - Semantic Versioning 원칙 준수
   - 하위 호환성 유지

5. **문서화**
   - 코드 내 주석 및 문서화
   - API 문서 자동 생성
   - 개발자 가이드 및 예제 제공

## 플랫폼별 특수 고려사항

### 브라우저 확장 프로그램
- 백그라운드/콘텐츠/인페이지 스크립트 간 통신 최적화
- 브라우저 권한 관리
- 웹페이지와 안전한 통합

### 모바일 앱
- 네이티브 기능 활용 (생체 인증, 카메라, 푸시 알림 등)
- 오프라인 사용성 최적화
- 배터리 및 데이터 사용량 최적화

### 데스크톱 앱
- 다양한 OS 지원 (Windows, macOS, Linux)
- 자동 업데이트 메커니즘
- 시스템 트레이 통합

### 텔레그램 미니앱
- 텔레그램 API 제한 사항 고려
- 텔레그램 사용자 경험과 일관성 유지
- 채팅 기반 명령어 지원

## 결론

TORI 지갑 아키텍처는 확장성, 유지 관리성, 보안을 모두 고려한 설계로, CreataChain 생태계와 다양한 블록체인 네트워크를 지원하는 멀티체인 암호화폐 지갑 제공을 목표로 합니다. 모듈형 설계와 코드 재사용을 통해 다양한 플랫폼에서 일관된 사용자 경험을 제공하면서도 각 플랫폼의 특성을 최대한 활용할 수 있도록 구성되어 있습니다.

## 추가 자료

- [코어 아키텍처](core.md)
- [보안 아키텍처](security.md)
- [크로스체인 아키텍처](crosschain_part1.md)
- [API 문서](../api/core.md)