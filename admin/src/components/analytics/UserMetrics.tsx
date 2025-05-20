import React from 'react';
import { SimpleGrid, Box, Text, Flex, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, useColorModeValue } from '@chakra-ui/react';
import { AnalyticsOverview } from '@/types';
import { Card } from '@/components/common';
import { useTranslation } from 'react-i18next';
import { formatNumber, formatPercent } from '@/utils/format';

interface UserMetricsProps {
  overview: AnalyticsOverview;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const UserMetrics: React.FC<UserMetricsProps> = ({ overview, isLoading, onRefresh }) => {
  const { t } = useTranslation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const metrics = [
    {
      label: t('analytics.totalUsers'),
      value: formatNumber(overview.totalUsers),
      change: overview.userChangePercentage,
      help: t('analytics.usersTrend')
    },
    {
      label: t('analytics.activeUsers'),
      value: formatNumber(overview.activeUsers),
      help: t('analytics.ofTotalUsers', { percent: formatPercent(overview.activeUsers / overview.totalUsers * 100) })
    },
    {
      label: t('analytics.newUsers'),
      value: formatNumber(overview.newUsers),
      help: t('analytics.lastPeriod')
    },
    {
      label: t('analytics.userRetention'),
      value: formatPercent(overview.userRetention),
      help: t('analytics.retentionRate')
    }
  ];
  
  return (
    <Card
      title={t('analytics.userMetrics')}
      subtitle={t('analytics.userMetricsSubtitle')}
      isLoading={isLoading}
      onRefresh={onRefresh}
    >
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        {metrics.map((metric, index) => (
          <Box
            key={index}
            p={4}
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            boxShadow="sm"
          >
            <Stat>
              <StatLabel color="gray.500">{metric.label}</StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" my={2}>
                {metric.value}
              </StatNumber>
              <StatHelpText mb={0}>
                {metric.change !== undefined && (
                  <>
                    <StatArrow type={metric.change >= 0 ? 'increase' : 'decrease'} />
                    {Math.abs(metric.change)}%
                  </>
                )}
                {metric.help && (metric.change !== undefined ? ` · ${metric.help}` : metric.help)}
              </StatHelpText>
            </Stat>
          </Box>
        ))}
      </SimpleGrid>
    </Card>
  );
};

export default UserMetrics;
