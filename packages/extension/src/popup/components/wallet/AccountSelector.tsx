import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface Account {
  address: string;
  name: string;
}

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccount: string;
  onSelectAccount: (address: string) => void;
  onCreateAccount: () => void;
  onImportAccount: () => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccount,
  onSelectAccount,
  onCreateAccount,
  onImportAccount,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 모달 열기
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  // 계정 선택 처리
  const handleSelectAccount = (address: string) => {
    onSelectAccount(address);
    closeModal();
  };
  
  // 선택된 계정 표시 이름 및 주소 가져오기
  const getSelectedAccountInfo = () => {
    const account = accounts.find((acc) => acc.address === selectedAccount);
    
    if (!account) {
      return {
        name: '계정 없음',
        shortenedAddress: '',
      };
    }
    
    return {
      name: account.name,
      shortenedAddress: shortenAddress(account.address),
    };
  };
  
  // 주소 축약 (0x1234...5678 형식)
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const { name, shortenedAddress } = getSelectedAccountInfo();
  
  // 모달 푸터
  const modalFooter = (
    <div className="account-selector-actions">
      <Button
        variant="secondary"
        onClick={onImportAccount}
        className="account-action-btn"
      >
        계정 가져오기
      </Button>
      <Button
        variant="primary"
        onClick={onCreateAccount}
        className="account-action-btn"
      >
        새 계정 만들기
      </Button>
    </div>
  );
  
  return (
    <>
      <div className="account-selector" onClick={openModal}>
        <div className="account-info">
          <h3 className="account-name">{name}</h3>
          <span className="account-address">{shortenedAddress}</span>
        </div>
        <span className="account-selector-arrow">▾</span>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="계정 선택"
        footer={modalFooter}
      >
        <div className="account-list">
          {accounts.length === 0 ? (
            <div className="no-accounts">
              <p>계정이 없습니다. 새 계정을 만들거나 기존 계정을 가져오세요.</p>
            </div>
          ) : (
            accounts.map((account) => (
              <div
                key={account.address}
                className={`account-item ${
                  account.address === selectedAccount ? 'account-selected' : ''
                }`}
                onClick={() => handleSelectAccount(account.address)}
              >
                <div className="account-item-icon">
                  {/* 계정 아이콘 (예: 아바타 등) */}
                </div>
                <div className="account-item-details">
                  <h4 className="account-item-name">{account.name}</h4>
                  <span className="account-item-address">
                    {shortenAddress(account.address)}
                  </span>
                </div>
                {account.address === selectedAccount && (
                  <span className="account-item-selected">✓</span>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>
    </>
  );
};

export default AccountSelector;
