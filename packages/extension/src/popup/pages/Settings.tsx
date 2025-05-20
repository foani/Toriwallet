import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';

/**
 * 설정 페이지 컴포넌트
 * 
 * 지갑의 다양한 설정을 관리하고 보안 기능에 접근할 수 있는 페이지
 */
const Settings: React.FC = () => {
  const navigate = useNavigate();
  
  // 설정 상태
  const [settings, setSettings] = useState<{
    language: string;
    theme: 'light' | 'dark' | 'system';
    currency: string;
    idleTimeout: number;
    hideBalance: boolean;
    advancedMode: boolean;
    useTestnet: boolean;
    useHardwareWallet: boolean;
    biometricsEnabled: boolean;
    autoLock: boolean;
    confirmations: number;
    txNotifications: boolean;
  }>({
    language: 'ko',
    theme: 'system',
    currency: 'USD',
    idleTimeout: 15,
    hideBalance: false,
    advancedMode: false,
    useTestnet: false,
    useHardwareWallet: false,
    biometricsEnabled: false,
    autoLock: true,
    confirmations: 12,
    txNotifications: true,
  });
  
  // 지갑 정보
  const [walletInfo, setWalletInfo] = useState<{
    version: string;
    address: string;
    accounts: number;
    backupDate: string | null;
  }>({
    version: '1.0.0',
    address: '0x1234567890123456789012345678901234567890',
    accounts: 2,
    backupDate: null,
  });
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 저장 중 상태
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // 변경 감지
  const [isDirty, setIsDirty] = useState<boolean>(false);
  
  // 성공 메시지
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // 오류 메시지
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // 잠금 확인 상태
  const [isLockConfirmOpen, setIsLockConfirmOpen] = useState<boolean>(false);
  
  // 초기 데이터 로드
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 백그라운드 스크립트에 설정 요청
        // 실제 구현에서는 chrome.runtime.sendMessage 사용
        
        // 임시 구현: 가상 데이터
        // 실제 구현 시 제거
        setTimeout(() => {
          // 설정 가져오기
          const mockSettings = {
            language: 'ko',
            theme: 'system' as const,
            currency: 'USD',
            idleTimeout: 15,
            hideBalance: false,
            advancedMode: false,
            useTestnet: false,
            useHardwareWallet: false,
            biometricsEnabled: false,
            autoLock: true,
            confirmations: 12,
            txNotifications: true,
          };
          setSettings(mockSettings);
          
          // 지갑 정보 가져오기
          const mockWalletInfo = {
            version: '1.0.0',
            address: '0x1234567890123456789012345678901234567890',
            accounts: 2,
            backupDate: '2023-05-01',
          };
          setWalletInfo(mockWalletInfo);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('설정 로드 오류:', error);
        setErrorMessage('설정을 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // 설정 변경 처리
  const handleSettingChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    
    // 값 업데이트
    const newValue = type === 'checkbox' ? checked : value;
    
    // 설정 업데이트
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : newValue,
    }));
    
    // 변경 감지
    setIsDirty(true);
    
    // 이전 메시지 삭제
    setSuccessMessage('');
    setErrorMessage('');
  };
  
  // 설정 저장
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      setErrorMessage('');
      
      // 백그라운드 스크립트에 설정 저장 요청
      // 실제 구현에서는 chrome.runtime.sendMessage 사용
      
      // 임시 구현: 1초 후 완료
      // 실제 구현 시 제거
      setTimeout(() => {
        setSuccessMessage('설정이 저장되었습니다.');
        setIsDirty(false);
        setIsSaving(false);
        
        // 3초 후 성공 메시지 삭제
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }, 1000);
    } catch (error) {
      console.error('설정 저장 오류:', error);
      setErrorMessage('설정을 저장하는 중 오류가 발생했습니다.');
      setIsSaving(false);
    }
  };
  
  // 지갑 잠금
  const lockWallet = async () => {
    try {
      // 백그라운드 스크립트에 잠금 요청
      // 실제 구현에서는 chrome.runtime.sendMessage 사용
      
      // 임시 구현: 잠금 확인 대화상자 닫기
      setIsLockConfirmOpen(false);
      
      // 잠금 화면으로 이동
      navigate('/unlock');
    } catch (error) {
      console.error('지갑 잠금 오류:', error);
      setErrorMessage('지갑을 잠그는 중 오류가 발생했습니다.');
    }
  };
  
  // 지갑 초기화 확인
  const resetWalletConfirm = () => {
    // 실제 구현에서는 확인 대화상자 표시
    if (window.confirm('정말로 지갑을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      resetWallet();
    }
  };
  
  // 지갑 초기화
  const resetWallet = async () => {
    try {
      // 백그라운드 스크립트에 초기화 요청
      // 실제 구현에서는 chrome.runtime.sendMessage 사용
      
      // 임시 구현: localStorage 삭제
      localStorage.removeItem('walletInitialized');
      localStorage.removeItem('walletLocked');
      
      // 환영 페이지로 이동
      navigate('/');
    } catch (error) {
      console.error('지갑 초기화 오류:', error);
      setErrorMessage('지갑을 초기화하는 중 오류가 발생했습니다.');
    }
  };
  
  // 시드 구문 백업
  const backupSeedPhrase = () => {
    navigate('/backup');
  };
  
  // 대시보드로 돌아가기
  const handleBackToDashboard = () => {
    // 변경사항이 있는 경우 확인
    if (isDirty) {
      if (window.confirm('저장되지 않은 변경사항이 있습니다. 계속하시겠습니까?')) {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };
  
  // 로딩 중인 경우 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="settings-page page">
        <Loading text="설정을 불러오는 중..." />
      </div>
    );
  }
  
  return (
    <div className="settings-page page">
      <div className="settings-header">
        <Button
          variant="text"
          onClick={handleBackToDashboard}
          className="back-button"
        >
          ← 뒤로
        </Button>
        <h1 className="page-title">설정</h1>
      </div>
      
      <div className="settings-content">
        {/* 일반 설정 */}
        <Card className="settings-card">
          <h2 className="settings-section-title">일반 설정</h2>
          
          <div className="settings-group">
            <div className="setting-item">
              <label htmlFor="language" className="setting-label">언어</label>
              <select
                id="language"
                name="language"
                value={settings.language}
                onChange={handleSettingChange}
                className="setting-input"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
                <option value="vi">Tiếng Việt</option>
                <option value="th">ภาษาไทย</option>
              </select>
            </div>
            
            <div className="setting-item">
              <label htmlFor="theme" className="setting-label">테마</label>
              <select
                id="theme"
                name="theme"
                value={settings.theme}
                onChange={handleSettingChange}
                className="setting-input"
              >
                <option value="light">라이트</option>
                <option value="dark">다크</option>
                <option value="system">시스템 기본</option>
              </select>
            </div>
            
            <div className="setting-item">
              <label htmlFor="currency" className="setting-label">기본 통화</label>
              <select
                id="currency"
                name="currency"
                value={settings.currency}
                onChange={handleSettingChange}
                className="setting-input"
              >
                <option value="USD">USD</option>
                <option value="KRW">KRW</option>
                <option value="JPY">JPY</option>
                <option value="CNY">CNY</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            
            <div className="setting-item">
              <label htmlFor="idleTimeout" className="setting-label">자동 잠금 시간 (분)</label>
              <input
                type="number"
                id="idleTimeout"
                name="idleTimeout"
                min="1"
                max="60"
                value={settings.idleTimeout}
                onChange={handleSettingChange}
                className="setting-input"
              />
            </div>
            
            <div className="setting-item checkbox">
              <label htmlFor="hideBalance" className="setting-label">잔액 숨기기</label>
              <input
                type="checkbox"
                id="hideBalance"
                name="hideBalance"
                checked={settings.hideBalance}
                onChange={handleSettingChange}
              />
            </div>
            
            <div className="setting-item checkbox">
              <label htmlFor="advancedMode" className="setting-label">고급 모드</label>
              <input
                type="checkbox"
                id="advancedMode"
                name="advancedMode"
                checked={settings.advancedMode}
                onChange={handleSettingChange}
              />
            </div>
            
            <div className="setting-item checkbox">
              <label htmlFor="useTestnet" className="setting-label">테스트넷 사용</label>
              <input
                type="checkbox"
                id="useTestnet"
                name="useTestnet"
                checked={settings.useTestnet}
                onChange={handleSettingChange}
              />
            </div>
          </div>
        </Card>
        
        {/* 보안 설정 */}
        <Card className="settings-card">
          <h2 className="settings-section-title">보안 설정</h2>
          
          <div className="settings-group">
            <div className="setting-item checkbox">
              <label htmlFor="biometricsEnabled" className="setting-label">생체 인증 사용</label>
              <input
                type="checkbox"
                id="biometricsEnabled"
                name="biometricsEnabled"
                checked={settings.biometricsEnabled}
                onChange={handleSettingChange}
              />
            </div>
            
            <div className="setting-item checkbox">
              <label htmlFor="autoLock" className="setting-label">자동 잠금</label>
              <input
                type="checkbox"
                id="autoLock"
                name="autoLock"
                checked={settings.autoLock}
                onChange={handleSettingChange}
              />
            </div>
            
            <div className="setting-item">
              <label htmlFor="confirmations" className="setting-label">필요 확인 수</label>
              <select
                id="confirmations"
                name="confirmations"
                value={settings.confirmations}
                onChange={handleSettingChange}
                className="setting-input"
              >
                <option value="1">1 (매우 빠름, 위험)</option>
                <option value="3">3 (빠름)</option>
                <option value="6">6 (표준)</option>
                <option value="12">12 (안전)</option>
                <option value="24">24 (매우 안전)</option>
              </select>
            </div>
            
            <div className="setting-item checkbox">
              <label htmlFor="useHardwareWallet" className="setting-label">하드웨어 지갑 사용</label>
              <input
                type="checkbox"
                id="useHardwareWallet"
                name="useHardwareWallet"
                checked={settings.useHardwareWallet}
                onChange={handleSettingChange}
              />
            </div>
            
            <div className="setting-actions">
              <Button
                variant="secondary"
                onClick={backupSeedPhrase}
              >
                시드 구문 백업
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => setIsLockConfirmOpen(true)}
              >
                지갑 잠금
              </Button>
              
              <Button
                variant="danger"
                onClick={resetWalletConfirm}
              >
                지갑 초기화
              </Button>
            </div>
          </div>
        </Card>
        
        {/* 알림 설정 */}
        <Card className="settings-card">
          <h2 className="settings-section-title">알림 설정</h2>
          
          <div className="settings-group">
            <div className="setting-item checkbox">
              <label htmlFor="txNotifications" className="setting-label">트랜잭션 알림</label>
              <input
                type="checkbox"
                id="txNotifications"
                name="txNotifications"
                checked={settings.txNotifications}
                onChange={handleSettingChange}
              />
            </div>
          </div>
        </Card>
        
        {/* 지갑 정보 */}
        <Card className="settings-card">
          <h2 className="settings-section-title">지갑 정보</h2>
          
          <div className="settings-group">
            <div className="info-item">
              <div className="info-label">버전</div>
              <div className="info-value">{walletInfo.version}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">기본 주소</div>
              <div className="info-value address">{walletInfo.address}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">계정 수</div>
              <div className="info-value">{walletInfo.accounts}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">마지막 백업 날짜</div>
              <div className="info-value">
                {walletInfo.backupDate ? new Date(walletInfo.backupDate).toLocaleDateString() : '백업 없음'}
              </div>
            </div>
          </div>
        </Card>
        
        {/* 저장 버튼 */}
        {isDirty && (
          <div className="settings-save">
            <Button
              variant="primary"
              onClick={saveSettings}
              disabled={isSaving}
              fullWidth
            >
              {isSaving ? '저장 중...' : '설정 저장'}
            </Button>
          </div>
        )}
        
        {/* 메시지 표시 */}
        {successMessage && (
          <div className="settings-message success">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="settings-message error">
            {errorMessage}
          </div>
        )}
      </div>
      
      {/* 잠금 확인 대화상자 */}
      {isLockConfirmOpen && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3 className="confirm-title">지갑 잠금</h3>
            <p className="confirm-message">
              정말로 지갑을 잠그시겠습니까?
            </p>
            <div className="confirm-actions">
              <Button
                variant="secondary"
                onClick={() => setIsLockConfirmOpen(false)}
              >
                취소
              </Button>
              <Button
                variant="primary"
                onClick={lockWallet}
              >
                잠금
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;