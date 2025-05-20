import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// 스타일 컴포넌트
const StakingContainer = styled.div`
  padding: 20px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: ${props => props.theme.text};
`;

const StakingOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StakingCard = styled.div`
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

const CardSubValue = styled.div<{ colored?: boolean }>`
  font-size: 14px;
  margin-top: 6px;
  color: ${props => props.colored ? props.theme.success : props.theme.textSecondary};
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 15px;
  width: 100%;
  
  &:hover {
    background-color: ${props => props.theme.primaryHover};
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 30px 0 16px;
  color: ${props => props.theme.text};
`;

const ValidatorsList = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 10px;
  overflow: hidden;
`;

const ValidatorHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 2fr 1fr 1fr 1fr 1fr;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.border};
  font-weight: 600;
  color: ${props => props.theme.textSecondary};
`;

const ValidatorRow = styled.div`
  display: grid;
  grid-template-columns: 40px 2fr 1fr 1fr 1fr 1fr;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.border};
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: ${props => props.theme.rowHover};
  }
`;

const ValidatorIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${props => props.theme.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
`;

const ValidatorName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.text};
`;

const ValidatorCommission = styled.div`
  color: ${props => props.theme.text};
`;

const ValidatorVotingPower = styled.div`
  color: ${props => props.theme.text};
`;

const ValidatorAPR = styled.div`
  color: ${props => props.theme.success};
  font-weight: 500;
`;

const StakeButton = styled.button`
  padding: 6px 12px;
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background-color: ${props => props.theme.primaryHover};
  }
`;

// 스테이킹 컴포넌트
const Staking: React.FC = () => {
  const [stakedAmount, setStakedAmount] = useState<number>(0);
  const [pendingRewards, setPendingRewards] = useState<number>(0);
  const [validators, setValidators] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 데이터 로드 (예시용)
  useEffect(() => {
    // 실제로는 walletAPI에서 데이터를 불러옴
    setTimeout(() => {
      setStakedAmount(250);
      setPendingRewards(3.87);
      
      // 예시 검증인 데이터
      setValidators([
        {
          id: 'val1',
          name: 'CreataNode',
          commission: 5,
          votingPower: '12.5M CTA',
          votingPercent: 15.8,
          apr: 14.2
        },
        {
          id: 'val2',
          name: 'ZenithValidator',
          commission: 3,
          votingPower: '9.8M CTA',
          votingPercent: 12.3,
          apr: 15.1
        },
        {
          id: 'val3',
          name: 'Catena Guardian',
          commission: 6,
          votingPower: '8.2M CTA',
          votingPercent: 10.1,
          apr: 13.8
        },
        {
          id: 'val4',
          name: 'NodeMasters',
          commission: 4,
          votingPower: '6.5M CTA',
          votingPercent: 8.2,
          apr: 14.7
        },
        {
          id: 'val5',
          name: 'BlockForge',
          commission: 4.5,
          votingPower: '5.3M CTA',
          votingPercent: 6.7,
          apr: 14.5
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  // 스테이킹 및 보상 수령 핸들러 (임시)
  const handleStake = () => {
    alert('스테이킹 기능은 개발 중입니다.');
  };
  
  const handleUnstake = () => {
    alert('언스테이킹 기능은 개발 중입니다.');
  };
  
  const handleClaimRewards = () => {
    alert('보상 수령 기능은 개발 중입니다.');
  };
  
  const handleValidatorStake = (validatorId: string) => {
    alert(`${validatorId} 검증인에게 스테이킹 기능은 개발 중입니다.`);
  };

  return (
    <StakingContainer>
      <PageTitle>스테이킹</PageTitle>
      
      <StakingOverview>
        <StakingCard>
          <CardTitle>스테이킹된 CTA</CardTitle>
          <CardValue>{stakedAmount.toLocaleString()} CTA</CardValue>
          <ActionButton onClick={handleStake}>스테이킹</ActionButton>
        </StakingCard>
        
        <StakingCard>
          <CardTitle>스테이킹 수익</CardTitle>
          <CardValue>{pendingRewards.toLocaleString()} CTA</CardValue>
          <CardSubValue colored>약 ${(pendingRewards * 0.876).toFixed(2)}</CardSubValue>
          <ActionButton onClick={handleClaimRewards}>보상 수령</ActionButton>
        </StakingCard>
        
        <StakingCard>
          <CardTitle>현재 스테이킹 APR</CardTitle>
          <CardValue>14.2%</CardValue>
          <CardSubValue>연간 예상 수익: {(stakedAmount * 0.142).toFixed(2)} CTA</CardSubValue>
          <ActionButton onClick={handleUnstake}>언스테이킹</ActionButton>
        </StakingCard>
      </StakingOverview>
      
      <SectionTitle>검증인 목록</SectionTitle>
      
      <ValidatorsList>
        <ValidatorHeader>
          <div></div>
          <div>검증인</div>
          <div>수수료</div>
          <div>투표력</div>
          <div>예상 APR</div>
          <div></div>
        </ValidatorHeader>
        
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
        ) : (
          validators.map(validator => (
            <ValidatorRow key={validator.id}>
              <ValidatorIcon>{validator.name.substring(0, 1)}</ValidatorIcon>
              
              <ValidatorName>{validator.name}</ValidatorName>
              
              <ValidatorCommission>{validator.commission}%</ValidatorCommission>
              
              <ValidatorVotingPower>
                {validator.votingPower} ({validator.votingPercent}%)
              </ValidatorVotingPower>
              
              <ValidatorAPR>{validator.apr}%</ValidatorAPR>
              
              <StakeButton onClick={() => handleValidatorStake(validator.id)}>
                스테이킹
              </StakeButton>
            </ValidatorRow>
          ))
        )}
      </ValidatorsList>
    </StakingContainer>
  );
};

export default Staking;
