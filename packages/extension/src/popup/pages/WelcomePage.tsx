import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

/**
 * 환영 페이지 컴포넌트
 * 
 * 사용자가 처음 지갑을 열 때 표시되는 페이지입니다.
 * 새 지갑 생성 또는 기존 지갑 가져오기 옵션을 제공합니다.
 */
const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 새 지갑 생성 페이지로 이동
  const handleCreateWallet = () => {
    navigate('/create-wallet');
  };
  
  // 지갑 가져오기 페이지로 이동
  const handleImportWallet = () => {
    navigate('/import-wallet');
  };
  
  return (
    <div className="welcome-page page">
      <div className="welcome-container">
        <div className="welcome-logo">
          <img src="/icons/icon-128.png" alt="TORI Wallet Logo" />
        </div>
        
        <h1 className="welcome-title">TORI 지갑에 오신 것을 환영합니다</h1>
        
        <p className="welcome-subtitle">
          CreataChain 생태계를 위한 안전하고 다기능 멀티체인 암호화폐 지갑
        </p>
        
        <Card className="welcome-card">
          <div className="welcome-options">
            <div className="welcome-option" onClick={handleCreateWallet}>
              <div className="welcome-option-icon">🔐</div>
              <h3 className="welcome-option-title">새 지갑 생성</h3>
              <p className="welcome-option-description">
                새로운 암호화폐 지갑을 생성합니다. 처음 사용하는 경우 이 옵션을 선택하세요.
              </p>
            </div>
            
            <div className="welcome-option" onClick={handleImportWallet}>
              <div className="welcome-option-icon">📥</div>
              <h3 className="welcome-option-title">지갑 가져오기</h3>
              <p className="welcome-option-description">
                기존 시드 구문, 개인 키 또는 JSON 파일을 사용하여 지갑을 복구합니다.
              </p>
            </div>
          </div>
        </Card>
        
        <div className="welcome-features">
          <h2 className="welcome-features-title">주요 기능</h2>
          
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon">🔄</div>
              <h3 className="feature-title">멀티체인 지원</h3>
              <p className="feature-description">
                CreataChain, Ethereum, Bitcoin, BSC, Polygon 등 다양한 블록체인 지원
              </p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🔐</div>
              <h3 className="feature-title">강력한 보안</h3>
              <p className="feature-description">
                암호화된 저장소, 생체 인증, 다중 서명 등 다양한 보안 기능
              </p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🌉</div>
              <h3 className="feature-title">크로스체인 기능</h3>
              <p className="feature-description">
                다양한 블록체인 간의 자산 전송 및 스왑 기능
              </p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">다양한 플랫폼</h3>
              <p className="feature-description">
                브라우저 확장 프로그램, 모바일 앱, 텔레그램 미니앱 등
              </p>
            </div>
          </div>
        </div>
        
        <div className="welcome-actions">
          <Button variant="primary" onClick={handleCreateWallet} fullWidth>
            시작하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
