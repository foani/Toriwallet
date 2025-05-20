import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Tabs from '../components/common/Tabs';
import Loading from '../components/common/Loading';

/**
 * 지갑 가져오기 페이지 컴포넌트
 * 
 * 사용자가 다양한 방법(시드 구문, 개인 키, JSON 파일)으로
 * 기존 지갑을 가져올 수 있게 합니다.
 */
const ImportWallet: React.FC = () => {
  const navigate = useNavigate();
  
  // 가져오기 방법 탭
  const [activeTab, setActiveTab] = useState<string>('seed');
  
  // 입력값 상태
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [privateKey, setPrivateKey] = useState<string>('');
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonPassword, setJsonPassword] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // 오류 상태
  const [errors, setErrors] = useState({
    seedPhrase: '',
    privateKey: '',
    jsonFile: '',
    jsonPassword: '',
    password: '',
    confirmPassword: '',
  });
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 탭 변경 처리
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // 탭 변경 시 오류 초기화
    setErrors({
      seedPhrase: '',
      privateKey: '',
      jsonFile: '',
      jsonPassword: '',
      password: '',
      confirmPassword: '',
    });
  };
  
  // 시드 구문 입력 처리
  const handleSeedPhraseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeedPhrase(e.target.value);
    
    // 오류 초기화
    if (errors.seedPhrase) {
      setErrors(prev => ({ ...prev, seedPhrase: '' }));
    }
  };
  
  // 개인 키 입력 처리
  const handlePrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrivateKey(e.target.value);
    
    // 오류 초기화
    if (errors.privateKey) {
      setErrors(prev => ({ ...prev, privateKey: '' }));
    }
  };
  
  // JSON 파일 선택 처리
  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setJsonFile(file);
    
    // 오류 초기화
    if (errors.jsonFile) {
      setErrors(prev => ({ ...prev, jsonFile: '' }));
    }
  };
  
  // JSON 파일 비밀번호 입력 처리
  const handleJsonPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJsonPassword(e.target.value);
    
    // 오류 초기화
    if (errors.jsonPassword) {
      setErrors(prev => ({ ...prev, jsonPassword: '' }));
    }
  };
  
  // 지갑 비밀번호 입력 처리
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    
    // 오류 초기화
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };
  
  // 지갑 비밀번호 확인 입력 처리
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    
    // 오류 초기화
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };
  
  // 유효성 검사
  const validateForm = (): boolean => {
    const newErrors = {
      seedPhrase: '',
      privateKey: '',
      jsonFile: '',
      jsonPassword: '',
      password: '',
      confirmPassword: '',
    };
    
    let isValid = true;
    
    // 비밀번호 검사
    if (password.length < 8) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다';
      isValid = false;
    }
    
    // 비밀번호 복잡성 검사
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
    
    // 선택된 가져오기 방법에 따른 검사
    if (activeTab === 'seed') {
      // 시드 구문 검사
      if (!seedPhrase.trim()) {
        newErrors.seedPhrase = '시드 구문을 입력하세요';
        isValid = false;
      } else {
        const words = seedPhrase.trim().split(/\s+/);
        if (words.length !== 12 && words.length !== 24) {
          newErrors.seedPhrase = '유효한 12단어 또는 24단어 시드 구문을 입력하세요';
          isValid = false;
        }
      }
    } else if (activeTab === 'private') {
      // 개인 키 검사
      if (!privateKey.trim()) {
        newErrors.privateKey = '개인 키를 입력하세요';
        isValid = false;
      } else if (!/^(0x)?[0-9a-fA-F]{64}$/.test(privateKey.trim())) {
        newErrors.privateKey = '유효한 이더리움 개인 키를 입력하세요';
        isValid = false;
      }
    } else if (activeTab === 'json') {
      // JSON 파일 검사
      if (!jsonFile) {
        newErrors.jsonFile = 'JSON 파일을 선택하세요';
        isValid = false;
      }
      
      // JSON 파일 비밀번호 검사
      if (!jsonPassword) {
        newErrors.jsonPassword = 'JSON 파일 비밀번호를 입력하세요';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // 지갑 가져오기 처리
  const handleImportWallet = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 백그라운드 스크립트에 지갑 가져오기 요청
      // 실제 구현에서는 chrome.runtime.sendMessage 사용
      // 현재는 임시 구현으로 타임아웃 후 대시보드로 이동
      setTimeout(() => {
        setIsLoading(false);
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('지갑 가져오기 오류:', error);
      setIsLoading(false);
    }
  };
  
  // 취소 처리
  const handleCancel = () => {
    navigate('/');
  };
  
  // 로딩 중인 경우 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="import-wallet-page page">
        <Loading text="지갑 가져오는 중..." />
      </div>
    );
  }
  
  return (
    <div className="import-wallet-page page">
      <div className="import-wallet-container">
        <h1 className="page-title">지갑 가져오기</h1>
        <p className="page-description">
          기존 지갑을 가져오려면 아래 방법 중 하나를 선택하세요.
        </p>
        
        <Card className="import-card">
          <Tabs
            tabs={[
              { id: 'seed', label: '시드 구문' },
              { id: 'private', label: '개인 키' },
              { id: 'json', label: 'JSON 파일' },
            ]}
            initialTab={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
          />
          
          <div className="import-content">
            {activeTab === 'seed' && (
              <div className="seed-phrase-form">
                <Input
                  label="시드 구문 (12 또는 24 단어)"
                  value={seedPhrase}
                  onChange={handleSeedPhraseChange}
                  error={!!errors.seedPhrase}
                  errorText={errors.seedPhrase}
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="단어를 공백으로 구분하여 입력하세요"
                />
                <p className="import-helper-text">
                  시드 구문의 단어들을 올바른 순서대로 공백으로 구분하여 입력하세요.
                </p>
              </div>
            )}
            
            {activeTab === 'private' && (
              <div className="private-key-form">
                <Input
                  label="개인 키"
                  value={privateKey}
                  onChange={handlePrivateKeyChange}
                  error={!!errors.privateKey}
                  errorText={errors.privateKey}
                  fullWidth
                  placeholder="0x로 시작하는 64자리 개인 키를 입력하세요"
                />
                <p className="import-helper-text">
                  이더리움 형식의 개인 키를 입력하세요. 이는 일반적으로 0x로 시작하는 64자리 16진수 문자열입니다.
                </p>
              </div>
            )}
            
            {activeTab === 'json' && (
              <div className="json-form">
                <div className="json-file-input">
                  <label className="form-label">JSON 키스토어 파일</label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleJsonFileChange}
                    className="file-input"
                  />
                  {errors.jsonFile && (
                    <span className="form-helper form-helper-error">
                      {errors.jsonFile}
                    </span>
                  )}
                </div>
                
                <Input
                  label="JSON 파일 비밀번호"
                  type="password"
                  value={jsonPassword}
                  onChange={handleJsonPasswordChange}
                  error={!!errors.jsonPassword}
                  errorText={errors.jsonPassword}
                  fullWidth
                  placeholder="JSON 파일을 암호화한 비밀번호를 입력하세요"
                />
                
                <p className="import-helper-text">
                  이더리움 지갑 애플리케이션(MetaMask, MyEtherWallet 등)에서 내보낸 JSON 키스토어 파일을 선택하세요.
                </p>
              </div>
            )}
            
            <div className="wallet-password-form">
              <h3 className="section-title">새 지갑 비밀번호 설정</h3>
              <p className="section-description">
                이 비밀번호는 가져온 지갑을 보호하는 데 사용됩니다.
              </p>
              
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
          </div>
        </Card>
        
        <div className="import-actions">
          <Button variant="secondary" onClick={handleCancel}>
            취소
          </Button>
          <Button variant="primary" onClick={handleImportWallet}>
            지갑 가져오기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImportWallet;
