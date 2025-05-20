import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useDisclosure,
  IconButton
} from '@chakra-ui/react';
import { FiPlus, FiArrowLeft } from 'react-icons/fi';
import { useNetworks } from '@/hooks';
import { NetworkList, NetworkForm } from '@/components/networks';
import { Card, Loading } from '@/components/common';
import { NetworkType, NetworkStatus, NetworkCreateRequest, NetworkUpdateRequest } from '@/types';
import { useTranslation } from 'react-i18next';

const NetworkListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    networks,
    total,
    loading,
    page,
    limit,
    filters,
    fetchNetworks,
    changePage,
    changeLimit,
    applyFilters,
    resetFilters
  } = useNetworks();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (search: string) => {
    setSearchTerm(search);
    applyFilters({ ...filters, search });
  };
  
  const handleFilterByType = (type: NetworkType | '') => {
    applyFilters({ ...filters, type: type || undefined });
  };
  
  const handleFilterByStatus = (status: NetworkStatus | '') => {
    applyFilters({ ...filters, status: status || undefined });
  };
  
  const handleFilterByTestnet = (isTestnet: boolean | null) => {
    applyFilters({ ...filters, isTestnet });
  };
  
  const handleViewNetwork = (networkId: string) => {
    navigate(`/networks/view/${networkId}`);
  };
  
  const handleEditNetwork = (networkId: string) => {
    navigate(`/networks/edit/${networkId}`);
  };
  
  return (
    <Box>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb={6}
        flexDirection={{ base: 'column', md: 'row' }}
        gap={3}
      >
        <Box>
          <Heading as="h1" size="lg">
            {t('networks.title')}
          </Heading>
          <Text color="gray.500">{t('networks.subtitle')}</Text>
        </Box>
        
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={() => navigate('/networks/create')}
        >
          {t('networks.addNetwork')}
        </Button>
      </Flex>
      
      <NetworkList
        networks={networks}
        isLoading={loading}
        totalNetworks={total}
        currentPage={page}
        pageSize={limit}
        onPageChange={changePage}
        onPageSizeChange={changeLimit}
        onViewNetwork={handleViewNetwork}
        onEditNetwork={handleEditNetwork}
        onDeleteNetwork={(id) => console.log('Delete network:', id)}
        onActivateNetwork={(id) => console.log('Activate network:', id)}
        onDeactivateNetwork={(id) => console.log('Deactivate network:', id)}
        onMaintenanceNetwork={(id) => console.log('Maintenance network:', id)}
        onRefresh={fetchNetworks}
        onSearch={handleSearch}
        onFilterByType={handleFilterByType}
        onFilterByStatus={handleFilterByStatus}
        onFilterByTestnet={handleFilterByTestnet}
      />
    </Box>
  );
};

const NetworkCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loading, createNetwork } = useNetworks();
  
  const handleSubmit = async (values: NetworkCreateRequest) => {
    try {
      await createNetwork(values);
      navigate('/networks');
    } catch (error) {
      console.error('Failed to create network:', error);
    }
  };
  
  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <IconButton
          icon={<FiArrowLeft />}
          aria-label="Back"
          variant="ghost"
          onClick={() => navigate('/networks')}
          mr={4}
        />
        <Box>
          <Breadcrumb fontSize="sm" mb={2}>
            <BreadcrumbItem>
              <BreadcrumbLink href="/networks">{t('networks.title')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{t('networks.createNetwork')}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Heading as="h1" size="lg">
            {t('networks.createNetwork')}
          </Heading>
        </Box>
      </Flex>
      
      <Card>
        <NetworkForm onSubmit={handleSubmit} isLoading={loading} />
      </Card>
    </Box>
  );
};

const NetworkEditPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const networkId = location.pathname.split('/').pop() || '';
  const { loading, selectedNetwork, updateNetwork, selectNetwork } = useNetworks();
  
  React.useEffect(() => {
    if (networkId) {
      selectNetwork(networkId);
    }
  }, [networkId, selectNetwork]);
  
  const handleSubmit = async (values: NetworkUpdateRequest) => {
    try {
      await updateNetwork(networkId, values);
      navigate('/networks');
    } catch (error) {
      console.error('Failed to update network:', error);
    }
  };
  
  if (loading || !selectedNetwork) {
    return <Loading height="300px" text={t('common.loading')} />;
  }
  
  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <IconButton
          icon={<FiArrowLeft />}
          aria-label="Back"
          variant="ghost"
          onClick={() => navigate('/networks')}
          mr={4}
        />
        <Box>
          <Breadcrumb fontSize="sm" mb={2}>
            <BreadcrumbItem>
              <BreadcrumbLink href="/networks">{t('networks.title')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{t('networks.editNetwork')}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Heading as="h1" size="lg">
            {t('networks.editNetwork')}
          </Heading>
        </Box>
      </Flex>
      
      <Card>
        <NetworkForm
          network={selectedNetwork}
          onSubmit={handleSubmit}
          isLoading={loading}
          isEdit
        />
      </Card>
    </Box>
  );
};

const NetworkViewPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const networkId = location.pathname.split('/').pop() || '';
  const { loading, selectedNetwork, selectNetwork, networkStats } = useNetworks();
  
  React.useEffect(() => {
    if (networkId) {
      selectNetwork(networkId);
    }
  }, [networkId, selectNetwork]);
  
  if (loading || !selectedNetwork) {
    return <Loading height="300px" text={t('common.loading')} />;
  }
  
  // 네트워크 상세 정보와 통계를 보여주는 컴포넌트 구현
  // 여기서는 간단한 레이아웃만 제공하고 실제 구현은 별도로 필요
  
  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <IconButton
          icon={<FiArrowLeft />}
          aria-label="Back"
          variant="ghost"
          onClick={() => navigate('/networks')}
          mr={4}
        />
        <Box>
          <Breadcrumb fontSize="sm" mb={2}>
            <BreadcrumbItem>
              <BreadcrumbLink href="/networks">{t('networks.title')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{selectedNetwork.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Heading as="h1" size="lg">
            {selectedNetwork.name}
          </Heading>
        </Box>
      </Flex>
      
      <Card title={t('networks.networkDetails')} mb={6}>
        {/* 네트워크 상세 정보 렌더링 */}
        <Text>네트워크 ID: {selectedNetwork.id}</Text>
        <Text>체인 ID: {selectedNetwork.chainId}</Text>
        <Text>타입: {selectedNetwork.type}</Text>
        <Text>RPC URL: {selectedNetwork.rpcUrl}</Text>
        <Text>심볼: {selectedNetwork.symbol}</Text>
        <Text>블록 탐색기: {selectedNetwork.blockExplorerUrl}</Text>
        <Text>테스트넷: {selectedNetwork.isTestnet ? '예' : '아니오'}</Text>
        <Text>기본 네트워크: {selectedNetwork.isDefaultNetwork ? '예' : '아니오'}</Text>
      </Card>
      
      {networkStats && (
        <Card title={t('networks.networkStats')}>
          {/* 네트워크 통계 정보 렌더링 */}
          <Text>활성 사용자: {networkStats.activeUsers}</Text>
          <Text>총 트랜잭션: {networkStats.totalTransactions}</Text>
          <Text>트랜잭션 볼륨: {networkStats.transactionVolume}</Text>
          <Text>평균 가스 가격: {networkStats.averageGasPrice}</Text>
          <Text>블록 높이: {networkStats.blockHeight}</Text>
        </Card>
      )}
    </Box>
  );
};

const NetworkManagement: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<NetworkListPage />} />
      <Route path="/create" element={<NetworkCreatePage />} />
      <Route path="/edit/:id" element={<NetworkEditPage />} />
      <Route path="/view/:id" element={<NetworkViewPage />} />
    </Routes>
  );
};

export default NetworkManagement;
