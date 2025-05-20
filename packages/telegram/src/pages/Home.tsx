import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import webApp from '../telegram-api/webApp';
import { useTelegramConnection } from '../services/tg-connection';
import telegramClient from '../telegram-api/client';

// 스타일 컴포넌트
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const WelcomeCard = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 12px;
  padding: 20px;
  box-shadow: ${props => props.theme.shadow};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const WelcomeTitle = styled.h1`
  font-size: 20px;
  margin-bottom: 8px;
  color: ${props => props.theme.text};
`;

const WelcomeMessage = styled.p`
  color: ${props => props.theme.textSecondary};
  margin-bottom: 16px;
  font-size: 14px;
`;

const Button = styled.button`
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 24px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: bold;
  margin-top: 16px;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover, &:active {
    background-color: ${props => props.theme.primary}CC;
  }
`;

const BalanceCard = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 12px;
  padding: 20px;
  box-shadow: ${props => props.theme.shadow};
`;

const BalanceLabel = styled.p`
  color: ${props => props.theme.textSecondary};
  font-size: 14px;
  margin-bottom: 8px;
`;

const BalanceAmount = styled.h2`
  font-size: 32px;
  margin-bottom: 4px;
  font-weight: bold;
  color: ${props => props.theme.text};
`;

const BalanceUsd = styled.p`
  color: ${props => props.theme.textSecondary};
  font-size: 14px;
  margin-bottom: 16px;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  
  &:hover, &:active {
    background-color: ${props => props.theme.primary}CC;
  }
`;

const TransactionsTitle = styled.h3`
  font-size: 18px;
  margin: 16px 0;
  color: ${props => props.theme.text};
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TransactionCard = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 12px;
  padding: 16px;
  box-shadow: ${props => props.theme.shadow};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TransactionInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const TransactionType = styled.span<{ type: 'send' | 'receive' }>`
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  
  &::before {
    content: ${props => props.type === 'send' ? '"📤"' : '"📥"'};
    margin-right: 8px;
  }
`;

const TransactionDate = styled.span`
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
`;

const TransactionAmount = styled.span<{ type: 'send' | 'receive' }>`
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.type === 'send' ? props.theme.error : props.theme.success};
`;

const EmptyTransactions = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: ${props => props.theme.textSecondary};
`;

// 메인 홈 컴포넌트
const Home: React.FC = () => {
  const { user, wallet, refreshWallet } = useTelegramConnection();
  const navigate = useNavigate();
  
  const [balance, setBalance] = useState<number>(0);
  const [balanceUsd, setBalanceUsd] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 지갑 데이터 로드
  const loadWalletData = async () => {
    setLoading(true);
    try {
      // 이미 지갑 정보가 있는 경우
      if (wallet) {
        // 잔액 조회
        const balanceData = await telegramClient.getBalance();
        setBalance(balanceData.balance);
        setBalanceUsd(balanceData.balanceUsd);
        
        // 트랜잭션 내역 조회
        const txListData = await telegramClient.getTransactions(1, 5);
        setTransactions(txListData);
      }
    } catch (error) {
      console.error('지갑 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 초기 로드
  useEffect(() => {
    loadWalletData();
  }, [wallet]);
  
  // 화면 새로고침 처리
  const handleRefresh = async () => {
    await refreshWallet();
    await loadWalletData();
    webApp.hapticFeedback('medium');
  };
  
  // 지갑 생성 처리
  const handleCreateWallet = async () => {
    webApp.showAlert('지갑 생성 기능은 현재 개발 중입니다.');
  };
  
  // 지갑 가져오기 처리
  const handleImportWallet = async () => {
    webApp.showAlert('지갑 가져오기 기능은 현재 개발 중입니다.');
  };
  
  // 보내기/받기 버튼 처리
  const handleSend = () => {
    navigate('/send');
  };
  
  const handleReceive = () => {
    navigate('/receive');
  };
  
  // 트랜잭션 클릭 처리
  const handleTransactionClick = (txHash: string) => {
    webApp.showAlert(`트랜잭션 상세 정보: ${txHash}`);
  };
  
  // 날짜 포맷팅 함수
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 지갑이 없는 경우 환영 화면 표시
  if (!wallet) {
    return (
      <Container>
        <WelcomeCard>
          <WelcomeTitle>TORI 지갑에 오신 것을 환영합니다!</WelcomeTitle>
          <WelcomeMessage>
            CreataChain 기반의 암호화폐 지갑을 텔레그램에서 바로 사용하세요. 지갑을 생성하거나 기존 지갑을 가져올 수 있습니다.
          </WelcomeMessage>
          <Button onClick={handleCreateWallet}>
            새 지갑 만들기
          </Button>
          <Button onClick={handleImportWallet} style={{ backgroundColor: 'transparent', color: '#0088CC' }}>
            기존 지갑 가져오기
          </Button>
        </WelcomeCard>
      </Container>
    );
  }
  
  return (
    <Container>
      {/* 잔액 카드 */}
      <BalanceCard>
        <BalanceLabel>총 잔액</BalanceLabel>
        <BalanceAmount>{balance.toFixed(4)} CTA</BalanceAmount>
        <BalanceUsd>≈ ${balanceUsd.toFixed(2)} USD</BalanceUsd>
        
        <ActionButtons>
          <ActionButton onClick={handleSend}>
            <span>📤</span> 보내기
          </ActionButton>
          <ActionButton onClick={handleReceive}>
            <span>📥</span> 받기
          </ActionButton>
        </ActionButtons>
      </BalanceCard>
      
      {/* 트랜잭션 목록 */}
      <TransactionsTitle>최근 트랜잭션</TransactionsTitle>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>
      ) : transactions.length > 0 ? (
        <TransactionsList>
          {transactions.map((tx) => (
            <TransactionCard key={tx.id} onClick={() => handleTransactionClick(tx.hash)}>
              <TransactionInfo>
                <TransactionType type={tx.direction}>
                  {tx.direction === 'send' ? '보냄' : '받음'}
                </TransactionType>
                <TransactionDate>{formatDate(tx.timestamp)}</TransactionDate>
              </TransactionInfo>
              <TransactionAmount type={tx.direction}>
                {tx.direction === 'send' ? '-' : '+'}{tx.amount} CTA
              </TransactionAmount>
            </TransactionCard>
          ))}
        </TransactionsList>
      ) : (
        <EmptyTransactions>
          트랜잭션 내역이 없습니다.
        </EmptyTransactions>
      )}
    </Container>
  );
};

export default Home;
