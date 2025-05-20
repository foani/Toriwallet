import React from 'react';
import Card from '../common/Card';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  icon?: string;
  balance: string;
  value: string;
  priceChange?: {
    value: number;
    period: '24h' | '7d' | '30d';
  };
}

interface AssetsListProps {
  assets: Asset[];
  onAssetClick?: (assetId: string) => void;
  isLoading?: boolean;
}

const AssetsList: React.FC<AssetsListProps> = ({
  assets,
  onAssetClick,
  isLoading = false,
}) => {
  // 자산 클릭 핸들러
  const handleAssetClick = (assetId: string) => {
    if (onAssetClick) {
      onAssetClick(assetId);
    }
  };
  
  // 가격 변동 스타일 결정
  const getPriceChangeStyle = (change?: number) => {
    if (!change) return {};
    
    return {
      color: change >= 0 ? 'var(--success-color)' : 'var(--error-color)',
    };
  };
  
  // 가격 변동 표시 형식
  const formatPriceChange = (change?: number) => {
    if (!change) return '';
    
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };
  
  // 로딩 상태
  if (isLoading) {
    return (
      <div className="assets-loading">
        <div className="loading-skeleton" />
        <div className="loading-skeleton" />
        <div className="loading-skeleton" />
      </div>
    );
  }
  
  // 자산이 없는 경우
  if (assets.length === 0) {
    return (
      <Card className="no-assets-card">
        <div className="no-assets">
          <div className="no-assets-icon">💰</div>
          <h3 className="no-assets-title">자산 없음</h3>
          <p className="no-assets-message">
            아직 자산이 없습니다. 다른 계정에서 자산을 전송하거나 거래소에서 구매하세요.
          </p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="assets-list">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="asset-item"
          onClick={() => handleAssetClick(asset.id)}
        >
          <div className="asset-icon">
            {asset.icon ? (
              <img src={asset.icon} alt={asset.symbol} />
            ) : (
              asset.symbol.substring(0, 2)
            )}
          </div>
          
          <div className="asset-details">
            <div className="asset-name">{asset.name}</div>
            <div className="asset-balance">
              {asset.balance} {asset.symbol}
            </div>
          </div>
          
          <div className="asset-value-container">
            <div className="asset-value">{asset.value}</div>
            {asset.priceChange && (
              <div
                className="asset-price-change"
                style={getPriceChangeStyle(asset.priceChange.value)}
              >
                {formatPriceChange(asset.priceChange.value)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssetsList;
