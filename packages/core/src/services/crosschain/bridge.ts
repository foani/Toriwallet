/**
 * Bridge Service
 * 
 * This service handles cross-chain bridging of assets between different blockchains.
 * It supports various bridge protocols including Lunar Link.
 * 
 * @module services/crosschain/bridge
 */

import { NetworkService } from '../network/network-service';
import { TransactionService } from '../transaction/transaction-service';
import { WalletService } from '../wallet/wallet-service';
import { networks } from '../../constants/networks';
import { Transaction, TransactionStatus } from '../../types/transaction';

/**
 * Interface for bridge providers
 */
export interface BridgeProvider {
  id: string;
  name: string;
  logo: string;
  supportedChains: string[];
  supportedAssets: Record<string, string[]>;
  minAmount: Record<string, string>;
  maxAmount: Record<string, string>;
  estimatedTime: number; // in minutes
  website: string;
}

/**
 * Interface for bridge transfer parameters
 */
export interface BridgeTransferParams {
  provider: string;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  asset: string;
  amount: string;
}

/**
 * Interface for bridge quote
 */
export interface BridgeQuote {
  provider: string;
  fromChain: string;
  toChain: string;
  fromAsset: string;
  toAsset: string;
  fromAmount: string;
  toAmount: string; // Expected amount after fees
  fee: string;
  feeAsset: string;
  feeUsd: string;
  estimatedTime: number; // in minutes
  exchangeRate: string;
}

/**
 * Interface for bridge transaction
 */
export interface BridgeTransaction {
  id: string;
  provider: string;
  fromChain: string;
  toChain: string;
  fromAsset: string;
  toAsset: string;
  fromAmount: string;
  toAmount: string;
  fromAddress: string;
  toAddress: string;
  sourceTxHash: string;
  targetTxHash?: string;
  status: TransactionStatus;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  estimatedCompletionTime?: number;
  error?: string;
}

/**
 * BridgeService handles cross-chain asset transfers via bridge protocols
 */
export class BridgeService {
  private networkService: NetworkService;
  private transactionService: TransactionService;
  private walletService: WalletService;
  
  // Bridge provider endpoints
  private readonly providerEndpoints = {
    lunarlink: {
      mainnet: 'https://api.lunarlink.io',
      testnet: 'https://testnet.api.lunarlink.io'
    },
    anyswap: {
      mainnet: 'https://api.anyswap.exchange',
      testnet: 'https://testnet.anyswap.exchange'
    },
    multichain: {
      mainnet: 'https://api.multichain.org',
      testnet: 'https://testnet.api.multichain.org'
    }
  };

  // Cache of active bridge transactions
  private activeBridgeTransactions: Map<string, BridgeTransaction> = new Map();

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
   * Gets available bridge providers
   * 
   * @returns Promise resolving to the list of bridge providers
   */
  public async getProviders(): Promise<BridgeProvider[]> {
    try {
      // For now we'll return a static list, but in a real implementation
      // this would likely come from an API or config
      return [
        {
          id: 'lunarlink',
          name: 'Lunar Link',
          logo: 'https://lunarlink.io/logo.png',
          supportedChains: [
            networks.ZENITH_MAINNET.id,
            networks.CATENA_MAINNET.id,
            networks.ETHEREUM_MAINNET.id,
            networks.BSC_MAINNET.id
          ],
          supportedAssets: {
            [networks.ZENITH_MAINNET.id]: ['CTA', 'USDT', 'BTC', 'ETH'],
            [networks.CATENA_MAINNET.id]: ['CTA', 'USDT', 'WBTC', 'WETH'],
            [networks.ETHEREUM_MAINNET.id]: ['WETH', 'USDT', 'WBTC'],
            [networks.BSC_MAINNET.id]: ['BNB', 'BUSD', 'USDT']
          },
          minAmount: {
            CTA: '10',
            USDT: '10',
            BTC: '0.001',
            ETH: '0.01',
            WBTC: '0.001',
            WETH: '0.01',
            BNB: '0.1',
            BUSD: '10'
          },
          maxAmount: {
            CTA: '1000000',
            USDT: '1000000',
            BTC: '10',
            ETH: '100',
            WBTC: '10',
            WETH: '100',
            BNB: '1000',
            BUSD: '1000000'
          },
          estimatedTime: 15,
          website: 'https://lunarlink.io'
        },
        {
          id: 'anyswap',
          name: 'Anyswap',
          logo: 'https://anyswap.exchange/logo.png',
          supportedChains: [
            networks.ETHEREUM_MAINNET.id,
            networks.BSC_MAINNET.id,
            networks.POLYGON_MAINNET.id
          ],
          supportedAssets: {
            [networks.ETHEREUM_MAINNET.id]: ['ETH', 'USDT', 'USDC', 'DAI'],
            [networks.BSC_MAINNET.id]: ['BNB', 'BUSD', 'USDT', 'USDC'],
            [networks.POLYGON_MAINNET.id]: ['MATIC', 'USDT', 'USDC', 'DAI']
          },
          minAmount: {
            ETH: '0.01',
            USDT: '10',
            USDC: '10',
            DAI: '10',
            BNB: '0.1',
            BUSD: '10',
            MATIC: '10'
          },
          maxAmount: {
            ETH: '100',
            USDT: '1000000',
            USDC: '1000000',
            DAI: '1000000',
            BNB: '1000',
            BUSD: '1000000',
            MATIC: '100000'
          },
          estimatedTime: 20,
          website: 'https://anyswap.exchange'
        }
      ];
    } catch (error) {
      console.error('Failed to get bridge providers:', error);
      throw new Error(`Failed to get bridge providers: ${error.message}`);
    }
  }

  /**
   * Gets a quote for a bridge transfer
   * 
   * @param params The bridge parameters
   * @returns Promise resolving to the bridge quote
   */
  public async getQuote(params: Omit<BridgeTransferParams, 'toAddress'>): Promise<BridgeQuote[]> {
    try {
      // Validate parameters
      this.validateBridgeParams(params);
      
      // Get quotes from supported providers
      const quotes: BridgeQuote[] = [];
      
      // Lunar Link quote
      if (this.isProviderSupported('lunarlink', params.fromChain, params.toChain, params.asset)) {
        const lunarLinkQuote = await this.getLunarLinkQuote(params);
        quotes.push(lunarLinkQuote);
      }
      
      // Anyswap quote
      if (this.isProviderSupported('anyswap', params.fromChain, params.toChain, params.asset)) {
        const anyswapQuote = await this.getAnyswapQuote(params);
        quotes.push(anyswapQuote);
      }
      
      // Sort by lowest fee
      quotes.sort((a, b) => parseFloat(a.feeUsd) - parseFloat(b.feeUsd));
      
      return quotes;
    } catch (error) {
      console.error('Failed to get bridge quotes:', error);
      throw new Error(`Failed to get bridge quotes: ${error.message}`);
    }
  }

  /**
   * Initiates a bridge transfer
   * 
   * @param params The bridge parameters
   * @returns Promise resolving to the bridge transaction
   */
  public async initiateBridgeTransfer(params: BridgeTransferParams): Promise<BridgeTransaction> {
    try {
      // Validate parameters
      this.validateBridgeParams(params);
      
      // Initialize provider-specific bridge transfer
      let bridgeTx: BridgeTransaction;
      
      switch (params.provider) {
        case 'lunarlink':
          bridgeTx = await this.initiateLunarLinkTransfer(params);
          break;
        case 'anyswap':
          bridgeTx = await this.initiateAnyswapTransfer(params);
          break;
        default:
          throw new Error(`Unsupported bridge provider: ${params.provider}`);
      }
      
      // Store the bridge transaction in the cache
      this.activeBridgeTransactions.set(bridgeTx.id, bridgeTx);
      
      // Start monitoring the bridge transaction
      this.monitorBridgeTransaction(bridgeTx.id, params.provider);
      
      return bridgeTx;
    } catch (error) {
      console.error('Failed to initiate bridge transfer:', error);
      throw new Error(`Failed to initiate bridge transfer: ${error.message}`);
    }
  }

  /**
   * Gets the status of a bridge transaction
   * 
   * @param id The bridge transaction ID
   * @returns Promise resolving to the bridge transaction status
   */
  public async getBridgeTransactionStatus(id: string): Promise<BridgeTransaction> {
    try {
      // Check if we have the transaction in the cache
      if (this.activeBridgeTransactions.has(id)) {
        return this.activeBridgeTransactions.get(id);
      }
      
      // If not in cache, try to fetch from providers
      const providers = await this.getProviders();
      
      for (const provider of providers) {
        try {
          const tx = await this.getBridgeTransactionFromProvider(id, provider.id);
          if (tx) {
            // Add to cache
            this.activeBridgeTransactions.set(id, tx);
            return tx;
          }
        } catch (error) {
          console.warn(`Failed to get transaction from ${provider.id}:`, error);
          // Continue trying other providers
        }
      }
      
      throw new Error(`Bridge transaction not found: ${id}`);
    } catch (error) {
      console.error('Failed to get bridge transaction status:', error);
      throw new Error(`Failed to get bridge transaction status: ${error.message}`);
    }
  }

  /**
   * Gets the history of bridge transactions for a given address
   * 
   * @param address The address to get history for
   * @param limit The maximum number of records to return
   * @returns Promise resolving to the bridge transaction history
   */
  public async getBridgeTransactionHistory(address: string, limit = 20): Promise<BridgeTransaction[]> {
    try {
      // Get history from all providers
      const providers = await this.getProviders();
      let transactions: BridgeTransaction[] = [];
      
      for (const provider of providers) {
        try {
          const providerTxs = await this.getBridgeTransactionHistoryFromProvider(address, provider.id, limit);
          transactions = [...transactions, ...providerTxs];
        } catch (error) {
          console.warn(`Failed to get transaction history from ${provider.id}:`, error);
          // Continue with other providers
        }
      }
      
      // Sort by creation time (newest first)
      transactions.sort((a, b) => b.createdAt - a.createdAt);
      
      // Limit the total number of transactions
      return transactions.slice(0, limit);
    } catch (error) {
      console.error('Failed to get bridge transaction history:', error);
      throw new Error(`Failed to get bridge transaction history: ${error.message}`);
    }
  }

  // Private helper methods

  private validateBridgeParams(params: Omit<BridgeTransferParams, 'toAddress'> | BridgeTransferParams): void {
    // Validate chains
    if (!params.fromChain) {
      throw new Error('Source chain is required');
    }
    
    if (!params.toChain) {
      throw new Error('Target chain is required');
    }
    
    if (params.fromChain === params.toChain) {
      throw new Error('Source and target chains must be different');
    }
    
    // Validate address
    if (!params.fromAddress) {
      throw new Error('Source address is required');
    }
    
    if ('toAddress' in params && !params.toAddress) {
      throw new Error('Target address is required');
    }
    
    // Validate asset
    if (!params.asset) {
      throw new Error('Asset is required');
    }
    
    // Validate amount
    if (!params.amount || parseFloat(params.amount) <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    // Validate provider if specified
    if ('provider' in params && params.provider) {
      const isValid = this.isProviderSupported(
        params.provider,
        params.fromChain,
        params.toChain,
        params.asset
      );
      
      if (!isValid) {
        throw new Error(
          `Provider ${params.provider} does not support bridging ${params.asset} ` +
          `from ${params.fromChain} to ${params.toChain}`
        );
      }
    }
  }

  private isProviderSupported(
    providerId: string,
    fromChain: string,
    toChain: string,
    asset: string
  ): boolean {
    // For now, a simple implementation. In a real app, this would check against
    // the actual provider capabilities, possibly from an API
    switch (providerId) {
      case 'lunarlink':
        // Lunar Link supports CreataChain networks and major chains
        const lunarLinkChains = [
          networks.ZENITH_MAINNET.id,
          networks.CATENA_MAINNET.id,
          networks.ETHEREUM_MAINNET.id,
          networks.BSC_MAINNET.id
        ];
        
        return (
          lunarLinkChains.includes(fromChain) &&
          lunarLinkChains.includes(toChain) &&
          ['CTA', 'USDT', 'BTC', 'ETH', 'WBTC', 'WETH', 'BNB', 'BUSD'].includes(asset)
        );
        
      case 'anyswap':
        // Anyswap primarily supports EVM chains
        const anyswapChains = [
          networks.ETHEREUM_MAINNET.id,
          networks.BSC_MAINNET.id,
          networks.POLYGON_MAINNET.id
        ];
        
        return (
          anyswapChains.includes(fromChain) &&
          anyswapChains.includes(toChain) &&
          ['ETH', 'USDT', 'USDC', 'DAI', 'BNB', 'BUSD', 'MATIC'].includes(asset)
        );
        
      default:
        return false;
    }
  }

  private async getLunarLinkQuote(
    params: Omit<BridgeTransferParams, 'provider' | 'toAddress'>
  ): Promise<BridgeQuote> {
    const isMainnet = this.networkService.isMainnet();
    const endpoint = isMainnet
      ? this.providerEndpoints.lunarlink.mainnet
      : this.providerEndpoints.lunarlink.testnet;
    
    const response = await fetch(`${endpoint}/api/v1/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fromChain: params.fromChain,
        toChain: params.toChain,
        fromAsset: params.asset,
        fromAmount: params.amount
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get Lunar Link quote: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      provider: 'lunarlink',
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromAsset: params.asset,
      toAsset: data.toAsset,
      fromAmount: params.amount,
      toAmount: data.toAmount,
      fee: data.fee,
      feeAsset: data.feeAsset,
      feeUsd: data.feeUsd,
      estimatedTime: data.estimatedTime,
      exchangeRate: data.exchangeRate
    };
  }

  private async getAnyswapQuote(
    params: Omit<BridgeTransferParams, 'provider' | 'toAddress'>
  ): Promise<BridgeQuote> {
    const isMainnet = this.networkService.isMainnet();
    const endpoint = isMainnet
      ? this.providerEndpoints.anyswap.mainnet
      : this.providerEndpoints.anyswap.testnet;
    
    const response = await fetch(`${endpoint}/v1/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        src_chain: params.fromChain,
        dst_chain: params.toChain,
        src_token: params.asset,
        amount: params.amount
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get Anyswap quote: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      provider: 'anyswap',
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromAsset: params.asset,
      toAsset: data.dst_token,
      fromAmount: params.amount,
      toAmount: data.dst_amount,
      fee: data.fee,
      feeAsset: params.asset,
      feeUsd: data.fee_usd,
      estimatedTime: data.estimated_time,
      exchangeRate: data.exchange_rate
    };
  }

  private async initiateLunarLinkTransfer(params: BridgeTransferParams): Promise<BridgeTransaction> {
    const isMainnet = this.networkService.isMainnet();
    const endpoint = isMainnet
      ? this.providerEndpoints.lunarlink.mainnet
      : this.providerEndpoints.lunarlink.testnet;
    
    // First, approve the bridge contract if needed (for ERC20 tokens)
    let approveTxHash: string = null;
    if (params.asset !== 'CTA' && params.asset !== 'BTC' && params.asset !== 'ETH' && params.asset !== 'BNB') {
      approveTxHash = await this.approveTokenForBridge(
        params.fromChain,
        params.asset,
        params.amount,
        'lunarlink'
      );
    }
    
    // Get the target asset symbol
    const quote = await this.getLunarLinkQuote({
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromAddress: params.fromAddress,
      asset: params.asset,
      amount: params.amount
    });
    
    // Create and sign the bridge transaction
    const bridgeData = {
      user: params.fromAddress,
      srcChain: params.fromChain,
      dstChain: params.toChain,
      srcToken: params.asset,
      dstToken: quote.toAsset,
      amount: params.amount,
      recipient: params.toAddress,
      approveTxHash
    };
    
    // Prepare transaction data for sending to the bridge
    const api = this.networkService.getApiForNetwork(params.fromChain);
    const txData = await api.prepareBridgeTransaction('lunarlink', bridgeData);
    
    // Sign and send the transaction
    const txHash = await api.sendTransaction(txData);
    
    // Register the bridge transaction with Lunar Link
    const registerResponse = await fetch(`${endpoint}/api/v1/bridge/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        txHash,
        fromChain: params.fromChain,
        toChain: params.toChain,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        fromAsset: params.asset,
        toAsset: quote.toAsset,
        fromAmount: params.amount,
        toAmount: quote.toAmount
      })
    });
    
    if (!registerResponse.ok) {
      throw new Error(`Failed to register bridge transaction: ${registerResponse.statusText}`);
    }
    
    const registerData = await registerResponse.json();
    
    // Create a bridge transaction object
    const bridgeTx: BridgeTransaction = {
      id: registerData.bridgeId,
      provider: 'lunarlink',
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromAsset: params.asset,
      toAsset: quote.toAsset,
      fromAmount: params.amount,
      toAmount: quote.toAmount,
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
      sourceTxHash: txHash,
      status: TransactionStatus.PENDING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      estimatedCompletionTime: Date.now() + (quote.estimatedTime * 60 * 1000)
    };
    
    return bridgeTx;
  }

  private async initiateAnyswapTransfer(params: BridgeTransferParams): Promise<BridgeTransaction> {
    const isMainnet = this.networkService.isMainnet();
    const endpoint = isMainnet
      ? this.providerEndpoints.anyswap.mainnet
      : this.providerEndpoints.anyswap.testnet;
    
    // First, approve the bridge contract if needed (for ERC20 tokens)
    let approveTxHash: string = null;
    if (params.asset !== 'ETH' && params.asset !== 'BNB' && params.asset !== 'MATIC') {
      approveTxHash = await this.approveTokenForBridge(
        params.fromChain,
        params.asset,
        params.amount,
        'anyswap'
      );
    }
    
    // Get the target asset symbol
    const quote = await this.getAnyswapQuote({
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromAddress: params.fromAddress,
      asset: params.asset,
      amount: params.amount
    });
    
    // Create and sign the bridge transaction
    const bridgeData = {
      user: params.fromAddress,
      src_chain: params.fromChain,
      dst_chain: params.toChain,
      src_token: params.asset,
      dst_token: quote.toAsset,
      amount: params.amount,
      recipient: params.toAddress,
      approve_tx: approveTxHash
    };
    
    // Send the transaction data to Anyswap
    const bridgeResponse = await fetch(`${endpoint}/v1/bridge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bridgeData)
    });
    
    if (!bridgeResponse.ok) {
      throw new Error(`Failed to initiate Anyswap bridge: ${bridgeResponse.statusText}`);
    }
    
    const bridgeResult = await bridgeResponse.json();
    
    // Create a bridge transaction object
    const bridgeTx: BridgeTransaction = {
      id: bridgeResult.bridge_id,
      provider: 'anyswap',
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromAsset: params.asset,
      toAsset: quote.toAsset,
      fromAmount: params.amount,
      toAmount: quote.toAmount,
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
      sourceTxHash: bridgeResult.tx_hash,
      status: TransactionStatus.PENDING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      estimatedCompletionTime: Date.now() + (quote.estimatedTime * 60 * 1000)
    };
    
    return bridgeTx;
  }

  private async approveTokenForBridge(
    chainId: string,
    asset: string,
    amount: string,
    provider: string
  ): Promise<string> {
    const api = this.networkService.getApiForNetwork(chainId);
    const bridgeContractAddress = await this.getBridgeContractAddress(chainId, provider);
    
    // Prepare approval transaction
    const approvalTx = await api.prepareTokenApproval(asset, bridgeContractAddress, amount);
    
    // Send the transaction
    return api.sendTransaction(approvalTx);
  }

  private async getBridgeContractAddress(chainId: string, provider: string): Promise<string> {
    const isMainnet = this.networkService.isMainnet();
    let endpoint: string;
    
    switch (provider) {
      case 'lunarlink':
        endpoint = isMainnet
          ? this.providerEndpoints.lunarlink.mainnet
          : this.providerEndpoints.lunarlink.testnet;
        break;
      case 'anyswap':
        endpoint = isMainnet
          ? this.providerEndpoints.anyswap.mainnet
          : this.providerEndpoints.anyswap.testnet;
        break;
      default:
        throw new Error(`Unsupported bridge provider: ${provider}`);
    }
    
    const response = await fetch(`${endpoint}/v1/contract-address?chain=${chainId}`);
    if (!response.ok) {
      throw new Error(`Failed to get bridge contract address: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.contract_address;
  }

  private async getBridgeTransactionFromProvider(
    id: string,
    provider: string
  ): Promise<BridgeTransaction | null> {
    const isMainnet = this.networkService.isMainnet();
    let endpoint: string;
    
    switch (provider) {
      case 'lunarlink':
        endpoint = isMainnet
          ? this.providerEndpoints.lunarlink.mainnet
          : this.providerEndpoints.lunarlink.testnet;
        
        try {
          const response = await fetch(`${endpoint}/api/v1/bridge/status/${id}`);
          if (!response.ok) {
            return null;
          }
          
          const data = await response.json();
          
          return {
            id,
            provider: 'lunarlink',
            fromChain: data.fromChain,
            toChain: data.toChain,
            fromAsset: data.fromAsset,
            toAsset: data.toAsset,
            fromAmount: data.fromAmount,
            toAmount: data.toAmount,
            fromAddress: data.fromAddress,
            toAddress: data.toAddress,
            sourceTxHash: data.sourceTxHash,
            targetTxHash: data.targetTxHash,
            status: this.mapBridgeStatusToTransactionStatus(data.status),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            completedAt: data.completedAt,
            error: data.error
          };
        } catch (error) {
          console.error('Failed to get Lunar Link transaction:', error);
          return null;
        }
        
      case 'anyswap':
        endpoint = isMainnet
          ? this.providerEndpoints.anyswap.mainnet
          : this.providerEndpoints.anyswap.testnet;
        
        try {
          const response = await fetch(`${endpoint}/v1/bridge/${id}`);
          if (!response.ok) {
            return null;
          }
          
          const data = await response.json();
          
          return {
            id,
            provider: 'anyswap',
            fromChain: data.src_chain,
            toChain: data.dst_chain,
            fromAsset: data.src_token,
            toAsset: data.dst_token,
            fromAmount: data.src_amount,
            toAmount: data.dst_amount,
            fromAddress: data.from_address,
            toAddress: data.to_address,
            sourceTxHash: data.src_tx_hash,
            targetTxHash: data.dst_tx_hash,
            status: this.mapBridgeStatusToTransactionStatus(data.status),
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            completedAt: data.completed_at,
            error: data.error
          };
        } catch (error) {
          console.error('Failed to get Anyswap transaction:', error);
          return null;
        }
        
      default:
        return null;
    }
  }

  private async getBridgeTransactionHistoryFromProvider(
    address: string,
    provider: string,
    limit: number
  ): Promise<BridgeTransaction[]> {
    const isMainnet = this.networkService.isMainnet();
    let endpoint: string;
    
    switch (provider) {
      case 'lunarlink':
        endpoint = isMainnet
          ? this.providerEndpoints.lunarlink.mainnet
          : this.providerEndpoints.lunarlink.testnet;
        
        try {
          const response = await fetch(
            `${endpoint}/api/v1/bridge/history?address=${address}&limit=${limit}`
          );
          
          if (!response.ok) {
            return [];
          }
          
          const data = await response.json();
          
          return data.transactions.map(tx => ({
            id: tx.id,
            provider: 'lunarlink',
            fromChain: tx.fromChain,
            toChain: tx.toChain,
            fromAsset: tx.fromAsset,
            toAsset: tx.toAsset,
            fromAmount: tx.fromAmount,
            toAmount: tx.toAmount,
            fromAddress: tx.fromAddress,
            toAddress: tx.toAddress,
            sourceTxHash: tx.sourceTxHash,
            targetTxHash: tx.targetTxHash,
            status: this.mapBridgeStatusToTransactionStatus(tx.status),
            createdAt: tx.createdAt,
            updatedAt: tx.updatedAt,
            completedAt: tx.completedAt,
            error: tx.error
          }));
        } catch (error) {
          console.error('Failed to get Lunar Link transaction history:', error);
          return [];
        }
        
      case 'anyswap':
        endpoint = isMainnet
          ? this.providerEndpoints.anyswap.mainnet
          : this.providerEndpoints.anyswap.testnet;
        
        try {
          const response = await fetch(
            `${endpoint}/v1/history?address=${address}&limit=${limit}`
          );
          
          if (!response.ok) {
            return [];
          }
          
          const data = await response.json();
          
          return data.transactions.map(tx => ({
            id: tx.id,
            provider: 'anyswap',
            fromChain: tx.src_chain,
            toChain: tx.dst_chain,
            fromAsset: tx.src_token,
            toAsset: tx.dst_token,
            fromAmount: tx.src_amount,
            toAmount: tx.dst_amount,
            fromAddress: tx.from_address,
            toAddress: tx.to_address,
            sourceTxHash: tx.src_tx_hash,
            targetTxHash: tx.dst_tx_hash,
            status: this.mapBridgeStatusToTransactionStatus(tx.status),
            createdAt: tx.created_at,
            updatedAt: tx.updated_at,
            completedAt: tx.completed_at,
            error: tx.error
          }));
        } catch (error) {
          console.error('Failed to get Anyswap transaction history:', error);
          return [];
        }
        
      default:
        return [];
    }
  }

  private async monitorBridgeTransaction(id: string, provider: string): Promise<void> {
    // Start polling for status updates
    const checkStatus = async () => {
      try {
        const tx = await this.getBridgeTransactionFromProvider(id, provider);
        if (!tx) {
          throw new Error(`Bridge transaction not found: ${id}`);
        }
        
        // Update the cached transaction
        this.activeBridgeTransactions.set(id, tx);
        
        // Stop polling if the transfer is completed or failed
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
        console.error('Failed to monitor bridge transaction:', error);
        // Continue polling despite errors
        setTimeout(checkStatus, 15000);
      }
    };
    
    // Start the polling process
    setTimeout(checkStatus, 5000); // First check after 5 seconds
  }

  private mapBridgeStatusToTransactionStatus(bridgeStatus: string): TransactionStatus {
    const status = bridgeStatus.toLowerCase();
    
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
