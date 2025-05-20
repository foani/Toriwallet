import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';

/**
 * ICP 인터체인 전송 컴포넌트 속성
 */
interface ICPTransferProps {
  /**
   * 소스 체인 ID
   */
  sourceChainId: string;
  
  /**
   * 대상 체인 ID
   */
  destinationChainId: string;
  
  /**
   * 전송 가능한 토큰 목록
   */
  tokens: Array<{
    id: string;
    symbol: string;
    name: string;
    balance: string;
    decimals: number;
    icon?: string;
  }>;
  
  /**
   * 수수료 데이터
   */
  fees: {
    amount: string;
    symbol: string;
  };
  
  /**
   * 전송 클릭 시 호출될 함수
   */
  onTransfer: (data: {
    token: string;
    amount: string;
    sourceChain: string;
    destinationChain: string;
  }) => Promise<void>;
  
  /**
   * 체인 변경 시 호출될 함수
   */
  onChangeChain?: (sourceChain: string, destinationChain: string) => void;
}

/**
 * ICP 인터체인 전송 컴포넌트
 * 
 * 사용자가 Zenith Chain과 Catena Chain 간의 자산을 이동할 수 있는 컴포넌트입니다.
 */
const ICPTransfer: React.FC<ICPTransferProps> = ({
  sourceChainId,
  destinationChainId,
  tokens,
  fees,
  onTransfer,
  onChangeChain,
}) => {
  // 전송 데이터 상태
  const [formData, setFormData] = useState<{
    token: string;
    amount: string;
    sourceChain: string;
    destinationChain: string;
  }>({
    token: tokens[0]?.id || '',
    amount: '',
    sourceChain: sourceChainId,
    destinationChain: destinationChainId,
  });
  
  // 유효성 검사 상태
  const [validationErrors, setValidationErrors] = useState<{
    token?: string;
    amount?: string;
    chain?: string;
  }>({});
  
  // 전송 상태
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  
  // 전송 오류 상태
  const [transferError, setTransferError] = useState<string>('');
  
  // 토큰 데이터 가져오기
  const selectedToken = tokens.find(token => token.id === formData.token);
  
  // 체인 변경 처리
  const handleChainSwap = () => {
    const newSourceChain = formData.destinationChain;
    const newDestinationChain = formData.sourceChain;
    
    setFormData(prev => ({
      ...prev,
      sourceChain: newSourceChain,
      destinationChain: newDestinationChain,
    }));
    
    if (onChangeChain) {
      onChangeChain(newSourceChain, newDestinationChain);
    }
  };
  
  // 토큰 선택 처리
  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      token: e.target.value,
    }));
    setValidationErrors(prev => ({ ...prev, token: undefined }));
    setTransferError('');
  };
  
  // 금액 변경 처리
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // 유효한 숫자만 허용
    if (value === '' || /^(\d+)?(\.\d*)?$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        amount: value,
      }));
      setValidationErrors(prev => ({ ...prev, amount: undefined }));
      setTransferError('');
    }
  };
  
  // 최대 금액 설정
  const handleMaxAmount = () => {
    if (selectedToken) {
      setFormData(prev => ({
        ...prev,
        amount: selectedToken.balance,
      }));
      setValidationErrors(prev => ({ ...prev, amount: undefined }));
    }
  };
  
  // 전송 처리
  const handleTransfer = async () => {
    // 폼 유효성 검사
    const errors: { token?: string; amount?: string; chain?: string } = {};
    
    if (!formData.token) {
      errors.token = '토큰을 선택해주세요.';
    }
    
    if (!formData.amount) {
      errors.amount = '금액을 입력해주세요.';
    } else if (selectedToken && parseFloat(formData.amount) <= 0) {
      errors.amount = '0보다 큰 금액을 입력해주세요.';
    } else if (selectedToken && parseFloat(formData.amount) > parseFloat(selectedToken.balance)) {
      errors.amount = '잔액이 부족합니다.';
    }
    
    if (formData.sourceChain === formData.destinationChain) {
      errors.chain = '소스 체인과 대상 체인을 다르게 선택해주세요.';
    }
    
    // 오류가 있으면 표시
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      setIsTransferring(true);
      setTransferError('');
      
      // 전송 함수 호출
      await onTransfer(formData);
      
      // 성공 시 폼 초기화
      setFormData(prev => ({
        ...prev,
        amount: '',
      }));
    } catch (error) {
      console.error('전송 오류:', error);
      setTransferError(error instanceof Error ? error.message : '전송 중 오류가 발생했습니다.');
    } finally {
      setIsTransferring(false);
    }
  };
  
  // 체인 이름 가져오기
  const getChainName = (chainId: string) => {
    switch (chainId) {
      case 'zenith-mainnet':
        return 'Zenith Chain';
      case 'catena-mainnet':
        return 'Catena Chain';
      default:
        return chainId;
    }
  };
  
  return (
    <Card className="icp-transfer-card">
      <div className="transfer-header">
        <h3 className="transfer-title">ICP 인터체인 전송</h3>
      </div>
      
      <div className="transfer-content">
        <div className="chain-selection">
          <div className="source-chain">
            <div className="chain-label">보내는 체인</div>
            <div className="chain-value">{getChainName(formData.sourceChain)}</div>
          </div>
          
          <Button
            variant="text"
            onClick={handleChainSwap}
            className="swap-button"
          >
            ↔️
          </Button>
          
          <div className="destination-chain">
            <div className="chain-label">받는 체인</div>
            <div className="chain-value">{getChainName(formData.destinationChain)}</div>
          </div>
        </div>
        
        {validationErrors.chain && (
          <div className="error-message chain-error">
            {validationErrors.chain}
          </div>
        )}
        
        <div className="token-selection">
          <label htmlFor="token-select" className="token-label">토큰</label>
          <select
            id="token-select"
            value={formData.token}
            onChange={handleTokenChange}
            className="token-select"
          >
            {tokens.map(token => (
              <option key={token.id} value={token.id}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
          
          {validationErrors.token && (
            <div className="error-message">
              {validationErrors.token}
            </div>
          )}
        </div>
        
        <div className="amount-input-container">
          <div className="amount-header">
            <label htmlFor="amount-input" className="amount-label">전송 금액</label>
            {selectedToken && (
              <div className="balance-info">
                잔액: {selectedToken.balance} {selectedToken.symbol}
              </div>
            )}
          </div>
          
          <div className="amount-input-wrapper">
            <input
              type="text"
              id="amount-input"
              value={formData.amount}
              onChange={handleAmountChange}
              placeholder="금액 입력"
              className="amount-input"
            />
            
            <Button
              variant="text"
              onClick={handleMaxAmount}
              className="max-button"
            >
              최대
            </Button>
          </div>
          
          {validationErrors.amount && (
            <div className="error-message">
              {validationErrors.amount}
            </div>
          )}
        </div>
        
        <div className="fee-info">
          <div className="fee-label">전송 수수료:</div>
          <div className="fee-value">{fees.amount} {fees.symbol}</div>
        </div>
        
        {transferError && (
          <div className="transfer-error">
            {transferError}
          </div>
        )}
        
        <div className="transfer-actions">
          <Button
            variant="primary"
            onClick={handleTransfer}
            disabled={isTransferring || !formData.token || !formData.amount}
            fullWidth
          >
            {isTransferring ? (
              <div className="transferring">
                <Loading size="small" />
                <span>전송 중...</span>
              </div>
            ) : (
              '전송'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ICPTransfer;