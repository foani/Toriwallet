import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';

/**
 * 트랜잭션 상세 정보 페이지 컴포넌트
 * 
 * 특정 트랜잭션의 상세 정보를 표시합니다.
 */
const TransactionDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // 트랜잭션 상태
  const [transaction, setTransaction] = useState<{
    id: string;
    type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'approve';
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: number;
    fromAddress: string;
    toAddress: string;
    amount: string;
    symbol: string;
    fee?: string;
    hash: string;
    blockExplorerUrl?: string;
    blockNumber?: number;
    gasUsed?: string;
    gasPrice?: string;
    nonce?: number;
    data?: string;
    confirmation?: number;
    contractAddress?: string;
    tokenId?: string;
    errorMessage?: string;
  } | null>(null);
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 가속 중 상태
  const [isAccelerating, setIsAccelerating] = useState<boolean>(false);
  
  // 취소 중 상태
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  
  // 트랜잭션 데이터 로드
  useEffect(() => {
    const loadTransaction = async () => {
      try {
        // 백그라운드 스크립트에 데이터 요청
        // 실제 구현에서는 chrome.runtime.sendMessage 사용
        
        // 임시 구현: 가상 데이터 생성
        // 실제 구현 시 제거
        setTimeout(() => {
          // 가상의 트랜잭션 데이터
          const mockTransaction = {
            id: id || 'tx1',
            type: 'send' as const,
            status: 'confirmed' as const,
            timestamp: Date.now() - 86400000, // 1일 전
            fromAddress: '0x1234567890123456789012345678901234567890',
            toAddress: '0x2345678901234567890123456789012345678901',
            amount: '10.5',
            symbol: 'CTA',
            fee: '0.001 CTA',
            hash: '0x9876543210987654321098765432109876543210',
            blockExplorerUrl: 'https://catena.explorer.creatachain.com/tx/0x9876543210987654321098765432109876543210',
            blockNumber: 12345678,
            gasUsed: '21000',
            gasPrice: '5 Gwei',
            nonce: 42,
            data: '0x',
            confirmation: 100,
            contractAddress: undefined,
            tokenId: undefined,
            errorMessage: undefined,
          };
          
          setTransaction(mockTransaction);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('트랜잭션 로드 오류:', error);
        setIsLoading(false);
      }
    };
    
    if (id) {
      loadTransaction();
    } else {
      // ID가 없는 경우 트랜잭션 내역 페이지로 리다이렉트
      navigate('/transactions');
    }
  }, [id, navigate]);
  
  // 트랜잭션 가속
  const handleAccelerateTransaction = async () => {
    try {
      setIsAccelerating(true);
      
      // 백그라운드 스크립트에 가속 요청
      // 실제 구현에서는 chrome.runtime.sendMessage 사용
      
      // 임시 구현: 2초 후 완료
      // 실제 구현 시 제거
      setTimeout(() => {
        // 트랜잭션 상태 업데이트
        if (transaction) {
          setTransaction({
            ...transaction,
            gasPrice: '10 Gwei', // 더 높은 가스 가격
          });
        }
        
        setIsAccelerating(false);
      }, 2000);
    } catch (error) {
      console.error('트랜잭션 가속 오류:', error);
      setIsAccelerating(false);
    }
  };
  
  // 트랜잭션 취소
  const handleCancelTransaction = async () => {
    try {
      setIsCancelling(true);
      
      // 백그라운드 스크립트에 취소 요청
      // 실제 구현에서는 chrome.runtime.sendMessage 사용
      
      // 임시 구현: 2초 후 완료
      // 실제 구현 시 제거
      setTimeout(() => {
        // 트랜잭션 상태 업데이트
        if (transaction) {
          setTransaction({
            ...transaction,
            status: 'failed' as const,
            errorMessage: '사용자에 의해 취소됨',
          });
        }
        
        setIsCancelling(false);
      }, 2000);
    } catch (error) {
      console.error('트랜잭션 취소 오류:', error);
      setIsCancelling(false);
    }
  };
  
  // 트랜잭션 내역 페이지로 돌아가기
  const handleBackToHistory = () => {
    navigate('/transactions');
  };
  
  // 블록 익스플로러에서 보기
  const handleViewInExplorer = () => {
    if (transaction?.blockExplorerUrl) {
      window.open(transaction.blockExplorerUrl, '_blank');
    }
  };
  
  // 주소 형식화 (앞 6자와 뒤 4자만 표시)
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // 날짜 형식화
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // 상태에 따른 색상 및 아이콘
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'orange', icon: '⏳', text: '대기 중' };
      case 'confirmed':
        return { color: 'green', icon: '✅', text: '확인됨' };
      case 'failed':
        return { color: 'red', icon: '❌', text: '실패' };
      default:
        return { color: 'gray', icon: '❓', text: '알 수 없음' };
    }
  };
  
  // 타입에 따른 텍스트
  const getTypeText = (type: string) => {
    switch (type) {
      case 'send':
        return '전송';
      case 'receive':
        return '수신';
      case 'swap':
        return '스왑';
      case 'stake':
        return '스테이킹';
      case 'unstake':
        return '언스테이킹';
      case 'approve':
        return '승인';
      default:
        return '알 수 없음';
    }
  };
  
  // 로딩 중인 경우 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="transaction-details-page page">
        <Loading text="트랜잭션 정보를 불러오는 중..." />
      </div>
    );
  }
  
  // 트랜잭션이 없는 경우
  if (!transaction) {
    return (
      <div className="transaction-details-page page">
        <div className="not-found">
          <h2>트랜잭션을 찾을 수 없습니다</h2>
          <Button
            variant="primary"
            onClick={handleBackToHistory}
          >
            트랜잭션 내역으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }
  
  const statusInfo = getStatusInfo(transaction.status);
  
  return (
    <div className="transaction-details-page page">
      <div className="details-header">
        <Button
          variant="text"
          onClick={handleBackToHistory}
          className="back-button"
        >
          ← 뒤로
        </Button>
        <h1 className="page-title">트랜잭션 상세</h1>
      </div>
      
      <div className="details-content">
        <Card className="status-card">
          <div className="status-indicator" style={{ color: statusInfo.color }}>
            <span className="status-icon">{statusInfo.icon}</span>
            <span className="status-text">{statusInfo.text}</span>
          </div>
          
          <div className="transaction-type">
            {getTypeText(transaction.type)}
          </div>
          
          <div className="transaction-amount">
            {transaction.type === 'receive' ? '+' : transaction.type === 'send' ? '-' : ''}
            {transaction.amount} {transaction.symbol}
          </div>
          
          <div className="transaction-date">
            {formatDate(transaction.timestamp)}
          </div>
        </Card>
        
        <Card className="details-card">
          <div className="detail-group">
            <h3 className="detail-title">트랜잭션 정보</h3>
            
            <div className="detail-item">
              <div className="detail-label">해시</div>
              <div className="detail-value hash">{transaction.hash}</div>
            </div>
            
            {transaction.status === 'confirmed' && transaction.blockNumber && (
              <div className="detail-item">
                <div className="detail-label">블록 번호</div>
                <div className="detail-value">{transaction.blockNumber}</div>
              </div>
            )}
            
            {transaction.confirmation && (
              <div className="detail-item">
                <div className="detail-label">확인 수</div>
                <div className="detail-value">{transaction.confirmation}</div>
              </div>
            )}
            
            {transaction.nonce !== undefined && (
              <div className="detail-item">
                <div className="detail-label">Nonce</div>
                <div className="detail-value">{transaction.nonce}</div>
              </div>
            )}
            
            {transaction.status === 'failed' && transaction.errorMessage && (
              <div className="detail-item error">
                <div className="detail-label">오류 메시지</div>
                <div className="detail-value">{transaction.errorMessage}</div>
              </div>
            )}
          </div>
          
          <div className="detail-group">
            <h3 className="detail-title">주소 정보</h3>
            
            <div className="detail-item">
              <div className="detail-label">보낸 주소</div>
              <div className="detail-value address">
                {formatAddress(transaction.fromAddress)}
                <Button
                  variant="text"
                  onClick={() => navigator.clipboard.writeText(transaction.fromAddress)}
                  className="copy-btn"
                >
                  복사
                </Button>
              </div>
            </div>
            
            <div className="detail-item">
              <div className="detail-label">받는 주소</div>
              <div className="detail-value address">
                {formatAddress(transaction.toAddress)}
                <Button
                  variant="text"
                  onClick={() => navigator.clipboard.writeText(transaction.toAddress)}
                  className="copy-btn"
                >
                  복사
                </Button>
              </div>
            </div>
            
            {transaction.contractAddress && (
              <div className="detail-item">
                <div className="detail-label">컨트랙트 주소</div>
                <div className="detail-value address">
                  {formatAddress(transaction.contractAddress)}
                  <Button
                    variant="text"
                    onClick={() => navigator.clipboard.writeText(transaction.contractAddress || '')}
                    className="copy-btn"
                  >
                    복사
                  </Button>
                </div>
              </div>
            )}
            
            {transaction.tokenId && (
              <div className="detail-item">
                <div className="detail-label">토큰 ID</div>
                <div className="detail-value">{transaction.tokenId}</div>
              </div>
            )}
          </div>
          
          <div className="detail-group">
            <h3 className="detail-title">수수료 정보</h3>
            
            {transaction.fee && (
              <div className="detail-item">
                <div className="detail-label">트랜잭션 수수료</div>
                <div className="detail-value">{transaction.fee}</div>
              </div>
            )}
            
            {transaction.gasUsed && (
              <div className="detail-item">
                <div className="detail-label">사용된 가스</div>
                <div className="detail-value">{transaction.gasUsed}</div>
              </div>
            )}
            
            {transaction.gasPrice && (
              <div className="detail-item">
                <div className="detail-label">가스 가격</div>
                <div className="detail-value">{transaction.gasPrice}</div>
              </div>
            )}
          </div>
          
          {transaction.data && transaction.data !== '0x' && (
            <div className="detail-group">
              <h3 className="detail-title">데이터</h3>
              
              <div className="detail-item">
                <div className="detail-value data">{transaction.data}</div>
              </div>
            </div>
          )}
        </Card>
        
        <div className="details-actions">
          {transaction.status === 'pending' && (
            <>
              <Button
                variant="secondary"
                onClick={handleAccelerateTransaction}
                disabled={isAccelerating}
                fullWidth
              >
                {isAccelerating ? '가속 중...' : '트랜잭션 가속'}
              </Button>
              
              <Button
                variant="danger"
                onClick={handleCancelTransaction}
                disabled={isCancelling}
                fullWidth
              >
                {isCancelling ? '취소 중...' : '트랜잭션 취소'}
              </Button>
            </>
          )}
          
          {transaction.blockExplorerUrl && (
            <Button
              variant="primary"
              onClick={handleViewInExplorer}
              fullWidth
            >
              블록 익스플로러에서 보기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;