import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Icon,
  Divider,
  VStack,
  Heading,
  HStack,
  useColorModeValue,
  Image,
  Tooltip
} from '@chakra-ui/react';
import {
  FiHome,
  FiUsers,
  FiLayers,
  FiBarChart2,
  FiSettings,
  FiFileText,
  FiLogOut
} from 'react-icons/fi';
import { useAuth } from '@/context';
import { useTranslation } from 'react-i18next';

interface NavItemProps {
  icon: React.ReactElement;
  children: React.ReactNode;
  to: string;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, children, to, isActive }) => {
  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.600', 'brand.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  
  return (
    <Link to={to} style={{ textDecoration: 'none', width: '100%' }}>
      <Flex
        align="center"
        p="3"
        mx="2"
        borderRadius="md"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : ''}
        fontWeight={isActive ? 'bold' : 'normal'}
        _hover={{
          bg: hoverBg
        }}
      >
        {icon}
        <Text ml="4">{children}</Text>
      </Flex>
    </Link>
  );
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const { t } = useTranslation();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  return (
    <Box
      position="fixed"
      left={0}
      p={5}
      w="250px"
      h="100vh"
      bg={bgColor}
      borderRight="1px"
      borderRightColor={borderColor}
      overflowY="auto"
      transition="all 0.3s"
      display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
      zIndex={20}
    >
      <Flex h="20" alignItems="center" justifyContent="center" mb={6}>
        <Image
          src="/logo.png"
          alt="TORI Wallet"
          height="40px"
          fallbackSrc="/logo-placeholder.png"
        />
        <Heading as="h1" fontSize="xl" ml={2}>
          TORI Admin
        </Heading>
      </Flex>
      
      <VStack spacing={1} align="stretch">
        <NavItem
          to="/"
          icon={<Icon as={FiHome} fontSize="xl" />}
          isActive={isActive('/')}
        >
          {t('common.dashboard')}
        </NavItem>
        
        <NavItem
          to="/users"
          icon={<Icon as={FiUsers} fontSize="xl" />}
          isActive={isActive('/users')}
        >
          {t('common.users')}
        </NavItem>
        
        <NavItem
          to="/networks"
          icon={<Icon as={FiLayers} fontSize="xl" />}
          isActive={isActive('/networks')}
        >
          {t('common.networks')}
        </NavItem>
        
        <NavItem
          to="/analytics"
          icon={<Icon as={FiBarChart2} fontSize="xl" />}
          isActive={isActive('/analytics')}
        >
          {t('common.analytics')}
        </NavItem>
        
        <NavItem
          to="/logs"
          icon={<Icon as={FiFileText} fontSize="xl" />}
          isActive={isActive('/logs')}
        >
          {t('common.logs')}
        </NavItem>
        
        <NavItem
          to="/settings"
          icon={<Icon as={FiSettings} fontSize="xl" />}
          isActive={isActive('/settings')}
        >
          {t('common.settings')}
        </NavItem>
      </VStack>
      
      <Divider my={6} borderColor={borderColor} />
      
      <Tooltip label={t('common.logout')} placement="right">
        <HStack
          spacing={4}
          cursor="pointer"
          p="3"
          mx="2"
          borderRadius="md"
          _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
          onClick={logout}
        >
          <Icon as={FiLogOut} fontSize="xl" />
          <Text>{t('common.logout')}</Text>
        </HStack>
      </Tooltip>
    </Box>
  );
};

export default Sidebar;
