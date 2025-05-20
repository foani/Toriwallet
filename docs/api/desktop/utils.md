# 유틸리티 및 헬퍼 함수

## 개요

TORI 지갑 데스크톱 앱은 개발을 간소화하고 코드 재사용성을 높이기 위해 다양한 유틸리티 함수와 헬퍼 함수를 제공합니다. 이 문서는 데스크톱 앱에서 사용하는 주요 유틸리티 함수, 포맷팅 함수, 검증 함수 등을 설명합니다.

## 포맷팅 유틸리티

다음 함수들은 `src/renderer/utils/formatters.ts` 파일에 정의되어 있습니다.

### formatAmount

**설명**: 금액을 포맷팅합니다.

**파라미터**:
- `amount`: string | number - 포맷팅할 금액
- `decimals`: number - 소수점 자릿수 (기본값: 6)

**반환값**: string - 포맷팅된 금액

**사용 예**:
```typescript
import { formatAmount } from '../utils/formatters';

// 예시 1: 정수 포맷팅
const formattedInt = formatAmount(1234567); // 결과: "1,234,567"

// 예시 2: 소수 포맷팅
const formattedFloat = formatAmount(1234.56789); // 결과: "1,234.567890"

// 예시 3: 소수점 자릿수 지정
const formattedDecimal = formatAmount(1234.56789, 2); // 결과: "1,234.57"

// 예시 4: 문자열 입력
const formattedString = formatAmount("1234.56789", 3); // 결과: "1,234.568"
```

### formatCurrency

**설명**: 화폐 금액을 포맷팅합니다.

**파라미터**:
- `amount`: string | number - 포맷팅할 금액
- `currency`: string - 화폐 코드 (기본값: 'USD')

**반환값**: string - 포맷팅된 화폐 금액

**사용 예**:
```typescript
import { formatCurrency } from '../utils/formatters';

// 예시 1: USD 포맷팅
const formattedUSD = formatCurrency(1234.56); // 결과: "$1,234.56"

// 예시 2: EUR 포맷팅
const formattedEUR = formatCurrency(1234.56, 'EUR'); // 결과: "€1,234.56"

// 예시 3: KRW 포맷팅
const formattedKRW = formatCurrency(1234.56, 'KRW'); // 결과: "₩1,235" (KRW는 소수점 없음)
```

### shortenAddress

**설명**: 블록체인 주소를 축약하여 표시합니다.

**파라미터**:
- `address`: string - 축약할 주소
- `prefixLength`: number - 앞부분 길이 (기본값: 6)
- `suffixLength`: number - 뒷부분 길이 (기본값: 4)

**반환값**: string - 축약된 주소

**사용 예**:
```typescript
import { shortenAddress } from '../utils/formatters';

// 예시 1: 기본 축약
const shortened = shortenAddress('0x1234567890abcdef1234567890abcdef12345678');
// 결과: "0x1234...5678"

// 예시 2: 사용자 지정 길이
const customShortened = shortenAddress('0x1234567890abcdef1234567890abcdef12345678', 8, 6);
// 결과: "0x12345678...345678"
```

### formatRelativeTime

**설명**: 타임스탬프를 상대적 시간으로 포맷팅합니다.

**파라미터**:
- `timestamp`: number - 포맷팅할 타임스탬프 (밀리초)

**반환값**: string - 상대적 시간 문자열

**사용 예**:
```typescript
import { formatRelativeTime } from '../utils/formatters';

// 예시 1: 방금 전
const now = Date.now();
const justNow = formatRelativeTime(now - 30 * 1000); // 결과: "방금 전"

// 예시 2: 분 단위
const fiveMinutesAgo = formatRelativeTime(now - 5 * 60 * 1000); // 결과: "5분 전"

// 예시 3: 시간 단위
const threeHoursAgo = formatRelativeTime(now - 3 * 60 * 60 * 1000); // 결과: "3시간 전"

// 예시 4: 일 단위
const twoDaysAgo = formatRelativeTime(now - 2 * 24 * 60 * 60 * 1000); // 결과: "2일 전"
```

### formatDate

**설명**: 타임스탬프를 날짜 문자열로 포맷팅합니다.

**파라미터**:
- `timestamp`: number - 포맷팅할 타임스탬프 (밀리초)

**반환값**: string - 날짜 문자열

**사용 예**:
```typescript
import { formatDate } from '../utils/formatters';

// 예시: 날짜 포맷팅 (결과는 로케일에 따라 다름)
const date = formatDate(1609459200000); // 2021-01-01 00:00:00 UTC
// 결과 (en-US): "1/1/2021"
// 결과 (ko-KR): "2021. 1. 1."
```

### formatDateTime

**설명**: 타임스탬프를 날짜 및 시간 문자열로 포맷팅합니다.

**파라미터**:
- `timestamp`: number - 포맷팅할 타임스탬프 (밀리초)

**반환값**: string - 날짜 및 시간 문자열

**사용 예**:
```typescript
import { formatDateTime } from '../utils/formatters';

// 예시: 날짜 및 시간 포맷팅 (결과는 로케일에 따라 다름)
const dateTime = formatDateTime(1609459200000); // 2021-01-01 00:00:00 UTC
// 결과 (en-US): "1/1/2021, 12:00:00 AM"
// 결과 (ko-KR): "2021. 1. 1. 오전 12:00:00"
```

### formatGasPrice

**설명**: 가스 가격을 Gwei 단위로 포맷팅합니다.

**파라미터**:
- `gasPrice`: string - 가스 가격 (wei 단위)

**반환값**: string - Gwei 단위 가스 가격

**사용 예**:
```typescript
import { formatGasPrice } from '../utils/formatters';

// 예시: wei를 Gwei로 변환
const gwei = formatGasPrice('5000000000'); // 5 Gwei
// 결과: "5.00 Gwei"
```

## 검증 유틸리티

다음 함수들은 `src/renderer/utils/validators.ts` 파일에 정의되어 있습니다.

### isValidEthereumAddress

**설명**: 이더리움 주소 유효성을 검사합니다.

**파라미터**:
- `address`: string - 검사할 이더리움 주소

**반환값**: boolean - 유효성 여부

**사용 예**:
```typescript
import { isValidEthereumAddress } from '../utils/validators';

// 예시 1: 유효한 주소
const validAddress = isValidEthereumAddress('0x1234567890abcdef1234567890abcdef12345678');
// 결과: true

// 예시 2: 유효하지 않은 주소 (길이 잘못됨)
const invalidAddress1 = isValidEthereumAddress('0x1234');
// 결과: false

// 예시 3: 유효하지 않은 주소 (접두사 잘못됨)
const invalidAddress2 = isValidEthereumAddress('1234567890abcdef1234567890abcdef12345678');
// 결과: false
```

### isValidAmount

**설명**: 금액 유효성을 검사합니다.

**파라미터**:
- `amount`: string - 검사할 금액

**반환값**: boolean - 유효성 여부

**사용 예**:
```typescript
import { isValidAmount } from '../utils/validators';

// 예시 1: 유효한 금액
const valid1 = isValidAmount('123.45');
// 결과: true

// 예시 2: 유효한 금액 (정수)
const valid2 = isValidAmount('100');
// 결과: true

// 예시 3: 유효하지 않은 금액 (음수)
const invalid1 = isValidAmount('-10');
// 결과: false

// 예시 4: 유효하지 않은 금액 (0)
const invalid2 = isValidAmount('0');
// 결과: false

// 예시 5: 유효하지 않은 금액 (숫자가 아님)
const invalid3 = isValidAmount('abc');
// 결과: false
```

### isValidUrl

**설명**: URL 유효성을 검사합니다.

**파라미터**:
- `url`: string - 검사할 URL

**반환값**: boolean - 유효성 여부

**사용 예**:
```typescript
import { isValidUrl } from '../utils/validators';

// 예시 1: 유효한 URL
const valid1 = isValidUrl('https://example.com');
// 결과: true

// 예시 2: 유효한 URL (경로 포함)
const valid2 = isValidUrl('https://example.com/path?query=value');
// 결과: true

// 예시 3: 유효하지 않은 URL (프로토콜 누락)
const invalid1 = isValidUrl('example.com');
// 결과: false

// 예시 4: 유효하지 않은 URL (잘못된 형식)
const invalid2 = isValidUrl('not a url');
// 결과: false
```

### isValidChainId

**설명**: 체인 ID 유효성을 검사합니다.

**파라미터**:
- `chainId`: string | number - 검사할 체인 ID

**반환값**: boolean - 유효성 여부

**사용 예**:
```typescript
import { isValidChainId } from '../utils/validators';

// 예시 1: 유효한 체인 ID (숫자)
const valid1 = isValidChainId(1);
// 결과: true

// 예시 2: 유효한 체인 ID (문자열)
const valid2 = isValidChainId('1000');
// 결과: true

// 예시 3: 유효하지 않은 체인 ID (음수)
const invalid1 = isValidChainId(-1);
// 결과: false

// 예시 4: 유효하지 않은 체인 ID (0)
const invalid2 = isValidChainId(0);
// 결과: false

// 예시 5: 유효하지 않은 체인 ID (숫자가 아님)
const invalid3 = isValidChainId('abc');
// 결과: false
```

### isValidPrivateKey

**설명**: 개인 키 유효성을 검사합니다.

**파라미터**:
- `privateKey`: string - 검사할 개인 키

**반환값**: boolean - 유효성 여부

**사용 예**:
```typescript
import { isValidPrivateKey } from '../utils/validators';

// 예시 1: 유효한 개인 키 (0x 접두사 없음)
const valid1 = isValidPrivateKey('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
// 결과: true

// 예시 2: 유효한 개인 키 (0x 접두사 있음)
const valid2 = isValidPrivateKey('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
// 결과: true

// 예시 3: 유효하지 않은 개인 키 (길이 잘못됨)
const invalid1 = isValidPrivateKey('1234');
// 결과: false

// 예시 4: 유효하지 않은 개인 키 (유효하지 않은 문자 포함)
const invalid2 = isValidPrivateKey('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdez');
// 결과: false
```

### isValidMnemonic

**설명**: 시드 구문 유효성을 검사합니다.

**파라미터**:
- `mnemonic`: string - 검사할 시드 구문

**반환값**: boolean - 유효성 여부

**사용 예**:
```typescript
import { isValidMnemonic } from '../utils/validators';

// 예시 1: 유효한 시드 구문 (12 단어)
const valid1 = isValidMnemonic('zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong');
// 결과: true

// 예시 2: 유효한 시드 구문 (24 단어)
const valid2 = isValidMnemonic('zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong');
// 결과: true

// 예시 3: 유효하지 않은 시드 구문 (단어 수 잘못됨)
const invalid1 = isValidMnemonic('zoo zoo zoo');
// 결과: false
```

## 암호화 유틸리티

다음 함수들은 `src/renderer/utils/crypto.ts` 파일에 정의되어 있습니다.

### encryptData

**설명**: 데이터를 암호화합니다.

**파라미터**:
- `data`: string - 암호화할 데이터
- `password`: string - 암호화에 사용할 비밀번호

**반환값**: string - 암호화된 데이터 (Base64 인코딩)

**사용 예**:
```typescript
import { encryptData } from '../utils/crypto';

// 데이터 암호화
const encrypted = encryptData('sensitive data', 'my-secure-password');
// 결과: "암호화된 문자열 (Base64)"
```

### decryptData

**설명**: 암호화된 데이터를 복호화합니다.

**파라미터**:
- `encryptedData`: string - 복호화할 암호화된 데이터 (Base64 인코딩)
- `password`: string - 복호화에 사용할 비밀번호

**반환값**: string - 복호화된 데이터

**사용 예**:
```typescript
import { decryptData } from '../utils/crypto';

// 데이터 복호화
const decrypted = decryptData(encrypted, 'my-secure-password');
// 결과: "sensitive data"
```

### hashPassword

**설명**: 비밀번호를 해싱합니다.

**파라미터**:
- `password`: string - 해싱할 비밀번호
- `salt?`: string - 솔트 (선택 사항, 제공하지 않으면 자동 생성)

**반환값**: { hash: string; salt: string } - 해시 및 솔트

**사용 예**:
```typescript
import { hashPassword } from '../utils/crypto';

// 비밀번호 해싱
const { hash, salt } = hashPassword('my-secure-password');
// 결과: { hash: "해시 문자열", salt: "솔트 문자열" }
```

### verifyPassword

**설명**: 비밀번호가 해시와 일치하는지 검증합니다.

**파라미터**:
- `password`: string - 검증할 비밀번호
- `hash`: string - 저장된 해시
- `salt`: string - 저장된 솔트

**반환값**: boolean - 일치 여부

**사용 예**:
```typescript
import { verifyPassword } from '../utils/crypto';

// 비밀번호 검증
const isValid = verifyPassword('my-secure-password', hash, salt);
// 결과: true (비밀번호가 일치하는 경우)
```

## 파일 시스템 유틸리티

다음 함수들은 `src/renderer/utils/filesystem.ts` 파일에 정의되어 있습니다.

### readTextFile

**설명**: 텍스트 파일 내용을 읽습니다. (Renderer Process에서 사용 시, IPC를 통해 Main Process에 요청)

**파라미터**:
- `path`: string - 파일 경로

**반환값**: Promise<string> - 파일 내용

**사용 예**:
```typescript
import { readTextFile } from '../utils/filesystem';

// 파일 읽기
async function readFile() {
  try {
    const content = await readTextFile('/path/to/file.txt');
    console.log('파일 내용:', content);
  } catch (error) {
    console.error('파일 읽기 오류:', error);
  }
}
```

### writeTextFile

**설명**: 텍스트 파일에 내용을 씁니다. (Renderer Process에서 사용 시, IPC를 통해 Main Process에 요청)

**파라미터**:
- `path`: string - 파일 경로
- `content`: string - 파일에 쓸 내용

**반환값**: Promise<void>

**사용 예**:
```typescript
import { writeTextFile } from '../utils/filesystem';

// 파일 쓰기
async function writeFile() {
  try {
    await writeTextFile('/path/to/file.txt', 'Hello, World!');
    console.log('파일 쓰기 성공');
  } catch (error) {
    console.error('파일 쓰기 오류:', error);
  }
}
```

## 로깅 유틸리티

다음 함수들은 `src/renderer/utils/logger.ts` 파일에 정의되어 있습니다.

### logger

**설명**: 애플리케이션 로깅을 위한 로거 인스턴스입니다.

**메서드**:
- `info(message: string, data?: any)`: 정보 메시지를 로깅합니다.
- `warn(message: string, data?: any)`: 경고 메시지를 로깅합니다.
- `error(message: string, error?: Error)`: 오류 메시지를 로깅합니다.
- `debug(message: string, data?: any)`: 디버그 메시지를 로깅합니다. (개발 모드에서만 출력)

**사용 예**:
```typescript
import { logger } from '../utils/logger';

// 정보 로깅
logger.info('사용자 로그인 성공', { userId: '123' });

// 경고 로깅
logger.warn('API 응답 지연', { endpoint: '/api/data', responseTime: 5000 });

// 오류 로깅
try {
  // 오류 발생 가능한 코드
} catch (error) {
  logger.error('API 호출 실패', error);
}

// 디버그 로깅 (개발 모드에서만 출력)
logger.debug('상태 업데이트', { prevState, nextState });
```

## 국제화 (i18n) 유틸리티

다음 함수들은 `src/renderer/utils/i18n.ts` 파일에 정의되어 있습니다.

### useTranslation

**설명**: 다국어 지원을 위한 번역 훅입니다.

**반환값**: { t: (key: string, options?: any) => string, i18n: i18n 인스턴스 }

**사용 예**:
```typescript
import { useTranslation } from '../utils/i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.message', { name: 'User' })}</p>
      <button>{t('common.buttons.submit')}</button>
    </div>
  );
}
```

### changeLanguage

**설명**: 애플리케이션 언어를 변경합니다.

**파라미터**:
- `language`: string - 언어 코드 (예: 'en', 'ko', 'ja')

**반환값**: Promise<void>

**사용 예**:
```typescript
import { changeLanguage } from '../utils/i18n';

// 언어 변경
async function switchLanguage(language) {
  try {
    await changeLanguage(language);
    console.log(`언어가 ${language}로 변경되었습니다.`);
  } catch (error) {
    console.error('언어 변경 오류:', error);
  }
}
```

## 테마 유틸리티

다음 함수들은 `src/renderer/utils/theme.ts` 파일에 정의되어 있습니다.

### useTheme

**설명**: 테마 관리를 위한 훅입니다.

**반환값**: { theme: Theme, setTheme: (theme: 'light' | 'dark' | 'system') => void }

**사용 예**:
```typescript
import { useTheme } from '../utils/theme';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div>
      <span>현재 테마: {theme}</span>
      <button onClick={() => setTheme('light')}>라이트 모드</button>
      <button onClick={() => setTheme('dark')}>다크 모드</button>
      <button onClick={() => setTheme('system')}>시스템 설정 따르기</button>
    </div>
  );
}
```

## 에러 처리 유틸리티

다음 함수들은 `src/renderer/utils/errors.ts` 파일에 정의되어 있습니다.

### handleError

**설명**: 애플리케이션 오류를 처리합니다.

**파라미터**:
- `error`: Error | unknown - 처리할 오류
- `context?`: string - 오류 컨텍스트 (선택 사항)

**반환값**: { message: string; code?: string; details?: string } - 사용자에게 표시할 오류 정보

**사용 예**:
```typescript
import { handleError } from '../utils/errors';

try {
  // 오류 발생 가능한 코드
} catch (error) {
  const { message, code, details } = handleError(error, 'API_CALL');
  
  // 사용자에게 오류 표시
  showErrorNotification(message);
  
  // 오류 기록
  logger.error(`오류 코드: ${code}`, { message, details });
}
```

### createErrorCode

**설명**: 오류 코드를 생성합니다.

**파라미터**:
- `category`: string - 오류 카테고리 (예: 'WALLET', 'NETWORK')
- `subCategory`: string - 오류 서브 카테고리 (예: 'CREATE', 'IMPORT')
- `id`: number - 오류 ID

**반환값**: string - 오류 코드

**사용 예**:
```typescript
import { createErrorCode } from '../utils/errors';

// 오류 코드 생성
const errorCode = createErrorCode('WALLET', 'IMPORT', 1);
// 결과: "WALLET_IMPORT_001"
```

## 유틸리티 함수 코드 예제

다음은 유틸리티 함수의 구현 예제입니다.

### formatters.ts

```typescript
/**
 * 금액을 포맷팅합니다.
 * @param amount 포맷팅할 금액
 * @param decimals 소수점 자릿수 (기본값: 6)
 * @returns 포맷팅된 금액
 */
export function formatAmount(amount: string | number, decimals = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    return '0';
  }
  
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}

/**
 * 화폐 금액을 포맷팅합니다.
 * @param amount 포맷팅할 금액
 * @param currency 화폐 코드 (기본값: 'USD')
 * @returns 포맷팅된 화폐 금액
 */
export function formatCurrency(amount: string | number, currency = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * 주소를 축약하여 표시합니다.
 * @param address 축약할 주소
 * @param prefixLength 앞부분 길이 (기본값: 6)
 * @param suffixLength 뒷부분 길이 (기본값: 4)
 * @returns 축약된 주소
 */
export function shortenAddress(address: string, prefixLength = 6, suffixLength = 4): string {
  if (!address) {
    return '';
  }
  
  if (address.length <= prefixLength + suffixLength) {
    return address;
  }
  
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * 타임스탬프를 상대적 시간으로 포맷팅합니다.
 * @param timestamp 포맷팅할 타임스탬프
 * @returns 상대적 시간 문자열
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}일 전`;
  } else if (hours > 0) {
    return `${hours}시간 전`;
  } else if (minutes > 0) {
    return `${minutes}분 전`;
  } else {
    return '방금 전';
  }
}
```

### validators.ts

```typescript
/**
 * 이더리움 주소 유효성을 검사합니다.
 * @param address 검사할 이더리움 주소
 * @returns 유효성 여부
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * 금액 유효성을 검사합니다.
 * @param amount 검사할 금액
 * @returns 유효성 여부
 */
export function isValidAmount(amount: string): boolean {
  if (!amount) return false;
  
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

/**
 * URL 유효성을 검사합니다.
 * @param url 검사할 URL
 * @returns 유효성 여부
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 시드 구문 유효성을 검사합니다.
 * @param mnemonic 검사할 시드 구문
 * @returns 유효성 여부
 */
export function isValidMnemonic(mnemonic: string): boolean {
  if (!mnemonic) return false;
  
  // BIP39 시드 구문은 12, 15, 18, 21, 24개의 단어로 구성됨
  const words = mnemonic.trim().split(/\s+/);
  return [12, 15, 18, 21, 24].includes(words.length);
}
```

## 유틸리티 함수 사용 시 주의사항

1. **타입 안전성**:
   - TypeScript의 타입 검사를 활용하여 유틸리티 함수의 입력과 출력 타입을 명확히 정의합니다.
   - 모든 유틸리티 함수에 적절한 매개변수 및 반환 타입을 지정합니다.

2. **에러 처리**:
   - 모든 유틸리티 함수에서 예외 상황을 고려하고 적절히 처리합니다.
   - 외부 입력을 처리하는 함수는 특히 강력한 검증과 에러 처리가 필요합니다.

3. **국제화 및 현지화**:
   - 날짜, 시간, 숫자 포맷팅 함수는 사용자의 로케일을 고려해야 합니다.
   - 사용자 인터페이스에 표시되는 모든 문자열은 다국어 지원을 고려합니다.

4. **성능 최적화**:
   - 자주 호출되는 유틸리티 함수는 성능 최적화를 고려합니다.
   - 계산 비용이 높은 함수는 메모이제이션(memoization)을 적용하여 중복 계산을 방지합니다.

5. **보안 고려사항**:
   - 암호화 관련 함수는 최신 보안 권장 사항을 따릅니다.
   - 민감한 정보를 처리하는 함수는 메모리에 오래 저장하지 않습니다.
   - 입력 검증 함수는 모든 edge case를 처리해야 합니다.
