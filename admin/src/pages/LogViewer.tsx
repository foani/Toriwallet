import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { FiDownload, FiChevronDown } from 'react-icons/fi';
import { useLogs } from '@/hooks';
import { LogFilter, LogTable, LogDetails } from '@/components/logs';
import { LogEntry } from '@/services/logs';
import { useTranslation } from 'react-i18next';

const LogViewer: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  
  const {
    logs,
    total,
    page,
    limit,
    filters,
    sources,
    loading,
    fetchLogs,
    changePage,
    changeLimit,
    applyFilters,
    resetFilters,
    exportLogs
  } = useLogs();
  
  const handleViewDetails = (log: LogEntry) => {
    setSelectedLog(log);
    onOpen();
  };
  
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      await exportLogs(format);
      toast({
        title: t('logs.exportSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Failed to export logs:', error);
      toast({
        title: t('logs.exportError'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
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
            {t('logs.title')}
          </Heading>
          <Text color="gray.500">{t('logs.subtitle')}</Text>
        </Box>
        
        <Menu>
          <MenuButton
            as={Button}
            leftIcon={<FiDownload />}
            rightIcon={<FiChevronDown />}
          >
            {t('logs.export')}
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleExport('csv')}>CSV</MenuItem>
            <MenuItem onClick={() => handleExport('json')}>JSON</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      
      <LogFilter
        filters={filters}
        sources={sources}
        onApplyFilters={applyFilters}
        onResetFilters={resetFilters}
        isLoading={loading}
      />
      
      <LogTable
        logs={logs}
        isLoading={loading}
        totalLogs={total}
        currentPage={page}
        pageSize={limit}
        onPageChange={changePage}
        onPageSizeChange={changeLimit}
        onViewDetails={handleViewDetails}
        onRefresh={fetchLogs}
      />
      
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalBody py={6}>
            {selectedLog && <LogDetails log={selectedLog} onClose={onClose} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LogViewer;
