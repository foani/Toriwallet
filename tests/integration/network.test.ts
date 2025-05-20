import { NetworkService } from '../../packages/core/src/services/api/network-service';
import { NetworkType } from '../../packages/core/src/types/network';

// 실제 API 호출 대신 모킹을 사용한 네트워크 통합 테스트
jest.mock('ethers', () => ({
  providers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      getNetwork: jest.fn().mockResolvedValue({
        chainId: 1,
        name: 'mainnet',
      }),
      getGasPrice: jest.fn().mockResolvedValue({
        toString: () => '20000000000',
      }),
      getBalance: jest.fn().mockResolvedValue({
        toString: () => '1000000000000000000',
      }),
      getTransactionCount: jest.fn().mockResolvedValue(1),
      estimateGas: jest.fn().mockResolvedValue({
        toString: () => '21000',
      }),
      sendTransaction: jest.fn().mockResolvedValue({
        hash: '0xtxHash',
        wait: jest.fn().mockResolvedValue({
          status: 1,
          blockNumber: 1000000,
          gasUsed: {
            toString: () => '21000',
          },
        }),
      }),
      getTransactionReceipt: jest.fn().mockResolvedValue({
        status: 1,
        blockNumber: 1000000,
        gasUsed: {
          toString: () => '21000',
        },
      }),
      getTransaction: jest.fn().mockResolvedValue({
        hash: '0xtxHash',
        to: '0x1234567890abcdef1234567890abcdef12345678',
        from: '0x9876543210abcdef1234567890abcdef12345678',
        value: {
          toString: () => '1000000000000000000',
        },
        gasLimit: {
          toString: () => '21000',
        },
        gasPrice: {
          toString: () => '20000000000',
        },
      }),
    })),
    WebSocketProvider: jest.fn().mockImplementation(() => ({
      // WebSocketProvider 모킹
    })),
  },
}));

describe('Network Integration Tests', () => {
  let networkService: NetworkService;
  const networks = {
    [NetworkType.ETHEREUM]: {
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/your-api-key',
      chainId: 1,
      currency: 'ETH',
      explorerUrl: 'https://etherscan.io',
    },
    [NetworkType.CATENA]: {
      name: 'Catena Mainnet',
      rpcUrl: 'https://cvm.node.creatachain.com',
      chainId: 1000,
      currency: 'CTA',
      explorerUrl: 'https://catena.explorer.creatachain.com',
    },
    [NetworkType.BSC]: {
      name: 'Binance Smart Chain',
      rpcUrl: 'https://bsc-dataseed.binance.org',
      chainId: 56,
      currency: 'BNB',
      explorerUrl: 'https://bscscan.com',
    },
  };

  beforeEach(() => {
    networkService = new NetworkService(networks);
  });

  test('should initialize network connections', async () => {
    await networkService.initializeNetworks();
    
    // 네트워크 초기화가 성공적으로 완료되었는지 확인
    expect(networkService.isInitialized()).toBe(true);
    
    // 사용 가능한 네트워크 유형을 확인
    const availableNetworks = networkService.getAvailableNetworks();
    expect(availableNetworks).toContain(NetworkType.ETHEREUM);
    expect(availableNetworks).toContain(NetworkType.CATENA);
    expect(availableNetworks).toContain(NetworkType.BSC);
  });

  test('should get current active network', async () => {
    await networkService.initializeNetworks();
    
    // 기본 활성 네트워크 확인
    const activeNetwork = networkService.getActiveNetwork();
    expect(activeNetwork).toBeDefined();
    
    // 활성 네트워크 변경
    await networkService.setActiveNetwork(NetworkType.CATENA);
    const newActiveNetwork = networkService.getActiveNetwork();
    expect(newActiveNetwork).toBe(NetworkType.CATENA);
  });

  test('should get network details', async () => {
    await networkService.initializeNetworks();
    
    // 이더리움 네트워크 세부 정보 확인
    const ethereumDetails = networkService.getNetworkDetails(NetworkType.ETHEREUM);
    expect(ethereumDetails).toBeDefined();
    expect(ethereumDetails.name).toBe('Ethereum Mainnet');
    expect(ethereumDetails.chainId).toBe(1);
    expect(ethereumDetails.currency).toBe('ETH');
    
    // 카테나 네트워크 세부 정보 확인
    const catenaDetails = networkService.getNetworkDetails(NetworkType.CATENA);
    expect(catenaDetails).toBeDefined();
    expect(catenaDetails.name).toBe('Catena Mainnet');
    expect(catenaDetails.chainId).toBe(1000);
    expect(catenaDetails.currency).toBe('CTA');
  });

  test('should get balance for address', async () => {
    await networkService.initializeNetworks();
    
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    const balance = await networkService.getBalance(address, NetworkType.ETHEREUM);
    
    expect(balance).toBe('1000000000000000000'); // 1 ETH
  });

  test('should get gas price', async () => {
    await networkService.initializeNetworks();
    
    const gasPrice = await networkService.getGasPrice(NetworkType.ETHEREUM);
    
    expect(gasPrice).toBe('20000000000'); // 20 Gwei
  });

  test('should estimate gas for transaction', async () => {
    await networkService.initializeNetworks();
    
    const from = '0x1234567890abcdef1234567890abcdef12345678';
    const to = '0x9876543210abcdef1234567890abcdef12345678';
    const value = '1000000000000000000'; // 1 ETH
    const data = '0x';
    
    const gasLimit = await networkService.estimateGas(from, to, value, data, NetworkType.ETHEREUM);
    
    expect(gasLimit).toBe('21000'); // 기본 ETH 전송 가스 한도
  });

  test('should get nonce for address', async () => {
    await networkService.initializeNetworks();
    
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    const nonce = await networkService.getNonce(address, NetworkType.ETHEREUM);
    
    expect(nonce).toBe(1);
  });

  test('should send transaction', async () => {
    await networkService.initializeNetworks();
    
    const signedTx = '0xsignedTransaction';
    const txHash = await networkService.sendTransaction(signedTx, NetworkType.ETHEREUM);
    
    expect(txHash).toBe('0xtxHash');
  });

  test('should get transaction receipt', async () => {
    await networkService.initializeNetworks();
    
    const txHash = '0xtxHash';
    const receipt = await networkService.getTransactionReceipt(txHash, NetworkType.ETHEREUM);
    
    expect(receipt).toBeDefined();
    expect(receipt.status).toBe(1);
    expect(receipt.blockNumber).toBe(1000000);
    expect(receipt.gasUsed).toBe('21000');
  });

  test('should get transaction details', async () => {
    await networkService.initializeNetworks();
    
    const txHash = '0xtxHash';
    const details = await networkService.getTransactionDetails(txHash, NetworkType.ETHEREUM);
    
    expect(details).toBeDefined();
    expect(details.hash).toBe('0xtxHash');
    expect(details.to).toBe('0x1234567890abcdef1234567890abcdef12345678');
    expect(details.from).toBe('0x9876543210abcdef1234567890abcdef12345678');
    expect(details.value).toBe('1000000000000000000');
    expect(details.gasLimit).toBe('21000');
    expect(details.gasPrice).toBe('20000000000');
  });

  test('should add custom network', async () => {
    await networkService.initializeNetworks();
    
    const customNetworkType = 'POLYGON' as NetworkType;
    const customNetwork = {
      name: 'Polygon Mainnet',
      rpcUrl: 'https://polygon-rpc.com',
      chainId: 137,
      currency: 'MATIC',
      explorerUrl: 'https://polygonscan.com',
    };
    
    await networkService.addNetwork(customNetworkType, customNetwork);
    
    // 새로 추가된 네트워크 확인
    const availableNetworks = networkService.getAvailableNetworks();
    expect(availableNetworks).toContain(customNetworkType);
    
    // 새로 추가된 네트워크 세부 정보 확인
    const networkDetails = networkService.getNetworkDetails(customNetworkType);
    expect(networkDetails).toBeDefined();
    expect(networkDetails.name).toBe('Polygon Mainnet');
    expect(networkDetails.chainId).toBe(137);
    expect(networkDetails.currency).toBe('MATIC');
  });

  test('should remove custom network', async () => {
    await networkService.initializeNetworks();
    
    // 먼저 커스텀 네트워크 추가
    const customNetworkType = 'POLYGON' as NetworkType;
    const customNetwork = {
      name: 'Polygon Mainnet',
      rpcUrl: 'https://polygon-rpc.com',
      chainId: 137,
      currency: 'MATIC',
      explorerUrl: 'https://polygonscan.com',
    };
    
    await networkService.addNetwork(customNetworkType, customNetwork);
    
    // 네트워크 제거
    await networkService.removeNetwork(customNetworkType);
    
    // 제거된 네트워크가 더 이상 없는지 확인
    const availableNetworks = networkService.getAvailableNetworks();
    expect(availableNetworks).not.toContain(customNetworkType);
  });
});
