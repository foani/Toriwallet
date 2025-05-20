import { test, expect, Page } from '@playwright/test';

// 브라우저 확장 프로그램을 위한 E2E 테스트
// 실제 테스트에서는 Playwright의 브라우저 확장 테스트 기능을 사용해야 합니다.

test.describe('Wallet Extension E2E Tests', () => {
  let page: Page;
  
  test.beforeEach(async ({ browser }) => {
    // 브라우저 확장 프로그램을 로드한 상태로 새 페이지 생성
    page = await browser.newPage();
    
    // 확장 프로그램 팝업 페이지 로드 (로컬 개발 서버에서 서빙되는 확장 프로그램 페이지)
    await page.goto('http://localhost:3000/popup.html');
  });

  test('should show welcome page on first load', async () => {
    // 환영 페이지 확인
    const welcomeTitle = await page.locator('h1:has-text("Welcome to TORI Wallet")');
    await expect(welcomeTitle).toBeVisible();
    
    // 시작하기 버튼 확인
    const getStartedButton = await page.locator('button:has-text("Get Started")');
    await expect(getStartedButton).toBeVisible();
  });

  test('should create a new wallet', async () => {
    // 환영 페이지에서 시작하기 버튼 클릭
    await page.click('button:has-text("Get Started")');
    
    // 지갑 생성 버튼 클릭
    await page.click('button:has-text("Create New Wallet")');
    
    // 비밀번호 설정
    await page.fill('input[type="password"][placeholder="Password"]', 'SecurePass123!');
    await page.fill('input[type="password"][placeholder="Confirm Password"]', 'SecurePass123!');
    await page.click('button:has-text("Continue")');
    
    // 니모닉 표시 페이지 확인
    const mnemonicTitle = await page.locator('h1:has-text("Backup Seed Phrase")');
    await expect(mnemonicTitle).toBeVisible();
    
    // 니모닉 단어들이 표시되는지 확인
    const mnemonicWords = await page.locator('.mnemonic-word');
    expect(await mnemonicWords.count()).toBe(12);
    
    // 백업 확인 버튼 클릭
    await page.click('button:has-text("I\'ve Backed It Up")');
    
    // 니모닉 확인 페이지 확인
    const verifyTitle = await page.locator('h1:has-text("Verify Seed Phrase")');
    await expect(verifyTitle).toBeVisible();
    
    // 테스트 목적으로 이미 알고 있는 니모닉 단어 사용 (실제 테스트에서는 이전 단계에서 표시된 니모닉을 캡처해야 함)
    const mnemonicWordElements = await page.$$('.mnemonic-word');
    const words = [];
    for (const element of mnemonicWordElements) {
      words.push(await element.textContent());
    }
    
    // 확인을 위해 요청된 단어 입력
    const wordInputs = await page.$$('.word-verification-input');
    for (let i = 0; i < wordInputs.length; i++) {
      const verificationIndex = parseInt(await wordInputs[i].getAttribute('data-index'));
      await wordInputs[i].fill(words[verificationIndex]);
    }
    
    // 확인 버튼 클릭
    await page.click('button:has-text("Verify")');
    
    // 지갑 생성 완료 페이지 확인
    const successTitle = await page.locator('h1:has-text("Wallet Created Successfully")');
    await expect(successTitle).toBeVisible();
    
    // 대시보드로 이동 버튼 클릭
    await page.click('button:has-text("Go to Dashboard")');
    
    // 대시보드 페이지 확인
    const dashboardTitle = await page.locator('h1:has-text("Dashboard")');
    await expect(dashboardTitle).toBeVisible();
    
    // 계정 주소가 표시되는지 확인
    const accountAddress = await page.locator('.account-address');
    await expect(accountAddress).toBeVisible();
  });

  test('should import wallet from mnemonic', async () => {
    // 환영 페이지에서 시작하기 버튼 클릭
    await page.click('button:has-text("Get Started")');
    
    // 지갑 가져오기 버튼 클릭
    await page.click('button:has-text("Import Wallet")');
    
    // 니모닉 가져오기 선택
    await page.click('button:has-text("Seed Phrase")');
    
    // 테스트용 니모닉 입력
    const testMnemonic = "test test test test test test test test test test test junk";
    await page.fill('textarea[placeholder="Enter your seed phrase"]', testMnemonic);
    
    // 비밀번호 설정
    await page.fill('input[type="password"][placeholder="Password"]', 'SecurePass123!');
    await page.fill('input[type="password"][placeholder="Confirm Password"]', 'SecurePass123!');
    
    // 가져오기 버튼 클릭
    await page.click('button:has-text("Import")');
    
    // 가져오기 완료 확인
    const successTitle = await page.locator('h1:has-text("Wallet Imported Successfully")');
    await expect(successTitle).toBeVisible();
    
    // 대시보드로 이동 버튼 클릭
    await page.click('button:has-text("Go to Dashboard")');
    
    // 대시보드 페이지 확인
    const dashboardTitle = await page.locator('h1:has-text("Dashboard")');
    await expect(dashboardTitle).toBeVisible();
    
    // 가져온 계정 주소가 표시되는지 확인
    const accountAddress = await page.locator('.account-address');
    await expect(accountAddress).toBeVisible();
    // 특정 주소 확인 (테스트 니모닉의 예상 주소)
    await expect(accountAddress).toHaveText(/0x[0-9a-fA-F]{40}/);
  });

  test('should send a transaction', async () => {
    // 지갑 이미 생성된 상태를 가정
    // 비밀번호로 잠금 해제
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Unlock")');
    
    // 대시보드 페이지 확인
    const dashboardTitle = await page.locator('h1:has-text("Dashboard")');
    await expect(dashboardTitle).toBeVisible();
    
    // 전송 버튼 클릭
    await page.click('button:has-text("Send")');
    
    // 전송 페이지 확인
    const sendTitle = await page.locator('h1:has-text("Send")');
    await expect(sendTitle).toBeVisible();
    
    // 수신자 주소 입력
    await page.fill('input[placeholder="Recipient Address"]', '0x9876543210abcdef1234567890abcdef12345678');
    
    // 금액 입력
    await page.fill('input[placeholder="Amount"]', '0.01');
    
    // 전송 버튼 클릭
    await page.click('button:has-text("Next")');
    
    // 트랜잭션 확인 모달 확인
    const confirmationTitle = await page.locator('h2:has-text("Confirm Transaction")');
    await expect(confirmationTitle).toBeVisible();
    
    // 트랜잭션 세부 정보 확인
    const recipientAddress = await page.locator('.recipient-address');
    await expect(recipientAddress).toHaveText('0x9876543210abcdef1234567890abcdef12345678');
    
    const amount = await page.locator('.transaction-amount');
    await expect(amount).toHaveText('0.01 ETH');
    
    // 확인 버튼 클릭
    await page.click('button:has-text("Confirm")');
    
    // 트랜잭션 제출 확인
    const submittedTitle = await page.locator('h2:has-text("Transaction Submitted")');
    await expect(submittedTitle).toBeVisible();
    
    // 트랜잭션 해시가 표시되는지 확인
    const txHash = await page.locator('.transaction-hash');
    await expect(txHash).toBeVisible();
    await expect(txHash).toHaveText(/0x[0-9a-fA-F]{64}/);
    
    // 대시보드로 돌아가기
    await page.click('button:has-text("Back to Dashboard")');
    
    // 대시보드 페이지 확인
    await expect(dashboardTitle).toBeVisible();
  });

  test('should connect to a dApp', async () => {
    // 지갑 이미 생성된 상태를 가정
    // 비밀번호로 잠금 해제
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Unlock")');
    
    // 브라우저에서 dApp 페이지 열기
    const dAppPage = await page.context().newPage();
    await dAppPage.goto('http://localhost:8000/example-dapp');
    
    // dApp에서 지갑 연결 버튼 클릭
    await dAppPage.click('button:has-text("Connect Wallet")');
    
    // 확장 프로그램 팝업에서 연결 요청 확인
    const connectionRequest = await page.locator('h2:has-text("Connection Request")');
    await expect(connectionRequest).toBeVisible();
    
    // dApp 정보 확인
    const dAppName = await page.locator('.dapp-name');
    await expect(dAppName).toHaveText('Example DApp');
    
    // 연결 허용
    await page.click('button:has-text("Connect")');
    
    // dApp 페이지에서 연결 성공 확인
    const connectedStatus = await dAppPage.locator('.connection-status');
    await expect(connectedStatus).toHaveText('Connected');
    
    // 연결된 계정 주소 확인
    const connectedAddress = await dAppPage.locator('.connected-address');
    await expect(connectedAddress).toBeVisible();
    await expect(connectedAddress).toHaveText(/0x[0-9a-fA-F]{40}/);
  });

  test('should sign a message from dApp', async () => {
    // 지갑 이미 생성된 상태를 가정
    // 비밀번호로 잠금 해제
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Unlock")');
    
    // 브라우저에서 dApp 페이지 열기 (이미 연결된 상태 가정)
    const dAppPage = await page.context().newPage();
    await dAppPage.goto('http://localhost:8000/example-dapp');
    
    // dApp에서 메시지 서명 버튼 클릭
    await dAppPage.click('button:has-text("Sign Message")');
    
    // 확장 프로그램 팝업에서 서명 요청 확인
    const signatureRequest = await page.locator('h2:has-text("Signature Request")');
    await expect(signatureRequest).toBeVisible();
    
    // 서명할 메시지 확인
    const messageToSign = await page.locator('.message-to-sign');
    await expect(messageToSign).toHaveText('Hello, Blockchain!');
    
    // 서명 허용
    await page.click('button:has-text("Sign")');
    
    // dApp 페이지에서 서명 성공 확인
    const signatureStatus = await dAppPage.locator('.signature-status');
    await expect(signatureStatus).toHaveText('Signed');
    
    // 서명 결과 확인
    const signature = await dAppPage.locator('.signature-result');
    await expect(signature).toBeVisible();
    await expect(signature).toHaveText(/0x[0-9a-fA-F]{130}/);
  });
});
