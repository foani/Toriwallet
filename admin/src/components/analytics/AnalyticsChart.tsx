import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { 
  Line, 
  Bar, 
  Pie, 
  Doughnut,
  PolarArea 
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Card } from '@/components/common';

// 차트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'polarArea';
export type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
};

interface AnalyticsChartProps {
  title: string;
  subtitle?: string;
  type: ChartType;
  data: ChartData;
  height?: number;
  options?: any;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  subtitle,
  type,
  data,
  height = 300,
  options,
  isLoading,
  onRefresh
}) => {
  const gridColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');
  const textColor = useColorModeValue('rgba(0, 0, 0, 0.7)', 'rgba(255, 255, 255, 0.7)');
  
  // 기본 옵션
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false
      }
    },
    scales: type === 'line' || type === 'bar' ? {
      x: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor
        }
      },
      y: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor
        },
        beginAtZero: true
      }
    } : undefined
  };
  
  // 합쳐진 옵션
  const mergedOptions = { ...defaultOptions, ...options };
  
  // 차트 렌더링
  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={mergedOptions} />;
      case 'bar':
        return <Bar data={data} options={mergedOptions} />;
      case 'pie':
        return <Pie data={data} options={mergedOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={mergedOptions} />;
      case 'polarArea':
        return <PolarArea data={data} options={mergedOptions} />;
      default:
        return <Line data={data} options={mergedOptions} />;
    }
  };
  
  return (
    <Card
      title={title}
      subtitle={subtitle}
      isLoading={isLoading}
      onRefresh={onRefresh}
    >
      <Box height={`${height}px`} width="100%">
        {renderChart()}
      </Box>
    </Card>
  );
};

export default AnalyticsChart;
