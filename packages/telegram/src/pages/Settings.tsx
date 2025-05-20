import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTelegramConnection } from '../services/tg-connection';
import webApp from '../telegram-api/webApp';
import notificationsApi from '../telegram-api/notifications';

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
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  margin-bottom: 16px;
  color: ${props => props.theme.text};
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${props => props.theme.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.span`
  color: ${props => props.theme.text};
  font-size: 14px;
  font-weight: 500;
`;

const Description = styled.span`
  color: ${props => props.theme.textSecondary};
  font-size: 12px;
  margin-top: 4px;
`;

const Toggle = styled.div<{ active: boolean }>`
  width: 48px;
  height: 24px;
  background-color: ${props => (props.active ? props.theme.primary : props.theme.textSecondary)}4D;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    left: ${props => (props.active ? '26px' : '2px')};
    top: 2px;
    width: 20px;
    height: 20px;
    background-color: ${props => (props.active ? props.theme.primary : props.theme.textSecondary)};
    border-radius: 50%;
    transition: left 0.2s ease;
  }
`;

const Button = styled.button`
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  margin: 8px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover, &:active {
    background-color: ${props => props.theme.primary}CC;
  }
`;

const DangerButton = styled(Button)`
  background-color: ${props => props.theme.error};
  
  &:hover, &:active {
    background-color: ${props => props.theme.error}CC;
  }
`;

const WalletInfoCard = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 12px;
  padding: 20px;
  box-shadow: ${props => props.theme.shadow};
  margin-bottom: 16px;
`;

const WalletInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const WalletInfoLabel = styled.span`
  color: ${props => props.theme.textSecondary};
  font-size: 12px;
`;

const WalletInfoValue = styled.span`
  color: ${props => props.theme.text};
  font-size: 14px;
  font-weight: 500;
  word-break: break-all;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${props => props.theme.primary};
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const UserName = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserFullName = styled.span`
  color: ${props => props.theme.text};
  font-size: 16px;
  font-weight: 500;
`;

const UserUsername = styled.span`
  color: ${props => props.theme.textSecondary};
  font-size: 12px;
`;

const Version = styled.div`
  text-align: center;
  margin-top: 32px;
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
`;

// 설정 페이지 컴포넌트
const Settings: React.FC = () => {
  const { user, wallet } = useTelegramConnection();
  
  // 설정 상태
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [transactionNotifications, setTransactionNotifications] = useState(true);
  const [priceAlertNotifications, setPriceAlertNotifications] = useState(true);
  const [securityNotifications, setSecurityNotifications] = useState(true);
  
  // 설정 초기화
  useEffect(() => {
    // 알림 설정 로드
    const loadNotificationSettings = async () => {
      try {
        const settings = await notificationsApi.getNotificationSettings();
        setNotificationEnabled(settings.enabled ?? true);
        setTransactionNotifications(settings.transaction ?? true);
        setPriceAlertNotifications(settings.price_alert ?? true);
        setSecurityNotifications(settings.security ?? true);
      } catch (error) {
        console.error('알림 설정 로드 실패:', error);
      }
    };
    
    loadNotificationSettings();
  }, []);
  
  // 알림 설정 업데이트
  const updateNotificationSettings = async () => {
    try {
      await notificationsApi.updateNotificationSettings({
        transaction: transactionNotifications,
        price_alert: priceAlertNotifications,
        security: securityNotifications,
      });
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error);
      webApp.showAlert('알림 설정 업데이트에 실패했습니다.');
    }
  };
  
  // 토글 핸들러
  const handleToggleNotification = () => {
    const newValue = !notificationEnabled;
    setNotificationEnabled(newValue);
    updateNotificationSettings();
  };
  
  const handleToggleTransactionNotifications = () => {
    const newValue = !transactionNotifications;
    setTransactionNotifications(newValue);
    updateNotificationSettings();
  };
  
  const handleTogglePriceAlertNotifications = () => {
    const newValue = !priceAlertNotifications;
    setPriceAlertNotifications(newValue);
    updateNotificationSettings();
  };
  
  const handleToggleSecurityNotifications = () => {
    const newValue = !securityNotifications;
    setSecurityNotifications(newValue);
    updateNotificationSettings();
  };
  
  // 지갑 백업 핸들러
  const handleBackupWallet = () => {
    webApp.showPopup({
      title: '지갑 백업',
      message: '지갑을 백업하는 방법을 선택하세요:',
      buttons: [
        { id: 'seed', text: '시드 구문 보기' },
        { id: 'export', text: '키스토어 내보내기' },
        { id: 'cancel', text: '취소', type: 'cancel' }
      ]
    }, (buttonId) => {
      if (buttonId === 'seed') {
        webApp.showAlert('시드 구문 보기 기능은 현재 개발 중입니다.');
      } else if (buttonId === 'export') {
        webApp.showAlert('키스토어 내보내기 기능은 현재 개발 중입니다.');
      }
    });
  };
  
  // 가격 알림 설정 핸들러
  const handlePriceAlerts = () => {
    webApp.showAlert('가격 알림 설정 기능은 현재 개발 중입니다.');
  };
  
  // 비밀번호 변경 핸들러
  const handleChangePassword = () => {
    webApp.showAlert('비밀번호 변경 기능은 현재 개발 중입니다.');
  };
  
  // 지갑 삭제 핸들러
  const handleDeleteWallet = () => {
    webApp.showConfirm(
      '정말로 지갑을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다. 지갑을 삭제하기 전에 반드시 시드 구문을 백업하세요.',
      (confirmed) => {
        if (confirmed) {
          webApp.showAlert('지갑 삭제 기능은 현재 개발 중입니다.');
        }
      }
    );
  };
  
  // 사용자 이니셜 생성
  const getUserInitials = () => {
    if (!user) return '?';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
    } else if (user.first_name) {
      return user.first_name.charAt(0);
    } else if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    
    return '?';
  };
  
  return (
    <Container>
      <Title>설정</Title>
      
      {/* 사용자 정보 섹션 */}
      <Card>
        <SectionTitle>사용자 정보</SectionTitle>
        <UserInfo>
          <UserAvatar>{getUserInitials()}</UserAvatar>
          <UserName>
            <UserFullName>
              {user?.first_name} {user?.last_name || ''}
            </UserFullName>
            {user?.username && (
              <UserUsername>@{user.username}</UserUsername>
            )}
          </UserName>
        </UserInfo>
      </Card>
      
      {/* 지갑 정보 섹션 */}
      <Card>
        <SectionTitle>지갑 정보</SectionTitle>
        <WalletInfoItem>
          <WalletInfoLabel>지갑 주소</WalletInfoLabel>
          <WalletInfoValue>
            {wallet?.address || '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t'}
          </WalletInfoValue>
        </WalletInfoItem>
        <WalletInfoItem>
          <WalletInfoLabel>네트워크</WalletInfoLabel>
          <WalletInfoValue>Catena Chain (CTA)</WalletInfoValue>
        </WalletInfoItem>
        
        <Button onClick={handleBackupWallet}>
          💾 지갑 백업
        </Button>
      </Card>
      
      {/* 알림 설정 */}
      <Card>
        <SectionTitle>알림 설정</SectionTitle>
        <SettingItem>
          <SettingLabel>
            <Label>알림</Label>
            <Description>모든 지갑 알림을 활성화/비활성화</Description>
          </SettingLabel>
          <Toggle active={notificationEnabled} onClick={handleToggleNotification} />
        </SettingItem>
        
        {notificationEnabled && (
          <>
            <SettingItem>
              <SettingLabel>
                <Label>트랜잭션 알림</Label>
                <Description>송금/수신 알림</Description>
              </SettingLabel>
              <Toggle 
                active={transactionNotifications} 
                onClick={handleToggleTransactionNotifications} 
              />
            </SettingItem>
            
            <SettingItem>
              <SettingLabel>
                <Label>가격 알림</Label>
                <Description>코인 가격 변동 알림</Description>
              </SettingLabel>
              <Toggle 
                active={priceAlertNotifications} 
                onClick={handleTogglePriceAlertNotifications} 
              />
            </SettingItem>
            
            <SettingItem>
              <SettingLabel>
                <Label>보안 알림</Label>
                <Description>보안 관련 중요 알림</Description>
              </SettingLabel>
              <Toggle 
                active={securityNotifications} 
                onClick={handleToggleSecurityNotifications} 
              />
            </SettingItem>
            
            <Button onClick={handlePriceAlerts}>
              📈 가격 알림 설정
            </Button>
          </>
        )}
      </Card>
      
      {/* 보안 설정 */}
      <Card>
        <SectionTitle>보안 설정</SectionTitle>
        <Button onClick={handleChangePassword}>
          🔑 지갑 비밀번호 변경
        </Button>
        <DangerButton onClick={handleDeleteWallet}>
          🗑️ 지갑 삭제
        </DangerButton>
      </Card>
      
      {/* 버전 정보 */}
      <Version>
        TORI 지갑 버전 1.0.0
      </Version>
    </Container>
  );
};

export default Settings;
