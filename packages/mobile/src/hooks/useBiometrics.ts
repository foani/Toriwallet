import { useCallback, useEffect, useState } from 'react';
import BiometricService from '../services/BiometricService';

/**
 * 생체 인증 기능을 사용하기 위한 훅
 * 
 * 이 훅은 생체 인증 서비스를 통해 지문 인식, Face ID 등의 생체 인증 관련 기능을 쉽게 사용할 수 있게 해줍니다.
 * 
 * @returns {Object} 생체 인증 관련 상태와 함수들
 * @returns {boolean} isAvailable - 생체 인증 사용 가능 여부
 * @returns {string|null} biometryType - 생체 인증 유형 (FaceID, TouchID, Biometrics)
 * @returns {string} biometryTypeName - 생체 인증 유형의 표시 이름
 * @returns {boolean} isEnabled - 생체 인증 활성화 여부
 * @returns {boolean} isLoading - 로딩 상태
 * @returns {Function} checkAvailability - 생체 인증 사용 가능 여부 확인 함수
 * @returns {Function} enableBiometrics - 생체 인증 활성화 함수
 * @returns {Function} disableBiometrics - 생체 인증 비활성화 함수
 * @returns {Function} authenticate - 생체 인증 인증 함수
 * @returns {Function} storePassword - 비밀번호 저장 함수
 * @returns {Function} getPassword - 저장된 비밀번호 가져오기 함수
 * @returns {Function} createSignature - 서명 생성 함수
 */
export const useBiometrics = () => {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [biometryType, setBiometryType] = useState<string | null>(null);
  const [biometryTypeName, setBiometryTypeName] = useState<string>('생체 인증');
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 생체 인증 사용 가능 여부 확인
  const checkAvailability = useCallback(async () => {
    setIsLoading(true);
    try {
      const { available, biometryType } = await BiometricService.isSensorAvailable();
      setIsAvailable(available);
      setBiometryType(biometryType);
      
      if (available) {
        const typeName = await BiometricService.getBiometricTypeName();
        setBiometryTypeName(typeName);
        
        const enabled = await BiometricService.isBiometricEnabled();
        setIsEnabled(enabled);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
      setBiometryType(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드 시 생체 인증 사용 가능 여부 확인
  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  // 생체 인증 활성화
  const enableBiometrics = useCallback(
    async (password: string, username: string): Promise<boolean> => {
      if (!isAvailable) return false;
      
      try {
        setIsLoading(true);
        
        // 생체 인증 키 생성
        const keysExist = await BiometricService.biometricKeysExist();
        if (!keysExist) {
          await BiometricService.createKeys('TORI 지갑에 생체 인증을 등록합니다');
        }
        
        // 비밀번호 저장
        const success = await BiometricService.storePassword(password, username);
        
        if (success) {
          await BiometricService.setBiometricEnabled(true);
          setIsEnabled(true);
        }
        
        return success;
      } catch (error) {
        console.error('Error enabling biometrics:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAvailable]
  );

  // 생체 인증 비활성화
  const disableBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // 저장된 비밀번호 삭제
      await BiometricService.resetBiometricPassword();
      
      // 생체 인증 키 삭제
      await BiometricService.deleteKeys();
      
      // 생체 인증 비활성화 설정
      await BiometricService.setBiometricEnabled(false);
      
      setIsEnabled(false);
      return true;
    } catch (error) {
      console.error('Error disabling biometrics:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 생체 인증 인증
  const authenticate = useCallback(
    async (promptMessage: string = '생체 인증을 사용하여 인증해주세요'): Promise<boolean> => {
      if (!isAvailable || !isEnabled) return false;
      
      try {
        const success = await BiometricService.simplePrompt(promptMessage);
        return success;
      } catch (error) {
        console.error('Error authenticating with biometrics:', error);
        return false;
      }
    },
    [isAvailable, isEnabled]
  );

  // 비밀번호 저장
  const storePassword = useCallback(
    async (password: string, username: string): Promise<boolean> => {
      if (!isAvailable || !isEnabled) return false;
      
      try {
        return await BiometricService.storePassword(password, username);
      } catch (error) {
        console.error('Error storing password with biometrics:', error);
        return false;
      }
    },
    [isAvailable, isEnabled]
  );

  // 저장된 비밀번호 가져오기
  const getPassword = useCallback(
    async (
      promptMessage: string = '생체 인증을 사용하여 비밀번호를 가져옵니다'
    ): Promise<{ username: string; password: string } | null> => {
      if (!isAvailable || !isEnabled) return null;
      
      try {
        return await BiometricService.getPassword(promptMessage);
      } catch (error) {
        console.error('Error getting password with biometrics:', error);
        return null;
      }
    },
    [isAvailable, isEnabled]
  );

  // 생체 인증 서명 생성
  const createSignature = useCallback(
    async (
      payload: string,
      promptMessage: string = '생체 인증을 사용하여 서명합니다'
    ): Promise<{ success: boolean; signature?: string }> => {
      if (!isAvailable || !isEnabled) return { success: false };
      
      try {
        return await BiometricService.createSignature(payload, promptMessage);
      } catch (error) {
        console.error('Error creating signature with biometrics:', error);
        return { success: false };
      }
    },
    [isAvailable, isEnabled]
  );

  return {
    isAvailable,
    biometryType,
    biometryTypeName,
    isEnabled,
    isLoading,
    checkAvailability,
    enableBiometrics,
    disableBiometrics,
    authenticate,
    storePassword,
    getPassword,
    createSignature,
  };
};
