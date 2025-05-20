import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  icon?: string;
  balance: string;
  decimals: number;
}

interface SendFormProps {
  assets: Asset[];
  selectedAsset?: string;
  networkSymbol: string;
  networkName: string;
  gasPrice?: string;
  maxFee?: string;
  onSend: (data: {
    to: string;
    amount: string;
    assetId: string;
    gasPrice?: string;
    gasLimit?: string;
    memo?: string;
  }) => Promise<void>;
  onScanQrCode?: () => Promise<string>;
}

const SendForm: React.FC<SendFormProps> = ({
  assets,
  selectedAsset,
  networkSymbol,
  networkName,
  gasPrice,
  maxFee,
  onSend,
  onScanQrCode,
}) => {
  // 폼 상태
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [assetId, setAssetId] = useState(selectedAsset || '');
  const [memo, setMemo] = useState('');
  const [customGasPrice, setCustomGasPrice] = useState(gasPrice || '');
  const [gasLimit, setGasLimit] = useState('21000'); // 기본값

  // 고급 옵션 표시 상태
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // 오류 상태
  const [errors, setErrors] = useState({
    recipient: '',
    amount: '',
    asset: '',
    gasPrice: '',
    gasLimit: '',
  });
  
  // 전송 중 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 선택된 자산이 바뀌면 상태 업데이트
  useEffect(() => {
    if (selectedAsset) {
      setAssetId(selectedAsset);
    } else if (assets.length > 0 && !assetId) {
      setAssetId(assets[0].id);
    }
  }, [selectedAsset, assets, assetId]);
  
  // 선택된 자산 정보 가져오기
  const getSelectedAsset = () => {
    return assets.find((asset) => asset.id === assetId);
  };
  
  // QR 코드 스캔
  const handleScanQrCode = async () => {
    if (onScanQrCode) {
      try {
        const address = await onScanQrCode();
        setRecipient(address);
      } catch (error) {
        console.error('QR 코드 스캔 오류:', error);
      }
    }
  };
  
  // 최대 금액 설정
  const handleSetMaxAmount = () => {
    const asset = getSelectedAsset();
    if (asset) {
      setAmount(asset.balance);
    }
  };
  
  // 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'recipient':
        setRecipient(value);
        // 입력값이 바뀌면 해당 필드의 에러 초기화
        if (errors.recipient) {
          setErrors((prev) => ({ ...prev, recipient: '' }));
        }
        break;
        
      case 'amount':
        // 숫자와 소수점만 허용
        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
          setAmount(value);
          if (errors.amount) {
            setErrors((prev) => ({ ...prev, amount: '' }));
          }
        }
        break;
        
      case 'assetId':
        setAssetId(value);
        if (errors.asset) {
          setErrors((prev) => ({ ...prev, asset: '' }));
        }
        break;
        
      case 'memo':
        setMemo(value);
        break;
        
      case 'gasPrice':
        // 숫자만 허용
        if (value === '' || /^[0-9]*$/.test(value)) {
          setCustomGasPrice(value);
          if (errors.gasPrice) {
            setErrors((prev) => ({ ...prev, gasPrice: '' }));
          }
        }
        break;
        
      case 'gasLimit':
        // 숫자만 허용
        if (value === '' || /^[0-9]*$/.test(value)) {
          setGasLimit(value);
          if (errors.gasLimit) {
            setErrors((prev) => ({ ...prev, gasLimit: '' }));
          }
        }
        break;
    }
  };
  
  // 폼 검증
  const validateForm = () => {
    const newErrors = {
      recipient: '',
      amount: '',
      asset: '',
      gasPrice: '',
      gasLimit: '',
    };
    let isValid = true;
    
    // 수신자 주소 검증
    if (!recipient) {
      newErrors.recipient = '수신자 주소를 입력하세요';
      isValid = false;
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      newErrors.recipient = '유효한 이더리움 주소를 입력하세요';
      isValid = false;
    }
    
    // 금액 검증
    if (!amount) {
      newErrors.amount = '금액을 입력하세요';
      isValid = false;
    } else {
      const selectedAsset = getSelectedAsset();
      if (selectedAsset && parseFloat(amount) > parseFloat(selectedAsset.balance)) {
        newErrors.amount = '잔액이 부족합니다';
        isValid = false;
      } else if (parseFloat(amount) <= 0) {
        newErrors.amount = '0보다 큰 금액을 입력하세요';
        isValid = false;
      }
    }
    
    // 자산 검증
    if (!assetId) {
      newErrors.asset = '자산을 선택하세요';
      isValid = false;
    }
    
    // 가스 가격 검증 (고급 옵션이 표시된 경우)
    if (showAdvanced) {
      if (customGasPrice && parseInt(customGasPrice) <= 0) {
        newErrors.gasPrice = '0보다 큰 가스 가격을 입력하세요';
        isValid = false;
      }
      
      if (!gasLimit) {
        newErrors.gasLimit = '가스 한도를 입력하세요';
        isValid = false;
      } else if (parseInt(gasLimit) < 21000) {
        newErrors.gasLimit = '최소 가스 한도는 21000입니다';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await onSend({
        to: recipient,
        amount,
        assetId,
        gasPrice: showAdvanced ? customGasPrice : undefined,
        gasLimit: showAdvanced ? gasLimit : undefined,
        memo: memo || undefined,
      });
      
      // 성공 후 폼 초기화
      setRecipient('');
      setAmount('');
      setMemo('');
    } catch (error) {
      console.error('전송 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const selectedAssetInfo = getSelectedAsset();
  
  return (
    <form onSubmit={handleSubmit} className="send-form">
      <div className="form-section">
        <Input
          label="받는 주소"
          name="recipient"
          value={recipient}
          onChange={handleInputChange}
          error={!!errors.recipient}
          errorText={errors.recipient}
          fullWidth
          placeholder="0x..."
          endAdornment={
            onScanQrCode && (
              <button
                type="button"
                className="scan-qr-button"
                onClick={handleScanQrCode}
                aria-label="QR 코드 스캔"
              >
                📷
              </button>
            )
          }
        />
      </div>
      
      <div className="form-section">
        <div className="amount-input-container">
          <Input
            label="금액"
            name="amount"
            value={amount}
            onChange={handleInputChange}
            error={!!errors.amount}
            errorText={errors.amount}
            fullWidth
            placeholder="0.0"
            endAdornment={
              <button
                type="button"
                className="max-amount-button"
                onClick={handleSetMaxAmount}
                aria-label="최대 금액"
              >
                MAX
              </button>
            }
          />
          
          <div className="asset-selector">
            <label htmlFor="assetId" className="form-label">
              자산
            </label>
            <select
              id="assetId"
              name="assetId"
              value={assetId}
              onChange={handleInputChange}
              className={`asset-select ${errors.asset ? 'input-error' : ''}`}
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.symbol} - {asset.balance} 가능
                </option>
              ))}
            </select>
            {errors.asset && (
              <span className="form-helper form-helper-error">{errors.asset}</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="form-section">
        <Input
          label="메모 (선택사항)"
          name="memo"
          value={memo}
          onChange={handleInputChange}
          fullWidth
          placeholder="메모를 입력하세요 (수신자에게 표시됨)"
        />
      </div>
      
      <div className="form-section">
        <div
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span>고급 옵션</span>
          <span className="toggle-icon">{showAdvanced ? '▲' : '▼'}</span>
        </div>
        
        {showAdvanced && (
          <div className="advanced-options">
            <Input
              label="가스 가격 (Gwei)"
              name="gasPrice"
              value={customGasPrice}
              onChange={handleInputChange}
              error={!!errors.gasPrice}
              errorText={errors.gasPrice}
              fullWidth
              placeholder={gasPrice || '자동'}
              helperText={`제안된 가스 가격: ${gasPrice || 'N/A'} Gwei`}
            />
            
            <Input
              label="가스 한도"
              name="gasLimit"
              value={gasLimit}
              onChange={handleInputChange}
              error={!!errors.gasLimit}
              errorText={errors.gasLimit}
              fullWidth
              placeholder="21000"
              helperText="기본 전송의 경우 21000"
            />
            
            {customGasPrice && gasLimit && (
              <div className="gas-fee-estimate">
                <span>최대 네트워크 수수료:</span>
                <span>
                  {(parseFloat(customGasPrice) * parseFloat(gasLimit) / 1e9).toFixed(8)}{' '}
                  {networkSymbol}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Card className="summary-card">
        <div className="summary-item">
          <span className="summary-label">네트워크</span>
          <span className="summary-value">{networkName}</span>
        </div>
        
        {selectedAssetInfo && (
          <div className="summary-item">
            <span className="summary-label">자산</span>
            <span className="summary-value">
              {selectedAssetInfo.name} ({selectedAssetInfo.symbol})
            </span>
          </div>
        )}
        
        {amount && (
          <div className="summary-item">
            <span className="summary-label">전송 금액</span>
            <span className="summary-value">
              {amount} {selectedAssetInfo?.symbol || ''}
            </span>
          </div>
        )}
        
        {maxFee && (
          <div className="summary-item">
            <span className="summary-label">최대 수수료</span>
            <span className="summary-value">
              {maxFee} {networkSymbol}
            </span>
          </div>
        )}
      </Card>
      
      <div className="send-actions">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          {isSubmitting ? '처리 중...' : '전송'}
        </Button>
      </div>
    </form>
  );
};

export default SendForm;
