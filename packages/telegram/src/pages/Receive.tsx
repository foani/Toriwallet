import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTelegramConnection } from '../services/tg-connection';
import webApp from '../telegram-api/webApp';

// 스타일 컴포넌트
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 16px;
  color: ${props => props.theme.text};
`;

const Card = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 12px;
  padding: 20px;
  box-shadow: ${props => props.theme.shadow};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const QRCodeContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  width: 220px;
  height: 220px;
  margin: 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

// QR 코드 표현을 위한 임시 컴포넌트
const PlaceholderQR = styled.div`
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    black,
    black 10px,
    white 10px,
    white 20px
  );
`;

const AddressContainer = styled.div`
  width: 100%;
  position: relative;
  margin: 16px 0;
`;

const Address = styled.div`
  background-color: ${props => props.theme.background};
  border-radius: 8px;
  padding: 12px;
  font-family: monospace;
  font-size: 14px;
  color: ${props => props.theme.text};
  word-break: break-all;
  text-align: center;
`;

const CopyButton = styled.button`
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  margin-top: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover, &:active {
    background-color: ${props => props.theme.primary}CC;
  }
`;

const ShareButton = styled(CopyButton)`
  background-color: ${props => props.theme.secondary};
  margin-top: 8px;
`;

const Instruction = styled.p`
  font-size: 14px;
  color: ${props => props.theme.textSecondary};
  text-align: center;
  margin: 16px 0;
  line-height: 1.6;
`;

// 수신 컴포넌트
const Receive: React.FC = () => {
  const { wallet } = useTelegramConnection();
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  // 주소 복사 처리
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    webApp.hapticFeedback('medium');
    webApp.showAlert('주소가 클립보드에 복사되었습니다.');
  };
  
  // 주소 공유 처리
  const handleShareAddress = () => {
    // 텔레그램 메시지 공유
    const message = `아래 주소로 CTA를 전송해주세요:\n\n${walletAddress}`;
    webApp.showPopup({
      title: '주소 공유',
      message: '어떤 방법으로 주소를 공유하시겠습니까?',
      buttons: [
        { id: 'telegram', text: '텔레그램으로 공유' },
        { id: 'other', text: '다른 앱으로 공유' },
        { id: 'cancel', text: '취소', type: 'cancel' }
      ]
    }, (buttonId) => {
      if (buttonId === 'telegram') {
        // 텔레그램 내부 공유 처리
        webApp.sendData({
          action: 'share_address',
          address: walletAddress
        });
      } else if (buttonId === 'other') {
        // 임시 메시지
        webApp.showAlert('다른 앱으로 공유하는 기능은 개발 중입니다.');
      }
    });
  };
  
  // 초기 로드
  useEffect(() => {
    if (wallet && wallet.address) {
      setWalletAddress(wallet.address);
    } else {
      // 예시 주소 (실제로는 서버에서 가져와야 함)
      setWalletAddress('0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t');
    }
    
    // 메인 버튼 설정
    webApp.setupMainButton('주소 복사', handleCopyAddress);
    
    return () => {
      webApp.hideMainButton();
    };
  }, [wallet]);
  
  return (
    <Container>
      <Title>CTA 받기</Title>
      
      <Card>
        <Instruction>
          아래 QR 코드 또는 주소를 통해 CTA를 받을 수 있습니다.
        </Instruction>
        
        <QRCodeContainer>
          {/* 실제 구현에서는 QR 코드 라이브러리 사용 */}
          <PlaceholderQR />
        </QRCodeContainer>
        
        <AddressContainer>
          <Address>
            {walletAddress}
          </Address>
        </AddressContainer>
        
        <CopyButton onClick={handleCopyAddress}>
          📋 주소 복사
        </CopyButton>
        
        <ShareButton onClick={handleShareAddress}>
          📤 주소 공유
        </ShareButton>
        
        <Instruction>
          이 주소는 CreataChain 네트워크의 Catena Chain에서만 유효합니다. 다른 네트워크의 코인을 이 주소로 보내면 복구가 불가능합니다.
        </Instruction>
      </Card>
    </Container>
  );
};

export default Receive;
