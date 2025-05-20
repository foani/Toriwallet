import React from 'react';
import {
  Box,
  Badge,
  Text,
  Flex,
  useColorModeValue,
  Tooltip
} from '@chakra-ui/react';
import { LogEntry, LogLevel } from '@/services/logs';
import { Table } from '@/components/common';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '@/utils/format';

interface LogTableProps {
  logs: LogEntry[];
  isLoading: boolean;
  totalLogs: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onViewDetails: (log: LogEntry) => void;
  onRefresh: () => void;
}

const LogTable: React.FC<LogTableProps> = ({
  logs,
  isLoading,
  totalLogs,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onViewDetails,
  onRefresh
}) => {
  const { t } = useTranslation();
  
  // 로그 레벨에 따른 뱃지 색상 및 텍스트
  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG:
        return (
          <Badge colorScheme="gray">
            {t('logs.levels.debug')}
          </Badge>
        );
      case LogLevel.INFO:
        return (
          <Badge colorScheme="blue">
            {t('logs.levels.info')}
          </Badge>
        );
      case LogLevel.WARN:
        return (
          <Badge colorScheme="yellow">
            {t('logs.levels.warn')}
          </Badge>
        );
      case LogLevel.ERROR:
        return (
          <Badge colorScheme="red">
            {t('logs.levels.error')}
          </Badge>
        );
      case LogLevel.CRITICAL:
        return (
          <Badge colorScheme="purple">
            {t('logs.levels.critical')}
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // 테이블 컬럼 정의
  const columns = [
    {
      header: t('logs.timestamp'),
      accessor: (log: LogEntry) => formatDateTime(log.timestamp),
      width: '15%'
    },
    {
      header: t('logs.level'),
      accessor: (log: LogEntry) => getLevelBadge(log.level),
      width: '10%'
    },
    {
      header: t('logs.source'),
      accessor: (log: LogEntry) => log.source,
      width: '15%'
    },
    {
      header: t('logs.message'),
      accessor: (log: LogEntry) => (
        <Tooltip label={log.message} placement="top-start" hasArrow>
          <Text isTruncated maxW="100%">
            {log.message}
          </Text>
        </Tooltip>
      ),
      width: '45%'
    },
    {
      header: t('logs.user'),
      accessor: (log: LogEntry) => log.userEmail || t('logs.system'),
      width: '15%'
    }
  ];
  
  return (
    <Table
      columns={columns}
      data={logs}
      keyField="id"
      isLoading={isLoading}
      totalItems={totalLogs}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onViewDetails}
      onRefresh={onRefresh}
      emptyStateMessage={t('logs.noLogsFound')}
    />
  );
};

export default LogTable;
