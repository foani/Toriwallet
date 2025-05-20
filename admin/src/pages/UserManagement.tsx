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
  IconButton,
  useToast
} from '@chakra-ui/react';
import { FiPlus, FiArrowLeft } from 'react-icons/fi';
import { useUsers } from '@/hooks';
import { UserList, UserDetails, UserForm } from '@/components/users';
import { Card, Loading, Modal } from '@/components/common';
import { UserRole, UserStatus, UserCreateRequest, UserUpdateRequest } from '@/types';
import { useTranslation } from 'react-i18next';

const UserListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    users,
    total,
    loading,
    page,
    limit,
    filters,
    fetchUsers,
    changePage,
    changeLimit,
    applyFilters,
    resetFilters,
    deleteUser
  } = useUsers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const handleSearch = (search: string) => {
    setSearchTerm(search);
    applyFilters({ ...filters, search });
  };
  
  const handleFilterByRole = (role: UserRole | '') => {
    applyFilters({ ...filters, role: role || undefined });
  };
  
  const handleFilterByStatus = (status: UserStatus | '') => {
    applyFilters({ ...filters, status: status || undefined });
  };
  
  const handleViewUser = (userId: string) => {
    navigate(`/users/view/${userId}`);
  };
  
  const handleEditUser = (userId: string) => {
    navigate(`/users/edit/${userId}`);
  };
  
  const handleDeleteUserClick = (userId: string) => {
    setSelectedUserId(userId);
    onOpen();
  };
  
  const handleDeleteUserConfirm = async () => {
    if (selectedUserId) {
      try {
        await deleteUser(selectedUserId);
        toast({
          title: t('users.deleteSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true
        });
        onClose();
      } catch (error) {
        console.error('Failed to delete user:', error);
        toast({
          title: t('users.deleteError'),
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      }
    }
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
            {t('users.title')}
          </Heading>
          <Text color="gray.500">{t('users.subtitle')}</Text>
        </Box>
        
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={() => navigate('/users/create')}
        >
          {t('users.addUser')}
        </Button>
      </Flex>
      
      <UserList
        users={users}
        isLoading={loading}
        totalUsers={total}
        currentPage={page}
        pageSize={limit}
        onPageChange={changePage}
        onPageSizeChange={changeLimit}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUserClick}
        onActivateUser={(id) => console.log('Activate user:', id)}
        onDeactivateUser={(id) => console.log('Deactivate user:', id)}
        onResetPassword={(id) => console.log('Reset password for user:', id)}
        onRefresh={fetchUsers}
        onSearch={handleSearch}
        onFilterByRole={handleFilterByRole}
        onFilterByStatus={handleFilterByStatus}
      />
      
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('users.deleteConfirmTitle')}
        onConfirm={handleDeleteUserConfirm}
        confirmText={t('common.delete')}
        confirmButtonProps={{ colorScheme: 'red' }}
      >
        <Text>{t('users.deleteConfirmMessage', { name: 'this user' })}</Text>
      </Modal>
    </Box>
  );
};

const UserCreatePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, createUser } = useUsers();
  
  const handleSubmit = async (values: UserCreateRequest) => {
    try {
      await createUser(values);
      toast({
        title: t('users.createSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      navigate('/users');
    } catch (error) {
      console.error('Failed to create user:', error);
      toast({
        title: t('users.createError'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <IconButton
          icon={<FiArrowLeft />}
          aria-label="Back"
          variant="ghost"
          onClick={() => navigate('/users')}
          mr={4}
        />
        <Box>
          <Breadcrumb fontSize="sm" mb={2}>
            <BreadcrumbItem>
              <BreadcrumbLink href="/users">{t('users.title')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{t('users.createUser')}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Heading as="h1" size="lg">
            {t('users.createUser')}
          </Heading>
        </Box>
      </Flex>
      
      <Card>
        <UserForm onSubmit={handleSubmit} isLoading={loading} />
      </Card>
    </Box>
  );
};

const UserEditPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const userId = location.pathname.split('/').pop() || '';
  const { loading, selectedUser, updateUser, selectUser } = useUsers();
  
  React.useEffect(() => {
    if (userId) {
      selectUser(userId);
    }
  }, [userId, selectUser]);
  
  const handleSubmit = async (values: UserUpdateRequest) => {
    try {
      await updateUser(userId, values);
      toast({
        title: t('users.updateSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      navigate('/users');
    } catch (error) {
      console.error('Failed to update user:', error);
      toast({
        title: t('users.updateError'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  if (loading || !selectedUser) {
    return <Loading height="300px" text={t('common.loading')} />;
  }
  
  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <IconButton
          icon={<FiArrowLeft />}
          aria-label="Back"
          variant="ghost"
          onClick={() => navigate('/users')}
          mr={4}
        />
        <Box>
          <Breadcrumb fontSize="sm" mb={2}>
            <BreadcrumbItem>
              <BreadcrumbLink href="/users">{t('users.title')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{t('users.editUser')}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Heading as="h1" size="lg">
            {t('users.editUser')}
          </Heading>
        </Box>
      </Flex>
      
      <Card>
        <UserForm
          user={selectedUser}
          onSubmit={handleSubmit}
          isLoading={loading}
          isEdit
        />
      </Card>
    </Box>
  );
};

const UserViewPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const userId = location.pathname.split('/').pop() || '';
  const {
    loading,
    selectedUser,
    selectUser,
    activateUser,
    deactivateUser,
    resetUserPassword
  } = useUsers();
  
  React.useEffect(() => {
    if (userId) {
      selectUser(userId);
    }
  }, [userId, selectUser]);
  
  const handleActivate = async () => {
    try {
      await activateUser(userId);
      toast({
        title: t('users.activateSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Failed to activate user:', error);
      toast({
        title: t('users.activateError'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  const handleDeactivate = async () => {
    try {
      await deactivateUser(userId);
      toast({
        title: t('users.deactivateSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      toast({
        title: t('users.deactivateError'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  const handleResetPassword = async () => {
    try {
      await resetUserPassword(userId);
      toast({
        title: t('users.resetPasswordSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Failed to reset user password:', error);
      toast({
        title: t('users.resetPasswordError'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  if (loading || !selectedUser) {
    return <Loading height="300px" text={t('common.loading')} />;
  }
  
  return (
    <Box>
      <Flex alignItems="center" mb={6}>
        <IconButton
          icon={<FiArrowLeft />}
          aria-label="Back"
          variant="ghost"
          onClick={() => navigate('/users')}
          mr={4}
        />
        <Box>
          <Breadcrumb fontSize="sm" mb={2}>
            <BreadcrumbItem>
              <BreadcrumbLink href="/users">{t('users.title')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>
                {selectedUser.firstName} {selectedUser.lastName}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Heading as="h1" size="lg">
            {t('users.userDetails')}
          </Heading>
        </Box>
      </Flex>
      
      <UserDetails
        user={selectedUser}
        isLoading={loading}
        onEdit={() => navigate(`/users/edit/${userId}`)}
        onResetPassword={handleResetPassword}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
      />
    </Box>
  );
};

const UserManagement: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<UserListPage />} />
      <Route path="/create" element={<UserCreatePage />} />
      <Route path="/edit/:id" element={<UserEditPage />} />
      <Route path="/view/:id" element={<UserViewPage />} />
    </Routes>
  );
};

export default UserManagement;
