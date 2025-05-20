import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  initialTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'fullWidth' | 'scrollable';
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  initialTab,
  onChange,
  variant = 'default',
  className = '',
}) => {
  // 초기 활성 탭 설정
  const [activeTab, setActiveTab] = useState<string>(
    initialTab || (tabs.length > 0 ? tabs[0].id : '')
  );
  
  // 탭 클릭 처리
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };
  
  // 탭 컨테이너 클래스 결정
  const getTabsContainerClasses = () => {
    const classes = ['tabs-container'];
    
    switch (variant) {
      case 'fullWidth':
        classes.push('tabs-full-width');
        break;
      case 'scrollable':
        classes.push('tabs-scrollable');
        break;
      default:
        // 기본 변형은 클래스가 필요 없음
        break;
    }
    
    if (className) {
      classes.push(className);
    }
    
    return classes.join(' ');
  };
  
  // 개별 탭 클래스 결정
  const getTabClasses = (tabId: string) => {
    const classes = ['tab'];
    
    if (tabId === activeTab) {
      classes.push('tab-active');
    }
    
    return classes.join(' ');
  };
  
  return (
    <div className={getTabsContainerClasses()}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={getTabClasses(tab.id)}
          onClick={() => handleTabClick(tab.id)}
          aria-selected={tab.id === activeTab}
          role="tab"
        >
          {tab.icon && <span className="tab-icon">{tab.icon}</span>}
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
      <div className="tabs-indicator" />
    </div>
  );
};

export default Tabs;
