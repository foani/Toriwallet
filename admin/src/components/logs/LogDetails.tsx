import React from 'react';
import {
  Box,
  Flex,
  Text,
  Badge,
  Divider,
  VStack,
  HStack,
  SimpleGrid,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Code,
  Button
} from '@chakra-ui/react';
import { LogEntry, LogLevel } from '@/services/logs';
import { Card } from '@/components/common';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '@/utils/format';
import { MdContentCopy } from 'react-icons/md';

interface LogDetailsProps {
  log: LogEntry;
  onClose: () => void;
}

const LogDetails: React.FC<LogDetailsProps> = ({ log, onClose }) => {
  const { t } = useTranslation();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const codeBg = useColorModeValue('gray.50', 'gray.800');
  
  // 로그 레벨에 따른 뱃지 색상 및 텍스트
  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG:
        return (
          <Badge colorScheme="gray" fontSize="md" px={2} py={1}>
            {t('logs.levels.debug')}
          </Badge>
        );
      case LogLevel.INFO:
        return (
          <Badge colorScheme="blue" fontSize="md" px={2} py={1}>
            {t('logs.levels.info')}
          </Badge>
        );
      case LogLevel.WARN:
        return (
          <Badge colorScheme="yellow" fontSize="md" px={2} py={1}>
            {t('logs.levels.warn')}
          </Badge>
        );
      case LogLevel.ERROR:
        return (
          <Badge colorScheme="red" fontSize="md" px={2} py={1}>
            {t('logs.levels.error')}
          </Badge>
        );
      case LogLevel.CRITICAL:
        return (
          <Badge colorScheme="purple" fontSize="md" px={2} py={1}>
            {t('logs.levels.critical')}
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <Card>
      <VStack align="stretch" spacing={6}>
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={3}
        >
          <HStack>
            {getLevelBadge(log.level)}
            <Text fontSize="lg" fontWeight="bold">
              {log.source}
            </Text>
          </HStack>
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
        </Flex>
        
        <Divider borderColor={borderColor} />
        
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={3}>
            {t('logs.message')}
          </Text>
          <Text whiteSpace="pre-wrap">{log.message}</Text>
        </Box>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
              {t('logs.timestamp')}
            </Text>
            <Text>{formatDateTime(log.timestamp)}</Text>
          </Box>
          
          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
              {t('logs.id')}
            </Text>
            <Text>{log.id}</Text>
          </Box>
          
          {log.userId && (
            <Box>
              <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
                {t('logs.userId')}
              </Text>
              <Text>{log.userId}</Text>
            </Box>
          )}
          
          {log.userEmail && (
            <Box>
              <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
                {t('logs.userEmail')}
              </Text>
              <Text>{log.userEmail}</Text>
            </Box>
          )}
        </SimpleGrid>
        
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <>
            <Divider borderColor={borderColor} />
            
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={3}>
                {t('logs.metadata')}
              </Text>
              
              <Tabs variant="soft-rounded" colorScheme="brand">
                <TabList>
                  <Tab>{t('logs.formatted')}</Tab>
                  <Tab>{t('logs.raw')}</Tab>
                </TabList>
                
                <TabPanels>
                  <TabPanel px={0}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {Object.entries(log.metadata).map(([key, value]) => (
                        <Box key={key} p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                          <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>
                            {key}
                          </Text>
                          <Text>
                            {typeof value === 'object'
                              ? JSON.stringify(value, null, 2)
                              : String(value)}
                          </Text>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </TabPanel>
                  
                  <TabPanel px={0}>
                    <Flex justify="flex-end" mb={2}>
                      <Button
                        size="sm"
                        leftIcon={<MdContentCopy />}
                        onClick={() => copyToClipboard(JSON.stringify(log.metadata, null, 2))}
                      >
                        {t('common.copy')}
                      </Button>
                    </Flex>
                    <Box
                      p={4}
                      borderRadius="md"
                      bg={codeBg}
                      overflow="auto"
                      maxH="400px"
                    >
                      <Code display="block" whiteSpace="pre" fontFamily="monospace">
                        {JSON.stringify(log.metadata, null, 2)}
                      </Code>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </>
        )}
        
        <Flex justify="flex-end">
          <Button
            leftIcon={<MdContentCopy />}
            onClick={() => copyToClipboard(JSON.stringify(log, null, 2))}
          >
            {t('logs.copyAll')}
          </Button>
        </Flex>
      </VStack>
    </Card>
  );
};

export default LogDetails;
