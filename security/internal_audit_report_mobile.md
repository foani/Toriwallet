# TORI 지갑 내부 보안 감사 보고서 - 모바일 앱

## 개요

이 문서는 TORI 지갑 프로젝트의 모바일 앱(iOS 및 Android)에 대한 내부 보안 감사 결과를 기록합니다. 감사는 2025년 5월 8일부터 5월 10일까지 진행되었으며, 네이티브 모듈, 리액트 네이티브 코드, 생체 인증 통합, 푸시 알림, QR 코드 스캔, 데이터 저장 등의 영역을 포함했습니다.

## 감사 범위

### 대상 코드
- `packages/mobile/src/services/*`
- `packages/mobile/src/screens/*`
- `packages/mobile/src/components/*`
- `packages/mobile/src/navigation/*`
- `packages/mobile/src/biometrics/*`
- `packages/mobile/android/app/src/main/java/com/tori/wallet/*` (Android 전용)
- `packages/mobile/ios/ToriWallet/*` (iOS 전용)

### 평가 항목
1. 앱 권한 및 접근 제어
2. 생체 인증 구현 안전성
3. 데이터 저장 및 암호화
4. 네이티브 브릿지 보안
5. 푸시 알림 처리 보안
6. QR 코드 스캔 및 딥 링크 처리
7. 앱 내 브라우저 및 dApp 연결 보안
8. 모바일 플랫폼 특화 취약점

## 발견된 취약점 요약

총 14개의 보안 이슈가 발견되었으며, 심각도별 분류는 다음과 같습니다:

- **치명적(Critical)**: 0건
- **높음(High)**: 3건
- **중간(Medium)**: 4건
- **낮음(Low)**: 5건
- **정보성(Informational)**: 2건

## 주요 발견 사항

### 높음(High)

#### 1. 안전하지 않은 데이터 저장 (H-01)

**위치**: `packages/mobile/src/services/storage/secure.ts`

**설명**: 일부 민감한 데이터가 앱의 일반 저장소에 저장되어 있어, 루팅된 Android 기기나 탈옥된 iOS 기기에서 접근될 위험이 있습니다.

**권장 수정 사항**: 모든 민감한 데이터(개인 키, 시드, 토큰 등)는 플랫폼의 보안 저장소(Android의 Keystore, iOS의 Keychain)를 사용하여 저장하도록 수정합니다.

**상태**: 수정 중

#### 2. 생체 인증 우회 가능성 (H-02)

**위치**: `packages/mobile/src/biometrics/biometricAuth.ts`

**설명**: 생체 인증 실패 시 암호를 통한 대체 인증이 적절한 제한 없이 허용되어, 무차별 대입 공격에 취약할 수 있습니다.

**권장 수정 사항**: 암호 시도 횟수를 제한하고, 여러 차례 실패 시 지연 시간을 적용하거나 추가 인증 단계를 요구하도록 수정합니다.

**상태**: 수정 완료

#### 3. 클립보드 데이터 노출 (H-03)

**위치**: `packages/mobile/src/screens/wallet/ReceiveScreen.tsx`, `packages/mobile/src/screens/wallet/Send.tsx`

**설명**: 개인 키나 시드 구문과 같은 민감한 데이터가 클립보드에 무기한 저장되어, 백그라운드에서 실행 중인 다른 앱에 의해 악용될 위험이 있습니다.

**권장 수정 사항**: 민감한 데이터를 클립보드에 복사할 때 자동 삭제 타이머를 설정하고, 사용자에게 보안 위험을 경고하며, 가능한 경우 보안 클립보드 대안을 사용하도록 수정합니다.

**상태**: 수정 완료

### 중간(Medium)

#### 1. 불충분한 인증서 검증 (M-01)

**위치**: `packages/mobile/src/services/api/baseApiService.ts`

**설명**: API 서버와의 통신에서 SSL/TLS 인증서 검증이 적절하게 구현되어 있지 않아, 중간자 공격(MITM)에 취약할 수 있습니다.

**권장 수정 사항**: 인증서 핀닝(Certificate Pinning)을 구현하여 유효한 서버 인증서만 신뢰하도록 수정합니다.

**상태**: 수정 완료

#### 2. 안전하지 않은 딥 링크 처리 (M-02)

**위치**: `packages/mobile/src/navigation/AppNavigator.tsx`

**설명**: 딥 링크 처리 과정에서 적절한 검증이 이루어지지 않아, 악의적인 앱이 TORI 지갑 앱의 기능을 호출하거나 민감한 정보에 접근할 위험이 있습니다.

**권장 수정 사항**: 모든 딥 링크 파라미터에 대해 엄격한 검증을 수행하고, 민감한 작업에 대해서는 사용자 확인을 요구하도록 수정합니다.

**상태**: 수정 중

#### 3. QR 코드 스캔 보안 취약점 (M-03)

**위치**: `packages/mobile/src/components/wallet/QRCodeScanner.tsx`

**설명**: QR 코드 스캔 기능이 모든 형식의 QR 코드를 처리하도록 구현되어 있어, 악의적인 QR 코드를 통한 공격에 취약할 수 있습니다.

**권장 수정 사항**: QR 코드 내용에 대한 엄격한 포맷 검증을 구현하고, 지원되는 형식(암호화폐 주소, 거래 정보 등)만 처리하도록 수정합니다.

**상태**: 수정 완료

#### 4. 푸시 알림의 민감한 정보 포함 (M-04)

**위치**: `packages/mobile/src/services/NotificationService.ts`

**설명**: 푸시 알림에 계정 잔액, 트랜잭션 금액 등의 민감한 정보가 포함되어 있어, 잠금 화면이나 알림 센터에서 노출될 수 있습니다.

**권장 수정 사항**: 푸시 알림에는 최소한의 정보만 포함하고, 구체적인 금액이나 계정 정보는 앱 내에서만 표시되도록 수정합니다.

**상태**: 수정 중

이하 내용은 다음 파일에 계속됩니다. 보다 자세한 내용은 [internal_audit_report_mobile_part2.md](internal_audit_report_mobile_part2.md)를 참조하십시오.