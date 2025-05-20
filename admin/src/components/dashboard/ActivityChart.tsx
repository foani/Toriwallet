import React from 'react';
import { Box, BoxProps, useColorModeValue } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Card from '../common/Card';

// 차트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DataPoint {
  date: string;
  value: number;
}

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill?: boolean;
  tension?: number;
}

interface ActivityChartProps extends BoxProps {
  title: string;
  subtitle?: string;
  data: DataPoint[][];
  labels: string[];
  datasetLabels: string[];
  colors?: string[];
  isLoading?: boolean;
  onRefresh?: () => void;
  yAxisLabel?: string;
  showLegend?: boolean;
}

const ActivityChart: React.FC<ActivityChartProps> = ({
  title,
  subtitle,
  data,
  labels,
  datasetLabels,
  colors = ['#3182CE', '#38B2AC', '#ED8936', '#9F7AEA'],
  isLoading,
  onRefresh,
  yAxisLabel,
  showLegend = true,
  ...rest
}) => {
  const gridColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');
  const textColor = useColorModeValue('rgba(0, 0, 0, 0.7)', 'rgba(255, 255, 255, 0.7)');
  
  // 투명도를 추가한 색상 생성
  const backgroundColors = colors.map((color) => `${color}20`); // 20은 헥스 코드로 12.5%의 투명도입니다.
  
  // 데이터셋 작성
  const datasets: Dataset[] = data.map((dataPoints, index) => ({
    label: datasetLabels[index],
    data: dataPoints.map((point) => point.value),
    borderColor: colors[index % colors.length],
    backgroundColor: backgroundColors[index % colors.length],
    fill: true,
    tension: 0.4
  }));
  
  const chartData = {
    labels,
    datasets
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
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
    scales: {
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
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          color: textColor
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };
  
  return (
    <Card
      title={title}
      subtitle={subtitle}
      isLoading={isLoading}
      onRefresh={onRefresh}
      {...rest}
    >
      <Box height="300px" width="100%">
        <Line data={chartData} options={options} />
      </Box>
    </Card>
  );
};

export default ActivityChart;
