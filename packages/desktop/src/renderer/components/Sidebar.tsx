import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

// 사이드바 컨테이너
const SidebarContainer = styled.aside`
  width: 240px;
  height: 100%;
  background-color: ${props => props.theme.sidebar};
  border-right: 1px solid ${props => props.theme.border};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

// 로고 영역
const LogoContainer = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const Logo = styled.img`
  height: 40px;
`;

// 지갑 선택 영역
const WalletSelector = styled.div`
  padding: 15px;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const WalletDropdown = styled.select`
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.border};
  outline: none;
  font-size: 14px;
  
  &:focus {
    border-color: ${props => props.theme.primary};
  }
`;

// 네트워크 선택기
const NetworkSelector = styled.div`
  padding: 15px;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const NetworkIndicator = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 5px;
  background-color: ${props => props.theme.inputBackground};
  cursor: pointer;
`;

const NetworkDot = styled.div<{ active?: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#4CAF50' : '#999'};
  margin-right: 8px;
`;

const NetworkName = styled.span`
  flex: 1;
`;

// 메뉴 아이템
const MenuItem = styled.div<{ active?: boolean }>`
  padding: 15px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${props => props.active ? props.theme.primary : props.theme.text};
  background-color: ${props => props.active ? props.theme.activeMenuItem : 'transparent'};
  
  &:hover {
    background-color: ${props => props.theme.menuHover};
  }
  
  transition: all 0.2s ease;
`;

const MenuIcon = styled.div`
  width: 24px;
  height: 24px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MenuLabel = styled.span`
  flex: 1;
  font-size: 14px;
`;

// 하단 영역
const BottomSection = styled.div`
  margin-top: auto;
  padding: 15px;
  border-top: 1px solid ${props => props.theme.border};
`;

const VersionInfo = styled.div`
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
  text-align: center;
  margin-top: 10px;
`;

// 사이드바 컴포넌트
const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeWallet, setActiveWallet] = useState<string>('');
  const [wallets, setWallets] = useState<any[]>([]);
  const [activeNetwork, setActiveNetwork] = useState<string>('Catena Chain');
  const [appVersion, setAppVersion] = useState<string>('1.0.0');
  
  // 현재 활성 경로
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // 지갑 목록 불러오기
  useEffect(() => {
    // 예시 데이터 (실제로는 walletAPI에서 불러옴)
    setWallets([
      { id: 'wallet1', name: '기본 지갑' },
      { id: 'wallet2', name: '거래용 지갑' },
      { id: 'wallet3', name: '보관용 지갑' },
    ]);
    
    // 기본값 설정
    setActiveWallet('wallet1');
    
    // 앱 버전 가져오기
    if (window.electronApp) {
      window.electronApp.getVersion().then(version => {
        setAppVersion(version);
      });
    }
  }, []);

  // 지갑 변경 핸들러
  const handleWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveWallet(e.target.value);
  };

  // 네트워크 변경 핸들러
  const handleNetworkClick = () => {
    // 네트워크 선택 모달 띄우기 (미구현)
    navigate('/settings/networks');
  };

  // 메뉴 아이템 클릭 핸들러
  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <SidebarContainer>
      <LogoContainer>
        <Logo src="assets/logo.png" alt="TORI Wallet" />
      </LogoContainer>
      
      <WalletSelector>
        <WalletDropdown value={activeWallet} onChange={handleWalletChange}>
          {wallets.map(wallet => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name}
            </option>
          ))}
        </WalletDropdown>
      </WalletSelector>
      
      <NetworkSelector>
        <NetworkIndicator onClick={handleNetworkClick}>
          <NetworkDot active />
          <NetworkName>{activeNetwork}</NetworkName>
        </NetworkIndicator>
      </NetworkSelector>
      
      <MenuItem active={isActive('/')} onClick={() => handleMenuClick('/')}>
        <MenuIcon>
          <span role="img" aria-label="dashboard">📊</span>
        </MenuIcon>
        <MenuLabel>대시보드</MenuLabel>
      </MenuItem>
      
      <MenuItem active={isActive('/wallet')} onClick={() => handleMenuClick('/wallet')}>
        <MenuIcon>
          <span role="img" aria-label="wallet">💼</span>
        </MenuIcon>
        <MenuLabel>지갑</MenuLabel>
      </MenuItem>
      
      <MenuItem active={isActive('/staking')} onClick={() => handleMenuClick('/staking')}>
        <MenuIcon>
          <span role="img" aria-label="staking">🔐</span>
        </MenuIcon>
        <MenuLabel>스테이킹</MenuLabel>
      </MenuItem>
      
      <MenuItem active={isActive('/nft')} onClick={() => handleMenuClick('/nft')}>
        <MenuIcon>
          <span role="img" aria-label="nft">🖼️</span>
        </MenuIcon>
        <MenuLabel>NFT</MenuLabel>
      </MenuItem>
      
      <MenuItem active={isActive('/dapp')} onClick={() => handleMenuClick('/dapp')}>
        <MenuIcon>
          <span role="img" aria-label="dapp">🔗</span>
        </MenuIcon>
        <MenuLabel>dApp 브라우저</MenuLabel>
      </MenuItem>
      
      <MenuItem active={isActive('/defi')} onClick={() => handleMenuClick('/defi')}>
        <MenuIcon>
          <span role="img" aria-label="defi">📈</span>
        </MenuIcon>
        <MenuLabel>DeFi</MenuLabel>
      </MenuItem>
      
      <BottomSection>
        <MenuItem active={isActive('/settings')} onClick={() => handleMenuClick('/settings')}>
          <MenuIcon>
            <span role="img" aria-label="settings">⚙️</span>
          </MenuIcon>
          <MenuLabel>설정</MenuLabel>
        </MenuItem>
        <VersionInfo>Version {appVersion}</VersionInfo>
      </BottomSection>
    </SidebarContainer>
  );
};

export default Sidebar;
