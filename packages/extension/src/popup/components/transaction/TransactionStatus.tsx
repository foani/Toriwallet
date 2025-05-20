import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';

/**
 * 트랜잭션 상태 컴포넌트 속성
 */
interface TransactionStatusProps {
  /**
   * 트랜잭션 해시
   */
  txHash: string;
  
  /**
   * 네트워크 이름
   */
  networkName: string;
  
  /**
   * 블록 익스플로러 URL
   */
  blockExplorerUrl?: string;
  
  /**
   * 트랜잭션 타입
   */
  type: 'send' | 'receive' | 'swap' | 'approve' | 'stake' | 'unstake' | 'other';
  
  /**
   * 트랜잭션 금액
   */
  amount?: string;
  
  /**
   * 토큰 심볼
   */
  symbol?: string;
  
  /**
   * 트랜잭션 상태 폴링 간격 (밀리초)
   */
  pollingInterval?: number;
  
  /**
   * 트랜잭션 확인 시 호출될 함수
   */
  onConfirm?: () => void;
  
  /**
   * 트랜잭션 실패 시 호출될 함수
   */
  onFail?: (error: string) => void;
  
  /**
   * 트랜잭션 상태 모니터링 종료 시 호출될 함수
   */
  onDone?: () => void;
}

/**
 * 트랜잭션 상태
 */
type TransactionState = 'pending' | 'confirmed' | 'failed';

/**
 * 트랜잭션 상태 컴포넌트
 * 
 * 트랜잭션이 제출된 후 해당 트랜잭션의 상태를 모니터링하고 표시합니다.
 */
const TransactionStatus: React.FC<TransactionStatusProps> = ({
  txHash,
  networkName,
  blockExplorerUrl,
  type,
  amount,
  symbol,
  pollingInterval = 3000,
  onConfirm,
  onFail,
  onDone,
}) => {
  const navigate = useNavigate();
  
  // 트랜잭션 상태
  const [state, setState] = useState<TransactionState>('pending');
  
  // 확인 수
  const [confirmations, setConfirmations] = useState<number>(0);
  
  // 오류 메시지
  const [error, setError] = useState<string>('');
  
  // 블록 번호
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  
  // 가스 사용량
  const [gasUsed, setGasUsed] = useState<string | null>(null);
  
  // 폴링 타이머
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  
  // 트랜잭션 상태 확인 및 업데이트
  const checkTransactionStatus = async () => {
    try {
      // 백그라운드 스크립트에 요청
      // 실제 구현에서는 chrome.runtime.sendMessage 사용
      
      // 임시 구현: 랜덤하게 트랜잭션 상태 변경
      // 실제 구현 시 제거
      const randomStatus = Math.random();
      
      if (state === 'pending') {
        // 60% 확률로 확인 수 증가
        if (randomStatus < 0.6) {
          setConfirmations(prev => prev + 1);
          
          // 확인 수가 12 이상이면 확인됨 상태로 변경
          if (confirmations >= 11) {
            setState('confirmed');
            setBlockNumber(12345678);
            setGasUsed('21000');
            
            // 확인 콜백 호출
            onConfirm?.();
            
            // 타이머 정리
            if (timer) {
              clearInterval(timer);
              setTimer(null);
            }
          }
        }
        // 10% 확률로 실패 상태로 변경
        else if (randomStatus > 0.9) {
          setState('failed');
          setError('트랜잭션 실행 중 오류가 발생했습니다.');
          
          // 실패 콜백 호출
          onFail?.('트랜잭션 실행 중 오류가 발생했습니다.');
          
          // 타이머 정리
          if (timer) {
            clearInterval(timer);
            setTimer(null);
          }
        }
      }
    } catch (error) {
      console.error('트랜잭션 상태 확인 오류:', error);
    }
  };
  
  // 컴포넌트 마운트 시 폴링 시작
  useEffect(() => {
    // 초기 상태 확인
    checkTransactionStatus();
    
    // 폴링 시작
    const intervalId = setInterval(checkTransactionStatus, pollingInterval);
    setTimer(intervalId);
    
    // 컴포넌트 언마운트 시 폴링 종료
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pollingInterval, confirmations]);
  
  // 타입에 따른 텍스트
  const getTypeText = () => {
    switch (type) {
      case 'send':
        return '전송';
      case 'receive':
        return '수신';
      case 'swap':
        return '스왑';
      case 'approve':
        return '승인';
      case 'stake':
        return '스테이킹';
      case 'unstake':
        return '언스테이킹';
      case 'other':
        return '트랜잭션';
      default:
        return '트랜잭션';
    }
  };
  
  // 상태에 따른 아이콘 및 텍스트
  const getStateInfo = () => {
    switch (state) {
      case 'pending':
        return {
          icon: '⏳',
          title: '트랜잭션 진행 중',
          message: '트랜잭션이 블록체인에 제출되었으며 확인을 기다리고 있습니다.',
          color: 'orange',
        };
      case 'confirmed':
        return {
          icon: '✅',
          title: '트랜잭션 성공',
          message: '트랜잭션이 성공적으로 블록체인에 기록되었습니다.',
          color: 'green',
        };
      case 'failed':
        return {
          icon: '❌',
          title: '트랜잭션 실패',
          message: error || '알 수 없는 오류로 트랜잭션이 실패했습니다.',
          color: 'red',
        };
      default:
        return {
          icon: '❓',
          title: '알 수 없는 상태',
          message: '트랜잭션 상태를 확인할 수 없습니다.',
          color: 'gray',
        };
    }
  };
  
  // 트랜잭션 해시 형식화 (앞 6자와 뒤 4자만 표시)
  const formatTxHash = (hash: string) => {
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };
  
  // 블록 익스플로러에서 보기
  const viewInExplorer = () => {
    if (blockExplorerUrl) {
      window.open(`${blockExplorerUrl}/tx/${txHash}`, '_blank');
    }
  };
  
  // 완료 버튼 클릭 처리
  const handleDone = () => {
    // 타이머 정리
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    // 완료 콜백 호출
    onDone?.();
  };
  
  // 대시보드로 이동
  const goToDashboard = () => {
    navigate('/dashboard');
  };
  
  // 상태 정보
  const stateInfo = getStateInfo();
  
  return (
    <div className="transaction-status">
      <h2 className="status-title">{getTypeText()} {stateInfo.title}</h2>
      
      <Card className="status-card">
        <div className="status-icon" style={{ color: stateInfo.color }}>
          {stateInfo.icon}
        </div>
        
        <div className="status-info">
          <div className="status-message">
            {stateInfo.message}
          </div>
          
          {state === 'pending' && (
            <div className="confirmation-progress">
              <div className="confirmation-count">
                확인: {confirmations} / 12
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${Math.min(confirmations / 12 * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="transaction-info">
            <div className="info-item">
              <div className="info-label">트랜잭션 해시:</div>
              <div className="info-value hash">
                {formatTxHash(txHash)}
                <Button
                  variant="text"
                  onClick={() => navigator.clipboard.writeText(txHash)}
                  className="copy-btn"
                >
                  복사
                </Button>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-label">네트워크:</div>
              <div className="info-value">{networkName}</div>
            </div>
            
            {amount && symbol && (
              <div className="info-item">
                <div className="info-label">금액:</div>
                <div className="info-value">{amount} {symbol}</div>
              </div>
            )}
            
            {state === 'confirmed' && blockNumber && (
              <div className="info-item">
                <div className="info-label">블록 번호:</div>
                <div className="info-value">{blockNumber}</div>
              </div>
            )}
            
            {state === 'confirmed' && gasUsed && (
              <div className="info-item">
                <div className="info-label">사용된 가스:</div>
                <div className="info-value">{gasUsed}</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="status-actions">
          {blockExplorerUrl && (
            <Button
              variant="secondary"
              onClick={viewInExplorer}
            >
              블록 익스플로러에서 보기
            </Button>
          )}
          
          {(state === 'confirmed' || state === 'failed') && (
            <Button
              variant="primary"
              onClick={handleDone || goToDashboard}
            >
              {handleDone ? '완료' : '대시보드로 가기'}
            </Button>
          )}
        </div>
      </Card>
      
      {state === 'pending' && (
        <div className="status-info-text">
          <p>
            블록체인에서 트랜잭션을 확인하는 데 몇 분 정도 걸릴 수 있습니다.
            이 페이지를 닫아도 트랜잭션은 계속 진행됩니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionStatus;