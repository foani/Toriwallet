import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 페이지 컴포넌트 가져오기
import WelcomePage from './pages/WelcomePage';
import CreateWallet from './pages/CreateWallet';
import ImportWallet from './pages/ImportWallet';
import Dashboard from './pages/Dashboard';
import Send from './pages/Send';
import Receive from './pages/Receive';
import TransactionHistory from './pages/TransactionHistory';
import TransactionDetails from './pages/TransactionDetails';
import Settings from './pages/Settings';
import BackupPage from './pages/BackupPage';
import UnlockPage from './pages/UnlockPage';
import DAppsList from './pages/DAppsList';
import DAppBrowserPage from './pages/DAppBrowserPage';
import CrosschainPage from './pages/CrosschainPage';
import CrosschainDetailsPage from './pages/CrosschainDetailsPage';
import StakingPage from './pages/StakingPage';
import ValidatorDetailsPage from './pages/ValidatorDetailsPage';
import DefiPage from './pages/DefiPage';

/**
 * 지갑 앱 메인 컴포넌트
 * 
 * 라우팅을 설정하고 앱의 전체 상태를 관리합니다.
 */
const App: React.FC = () => {
  // 지갑 초기화 상태
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  
  // 앱 초기화 및 지갑 상태 확인
  useEffect(() => {
    const checkWalletState = async () => {
      try {
        // 백그라운드 스크립트에 지갑 상태 요청
        // 실제 구현에서는 chrome.runtime.sendMessage 사용
        // 현재는 임시 구현으로 시뮬레이션
        
        // 임시 구현: 지갑 초기화 여부와 잠금 상태 확인
        // 실제 구현 시 백그라운드 스크립트에서 상태 가져와야 함
        setTimeout(() => {
          // localStorage에서 상태 가져오기 (테스트용)
          const initialized = localStorage.getItem('walletInitialized') === 'true';
          setIsInitialized(initialized);
          
          if (initialized) {
            const locked = localStorage.getItem('walletLocked') === 'true';
            setIsLocked(locked);
          }
        }, 500);
      } catch (error) {
        console.error('지갑 상태 확인 오류:', error);
        setIsInitialized(false);
      }
    };
    
    checkWalletState();
  }, []);
  
  // 로딩 중인 경우
  if (isInitialized === null) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  // 라우트 렌더링
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* 초기화 안 된 경우: 환영/생성/가져오기 페이지만 접근 가능 */}
          {!isInitialized && (
            <>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/create-wallet" element={<CreateWallet />} />
              <Route path="/import-wallet" element={<ImportWallet />} />
              
              {/* 다른 모든 경로는 환영 페이지로 리디렉션 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
          
          {/* 초기화 되었지만 잠긴 경우: 잠금 화면으로 리디렉션 */}
          {isInitialized && isLocked && (
            <>
              <Route path="/unlock" element={<UnlockPage />} />
              
              {/* 다른 모든 경로는 잠금 화면으로 리디렉션 */}
              <Route path="*" element={<Navigate to="/unlock" replace />} />
            </>
          )}
          
          {/* 초기화되고 잠금 해제된 경우: 모든 기능 접근 가능 */}
          {isInitialized && !isLocked && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/send" element={<Send />} />
              <Route path="/receive" element={<Receive />} />
              <Route path="/transactions" element={<TransactionHistory />} />
              <Route path="/transaction/:id" element={<TransactionDetails />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/backup" element={<BackupPage />} />
              <Route path="/dapps" element={<DAppsList />} />
              <Route path="/dapp-browser" element={<DAppBrowserPage />} />
              
              {/* 크로스체인 기능 경로 */}
              <Route path="/crosschain" element={<Navigate to="/crosschain/icp" replace />} />
              <Route path="/crosschain/:method" element={<CrosschainPage />} />
              <Route path="/crosschain/details/:type/:id" element={<CrosschainDetailsPage />} />
              
              {/* 추가 페이지 경로들 */}
              {/* <Route path="/nft" element={<NFT />} /> */}
              <Route path="/staking" element={<StakingPage />} />
              <Route path="/validator/:validatorAddress" element={<ValidatorDetailsPage />} />
              <Route path="/defi" element={<DefiPage />} />
              <Route path="/defi/:category" element={<DefiPage />} />
              <Route path="/defi/:category/:id" element={<DefiPage />} />
              <Route path="/defi/:category/position/:positionId" element={<DefiPage />} />
              
              {/* 다른 모든 경로는 대시보드로 리디렉션 */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
