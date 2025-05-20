/**
 * errors.ts
 * 
 * 이 모듈은 TORI 지갑 애플리케이션에서 사용되는 모든 오류 유형과 메시지를 정의합니다.
 * 표준화된 오류 처리와 다국어 지원을 위한 오류 코드를 포함합니다.
 */

// 오류 코드 정의
export enum ErrorCode {
  // 일반 오류 (1000~1999)
  UNKNOWN_ERROR = 1000,
  NETWORK_ERROR = 1001,
  TIMEOUT_ERROR = 1002,
  INVALID_PARAMETER = 1003,
  UNSUPPORTED_OPERATION = 1004,
  NOT_IMPLEMENTED = 1005,

  // 지갑 관련 오류 (2000~2999)
  WALLET_CREATION_FAILED = 2000,
  WALLET_IMPORT_FAILED = 2001,
  WALLET_EXPORT_FAILED = 2002,
  INVALID_MNEMONIC = 2003,
  INVALID_PRIVATE_KEY = 2004,
  INVALID_KEYSTORE = 2005,
  WALLET_NOT_FOUND = 2006,
  ACCOUNT_NOT_FOUND = 2007,
  INSUFFICIENT_FUNDS = 2008,
  INVALID_PASSWORD = 2009,
  WALLET_LOCKED = 2010,

  // 트랜잭션 관련 오류 (3000~3999)
  TRANSACTION_FAILED = 3000,
  TRANSACTION_REJECTED = 3001,
  INVALID_TRANSACTION = 3002,
  GAS_ESTIMATION_FAILED = 3003,
  NONCE_TOO_LOW = 3004,
  INVALID_RECIPIENT = 3005,
  TRANSACTION_UNDERPRICED = 3006,
  TRANSACTION_TIMEOUT = 3007,
  TRANSACTION_REPLACED = 3008,
  TRANSACTION_NOT_FOUND = 3009,

  // 네트워크 관련 오류 (4000~4999)
  RPC_CONNECTION_FAILED = 4000,
  NETWORK_NOT_FOUND = 4001,
  INVALID_CHAIN_ID = 4002,
  INVALID_RPC_URL = 4003,
  UNSUPPORTED_NETWORK = 4004,
  NETWORK_CONGESTION = 4005,

  // 토큰 관련 오류 (5000~5999)
  TOKEN_NOT_FOUND = 5000,
  INVALID_TOKEN_ADDRESS = 5001,
  TOKEN_ALREADY_EXISTS = 5002,
  UNSUPPORTED_TOKEN_TYPE = 5003,
  INVALID_TOKEN_AMOUNT = 5004,
  TOKEN_APPROVAL_FAILED = 5005,
  TOKEN_TRANSFER_FAILED = 5006,
  INSUFFICIENT_TOKEN_BALANCE = 5007,

  // dApp 브라우저 관련 오류 (6000~6999)
  DAPP_CONNECTION_FAILED = 6000,
  DAPP_PERMISSION_DENIED = 6001,
  INVALID_DAPP_URL = 6002,
  DAPP_TIMEOUT = 6003,
  DAPP_EXECUTION_FAILED = 6004,
  DAPP_SIGNATURE_REJECTED = 6005,
  DAPP_MESSAGE_INVALID = 6006,

  // 보안 관련 오류 (7000~7999)
  AUTHENTICATION_FAILED = 7000,
  BIOMETRIC_NOT_AVAILABLE = 7001,
  BIOMETRIC_CANCELLED = 7002,
  BIOMETRIC_FAILED = 7003,
  PASSWORD_TOO_WEAK = 7004,
  ACCOUNT_LOCKED = 7005,
  INVALID_CREDENTIALS = 7006,
  TOO_MANY_ATTEMPTS = 7007,
  SECURITY_VALIDATION_FAILED = 7008,

  // 스테이킹 관련 오류 (8000~8999)
  STAKING_FAILED = 8000,
  UNSTAKING_FAILED = 8001,
  INSUFFICIENT_STAKE = 8002,
  INVALID_VALIDATOR = 8003,
  STAKING_PERIOD_NOT_ENDED = 8004,
  REWARDS_CLAIM_FAILED = 8005,
  VALIDATOR_NOT_ACTIVE = 8006,

  // 크로스체인 관련 오류 (9000~9999)
  BRIDGE_FAILED = 9000,
  UNSUPPORTED_CROSS_CHAIN = 9001,
  ICP_TRANSFER_FAILED = 9002,
  BRIDGE_LIQUIDITY_INSUFFICIENT = 9003,
  BRIDGE_SWAP_FAILED = 9004,
  BRIDGE_TIMEOUT = 9005,
  BRIDGE_SLIPPAGE_TOO_HIGH = 9006,

  // NFT 관련 오류 (10000~10999)
  NFT_NOT_FOUND = 10000,
  NFT_TRANSFER_FAILED = 10001,
  NFT_MINT_FAILED = 10002,
  NFT_METADATA_ERROR = 10003,
  INVALID_NFT_CONTRACT = 10004,
  NFT_NOT_OWNED = 10005,
  NFT_LISTING_FAILED = 10006,

  // 저장소 관련 오류 (11000~11999)
  STORAGE_WRITE_FAILED = 11000,
  STORAGE_READ_FAILED = 11001,
  STORAGE_DELETE_FAILED = 11002,
  STORAGE_NOT_AVAILABLE = 11003,
  STORAGE_QUOTA_EXCEEDED = 11004,
  STORAGE_CORRUPT = 11005,

  // 데이터 동기화 관련 오류 (12000~12999)
  SYNC_FAILED = 12000,
  SYNC_CONFLICT = 12001,
  SYNC_TIMEOUT = 12002,
  DATA_INTEGRITY_ERROR = 12003,
  VERSION_MISMATCH = 12004,
}

// 오류 메시지 정의 (다국어 지원을 위한 키)
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // 일반 오류
  [ErrorCode.UNKNOWN_ERROR]: 'errors.unknown',
  [ErrorCode.NETWORK_ERROR]: 'errors.network',
  [ErrorCode.TIMEOUT_ERROR]: 'errors.timeout',
  [ErrorCode.INVALID_PARAMETER]: 'errors.invalidParameter',
  [ErrorCode.UNSUPPORTED_OPERATION]: 'errors.unsupportedOperation',
  [ErrorCode.NOT_IMPLEMENTED]: 'errors.notImplemented',

  // 지갑 관련 오류
  [ErrorCode.WALLET_CREATION_FAILED]: 'errors.wallet.creationFailed',
  [ErrorCode.WALLET_IMPORT_FAILED]: 'errors.wallet.importFailed',
  [ErrorCode.WALLET_EXPORT_FAILED]: 'errors.wallet.exportFailed',
  [ErrorCode.INVALID_MNEMONIC]: 'errors.wallet.invalidMnemonic',
  [ErrorCode.INVALID_PRIVATE_KEY]: 'errors.wallet.invalidPrivateKey',
  [ErrorCode.INVALID_KEYSTORE]: 'errors.wallet.invalidKeystore',
  [ErrorCode.WALLET_NOT_FOUND]: 'errors.wallet.notFound',
  [ErrorCode.ACCOUNT_NOT_FOUND]: 'errors.wallet.accountNotFound',
  [ErrorCode.INSUFFICIENT_FUNDS]: 'errors.wallet.insufficientFunds',
  [ErrorCode.INVALID_PASSWORD]: 'errors.wallet.invalidPassword',
  [ErrorCode.WALLET_LOCKED]: 'errors.wallet.locked',

  // 트랜잭션 관련 오류
  [ErrorCode.TRANSACTION_FAILED]: 'errors.transaction.failed',
  [ErrorCode.TRANSACTION_REJECTED]: 'errors.transaction.rejected',
  [ErrorCode.INVALID_TRANSACTION]: 'errors.transaction.invalid',
  [ErrorCode.GAS_ESTIMATION_FAILED]: 'errors.transaction.gasEstimationFailed',
  [ErrorCode.NONCE_TOO_LOW]: 'errors.transaction.nonceTooLow',
  [ErrorCode.INVALID_RECIPIENT]: 'errors.transaction.invalidRecipient',
  [ErrorCode.TRANSACTION_UNDERPRICED]: 'errors.transaction.underpriced',
  [ErrorCode.TRANSACTION_TIMEOUT]: 'errors.transaction.timeout',
  [ErrorCode.TRANSACTION_REPLACED]: 'errors.transaction.replaced',
  [ErrorCode.TRANSACTION_NOT_FOUND]: 'errors.transaction.notFound',

  // 네트워크 관련 오류
  [ErrorCode.RPC_CONNECTION_FAILED]: 'errors.network.rpcConnectionFailed',
  [ErrorCode.NETWORK_NOT_FOUND]: 'errors.network.notFound',
  [ErrorCode.INVALID_CHAIN_ID]: 'errors.network.invalidChainId',
  [ErrorCode.INVALID_RPC_URL]: 'errors.network.invalidRpcUrl',
  [ErrorCode.UNSUPPORTED_NETWORK]: 'errors.network.unsupported',
  [ErrorCode.NETWORK_CONGESTION]: 'errors.network.congestion',

  // 토큰 관련 오류
  [ErrorCode.TOKEN_NOT_FOUND]: 'errors.token.notFound',
  [ErrorCode.INVALID_TOKEN_ADDRESS]: 'errors.token.invalidAddress',
  [ErrorCode.TOKEN_ALREADY_EXISTS]: 'errors.token.alreadyExists',
  [ErrorCode.UNSUPPORTED_TOKEN_TYPE]: 'errors.token.unsupportedType',
  [ErrorCode.INVALID_TOKEN_AMOUNT]: 'errors.token.invalidAmount',
  [ErrorCode.TOKEN_APPROVAL_FAILED]: 'errors.token.approvalFailed',
  [ErrorCode.TOKEN_TRANSFER_FAILED]: 'errors.token.transferFailed',
  [ErrorCode.INSUFFICIENT_TOKEN_BALANCE]: 'errors.token.insufficientBalance',

  // dApp 브라우저 관련 오류
  [ErrorCode.DAPP_CONNECTION_FAILED]: 'errors.dapp.connectionFailed',
  [ErrorCode.DAPP_PERMISSION_DENIED]: 'errors.dapp.permissionDenied',
  [ErrorCode.INVALID_DAPP_URL]: 'errors.dapp.invalidUrl',
  [ErrorCode.DAPP_TIMEOUT]: 'errors.dapp.timeout',
  [ErrorCode.DAPP_EXECUTION_FAILED]: 'errors.dapp.executionFailed',
  [ErrorCode.DAPP_SIGNATURE_REJECTED]: 'errors.dapp.signatureRejected',
  [ErrorCode.DAPP_MESSAGE_INVALID]: 'errors.dapp.messageInvalid',

  // 보안 관련 오류
  [ErrorCode.AUTHENTICATION_FAILED]: 'errors.security.authenticationFailed',
  [ErrorCode.BIOMETRIC_NOT_AVAILABLE]: 'errors.security.biometricNotAvailable',
  [ErrorCode.BIOMETRIC_CANCELLED]: 'errors.security.biometricCancelled',
  [ErrorCode.BIOMETRIC_FAILED]: 'errors.security.biometricFailed',
  [ErrorCode.PASSWORD_TOO_WEAK]: 'errors.security.passwordTooWeak',
  [ErrorCode.ACCOUNT_LOCKED]: 'errors.security.accountLocked',
  [ErrorCode.INVALID_CREDENTIALS]: 'errors.security.invalidCredentials',
  [ErrorCode.TOO_MANY_ATTEMPTS]: 'errors.security.tooManyAttempts',
  [ErrorCode.SECURITY_VALIDATION_FAILED]: 'errors.security.validationFailed',

  // 스테이킹 관련 오류
  [ErrorCode.STAKING_FAILED]: 'errors.staking.failed',
  [ErrorCode.UNSTAKING_FAILED]: 'errors.staking.unstakingFailed',
  [ErrorCode.INSUFFICIENT_STAKE]: 'errors.staking.insufficientStake',
  [ErrorCode.INVALID_VALIDATOR]: 'errors.staking.invalidValidator',
  [ErrorCode.STAKING_PERIOD_NOT_ENDED]: 'errors.staking.periodNotEnded',
  [ErrorCode.REWARDS_CLAIM_FAILED]: 'errors.staking.rewardsClaimFailed',
  [ErrorCode.VALIDATOR_NOT_ACTIVE]: 'errors.staking.validatorNotActive',

  // 크로스체인 관련 오류
  [ErrorCode.BRIDGE_FAILED]: 'errors.crosschain.bridgeFailed',
  [ErrorCode.UNSUPPORTED_CROSS_CHAIN]: 'errors.crosschain.unsupported',
  [ErrorCode.ICP_TRANSFER_FAILED]: 'errors.crosschain.icpTransferFailed',
  [ErrorCode.BRIDGE_LIQUIDITY_INSUFFICIENT]: 'errors.crosschain.insufficientLiquidity',
  [ErrorCode.BRIDGE_SWAP_FAILED]: 'errors.crosschain.swapFailed',
  [ErrorCode.BRIDGE_TIMEOUT]: 'errors.crosschain.timeout',
  [ErrorCode.BRIDGE_SLIPPAGE_TOO_HIGH]: 'errors.crosschain.slippageTooHigh',

  // NFT 관련 오류
  [ErrorCode.NFT_NOT_FOUND]: 'errors.nft.notFound',
  [ErrorCode.NFT_TRANSFER_FAILED]: 'errors.nft.transferFailed',
  [ErrorCode.NFT_MINT_FAILED]: 'errors.nft.mintFailed',
  [ErrorCode.NFT_METADATA_ERROR]: 'errors.nft.metadataError',
  [ErrorCode.INVALID_NFT_CONTRACT]: 'errors.nft.invalidContract',
  [ErrorCode.NFT_NOT_OWNED]: 'errors.nft.notOwned',
  [ErrorCode.NFT_LISTING_FAILED]: 'errors.nft.listingFailed',

  // 저장소 관련 오류
  [ErrorCode.STORAGE_WRITE_FAILED]: 'errors.storage.writeFailed',
  [ErrorCode.STORAGE_READ_FAILED]: 'errors.storage.readFailed',
  [ErrorCode.STORAGE_DELETE_FAILED]: 'errors.storage.deleteFailed',
  [ErrorCode.STORAGE_NOT_AVAILABLE]: 'errors.storage.notAvailable',
  [ErrorCode.STORAGE_QUOTA_EXCEEDED]: 'errors.storage.quotaExceeded',
  [ErrorCode.STORAGE_CORRUPT]: 'errors.storage.corrupt',

  // 데이터 동기화 관련 오류
  [ErrorCode.SYNC_FAILED]: 'errors.sync.failed',
  [ErrorCode.SYNC_CONFLICT]: 'errors.sync.conflict',
  [ErrorCode.SYNC_TIMEOUT]: 'errors.sync.timeout',
  [ErrorCode.DATA_INTEGRITY_ERROR]: 'errors.sync.dataIntegrityError',
  [ErrorCode.VERSION_MISMATCH]: 'errors.sync.versionMismatch',
};

// 오류 클래스 정의
export class ToriWalletError extends Error {
  code: ErrorCode;
  
  constructor(code: ErrorCode, message?: string, public details?: any) {
    super(message || ERROR_MESSAGES[code]);
    this.name = 'ToriWalletError';
    this.code = code;
  }

  // 오류 코드에서 오류 객체 생성
  static fromCode(code: ErrorCode, details?: any): ToriWalletError {
    return new ToriWalletError(code, ERROR_MESSAGES[code], details);
  }

  // 네이티브 오류에서 지갑 오류로 변환
  static fromError(error: any): ToriWalletError {
    // 이미 ToriWalletError인 경우 그대로 반환
    if (error instanceof ToriWalletError) {
      return error;
    }

    // 오류 메시지에 따라 적절한 오류 코드 결정
    const message = error.message || '';
    let code = ErrorCode.UNKNOWN_ERROR;

    // 메시지 기반 오류 코드 매핑
    if (message.includes('insufficient funds')) {
      code = ErrorCode.INSUFFICIENT_FUNDS;
    } else if (message.includes('nonce too low')) {
      code = ErrorCode.NONCE_TOO_LOW;
    } else if (message.includes('transaction underpriced')) {
      code = ErrorCode.TRANSACTION_UNDERPRICED;
    } else if (message.includes('invalid address')) {
      code = ErrorCode.INVALID_RECIPIENT;
    } else if (message.includes('timeout')) {
      code = ErrorCode.TIMEOUT_ERROR;
    } else if (message.includes('network error')) {
      code = ErrorCode.NETWORK_ERROR;
    } else if (message.includes('invalid password')) {
      code = ErrorCode.INVALID_PASSWORD;
    }

    return new ToriWalletError(code, message, error);
  }
}

// 오류 핸들러 유틸리티
export const handleError = <T>(callback: () => Promise<T>, defaultValue?: T): Promise<T> => {
  return callback().catch(error => {
    console.error('Error caught by handleError:', error);
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw ToriWalletError.fromError(error);
  });
};
