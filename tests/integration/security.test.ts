import { SecurityService } from '../../packages/core/src/services/security/authentication';
import { BiometricService } from '../../packages/core/src/services/security/biometrics';
import { SocialRecoveryService } from '../../packages/core/src/services/security/social-recovery';
import { MultisigService } from '../../packages/core/src/services/security/multisig';
import { KeystoreService } from '../../packages/core/src/services/security/keystore';
import { StorageService } from '../../packages/core/src/services/storage/secure';
import { TwoFactorService } from '../../packages/core/src/services/security/2fa';

// 모킹 설정
jest.mock('../../packages/core/src/services/security/biometrics');
jest.mock('../../packages/core/src/services/security/social-recovery');
jest.mock('../../packages/core/src/services/security/multisig');
jest.mock('../../packages/core/src/services/security/keystore');
jest.mock('../../packages/core/src/services/storage/secure');
jest.mock('../../packages/core/src/services/security/2fa');

describe('Security Integration Tests', () => {
  let securityService: SecurityService;
  let mockBiometricService: jest.Mocked<BiometricService>;
  let mockSocialRecoveryService: jest.Mocked<SocialRecoveryService>;
  let mockMultisigService: jest.Mocked<MultisigService>;
  let mockKeystoreService: jest.Mocked<KeystoreService>;
  let mockStorageService: jest.Mocked<StorageService>;
  let mockTwoFactorService: jest.Mocked<TwoFactorService>;

  beforeEach(() => {
    // 모킹된 서비스 설정
    mockBiometricService = new BiometricService() as jest.Mocked<BiometricService>;
    mockSocialRecoveryService = new SocialRecoveryService() as jest.Mocked<SocialRecoveryService>;
    mockMultisigService = new MultisigService() as jest.Mocked<MultisigService>;
    mockKeystoreService = new KeystoreService() as jest.Mocked<KeystoreService>;
    mockStorageService = new StorageService() as jest.Mocked<StorageService>;
    mockTwoFactorService = new TwoFactorService() as jest.Mocked<TwoFactorService>;
    
    // 모킹된 메서드 설정
    mockBiometricService.isBiometricAvailable.mockResolvedValue(true);
    mockBiometricService.enableBiometricAuth.mockResolvedValue(true);
    mockBiometricService.authenticateWithBiometric.mockResolvedValue(true);
    
    mockSocialRecoveryService.setupRecovery.mockResolvedValue({
      recoveryId: 'recovery123',
      threshold: 2,
      guardians: [
        { id: 'guardian1', address: '0x1111111111111111111111111111111111111111' },
        { id: 'guardian2', address: '0x2222222222222222222222222222222222222222' },
        { id: 'guardian3', address: '0x3333333333333333333333333333333333333333' },
      ],
    });
    mockSocialRecoveryService.initiateRecovery.mockResolvedValue({
      recoveryId: 'recovery123',
      requestId: 'request123',
      status: 'pending',
      createdAt: Date.now(),
    });
    mockSocialRecoveryService.approveRecovery.mockResolvedValue(true);
    mockSocialRecoveryService.executeRecovery.mockResolvedValue({
      success: true,
      newWallet: {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      },
    });
    
    mockMultisigService.createMultisigWallet.mockResolvedValue({
      address: '0xmultisig1234567890abcdef1234567890abcdef',
      owners: [
        '0x1111111111111111111111111111111111111111',
        '0x2222222222222222222222222222222222222222',
      ],
      threshold: 2,
      chainId: 1,
    });
    mockMultisigService.proposeTransaction.mockResolvedValue({
      transactionId: 'tx123',
      status: 'pending',
      approvals: 1,
      requiredApprovals: 2,
    });
    mockMultisigService.approveTransaction.mockResolvedValue({
      transactionId: 'tx123',
      status: 'pending',
      approvals: 2,
      requiredApprovals: 2,
    });
    mockMultisigService.executeTransaction.mockResolvedValue({
      transactionId: 'tx123',
      status: 'executed',
      txHash: '0xmultisigtxhash',
    });
    
    mockKeystoreService.exportKeystore.mockResolvedValue({
      keystore: 'encrypted-keystore-data',
      address: '0x1234567890abcdef1234567890abcdef12345678',
    });
    mockKeystoreService.importKeystore.mockResolvedValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    });
    
    mockStorageService.set.mockResolvedValue(undefined);
    mockStorageService.get.mockResolvedValue('encrypted-data');
    mockStorageService.has.mockResolvedValue(true);
    mockStorageService.remove.mockResolvedValue(undefined);
    
    mockTwoFactorService.setupTwoFactor.mockResolvedValue({
      secret: 'TOTP_SECRET',
      qrCodeUrl: 'otpauth://totp/TORI:user@example.com?secret=TOTP_SECRET&issuer=TORI',
    });
    mockTwoFactorService.verifyTwoFactor.mockImplementation((token) => {
      return Promise.resolve(token === '123456');
    });
    mockTwoFactorService.isTwoFactorEnabled.mockResolvedValue(true);
    
    // 보안 서비스 초기화
    securityService = new SecurityService(
      mockBiometricService,
      mockSocialRecoveryService,
      mockMultisigService,
      mockKeystoreService,
      mockStorageService,
      mockTwoFactorService
    );
  });

  test('should check if security features are available', async () => {
    const isBiometricAvailable = await securityService.isBiometricAuthAvailable();
    expect(isBiometricAvailable).toBe(true);
    
    const isTwoFactorEnabled = await securityService.isTwoFactorEnabled();
    expect(isTwoFactorEnabled).toBe(true);
    
    // 소셜 복구 메커니즘이 설정되었는지 확인
    mockStorageService.has.mockResolvedValueOnce(true);
    const isRecoverySetup = await securityService.isSocialRecoverySetup();
    expect(isRecoverySetup).toBe(true);
  });

  test('should enable biometric authentication', async () => {
    const walletPassword = 'securePassword';
    const result = await securityService.enableBiometricAuth(walletPassword);
    
    expect(mockBiometricService.enableBiometricAuth).toHaveBeenCalled();
    expect(mockStorageService.set).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  test('should authenticate with biometric', async () => {
    const result = await securityService.authenticateWithBiometric();
    
    expect(mockBiometricService.authenticateWithBiometric).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  test('should set up social recovery', async () => {
    const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const guardians = [
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
      '0x3333333333333333333333333333333333333333',
    ];
    const threshold = 2;
    
    const result = await securityService.setupSocialRecovery(privateKey, guardians, threshold);
    
    expect(mockSocialRecoveryService.setupRecovery).toHaveBeenCalled();
    expect(mockStorageService.set).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.recoveryId).toBe('recovery123');
    expect(result.threshold).toBe(2);
    expect(result.guardians.length).toBe(3);
  });

  test('should initiate social recovery', async () => {
    const recoveryAddress = '0x1234567890abcdef1234567890abcdef12345678';
    
    const result = await securityService.initiateSocialRecovery(recoveryAddress);
    
    expect(mockSocialRecoveryService.initiateRecovery).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.recoveryId).toBe('recovery123');
    expect(result.requestId).toBe('request123');
    expect(result.status).toBe('pending');
  });

  test('should approve and execute social recovery', async () => {
    const requestId = 'request123';
    const guardianPrivateKeys = [
      '0xguardian1privatekey',
      '0xguardian2privatekey',
    ];
    
    // 승인
    const approvalResult = await securityService.approveSocialRecovery(requestId, guardianPrivateKeys[0]);
    expect(mockSocialRecoveryService.approveRecovery).toHaveBeenCalled();
    expect(approvalResult).toBe(true);
    
    // 실행
    const executionResult = await securityService.executeSocialRecovery(requestId);
    expect(mockSocialRecoveryService.executeRecovery).toHaveBeenCalled();
    expect(executionResult).toBeDefined();
    expect(executionResult.success).toBe(true);
    expect(executionResult.newWallet).toBeDefined();
    expect(executionResult.newWallet.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
  });

  test('should create multisig wallet', async () => {
    const owners = [
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
    ];
    const threshold = 2;
    const chainId = 1;
    
    const result = await securityService.createMultisigWallet(owners, threshold, chainId);
    
    expect(mockMultisigService.createMultisigWallet).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.address).toBe('0xmultisig1234567890abcdef1234567890abcdef');
    expect(result.owners).toEqual(owners);
    expect(result.threshold).toBe(threshold);
    expect(result.chainId).toBe(chainId);
  });

  test('should propose, approve, and execute multisig transaction', async () => {
    const multisigAddress = '0xmultisig1234567890abcdef1234567890abcdef';
    const to = '0x9876543210abcdef1234567890abcdef12345678';
    const value = '1000000000000000000'; // 1 ETH
    const data = '0x';
    const ownerPrivateKey = '0xowner1privatekey';
    
    // 트랜잭션 제안
    const proposeResult = await securityService.proposeMultisigTransaction(
      multisigAddress,
      to,
      value,
      data,
      ownerPrivateKey
    );
    
    expect(mockMultisigService.proposeTransaction).toHaveBeenCalled();
    expect(proposeResult).toBeDefined();
    expect(proposeResult.transactionId).toBe('tx123');
    expect(proposeResult.status).toBe('pending');
    expect(proposeResult.approvals).toBe(1);
    
    // 트랜잭션 승인
    const approveResult = await securityService.approveMultisigTransaction(
      multisigAddress,
      'tx123',
      ownerPrivateKey
    );
    
    expect(mockMultisigService.approveTransaction).toHaveBeenCalled();
    expect(approveResult).toBeDefined();
    expect(approveResult.transactionId).toBe('tx123');
    expect(approveResult.approvals).toBe(2);
    
    // 트랜잭션 실행
    const executeResult = await securityService.executeMultisigTransaction(
      multisigAddress,
      'tx123',
      ownerPrivateKey
    );
    
    expect(mockMultisigService.executeTransaction).toHaveBeenCalled();
    expect(executeResult).toBeDefined();
    expect(executeResult.transactionId).toBe('tx123');
    expect(executeResult.status).toBe('executed');
    expect(executeResult.txHash).toBe('0xmultisigtxhash');
  });

  test('should export and import keystore', async () => {
    const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const password = 'securePassword';
    
    // 키스토어 내보내기
    const exportResult = await securityService.exportKeystore(privateKey, password);
    
    expect(mockKeystoreService.exportKeystore).toHaveBeenCalled();
    expect(exportResult).toBeDefined();
    expect(exportResult.keystore).toBe('encrypted-keystore-data');
    expect(exportResult.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
    
    // 키스토어 가져오기
    const importResult = await securityService.importKeystore('encrypted-keystore-data', password);
    
    expect(mockKeystoreService.importKeystore).toHaveBeenCalled();
    expect(importResult).toBeDefined();
    expect(importResult.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
    expect(importResult.privateKey).toBe('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
  });

  test('should set up and verify two-factor authentication', async () => {
    const email = 'user@example.com';
    
    // 2FA 설정
    const setupResult = await securityService.setupTwoFactor(email);
    
    expect(mockTwoFactorService.setupTwoFactor).toHaveBeenCalled();
    expect(setupResult).toBeDefined();
    expect(setupResult.secret).toBe('TOTP_SECRET');
    expect(setupResult.qrCodeUrl).toContain('TOTP_SECRET');
    
    // 올바른 토큰으로 2FA 확인
    const validResult = await securityService.verifyTwoFactor('123456');
    
    expect(mockTwoFactorService.verifyTwoFactor).toHaveBeenCalled();
    expect(validResult).toBe(true);
    
    // 잘못된 토큰으로 2FA 확인
    const invalidResult = await securityService.verifyTwoFactor('654321');
    
    expect(mockTwoFactorService.verifyTwoFactor).toHaveBeenCalled();
    expect(invalidResult).toBe(false);
  });

  test('should enable and disable security features', async () => {
    // 2FA 활성화
    await securityService.enableTwoFactor('user@example.com', '123456');
    
    expect(mockTwoFactorService.setupTwoFactor).toHaveBeenCalled();
    expect(mockTwoFactorService.verifyTwoFactor).toHaveBeenCalled();
    expect(mockStorageService.set).toHaveBeenCalled();
    
    // 2FA 비활성화
    await securityService.disableTwoFactor('123456');
    
    expect(mockTwoFactorService.verifyTwoFactor).toHaveBeenCalled();
    expect(mockStorageService.remove).toHaveBeenCalled();
    
    // 바이오메트릭 비활성화
    await securityService.disableBiometricAuth();
    
    expect(mockStorageService.remove).toHaveBeenCalled();
  });

  test('should enforce security policies', async () => {
    // 보안 정책 설정
    const securityPolicy = {
      requireTwoFactorForTransfers: true,
      requireBiometricForLogin: true,
      autoLockTimeout: 5, // 분 단위
      passwordRequirements: {
        minLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
      },
    };
    
    await securityService.setSecurityPolicy(securityPolicy);
    expect(mockStorageService.set).toHaveBeenCalled();
    
    // 보안 정책 가져오기
    mockStorageService.get.mockResolvedValueOnce(JSON.stringify(securityPolicy));
    const retrievedPolicy = await securityService.getSecurityPolicy();
    
    expect(retrievedPolicy).toEqual(securityPolicy);
    
    // 비밀번호 검증
    const validPassword = 'SecureP@ss123';
    const invalidPassword = 'password';
    
    expect(securityService.validatePassword(validPassword)).toBe(true);
    expect(securityService.validatePassword(invalidPassword)).toBe(false);
  });
});
