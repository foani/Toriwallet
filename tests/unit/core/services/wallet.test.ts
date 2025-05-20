import { WalletService } from '../../../../packages/core/src/services/wallet-service';
import { KeyringService } from '../../../../packages/core/src/services/crypto/keyring';
import { StorageService } from '../../../../packages/core/src/services/storage/secure';

// 모킹 라이브러리 임포트
jest.mock('../../../../packages/core/src/services/crypto/keyring');
jest.mock('../../../../packages/core/src/services/storage/secure');

describe('Wallet Service', () => {
  let walletService: WalletService;
  let mockKeyringService: jest.Mocked<KeyringService>;
  let mockStorageService: jest.Mocked<StorageService>;

  beforeEach(() => {
    mockKeyringService = new KeyringService() as jest.Mocked<KeyringService>;
    mockStorageService = new StorageService() as jest.Mocked<StorageService>;
    
    // 모킹된 메서드 설정
    mockKeyringService.createKeyring.mockReturnValue({
      mnemonic: 'test test test test test test test test test test test junk',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      address: '0x1234567890abcdef1234567890abcdef12345678',
    });
    
    mockKeyringService.encryptKeyring.mockResolvedValue('encryptedKeyring');
    mockKeyringService.unlockKeyring.mockResolvedValue({
      mnemonic: 'test test test test test test test test test test test junk',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      address: '0x1234567890abcdef1234567890abcdef12345678',
    });
    
    mockStorageService.set.mockResolvedValue(undefined);
    mockStorageService.get.mockResolvedValue('encryptedKeyring');
    mockStorageService.remove.mockResolvedValue(undefined);
    
    walletService = new WalletService(mockKeyringService, mockStorageService);
  });

  test('should create a new wallet', async () => {
    const password = 'securePassword';
    const wallet = await walletService.createWallet(password);
    
    expect(mockKeyringService.createKeyring).toHaveBeenCalledWith(password);
    expect(mockKeyringService.encryptKeyring).toHaveBeenCalled();
    expect(mockStorageService.set).toHaveBeenCalled();
    
    expect(wallet).toBeDefined();
    expect(wallet.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
    expect(wallet.mnemonic).toBe('test test test test test test test test test test test junk');
  });

  test('should import wallet from mnemonic', async () => {
    const mnemonic = 'test test test test test test test test test test test junk';
    const password = 'securePassword';
    
    mockKeyringService.importFromMnemonic.mockReturnValue({
      mnemonic: mnemonic,
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      address: '0x1234567890abcdef1234567890abcdef12345678',
    });
    
    const wallet = await walletService.importWalletFromMnemonic(mnemonic, password);
    
    expect(mockKeyringService.importFromMnemonic).toHaveBeenCalledWith(mnemonic);
    expect(mockKeyringService.encryptKeyring).toHaveBeenCalled();
    expect(mockStorageService.set).toHaveBeenCalled();
    
    expect(wallet).toBeDefined();
    expect(wallet.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
    expect(wallet.mnemonic).toBe(mnemonic);
  });

  test('should import wallet from private key', async () => {
    const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const password = 'securePassword';
    
    mockKeyringService.importFromPrivateKey.mockReturnValue({
      privateKey: privateKey,
      address: '0x1234567890abcdef1234567890abcdef12345678',
    });
    
    const wallet = await walletService.importWalletFromPrivateKey(privateKey, password);
    
    expect(mockKeyringService.importFromPrivateKey).toHaveBeenCalledWith(privateKey);
    expect(mockKeyringService.encryptKeyring).toHaveBeenCalled();
    expect(mockStorageService.set).toHaveBeenCalled();
    
    expect(wallet).toBeDefined();
    expect(wallet.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
    expect(wallet.privateKey).toBe(privateKey);
  });

  test('should unlock wallet', async () => {
    const password = 'securePassword';
    
    const wallet = await walletService.unlockWallet(password);
    
    expect(mockStorageService.get).toHaveBeenCalled();
    expect(mockKeyringService.unlockKeyring).toHaveBeenCalledWith('encryptedKeyring', password);
    
    expect(wallet).toBeDefined();
    expect(wallet.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
  });

  test('should fail to unlock wallet with wrong password', async () => {
    const password = 'wrongPassword';
    
    mockKeyringService.unlockKeyring.mockRejectedValue(new Error('Incorrect password'));
    
    await expect(
      walletService.unlockWallet(password)
    ).rejects.toThrow('Incorrect password');
  });

  test('should lock wallet', async () => {
    // 먼저 지갑 언락
    const password = 'securePassword';
    await walletService.unlockWallet(password);
    
    // 지갑 락
    await walletService.lockWallet();
    
    // 현재 지갑 상태 확인
    expect(walletService.isUnlocked()).toBe(false);
  });

  test('should get wallet info', async () => {
    // 먼저 지갑 언락
    const password = 'securePassword';
    await walletService.unlockWallet(password);
    
    const walletInfo = walletService.getWalletInfo();
    
    expect(walletInfo).toBeDefined();
    expect(walletInfo.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
  });

  test('should check if wallet exists', async () => {
    mockStorageService.has.mockResolvedValue(true);
    
    const exists = await walletService.walletExists();
    
    expect(mockStorageService.has).toHaveBeenCalled();
    expect(exists).toBe(true);
  });

  test('should delete wallet', async () => {
    await walletService.deleteWallet();
    
    expect(mockStorageService.remove).toHaveBeenCalled();
  });
});
