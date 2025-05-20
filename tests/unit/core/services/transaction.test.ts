import { TransactionService } from '../../../../packages/core/src/services/transaction-service';
import { SignatureService } from '../../../../packages/core/src/services/crypto/signature';
import { NetworkService } from '../../../../packages/core/src/services/api/network-service';
import { TransactionType, TransactionStatus } from '../../../../packages/core/src/types/transaction';

// 모킹 라이브러리 임포트
jest.mock('../../../../packages/core/src/services/crypto/signature');
jest.mock('../../../../packages/core/src/services/api/network-service');

describe('Transaction Service', () => {
  let transactionService: TransactionService;
  let mockSignatureService: jest.Mocked<SignatureService>;
  let mockNetworkService: jest.Mocked<NetworkService>;

  beforeEach(() => {
    mockSignatureService = new SignatureService() as jest.Mocked<SignatureService>;
    mockNetworkService = new NetworkService() as jest.Mocked<NetworkService>;
    
    // 모킹된 메서드 설정
    mockSignatureService.signTransaction.mockResolvedValue('0xsignedTransaction');
    mockSignatureService.signMessage.mockResolvedValue('0xsignedMessage');
    
    mockNetworkService.getGasPrice.mockResolvedValue('20000000000'); // 20 Gwei
    mockNetworkService.estimateGas.mockResolvedValue('21000');
    mockNetworkService.getNonce.mockResolvedValue(0);
    mockNetworkService.sendTransaction.mockResolvedValue('0xtxHash');
    mockNetworkService.getTransactionReceipt.mockResolvedValue({
      status: 1,
      blockNumber: 100,
      gasUsed: '21000',
      transactionHash: '0xtxHash',
    });
    
    transactionService = new TransactionService(mockSignatureService, mockNetworkService);
  });

  test('should create a transaction', async () => {
    const fromAddress = '0x1234567890abcdef1234567890abcdef12345678';
    const toAddress = '0x9876543210abcdef1234567890abcdef12345678';
    const amount = '1000000000000000000'; // 1 ETH
    const chainId = 1;
    
    const tx = await transactionService.createTransaction(
      fromAddress,
      toAddress,
      amount,
      chainId
    );
    
    expect(mockNetworkService.getGasPrice).toHaveBeenCalled();
    expect(mockNetworkService.getNonce).toHaveBeenCalled();
    
    expect(tx).toBeDefined();
    expect(tx.from).toBe(fromAddress);
    expect(tx.to).toBe(toAddress);
    expect(tx.value).toBe(amount);
    expect(tx.chainId).toBe(chainId);
    expect(tx.gasPrice).toBe('20000000000');
    expect(tx.type).toBe(TransactionType.TRANSFER);
  });

  test('should sign a transaction', async () => {
    const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const transaction = {
      from: '0x1234567890abcdef1234567890abcdef12345678',
      to: '0x9876543210abcdef1234567890abcdef12345678',
      value: '1000000000000000000', // 1 ETH
      gasLimit: '21000',
      gasPrice: '20000000000', // 20 Gwei
      nonce: 0,
      data: '0x',
      chainId: 1,
      type: TransactionType.TRANSFER,
    };
    
    const signedTx = await transactionService.signTransaction(privateKey, transaction);
    
    expect(mockSignatureService.signTransaction).toHaveBeenCalledWith(privateKey, transaction);
    expect(signedTx).toBe('0xsignedTransaction');
  });

  test('should send a transaction', async () => {
    const signedTx = '0xsignedTransaction';
    const chainId = 1;
    
    const txHash = await transactionService.sendTransaction(signedTx, chainId);
    
    expect(mockNetworkService.sendTransaction).toHaveBeenCalledWith(signedTx, chainId);
    expect(txHash).toBe('0xtxHash');
  });

  test('should get transaction status', async () => {
    const txHash = '0xtxHash';
    const chainId = 1;
    
    const status = await transactionService.getTransactionStatus(txHash, chainId);
    
    expect(mockNetworkService.getTransactionReceipt).toHaveBeenCalledWith(txHash, chainId);
    expect(status).toBe(TransactionStatus.CONFIRMED);
  });

  test('should handle failed transaction', async () => {
    const txHash = '0xfailedTxHash';
    const chainId = 1;
    
    mockNetworkService.getTransactionReceipt.mockResolvedValue({
      status: 0, // 실패한 트랜잭션
      blockNumber: 100,
      gasUsed: '21000',
      transactionHash: txHash,
    });
    
    const status = await transactionService.getTransactionStatus(txHash, chainId);
    
    expect(mockNetworkService.getTransactionReceipt).toHaveBeenCalledWith(txHash, chainId);
    expect(status).toBe(TransactionStatus.FAILED);
  });

  test('should handle pending transaction', async () => {
    const txHash = '0xpendingTxHash';
    const chainId = 1;
    
    mockNetworkService.getTransactionReceipt.mockResolvedValue(null); // 아직 채굴되지 않은 트랜잭션
    
    const status = await transactionService.getTransactionStatus(txHash, chainId);
    
    expect(mockNetworkService.getTransactionReceipt).toHaveBeenCalledWith(txHash, chainId);
    expect(status).toBe(TransactionStatus.PENDING);
  });

  test('should calculate transaction fee', () => {
    const gasLimit = '21000';
    const gasPrice = '20000000000'; // 20 Gwei
    
    const fee = transactionService.calculateTransactionFee(gasLimit, gasPrice);
    
    // 21000 * 20000000000 = 420000000000000 (0.00042 ETH)
    expect(fee).toBe('420000000000000');
  });

  test('should estimate gas for transaction', async () => {
    const fromAddress = '0x1234567890abcdef1234567890abcdef12345678';
    const toAddress = '0x9876543210abcdef1234567890abcdef12345678';
    const amount = '1000000000000000000'; // 1 ETH
    const data = '0x';
    const chainId = 1;
    
    const gasLimit = await transactionService.estimateGas(
      fromAddress,
      toAddress,
      amount,
      data,
      chainId
    );
    
    expect(mockNetworkService.estimateGas).toHaveBeenCalled();
    expect(gasLimit).toBe('21000');
  });

  test('should sign a message', async () => {
    const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const message = 'Message to sign';
    
    const signature = await transactionService.signMessage(privateKey, message);
    
    expect(mockSignatureService.signMessage).toHaveBeenCalledWith(privateKey, message);
    expect(signature).toBe('0xsignedMessage');
  });
});
