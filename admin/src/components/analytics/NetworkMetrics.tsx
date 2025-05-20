import React from 'react';
import { Box, Text, Flex, Progress, Divider, useColorModeValue } from '@chakra-ui/react';
import { NetworkUsage } from '@/types';
import { Card } from '@/components/common';
import { useTranslation } from 'react-i18next';
import { formatNumber, formatPercent } from '@/utils/format';

interface NetworkMetricsProps {
  networkUsage: NetworkUsage[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const NetworkMetrics: React.FC<NetworkMetricsProps> = ({
  networkUsage,
  isLoading,
  onRefresh
}) => {
  const { t } = useTranslation();
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  
  // 네트워크 색상 배열
  const networkColors = [
    'blue.400',
    'green.400',
    'purple.400',
    'orange.400',
    'red.400',
    'teal.400',
    'pink.400',
    'cyan.400'
  ];
  
  // 네트워크 아이콘 - 추후 필요에 따라 추가
  const getNetworkColor = (index: number) => {
    return networkColors[index % networkColors.length];
  };
  
  return (
    <Card
      title={t('analytics.networkUsage')}
      subtitle={t('analytics.networkUsageSubtitle')}
      isLoading={isLoading}
      onRefresh={onRefresh}
    >
      <Box>
        {networkUsage.map((network, index) => (
          <Box key={network.networkId}>
            <Flex justify="space-between" mb={2}>
              <Text fontWeight="medium">{network.networkName}</Text>
              <Text fontWeight="medium">{formatPercent(network.percentage)}</Text>
            </Flex>
            
            <Progress
              value={network.percentage}
              size="sm"
              colorScheme={getNetworkColor(index).split('.')[0]}
              borderRadius="full"
              mb={2}
            />
            
            <Flex justify="space-between" fontSize="sm" color="gray.500" mb={4}>
              <Text>{t('analytics.users', { count: formatNumber(network.users) })}</Text>
              <Text>{t('analytics.transactions', { count: formatNumber(network.transactions) })}</Text>
            </Flex>
            
            {index < networkUsage.length - 1 && (
              <Divider borderColor={borderColor} mb={4} />
            )}
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default NetworkMetrics;
