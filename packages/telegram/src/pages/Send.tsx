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

const Card = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 12px;
  padding: 20px;
  box-shadow: ${props => props.theme.shadow};
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 16px;
  color: ${props => props.theme.text};
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: ${props => props.theme.textSecondary};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.border};
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 16px;
  outline: none;
  
  &:focus {
    border-color: ${props => props.theme.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme.textSecondary}80;
  }
`;

const AmountInput = styled.div`
  position: relative;
  
  input {
    padding-right: 60px;
  }
`;

const CurrencySymbol = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.textSecondary};
  font-weight: 500;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.border};
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  font-size: 16px;
  min-height: 80px;
  resize: none;
  outline: none;
  
  &:focus {
    border-color: ${props => props.theme.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme.textSecondary}80;
  }
`;

const Button = styled.button`
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 24px;
  padding: 16px;
  font-size: 16px;
  font-weight: bold;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:disabled {
    background-color: ${props => props.theme.textSecondary}50;
    cursor: not-allowed;
  }
  
  &:not(:disabled):hover, &:not(:disabled):active {
    background-color: ${props => props.theme.primary}CC;
  }
`;

const QrButton = styled.button`
  background-color: transparent;
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.primary};
`;

const AddressInput = styled.div`
  position: relative;
  
  input {
    padding-right: 44px;
  }
`;

const Balance = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 14px;
`;

const BalanceLabel = styled.span`
  color: ${props => props.theme.textSecondary};
`;

const BalanceValue = styled.span`
  color: ${props => props.theme.text};
  font-weight: 500;
`;

const MaxButton = styled.button`
  background-color: ${props => props.theme.primary}20;
  color: ${props => props.theme.primary};
  border: none;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
  cursor: pointer;
`;

const RecipientOptions = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const RecipientOption = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  background-color: ${props => props.active ? props.theme.primary : 'transparent'};
  color: ${props => props.active ? props.theme.buttonText : props.theme.text};
  border: 1px solid ${props => props.active ? props.theme.primary : props.theme.border};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.primary};
  }
`;

// Tx 수수료 섹션
const FeeSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${props => props.theme.border};
`;

const FeeRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
`;

const FeeLabel = styled.span`
  color: ${props => props.theme.textSecondary};
`;

const FeeValue = styled.span`
  color: ${props => props.theme.text};
  font-weight: 500;
`;

const TotalRow = styled(FeeRow)`
  font-size: 16px;
  font-weight: bold;
  margin-top: 16px;
  border-top: 1px dashed ${props => props.theme.border};
  padding-top: 16px;
`;

// 송금 컴포넌트
const Send: React.FC = () => {
  const { wallet } = useTelegramConnection();
  const navigate = useNavigate();
  
  // 폼 상태
  const [recipientType, setRecipientType] = useState<'address' | 'username'>('address');
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 수수료 관련 상태
  const [fee, setFee] = useState<number>(0.001); // 예상 수수료
  const [exchangeRate, setExchangeRate] = useState<number>(0.876); // CTA/USD 환율
  
  // 입력값 유효성 검사
  const isValidRecipient = () => {
    if (recipientType === 'address') {
      // 주소 형식 검사 (간단한 예)
      return /^0x[a-fA-F0-9]{40}$/.test(recipient);
    } else {
      // 텔레그램 사용자명 형식 검사
      return /^[a-zA-Z0-9_]{5,32}$/.test(recipient);
    }
  };
  
  const isValidAmount = () => {
    const amountNum = parseFloat(amount);
    return !isNaN(amountNum) && amountNum > 0 && amountNum <= balance;
  };
  
  const canSend = () => {
    return isValidRecipient() && isValidAmount();
  };
  
  // 잔액 조회
  const fetchBalance = async () => {
    try {
      const balanceData = await telegramClient.getBalance();
      setBalance(balanceData.balance);
    } catch (error) {
      console.error('잔액 조회 실패:', error);
      webApp.showAlert('잔액 조회에 실패했습니다.');
    }
  };
  
  // 초기 로드
  useEffect(() => {
    fetchBalance();
    
    // 메인 버튼 설정
    webApp.setupMainButton('전송하기', handleSend);
    
    return () => {
      webApp.hideMainButton();
    };
  }, []);
  
  // 메인 버튼 업데이트
  useEffect(() => {
    if (canSend()) {
      webApp.setupMainButton('전송하기', handleSend);
    } else {
      webApp.hideMainButton();
    }
  }, [recipient, amount, recipientType]);
  
  // 최대 금액 설정
  const handleSetMaxAmount = () => {
    // 잔액에서 수수료를 제외한 금액
    const maxAmount = Math.max(0, balance - fee);
    setAmount(maxAmount.toString());
  };
  
  // QR 코드 스캔 처리
  const handleScanQR = () => {
    webApp.showAlert('QR 코드 스캔 기능은 현재 개발 중입니다.');
  };
  
  // 전송 처리
  const handleSend = async () => {
    if (!canSend()) return;
    
    // 전송 확인
    webApp.showConfirm(
      `${amount} CTA를 ${recipientType === 'address' ? recipient : '@' + recipient}에게 전송하시겠습니까?`,
      async (confirmed) => {
        if (!confirmed) return;
        
        setIsLoading(true);
        webApp.setupMainButton('처리 중...', () => {}, { showProgress: true });
        
        try {
          // 송금 요청
          const txData = {
            recipientType,
            recipient,
            amount: parseFloat(amount),
            memo,
            network: 'catena'
          };
          
          // P2P 송금 또는 일반 송금
          let result;
          if (recipientType === 'username') {
            // 텔레그램 사용자에게 송금
            result = await telegramClient.sendP2PPayment(recipient, parseFloat(amount), memo);
          } else {
            // 블록체인 주소로 송금
            result = await telegramClient.sendTransaction(txData);
          }
          
          // 성공 시 처리
          webApp.hapticFeedback('success');
          webApp.showPopup(
            '송금이 정상적으로 처리되었습니다.',
            '송금 완료',
            [{ text: '확인', type: 'default' }],
            () => {
              navigate('/');
            }
          );
        } catch (error) {
          console.error('송금 실패:', error);
          webApp.hapticFeedback('error');
          webApp.showAlert('송금에 실패했습니다. 다시 시도해주세요.');
        } finally {
          setIsLoading(false);
          webApp.hideMainButton();
        }
      }
    );
  };
  
  return (
    <Container>
      <Title>CTA 전송</Title>
      
      <Card>
        {/* 수신자 옵션 선택 */}
        <RecipientOptions>
          <RecipientOption
            active={recipientType === 'address'}
            onClick={() => setRecipientType('address')}
          >
            주소로 전송
          </RecipientOption>
          <RecipientOption
            active={recipientType === 'username'}
            onClick={() => setRecipientType('username')}
          >
            사용자에게 전송
          </RecipientOption>
        </RecipientOptions>
        
        {/* 수신자 입력 */}
        <FormGroup>
          <Label>
            {recipientType === 'address' ? '수신자 주소' : '텔레그램 사용자명'}
          </Label>
          <AddressInput>
            <Input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={recipientType === 'address' 
                ? 'CTA 주소를 입력하세요 (0x...)' 
                : '사용자명을 입력하세요 (@없이)'}
            />
            {recipientType === 'address' && (
              <QrButton onClick={handleScanQR}>
                📷
              </QrButton>
            )}
          </AddressInput>
        </FormGroup>
        
        {/* 금액 입력 */}
        <FormGroup>
          <Label>금액</Label>
          <Balance>
            <BalanceLabel>잔액: <BalanceValue>{balance.toFixed(4)} CTA</BalanceValue></BalanceLabel>
            <MaxButton onClick={handleSetMaxAmount}>최대</MaxButton>
          </Balance>
          <AmountInput>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.0001"
              min="0"
              max={balance.toString()}
            />
            <CurrencySymbol>CTA</CurrencySymbol>
          </AmountInput>
        </FormGroup>
        
        {/* 메모 입력 */}
        <FormGroup>
          <Label>메모 (선택사항)</Label>
          <TextArea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="송금 메모를 입력하세요"
            maxLength={100}
          />
        </FormGroup>
        
        {/* 수수료 정보 */}
        <FeeSection>
          <FeeRow>
            <FeeLabel>예상 수수료:</FeeLabel>
            <FeeValue>{fee.toFixed(4)} CTA (${(fee * exchangeRate).toFixed(2)})</FeeValue>
          </FeeRow>
          <FeeRow>
            <FeeLabel>송금액:</FeeLabel>
            <FeeValue>{parseFloat(amount || '0').toFixed(4)} CTA</FeeValue>
          </FeeRow>
          <TotalRow>
            <FeeLabel>총 금액:</FeeLabel>
            <FeeValue>{(parseFloat(amount || '0') + fee).toFixed(4)} CTA</FeeValue>
          </TotalRow>
        </FeeSection>
        
        {/* 모바일에서 직접 버튼을 표시하고 싶을 때 사용 */}
        <Button
          onClick={handleSend}
          disabled={!canSend() || isLoading}
        >
          {isLoading ? '처리 중...' : '전송하기'}
        </Button>
      </Card>
    </Container>
  );
};

export default Send;
