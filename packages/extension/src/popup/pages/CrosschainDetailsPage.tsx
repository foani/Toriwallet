import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCrosschain } from '../hooks/useCrosschain';
import { useNetwork } from '../hooks/useNetwork';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import { ICPTransferResult, BridgeTransaction, SwapTransaction, TransactionStatus, RouteStep } from '../../core/types';

/**
 * CrosschainDetailsPage component
 * 
 * Displays the details of a cross-chain transaction including ICP transfers, 
 * bridge transactions, and cross-chain swaps
 */
const CrosschainDetailsPage: React.FC = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const { getNetworkById } = useNetwork();
  const { 
    getICPTransferStatus, 
    getBridgeTransactionStatus, 
    getSwapStatus, 
    isLoading 
  } = useCrosschain();

  const [transaction, setTransaction] = useState<
    ICPTransferResult | BridgeTransaction | SwapTransaction | null
  >(null);

  useEffect(() => {
    const loadTransaction = async () => {
      if (!id || !type) return;

      try {
        if (type === 'icp') {
          const icpTransfer = await getICPTransferStatus(id);
          setTransaction(icpTransfer);
        } else if (type === 'bridge') {
          const bridgeTransaction = await getBridgeTransactionStatus(id);
          setTransaction(bridgeTransaction);
        } else if (type === 'swap') {
          const swapTransaction = await getSwapStatus(id);
          setTransaction(swapTransaction);
        }
      } catch (error) {
        console.error('Failed to load transaction details:', error);
      }
    };

    loadTransaction();
  }, [id, type, getICPTransferStatus, getBridgeTransactionStatus, getSwapStatus]);

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

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const shortenHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Add a toast or notification here if desired
        console.log('Copied to clipboard:', text);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  const openExplorer = (chain: string, hash: string) => {
    const network = getNetworkById(chain);
    if (network && network.explorerUrl) {
      window.open(`${network.explorerUrl}/tx/${hash}`, '_blank');
    }
  };

  const renderICPTransfer = (transfer: ICPTransferResult) => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-medium">ICP Transfer</h1>
          <div className={`px-3 py-1 rounded-full ${getStatusColor(transfer.status)}`}>
            {transfer.status}
          </div>
        </div>

        <Card>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Source Chain:</span>
              <span className="font-medium">{getNetworkById(transfer.sourceChain)?.name || transfer.sourceChain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Destination Chain:</span>
              <span className="font-medium">{getNetworkById(transfer.targetChain)?.name || transfer.targetChain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction Hash:</span>
              <div className="flex items-center">
                <span className="font-medium">{shortenHash(transfer.txHash)}</span>
                <Button
                  variant="text"
                  size="small"
                  className="ml-2"
                  onClick={() => copyToClipboard(transfer.txHash)}
                >
                  Copy
                </Button>
                <Button
                  variant="text"
                  size="small"
                  className="ml-2"
                  onClick={() => openExplorer(transfer.sourceChain, transfer.txHash)}
                >
                  Explorer
                </Button>
              </div>
            </div>
            {transfer.targetTxHash && (
              <div className="flex justify-between">
                <span className="text-gray-600">Target Transaction Hash:</span>
                <div className="flex items-center">
                  <span className="font-medium">{shortenHash(transfer.targetTxHash)}</span>
                  <Button
                    variant="text"
                    size="small"
                    className="ml-2"
                    onClick={() => copyToClipboard(transfer.targetTxHash)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    className="ml-2"
                    onClick={() => openExplorer(transfer.targetChain, transfer.targetTxHash)}
                  >
                    Explorer
                  </Button>
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{formatTimestamp(transfer.timestamp)}</span>
            </div>
            {transfer.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium">{formatTimestamp(transfer.completedAt)}</span>
              </div>
            )}
            {transfer.estimatedCompletionTime && (
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Completion:</span>
                <span className="font-medium">{formatTimestamp(transfer.estimatedCompletionTime)}</span>
              </div>
            )}
          </div>
        </Card>

        {transfer.error && (
          <Card className="bg-red-50">
            <h3 className="font-medium text-red-800 mb-2">Error Details</h3>
            <p className="text-red-700">{transfer.error}</p>
          </Card>
        )}
      </div>
    );
  };

  const renderBridgeTransaction = (bridge: BridgeTransaction) => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-medium">Bridge Transaction</h1>
          <div className={`px-3 py-1 rounded-full ${getStatusColor(bridge.status)}`}>
            {bridge.status}
          </div>
        </div>

        <Card>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Provider:</span>
              <span className="font-medium">{bridge.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Source Chain:</span>
              <span className="font-medium">{getNetworkById(bridge.fromChain)?.name || bridge.fromChain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Destination Chain:</span>
              <span className="font-medium">{getNetworkById(bridge.toChain)?.name || bridge.toChain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">From Asset:</span>
              <span className="font-medium">{bridge.fromAsset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To Asset:</span>
              <span className="font-medium">{bridge.toAsset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{bridge.fromAmount} {bridge.fromAsset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expected Amount:</span>
              <span className="font-medium">{bridge.toAmount} {bridge.toAsset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Source Transaction:</span>
              <div className="flex items-center">
                <span className="font-medium">{shortenHash(bridge.sourceTxHash)}</span>
                <Button
                  variant="text"
                  size="small"
                  className="ml-2"
                  onClick={() => copyToClipboard(bridge.sourceTxHash)}
                >
                  Copy
                </Button>
                <Button
                  variant="text"
                  size="small"
                  className="ml-2"
                  onClick={() => openExplorer(bridge.fromChain, bridge.sourceTxHash)}
                >
                  Explorer
                </Button>
              </div>
            </div>
            {bridge.targetTxHash && (
              <div className="flex justify-between">
                <span className="text-gray-600">Target Transaction:</span>
                <div className="flex items-center">
                  <span className="font-medium">{shortenHash(bridge.targetTxHash)}</span>
                  <Button
                    variant="text"
                    size="small"
                    className="ml-2"
                    onClick={() => copyToClipboard(bridge.targetTxHash)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    className="ml-2"
                    onClick={() => openExplorer(bridge.toChain, bridge.targetTxHash)}
                  >
                    Explorer
                  </Button>
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{formatTimestamp(bridge.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Updated:</span>
              <span className="font-medium">{formatTimestamp(bridge.updatedAt)}</span>
            </div>
            {bridge.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium">{formatTimestamp(bridge.completedAt)}</span>
              </div>
            )}
          </div>
        </Card>

        {bridge.error && (
          <Card className="bg-red-50">
            <h3 className="font-medium text-red-800 mb-2">Error Details</h3>
            <p className="text-red-700">{bridge.error}</p>
          </Card>
        )}
      </div>
    );
  };

  const renderSwapTransaction = (swap: SwapTransaction) => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-medium">Cross-Chain Swap</h1>
          <div className={`px-3 py-1 rounded-full ${getStatusColor(swap.status)}`}>
            {swap.status}
          </div>
        </div>

        <Card>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Source Chain:</span>
              <span className="font-medium">{getNetworkById(swap.fromChain)?.name || swap.fromChain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Destination Chain:</span>
              <span className="font-medium">{getNetworkById(swap.toChain)?.name || swap.toChain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">From Asset:</span>
              <span className="font-medium">{swap.fromAsset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To Asset:</span>
              <span className="font-medium">{swap.toAsset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{swap.fromAmount} {swap.fromAsset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expected Amount:</span>
              <span className="font-medium">{swap.toAmount} {swap.toAsset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{formatTimestamp(swap.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Updated:</span>
              <span className="font-medium">{formatTimestamp(swap.updatedAt)}</span>
            </div>
            {swap.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium">{formatTimestamp(swap.completedAt)}</span>
              </div>
            )}
          </div>
        </Card>

        <h2 className="text-lg font-medium mt-4">Transactions</h2>
        {swap.transactions.map((tx, index) => (
          <Card key={index} className="mb-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Chain:</span>
                <span className="font-medium">{getNetworkById(tx.chain)?.name || tx.chain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hash:</span>
                <div className="flex items-center">
                  <span className="font-medium">{shortenHash(tx.hash)}</span>
                  <Button
                    variant="text"
                    size="small"
                    className="ml-2"
                    onClick={() => copyToClipboard(tx.hash)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    className="ml-2"
                    onClick={() => openExplorer(tx.chain, tx.hash)}
                  >
                    Explorer
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-0.5 rounded-full text-sm ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </span>
              </div>
            </div>
          </Card>
        ))}

        {swap.route && (
          <>
            <h2 className="text-lg font-medium mt-4">Route</h2>
            {swap.route.path.map((step, index) => (
              <Card key={index} className="mb-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{step.type}</span>
                  </div>
                  {step.provider && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provider:</span>
                      <span className="font-medium">{step.provider}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">From Chain:</span>
                    <span className="font-medium">{getNetworkById(step.fromChain)?.name || step.fromChain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To Chain:</span>
                    <span className="font-medium">{getNetworkById(step.toChain)?.name || step.toChain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">From Asset:</span>
                    <span className="font-medium">{step.fromAsset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To Asset:</span>
                    <span className="font-medium">{step.toAsset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{step.fromAmount} {step.fromAsset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Amount:</span>
                    <span className="font-medium">{step.toAmount} {step.toAsset}</span>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}

        {swap.error && (
          <Card className="bg-red-50">
            <h3 className="font-medium text-red-800 mb-2">Error Details</h3>
            <p className="text-red-700">{swap.error}</p>
          </Card>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center border-b border-gray-200 p-4">
          <Button
            variant="text"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            Back
          </Button>
          <h1 className="text-xl font-medium">Transaction Details</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loading />
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center border-b border-gray-200 p-4">
          <Button
            variant="text"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            Back
          </Button>
          <h1 className="text-xl font-medium">Transaction Details</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Transaction not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center border-b border-gray-200 p-4">
        <Button
          variant="text"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          Back
        </Button>
        <h1 className="text-xl font-medium">Transaction Details</h1>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {'txHash' in transaction ? (
          renderICPTransfer(transaction as ICPTransferResult)
        ) : 'route' in transaction ? (
          renderSwapTransaction(transaction as SwapTransaction)
        ) : (
          renderBridgeTransaction(transaction as BridgeTransaction)
        )}
      </div>
    </div>
  );
};

export default CrosschainDetailsPage;
