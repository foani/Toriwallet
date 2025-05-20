import { useState, useEffect, useCallback } from 'react';
import {
  User,
  UserCreateRequest,
  UserFilters,
  UserUpdateRequest,
  PaginatedUsersResponse
} from '@/types';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser
} from '@/services/users';
import { useNotification } from '@/context';

export const useUsers = (initialPage: number = 1, initialLimit: number = 10) => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [filters, setFilters] = useState<UserFilters>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { showNotification } = useNotification();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response: PaginatedUsersResponse = await getUsers(page, limit, filters);
      setUsers(response.users);
      setTotal(response.total);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '사용자 목록 조회 실패', 
          description: error.message 
        });
      } else {
        setError('사용자 목록을 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '사용자 목록 조회 실패', 
          description: '사용자 목록을 가져오는 중 오류가 발생했습니다.' 
        });
      }
    }
  }, [page, limit, filters, showNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSelectUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await getUserById(userId);
      setSelectedUser(user);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '사용자 정보 조회 실패', 
          description: error.message 
        });
      } else {
        setError('사용자 정보를 가져오는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '사용자 정보 조회 실패', 
          description: '사용자 정보를 가져오는 중 오류가 발생했습니다.' 
        });
      }
    }
  };

  const handleCreateUser = async (userData: UserCreateRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const newUser = await createUser(userData);
      setUsers((prevUsers) => [...prevUsers, newUser]);
      setTotal((prevTotal) => prevTotal + 1);
      setLoading(false);
      showNotification('success', { 
        title: '사용자 생성 성공', 
        description: '새 사용자가 생성되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '사용자 생성 실패', 
          description: error.message 
        });
      } else {
        setError('사용자를 생성하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '사용자 생성 실패', 
          description: '사용자를 생성하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleUpdateUser = async (userId: string, userData: UserUpdateRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await updateUser(userId, userData);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? updatedUser : user))
      );
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(updatedUser);
      }
      
      setLoading(false);
      showNotification('success', { 
        title: '사용자 업데이트 성공', 
        description: '사용자 정보가 업데이트되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '사용자 업데이트 실패', 
          description: error.message 
        });
      } else {
        setError('사용자 정보를 업데이트하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '사용자 업데이트 실패', 
          description: '사용자 정보를 업데이트하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteUser(userId);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      setTotal((prevTotal) => prevTotal - 1);
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(null);
      }
      
      setLoading(false);
      showNotification('success', { 
        title: '사용자 삭제 성공', 
        description: '사용자가 삭제되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '사용자 삭제 실패', 
          description: error.message 
        });
      } else {
        setError('사용자를 삭제하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '사용자 삭제 실패', 
          description: '사용자를 삭제하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleActivateUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await activateUser(userId);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? updatedUser : user))
      );
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(updatedUser);
      }
      
      setLoading(false);
      showNotification('success', { 
        title: '사용자 활성화 성공', 
        description: '사용자가 활성화되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '사용자 활성화 실패', 
          description: error.message 
        });
      } else {
        setError('사용자를 활성화하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '사용자 활성화 실패', 
          description: '사용자를 활성화하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await deactivateUser(userId);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? updatedUser : user))
      );
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(updatedUser);
      }
      
      setLoading(false);
      showNotification('success', { 
        title: '사용자 비활성화 성공', 
        description: '사용자가 비활성화되었습니다.' 
      });
      return true;
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setError(error.message);
        showNotification('error', { 
          title: '사용자 비활성화 실패', 
          description: error.message 
        });
      } else {
        setError('사용자를 비활성화하는 중 오류가 발생했습니다.');
        showNotification('error', { 
          title: '사용자 비활성화 실패', 
          description: '사용자를 비활성화하는 중 오류가 발생했습니다.' 
        });
      }
      return false;
    }
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeLimit = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // 페이지 크기가 변경되면 첫 페이지로 이동
  };

  const handleApplyFilters = (newFilters: UserFilters) => {
    setFilters(newFilters);
    setPage(1); // 필터가 변경되면 첫 페이지로 이동
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  return {
    users,
    total,
    page,
    limit,
    filters,
    loading,
    error,
    selectedUser,
    fetchUsers,
    selectUser: handleSelectUser,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    activateUser: handleActivateUser,
    deactivateUser: handleDeactivateUser,
    changePage: handleChangePage,
    changeLimit: handleChangeLimit,
    applyFilters: handleApplyFilters,
    resetFilters: handleResetFilters
  };
};
