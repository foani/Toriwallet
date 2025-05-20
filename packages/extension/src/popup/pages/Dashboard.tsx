import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import AccountSelector from '../components/wallet/AccountSelector';
import NetworkSelector from '../components/wallet/NetworkSelector';
import AssetsList from '../components/wallet/AssetsList';
import TransactionItem from '../components/wallet/TransactionItem';

/**
 * 대시보드 페이지 컴포넌트
 * 
 * 지갑의 메인 화면으로, 현재 계정 정보, 자산 목록, 최근 트랜잭션 등을 표시합니다.
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // 계정 상태
  const [accounts, setAccounts] = useState<Array<{ address: string; name: string }>>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  
  // 네트워크 상태
  const [networks, setNetworks] = useState<Array<{
    id: string;
    name: string;
    chainId: number;
    rpcUrl: string;
    symbol: string;
    blockExplorerUrl?: string;
    isTestnet?: boolean;
    isCustom?: boolean;
  }>>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  
  // 자산 상태
  const [assets, setAssets] = useState<Array<{
    id: string;
    name: string;
    symbol: string;
    icon?: string;
    balance: string;
    value: string;
    priceChange?: {
      value: number;
      period: '24h' | '7d' | '30d';
    };
  }>>([]);
  
  // 트랜잭션 상태
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'approve';
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: number;
    fromAddress: string;
    toAddress: string;
    amount: string;
    symbol: string;
    fee?: string;
    hash: string;
    blockExplorerUrl?: string;
  }>>([]);
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 백그라운드 스크립트에 데이터 요청
        // 실제 구현에서는 chrome.runtime.sendMessage 사용
        
        // 임시 구현: 가상 데이터 생성
        // 실제 구현 시 제거
        setTimeout(() => {
          // 계정 목록
          const mockAccounts = [
            { address: '0x1234567890123456789012345678901234567890', name: '계정 1' },
            { address: '0x2345678901234567890123456789012345678901', name: '계정 2' },
          ];
          setAccounts(mockAccounts);
          setSelectedAccount(mockAccounts[0].address);
          
          // 네트워크 목록
          const mockNetworks = [
            {
              id: 'catena-mainnet',
              name: 'Catena Chain Mainnet',
              chainId: 1000,
              rpcUrl: 'https://cvm.node.creatachain.com',
              symbol: 'CTA',
              blockExplorerUrl: 'https://catena.explorer.creatachain.com',
              isCustom: false,
            },
            {
              id: 'zenith-mainnet',
              name: 'Zenith Chain Mainnet',
              chainId: 2000,
              rpcUrl: 'https://zenith.node.creatachain.com',
              symbol: 'ZNT',
              blockExplorerUrl: 'https://zenith.explorer.creatachain.com',
              isCustom: false,
            },
            {
              id: 'ethereum-mainnet',
              name: 'Ethereum Mainnet',
              chainId: 1,
              rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
              symbol: 'ETH',
              blockExplorerUrl: 'https://etherscan.io',
              isCustom: false,
            },
          ];
          setNetworks(mockNetworks);
          setSelectedNetwork(mockNetworks[0].id);
          
          // 자산 목록
          const mockAssets = [
            {
              id: 'cta',
              name: 'Creata',
              symbol: 'CTA',
              balance: '100.5',
              value: '$205.50',
              priceChange: {
                value: 2.5,
                period: '24h' as const,
              },
            },
            {
              id: 'eth',
              name: 'Ethereum',
              symbol: 'ETH',
              balance: '0.5',
              value: '$950.25',
              priceChange: {
                value: -1.2,
                period: '24h' as const,
              },
            },
            {
              id: 'usdt',
              name: 'Tether',
              symbol: 'USDT',
              balance: '500',
              value: '$500.00',
              priceChange: {
                value: 0.1,
                period: '24h' as const,
              },
            },
          ];
          setAssets(mockAssets);
          
          // 트랜잭션 목록
          const mockTransactions = [
            {
              id: 'tx1',
              type: 'send' as const,
              status: 'confirmed' as const,
              timestamp: Date.now() - 86400000, // 1일 전
              fromAddress: '0x1234567890123456789012345678901234567890',
              toAddress: '0x2345678901234567890123456789012345678901',
              amount: '10.5',
              symbol: 'CTA',
              fee: '0.001 CTA',
              hash: '0x9876543210987654321098765432109876543210',
              blockExplorerUrl: 'https://catena.explorer.creatachain.com/tx/0x9876543210987654321098765432109876543210',
            },
            {
              id: 'tx2',
              type: 'receive' as const,
              status: 'confirmed' as const,
              timestamp: Date.now() - 172800000, // 2일 전
              fromAddress: '0x3456789012345678901234567890123456789012',
              toAddress: '0x1234567890123456789012345678901234567890',
              amount: '50',
              symbol: 'CTA',
              hash: '0x8765432109876543210987654321098765432109',
              blockExplorerUrl: 'https://catena.explorer.creatachain.com/tx/0x8765432109876543210987654321098765432109',
            },
            {
              id: 'tx3',
              type: 'swap' as const,
              status: 'confirmed' as const,
              timestamp: Date.now() - 259200000, // 3일 전
              fromAddress: '0x1234567890123456789012345678901234567890',
              toAddress: '0x1234567890123456789012345678901234567890',
              amount: '20',
              symbol: 'ETH -> CTA',
              fee: '0.01 ETH',
              hash: '0x7654321098765432109876543210987654321098',
              blockExplorerUrl: 'https://etherscan.io/tx/0x7654321098765432109876543210987654321098',
            },
          ];
          setTransactions(mockTransactions);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('데이터 로드 오류:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // 계정 선택 처리
  const handleSelectAccount = (address: string) => {
    setSelectedAccount(address);
    // 선택된 계정에 따른 자산 및 트랜잭션 업데이트
    // 실제 구현 시 백그라운드 스크립트에 요청
  };
  
  // 새 계정 생성 처리
  const handleCreateAccount = () => {
    // 실제 구현 시 백그라운드 스크립트에 요청
    console.log('새 계정 생성');
  };
  
  // 계정 가져오기 처리
  const handleImportAccount = () => {
    // 실제 구현 시 백그라운드 스크립트에 요청
    console.log('계정 가져오기');
  };
  
  // 네트워크 선택 처리
  const handleSelectNetwork = (networkId: string) => {
    setSelectedNetwork(networkId);
    // 선택된 네트워크에 따른 자산 및 트랜잭션 업데이트
    // 실제 구현 시 백그라운드 스크립트에 요청
  };
  
  // 네트워크 추가 처리
  const handleAddNetwork = (network: Omit<typeof networks[0], 'id' | 'isCustom'>) => {
    // 실제 구현 시 백그라운드 스크립트에 요청
    console.log('네트워크 추가:', network);
  };
  
  // 네트워크 제거 처리
  const handleRemoveNetwork = (networkId: string) => {
    // 실제 구현 시 백그라운드 스크립트에 요청
    console.log('네트워크 제거:', networkId);
  };
  
  // 자산 선택 처리
  const handleAssetClick = (assetId: string) => {
    // 자산 상세 페이지로 이동할 수 있음
    console.log('자산 선택:', assetId);
  };
  
  // 트랜잭션 선택 처리
  const handleTransactionClick = (transactionId: string) => {
    // 트랜잭션 상세 페이지로 이동할 수 있음
    console.log('트랜잭션 선택:', transactionId);
  };
  
  // 전송 페이지로 이동
  const handleSend = () => {
    navigate('/send');
  };
  
  // 수신 페이지로 이동
  const handleReceive = () => {
    navigate('/receive');
  };
  
  // 로딩 중인 경우 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="dashboard-page page">
        <Loading text="데이터를 불러오는 중..." />
      </div>
    );
  }
  
  // 선택된 네트워크 정보
  const selectedNetworkInfo = networks.find(network => network.id === selectedNetwork);
  
  // 총 자산 가치 계산 (값에서 $ 제거 후 숫자로 변환하여 합산)
  const totalBalance = assets
    .map(asset => parseFloat(asset.value.replace('$', '')))
    .reduce((sum, value) => sum + value, 0)
    .toFixed(2);
  
  return (
    <div className="dashboard-page page">
      <div className="dashboard-header">
        <div className="header-selectors">
          <NetworkSelector
            networks={networks}
            selectedNetwork={selectedNetwork}
            onSelectNetwork={handleSelectNetwork}
            onAddNetwork={handleAddNetwork}
            onRemoveNetwork={handleRemoveNetwork}
          />
          <AccountSelector
            accounts={accounts}
            selectedAccount={selectedAccount}
            onSelectAccount={handleSelectAccount}
            onCreateAccount={handleCreateAccount}
            onImportAccount={handleImportAccount}
          />
        </div>
      </div>
      
      <div className="dashboard-content">
        <Card className="wallet-card">
          <div className="wallet-balance-container">
            <div className="wallet-balance-label">총 자산</div>
            <div className="wallet-balance">${totalBalance}</div>
          </div>
          
          <div className="wallet-address-container">
            <div className="wallet-address">
              {selectedAccount}
            </div>
          </div>
          
          <div className="wallet-actions">
            <Button
              variant="secondary"
              onClick={handleReceive}
              className="wallet-action-btn"
            >
              받기
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              className="wallet-action-btn"
            >
              보내기
            </Button>
          </div>
        </Card>
        
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">자산</h2>
          </div>
          
          <AssetsList
            assets={assets}
            onAssetClick={handleAssetClick}
          />
        </div>
        
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">최근 트랜잭션</h2>
          </div>
          
          {transactions.length === 0 ? (
            <Card className="no-transactions-card">
              <div className="no-transactions">
                <div className="no-transactions-icon">📝</div>
                <h3 className="no-transactions-title">트랜잭션 없음</h3>
                <p className="no-transactions-message">
                  아직 트랜잭션이 없습니다. 자산을 전송하거나 받아보세요.
                </p>
              </div>
            </Card>
          ) : (
            <div className="transactions-list">
              {transactions.map(transaction => (
                <TransactionItem
                  key={transaction.id}
                  id={transaction.id}
                  type={transaction.type}
                  status={transaction.status}
                  timestamp={transaction.timestamp}
                  fromAddress={transaction.fromAddress}
                  toAddress={transaction.toAddress}
                  amount={transaction.amount}
                  symbol={transaction.symbol}
                  fee={transaction.fee}
                  hash={transaction.hash}
                  blockExplorerUrl={transaction.blockExplorerUrl}
                  onClick={handleTransactionClick}
                />
              ))}
            </div>
          )}
          
          {transactions.length > 0 && (
            <div className="view-all-transactions">
              <Button
                variant="text"
                onClick={() => navigate('/transactions')}
              >
                전체 트랜잭션 보기
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="dashboard-nav">
        <div className="nav">
          <div className="nav-item active">
            <div className="nav-icon">💼</div>
            <div className="nav-label">지갑</div>
          </div>
          <div className="nav-item" onClick={() => navigate('/nft')}>
            <div className="nav-icon">🖼️</div>
            <div className="nav-label">NFT</div>
          </div>
          <div className="nav-item" onClick={() => navigate('/staking')}>
            <div className="nav-icon">📈</div>
            <div className="nav-label">스테이킹</div>
          </div>
          <div className="nav-item" onClick={() => navigate('/defi')}>
            <div className="nav-icon">💰</div>
            <div className="nav-label">DeFi</div>
          </div>
          <div className="nav-item" onClick={() => navigate('/dapps')}>
            <div className="nav-icon">🔍</div>
            <div className="nav-label">dApps</div>
          </div>
          <div className="nav-item" onClick={() => navigate('/settings')}>
            <div className="nav-icon">⚙️</div>
            <div className="nav-label">설정</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
