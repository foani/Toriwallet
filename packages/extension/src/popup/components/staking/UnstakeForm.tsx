import React, { useState } from 'react';
import { useStaking } from '../../hooks/useStaking';
import { Delegation } from '../../../core/types';
import Button from '../common/Button';
import Card from '../common/Card';
import Loading from '../common/Loading';

interface UnstakeFormProps {
  delegation: Delegation;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * UnstakeForm component
 * 
 * Form for unstaking tokens from a validator
 */
const UnstakeForm: React.FC<UnstakeFormProps> = ({
  delegation,
  onClose,
  onSuccess
}) => {
  const { unstake } = useStaking();
  
  // Local state
  const [isUnstaking, setIsUnstaking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Get formatted lock end date
  const getLockEndDate = () => {
    if (delegation.lockEndTimestamp) {
      return new Date(delegation.lockEndTimestamp).toLocaleString();
    }
    return null;
  };
  
  // Check if delegation is locked
  const isLocked = delegation.lockEndTimestamp && new Date(delegation.lockEndTimestamp) > new Date();
  
  // Get remaining lock time
  const getRemainingLockTime = () => {
    if (!delegation.lockEndTimestamp) return null;
    
    const now = new Date();
    const lockEnd = new Date(delegation.lockEndTimestamp);
    
    if (lockEnd <= now) return null;
    
    const diffMs = lockEnd.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${diffDays} days ${diffHours} hours`;
  };
  
  // Handle unstake
  const handleUnstake = async () => {
    try {
      setIsUnstaking(true);
      setError('');
      
      // Unstake tokens
      await unstake(delegation.id);
      
      // Success callback
      onSuccess();
    } catch (error) {
      console.error('Failed to unstake:', error);
      setError(error.message || 'Failed to unstake. Please try again.');
    } finally {
      setIsUnstaking(false);
    }
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-medium mb-4">Unstake Tokens</h2>
      
      <Card className="mb-4">
        <div className="mb-3">
          <div className="font-medium">{delegation.validator?.name || 'Unknown Validator'}</div>
          <div className="text-gray-600 text-sm truncate">{delegation.validatorAddress}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <div className="text-gray-600 text-sm">Staked Amount</div>
            <div className="font-medium">{parseFloat(delegation.amount).toFixed(6)} CTA</div>
          </div>
          <div>
            <div className="text-gray-600 text-sm">Staking Period</div>
            <div className="font-medium">
              {delegation.period === 'FLEXIBLE'
                ? 'Flexible'
                : delegation.period === 'TEN_DAYS'
                ? '10 Days'
                : delegation.period === 'THIRTY_DAYS'
                ? '30 Days'
                : delegation.period === 'SIXTY_DAYS'
                ? '60 Days'
                : delegation.period === 'NINETY_DAYS'
                ? '90 Days'
                : delegation.period}
            </div>
          </div>
        </div>
        
        {delegation.stakedAt && (
          <div className="mb-3">
            <div className="text-gray-600 text-sm">Staked At</div>
            <div className="font-medium">
              {new Date(delegation.stakedAt).toLocaleString()}
            </div>
          </div>
        )}
        
        {getLockEndDate() && (
          <div className="mb-3">
            <div className="text-gray-600 text-sm">Lock End</div>
            <div className="font-medium">{getLockEndDate()}</div>
          </div>
        )}
        
        {getRemainingLockTime() && (
          <div className="mb-3">
            <div className="text-gray-600 text-sm">Remaining Lock Time</div>
            <div className="font-medium">{getRemainingLockTime()}</div>
          </div>
        )}
      </Card>
      
      {isLocked && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-lg">
          <div className="font-medium mb-1">Locked Stake</div>
          <div className="text-sm">
            This stake is currently locked. Unstaking before the lock end date may result in
            penalties or forfeiture of rewards. Please consider waiting until the lock period ends.
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex space-x-3">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isUnstaking}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleUnstake}
          disabled={isUnstaking}
          className="flex-1"
        >
          {isUnstaking ? <Loading size="small" /> : 'Unstake'}
        </Button>
      </div>
    </div>
  );
};

export default UnstakeForm;
