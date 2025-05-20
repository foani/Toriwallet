import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  fullPage?: boolean;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  color = 'primary',
  fullPage = false,
  text,
}) => {
  // 로딩 스피너 크기 결정
  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };
  
  // 로딩 스피너 클래스 결정
  const getSpinnerClasses = () => {
    const classes = ['loading-spinner'];
    
    switch (color) {
      case 'secondary':
        classes.push('loading-spinner-secondary');
        break;
      case 'white':
        classes.push('loading-spinner-white');
        break;
      default:
        // 기본 색상은 클래스가 필요 없음
        break;
    }
    
    return classes.join(' ');
  };
  
  // 전체 페이지 로딩 화면
  if (fullPage) {
    return (
      <div className="loading-fullpage">
        <div className="loading-container">
          <div
            className={getSpinnerClasses()}
            style={{ width: getSpinnerSize(), height: getSpinnerSize() }}
          />
          {text && <div className="loading-text">{text}</div>}
        </div>
      </div>
    );
  }
  
  // 일반 로딩 화면
  return (
    <div className="loading">
      <div
        className={getSpinnerClasses()}
        style={{ width: getSpinnerSize(), height: getSpinnerSize() }}
      />
      {text && <div className="loading-text">{text}</div>}
    </div>
  );
};

export default Loading;
