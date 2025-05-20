import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';

/**
 * 서명 요청 컴포넌트 속성
 */
interface SignRequestProps {
  /**
   * 서명을 요청하는 dApp의 도메인
   */
  domain: string;
  
  /**
   * dApp 아이콘 URL
   */
  icon?: string;
  
  /**
   * 서명할 메시지
   */
  message: string;
  
  /**
   * 서명 타입 (personal_sign, eth_sign, eth_signTypedData 등)
   */
  signType: string;
  
  /**
   * 서명에 사용할 계정 주소
   */
  address: string;
  
  /**
   * 서명 승인 시 호출될 함수
   */
  onApprove: () => Promise<void>;
  
  /**
   * 서명 거부 시 호출될 함수
   */
  onReject: () => void;
}

/**
 * 서명 요청 컴포넌트
 * 
 * dApp에서 메시지 서명 요청 시 사용자에게 승인을 요청하는 컴포넌트입니다.
 */
const SignRequest: React.FC<SignRequestProps> = ({
  domain,
  icon,
  message,
  signType,
  address,
  onApprove,
  onReject,
}) => {
  // 서명 중 상태
  const [isSigning, setIsSigning] = useState<boolean>(false);
  
  // 메시지 표시 상태
  const [isMessageExpanded, setIsMessageExpanded] = useState<boolean>(false);
  
  // 서명 승인 처리
  const handleApprove = async () => {
    try {
      setIsSigning(true);
      await onApprove();
    } catch (error) {
      console.error('서명 오류:', error);
    } finally {
      setIsSigning(false);
    }
  };
  
  // 주소 형식화
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };
  
  // 서명 타입에 따른 경고 메시지
  const getSignTypeWarning = () => {
    switch (signType) {
      case 'personal_sign':
        return '이 서명은 귀하의 계정을 증명하는 개인 메시지입니다.';
      case 'eth_sign':
        return '경고: 이것은 원시 메시지 서명입니다. 신뢰할 수 있는 사이트에서만 승인하세요.';
      case 'eth_signTypedData':
        return '이 서명은 특정 데이터 구조에 서명합니다.';
      default:
        return '이 서명 요청을 신중히 검토하세요.';
    }
  };
  
  // 메시지 토글
  const toggleMessage = () => {
    setIsMessageExpanded(!isMessageExpanded);
  };
  
  return (
    <div className="sign-request">
      <div className="request-header">
        <h2 className="request-title">서명 요청</h2>
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
            이 사이트가 귀하에게 메시지 서명을 요청합니다.
          </div>
        </div>
        
        <div className="sign-warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-text">
            {getSignTypeWarning()}
          </div>
        </div>
        
        <div className="account-info">
          <div className="account-label">서명 계정:</div>
          <div className="account-address">{formatAddress(address)}</div>
        </div>
        
        <div className="message-container">
          <div className="message-header" onClick={toggleMessage}>
            <h3 className="message-title">메시지</h3>
            <Button
              variant="text"
              onClick={toggleMessage}
              className="expand-button"
            >
              {isMessageExpanded ? '접기' : '펼치기'}
            </Button>
          </div>
          
          {isMessageExpanded ? (
            <div className="message-content expanded">
              <pre className="message-text">{message}</pre>
            </div>
          ) : (
            <div className="message-content">
              <pre className="message-text">{
                message.length > 100
                  ? `${message.substring(0, 100)}...`
                  : message
              }</pre>
            </div>
          )}
        </div>
        
        <div className="request-actions">
          <Button
            variant="secondary"
            onClick={onReject}
            disabled={isSigning}
            className="reject-button"
          >
            거부
          </Button>
          
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={isSigning}
            className="approve-button"
          >
            {isSigning ? (
              <div className="signing">
                <Loading size="small" />
                <span>서명 중...</span>
              </div>
            ) : (
              '서명'
            )}
          </Button>
        </div>
      </Card>
      
      <div className="security-notice">
        <div className="notice-icon">⚠️</div>
        <div className="notice-text">
          메시지에 서명하는 것은 귀하의 개인 키로 데이터에 서명하는 것입니다.
          서명의 내용과 요청하는 사이트를 신뢰할 수 있는지 확인하세요.
        </div>
      </div>
    </div>
  );
};

export default SignRequest;