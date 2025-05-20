/**
 * Staking Service Index
 * 
 * This file exports all staking-related services for the TORI wallet.
 * It serves as the main entry point for accessing staking functionality.
 * 
 * @module services/staking
 */

export * from './validators';
export * from './delegation';
export * from './rewards';
export * from './autocompound';

import { ValidatorService } from './validators';
import { DelegationService } from './delegation';
import { RewardsService } from './rewards';
import { AutocompoundService } from './autocompound';

/**
 * StakingService combines all staking functionality into a single service
 */
export class StakingService {
  private validatorService: ValidatorService;
  private delegationService: DelegationService;
  private rewardsService: RewardsService;
  private autocompoundService: AutocompoundService;

  constructor() {
    this.validatorService = new ValidatorService();
    this.delegationService = new DelegationService();
    this.rewardsService = new RewardsService();
    this.autocompoundService = new AutocompoundService();
  }

  /**
   * Returns the validator service for managing validators
   */
  get validators(): ValidatorService {
    return this.validatorService;
  }

  /**
   * Returns the delegation service for managing delegations
   */
  get delegations(): DelegationService {
    return this.delegationService;
  }

  /**
   * Returns the rewards service for managing rewards
   */
  get rewards(): RewardsService {
    return this.rewardsService;
  }

  /**
   * Returns the autocompound service for managing autocompound settings
   */
  get autocompound(): AutocompoundService {
    return this.autocompoundService;
  }
}

// Export a singleton instance
export const stakingService = new StakingService();
export default stakingService;
