import ReactNativeBiometrics, { BiometryType } from 'react-native-biometrics';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 바이오메트릭 인증 서비스 인스턴스
const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

/**
 * 생체 인증 서비스
 * 
 * 지문 인식, Face ID 등 생체 인증 기능을 관리하는 서비스 클래스입니다.
 * 생체 인증 가능 여부 확인, 등록, 인증 등의 기능을 제공합니다.
 */
class BiometricService {
  /**
   * 생체 인증 기능 사용 가능 여부 확인
   * @returns {Promise<{available: boolean, biometryType: string | null}>} 사용 가능 여부와 인증 타입
   */
  async isSensorAvailable(): Promise<{ available: boolean; biometryType: string | null }> {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      return { available, biometryType };
    } catch (error) {
      console.error('Failed to check biometric sensor:', error);
      return { available: false, biometryType: null };
    }
  }

  /**
   * 현재 기기에서 사용 가능한 생체 인증 타입 이름 반환
   * @returns {Promise<string>} 생체 인증 타입 이름
   */
  async getBiometricTypeName(): Promise<string> {
    try {
      const { biometryType } = await rnBiometrics.isSensorAvailable();
      
      switch (biometryType) {
        case BiometryType.FaceID:
          return 'Face ID';
        case BiometryType.TouchID:
          return '터치 ID';
        case BiometryType.Biometrics:
          return '생체 인증';
        default:
          return '생체 인증';
      }
    } catch (error) {
      console.error('Failed to get biometric type name:', error);
      return '생체 인증';
    }
  }

  /**
   * 생체 인증 활성화 여부 확인
   * @returns {Promise<boolean>} 활성화 여부
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem('@biometric_enabled');
      return enabled === 'true';
    } catch (error) {
      console.error('Failed to check if biometric is enabled:', error);
      return false;
    }
  }

  /**
   * 생체 인증 활성화 설정
   * @param {boolean} enabled 활성화 여부
   * @returns {Promise<void>}
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('@biometric_enabled', enabled ? 'true' : 'false');
    } catch (error) {
      console.error('Failed to set biometric enabled:', error);
      throw error;
    }
  }

  /**
   * 생체 인증 키 생성 (등록)
   * @param {string} promptMessage 인증 시 표시할 메시지
   * @returns {Promise<{publicKey: string}>} 생성된 공개 키
   */
  async createKeys(promptMessage: string): Promise<{ publicKey: string }> {
    try {
      const { publicKey } = await rnBiometrics.createKeys(promptMessage);
      return { publicKey };
    } catch (error) {
      console.error('Failed to create biometric keys:', error);
      throw error;
    }
  }

  /**
   * 생체 인증 키 존재 여부 확인
   * @returns {Promise<boolean>} 키 존재 여부
   */
  async biometricKeysExist(): Promise<boolean> {
    try {
      const { keysExist } = await rnBiometrics.biometricKeysExist();
      return keysExist;
    } catch (error) {
      console.error('Failed to check biometric keys:', error);
      return false;
    }
  }

  /**
   * 생체 인증 키 삭제
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteKeys(): Promise<boolean> {
    try {
      const { keysDeleted } = await rnBiometrics.deleteKeys();
      return keysDeleted;
    } catch (error) {
      console.error('Failed to delete biometric keys:', error);
      return false;
    }
  }

  /**
   * 비밀번호를 생체 인증을 통해 암호화하여 저장
   * @param {string} password 저장할 비밀번호
   * @param {string} username 사용자 식별자 (보통 지갑 ID)
   * @returns {Promise<boolean>} 저장 성공 여부
   */
  async storePassword(password: string, username: string): Promise<boolean> {
    try {
      const result = await Keychain.setInternetCredentials(
        'TORI_WALLET_BIOMETRIC',
        username,
        password,
        { accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY }
      );
      return !!result;
    } catch (error) {
      console.error('Failed to store password with biometrics:', error);
      return false;
    }
  }

  /**
   * 생체 인증을 통해 저장된 비밀번호 가져오기
   * @param {string} promptMessage 인증 시 표시할 메시지
   * @returns {Promise<{username: string, password: string} | null>} 저장된 비밀번호 정보
   */
  async getPassword(promptMessage: string): Promise<{ username: string; password: string } | null> {
    try {
      const credentials = await Keychain.getInternetCredentials('TORI_WALLET_BIOMETRIC', {
        authenticationPrompt: { title: promptMessage },
      });
      
      if (credentials) {
        return {
          username: credentials.username,
          password: credentials.password,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get password with biometrics:', error);
      return null;
    }
  }

  /**
   * 생체 인증 서명 생성
   * @param {string} payload 서명할 데이터
   * @param {string} promptMessage 인증 시 표시할 메시지
   * @returns {Promise<{success: boolean, signature?: string}>} 서명 결과
   */
  async createSignature(
    payload: string,
    promptMessage: string
  ): Promise<{ success: boolean; signature?: string }> {
    try {
      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage,
        payload,
      });
      
      return { success, signature };
    } catch (error) {
      console.error('Failed to create biometric signature:', error);
      return { success: false };
    }
  }

  /**
   * 생체 인증 단순 인증 (서명 생성 없이)
   * @param {string} promptMessage 인증 시 표시할 메시지
   * @returns {Promise<boolean>} 인증 성공 여부
   */
  async simplePrompt(promptMessage: string): Promise<boolean> {
    try {
      const { success } = await rnBiometrics.simplePrompt({ promptMessage });
      return success;
    } catch (error) {
      console.error('Failed to perform biometric authentication:', error);
      return false;
    }
  }

  /**
   * 생체 인증 저장된 비밀번호 삭제
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async resetBiometricPassword(): Promise<boolean> {
    try {
      const result = await Keychain.resetInternetCredentials('TORI_WALLET_BIOMETRIC');
      return result;
    } catch (error) {
      console.error('Failed to reset biometric password:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export default new BiometricService();
