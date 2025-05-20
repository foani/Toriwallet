import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  isLoading = false,
  startIcon,
  endIcon,
  disabled,
  className = '',
  ...props
}) => {
  // 버튼 클래스 결정
  const getButtonClasses = () => {
    const classes = ['btn'];
    
    // 변형에 따른 클래스
    switch (variant) {
      case 'primary':
        classes.push('btn-primary');
        break;
      case 'secondary':
        classes.push('btn-secondary');
        break;
      case 'text':
        classes.push('btn-text');
        break;
      default:
        classes.push('btn-primary');
    }
    
    // 크기에 따른 클래스
    switch (size) {
      case 'small':
        classes.push('btn-sm');
        break;
      case 'large':
        classes.push('btn-lg');
        break;
      default:
        // 기본 크기는 클래스가 필요 없음
        break;
    }
    
    // 전체 너비 클래스
    if (fullWidth) {
      classes.push('btn-block');
    }
    
    // 로딩 상태 클래스
    if (isLoading) {
      classes.push('btn-loading');
    }
    
    // 비활성화 클래스
    if (disabled) {
      classes.push('btn-disabled');
    }
    
    // 사용자 정의 클래스 추가
    if (className) {
      classes.push(className);
    }
    
    return classes.join(' ');
  };
  
  return (
    <button
      className={getButtonClasses()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="btn-spinner" />
      )}
      
      {!isLoading && startIcon && (
        <span className="btn-icon btn-icon-start">{startIcon}</span>
      )}
      
      {children}
      
      {!isLoading && endIcon && (
        <span className="btn-icon btn-icon-end">{endIcon}</span>
      )}
    </button>
  );
};

export default Button;
