/**
 * Rewards Service
 * 
 * This service handles operations related to staking rewards,
 * including fetching, claiming, and tracking rewards.
 * 
 * @module services/staking/rewards
 */

import { NetworkService } from '../network/network-service';
import { TransactionService } from '../transaction/transaction-service';
import { WalletService } from '../wallet/wallet-service';
import { networks } from '../../constants/networks';
import { 
  StakingReward,
  StakingTransaction,
  StakingTransactionType,
  NetworkType,
  RewardPeriod
} from '../../types/staking';
import { TransactionStatus } from '../../types/transaction';

/**
 * Interface for reward claim parameters
 */
export interface RewardClaimParams {
  networkId: string;
  fromAddress: string;
  validatorAddress: string;
  amount?: string; // If not provided, claim all available rewards
}

/**
 * Interface for reward withdrawal parameters
 */
export interface RewardWithdrawalParams {
  networkId: string;
  fromAddress: string;
  rewardId: string;
}

/**
 * Interface for reward history parameters
 */
export interface RewardHistoryParams {
  networkId: string;
  address: string;
  period?: RewardPeriod;
  validatorAddress?: string;
  offset?: number;
  limit?: number;
}

/**
 * RewardsService handles operations related to staking rewards
 */
export class RewardsService {
  private networkService: NetworkService;
  private transactionService: TransactionService;
  private walletService: WalletService;
  
  // Rewards API endpoints
  private readonly rewardsApiEndpoints = {
    zenith: {
      mainnet: 'https://api.zenith.creatachain.com/staking/rewards',
      testnet: 'https://testnet.api.zenith.creatachain.com/staking/rewards'
    },
    catena: {
      mainnet: 'https://api.catena.creatachain.com/staking/rewards',
      testnet: 'https://testnet.api.catena.creatachain.com/staking/rewards'
    },
    ethereum: {
      mainnet: 'https://api.ethereum.org/staking/rewards',
      testnet: 'https://api.goerli.ethereum.org/staking/rewards'
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
   * Gets the pending rewards for a specific address
   * 
   * @param networkId The network ID
   * @param address The delegator address
   * @returns Promise resolving to the list of pending rewards
   */
  public async getPendingRewards(networkId: string, address: string): Promise<StakingReward[]> {
    try {
      const network = this.networkService.getNetworkById(networkId);
      if (!network) {
        throw new Error(`Network not found: ${networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        throw new Error(`Unsupported network for staking: ${network.name}`);
      }
      
      const isMainnet = this.networkService.isMainnet(network.id);
      const endpoint = this.getRewardsApiEndpoint(networkType, isMainnet);
      
      const response = await fetch(`${endpoint}/pending/${address}`);
      if (!response.ok) {
        throw new Error(`Failed to get pending rewards: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.rewards || [];
    } catch (error) {
      console.error('Failed to get pending rewards:', error);
      return [];
    }
  }

  /**
   * Gets the reward history for a specific address
   * 
   * @param params The reward history parameters
   * @returns Promise resolving to the list of historical rewards
   */
  public async getRewardHistory(params: RewardHistoryParams): Promise<StakingReward[]> {
    try {
      const network = this.networkService.getNetworkById(params.networkId);
      if (!network) {
        throw new Error(`Network not found: ${params.networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        throw new Error(`Unsupported network for staking: ${network.name}`);
      }
      
      const isMainnet = this.networkService.isMainnet(network.id);
      const endpoint = this.getRewardsApiEndpoint(networkType, isMainnet);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.validatorAddress) queryParams.append('validator', params.validatorAddress);
      if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      
      const response = await fetch(`${endpoint}/history/${params.address}?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to get reward history: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.rewards || [];
    } catch (error) {
      console.error('Failed to get reward history:', error);
      return [];
    }
  }

  /**
   * Gets the total rewards earned for a specific address
   * 
   * @param networkId The network ID
   * @param address The delegator address
   * @returns Promise resolving to the total rewards
   */
  public async getTotalRewards(networkId: string, address: string): Promise<{ 
    total: string; 
    totalUsd: string;
    pendingTotal: string;
    pendingTotalUsd: string;
    claimedTotal: string;
    claimedTotalUsd: string;
  }> {
    try {
      const network = this.networkService.getNetworkById(networkId);
      if (!network) {
        throw new Error(`Network not found: ${networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        throw new Error(`Unsupported network for staking: ${network.name}`);
      }
      
      const isMainnet = this.networkService.isMainnet(network.id);
      const endpoint = this.getRewardsApiEndpoint(networkType, isMainnet);
      
      const response = await fetch(`${endpoint}/total/${address}`);
      if (!response.ok) {
        throw new Error(`Failed to get total rewards: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        total: data.total || '0',
        totalUsd: data.totalUsd || '0',
        pendingTotal: data.pendingTotal || '0',
        pendingTotalUsd: data.pendingTotalUsd || '0',
        claimedTotal: data.claimedTotal || '0',
        claimedTotalUsd: data.claimedTotalUsd || '0'
      };
    } catch (error) {
      console.error('Failed to get total rewards:', error);
      return {
        total: '0',
        totalUsd: '0',
        pendingTotal: '0',
        pendingTotalUsd: '0',
        claimedTotal: '0',
        claimedTotalUsd: '0'
      };
    }
  }

  /**
   * Claims rewards for a specific validator
   * 
   * @param params The reward claim parameters
   * @returns Promise resolving to the claim transaction
   */
  public async claimRewards(params: RewardClaimParams): Promise<StakingTransaction> {
    try {
      const network = this.networkService.getNetworkById(params.networkId);
      if (!network) {
        throw new Error(`Network not found: ${params.networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        throw new Error(`Unsupported network for claiming rewards: ${network.name}`);
      }
      
      // Create a claim transaction based on the network type
      const txData = await this.prepareClaimTransaction(params, networkType);
      
      // Sign and send the transaction
      const txHash = await this.sendClaimTransaction(txData, params.networkId);
      
      // Create a claim transaction record
      const claimTx: StakingTransaction = {
        id: `claim-${Date.now()}`,
        networkId: params.networkId,
        type: StakingTransactionType.CLAIM_REWARDS,
        fromAddress: params.fromAddress,
        validatorAddress: params.validatorAddress,
        amount: params.amount || '0', // If amount is not provided, it will be updated after confirmation
        txHash,
        status: TransactionStatus.PENDING,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // Start monitoring the transaction status
      this.monitorClaimTransaction(claimTx);
      
      return claimTx;
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      throw new Error(`Failed to claim rewards: ${error.message}`);
    }
  }

  /**
   * Claims all pending rewards for all validators
   * 
   * @param networkId The network ID
   * @param fromAddress The delegator address
   * @returns Promise resolving to the claim transaction
   */
  public async claimAllRewards(networkId: string, fromAddress: string): Promise<StakingTransaction> {
    try {
      const network = this.networkService.getNetworkById(networkId);
      if (!network) {
        throw new Error(`Network not found: ${networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        throw new Error(`Unsupported network for claiming rewards: ${network.name}`);
      }
      
      // Create a claim all transaction based on the network type
      const txData = await this.prepareClaimAllTransaction(fromAddress, networkType, networkId);
      
      // Sign and send the transaction
      const txHash = await this.sendClaimTransaction(txData, networkId);
      
      // Create a claim transaction record
      const claimTx: StakingTransaction = {
        id: `claim-all-${Date.now()}`,
        networkId,
        type: StakingTransactionType.CLAIM_ALL_REWARDS,
        fromAddress,
        amount: '0', // Will be updated after confirmation
        txHash,
        status: TransactionStatus.PENDING,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // Start monitoring the transaction status
      this.monitorClaimTransaction(claimTx);
      
      return claimTx;
    } catch (error) {
      console.error('Failed to claim all rewards:', error);
      throw new Error(`Failed to claim all rewards: ${error.message}`);
    }
  }

  /**
   * Withdraws a claimed reward to the wallet
   * 
   * @param params The reward withdrawal parameters
   * @returns Promise resolving to the withdrawal transaction
   */
  public async withdrawReward(params: RewardWithdrawalParams): Promise<StakingTransaction> {
    try {
      const network = this.networkService.getNetworkById(params.networkId);
      if (!network) {
        throw new Error(`Network not found: ${params.networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        throw new Error(`Unsupported network for withdrawing rewards: ${network.name}`);
      }
      
      // Get the reward details
      const reward = await this.getRewardById(params.networkId, params.rewardId);
      if (!reward) {
        throw new Error(`Reward not found: ${params.rewardId}`);
      }
      
      // Ensure the reward is claimable
      if (reward.status !== 'CLAIMED') {
        throw new Error(`Cannot withdraw reward with status: ${reward.status}`);
      }
      
      // Create a withdrawal transaction based on the network type
      const txData = await this.prepareWithdrawalTransaction(
        params.fromAddress,
        reward.validatorAddress,
        reward.amount,
        networkType
      );
      
      // Sign and send the transaction
      const txHash = await this.sendClaimTransaction(txData, params.networkId);
      
      // Create a withdrawal transaction record
      const withdrawalTx: StakingTransaction = {
        id: `withdrawal-${Date.now()}`,
        networkId: params.networkId,
        type: StakingTransactionType.WITHDRAW_REWARDS,
        fromAddress: params.fromAddress,
        validatorAddress: reward.validatorAddress,
        amount: reward.amount,
        txHash,
        status: TransactionStatus.PENDING,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        rewardId: params.rewardId
      };
      
      // Start monitoring the transaction status
      this.monitorClaimTransaction(withdrawalTx);
      
      return withdrawalTx;
    } catch (error) {
      console.error('Failed to withdraw reward:', error);
      throw new Error(`Failed to withdraw reward: ${error.message}`);
    }
  }

  /**
   * Gets detailed information about a specific reward
   * 
   * @param networkId The network ID
   * @param rewardId The reward ID
   * @returns Promise resolving to the reward details
   */
  public async getRewardById(networkId: string, rewardId: string): Promise<StakingReward | null> {
    try {
      const network = this.networkService.getNetworkById(networkId);
      if (!network) {
        throw new Error(`Network not found: ${networkId}`);
      }
      
      const networkType = this.getNetworkType(network.id);
      if (!networkType) {
        throw new Error(`Unsupported network for staking: ${network.name}`);
      }
      
      const isMainnet = this.networkService.isMainnet(network.id);
      const endpoint = this.getRewardsApiEndpoint(networkType, isMainnet);
      
      const response = await fetch(`${endpoint}/reward/${rewardId}`);
      if (!response.ok) {
        throw new Error(`Failed to get reward: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.reward || null;
    } catch (error) {
      console.error('Failed to get reward:', error);
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

  private getRewardsApiEndpoint(networkType: NetworkType, isMainnet: boolean): string {
    if (isMainnet) {
      return this.rewardsApiEndpoints[networkType].mainnet;
    } else {
      return this.rewardsApiEndpoints[networkType].testnet;
    }
  }

  private async prepareClaimTransaction(
    params: RewardClaimParams,
    networkType: NetworkType
  ): Promise<any> {
    // Prepare a claim transaction based on the network type
    switch (networkType) {
      case 'zenith':
        return {
          from: params.fromAddress,
          to: networks.ZENITH_MAINNET.stakingContractAddress,
          data: this.encodeZenithClaimData(params.validatorAddress, params.amount)
        };
      case 'catena':
        return {
          from: params.fromAddress,
          to: networks.CATENA_MAINNET.stakingContractAddress,
          data: this.encodeCatenaClaimData(params.validatorAddress, params.amount)
        };
      case 'ethereum':
        return {
          from: params.fromAddress,
          to: networks.ETHEREUM_MAINNET.stakingContractAddress,
          data: this.encodeEthereumClaimData(params.validatorAddress, params.amount)
        };
      default:
        throw new Error(`Unsupported network type for claiming rewards: ${networkType}`);
    }
  }

  private async prepareClaimAllTransaction(
    fromAddress: string,
    networkType: NetworkType,
    networkId: string
  ): Promise<any> {
    // Get all pending rewards
    const pendingRewards = await this.getPendingRewards(networkId, fromAddress);
    
    // Get unique validator addresses
    const validatorAddresses = [...new Set(pendingRewards.map(reward => reward.validatorAddress))];
    
    // Prepare a claim all transaction based on the network type
    switch (networkType) {
      case 'zenith':
        return {
          from: fromAddress,
          to: networks.ZENITH_MAINNET.stakingContractAddress,
          data: this.encodeZenithClaimAllData(validatorAddresses)
        };
      case 'catena':
        return {
          from: fromAddress,
          to: networks.CATENA_MAINNET.stakingContractAddress,
          data: this.encodeCatenaClaimAllData(validatorAddresses)
        };
      case 'ethereum':
        return {
          from: fromAddress,
          to: networks.ETHEREUM_MAINNET.stakingContractAddress,
          data: this.encodeEthereumClaimAllData(validatorAddresses)
        };
      default:
        throw new Error(`Unsupported network type for claiming all rewards: ${networkType}`);
    }
  }

  private async prepareWithdrawalTransaction(
    fromAddress: string,
    validatorAddress: string,
    amount: string,
    networkType: NetworkType
  ): Promise<any> {
    // Prepare a withdrawal transaction based on the network type
    switch (networkType) {
      case 'zenith':
        return {
          from: fromAddress,
          to: networks.ZENITH_MAINNET.stakingContractAddress,
          data: this.encodeZenithWithdrawalData(validatorAddress, amount)
        };
      case 'catena':
        return {
          from: fromAddress,
          to: networks.CATENA_MAINNET.stakingContractAddress,
          data: this.encodeCatenaWithdrawalData(validatorAddress, amount)
        };
      case 'ethereum':
        return {
          from: fromAddress,
          to: networks.ETHEREUM_MAINNET.stakingContractAddress,
          data: this.encodeEthereumWithdrawalData(validatorAddress, amount)
        };
      default:
        throw new Error(`Unsupported network type for withdrawing rewards: ${networkType}`);
    }
  }

  private async sendClaimTransaction(txData: any, networkId: string): Promise<string> {
    // Use the transaction service to send the transaction
    return await this.transactionService.sendTransaction(txData, networkId);
  }

  private async monitorClaimTransaction(tx: StakingTransaction): Promise<void> {
    // Start polling for status updates
    const checkStatus = async () => {
      try {
        const status = await this.transactionService.getTransactionStatus(tx.networkId, tx.txHash);
        
        // Update the transaction status
        tx.status = status;
        tx.updatedAt = Date.now();
        
        // If the transaction is completed, update the reward status
        if (
          status === TransactionStatus.CONFIRMED ||
          status === TransactionStatus.FAILED ||
          status === TransactionStatus.REJECTED
        ) {
          // Update the reward status based on the transaction type and status
          await this.updateRewardStatus(tx);
          return;
        }
        
        // Continue polling
        setTimeout(checkStatus, 10000); // Check every 10 seconds
      } catch (error) {
        console.error('Failed to monitor claim transaction:', error);
        // Continue polling despite errors
        setTimeout(checkStatus, 10000);
      }
    };
    
    // Start the polling process
    setTimeout(checkStatus, 5000); // First check after 5 seconds
  }

  private async updateRewardStatus(tx: StakingTransaction): Promise<void> {
    // This method would update the reward status based on the transaction
    // For simplicity, we're not implementing the actual update logic here
    
    if (tx.status === TransactionStatus.CONFIRMED) {
      switch (tx.type) {
        case StakingTransactionType.CLAIM_REWARDS:
          // Update the reward status to CLAIMED
          console.log(`Reward claimed: ${tx.id}`);
          break;
        case StakingTransactionType.CLAIM_ALL_REWARDS:
          // Update all pending rewards to CLAIMED
          console.log(`All rewards claimed: ${tx.id}`);
          break;
        case StakingTransactionType.WITHDRAW_REWARDS:
          // Update the reward status to WITHDRAWN
          if (tx.rewardId) {
            console.log(`Reward withdrawn: ${tx.rewardId}`);
          }
          break;
      }
    } else {
      // Handle failed transactions
      console.log(`Reward transaction failed: ${tx.id}`);
    }
  }

  // Encoding methods for different networks

  private encodeZenithClaimData(validatorAddress: string, amount?: string): string {
    // Method ID for claiming rewards (example)
    const methodId = '0x34567890';
    
    // Encode the validator address (32 bytes)
    const encodedValidator = this.padAddress(validatorAddress);
    
    // Encode the amount (32 bytes) if provided
    let encodedAmount = '';
    if (amount) {
      encodedAmount = this.padUint256(parseInt(amount, 10));
    } else {
      // If amount is not provided, claim all available rewards
      encodedAmount = this.padUint256(0);
    }
    
    return `${methodId}${encodedValidator}${encodedAmount}`;
  }

  private encodeCatenaClaimData(validatorAddress: string, amount?: string): string {
    // For Catena, we're using the same format as Zenith for simplicity
    return this.encodeZenithClaimData(validatorAddress, amount);
  }

  private encodeEthereumClaimData(validatorAddress: string, amount?: string): string {
    // For Ethereum, we're using a simplified format
    
    // Method ID for claiming rewards (example)
    const methodId = '0x09876543';
    
    // Encode the validator address (32 bytes)
    const encodedValidator = this.padAddress(validatorAddress);
    
    // Encode the amount (32 bytes) if provided
    let encodedAmount = '';
    if (amount) {
      encodedAmount = this.padUint256(parseInt(amount, 10));
    } else {
      // If amount is not provided, claim all available rewards
      encodedAmount = this.padUint256(0);
    }
    
    return `${methodId}${encodedValidator}${encodedAmount}`;
  }

  private encodeZenithClaimAllData(validatorAddresses: string[]): string {
    // Method ID for claiming all rewards (example)
    const methodId = '0x45678901';
    
    // Encode the number of validators (32 bytes)
    const encodedCount = this.padUint256(validatorAddresses.length);
    
    // Encode the validator addresses (32 bytes each)
    let encodedValidators = '';
    for (const validator of validatorAddresses) {
      encodedValidators += this.padAddress(validator);
    }
    
    return `${methodId}${encodedCount}${encodedValidators}`;
  }

  private encodeCatenaClaimAllData(validatorAddresses: string[]): string {
    // For Catena, we're using the same format as Zenith for simplicity
    return this.encodeZenithClaimAllData(validatorAddresses);
  }

  private encodeEthereumClaimAllData(validatorAddresses: string[]): string {
    // For Ethereum, we're using a simplified format
    
    // Method ID for claiming all rewards (example)
    const methodId = '0x21098765';
    
    // Encode the number of validators (32 bytes)
    const encodedCount = this.padUint256(validatorAddresses.length);
    
    // Encode the validator addresses (32 bytes each)
    let encodedValidators = '';
    for (const validator of validatorAddresses) {
      encodedValidators += this.padAddress(validator);
    }
    
    return `${methodId}${encodedCount}${encodedValidators}`;
  }

  private encodeZenithWithdrawalData(validatorAddress: string, amount: string): string {
    // Method ID for withdrawing rewards (example)
    const methodId = '0x56789012';
    
    // Encode the validator address (32 bytes)
    const encodedValidator = this.padAddress(validatorAddress);
    
    // Encode the amount (32 bytes)
    const encodedAmount = this.padUint256(parseInt(amount, 10));
    
    return `${methodId}${encodedValidator}${encodedAmount}`;
  }

  private encodeCatenaWithdrawalData(validatorAddress: string, amount: string): string {
    // For Catena, we're using the same format as Zenith for simplicity
    return this.encodeZenithWithdrawalData(validatorAddress, amount);
  }

  private encodeEthereumWithdrawalData(validatorAddress: string, amount: string): string {
    // For Ethereum, we're using a simplified format
    
    // Method ID for withdrawing rewards (example)
    const methodId = '0x32109876';
    
    // Encode the validator address (32 bytes)
    const encodedValidator = this.padAddress(validatorAddress);
    
    // Encode the amount (32 bytes)
    const encodedAmount = this.padUint256(parseInt(amount, 10));
    
    return `${methodId}${encodedValidator}${encodedAmount}`;
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
