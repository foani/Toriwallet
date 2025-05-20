import React, { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { useStaking } from '../../hooks/useStaking';
import { Validator, StakingPeriod, WalletBalance } from '../../../core/types';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import Loading from '../common/Loading';

interface StakingFormProps {
  validator: Validator;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * StakingForm component
 * 
 * Form for staking tokens to a validator
 */
const StakingForm: React.FC<StakingFormProps> = ({
  validator,
  onClose,
  onSuccess
}) => {
  const { selectedAccount, balances } = useWallet();
  const { selectedNetwork } = useNetwork();
  const { isAutocompoundSupported, stake } = useStaking();
  
  // Local state
  const [amount, setAmount] = useState<string>('');
  const [period, setPeriod] = useState<StakingPeriod>('FLEXIBLE');
  const [autoCompound, setAutoCompound] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [availableBalance, setAvailableBalance] = useState<string>('0');
  
  // Get available balance
  useEffect(() => {
    if (selectedAccount && selectedNetwork) {
      const accountBalances = balances[selectedAccount.address] || [];
      const nativeBalance = accountBalances.find(
        balance => balance.asset === selectedNetwork.nativeCurrency.symbol
      );
      
      if (nativeBalance) {
        setAvailableBalance(nativeBalance.amount);
      } else {
        setAvailableBalance('0');
      }
    } else {
      setAvailableBalance('0');
    }
  }, [selectedAccount, selectedNetwork, balances]);
  
  // Handle amount change
  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimals
    if (/^(\d+)?(\.\d*)?$/.test(value) || value === '') {
      setAmount(value);
      setError('');
    }
  };
  
  // Handle max amount
  const handleMaxAmount = () => {
    setAmount(availableBalance);
    setError('');
  };
  
  // Handle stake
  const handleStake = async () => {
    try {
      // Validate amount
      if (!amount || parseFloat(amount) <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      
      // Validate sufficient balance
      if (parseFloat(amount) > parseFloat(availableBalance)) {
        setError('Insufficient balance');
        return;
      }
      
      setIsSubmitting(true);
      setError('');
      
      // Stake tokens
      await stake(validator.address, amount, period, autoCompound);
      
      // Success callback
      onSuccess();
    } catch (error) {
      console.error('Failed to stake:', error);
      setError(error.message || 'Failed to stake. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Staking periods
  const stakingPeriods: { value: StakingPeriod, label: string, description: string }[] = [
    {
      value: 'FLEXIBLE',
      label: 'Flexible',
      description: 'No lock-up period, can unstake anytime'
    },
    {
      value: 'TEN_DAYS',
      label: '10 Days',
      description: 'Lock for 10 days, higher APR'
    },
    {
      value: 'THIRTY_DAYS',
      label: '30 Days',
      description: 'Lock for 30 days, even higher APR'
    },
    {
      value: 'SIXTY_DAYS',
      label: '60 Days',
      description: 'Lock for 60 days, much higher APR'
    },
    {
      value: 'NINETY_DAYS',
      label: '90 Days',
      description: 'Lock for 90 days, highest APR'
    }
  ];
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-medium mb-4">Stake {selectedNetwork?.nativeCurrency.symbol}</h2>
      
      <Card className="mb-4">
        <div className="flex items-center mb-3">
          {validator.image && (
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
              <img 
                src={validator.image} 
                alt={validator.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <h3 className="font-medium">{validator.name || 'Unknown Validator'}</h3>
            <div className="text-gray-600 text-sm truncate">{validator.address}</div>
          </div>
        </div>
        
        {validator.description && (
          <div className="mb-3 text-gray-600 text-sm">{validator.description}</div>
        )}
        
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-gray-600 text-xs">Commission</div>
            <div className="font-medium">
              {validator.commission
                ? `${(Number(validator.commission) * 100).toFixed(2)}%`
                : 'N/A'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 text-xs">APR</div>
            <div className="font-medium">
              {validator.apr
                ? `${(Number(validator.apr) * 100).toFixed(2)}%`
                : 'N/A'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 text-xs">Delegators</div>
            <div className="font-medium">{validator.delegators || 'N/A'}</div>
          </div>
        </div>
      </Card>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Amount
        </label>
        <div className="relative">
          <Input
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.0"
            disabled={isSubmitting}
            className="pr-16"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 text-sm font-medium"
            onClick={handleMaxAmount}
          >
            MAX
          </button>
        </div>
        <div className="flex justify-between mt-1 text-sm">
          <div className="text-gray-600">
            Available: {parseFloat(availableBalance).toFixed(6)} {selectedNetwork?.nativeCurrency.symbol}
          </div>
          {amount && (
            <div className="text-gray-600">
              ≈ ${(parseFloat(amount) * (selectedNetwork?.nativeCurrency.price || 0)).toFixed(2)}
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Staking Period
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {stakingPeriods.map((p) => (
            <div
              key={p.value}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                period === p.value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setPeriod(p.value)}
            >
              <div className="font-medium">{p.label}</div>
              <div className="text-sm text-gray-600">{p.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      {isAutocompoundSupported && (
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoCompound}
              onChange={(e) => setAutoCompound(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Auto-compound rewards</span>
          </label>
          <div className="mt-1 text-sm text-gray-500">
            Automatically reinvest rewards to maximize earnings
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
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleStake}
          disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
          className="flex-1"
        >
          {isSubmitting ? <Loading size="small" /> : 'Stake'}
        </Button>
      </div>
    </div>
  );
};

export default StakingForm;
