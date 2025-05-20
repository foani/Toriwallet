import React from 'react';
import {
  Box,
  Flex,
  IconButton,
  useColorMode,
  useColorModeValue,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  HStack,
  Select,
  Badge
} from '@chakra-ui/react';
import { FiMenu, FiMoon, FiSun, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth, useTheme, useLanguage } from '@/context';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onSidebarToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const { setLanguage, language, supportedLanguages } = useLanguage();
  const { t } = useTranslation();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };
  
  return (
    <Box
      px={4}
      height="60px"
      bg={bgColor}
      borderBottom="1px"
      borderBottomColor={borderColor}
      position="fixed"
      w="100%"
      zIndex="10"
    >
      <Flex h="100%" alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onSidebarToggle}
            variant="ghost"
            aria-label="menu"
            icon={<FiMenu />}
            size="lg"
          />
        </Flex>

        <HStack spacing={4}>
          <Select
            value={language}
            onChange={handleLanguageChange}
            variant="filled"
            size="sm"
            w="120px"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </Select>

          <IconButton
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
            aria-label="Toggle color mode"
          />

          <Menu>
            <MenuButton>
              <HStack spacing={2}>
                <Avatar
                  size="sm"
                  name={user ? `${user.firstName} ${user.lastName}` : undefined}
                />
                <Box display={{ base: 'none', md: 'block' }}>
                  {user && (
                    <Flex direction="column" alignItems="flex-start">
                      <Text fontWeight="medium">
                        {user.firstName} {user.lastName}
                      </Text>
                      <Badge size="sm" colorScheme="brand">
                        {user.role}
                      </Badge>
                    </Flex>
                  )}
                </Box>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiUser />}>{t('common.profile')}</MenuItem>
              <MenuItem icon={<FiSettings />}>{t('common.settings')}</MenuItem>
              <MenuDivider />
              <MenuItem icon={<FiLogOut />} onClick={logout}>
                {t('common.logout')}
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
