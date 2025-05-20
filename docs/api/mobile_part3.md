# TORI Wallet 모바일 앱 API 문서 (Part 3)

## 훅(Hooks) (계속)

### useNFT

`useNFT` 훅은 NFT 관련 기능에 대한 간편한 인터페이스를 제공합니다.

```typescript
const useNFT = () => {
  const { currentNetwork } = useNetwork();
  const { selectedAccount } = useWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nftService = new NFTService();

  const loadNFTs = useCallback(async () => {
    if (!currentNetwork || !selectedAccount) return;
    
    setIsLoading(true);
    try {
      const nfts = await nftService.getNFTs(
        selectedAccount.address,
        currentNetwork.id
      );
      setNfts(nfts);
      setError(null);
    } catch (error) {
      setError('Failed to load NFTs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentNetwork, selectedAccount]);

  const getNFTDetails = useCallback(
    async (contractAddress: string, tokenId: string) => {
      if (!currentNetwork) {
        throw new Error('Network not selected');
      }
      
      setIsLoading(true);
      try {
        const details = await nftService.getNFTDetails(
          contractAddress,
          tokenId,
          currentNetwork.id
        );
        setError(null);
        return details;
      } catch (error) {
        setError('Failed to get NFT details');
        console.error(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentNetwork]
  );

  const transferNFT = useCallback(
    async (contractAddress: string, tokenId: string, toAddress: string) => {
      if (!currentNetwork || !selectedAccount) {
        throw new Error('Network or account not selected');
      }
      
      setIsLoading(true);
      try {
        const txHash = await nftService.transferNFT(
          contractAddress,
          tokenId,
          selectedAccount.address,
          toAddress,
          currentNetwork.id
        );
        await loadNFTs();
        setError(null);
        return txHash;
      } catch (error) {
        setError('Failed to transfer NFT');
        console.error(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentNetwork, selectedAccount, loadNFTs]
  );

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  return {
    nfts,
    isLoading,
    error,
    getNFTDetails,
    transferNFT,
    refreshNFTs: loadNFTs,
  };
};
```

### useCrosschain

`useCrosschain` 훅은 크로스체인 관련 기능에 대한 간편한 인터페이스를 제공합니다.

```typescript
const useCrosschain = () => {
  const { networks, currentNetwork } = useNetwork();
  const { selectedAccount } = useWallet();
  const [transactions, setTransactions] = useState<CrosschainTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crosschainService = new CrosschainService();

  const loadTransactions = useCallback(async () => {
    if (!selectedAccount) return;
    
    setIsLoading(true);
    try {
      const transactions = await crosschainService.getCrosschainHistory(
        selectedAccount.address
      );
      setTransactions(transactions);
      setError(null);
    } catch (error) {
      setError('Failed to load crosschain transactions');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount]);

  const transferICP = useCallback(
    async (targetNetwork: string, toAddress: string, amount: string) => {
      if (!currentNetwork || !selectedAccount) {
        throw new Error('Network or account not selected');
      }
      
      setIsLoading(true);
      try {
        const txHash = await crosschainService.transferICP(
          currentNetwork.id,
          targetNetwork,
          selectedAccount.address,
          toAddress,
          amount
        );
        await loadTransactions();
        setError(null);
        return txHash;
      } catch (error) {
        setError('Failed to transfer via ICP');
        console.error(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentNetwork, selectedAccount, loadTransactions]
  );

  const bridgeTransfer = useCallback(
    async (targetNetwork: string, token: Token, toAddress: string, amount: string) => {
      if (!currentNetwork || !selectedAccount) {
        throw new Error('Network or account not selected');
      }
      
      setIsLoading(true);
      try {
        const txHash = await crosschainService.bridgeTransfer(
          currentNetwork.id,
          targetNetwork,
          token,
          selectedAccount.address,
          toAddress,
          amount
        );
        await loadTransactions();
        setError(null);
        return txHash;
      } catch (error) {
        setError('Failed to bridge transfer');
        console.error(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentNetwork, selectedAccount, loadTransactions]
  );

  const getTransactionStatus = useCallback(
    async (txHash: string, sourceNetwork: string, targetNetwork: string) => {
      setIsLoading(true);
      try {
        const status = await crosschainService.getCrosschainTransactionStatus(
          txHash,
          sourceNetwork,
          targetNetwork
        );
        setError(null);
        return status;
      } catch (error) {
        setError('Failed to get transaction status');
        console.error(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    isLoading,
    error,
    transferICP,
    bridgeTransfer,
    getTransactionStatus,
    refreshTransactions: loadTransactions,
  };
};
```

## 네비게이션

TORI Wallet 모바일 앱은 React Navigation을 사용하여 화면 간 네비게이션을 관리합니다.

### AppNavigator

`AppNavigator`는 앱의 최상위 네비게이터로, 인증 상태에 따라 다른 네비게이터를 렌더링합니다.

```typescript
const AppNavigator = () => {
  const { isInitialized, isAuthenticated } = useAuth();

  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
```

### AuthNavigator

`AuthNavigator`는 인증 전 화면들을 관리합니다.

```typescript
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
      <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />
      <Stack.Screen name="BackupSeed" component={BackupSeedScreen} />
      <Stack.Screen name="VerifySeed" component={VerifySeedScreen} />
    </Stack.Navigator>
  );
};
```

### MainNavigator

`MainNavigator`는 인증 후 주요 화면들을 관리합니다.

```typescript
const MainNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Wallet"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Staking') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Browser') {
            iconName = focused ? 'globe' : 'globe-outline';
          } else if (route.name === 'NFT') {
            iconName = focused ? 'image' : 'image-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Wallet"
        component={WalletNavigator}
        options={{ title: 'Wallet' }}
      />
      <Tab.Screen
        name="Staking"
        component={StakingNavigator}
        options={{ title: 'Staking' }}
      />
      <Tab.Screen
        name="Browser"
        component={BrowserNavigator}
        options={{ title: 'Browser' }}
      />
      <Tab.Screen
        name="NFT"
        component={NFTNavigator}
        options={{ title: 'NFT' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};
```

### WalletNavigator

`WalletNavigator`는 지갑 관련 화면들을 관리합니다.

```typescript
const WalletNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Send"
        component={SendScreen}
        options={{ title: 'Send' }}
      />
      <Stack.Screen
        name="Receive"
        component={ReceiveScreen}
        options={{ title: 'Receive' }}
      />
      <Stack.Screen
        name="TransactionHistory"
        component={TransactionHistoryScreen}
        options={{ title: 'Transaction History' }}
      />
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{ title: 'Transaction Details' }}
      />
      <Stack.Screen
        name="ManageAccounts"
        component={ManageAccountsScreen}
        options={{ title: 'Manage Accounts' }}
      />
      <Stack.Screen
        name="Crosschain"
        component={CrosschainNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
```

## 생체 인증

TORI Wallet 모바일 앱은 React Native Biometrics를 사용하여 생체 인증을 구현합니다.

### BiometricService

`BiometricService`는 생체 인증과 관련된 기능을 제공합니다.

```typescript
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

class BiometricService {
  private rnBiometrics: ReactNativeBiometrics;

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics();
  }

  /**
   * 생체 인증이 사용 가능한지 확인
   * @returns 생체 인증 가능 여부 및 유형
   */
  async isBiometricAvailable(): Promise<{ available: boolean; biometryType: string | null }> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      return { available, biometryType };
    } catch (error) {
      console.error('Failed to check biometric availability', error);
      return { available: false, biometryType: null };
    }
  }

  /**
   * 생체 인증 프롬프트 표시
   * @param promptMessage 프롬프트 메시지
   * @returns 인증 성공 여부
   */
  async authenticate(promptMessage: string): Promise<boolean> {
    try {
      const { success } = await this.rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancel',
      });
      return success;
    } catch (error) {
      console.error('Biometric authentication failed', error);
      return false;
    }
  }

  /**
   * 생체 인증용 키 쌍 생성
   * @param keyName 키 이름
   * @returns 키 생성 성공 여부 및 공개 키
   */
  async createKeys(keyName: string): Promise<{ publicKey: string | null; success: boolean }> {
    try {
      const result = await this.rnBiometrics.createKeys(keyName);
      return result;
    } catch (error) {
      console.error('Failed to create biometric keys', error);
      return { publicKey: null, success: false };
    }
  }

  /**
   * 생체 인증으로 서명
   * @param message 서명할 메시지
   * @param keyName 키 이름
   * @param promptMessage 프롬프트 메시지
   * @returns 서명 및 성공 여부
   */
  async createSignature(
    message: string,
    keyName: string,
    promptMessage: string
  ): Promise<{ signature: string | null; success: boolean }> {
    try {
      const payload = `${message}`;
      const result = await this.rnBiometrics.createSignature({
        promptMessage,
        payload,
        cancelButtonText: 'Cancel',
      });
      return result;
    } catch (error) {
      console.error('Failed to create biometric signature', error);
      return { signature: null, success: false };
    }
  }

  /**
   * 생체 인증용 키 삭제
   * @returns 삭제 성공 여부
   */
  async deleteKeys(): Promise<boolean> {
    try {
      const { keysDeleted } = await this.rnBiometrics.deleteKeys();
      return keysDeleted;
    } catch (error) {
      console.error('Failed to delete biometric keys', error);
      return false;
    }
  }
}
```

### useBiometrics

`useBiometrics` 훅은 생체 인증 기능에 대한 간편한 인터페이스를 제공합니다.

```typescript
const useBiometrics = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const biometricService = new BiometricService();
  const storageService = new StorageService();

  const checkBiometricAvailability = useCallback(async () => {
    setIsLoading(true);
    try {
      const { available, biometryType } = await biometricService.isBiometricAvailable();
      setIsAvailable(available);
      setBiometryType(biometryType);

      // 저장된 설정 확인
      const enabled = await storageService.get('biometricsEnabled');
      setIsEnabled(enabled === 'true');

      setError(null);
    } catch (error) {
      setError('Failed to check biometric availability');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enableBiometrics = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!isAvailable) {
        throw new Error('Biometrics not available on this device');
      }

      const { success } = await biometricService.createKeys('tori_wallet_biometric_key');
      
      if (success) {
        await storageService.set('biometricsEnabled', 'true');
        setIsEnabled(true);
        setError(null);
        return true;
      } else {
        throw new Error('Failed to create biometric keys');
      }
    } catch (error) {
      setError('Failed to enable biometrics');
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable]);

  const disableBiometrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const keysDeleted = await biometricService.deleteKeys();
      
      if (keysDeleted) {
        await storageService.set('biometricsEnabled', 'false');
        setIsEnabled(false);
        setError(null);
        return true;
      } else {
        throw new Error('Failed to delete biometric keys');
      }
    } catch (error) {
      setError('Failed to disable biometrics');
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const authenticateWithBiometrics = useCallback(
    async (promptMessage: string = 'Authenticate to continue') => {
      setIsLoading(true);
      try {
        if (!isAvailable || !isEnabled) {
          throw new Error('Biometrics not available or not enabled');
        }

        const success = await biometricService.authenticate(promptMessage);
        setError(null);
        return success;
      } catch (error) {
        setError('Biometric authentication failed');
        console.error(error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAvailable, isEnabled]
  );

  const signWithBiometrics = useCallback(
    async (
      message: string,
      promptMessage: string = 'Sign with biometrics'
    ) => {
      setIsLoading(true);
      try {
        if (!isAvailable || !isEnabled) {
          throw new Error('Biometrics not available or not enabled');
        }

        const { signature, success } = await biometricService.createSignature(
          message,
          'tori_wallet_biometric_key',
          promptMessage
        );
        
        if (success && signature) {
          setError(null);
          return signature;
        } else {
          throw new Error('Failed to create signature');
        }
      } catch (error) {
        setError('Biometric signing failed');
        console.error(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAvailable, isEnabled]
  );

  useEffect(() => {
    checkBiometricAvailability();
  }, [checkBiometricAvailability]);

  return {
    isAvailable,
    biometryType,
    isEnabled,
    isLoading,
    error,
    enableBiometrics,
    disableBiometrics,
    authenticateWithBiometrics,
    signWithBiometrics,
    checkBiometricAvailability,
  };
};
```
