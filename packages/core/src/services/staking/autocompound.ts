/**
 * Autocompound Service
 * 
 * This service handles operations related to autocompounding staking rewards,
 * allowing users to automatically reinvest their rewards.
 * 
 * @module services/staking/autocompound
 */

import { NetworkService } from '../network/network-service';
import { TransactionService } from '../transaction/transaction-service';
import { WalletService } from '../wallet/wallet-service';
import { networks } from '../../constants/networks';
import { 
  AutocompoundSetting,
  StakingTransaction,
  StakingTransactionType,
  NetworkType
} from '../../types/staking';
import { TransactionStatus } from '../../types/transaction';

/**
 * Interface for enabling autocompound parameters
 */
export interface EnableAutocompoundParams {
  networkId: string;
  fromAddress: string;
  validatorAddress: string;
  percentage?: number; // Percentage of rewards to autocompound (0-100)
}

/**
 * Interface for disabling autocompound parameters
 */
export interface DisableAutocompoundParams {
  networkId: string;
  fromAddress: string;
  validatorAddress: string;
}

/**
 * AutocompoundService handles operations related to autocompounding staking rewards
 */
export class AutocompoundService {
  private networkService: NetworkService;
  private transactionService: TransactionService;
  private walletService: WalletService;
  
  // Autocompound API endpoints
  private readonly autocompoundApiEndpoints = {
    zenith: {
      mainnet: 'https://api.zenith.creatachain.com/staking/autocompound',
      testnet: 'https://testnet.api.zenith.creatachain.com/staking/autocompound'
    },
    catena: {
      mainnet: 'https://api.catena.creatachain.com/staking/autocompound',
      testnet: 'https://testnet.api.catena.creatachain.com/staking/autocompound'
    },
    ethereum: {
      mainnet: 'https://api.ethereum.org/staking/autocompound',
      testnet: 'https://api.goerli.ethereum.org/staking/autocompound'
    }
    // Add other networks as needed
  };

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
   * Gets the autocompound settings for a specific address
   * 
   * @param networkId The network ID
   * @param address The delegator address
   * @returns Promise resolving to the list of autocompound settings
   */
  public async getAutocompoundSettings(networkId: string, address: string): Promise<AutocompoundSetting[]> {
    try {
      const network = this.networkService.getNetworkById(networkId);
      if (!network) {
        throw new Error(`Network not found: ${networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        throw new Error(`Unsupported network for autocompound: ${network.name}`);
      }
      
      const isMainnet = this.networkService.isMainnet(network.id);
      const endpoint = this.getAutocompoundApiEndpoint(networkType, isMainnet);
      
      const response = await fetch(`${endpoint}/settings/${address}`);
      if (!response.ok) {
        throw new Error(`Failed to get autocompound settings: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.settings || [];
    } catch (error) {
      console.error('Failed to get autocompound settings:', error);
      return [];
    }
  }

  /**
   * Enables autocompound for a specific validator
   * 
   * @param params The enable autocompound parameters
   * @returns Promise resolving to the enable autocompound transaction
   */
  public async enableAutocompound(params: EnableAutocompoundParams): Promise<StakingTransaction> {
    try {
      const network = this.networkService.getNetworkById(params.networkId);
      if (!network) {
        throw new Error(`Network not found: ${params.networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        throw new Error(`Unsupported network for autocompound: ${network.name}`);
      }
      
      // Create an enable autocompound transaction based on the network type
      const txData = await this.prepareEnableAutocompoundTransaction(params, networkType);
      
      // Sign and send the transaction
      const txHash = await this.sendAutocompoundTransaction(txData, params.networkId);
      
      // Create an enable autocompound transaction record
      const enableTx: StakingTransaction = {
        id: `enable-autocompound-${Date.now()}`,
        networkId: params.networkId,
        type: StakingTransactionType.ENABLE_AUTOCOMPOUND,
        fromAddress: params.fromAddress,
        validatorAddress: params.validatorAddress,
        autoCompoundPercentage: params.percentage || 100,
        txHash,
        status: TransactionStatus.PENDING,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // Start monitoring the transaction status
      this.monitorAutocompoundTransaction(enableTx);
      
      return enableTx;
    } catch (error) {
      console.error('Failed to enable autocompound:', error);
      throw new Error(`Failed to enable autocompound: ${error.message}`);
    }
  }

  /**
   * Disables autocompound for a specific validator
   * 
   * @param params The disable autocompound parameters
   * @returns Promise resolving to the disable autocompound transaction
   */
  public async disableAutocompound(params: DisableAutocompoundParams): Promise<StakingTransaction> {
    try {
      const network = this.networkService.getNetworkById(params.networkId);
      if (!network) {
        throw new Error(`Network not found: ${params.networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        throw new Error(`Unsupported network for autocompound: ${network.name}`);
      }
      
      // Create a disable autocompound transaction based on the network type
      const txData = await this.prepareDisableAutocompoundTransaction(params, networkType);
      
      // Sign and send the transaction
      const txHash = await this.sendAutocompoundTransaction(txData, params.networkId);
      
      // Create a disable autocompound transaction record
      const disableTx: StakingTransaction = {
        id: `disable-autocompound-${Date.now()}`,
        networkId: params.networkId,
        type: StakingTransactionType.DISABLE_AUTOCOMPOUND,
        fromAddress: params.fromAddress,
        validatorAddress: params.validatorAddress,
        txHash,
        status: TransactionStatus.PENDING,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // Start monitoring the transaction status
      this.monitorAutocompoundTransaction(disableTx);
      
      return disableTx;
    } catch (error) {
      console.error('Failed to disable autocompound:', error);
      throw new Error(`Failed to disable autocompound: ${error.message}`);
    }
  }

  /**
   * Checks if autocompound is supported for a specific network
   * 
   * @param networkId The network ID
   * @returns Promise resolving to a boolean indicating if autocompound is supported
   */
  public async isAutocompoundSupported(networkId: string): Promise<boolean> {
    try {
      const network = this.networkService.getNetworkById(networkId);
      if (!network) {
        throw new Error(`Network not found: ${networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        return false;
      }
      
      const isMainnet = this.networkService.isMainnet(network.id);
      const endpoint = this.getAutocompoundApiEndpoint(networkType, isMainnet);
      
      const response = await fetch(`${endpoint}/supported`);
      if (!response.ok) {
        throw new Error(`Failed to check autocompound support: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.supported || false;
    } catch (error) {
      console.error('Failed to check autocompound support:', error);
      return false;
    }
  }

  /**
   * Gets the autocompound statistics for a specific address
   * 
   * @param networkId The network ID
   * @param address The delegator address
   * @returns Promise resolving to the autocompound statistics
   */
  public async getAutocompoundStats(networkId: string, address: string): Promise<{
    totalAutocompounded: string;
    totalAutocompoundedUsd: string;
    autocompoundedByValidator: {
      validatorAddress: string;
      validatorName: string;
      totalAutocompounded: string;
      totalAutocompoundedUsd: string;
    }[];
  }> {
    try {
      const network = this.networkService.getNetworkById(networkId);
      if (!network) {
        throw new Error(`Network not found: ${networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        throw new Error(`Unsupported network for autocompound: ${network.name}`);
      }
      
      const isMainnet = this.networkService.isMainnet(network.id);
      const endpoint = this.getAutocompoundApiEndpoint(networkType, isMainnet);
      
      const response = await fetch(`${endpoint}/stats/${address}`);
      if (!response.ok) {
        throw new Error(`Failed to get autocompound stats: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        totalAutocompounded: data.totalAutocompounded || '0',
        totalAutocompoundedUsd: data.totalAutocompoundedUsd || '0',
        autocompoundedByValidator: data.autocompoundedByValidator || []
      };
    } catch (error) {
      console.error('Failed to get autocompound stats:', error);
      return {
        totalAutocompounded: '0',
        totalAutocompoundedUsd: '0',
        autocompoundedByValidator: []
      };
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

  private getAutocompoundApiEndpoint(networkType: NetworkType, isMainnet: boolean): string {
    if (isMainnet) {
      return this.autocompoundApiEndpoints[networkType].mainnet;
    } else {
      return this.autocompoundApiEndpoints[networkType].testnet;
    }
  }

  private async prepareEnableAutocompoundTransaction(
    params: EnableAutocompoundParams,
    networkType: NetworkType
  ): Promise<any> {
    // Prepare an enable autocompound transaction based on the network type
    switch (networkType) {
      case 'zenith':
        return {
          from: params.fromAddress,
          to: networks.ZENITH_MAINNET.stakingContractAddress,
          data: this.encodeZenithEnableAutocompoundData(
            params.validatorAddress,
            params.percentage || 100
          )
        };
      case 'catena':
        return {
          from: params.fromAddress,
          to: networks.CATENA_MAINNET.stakingContractAddress,
          data: this.encodeCatenaEnableAutocompoundData(
            params.validatorAddress,
            params.percentage || 100
          )
        };
      case 'ethereum':
        return {
          from: params.fromAddress,
          to: networks.ETHEREUM_MAINNET.stakingContractAddress,
          data: this.encodeEthereumEnableAutocompoundData(
            params.validatorAddress,
            params.percentage || 100
          )
        };
      default:
        throw new Error(`Unsupported network type for autocompound: ${networkType}`);
    }
  }

  private async prepareDisableAutocompoundTransaction(
    params: DisableAutocompoundParams,
    networkType: NetworkType
  ): Promise<any> {
    // Prepare a disable autocompound transaction based on the network type
    switch (networkType) {
      case 'zenith':
        return {
          from: params.fromAddress,
          to: networks.ZENITH_MAINNET.stakingContractAddress,
          data: this.encodeZenithDisableAutocompoundData(params.validatorAddress)
        };
      case 'catena':
        return {
          from: params.fromAddress,
          to: networks.CATENA_MAINNET.stakingContractAddress,
          data: this.encodeCatenaDisableAutocompoundData(params.validatorAddress)
        };
      case 'ethereum':
        return {
          from: params.fromAddress,
          to: networks.ETHEREUM_MAINNET.stakingContractAddress,
          data: this.encodeEthereumDisableAutocompoundData(params.validatorAddress)
        };
      default:
        throw new Error(`Unsupported network type for autocompound: ${networkType}`);
    }
  }

  private async sendAutocompoundTransaction(txData: any, networkId: string): Promise<string> {
    // Use the transaction service to send the transaction
    return await this.transactionService.sendTransaction(txData, networkId);
  }

  private async monitorAutocompoundTransaction(tx: StakingTransaction): Promise<void> {
    // Start polling for status updates
    const checkStatus = async () => {
      try {
        const status = await this.transactionService.getTransactionStatus(tx.networkId, tx.txHash);
        
        // Update the transaction status
        tx.status = status;
        tx.updatedAt = Date.now();
        
        // If the transaction is completed, update the autocompound setting
        if (
          status === TransactionStatus.CONFIRMED ||
          status === TransactionStatus.FAILED ||
          status === TransactionStatus.REJECTED
        ) {
          // Update the autocompound setting based on the transaction type and status
          await this.updateAutocompoundSetting(tx);
          return;
        }
        
        // Continue polling
        setTimeout(checkStatus, 10000); // Check every 10 seconds
      } catch (error) {
        console.error('Failed to monitor autocompound transaction:', error);
        // Continue polling despite errors
        setTimeout(checkStatus, 10000);
      }
    };
    
    // Start the polling process
    setTimeout(checkStatus, 5000); // First check after 5 seconds
  }

  private async updateAutocompoundSetting(tx: StakingTransaction): Promise<void> {
    // This method would update the autocompound setting based on the transaction
    // For simplicity, we're not implementing the actual update logic here
    
    if (tx.status === TransactionStatus.CONFIRMED) {
      switch (tx.type) {
        case StakingTransactionType.ENABLE_AUTOCOMPOUND:
          // Update the autocompound setting to enabled
          console.log(`Autocompound enabled: ${tx.id}`);
          break;
        case StakingTransactionType.DISABLE_AUTOCOMPOUND:
          // Update the autocompound setting to disabled
          console.log(`Autocompound disabled: ${tx.id}`);
          break;
      }
    } else {
      // Handle failed transactions
      console.log(`Autocompound transaction failed: ${tx.id}`);
    }
  }

  // Encoding methods for different networks

  private encodeZenithEnableAutocompoundData(validatorAddress: string, percentage: number): string {
    // Method ID for enabling autocompound (example)
    const methodId = '0x67890123';
    
    // Encode the validator address (32 bytes)
    const encodedValidator = this.padAddress(validatorAddress);
    
    // Encode the percentage (32 bytes)
    const encodedPercentage = this.padUint256(percentage);
    
    return `${methodId}${encodedValidator}${encodedPercentage}`;
  }

  private encodeCatenaEnableAutocompoundData(validatorAddress: string, percentage: number): string {
    // For Catena, we're using the same format as Zenith for simplicity
    return this.encodeZenithEnableAutocompoundData(validatorAddress, percentage);
  }

  private encodeEthereumEnableAutocompoundData(validatorAddress: string, percentage: number): string {
    // For Ethereum, we're using a simplified format
    
    // Method ID for enabling autocompound (example)
    const methodId = '0x43210987';
    
    // Encode the validator address (32 bytes)
    const encodedValidator = this.padAddress(validatorAddress);
    
    // Encode the percentage (32 bytes)
    const encodedPercentage = this.padUint256(percentage);
    
    return `${methodId}${encodedValidator}${encodedPercentage}`;
  }

  private encodeZenithDisableAutocompoundData(validatorAddress: string): string {
    // Method ID for disabling autocompound (example)
    const methodId = '0x78901234';
    
    // Encode the validator address (32 bytes)
    const encodedValidator = this.padAddress(validatorAddress);
    
    return `${methodId}${encodedValidator}`;
  }

  private encodeCatenaDisableAutocompoundData(validatorAddress: string): string {
    // For Catena, we're using the same format as Zenith for simplicity
    return this.encodeZenithDisableAutocompoundData(validatorAddress);
  }

  private encodeEthereumDisableAutocompoundData(validatorAddress: string): string {
    // For Ethereum, we're using a simplified format
    
    // Method ID for disabling autocompound (example)
    const methodId = '0x54321098';
    
    // Encode the validator address (32 bytes)
    const encodedValidator = this.padAddress(validatorAddress);
    
    return `${methodId}${encodedValidator}`;
  }

  // Padding helpers

  private padAddress(address: string): string {
    // Remove '0x' prefix if present
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
    
    // Pad to 32 bytes (64 hex characters)
    return cleanAddress.padStart(64, '0');
  }

  private padUint256(value: number): string {
    // Convert to hex and remove '0x' prefix
    const hexValue = value.toString(16);
    
    // Pad to 32 bytes (64 hex characters)
    return hexValue.padStart(64, '0');
  }
}
