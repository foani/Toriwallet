import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

// 스타일 컴포넌트
const SettingsContainer = styled.div`
  padding: 20px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: ${props => props.theme.text};
`;

const SettingsLayout = styled.div`
  display: flex;
  gap: 24px;
`;

const SettingsMenu = styled.div`
  width: 220px;
  background-color: ${props => props.theme.cardBackground};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const MenuItem = styled.div<{ active?: boolean }>`
  padding: 14px 16px;
  cursor: pointer;
  background-color: ${props => props.active ? props.theme.menuActive : 'transparent'};
  color: ${props => props.active ? props.theme.primary : props.theme.text};
  border-left: 3px solid ${props => props.active ? props.theme.primary : 'transparent'};
  
  &:hover {
    background-color: ${props => props.active ? props.theme.menuActive : props.theme.menuHover};
  }
`;

const MenuIcon = styled.span`
  margin-right: 8px;
`;

const SettingsContent = styled.div`
  flex: 1;
  background-color: ${props => props.theme.cardBackground};
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
  color: ${props => props.theme.text};
`;

const SettingRow = styled.div`
  padding: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.text};
`;

const Description = styled.span`
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
  margin-top: 4px;
`;

const ToggleSwitch = styled.div<{ checked: boolean }>`
  width: 40px;
  height: 20px;
  background-color: ${props => props.checked ? props.theme.primary : props.theme.disabled};
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:after {
    content: '';
    position: absolute;
    left: ${props => props.checked ? '22px' : '2px'};
    top: 2px;
    width: 16px;
    height: 16px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.3s;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 5px;
  background-color: ${props => props.theme.inputBackground};
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.border};
  font-size: 14px;
  min-width: 140px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme.primaryHover};
  }
`;

const DangerButton = styled(Button)`
  background-color: ${props => props.theme.error};
  
  &:hover {
    background-color: ${props => props.theme.errorHover};
  }
`;

const NetworksTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const NetworksHeader = styled.thead`
  border-bottom: 1px solid ${props => props.theme.border};
`;

const NetworksRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.theme.rowHover};
  }
`;

const NetworksHeaderCell = styled.th`
  text-align: left;
  padding: 12px 16px;
  color: ${props => props.theme.textSecondary};
  font-weight: 500;
  font-size: 14px;
`;

const NetworksCell = styled.td`
  padding: 12px 16px;
  color: ${props => props.theme.text};
  font-size: 14px;
`;

// 설정 컴포넌트
const Settings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 설정 상태 (예시용)
  const [theme, setTheme] = useState<string>('system');
  const [language, setLanguage] = useState<string>('ko');
  const [notifications, setNotifications] = useState<boolean>(true);
  const [autoLock, setAutoLock] = useState<boolean>(true);
  const [autoLockTime, setAutoLockTime] = useState<string>('5');
  const [networks, setNetworks] = useState<any[]>([]);
  
  // 현재 활성 메뉴
  const getActiveMenu = () => {
    const path = location.pathname;
    if (path.includes('/security')) return 'security';
    if (path.includes('/networks')) return 'networks';
    if (path.includes('/backup')) return 'backup';
    if (path.includes('/about')) return 'about';
    return 'general';
  };
  
  // 메뉴 변경 핸들러
  const handleMenuChange = (menu: string) => {
    navigate(`/settings/${menu}`);
  };
  
  // 데이터 로드 (예시용)
  useEffect(() => {
    // 네트워크 데이터 로드
    if (getActiveMenu() === 'networks') {
      // 실제로는 walletAPI에서 데이터를 불러옴
      setNetworks([
        {
          id: 'catena',
          name: 'Catena Chain',
          rpcUrl: 'https://cvm.node.creatachain.com',
          chainId: '1000',
          symbol: 'CTA',
          explorer: 'https://catena.explorer.creatachain.com',
          default: true
        },
        {
          id: 'zenith',
          name: 'Zenith Chain',
          rpcUrl: 'https://node.zenith.creatachain.com',
          chainId: '2000',
          symbol: 'CTA',
          explorer: 'https://zenith.explorer.creatachain.com',
          default: true
        },
        {
          id: 'ethereum',
          name: 'Ethereum',
          rpcUrl: 'https://mainnet.infura.io/v3/your-key',
          chainId: '1',
          symbol: 'ETH',
          explorer: 'https://etherscan.io',
          default: true
        },
        {
          id: 'bsc',
          name: 'Binance Smart Chain',
          rpcUrl: 'https://bsc-dataseed.binance.org',
          chainId: '56',
          symbol: 'BNB',
          explorer: 'https://bscscan.com',
          default: true
        },
        {
          id: 'polygon',
          name: 'Polygon',
          rpcUrl: 'https://polygon-rpc.com',
          chainId: '137',
          symbol: 'MATIC',
          explorer: 'https://polygonscan.com',
          default: true
        }
      ]);
    }
  }, [getActiveMenu()]);
  
  // 토글 핸들러
  const handleToggle = (setting: string) => {
    if (setting === 'notifications') {
      setNotifications(!notifications);
    } else if (setting === 'autoLock') {
      setAutoLock(!autoLock);
    }
  };
  
  // 선택 핸들러
  const handleSelect = (setting: string, value: string) => {
    if (setting === 'theme') {
      setTheme(value);
    } else if (setting === 'language') {
      setLanguage(value);
    } else if (setting === 'autoLockTime') {
      setAutoLockTime(value);
    }
  };
  
  // 버튼 핸들러 (임시)
  const handleButtonClick = (action: string) => {
    alert(`${action} 기능은 개발 중입니다.`);
  };
  
  // 일반 설정 렌더링
  const renderGeneralSettings = () => (
    <div>
      <SectionTitle>앱 설정</SectionTitle>
      
      <SettingRow>
        <SettingLabel>
          <Label>테마</Label>
          <Description>앱의 테마를 설정합니다.</Description>
        </SettingLabel>
        <Select value={theme} onChange={(e) => handleSelect('theme', e.target.value)}>
          <option value="light">라이트 모드</option>
          <option value="dark">다크 모드</option>
          <option value="system">시스템 설정에 따름</option>
        </Select>
      </SettingRow>
      
      <SettingRow>
        <SettingLabel>
          <Label>언어</Label>
          <Description>앱의 언어를 설정합니다.</Description>
        </SettingLabel>
        <Select value={language} onChange={(e) => handleSelect('language', e.target.value)}>
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="zh">中文</option>
          <option value="vi">Tiếng Việt</option>
          <option value="th">ภาษาไทย</option>
        </Select>
      </SettingRow>
      
      <SettingRow>
        <SettingLabel>
          <Label>알림</Label>
          <Description>앱 알림을 받습니다.</Description>
        </SettingLabel>
        <ToggleSwitch checked={notifications} onClick={() => handleToggle('notifications')} />
      </SettingRow>
    </div>
  );
  
  // 보안 설정 렌더링
  const renderSecuritySettings = () => (
    <div>
      <SectionTitle>보안 설정</SectionTitle>
      
      <SettingRow>
        <SettingLabel>
          <Label>자동 잠금</Label>
          <Description>일정 시간 후 지갑을 자동으로 잠급니다.</Description>
        </SettingLabel>
        <ToggleSwitch checked={autoLock} onClick={() => handleToggle('autoLock')} />
      </SettingRow>
      
      {autoLock && (
        <SettingRow>
          <SettingLabel>
            <Label>자동 잠금 시간</Label>
            <Description>비활성 상태일 때 지갑이 잠기는 시간을 설정합니다.</Description>
          </SettingLabel>
          <Select value={autoLockTime} onChange={(e) => handleSelect('autoLockTime', e.target.value)}>
            <option value="1">1분</option>
            <option value="5">5분</option>
            <option value="15">15분</option>
            <option value="30">30분</option>
            <option value="60">1시간</option>
          </Select>
        </SettingRow>
      )}
      
      <SettingRow>
        <SettingLabel>
          <Label>비밀번호 변경</Label>
          <Description>지갑 비밀번호를 변경합니다.</Description>
        </SettingLabel>
        <Button onClick={() => handleButtonClick('비밀번호 변경')}>변경</Button>
      </SettingRow>
      
      <SettingRow>
        <SettingLabel>
          <Label>트랜잭션 승인 시 비밀번호 요구</Label>
          <Description>트랜잭션을 보낼 때 비밀번호를 입력해야 합니다.</Description>
        </SettingLabel>
        <ToggleSwitch checked={true} onClick={() => alert('이 설정은 변경할 수 없습니다.')} />
      </SettingRow>
    </div>
  );
  
  // 네트워크 설정 렌더링
  const renderNetworkSettings = () => (
    <div>
      <SectionTitle>네트워크 설정</SectionTitle>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Button onClick={() => handleButtonClick('네트워크 추가')}>네트워크 추가</Button>
      </div>
      
      <NetworksTable>
        <NetworksHeader>
          <NetworksRow>
            <NetworksHeaderCell>네트워크</NetworksHeaderCell>
            <NetworksHeaderCell>체인 ID</NetworksHeaderCell>
            <NetworksHeaderCell>심볼</NetworksHeaderCell>
            <NetworksHeaderCell>RPC URL</NetworksHeaderCell>
            <NetworksHeaderCell>기본</NetworksHeaderCell>
            <NetworksHeaderCell>작업</NetworksHeaderCell>
          </NetworksRow>
        </NetworksHeader>
        <tbody>
          {networks.map(network => (
            <NetworksRow key={network.id}>
              <NetworksCell>{network.name}</NetworksCell>
              <NetworksCell>{network.chainId}</NetworksCell>
              <NetworksCell>{network.symbol}</NetworksCell>
              <NetworksCell>{network.rpcUrl}</NetworksCell>
              <NetworksCell>{network.default ? '예' : '아니요'}</NetworksCell>
              <NetworksCell>
                <button onClick={() => handleButtonClick(`네트워크 편집: ${network.id}`)}>
                  편집
                </button>
                {!network.default && (
                  <button onClick={() => handleButtonClick(`네트워크 삭제: ${network.id}`)}>
                    삭제
                  </button>
                )}
              </NetworksCell>
            </NetworksRow>
          ))}
        </tbody>
      </NetworksTable>
    </div>
  );
  
  // 백업 설정 렌더링
  const renderBackupSettings = () => (
    <div>
      <SectionTitle>백업 및 복구</SectionTitle>
      
      <SettingRow>
        <SettingLabel>
          <Label>시드 구문 백업</Label>
          <Description>복구 시드 구문을 안전하게 확인하고 백업합니다.</Description>
        </SettingLabel>
        <Button onClick={() => handleButtonClick('시드 구문 백업')}>백업</Button>
      </SettingRow>
      
      <SettingRow>
        <SettingLabel>
          <Label>키스토어 파일 내보내기</Label>
          <Description>암호화된 키스토어 파일을 내보냅니다.</Description>
        </SettingLabel>
        <Button onClick={() => handleButtonClick('키스토어 내보내기')}>내보내기</Button>
      </SettingRow>
      
      <SettingRow>
        <SettingLabel>
          <Label>키스토어 파일 가져오기</Label>
          <Description>키스토어 파일을 가져와 지갑을 복구합니다.</Description>
        </SettingLabel>
        <Button onClick={() => handleButtonClick('키스토어 가져오기')}>가져오기</Button>
      </SettingRow>
      
      <SettingRow>
        <SettingLabel>
          <Label>지갑 초기화</Label>
          <Description>모든 데이터를 삭제하고 지갑을 초기화합니다. 이 작업은 되돌릴 수 없습니다.</Description>
        </SettingLabel>
        <DangerButton onClick={() => handleButtonClick('지갑 초기화')}>초기화</DangerButton>
      </SettingRow>
    </div>
  );
  
  // 정보 렌더링
  const renderAboutSettings = () => (
    <div>
      <SectionTitle>정보</SectionTitle>
      
      <SettingRow>
        <SettingLabel>
          <Label>버전</Label>
          <Description>현재 앱 버전</Description>
        </SettingLabel>
        <span>1.0.0</span>
      </SettingRow>
      
      <SettingRow>
        <SettingLabel>
          <Label>라이선스</Label>
          <Description>오픈 소스 라이선스 정보</Description>
        </SettingLabel>
        <Button onClick={() => handleButtonClick('라이선스 확인')}>확인</Button>
      </SettingRow>
      
      <SettingRow>
        <SettingLabel>
          <Label>웹사이트</Label>
          <Description>공식 웹사이트 방문</Description>
        </SettingLabel>
        <Button onClick={() => window.electronShell.openExternal('https://creatachain.com')}>
          방문
        </Button>
      </SettingRow>
      
      <SettingRow>
        <SettingLabel>
          <Label>지원</Label>
          <Description>도움이 필요하시면 지원 페이지를 방문하세요.</Description>
        </SettingLabel>
        <Button onClick={() => window.electronShell.openExternal('https://support.creatachain.com')}>
          방문
        </Button>
      </SettingRow>
    </div>
  );

  return (
    <SettingsContainer>
      <PageTitle>설정</PageTitle>
      
      <SettingsLayout>
        <SettingsMenu>
          <MenuItem 
            active={getActiveMenu() === 'general'} 
            onClick={() => handleMenuChange('general')}
          >
            <MenuIcon>⚙️</MenuIcon> 일반
          </MenuItem>
          <MenuItem 
            active={getActiveMenu() === 'security'} 
            onClick={() => handleMenuChange('security')}
          >
            <MenuIcon>🔒</MenuIcon> 보안
          </MenuItem>
          <MenuItem 
            active={getActiveMenu() === 'networks'} 
            onClick={() => handleMenuChange('networks')}
          >
            <MenuIcon>🌐</MenuIcon> 네트워크
          </MenuItem>
          <MenuItem 
            active={getActiveMenu() === 'backup'} 
            onClick={() => handleMenuChange('backup')}
          >
            <MenuIcon>💾</MenuIcon> 백업 및 복구
          </MenuItem>
          <MenuItem 
            active={getActiveMenu() === 'about'} 
            onClick={() => handleMenuChange('about')}
          >
            <MenuIcon>ℹ️</MenuIcon> 정보
          </MenuItem>
        </SettingsMenu>
        
        <SettingsContent>
          <Routes>
            <Route path="/" element={renderGeneralSettings()} />
            <Route path="/general" element={renderGeneralSettings()} />
            <Route path="/security" element={renderSecuritySettings()} />
            <Route path="/networks" element={renderNetworkSettings()} />
            <Route path="/backup" element={renderBackupSettings()} />
            <Route path="/about" element={renderAboutSettings()} />
          </Routes>
        </SettingsContent>
      </SettingsLayout>
    </SettingsContainer>
  );
};

export default Settings;
