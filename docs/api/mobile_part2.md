# TORI Wallet 모바일 앱 API 문서 (Part 2)

## 서비스 API (계속)

### StakingService

`StakingService`는 스테이킹 기능을 제공합니다.

#### 주요 메서드

```typescript
class StakingService {
  /**
   * 검증인 목록 가져오기
   * @param network 네트워크 식별자
   * @returns 검증인 목록
   */
  async getValidators(network: string): Promise<Validator[]> {
    // 구현...
  }

  /**
   * 검증인 세부 정보 가져오기
   * @param validatorId 검증인 식별자
   * @param network 네트워크 식별자
   * @returns 검증인 세부 정보
   */
  async getValidatorDetails(validatorId: string, network: string): Promise<ValidatorDetails> {
    // 구현...
  }

  /**
   * 스테이킹 수행
   * @param validatorId 검증인 식별자
   * @param amount 스테이킹 금액
   * @param duration 스테이킹 기간 (일)
   * @param from 송신자 주소
   * @returns 트랜잭션 해시
   */
  async stake(validatorId: string, amount: string, duration: number, from: string): Promise<string> {
    // 구현...
  }

  /**
   * 언스테이킹 수행
   * @param validatorId 검증인 식별자
   * @param amount 언스테이킹 금액
   * @param from 송신자 주소
   * @returns 트랜잭션 해시
   */
  async unstake(validatorId: string, amount: string, from: string): Promise<string> {
    // 구현...
  }

  /**
   * 스테이킹 보상 수령
   * @param validatorId 검증인 식별자
   * @param from 송신자 주소
   * @returns 트랜잭션 해시
   */
  async claimRewards(validatorId: string, from: string): Promise<string> {
    // 구현...
  }

  /**
   * 스테이킹 현황 가져오기
   * @param address 계정 주소
   * @param network 네트워크 식별자
   * @returns 스테이킹 현황
   */
  async getStakingPositions(address: string, network: string): Promise<StakingPosition[]> {
    // 구현...
  }

  /**
   * 누적 보상 가져오기
   * @param address 계정 주소
   * @param validatorId 검증인 식별자
   * @param network 네트워크 식별자
   * @returns 누적 보상
   */
  async getAccumulatedRewards(
    address: string,
    validatorId: string,
    network: string
  ): Promise<string> {
    // 구현...
  }
}
```

### CrosschainService

`CrosschainService`는 크로스체인 기능을 제공합니다.

#### 주요 메서드

```typescript
class CrosschainService {
  /**
   * ICP 인터체인 전송
   * @param sourceNetwork 원본 네트워크
   * @param targetNetwork 대상 네트워크
   * @param fromAddress 송신자 주소
   * @param toAddress 수신자 주소
   * @param amount 전송 금액
   * @returns 트랜잭션 해시
   */
  async transferICP(
    sourceNetwork: string,
    targetNetwork: string,
    fromAddress: string,
    toAddress: string,
    amount: string
  ): Promise<string> {
    // 구현...
  }

  /**
   * 크로스체인 브릿지 전송
   * @param sourceNetwork 원본 네트워크
   * @param targetNetwork 대상 네트워크
   * @param token 토큰 정보
   * @param fromAddress 송신자 주소
   * @param toAddress 수신자 주소
   * @param amount 전송 금액
   * @returns 트랜잭션 해시
   */
  async bridgeTransfer(
    sourceNetwork: string,
    targetNetwork: string,
    token: Token,
    fromAddress: string,
    toAddress: string,
    amount: string
  ): Promise<string> {
    // 구현...
  }

  /**
   * 크로스체인 트랜잭션 상태 확인
   * @param txHash 트랜잭션 해시
   * @param sourceNetwork 원본 네트워크
   * @param targetNetwork 대상 네트워크
   * @returns 크로스체인 트랜잭션 상태
   */
  async getCrosschainTransactionStatus(
    txHash: string,
    sourceNetwork: string,
    targetNetwork: string
  ): Promise<CrosschainTransactionStatus> {
    // 구현...
  }

  /**
   * 크로스체인 히스토리 가져오기
   * @param address 계정 주소
   * @param page 페이지 번호 (선택적)
   * @param limit 페이지당 항목 수 (선택적)
   * @returns 크로스체인 트랜잭션 목록
   */
  async getCrosschainHistory(
    address: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CrosschainTransaction[]> {
    // 구현...
  }
}
```

### NFTService

`NFTService`는 NFT 관리 기능을 제공합니다.

#### 주요 메서드

```typescript
class NFTService {
  /**
   * NFT 목록 가져오기
   * @param address 계정 주소
   * @param network 네트워크 식별자
   * @returns NFT 목록
   */
  async getNFTs(address: string, network: string): Promise<NFT[]> {
    // 구현...
  }

  /**
   * NFT 세부 정보 가져오기
   * @param contractAddress 컨트랙트 주소
   * @param tokenId 토큰 ID
   * @param network 네트워크 식별자
   * @returns NFT 세부 정보
   */
  async getNFTDetails(
    contractAddress: string,
    tokenId: string,
    network: string
  ): Promise<NFTDetails> {
    // 구현...
  }

  /**
   * NFT 전송
   * @param contractAddress 컨트랙트 주소
   * @param tokenId 토큰 ID
   * @param fromAddress 송신자 주소
   * @param toAddress 수신자 주소
   * @param network 네트워크 식별자
   * @returns 트랜잭션 해시
   */
  async transferNFT(
    contractAddress: string,
    tokenId: string,
    fromAddress: string,
    toAddress: string,
    network: string
  ): Promise<string> {
    // 구현...
  }
}
```

### DAppBrowserService

`DAppBrowserService`는 dApp 브라우저 기능을 제공합니다.

#### 주요 메서드

```typescript
class DAppBrowserService {
  /**
   * 인기 dApp 목록 가져오기
   * @param category dApp 카테고리 (선택적)
   * @param network 네트워크 식별자 (선택적)
   * @returns dApp 목록
   */
  async getPopularDApps(category?: string, network?: string): Promise<DApp[]> {
    // 구현...
  }

  /**
   * dApp 즐겨찾기 목록 가져오기
   * @returns 즐겨찾기 dApp 목록
   */
  async getFavoriteDApps(): Promise<DApp[]> {
    // 구현...
  }

  /**
   * dApp 즐겨찾기 추가
   * @param dapp dApp 정보
   * @returns 성공 여부
   */
  async addFavoriteDApp(dapp: DApp): Promise<boolean> {
    // 구현...
  }

  /**
   * dApp 즐겨찾기 제거
   * @param dappUrl dApp URL
   * @returns 성공 여부
   */
  async removeFavoriteDApp(dappUrl: string): Promise<boolean> {
    // 구현...
  }

  /**
   * dApp 브라우저 히스토리 가져오기
   * @param limit 항목 수 (선택적)
   * @returns 브라우저 히스토리
   */
  async getBrowserHistory(limit?: number): Promise<BrowserHistoryItem[]> {
    // 구현...
  }

  /**
   * dApp 브라우저 히스토리 추가
   * @param url 방문한 URL
   * @param title 페이지 제목
   * @returns 성공 여부
   */
  async addBrowserHistory(url: string, title: string): Promise<boolean> {
    // 구현...
  }

  /**
   * dApp 브라우저 히스토리 지우기
   * @returns 성공 여부
   */
  async clearBrowserHistory(): Promise<boolean> {
    // 구현...
  }
}
```

## 훅(Hooks)

### useWallet

`useWallet` 훅은 지갑 관련 기능에 대한 간편한 인터페이스를 제공합니다.

```typescript
const useWallet = () => {
  const walletContext = useContext(WalletContext);

  return {
    wallet: walletContext.wallet,
    accounts: walletContext.accounts,
    isUnlocked: walletContext.isUnlocked,
    selectedAccount: walletContext.selectedAccount,
    isLoading: walletContext.isLoading,
    error: walletContext.error,
    createWallet: walletContext.createWallet,
    importWallet: walletContext.importWallet,
    unlockWallet: walletContext.unlockWallet,
    lockWallet: walletContext.lockWallet,
    selectAccount: walletContext.selectAccount,
    getBalance: walletContext.getBalance,
    signTransaction: walletContext.signTransaction,
    sendTransaction: walletContext.sendTransaction,
    signMessage: walletContext.signMessage,
    exportPrivateKey: walletContext.exportPrivateKey,
    exportSeedPhrase: walletContext.exportSeedPhrase,
  };
};
```

### useNetwork

`useNetwork` 훅은 네트워크 관련 기능에 대한 간편한 인터페이스를 제공합니다.

```typescript
const useNetwork = () => {
  const networkContext = useContext(NetworkContext);

  return {
    networks: networkContext.networks,
    currentNetwork: networkContext.currentNetwork,
    isTestnet: networkContext.isTestnet,
    isLoading: networkContext.isLoading,
    error: networkContext.error,
    getAllNetworks: networkContext.getAllNetworks,
    setCurrentNetwork: networkContext.setCurrentNetwork,
    addCustomNetwork: networkContext.addCustomNetwork,
    removeCustomNetwork: networkContext.removeCustomNetwork,
  };
};
```

### useStaking

`useStaking` 훅은 스테이킹 관련 기능에 대한 간편한 인터페이스를 제공합니다.

```typescript
const useStaking = () => {
  const { currentNetwork } = useNetwork();
  const { selectedAccount } = useWallet();
  const [validators, setValidators] = useState<Validator[]>([]);
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stakingService = new StakingService();

  const loadValidators = useCallback(async () => {
    if (!currentNetwork) return;
    
    setIsLoading(true);
    try {
      const validators = await stakingService.getValidators(currentNetwork.id);
      setValidators(validators);
      setError(null);
    } catch (error) {
      setError('Failed to load validators');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentNetwork]);

  const loadStakingPositions = useCallback(async () => {
    if (!currentNetwork || !selectedAccount) return;
    
    setIsLoading(true);
    try {
      const positions = await stakingService.getStakingPositions(
        selectedAccount.address,
        currentNetwork.id
      );
      setStakingPositions(positions);
      setError(null);
    } catch (error) {
      setError('Failed to load staking positions');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentNetwork, selectedAccount]);

  const stake = useCallback(
    async (validatorId: string, amount: string, duration: number) => {
      if (!currentNetwork || !selectedAccount) {
        throw new Error('Network or account not selected');
      }
      
      setIsLoading(true);
      try {
        const txHash = await stakingService.stake(
          validatorId,
          amount,
          duration,
          selectedAccount.address
        );
        await loadStakingPositions();
        setError(null);
        return txHash;
      } catch (error) {
        setError('Failed to stake');
        console.error(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentNetwork, selectedAccount, loadStakingPositions]
  );

  const unstake = useCallback(
    async (validatorId: string, amount: string) => {
      if (!currentNetwork || !selectedAccount) {
        throw new Error('Network or account not selected');
      }
      
      setIsLoading(true);
      try {
        const txHash = await stakingService.unstake(
          validatorId,
          amount,
          selectedAccount.address
        );
        await loadStakingPositions();
        setError(null);
        return txHash;
      } catch (error) {
        setError('Failed to unstake');
        console.error(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentNetwork, selectedAccount, loadStakingPositions]
  );

  const claimRewards = useCallback(
    async (validatorId: string) => {
      if (!currentNetwork || !selectedAccount) {
        throw new Error('Network or account not selected');
      }
      
      setIsLoading(true);
      try {
        const txHash = await stakingService.claimRewards(
          validatorId,
          selectedAccount.address
        );
        await loadStakingPositions();
        setError(null);
        return txHash;
      } catch (error) {
        setError('Failed to claim rewards');
        console.error(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [currentNetwork, selectedAccount, loadStakingPositions]
  );

  useEffect(() => {
    loadValidators();
  }, [loadValidators]);

  useEffect(() => {
    loadStakingPositions();
  }, [loadStakingPositions]);

  return {
    validators,
    stakingPositions,
    isLoading,
    error,
    stake,
    unstake,
    claimRewards,
    refreshValidators: loadValidators,
    refreshStakingPositions: loadStakingPositions,
  };
};
```
