import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

interface Network {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  symbol: string;
  blockExplorerUrl?: string;
  isTestnet?: boolean;
  isCustom?: boolean;
}

interface NetworkSelectorProps {
  networks: Network[];
  selectedNetwork: string;
  onSelectNetwork: (networkId: string) => void;
  onAddNetwork: (network: Omit<Network, 'id' | 'isCustom'>) => void;
  onRemoveNetwork: (networkId: string) => void;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  networks,
  selectedNetwork,
  onSelectNetwork,
  onAddNetwork,
  onRemoveNetwork,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  
  // 새 네트워크 폼 상태
  const [newNetwork, setNewNetwork] = useState<Omit<Network, 'id' | 'isCustom'>>({
    name: '',
    chainId: 0,
    rpcUrl: '',
    symbol: '',
    blockExplorerUrl: '',
    isTestnet: false,
  });
  
  // 네트워크 폼 검증 상태
  const [formErrors, setFormErrors] = useState({
    name: '',
    chainId: '',
    rpcUrl: '',
    symbol: '',
  });
  
  // 모달 열기
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setIsAddingNetwork(false);
    resetForm();
  };
  
  // 네트워크 선택 처리
  const handleSelectNetwork = (networkId: string) => {
    onSelectNetwork(networkId);
    closeModal();
  };
  
  // 새 네트워크 추가 모드 전환
  const startAddingNetwork = () => {
    setIsAddingNetwork(true);
  };
  
  // 네트워크 추가 취소
  const cancelAddingNetwork = () => {
    setIsAddingNetwork(false);
    resetForm();
  };
  
  // 폼 초기화
  const resetForm = () => {
    setNewNetwork({
      name: '',
      chainId: 0,
      rpcUrl: '',
      symbol: '',
      blockExplorerUrl: '',
      isTestnet: false,
    });
    setFormErrors({
      name: '',
      chainId: '',
      rpcUrl: '',
      symbol: '',
    });
  };
  
  // 폼 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // 체크박스 또는 일반 입력 필드에 따라 처리
    if (type === 'checkbox') {
      setNewNetwork((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'chainId') {
      // chainId는 숫자로 변환
      setNewNetwork((prev) => ({
        ...prev,
        [name]: value ? parseInt(value, 10) : 0,
      }));
    } else {
      setNewNetwork((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // 입력값 변경 시 해당 필드의 오류 메시지 초기화
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  // 폼 검증
  const validateForm = () => {
    const errors = {
      name: '',
      chainId: '',
      rpcUrl: '',
      symbol: '',
    };
    let isValid = true;
    
    if (!newNetwork.name.trim()) {
      errors.name = '네트워크 이름을 입력하세요';
      isValid = false;
    }
    
    if (!newNetwork.chainId) {
      errors.chainId = '체인 ID를 입력하세요';
      isValid = false;
    }
    
    if (!newNetwork.rpcUrl.trim()) {
      errors.rpcUrl = 'RPC URL을 입력하세요';
      isValid = false;
    } else if (!isValidUrl(newNetwork.rpcUrl)) {
      errors.rpcUrl = '유효한 URL을 입력하세요';
      isValid = false;
    }
    
    if (!newNetwork.symbol.trim()) {
      errors.symbol = '통화 기호를 입력하세요';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // URL 유효성 검사
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // 네트워크 추가 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddNetwork(newNetwork);
      setIsAddingNetwork(false);
      resetForm();
    }
  };
  
  // 네트워크 제거 처리
  const handleRemoveNetwork = (networkId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveNetwork(networkId);
  };
  
  // 선택된 네트워크 정보 가져오기
  const getSelectedNetworkInfo = () => {
    const network = networks.find((net) => net.id === selectedNetwork);
    return network || { name: '네트워크 없음', isTestnet: false };
  };
  
  const selectedNetworkInfo = getSelectedNetworkInfo();
  
  return (
    <>
      <div className="network-selector" onClick={openModal}>
        <div className="network-info">
          <span className="network-name">
            {selectedNetworkInfo.name}
            {selectedNetworkInfo.isTestnet && (
              <span className="network-testnet-badge">테스트넷</span>
            )}
          </span>
        </div>
        <span className="network-selector-arrow">▾</span>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isAddingNetwork ? '네트워크 추가' : '네트워크 선택'}
      >
        {isAddingNetwork ? (
          <form onSubmit={handleSubmit} className="add-network-form">
            <Input
              label="네트워크 이름"
              name="name"
              value={newNetwork.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              errorText={formErrors.name}
              fullWidth
              required
            />
            
            <Input
              label="RPC URL"
              name="rpcUrl"
              value={newNetwork.rpcUrl}
              onChange={handleInputChange}
              error={!!formErrors.rpcUrl}
              errorText={formErrors.rpcUrl}
              fullWidth
              required
            />
            
            <Input
              label="체인 ID"
              name="chainId"
              type="number"
              value={newNetwork.chainId || ''}
              onChange={handleInputChange}
              error={!!formErrors.chainId}
              errorText={formErrors.chainId}
              fullWidth
              required
            />
            
            <Input
              label="통화 기호"
              name="symbol"
              value={newNetwork.symbol}
              onChange={handleInputChange}
              error={!!formErrors.symbol}
              errorText={formErrors.symbol}
              fullWidth
              required
            />
            
            <Input
              label="블록 익스플로러 URL (선택사항)"
              name="blockExplorerUrl"
              value={newNetwork.blockExplorerUrl || ''}
              onChange={handleInputChange}
              fullWidth
            />
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isTestnet"
                  checked={newNetwork.isTestnet}
                  onChange={handleInputChange}
                />
                <span>테스트넷</span>
              </label>
            </div>
            
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={cancelAddingNetwork}
              >
                취소
              </Button>
              <Button type="submit" variant="primary">
                추가
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="network-list">
              {networks.map((network) => (
                <div
                  key={network.id}
                  className={`network-item ${
                    network.id === selectedNetwork ? 'network-selected' : ''
                  }`}
                  onClick={() => handleSelectNetwork(network.id)}
                >
                  <div className="network-item-details">
                    <div className="network-item-name">
                      {network.name}
                      {network.isTestnet && (
                        <span className="network-testnet-badge">테스트넷</span>
                      )}
                    </div>
                    <div className="network-item-info">
                      체인 ID: {network.chainId}
                    </div>
                  </div>
                  
                  {network.isCustom && (
                    <button
                      className="network-remove-btn"
                      onClick={(e) => handleRemoveNetwork(network.id, e)}
                      aria-label="네트워크 제거"
                    >
                      ×
                    </button>
                  )}
                  
                  {network.id === selectedNetwork && (
                    <span className="network-item-selected">✓</span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="network-actions">
              <Button
                variant="primary"
                onClick={startAddingNetwork}
                fullWidth
              >
                커스텀 네트워크 추가
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default NetworkSelector;
