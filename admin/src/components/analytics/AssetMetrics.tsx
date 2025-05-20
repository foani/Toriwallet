import React from 'react';
import { Box, Text, Flex, Badge, useColorModeValue } from '@chakra-ui/react';
import { AssetDistribution } from '@/types';
import { Card } from '@/components/common';
import { useTranslation } from 'react-i18next';
import { formatCrypto, formatPercent } from '@/utils/format';
import AnalyticsChart, { ChartData } from './AnalyticsChart';

interface AssetMetricsProps {
  assetDistribution: AssetDistribution[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const AssetMetrics: React.FC<AssetMetricsProps> = ({
  assetDistribution,
  isLoading,
  onRefresh
}) => {
  const { t } = useTranslation();
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  
  // 자산 색상 배열
  const assetColors = [
    'rgba(66, 153, 225, 0.8)',  // blue.400
    'rgba(72, 187, 120, 0.8)',  // green.400
    'rgba(159, 122, 234, 0.8)', // purple.400
    'rgba(237, 137, 54, 0.8)',  // orange.400
    'rgba(245, 101, 101, 0.8)', // red.400
    'rgba(49, 151, 149, 0.8)',  // teal.400
    'rgba(236, 64, 122, 0.8)',  // pink.400
    'rgba(0, 188, 212, 0.8)',   // cyan.400
    'rgba(255, 193, 7, 0.8)',   // yellow.400
    'rgba(103, 58, 183, 0.8)'   // deep purple
  ];
  
  // 차트 데이터 생성
  const chartData: ChartData = {
    labels: assetDistribution.map(asset => asset.assetSymbol),
    datasets: [
      {
        label: t('analytics.assetDistribution'),
        data: assetDistribution.map(asset => asset.percentage),
        backgroundColor: assetColors.slice(0, assetDistribution.length),
        borderColor: assetColors.slice(0, assetDistribution.length).map(color => color.replace('0.8', '1')),
        borderWidth: 1
      }
    ]
  };
  
  // 파이 차트 옵션
  const chartOptions = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 15,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            return `${context.label}: ${formatPercent(value)}`;
          }
        }
      }
    }
  };
  
  return (
    <Box>
      <AnalyticsChart
        title={t('analytics.assetDistribution')}
        subtitle={t('analytics.assetDistributionSubtitle')}
        type="doughnut"
        data={chartData}
        options={chartOptions}
        height={300}
        isLoading={isLoading}
        onRefresh={onRefresh}
      />
      
      <Card
        title={t('analytics.assetDetails')}
        isLoading={isLoading}
        onRefresh={onRefresh}
        mt={6}
      >
        <Box>
          {assetDistribution.map((asset, index) => (
            <Flex
              key={asset.assetId}
              justify="space-between"
              align="center"
              p={3}
              borderBottom={index < assetDistribution.length - 1 ? '1px' : '0'}
              borderColor={borderColor}
            >
              <Flex align="center">
                <Box
                  w="12px"
                  h="12px"
                  borderRadius="full"
                  bg={assetColors[index % assetColors.length]}
                  mr={3}
                />
                <Box>
                  <Flex align="center">
                    <Text fontWeight="medium">{asset.assetName}</Text>
                    <Badge ml={2} colorScheme="gray">
                      {asset.assetSymbol}
                    </Badge>
                  </Flex>
                  <Text fontSize="sm" color="gray.500">
                    {formatPercent(asset.percentage)} {t('analytics.ofTotalValue')}
                  </Text>
                </Box>
              </Flex>
              <Text fontWeight="bold">
                {formatCrypto(asset.totalValue, asset.assetSymbol)}
              </Text>
            </Flex>
          ))}
        </Box>
      </Card>
    </Box>
  );
};

export default AssetMetrics;
