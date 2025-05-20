import { useContext } from 'react';
import { WalletContext } from '../contexts/WalletContext';

/**
 * 지갑 관련 기능을 사용하기 위한 훅
 * 
 * 이 훅은 WalletContext를 통해 지갑 상태와 지갑 관련 함수들을 제공합니다.
 * 지갑 생성, 복구, 잠금 해제, 서명 등 암호화폐 지갑의 핵심 기능을 사용할 수 있습니다.
 * 
 * @returns {Object} 지갑 상태와 지갑 관련 함수들
 * @returns {boolean} isInitialized - 지갑 서비스 초기화 여부
 * @returns {boolean} isUnlocked - 지갑 잠금 해제 상태
 * @returns {boolean} hasWallet - 지갑 존재 여부
 * @returns {Array} accounts - 계정 목록
 * @returns {Object} activeAccount - 현재 활성화된 계정
 * @returns {string|null} walletError - 오류 메시지
 * @returns {boolean} isCreatingWallet - 지갑 생성 중 여부
 * @returns {boolean} isImportingWallet - 지갑 가져오기 중 여부
 * @returns {Function} initializeWallet - 지갑 초기화 함수
 * @returns {Function} createWallet - 지갑 생성 함수
 * @returns {Function} importWallet - 지갑 가져오기 함수
 * @returns {Function} unlockWallet - 지갑 잠금 해제 함수
 * @returns {Function} lockWallet - 지갑 잠금 함수
 * @returns {Function} addAccount - 계정 추가 함수
 * @returns {Function} switchAccount - 계정 전환 함수
 * @returns {Function} renameAccount - 계정 이름 변경 함수
 * @returns {Function} removeAccount - 계정 삭제 함수
 * @returns {Function} exportPrivateKey - 개인키 내보내기 함수
 * @returns {Function} signMessage - 메시지 서명 함수
 * @returns {Function} signTransaction - 트랜잭션 서명 함수
 */
export const useWallet = () => {
  const context = useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return context;
};
