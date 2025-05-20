import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// 스타일 컴포넌트
const DashboardContainer = styled.div`
  padding: 20px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: ${props => props.theme.text};
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const Card = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  color: ${props => props.theme.textSecondary};
`;

const CardValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.text};
`;

const CardSubValue = styled.div<{ positive?: boolean }>`
  font-size: 14px;
  margin-top: 6px;
  color: ${props => props.positive ? props.theme.success : props.theme.error};
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 30px 0 16px;
  color: ${props => props.theme.text};
`;

const TokenList = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 30px;
`;

const TokenHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 2fr 1fr 1fr 1fr;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.border};
  font-weight: 600;
  color: ${props => props.theme.textSecondary};
`;

const TokenRow = styled.div`
  display: grid;
  grid-template-columns: 40px 2fr 1fr 1fr 1fr;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.border};
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: ${props => props.theme.rowHover};
  }
`;

const TokenIcon = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
`;

const TokenNameWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const TokenName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.text};
`;

const TokenSymbol = styled.div`
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
`;

const TokenPrice = styled.div`
  color: ${props => props.theme.text};
`;

const TokenChange = styled.div<{ positive?: boolean }>`
  color: ${props => props.positive ? props.theme.success : props.theme.error};
`;

const TokenBalance = styled.div`
  color: ${props => props.theme.text};
  font-weight: 500;
`;

// 대시보드 컴포넌트
const Dashboard: React.FC = () => {
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [balanceChange, setBalanceChange] = useState<number>(0);
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 데이터 로드 (예시용)
  useEffect(() => {
    // 실제로는 walletAPI에서 데이터를 불러옴
    setTimeout(() => {
      setTotalBalance(5432.87);
      setBalanceChange(3.2);
      
      // 예시 토큰 데이터
      setTokens([
        {
          id: 'cta',
          name: 'Creata',
          symbol: 'CTA',
          icon: 'assets/tokens/cta.png',
          price: 0.876,
          change: 2.45,
          balance: 1250,
          value: 1095.0
        },
        {
          id: 'eth',
          name: 'Ethereum',
          symbol: 'ETH',
          icon: 'assets/tokens/eth.png',
          price: 2534.12,
          change: -0.87,
          balance: 1.2,
          value: 3040.94
        },
        {
          id: 'bnb',
          name: 'Binance Coin',
          symbol: 'BNB',
          icon: 'assets/tokens/bnb.png',
          price: 324.65,
          change: 1.32,
          balance: 4,
          value: 1298.6
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <DashboardContainer>
      <PageTitle>대시보드</PageTitle>
      
      <CardsContainer>
        <Card>
          <CardTitle>총 자산 가치</CardTitle>
          <CardValue>${totalBalance.toLocaleString()}</CardValue>
          <CardSubValue positive={balanceChange > 0}>
            {balanceChange > 0 ? '▲' : '▼'} {Math.abs(balanceChange)}% (24h)
          </CardSubValue>
        </Card>
        
        <Card>
          <CardTitle>스테이킹 수익</CardTitle>
          <CardValue>$128.43</CardValue>
          <CardSubValue positive>+14.2% APY</CardSubValue>
        </Card>
        
        <Card>
          <CardTitle>Creata 가격</CardTitle>
          <CardValue>$0.876</CardValue>
          <CardSubValue positive>▲ 2.45% (24h)</CardSubValue>
        </Card>
      </CardsContainer>
      
      <SectionTitle>자산 목록</SectionTitle>
      
      <TokenList>
        <TokenHeader>
          <div></div>
          <div>자산</div>
          <div>가격</div>
          <div>변동 (24h)</div>
          <div>잔액</div>
        </TokenHeader>
        
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
        ) : (
          tokens.map(token => (
            <TokenRow key={token.id}>
              <TokenIcon src={token.icon} alt={token.symbol} />
              
              <TokenNameWrapper>
                <TokenName>{token.name}</TokenName>
                <TokenSymbol>{token.symbol}</TokenSymbol>
              </TokenNameWrapper>
              
              <TokenPrice>${token.price.toLocaleString()}</TokenPrice>
              
              <TokenChange positive={token.change > 0}>
                {token.change > 0 ? '▲' : '▼'} {Math.abs(token.change)}%
              </TokenChange>
              
              <TokenBalance>
                {token.balance} {token.symbol} (${token.value.toLocaleString()})
              </TokenBalance>
            </TokenRow>
          ))
        )}
      </TokenList>
    </DashboardContainer>
  );
};

export default Dashboard;
