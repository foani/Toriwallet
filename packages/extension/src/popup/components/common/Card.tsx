import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  elevated?: boolean;
  bordered?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  className = '',
  onClick,
  elevated = false,
  bordered = false,
}) => {
  // 카드 클래스 결정
  const getCardClasses = () => {
    const classes = ['card'];
    
    if (elevated) {
      classes.push('card-elevated');
    }
    
    if (bordered) {
      classes.push('card-bordered');
    }
    
    if (onClick) {
      classes.push('card-clickable');
    }
    
    if (className) {
      classes.push(className);
    }
    
    return classes.join(' ');
  };
  
  return (
    <div className={getCardClasses()} onClick={onClick}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <div className="card-subtitle">{subtitle}</div>}
        </div>
      )}
      
      <div className="card-body">{children}</div>
      
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
