import React from 'react';

export type TransactionType = 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'approve';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

interface TransactionItemProps {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: number;
  fromAddress: string;
  toAddress: string;
  amount: string;
  symbol: string;
  fee?: string;
  hash: string;
  blockExplorerUrl?: string;
  onClick?: (id: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  id,
  type,
  status,
  timestamp,
  fromAddress,
  toAddress,
  amount,
  symbol,
  fee,
  hash,
  blockExplorerUrl,
  onClick,
}) => {
  // 트랜잭션 클릭 핸들러
  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };
  
  // 트랜잭션 타입 아이콘 및 텍스트
  const getTransactionTypeInfo = () => {
    switch (type) {
      case 'send':
        return {
          icon: '↑',
          text: '전송',
          className: 'transaction-send',
        };
      case 'receive':
        return {
          icon: '↓',
          text: '수신',
          className: 'transaction-receive',
        };
      case 'swap':
        return {
          icon: '⇄',
          text: '스왑',
          className: 'transaction-swap',
        };
      case 'stake':
        return {
          icon: '⊕',
          text: '스테이킹',
          className: 'transaction-stake',
        };
      case 'unstake':
        return {
          icon: '⊖',
          text: '언스테이킹',
          className: 'transaction-unstake',
        };
      case 'approve':
        return {
          icon: '✓',
          text: '승인',
          className: 'transaction-approve',
        };
      default:
        return {
          icon: '•',
          text: '거래',
          className: '',
        };
    }
  };
  
  // 트랜잭션 상태 스타일 및 텍스트
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          className: 'transaction-pending',
          text: '진행 중',
        };
      case 'confirmed':
        return {
          className: 'transaction-confirmed',
          text: '완료',
        };
      case 'failed':
        return {
          className: 'transaction-failed',
          text: '실패',
        };
      default:
        return {
          className: '',
          text: '',
        };
    }
  };
  
  // 날짜 포맷팅
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // 주소 축약 (0x1234...5678 형식)
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const { icon, text, className } = getTransactionTypeInfo();
  const { className: statusClassName, text: statusText } = getStatusInfo();
  
  return (
    <div className={`transaction-item ${className}`} onClick={handleClick}>
      <div className="transaction-icon">{icon}</div>
      
      <div className="transaction-details">
        <div className="transaction-header">
          <div className="transaction-type">{text}</div>
          <div className={`transaction-status ${statusClassName}`}>
            {statusText}
          </div>
        </div>
        
        <div className="transaction-info">
          <div className="transaction-date">{formatDate(timestamp)}</div>
          <div className="transaction-addresses">
            {type === 'send' ? '보낸 주소' : '받는 주소'}: {shortenAddress(type === 'send' ? toAddress : fromAddress)}
          </div>
        </div>
      </div>
      
      <div className="transaction-amount">
        {type === 'send' ? '-' : '+'}{amount} {symbol}
        {fee && (
          <div className="transaction-fee">
            수수료: {fee}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;
