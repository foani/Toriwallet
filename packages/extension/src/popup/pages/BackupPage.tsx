import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';

/**
 * 백업 페이지 컴포넌트
 * 
 * 사용자의 지갑 시드 구문을 안전하게 백업할 수 있는 페이지
 */
const BackupPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 시드 구문 상태
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  
  // 확인 단어
  const [verificationWords, setVerificationWords] = useState<
    Array<{ index: number; word: string; userInput: string }>
  >([]);
  
  // 비밀번호 상태
  const [password, setPassword] = useState<string>('');
  
  // 페이지 단계
  const [step, setStep] = useState<number>(1);
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 단어 표시 상태
  const [isSeedVisible, setIsSeedVisible] = useState<boolean>(false);
  
  // 보안 확인 상태
  const [securityChecked, setSecurityChecked] = useState<boolean>(false);
  
  // 오류 메시지
  const [error, setError] = useState<string>('');
  
  // 시드 구문 로드
  useEffect(() => {
    const loadSeedPhrase = async () => {
      try {
        setIsLoading(true);
        
        // 백그라운드 스크립트에 시드 구문 요청
        // 실제 구현에서는 chrome.runtime.sendMessage 사용
        
        // 임시 구현: 가상의 시드 구문
        // 실제 구현 시 제거
        setTimeout(() => {
          // 참고: 실제 환경에서는 시드 구문이 암호화되어 있어야 함
          const dummySeedPhrase = 'apple banana cherry diamond elephant forest giraffe hotel igloo jungle kangaroo lemon monkey';
          setSeedPhrase(dummySeedPhrase);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('시드 구문 로드 오류:', error);
        setError('시드 구문을 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };
    
    loadSeedPhrase();
  }, []);
  
  // 단어 확인용 인덱스 설정
  useEffect(() => {
    if (seedPhrase && step === 3) {
      const words = seedPhrase.split(' ');
      
      // 랜덤하게 3개의 인덱스 선택
      const indexes = [];
      while (indexes.length < 3) {
        const randomIndex = Math.floor(Math.random() * words.length);
        if (!indexes.includes(randomIndex)) {
          indexes.push(randomIndex);
        }
      }
      
      // 확인 단어 설정
      const verificationArray = indexes.map(index => ({
        index,
        word: words[index],
        userInput: '',
      }));
      
      setVerificationWords(verificationArray);
    }
  }, [seedPhrase, step]);
  
  // 비밀번호 입력 처리
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };
  
  // 확인 단어 입력 처리
  const handleVerificationWordChange = (
    index: number,
    value: string
  ) => {
    setVerificationWords(prev =>
      prev.map(item =>
        item.index === index ? { ...item, userInput: value } : item
      )
    );
    setError('');
  };
  
  // 보안 확인 체크박스 처리
  const handleSecurityCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurityChecked(e.target.checked);
  };
  
  // 비밀번호 확인
  const verifyPassword = async () => {
    try {
      setIsLoading(true);
      
      // 백그라운드 스크립트에 비밀번호 확인 요청
      // 실제 구현에서는 chrome.runtime.sendMessage 사용
      
      // 임시 구현: 비밀번호가 'password'인지 확인
      // 실제 구현 시 제거
      setTimeout(() => {
        if (password === 'password') {
          setStep(2);
          setIsLoading(false);
        } else {
          setError('잘못된 비밀번호입니다.');
          setIsLoading(false);
        }
      }, 1000);
    } catch (error) {
      console.error('비밀번호 확인 오류:', error);
      setError('비밀번호를 확인하는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };
  
  // 시드 확인 다음 단계로 이동
  const goToVerification = () => {
    if (securityChecked) {
      setStep(3);
    } else {
      setError('계속하려면 보안 권장사항을 확인해야 합니다.');
    }
  };
  
  // 시드 구문 확인
  const verifySeedPhrase = () => {
    // 모든 단어가 입력되었는지 확인
    const allWordsEntered = verificationWords.every(
      item => item.userInput.trim() !== ''
    );
    
    if (!allWordsEntered) {
      setError('모든 단어를 입력해주세요.');
      return;
    }
    
    // 입력된 단어가 맞는지 확인
    const allWordsCorrect = verificationWords.every(
      item => item.userInput.trim().toLowerCase() === item.word.toLowerCase()
    );
    
    if (!allWordsCorrect) {
      setError('일부 단어가 잘못되었습니다. 다시 확인해주세요.');
      return;
    }
    
    // 성공적으로 확인됨
    completeBackup();
  };
  
  // 백업 완료
  const completeBackup = async () => {
    try {
      setIsLoading(true);
      
      // 백그라운드 스크립트에 백업 완료 요청
      // 실제 구현에서는 chrome.runtime.sendMessage 사용
      
      // 임시 구현: 1초 후 완료
      // 실제 구현 시 제거
      setTimeout(() => {
        // 백업 날짜 저장 (실제 구현 시에는 백그라운드에서 처리)
        setIsLoading(false);
        
        // 설정 페이지로 돌아가기
        navigate('/settings', { state: { backupComplete: true } });
      }, 1000);
    } catch (error) {
      console.error('백업 완료 오류:', error);
      setError('백업을 완료하는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };
  
  // 시드 구문 표시/숨김 토글
  const toggleSeedVisibility = () => {
    setIsSeedVisible(!isSeedVisible);
  };
  
  // 시드 구문 복사
  const copySeedPhrase = () => {
    navigator.clipboard.writeText(seedPhrase).then(() => {
      alert('시드 구문이 클립보드에 복사되었습니다.');
    });
  };
  
  // 이전 단계로 이동
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/settings');
    }
  };
  
  // 설정 페이지로 돌아가기
  const goToSettings = () => {
    navigate('/settings');
  };
  
  // 로딩 중인 경우 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="backup-page page">
        <Loading text="처리 중..." />
      </div>
    );
  }
  
  return (
    <div className="backup-page page">
      <div className="backup-header">
        <Button
          variant="text"
          onClick={goBack}
          className="back-button"
        >
          ← 뒤로
        </Button>
        <h1 className="page-title">지갑 백업</h1>
      </div>
      
      <div className="backup-content">
        {/* 1단계: 비밀번호 확인 */}
        {step === 1 && (
          <Card className="backup-card">
            <div className="backup-warning">
              <div className="warning-icon">⚠️</div>
              <div className="warning-text">
                시드 구문에 접근하려면 지갑 비밀번호를 입력하세요.
                시드 구문은 지갑 복구를 위한 중요한 정보입니다.
              </div>
            </div>
            
            <div className="password-input-container">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className="password-input"
              />
            </div>
            
            {error && (
              <div className="backup-error">
                {error}
              </div>
            )}
            
            <div className="backup-actions">
              <Button
                variant="secondary"
                onClick={goToSettings}
              >
                취소
              </Button>
              
              <Button
                variant="primary"
                onClick={verifyPassword}
                disabled={!password}
              >
                확인
              </Button>
            </div>
          </Card>
        )}
        
        {/* 2단계: 시드 구문 표시 */}
        {step === 2 && (
          <Card className="backup-card">
            <div className="backup-warning">
              <div className="warning-icon">⚠️</div>
              <div className="warning-text">
                <strong>주의: 누구에게도 시드 구문을 공유하지 마세요!</strong>
                <p>
                  시드 구문을 가진 사람은 자산에 완전히 접근할 수 있습니다.
                  안전한 장소에 오프라인으로 보관하세요.
                </p>
              </div>
            </div>
            
            <div className="seed-container">
              <div className="seed-header">
                <h3 className="seed-title">시드 구문 (12단어)</h3>
                <Button
                  variant="text"
                  onClick={toggleSeedVisibility}
                  className="visibility-btn"
                >
                  {isSeedVisible ? '숨기기' : '표시'}
                </Button>
              </div>
              
              <div className="seed-phrase-container">
                {isSeedVisible ? (
                  <div className="seed-words">
                    {seedPhrase.split(' ').map((word, index) => (
                      <div key={index} className="seed-word">
                        <span className="word-index">{index + 1}.</span>
                        <span className="word">{word}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="seed-hidden">
                    <div className="hidden-message">
                      보안을 위해 시드 구문이 숨겨져 있습니다.
                      표시하려면 '표시' 버튼을 클릭하세요.
                    </div>
                  </div>
                )}
              </div>
              
              <div className="seed-actions">
                <Button
                  variant="secondary"
                  onClick={copySeedPhrase}
                  disabled={!isSeedVisible}
                >
                  복사
                </Button>
              </div>
            </div>
            
            <div className="security-check">
              <label className="security-label">
                <input
                  type="checkbox"
                  checked={securityChecked}
                  onChange={handleSecurityCheck}
                />
                <span className="security-text">
                  나는 시드 구문을 안전한 곳에 백업했으며, 이를 잃어버리면 지갑에 대한
                  접근 권한을 잃게 된다는 것을 이해합니다.
                </span>
              </label>
            </div>
            
            {error && (
              <div className="backup-error">
                {error}
              </div>
            )}
            
            <div className="backup-actions">
              <Button
                variant="secondary"
                onClick={goBack}
              >
                뒤로
              </Button>
              
              <Button
                variant="primary"
                onClick={goToVerification}
                disabled={!securityChecked}
              >
                다음
              </Button>
            </div>
          </Card>
        )}
        
        {/* 3단계: 시드 구문 확인 */}
        {step === 3 && (
          <Card className="backup-card">
            <div className="verification-header">
              <h3 className="verification-title">시드 구문 확인</h3>
              <p className="verification-description">
                시드 구문을 제대로 백업했는지 확인하기 위해
                아래의 몇 가지 단어를 입력해주세요.
              </p>
            </div>
            
            <div className="verification-form">
              {verificationWords.map((item, i) => (
                <div key={i} className="verification-input-container">
                  <label htmlFor={`word-${item.index}`} className="verification-label">
                    단어 #{item.index + 1}
                  </label>
                  <input
                    type="text"
                    id={`word-${item.index}`}
                    value={item.userInput}
                    onChange={(e) => handleVerificationWordChange(item.index, e.target.value)}
                    className="verification-input"
                    placeholder={`${item.index + 1}번째 단어 입력`}
                  />
                </div>
              ))}
            </div>
            
            {error && (
              <div className="backup-error">
                {error}
              </div>
            )}
            
            <div className="backup-actions">
              <Button
                variant="secondary"
                onClick={goBack}
              >
                뒤로
              </Button>
              
              <Button
                variant="primary"
                onClick={verifySeedPhrase}
              >
                확인
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BackupPage;