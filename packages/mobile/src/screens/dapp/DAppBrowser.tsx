import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  BackHandler,
  Share,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// 컴포넌트
import Modal from '../../components/common/Modal';

// 훅
import { useTheme } from '../../hooks/useTheme';
import { useWallet } from '../../hooks/useWallet';
import { useNetwork } from '../../hooks/useNetwork';
import { useDAppConnector } from '../../hooks/useDAppConnector';

// 서비스 및 유틸리티
import { showToast } from '../../utils/toast';
import { isValidUrl, sanitizeUrl, extractHostname } from '../../utils/url';
import { INJECTED_SCRIPT } from '../../services/dapp/injectedScript';

// 타입
type DAppBrowserParams = {
  DAppBrowser: {
    url?: string;
    dappId?: string;
    title?: string;
  };
};

// 내비게이션 컨트롤 버튼 컴포넌트
type NavigationButtonProps = {
  iconName: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
};

const NavigationButton: React.FC<NavigationButtonProps> = ({ 
  iconName, 
  onPress, 
  disabled = false,
  color
}) => {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.navButton, disabled && styles.disabledNavButton]} 
      onPress={onPress}
      disabled={disabled}
    >
      <Icon 
        name={iconName as any} 
        size={22} 
        color={disabled ? theme.colors.secondaryText : (color || theme.colors.text)} 
      />
    </TouchableOpacity>
  );
};

// 연결 요청 모달 컴포넌트
type ConnectionRequestModalProps = {
  visible: boolean;
  origin: string;
  onApprove: () => void;
  onReject: () => void;
};

const ConnectionRequestModal: React.FC<ConnectionRequestModalProps> = ({
  visible,
  origin,
  onApprove,
  onReject
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { activeAccount } = useWallet();
  
  if (!visible) return null;
  
  return (
    <Modal visible={visible} onClose={onReject}>
      <View style={styles.modalContent}>
        <Icon 
          name="link" 
          size={40} 
          color={theme.colors.primary}
          style={styles.modalIcon}
        />
        
        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
          {t('dappBrowser.connectionRequest')}
        </Text>
        
        <Text style={[styles.modalDescription, { color: theme.colors.secondaryText }]}>
          {t('dappBrowser.connectionRequestDescription', { origin })}
        </Text>
        
        <View style={styles.accountContainer}>
          <View style={[styles.accountBadge, { backgroundColor: theme.colors.primary + '20' }]}>
            <Icon name="wallet-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.accountBadgeText, { color: theme.colors.primary }]}>
              {t('dappBrowser.account')}
            </Text>
          </View>
          
          <Text style={[styles.accountAddress, { color: theme.colors.text }]}>
            {activeAccount?.address.substring(0, 10)}...{activeAccount?.address.substring(activeAccount.address.length - 8)}
          </Text>
        </View>
        
        <Text style={[styles.permissionsTitle, { color: theme.colors.text }]}>
          {t('dappBrowser.sitePermissions')}
        </Text>
        
        <View style={styles.permissionsList}>
          <View style={styles.permissionItem}>
            <Icon name="checkmark-circle" size={20} color={theme.colors.success} style={styles.permissionIcon} />
            <Text style={[styles.permissionText, { color: theme.colors.text }]}>
              {t('dappBrowser.permission1')}
            </Text>
          </View>
          
          <View style={styles.permissionItem}>
            <Icon name="checkmark-circle" size={20} color={theme.colors.success} style={styles.permissionIcon} />
            <Text style={[styles.permissionText, { color: theme.colors.text }]}>
              {t('dappBrowser.permission2')}
            </Text>
          </View>
          
          <View style={styles.permissionItem}>
            <Icon name="close-circle" size={20} color={theme.colors.error} style={styles.permissionIcon} />
            <Text style={[styles.permissionText, { color: theme.colors.text }]}>
              {t('dappBrowser.permission3')}
            </Text>
          </View>
        </View>
        
        <View style={styles.modalButtons}>
          <TouchableOpacity 
            style={[styles.modalButton, styles.rejectButton, { borderColor: theme.colors.border }]} 
            onPress={onReject}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              {t('dappBrowser.reject')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modalButton, styles.approveButton, { backgroundColor: theme.colors.primary }]} 
            onPress={onApprove}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              {t('dappBrowser.connect')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// 트랜잭션 서명 모달 컴포넌트
type SignTransactionModalProps = {
  visible: boolean;
  transaction: any; // 실제 구현에서는 더 구체적인 타입 정의 필요
  origin: string;
  onApprove: () => void;
  onReject: () => void;
};

const SignTransactionModal: React.FC<SignTransactionModalProps> = ({
  visible,
  transaction,
  origin,
  onApprove,
  onReject
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { activeAccount } = useWallet();
  const { currentNetwork } = useNetwork();
  
  if (!visible || !transaction) return null;
  
  // 이더리움 단위 변환 (Wei → ETH)
  const formatEther = (wei: string) => {
    try {
      const value = parseFloat(wei) / 1e18;
      return value.toFixed(value < 0.0001 ? 8 : 4);
    } catch (error) {
      return '0';
    }
  };
  
  // 가스 비용 계산
  const calculateGasCost = () => {
    if (!transaction.gasPrice || !transaction.gas) return '0';
    try {
      const gasPrice = parseFloat(transaction.gasPrice);
      const gas = parseFloat(transaction.gas);
      return formatEther((gasPrice * gas).toString());
    } catch (error) {
      return '0';
    }
  };
  
  return (
    <Modal visible={visible} onClose={onReject}>
      <View style={styles.modalContent}>
        <Icon 
          name="document-text-outline" 
          size={40} 
          color={theme.colors.primary}
          style={styles.modalIcon}
        />
        
        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
          {t('dappBrowser.signRequest')}
        </Text>
        
        <Text style={[styles.modalDescription, { color: theme.colors.secondaryText }]}>
          {t('dappBrowser.signRequestDescription', { origin })}
        </Text>
        
        <View style={styles.transactionDetails}>
          <View style={styles.transactionRow}>
            <Text style={[styles.transactionLabel, { color: theme.colors.secondaryText }]}>
              {t('dappBrowser.from')}
            </Text>
            <Text style={[styles.transactionValue, { color: theme.colors.text }]}>
              {transaction.from?.substring(0, 8)}...{transaction.from?.substring(transaction.from.length - 6)}
            </Text>
          </View>
          
          <View style={styles.transactionRow}>
            <Text style={[styles.transactionLabel, { color: theme.colors.secondaryText }]}>
              {t('dappBrowser.to')}
            </Text>
            <Text style={[styles.transactionValue, { color: theme.colors.text }]}>
              {transaction.to?.substring(0, 8)}...{transaction.to?.substring(transaction.to.length - 6)}
            </Text>
          </View>
          
          {transaction.value && (
            <View style={styles.transactionRow}>
              <Text style={[styles.transactionLabel, { color: theme.colors.secondaryText }]}>
                {t('dappBrowser.value')}
              </Text>
              <Text style={[styles.transactionValue, { color: theme.colors.text }]}>
                {formatEther(transaction.value)} {currentNetwork?.nativeCurrency.symbol || 'ETH'}
              </Text>
            </View>
          )}
          
          <View style={styles.transactionRow}>
            <Text style={[styles.transactionLabel, { color: theme.colors.secondaryText }]}>
              {t('dappBrowser.estimatedFee')}
            </Text>
            <Text style={[styles.transactionValue, { color: theme.colors.text }]}>
              {calculateGasCost()} {currentNetwork?.nativeCurrency.symbol || 'ETH'}
            </Text>
          </View>
          
          {transaction.data && transaction.data !== '0x' && (
            <View style={styles.transactionRow}>
              <Text style={[styles.transactionLabel, { color: theme.colors.secondaryText }]}>
                {t('dappBrowser.data')}
              </Text>
              <Text style={[styles.transactionValue, { color: theme.colors.text }]}>
                {transaction.data.length > 20 
                  ? `${transaction.data.substring(0, 20)}...` 
                  : transaction.data}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.modalButtons}>
          <TouchableOpacity 
            style={[styles.modalButton, styles.rejectButton, { borderColor: theme.colors.border }]} 
            onPress={onReject}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
              {t('dappBrowser.reject')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modalButton, styles.approveButton, { backgroundColor: theme.colors.primary }]} 
            onPress={onApprove}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              {t('dappBrowser.sign')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// dApp 브라우저 메인 컴포넌트
const DAppBrowser: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<DAppBrowserParams, 'DAppBrowser'>>();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  
  // 훅 사용
  const { activeAccount } = useWallet();
  const { currentNetwork, allNetworks } = useNetwork();
  const { 
    approveConnection, 
    rejectConnection, 
    approveTransaction, 
    rejectTransaction,
    signMessage,
    rejectMessage,
    isConnected,
    connectedDApps
  } = useDAppConnector();
  
  // 상태 관리
  const [url, setUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('');
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showSignTxModal, setShowSignTxModal] = useState(false);
  const [showSignMsgModal, setShowSignMsgModal] = useState(false);
  const [pendingOrigin, setPendingOrigin] = useState('');
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);
  const [pendingMessage, setPendingMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUrlBar, setShowUrlBar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // 초기 URL 설정
  useEffect(() => {
    if (route.params?.url) {
      const sanitized = sanitizeUrl(route.params.url);
      if (isValidUrl(sanitized)) {
        setUrl(sanitized);
        setInputUrl(sanitized);
      } else {
        // 유효한 URL이 아닌 경우, 검색 엔진 URL로 변환
        const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(route.params.url)}`;
        setUrl(searchUrl);
        setInputUrl(route.params.url);
      }
    } else if (route.params?.dappId) {
      // 미리 정의된 dApp ID를 통한 접근
      const dapp = connectedDApps.find(d => d.id === route.params?.dappId);
      if (dapp) {
        setUrl(dapp.url);
        setInputUrl(dapp.url);
        setCurrentTitle(dapp.name);
      } else {
        // 기본 페이지로 이동
        setUrl('https://duckduckgo.com');
        setInputUrl('https://duckduckgo.com');
      }
    } else {
      // 기본 페이지로 이동
      setUrl('https://duckduckgo.com');
      setInputUrl('https://duckduckgo.com');
    }
  }, [route.params]);
  
  // 뒤로가기 버튼 처리
  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
    return () => backHandler.remove();
  }, [canGoBack]);
  
  // URL 로드 핸들러
  const handleLoadUrl = () => {
    if (!inputUrl.trim()) {
      return;
    }
    
    let processedUrl = inputUrl.trim();
    
    // URL 스키마 추가
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
    }
    
    // 유효성 검사
    if (isValidUrl(processedUrl)) {
      setUrl(processedUrl);
      setShowUrlBar(false);
    } else {
      // 유효한 URL이 아닌 경우, 검색 엔진 URL로 변환
      const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(inputUrl)}`;
      setUrl(searchUrl);
      setShowUrlBar(false);
    }
  };
  
  // 뒤로가기 핸들러
  const handleGoBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    }
  };
  
  // 앞으로가기 핸들러
  const handleGoForward = () => {
    if (canGoForward && webViewRef.current) {
      webViewRef.current.goForward();
    }
  };
  
  // 새로고침 핸들러
  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };
  
  // 공유 핸들러
  const handleShare = async () => {
    try {
      await Share.share({
        message: url,
        title: currentTitle || extractHostname(url),
        url: url
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  // 내비게이션 상태 변경 핸들러
  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentTitle(navState.title);
    setUrl(navState.url);
    setInputUrl(navState.url);
    setIsLoading(navState.loading);
    setError(null);
  };
  
  // 로딩 시작 핸들러
  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };
  
  // 로딩 종료 핸들러
  const handleLoadEnd = () => {
    setIsLoading(false);
  };
  
  // 오류 핸들러
  const handleError = (e: any) => {
    setIsLoading(false);
    setError(e.nativeEvent.description || t('dappBrowser.loadError'));
  };
  
  // 미리보기 찾기 핸들러
  const handleContentProcess = (event: any) => {
    // 웹사이트의 메타 데이터를 처리할 수 있음
    // console.log('Content process:', event.nativeEvent.data);
  };
  
  // 메시지 핸들러 (웹뷰 → 네이티브)
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message from webview:', data.type);
      
      switch (data.type) {
        case 'CONNECT_REQUEST':
          setPendingOrigin(data.payload.origin);
          setShowConnectionModal(true);
          break;
          
        case 'SIGN_TRANSACTION':
          setPendingOrigin(data.payload.origin);
          setPendingTransaction(data.payload.transaction);
          setShowSignTxModal(true);
          break;
          
        case 'SIGN_MESSAGE':
          setPendingOrigin(data.payload.origin);
          setPendingMessage(data.payload.message);
          setShowSignMsgModal(true);
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };
  
  // 연결 요청 승인 핸들러
  const handleApproveConnection = async () => {
    try {
      await approveConnection(pendingOrigin, activeAccount!.address, currentNetwork!.id);
      setShowConnectionModal(false);
      
      // 웹뷰에 메시지 전송
      webViewRef.current?.injectJavaScript(`
        window.ethereum.connectionSuccessCallback();
        true;
      `);
      
      showToast(t('dappBrowser.connectionApproved'), 'success');
    } catch (error) {
      console.error('Error approving connection:', error);
      showToast(t('dappBrowser.connectionError'), 'error');
    }
  };
  
  // 연결 요청 거부 핸들러
  const handleRejectConnection = () => {
    rejectConnection(pendingOrigin);
    setShowConnectionModal(false);
    
    // 웹뷰에 메시지 전송
    webViewRef.current?.injectJavaScript(`
      window.ethereum.connectionRejectedCallback();
      true;
    `);
    
    showToast(t('dappBrowser.connectionRejected'), 'info');
  };
  
  // 트랜잭션 서명 승인 핸들러
  const handleApproveTransaction = async () => {
    try {
      const result = await approveTransaction(pendingTransaction);
      setShowSignTxModal(false);
      
      // 웹뷰에 메시지 전송
      webViewRef.current?.injectJavaScript(`
        window.ethereum.transactionSuccessCallback("${result}");
        true;
      `);
      
      showToast(t('dappBrowser.transactionSigned'), 'success');
    } catch (error) {
      console.error('Error signing transaction:', error);
      showToast(t('dappBrowser.transactionError'), 'error');
      
      // 웹뷰에 오류 메시지 전송
      webViewRef.current?.injectJavaScript(`
        window.ethereum.transactionErrorCallback("${error}");
        true;
      `);
    }
  };
  
  // 트랜잭션 서명 거부 핸들러
  const handleRejectTransaction = () => {
    rejectTransaction();
    setShowSignTxModal(false);
    
    // 웹뷰에 메시지 전송
    webViewRef.current?.injectJavaScript(`
      window.ethereum.transactionRejectedCallback();
      true;
    `);
    
    showToast(t('dappBrowser.transactionRejected'), 'info');
  };
  
  // 현재 네트워크 정보를 웹뷰에 주입
  const getInjectedJavaScript = () => {
    if (!currentNetwork) return '';
    
    return `
      // 네트워크 정보 주입
      window.ethereum = window.ethereum || {};
      window.ethereum.chainId = '${currentNetwork.chainIdHex}';
      window.ethereum.networkVersion = '${currentNetwork.chainId}';
      window.ethereum.isMetaMask = true;
      window.ethereum.isCreataWallet = true;
      true;
    `;
  };
  
  // URL 표시 핸들러
  const toggleUrlBar = () => {
    setShowUrlBar(!showUrlBar);
  };
  
  // 메뉴 표시 핸들러
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  
  // 방문 기록 화면으로 이동
  const navigateToHistory = () => {
    navigation.navigate('BrowserHistory' as never);
    setShowMenu(false);
  };
  
  // 북마크 화면으로 이동
  const navigateToBookmarks = () => {
    navigation.navigate('Bookmarks' as never);
    setShowMenu(false);
  };
  
  // 북마크 추가
  const addBookmark = () => {
    navigation.navigate('AddBookmark' as never, {
      url,
      title: currentTitle || extractHostname(url)
    } as never);
    setShowMenu(false);
  };
  
  // 북마크 목록 화면으로 이동
  const navigateToDAppList = () => {
    navigation.navigate('DAppList' as never);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
    >
      <SafeAreaView edges={['top']} style={styles.header}>
        {/* 주소 표시줄 */}
        <View style={[styles.urlBarContainer, { backgroundColor: theme.colors.card }]}>
          {!showUrlBar ? (
            <TouchableOpacity 
              style={[styles.urlBar, { backgroundColor: theme.colors.cardAlt }]} 
              onPress={toggleUrlBar}
            >
              <Icon name="globe-outline" size={18} color={theme.colors.secondaryText} />
              <Text 
                style={[styles.urlText, { color: theme.colors.text }]} 
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {extractHostname(url)}
              </Text>
              <View style={styles.secureIconContainer}>
                {url.startsWith('https://') ? (
                  <Icon name="lock-closed" size={14} color={theme.colors.success} />
                ) : url.startsWith('http://') ? (
                  <Icon name="alert-circle" size={14} color={theme.colors.warning} />
                ) : null}
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.urlInputContainer, { backgroundColor: theme.colors.cardAlt }]}>
              <TextInput
                style={[styles.urlInput, { color: theme.colors.text }]}
                value={inputUrl}
                onChangeText={setInputUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="go"
                onSubmitEditing={handleLoadUrl}
                autoFocus
                selectTextOnFocus
                placeholder="Search or enter website name"
                placeholderTextColor={theme.colors.secondaryText}
              />
              <TouchableOpacity style={styles.urlInputButton} onPress={handleLoadUrl}>
                <Icon name="arrow-forward" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.headerButtons}>
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loadingIndicator} />
            ) : (
              <TouchableOpacity style={styles.headerButton} onPress={handleRefresh}>
                <Icon name="refresh" size={22} color={theme.colors.text} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.headerButton} onPress={toggleMenu}>
              <Icon name="ellipsis-vertical" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* 드롭다운 메뉴 */}
        {showMenu && (
          <View style={[styles.menuDropdown, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity style={styles.menuItem} onPress={navigateToBookmarks}>
              <Icon name="bookmark-outline" size={20} color={theme.colors.text} />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                {t('dappBrowser.bookmarks')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={addBookmark}>
              <Icon name="add-circle-outline" size={20} color={theme.colors.text} />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                {t('dappBrowser.addBookmark')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={navigateToHistory}>
              <Icon name="time-outline" size={20} color={theme.colors.text} />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                {t('dappBrowser.history')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <Icon name="share-outline" size={20} color={theme.colors.text} />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                {t('dappBrowser.share')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={navigateToDAppList}>
              <Icon name="apps-outline" size={20} color={theme.colors.text} />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                {t('dappBrowser.dappList')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
      
      {/* 웹뷰 */}
      <View style={styles.webViewContainer}>
        {url ? (
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            style={styles.webView}
            injectedJavaScript={INJECTED_SCRIPT + getInjectedJavaScript()}
            onNavigationStateChange={handleNavigationStateChange}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            onMessage={handleMessage}
            onContentProcessDidTerminate={handleContentProcess}
            domStorageEnabled={true}
            javaScriptEnabled={true}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            cacheEnabled={true}
          />
        ) : (
          <View style={[styles.placeholderContainer, { backgroundColor: theme.colors.background }]}>
            <Icon name="globe-outline" size={48} color={theme.colors.secondaryText} />
            <Text style={[styles.placeholderText, { color: theme.colors.secondaryText }]}>
              {t('dappBrowser.enterUrl')}
            </Text>
          </View>
        )}
        
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorBackground }]}>
            <Icon name="alert-circle" size={24} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          </View>
        )}
      </View>
      
      {/* 네비게이션 컨트롤 */}
      <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.navigationControls}>
          <NavigationButton 
            iconName="arrow-back" 
            onPress={handleGoBack} 
            disabled={!canGoBack} 
          />
          
          <NavigationButton 
            iconName="arrow-forward" 
            onPress={handleGoForward} 
            disabled={!canGoForward} 
          />
          
          <NavigationButton 
            iconName="home" 
            onPress={() => {
              setUrl('https://duckduckgo.com');
              setInputUrl('https://duckduckgo.com');
            }} 
          />
          
          <NavigationButton 
            iconName="apps-outline" 
            onPress={navigateToDAppList} 
          />
          
          <NavigationButton 
            iconName="wallet-outline" 
            onPress={() => navigation.navigate('Dashboard' as never)} 
            color={theme.colors.primary}
          />
        </View>
      </SafeAreaView>
      
      {/* 연결 요청 모달 */}
      <ConnectionRequestModal
        visible={showConnectionModal}
        origin={pendingOrigin}
        onApprove={handleApproveConnection}
        onReject={handleRejectConnection}
      />
      
      {/* 트랜잭션 서명 모달 */}
      <SignTransactionModal
        visible={showSignTxModal}
        transaction={pendingTransaction}
        origin={pendingOrigin}
        onApprove={handleApproveTransaction}
        onReject={handleRejectTransaction}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    zIndex: 10,
  },
  urlBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  urlBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  urlText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  secureIconContainer: {
    width: 20,
    alignItems: 'center',
  },
  urlInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  urlInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
  },
  urlInputButton: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  loadingIndicator: {
    marginRight: 8,
  },
  menuDropdown: {
    position: 'absolute',
    top: 56,
    right: 16,
    borderRadius: 8,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 14,
    marginLeft: 12,
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    width: '100%',
    paddingVertical: 8,
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledNavButton: {
    opacity: 0.5,
  },
  modalContent: {
    padding: 24,
  },
  modalIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  accountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  accountBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  accountAddress: {
    fontSize: 14,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  permissionsList: {
    marginBottom: 16,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionIcon: {
    marginRight: 8,
  },
  permissionText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  rejectButton: {
    borderWidth: 1,
  },
  approveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDetails: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionLabel: {
    fontSize: 14,
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DAppBrowser;
