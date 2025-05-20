/**
 * mnemonic.ts
 * 
 * 이 모듈은 니모닉 구문 생성, 검증 및 처리를 위한 유틸리티 함수를 제공합니다.
 * BIP-39 표준을 따르며, 여러 언어의 니모닉 구문을 지원합니다.
 */

import * as bip39 from 'bip39';
import { v4 as uuidv4 } from 'uuid';
import { ErrorCode, ToriWalletError } from '../../constants/errors';

// 지원되는 언어 열거
export enum MnemonicLanguage {
  ENGLISH = 'english',
  JAPANESE = 'japanese',
  KOREAN = 'korean',
  SPANISH = 'spanish',
  CHINESE_SIMPLIFIED = 'chinese_simplified',
  CHINESE_TRADITIONAL = 'chinese_traditional',
  FRENCH = 'french',
  ITALIAN = 'italian',
  CZECH = 'czech',
  PORTUGUESE = 'portuguese',
}

// 니모닉 강도 열거
export enum MnemonicStrength {
  LOW = 128,     // 12 단어
  MEDIUM = 160,  // 15 단어
  HIGH = 192,    // 18 단어
  VERY_HIGH = 256, // 24 단어
}

// 니모닉 옵션 인터페이스
export interface MnemonicOptions {
  strength?: MnemonicStrength; // 니모닉 강도 (비트 수)
  language?: MnemonicLanguage; // 니모닉 언어
  passphrase?: string;         // 추가 패스프레이즈
}

/**
 * 니모닉 구문 생성
 * 
 * @param options 니모닉 옵션
 * @returns 생성된 니모닉 구문
 */
export function generateMnemonic(options: MnemonicOptions = {}): string {
  try {
    const strength = options.strength || MnemonicStrength.LOW;
    const wordlist = getWordlist(options.language || MnemonicLanguage.ENGLISH);
    
    return bip39.generateMnemonic(strength, undefined, wordlist);
  } catch (error) {
    console.error('Failed to generate mnemonic', error);
    throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, 'Failed to generate mnemonic', error);
  }
}

/**
 * 니모닉 구문 유효성 검사
 * 
 * @param mnemonic 니모닉 구문
 * @param language 니모닉 언어
 * @returns 유효성 여부
 */
export function validateMnemonic(mnemonic: string, language?: MnemonicLanguage): boolean {
  try {
    const wordlist = language ? getWordlist(language) : undefined;
    return bip39.validateMnemonic(mnemonic, wordlist);
  } catch (error) {
    console.error('Failed to validate mnemonic', error);
    return false;
  }
}

/**
 * 니모닉 구문에서 시드 생성
 * 
 * @param mnemonic 니모닉 구문
 * @param passphrase 추가 패스프레이즈 (선택적)
 * @returns 시드 (16진수 문자열)
 */
export function mnemonicToSeed(mnemonic: string, passphrase?: string): string {
  try {
    if (!validateMnemonic(mnemonic)) {
      throw new ToriWalletError(ErrorCode.INVALID_MNEMONIC, 'Invalid mnemonic');
    }
    
    return bip39.mnemonicToSeedSync(mnemonic, passphrase).toString('hex');
  } catch (error) {
    console.error('Failed to convert mnemonic to seed', error);
    throw new ToriWalletError(ErrorCode.INVALID_MNEMONIC, 'Failed to convert mnemonic to seed', error);
  }
}

/**
 * 니모닉 구문을 엔트로피로 변환
 * 
 * @param mnemonic 니모닉 구문
 * @returns 엔트로피 (16진수 문자열)
 */
export function mnemonicToEntropy(mnemonic: string): string {
  try {
    if (!validateMnemonic(mnemonic)) {
      throw new ToriWalletError(ErrorCode.INVALID_MNEMONIC, 'Invalid mnemonic');
    }
    
    return bip39.mnemonicToEntropy(mnemonic);
  } catch (error) {
    console.error('Failed to convert mnemonic to entropy', error);
    throw new ToriWalletError(ErrorCode.INVALID_MNEMONIC, 'Failed to convert mnemonic to entropy', error);
  }
}

/**
 * 엔트로피에서 니모닉 구문 생성
 * 
 * @param entropy 엔트로피 (16진수 문자열)
 * @param language 니모닉 언어
 * @returns 니모닉 구문
 */
export function entropyToMnemonic(entropy: string, language?: MnemonicLanguage): string {
  try {
    const wordlist = language ? getWordlist(language) : undefined;
    return bip39.entropyToMnemonic(entropy, wordlist);
  } catch (error) {
    console.error('Failed to convert entropy to mnemonic', error);
    throw new ToriWalletError(ErrorCode.WALLET_CREATION_FAILED, 'Failed to convert entropy to mnemonic', error);
  }
}

/**
 * 단어 목록 가져오기
 * 
 * @param language 니모닉 언어
 * @returns 단어 목록
 */
export function getWordlist(language: MnemonicLanguage): string[] {
  try {
    switch (language) {
      case MnemonicLanguage.ENGLISH:
        return bip39.wordlists.english;
      case MnemonicLanguage.JAPANESE:
        return bip39.wordlists.japanese;
      case MnemonicLanguage.KOREAN:
        return bip39.wordlists.korean;
      case MnemonicLanguage.SPANISH:
        return bip39.wordlists.spanish;
      case MnemonicLanguage.CHINESE_SIMPLIFIED:
        return bip39.wordlists.chinese_simplified;
      case MnemonicLanguage.CHINESE_TRADITIONAL:
        return bip39.wordlists.chinese_traditional;
      case MnemonicLanguage.FRENCH:
        return bip39.wordlists.french;
      case MnemonicLanguage.ITALIAN:
        return bip39.wordlists.italian;
      case MnemonicLanguage.CZECH:
        return bip39.wordlists.czech;
      case MnemonicLanguage.PORTUGUESE:
        return bip39.wordlists.portuguese;
      default:
        return bip39.wordlists.english;
    }
  } catch (error) {
    console.error('Failed to get wordlist', error);
    throw new ToriWalletError(ErrorCode.NOT_IMPLEMENTED, 'Wordlist not available for the specified language', error);
  }
}

/**
 * 니모닉 구문에서 단어 추출
 * 
 * @param mnemonic 니모닉 구문
 * @returns 단어 배열
 */
export function mnemonicToArray(mnemonic: string): string[] {
  return mnemonic.trim().split(/\s+/);
}

/**
 * 단어 배열에서 니모닉 구문 생성
 * 
 * @param words 단어 배열
 * @returns 니모닉 구문
 */
export function arrayToMnemonic(words: string[]): string {
  return words.join(' ');
}

/**
 * 니모닉 구문 섞기 (백업 테스트용)
 * 
 * @param mnemonic 니모닉 구문
 * @returns 섞인 단어 배열
 */
export function shuffleMnemonic(mnemonic: string): string[] {
  const words = mnemonicToArray(mnemonic);
  return shuffle(words);
}

/**
 * 배열 섞기 (Fisher-Yates 알고리즘)
 * 
 * @param array 섞을 배열
 * @returns 섞인 배열
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  let currentIndex = result.length;
  let temporaryValue, randomIndex;

  // 요소가 남아있는 동안
  while (0 !== currentIndex) {
    // 남아있는 요소 중 하나를 선택
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // 현재 요소와 선택된 요소를 교환
    temporaryValue = result[currentIndex];
    result[currentIndex] = result[randomIndex];
    result[randomIndex] = temporaryValue;
  }

  return result;
}

/**
 * 니모닉 구문의 단어 수 확인
 * 
 * @param mnemonic 니모닉 구문
 * @returns 단어 수
 */
export function getMnemonicWordCount(mnemonic: string): number {
  return mnemonicToArray(mnemonic).length;
}

/**
 * 니모닉 구문에서 단어 개수를 기반으로 강도 판단
 * 
 * @param mnemonic 니모닉 구문
 * @returns 니모닉 강도
 */
export function getMnemonicStrength(mnemonic: string): MnemonicStrength {
  const wordCount = getMnemonicWordCount(mnemonic);
  
  switch (wordCount) {
    case 12:
      return MnemonicStrength.LOW;
    case 15:
      return MnemonicStrength.MEDIUM;
    case 18:
      return MnemonicStrength.HIGH;
    case 24:
      return MnemonicStrength.VERY_HIGH;
    default:
      throw new ToriWalletError(ErrorCode.INVALID_MNEMONIC, `Invalid word count: ${wordCount}`);
  }
}

/**
 * 니모닉 구문 완성하기 (자동 완성)
 * 
 * @param partialMnemonic 부분 니모닉 구문
 * @param language 니모닉 언어
 * @returns 가능한 니모닉 구문 목록
 */
export function completeMnemonic(partialMnemonic: string, language: MnemonicLanguage = MnemonicLanguage.ENGLISH): string[] {
  try {
    const words = mnemonicToArray(partialMnemonic);
    const wordlist = getWordlist(language);
    const results: string[] = [];
    
    // 마지막 단어가 비어있거나 불완전한 경우
    if (words.length > 0) {
      const lastWord = words[words.length - 1];
      const candidates = wordlist.filter(word => word.startsWith(lastWord));
      
      // 후보 단어마다 니모닉 완성 시도
      for (const candidate of candidates) {
        const newWords = [...words.slice(0, -1), candidate];
        const newMnemonic = arrayToMnemonic(newWords);
        
        // 니모닉이 유효한 경우에만 결과에 추가
        if (validateMnemonic(newMnemonic, language)) {
          results.push(newMnemonic);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Failed to complete mnemonic', error);
    throw new ToriWalletError(ErrorCode.INVALID_MNEMONIC, 'Failed to complete mnemonic', error);
  }
}

/**
 * 언어 감지
 * 
 * @param mnemonic 니모닉 구문
 * @returns 감지된 언어 (감지 실패 시 undefined)
 */
export function detectMnemonicLanguage(mnemonic: string): MnemonicLanguage | undefined {
  const words = mnemonicToArray(mnemonic);
  
  // 첫 번째 단어를 사용하여 언어 감지
  if (words.length > 0) {
    const firstWord = words[0];
    
    // 모든 지원 언어에 대해 검사
    for (const language of Object.values(MnemonicLanguage)) {
      const wordlist = getWordlist(language);
      
      // 첫 번째 단어가 이 언어의 단어 목록에 있는지 확인
      if (wordlist.includes(firstWord)) {
        // 전체 니모닉이 이 언어로 유효한지 확인
        if (validateMnemonic(mnemonic, language)) {
          return language;
        }
      }
    }
  }
  
  return undefined;
}

/**
 * 니모닉 구문 번역
 * 
 * @param mnemonic 니모닉 구문
 * @param sourceLanguage 원본 언어
 * @param targetLanguage 대상 언어
 * @returns 번역된 니모닉 구문
 */
export function translateMnemonic(
  mnemonic: string,
  sourceLanguage: MnemonicLanguage,
  targetLanguage: MnemonicLanguage
): string {
  try {
    // 원본 언어가 대상 언어와 같은 경우 그대로 반환
    if (sourceLanguage === targetLanguage) {
      return mnemonic;
    }
    
    // 니모닉 유효성 확인
    if (!validateMnemonic(mnemonic, sourceLanguage)) {
      throw new ToriWalletError(ErrorCode.INVALID_MNEMONIC, 'Invalid mnemonic');
    }
    
    // 엔트로피로 변환
    const entropy = mnemonicToEntropy(mnemonic);
    
    // 대상 언어로 니모닉 생성
    return entropyToMnemonic(entropy, targetLanguage);
  } catch (error) {
    console.error('Failed to translate mnemonic', error);
    throw new ToriWalletError(ErrorCode.INVALID_MNEMONIC, 'Failed to translate mnemonic', error);
  }
}

/**
 * 디코이 단어 생성 (보안 강화를 위한 가짜 단어)
 * 
 * @param count 디코이 단어 수
 * @param language 니모닉 언어
 * @returns 디코이 단어 배열
 */
export function generateDecoyWords(count: number, language: MnemonicLanguage = MnemonicLanguage.ENGLISH): string[] {
  const wordlist = getWordlist(language);
  const decoys: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * wordlist.length);
    decoys.push(wordlist[randomIndex]);
  }
  
  return decoys;
}

/**
 * 니모닉 검증용 단어 세트 생성
 * 
 * @param mnemonic 니모닉 구문
 * @param count 검증할 단어 수
 * @returns 검증 세트 (인덱스-단어 쌍의 배열)
 */
export function generateVerificationSet(mnemonic: string, count: number = 3): Array<{ index: number; word: string }> {
  const words = mnemonicToArray(mnemonic);
  const indices = shuffle([...Array(words.length).keys()]).slice(0, count);
  
  return indices.map(index => ({
    index,
    word: words[index]
  }));
}

/**
 * 니모닉 구문의 보안 강도 평가
 * 
 * @param mnemonic 니모닉 구문
 * @returns 보안 점수 (1-5, 높을수록 안전)
 */
export function evaluateMnemonicSecurity(mnemonic: string): number {
  const words = mnemonicToArray(mnemonic);
  
  // 단어 수에 따른 기본 점수
  let score = 0;
  switch (words.length) {
    case 12:
      score = 3; // 128 비트 엔트로피
      break;
    case 15:
      score = 3.5; // 160 비트 엔트로피
      break;
    case 18:
      score = 4; // 192 비트 엔트로피
      break;
    case 24:
      score = 5; // 256 비트 엔트로피
      break;
    default:
      score = 0; // 유효하지 않은 니모닉
  }
  
  return Math.min(5, Math.max(1, score));
}

/**
 * 기본 내보내기
 */
export default {
  generateMnemonic,
  validateMnemonic,
  mnemonicToSeed,
  mnemonicToEntropy,
  entropyToMnemonic,
  getWordlist,
  mnemonicToArray,
  arrayToMnemonic,
  shuffleMnemonic,
  getMnemonicWordCount,
  getMnemonicStrength,
  completeMnemonic,
  detectMnemonicLanguage,
  translateMnemonic,
  generateDecoyWords,
  generateVerificationSet,
  evaluateMnemonicSecurity,
  MnemonicLanguage,
  MnemonicStrength,
};
