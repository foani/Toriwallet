import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Card from '../common/Card';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  networkName: string;
  networkSymbol: string;
}

const ReceiveModal: React.FC<ReceiveModalProps> = ({
  isOpen,
  onClose,
  address,
  networkName,
  networkSymbol,
}) => {
  const [copied, setCopied] = useState(false);
  
  // QR 코드 URL 생성 (주소를 인코딩한 QR 코드)
  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(
    address
  )}&chs=250x250&choe=UTF-8&chld=L|0`;
  
  // 주소 복사
  const copyToClipboard = () => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      
      // 2초 후 복사 상태 초기화
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  };
  
  // 주소 형식화 (5자마다 공백 추가하여 가독성 향상)
  const formatAddress = (address: string) => {
    return address.match(/.{1,4}/g)?.join(' ') || address;
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${networkSymbol} 받기`} maxWidth="sm">
      <div className="receive-modal-content">
        <p className="receive-instruction">
          아래 QR 코드를 스캔하거나 주소를 복사하여 {networkName} 네트워크에서 {networkSymbol}을(를) 받으세요.
        </p>
        
        <Card className="qr-code-card">
          <div className="qr-code-container">
            <img
              src={qrCodeUrl}
              alt={`${address}의 QR 코드`}
              className="qr-code-image"
            />
          </div>
        </Card>
        
        <div className="address-container">
          <div className="address-label">내 {networkSymbol} 주소:</div>
          <div className="address-value">{formatAddress(address)}</div>
        </div>
        
        <div className="receive-actions">
          <Button
            variant="primary"
            onClick={copyToClipboard}
            fullWidth
          >
            {copied ? '주소가 복사되었습니다' : '주소 복사'}
          </Button>
        </div>
        
        <div className="receive-warning">
          <p>
            <strong>중요:</strong> {networkName} 네트워크의 자산만 이 주소로 전송하세요.
            다른 네트워크의 자산을 이 주소로 전송하면 영구적으로 손실될 수 있습니다.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiveModal;
