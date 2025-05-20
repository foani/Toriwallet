import { CrosschainService } from '../../packages/core/src/services/crosschain/index';
import { RelayerService } from '../../packages/core/src/services/crosschain/relayer';
import { BridgeService } from '../../packages/core/src/services/crosschain/bridge';
import { SwapService } from '../../packages/core/src/services/crosschain/swap';
import { NetworkService } from '../../packages/core/src/services/api/network-service';
import { WalletService } from '../../packages/core/src/services/wallet-service';
import { NetworkType } from '../../packages/core/src/types/network';
import { CrosschainTransactionStatus, CrosschainTransactionType } from '../../packages/core/src/types/transaction';

// 모킹 설정
jest.mock('../../packages/core/src/services/crosschain/relayer');
jest.mock('../../packages/core/src/services/crosschain/bridge');
jest.mock('../../packages/core/src/services/crosschain/swap');
jest.mock('../../packages/core/src/services/api/network-service');
jest.mock('../../packages/core/src/services/wallet-service');

describe('Crosschain Integration Tests', () => {
  let crosschainService: CrosschainService;
  let mockRelayerService: jest.Mocked<RelayerService>;
  let mockBridgeService: jest.Mocked<BridgeService>;
  let mockSwapService: jest.Mocked<SwapService>;
  let mockNetworkService: jest.Mocked<NetworkService>;
  let mockWalletService: jest.Mocked<WalletService>;

  beforeEach(() => {
    // 모킹된 서비스 설정
    mockRelayerService = new RelayerService() as jest.Mocked<RelayerService>;
    mockBridgeService = new BridgeService() as jest.Mocked<BridgeService>;
    mockSwapService = new SwapService() as jest.Mocked<SwapService>;
    mockNetworkService = new NetworkService({}) as jest.Mocked<NetworkService>;
    mockWalletService = new WalletService(null, null) as jest.Mocked<WalletService>;
    
    // 모킹된 메서드 설정
    mockRelayerService.transferToChain.mockResolvedValue({
      txHash: '0xicpTransferHash',
      sourceChainId: 1000, // Catena Chain
      destinationChainId: 1, // Zenith Chain (혹은 다른 체인)
      status: CrosschainTransactionStatus.PENDING,
      timestamp: Date.now(),
    });
    
    mockRelayerService.getTransferStatus.mockResolvedValue(CrosschainTransactionStatus.COMPLETED);
    
    mockBridgeService.bridgeAsset.mockResolvedValue({
      txHash: '0xbridgeTxHash',
      sourceChainId: 1, // Ethereum
      destinationChainId: 56, // BSC
      status: CrosschainTransactionStatus.PENDING,
      timestamp: Date.now(),
    });
    
    mockBridgeService.getBridgeStatus.mockResolvedValue(CrosschainTransactionStatus.COMPLETED);
    
    mockSwapService.swapAsset.mockResolvedValue({
      txHash: '0xswapTxHash',
      sourceChainId: 1, // Ethereum
      sourceAsset: 'ETH',
      destinationChainId: 56, // BSC
      destinationAsset: 'BNB',
      status: CrosschainTransactionStatus.PENDING,
      timestamp: Date.now(),
    });
    
    mockSwapService.getSwapStatus.mockResolvedValue(CrosschainTransactionStatus.COMPLETED);
    mockSwapService.getSwapRate.mockResolvedValue('0.05'); // 1 ETH = 0.05 BNB (예시)
    
    mockNetworkService.isInitialized.mockReturnValue(true);
    mockNetworkService.getAvailableNetworks.mockReturnValue([
      NetworkType.CATENA,
      NetworkType.ETHEREUM,
      NetworkType.BSC,
    ]);
    
    mockWalletService.isUnlocked.mockReturnValue(true);
    mockWalletService.getWalletInfo.mockReturnValue({
      address: '0x1234567890abcdef1234567890abcdef12345678',
      privateKey: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    });
    
    // 크로스체인 서비스 초기화
    crosschainService = new CrosschainService(
      mockRelayerService,
      mockBridgeService,
      mockSwapService,
      mockNetworkService,
      mockWalletService
    );
  });

  test('should initialize crosschain service', async () => {
    await crosschainService.initialize();
    
    expect(crosschainService.isInitialized()).toBe(true);
  });

  test('should get supported chains for ICP transfer', async () => {
    await crosschainService.initialize();
    
    const supportedChains = crosschainService.getSupportedICPChains();
    
    expect(supportedChains).toBeDefined();
    expect(supportedChains.length).toBeGreaterThan(0);
    expect(supportedChains).toContain(NetworkType.CATENA);
  });

  test('should get supported bridge networks', async () => {
    await crosschainService.initialize();
    
    const supportedBridges = crosschainService.getSupportedBridges();
    
    expect(supportedBridges).toBeDefined();
    expect(supportedBridges.length).toBeGreaterThan(0);
    expect(supportedBridges[0].sourceChain).toBeDefined();
    expect(supportedBridges[0].destinationChain).toBeDefined();
  });

  test('should get supported swap networks', async () => {
    await crosschainService.initialize();
    
    const supportedSwaps = crosschainService.getSupportedSwaps();
    
    expect(supportedSwaps).toBeDefined();
    expect(supportedSwaps.length).toBeGreaterThan(0);
    expect(supportedSwaps[0].sourceChain).toBeDefined();
    expect(supportedSwaps[0].sourceAsset).toBeDefined();
    expect(supportedSwaps[0].destinationChain).toBeDefined();
    expect(supportedSwaps[0].destinationAsset).toBeDefined();
  });

  test('should perform ICP transfer between chains', async () => {
    await crosschainService.initialize();
    
    const sourceChain = NetworkType.CATENA;
    const destinationChain = NetworkType.ETHEREUM;
    const amount = '1000000000000000000'; // 1 CTA
    const recipientAddress = '0x9876543210abcdef1234567890abcdef12345678';
    
    const result = await crosschainService.performICPTransfer(
      sourceChain,
      destinationChain,
      amount,
      recipientAddress
    );
    
    expect(mockRelayerService.transferToChain).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.txHash).toBe('0xicpTransferHash');
    expect(result.sourceChainId).toBe(1000);
    expect(result.status).toBe(CrosschainTransactionStatus.PENDING);
  });

  test('should bridge assets between chains', async () => {
    await crosschainService.initialize();
    
    const sourceChain = NetworkType.ETHEREUM;
    const destinationChain = NetworkType.BSC;
    const asset = 'ETH';
    const amount = '1000000000000000000'; // 1 ETH
    
    const result = await crosschainService.bridgeAsset(
      sourceChain,
      destinationChain,
      asset,
      amount
    );
    
    expect(mockBridgeService.bridgeAsset).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.txHash).toBe('0xbridgeTxHash');
    expect(result.sourceChainId).toBe(1);
    expect(result.destinationChainId).toBe(56);
    expect(result.status).toBe(CrosschainTransactionStatus.PENDING);
  });

  test('should swap assets between chains', async () => {
    await crosschainService.initialize();
    
    const sourceChain = NetworkType.ETHEREUM;
    const destinationChain = NetworkType.BSC;
    const sourceAsset = 'ETH';
    const destinationAsset = 'BNB';
    const amount = '1000000000000000000'; // 1 ETH
    
    const result = await crosschainService.swapAsset(
      sourceChain,
      destinationChain,
      sourceAsset,
      destinationAsset,
      amount
    );
    
    expect(mockSwapService.swapAsset).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.txHash).toBe('0xswapTxHash');
    expect(result.sourceChainId).toBe(1);
    expect(result.destinationChainId).toBe(56);
    expect(result.sourceAsset).toBe('ETH');
    expect(result.destinationAsset).toBe('BNB');
    expect(result.status).toBe(CrosschainTransactionStatus.PENDING);
  });

  test('should get crosschain transaction history', async () => {
    await crosschainService.initialize();
    
    // 모의 트랜잭션 히스토리 설정
    const mockHistory = [
      {
        id: '1',
        txHash: '0xicpTransferHash',
        type: CrosschainTransactionType.ICP_TRANSFER,
        sourceChainId: 1000,
        destinationChainId: 1,
        amount: '1000000000000000000',
        status: CrosschainTransactionStatus.COMPLETED,
        timestamp: Date.now() - 3600000, // 1시간 전
      },
      {
        id: '2',
        txHash: '0xbridgeTxHash',
        type: CrosschainTransactionType.BRIDGE,
        sourceChainId: 1,
        destinationChainId: 56,
        asset: 'ETH',
        amount: '1000000000000000000',
        status: CrosschainTransactionStatus.COMPLETED,
        timestamp: Date.now() - 7200000, // 2시간 전
      },
      {
        id: '3',
        txHash: '0xswapTxHash',
        type: CrosschainTransactionType.SWAP,
        sourceChainId: 1,
        sourceAsset: 'ETH',
        destinationChainId: 56,
        destinationAsset: 'BNB',
        amount: '1000000000000000000',
        status: CrosschainTransactionStatus.PENDING,
        timestamp: Date.now() - 1800000, // 30분 전
      },
    ];
    
    // 히스토리 조회 메서드 모킹
    jest.spyOn(crosschainService, 'getTransactionHistory').mockResolvedValue(mockHistory);
    
    const history = await crosschainService.getTransactionHistory();
    
    expect(history).toBeDefined();
    expect(history.length).toBe(3);
    expect(history[0].txHash).toBe('0xicpTransferHash');
    expect(history[1].txHash).toBe('0xbridgeTxHash');
    expect(history[2].txHash).toBe('0xswapTxHash');
  });

  test('should get crosschain transaction status', async () => {
    await crosschainService.initialize();
    
    // ICP 전송 상태 확인
    const icpStatus = await crosschainService.getTransactionStatus(
      '0xicpTransferHash',
      CrosschainTransactionType.ICP_TRANSFER
    );
    
    expect(mockRelayerService.getTransferStatus).toHaveBeenCalled();
    expect(icpStatus).toBe(CrosschainTransactionStatus.COMPLETED);
    
    // 브릿지 상태 확인
    const bridgeStatus = await crosschainService.getTransactionStatus(
      '0xbridgeTxHash',
      CrosschainTransactionType.BRIDGE
    );
    
    expect(mockBridgeService.getBridgeStatus).toHaveBeenCalled();
    expect(bridgeStatus).toBe(CrosschainTransactionStatus.COMPLETED);
    
    // 스왑 상태 확인
    const swapStatus = await crosschainService.getTransactionStatus(
      '0xswapTxHash',
      CrosschainTransactionType.SWAP
    );
    
    expect(mockSwapService.getSwapStatus).toHaveBeenCalled();
    expect(swapStatus).toBe(CrosschainTransactionStatus.COMPLETED);
  });

  test('should get swap rate between assets', async () => {
    await crosschainService.initialize();
    
    const sourceChain = NetworkType.ETHEREUM;
    const destinationChain = NetworkType.BSC;
    const sourceAsset = 'ETH';
    const destinationAsset = 'BNB';
    
    const rate = await crosschainService.getSwapRate(
      sourceChain,
      destinationChain,
      sourceAsset,
      destinationAsset
    );
    
    expect(mockSwapService.getSwapRate).toHaveBeenCalled();
    expect(rate).toBe('0.05');
  });

  test('should calculate estimated destination amount for swap', async () => {
    await crosschainService.initialize();
    
    const sourceChain = NetworkType.ETHEREUM;
    const destinationChain = NetworkType.BSC;
    const sourceAsset = 'ETH';
    const destinationAsset = 'BNB';
    const sourceAmount = '1000000000000000000'; // 1 ETH
    
    // 스왑 비율 모킹: 1 ETH = 20 BNB (예시)
    mockSwapService.getSwapRate.mockResolvedValue('20');
    
    const estimatedAmount = await crosschainService.estimateSwapAmount(
      sourceChain,
      destinationChain,
      sourceAsset,
      destinationAsset,
      sourceAmount
    );
    
    // 1 ETH * 20 = 20 BNB (단순화된 계산)
    expect(estimatedAmount).toBe('20000000000000000000'); // 20 BNB (예상)
  });

  test('should get bridge fee', async () => {
    await crosschainService.initialize();
    
    const sourceChain = NetworkType.ETHEREUM;
    const destinationChain = NetworkType.BSC;
    const asset = 'ETH';
    
    // 브릿지 수수료 모킹
    mockBridgeService.getBridgeFee.mockResolvedValue('0.001');
    
    const fee = await crosschainService.getBridgeFee(
      sourceChain,
      destinationChain,
      asset
    );
    
    expect(mockBridgeService.getBridgeFee).toHaveBeenCalled();
    expect(fee).toBe('0.001'); // 0.001 ETH
  });

  test('should validate crosschain transaction parameters', async () => {
    await crosschainService.initialize();
    
    // 유효한 매개변수
    const validResult = await crosschainService.validateTransaction(
      NetworkType.ETHEREUM,
      NetworkType.BSC,
      'ETH',
      '1000000000000000000' // 1 ETH
    );
    
    expect(validResult.isValid).toBe(true);
    
    // 유효하지 않은 매개변수 (지원되지 않는 체인)
    const invalidChainResult = await crosschainService.validateTransaction(
      'UNSUPPORTED_CHAIN' as NetworkType,
      NetworkType.BSC,
      'ETH',
      '1000000000000000000'
    );
    
    expect(invalidChainResult.isValid).toBe(false);
    expect(invalidChainResult.error).toBeDefined();
    
    // 유효하지 않은 매개변수 (부족한 금액)
    const invalidAmountResult = await crosschainService.validateTransaction(
      NetworkType.ETHEREUM,
      NetworkType.BSC,
      'ETH',
      '0'
    );
    
    expect(invalidAmountResult.isValid).toBe(false);
    expect(invalidAmountResult.error).toBeDefined();
  });
});
