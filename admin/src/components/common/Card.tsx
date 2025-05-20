import React from 'react';
import {
  Box,
  BoxProps,
  Heading,
  Text,
  useColorModeValue,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon
} from '@chakra-ui/react';
import { FiMoreVertical, FiEdit, FiTrash2, FiRefreshCw } from 'react-icons/fi';

export interface CardProps extends BoxProps {
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  hasShadow?: boolean;
  headerRight?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onRefresh?: () => void;
  actions?: Array<{
    label: string;
    icon?: React.ComponentType;
    onClick: () => void;
  }>;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  isLoading,
  hasShadow = true,
  headerRight,
  onEdit,
  onDelete,
  onRefresh,
  actions,
  children,
  ...rest
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const hasHeader = title || subtitle || headerRight || onEdit || onDelete || onRefresh || actions;

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      overflow="hidden"
      boxShadow={hasShadow ? 'sm' : 'none'}
      transition="all 0.2s"
      _hover={hasShadow ? { boxShadow: 'md' } : {}}
      {...rest}
    >
      {hasHeader && (
        <Flex
          p={4}
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor={borderColor}
        >
          <Box>
            {title && (
              <Heading as="h3" size="md">
                {title}
              </Heading>
            )}
            {subtitle && (
              <Text mt={1} fontSize="sm" color="gray.500">
                {subtitle}
              </Text>
            )}
          </Box>
          <Flex alignItems="center">
            {headerRight}
            {(onEdit || onDelete || onRefresh || actions) && (
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  variant="ghost"
                  aria-label="Options"
                  size="sm"
                  ml={2}
                />
                <MenuList>
                  {onEdit && (
                    <MenuItem icon={<FiEdit />} onClick={onEdit}>
                      편집
                    </MenuItem>
                  )}
                  {onRefresh && (
                    <MenuItem icon={<FiRefreshCw />} onClick={onRefresh}>
                      새로고침
                    </MenuItem>
                  )}
                  {actions &&
                    actions.map((action, index) => (
                      <MenuItem
                        key={index}
                        icon={action.icon ? <Icon as={action.icon} /> : undefined}
                        onClick={action.onClick}
                      >
                        {action.label}
                      </MenuItem>
                    ))}
                  {onDelete && (
                    <MenuItem icon={<FiTrash2 />} onClick={onDelete} color="red.500">
                      삭제
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            )}
          </Flex>
        </Flex>
      )}
      <Box p={4}>{children}</Box>
    </Box>
  );
};

export default Card;
