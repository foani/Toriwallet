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
  Avatar,
  AvatarBadge,
  useColorModeValue
} from '@chakra-ui/react';
import { FiSearch, FiEdit, FiTrash2, FiPlus, FiKey, FiEye, FiUserX, FiUserCheck } from 'react-icons/fi';
import { User, UserRole, UserStatus } from '@/types';
import { Table, Card, Modal, Button } from '@/components/common';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/format';

interface UserListProps {
  users: User[];
  isLoading: boolean;
  totalUsers: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onViewUser: (userId: string) => void;
  onEditUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onActivateUser: (userId: string) => void;
  onDeactivateUser: (userId: string) => void;
  onResetPassword: (userId: string) => void;
  onRefresh: () => void;
  onSearch: (search: string) => void;
  onFilterByRole: (role: UserRole | '') => void;
  onFilterByStatus: (status: UserStatus | '') => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  isLoading,
  totalUsers,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onActivateUser,
  onDeactivateUser,
  onResetPassword,
  onRefresh,
  onSearch,
  onFilterByRole,
  onFilterByStatus
}) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<UserRole | ''>('');
  const [userStatus, setUserStatus] = useState<UserStatus | ''>('');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  const handleRoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as UserRole | '';
    setUserRole(value);
    onFilterByRole(value);
  };
  
  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as UserStatus | '';
    setUserStatus(value);
    onFilterByStatus(value);
  };
  
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    onOpen();
  };
  
  const confirmDelete = () => {
    if (selectedUser) {
      onDeleteUser(selectedUser.id);
      onClose();
    }
  };
  
  // 사용자 상태에 따른 뱃지 색상 및 텍스트
  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return (
          <Badge colorScheme="green" variant="subtle">
            {t('users.active')}
          </Badge>
        );
      case UserStatus.INACTIVE:
        return (
          <Badge colorScheme="red" variant="subtle">
            {t('users.inactive')}
          </Badge>
        );
      case UserStatus.SUSPENDED:
        return (
          <Badge colorScheme="orange" variant="subtle">
            {t('users.suspended')}
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // 사용자 역할에 따른 뱃지 색상 및 텍스트
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <Badge colorScheme="red" variant="subtle">
            {t('users.admin')}
          </Badge>
        );
      case UserRole.MANAGER:
        return (
          <Badge colorScheme="purple" variant="subtle">
            {t('users.manager')}
          </Badge>
        );
      case UserRole.VIEWER:
        return (
          <Badge colorScheme="blue" variant="subtle">
            {t('users.viewer')}
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const columns = [
    {
      header: t('users.user'),
      accessor: (user: User) => (
        <Flex alignItems="center">
          <Avatar
            size="sm"
            name={`${user.firstName} ${user.lastName}`}
            src={user.profileImageUrl}
            mr={3}
          >
            {user.status === UserStatus.ACTIVE && (
              <AvatarBadge boxSize="1.25em" bg="green.500" />
            )}
          </Avatar>
          <Box>
            <Box fontWeight="medium">
              {user.firstName} {user.lastName}
            </Box>
            <Box fontSize="sm" color="gray.500">
              {user.email}
            </Box>
          </Box>
        </Flex>
      ),
      width: '30%'
    },
    {
      header: t('users.role'),
      accessor: (user: User) => getRoleBadge(user.role),
      width: '15%'
    },
    {
      header: t('users.status'),
      accessor: (user: User) => getStatusBadge(user.status),
      width: '15%'
    },
    {
      header: t('users.twoFactor'),
      accessor: (user: User) => (
        <Badge colorScheme={user.twoFactorEnabled ? 'green' : 'gray'} variant="outline">
          {user.twoFactorEnabled ? t('common.enabled') : t('common.disabled')}
        </Badge>
      ),
      width: '15%'
    },
    {
      header: t('users.lastLogin'),
      accessor: (user: User) =>
        user.lastLogin ? formatDate(user.lastLogin) : t('users.neverLoggedIn'),
      width: '25%'
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
              placeholder={t('users.search')}
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
          
          <HStack spacing={3} width={{ base: '100%', md: 'auto' }}>
            <Select
              placeholder={t('users.allRoles')}
              value={userRole}
              onChange={handleRoleFilter}
              maxW="150px"
            >
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {t(`users.${role.toLowerCase()}`)}
                </option>
              ))}
            </Select>
            
            <Select
              placeholder={t('users.allStatuses')}
              value={userStatus}
              onChange={handleStatusFilter}
              maxW="150px"
            >
              {Object.values(UserStatus).map((status) => (
                <option key={status} value={status}>
                  {t(`users.${status.toLowerCase()}`)}
                </option>
              ))}
            </Select>
          </HStack>
        </Flex>
      </Card>
      
      <Table
        columns={columns}
        data={users}
        keyField="id"
        isLoading={isLoading}
        totalItems={totalUsers}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onRowClick={(user) => onViewUser(user.id)}
        onRefresh={onRefresh}
        actions={[
          {
            label: t('common.view'),
            icon: FiEye,
            onClick: (user) => onViewUser(user.id)
          },
          {
            label: t('common.edit'),
            icon: FiEdit,
            onClick: (user) => onEditUser(user.id)
          },
          {
            label: t('users.resetPassword'),
            icon: FiKey,
            onClick: (user) => onResetPassword(user.id)
          },
          {
            label:
              user => user.status === UserStatus.ACTIVE
                ? t('users.deactivate')
                : t('users.activate'),
            icon: user => user.status === UserStatus.ACTIVE ? FiUserX : FiUserCheck,
            onClick: (user) =>
              user.status === UserStatus.ACTIVE
                ? onDeactivateUser(user.id)
                : onActivateUser(user.id)
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
        title={t('users.deleteConfirmTitle')}
        onConfirm={confirmDelete}
        confirmText={t('common.delete')}
        confirmButtonProps={{ colorScheme: 'red' }}
      >
        {selectedUser && (
          <Box>
            {t('users.deleteConfirmMessage', { name: `${selectedUser.firstName} ${selectedUser.lastName}` })}
          </Box>
        )}
      </Modal>
    </>
  );
};

export default UserList;
