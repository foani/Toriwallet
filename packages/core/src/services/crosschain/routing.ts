/**
 * Routing Service
 * 
 * This service provides optimal path finding for cross-chain transactions,
 * helping users find the most efficient way to transfer or swap assets
 * across different blockchains.
 * 
 * @module services/crosschain/routing
 */

import { NetworkService } from '../network/network-service';
import { networks } from '../../constants/networks';
import { SwapService, SwapRoute } from './swap';
import { BridgeService, BridgeQuote } from './bridge';

/**
 * Interface for route request parameters
 */
export interface RouteParams {
  fromChain: string;
  toChain: string;
  fromAsset: string;
  toAsset: string;
  fromAddress: string;
  amount: string;
  options?: {
    includeBridges?: boolean;
    includeSwaps?: boolean;
    preferLowFees?: boolean;
    preferSpeed?: boolean;
  };
}

/**
 * Interface for routing options
 */
export interface RoutingOptions {
  includeBridges: boolean;
  includeSwaps: boolean;
  preferLowFees: boolean;
  preferSpeed: boolean;
}

/**
 * Interface for route response
 */
export interface Route {
  type: 'direct' | 'bridge' | 'swap' | 'complex';
  fromChain: string;
  toChain: string;
  fromAsset: string;
  toAsset: string;
  fromAmount: string;
  toAmount: string;
  estimatedGas: string;
  estimatedGasUsd: string;
  fee: string;
  feeUsd: string;
  totalCost: string; // fee + gas in USD
  estimatedTime: number; // in minutes
  steps: RouteStep[];
}

/**
 * Interface for route step
 */
export interface RouteStep {
  type: 'transfer' | 'bridge' | 'swap';
  provider?: string;
  fromChain: string;
  toChain: string;
  fromAsset: string;
  toAsset: string;
  fromAmount: string;
  toAmount: string;
  fee: string;
  feeUsd: string;
  estimatedTime: number; // in minutes
}

/**
 * RoutingService provides optimal path finding for cross-chain transactions
 */
export class RoutingService {
  private networkService: NetworkService;
  private swapService: SwapService;
  private bridgeService: BridgeService;
  
  // Routing service endpoint
  private readonly routingEndpoint = {
    mainnet: 'https://routing.tori-wallet.creatachain.com',
    testnet: 'https://testnet.routing.tori-wallet.creatachain.com'
  };

  constructor(
    networkService?: NetworkService,
    swapService?: SwapService,
    bridgeService?: BridgeService
  ) {
    this.networkService = networkService || new NetworkService();
    this.swapService = swapService || new SwapService();
    this.bridgeService = bridgeService || new BridgeService();
  }

  /**
   * Finds optimal routes for transferring assets across chains
   * 
   * @param params The route request parameters
   * @returns Promise resolving to available routes
   */
  public async findRoutes(params: RouteParams): Promise<Route[]> {
    try {
      // Set default options
      const options: RoutingOptions = {
        includeBridges: params.options?.includeBridges !== false,
        includeSwaps: params.options?.includeSwaps !== false,
        preferLowFees: params.options?.preferLowFees !== false,
        preferSpeed: params.options?.preferSpeed === true
      };
      
      // Try to use the routing service API first
      try {
        const routes = await this.getRoutesFromApi(params, options);
        if (routes.length > 0) {
          return routes;
        }
      } catch (error) {
        console.warn('Routing API failed, falling back to local routing:', error);
      }
      
      // Fall back to local routing logic
      return this.getRoutesLocally(params, options);
    } catch (error) {
      console.error('Failed to find routes:', error);
      throw new Error(`Failed to find routes: ${error.message}`);
    }
  }

  /**
   * Gets gas estimates for a specific chain
   * 
   * @param chainId The chain ID
   * @returns Promise resolving to the gas estimates in native token and USD
   */
  public async getGasEstimates(chainId: string): Promise<{
    slow: { amount: string; amountUsd: string; time: number };
    average: { amount: string; amountUsd: string; time: number };
    fast: { amount: string; amountUsd: string; time: number };
  }> {
    try {
      const isMainnet = this.networkService.isMainnet();
      const endpoint = isMainnet
        ? this.routingEndpoint.mainnet
        : this.routingEndpoint.testnet;
      
      const response = await fetch(`${endpoint}/api/v1/gas-estimates/${chainId}`);
      if (!response.ok) {
        throw new Error(`Failed to get gas estimates: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.estimates;
    } catch (error) {
      console.error('Failed to get gas estimates:', error);
      
      // Return mock data based on the chain
      let slowAmount = '0.001';
      let averageAmount = '0.0015';
      let fastAmount = '0.002';
      let slowAmountUsd = '2.5';
      let averageAmountUsd = '3.75';
      let fastAmountUsd = '5.0';
      
      if (chainId === networks.ETHEREUM_MAINNET.id) {
        slowAmount = '0.001';
        averageAmount = '0.0015';
        fastAmount = '0.002';
        slowAmountUsd = '2.5';
        averageAmountUsd = '3.75';
        fastAmountUsd = '5.0';
      } else if (chainId === networks.BSC_MAINNET.id) {
        slowAmount = '0.0005';
        averageAmount = '0.00075';
        fastAmount = '0.001';
        slowAmountUsd = '0.15';
        averageAmountUsd = '0.225';
        fastAmountUsd = '0.3';
      } else if (chainId === networks.POLYGON_MAINNET.id) {
        slowAmount = '0.01';
        averageAmount = '0.015';
        fastAmount = '0.02';
        slowAmountUsd = '0.01';
        averageAmountUsd = '0.015';
        fastAmountUsd = '0.02';
      } else if (chainId === networks.SOLANA_MAINNET.id) {
        slowAmount = '0.000005';
        averageAmount = '0.000008';
        fastAmount = '0.00001';
        slowAmountUsd = '0.0005';
        averageAmountUsd = '0.0008';
        fastAmountUsd = '0.001';
      } else if (chainId === networks.ZENITH_MAINNET.id || chainId === networks.CATENA_MAINNET.id) {
        slowAmount = '0.0001';
        averageAmount = '0.00015';
        fastAmount = '0.0002';
        slowAmountUsd = '0.00008';
        averageAmountUsd = '0.00012';
        fastAmountUsd = '0.00016';
      }
      
      return {
        slow: {
          amount: slowAmount,
          amountUsd: slowAmountUsd,
          time: 10
        },
        average: {
          amount: averageAmount,
          amountUsd: averageAmountUsd,
          time: 5
        },
        fast: {
          amount: fastAmount,
          amountUsd: fastAmountUsd,
          time: 1
        }
      };
    }
  }

  // Private helper methods

  private async getRoutesFromApi(params: RouteParams, options: RoutingOptions): Promise<Route[]> {
    const isMainnet = this.networkService.isMainnet();
    const endpoint = isMainnet
      ? this.routingEndpoint.mainnet
      : this.routingEndpoint.testnet;
    
    const response = await fetch(`${endpoint}/api/v1/routes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fromChain: params.fromChain,
        toChain: params.toChain,
        fromAsset: params.fromAsset,
        toAsset: params.toAsset,
        fromAddress: params.fromAddress,
        amount: params.amount,
        options
      })
    });
    
    if (!response.ok) {
      throw new Error(`Routing API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.routes;
  }

  private async getRoutesLocally(params: RouteParams, options: RoutingOptions): Promise<Route[]> {
    const routes: Route[] = [];
    
    // Try direct transfer if chains are the same
    if (params.fromChain === params.toChain) {
      const directRoute = await this.getDirectTransferRoute(params);
      routes.push(directRoute);
      
      // If assets are different, try a swap as well
      if (params.fromAsset !== params.toAsset && options.includeSwaps) {
        const swapRoutes = await this.getSwapRoutes(params);
        routes.push(...swapRoutes);
      }
    } else {
      // Different chains - try bridge and swap options
      
      // Add bridge options
      if (options.includeBridges) {
        const bridgeRoutes = await this.getBridgeRoutes(params);
        routes.push(...bridgeRoutes);
      }
      
      // Add cross-chain swap options
      if (options.includeSwaps) {
        const swapRoutes = await this.getSwapRoutes(params);
        routes.push(...swapRoutes);
      }
      
      // Add complex routes (multiple steps combining bridges and swaps)
      if (options.includeBridges && options.includeSwaps) {
        const complexRoutes = await this.getComplexRoutes(params);
        routes.push(...complexRoutes);
      }
    }
    
    // Sort routes based on options
    if (options.preferLowFees) {
      routes.sort((a, b) => parseFloat(a.totalCost) - parseFloat(b.totalCost));
    } else if (options.preferSpeed) {
      routes.sort((a, b) => a.estimatedTime - b.estimatedTime);
    } else {
      // By default, sort by a weighted combination of cost and time
      routes.sort((a, b) => {
        const scoreA = parseFloat(a.totalCost) * 0.7 + a.estimatedTime * 0.3;
        const scoreB = parseFloat(b.totalCost) * 0.7 + b.estimatedTime * 0.3;
        return scoreA - scoreB;
      });
    }
    
    return routes;
  }

  private async getDirectTransferRoute(params: RouteParams): Promise<Route> {
    // Get gas estimates for the chain
    const gasEstimates = await this.getGasEstimates(params.fromChain);
    
    // Use average gas price
    const gasAmount = gasEstimates.average.amount;
    const gasAmountUsd = gasEstimates.average.amountUsd;
    const estimatedTime = gasEstimates.average.time;
    
    // Direct transfers don't have additional fees
    const fee = '0';
    const feeUsd = '0';
    
    return {
      type: 'direct',
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromAsset: params.fromAsset,
      toAsset: params.toAsset,
      fromAmount: params.amount,
      toAmount: params.amount, // Same amount for direct transfer of same asset
      estimatedGas: gasAmount,
      estimatedGasUsd: gasAmountUsd,
      fee,
      feeUsd,
      totalCost: gasAmountUsd, // Just gas cost
      estimatedTime,
      steps: [
        {
          type: 'transfer',
          fromChain: params.fromChain,
          toChain: params.toChain,
          fromAsset: params.fromAsset,
          toAsset: params.toAsset,
          fromAmount: params.amount,
          toAmount: params.amount,
          fee,
          feeUsd,
          estimatedTime
        }
      ]
    };
  }

  private async getBridgeRoutes(params: RouteParams): Promise<Route[]> {
    const routes: Route[] = [];
    
    try {
      // Get bridge options
      const bridgeQuotes = await this.bridgeService.getQuote({
        provider: '',
        fromChain: params.fromChain,
        toChain: params.toChain,
        fromAddress: params.fromAddress,
        toAddress: '',
        asset: params.fromAsset === params.toAsset ? params.fromAsset : 'USDT', // Default to USDT for different assets
        amount: params.amount
      });
      
      // Get gas estimates
      const sourceGasEstimates = await this.getGasEstimates(params.fromChain);
      
      // Convert bridge quotes to routes
      for (const quote of bridgeQuotes) {
        // Need additional swaps if assets are different
        const needsInitialSwap = params.fromAsset !== quote.fromAsset;
        const needsFinalSwap = quote.toAsset !== params.toAsset;
        
        if (needsInitialSwap || needsFinalSwap) {
          // This would be a complex route, handled by getComplexRoutes
          continue;
        }
        
        const gasAmount = sourceGasEstimates.average.amount;
        const gasAmountUsd = sourceGasEstimates.average.amountUsd;
        
        const route: Route = {
          type: 'bridge',
          fromChain: params.fromChain,
          toChain: params.toChain,
          fromAsset: params.fromAsset,
          toAsset: params.toAsset,
          fromAmount: params.amount,
          toAmount: quote.toAmount,
          estimatedGas: gasAmount,
          estimatedGasUsd: gasAmountUsd,
          fee: quote.fee,
          feeUsd: quote.feeUsd,
          totalCost: (parseFloat(gasAmountUsd) + parseFloat(quote.feeUsd)).toFixed(2),
          estimatedTime: quote.estimatedTime,
          steps: [
            {
              type: 'bridge',
              provider: quote.provider,
              fromChain: params.fromChain,
              toChain: params.toChain,
              fromAsset: params.fromAsset,
              toAsset: params.toAsset,
              fromAmount: params.amount,
              toAmount: quote.toAmount,
              fee: quote.fee,
              feeUsd: quote.feeUsd,
              estimatedTime: quote.estimatedTime
            }
          ]
        };
        
        routes.push(route);
      }
    } catch (error) {
      console.warn('Failed to get bridge routes:', error);
    }
    
    return routes;
  }

  private async getSwapRoutes(params: RouteParams): Promise<Route[]> {
    const routes: Route[] = [];
    
    try {
      // Get swap options
      const swapRoutes = await this.swapService.getQuote({
        fromChain: params.fromChain,
        toChain: params.toChain,
        fromAsset: params.fromAsset,
        toAsset: params.toAsset,
        fromAddress: params.fromAddress,
        fromAmount: params.amount
      });
      
      // Get gas estimates
      const sourceGasEstimates = await this.getGasEstimates(params.fromChain);
      
      // Convert swap routes to our route format
      for (const swapRoute of swapRoutes) {
        const gasAmount = sourceGasEstimates.average.amount;
        const gasAmountUsd = sourceGasEstimates.average.amountUsd;
        
        // Map the swap path to our steps format
        const steps: RouteStep[] = swapRoute.path.map(step => ({
          type: step.type === 'swap' ? 'swap' : 'bridge',
          provider: step.provider,
          fromChain: step.fromChain,
          toChain: step.toChain,
          fromAsset: step.fromAsset,
          toAsset: step.toAsset,
          fromAmount: step.fromAmount,
          toAmount: step.toAmount,
          fee: '0', // Fee is included in the total swap fee
          feeUsd: '0',
          estimatedTime: swapRoute.estimatedTime / swapRoute.path.length // Distribute time proportionally
        }));
        
        const route: Route = {
          type: params.fromChain === params.toChain ? 'swap' : 'complex',
          fromChain: params.fromChain,
          toChain: params.toChain,
          fromAsset: params.fromAsset,
          toAsset: params.toAsset,
          fromAmount: params.amount,
          toAmount: swapRoute.toAmount,
          estimatedGas: gasAmount,
          estimatedGasUsd: gasAmountUsd,
          fee: swapRoute.fee,
          feeUsd: swapRoute.feeUsd,
          totalCost: (parseFloat(gasAmountUsd) + parseFloat(swapRoute.feeUsd)).toFixed(2),
          estimatedTime: swapRoute.estimatedTime,
          steps
        };
        
        routes.push(route);
      }
    } catch (error) {
      console.warn('Failed to get swap routes:', error);
    }
    
    return routes;
  }

  private async getComplexRoutes(params: RouteParams): Promise<Route[]> {
    const routes: Route[] = [];
    
    try {
      // For different assets on different chains, we might need multiple steps:
      // 1. Swap source asset to a bridge-compatible asset (e.g., USDT)
      // 2. Bridge the asset to target chain
      // 3. Swap the bridged asset to target asset
      
      // Start by considering USDT as the intermediate asset
      const intermediateAsset = 'USDT';
      
      // Check if source asset is not USDT and not the target asset
      const needsInitialSwap = params.fromAsset !== intermediateAsset && 
                             params.fromAsset !== params.toAsset;
      
      // Check if target asset is not USDT and not the source asset
      const needsFinalSwap = params.toAsset !== intermediateAsset && 
                           params.toAsset !== params.fromAsset;
      
      // Get gas estimates
      const sourceGasEstimates = await this.getGasEstimates(params.fromChain);
      const targetGasEstimates = await this.getGasEstimates(params.toChain);
      
      // Case 1: Swap source asset to USDT, bridge USDT, then swap to target asset
      if (needsInitialSwap && needsFinalSwap) {
        // Step 1: Get quote for swapping source asset to USDT
        let initialSwapRoute: SwapRoute = null;
        try {
          const initialSwapRoutes = await this.swapService.getQuote({
            fromChain: params.fromChain,
            toChain: params.fromChain,
            fromAsset: params.fromAsset,
            toAsset: intermediateAsset,
            fromAddress: params.fromAddress,
            fromAmount: params.amount
          });
          
          if (initialSwapRoutes.length > 0) {
            initialSwapRoute = initialSwapRoutes[0];
          }
        } catch (error) {
          console.warn('Failed to get initial swap route:', error);
        }
        
        if (initialSwapRoute) {
          // Step 2: Get quote for bridging USDT
          let bridgeQuote: BridgeQuote = null;
          try {
            const bridgeQuotes = await this.bridgeService.getQuote({
              provider: '',
              fromChain: params.fromChain,
              toChain: params.toChain,
              fromAddress: params.fromAddress,
              toAddress: '',
              asset: intermediateAsset,
              amount: initialSwapRoute.toAmount
            });
            
            if (bridgeQuotes.length > 0) {
              bridgeQuote = bridgeQuotes[0];
            }
          } catch (error) {
            console.warn('Failed to get bridge quote:', error);
          }
          
          if (bridgeQuote) {
            // Step 3: Get quote for swapping USDT to target asset
            let finalSwapRoute: SwapRoute = null;
            try {
              const finalSwapRoutes = await this.swapService.getQuote({
                fromChain: params.toChain,
                toChain: params.toChain,
                fromAsset: intermediateAsset,
                toAsset: params.toAsset,
                fromAddress: params.fromAddress,
                fromAmount: bridgeQuote.toAmount
              });
              
              if (finalSwapRoutes.length > 0) {
                finalSwapRoute = finalSwapRoutes[0];
              }
            } catch (error) {
              console.warn('Failed to get final swap route:', error);
            }
            
            if (finalSwapRoute) {
              // Combine all steps into a complex route
              const sourceGasAmount = sourceGasEstimates.average.amount;
              const sourceGasAmountUsd = sourceGasEstimates.average.amountUsd;
              const targetGasAmount = targetGasEstimates.average.amount;
              const targetGasAmountUsd = targetGasEstimates.average.amountUsd;
              
              const totalGasUsd = (parseFloat(sourceGasAmountUsd) + parseFloat(targetGasAmountUsd)).toFixed(2);
              const totalFeeUsd = (
                parseFloat(initialSwapRoute.feeUsd) + 
                parseFloat(bridgeQuote.feeUsd) + 
                parseFloat(finalSwapRoute.feeUsd)
              ).toFixed(2);
              
              const totalCost = (parseFloat(totalGasUsd) + parseFloat(totalFeeUsd)).toFixed(2);
              const totalTime = initialSwapRoute.estimatedTime + 
                             bridgeQuote.estimatedTime + 
                             finalSwapRoute.estimatedTime;
              
              const route: Route = {
                type: 'complex',
                fromChain: params.fromChain,
                toChain: params.toChain,
                fromAsset: params.fromAsset,
                toAsset: params.toAsset,
                fromAmount: params.amount,
                toAmount: finalSwapRoute.toAmount,
                estimatedGas: `${sourceGasAmount} + ${targetGasAmount}`,
                estimatedGasUsd: totalGasUsd,
                fee: `${initialSwapRoute.fee} + ${bridgeQuote.fee} + ${finalSwapRoute.fee}`,
                feeUsd: totalFeeUsd,
                totalCost,
                estimatedTime: totalTime,
                steps: [
                  {
                    type: 'swap',
                    provider: initialSwapRoute.exchange,
                    fromChain: params.fromChain,
                    toChain: params.fromChain,
                    fromAsset: params.fromAsset,
                    toAsset: intermediateAsset,
                    fromAmount: params.amount,
                    toAmount: initialSwapRoute.toAmount,
                    fee: initialSwapRoute.fee,
                    feeUsd: initialSwapRoute.feeUsd,
                    estimatedTime: initialSwapRoute.estimatedTime
                  },
                  {
                    type: 'bridge',
                    provider: bridgeQuote.provider,
                    fromChain: params.fromChain,
                    toChain: params.toChain,
                    fromAsset: intermediateAsset,
                    toAsset: intermediateAsset,
                    fromAmount: initialSwapRoute.toAmount,
                    toAmount: bridgeQuote.toAmount,
                    fee: bridgeQuote.fee,
                    feeUsd: bridgeQuote.feeUsd,
                    estimatedTime: bridgeQuote.estimatedTime
                  },
                  {
                    type: 'swap',
                    provider: finalSwapRoute.exchange,
                    fromChain: params.toChain,
                    toChain: params.toChain,
                    fromAsset: intermediateAsset,
                    toAsset: params.toAsset,
                    fromAmount: bridgeQuote.toAmount,
                    toAmount: finalSwapRoute.toAmount,
                    fee: finalSwapRoute.fee,
                    feeUsd: finalSwapRoute.feeUsd,
                    estimatedTime: finalSwapRoute.estimatedTime
                  }
                ]
              };
              
              routes.push(route);
            }
          }
        }
      }
      // Case 2: Swap source asset to USDT, then bridge USDT to target chain
      else if (needsInitialSwap && !needsFinalSwap) {
        // Step 1: Get quote for swapping source asset to USDT
        let initialSwapRoute: SwapRoute = null;
        try {
          const initialSwapRoutes = await this.swapService.getQuote({
            fromChain: params.fromChain,
            toChain: params.fromChain,
            fromAsset: params.fromAsset,
            toAsset: intermediateAsset,
            fromAddress: params.fromAddress,
            fromAmount: params.amount
          });
          
          if (initialSwapRoutes.length > 0) {
            initialSwapRoute = initialSwapRoutes[0];
          }
        } catch (error) {
          console.warn('Failed to get initial swap route:', error);
        }
        
        if (initialSwapRoute) {
          // Step 2: Get quote for bridging USDT to target chain
          let bridgeQuote: BridgeQuote = null;
          try {
            const bridgeQuotes = await this.bridgeService.getQuote({
              provider: '',
              fromChain: params.fromChain,
              toChain: params.toChain,
              fromAddress: params.fromAddress,
              toAddress: '',
              asset: intermediateAsset,
              amount: initialSwapRoute.toAmount
            });
            
            if (bridgeQuotes.length > 0) {
              bridgeQuote = bridgeQuotes[0];
            }
          } catch (error) {
            console.warn('Failed to get bridge quote:', error);
          }
          
          if (bridgeQuote) {
            // Combine steps into a complex route
            const sourceGasAmount = sourceGasEstimates.average.amount;
            const sourceGasAmountUsd = sourceGasEstimates.average.amountUsd;
            
            const totalFeeUsd = (
              parseFloat(initialSwapRoute.feeUsd) + 
              parseFloat(bridgeQuote.feeUsd)
            ).toFixed(2);
            
            const totalCost = (parseFloat(sourceGasAmountUsd) + parseFloat(totalFeeUsd)).toFixed(2);
            const totalTime = initialSwapRoute.estimatedTime + bridgeQuote.estimatedTime;
            
            const route: Route = {
              type: 'complex',
              fromChain: params.fromChain,
              toChain: params.toChain,
              fromAsset: params.fromAsset,
              toAsset: params.toAsset,
              fromAmount: params.amount,
              toAmount: bridgeQuote.toAmount,
              estimatedGas: sourceGasAmount,
              estimatedGasUsd: sourceGasAmountUsd,
              fee: `${initialSwapRoute.fee} + ${bridgeQuote.fee}`,
              feeUsd: totalFeeUsd,
              totalCost,
              estimatedTime: totalTime,
              steps: [
                {
                  type: 'swap',
                  provider: initialSwapRoute.exchange,
                  fromChain: params.fromChain,
                  toChain: params.fromChain,
                  fromAsset: params.fromAsset,
                  toAsset: intermediateAsset,
                  fromAmount: params.amount,
                  toAmount: initialSwapRoute.toAmount,
                  fee: initialSwapRoute.fee,
                  feeUsd: initialSwapRoute.feeUsd,
                  estimatedTime: initialSwapRoute.estimatedTime
                },
                {
                  type: 'bridge',
                  provider: bridgeQuote.provider,
                  fromChain: params.fromChain,
                  toChain: params.toChain,
                  fromAsset: intermediateAsset,
                  toAsset: params.toAsset,
                  fromAmount: initialSwapRoute.toAmount,
                  toAmount: bridgeQuote.toAmount,
                  fee: bridgeQuote.fee,
                  feeUsd: bridgeQuote.feeUsd,
                  estimatedTime: bridgeQuote.estimatedTime
                }
              ]
            };
            
            routes.push(route);
          }
        }
      }
      // Case 3: Bridge source asset to target chain, then swap to target asset
      else if (!needsInitialSwap && needsFinalSwap) {
        // Step 1: Get quote for bridging source asset
        let bridgeQuote: BridgeQuote = null;
        try {
          const bridgeQuotes = await this.bridgeService.getQuote({
            provider: '',
            fromChain: params.fromChain,
            toChain: params.toChain,
            fromAddress: params.fromAddress,
            toAddress: '',
            asset: params.fromAsset,
            amount: params.amount
          });
          
          if (bridgeQuotes.length > 0) {
            bridgeQuote = bridgeQuotes[0];
          }
        } catch (error) {
          console.warn('Failed to get bridge quote:', error);
        }
        
        if (bridgeQuote) {
          // Step 2: Get quote for swapping bridged asset to target asset
          let finalSwapRoute: SwapRoute = null;
          try {
            const finalSwapRoutes = await this.swapService.getQuote({
              fromChain: params.toChain,
              toChain: params.toChain,
              fromAsset: bridgeQuote.toAsset,
              toAsset: params.toAsset,
              fromAddress: params.fromAddress,
              fromAmount: bridgeQuote.toAmount
            });
            
            if (finalSwapRoutes.length > 0) {
              finalSwapRoute = finalSwapRoutes[0];
            }
          } catch (error) {
            console.warn('Failed to get final swap route:', error);
          }
          
          if (finalSwapRoute) {
            // Combine steps into a complex route
            const sourceGasAmount = sourceGasEstimates.average.amount;
            const sourceGasAmountUsd = sourceGasEstimates.average.amountUsd;
            const targetGasAmount = targetGasEstimates.average.amount;
            const targetGasAmountUsd = targetGasEstimates.average.amountUsd;
            
            const totalGasUsd = (parseFloat(sourceGasAmountUsd) + parseFloat(targetGasAmountUsd)).toFixed(2);
            const totalFeeUsd = (
              parseFloat(bridgeQuote.feeUsd) + 
              parseFloat(finalSwapRoute.feeUsd)
            ).toFixed(2);
            
            const totalCost = (parseFloat(totalGasUsd) + parseFloat(totalFeeUsd)).toFixed(2);
            const totalTime = bridgeQuote.estimatedTime + finalSwapRoute.estimatedTime;
            
            const route: Route = {
              type: 'complex',
              fromChain: params.fromChain,
              toChain: params.toChain,
              fromAsset: params.fromAsset,
              toAsset: params.toAsset,
              fromAmount: params.amount,
              toAmount: finalSwapRoute.toAmount,
              estimatedGas: `${sourceGasAmount} + ${targetGasAmount}`,
              estimatedGasUsd: totalGasUsd,
              fee: `${bridgeQuote.fee} + ${finalSwapRoute.fee}`,
              feeUsd: totalFeeUsd,
              totalCost,
              estimatedTime: totalTime,
              steps: [
                {
                  type: 'bridge',
                  provider: bridgeQuote.provider,
                  fromChain: params.fromChain,
                  toChain: params.toChain,
                  fromAsset: params.fromAsset,
                  toAsset: bridgeQuote.toAsset,
                  fromAmount: params.amount,
                  toAmount: bridgeQuote.toAmount,
                  fee: bridgeQuote.fee,
                  feeUsd: bridgeQuote.feeUsd,
                  estimatedTime: bridgeQuote.estimatedTime
                },
                {
                  type: 'swap',
                  provider: finalSwapRoute.exchange,
                  fromChain: params.toChain,
                  toChain: params.toChain,
                  fromAsset: bridgeQuote.toAsset,
                  toAsset: params.toAsset,
                  fromAmount: bridgeQuote.toAmount,
                  toAmount: finalSwapRoute.toAmount,
                  fee: finalSwapRoute.fee,
                  feeUsd: finalSwapRoute.feeUsd,
                  estimatedTime: finalSwapRoute.estimatedTime
                }
              ]
            };
            
            routes.push(route);
          }
        }
      }
    } catch (error) {
      console.error('Failed to get complex routes:', error);
    }
    
    return routes;
  }
}
