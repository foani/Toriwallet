# TORI 지갑 내부 보안 감사 보고서 - 모바일 앱 (Part 2)

## 발견된 취약점 (계속)

### 낮음(Low)

#### 1. 스크린샷 방지 미구현 (L-01)

**위치**: `packages/mobile/src/screens/wallet/BackupSeed.tsx`

**설명**: 시드 구문 표시 화면에서 스크린샷 방지 기능이 구현되어 있지 않아, 사용자가 민감한 정보의 스크린샷을 찍을 경우 보안 위험이 발생할 수 있습니다.

**권장 수정 사항**: 민감한 정보를 표시하는 화면에서는 플랫폼별 스크린샷 방지 기능을 활성화하고, 사용자에게 스크린샷의 위험성을 알리는 경고를 표시합니다.

**상태**: 수정 완료

#### 2. 앱 실행 중 백그라운드 전환 시 보안 조치 부족 (L-02)

**위치**: `packages/mobile/src/App.tsx`

**설명**: 앱이 백그라운드로 전환될 때 민감한 정보를 화면에서 숨기거나 앱을 잠그는 등의 보안 조치가 충분하지 않습니다.

**권장 수정 사항**: 앱이 백그라운드로 전환될 때 민감한 정보를 화면에서 숨기고, 일정 시간이 지나면 자동으로 앱을 잠그도록 수정합니다.

**상태**: 수정 중

#### 3. 취약한 랜덤 생성기 사용 (L-03)

**위치**: `packages/mobile/src/utils/random.ts`

**설명**: 일부 기능에서 암호학적으로 안전하지 않은 `Math.random()`을 사용하고 있어, 예측 가능한 값이 생성될 수 있습니다.

**권장 수정 사항**: `Math.random()` 대신 플랫폼의 안전한 난수 생성 API를 사용하도록 수정합니다.

**상태**: 수정 완료

#### 4. 오류 메시지의 민감한 정보 노출 (L-04)

**위치**: 여러 파일

**설명**: 일부 오류 메시지에 내부 구현 세부 정보나 민감한 정보가 포함되어 있어, 사용자 인터페이스에 노출될 경우 보안 위험이 있습니다.

**권장 수정 사항**: 모든 오류 메시지를 사용자 친화적이고 일반적인 내용으로 수정하고, 자세한 디버그 정보는 로깅으로만 기록하도록 변경합니다.

**상태**: 수정 중

#### 5. 낮은 minSdkVersion (L-05)

**위치**: `packages/mobile/android/app/build.gradle`

**설명**: Android 앱의 minSdkVersion이 낮게 설정되어 있어, 보안 업데이트가 되지 않은 오래된 Android 버전에서도 앱이 실행될 수 있습니다.

**권장 수정 사항**: minSdkVersion을 최소 23(Android 6.0) 이상으로 높이고, 가능한 경우 최신 보안 기능을 활용할 수 있도록 targetSdkVersion을 최신으로 유지합니다.

**상태**: 수정 완료

### 정보성(Informational)

#### 1. 민감한 정보 로깅 (I-01)

**위치**: 여러 파일

**설명**: 개발용 로그에 민감한 정보가 포함되어 있어, 개발 모드에서 릴리스 모드로 전환 시 이러한 로그가 남아있을 경우 보안 위험이 있습니다.

**권장 수정 사항**: 프로덕션 빌드에서는 모든 디버그 로그를 비활성화하고, 민감한 정보는 어떤 환경에서도 로깅하지 않도록 수정합니다.

**상태**: 수정 완료

#### 2. 앱 크기 최적화 필요 (I-02)

**위치**: `packages/mobile/android/app/build.gradle`, `packages/mobile/ios/ToriWallet.xcodeproj`

**설명**: 앱 크기가 최적화되어 있지 않아, 필요 이상의 리소스와 코드가 포함되어 있습니다. 이는 잠재적인 공격 표면을 증가시킬 수 있습니다.

**권장 수정 사항**: 사용하지 않는 리소스와 코드를 제거하고, 코드 분할(Code Splitting)과 트리 쉐이킹(Tree Shaking) 등의 최적화 기법을 적용합니다.

**상태**: 수정 중

## 취약점 수정 현황

현재까지 14개의 발견된 취약점 중 8개가 수정 완료되었으며, 6개는 수정 중입니다.

| ID    | 심각도 | 상태       |
|-------|-------|-----------|
| H-01  | 높음  | 수정 중    |
| H-02  | 높음  | 수정 완료  |
| H-03  | 높음  | 수정 완료  |
| M-01  | 중간  | 수정 완료  |
| M-02  | 중간  | 수정 중    |
| M-03  | 중간  | 수정 완료  |
| M-04  | 중간  | 수정 중    |
| L-01  | 낮음  | 수정 완료  |
| L-02  | 낮음  | 수정 중    |
| L-03  | 낮음  | 수정 완료  |
| L-04  | 낮음  | 수정 중    |
| L-05  | 낮음  | 수정 완료  |
| I-01  | 정보  | 수정 완료  |
| I-02  | 정보  | 수정 중    |

## 모바일 앱별 특수 보안 권장 사항

### 1. iOS 특화 보안 권장 사항

- **아이폰 보안 키링 활용**: 모든 민감한 키와 인증 자료는 iOS Keychain의 kSecAttrAccessibleWhenUnlockedThisDeviceOnly 보호 클래스를 사용하여 저장합니다.
- **Face ID/Touch ID 통합 개선**: LocalAuthentication 프레임워크를 사용하여 생체 인증의 최신 보안 기능을 활용합니다.
- **앱 전송 보안(ATS) 활성화**: 앱의 모든 네트워크 연결에 HTTPS를 강제합니다.

### 2. Android 특화 보안 권장 사항

- **안드로이드 키스토어 활용**: 민감한 키는 Android Keystore System을 사용하여 저장하고, 하드웨어 보안 모듈(HSM)이 있는 기기에서는 하드웨어 지원 키를 사용합니다.
- **스크린 오버레이 방지**: TYPE_APPLICATION_OVERLAY 권한을 감지하여 화면 오버레이를 통한 공격을 방지합니다.
- **루팅 및 에뮬레이터 탐지**: 루팅된 기기나 에뮬레이터에서 앱 실행 시 추가적인 보안 조치를 적용합니다.

### 3. 공통 보안 권장 사항

- **앱 내 브라우저 보안 강화**: dApp 브라우저에서 JavaScript 평가와 파일 시스템 접근을 제한합니다.
- **오프라인 트랜잭션 서명**: 중요한 트랜잭션은 오프라인 상태에서 서명하는 옵션을 제공합니다.
- **네트워크 보안 강화**: 모든 API 통신에 TLS 1.3 이상을 사용하고, 인증서 핀닝을 구현합니다.
- **민감한 UI 요소 보호**: 민감한 정보를 표시하는 UI 요소는 스크린샷과 화면 녹화를 방지합니다.

## 결론

TORI 지갑 모바일 앱에 대한 내부 보안 감사 결과, 치명적인 취약점은 발견되지 않았지만, 여러 심각도의 보안 이슈가 식별되었습니다. 주요 취약점으로는 안전하지 않은 데이터 저장, 생체 인증 우회 가능성, 클립보드 데이터 노출 등이 있었습니다. 이러한 취약점 중 많은 부분이 이미 수정되었으며, 나머지도 현재 수정 중입니다.

모바일 앱은 사용자의 물리적 기기에서 실행되므로, 기기 분실이나 도난 시 추가적인 보안 위험이 있습니다. 따라서 앱 내 데이터 암호화, 생체 인증, 자동 잠금 등의 보안 기능을 더욱 강화할 필요가 있습니다.

## 다음 단계

1. 모든 발견된 취약점에 대한 수정 완료
2. iOS 및 Android 플랫폼별 추가 보안 기능 구현
3. 수정된 앱에 대한 추가 보안 테스트 수행
4. 모바일 앱 보안 가이드라인 작성

이 보고서는 2025년 5월 10일에 작성되었으며, TORI 지갑 프로젝트의 내부 보안 팀에 의해 검토되었습니다.