import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import DAppBrowser from '../components/dapp/DAppBrowser';
import ConnectRequest from '../components/dapp/ConnectRequest';
import SignRequest from '../components/dapp/SignRequest';

/**
 * DApp 브라우저 페이지 컴포넌트
 * 
 * 사용자가 DApp을 탐색하고 상호작용할 수 있는 내장 브라우저 페이지입니다.
 */
const DAppBrowserPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL 상태
  const [url, setUrl] = useState<string>('');
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 계정 상태
  const [accounts, setAccounts] = useState<Array<{ address: string; name: string }>>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  
  // 네트워크 상태
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  
  // 연결 요청 상태
  const [connectRequest, setConnectRequest] = useState<{
    domain: string;
    icon?: string;
    permissions: Array<{ id: string; name: string; description: string }>;
  } | null>(null);
  
  // 서명 요청 상태
  const [signRequest, setSignRequest] = useState<{
    domain: string;
    icon?: string;
    message: string;
    signType: string;
  } | null>(null);
  
  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // 백그라운드 스크립트에 계정 및 네트워크 데이터 요청
        // 실제 구현에서는 chrome.runtime.sendMessage 사용
        
        // 임시 구현: 가상 데이터
        // 실제 구현 시 제거
        setTimeout(() => {
          // 계정 목록
          const mockAccounts = [
            { address: '0x1234567890123456789012345678901234567890', name: '계정 1' },
            { address: '0x2345678901234567890123456789012345678901', name: '계정 2' },
          ];
          setAccounts(mockAccounts);
          setSelectedAccount(mockAccounts[0].address);
          
          // 선택된 네트워크
          setSelectedNetwork('catena-mainnet');
          
          // URL 설정 (위치 상태에서 가져오거나 기본값 사용)
          const initialUrl = location.state?.url || 'https://example.com';
          setUrl(initialUrl);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('데이터 로드 오류:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // 메시지 리스너 설정
    const setupMessageListener = () => {
      // 실제 구현 시 아래와 같이 처리
      // chrome.runtime.onMessage.addListener(handleMessage);
      
      // 테스트를 위한 임시 메시지 이벤트 시뮬레이션
      const mockConnect = setTimeout(() => {
        // 임의로 연결 요청 시뮬레이션 (실제 구현 시 제거)
        if (Math.random() > 0.7) {
          setConnectRequest({
            domain: new URL(url).hostname,
            icon: 'https://example.com/favicon.ico',
            permissions: [
              {
                id: 'account_access',
                name: '계정 접근',
                description: '연결된 계정 주소 보기',
              },
              {
                id: 'tx_send',
                name: '트랜잭션 전송',
                description: '사용자 승인 후 트랜잭션 전송',
              },
            ],
          });
        }
      }, 3000);
      
      // 정리 함수
      return () => {
        clearTimeout(mockConnect);
        // 실제 구현 시 아래와 같이 처리
        // chrome.runtime.onMessage.removeListener(handleMessage);
      };
    };
    
    const cleanup = setupMessageListener();
    return cleanup;
  }, [location.state]);
  
  // 메시지 처리 함수 (실제 구현 시)
  // const handleMessage = (message, sender, sendResponse) => {
  //   if (message.type === 'WALLET_CONNECT_REQUEST') {
  //     setConnectRequest(message.data);
  //   } else if (message.type === 'WALLET_SIGN_REQUEST') {
  //     setSignRequest(message.data);
  //   }
  // };
  
  // URL 변경 처리
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
  };
  
  // 브라우저 닫기 처리
  const handleCloseBrowser = () => {
    navigate('/dapps');
  };
  
  // 연결 승인 처리
  const handleConnectApprove = async (accountAddresses: string[]) => {
    // 백그라운드 스크립트에 연결 승인 요청
    // 실제 구현에서는 chrome.runtime.sendMessage 사용
    
    // 요청 상태 초기화
    setConnectRequest(null);
  };
  
  // 연결 거부 처리
  const handleConnectReject = () => {
    // 백그라운드 스크립트에 연결 거부 요청
    // 실제 구현에서는 chrome.runtime.sendMessage 사용
    
    // 요청 상태 초기화
    setConnectRequest(null);
  };
  
  // 서명 승인 처리
  const handleSignApprove = async () => {
    // 백그라운드 스크립트에 서명 승인 요청
    // 실제 구현에서는 chrome.runtime.sendMessage 사용
    
    // 요청 상태 초기화
    setSignRequest(null);
  };
  
  // 서명 거부 처리
  const handleSignReject = () => {
    // 백그라운드 스크립트에 서명 거부 요청
    // 실제 구현에서는 chrome.runtime.sendMessage 사용
    
    // 요청 상태 초기화
    setSignRequest(null);
  };
  
  // 로딩 중인 경우 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="dapp-browser-page page">
        <Loading text="브라우저를 불러오는 중..." />
      </div>
    );
  }
  
  // 연결 요청이 있는 경우 연결 요청 화면 표시
  if (connectRequest) {
    return (
      <div className="dapp-browser-page page">
        <ConnectRequest
          domain={connectRequest.domain}
          icon={connectRequest.icon}
          permissions={connectRequest.permissions}
          accounts={accounts}
          onApprove={handleConnectApprove}
          onReject={handleConnectReject}
        />
      </div>
    );
  }
  
  // 서명 요청이 있는 경우 서명 요청 화면 표시
  if (signRequest) {
    return (
      <div className="dapp-browser-page page">
        <SignRequest
          domain={signRequest.domain}
          icon={signRequest.icon}
          message={signRequest.message}
          signType={signRequest.signType}
          address={selectedAccount}
          onApprove={handleSignApprove}
          onReject={handleSignReject}
        />
      </div>
    );
  }
  
  return (
    <div className="dapp-browser-page page">
      <div className="dapp-browser-content">
        <DAppBrowser
          initialUrl={url}
          onUrlChange={handleUrlChange}
          onClose={handleCloseBrowser}
          height={600}
        />
      </div>
      
      <div className="dapp-browser-footer">
        <div className="connection-info">
          <div className="network-indicator">
            <div className="network-dot"></div>
            <div className="network-name">
              {selectedNetwork === 'catena-mainnet' ? 'Catena Chain' : 
               selectedNetwork === 'zenith-mainnet' ? 'Zenith Chain' : 
               selectedNetwork === 'ethereum-mainnet' ? 'Ethereum' : 
               selectedNetwork}
            </div>
          </div>
          
          <div className="account-info">
            <div className="account-address">
              {selectedAccount.substring(0, 6)}...{selectedAccount.substring(selectedAccount.length - 4)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DAppBrowserPage;