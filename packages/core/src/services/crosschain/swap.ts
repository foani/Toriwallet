/**
 * Swap Service
 * 
 * This service handles cross-chain token swaps, allowing users to exchange
 * tokens across different blockchains in a single transaction.
 * 
 * @module services/crosschain/swap
 */

import { NetworkService } from '../network/network-service';
import { TransactionService } from '../transaction/transaction-service';
import { WalletService } from '../wallet/wallet-service';
import { networks } from '../../constants/networks';
import { Transaction, TransactionStatus } from '../../types/transaction';

/**
 * Interface for swap providers
 */
export interface SwapProvider {
  id: string;
  name: string;
  logo: string;
  supportedChains: string[];
  supportedAssets: Record<string, string[]>;
  minAmount: Record<string, string>;
  fee: string; // In percentage
  website: string;
}

/**
 * Interface for swap route
 */
export interface SwapRoute {
  fromChain: string;
  toChain: string;
  fromAsset: string;
  toAsset: string;
  fromAmount: string;
  toAmount: string;
  exchange: string;
  fee: string;
  feeAsset: string;
  feeUsd: string;
  exchangeRate: string;
  minReceived: string;
  priceImpact: string;
  estimatedTime: number; // in minutes
  path: SwapStep[];
}

/**
 * Interface for swap step
 */
export interface SwapStep {
  type: 'swap' | 'bridge';
  provider: string;
  fromChain: string;
  toChain: string;
  fromAsset: string;
  toAsset: string;
  fromAmount: string;
  toAmount: string;
}

/**
 * Interface for swap parameters
 */
export interface SwapParams {
  fromChain: string;
  toChain: string;
  fromAsset: string;
  toAsset: string;
  fromAddress: string;
  toAddress: string;
  fromAmount: string;
  slippage: string; // In percentage
  route?: SwapRoute;
}

/**
 * Interface for swap transaction
 */
export interface SwapTransaction {
  id: string;
  fromChain: string;
  toChain: string;
  fromAsset: string;
  toAsset: string;
  fromAmount: string;
  toAmount: string;
  fromAddress: string;
  toAddress: string;
  route: SwapRoute;
  transactions: {
    hash: string;
    chain: string;
    status: TransactionStatus;
  }[];
  status: TransactionStatus;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  estimatedCompletionTime?: number;
  error?: string;
}

/**
 * SwapService handles cross-chain token swaps
 */
export class SwapService {
  private networkService: NetworkService;
  private transactionService: TransactionService;
  private walletService: WalletService;
  
  // Swap aggregator endpoints
  private readonly aggregatorEndpoints = {
    mainnet: 'https://aggregator.tori-wallet.creatachain.com',
    testnet: 'https://testnet.aggregator.tori-wallet.creatachain.com'
  };

  // Cache of active swap transactions
  private activeSwapTransactions: Map<string, SwapTransaction> = new Map();

  constructor(
    networkService?: NetworkService,
    transactionService?: TransactionService,
    walletService?: WalletService
  ) {
    this.networkService = networkService || new NetworkService();
    this.transactionService = transactionService || new TransactionService();
    this.walletService = walletService || new WalletService();
  }

  /**
   * Gets available swap providers
   * 
   * @returns Promise resolving to the list of swap providers
   */
  public async getProviders(): Promise<SwapProvider[]> {
    try {
      const isMainnet = this.networkService.isMainnet();
      const endpoint = isMainnet
        ? this.aggregatorEndpoints.mainnet
        : this.aggregatorEndpoints.testnet;
      
      const response = await fetch(`${endpoint}/api/v1/providers`);
      if (!response.ok) {
        throw new Error(`Failed to get swap providers: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.providers;
    } catch (error) {
      console.error('Failed to get swap providers:', error);
      
      // Return fallback providers
      return [
        {
          id: 'jupiter',
          name: 'Jupiter',
          logo: 'https://jupiter.solana.com/logo.png',
          supportedChains: [networks.SOLANA_MAINNET.id],
          supportedAssets: {
            [networks.SOLANA_MAINNET.id]: ['SOL', 'USDC', 'USDT', 'BTC', 'ETH']
          },
          minAmount: {
            SOL: '0.01',
            USDC: '1',
            USDT: '1',
            BTC: '0.0001',
            ETH: '0.001'
          },
          fee: '0.3',
          website: 'https://jupiter.solana.com'
        },
        {
          id: '1inch',
          name: '1inch',
          logo: 'https://1inch.io/logo.png',
          supportedChains: [
            networks.ETHEREUM_MAINNET.id,
            networks.BSC_MAINNET.id,
            networks.POLYGON_MAINNET.id
          ],
          supportedAssets: {
            [networks.ETHEREUM_MAINNET.id]: ['ETH', 'USDT', 'USDC', 'DAI', 'WBTC'],
            [networks.BSC_MAINNET.id]: ['BNB', 'BUSD', 'USDT', 'CAKE'],
            [networks.POLYGON_MAINNET.id]: ['MATIC', 'USDT', 'USDC', 'DAI']
          },
          minAmount: {
            ETH: '0.01',
            USDT: '10',
            USDC: '10',
            DAI: '10',
            WBTC: '0.001',
            BNB: '0.05',
            BUSD: '10',
            CAKE: '1',
            MATIC: '10'
          },
          fee: '0.1',
          website: 'https://1inch.io'
        },
        {
          id: 'zenithswap',
          name: 'ZenithSwap',
          logo: 'https://zenithswap.creatachain.com/logo.png',
          supportedChains: [networks.ZENITH_MAINNET.id],
          supportedAssets: {
            [networks.ZENITH_MAINNET.id]: ['CTA', 'USDT', 'BTC', 'ETH']
          },
          minAmount: {
            CTA: '1',
            USDT: '1',
            BTC: '0.0001',
            ETH: '0.001'
          },
          fee: '0.2',
          website: 'https://zenithswap.creatachain.com'
        },
        {
          id: 'catenaswap',
          name: 'CatenaSwap',
          logo: 'https://catenaswap.creatachain.com/logo.png',
          supportedChains: [networks.CATENA_MAINNET.id],
          supportedAssets: {
            [networks.CATENA_MAINNET.id]: ['CTA', 'USDT', 'WBTC', 'WETH']
          },
          minAmount: {
            CTA: '1',
            USDT: '1',
            WBTC: '0.0001',
            WETH: '0.001'
          },
          fee: '0.2',
          website: 'https://catenaswap.creatachain.com'
        }
      ];
    }
  }

  /**
   * Gets quote for a swap
   * 
   * @param params The swap parameters
   * @returns Promise resolving to available swap routes
   */
  public async getQuote(
    params: Omit<SwapParams, 'toAddress' | 'slippage' | 'route'>
  ): Promise<SwapRoute[]> {
    try {
      // Validate parameters
      this.validateSwapParams(params);
      
      const isMainnet = this.networkService.isMainnet();
      const endpoint = isMainnet
        ? this.aggregatorEndpoints.mainnet
        : this.aggregatorEndpoints.testnet;
      
      const response = await fetch(`${endpoint}/api/v1/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromChain: params.fromChain,
          toChain: params.toChain,
          fromAsset: params.fromAsset,
          toAsset: params.toAsset,
          fromAmount: params.fromAmount,
          fromAddress: params.fromAddress
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get swap quote: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.routes;
    } catch (error) {
      console.error('Failed to get swap quote:', error);
      
      // If aggregator is not available, return a mock route
      if (params.fromChain === params.toChain) {
        // Same-chain swap
        return [this.getMockSameChainRoute(params)];
      } else {
        // Cross-chain swap
        return [this.getMockCrossChainRoute(params)];
      }
    }
  }

  /**
   * Executes a swap
   * 
   * @param params The swap parameters
   * @returns Promise resolving to the swap transaction
   */
  public async executeSwap(params: SwapParams): Promise<SwapTransaction> {
    try {
      // Validate parameters
      this.validateSwapParams(params);
      
      // Get the route if not provided
      const route = params.route || (await this.getQuote({
        fromChain: params.fromChain,
        toChain: params.toChain,
        fromAsset: params.fromAsset,
        toAsset: params.toAsset,
        fromAmount: params.fromAmount,
        fromAddress: params.fromAddress
      }))[0];
      
      if (!route) {
        throw new Error('No swap route available');
      }
      
      const isMainnet = this.networkService.isMainnet();
      const endpoint = isMainnet
        ? this.aggregatorEndpoints.mainnet
        : this.aggregatorEndpoints.testnet;
      
      // Execute the swap
      const swapResponse = await fetch(`${endpoint}/api/v1/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromChain: params.fromChain,
          toChain: params.toChain,
          fromAsset: params.fromAsset,
          toAsset: params.toAsset,
          fromAmount: params.fromAmount,
          fromAddress: params.fromAddress,
          toAddress: params.toAddress,
          slippage: params.slippage,
          route
        })
      });
      
      if (!swapResponse.ok) {
        throw new Error(`Failed to execute swap: ${swapResponse.statusText}`);
      }
      
      const swapData = await swapResponse.json();
      
      // Process the first transaction
      const firstStep = swapData.transactions[0];
      const firstChainApi = this.networkService.getApiForNetwork(firstStep.chain);
      
      // Sign and send the first transaction
      const signedTxHash = await firstChainApi.sendTransaction(firstStep.transaction);
      
      // Create the swap transaction object
      const swapTx: SwapTransaction = {
        id: swapData.id,
        fromChain: params.fromChain,
        toChain: params.toChain,
        fromAsset: params.fromAsset,
        toAsset: params.toAsset,
        fromAmount: params.fromAmount,
        toAmount: route.toAmount,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        route,
        transactions: [
          {
            hash: signedTxHash,
            chain: firstStep.chain,
            status: TransactionStatus.PENDING
          }
        ],
        status: TransactionStatus.PENDING,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        estimatedCompletionTime: Date.now() + (route.estimatedTime * 60 * 1000)
      };
      
      // Register the transaction with the aggregator
      await fetch(`${endpoint}/api/v1/swap/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: swapTx.id,
          transactionHash: signedTxHash
        })
      });
      
      // Store the swap transaction in the cache
      this.activeSwapTransactions.set(swapTx.id, swapTx);
      
      // Start monitoring the swap transaction
      this.monitorSwapTransaction(swapTx.id);
      
      return swapTx;
    } catch (error) {
      console.error('Failed to execute swap:', error);
      throw new Error(`Failed to execute swap: ${error.message}`);
    }
  }

  /**
   * Gets the status of a swap transaction
   * 
   * @param id The swap transaction ID
   * @returns Promise resolving to the swap transaction status
   */
  public async getSwapStatus(id: string): Promise<SwapTransaction> {
    try {
      // Check if we have the transaction in the cache
      if (this.activeSwapTransactions.has(id)) {
        return this.activeSwapTransactions.get(id);
      }
      
      // Otherwise query the aggregator
      const isMainnet = this.networkService.isMainnet();
      const endpoint = isMainnet
        ? this.aggregatorEndpoints.mainnet
        : this.aggregatorEndpoints.testnet;
      
      const response = await fetch(`${endpoint}/api/v1/swap/status/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to get swap status: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const swapTx: SwapTransaction = {
        id: data.id,
        fromChain: data.fromChain,
        toChain: data.toChain,
        fromAsset: data.fromAsset,
        toAsset: data.toAsset,
        fromAmount: data.fromAmount,
        toAmount: data.toAmount,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        route: data.route,
        transactions: data.transactions.map(tx => ({
          hash: tx.hash,
          chain: tx.chain,
          status: this.mapSwapStatusToTransactionStatus(tx.status)
        })),
        status: this.mapSwapStatusToTransactionStatus(data.status),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        completedAt: data.completedAt,
        estimatedCompletionTime: data.estimatedCompletionTime,
        error: data.error
      };
      
      // Update the cache
      this.activeSwapTransactions.set(id, swapTx);
      
      return swapTx;
    } catch (error) {
      console.error('Failed to get swap status:', error);
      throw new Error(`Failed to get swap status: ${error.message}`);
    }
  }

  /**
   * Gets the history of swap transactions for a given address
   * 
   * @param address The address to get history for
   * @param limit The maximum number of records to return
   * @returns Promise resolving to the swap transaction history
   */
  public async getSwapHistory(address: string, limit = 20): Promise<SwapTransaction[]> {
    try {
      const isMainnet = this.networkService.isMainnet();
      const endpoint = isMainnet
        ? this.aggregatorEndpoints.mainnet
        : this.aggregatorEndpoints.testnet;
      
      const response = await fetch(`${endpoint}/api/v1/swap/history/${address}?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to get swap history: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data.swaps.map(swap => ({
        id: swap.id,
        fromChain: swap.fromChain,
        toChain: swap.toChain,
        fromAsset: swap.fromAsset,
        toAsset: swap.toAsset,
        fromAmount: swap.fromAmount,
        toAmount: swap.toAmount,
        fromAddress: swap.fromAddress,
        toAddress: swap.toAddress,
        route: swap.route,
        transactions: swap.transactions.map(tx => ({
          hash: tx.hash,
          chain: tx.chain,
          status: this.mapSwapStatusToTransactionStatus(tx.status)
        })),
        status: this.mapSwapStatusToTransactionStatus(swap.status),
        createdAt: swap.createdAt,
        updatedAt: swap.updatedAt,
        completedAt: swap.completedAt,
        estimatedCompletionTime: swap.estimatedCompletionTime,
        error: swap.error
      }));
    } catch (error) {
      console.error('Failed to get swap history:', error);
      throw new Error(`Failed to get swap history: ${error.message}`);
    }
  }

  // Private helper methods

  private validateSwapParams(
    params: Omit<SwapParams, 'toAddress' | 'slippage' | 'route'> | SwapParams
  ): void {
    // Validate chains
    if (!params.fromChain) {
      throw new Error('Source chain is required');
    }
    
    if (!params.toChain) {
      throw new Error('Target chain is required');
    }
    
    // Validate assets
    if (!params.fromAsset) {
      throw new Error('Source asset is required');
    }
    
    if (!params.toAsset) {
      throw new Error('Target asset is required');
    }
    
    // Validate address
    if (!params.fromAddress) {
      throw new Error('Source address is required');
    }
    
    if ('toAddress' in params && !params.toAddress) {
      throw new Error('Target address is required');
    }
    
    // Validate amount
    if (!params.fromAmount || parseFloat(params.fromAmount) <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    // Validate slippage if provided
    if ('slippage' in params && params.slippage) {
      const slippage = parseFloat(params.slippage);
      if (isNaN(slippage) || slippage < 0 || slippage > 100) {
        throw new Error('Slippage must be between 0 and 100');
      }
    }
  }

  private getMockSameChainRoute(
    params: Omit<SwapParams, 'toAddress' | 'slippage' | 'route'>
  ): SwapRoute {
    // Calculate a mock exchange rate and result amount
    const fromAmount = parseFloat(params.fromAmount);
    let exchangeRate = 1.0;
    
    // Simulate different exchange rates based on the asset pair
    if (params.fromAsset === 'CTA' && params.toAsset === 'USDT') {
      exchangeRate = 0.85;
    } else if (params.fromAsset === 'USDT' && params.toAsset === 'CTA') {
      exchangeRate = 1.15;
    } else if (params.fromAsset === 'ETH' && params.toAsset === 'USDT') {
      exchangeRate = 2500;
    } else if (params.fromAsset === 'USDT' && params.toAsset === 'ETH') {
      exchangeRate = 0.0004;
    } else if (params.fromAsset === 'BTC' && params.toAsset === 'USDT') {
      exchangeRate = 50000;
    } else if (params.fromAsset === 'USDT' && params.toAsset === 'BTC') {
      exchangeRate = 0.00002;
    }
    
    const toAmount = (fromAmount * exchangeRate).toFixed(6);
    const fee = (fromAmount * 0.003).toFixed(6); // 0.3% fee
    const feeUsd = (parseFloat(fee) * (params.fromAsset === 'USDT' ? 1 : exchangeRate)).toFixed(2);
    const minReceived = (parseFloat(toAmount) * 0.99).toFixed(6); // 1% slippage
    
    return {
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromAsset: params.fromAsset,
      toAsset: params.toAsset,
      fromAmount: params.fromAmount,
      toAmount,
      exchange: params.fromChain === networks.ZENITH_MAINNET.id ? 'ZenithSwap' : 
                params.fromChain === networks.CATENA_MAINNET.id ? 'CatenaSwap' : 
                params.fromChain === networks.SOLANA_MAINNET.id ? 'Jupiter' : '1inch',
      fee,
      feeAsset: params.fromAsset,
      feeUsd,
      exchangeRate: exchangeRate.toString(),
      minReceived,
      priceImpact: '0.05', // 0.05%
      estimatedTime: 1, // 1 minute
      path: [
        {
          type: 'swap',
          provider: params.fromChain === networks.ZENITH_MAINNET.id ? 'zenithswap' : 
                   params.fromChain === networks.CATENA_MAINNET.id ? 'catenaswap' : 
                   params.fromChain === networks.SOLANA_MAINNET.id ? 'jupiter' : '1inch',
          fromChain: params.fromChain,
          toChain: params.toChain,
          fromAsset: params.fromAsset,
          toAsset: params.toAsset,
          fromAmount: params.fromAmount,
          toAmount
        }
      ]
    };
  }

  private getMockCrossChainRoute(
    params: Omit<SwapParams, 'toAddress' | 'slippage' | 'route'>
  ): SwapRoute {
    // Calculate a mock exchange rate and result amount
    const fromAmount = parseFloat(params.fromAmount);
    let exchangeRate = 1.0;
    
    // Simulate different exchange rates based on the asset pair
    if (params.fromAsset === 'CTA' && params.toAsset === 'USDT') {
      exchangeRate = 0.85;
    } else if (params.fromAsset === 'USDT' && params.toAsset === 'CTA') {
      exchangeRate = 1.15;
    } else if (params.fromAsset === 'ETH' && params.toAsset === 'USDT') {
      exchangeRate = 2500;
    } else if (params.fromAsset === 'USDT' && params.toAsset === 'ETH') {
      exchangeRate = 0.0004;
    } else if (params.fromAsset === 'BTC' && params.toAsset === 'USDT') {
      exchangeRate = 50000;
    } else if (params.fromAsset === 'USDT' && params.toAsset === 'BTC') {
      exchangeRate = 0.00002;
    }
    
    // For cross-chain, add a bridge fee
    const bridgeFee = fromAmount * 0.005; // 0.5% bridge fee
    const swapFee = fromAmount * 0.003; // 0.3% swap fee
    const totalFee = bridgeFee + swapFee;
    
    const intermediateAmount = (fromAmount - swapFee).toFixed(6);
    const toAmount = ((fromAmount - totalFee) * exchangeRate).toFixed(6);
    const fee = totalFee.toFixed(6);
    const feeUsd = (totalFee * (params.fromAsset === 'USDT' ? 1 : exchangeRate)).toFixed(2);
    const minReceived = (parseFloat(toAmount) * 0.98).toFixed(6); // 2% slippage for cross-chain
    
    // Determine the bridge provider
    const bridgeProvider = (params.fromChain === networks.ZENITH_MAINNET.id || 
                          params.toChain === networks.ZENITH_MAINNET.id ||
                          params.fromChain === networks.CATENA_MAINNET.id || 
                          params.toChain === networks.CATENA_MAINNET.id) ? 'lunarlink' : 'anyswap';
    
    // For cross-chain routes, we might need multiple steps
    const path: SwapStep[] = [];
    
    // Different assets might need an initial swap
    if (params.fromAsset !== 'USDT' && params.fromAsset !== 'CTA') {
      path.push({
        type: 'swap',
        provider: params.fromChain === networks.ZENITH_MAINNET.id ? 'zenithswap' : 
                 params.fromChain === networks.CATENA_MAINNET.id ? 'catenaswap' : 
                 params.fromChain === networks.SOLANA_MAINNET.id ? 'jupiter' : '1inch',
        fromChain: params.fromChain,
        toChain: params.fromChain,
        fromAsset: params.fromAsset,
        toAsset: 'USDT',
        fromAmount: params.fromAmount,
        toAmount: (fromAmount * (params.fromAsset === 'ETH' ? 2500 : 50000)).toFixed(6)
      });
    }
    
    // Add the bridge step
    path.push({
      type: 'bridge',
      provider: bridgeProvider,
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromAsset: path.length > 0 ? 'USDT' : params.fromAsset,
      toAsset: params.toAsset === 'USDT' ? 'USDT' : (params.toAsset === path[0]?.fromAsset ? params.toAsset : 'USDT'),
      fromAmount: path.length > 0 ? path[0].toAmount : params.fromAmount,
      toAmount: path.length > 0 && params.toAsset === 'USDT' ? path[0].toAmount : intermediateAmount
    });
    
    // Different target assets might need a final swap
    if (params.toAsset !== 'USDT' && params.toAsset !== 'CTA' && path.length > 0 && path[path.length - 1].toAsset !== params.toAsset) {
      path.push({
        type: 'swap',
        provider: params.toChain === networks.ZENITH_MAINNET.id ? 'zenithswap' : 
                 params.toChain === networks.CATENA_MAINNET.id ? 'catenaswap' : 
                 params.toChain === networks.SOLANA_MAINNET.id ? 'jupiter' : '1inch',
        fromChain: params.toChain,
        toChain: params.toChain,
        fromAsset: 'USDT',
        toAsset: params.toAsset,
        fromAmount: path[path.length - 1].toAmount,
        toAmount
      });
    }
    
    return {
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromAsset: params.fromAsset,
      toAsset: params.toAsset,
      fromAmount: params.fromAmount,
      toAmount,
      exchange: 'Aggregator',
      fee,
      feeAsset: params.fromAsset,
      feeUsd,
      exchangeRate: exchangeRate.toString(),
      minReceived,
      priceImpact: '0.15', // 0.15%
      estimatedTime: 15, // 15 minutes for cross-chain
      path
    };
  }

  private async monitorSwapTransaction(id: string): Promise<void> {
    // Start polling for status updates
    const checkStatus = async () => {
      try {
        const tx = await this.getSwapStatus(id);
        
        // Stop polling if the swap is completed or failed
        if (
          tx.status === TransactionStatus.CONFIRMED ||
          tx.status === TransactionStatus.FAILED ||
          tx.status === TransactionStatus.REJECTED
        ) {
          return;
        }
        
        // Continue polling
        setTimeout(checkStatus, 15000); // Check every 15 seconds
      } catch (error) {
        console.error('Failed to monitor swap transaction:', error);
        // Continue polling despite errors
        setTimeout(checkStatus, 15000);
      }
    };
    
    // Start the polling process
    setTimeout(checkStatus, 5000); // First check after 5 seconds
  }

  private mapSwapStatusToTransactionStatus(swapStatus: string): TransactionStatus {
    const status = swapStatus.toLowerCase();
    
    if (status.includes('pending') || status.includes('initiated')) {
      return TransactionStatus.PENDING;
    }
    
    if (status.includes('processing') || status.includes('in progress')) {
      return TransactionStatus.PROCESSING;
    }
    
    if (status.includes('completed') || status.includes('success')) {
      return TransactionStatus.CONFIRMED;
    }
    
    if (status.includes('failed')) {
      return TransactionStatus.FAILED;
    }
    
    if (status.includes('rejected') || status.includes('cancelled')) {
      return TransactionStatus.REJECTED;
    }
    
    return TransactionStatus.UNKNOWN;
  }
}
