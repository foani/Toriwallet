import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// 스타일 컴포넌트
const NFTContainer = styled.div`
  padding: 20px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: ${props => props.theme.text};
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.border};
  margin-bottom: 20px;
`;

const TabButton = styled.button<{ active?: boolean }>`
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? props.theme.primary : 'transparent'};
  color: ${props => props.active ? props.theme.primary : props.theme.text};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.primary};
  }
`;

const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  grid-gap: 20px;
  margin-top: 20px;
`;

const NFTCard = styled.div`
  background-color: ${props => props.theme.cardBackground};
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

const NFTImage = styled.div<{ bgColor?: string }>`
  height: 180px;
  background-color: ${props => props.bgColor || '#f0f0f0'};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const NFTImagePlaceholder = styled.div`
  width: 100px;
  height: 100px;
  background-color: ${props => props.theme.background};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
`;

const NFTDetails = styled.div`
  padding: 15px;
`;

const NFTName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 5px;
  color: ${props => props.theme.text};
`;

const NFTCollection = styled.p`
  font-size: 12px;
  color: ${props => props.theme.textSecondary};
  margin: 0 0 10px;
`;

const NFTPrice = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.text};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 10px;
`;

const EmptyStateText = styled.p`
  color: ${props => props.theme.textSecondary};
  font-size: 16px;
  margin-bottom: 20px;
`;

const EmptyStateButton = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme.primaryHover};
  }
`;

// NFT 컴포넌트
const NFT: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('collected');
  const [nfts, setNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 데이터 로드 (예시용)
  useEffect(() => {
    // 실제로는 walletAPI에서 데이터를 불러옴
    setTimeout(() => {
      if (activeTab === 'collected') {
        setNFTs([
          {
            id: 'nft1',
            name: 'Pixel Art #123',
            collection: 'CreataPunks',
            price: '0.5 CTA',
            color: '#FFD700'
          },
          {
            id: 'nft2',
            name: 'Space Explorer #45',
            collection: 'CosmicVoyagers',
            price: '1.2 CTA',
            color: '#4169E1'
          },
          {
            id: 'nft3',
            name: 'Digital Landscape #78',
            collection: 'VirtualWorlds',
            price: '0.8 CTA',
            color: '#2E8B57'
          },
          {
            id: 'nft4',
            name: 'Mystical Creature #32',
            collection: 'FantasyRealm',
            price: '2.5 CTA',
            color: '#9932CC'
          }
        ]);
      } else {
        // 생성 탭은 비어있는 상태
        setNFTs([]);
      }
      
      setLoading(false);
    }, 1000);
  }, [activeTab]);
  
  // 탭 변경 핸들러
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setLoading(true);
  };
  
  // NFT 가져오기 핸들러 (임시)
  const handleImportNFT = () => {
    alert('NFT 가져오기 기능은 개발 중입니다.');
  };
  
  // NFT 생성 핸들러 (임시)
  const handleCreateNFT = () => {
    alert('NFT 생성 기능은 개발 중입니다.');
  };
  
  // NFT 아이템 클릭 핸들러 (임시)
  const handleNFTClick = (nftId: string) => {
    alert(`NFT ID: ${nftId} 상세 정보는 개발 중입니다.`);
  };

  // 빈 상태 렌더링
  const renderEmptyState = () => (
    <EmptyState>
      <EmptyStateIcon>
        {activeTab === 'collected' ? '🖼️' : '🎨'}
      </EmptyStateIcon>
      <EmptyStateText>
        {activeTab === 'collected' 
          ? 'NFT 컬렉션이 비어 있습니다.' 
          : '아직 생성한 NFT가 없습니다.'}
      </EmptyStateText>
      <EmptyStateButton onClick={activeTab === 'collected' ? handleImportNFT : handleCreateNFT}>
        {activeTab === 'collected' ? 'NFT 가져오기' : 'NFT 생성하기'}
      </EmptyStateButton>
    </EmptyState>
  );

  return (
    <NFTContainer>
      <PageTitle>NFT 갤러리</PageTitle>
      
      <TabsContainer>
        <TabButton 
          active={activeTab === 'collected'} 
          onClick={() => handleTabChange('collected')}
        >
          컬렉션
        </TabButton>
        <TabButton 
          active={activeTab === 'created'} 
          onClick={() => handleTabChange('created')}
        >
          생성
        </TabButton>
      </TabsContainer>
      
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
      ) : nfts.length === 0 ? (
        renderEmptyState()
      ) : (
        <NFTGrid>
          {nfts.map(nft => (
            <NFTCard key={nft.id} onClick={() => handleNFTClick(nft.id)}>
              <NFTImage bgColor={nft.color}>
                <NFTImagePlaceholder>
                  🎨
                </NFTImagePlaceholder>
              </NFTImage>
              <NFTDetails>
                <NFTName>{nft.name}</NFTName>
                <NFTCollection>{nft.collection}</NFTCollection>
                <NFTPrice>{nft.price}</NFTPrice>
              </NFTDetails>
            </NFTCard>
          ))}
        </NFTGrid>
      )}
    </NFTContainer>
  );
};

export default NFT;
