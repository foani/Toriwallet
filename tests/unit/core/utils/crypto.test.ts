import * as cryptoUtils from '../../../../packages/core/src/utils/crypto';

describe('Crypto Utils', () => {
  test('should validate ethereum address', () => {
    const validAddress = '0x1234567890abcdef1234567890abcdef12345678';
    const invalidAddress = '0xinvalid';
    
    expect(cryptoUtils.isValidEthereumAddress(validAddress)).toBe(true);
    expect(cryptoUtils.isValidEthereumAddress(invalidAddress)).toBe(false);
  });

  test('should validate bitcoin address', () => {
    const validAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'; // Bitcoin genesis address
    const invalidAddress = 'invalid';
    
    expect(cryptoUtils.isValidBitcoinAddress(validAddress)).toBe(true);
    expect(cryptoUtils.isValidBitcoinAddress(invalidAddress)).toBe(false);
  });

  test('should validate private key', () => {
    const validKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const invalidKey = '0xinvalid';
    
    expect(cryptoUtils.isValidPrivateKey(validKey)).toBe(true);
    expect(cryptoUtils.isValidPrivateKey(invalidKey)).toBe(false);
  });

  test('should generate random bytes', () => {
    const bytes16 = cryptoUtils.generateRandomBytes(16);
    const bytes32 = cryptoUtils.generateRandomBytes(32);
    
    expect(bytes16.length).toBe(16);
    expect(bytes32.length).toBe(32);
    expect(bytes16).not.toEqual(bytes32.slice(0, 16)); // 랜덤성 확인
  });

  test('should convert hex to bytes', () => {
    const hex = '0x1234';
    const bytes = cryptoUtils.hexToBytes(hex);
    
    expect(bytes).toEqual(new Uint8Array([0x12, 0x34]));
  });

  test('should convert bytes to hex', () => {
    const bytes = new Uint8Array([0x12, 0x34]);
    const hex = cryptoUtils.bytesToHex(bytes);
    
    expect(hex).toBe('0x1234');
  });

  test('should hash data using keccak256', () => {
    const data = 'data to hash';
    const hash = cryptoUtils.keccak256(data);
    
    expect(hash).toBeDefined();
    expect(hash.startsWith('0x')).toBe(true);
  });

  test('should derive ethereum address from private key', () => {
    const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const address = cryptoUtils.privateKeyToAddress(privateKey);
    
    expect(address).toBeDefined();
    expect(address.startsWith('0x')).toBe(true);
    expect(address.length).toBe(42); // '0x' + 40 hex chars
  });

  test('should format checksummed ethereum address', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    const checksummed = cryptoUtils.toChecksumAddress(address);
    
    expect(checksummed).toBeDefined();
    expect(checksummed).not.toBe(address.toLowerCase()); // 주소가 원래 소문자면 체크섬 후에 일부는 대문자여야 함
  });

  test('should validate mnemonic phrase', () => {
    const validMnemonic = 'test test test test test test test test test test test junk';
    const invalidMnemonic = 'invalid mnemonic phrase';
    
    expect(cryptoUtils.isValidMnemonic(validMnemonic)).toBe(true);
    expect(cryptoUtils.isValidMnemonic(invalidMnemonic)).toBe(false);
  });
});
