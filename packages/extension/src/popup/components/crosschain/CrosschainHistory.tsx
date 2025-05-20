import React, { useState, useEffect } from 'react';
import { useNetwork } from '../../hooks/useNetwork';
import { useCrosschain } from '../../hooks/useCrosschain';
import { ICPTransferResult, BridgeTransaction, SwapTransaction, TransactionStatus } from '../../../core/types';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';

interface CrosschainHistoryProps {
  address?: string;
  limit?: number;
  showFilters?: boolean;
  onItemClick?: (item: ICPTransferResult | BridgeTransaction | SwapTransaction) => void;
}

/**
 * CrosschainHistory component
 * 
 * Displays the history of ICP transfers, bridge transactions, and cross-chain swaps
 */
const CrosschainHistory: React.FC<CrosschainHistoryProps> = ({
  address,
  limit = 10,
  showFilters = true,
  onItemClick
}) => {
  const { getNetworkById } = useNetwork();
  const {
    icpTransferHistory,
    bridgeTransactionHistory,
    swapHistory,
    loadHistory,
    isLoading
  } = useCrosschain();

  // Local state
  const [historyType, setHistoryType] = useState<'all' | 'icp' | 'bridge' | 'swap'>('all');
  const [filteredHistory, setFilteredHistory] = useState<(ICPTransferResult | BridgeTransaction | SwapTransaction)[]>([]);

  useEffect(() => {
    if (address) {
      loadHistory(address);
    }
  }, [address, loadHistory]);

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

    // Apply limit
    setFilteredHistory(combinedHistory.slice(0, limit));
  }, [historyType, icpTransferHistory, bridgeTransactionHistory, swapHistory, limit]);

  const getStatusColor = (status: string | TransactionStatus) => {
    switch (status) {
      case 'CONFIRMED':
      case 'confirmed':
      case TransactionStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case 'PENDING': 
      case 'pending':
      case TransactionStatus.PENDING:
      case TransactionStatus.PROCESSING:
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
      case 'failed': 
      case TransactionStatus.FAILED:
      case TransactionStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderHistoryItem = (item: ICPTransferResult | BridgeTransaction | SwapTransaction) => {
    // Determine the type of history item
    let itemType: 'icp' | 'bridge' | 'swap';
    let fromChain: string;
    let toChain: string;
    let fromAsset: string;
    let toAsset: string;
    let amount: string;
    let status: string | TransactionStatus;
    let time: number;
    let txHash: string;

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
      txHash = item.transactions[0]?.hash || '';
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
      txHash = item.sourceTxHash;
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
      txHash = item.txHash;
    }

    // Get network names
    const fromNetwork = getNetworkById(fromChain)?.name || fromChain;
    const toNetwork = getNetworkById(toChain)?.name || toChain;

    // Format timestamp
    const date = new Date(time);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();

    return (
      <Card 
        key={itemType === 'icp' ? (item as ICPTransferResult).txHash : (item as BridgeTransaction | SwapTransaction).id} 
        className="mb-3 cursor-pointer hover:bg-gray-100"
        onClick={() => onItemClick && onItemClick(item)}
      >
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-lg">
              {itemType === 'icp' ? 'ICP Transfer' : 
               itemType === 'bridge' ? 'Bridge' : 'Cross-Chain Swap'}
            </div>
            <div className={`px-2 py-1 rounded-full text-sm ${getStatusColor(status)}`}>
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
          
          <div className="flex justify-between items-center">
            <div className="text-gray-500 text-sm">
              {formattedDate} {formattedTime}
            </div>
            
            {txHash && (
              <div className="text-gray-500 text-sm truncate max-w-[150px]">
                {txHash.substring(0, 6)}...{txHash.substring(txHash.length - 4)}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full">
      {showFilters && (
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
      )}

      {filteredHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No transaction history found
        </div>
      ) : (
        filteredHistory.map(renderHistoryItem)
      )}
    </div>
  );
};

export default CrosschainHistory;
