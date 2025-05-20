import React, { useState } from 'react';
import { ChakraProvider, Box, useDisclosure } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, AuthProvider, LanguageProvider, NotificationProvider } from './context';
import { Header, Sidebar } from './components/common';

// 로그인 및 인증 페이지
import LoginPage from './pages/Login';

// 메인 페이지
import DashboardPage from './pages/Dashboard';
import UsersPage from './pages/UserManagement';
import NetworksPage from './pages/NetworkManagement';
import AnalyticsPage from './pages/Analytics';
import LogsPage from './pages/LogViewer';
import SettingsPage from './pages/Settings';

// 보호된 라우트 컴포넌트
import ProtectedRoute from './components/ProtectedRoute';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box display="flex" height="100vh">
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarToggle} />
      <Box
        flex="1"
        ml={{ base: 0, md: isSidebarOpen ? '250px' : 0 }}
        transition="margin-left 0.3s"
      >
        <Header onSidebarToggle={handleSidebarToggle} />
        <Box as="main" pt="60px" p={4} height="calc(100vh - 60px)" overflowY="auto">
          {children}
        </Box>
      </Box>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <LanguageProvider>
          <NotificationProvider>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <DashboardPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users/*"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <UsersPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/networks/*"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <NetworksPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics/*"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <AnalyticsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/logs/*"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <LogsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings/*"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <SettingsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          </NotificationProvider>
        </LanguageProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
