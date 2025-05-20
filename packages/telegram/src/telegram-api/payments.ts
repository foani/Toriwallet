/**
 * 텔레그램 결제 API 래퍼
 * 텔레그램 미니앱에서 P2P 송금 기능을 구현하기 위한 래퍼 함수들
 */
import { getWebApp } from './webApp';
import axios from 'axios';

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
 * 텔레그램 송금 인보이스 생성
 * @param amount 송금 금액 (CTA)
 * @param description 송금 설명
 * @param currency 화폐 (기본값: CTA)
 */
export const createPaymentInvoice = async (amount: number, description: string, currency = 'CTA') => {
  try {
    const response = await axios({
      method: 'POST',
      url: `${API_BASE_URL}/payment/create-invoice`,
      headers: getAuthHeaders(),
      data: {
        amount,
        description,
        currency
      }
    });
    
    return response.data.invoiceUrl;
  } catch (error) {
    console.error('인보이스 생성 실패:', error);
    throw error;
  }
};

/**
 * 결제 인보이스 열기
 * @param invoiceUrl 인보이스 URL
 */
export const openInvoice = (invoiceUrl: string): Promise<'paid' | 'cancelled' | 'failed'> => {
  return new Promise((resolve) => {
    const webApp = getWebApp();
    if (!webApp) {
      resolve('failed');
      return;
    }
    
    webApp.openInvoice(invoiceUrl, (status) => {
      resolve(status);
    });
  });
};

/**
 * 텔레그램 사용자 간 P2P 송금 처리
 * @param receiverUsername 수취인 텔레그램 사용자명 (@ 제외)
 * @param amount 금액
 * @param description 설명
 */
export const sendP2PPayment = async (receiverUsername: string, amount: number, description: string) => {
  try {
    const response = await axios({
      method: 'POST',
      url: `${API_BASE_URL}/payment/send-p2p`,
      headers: getAuthHeaders(),
      data: {
        receiverUsername,
        amount,
        description
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('P2P 송금 실패:', error);
    throw error;
  }
};

/**
 * 결제 내역 조회
 * @param page 페이지 번호
 * @param limit 페이지당 항목 수
 */
export const getPaymentHistory = async (page = 1, limit = 10) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `${API_BASE_URL}/payment/history?page=${page}&limit=${limit}`,
      headers: getAuthHeaders()
    });
    
    return response.data.payments;
  } catch (error) {
    console.error('결제 내역 조회 실패:', error);
    throw error;
  }
};

/**
 * 결제 상태 확인
 * @param paymentId 결제 ID
 */
export const checkPaymentStatus = async (paymentId: string) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `${API_BASE_URL}/payment/status/${paymentId}`,
      headers: getAuthHeaders()
    });
    
    return response.data.status;
  } catch (error) {
    console.error('결제 상태 확인 실패:', error);
    throw error;
  }
};

export default {
  createPaymentInvoice,
  openInvoice,
  sendP2PPayment,
  getPaymentHistory,
  checkPaymentStatus
};
