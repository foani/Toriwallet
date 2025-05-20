import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';
import Loading from '../common/Loading';

/**
 * DApp 브라우저 컴포넌트 속성
 */
interface DAppBrowserProps {
  /**
   * 초기 URL
   */
  initialUrl: string;
  
  /**
   * URL 변경 시 호출될 함수
   */
  onUrlChange?: (url: string) => void;
  
  /**
   * 브라우저 닫기 시 호출될 함수
   */
  onClose: () => void;
  
  /**
   * 브라우저 높이 (px)
   */
  height?: number;
}

/**
 * DApp 브라우저 컴포넌트
 * 
 * DApp을 표시하는 내장 브라우저 컴포넌트입니다.
 */
const DAppBrowser: React.FC<DAppBrowserProps> = ({
  initialUrl,
  onUrlChange,
  onClose,
  height = 500,
}) => {
  // 상태 관리
  const [url, setUrl] = useState<string>(initialUrl);
  const [inputUrl, setInputUrl] = useState<string>(initialUrl);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [title, setTitle] = useState<string>('');
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [canGoForward, setCanGoForward] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // iframe 참조
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // URL 입력 참조
  const urlInputRef = useRef<HTMLInputElement>(null);
  
  // 히스토리 관리
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  
  // 페이지 로드 상태 변경 처리
  const handleLoadStart = () => {
    setIsLoading(true);
    setError('');
  };
  
  // 페이지 로드 완료 처리
  const handleLoadEnd = () => {
    setIsLoading(false);
    
    // iframe 내 문서 제목 가져오기
    try {
      if (iframeRef.current?.contentWindow?.document?.title) {
        setTitle(iframeRef.current.contentWindow.document.title);
      }
    } catch (error) {
      console.error('iframe 문서 제목 가져오기 오류:', error);
    }
  };
  
  // 페이지 로드 오류 처리
  const handleLoadError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    setIsLoading(false);
    setError('페이지를 불러오는 중 오류가 발생했습니다.');
  };
  
  // URL 입력 변경 처리
  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
  };
  
  // URL 입력 제출 처리
  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // URL 형식 검증
    let newUrl = inputUrl.trim();
    
    // URL 프로토콜이 없는 경우 추가
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = 'https://' + newUrl;
    }
    
    navigateTo(newUrl);
  };
  
  // URL로 이동
  const navigateTo = (newUrl: string) => {
    // 현재 URL과 같은 경우 무시
    if (newUrl === url) {
      return;
    }
    
    setUrl(newUrl);
    setInputUrl(newUrl);
    
    // 히스토리 및 인덱스 업데이트
    const newHistory = [...history.slice(0, historyIndex + 1), newUrl];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // URL 변경 콜백 호출
    if (onUrlChange) {
      onUrlChange(newUrl);
    }
  };
  
  // 뒤로 가기
  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      
      const prevUrl = history[newIndex];
      setUrl(prevUrl);
      setInputUrl(prevUrl);
      
      // URL 변경 콜백 호출
      if (onUrlChange) {
        onUrlChange(prevUrl);
      }
    }
  };
  
  // 앞으로 가기
  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      
      const nextUrl = history[newIndex];
      setUrl(nextUrl);
      setInputUrl(nextUrl);
      
      // URL 변경 콜백 호출
      if (onUrlChange) {
        onUrlChange(nextUrl);
      }
    }
  };
  
  // 히스토리 인덱스 변경 시 뒤로/앞으로 가기 가능 여부 업데이트
  useEffect(() => {
    setCanGoBack(historyIndex > 0);
    setCanGoForward(historyIndex < history.length - 1);
  }, [historyIndex, history]);
  
  // URL 입력 필드 포커스
  const focusUrlInput = () => {
    if (urlInputRef.current) {
      urlInputRef.current.select();
    }
  };
  
  // 새로고침
  const refresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  };
  
  return (
    <div className="dapp-browser" style={{ height: `${height}px` }}>
      <div className="browser-toolbar">
        <div className="navigation-buttons">
          <Button
            variant="text"
            onClick={goBack}
            disabled={!canGoBack}
            className="nav-button back-button"
          >
            ←
          </Button>
          <Button
            variant="text"
            onClick={goForward}
            disabled={!canGoForward}
            className="nav-button forward-button"
          >
            →
          </Button>
          <Button
            variant="text"
            onClick={refresh}
            className="nav-button refresh-button"
          >
            ↻
          </Button>
        </div>
        
        <form onSubmit={handleUrlSubmit} className="url-form">
          <div className="url-input-container">
            {isLoading && (
              <div className="loading-indicator">
                <div className="loading-spinner"></div>
              </div>
            )}
            <input
              type="text"
              value={inputUrl}
              onChange={handleUrlInputChange}
              onClick={focusUrlInput}
              ref={urlInputRef}
              className="url-input"
              placeholder="URL 입력"
            />
          </div>
        </form>
        
        <div className="browser-actions">
          <Button
            variant="text"
            onClick={onClose}
            className="close-button"
          >
            ✕
          </Button>
        </div>
      </div>
      
      {error ? (
        <div className="browser-error">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <Button
            variant="primary"
            onClick={refresh}
            className="retry-button"
          >
            다시 시도
          </Button>
        </div>
      ) : (
        <div className="browser-content">
          {isLoading && (
            <div className="browser-loading">
              <Loading />
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={url}
            title={title || 'DApp Browser'}
            className="browser-iframe"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={handleLoadEnd}
            onError={handleLoadError}
          />
        </div>
      )}
    </div>
  );
};

export default DAppBrowser;