import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  closeOnOutsideClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
  closeOnOutsideClick = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // ESC 키를 누르면 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  // 모달 외부 클릭 처리
  const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      closeOnOutsideClick &&
      modalRef.current &&
      !modalRef.current.contains(event.target as Node)
    ) {
      onClose();
    }
  };
  
  // 모달이 열려있지 않으면 렌더링하지 않음
  if (!isOpen) {
    return null;
  }
  
  // 모달 최대 너비 클래스
  const getModalClasses = () => {
    const classes = ['modal'];
    
    switch (maxWidth) {
      case 'sm':
        classes.push('modal-sm');
        break;
      case 'lg':
        classes.push('modal-lg');
        break;
      default:
        // 기본 크기는 클래스가 필요 없음
        break;
    }
    
    return classes.join(' ');
  };
  
  return (
    <div className="modal-backdrop" onClick={handleOutsideClick}>
      <div ref={modalRef} className={getModalClasses()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            type="button"
            className="modal-close"
            aria-label="닫기"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        
        <div className="modal-body">{children}</div>
        
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
