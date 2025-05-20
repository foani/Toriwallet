import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useNetwork } from '../hooks/useNetwork';
import { useStaking } from '../hooks/useStaking';
import { Validator, Delegation, StakingReward } from '../../core/types';
import ValidatorCard from '../components/staking/ValidatorCard';
import RewardsCard from '../components/staking/RewardsCard';
import StakingForm from '../components/staking/StakingForm';
import UnstakeForm from '../components/staking/UnstakeForm';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Tabs from '../components/common/Tabs';
import Loading from '../components/common/Loading';
import { FiSearch, FiRefreshCw, FiInfo, FiFilter, FiChevronRight } from 'react-icons/fi';

/**
 * StakingPage component
 * 
 * Main page for staking functionality including validator list, delegations, and rewards
 */
const StakingPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedAccount, isWalletUnlocked } = useWallet();
  const { selectedNetwork } = useNetwork();

  const { 
    validators, 
    delegations, 
    pendingRewards, 
    stakingHistory,
    isLoading,
    loadValidators,
    loadDelegations,
    loadPendingRewards,
    loadStakingHistory,
    searchValidators,
    getTotalRewards,
    claimAllRewards
  } = useStaking();
  const [activeTab, setActiveTab] = useState<'validators' | 'delegations' | 'rewards' | 'history'>('validators');
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);
  const [selectedDelegation, setSelectedDelegation] = useState<Delegation | null>(null);
  const [showStakingForm, setShowStakingForm] = useState<boolean>(false);
  const [showUnstakeForm, setShowUnstakeForm] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');
  const [filteredValidators, setFilteredValidators] = useState<Validator[]>([]);
  const [totalRewards, setTotalRewards] = useState<{
    total: string;
    totalUsd: string;
    pendingTotal: string;
    pendingTotalUsd: string;
    claimedTotal: string;
    claimedTotalUsd: string;
  }>({
    total: '0',
    totalUsd: '0',
    pendingTotal: '0',
    pendingTotalUsd: '0',
    claimedTotal: '0',
    claimedTotalUsd: '0'
  });
  const [isClaimingRewards, setIsClaimingRewards] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Load total rewards
  const loadTotalRewards = useCallback(async () => {
    try {
      const rewards = await getTotalRewards();
      setTotalRewards(rewards);
    } catch (error) {
      console.error('Failed to load total rewards:', error);
    }
  }, [getTotalRewards]);

  // Filter validators
  useEffect(() => {
    if (validators.length > 0) {
      let filtered = [...validators];
      
      // Filter by status
      if (filterStatus) {
        filtered = filtered.filter(v => v.status === filterStatus);
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(v => 
          (v.name && v.name.toLowerCase().includes(query)) || 
          v.address.toLowerCase().includes(query)
        );
      }
      
      setFilteredValidators(filtered);
    } else {
      setFilteredValidators([]);
    }
  }, [validators, filterStatus, searchQuery]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (searchQuery.trim() === '') {
      return;
    }
    
    try {
      const results = await searchValidators(searchQuery);
      setFilteredValidators(results);
    } catch (error) {
      console.error('Failed to search validators:', error);
    }
  }, [searchQuery, searchValidators]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadValidators(filterStatus);
    
    if (activeTab === 'delegations') {
      loadDelegations();
    } else if (activeTab === 'rewards') {
      loadPendingRewards();
      loadTotalRewards();
    } else if (activeTab === 'history') {
      loadStakingHistory();
    }
  }, [
    activeTab, 
    filterStatus, 
    loadValidators, 
    loadDelegations, 
    loadPendingRewards, 
    loadStakingHistory, 
    loadTotalRewards
  ]);

  // Handle validator selection
  const handleSelectValidator = useCallback((validator: Validator) => {
    setSelectedValidator(validator);
    navigate(`/validator/${validator.address}`);
  }, [navigate]);

  // Handle stake button click
  const handleStakeClick = useCallback((validator: Validator) => {
    setSelectedValidator(validator);
    setShowStakingForm(true);
  }, []);

  // Handle unstake button click
  const handleUnstakeClick = useCallback((delegation: Delegation) => {
    setSelectedDelegation(delegation);
    setShowUnstakeForm(true);
  }, []);

  // Handle claim all rewards
  const handleClaimAllRewards = useCallback(async () => {
    try {
      setIsClaimingRewards(true);
      setError('');
      
      await claimAllRewards();
      
      // Refresh rewards data
      loadPendingRewards();
      loadTotalRewards();
    } catch (error) {
      console.error('Failed to claim all rewards:', error);
      setError(error.message || 'Failed to claim all rewards. Please try again.');
    } finally {
      setIsClaimingRewards(false);
    }
  }, [claimAllRewards, loadPendingRewards, loadTotalRewards]);

  // Initialize data
  useEffect(() => {
    if (selectedAccount && selectedNetwork && isWalletUnlocked) {
      loadValidators(filterStatus);
      loadDelegations();
      loadPendingRewards();
      loadStakingHistory();
      loadTotalRewards();
    }
  }, [
    selectedAccount, 
    selectedNetwork, 
    isWalletUnlocked,
    filterStatus,
    loadValidators, 
    loadDelegations, 
    loadPendingRewards, 
    loadStakingHistory,
    loadTotalRewards
  ]);

  // If wallet is not unlocked, show message
  if (!isWalletUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <FiInfo className="text-4xl text-gray-400 mb-2" />
        <p className="text-gray-600 text-center">
          Please unlock your wallet to access staking functionality.
        </p>
      </div>
    );
  }

  // If no account or network is selected, show message
  if (!selectedAccount || !selectedNetwork) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <FiInfo className="text-4xl text-gray-400 mb-2" />
        <p className="text-gray-600 text-center">
          Please select an account and network to access staking functionality.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold">Staking</h1>
        <p className="text-gray-600 text-sm">
          Stake your {selectedNetwork.nativeCurrency.symbol} to earn rewards
        </p>
      </div>
      
      <Tabs
        tabs={[
          { id: 'validators', label: 'Validators' },
          { id: 'delegations', label: 'My Stakes' },
          { id: 'rewards', label: 'Rewards' },
          { id: 'history', label: 'History' }
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />
      
      <div className="flex-1 overflow-auto">
        {activeTab === 'validators' && (
          <div className="p-4">
            <div className="flex mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search validators"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FiSearch />
              </button>
              <button
                onClick={handleRefresh}
                className="ml-2 p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FiRefreshCw />
              </button>
              <div className="relative ml-2">
                <button
                  className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <FiFilter />
                </button>
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg z-10 border p-2">
                  <div className="text-sm font-medium mb-1">Status</div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-2 rounded border border-gray-300 text-sm"
                  >
                    <option value="">All</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="JAILED">Jailed</option>
                  </select>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loading />
              </div>
            ) : filteredValidators.length > 0 ? (
              <div>
                {filteredValidators.map((validator) => (
                  <ValidatorCard
                    key={validator.address}
                    validator={validator}
                    onSelect={handleSelectValidator}
                    onStake={handleStakeClick}
                    isSelected={selectedValidator?.address === validator.address}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <FiInfo className="text-4xl text-gray-400 mb-2" />
                <p className="text-gray-600 text-center">
                  {validators.length > 0 
                    ? 'No validators match your filters'
                    : 'No validators found'}
                </p>
                {validators.length === 0 && !isLoading && (
                  <Button 
                    variant="primary" 
                    size="small"
                    onClick={() => loadValidators(filterStatus)}
                    className="mt-2"
                  >
                    Load Validators
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'delegations' && (
          <div className="p-4">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleRefresh}
                className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FiRefreshCw />
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loading />
              </div>
            ) : delegations.length > 0 ? (
              <div>
                {delegations.map((delegation) => (
                  <div 
                    key={delegation.id} 
                    className="bg-white rounded-lg shadow mb-3 p-4"
                  >
                    <div className="flex items-center mb-2">
                      {delegation.validator.image && (
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                          <img 
                            src={delegation.validator.image} 
                            alt={delegation.validator.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {delegation.validator.name || 'Unknown Validator'}
                        </h3>
                        <div className="text-gray-600 text-sm truncate">
                          {delegation.validator.address}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleUnstakeClick(delegation)}
                      >
                        Unstake
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-gray-600 text-xs">Staked Amount</div>
                        <div className="font-medium">
                          {parseFloat(delegation.amount).toFixed(6)} {selectedNetwork.nativeCurrency.symbol}
                        </div>
                        <div className="text-gray-600 text-xs">
                          ≈ ${(parseFloat(delegation.amount) * (selectedNetwork.nativeCurrency.price || 0)).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs">Rewards</div>
                        <div className="font-medium">
                          {delegation.pendingRewards 
                            ? parseFloat(delegation.pendingRewards).toFixed(6)
                            : '0.000000'} {selectedNetwork.nativeCurrency.symbol}
                        </div>
                        <div className="text-gray-600 text-xs">
                          ≈ ${(parseFloat(delegation.pendingRewards || '0') * (selectedNetwork.nativeCurrency.price || 0)).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs">Staking Period</div>
                        <div className="font-medium">
                          {delegation.period === 'FLEXIBLE' ? 'Flexible' :
                           delegation.period === 'TEN_DAYS' ? '10 Days' :
                           delegation.period === 'THIRTY_DAYS' ? '30 Days' :
                           delegation.period === 'SIXTY_DAYS' ? '60 Days' :
                           delegation.period === 'NINETY_DAYS' ? '90 Days' : 
                           'Unknown'}
                        </div>
                        {delegation.endTime && (
                          <div className="text-gray-600 text-xs">
                            Ends: {new Date(delegation.endTime).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <FiInfo className="text-4xl text-gray-400 mb-2" />
                <p className="text-gray-600 text-center">
                  You don't have any active stakes
                </p>
                <Button 
                  variant="primary" 
                  size="small"
                  onClick={() => setActiveTab('validators')}
                  className="mt-2"
                >
                  Stake Now
                </Button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'rewards' && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-medium">Total Rewards</h3>
                <div className="text-2xl font-semibold">
                  {parseFloat(totalRewards.total).toFixed(6)} {selectedNetwork.nativeCurrency.symbol}
                </div>
                <div className="text-gray-600 text-sm">
                  ≈ ${parseFloat(totalRewards.totalUsd).toFixed(2)}
                </div>
              </div>
              <div className="flex">
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleClaimAllRewards}
                  disabled={isClaimingRewards || parseFloat(totalRewards.pendingTotal) <= 0}
                  className="mr-2"
                >
                  {isClaimingRewards ? <Loading size="small" /> : 'Claim All'}
                </Button>
                <button
                  onClick={handleRefresh}
                  className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <FiRefreshCw />
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-blue-700 text-sm font-medium">Pending</div>
                <div className="text-xl font-semibold">
                  {parseFloat(totalRewards.pendingTotal).toFixed(6)} {selectedNetwork.nativeCurrency.symbol}
                </div>
                <div className="text-blue-600 text-sm">
                  ≈ ${parseFloat(totalRewards.pendingTotalUsd).toFixed(2)}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-green-700 text-sm font-medium">Claimed</div>
                <div className="text-xl font-semibold">
                  {parseFloat(totalRewards.claimedTotal).toFixed(6)} {selectedNetwork.nativeCurrency.symbol}
                </div>
                <div className="text-green-600 text-sm">
                  ≈ ${parseFloat(totalRewards.claimedTotalUsd).toFixed(2)}
                </div>
              </div>
            </div>
            
            <h3 className="font-medium mb-2">Rewards by Validator</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loading />
              </div>
            ) : pendingRewards.length > 0 ? (
              <div>
                {pendingRewards.map((reward) => (
                  <RewardsCard
                    key={`${reward.validatorAddress}-${reward.amount}`}
                    reward={reward}
                    networkSymbol={selectedNetwork.nativeCurrency.symbol}
                    networkPrice={selectedNetwork.nativeCurrency.price || 0}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <FiInfo className="text-4xl text-gray-400 mb-2" />
                <p className="text-gray-600 text-center">
                  You don't have any pending rewards
                </p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="p-4">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleRefresh}
                className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FiRefreshCw />
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loading />
              </div>
            ) : stakingHistory.length > 0 ? (
              <div>
                {stakingHistory.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="bg-white rounded-lg shadow mb-3 p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-medium">
                          {transaction.type === 'STAKE' ? 'Stake' :
                           transaction.type === 'UNSTAKE' ? 'Unstake' :
                           transaction.type === 'REDELEGATE' ? 'Redelegate' :
                           transaction.type === 'CLAIM_REWARDS' ? 'Claim Rewards' :
                           transaction.type}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        transaction.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.status}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <div className="text-gray-600 text-xs">Validator</div>
                        <div className="font-medium truncate">
                          {transaction.validatorName || transaction.validatorAddress || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs">Amount</div>
                        <div className="font-medium">
                          {transaction.amount 
                            ? `${parseFloat(transaction.amount).toFixed(6)} ${selectedNetwork.nativeCurrency.symbol}`
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    {transaction.transactionHash && (
                      <div className="text-blue-600 text-sm flex items-center justify-end cursor-pointer"
                        onClick={() => {
                          if (selectedNetwork.blockExplorerUrl && transaction.transactionHash) {
                            window.open(
                              `${selectedNetwork.blockExplorerUrl}/tx/${transaction.transactionHash}`,
                              '_blank'
                            );
                          }
                        }}
                      >
                        View on Explorer <FiChevronRight className="ml-1" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <FiInfo className="text-4xl text-gray-400 mb-2" />
                <p className="text-gray-600 text-center">
                  No staking transaction history
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Staking Form Modal */}
      <Modal
        isOpen={showStakingForm}
        onClose={() => setShowStakingForm(false)}
      >
        {selectedValidator && (
          <StakingForm
            validator={selectedValidator}
            onClose={() => setShowStakingForm(false)}
            onSuccess={() => {
              setShowStakingForm(false);
              loadDelegations();
              loadStakingHistory();
            }}
          />
        )}
      </Modal>
      
      {/* Unstake Form Modal */}
      <Modal
        isOpen={showUnstakeForm}
        onClose={() => setShowUnstakeForm(false)}
      >
        {selectedDelegation && (
          <UnstakeForm
            delegation={selectedDelegation}
            onClose={() => setShowUnstakeForm(false)}
            onSuccess={() => {
              setShowUnstakeForm(false);
              loadDelegations();
              loadStakingHistory();
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default StakingPage;
