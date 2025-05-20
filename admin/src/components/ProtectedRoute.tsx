import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context';
import { Loading } from './common';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isLoggedIn, user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // 추가적인 로직을 필요에 따라 구현
  }, [isLoggedIn, user]);

  if (loading) {
    return <Loading fullscreen text="인증 확인 중..." />;
  }

  if (!isLoggedIn) {
    // 사용자가 로그인하지 않은 경우 로그인 페이지로 리디렉션하고 현재 위치를 저장
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 특정 역할이 필요한 경우 확인
  if (requiredRole && user && user.role !== requiredRole) {
    // 권한이 없는 경우 접근 거부 페이지나 대시보드로 리디렉션
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
