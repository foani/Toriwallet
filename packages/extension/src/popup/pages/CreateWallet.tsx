import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

/**
 * 지갑 생성 페이지 컴포넌트
 * 
 * 사용자가 새 지갑을 생성하는 단계별 과정을 안내합니다.
 * 1. 비밀번호 설정
 * 2. 시드 구문 백업
 * 3. 시드 구문 확인
 */
const CreateWallet: React.FC = () => {
  const navigate = useNavigate();
  
  // 현재 단계
  const [step, setStep] = useState<number>(1);
  
  // 비밀번호 입력 상태
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // 시드 구문 상태
  const [mnemonic, setMnemonic] = useState<string>('');
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  
  // 시드 구문 확인 상태
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [verificationWords, setVerificationWords] = useState<string[]>([]);
  const [verificationIndices, setVerificationIndices] = useState<number[]>([]);
  
  // 에러 상태
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
    verification: '',
  });
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 시드 구문 생성
  useEffect(() => {
    if (step === 2 && !mnemonic) {
      generateMnemonic();
    }
  }, [step, mnemonic]);
  
  // 시드 구문 생성
  const generateMnemonic = async () => {
    try {
      setIsLoading(true);
      
      // 백그라운드 스크립트에 시드 구문 생성 요청
      // 실제 구현에서는 chrome.runtime.sendMessage 사용
      // 현재는 임시 구현으로 가상의 시드 구문 생성
      setTimeout(() => {
        // 임시 구현: 실제 구현 시 제거
        const tempMnemonic = 'abandon ability able about above absent absorb abstract absurd abuse access accident';
        setMnemonic(tempMnemonic);
        setMnemonicWords(tempMnemonic.split(' '));
        
        // 검증용 단어 인덱스 (랜덤으로 3개 선택)
        const indices = generateRandomIndices(12, 3);
        setVerificationIndices(indices);
        
        // 검증용 단어 목록 (시드 구문에서 선택된 인덱스의 단어와 추가 더미 단어들)
        const words = tempMnemonic.split(' ');
        const selectedVerificationWords = indices.map(index => words[index]);
        
        // 더미 단어 추가 및 랜덤 정렬
        const dummyWords = ['wrong', 'fake', 'extra', 'dummy', 'test', 'invalid'];
        const allWords = [...selectedVerificationWords, ...dummyWords];
        setVerificationWords(shuffleArray(allWords));
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('시드 구문 생성 오류:', error);
      setIsLoading(false);
    }
  };
  
  // 랜덤 인덱스 생성 (검증용 단어 선택)
  const generateRandomIndices = (max: number, count: number): number[] => {
    const indices: number[] = [];
    while (indices.length < count) {
      const index = Math.floor(Math.random() * max);
      if (!indices.includes(index)) {
        indices.push(index);
      }
    }
    return indices.sort((a, b) => a - b);
  };
  
  // 배열을 랜덤하게 섞는 함수
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  
  // 비밀번호 입력 처리
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    
    // 오류 초기화
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };
  
  // 비밀번호 확인 입력 처리
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    
    // 오류 초기화
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };
  
  // 비밀번호 유효성 검사
  const validatePassword = (): boolean => {
    const newErrors = {
      password: '',
      confirmPassword: '',
      verification: '',
    };
    
    let isValid = true;
    
    // 비밀번호 길이 검사
    if (password.length < 8) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다';
      isValid = false;
    }
    
    // 비밀번호 복잡성 검사 (영문, 숫자, 특수문자)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
    if (!(hasLetter && hasNumber && hasSpecial)) {
      newErrors.password = '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다';
      isValid = false;
    }
    
    // 비밀번호 일치 검사
    if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
      isValid = false;
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };
  
  // 다음 단계로 이동
  const handleNextStep = () => {
    if (step === 1) {
      if (validatePassword()) {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (validateVerification()) {
        createWallet();
      }
    }
  };
  
  // 이전 단계로 이동
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };
  
  // 검증용 단어 선택 처리
  const handleWordSelection = (word: string) => {
    // 이미 선택된 단어인 경우 제거, 아니면 추가
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      // 최대 3개까지만 선택 가능
      if (selectedWords.length < 3) {
        setSelectedWords([...selectedWords, word]);
      }
    }
    
    // 오류 초기화
    if (errors.verification) {
      setErrors(prev => ({ ...prev, verification: '' }));
    }
  };
  
  // 시드 구문 검증
  const validateVerification = (): boolean => {
    // 정확한 단어 3개가 선택되었는지 확인
    if (selectedWords.length !== 3) {
      setErrors(prev => ({
        ...prev,
        verification: '3개의 단어를 모두 선택해주세요',
      }));
      return false;
    }
    
    // 선택된 단어가 올바른지 확인
    const correctWords = verificationIndices.map(index => mnemonicWords[index]);
    const allCorrect = selectedWords.every(word => correctWords.includes(word));
    
    if (!allCorrect) {
      setErrors(prev => ({
        ...prev,
        verification: '올바른 단어를 선택해주세요',
      }));
      return false;
    }
    
    return true;
  };
  
  // 지갑 생성 및 저장
  const createWallet = async () => {
    try {
      setIsLoading(true);
      
      // 백그라운드 스크립트에 지갑 생성 요청
      // 실제 구현에서는 chrome.runtime.sendMessage 사용
      // 현재는 임시 구현으로 타임아웃 후 대시보드로 이동
      setTimeout(() => {
        setIsLoading(false);
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('지갑 생성 오류:', error);
      setIsLoading(false);
    }
  };
  
  // 로딩 중인 경우 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="create-wallet-page page">
        <Loading text="처리 중..." />
      </div>
    );
  }
  
  // 단계별 렌더링
  const renderStep = () => {
    switch (step) {
      case 1:
        return renderPasswordStep();
      case 2:
        return renderMnemonicStep();
      case 3:
        return renderVerificationStep();
      default:
        return null;
    }
  };
  
  // 비밀번호 설정 단계 렌더링
  const renderPasswordStep = () => {
    return (
      <>
        <h2 className="step-title">지갑 비밀번호 설정</h2>
        <p className="step-description">
          강력한 비밀번호를 설정하여 지갑을 보호하세요. 이 비밀번호는 지갑을 잠금 해제하는 데 사용됩니다.
        </p>
        
        <div className="form-container">
          <Input
            label="비밀번호"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            error={!!errors.password}
            errorText={errors.password}
            fullWidth
          />
          
          <Input
            label="비밀번호 확인"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            error={!!errors.confirmPassword}
            errorText={errors.confirmPassword}
            fullWidth
          />
          
          <div className="password-requirements">
            <h4>비밀번호 요구사항:</h4>
            <ul>
              <li className={password.length >= 8 ? 'satisfied' : ''}>
                최소 8자 이상
              </li>
              <li className={/[a-zA-Z]/.test(password) ? 'satisfied' : ''}>
                영문자 포함
              </li>
              <li className={/[0-9]/.test(password) ? 'satisfied' : ''}>
                숫자 포함
              </li>
              <li className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) ? 'satisfied' : ''}>
                특수문자 포함
              </li>
            </ul>
          </div>
        </div>
      </>
    );
  };
  
  // 시드 구문 백업 단계 렌더링
  const renderMnemonicStep = () => {
    return (
      <>
        <h2 className="step-title">시드 구문 백업</h2>
        <p className="step-description">
          아래 12개 단어를 순서대로 안전한 곳에 백업하세요. 이 시드 구문은 지갑을 복구하는 데 필요합니다.
          <strong> 절대로 다른 사람과 공유하지 마세요!</strong>
        </p>
        
        <Card className="mnemonic-card">
          <div className="mnemonic-warning">
            <p>
              <strong>경고:</strong> 이 시드 구문을 잃어버리면 지갑에 접근할 수 없게 됩니다.
              다른 사람이 이 구문을 알게 되면 귀하의 자산을 도난당할 수 있습니다.
            </p>
          </div>
          
          <div className="mnemonic-container">
            <div className="mnemonic-words">
              {mnemonicWords.map((word, index) => (
                <div key={index} className="mnemonic-word">
                  <span className="mnemonic-word-number">{index + 1}</span>
                  <span className="mnemonic-word-text">{word}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mnemonic-actions">
            <Button variant="secondary" onClick={generateMnemonic}>
              새로 생성
            </Button>
          </div>
        </Card>
        
        <div className="backup-tips">
          <h4>백업 팁:</h4>
          <ul>
            <li>종이에 적어서 안전한 곳에 보관하세요.</li>
            <li>여러 곳에 백업하여 분실 위험을 줄이세요.</li>
            <li>스크린샷을 찍거나 디지털 기기에 저장하지 마세요.</li>
          </ul>
        </div>
      </>
    );
  };
  
  // 시드 구문 검증 단계 렌더링
  const renderVerificationStep = () => {
    return (
      <>
        <h2 className="step-title">시드 구문 확인</h2>
        <p className="step-description">
          시드 구문을 올바르게 백업했는지 확인하기 위해, 아래 단어들 중에서 
          {verificationIndices.map((index, i) => (
            <span key={i}>
              {' '}
              <strong>{index + 1}번째</strong>
              {i < 2 ? ',' : ''}
            </span>
          ))}
          {' '}단어를 선택하세요.
        </p>
        
        {errors.verification && (
          <div className="verification-error">
            {errors.verification}
          </div>
        )}
        
        <div className="verification-container">
          <div className="verification-slots">
            {[0, 1, 2].map(index => (
              <div
                key={index}
                className={`verification-slot ${
                  selectedWords[index] ? 'filled' : ''
                }`}
              >
                {selectedWords[index] || ''}
              </div>
            ))}
          </div>
          
          <div className="verification-options">
            {verificationWords.map((word, index) => (
              <div
                key={index}
                className={`verification-option ${
                  selectedWords.includes(word) ? 'selected' : ''
                }`}
                onClick={() => handleWordSelection(word)}
              >
                {word}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };
  
  return (
    <div className="create-wallet-page page">
      <div className="create-wallet-container">
        <div className="steps-indicator">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`step-indicator ${
                stepNumber === step
                  ? 'active'
                  : stepNumber < step
                  ? 'completed'
                  : ''
              }`}
            >
              <div className="step-number">
                {stepNumber < step ? '✓' : stepNumber}
              </div>
              <div className="step-label">
                {stepNumber === 1
                  ? '비밀번호'
                  : stepNumber === 2
                  ? '백업'
                  : '확인'}
              </div>
            </div>
          ))}
        </div>
        
        <div className="step-content">
          {renderStep()}
        </div>
        
        <div className="step-actions">
          <Button variant="secondary" onClick={handlePrevStep}>
            {step === 1 ? '취소' : '이전'}
          </Button>
          
          <Button variant="primary" onClick={handleNextStep}>
            {step === 3 ? '지갑 생성' : '다음'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateWallet;
