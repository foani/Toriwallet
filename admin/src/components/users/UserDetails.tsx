import React from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Divider,
  Grid,
  GridItem,
  Avatar,
  HStack,
  Stack,
  useColorModeValue
} from '@chakra-ui/react';
import { User, UserRole, UserStatus } from '@/types';
import { Card, Button } from '@/components/common';
import { FiEdit, FiKey, FiUserCheck, FiUserX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/format';

interface UserDetailsProps {
  user: User;
  isLoading?: boolean;
  onEdit: () => void;
  onResetPassword: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({
  user,
  isLoading,
  onEdit,
  onResetPassword,
  onActivate,
  onDeactivate
}) => {
  const { t } = useTranslation();
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  
  // 사용자 상태에 따른 뱃지 색상 및 텍스트
  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return (
          <Badge colorScheme="green" fontSize="sm">
            {t('users.active')}
          </Badge>
        );
      case UserStatus.INACTIVE:
        return (
          <Badge colorScheme="red" fontSize="sm">
            {t('users.inactive')}
          </Badge>
        );
      case UserStatus.SUSPENDED:
        return (
          <Badge colorScheme="orange" fontSize="sm">
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
          <Badge colorScheme="red" fontSize="sm">
            {t('users.admin')}
          </Badge>
        );
      case UserRole.MANAGER:
        return (
          <Badge colorScheme="purple" fontSize="sm">
            {t('users.manager')}
          </Badge>
        );
      case UserRole.VIEWER:
        return (
          <Badge colorScheme="blue" fontSize="sm">
            {t('users.viewer')}
          </Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card isLoading={isLoading}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        mb={6}
      >
        <Flex align="center">
          <Avatar
            size="xl"
            name={`${user.firstName} ${user.lastName}`}
            src={user.profileImageUrl}
            mr={4}
          />
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              {user.firstName} {user.lastName}
            </Text>
            <Text color={labelColor}>{user.email}</Text>
            <HStack mt={2} spacing={2}>
              {getRoleBadge(user.role)}
              {getStatusBadge(user.status)}
              <Badge
                colorScheme={user.twoFactorEnabled ? 'green' : 'gray'}
                variant="outline"
                fontSize="sm"
              >
                {user.twoFactorEnabled ? t('common.enabled') : t('common.disabled')}
              </Badge>
            </HStack>
          </Box>
        </Flex>
        
        <Stack
          direction={{ base: 'column', sm: 'row' }}
          spacing={2}
          mt={{ base: 4, md: 0 }}
        >
          <Button
            leftIcon={<FiEdit />}
            onClick={onEdit}
            variant="outline"
          >
            {t('common.edit')}
          </Button>
          <Button
            leftIcon={<FiKey />}
            onClick={onResetPassword}
            variant="outline"
          >
            {t('users.resetPassword')}
          </Button>
          {user.status === UserStatus.ACTIVE ? (
            <Button
              leftIcon={<FiUserX />}
              onClick={onDeactivate}
              colorScheme="red"
              variant="outline"
            >
              {t('users.deactivate')}
            </Button>
          ) : (
            <Button
              leftIcon={<FiUserCheck />}
              onClick={onActivate}
              colorScheme="green"
              variant="outline"
            >
              {t('users.activate')}
            </Button>
          )}
        </Stack>
      </Flex>
      
      <Divider mb={6} />
      
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        {t('users.userDetails')}
      </Text>
      
      <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={6}>
        <GridItem>
          <Box>
            <Text fontWeight="medium">{t('users.id')}</Text>
            <Text>{user.id}</Text>
          </Box>
        </GridItem>
        
        <GridItem>
          <Box>
            <Text fontWeight="medium">{t('users.email')}</Text>
            <Text>{user.email}</Text>
          </Box>
        </GridItem>
        
        <GridItem>
          <Box>
            <Text fontWeight="medium">{t('users.firstName')}</Text>
            <Text>{user.firstName}</Text>
          </Box>
        </GridItem>
        
        <GridItem>
          <Box>
            <Text fontWeight="medium">{t('users.lastName')}</Text>
            <Text>{user.lastName}</Text>
          </Box>
        </GridItem>
        
        <GridItem>
          <Box>
            <Text fontWeight="medium">{t('users.role')}</Text>
            <Text>{t(`users.${user.role.toLowerCase()}`)}</Text>
          </Box>
        </GridItem>
        
        <GridItem>
          <Box>
            <Text fontWeight="medium">{t('users.status')}</Text>
            <Text>{t(`users.${user.status.toLowerCase()}`)}</Text>
          </Box>
        </GridItem>
        
        <GridItem>
          <Box>
            <Text fontWeight="medium">{t('users.twoFactorEnabled')}</Text>
            <Text>
              {user.twoFactorEnabled ? t('common.enabled') : t('common.disabled')}
            </Text>
          </Box>
        </GridItem>
        
        <GridItem>
          <Box>
            <Text fontWeight="medium">{t('users.lastLogin')}</Text>
            <Text>
              {user.lastLogin ? formatDate(user.lastLogin) : t('users.neverLoggedIn')}
            </Text>
          </Box>
        </GridItem>
        
        <GridItem>
          <Box>
            <Text fontWeight="medium">{t('users.createdAt')}</Text>
            <Text>{formatDate(user.createdAt)}</Text>
          </Box>
        </GridItem>
        
        <GridItem>
          <Box>
            <Text fontWeight="medium">{t('users.updatedAt')}</Text>
            <Text>{formatDate(user.updatedAt)}</Text>
          </Box>
        </GridItem>
      </Grid>
      
      {user.permissions && user.permissions.length > 0 && (
        <>
          <Divider my={6} />
          
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            {t('users.permissions')}
          </Text>
          
          <Flex wrap="wrap" gap={2}>
            {user.permissions.map((permission) => (
              <Badge key={permission} colorScheme="brand" p={2} borderRadius="md">
                {permission}
              </Badge>
            ))}
          </Flex>
        </>
      )}
    </Card>
  );
};

export default UserDetails;
