import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import ReceiveModal from '../components/wallet/ReceiveModal';
import NetworkSelector from '../components/wallet/NetworkSelector';
import AccountSelector from '../components/wallet/AccountSelector';

/**
 * 자산 수신 페이지 컴포넌트
 * 
 * 사용자의 지갑 주소를 표시하고 QR 코드를 생성하여
 * 다른 사용자가 자산을 전송할 수 있도록 합니다.
 */
const Receive: React.FC = () => {
  const navigate = useNavigate();
  
  // 계정 상태
  const [accounts, setAccounts] = useState<Array<{ address: string; name: string }>>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  
  // 네트워크 상태
  const [networks, setNetworks] = useState<Array<{
    id: string;
    name: string;
    chainId: number;
    rpcUrl: string;
    symbol: string;
    blockExplorerUrl?: string;
    isTestnet?: boolean;
    isCustom?: boolean;
  }>>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // 주소 복사 상태
  const [copied, setCopied] = useState<boolean>(false);
  
  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 백그라운드 스크립트에 데이터 요청
        // 실제 구현에서는 chrome.runtime.sendMessage 사용
        
        // 임시 구현: 가상 데이터 생성
        // 실제 구현 시 제거
        setTimeout(() => {
          // 계정 목록
          const mockAccounts = [
            { address: '0x1234567890123456789012345678901234567890', name: '계정 1' },
            { address: '0x2345678901234567890123456789012345678901', name: '계정 2' },
          ];
          setAccounts(mockAccounts);
          setSelectedAccount(mockAccounts[0].address);
          
          // 네트워크 목록
          const mockNetworks = [
            {
              id: 'catena-mainnet',
              name: 'Catena Chain Mainnet',
              chainId: 1000,
              rpcUrl: 'https://cvm.node.creatachain.com',
              symbol: 'CTA',
              blockExplorerUrl: 'https://catena.explorer.creatachain.com',
              isCustom: false,
            },
            {
              id: 'zenith-mainnet',
              name: 'Zenith Chain Mainnet',
              chainId: 2000,
              rpcUrl: 'https://zenith.node.creatachain.com',
              symbol: 'ZNT',
              blockExplorerUrl: 'https://zenith.explorer.creatachain.com',
              isCustom: false,
            },
            {
              id: 'ethereum-mainnet',
              name: 'Ethereum Mainnet',
              chainId: 1,
              rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
              symbol: 'ETH',
              blockExplorerUrl: 'https://etherscan.io',
              isCustom: false,
            },
          ];
          setNetworks(mockNetworks);
          setSelectedNetwork(mockNetworks[0].id);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('데이터 로드 오류:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // 계정 선택 처리
  const handleSelectAccount = (address: string) => {
    setSelectedAccount(address);
  };
  
  // 새 계정 생성 처리
  const handleCreateAccount = () => {
    // 실제 구현 시 백그라운드 스크립트에 요청
    console.log('새 계정 생성');
  };
  
  // 계정 가져오기 처리
  const handleImportAccount = () => {
    // 실제 구현 시 백그라운드 스크립트에 요청
    console.log('계정 가져오기');
  };
  
  // 네트워크 선택 처리
  const handleSelectNetwork = (networkId: string) => {
    setSelectedNetwork(networkId);
  };
  
  // 네트워크 추가 처리
  const handleAddNetwork = (network: Omit<typeof networks[0], 'id' | 'isCustom'>) => {
    // 실제 구현 시 백그라운드 스크립트에 요청
    console.log('네트워크 추가:', network);
  };
  
  // 네트워크 제거 처리
  const handleRemoveNetwork = (networkId: string) => {
    // 실제 구현 시 백그라운드 스크립트에 요청
    console.log('네트워크 제거:', networkId);
  };
  
  // 모달 열기
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  // 주소 복사
  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedAccount).then(() => {
      setCopied(true);
      
      // 2초 후 복사 상태 초기화
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  };
  
  // 주소 형식화 (5자마다 공백 추가하여 가독성 향상)
  const formatAddress = (address: string) => {
    return address.match(/.{1,4}/g)?.join(' ') || address;
  };
  
  // 대시보드로 돌아가기
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  // 선택된 네트워크 정보
  const selectedNetworkInfo = networks.find(network => network.id === selectedNetwork);
  
  // 로딩 중인 경우 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="receive-page page">
        <Loading text="데이터를 불러오는 중..." />
      </div>
    );
  }
  
  return (
    <div className="receive-page page">
      <div className="receive-header">
        <Button
          variant="text"
          onClick={handleBackToDashboard}
          className="back-button"
        >
          ← 뒤로
        </Button>
        <h1 className="page-title">받기</h1>
      </div>
      
      <div className="receive-content">
        <div className="receive-selectors">
          <NetworkSelector
            networks={networks}
            selectedNetwork={selectedNetwork}
            onSelectNetwork={handleSelectNetwork}
            onAddNetwork={handleAddNetwork}
            onRemoveNetwork={handleRemoveNetwork}
          />
          <AccountSelector
            accounts={accounts}
            selectedAccount={selectedAccount}
            onSelectAccount={handleSelectAccount}
            onCreateAccount={handleCreateAccount}
            onImportAccount={handleImportAccount}
          />
        </div>
        
        <Card className="receive-card">
          <p className="receive-instruction">
            아래 QR 코드를 스캔하거나 주소를 복사하여 {selectedNetworkInfo?.name} 네트워크에서 {selectedNetworkInfo?.symbol}을(를) 받으세요.
          </p>
          
          <div className="qr-code-container">
            <img
              src={`https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(
                selectedAccount
              )}&chs=250x250&choe=UTF-8&chld=L|0`}
              alt={`${selectedAccount}의 QR 코드`}
              className="qr-code-image"
            />
          </div>
          
          <div className="address-container">
            <div className="address-label">내 {selectedNetworkInfo?.symbol} 주소:</div>
            <div className="address-value">{formatAddress(selectedAccount)}</div>
          </div>
          
          <div className="receive-actions">
            <Button
              variant="primary"
              onClick={copyToClipboard}
              fullWidth
            >
              {copied ? '주소가 복사되었습니다' : '주소 복사'}
            </Button>
            <Button
              variant="secondary"
              onClick={openModal}
              fullWidth
            >
              전체 화면 보기
            </Button>
          </div>
          
          <div className="receive-warning">
            <p>
              <strong>중요:</strong> {selectedNetworkInfo?.name} 네트워크의 자산만 이 주소로 전송하세요.
              다른 네트워크의 자산을 이 주소로 전송하면 영구적으로 손실될 수 있습니다.
            </p>
          </div>
        </Card>
      </div>
      
      {/* 전체 화면 수신 모달 */}
      <ReceiveModal
        isOpen={isModalOpen}
        onClose={closeModal}
        address={selectedAccount}
        networkName={selectedNetworkInfo?.name || ''}
        networkSymbol={selectedNetworkInfo?.symbol || ''}
      />
    </div>
  );
};

export default Receive;
