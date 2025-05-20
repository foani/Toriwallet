import { KeyringService } from '../../../../packages/core/src/services/crypto/keyring';
import { MnemonicService } from '../../../../packages/core/src/services/crypto/mnemonic';
import { HdKeyService } from '../../../../packages/core/src/services/crypto/hdkey';
import { EncryptionService } from '../../../../packages/core/src/services/crypto/encryption';
import { SignatureService } from '../../../../packages/core/src/services/crypto/signature';

// 모킹 라이브러리 임포트
jest.mock('ethers', () => {
  // ethers 라이브러리 모킹
  return {
    Wallet: {
      fromMnemonic: jest.fn(() => ({
        privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        signMessage: jest.fn(() => Promise.resolve('0xsignedMessage')),
        signTransaction: jest.fn(() => Promise.resolve('0xsignedTransaction')),
      })),
      createRandom: jest.fn(() => ({
        mnemonic: {
          phrase: 'test test test test test test test test test test test junk',
        },
        privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        address: '0x1234567890abcdef1234567890abcdef12345678',
      })),
    },
    utils: {
      keccak256: jest.fn(() => '0xhash'),
      toUtf8Bytes: jest.fn((str) => new Uint8Array([1, 2, 3])),
      AES: {
        encrypt: jest.fn(() => Promise.resolve('encryptedData')),
        decrypt: jest.fn(() => Promise.resolve('decryptedData')),
      },
      HDNode: {
        fromMnemonic: jest.fn(() => ({
          derivePath: jest.fn(() => ({
            privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            address: '0x1234567890abcdef1234567890abcdef12345678',
          })),
        })),
      },
    },
  };
});

describe('Keyring Service', () => {
  let keyringService: KeyringService;

  beforeEach(() => {
    keyringService = new KeyringService();
  });

  test('should create a new keyring', () => {
    const keyring = keyringService.createKeyring('password');
    expect(keyring).toBeDefined();
    expect(keyring.address).toBeDefined();
    expect(keyring.mnemonic).toBeDefined();
  });

  test('should unlock a keyring with correct password', async () => {
    const keyring = keyringService.createKeyring('password');
    const encryptedKeyring = await keyringService.encryptKeyring(keyring, 'password');
    
    const unlockedKeyring = await keyringService.unlockKeyring(encryptedKeyring, 'password');
    expect(unlockedKeyring).toBeDefined();
    expect(unlockedKeyring.address).toBe(keyring.address);
  });

  test('should fail to unlock a keyring with incorrect password', async () => {
    const keyring = keyringService.createKeyring('password');
    const encryptedKeyring = await keyringService.encryptKeyring(keyring, 'password');
    
    await expect(
      keyringService.unlockKeyring(encryptedKeyring, 'wrongpassword')
    ).rejects.toThrow();
  });

  test('should verify a keyring address', () => {
    const keyring = keyringService.createKeyring('password');
    const isValid = keyringService.verifyAddress(keyring.address);
    expect(isValid).toBe(true);
  });
});

describe('Mnemonic Service', () => {
  let mnemonicService: MnemonicService;

  beforeEach(() => {
    mnemonicService = new MnemonicService();
  });

  test('should generate a valid mnemonic', () => {
    const mnemonic = mnemonicService.generateMnemonic();
    expect(mnemonic).toBeDefined();
    expect(mnemonic.split(' ').length).toBe(12);
  });

  test('should validate a valid mnemonic', () => {
    const mnemonic = 'test test test test test test test test test test test junk';
    const isValid = mnemonicService.validateMnemonic(mnemonic);
    expect(isValid).toBe(true);
  });

  test('should reject an invalid mnemonic', () => {
    const mnemonic = 'invalid mnemonic phrase that should not pass validation';
    const isValid = mnemonicService.validateMnemonic(mnemonic);
    expect(isValid).toBe(false);
  });

  test('should convert mnemonic to seed', () => {
    const mnemonic = 'test test test test test test test test test test test junk';
    const seed = mnemonicService.mnemonicToSeed(mnemonic);
    expect(seed).toBeDefined();
  });
});

describe('HD Key Service', () => {
  let hdKeyService: HdKeyService;

  beforeEach(() => {
    hdKeyService = new HdKeyService();
  });

  test('should derive a child key from mnemonic', () => {
    const mnemonic = 'test test test test test test test test test test test junk';
    const path = "m/44'/60'/0'/0/0";
    const childKey = hdKeyService.deriveChildKey(mnemonic, path);
    expect(childKey).toBeDefined();
    expect(childKey.privateKey).toBeDefined();
    expect(childKey.address).toBeDefined();
  });

  test('should derive multiple child keys from the same mnemonic', () => {
    const mnemonic = 'test test test test test test test test test test test junk';
    const path1 = "m/44'/60'/0'/0/0";
    const path2 = "m/44'/60'/0'/0/1";
    
    const childKey1 = hdKeyService.deriveChildKey(mnemonic, path1);
    const childKey2 = hdKeyService.deriveChildKey(mnemonic, path2);
    
    expect(childKey1.privateKey).not.toBe(childKey2.privateKey);
    expect(childKey1.address).not.toBe(childKey2.address);
  });
});

describe('Encryption Service', () => {
  let encryptionService: EncryptionService;

  beforeEach(() => {
    encryptionService = new EncryptionService();
  });

  test('should encrypt and decrypt data', async () => {
    const data = 'sensitive data to encrypt';
    const password = 'secure password';
    
    const encryptedData = await encryptionService.encrypt(data, password);
    expect(encryptedData).toBeDefined();
    expect(encryptedData).not.toBe(data);
    
    const decryptedData = await encryptionService.decrypt(encryptedData, password);
    expect(decryptedData).toBe(data);
  });

  test('should fail to decrypt with wrong password', async () => {
    const data = 'sensitive data to encrypt';
    const password = 'secure password';
    
    const encryptedData = await encryptionService.encrypt(data, password);
    
    await expect(
      encryptionService.decrypt(encryptedData, 'wrong password')
    ).rejects.toThrow();
  });
});

describe('Signature Service', () => {
  let signatureService: SignatureService;

  beforeEach(() => {
    signatureService = new SignatureService();
  });

  test('should sign a message', async () => {
    const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const message = 'message to sign';
    
    const signature = await signatureService.signMessage(privateKey, message);
    expect(signature).toBeDefined();
  });

  test('should verify a signature', async () => {
    const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const message = 'message to sign';
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    
    const signature = await signatureService.signMessage(privateKey, message);
    const isValid = await signatureService.verifySignature(address, message, signature);
    
    expect(isValid).toBe(true);
  });

  test('should sign a transaction', async () => {
    const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const transaction = {
      to: '0x1234567890abcdef1234567890abcdef12345678',
      value: '1000000000000000000', // 1 ETH
      gasLimit: '21000',
      gasPrice: '20000000000', // 20 Gwei
      nonce: 0,
      data: '0x',
      chainId: 1,
    };
    
    const signedTx = await signatureService.signTransaction(privateKey, transaction);
    expect(signedTx).toBeDefined();
  });
});
