import React from 'react';
import {
  Table as ChakraTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Flex,
  Text,
  IconButton,
  Select,
  HStack,
  useColorModeValue,
  Skeleton,
  Icon,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  TableProps as ChakraTableProps
} from '@chakra-ui/react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiMoreVertical,
  FiRefreshCw
} from 'react-icons/fi';
import Button from './Button';
import { useTranslation } from 'react-i18next';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  isNumeric?: boolean;
  isSortable?: boolean;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  sortable?: boolean;
}

export interface TableAction<T> {
  label: string;
  icon?: React.ComponentType;
  onClick: (item: T) => void;
  isDisabled?: (item: T) => boolean;
  colorScheme?: string;
}

interface TableProps<T> extends Omit<ChakraTableProps, 'size'> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  isLoading?: boolean;
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  actions?: TableAction<T>[];
  onRowClick?: (item: T) => void;
  onRefresh?: () => void;
  emptyText?: string;
  size?: 'sm' | 'md' | 'lg';
}

function Table<T>({
  columns,
  data,
  keyField,
  isLoading = false,
  totalItems = 0,
  currentPage = 1,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  actions,
  onRowClick,
  onRefresh,
  emptyText = '데이터가 없습니다.',
  size = 'md',
  ...rest
}: TableProps<T>) {
  const { t } = useTranslation();
  const totalPages = Math.ceil(totalItems / pageSize);
  
  const headerBgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  
  // 페이지 번호 계산
  const pageNumbers = React.useMemo(() => {
    const maxPageButtons = 5;
    const pages = [];
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    if (endPage - startPage + 1 < maxPageButtons && startPage > 1) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }, [currentPage, totalPages]);
  
  // 아이템 렌더링 함수
  const renderCell = (item: T, column: Column<T>) => {
    const accessor = column.accessor;
    
    if (typeof accessor === 'function') {
      return accessor(item);
    }
    
    const value = item[accessor];
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'boolean') {
      return value ? (
        <Badge colorScheme="green">사용</Badge>
      ) : (
        <Badge colorScheme="red">미사용</Badge>
      );
    }
    
    return value;
  };
  
  return (
    <Box overflowX="auto" width="100%">
      <ChakraTable variant="simple" size={size} {...rest}>
        <Thead>
          <Tr bg={headerBgColor}>
            {columns.map((column, index) => (
              <Th
                key={index}
                isNumeric={column.isNumeric}
                width={column.width}
                minWidth={column.minWidth}
                maxWidth={column.maxWidth}
                borderColor={borderColor}
              >
                {column.header}
              </Th>
            ))}
            {actions && <Th width="80px" borderColor={borderColor}></Th>}
          </Tr>
        </Thead>
        <Tbody>
          {isLoading ? (
            Array.from({ length: pageSize }).map((_, rowIndex) => (
              <Tr key={`skeleton-${rowIndex}`}>
                {columns.map((_, colIndex) => (
                  <Td key={`skeleton-${rowIndex}-${colIndex}`} borderColor={borderColor}>
                    <Skeleton height="20px" />
                  </Td>
                ))}
                {actions && (
                  <Td borderColor={borderColor}>
                    <Skeleton height="20px" width="80px" />
                  </Td>
                )}
              </Tr>
            ))
          ) : data.length === 0 ? (
            <Tr>
              <Td colSpan={columns.length + (actions ? 1 : 0)} textAlign="center" py={10} borderColor={borderColor}>
                <Text fontSize="lg" fontWeight="medium" color="gray.500">
                  {emptyText}
                </Text>
              </Td>
            </Tr>
          ) : (
            data.map((item) => (
              <Tr
                key={String(item[keyField])}
                _hover={onRowClick ? { bg: hoverBgColor, cursor: 'pointer' } : {}}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                borderColor={borderColor}
              >
                {columns.map((column, colIndex) => (
                  <Td
                    key={`${String(item[keyField])}-${colIndex}`}
                    isNumeric={column.isNumeric}
                    borderColor={borderColor}
                  >
                    {renderCell(item, column)}
                  </Td>
                ))}
                {actions && (
                  <Td borderColor={borderColor} onClick={(e) => e.stopPropagation()}>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                        aria-label="Actions"
                      />
                      <MenuList>
                        {actions.map((action, actionIndex) => (
                          <MenuItem
                            key={actionIndex}
                            icon={action.icon ? <Icon as={action.icon} /> : undefined}
                            onClick={() => action.onClick(item)}
                            isDisabled={action.isDisabled ? action.isDisabled(item) : false}
                            color={action.colorScheme ? `${action.colorScheme}.500` : undefined}
                          >
                            {action.label}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </Td>
                )}
              </Tr>
            ))
          )}
        </Tbody>
      </ChakraTable>

      {/* 페이지네이션 */}
      {totalPages > 0 && onPageChange && (
        <Flex justify="space-between" align="center" mt={4} wrap="wrap" gap={2}>
          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.500">
              {t('common.total', { count: totalItems })}
            </Text>
            {onRefresh && (
              <IconButton
                icon={<FiRefreshCw />}
                aria-label="Refresh"
                size="sm"
                variant="ghost"
                onClick={onRefresh}
                ml={2}
              />
            )}
          </HStack>
          
          <HStack spacing={2}>
            <HStack spacing={1}>
              <IconButton
                icon={<FiChevronsLeft />}
                aria-label="First page"
                size="sm"
                isDisabled={currentPage === 1 || isLoading}
                onClick={() => onPageChange(1)}
              />
              <IconButton
                icon={<FiChevronLeft />}
                aria-label="Previous page"
                size="sm"
                isDisabled={currentPage === 1 || isLoading}
                onClick={() => onPageChange(currentPage - 1)}
              />
              
              {pageNumbers.map((page) => (
                <Button
                  key={page}
                  size="sm"
                  variant={page === currentPage ? 'solid' : 'outline'}
                  colorScheme={page === currentPage ? 'brand' : 'gray'}
                  onClick={() => onPageChange(page)}
                  isDisabled={isLoading}
                >
                  {page}
                </Button>
              ))}
              
              <IconButton
                icon={<FiChevronRight />}
                aria-label="Next page"
                size="sm"
                isDisabled={currentPage === totalPages || isLoading}
                onClick={() => onPageChange(currentPage + 1)}
              />
              <IconButton
                icon={<FiChevronsRight />}
                aria-label="Last page"
                size="sm"
                isDisabled={currentPage === totalPages || isLoading}
                onClick={() => onPageChange(totalPages)}
              />
            </HStack>
            
            {onPageSizeChange && (
              <Select
                size="sm"
                width="100px"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                ml={4}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} {t('common.rows')}
                  </option>
                ))}
              </Select>
            )}
          </HStack>
        </Flex>
      )}
    </Box>
  );
}

export default Table;
