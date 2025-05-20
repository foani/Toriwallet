import { test, expect, Page } from '@playwright/test';

// 데스크톱 앱을 위한 E2E 테스트
// 실제 테스트에서는 Playwright의 Electron 테스트 기능을 사용해야 합니다.

test.describe('Desktop App Dashboard E2E Tests', () => {
  let page: Page;
  
  test.beforeEach(async ({ browser }) => {
    // Electron 앱 실행 및 연결 (실제 테스트에서는 Electron 앱 연결)
    page = await browser.newPage();
    
    // 데스크톱 앱의 로컬 URL로 이동 (테스트 목적으로 사용)
    await page.goto('http://localhost:3000/desktop-app');
    
    // 지갑이 이미 생성된 상태를 가정
    // 비밀번호로 잠금 해제
    await page.fill('input[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Unlock")');
    
    // 대시보드 페이지 확인
    const dashboardTitle = await page.locator('h1:has-text("Dashboard")');
    await expect(dashboardTitle).toBeVisible();
  });

  test('should display wallet accounts and balances', async () => {
    // 계정 섹션 확인
    const accountsSection = await page.locator('section:has-text("My Accounts")');
    await expect(accountsSection).toBeVisible();
    
    // 계정 항목이 표시되는지 확인
    const accountItems = await page.locator('.account-item');
    expect(await accountItems.count()).toBeGreaterThan(0);
    
    // 첫 번째 계정의 주소와 잔액 확인
    const firstAccount = accountItems.first();
    const accountAddress = await firstAccount.locator('.account-address');
    await expect(accountAddress).toBeVisible();
    await expect(accountAddress).toHaveText(/0x[0-9a-fA-F]{40}/);
    
    const accountBalance = await firstAccount.locator('.account-balance');
    await expect(accountBalance).toBeVisible();
  });

  test('should navigate between sidebar menu items', async () => {
    // 사이드바 메뉴 항목 확인
    const sidebarItems = await page.locator('.sidebar-item');
    expect(await sidebarItems.count()).toBeGreaterThan(3); // 최소 4개의 메뉴 항목이 있어야 함
    
    // 스테이킹 메뉴 클릭
    await page.click('.sidebar-item:has-text("Staking")');
    
    // 스테이킹 페이지 확인
    const stakingTitle = await page.locator('h1:has-text("Staking")');
    await expect(stakingTitle).toBeVisible();
    
    // NFT 메뉴 클릭
    await page.click('.sidebar-item:has-text("NFT")');
    
    // NFT 페이지 확인
    const nftTitle = await page.locator('h1:has-text("NFT Gallery")');
    await expect(nftTitle).toBeVisible();
    
    // 설정 메뉴 클릭
    await page.click('.sidebar-item:has-text("Settings")');
    
    // 설정 페이지 확인
    const settingsTitle = await page.locator('h1:has-text("Settings")');
    await expect(settingsTitle).toBeVisible();
    
    // 대시보드로 돌아가기
    await page.click('.sidebar-item:has-text("Dashboard")');
    
    // 대시보드 페이지 확인
    const dashboardTitle = await page.locator('h1:has-text("Dashboard")');
    await expect(dashboardTitle).toBeVisible();
  });

  test('should display transaction history', async () => {
    // 트랜잭션 내역 섹션 확인
    const transactionsSection = await page.locator('section:has-text("Transaction History")');
    await expect(transactionsSection).toBeVisible();
    
    // 트랜잭션 더 보기 버튼 클릭
    await page.click('button:has-text("View All")');
    
    // 트랜잭션 내역 페이지 확인
    const transactionsTitle = await page.locator('h1:has-text("Transaction History")');
    await expect(transactionsTitle).toBeVisible();
    
    // 트랜잭션 필터 확인
    const filterDropdown = await page.locator('select.transaction-filter');
    await expect(filterDropdown).toBeVisible();
    
    // 전송 필터 선택
    await filterDropdown.selectOption('transfers');
    
    // 전송 트랜잭션만 표시되는지 확인
    const transferTransactions = await page.locator('.transaction-item.transfer');
    const allTransactions = await page.locator('.transaction-item');
    expect(await transferTransactions.count()).toBe(await allTransactions.count());
    
    // 받기 필터 선택
    await filterDropdown.selectOption('receives');
    
    // 받기 트랜잭션만 표시되는지 확인
    const receiveTransactions = await page.locator('.transaction-item.receive');
    expect(await receiveTransactions.count()).toBe(await allTransactions.count());
  });

  test('should create and switch between multiple accounts', async () => {
    // 계정 관리 페이지로 이동
    await page.click('button:has-text("Manage Accounts")');
    
    // 계정 관리 페이지 확인
    const accountsTitle = await page.locator('h1:has-text("Manage Accounts")');
    await expect(accountsTitle).toBeVisible();
    
    // 기존 계정 수 확인
    const accountItems = await page.locator('.account-item');
    const initialAccountCount = await accountItems.count();
    
    // 새 계정 추가 버튼 클릭
    await page.click('button:has-text("Add Account")');
    
    // 새 계정 대화상자 확인
    const newAccountModal = await page.locator('.modal:has-text("Create New Account")');
    await expect(newAccountModal).toBeVisible();
    
    // 계정 이름 입력
    await page.fill('input[placeholder="Account Name"]', 'Test Account');
    
    // 확인 버튼 클릭
    await page.click('button:has-text("Create")');
    
    // 계정이 추가되었는지 확인
    const updatedAccountItems = await page.locator('.account-item');
    expect(await updatedAccountItems.count()).toBe(initialAccountCount + 1);
    
    // 새 계정 이름 확인
    const newAccountName = await updatedAccountItems.nth(initialAccountCount).locator('.account-name');
    await expect(newAccountName).toHaveText('Test Account');
    
    // 새 계정 선택
    await updatedAccountItems.nth(initialAccountCount).click();
    
    // 선택된 계정이 변경되었는지 확인
    const activeAccount = await page.locator('.account-item.active');
    const activeAccountName = await activeAccount.locator('.account-name');
    await expect(activeAccountName).toHaveText('Test Account');
  });

  test('should display network selector and switch networks', async () => {
    // 네트워크 선택기 확인
    const networkSelector = await page.locator('.network-selector');
    await expect(networkSelector).toBeVisible();
    
    // 현재 선택된 네트워크 확인
    const selectedNetwork = await networkSelector.locator('.selected-network');
    await expect(selectedNetwork).toBeVisible();
    
    // 네트워크 선택기 클릭하여 드롭다운 열기
    await networkSelector.click();
    
    // 네트워크 목록 확인
    const networkList = await page.locator('.network-list');
    await expect(networkList).toBeVisible();
    
    // 다른 네트워크 선택 (예: Catena)
    const catenaNetwork = await networkList.locator('.network-item:has-text("Catena")');
    await catenaNetwork.click();
    
    // 선택된 네트워크가 변경되었는지 확인
    await expect(selectedNetwork).toHaveText('Catena');
    
    // 카테나 체인 아이콘이 표시되는지 확인
    const networkIcon = await selectedNetwork.locator('.network-icon.catena');
    await expect(networkIcon).toBeVisible();
    
    // 자산 목록이 카테나 체인의 자산을 표시하는지 확인
    const assetsList = await page.locator('.assets-list');
    const firstAsset = await assetsList.locator('.asset-item').first();
    const assetSymbol = await firstAsset.locator('.asset-symbol');
    await expect(assetSymbol).toHaveText('CTA');
  });

  test('should display NFT gallery', async () => {
    // NFT 메뉴 클릭
    await page.click('.sidebar-item:has-text("NFT")');
    
    // NFT 페이지 확인
    const nftTitle = await page.locator('h1:has-text("NFT Gallery")');
    await expect(nftTitle).toBeVisible();
    
    // NFT 그리드 확인
    const nftGrid = await page.locator('.nft-grid');
    await expect(nftGrid).toBeVisible();
    
    // NFT 항목이 표시되는지 확인 (없을 수도 있음)
    const nftItems = await nftGrid.locator('.nft-item');
    
    if (await nftItems.count() > 0) {
      // 첫 번째 NFT 클릭
      await nftItems.first().click();
      
      // NFT 상세 정보 확인
      const nftDetailsModal = await page.locator('.modal:has-text("NFT Details")');
      await expect(nftDetailsModal).toBeVisible();
      
      // NFT 이름 확인
      const nftName = await nftDetailsModal.locator('.nft-name');
      await expect(nftName).toBeVisible();
      
      // NFT 전송 버튼 확인
      const sendButton = await nftDetailsModal.locator('button:has-text("Send")');
      await expect(sendButton).toBeVisible();
      
      // 모달 닫기
      await page.click('.modal-close');
    } else {
      // NFT가 없는 경우 안내 메시지 확인
      const emptyMessage = await page.locator('.empty-nft-message');
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('should access staking features', async () => {
    // 스테이킹 메뉴 클릭
    await page.click('.sidebar-item:has-text("Staking")');
    
    // 스테이킹 페이지 확인
    const stakingTitle = await page.locator('h1:has-text("Staking")');
    await expect(stakingTitle).toBeVisible();
    
    // 검증인 목록 확인
    const validatorsList = await page.locator('.validators-list');
    await expect(validatorsList).toBeVisible();
    
    // 스테이킹 버튼 확인
    const stakeButton = await page.locator('button:has-text("Stake")');
    await expect(stakeButton).toBeVisible();
    
    // 스테이킹 버튼 클릭
    await stakeButton.click();
    
    // 스테이킹 모달 확인
    const stakingModal = await page.locator('.modal:has-text("Stake Tokens")');
    await expect(stakingModal).toBeVisible();
    
    // 검증인 선택
    const validatorSelect = await stakingModal.locator('select.validator-select');
    await validatorSelect.selectOption({ index: 1 });
    
    // 금액 입력
    await stakingModal.locator('input[placeholder="Amount"]').fill('10');
    
    // 기간 선택
    const periodSelect = await stakingModal.locator('select.period-select');
    await periodSelect.selectOption('30');
    
    // 예상 보상 확인
    const estimatedRewards = await stakingModal.locator('.estimated-rewards');
    await expect(estimatedRewards).toBeVisible();
    
    // 취소 버튼 클릭 (실제 스테이킹하지 않음)
    await stakingModal.locator('button:has-text("Cancel")').click();
  });
});
