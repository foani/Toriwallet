import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  useColorModeValue,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton
} from '@chakra-ui/react';
import {
  FiUsers,
  FiActivity,
  FiDollarSign,
  FiLayers,
  FiChevronDown,
  FiRefreshCw
} from 'react-icons/fi';
import { useAnalytics } from '@/hooks';
import { Card, Loading } from '@/components/common';
import { StatCard, ActivityChart } from '@/components/dashboard';
import { AnalyticsPeriod, MetricType } from '@/types';
import { formatNumber, formatCrypto, formatPercent } from '@/utils/format';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    analytics,
    loading,
    period,
    changePeriod,
    fetchAnalyticsData,
    selectedMetrics,
    toggleMetric
  } = useAnalytics(AnalyticsPeriod.WEEK);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };
  
  useEffect(() => {
    fetchAnalyticsData();
  }, [period, fetchAnalyticsData]);
  
  const getPeriodText = (periodKey: AnalyticsPeriod) => {
    switch (periodKey) {
      case AnalyticsPeriod.DAY:
        return t('analytics.today');
      case AnalyticsPeriod.WEEK:
        return t('analytics.thisWeek');
      case AnalyticsPeriod.MONTH:
        return t('analytics.thisMonth');
      case AnalyticsPeriod.QUARTER:
        return t('analytics.thisQuarter');
      case AnalyticsPeriod.YEAR:
        return t('analytics.thisYear');
      default:
        return t('analytics.custom');
    }
  };
  
  const isLoading = loading || refreshing;
  
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
            {t('dashboard.title')}
          </Heading>
          <Text color="gray.500">{t('dashboard.subtitle')}</Text>
        </Box>
        
        <HStack spacing={3}>
          <Menu>
            <MenuButton as={Button} rightIcon={<FiChevronDown />} variant="outline">
              {getPeriodText(period)}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => changePeriod(AnalyticsPeriod.DAY)}>
                {t('analytics.today')}
              </MenuItem>
              <MenuItem onClick={() => changePeriod(AnalyticsPeriod.WEEK)}>
                {t('analytics.thisWeek')}
              </MenuItem>
              <MenuItem onClick={() => changePeriod(AnalyticsPeriod.MONTH)}>
                {t('analytics.thisMonth')}
              </MenuItem>
              <MenuItem onClick={() => changePeriod(AnalyticsPeriod.QUARTER)}>
                {t('analytics.thisQuarter')}
              </MenuItem>
              <MenuItem onClick={() => changePeriod(AnalyticsPeriod.YEAR)}>
                {t('analytics.thisYear')}
              </MenuItem>
            </MenuList>
          </Menu>
          
          <IconButton
            icon={<FiRefreshCw />}
            aria-label="Refresh data"
            onClick={handleRefresh}
            isLoading={refreshing}
          />
        </HStack>
      </Flex>
      
      {isLoading && !analytics ? (
        <Loading height="500px" text={t('common.loading')} />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
            <StatCard
              title={t('dashboard.totalUsers')}
              value={formatNumber(analytics?.overview.totalUsers || 0)}
              change={analytics?.overview.userChangePercentage}
              icon={FiUsers}
              iconColor="blue.500"
              iconBg="blue.50"
              helpText={t('dashboard.activeUsers', {
                count: formatNumber(analytics?.overview.activeUsers || 0)
              })}
            />
            <StatCard
              title={t('dashboard.totalTransactions')}
              value={formatNumber(analytics?.overview.totalTransactions || 0)}
              change={analytics?.overview.transactionChangePercentage}
              icon={FiActivity}
              iconColor="green.500"
              iconBg="green.50"
              helpText={t('dashboard.avgTransaction', {
                value: formatCrypto(analytics?.overview.avgTransactionValue || 0, 'CTA')
              })}
            />
            <StatCard
              title={t('dashboard.transactionVolume')}
              value={formatCrypto(analytics?.overview.transactionVolume || 0, 'CTA')}
              change={analytics?.overview.volumeChangePercentage}
              icon={FiDollarSign}
              iconColor="purple.500"
              iconBg="purple.50"
            />
            <StatCard
              title={t('dashboard.stakingValue')}
              value={formatCrypto(analytics?.overview.totalStakedValue || 0, 'CTA')}
              icon={FiLayers}
              iconColor="orange.500"
              iconBg="orange.50"
            />
          </SimpleGrid>
          
          <Grid
            templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap={6}
            mb={6}
          >
            <GridItem colSpan={{ base: 1, lg: 2 }}>
              <ActivityChart
                title={t('dashboard.activityTrends')}
                subtitle={t('dashboard.activityTrendsSubtitle')}
                data={[
                  analytics?.userMetrics.data || [],
                  analytics?.transactionMetrics.data || []
                ]}
                labels={
                  analytics?.userMetrics.data.map((d) => {
                    const date = new Date(d.date);
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }) || []
                }
                datasetLabels={[t('dashboard.users'), t('dashboard.transactions')]}
                colors={['#4299E1', '#48BB78']}
                onRefresh={handleRefresh}
              />
            </GridItem>
            
            <GridItem>
              <Card title={t('dashboard.networkUsage')} onRefresh={handleRefresh}>
                {analytics?.networkUsage.map((network, index) => (
                  <Box
                    key={network.networkId}
                    p={3}
                    borderBottomWidth={index < analytics.networkUsage.length - 1 ? 1 : 0}
                    borderColor={useColorModeValue('gray.100', 'gray.700')}
                  >
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text fontWeight="medium">{network.networkName}</Text>
                      <Text fontWeight="bold">
                        {formatPercent(network.percentage)}
                      </Text>
                    </Flex>
                    <Text fontSize="sm" color="gray.500">
                      {t('dashboard.networkStats', {
                        users: formatNumber(network.users),
                        transactions: formatNumber(network.transactions)
                      })}
                    </Text>
                  </Box>
                ))}
              </Card>
            </GridItem>
          </Grid>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Card title={t('dashboard.assetDistribution')} onRefresh={handleRefresh}>
              {analytics?.assetDistribution.map((asset, index) => (
                <Box
                  key={asset.assetId}
                  p={3}
                  borderBottomWidth={index < analytics.assetDistribution.length - 1 ? 1 : 0}
                  borderColor={useColorModeValue('gray.100', 'gray.700')}
                >
                  <Flex justifyContent="space-between" alignItems="center">
                    <HStack>
                      <Text fontWeight="medium">{asset.assetName}</Text>
                      <Text color="gray.500">({asset.assetSymbol})</Text>
                    </HStack>
                    <Text fontWeight="bold">{formatCrypto(asset.totalValue, asset.assetSymbol)}</Text>
                  </Flex>
                  <Text fontSize="sm" color="gray.500">
                    {formatPercent(asset.percentage)} {t('dashboard.ofTotalValue')}
                  </Text>
                </Box>
              ))}
            </Card>
            
            <Card title={t('dashboard.walletActivity')} onRefresh={handleRefresh}>
              {analytics?.walletActivity.map((activity, index) => (
                <Box
                  key={activity.walletType}
                  p={3}
                  borderBottomWidth={index < analytics.walletActivity.length - 1 ? 1 : 0}
                  borderColor={useColorModeValue('gray.100', 'gray.700')}
                >
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontWeight="medium">{activity.walletType}</Text>
                    <Text fontWeight="bold">
                      {formatNumber(activity.activeUsers)} {t('dashboard.users')}
                    </Text>
                  </Flex>
                  <Text fontSize="sm" color="gray.500">
                    {formatNumber(activity.transactions)} {t('dashboard.transactions')} (
                    {formatPercent(activity.percentage)} {t('dashboard.ofTotal')})
                  </Text>
                </Box>
              ))}
            </Card>
          </SimpleGrid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
