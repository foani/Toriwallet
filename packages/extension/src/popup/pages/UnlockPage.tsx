import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';

/**
 * 지갑 잠금 해제 페이지 컴포넌트
 * 
 * 사용자가 잠긴 지갑의 잠금을 해제할 수 있게 해주는 페이지입니다.
 */
const UnlockPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 비밀번호 상태
  const [password, setPassword] = useState<string>('');
  
  // 생체 인증 사용 가능 여부
  const [biometricsAvailable, setBiometricsAvailable] = useState<boolean>(false);
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 오류 메시지
  const [error, setError] = useState<string>('');
  
  // 시도 횟수
  const [attempts, setAttempts] = useState<number>(0);
  
  // 로그인 제한 상태
  const [isLocked, setIsLocked] = useState<boolean>(false);
  
  // 제한 시간 (초)
  const [lockTime, setLockTime] = useState<number>(0);
  
  // 생체 인증 사용 가능성 확인
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        // 백그라운드 스크립트에 생체 인증 가능성 확인
        // 실제 구현에서는 chrome.runtime.sendMessage 사용
        
        // 임시 구현: 가상의 생체 인증 가능 상태
        // 실제 구현 시 제거
        setTimeout(() => {
          setBiometricsAvailable(true);
        }, 500);
      } catch (error) {
        console.error('생체 인증 확인 오류:', error);
        setBiometricsAvailable(false);
      }
    };
    
    checkBiometrics();
  }, []);
  
  // 제한 시간 카운트다운
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isLocked && lockTime > 0) {
      timer = setInterval(() => {
        setLockTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isLocked, lockTime]);
  
  // 비밀번호 입력 처리
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };
  
  // 비밀번호로 잠금 해제
  const unlockWithPassword = async () => {
    // 비밀번호가 비어있는지 확인
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // 백그라운드 스크립트에 잠금 해제 요청
      // 실제 구현에서는 chrome.runtime.sendMessage 사용
      
      // 임시 구현: 비밀번호가 'password'인지 확인
      // 실제 구현 시 제거
      setTimeout(() => {
        if (password === 'password') {
          // 비밀번호 맞음
          localStorage.setItem('walletLocked', 'false');
          
          // 대시보드로 이동
          navigate('/dashboard');
        } else {
          // 비밀번호 틀림
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          
          if (newAttempts >= 5) {
            // 5회 이상 시도 시 1분 제한
            setIsLocked(true);
            setLockTime(60);
            setError('비밀번호 시도 횟수를 초과했습니다. 1분 후에 다시 시도해주세요.');
          } else {
            setError(`잘못된 비밀번호입니다. 남은 시도: ${5 - newAttempts}회`);
          }
          
          setPassword('');
        }
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('잠금 해제 오류:', error);
      setError('잠금 해제 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };
  
  // 생체 인증으로 잠금 해제
  const unlockWithBiometrics = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // 백그라운드 스크립트에 생체 인증 요청
      // 실제 구현에서는 chrome.runtime.sendMessage 사용
      
      // 임시 구현: 1초 후 성공
      // 실제 구현 시 제거
      setTimeout(() => {
        // 생체 인증 성공
        localStorage.setItem('walletLocked', 'false');
        
        // 대시보드로 이동
        navigate('/dashboard');
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('생체 인증 오류:', error);
      setError('생체 인증에 실패했습니다.');
      setIsLoading(false);
    }
  };
  
  // 키 입력 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      unlockWithPassword();
    }
  };
  
  // 지갑 복구
  const recoverWallet = () => {
    navigate('/import-wallet');
  };
  
  // 로딩 중인 경우 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="unlock-page page">
        <Loading text="잠금 해제 중..." />
      </div>
    );
  }
  
  return (
    <div className="unlock-page page">
      <div className="unlock-content">
        <div className="wallet-logo">
          <img src="/images/logo.png" alt="TORI Wallet" className="logo-image" />
          <h1 className="wallet-name">TORI Wallet</h1>
        </div>
        
        <Card className="unlock-card">
          <h2 className="unlock-title">지갑 잠금 해제</h2>
          
          {isLocked ? (
            <div className="locked-message">
              <div className="lock-icon">🔒</div>
              <div className="lock-text">
                비밀번호 시도 횟수를 초과했습니다.
                <div className="lock-timer">
                  {Math.floor(lockTime / 60)}:{(lockTime % 60).toString().padStart(2, '0')} 후에 다시 시도할 수 있습니다.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="password-container">
                <label htmlFor="password" className="password-label">비밀번호</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyDown={handleKeyDown}
                  className="password-input"
                  autoFocus
                />
              </div>
              
              {error && (
                <div className="unlock-error">
                  {error}
                </div>
              )}
              
              <div className="unlock-actions">
                <Button
                  variant="primary"
                  onClick={unlockWithPassword}
                  fullWidth
                >
                  잠금 해제
                </Button>
                
                {biometricsAvailable && (
                  <Button
                    variant="secondary"
                    onClick={unlockWithBiometrics}
                    className="biometrics-btn"
                  >
                    생체 인증으로 잠금 해제
                  </Button>
                )}
              </div>
            </>
          )}
          
          <div className="recover-option">
            <Button
              variant="text"
              onClick={recoverWallet}
            >
              시드 구문으로 지갑 복구
            </Button>
          </div>
        </Card>
        
        <div className="version-info">
          <div className="version">v1.0.0</div>
        </div>
      </div>
    </div>
  );
};

export default UnlockPage;