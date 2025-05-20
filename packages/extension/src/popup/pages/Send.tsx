import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import SendForm from '../components/wallet/SendForm';
import NetworkSelector from '../components/wallet/NetworkSelector';
import AccountSelector from '../components/wallet/AccountSelector';

/**
 * 자산 전송 페이지 컴포넌트
 * 
 * 사용자가 선택한 자산을 다른 주소로 전송할 수 있는 기능을 제공합니다.
 */
const Send: React.FC = () => {
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
  
  // 자산 상태
  const [assets, setAssets] = useState<Array<{
    id: string;
    name: string;
    symbol: string;
    icon?: string;
    balance: string;
    decimals: number;
  }>>([]);
  
  // 가스 정보
  const [gasPrice, setGasPrice] = useState<string>('');
  const [maxFee, setMaxFee] = useState<string>('');
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);
  
  // 성공 상태
  const [txSuccess, setTxSuccess] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>('');
  
  // 오류 상태
  const [error, setError] = useState<string>('');
  
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
          
          // 자산 목록
          const mockAssets = [
            {
              id: 'cta',
              name: 'Creata',
              symbol: 'CTA',
              balance: '100.5',
              decimals: 18,
            },
            {
              id: 'eth',
              name: 'Ethereum',
              symbol: 'ETH',
              balance: '0.5',
              decimals: 18,
            },
            {
              id: 'usdt',
              name: 'Tether',
              symbol: 'USDT',
              balance: '500',
              decimals: 6,
            },
          ];
          setAssets(mockAssets);
          
          // 가스 정보
          setGasPrice('5');
          setMaxFee('0.001 CTA');
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('데이터 로드 오류:', error);
        setError('데이터를 불러오는 동안 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // 계정 선택 처리
  const handleSelectAccount = (address: string) => {
    setSelectedAccount(address);
    // 선택된 계정에 따른 자산 업데이트
    // 실제 구현 시 백그라운드 스크립트에 요청
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
    // 선택된 네트워크에 따른 자산 업데이트
    // 실제 구현 시 백그라운드 스크립트에 요청
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
  
  // QR 코드 스캔 처리
  const handleScanQrCode = async (): Promise<string> => {
    // 실제 구현 시 QR 코드 스캔 모듈 통합
    // 현재는 임시 구현으로 가상의 주소 반환
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('0x2345678901234567890123456789012345678901');
      }, 1000);
    });
  };
  
  // 전송 처리
  const handleSend = async (data: {
    to: string;
    amount: string;
    assetId: string;
    gasPrice?: string;
    gasLimit?: string;
    memo?: string;
  }) => {
    try {
      setIsSending(true);
      setError('');
      
      // 백그라운드 스크립트에 전송 요청
      // 실제 구현에서는 chrome.runtime.sendMessage 사용
      
      // 임시 구현: 가상의 트랜잭션 해시 생성
      // 실제 구현 시 제거
      setTimeout(() => {
        const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
        
        setTxHash(mockTxHash);
        setTxSuccess(true);
        setIsSending(false);
      }, 2000);
    } catch (error) {
      console.error('전송 오류:', error);
      setError('전송 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSending(false);
    }
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
      <div className="send-page page">
        <Loading text="데이터를 불러오는 중..." />
      </div>
    );
  }
  
  // 트랜잭션 성공 화면 표시
  if (txSuccess) {
    return (
      <div className="send-page page">
        <div className="send-success-container">
          <div className="success-icon">✅</div>
          <h2 className="success-title">전송 성공!</h2>
          
          <Card className="success-card">
            <div className="success-info">
              <div className="success-info-item">
                <span className="info-label">트랜잭션 해시:</span>
                <span className="info-value hash">{txHash}</span>
              </div>
              
              {selectedNetworkInfo?.blockExplorerUrl && (
                <div className="success-actions">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      window.open(
                        `${selectedNetworkInfo.blockExplorerUrl}/tx/${txHash}`,
                        '_blank'
                      );
                    }}
                  >
                    블록 익스플로러에서 보기
                  </Button>
                </div>
              )}
            </div>
          </Card>
          
          <div className="send-success-actions">
            <Button
              variant="primary"
              onClick={handleBackToDashboard}
              fullWidth
            >
              대시보드로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="send-page page">
      <div className="send-header">
        <Button
          variant="text"
          onClick={handleBackToDashboard}
          className="back-button"
        >
          ← 뒤로
        </Button>
        <h1 className="page-title">전송</h1>
      </div>
      
      <div className="send-content">
        <div className="send-selectors">
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
        
        {error && (
          <div className="send-error">
            {error}
          </div>
        )}
        
        <Card className="send-card">
          <SendForm
            assets={assets}
            networkSymbol={selectedNetworkInfo?.symbol || ''}
            networkName={selectedNetworkInfo?.name || ''}
            gasPrice={gasPrice}
            maxFee={maxFee}
            onSend={handleSend}
            onScanQrCode={handleScanQrCode}
          />
        </Card>
      </div>
    </div>
  );
};

export default Send;
