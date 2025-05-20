import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';

/**
 * 크로스체인 브릿지 폼 컴포넌트 속성
 */
interface BridgeFormProps {
  /**
   * 소스 체인 목록
   */
  sourceChains: Array<{
    id: string;
    name: string;
    logo?: string;
  }>;
  
  /**
   * 대상 체인 목록
   */
  destinationChains: Array<{
    id: string;
    name: string;
    logo?: string;
  }>;
  
  /**
   * 전송 가능한 토큰 목록
   */
  tokens: Array<{
    id: string;
    symbol: string;
    name: string;
    networks: string[];
    balance: { [chainId: string]: string };
    decimals: number;
    icon?: string;
  }>;
  
  /**
   * 브릿지 제공자 목록
   */
  providers: Array<{
    id: string;
    name: string;
    logo?: string;
    supportedRoutes: Array<{
      sourceChain: string;
      destinationChain: string;
      tokens: string[];
    }>;
    fees: { [token: string]: string };
    estimatedTime: { [route: string]: string };
  }>;
  
  /**
   * 폼 제출 시 호출될 함수
   */
  onSubmit: (data: {
    sourceChain: string;
    destinationChain: string;
    token: string;
    amount: string;
    provider: string;
  }) => Promise<void>;
}

/**
 * 크로스체인 브릿지 폼 컴포넌트
 * 
 * 사용자가 다양한 체인 간의 자산을 브릿지할 수 있는 폼 컴포넌트입니다.
 */
const BridgeForm: React.FC<BridgeFormProps> = ({
  sourceChains,
  destinationChains,
  tokens,
  providers,
  onSubmit,
}) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<{
    sourceChain: string;
    destinationChain: string;
    token: string;
    amount: string;
    provider: string;
  }>({
    sourceChain: sourceChains[0]?.id || '',
    destinationChain: '',
    token: '',
    amount: '',
    provider: '',
  });
  
  // 필터링된 대상 체인
  const [filteredDestinations, setFilteredDestinations] = useState<typeof destinationChains>([]);
  
  // 필터링된 토큰
  const [filteredTokens, setFilteredTokens] = useState<typeof tokens>([]);
  
  // 필터링된 제공자
  const [filteredProviders, setFilteredProviders] = useState<typeof providers>([]);
  
  // 유효성 검사 상태
  const [errors, setErrors] = useState<{
    sourceChain?: string;
    destinationChain?: string;
    token?: string;
    amount?: string;
    provider?: string;
  }>({});
  
  // 브릿징 상태
  const [isBridging, setIsBridging] = useState<boolean>(false);
  
  // 오류 메시지
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // 소스 체인 변경 시 대상 체인, 토큰, 제공자 필터링
  useEffect(() => {
    if (formData.sourceChain) {
      // 소스 체인에서 지원하는 대상 체인 필터링
      const availableDestinations = destinationChains.filter(chain => {
        // 소스 체인과 동일하지 않고, 적어도 하나의 제공자가 이 경로를 지원하는지 확인
        return chain.id !== formData.sourceChain && providers.some(provider => 
          provider.supportedRoutes.some(route => 
            route.sourceChain === formData.sourceChain && 
            route.destinationChain === chain.id
          )
        );
      });
      
      setFilteredDestinations(availableDestinations);
      
      // 대상 체인이 필터링된 목록에 없으면 초기화
      if (
        formData.destinationChain && 
        !availableDestinations.some(chain => chain.id === formData.destinationChain)
      ) {
        setFormData(prev => ({
          ...prev,
          destinationChain: availableDestinations[0]?.id || '',
          token: '',
          provider: '',
        }));
      }
    }
  }, [formData.sourceChain, destinationChains, providers]);
  
  // 소스 체인 및 대상 체인 변경 시 토큰 필터링
  useEffect(() => {
    if (formData.sourceChain && formData.destinationChain) {
      // 이 경로에서 지원하는 토큰 필터링
      const availableTokens = tokens.filter(token => {
        // 소스 체인과 대상 체인을 모두 지원하는 토큰인지 확인
        return (
          token.networks.includes(formData.sourceChain) &&
          token.networks.includes(formData.destinationChain) &&
          // 적어도 하나의 제공자가 이 경로와 토큰을 지원하는지 확인
          providers.some(provider => 
            provider.supportedRoutes.some(route => 
              route.sourceChain === formData.sourceChain && 
              route.destinationChain === formData.destinationChain &&
              route.tokens.includes(token.id)
            )
          )
        );
      });
      
      setFilteredTokens(availableTokens);
      
      // 토큰이 필터링된 목록에 없으면 초기화
      if (
        formData.token && 
        !availableTokens.some(token => token.id === formData.token)
      ) {
        setFormData(prev => ({
          ...prev,
          token: availableTokens[0]?.id || '',
          provider: '',
        }));
      }
    }
  }, [formData.sourceChain, formData.destinationChain, tokens, providers]);
  
  // 소스 체인, 대상 체인, 토큰 변경 시 제공자 필터링
  useEffect(() => {
    if (formData.sourceChain && formData.destinationChain && formData.token) {
      // 이 경로와 토큰을 지원하는 제공자 필터링
      const availableProviders = providers.filter(provider => 
        provider.supportedRoutes.some(route => 
          route.sourceChain === formData.sourceChain && 
          route.destinationChain === formData.destinationChain &&
          route.tokens.includes(formData.token)
        )
      );
      
      setFilteredProviders(availableProviders);
      
      // 제공자가 필터링된 목록에 없으면 초기화
      if (
        formData.provider && 
        !availableProviders.some(provider => provider.id === formData.provider)
      ) {
        setFormData(prev => ({
          ...prev,
          provider: availableProviders[0]?.id || '',
        }));
      }
      
      // 제공자가 초기화되지 않았고 필터링된 목록에 적어도 하나가 있으면 첫 번째로 설정
      if (!formData.provider && availableProviders.length > 0) {
        setFormData(prev => ({
          ...prev,
          provider: availableProviders[0]?.id || '',
        }));
      }
    }
  }, [formData.sourceChain, formData.destinationChain, formData.token, providers]);
  
  // 소스 체인 변경 처리
  const handleSourceChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      sourceChain: e.target.value,
      destinationChain: '',
      token: '',
      provider: '',
    }));
    setErrors(prev => ({ ...prev, sourceChain: undefined }));
    setErrorMessage('');
  };
  
  // 대상 체인 변경 처리
  const handleDestinationChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      destinationChain: e.target.value,
      token: '',
      provider: '',
    }));
    setErrors(prev => ({ ...prev, destinationChain: undefined }));
    setErrorMessage('');
  };
  
  // 토큰 변경 처리
  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      token: e.target.value,
      provider: '',
    }));
    setErrors(prev => ({ ...prev, token: undefined }));
    setErrorMessage('');
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
      setErrors(prev => ({ ...prev, amount: undefined }));
      setErrorMessage('');
    }
  };
  
  // 제공자 변경 처리
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      provider: e.target.value,
    }));
    setErrors(prev => ({ ...prev, provider: undefined }));
    setErrorMessage('');
  };
  
  // 체인 스왑 처리
  const handleSwapChains = () => {
    if (formData.sourceChain && formData.destinationChain) {
      setFormData(prev => ({
        ...prev,
        sourceChain: prev.destinationChain,
        destinationChain: prev.sourceChain,
        token: '',
        provider: '',
      }));
      setErrors({});
      setErrorMessage('');
    }
  };
  
  // 최대 금액 설정
  const handleMaxAmount = () => {
    if (formData.sourceChain && formData.token) {
      const selectedToken = tokens.find(t => t.id === formData.token);
      if (selectedToken && selectedToken.balance[formData.sourceChain]) {
        setFormData(prev => ({
          ...prev,
          amount: selectedToken.balance[formData.sourceChain],
        }));
        setErrors(prev => ({ ...prev, amount: undefined }));
      }
    }
  };
  
  // 폼 제출 처리
  const handleSubmit = async () => {
    // 유효성 검사
    const validationErrors: typeof errors = {};
    
    if (!formData.sourceChain) {
      validationErrors.sourceChain = '보내는 체인을 선택해주세요.';
    }
    
    if (!formData.destinationChain) {
      validationErrors.destinationChain = '받는 체인을 선택해주세요.';
    }
    
    if (!formData.token) {
      validationErrors.token = '토큰을 선택해주세요.';
    }
    
    if (!formData.amount) {
      validationErrors.amount = '금액을 입력해주세요.';
    } else if (parseFloat(formData.amount) <= 0) {
      validationErrors.amount = '0보다 큰 금액을 입력해주세요.';
    } else {
      // 잔액 확인
      const selectedToken = tokens.find(t => t.id === formData.token);
      if (
        selectedToken && 
        selectedToken.balance[formData.sourceChain] && 
        parseFloat(formData.amount) > parseFloat(selectedToken.balance[formData.sourceChain])
      ) {
        validationErrors.amount = '잔액이 부족합니다.';
      }
    }
    
    if (!formData.provider) {
      validationErrors.provider = '브릿지 제공자를 선택해주세요.';
    }
    
    // 오류가 있으면 표시
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setIsBridging(true);
      setErrorMessage('');
      
      // 폼 제출
      await onSubmit(formData);
      
      // 성공 시 금액 초기화
      setFormData(prev => ({
        ...prev,
        amount: '',
      }));
    } catch (error) {
      console.error('브릿징 오류:', error);
      setErrorMessage(error instanceof Error ? error.message : '브릿징 중 오류가 발생했습니다.');
    } finally {
      setIsBridging(false);
    }
  };
  
  // 선택된 토큰, 제공자 정보
  const selectedToken = tokens.find(t => t.id === formData.token);
  const selectedProvider = providers.find(p => p.id === formData.provider);
  
  // 수수료 정보
  const fee = selectedToken && selectedProvider 
    ? selectedProvider.fees[selectedToken.id] 
    : '';
  
  // 소요 시간 정보
  const estimatedTime = selectedProvider && formData.sourceChain && formData.destinationChain
    ? selectedProvider.estimatedTime[`${formData.sourceChain}-${formData.destinationChain}`]
    : '';
  
  return (
    <Card className="bridge-form-card">
      <div className="bridge-header">
        <h3 className="bridge-title">크로스체인 브릿지</h3>
      </div>
      
      <div className="bridge-content">
        <div className="chain-selection">
          <div className="source-chain-select">
            <label htmlFor="source-chain" className="chain-label">보내는 체인</label>
            <select
              id="source-chain"
              value={formData.sourceChain}
              onChange={handleSourceChainChange}
              className="chain-select"
            >
              {sourceChains.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
            {errors.sourceChain && (
              <div className="error-message">
                {errors.sourceChain}
              </div>
            )}
          </div>
          
          <Button
            variant="text"
            onClick={handleSwapChains}
            disabled={!formData.sourceChain || !formData.destinationChain}
            className="swap-button"
          >
            ↔️
          </Button>
          
          <div className="destination-chain-select">
            <label htmlFor="destination-chain" className="chain-label">받는 체인</label>
            <select
              id="destination-chain"
              value={formData.destinationChain}
              onChange={handleDestinationChainChange}
              className="chain-select"
              disabled={filteredDestinations.length === 0}
            >
              <option value="">선택하세요</option>
              {filteredDestinations.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
            {errors.destinationChain && (
              <div className="error-message">
                {errors.destinationChain}
              </div>
            )}
          </div>
        </div>
        
        <div className="token-selection">
          <label htmlFor="token-select" className="token-label">토큰</label>
          <select
            id="token-select"
            value={formData.token}
            onChange={handleTokenChange}
            className="token-select"
            disabled={!formData.destinationChain || filteredTokens.length === 0}
          >
            <option value="">선택하세요</option>
            {filteredTokens.map(token => (
              <option key={token.id} value={token.id}>
                {token.symbol} - {token.name}
              </option>
            ))}
          </select>
          {errors.token && (
            <div className="error-message">
              {errors.token}
            </div>
          )}
        </div>
        
        {selectedToken && (
          <div className="amount-input-container">
            <div className="amount-header">
              <label htmlFor="amount-input" className="amount-label">전송 금액</label>
              <div className="balance-info">
                잔액: {selectedToken.balance[formData.sourceChain] || '0'} {selectedToken.symbol}
              </div>
            </div>
            
            <div className="amount-input-wrapper">
              <input
                type="text"
                id="amount-input"
                value={formData.amount}
                onChange={handleAmountChange}
                placeholder="금액 입력"
                className="amount-input"
                disabled={!formData.token}
              />
              
              <Button
                variant="text"
                onClick={handleMaxAmount}
                className="max-button"
                disabled={!formData.token || !selectedToken.balance[formData.sourceChain]}
              >
                최대
              </Button>
            </div>
            
            {errors.amount && (
              <div className="error-message">
                {errors.amount}
              </div>
            )}
          </div>
        )}
        
        <div className="provider-selection">
          <label htmlFor="provider-select" className="provider-label">브릿지 제공자</label>
          <select
            id="provider-select"
            value={formData.provider}
            onChange={handleProviderChange}
            className="provider-select"
            disabled={!formData.token || filteredProviders.length === 0}
          >
            <option value="">선택하세요</option>
            {filteredProviders.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
          {errors.provider && (
            <div className="error-message">
              {errors.provider}
            </div>
          )}
        </div>
        
        {selectedProvider && (
          <div className="bridge-info">
            {fee && (
              <div className="fee-info">
                <div className="info-label">수수료:</div>
                <div className="info-value">{fee} {selectedToken?.symbol}</div>
              </div>
            )}
            
            {estimatedTime && (
              <div className="time-info">
                <div className="info-label">예상 소요 시간:</div>
                <div className="info-value">{estimatedTime}</div>
              </div>
            )}
          </div>
        )}
        
        {errorMessage && (
          <div className="bridge-error">
            {errorMessage}
          </div>
        )}
        
        <div className="bridge-actions">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={
              isBridging || 
              !formData.sourceChain || 
              !formData.destinationChain || 
              !formData.token || 
              !formData.amount || 
              !formData.provider
            }
            fullWidth
          >
            {isBridging ? (
              <div className="bridging">
                <Loading size="small" />
                <span>브릿징 중...</span>
              </div>
            ) : (
              '브릿지'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BridgeForm;