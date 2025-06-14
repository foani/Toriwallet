# TORI 지갑 시작하기

## 소개

TORI 지갑은 CreataChain 생태계를 기반으로 하는 다기능 멀티체인 암호화폐 지갑입니다. 이 가이드는 TORI 지갑을 처음 사용하는 사용자를 위해 작성되었으며, 지갑 설치부터 기본 기능 사용법까지 안내합니다.

## 지원 플랫폼

TORI 지갑은 다음 플랫폼에서 사용할 수 있습니다:

- **브라우저 확장 프로그램**: Chrome, Firefox, Edge
- **모바일 앱**: iOS, Android
- **데스크톱 앱**: Windows, macOS, Linux
- **텔레그램 미니앱**: 텔레그램 메신저 내에서 사용 가능

## 설치 방법

### 브라우저 확장 프로그램

1. 웹 브라우저에서 다음 스토어 중 하나를 방문합니다:
   - Chrome: [Chrome Web Store](https://chrome.google.com/webstore/detail/tori-wallet/xxxxxxxxxxxx)
   - Firefox: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tori-wallet/)
   - Edge: [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tori-wallet/xxxxxxxxxxxx)

2. "추가" 또는 "설치" 버튼을 클릭합니다.

3. 설치가 완료되면 브라우저 상단 도구 모음에 TORI 지갑 아이콘이 나타납니다.

### 모바일 앱

#### iOS
1. App Store에서 "TORI Wallet"을 검색하거나 [이 링크](https://apps.apple.com/app/tori-wallet/idXXXXXXXXXX)를 통해 접속합니다.
2. "받기" 버튼을 탭하고 설치를 진행합니다.
3. 설치가 완료되면 홈 화면에서 TORI 지갑 앱을 찾을 수 있습니다.

#### Android
1. Google Play Store에서 "TORI Wallet"을 검색하거나 [이 링크](https://play.google.com/store/apps/details?id=com.creatachain.toriwallet)를 통해 접속합니다.
2. "설치" 버튼을 탭하고 설치를 진행합니다.
3. 설치가 완료되면 앱 서랍에서 TORI 지갑 앱을 찾을 수 있습니다.

### 데스크톱 앱

1. [TORI 지갑 공식 웹사이트](https://tori-wallet.creatachain.com/downloads)에서 사용 중인 운영 체제에 맞는 설치 파일을 다운로드합니다:
   - Windows: `tori-wallet-setup-win.exe`
   - macOS: `tori-wallet-macos.dmg`
   - Linux: `tori-wallet-linux.deb` 또는 `tori-wallet-linux.AppImage`

2. 다운로드한 파일을 실행하고 설치 지침을 따릅니다.

3. 설치가 완료되면 바탕화면이나 시작 메뉴에서 TORI 지갑 앱을 찾을 수 있습니다.

### 텔레그램 미니앱

1. 텔레그램에서 [TORI 지갑 봇](https://t.me/ToriWalletBot)을 검색하거나 링크를 통해 접속합니다.
2. "시작" 버튼을 탭합니다.
3. 채팅창에서 제공되는 안내에 따라 미니앱을 시작합니다.

## 지갑 생성하기

TORI 지갑을 처음 실행하면 "시작하기" 화면이 표시됩니다. 여기서 새 지갑을 생성하거나 기존 지갑을 가져올 수 있습니다.

### 새 지갑 생성

1. "새 지갑 생성" 버튼을 클릭합니다.
2. 암호를 설정합니다. 이 암호는 지갑에 접근할 때마다 필요하니 안전하게 보관하세요.
3. 시드 구문(니모닉)을 안전하게 백업하라는 알림이 표시됩니다. "백업하기" 버튼을 클릭합니다.
4. 12단어 또는 24단어(선택 가능)의 시드 구문이 표시됩니다. 이 단어들을 순서대로 안전한 곳에 기록해두세요. 이 시드 구문은 지갑을 복구하는 데 사용되므로 절대 타인과 공유하지 마세요.
5. 시드 구문 확인 화면에서, 표시된 순서대로 단어를 선택하여 시드 구문을 확인합니다.
6. 모든 설정이 완료되면 대시보드로 이동합니다.

### 기존 지갑 가져오기

1. "지갑 가져오기" 버튼을 클릭합니다.
2. 다음 방법 중 하나를 선택합니다:
   - 시드 구문으로 가져오기
   - 개인 키로 가져오기
   - 키스토어 파일로 가져오기
   - 하드웨어 지갑 연결하기 (Ledger, Trezor)
3. 선택한 방법에 따라 필요한 정보를 입력합니다.
4. 새 암호를 설정합니다.
5. "가져오기" 버튼을 클릭하여 지갑 가져오기를 완료합니다.

## 지갑 보안 설정

TORI 지갑의 보안을 강화하기 위해 다음 설정을 추천합니다:

1. **자동 잠금 설정**:
   - 설정 > 보안 > 자동 잠금 시간에서 적절한 시간을 설정합니다.

2. **생체 인증 활성화** (지원 기기만 해당):
   - 설정 > 보안 > 생체 인증에서 활성화합니다.

3. **2단계 인증(2FA) 설정**:
   - 설정 > 보안 > 2단계 인증에서 설정할 수 있습니다.

4. **백업 확인**:
   - 설정 > 보안 > 백업 확인에서 시드 구문이 올바르게 백업되었는지 확인할 수 있습니다.

## 기본 기능 사용하기

### 자산 확인하기

1. 대시보드에서 모든 자산의 총 가치와 목록을 확인할 수 있습니다.
2. 네트워크 선택 드롭다운을 사용하여 다양한 블록체인 네트워크 간에 전환할 수 있습니다.
3. 자산을 탭하면 해당 자산의 상세 정보와 거래 내역을 볼 수 있습니다.

### 자산 전송하기

1. 대시보드에서 "전송" 버튼을 클릭합니다.
2. 전송할 자산을 선택합니다.
3. 수신자 주소를 입력하거나 QR 코드를 스캔합니다.
4. 전송할 금액을 입력합니다.
5. 가스비/수수료를 검토하고 필요시 조정합니다.
6. "전송" 버튼을 클릭하고 거래를 확인합니다.
7. 암호나 생체 인증으로 거래를 승인합니다.

### 자산 수신하기

1. 대시보드에서 "수신" 버튼을 클릭합니다.
2. 수신할 자산 및 네트워크를 선택합니다.
3. 귀하의 지갑 주소와 QR 코드가 표시됩니다.
4. 이 주소를 복사하여 송금자에게 공유하거나, QR 코드를 스캔하도록 안내합니다.

## 다음 단계

이제 TORI 지갑의 기본 설정과 사용법을 익혔습니다. 더 자세한 기능과 고급 사용법은 다음 가이드를 참고하세요:

- [지갑 설정 상세 가이드](wallet-setup.md)
- [자산 전송 상세 가이드](sending-assets.md)
- [스테이킹 가이드](staking-guide.md)
- [NFT 관리 가이드](nft-guide.md)
- [크로스체인 기능 가이드](crosschain-guide.md)

문제가 발생하거나 추가 도움이 필요하면 [TORI 지갑 지원 페이지](https://tori-wallet.creatachain.com/support)를 방문하거나 [support@toriwallet.creatachain.com](mailto:support@toriwallet.creatachain.com)으로 이메일을 보내주세요.