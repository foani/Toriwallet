/**
 * 텔레그램 Bot API와 통신하기 위한 클라이언트
 * 토큰 검증, 데이터 송수신 등의 기능 제공
 */
import axios from 'axios';
import { getWebApp } from './webApp';

// API 엔드포인트 설정
const API_BASE_URL = process.env.VITE_TELEGRAM_API_URL || 'https://api.example.com/telegram';

// 인증 헤더 생성
const getAuthHeaders = () => {
  const webApp = getWebApp();
  if (!webApp) return {};
  
  return {
    'X-Telegram-Init-Data': webApp.initData,
    'Content-Type': 'application/json'
  };
};

/**
 * 서버에 API 요청을 보내는 기본 함수
 */
const apiRequest = async (endpoint: string, method = 'GET', data?: any) => {
  try {
    const headers = getAuthHeaders();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await axios({
      method,
      url,
      headers,
      data
    });
    
    return response.data;
  } catch (error) {
    console.error(`API 요청 실패 (${endpoint}):`, error);
    throw error;
  }
};

/**
 * 사용자 인증 토큰 검증
 * 서버에서 initData 유효성을 검증하고 사용자 정보를 반환
 */
export const verifyUser = async () => {
  try {
    const response = await apiRequest('/auth/verify', 'POST');
    return response.user;
  } catch (error) {
    console.error('사용자 검증 실패:', error);
    throw error;
  }
};

/**
 * 사용자 지갑 정보 조회
 */
export const getUserWallet = async () => {
  try {
    const response = await apiRequest('/wallet/info', 'GET');
    return response.wallet;
  } catch (error) {
    console.error('지갑 정보 조회 실패:', error);
    throw error;
  }
};

/**
 * 지갑 생성 요청
 */
export const createWallet = async (password: string) => {
  try {
    const response = await apiRequest('/wallet/create', 'POST', { password });
    return response.wallet;
  } catch (error) {
    console.error('지갑 생성 실패:', error);
    throw error;
  }
};

/**
 * 지갑 가져오기 요청 (니모닉 구문으로)
 */
export const importWalletWithMnemonic = async (mnemonic: string, password: string) => {
  try {
    const response = await apiRequest('/wallet/import', 'POST', { mnemonic, password });
    return response.wallet;
  } catch (error) {
    console.error('지갑 가져오기 실패:', error);
    throw error;
  }
};

/**
 * 트랜잭션 전송 요청
 */
export const sendTransaction = async (txData: any) => {
  try {
    const response = await apiRequest('/transaction/send', 'POST', txData);
    return response.transaction;
  } catch (error) {
    console.error('트랜잭션 전송 실패:', error);
    throw error;
  }
};

/**
 * 사용자의 트랜잭션 목록 조회
 */
export const getTransactions = async (page = 1, limit = 10) => {
  try {
    const response = await apiRequest(`/transactions?page=${page}&limit=${limit}`, 'GET');
    return response.transactions;
  } catch (error) {
    console.error('트랜잭션 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 특정 트랜잭션 상세 정보 조회
 */
export const getTransactionDetails = async (txHash: string) => {
  try {
    const response = await apiRequest(`/transaction/${txHash}`, 'GET');
    return response.transaction;
  } catch (error) {
    console.error('트랜잭션 상세 정보 조회 실패:', error);
    throw error;
  }
};

/**
 * 잔액 조회
 */
export const getBalance = async () => {
  try {
    const response = await apiRequest('/wallet/balance', 'GET');
    return response.balance;
  } catch (error) {
    console.error('잔액 조회 실패:', error);
    throw error;
  }
};

/**
 * 사용자에게 텔레그램 메시지로 영수증 전송
 */
export const sendReceipt = async (txHash: string) => {
  try {
    const response = await apiRequest('/transaction/receipt', 'POST', { txHash });
    return response.success;
  } catch (error) {
    console.error('영수증 전송 실패:', error);
    throw error;
  }
};

export default {
  verifyUser,
  getUserWallet,
  createWallet,
  importWalletWithMnemonic,
  sendTransaction,
  getTransactions,
  getTransactionDetails,
  getBalance,
  sendReceipt
};
