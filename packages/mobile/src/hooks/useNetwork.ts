import { useContext } from 'react';
import { NetworkContext } from '../contexts/NetworkContext';

/**
 * 네트워크 관련 기능을 사용하기 위한 훅
 * 
 * 이 훅은 NetworkContext를 통해 네트워크 상태와 네트워크 관련 함수들을 제공합니다.
 * 네트워크 전환, 사용자 정의 네트워크 관리 등의 기능을 사용할 수 있습니다.
 * 
 * @returns {Object} 네트워크 상태와 네트워크 관련 함수들
 * @returns {Array} networks - 사용 가능한 네트워크 목록
 * @returns {Object} activeNetwork - 현재 활성화된 네트워크
 * @returns {boolean} isLoadingNetworks - 네트워크 로딩 중 여부
 * @returns {string|null} networkError - 오류 메시지
 * @returns {Function} switchNetwork - 네트워크 전환 함수
 * @returns {Function} addCustomNetwork - 사용자 정의 네트워크 추가 함수
 * @returns {Function} editCustomNetwork - 사용자 정의 네트워크 편집 함수
 * @returns {Function} removeCustomNetwork - 사용자 정의 네트워크 삭제 함수
 */
export const useNetwork = () => {
  const context = useContext(NetworkContext);
  
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  
  return context;
};
