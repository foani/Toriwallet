/**
 * Crosschain Service Index
 * 
 * This file exports all crosschain-related services for the TORI wallet.
 * It serves as the main entry point for accessing crosschain functionality.
 * 
 * @module services/crosschain
 */

export * from './relayer';
export * from './bridge';
export * from './swap';
export * from './routing';

import { RelayerService } from './relayer';
import { BridgeService } from './bridge';
import { SwapService } from './swap';
import { RoutingService } from './routing';

/**
 * CrosschainService combines all crosschain functionality into a single service
 */
export class CrosschainService {
  private relayerService: RelayerService;
  private bridgeService: BridgeService;
  private swapService: SwapService; 
  private routingService: RoutingService;

  constructor() {
    this.relayerService = new RelayerService();
    this.bridgeService = new BridgeService();
    this.swapService = new SwapService();
    this.routingService = new RoutingService();
  }

  /**
   * Returns the relayer service for ICP transfers
   */
  get relayer(): RelayerService {
    return this.relayerService;
  }

  /**
   * Returns the bridge service for asset bridging
   */
  get bridge(): BridgeService {
    return this.bridgeService;
  }

  /**
   * Returns the swap service for cross-chain swaps
   */
  get swap(): SwapService {
    return this.swapService;
  }

  /**
   * Returns the routing service for optimal path finding
   */
  get routing(): RoutingService {
    return this.routingService;
  }
}

// Export a singleton instance
export const crosschainService = new CrosschainService();
export default crosschainService;
