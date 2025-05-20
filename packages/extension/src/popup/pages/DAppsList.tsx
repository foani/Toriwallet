import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import DAppCard from '../components/dapp/DAppCard';

/**
 * DApps 목록 페이지 컴포넌트
 * 
 * 사용자가 인기있는 DApp을 탐색하고 방문할 수 있는 페이지입니다.
 */
const DAppsList: React.FC = () => {
  const navigate = useNavigate();
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // dApp 목록
  const [dapps, setDapps] = useState<Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    url: string;
    category: string;
    isFavorite: boolean;
  }>>([]);
  
  // 검색어
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // 현재 카테고리
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  
  // 즐겨찾기만 표시
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  
  // 표시할 dApp 목록 (필터링)
  const filteredDapps = dapps.filter(dapp => {
    // 검색어 필터링
    const matchesSearch = searchQuery === '' || 
      dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dapp.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 카테고리 필터링
    const matchesCategory = currentCategory === 'all' || dapp.category === currentCategory;
    
    // 즐겨찾기 필터링
    const matchesFavorite = !showFavoritesOnly || dapp.isFavorite;
    
    return matchesSearch && matchesCategory && matchesFavorite;
  });
  
  // 카테고리 목록
  const categories = [
    { id: 'all', name: '전체' },
    { id: 'defi', name: 'DeFi' },
    { id: 'nft', name: 'NFT' },
    { id: 'game', name: '게임' },
    { id: 'exchange', name: '거래소' },
    { id: 'social', name: '소셜' },
    { id: 'tools', name: '도구' },
  ];
  
  // 초기 데이터 로드
  useEffect(() => {
    const loadDapps = async () => {
      try {
        setIsLoading(true);
        
        // 백그라운드 스크립트에 dApp 목록 요청
        // 실제 구현에서는 chrome.runtime.sendMessage 사용
        
        // 임시 구현: 가상 데이터
        // 실제 구현 시 제거
        setTimeout(() => {
          const mockDapps = [
            {
              id: 'app1',
              name: 'CreataSwap',
              description: 'CreataChain의 탈중앙화 거래소',
              icon: 'https://via.placeholder.com/48',
              url: 'https://creataswap.example.com',
              category: 'defi',
              isFavorite: true,
            },
            {
              id: 'app2',
              name: 'TORI NFT',
              description: 'NFT 마켓플레이스',
              icon: 'https://via.placeholder.com/48',
              url: 'https://torinft.example.com',
              category: 'nft',
              isFavorite: false,
            },
            {
              id: 'app3',
              name: 'CTA Lend',
              description: '대출 및 차입 플랫폼',
              icon: 'https://via.placeholder.com/48',
              url: 'https://ctalend.example.com',
              category: 'defi',
              isFavorite: false,
            },
            {
              id: 'app4',
              name: 'CreataGame',
              description: '블록체인 게임 플랫폼',
              icon: 'https://via.placeholder.com/48',
              url: 'https://creatagame.example.com',
              category: 'game',
              isFavorite: true,
            },
            {
              id: 'app5',
              name: 'CreataEx',
              description: '중앙화 거래소',
              icon: 'https://via.placeholder.com/48',
              url: 'https://creataex.example.com',
              category: 'exchange',
              isFavorite: false,
            },
            {
              id: 'app6',
              name: 'CreataSocial',
              description: '블록체인 소셜 네트워크',
              icon: 'https://via.placeholder.com/48',
              url: 'https://creatasocial.example.com',
              category: 'social',
              isFavorite: false,
            },
            {
              id: 'app7',
              name: 'CTA Tools',
              description: '블록체인 도구 모음',
              icon: 'https://via.placeholder.com/48',
              url: 'https://ctatools.example.com',
              category: 'tools',
              isFavorite: false,
            },
          ];
          setDapps(mockDapps);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('DApps 로드 오류:', error);
        setIsLoading(false);
      }
    };
    
    loadDapps();
  }, []);
  
  // 검색어 변경 처리
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // 카테고리 변경 처리
  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
  };
  
  // 즐겨찾기 필터 토글
  const handleFavoritesToggle = () => {
    setShowFavoritesOnly(!showFavoritesOnly);
  };
  
  // dApp 방문 처리
  const handleVisitDApp = (id: string, url: string) => {
    navigate('/dapp-browser', { state: { url } });
  };
  
  // 즐겨찾기 토글 처리
  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    // 백그라운드 스크립트에 즐겨찾기 토글 요청
    // 실제 구현에서는 chrome.runtime.sendMessage 사용
    
    // 상태 업데이트
    setDapps(prev =>
      prev.map(dapp =>
        dapp.id === id ? { ...dapp, isFavorite } : dapp
      )
    );
  };
  
  // URL 입력 처리
  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 입력된 URL 확인
    const input = e.currentTarget.elements.namedItem('dappUrl') as HTMLInputElement;
    
    if (input?.value) {
      // URL 형식 검증
      let url = input.value.trim();
      
      // URL 프로토콜이 없는 경우 추가
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // DApp 브라우저로 이동
      navigate('/dapp-browser', { state: { url } });
    }
  };
  
  // 대시보드로 돌아가기
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  // 로딩 중인 경우 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="dapps-list-page page">
        <Loading text="DApps를 불러오는 중..." />
      </div>
    );
  }
  
  return (
    <div className="dapps-list-page page">
      <div className="dapps-header">
        <Button
          variant="text"
          onClick={handleBackToDashboard}
          className="back-button"
        >
          ← 뒤로
        </Button>
        <h1 className="page-title">DApps</h1>
      </div>
      
      <div className="dapps-content">
        <div className="search-section">
          <form onSubmit={handleUrlSubmit} className="url-form">
            <input
              type="text"
              name="dappUrl"
              placeholder="URL 입력 또는 검색"
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            <Button
              variant="primary"
              type="submit"
              className="go-button"
            >
              이동
            </Button>
          </form>
        </div>
        
        <div className="categories-section">
          <div className="categories-container">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={currentCategory === category.id ? 'primary' : 'secondary'}
                onClick={() => handleCategoryChange(category.id)}
                className="category-button"
              >
                {category.name}
              </Button>
            ))}
            
            <Button
              variant={showFavoritesOnly ? 'primary' : 'secondary'}
              onClick={handleFavoritesToggle}
              className="favorites-button"
            >
              ★ 즐겨찾기
            </Button>
          </div>
        </div>
        
        <div className="dapps-grid">
          {filteredDapps.length === 0 ? (
            <Card className="no-dapps-card">
              <div className="no-dapps">
                <div className="no-dapps-icon">🔍</div>
                <h3 className="no-dapps-title">DApp 없음</h3>
                <p className="no-dapps-message">
                  현재 필터 조건에 맞는 DApp이 없습니다.
                </p>
              </div>
            </Card>
          ) : (
            filteredDapps.map(dapp => (
              <DAppCard
                key={dapp.id}
                id={dapp.id}
                name={dapp.name}
                description={dapp.description}
                icon={dapp.icon}
                url={dapp.url}
                category={dapp.category}
                isFavorite={dapp.isFavorite}
                onVisit={handleVisitDApp}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          )}
        </div>
      </div>
      
      <div className="dapps-nav">
        <div className="nav">
          <div className="nav-item" onClick={() => navigate('/dashboard')}>
            <div className="nav-icon">💼</div>
            <div className="nav-label">지갑</div>
          </div>
          <div className="nav-item" onClick={() => navigate('/nft')}>
            <div className="nav-icon">🖼️</div>
            <div className="nav-label">NFT</div>
          </div>
          <div className="nav-item" onClick={() => navigate('/staking')}>
            <div className="nav-icon">📈</div>
            <div className="nav-label">스테이킹</div>
          </div>
          <div className="nav-item active">
            <div className="nav-icon">🔍</div>
            <div className="nav-label">dApps</div>
          </div>
          <div className="nav-item" onClick={() => navigate('/settings')}>
            <div className="nav-icon">⚙️</div>
            <div className="nav-label">설정</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DAppsList;