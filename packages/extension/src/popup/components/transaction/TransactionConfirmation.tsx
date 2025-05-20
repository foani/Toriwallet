import React, { useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import Loading from '../common/Loading';

/**
 * 트랜잭션 확인 컴포넌트 속성
 */
interface TransactionConfirmationProps {
  /**
   * 트랜잭션 타입
   */
  type: 'send' | 'swap' | 'approve' | 'stake' | 'unstake' | 'other';
  
  /**
   * 보내는 주소
   */
  fromAddress: string;
  
  /**
   * 받는 주소
   */
  toAddress: string;
  
  /**
   * 송금 금액 (type이 'send'인 경우)
   */
  amount?: string;
  
  /**
   * 토큰 심볼 (type이 'send'인 경우)
   */
  symbol?: string;
  
  /**
   * 네트워크 이름
   */
  networkName: string;
  
  /**
   * 가스 가격
   */
  gasPrice: string;
  
  /**
   * 가스 한도
   */
  gasLimit: string;
  
  /**
   * 최대 수수료
   */
  maxFee: string;
  
  /**
   * 승인 금액 (type이 'approve'인 경우)
   */
  approvalAmount?: string;
  
  /**
   * 계약 호출 데이터 (type이 'other'인 경우)
   */
  data?: string;
  
  /**
   * 확인 버튼 클릭 시 호출될 함수
   */
  onConfirm: () => Promise<void>;
  
  /**
   * 취소 버튼 클릭 시 호출될 함수
   */
  onCancel: () => void;
  
  /**
   * 가스 설정 수정 시 호출될 함수
   */
  onEditGas?: () => void;
}

/**
 * 트랜잭션 확인 컴포넌트
 * 
 * 트랜잭션 실행 전 사용자에게 확인을 요청하는 컴포넌트입니다.
 * 트랜잭션의 타입에 따라 다른 내용을 표시합니다.
 */
const TransactionConfirmation: React.FC<TransactionConfirmationProps> = ({
  type,
  fromAddress,
  toAddress,
  amount,
  symbol,
  networkName,
  gasPrice,
  gasLimit,
  maxFee,
  approvalAmount,
  data,
  onConfirm,
  onCancel,
  onEditGas,
}) => {
  // 컴포넌트 상태
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // 주소 형식화 (앞 6자와 뒤 4자만 표시)
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 확인 버튼 클릭 처리
  const handleConfirm = async () => {
    try {
      setError('');
      setIsConfirming(true);
      
      // 확인 함수 호출
      await onConfirm();
    } catch (error) {
      console.error('트랜잭션 확인 오류:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsConfirming(false);
    }
  };
  
  // 트랜잭션 타입에 따른 제목 가져오기
  const getTransactionTitle = () => {
    switch (type) {
      case 'send':
        return '트랜잭션 전송 확인';
      case 'swap':
        return '스왑 확인';
      case 'approve':
        return '토큰 승인 확인';
      case 'stake':
        return '스테이킹 확인';
      case 'unstake':
        return '언스테이킹 확인';
      case 'other':
        return '트랜잭션 확인';
      default:
        return '트랜잭션 확인';
    }
  };
  
  // 트랜잭션 내용 렌더링
  const renderTransactionContent = () => {
    switch (type) {
      case 'send':
        return (
          <div className="transaction-details">
            <div className="transaction-amount">
              {amount} {symbol}
            </div>
            <div className="transaction-addresses">
              <div className="address-item">
                <div className="address-label">From:</div>
                <div className="address-value">{formatAddress(fromAddress)}</div>
              </div>
              <div className="address-arrow">↓</div>
              <div className="address-item">
                <div className="address-label">To:</div>
                <div className="address-value">{formatAddress(toAddress)}</div>
              </div>
            </div>
          </div>
        );
      
      case 'approve':
        return (
          <div className="transaction-details">
            <div className="approve-warning">
              <div className="warning-icon">⚠️</div>
              <div className="warning-text">
                이 트랜잭션은 계약에 귀하의 토큰 사용 권한을 제공합니다.
                신뢰할 수 있는 계약인지 확인하세요.
              </div>
            </div>
            <div className="transaction-amount">
              {approvalAmount === 'unlimited' ? '무제한' : approvalAmount} {symbol}
            </div>
            <div className="transaction-addresses">
              <div className="address-item">
                <div className="address-label">승인자:</div>
                <div className="address-value">{formatAddress(fromAddress)}</div>
              </div>
              <div className="address-arrow">↓</div>
              <div className="address-item">
                <div className="address-label">계약:</div>
                <div className="address-value">{formatAddress(toAddress)}</div>
              </div>
            </div>
          </div>
        );
      
      case 'swap':
        return (
          <div className="transaction-details">
            <div className="transaction-amount">
              {amount}
            </div>
            <div className="transaction-addresses">
              <div className="address-item">
                <div className="address-label">From:</div>
                <div className="address-value">{formatAddress(fromAddress)}</div>
              </div>
              <div className="address-arrow">↓</div>
              <div className="address-item">
                <div className="address-label">To:</div>
                <div className="address-value">{formatAddress(toAddress)}</div>
              </div>
            </div>
          </div>
        );
      
      case 'stake':
        return (
          <div className="transaction-details">
            <div className="transaction-amount">
              {amount} {symbol}
            </div>
            <div className="transaction-addresses">
              <div className="address-item">
                <div className="address-label">스테이커:</div>
                <div className="address-value">{formatAddress(fromAddress)}</div>
              </div>
              <div className="address-arrow">↓</div>
              <div className="address-item">
                <div className="address-label">스테이킹 컨트랙트:</div>
                <div className="address-value">{formatAddress(toAddress)}</div>
              </div>
            </div>
          </div>
        );
      
      case 'unstake':
        return (
          <div className="transaction-details">
            <div className="transaction-amount">
              {amount} {symbol}
            </div>
            <div className="transaction-addresses">
              <div className="address-item">
                <div className="address-label">스테이킹 컨트랙트:</div>
                <div className="address-value">{formatAddress(fromAddress)}</div>
              </div>
              <div className="address-arrow">↓</div>
              <div className="address-item">
                <div className="address-label">스테이커:</div>
                <div className="address-value">{formatAddress(toAddress)}</div>
              </div>
            </div>
          </div>
        );
      
      case 'other':
        return (
          <div className="transaction-details">
            <div className="transaction-addresses">
              <div className="address-item">
                <div className="address-label">From:</div>
                <div className="address-value">{formatAddress(fromAddress)}</div>
              </div>
              <div className="address-arrow">↓</div>
              <div className="address-item">
                <div className="address-label">To:</div>
                <div className="address-value">{formatAddress(toAddress)}</div>
              </div>
            </div>
            
            {data && (
              <div className="transaction-data">
                <div className="data-label">데이터:</div>
                <div className="data-value">{data.length > 50 ? `${data.substring(0, 50)}...` : data}</div>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="transaction-confirmation">
      <h2 className="confirmation-title">{getTransactionTitle()}</h2>
      
      <Card className="confirmation-card">
        {renderTransactionContent()}
        
        <div className="network-info">
          <div className="network-label">네트워크:</div>
          <div className="network-value">{networkName}</div>
        </div>
        
        <div className="gas-info">
          <div className="gas-header">
            <h3 className="gas-title">가스 설정</h3>
            {onEditGas && (
              <Button
                variant="text"
                onClick={onEditGas}
                disabled={isConfirming}
              >
                수정
              </Button>
            )}
          </div>
          
          <div className="gas-details">
            <div className="gas-item">
              <div className="gas-label">가스 가격:</div>
              <div className="gas-value">{gasPrice}</div>
            </div>
            <div className="gas-item">
              <div className="gas-label">가스 한도:</div>
              <div className="gas-value">{gasLimit}</div>
            </div>
            <div className="gas-item">
              <div className="gas-label">최대 수수료:</div>
              <div className="gas-value">{maxFee}</div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="confirmation-error">
            {error}
          </div>
        )}
      </Card>
      
      <div className="confirmation-actions">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isConfirming}
          className="cancel-btn"
        >
          취소
        </Button>
        
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={isConfirming}
          className="confirm-btn"
        >
          {isConfirming ? (
            <div className="confirming">
              <Loading size="small" />
              <span>서명 중...</span>
            </div>
          ) : (
            '서명 및 확인'
          )}
        </Button>
      </div>
    </div>
  );
};

export default TransactionConfirmation;