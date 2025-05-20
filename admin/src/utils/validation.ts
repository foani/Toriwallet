import * as Yup from 'yup';

/**
 * Email validation schema
 */
export const emailSchema = Yup.string()
  .email('이메일 형식이 올바르지 않습니다')
  .required('이메일은 필수 항목입니다');

/**
 * Password validation schema
 */
export const passwordSchema = Yup.string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다'
  )
  .required('비밀번호는 필수 항목입니다');

/**
 * Confirm password validation schema
 */
export const confirmPasswordSchema = Yup.string()
  .oneOf([Yup.ref('password'), undefined], '비밀번호가 일치하지 않습니다')
  .required('비밀번호 확인은 필수 항목입니다');

/**
 * Name validation schema
 */
export const nameSchema = Yup.string()
  .min(2, '이름은 최소 2자 이상이어야 합니다')
  .max(50, '이름은 최대 50자까지 입력할 수 있습니다')
  .required('이름은 필수 항목입니다');

/**
 * URL validation schema
 */
export const urlSchema = Yup.string()
  .url('유효한 URL 형식이 아닙니다')
  .required('URL은 필수 항목입니다');

/**
 * RPC URL validation schema
 */
export const rpcUrlSchema = Yup.string()
  .url('유효한 RPC URL 형식이 아닙니다')
  .required('RPC URL은 필수 항목입니다');

/**
 * Chain ID validation schema
 */
export const chainIdSchema = Yup.string()
  .matches(/^([0-9]+|0x[0-9a-fA-F]+)$/, '유효한 Chain ID 형식이 아닙니다')
  .required('Chain ID는 필수 항목입니다');

/**
 * Token symbol validation schema
 */
export const symbolSchema = Yup.string()
  .matches(/^[A-Z0-9]+$/, '심볼은 대문자와 숫자만 포함할 수 있습니다')
  .min(1, '심볼은 최소 1자 이상이어야 합니다')
  .max(10, '심볼은 최대 10자까지 입력할 수 있습니다')
  .required('심볼은 필수 항목입니다');

/**
 * Login form validation schema
 */
export const loginValidationSchema = Yup.object({
  email: emailSchema,
  password: Yup.string().required('비밀번호는 필수 항목입니다'),
  twoFactorCode: Yup.string().when('twoFactorEnabled', {
    is: true,
    then: (schema) => schema.required('2단계 인증 코드는 필수 항목입니다')
  })
});

/**
 * User create form validation schema
 */
export const userCreateValidationSchema = Yup.object({
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  role: Yup.string().required('역할은 필수 항목입니다'),
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema
});

/**
 * User update form validation schema
 */
export const userUpdateValidationSchema = Yup.object({
  firstName: nameSchema,
  lastName: nameSchema,
  role: Yup.string().required('역할은 필수 항목입니다'),
  status: Yup.string().required('상태는 필수 항목입니다')
});

/**
 * Change password form validation schema
 */
export const changePasswordValidationSchema = Yup.object({
  currentPassword: Yup.string().required('현재 비밀번호는 필수 항목입니다'),
  newPassword: passwordSchema,
  confirmPassword: confirmPasswordSchema
});

/**
 * Reset password form validation schema
 */
export const resetPasswordValidationSchema = Yup.object({
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema
});

/**
 * Network create form validation schema
 */
export const networkCreateValidationSchema = Yup.object({
  name: Yup.string().required('네트워크 이름은 필수 항목입니다'),
  type: Yup.string().required('네트워크 유형은 필수 항목입니다'),
  chainId: chainIdSchema,
  rpcUrl: rpcUrlSchema,
  symbol: symbolSchema,
  blockExplorerUrl: urlSchema,
  iconUrl: Yup.string().url('유효한 URL 형식이 아닙니다').nullable(),
  status: Yup.string().required('상태는 필수 항목입니다'),
  isTestnet: Yup.boolean().required('테스트넷 여부는 필수 항목입니다'),
  isDefaultNetwork: Yup.boolean()
});

/**
 * Network update form validation schema
 */
export const networkUpdateValidationSchema = Yup.object({
  name: Yup.string().required('네트워크 이름은 필수 항목입니다'),
  rpcUrl: rpcUrlSchema,
  blockExplorerUrl: urlSchema,
  iconUrl: Yup.string().url('유효한 URL 형식이 아닙니다').nullable(),
  status: Yup.string().required('상태는 필수 항목입니다'),
  isDefaultNetwork: Yup.boolean()
});

/**
 * General settings form validation schema
 */
export const generalSettingsValidationSchema = Yup.object({
  platformName: Yup.string().required('플랫폼 이름은 필수 항목입니다'),
  supportEmail: emailSchema,
  termsUrl: urlSchema,
  privacyUrl: urlSchema,
  defaultLanguage: Yup.string().required('기본 언어는 필수 항목입니다'),
  defaultFiatCurrency: Yup.string().required('기본 화폐는 필수 항목입니다'),
  maintenanceMode: Yup.boolean(),
  logoUrl: Yup.string().url('유효한 URL 형식이 아닙니다').nullable(),
  faviconUrl: Yup.string().url('유효한 URL 형식이 아닙니다').nullable()
});

/**
 * Security settings form validation schema
 */
export const securitySettingsValidationSchema = Yup.object({
  requireTwoFactor: Yup.boolean(),
  sessionTimeout: Yup.number().min(1, '세션 타임아웃은 최소 1분 이상이어야 합니다'),
  maxFailedAttempts: Yup.number().min(1, '최대 실패 시도 횟수는 최소 1회 이상이어야 합니다'),
  passwordPolicy: Yup.object({
    minLength: Yup.number().min(8, '비밀번호 최소 길이는 8자 이상이어야 합니다'),
    requireUppercase: Yup.boolean(),
    requireLowercase: Yup.boolean(),
    requireNumbers: Yup.boolean(),
    requireSpecialChars: Yup.boolean()
  }),
  ipWhitelist: Yup.array().of(
    Yup.string().matches(
      /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/,
      '유효한 IP 주소 또는 CIDR 범위가 아닙니다'
    )
  )
});

/**
 * Staking settings form validation schema
 */
export const stakingSettingsValidationSchema = Yup.object({
  enabledNetworks: Yup.array().of(Yup.string()).min(1, '최소 하나 이상의 네트워크를 활성화해야 합니다'),
  minStakeAmount: Yup.number().min(0, '최소 스테이킹 금액은 0 이상이어야 합니다'),
  maxStakeAmount: Yup.number().min(
    Yup.ref('minStakeAmount'),
    '최대 스테이킹 금액은 최소 스테이킹 금액보다 커야 합니다'
  ),
  stakingFee: Yup.number().min(0, '스테이킹 수수료는 0 이상이어야 합니다').max(100, '스테이킹 수수료는 100 이하여야 합니다'),
  lockupPeriods: Yup.array().of(
    Yup.object({
      period: Yup.number().min(1, '락업 기간은 최소 1일 이상이어야 합니다'),
      apy: Yup.number().min(0, 'APY는 0 이상이어야 합니다')
    })
  ),
  autoCompoundEnabled: Yup.boolean()
});

/**
 * Crosschain settings form validation schema
 */
export const crosschainSettingsValidationSchema = Yup.object({
  enabledBridges: Yup.array().of(Yup.string()).min(1, '최소 하나 이상의 브릿지를 활성화해야 합니다'),
  maxTransferAmount: Yup.number().min(0, '최대 전송 금액은 0 이상이어야 합니다'),
  bridgeFee: Yup.number().min(0, '브릿지 수수료는 0 이상이어야 합니다').max(100, '브릿지 수수료는 100 이하여야 합니다'),
  bridgeTimeoutMinutes: Yup.number().min(1, '브릿지 타임아웃은 최소 1분 이상이어야 합니다')
});

/**
 * DeFi settings form validation schema
 */
export const defiSettingsValidationSchema = Yup.object({
  enabledProtocols: Yup.array().of(Yup.string()),
  maxLeverageRatio: Yup.number().min(1, '최대 레버리지 비율은 최소 1 이상이어야 합니다'),
  liquidationThreshold: Yup.number().min(0, '청산 임계값은 0 이상이어야 합니다').max(100, '청산 임계값은 100 이하여야 합니다'),
  defiWarningEnabled: Yup.boolean()
});

/**
 * DApp settings form validation schema
 */
export const dappSettingsValidationSchema = Yup.object({
  enabledCategories: Yup.array().of(Yup.string()),
  defaultFeaturedDapps: Yup.array().of(Yup.string()),
  dappBrowserEnabled: Yup.boolean(),
  whitelistedDomains: Yup.array().of(
    Yup.string().matches(
      /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      '유효한 도메인 형식이 아닙니다'
    )
  ),
  blacklistedDomains: Yup.array().of(
    Yup.string().matches(
      /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      '유효한 도메인 형식이 아닙니다'
    )
  )
});
