import { contextBridge, ipcRenderer } from 'electron';

/**
 * 렌더러 프로세스에 API 노출
 * Electron 보안 모델에 따라 contextBridge를 통해 필요한 API만 노출합니다.
 */
export function exposeAPIToRenderer(): void {
  // 지갑 관련 API
  contextBridge.exposeInMainWorld('walletAPI', {
    // 지갑 생성 및 관리
    createWallet: (options: any) => ipcRenderer.invoke('wallet:create', options),
    importWallet: (options: any) => ipcRenderer.invoke('wallet:import', options),
    getWallets: () => ipcRenderer.invoke('wallet:getAll'),
    getWallet: (id: string) => ipcRenderer.invoke('wallet:get', id),
    updateWallet: (id: string, data: any) => ipcRenderer.invoke('wallet:update', id, data),
    deleteWallet: (id: string) => ipcRenderer.invoke('wallet:delete', id),
    
    // 계정 관리
    createAccount: (walletId: string, options: any) => ipcRenderer.invoke('account:create', walletId, options),
    getAccounts: (walletId: string) => ipcRenderer.invoke('account:getAll', walletId),
    updateAccount: (accountId: string, data: any) => ipcRenderer.invoke('account:update', accountId, data),
    deleteAccount: (accountId: string) => ipcRenderer.invoke('account:delete', accountId),
    
    // 트랜잭션 관련
    sendTransaction: (data: any) => ipcRenderer.invoke('transaction:send', data),
    getTransactions: (accountId: string, options: any) => ipcRenderer.invoke('transaction:getAll', accountId, options),
    getTransactionDetails: (txHash: string) => ipcRenderer.invoke('transaction:getDetails', txHash),
    estimateGas: (txData: any) => ipcRenderer.invoke('transaction:estimateGas', txData),
    getGasPrice: (networkId: string) => ipcRenderer.invoke('network:getGasPrice', networkId),
    
    // 네트워크 관리
    getNetworks: () => ipcRenderer.invoke('network:getAll'),
    addNetwork: (networkData: any) => ipcRenderer.invoke('network:add', networkData),
    updateNetwork: (networkId: string, data: any) => ipcRenderer.invoke('network:update', networkId, data),
    deleteNetwork: (networkId: string) => ipcRenderer.invoke('network:delete', networkId),
    
    // 토큰 관리
    getTokens: (networkId: string) => ipcRenderer.invoke('token:getAll', networkId),
    addToken: (tokenData: any) => ipcRenderer.invoke('token:add', tokenData),
    updateToken: (tokenId: string, data: any) => ipcRenderer.invoke('token:update', tokenId, data),
    deleteToken: (tokenId: string) => ipcRenderer.invoke('token:delete', tokenId),
    
    // DApp 브라우저 관련
    getDApps: () => ipcRenderer.invoke('dapp:getAll'),
    addDApp: (dappData: any) => ipcRenderer.invoke('dapp:add', dappData),
    connectDApp: (dappUrl: string) => ipcRenderer.invoke('dapp:connect', dappUrl),
    signMessage: (messageData: any) => ipcRenderer.invoke('wallet:signMessage', messageData),
    signTransaction: (txData: any) => ipcRenderer.invoke('wallet:signTransaction', txData),
    
    // 보안 관련
    verifyPassword: (password: string) => ipcRenderer.invoke('security:verifyPassword', password),
    changePassword: (oldPassword: string, newPassword: string) => 
      ipcRenderer.invoke('security:changePassword', oldPassword, newPassword),
    enableBiometrics: () => ipcRenderer.invoke('security:enableBiometrics'),
    disableBiometrics: () => ipcRenderer.invoke('security:disableBiometrics'),
    isBiometricsAvailable: () => ipcRenderer.invoke('security:isBiometricsAvailable'),
    
    // 설정 관련
    getSettings: () => ipcRenderer.invoke('settings:getAll'),
    updateSettings: (settings: any) => ipcRenderer.invoke('settings:update', settings),
    resetSettings: () => ipcRenderer.invoke('settings:reset'),
    
    // 백업 및 복원
    backupWallet: (walletId: string, options: any) => ipcRenderer.invoke('wallet:backup', walletId, options),
    restoreWallet: (backupData: any) => ipcRenderer.invoke('wallet:restore', backupData),
  });

  // 외부 API 관련
  contextBridge.exposeInMainWorld('externalAPI', {
    // 시장 데이터
    getMarketPrices: (symbols: string[]) => ipcRenderer.invoke('market:getPrices', symbols),
    getMarketChartData: (symbol: string, timeframe: string) => 
      ipcRenderer.invoke('market:getChartData', symbol, timeframe),
    
    // 스테이킹
    getValidators: (networkId: string) => ipcRenderer.invoke('staking:getValidators', networkId),
    getStakingPositions: (accountId: string) => ipcRenderer.invoke('staking:getPositions', accountId),
    stake: (data: any) => ipcRenderer.invoke('staking:stake', data),
    unstake: (data: any) => ipcRenderer.invoke('staking:unstake', data),
    claimRewards: (data: any) => ipcRenderer.invoke('staking:claimRewards', data),
    
    // DeFi 관련
    getLiquidityPools: (networkId: string) => ipcRenderer.invoke('defi:getLiquidityPools', networkId),
    getUserPositions: (accountId: string) => ipcRenderer.invoke('defi:getUserPositions', accountId),
    addLiquidity: (data: any) => ipcRenderer.invoke('defi:addLiquidity', data),
    removeLiquidity: (data: any) => ipcRenderer.invoke('defi:removeLiquidity', data),
    
    // NFT 관련
    getNFTs: (accountId: string) => ipcRenderer.invoke('nft:getAll', accountId),
    getNFTDetails: (nftId: string) => ipcRenderer.invoke('nft:getDetails', nftId),
    transferNFT: (data: any) => ipcRenderer.invoke('nft:transfer', data),
  });
}
