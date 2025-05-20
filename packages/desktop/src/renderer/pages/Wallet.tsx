import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

// 스타일 컴포넌트
const WalletContainer = styled.div`
  padding: 20px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: ${props => props.theme.text};
`;

const ActionsContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: ${props => props.theme.primaryHover};
  }
  
  &:disabled {
    background-color: ${props => props.theme.disabled};
    cursor: not-allowed;
  }
`;

const ActionIcon = styled.span`
  margin-right: 8px;
`;

const BalanceCard = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const BalanceTitle = styled.h2`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: ${props => props.theme.textSecondary};
`;

const Balance = styled.div`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 15px;
  color: ${props => props.theme.text};
`;

const Address = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${props => props.theme.inputBackground};
  padding: 10px 15px;
  border-radius: 5px;
  margin-top: 15px;
`;

const AddressText = styled.div`
  font-family: monospace;
  font-size: 14px;
  color: ${props => props.theme.textSecondary};
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.primary};
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.border};
  margin-bottom: 20px;
`;

const TabButton = styled.button<{ active?: boolean }>`
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? props.theme.primary : 'transparent'};
  color: ${props => props.active ? props.theme.primary : props.theme.text};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.primary};
  }
`;

const TransactionsList = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 10px;
  overflow: hidden;
`;

const TransactionHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 80px;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.border};
  font-weight: 600;
  color: ${props => props.theme.textSecondary};
`;

const TransactionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 80px;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.border};
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: ${props => props.theme.rowHover};
  }
`;

const TransactionType = styled.div<{ type: 'send' | 'receive' | 'stake' | 'unstake' | 'swap' }>`
  display: flex;
  align-items: center;
  color: ${props => {
    switch(props.type) {
      case 'send': return props.theme.error;
      case 'receive': return props.theme.success;
      case 'stake': return props.theme.warning;
      case 'unstake': return props.theme.info;
      case 'swap': return props.theme.accent;
      default: return props.theme.text;
    }
  }};
`;

const TransactionIcon = styled.span`
  margin-right: 8px;
`;

const TransactionAddress = styled.div`
  color: ${props => props.theme.text};
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TransactionAmount = styled.div<{ negative?: boolean }>`
  color: ${props => props.negative ? props.theme.error : props.theme.success};
  font-weight: 500;
`;

const TransactionDate = styled.div`
  color: ${props => props.theme.textSecondary};
`;

const TransactionStatus = styled.div<{ status: 'confirmed' | 'pending' | 'failed' }>`
  padding: 4px 8px;
  background-color: ${props => {
    switch(props.status) {
      case 'confirmed': return 'rgba(0, 200, 83, 0.1)';
      case 'pending': return 'rgba(255, 193, 7, 0.1)';
      case 'failed': return 'rgba(244, 67, 54, 0.1)';
      default: return 'transparent';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'confirmed': return props.theme.success;
      case 'pending': return props.theme.warning;
      case 'failed': return props.theme.error;
      default: return props.theme.text;
    }
  }};
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
`;

// 지갑 메인 컴포넌트
const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [balance, setBalance] = useState<number>(0);
  const [address, setAddress] = useState<string>('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 현재 라우트에 따른 활성 탭
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/send')) return 'send';
    if (path.includes('/receive')) return 'receive';
    return 'transactions';
  };
  
  // 탭 변경 핸들러
  const handleTabChange = (tab: string) => {
    if (tab === 'transactions') {
      navigate('/wallet');
    } else {
      navigate(`/wallet/${tab}`);
    }
  };
  
  // 주소 복사 핸들러
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    // 복사 확인 토스트 메시지 표시 (미구현)
    alert('주소가 클립보드에 복사되었습니다.');
  };
  
  // 데이터 로드 (예시용)
  useEffect(() => {
    // 실제로는 walletAPI에서 데이터를 불러옴
    setTimeout(() => {
      setBalance(1250.345);
      setAddress('0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t');
      
      // 예시 트랜잭션 데이터
      setTransactions([
        {
          id: 'tx1',
          type: 'receive',
          from: '0x9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t',
          to: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
          amount: 100,
          token: 'CTA',
          date: '2025-04-10 14:32',
          status: 'confirmed'
        },
        {
          id: 'tx2',
          type: 'send',
          from: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
          to: '0xabcdef1234567890abcdef1234567890abcdef12',
          amount: 25.5,
          token: 'CTA',
          date: '2025-04-08 09:17',
          status: 'confirmed'
        },
        {
          id: 'tx3',
          type: 'stake',
          from: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
          to: 'Validator-123',
          amount: 50,
          token: 'CTA',
          date: '2025-04-02 17:45',
          status: 'confirmed'
        },
        {
          id: 'tx4',
          type: 'swap',
          from: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
          to: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
          amount: 0.5,
          token: 'ETH -> CTA',
          date: '2025-03-28 11:22',
          status: 'confirmed'
        },
        {
          id: 'tx5',
          type: 'send',
          from: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
          to: '0x2468ace02468ace02468ace02468ace02468ace0',
          amount: 10,
          token: 'CTA',
          date: '2025-03-25 14:05',
          status: 'pending'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);
  
  // 트랜잭션 탭 렌더링
  const renderTransactions = () => {
    return (
      <TransactionsList>
        <TransactionHeader>
          <div>유형</div>
          <div>주소</div>
          <div>금액</div>
          <div>날짜</div>
          <div>상태</div>
        </TransactionHeader>
        
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
        ) : (
          transactions.map(tx => (
            <TransactionRow key={tx.id}>
              <TransactionType type={tx.type as any}>
                <TransactionIcon>
                  {tx.type === 'send' && '📤'}
                  {tx.type === 'receive' && '📥'}
                  {tx.type === 'stake' && '🔒'}
                  {tx.type === 'unstake' && '🔓'}
                  {tx.type === 'swap' && '🔄'}
                </TransactionIcon>
                {tx.type === 'send' && '전송'}
                {tx.type === 'receive' && '수신'}
                {tx.type === 'stake' && '스테이킹'}
                {tx.type === 'unstake' && '언스테이킹'}
                {tx.type === 'swap' && '스왑'}
              </TransactionType>
              
              <TransactionAddress>
                {tx.type === 'send' ? tx.to : tx.from}
              </TransactionAddress>
              
              <TransactionAmount negative={tx.type === 'send' || tx.type === 'stake'}>
                {tx.type === 'send' || tx.type === 'stake' ? '-' : '+'}{tx.amount} {tx.token}
              </TransactionAmount>
              
              <TransactionDate>{tx.date}</TransactionDate>
              
              <TransactionStatus status={tx.status as any}>
                {tx.status === 'confirmed' && '완료'}
                {tx.status === 'pending' && '처리중'}
                {tx.status === 'failed' && '실패'}
              </TransactionStatus>
            </TransactionRow>
          ))
        )}
      </TransactionsList>
    );
  };
  
  // 전송 탭 렌더링 (임시 UI)
  const renderSendTab = () => {
    return (
      <div>
        <h2>CTA 전송</h2>
        <p>전송 기능은 개발 중입니다.</p>
      </div>
    );
  };
  
  // 수신 탭 렌더링 (임시 UI)
  const renderReceiveTab = () => {
    return (
      <div>
        <h2>CTA 수신</h2>
        <p>수신 기능은 개발 중입니다.</p>
      </div>
    );
  };

  return (
    <WalletContainer>
      <PageTitle>내 지갑</PageTitle>
      
      <ActionsContainer>
        <ActionButton onClick={() => navigate('/wallet/send')}>
          <ActionIcon>📤</ActionIcon> 전송
        </ActionButton>
        <ActionButton onClick={() => navigate('/wallet/receive')}>
          <ActionIcon>📥</ActionIcon> 수신
        </ActionButton>
      </ActionsContainer>
      
      <BalanceCard>
        <BalanceTitle>총 CTA 잔액</BalanceTitle>
        <Balance>{balance.toLocaleString()} CTA</Balance>
        <Address>
          <AddressText>{address}</AddressText>
          <CopyButton onClick={handleCopyAddress}>복사</CopyButton>
        </Address>
      </BalanceCard>
      
      <TabsContainer>
        <TabButton 
          active={getActiveTab() === 'transactions'} 
          onClick={() => handleTabChange('transactions')}
        >
          트랜잭션
        </TabButton>
        <TabButton 
          active={getActiveTab() === 'send'} 
          onClick={() => handleTabChange('send')}
        >
          전송
        </TabButton>
        <TabButton 
          active={getActiveTab() === 'receive'} 
          onClick={() => handleTabChange('receive')}
        >
          수신
        </TabButton>
      </TabsContainer>
      
      <Routes>
        <Route path="/" element={renderTransactions()} />
        <Route path="/send" element={renderSendTab()} />
        <Route path="/receive" element={renderReceiveTab()} />
      </Routes>
    </WalletContainer>
  );
};

export default Wallet;
