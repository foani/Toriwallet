/**
 * Validator Service
 * 
 * This service handles all operations related to blockchain validators,
 * including fetching validator lists, details, and performance metrics.
 * 
 * @module services/staking/validators
 */

import { NetworkService } from '../network/network-service';
import { networks } from '../../constants/networks';
import { Validator, ValidatorStatus, NetworkType } from '../../types/staking';

/**
 * Interface for validator list parameters
 */
export interface ValidatorListParams {
  networkId: string;
  status?: ValidatorStatus;
  offset?: number;
  limit?: number;
  sortBy?: 'votingPower' | 'commission' | 'uptime' | 'name';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Interface for validator search parameters
 */
export interface ValidatorSearchParams {
  networkId: string;
  query: string;
  limit?: number;
}

/**
 * Interface for validator list response
 */
export interface ValidatorListResponse {
  validators: Validator[];
  total: number;
  offset: number;
  limit: number;
}

/**
 * ValidatorService handles operations related to blockchain validators
 */
export class ValidatorService {
  private networkService: NetworkService;
  
  // Validator API endpoints
  private readonly validatorApiEndpoints = {
    zenith: {
      mainnet: 'https://api.zenith.creatachain.com/validators',
      testnet: 'https://testnet.api.zenith.creatachain.com/validators'
    },
    catena: {
      mainnet: 'https://api.catena.creatachain.com/validators',
      testnet: 'https://testnet.api.catena.creatachain.com/validators'
    },
    ethereum: {
      mainnet: 'https://api.ethereum.org/validators',
      testnet: 'https://api.goerli.ethereum.org/validators'
    }
    // Add other networks as needed
  };

  constructor(networkService?: NetworkService) {
    this.networkService = networkService || new NetworkService();
  }

  /**
   * Gets a list of validators for a specific network
   * 
   * @param params The validator list parameters
   * @returns Promise resolving to the validator list response
   */
  public async getValidators(params: ValidatorListParams): Promise<ValidatorListResponse> {
    try {
      const network = this.networkService.getNetworkById(params.networkId);
      if (!network) {
        throw new Error(`Network not found: ${params.networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        throw new Error(`Unsupported network for validators: ${network.name}`);
      }
      
      const isMainnet = this.networkService.isMainnet(network.id);
      const endpoint = this.getValidatorApiEndpoint(networkType, isMainnet);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      
      const response = await fetch(`${endpoint}?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to get validators: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        validators: data.validators,
        total: data.total,
        offset: data.offset || 0,
        limit: data.limit || data.validators.length
      };
    } catch (error) {
      console.error('Failed to get validators:', error);
      
      // Return empty response in case of error
      return {
        validators: [],
        total: 0,
        offset: 0,
        limit: 0
      };
    }
  }

  /**
   * Searches for validators by name, address, or other criteria
   * 
   * @param params The validator search parameters
   * @returns Promise resolving to the validator list
   */
  public async searchValidators(params: ValidatorSearchParams): Promise<Validator[]> {
    try {
      const network = this.networkService.getNetworkById(params.networkId);
      if (!network) {
        throw new Error(`Network not found: ${params.networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        throw new Error(`Unsupported network for validators: ${network.name}`);
      }
      
      const isMainnet = this.networkService.isMainnet(network.id);
      const endpoint = this.getValidatorApiEndpoint(networkType, isMainnet);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('query', params.query);
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      
      const response = await fetch(`${endpoint}/search?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to search validators: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.validators || [];
    } catch (error) {
      console.error('Failed to search validators:', error);
      return [];
    }
  }

  /**
   * Gets detailed information about a specific validator
   * 
   * @param networkId The network ID
   * @param validatorAddress The validator address
   * @returns Promise resolving to the validator details
   */
  public async getValidatorDetails(networkId: string, validatorAddress: string): Promise<Validator | null> {
    try {
      const network = this.networkService.getNetworkById(networkId);
      if (!network) {
        throw new Error(`Network not found: ${networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        throw new Error(`Unsupported network for validators: ${network.name}`);
      }
      
      const isMainnet = this.networkService.isMainnet(network.id);
      const endpoint = this.getValidatorApiEndpoint(networkType, isMainnet);
      
      const response = await fetch(`${endpoint}/${validatorAddress}`);
      if (!response.ok) {
        throw new Error(`Failed to get validator details: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.validator || null;
    } catch (error) {
      console.error('Failed to get validator details:', error);
      return null;
    }
  }

  /**
   * Gets the performance history of a validator
   * 
   * @param networkId The network ID
   * @param validatorAddress The validator address
   * @param days The number of days to include in the history
   * @returns Promise resolving to the validator performance history
   */
  public async getValidatorPerformance(
    networkId: string, 
    validatorAddress: string,
    days: number = 30
  ): Promise<any> {
    try {
      const network = this.networkService.getNetworkById(networkId);
      if (!network) {
        throw new Error(`Network not found: ${networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        throw new Error(`Unsupported network for validators: ${network.name}`);
      }
      
      const isMainnet = this.networkService.isMainnet(network.id);
      const endpoint = this.getValidatorApiEndpoint(networkType, isMainnet);
      
      const response = await fetch(`${endpoint}/${validatorAddress}/performance?days=${days}`);
      if (!response.ok) {
        throw new Error(`Failed to get validator performance: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.performance || null;
    } catch (error) {
      console.error('Failed to get validator performance:', error);
      return null;
    }
  }

  // Private helper methods

  private getNetworkType(networkId: string): NetworkType | null {
    if (networkId === networks.ZENITH_MAINNET.id || networkId === networks.ZENITH_TESTNET.id) {
      return 'zenith';
    } else if (networkId === networks.CATENA_MAINNET.id || networkId === networks.CATENA_TESTNET.id) {
      return 'catena';
    } else if (networkId === networks.ETHEREUM_MAINNET.id || networkId === networks.ETHEREUM_TESTNET.id) {
      return 'ethereum';
    }
    
    return null;
  }

  private getValidatorApiEndpoint(networkType: NetworkType, isMainnet: boolean): string {
    if (isMainnet) {
      return this.validatorApiEndpoints[networkType].mainnet;
    } else {
      return this.validatorApiEndpoints[networkType].testnet;
    }
  }
}
