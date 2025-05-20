import { WalletService } from '../../packages/core/src/services/wallet-service';
import { KeyringService } from '../../packages/core/src/services/crypto/keyring';
import { StorageService } from '../../packages/core/src/services/storage/secure';
import { TransactionService } from '../../packages/core/src/services/transaction-service';
import { SignatureService } from '../../packages/core/src/services/crypto/signature';
import { NetworkService } from '../../packages/core/src/services/api/network-service';
import { TransactionType } from '../../packages/core/src/types/transaction';

// 실제 테스트 대신 모킹을 사용한 통합 테스트
jest.mock('../../packages/core/src/services/crypto/keyring');
jest.mock('../../packages/core/src/services/storage/secure');
jest.mock('../../packages/core/src/services/crypto/signature');
jest.mock('../../packages/core/src/services/api/network-service');

describe('Wallet Integration Tests', () => {
  let walletService: WalletService;
  let transactionService: TransactionService;
  let mockKeyringService: jest.Mocked<KeyringService>;
  let mockStorageService: jest.Mocked<StorageService>;
  let mockSignatureService: jest.Mocked<SignatureService>;
  let mockNetworkService: jest.Mocked<NetworkService>;

  beforeEach(() => {
    // 서비스 모킹 설정
    mockKeyringService = new KeyringService() as jest.Mocked<KeyringService>;
    mockStorageService = new StorageService() as jest.Mocked<StorageService>;
    mockSignatureService = new SignatureService() as jest.Mocked<SignatureService>;
    mockNetworkService = new NetworkService() as jest.Mocked<NetworkService>;
    
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
    
    mockSignatureService.signTransaction.mockResolvedValue('0xsignedTransaction');
    mockSignatureService.signMessage.mockResolvedValue('0xsignedMessage');
    
    mockNetworkService.getGasPrice.mockResolvedValue('20000000000'); // 20 Gwei
    mockNetworkService.estimateGas.mockResolvedValue('21000');
    mockNetworkService.getNonce.mockResolvedValue(0);
    mockNetworkService.sendTransaction.mockResolvedValue('0xtxHash');
    
    // 서비스 초기화
    walletService = new WalletService(mockKeyringService, mockStorageService);
    transactionService = new TransactionService(mockSignatureService, mockNetworkService);
  });

  test('should create wallet and send transaction', async () => {
    // 1. 지갑 생성
    const password = 'securePassword';
    const wallet = await walletService.createWallet(password);
    
    expect(wallet).toBeDefined();
    expect(wallet.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
    
    // 2. 트랜잭션 생성
    const toAddress = '0x9876543210abcdef1234567890abcdef12345678';
    const amount = '1000000000000000000'; // 1 ETH
    const chainId = 1;
    
    const tx = await transactionService.createTransaction(
      wallet.address,
      toAddress,
      amount,
      chainId
    );
    
    expect(tx).toBeDefined();
    expect(tx.from).toBe(wallet.address);
    expect(tx.to).toBe(toAddress);
    expect(tx.value).toBe(amount);
    expect(tx.chainId).toBe(chainId);
    expect(tx.type).toBe(TransactionType.TRANSFER);
    
    // 3. 트랜잭션 서명
    const signedTx = await transactionService.signTransaction(wallet.privateKey, tx);
    
    expect(mockSignatureService.signTransaction).toHaveBeenCalledWith(wallet.privateKey, tx);
    expect(signedTx).toBe('0xsignedTransaction');
    
    // 4. 트랜잭션 전송
    const txHash = await transactionService.sendTransaction(signedTx, chainId);
    
    expect(mockNetworkService.sendTransaction).toHaveBeenCalledWith(signedTx, chainId);
    expect(txHash).toBe('0xtxHash');
  });

  test('should import wallet from mnemonic and sign message', async () => {
    // 1. 니모닉에서 지갑 가져오기
    const mnemonic = 'test test test test test test test test test test test junk';
    const password = 'securePassword';
    
    mockKeyringService.importFromMnemonic.mockReturnValue({
      mnemonic: mnemonic,
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      address: '0x1234567890abcdef1234567890abcdef12345678',
    });
    
    const wallet = await walletService.importWalletFromMnemonic(mnemonic, password);
    
    expect(mockKeyringService.importFromMnemonic).toHaveBeenCalledWith(mnemonic);
    expect(wallet).toBeDefined();
    expect(wallet.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
    
    // 2. 메시지 서명
    const message = 'Hello, Blockchain!';
    const signature = await transactionService.signMessage(wallet.privateKey, message);
    
    expect(mockSignatureService.signMessage).toHaveBeenCalledWith(wallet.privateKey, message);
    expect(signature).toBe('0xsignedMessage');
  });
});
