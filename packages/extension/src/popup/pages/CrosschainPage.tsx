import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useCrosschain } from '../hooks/useCrosschain';
import { useNetwork } from '../hooks/useNetwork';
import { useAssets } from '../hooks/useAssets';
import { ICPTransfer } from '../components/crosschain/ICPTransfer';
import { BridgeForm } from '../components/crosschain/BridgeForm';
import { BridgeTransaction, ICPTransferResult, Route, SwapTransaction } from '../../core/types';
import Tabs from '../components/common/Tabs';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import { WalletAccount } from '../../core/types';

/**
 * CrosschainPage component
 * 
 * Displays the cross-chain transfer options including:
 * - ICP transfers between Zenith and Catena chains
 * - Bridge transfers between various chains
 * - Cross-chain swaps
 */
const CrosschainPage: React.FC = () => {
  const { method = 'icp' } = useParams<{ method: string }>();
  const navigate = useNavigate();
  const { accounts, selectedAccount } = useWallet();
  const { networks, selectedNetwork, getNetworkById } = useNetwork();
  const { getTokenBySymbol } = useAssets();
  const { 
    icpTransferHistory, 
    bridgeTransactionHistory, 
    swapHistory,
    isLoading 
  } = useCrosschain();

  // Local state
  const [activeTab, setActiveTab] = useState<'icp' | 'bridge' | 'swap' | 'history'>(
    method as 'icp' | 'bridge' | 'swap' | 'history'
  );
  const [filteredHistory, setFilteredHistory] = useState<(ICPTransferResult | BridgeTransaction | SwapTransaction)[]>([]);
  const [historyType, setHistoryType] = useState<'all' | 'icp' | 'bridge' | 'swap'>('all');

  useEffect(() => {
    // Update URL when tab changes
    navigate(`/crosschain/${activeTab}`, { replace: true });
  }, [activeTab, navigate]);

  useEffect(() => {
    // Update filtered history when history type changes
    let combinedHistory: (ICPTransferResult | BridgeTransaction | SwapTransaction)[] = [];

    if (historyType === 'all' || historyType === 'icp') {
      combinedHistory = [...combinedHistory, ...icpTransferHistory];
    }

    if (historyType === 'all' || historyType === 'bridge') {
      combinedHistory = [...combinedHistory, ...bridgeTransactionHistory];
    }

    if (historyType === 'all' || historyType === 'swap') {
      combinedHistory = [...combinedHistory, ...swapHistory];
    }

    // Sort by timestamp (newest first)
    combinedHistory.sort((a, b) => {
      const timeA = 'createdAt' in a ? a.createdAt : a.timestamp;
      const timeB = 'createdAt' in b ? b.createdAt : b.timestamp;
      return timeB - timeA;
    });

    setFilteredHistory(combinedHistory);
  }, [historyType, icpTransferHistory, bridgeTransactionHistory, swapHistory]);

  // Tab configuration
  const tabs = [
    { id: 'icp', label: 'ICP Transfer' },
    { id: 'bridge', label: 'Bridge' },
    { id: 'swap', label: 'Cross-Chain Swap' },
    { id: 'history', label: 'History' }
  ];

  const renderHistoryItem = (item: ICPTransferResult | BridgeTransaction | SwapTransaction) => {
    // Determine the type of history item
    let itemType: 'icp' | 'bridge' | 'swap';
    let fromChain: string;
    let toChain: string;
    let fromAsset: string;
    let toAsset: string;
    let amount: string;
    let status: string;
    let time: number;

    if ('sourceTxHash' in item && 'route' in item) {
      // This is a swap transaction
      itemType = 'swap';
      fromChain = item.fromChain;
      toChain = item.toChain;
      fromAsset = item.fromAsset;
      toAsset = item.toAsset;
      amount = item.fromAmount;
      status = item.status;
      time = item.createdAt;
    } else if ('sourceTxHash' in item) {
      // This is a bridge transaction
      itemType = 'bridge';
      fromChain = item.fromChain;
      toChain = item.toChain;
      fromAsset = item.fromAsset;
      toAsset = item.toAsset;
      amount = item.fromAmount;
      status = item.status;
      time = item.createdAt;
    } else {
      // This is an ICP transfer
      itemType = 'icp';
      fromChain = item.sourceChain;
      toChain = item.targetChain;
      fromAsset = '';  // Not provided in ICP transfer results
      toAsset = '';    // Not provided in ICP transfer results
      amount = '';     // Not provided in ICP transfer results
      status = item.status;
      time = item.timestamp;
    }

    // Get network names
    const fromNetwork = getNetworkById(fromChain)?.name || fromChain;
    const toNetwork = getNetworkById(toChain)?.name || toChain;

    // Format timestamp
    const date = new Date(time);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();

    return (
      <Card key={itemType === 'icp' ? (item as ICPTransferResult).txHash : (item as BridgeTransaction | SwapTransaction).id} 
            className="mb-3 cursor-pointer hover:bg-gray-100">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-lg">
              {itemType === 'icp' ? 'ICP Transfer' : 
               itemType === 'bridge' ? 'Bridge' : 'Cross-Chain Swap'}
            </div>
            <div className={`px-2 py-1 rounded-full text-sm ${
              status === 'CONFIRMED' || status === 'confirmed' ? 'bg-green-100 text-green-800' :
              status === 'PENDING' || status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              status === 'FAILED' || status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status}
            </div>
          </div>
          
          <div className="flex items-center mb-2">
            <div className="mr-2 font-medium">{fromNetwork}</div>
            <div className="text-gray-500 mx-2">→</div>
            <div className="font-medium">{toNetwork}</div>
          </div>
          
          {fromAsset && toAsset && (
            <div className="flex items-center mb-2">
              <div className="mr-2 font-medium">{fromAsset}</div>
              <div className="text-gray-500 mx-2">→</div>
              <div className="font-medium">{toAsset}</div>
              {amount && <div className="ml-2 text-gray-500">({amount} {fromAsset})</div>}
            </div>
          )}
          
          <div className="text-gray-500 text-sm">
            {formattedDate} {formattedTime}
          </div>
        </div>
      </Card>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loading />;
    }

    switch (activeTab) {
      case 'icp':
        return <ICPTransfer />;
      case 'bridge':
        return <BridgeForm />;
      case 'swap':
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-medium mb-4">Cross-Chain Swap</h2>
            <p className="text-gray-600 mb-4 text-center">
              Coming soon! Cross-chain swaps will allow you to exchange tokens across different blockchains.
            </p>
            <Button 
              variant="secondary"
              onClick={() => setActiveTab('bridge')}
            >
              Try Bridge Instead
            </Button>
          </div>
        );
      case 'history':
        return (
          <div className="p-4">
            <div className="flex mb-4 overflow-x-auto">
              <Button
                variant={historyType === 'all' ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setHistoryType('all')}
                className="mr-2 whitespace-nowrap"
              >
                All
              </Button>
              <Button
                variant={historyType === 'icp' ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setHistoryType('icp')}
                className="mr-2 whitespace-nowrap"
              >
                ICP Transfers
              </Button>
              <Button
                variant={historyType === 'bridge' ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setHistoryType('bridge')}
                className="mr-2 whitespace-nowrap"
              >
                Bridges
              </Button>
              <Button
                variant={historyType === 'swap' ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setHistoryType('swap')}
                className="whitespace-nowrap"
              >
                Swaps
              </Button>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transaction history found
              </div>
            ) : (
              filteredHistory.map(renderHistoryItem)
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as any)}
      />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default CrosschainPage;
