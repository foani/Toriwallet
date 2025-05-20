import React, { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { useStaking } from '../../hooks/useStaking';
import { StakingReward } from '../../../core/types';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';

/**
 * RewardsCard component
 * 
 * Displays staking rewards information and provides claim actions
 */
const RewardsCard: React.FC = () => {
  const { selectedAccount } = useWallet();
  const { selectedNetwork } = useNetwork();
  const { 
    pendingRewards, 
    claimRewards, 
    claimAllRewards, 
    getTotalRewards, 
    isLoading,
    loadPendingRewards 
  } = useStaking();
  
  // Local state
  const [totalRewards, setTotalRewards] = useState({
    total: '0',
    totalUsd: '0',
    pendingTotal: '0',
    pendingTotalUsd: '0',
    claimedTotal: '0',
    claimedTotalUsd: '0'
  });
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [validatorRewards, setValidatorRewards] = useState<{
    [validatorAddress: string]: StakingReward[]
  }>({});
  const [expandedValidators, setExpandedValidators] = useState<string[]>([]);
  
  // Load total rewards
  useEffect(() => {
    const loadTotalRewards = async () => {
      try {
        const totals = await getTotalRewards();
        setTotalRewards(totals);
      } catch (error) {
        console.error('Failed to load total rewards:', error);
      }
    };
    
    loadTotalRewards();
  }, [getTotalRewards, pendingRewards]);
  
  // Group rewards by validator
  useEffect(() => {
    const groupedRewards: { [validatorAddress: string]: StakingReward[] } = {};
    
    pendingRewards.forEach(reward => {
      if (!groupedRewards[reward.validatorAddress]) {
        groupedRewards[reward.validatorAddress] = [];
      }
      groupedRewards[reward.validatorAddress].push(reward);
    });
    
    setValidatorRewards(groupedRewards);
  }, [pendingRewards]);
  
  // Toggle expanded validator
  const toggleExpandValidator = (validatorAddress: string) => {
    if (expandedValidators.includes(validatorAddress)) {
      setExpandedValidators(expandedValidators.filter(addr => addr !== validatorAddress));
    } else {
      setExpandedValidators([...expandedValidators, validatorAddress]);
    }
  };
  
  // Handle claim rewards
  const handleClaimRewards = async (validatorAddress: string) => {
    if (!selectedAccount || !selectedNetwork) {
      return;
    }
    
    try {
      setIsClaiming(true);
      
      // Claim rewards for a specific validator
      await claimRewards(validatorAddress);
      
      // Reload pending rewards
      await loadPendingRewards();
    } catch (error) {
      console.error('Failed to claim rewards:', error);
    } finally {
      setIsClaiming(false);
    }
  };
  
  // Handle claim all rewards
  const handleClaimAllRewards = async () => {
    if (!selectedAccount || !selectedNetwork) {
      return;
    }
    
    try {
      setIsClaiming(true);
      
      // Claim all rewards
      await claimAllRewards();
      
      // Reload pending rewards
      await loadPendingRewards();
    } catch (error) {
      console.error('Failed to claim all rewards:', error);
    } finally {
      setIsClaiming(false);
    }
  };
  
  // Calculate sum of rewards for a validator
  const calculateValidatorRewardsSum = (rewards: StakingReward[]): string => {
    return rewards
      .reduce((sum, reward) => sum + parseFloat(reward.amount), 0)
      .toFixed(6);
  };
  
  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex justify-center">
          <Loading />
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Staking Rewards</h2>
        <Button
          variant="primary"
          size="small"
          onClick={handleClaimAllRewards}
          disabled={isClaiming || pendingRewards.length === 0}
        >
          {isClaiming ? <Loading size="small" /> : 'Claim All'}
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-gray-600 text-sm">Total Earned</div>
          <div className="font-medium">{parseFloat(totalRewards.total).toFixed(6)} CTA</div>
          <div className="text-xs text-gray-500">${parseFloat(totalRewards.totalUsd).toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600 text-sm">Pending</div>
          <div className="font-medium">{parseFloat(totalRewards.pendingTotal).toFixed(6)} CTA</div>
          <div className="text-xs text-gray-500">${parseFloat(totalRewards.pendingTotalUsd).toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600 text-sm">Claimed</div>
          <div className="font-medium">{parseFloat(totalRewards.claimedTotal).toFixed(6)} CTA</div>
          <div className="text-xs text-gray-500">${parseFloat(totalRewards.claimedTotalUsd).toFixed(2)}</div>
        </div>
      </div>
      
      <div className="border-t pt-3">
        <h3 className="text-gray-600 mb-2">Pending Rewards by Validator</h3>
        
        {Object.keys(validatorRewards).length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No pending rewards
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(validatorRewards).map(([validatorAddress, rewards]) => {
              const isExpanded = expandedValidators.includes(validatorAddress);
              const validatorRewardsSum = calculateValidatorRewardsSum(rewards);
              const validator = rewards[0]?.validator || { name: 'Unknown Validator' };
              
              return (
                <div key={validatorAddress} className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleExpandValidator(validatorAddress)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{validator.name}</div>
                      <div className="text-gray-600 text-sm truncate">{validatorAddress}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{validatorRewardsSum} CTA</div>
                      <div className="text-sm text-gray-600">
                        {isExpanded ? 'Hide' : 'Show'} Details
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t p-3 bg-gray-50">
                      <div className="mb-3">
                        <div className="text-sm text-gray-600 mb-1">Reward Details</div>
                        <div className="max-h-40 overflow-y-auto">
                          {rewards.map((reward, index) => (
                            <div 
                              key={index} 
                              className="flex justify-between py-1 border-b border-gray-200 last:border-b-0"
                            >
                              <div className="text-sm">
                                {new Date(reward.timestamp).toLocaleDateString()}
                              </div>
                              <div className="text-sm font-medium">
                                {parseFloat(reward.amount).toFixed(6)} CTA
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => handleClaimRewards(validatorAddress)}
                          disabled={isClaiming}
                        >
                          {isClaiming ? <Loading size="small" /> : 'Claim'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RewardsCard;
