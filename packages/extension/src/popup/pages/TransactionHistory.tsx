import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import NetworkSelector from '../components/wallet/NetworkSelector';
import AccountSelector from '../components/wallet/AccountSelector';
import TransactionItem from '../components/wallet/TransactionItem';

/**
 * 트랜잭션 히스토리 페이지 컴포넌트
 * 
 * 선택한 계정의 모든 트랜잭션 내역을 조회하고 필터링할 수 있는 페이지입니다.
 */
const TransactionHistory: React.FC = () => {
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
  
  // 필터 상태
  const [filter, setFilter] = useState<{
    type: string;
    status: string;
    dateFrom: string;
    dateTo: string;
  }>({
    type: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
  });
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  
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
          
          // 트랜잭션 목록 (더 많은 트랜잭션 데이터 생성)
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
            {
              id: 'tx4',
              type: 'stake' as const,
              status: 'confirmed' as const,
              timestamp: Date.now() - 345600000, // 4일 전
              fromAddress: '0x1234567890123456789012345678901234567890',
              toAddress: '0x4567890123456789012345678901234567890123',
              amount: '100',
              symbol: 'CTA',
              fee: '0.001 CTA',
              hash: '0x6543210987654321098765432109876543210987',
              blockExplorerUrl: 'https://catena.explorer.creatachain.com/tx/0x6543210987654321098765432109876543210987',
            },
            {
              id: 'tx5',
              type: 'unstake' as const,
              status: 'pending' as const,
              timestamp: Date.now() - 432000000, // 5일 전
              fromAddress: '0x4567890123456789012345678901234567890123',
              toAddress: '0x1234567890123456789012345678901234567890',
              amount: '50',
              symbol: 'CTA',
              hash: '0x5432109876543210987654321098765432109876',
              blockExplorerUrl: 'https://catena.explorer.creatachain.com/tx/0x5432109876543210987654321098765432109876',
            },
            {
              id: 'tx6',
              type: 'approve' as const,
              status: 'confirmed' as const,
              timestamp: Date.now() - 518400000, // 6일 전
              fromAddress: '0x1234567890123456789012345678901234567890',
              toAddress: '0x5678901234567890123456789012345678901234',
              amount: 'unlimited',
              symbol: 'USDT',
              fee: '0.001 CTA',
              hash: '0x4321098765432109876543210987654321098765',
              blockExplorerUrl: 'https://catena.explorer.creatachain.com/tx/0x4321098765432109876543210987654321098765',
            },
            {
              id: 'tx7',
              type: 'send' as const,
              status: 'failed' as const,
              timestamp: Date.now() - 604800000, // 7일 전
              fromAddress: '0x1234567890123456789012345678901234567890',
              toAddress: '0x6789012345678901234567890123456789012345',
              amount: '200',
              symbol: 'CTA',
              fee: '0.001 CTA',
              hash: '0x3210987654321098765432109876543210987654',
              blockExplorerUrl: 'https://catena.explorer.creatachain.com/tx/0x3210987654321098765432109876543210987654',
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
  
  // 새 트랜잭션 로드
  useEffect(() => {
    // 새 트랜잭션을 로드하는 함수
    // 실제 구현에서는 선택된 계정, 네트워크에 따라 트랜잭션을 가져옴
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        
        // 백그라운드 스크립트에 데이터 요청
        // 실제 구현에서는 chrome.runtime.sendMessage 사용
        
        // 실제 구현 시 여기에 코드 추가
        
        // 현재는 임시 구현이므로 로딩만 종료
        setIsLoading(false);
      } catch (error) {
        console.error('트랜잭션 로드 오류:', error);
        setIsLoading(false);
      }
    };
    
    // 계정이나 네트워크가 바뀔 때만 트랜잭션 다시 로드
    if (selectedAccount && selectedNetwork) {
      loadTransactions();
    }
  }, [selectedAccount, selectedNetwork]);
  
  // 계정 선택 처리
  const handleSelectAccount = (address: string) => {
    setSelectedAccount(address);
    // 선택된 계정에 따른 트랜잭션 업데이트
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
    // 선택된 네트워크에 따른 트랜잭션 업데이트
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
  
  // 트랜잭션 선택 처리
  const handleTransactionClick = (transactionId: string) => {
    // 트랜잭션 상세 페이지로 이동
    navigate(`/transaction/${transactionId}`);
  };
  
  // 필터 변경 처리
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // 필터 변경 시 첫 페이지로 돌아감
    setCurrentPage(1);
  };
  
  // 대시보드로 돌아가기
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  // 필터링된 트랜잭션 가져오기
  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
    // 타입 필터
    if (filter.type !== 'all') {
      filtered = filtered.filter(tx => tx.type === filter.type);
    }
    
    // 상태 필터
    if (filter.status !== 'all') {
      filtered = filtered.filter(tx => tx.status === filter.status);
    }
    
    // 날짜 필터 (시작)
    if (filter.dateFrom) {
      const fromDate = new Date(filter.dateFrom).getTime();
      filtered = filtered.filter(tx => tx.timestamp >= fromDate);
    }
    
    // 날짜 필터 (종료)
    if (filter.dateTo) {
      const toDate = new Date(filter.dateTo).getTime() + 86400000; // 선택한 날짜의 끝까지 (하루 추가)
      filtered = filtered.filter(tx => tx.timestamp <= toDate);
    }
    
    return filtered;
  };
  
  // 페이지네이션된 트랜잭션 가져오기
  const getPaginatedTransactions = () => {
    const filtered = getFilteredTransactions();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };
  
  // 총 페이지 수 계산
  const totalPages = Math.ceil(getFilteredTransactions().length / itemsPerPage);
  
  // 페이지 변경 처리
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // 로딩 중인 경우 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="transaction-history-page page">
        <Loading text="트랜잭션을 불러오는 중..." />
      </div>
    );
  }
  
  return (
    <div className="transaction-history-page page">
      <div className="history-header">
        <Button
          variant="text"
          onClick={handleBackToDashboard}
          className="back-button"
        >
          ← 뒤로
        </Button>
        <h1 className="page-title">트랜잭션 내역</h1>
      </div>
      
      <div className="history-content">
        <div className="history-selectors">
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
        
        <Card className="filter-card">
          <div className="filter-title">필터</div>
          <div className="filter-form">
            <div className="filter-row">
              <div className="filter-field">
                <label htmlFor="type">타입</label>
                <select
                  id="type"
                  name="type"
                  value={filter.type}
                  onChange={handleFilterChange}
                >
                  <option value="all">전체</option>
                  <option value="send">전송</option>
                  <option value="receive">수신</option>
                  <option value="swap">스왑</option>
                  <option value="stake">스테이킹</option>
                  <option value="unstake">언스테이킹</option>
                  <option value="approve">승인</option>
                </select>
              </div>
              
              <div className="filter-field">
                <label htmlFor="status">상태</label>
                <select
                  id="status"
                  name="status"
                  value={filter.status}
                  onChange={handleFilterChange}
                >
                  <option value="all">전체</option>
                  <option value="pending">대기 중</option>
                  <option value="confirmed">확인됨</option>
                  <option value="failed">실패</option>
                </select>
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-field">
                <label htmlFor="dateFrom">시작 날짜</label>
                <input
                  type="date"
                  id="dateFrom"
                  name="dateFrom"
                  value={filter.dateFrom}
                  onChange={handleFilterChange}
                />
              </div>
              
              <div className="filter-field">
                <label htmlFor="dateTo">종료 날짜</label>
                <input
                  type="date"
                  id="dateTo"
                  name="dateTo"
                  value={filter.dateTo}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </div>
        </Card>
        
        <div className="transactions-container">
          {getFilteredTransactions().length === 0 ? (
            <Card className="no-transactions-card">
              <div className="no-transactions">
                <div className="no-transactions-icon">📝</div>
                <h3 className="no-transactions-title">트랜잭션 없음</h3>
                <p className="no-transactions-message">
                  선택한 필터에 맞는 트랜잭션이 없습니다.
                </p>
              </div>
            </Card>
          ) : (
            <div className="transactions-list">
              {getPaginatedTransactions().map(transaction => (
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
          
          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="pagination">
              <Button
                variant="text"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                이전
              </Button>
              
              <div className="page-info">
                {currentPage} / {totalPages}
              </div>
              
              <Button
                variant="text"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                다음
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;