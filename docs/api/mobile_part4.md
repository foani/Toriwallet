# TORI Wallet 모바일 앱 API 문서 (Part 4)

## 푸시 알림

TORI Wallet 모바일 앱은 Firebase Cloud Messaging(FCM)을 사용하여 푸시 알림을 구현합니다.

### NotificationService

`NotificationService`는 푸시 알림과 관련된 기능을 제공합니다.

```typescript
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

class NotificationService {
  /**
   * FCM 토큰 가져오기
   * @returns FCM 토큰
   */
  async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('Failed to get FCM token', error);
      return null;
    }
  }

  /**
   * 푸시 알림 권한 요청
   * @returns 권한 부여 여부
   */
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      return enabled;
    } catch (error) {
      console.error('Failed to request notification permission', error);
      return false;
    }
  }

  /**
   * 백그라운드 메시지 핸들러 등록
   */
  registerBackgroundMessageHandler() {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });
  }

  /**
   * FCM 토큰 서버에 등록
   * @param walletAddress 지갑 주소
   * @param token FCM 토큰
   * @returns 등록 성공 여부
   */
  async registerTokenWithServer(walletAddress: string, token: string): Promise<boolean> {
    try {
      // API 호출 구현...
      return true;
    } catch (error) {
      console.error('Failed to register token with server', error);
      return false;
    }
  }

  /**
   * FCM 토큰 서버에서 삭제
   * @param walletAddress 지갑 주소
   * @param token FCM 토큰
   * @returns 삭제 성공 여부
   */
  async unregisterTokenFromServer(walletAddress: string, token: string): Promise<boolean> {
    try {
      // API 호출 구현...
      return true;
    } catch (error) {
      console.error('Failed to unregister token from server', error);
      return false;
    }
  }
}
```

### useNotifications

`useNotifications` 훅은 푸시 알림 기능에 대한 간편한 인터페이스를 제공합니다.

```typescript
const useNotifications = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedAccount } = useWallet();
  const notificationService = new NotificationService();
  const storageService = new StorageService();

  const loadNotificationSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const enabled = await storageService.get('notificationsEnabled');
      setIsEnabled(enabled === 'true');
      setError(null);
    } catch (error) {
      setError('Failed to load notification settings');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFCMToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await notificationService.getFCMToken();
      setFcmToken(token);
      setError(null);
    } catch (error) {
      setError('Failed to load FCM token');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedNotifications = await storageService.get('notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
      setError(null);
    } catch (error) {
      setError('Failed to load notifications');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enableNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const permissionGranted = await notificationService.requestPermission();
      
      if (permissionGranted) {
        await storageService.set('notificationsEnabled', 'true');
        setIsEnabled(true);
        
        // FCM 토큰 가져오기
        const token = await notificationService.getFCMToken();
        setFcmToken(token);
        
        // 서버에 토큰 등록
        if (token && selectedAccount) {
          await notificationService.registerTokenWithServer(
            selectedAccount.address,
            token
          );
        }
        
        setError(null);
        return true;
      } else {
        throw new Error('Permission not granted');
      }
    } catch (error) {
      setError('Failed to enable notifications');
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount]);

  const disableNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      await storageService.set('notificationsEnabled', 'false');
      setIsEnabled(false);
      
      // 서버에서 토큰 삭제
      if (fcmToken && selectedAccount) {
        await notificationService.unregisterTokenFromServer(
          selectedAccount.address,
          fcmToken
        );
      }
      
      setError(null);
      return true;
    } catch (error) {
      setError('Failed to disable notifications');
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fcmToken, selectedAccount]);

  const clearAllNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      await storageService.set('notifications', JSON.stringify([]));
      setNotifications([]);
      setError(null);
      return true;
    } catch (error) {
      setError('Failed to clear notifications');
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotificationSettings();
    loadFCMToken();
    loadNotifications();
    
    // 백그라운드 핸들러 등록
    notificationService.registerBackgroundMessageHandler();
    
    // 포그라운드 핸들러 등록
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
      
      // 알림 저장
      if (remoteMessage.data) {
        const newNotification = {
          id: remoteMessage.messageId || `notification_${Date.now()}`,
          title: remoteMessage.notification?.title || 'Notification',
          body: remoteMessage.notification?.body || '',
          data: remoteMessage.data,
          timestamp: Date.now(),
          read: false,
        };
        
        const updatedNotifications = [...notifications, newNotification];
        await storageService.set('notifications', JSON.stringify(updatedNotifications));
        setNotifications(updatedNotifications);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [loadNotificationSettings, loadFCMToken, loadNotifications, notifications]);

  return {
    isEnabled,
    fcmToken,
    notifications,
    isLoading,
    error,
    enableNotifications,
    disableNotifications,
    clearAllNotifications,
    refreshNotifications: loadNotifications,
  };
};
```

## QR 코드 기능

TORI Wallet 모바일 앱은 QR 코드 스캔 및 생성 기능을 제공합니다.

### QRCodeScanner 컴포넌트

`QRCodeScanner` 컴포넌트는 QR 코드 스캔 기능을 제공합니다.

```typescript
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
  };

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: t('QR Scanner'),
          message: t('We need access to your camera'),
          buttonPositive: t('OK'),
          buttonNegative: t('Cancel'),
        }}
        onBarCodeRead={handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>
      </RNCamera>

      <TouchableOpacity
        style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
        onPress={onClose}
      >
        <Text style={[styles.closeButtonText, { color: theme.colors.white }]}>
          {t('Close')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QRCodeScanner;
```

### QRCodeGenerator 컴포넌트

`QRCodeGenerator` 컴포넌트는 QR 코드 생성 기능을 제공합니다.

```typescript
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { captureRef } from 'react-native-view-shot';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  logo?: string;
  title?: string;
  subtitle?: string;
  showShareButton?: boolean;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
  logo,
  title,
  subtitle,
  showShareButton = true,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const qrCodeRef = React.useRef();

  const shareQRCode = async () => {
    try {
      if (!qrCodeRef.current) return;

      const uri = await captureRef(qrCodeRef, {
        format: 'png',
        quality: 0.8,
      });

      await Share.share({
        url: uri,
        title: title || t('TORI Wallet QR Code'),
        message: subtitle || value,
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      )}

      <View
        ref={qrCodeRef}
        style={[
          styles.qrContainer,
          { backgroundColor: theme.colors.card },
        ]}
      >
        <QRCode
          value={value}
          size={size}
          color={theme.colors.text}
          backgroundColor={theme.colors.card}
          logo={logo}
          logoSize={size * 0.2}
          logoBackgroundColor="white"
        />
      </View>

      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          {subtitle}
        </Text>
      )}

      {showShareButton && (
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: theme.colors.primary }]}
          onPress={shareQRCode}
        >
          <Text style={[styles.shareButtonText, { color: theme.colors.white }]}>
            {t('Share')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  qrContainer: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  shareButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QRCodeGenerator;
```

## dApp 브라우저

TORI Wallet 모바일 앱은 dApp 브라우저 기능을 제공합니다.

### DAppBrowserScreen

`DAppBrowserScreen`은 dApp 브라우저 화면을 구현합니다.

```typescript
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  BackHandler,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useDAppBrowser } from '../hooks/useDAppBrowser';
import { useFocusEffect } from '@react-navigation/native';

const DAppBrowserScreen = ({ route, navigation }) => {
  const { initialUrl } = route.params || {};
  const [currentUrl, setCurrentUrl] = useState(initialUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const webViewRef = useRef(null);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { addToHistory, addToFavorites } = useDAppBrowser();

  // 웹뷰 인젝션 자바스크립트
  const injectedJavaScript = `
    window.ethereum = {
      isMetaMask: true,
      networkVersion: '1',
      chainId: '0x1',
      selectedAddress: null,
      request: function(payload) {
        return new Promise(function(resolve, reject) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ethereum_request',
            payload: payload
          }));

          window.ethereumCallbacks = window.ethereumCallbacks || {};
          window.ethereumCallbacks[payload.id] = { resolve, reject };
        });
      },
      on: function(event, callback) {
        window.ethereumEvents = window.ethereumEvents || {};
        window.ethereumEvents[event] = window.ethereumEvents[event] || [];
        window.ethereumEvents[event].push(callback);
      },
      removeListener: function(event, callback) {
        if (window.ethereumEvents && window.ethereumEvents[event]) {
          window.ethereumEvents[event] = window.ethereumEvents[event].filter(
            function(cb) {
              return cb !== callback;
            }
          );
        }
      }
    };
    true;
  `;

  // dApp 메시지 처리
  const handleMessage = async (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    
    if (data.type === 'ethereum_request') {
      const { method, params, id } = data.payload;
      
      try {
        let result;
        
        // 메소드에 따라 처리
        switch (method) {
          case 'eth_requestAccounts':
          case 'eth_accounts':
            // 계정 액세스 요청 처리
            navigation.navigate('DAppConnection', {
              url: currentUrl,
              callback: (approved, accounts) => {
                if (approved && webViewRef.current) {
                  const response = {
                    id,
                    result: accounts,
                    jsonrpc: '2.0'
                  };
                  
                  webViewRef.current.injectJavaScript(`
                    if (window.ethereumCallbacks && window.ethereumCallbacks[${id}]) {
                      window.ethereumCallbacks[${id}].resolve(${JSON.stringify(accounts)});
                      delete window.ethereumCallbacks[${id}];
                    }
                    
                    if (window.ethereumEvents && window.ethereumEvents['accountsChanged']) {
                      window.ethereumEvents['accountsChanged'].forEach(function(callback) {
                        callback(${JSON.stringify(accounts)});
                      });
                    }
                    
                    window.ethereum.selectedAddress = ${JSON.stringify(accounts[0] || null)};
                    true;
                  `);
                } else if (webViewRef.current) {
                  webViewRef.current.injectJavaScript(`
                    if (window.ethereumCallbacks && window.ethereumCallbacks[${id}]) {
                      window.ethereumCallbacks[${id}].reject(new Error('User rejected the request'));
                      delete window.ethereumCallbacks[${id}];
                    }
                    true;
                  `);
                }
              }
            });
            return;
            
          case 'eth_sendTransaction':
            // 트랜잭션 서명 요청 처리
            navigation.navigate('DAppTransaction', {
              url: currentUrl,
              transaction: params[0],
              callback: (approved, txHash) => {
                if (approved && webViewRef.current) {
                  webViewRef.current.injectJavaScript(`
                    if (window.ethereumCallbacks && window.ethereumCallbacks[${id}]) {
                      window.ethereumCallbacks[${id}].resolve(${JSON.stringify(txHash)});
                      delete window.ethereumCallbacks[${id}];
                    }
                    true;
                  `);
                } else if (webViewRef.current) {
                  webViewRef.current.injectJavaScript(`
                    if (window.ethereumCallbacks && window.ethereumCallbacks[${id}]) {
                      window.ethereumCallbacks[${id}].reject(new Error('User rejected the request'));
                      delete window.ethereumCallbacks[${id}];
                    }
                    true;
                  `);
                }
              }
            });
            return;
            
          // 다른 메소드 처리...
          
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
      } catch (error) {
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (window.ethereumCallbacks && window.ethereumCallbacks[${id}]) {
              window.ethereumCallbacks[${id}].reject(new Error(${JSON.stringify(error.message)}));
              delete window.ethereumCallbacks[${id}];
            }
            true;
          `);
        }
      }
    }
  };

  // 히스토리에 추가
  const handleNavigationStateChange = (navState) => {
    const { url, title, canGoBack, canGoForward, loading } = navState;
    
    setCurrentUrl(url);
    setCanGoBack(canGoBack);
    setCanGoForward(canGoForward);
    setIsLoading(loading);
    
    if (!loading && title && url) {
      addToHistory(url, title);
    }
  };

  // 뒤로가기 처리
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [canGoBack])
  );

  // URL 로드
  const loadUrl = () => {
    let url = currentUrl;
    
    // URL 형식 확인 및 수정
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
      setCurrentUrl(url);
    }
    
    if (webViewRef.current && url) {
      webViewRef.current.injectJavaScript(`
        window.location.href = '${url}';
        true;
      `);
    }
  };

  // 북마크에 추가
  const addBookmark = async () => {
    if (!currentUrl) return;
    
    try {
      const added = await addToFavorites({
        url: currentUrl,
        title: webViewRef.current?.title || currentUrl,
      });
      
      if (added) {
        Alert.alert(
          t('Bookmark Added'),
          t('This DApp has been added to your bookmarks.'),
          [{ text: t('OK') }]
        );
      }
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      Alert.alert(
        t('Error'),
        t('Failed to add bookmark. Please try again.'),
        [{ text: t('OK') }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 주소 표시줄 */}
      <View style={[styles.addressBar, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.addressInput, { color: theme.colors.text }]}
          value={currentUrl}
          onChangeText={setCurrentUrl}
          placeholder={t('Enter URL')}
          placeholderTextColor={theme.colors.text + '80'}
          autoCapitalize="none"
          autoCorrect={false}
          selectTextOnFocus
          returnKeyType="go"
          onSubmitEditing={loadUrl}
        />
        
        <TouchableOpacity
          style={styles.goButton}
          onPress={loadUrl}
        >
          <Icon name="arrow-forward" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 웹뷰 */}
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl || 'about:blank' }}
        style={styles.webView}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
      />

      {/* 하단 버튼 바 */}
      <View style={[styles.bottomBar, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => webViewRef.current?.goBack()}
          disabled={!canGoBack}
        >
          <Icon
            name="arrow-back"
            size={24}
            color={canGoBack ? theme.colors.text : theme.colors.text + '40'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => webViewRef.current?.goForward()}
          disabled={!canGoForward}
        >
          <Icon
            name="arrow-forward"
            size={24}
            color={canGoForward ? theme.colors.text : theme.colors.text + '40'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => webViewRef.current?.reload()}
        >
          <Icon name="refresh" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={addBookmark}
        >
          <Icon name="bookmark" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('DAppsList')}
        >
          <Icon name="apps" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  addressInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  goButton: {
    padding: 8,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    height: 50,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DAppBrowserScreen;
```
