import { test, expect, Page } from '@playwright/test';

// 모바일 앱을 위한 E2E 테스트
// 실제 테스트에서는 Appium이나 Detox와 같은 모바일 앱 테스트 프레임워크를 사용해야 합니다.
// 이 예시는 Playwright를 사용한 웹뷰 테스트를 보여줍니다.

test.describe('Mobile App Onboarding E2E Tests', () => {
  let page: Page;
  
  test.beforeEach(async ({ browser }) => {
    // 모바일 에뮬레이터/시뮬레이터 또는 웹 기반 모바일 앱 테스트 환경 설정
    page = await browser.newPage();
    
    // 모바일 앱의 WebView URL로 이동 (테스트 목적으로 사용)
    await page.goto('http://localhost:3000/mobile-app');
  });

  test('should show welcome screen on first launch', async () => {
    // 환영 화면 확인
    const welcomeTitle = await page.locator('h1:has-text("Welcome to TORI Wallet")');
    await expect(welcomeTitle).toBeVisible();
    
    // 시작하기 버튼 확인
    const getStartedButton = await page.locator('button:has-text("Get Started")');
    await expect(getStartedButton).toBeVisible();
  });

  test('should create a new wallet on mobile app', async () => {
    // 환영 화면에서 시작하기 버튼 클릭
    await page.click('button:has-text("Get Started")');
    
    // 지갑 생성 버튼 클릭
    await page.click('button:has-text("Create New Wallet")');
    
    // 비밀번호 설정
    await page.fill('input[type="password"][placeholder="Password"]', 'SecurePass123!');
    await page.fill('input[type="password"][placeholder="Confirm Password"]', 'SecurePass123!');
    
    // 생체 인증 설정 옵션 (모바일 기기에 해당)
    if (await page.locator('button:has-text("Enable Biometric Authentication")').isVisible()) {
      // 테스트 환경에서는 생체 인증 건너뛰기
      await page.click('button:has-text("Skip for Now")');
    }
    
    // 계속 버튼 클릭
    await page.click('button:has-text("Continue")');
    
    // 니모닉 표시 화면 확인
    const mnemonicTitle = await page.locator('h1:has-text("Backup Seed Phrase")');
    await expect(mnemonicTitle).toBeVisible();
    
    // 니모닉 단어들이 표시되는지 확인
    const mnemonicWords = await page.locator('.mnemonic-word');
    expect(await mnemonicWords.count()).toBe(12);
    
    // 백업 확인 버튼 클릭
    await page.click('button:has-text("I\'ve Backed It Up")');
    
    // 니모닉 확인 화면 확인
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
    
    // 지갑 생성 완료 화면 확인
    const successTitle = await page.locator('h1:has-text("Wallet Created Successfully")');
    await expect(successTitle).toBeVisible();
    
    // 대시보드로 이동 버튼 클릭
    await page.click('button:has-text("Go to Dashboard")');
    
    // 대시보드 화면 확인
    const dashboardTitle = await page.locator('h1:has-text("Dashboard")');
    await expect(dashboardTitle).toBeVisible();
    
    // 계정 주소가 표시되는지 확인
    const accountAddress = await page.locator('.account-address');
    await expect(accountAddress).toBeVisible();
  });

  test('should import wallet from mnemonic on mobile app', async () => {
    // 환영 화면에서 시작하기 버튼 클릭
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
    
    // 생체 인증 설정 옵션 (모바일 기기에 해당)
    if (await page.locator('button:has-text("Enable Biometric Authentication")').isVisible()) {
      // 테스트 환경에서는 생체 인증 건너뛰기
      await page.click('button:has-text("Skip for Now")');
    }
    
    // 가져오기 버튼 클릭
    await page.click('button:has-text("Import")');
    
    // 가져오기 완료 확인
    const successTitle = await page.locator('h1:has-text("Wallet Imported Successfully")');
    await expect(successTitle).toBeVisible();
    
    // 대시보드로 이동 버튼 클릭
    await page.click('button:has-text("Go to Dashboard")');
    
    // 대시보드 화면 확인
    const dashboardTitle = await page.locator('h1:has-text("Dashboard")');
    await expect(dashboardTitle).toBeVisible();
    
    // 가져온 계정 주소가 표시되는지 확인
    const accountAddress = await page.locator('.account-address');
    await expect(accountAddress).toBeVisible();
    // 특정 주소 확인 (테스트 니모닉의 예상 주소)
    await expect(accountAddress).toHaveText(/0x[0-9a-fA-F]{40}/);
  });
});
