import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useNetwork } from '../hooks/useNetwork';
import { useStaking } from '../hooks/useStaking';
import { Validator, Delegation } from '../../core/types';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import StakingForm from '../components/staking/StakingForm';
import { 
  FiChevronLeft, 
  FiExternalLink, 
  FiInfo, 
  FiUsers, 
  FiShield, 
  FiPercent, 
  FiTrendingUp,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';

/**
 * ValidatorDetailsPage 컴포넌트
 * 
 * 특정 검증인의 상세 정보를 보여주고 스테이킹 작업을 수행할 수 있는 페이지
 */
const ValidatorDetailsPage: React.FC = () => {
  const { validatorAddress } = useParams<{ validatorAddress: string }>();
  const navigate = useNavigate();
  const { selectedAccount } = useWallet();
  const { selectedNetwork } = useNetwork();
  const { 
    getValidatorDetails, 
    loadDelegations, 
    delegations, 
    isLoading 
  } = useStaking();

  // 로컬 상태
  const [validator, setValidator] = useState<Validator | null>(null);
  const [userDelegation, setUserDelegation] = useState<Delegation | null>(null);
  const [showStakingForm, setShowStakingForm] = useState<boolean>(false);
  const [votingPowerPercentage, setVotingPowerPercentage] = useState<string>('0');
  const [error, setError] = useState<string>('');

  // 검증인 상세 정보 로드
  const loadValidatorDetails = useCallback(async () => {
    if (!validatorAddress) {
      setError('검증인 주소가 제공되지 않았습니다');
      return;
    }

    try {
      const validatorDetails = await getValidatorDetails(validatorAddress);
      
      if (!validatorDetails) {
        setError('검증인 정보를 찾을 수 없습니다');
        return;
      }
      
      setValidator(validatorDetails);
      
      // 투표력 백분율 계산
      if (validatorDetails.votingPowerPercentage) {
        setVotingPowerPercentage(validatorDetails.votingPowerPercentage.toFixed(2));
      } else if (validatorDetails.votingPower && validatorDetails.totalVotingPower) {
        const percentage = (Number(validatorDetails.votingPower) / Number(validatorDetails.totalVotingPower)) * 100;
        setVotingPowerPercentage(percentage.toFixed(2));
      } else {
        setVotingPowerPercentage('0');
      }
    } catch (error) {
      console.error('검증인 정보 로드 실패:', error);
      setError('검증인 정보를 로드하는 중 오류가 발생했습니다');
    }
  }, [validatorAddress, getValidatorDetails]);

  // 위임 정보 확인
  useEffect(() => {
    if (validatorAddress && delegations.length > 0) {
      const delegation = delegations.find(d => d.validator.address === validatorAddress);
      setUserDelegation(delegation || null);
    } else {
      setUserDelegation(null);
    }
  }, [validatorAddress, delegations]);

  // 초기 데이터 로드
  useEffect(() => {
    if (selectedAccount && selectedNetwork && validatorAddress) {
      loadValidatorDetails();
      loadDelegations();
    }
  }, [
    selectedAccount, 
    selectedNetwork, 
    validatorAddress, 
    loadValidatorDetails, 
    loadDelegations
  ]);

  // 스테이킹 모달 열기
  const handleStake = () => {
    setShowStakingForm(true);
  };

  // 스테이킹 성공 처리
  const handleStakingSuccess = () => {
    setShowStakingForm(false);
    loadDelegations();
  };

  // 외부 링크 열기
  const openExternalLink = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  // 뒤로 가기
  const handleBack = () => {
    navigate('/staking');
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loading />
      </div>
    );
  }

  // 오류가 있거나 검증인 정보가 없을 때
  if (error || !validator) {
    return (
      <div className="p-4 h-full">
        <div className="flex items-center mb-4">
          <button 
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FiChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold ml-2">검증인 정보</h1>
        </div>
        
        <div className="flex flex-col items-center justify-center h-[80%]">
          <FiAlertCircle className="text-5xl text-red-500 mb-4" />
          <h2 className="text-xl font-medium mb-2">
            {error || '검증인 정보를 찾을 수 없습니다'}
          </h2>
          <p className="text-gray-600 mb-4 text-center">
            검증인 주소를 확인하고 다시 시도해주세요.
          </p>
          <Button 
            variant="primary" 
            onClick={handleBack}
          >
            스테이킹 페이지로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // 봉인 상태 표시 컬러
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'JAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // 수수료를 백분율로 변환
  const formatCommission = (commission: number | string | undefined) => {
    if (commission === undefined || commission === null) return 'N/A';
    return `${(Number(commission) * 100).toFixed(2)}%`;
  };

  // 업타임을 백분율로 변환
  const formatUptime = (uptime: number | string | undefined) => {
    if (uptime === undefined || uptime === null) return 'N/A';
    return `${(Number(uptime) * 100).toFixed(2)}%`;
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center mb-4">
        <button 
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <FiChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold ml-2">검증인 정보</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center mb-3">
          {validator.image && (
            <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border">
              <img 
                src={validator.image} 
                alt={validator.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center">
              <h2 className="text-xl font-medium">
                {validator.name || '알 수 없는 검증인'}
              </h2>
              {validator.status && (
                <div className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(validator.status)}`}>
                  {validator.status}
                </div>
              )}
            </div>
            <div className="text-gray-600 text-sm break-all">
              {validator.address}
            </div>
          </div>
        </div>
        
        {userDelegation && (
          <div className="bg-blue-50 rounded-lg p-3 mb-3">
            <div className="text-blue-700 text-sm font-medium">내 스테이킹</div>
            <div className="font-semibold text-lg">
              {parseFloat(userDelegation.amount).toFixed(6)} {selectedNetwork?.nativeCurrency.symbol}
            </div>
            <div className="text-blue-600 text-sm">
              ≈ ${(
                parseFloat(userDelegation.amount) * 
                (selectedNetwork?.nativeCurrency.price || 0)
              ).toFixed(2)}
            </div>
          </div>
        )}
        
        <Button
          variant="primary"
          className="w-full"
          onClick={handleStake}
        >
          {userDelegation ? '추가 스테이킹' : '스테이킹 하기'}
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="font-medium mb-3">검증인 정보</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <FiShield className="text-blue-600" />
            </div>
            <div>
              <div className="text-gray-600 text-xs">자체 스테이킹</div>
              <div className="font-medium">
                {validator.selfDelegation 
                  ? `${parseFloat(validator.selfDelegation).toFixed(2)} ${selectedNetwork?.nativeCurrency.symbol}`
                  : 'N/A'}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-full mr-3">
              <FiTrendingUp className="text-purple-600" />
            </div>
            <div>
              <div className="text-gray-600 text-xs">투표력</div>
              <div className="font-medium">
                {votingPowerPercentage}%
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full mr-3">
              <FiPercent className="text-green-600" />
            </div>
            <div>
              <div className="text-gray-600 text-xs">수수료</div>
              <div className="font-medium">
                {formatCommission(validator.commission)}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-full mr-3">
              <FiTrendingUp className="text-yellow-600" />
            </div>
            <div>
              <div className="text-gray-600 text-xs">예상 APR</div>
              <div className="font-medium">
                {validator.apr
                  ? `${(Number(validator.apr) * 100).toFixed(2)}%`
                  : 'N/A'}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-full mr-3">
              <FiClock className="text-red-600" />
            </div>
            <div>
              <div className="text-gray-600 text-xs">업타임</div>
              <div className="font-medium">
                {formatUptime(validator.uptime)}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-full mr-3">
              <FiUsers className="text-indigo-600" />
            </div>
            <div>
              <div className="text-gray-600 text-xs">위임자 수</div>
              <div className="font-medium">
                {validator.delegators || 'N/A'}
              </div>
            </div>
          </div>
        </div>
        
        {validator.description && (
          <div className="mb-3">
            <div className="text-gray-600 text-xs mb-1">소개</div>
            <div className="text-sm border-l-4 border-gray-200 pl-3 py-1">
              {validator.description}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          {validator.website && (
            <button
              onClick={() => openExternalLink(validator.website || '')}
              className="flex items-center text-blue-600 text-sm"
            >
              웹사이트 <FiExternalLink className="ml-1" />
            </button>
          )}
          {validator.explorer && (
            <button
              onClick={() => openExternalLink(validator.explorer || '')}
              className="flex items-center text-blue-600 text-sm"
            >
              익스플로러에서 보기 <FiExternalLink className="ml-1" />
            </button>
          )}
        </div>
      </div>
      
      {validator.maxDelegation && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center mb-2">
            <FiInfo className="text-blue-600 mr-2" />
            <h3 className="font-medium">위임 제한</h3>
          </div>
          <div className="text-sm text-gray-600">
            이 검증인에 대한 최대 위임 가능 금액은 {parseFloat(validator.maxDelegation).toFixed(6)} {selectedNetwork?.nativeCurrency.symbol}입니다.
          </div>
        </div>
      )}
      
      {/* 스테이킹 양식 모달 */}
      <Modal
        isOpen={showStakingForm}
        onClose={() => setShowStakingForm(false)}
      >
        <StakingForm
          validator={validator}
          onClose={() => setShowStakingForm(false)}
          onSuccess={handleStakingSuccess}
        />
      </Modal>
    </div>
  );
};

export default ValidatorDetailsPage;
