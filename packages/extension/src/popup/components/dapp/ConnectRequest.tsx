import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

/**
 * dApp 연결 요청 컴포넌트 속성
 */
interface ConnectRequestProps {
  /**
   * 연결을 요청하는 dApp의 도메인
   */
  domain: string;
  
  /**
   * dApp 아이콘 URL
   */
  icon?: string;
  
  /**
   * 요청한 계정 접근 권한 목록
   */
  permissions: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  
  /**
   * 계정 목록
   */
  accounts: Array<{
    address: string;
    name: string;
  }>;
  
  /**
   * 연결 승인 시 호출될 함수
   */
  onApprove: (accountAddresses: string[]) => void;
  
  /**
   * 연결 거부 시 호출될 함수
   */
  onReject: () => void;
}

/**
 * dApp 연결 요청 컴포넌트
 * 
 * dApp에서 지갑 연결 요청 시 사용자에게 승인을 요청하는 컴포넌트입니다.
 */
const ConnectRequest: React.FC<ConnectRequestProps> = ({
  domain,
  icon,
  permissions,
  accounts,
  onApprove,
  onReject,
}) => {
  // 선택된 계정 상태
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([accounts[0]?.address || '']);
  
  // 기억하기 상태
  const [rememberChoice, setRememberChoice] = useState<boolean>(false);
  
  // 계정 선택 처리
  const handleAccountSelect = (address: string) => {
    // 이미 선택되어 있는 경우 제거
    if (selectedAccounts.includes(address)) {
      setSelectedAccounts(prev => prev.filter(a => a !== address));
    } else {
      // 선택되어 있지 않은 경우 추가
      setSelectedAccounts(prev => [...prev, address]);
    }
  };
  
  // 기억하기 체크박스 처리
  const handleRememberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberChoice(e.target.checked);
  };
  
  // 주소 형식화
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 연결 승인
  const handleApprove = () => {
    // 하나 이상의 계정이 선택되었는지 확인
    if (selectedAccounts.length === 0) {
      alert('적어도 하나의 계정을 선택해야 합니다.');
      return;
    }
    
    onApprove(selectedAccounts);
  };
  
  return (
    <div className="connect-request">
      <div className="request-header">
        <h2 className="request-title">지갑 연결 요청</h2>
      </div>
      
      <Card className="request-card">
        <div className="site-info">
          {icon && (
            <div className="site-icon">
              <img src={icon} alt={domain} className="site-icon-image" />
            </div>
          )}
          
          <div className="site-domain">{domain}</div>
          
          <div className="site-message">
            이 사이트가 귀하의 지갑에 연결하기를 원합니다.
          </div>
        </div>
        
        <div className="request-permissions">
          <h3 className="permissions-title">요청 권한</h3>
          
          <div className="permissions-list">
            {permissions.map(permission => (
              <div key={permission.id} className="permission-item">
                <div className="permission-name">{permission.name}</div>
                <div className="permission-description">{permission.description}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="accounts-selection">
          <h3 className="accounts-title">연결할 계정</h3>
          
          <div className="accounts-list">
            {accounts.map(account => (
              <div
                key={account.address}
                className={`account-item ${
                  selectedAccounts.includes(account.address) ? 'selected' : ''
                }`}
                onClick={() => handleAccountSelect(account.address)}
              >
                <input
                  type="checkbox"
                  checked={selectedAccounts.includes(account.address)}
                  onChange={() => handleAccountSelect(account.address)}
                  className="account-checkbox"
                />
                
                <div className="account-info">
                  <div className="account-name">{account.name}</div>
                  <div className="account-address">{formatAddress(account.address)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="remember-choice">
          <label className="remember-label">
            <input
              type="checkbox"
              checked={rememberChoice}
              onChange={handleRememberChange}
              className="remember-checkbox"
            />
            <span className="remember-text">이 사이트의 선택 기억하기</span>
          </label>
        </div>
        
        <div className="request-actions">
          <Button
            variant="secondary"
            onClick={onReject}
            className="reject-button"
          >
            거부
          </Button>
          
          <Button
            variant="primary"
            onClick={handleApprove}
            className="approve-button"
            disabled={selectedAccounts.length === 0}
          >
            연결
          </Button>
        </div>
      </Card>
      
      <div className="security-notice">
        <div className="notice-icon">⚠️</div>
        <div className="notice-text">
          귀하의 계정과 자산에 접근할 수 있는 권한을 부여하는 것이므로
          신뢰할 수 있는 사이트만 연결하세요.
        </div>
      </div>
    </div>
  );
};

export default ConnectRequest;