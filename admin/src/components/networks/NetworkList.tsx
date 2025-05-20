import React, { useState } from 'react';
import {
  Box,
  Badge,
  Flex,
  useDisclosure,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  useColorModeValue,
  Image
} from '@chakra-ui/react';
import { FiSearch, FiEdit, FiTrash2, FiPlus, FiEye, FiActivity, FiPower } from 'react-icons/fi';
import { Network, NetworkStatus, NetworkType } from '@/types';
import { Table, Card, Modal, Button } from '@/components/common';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/format';

interface NetworkListProps {
  networks: Network[];
  isLoading: boolean;
  totalNetworks: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onViewNetwork: (networkId: string) => void;
  onEditNetwork: (networkId: string) => void;
  onDeleteNetwork: (networkId: string) => void;
  onActivateNetwork: (networkId: string) => void;
  onDeactivateNetwork: (networkId: string) => void;
  onMaintenanceNetwork: (networkId: string) => void;
  onRefresh: () => void;
  onSearch: (search: string) => void;
  onFilterByType: (type: NetworkType | '') => void;
  onFilterByStatus: (status: NetworkStatus | '') => void;
  onFilterByTestnet: (isTestnet: boolean | null) => void;
}

const NetworkList: React.FC<NetworkListProps> = ({
  networks,
  isLoading,
  totalNetworks,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onViewNetwork,
  onEditNetwork,
  onDeleteNetwork,
  onActivateNetwork,
  onDeactivateNetwork,
  onMaintenanceNetwork,
  onRefresh,
  onSearch,
  onFilterByType,
  onFilterByStatus,
  onFilterByTestnet
}) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [networkType, setNetworkType] = useState<NetworkType | ''>('');
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | ''>('');
  const [isTestnet, setIsTestnet] = useState<boolean | null>(null);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  const handleTypeFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as NetworkType | '';
    setNetworkType(value);
    onFilterByType(value);
  };
  
  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as NetworkStatus | '';
    setNetworkStatus(value);
    onFilterByStatus(value);
  };
  
  const handleTestnetFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const isTestnetValue = value === '' ? null : value === 'true';
    setIsTestnet(isTestnetValue);
    onFilterByTestnet(isTestnetValue);
  };
  
  const handleDelete = (network: Network) => {
    setSelectedNetwork(network);
    onOpen();
  };
  
  const confirmDelete = () => {
    if (selectedNetwork) {
      onDeleteNetwork(selectedNetwork.id);
      onClose();
    }
  };
  
  // 네트워크 상태에 따른 뱃지 색상 및 텍스트
  const getStatusBadge = (status: NetworkStatus) => {
    switch (status) {
      case NetworkStatus.ACTIVE:
        return (
          <Badge colorScheme="green" variant="subtle">
            {t('networks.active')}
          </Badge>
        );
      case NetworkStatus.INACTIVE:
        return (
          <Badge colorScheme="red" variant="subtle">
            {t('networks.inactive')}
          </Badge>
        );
      case NetworkStatus.MAINTENANCE:
        return (
          <Badge colorScheme="orange" variant="subtle">
            {t('networks.maintenance')}
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const columns = [
    {
      header: t('networks.name'),
      accessor: (network: Network) => (
        <Flex alignItems="center">
          {network.iconUrl && (
            <Image
              src={network.iconUrl}
              alt={network.name}
              boxSize="24px"
              mr={2}
              borderRadius="full"
              fallbackSrc="/network-placeholder.png"
            />
          )}
          <Box>
            <Box fontWeight="medium">{network.name}</Box>
            <Box fontSize="sm" color="gray.500">
              {network.isTestnet ? t('networks.testnet') : t('networks.mainnet')}
              {network.isDefaultNetwork && (
                <Badge ml={2} colorScheme="blue" variant="outline" fontSize="xs">
                  {t('networks.default')}
                </Badge>
              )}
            </Box>
          </Box>
        </Flex>
      ),
      width: '25%'
    },
    {
      header: t('networks.type'),
      accessor: (network: Network) => (
        <Badge
          colorScheme={
            network.type === NetworkType.CATENA || network.type === NetworkType.ZENITH
              ? 'brand'
              : 'gray'
          }
        >
          {network.type.toUpperCase()}
        </Badge>
      ),
      width: '15%'
    },
    {
      header: t('networks.chainId'),
      accessor: 'chainId',
      width: '15%'
    },
    {
      header: t('networks.status'),
      accessor: (network: Network) => getStatusBadge(network.status),
      width: '15%'
    },
    {
      header: t('networks.symbol'),
      accessor: 'symbol',
      width: '10%'
    },
    {
      header: t('networks.lastUpdated'),
      accessor: (network: Network) => formatDate(network.updatedAt),
      width: '20%'
    }
  ];
  
  return (
    <>
      <Card mb={6}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          wrap="wrap"
          gap={3}
        >
          <InputGroup maxW={{ base: '100%', md: '300px' }}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder={t('networks.search')}
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
          
          <HStack spacing={3} width={{ base: '100%', md: 'auto' }}>
            <Select
              placeholder={t('networks.allTypes')}
              value={networkType}
              onChange={handleTypeFilter}
              maxW="150px"
            >
              {Object.values(NetworkType).map((type) => (
                <option key={type} value={type}>
                  {type.toUpperCase()}
                </option>
              ))}
            </Select>
            
            <Select
              placeholder={t('networks.allStatuses')}
              value={networkStatus}
              onChange={handleStatusFilter}
              maxW="150px"
            >
              {Object.values(NetworkStatus).map((status) => (
                <option key={status} value={status}>
                  {t(`networks.${status.toLowerCase()}`)}
                </option>
              ))}
            </Select>
            
            <Select
              placeholder={t('networks.allNetworks')}
              value={isTestnet === null ? '' : String(isTestnet)}
              onChange={handleTestnetFilter}
              maxW="150px"
            >
              <option value="false">{t('networks.mainnet')}</option>
              <option value="true">{t('networks.testnet')}</option>
            </Select>
          </HStack>
        </Flex>
      </Card>
      
      <Table
        columns={columns}
        data={networks}
        keyField="id"
        isLoading={isLoading}
        totalItems={totalNetworks}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onRowClick={(network) => onViewNetwork(network.id)}
        onRefresh={onRefresh}
        actions={[
          {
            label: t('common.view'),
            icon: FiEye,
            onClick: (network) => onViewNetwork(network.id)
          },
          {
            label: t('common.edit'),
            icon: FiEdit,
            onClick: (network) => onEditNetwork(network.id)
          },
          {
            label:
              network => network.status === NetworkStatus.ACTIVE
                ? t('networks.deactivate')
                : t('networks.activate'),
            icon: FiPower,
            onClick: (network) =>
              network.status === NetworkStatus.ACTIVE
                ? onDeactivateNetwork(network.id)
                : onActivateNetwork(network.id)
          },
          {
            label: t('networks.maintenance'),
            icon: FiActivity,
            onClick: (network) => onMaintenanceNetwork(network.id),
            isDisabled: (network) => network.status === NetworkStatus.MAINTENANCE
          },
          {
            label: t('common.delete'),
            icon: FiTrash2,
            onClick: handleDelete,
            colorScheme: 'red'
          }
        ]}
      />
      
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('networks.deleteConfirmTitle')}
        onConfirm={confirmDelete}
        confirmText={t('common.delete')}
        confirmButtonProps={{ colorScheme: 'red' }}
      >
        {selectedNetwork && (
          <Box>
            {t('networks.deleteConfirmMessage', { name: selectedNetwork.name })}
          </Box>
        )}
      </Modal>
    </>
  );
};

export default NetworkList;
