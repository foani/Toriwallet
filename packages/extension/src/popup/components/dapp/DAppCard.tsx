import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

/**
 * DApp 카드 컴포넌트 속성
 */
interface DAppCardProps {
  /**
   * DApp의 고유 ID
   */
  id: string;
  
  /**
   * DApp 이름
   */
  name: string;
  
  /**
   * DApp 설명
   */
  description: string;
  
  /**
   * DApp 아이콘 URL
   */
  icon: string;
  
  /**
   * DApp URL
   */
  url: string;
  
  /**
   * DApp 카테고리
   */
  category: string;
  
  /**
   * 사용자 즐겨찾기 여부
   */
  isFavorite: boolean;
  
  /**
   * DApp 방문 클릭 시 호출될 함수
   */
  onVisit: (id: string, url: string) => void;
  
  /**
   * 즐겨찾기 토글 시 호출될 함수
   */
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

/**
 * DApp 카드 컴포넌트
 * 
 * DApp 정보를 표시하고 방문하거나 즐겨찾기에 추가/제거할 수 있는 카드 컴포넌트입니다.
 */
const DAppCard: React.FC<DAppCardProps> = ({
  id,
  name,
  description,
  icon,
  url,
  category,
  isFavorite,
  onVisit,
  onToggleFavorite,
}) => {
  // DApp 방문 처리
  const handleVisit = () => {
    onVisit(id, url);
  };
  
  // 즐겨찾기 토글 처리
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(id, !isFavorite);
  };
  
  return (
    <Card className="dapp-card" onClick={handleVisit}>
      <div className="dapp-card-content">
        <div className="dapp-icon">
          <img src={icon} alt={`${name} 아이콘`} className="dapp-icon-image" />
        </div>
        
        <div className="dapp-info">
          <div className="dapp-name">{name}</div>
          <div className="dapp-category">{category}</div>
          <div className="dapp-description">{description}</div>
        </div>
        
        <div className="dapp-actions">
          <Button
            variant="text"
            onClick={handleToggleFavorite}
            className="favorite-button"
          >
            {isFavorite ? '★' : '☆'}
          </Button>
          
          <Button
            variant="primary"
            onClick={handleVisit}
            className="visit-button"
          >
            방문
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DAppCard;