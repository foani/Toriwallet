import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Badge,
  SimpleGrid,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { 
  FiDownload, 
  FiRefreshCw, 
  FiChevronDown,
  FiCalendar
} from 'react-icons/fi';
import { useAnalytics } from '@/hooks';
import {
  AnalyticsChart,
  UserMetrics,
  NetworkMetrics,
  AssetMetrics
} from '@/components/analytics';
import { Card, Loading } from '@/components/common';
import { AnalyticsPeriod, MetricType } from '@/types';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/utils/format';

const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    analytics,
    loading,
    period,
    changePeriod,
    fetchAnalyticsData,
    exportAnalytics
  } = useAnalytics(AnalyticsPeriod.MONTH);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };
  
  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      await exportAnalytics(format);
      toast({
        title: t('analytics.exportSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Failed to export analytics:', error);
      toast({
        title: t('analytics.exportError'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };
  
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
  
  // 사용자 활동 라인 차트 데이터
  const userActivityData = analytics ? {
    labels: analytics.userMetrics.data.map(point => {
      const date = new Date(point.date);
      return formatDate(date, 'MM-dd');
    }),
    datasets: [
      {
        label: t('analytics.activeUsers'),
        data: analytics.userMetrics.data.map(point => point.value),
        borderColor: 'rgba(66, 153, 225, 1)',
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  } : {
    labels: [],
    datasets: []
  };
  
  // 트랜잭션 활동 라인 차트 데이터
  const transactionActivityData = analytics ? {
    labels: analytics.transactionMetrics.data.map(point => {
      const date = new Date(point.date);
      return formatDate(date, 'MM-dd');
    }),
    datasets: [
      {
        label: t('analytics.transactions'),
        data: analytics.transactionMetrics.data.map(point => point.value),
        borderColor: 'rgba(72, 187, 120, 1)',
        backgroundColor: 'rgba(72, 187, 120, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  } : {
    labels: [],
    datasets: []
  };
  
  // 지갑 활동 바 차트 데이터
  const walletActivityData = analytics ? {
    labels: analytics.walletActivity.map(activity => activity.walletType),
    datasets: [
      {
        label: t('analytics.activeUsers'),
        data: analytics.walletActivity.map(activity => activity.activeUsers),
        backgroundColor: 'rgba(66, 153, 225, 0.8)',
        borderColor: 'rgba(66, 153, 225, 1)',
        borderWidth: 1
      },
      {
        label: t('analytics.transactions'),
        data: analytics.walletActivity.map(activity => activity.transactions),
        backgroundColor: 'rgba(72, 187, 120, 0.8)',
        borderColor: 'rgba(72, 187, 120, 1)',
        borderWidth: 1
      }
    ]
  } : {
    labels: [],
    datasets: []
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
            {t('analytics.title')}
          </Heading>
          <Text color="gray.500">{t('analytics.subtitle')}</Text>
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
          
          <Menu>
            <MenuButton
              as={Button}
              leftIcon={<FiDownload />}
              rightIcon={<FiChevronDown />}
              variant="outline"
            >
              {t('analytics.export')}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleExport('csv')}>CSV</MenuItem>
              <MenuItem onClick={() => handleExport('excel')}>Excel</MenuItem>
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
          {/* 사용자 지표 */}
          {analytics && <UserMetrics overview={analytics.overview} onRefresh={handleRefresh} />}
          
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mt={6}>
            {/* 사용자 활동 추세 */}
            <AnalyticsChart
              title={t('analytics.userActivity')}
              subtitle={t('analytics.userActivitySubtitle')}
              type="line"
              data={userActivityData}
              onRefresh={handleRefresh}
            />
            
            {/* 트랜잭션 활동 추세 */}
            <AnalyticsChart
              title={t('analytics.transactionActivity')}
              subtitle={t('analytics.transactionActivitySubtitle')}
              type="line"
              data={transactionActivityData}
              onRefresh={handleRefresh}
            />
          </SimpleGrid>
          
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mt={6}>
            {/* 네트워크 사용 통계 */}
            {analytics && (
              <NetworkMetrics
                networkUsage={analytics.networkUsage}
                onRefresh={handleRefresh}
              />
            )}
            
            {/* 지갑 활동 통계 */}
            <AnalyticsChart
              title={t('analytics.walletActivity')}
              subtitle={t('analytics.walletActivitySubtitle')}
              type="bar"
              data={walletActivityData}
              onRefresh={handleRefresh}
            />
          </SimpleGrid>
          
          {/* 자산 분포 */}
          {analytics && (
            <Box mt={6}>
              <AssetMetrics
                assetDistribution={analytics.assetDistribution}
                onRefresh={handleRefresh}
              />
            </Box>
          )}
          
          {/* 지역별 분포 */}
          {analytics && analytics.regionalDistribution.length > 0 && (
            <Card
              title={t('analytics.regionalDistribution')}
              subtitle={t('analytics.regionalDistributionSubtitle')}
              mt={6}
              onRefresh={handleRefresh}
            >
              <Box>
                {/* 여기에 지역별 분포 내용 추가 */}
                <Text>{t('analytics.comingSoon')}</Text>
              </Box>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export default Analytics;
