import React from 'react';
import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { IconType } from 'react-icons';
import Card from '../common/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: IconType;
  iconColor?: string;
  iconBg?: string;
  helpText?: string;
  isLoading?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  iconColor = 'brand.500',
  iconBg = 'brand.50',
  helpText,
  isLoading,
  onClick
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Card
      isLoading={isLoading}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={onClick ? { transform: 'translateY(-2px)', boxShadow: 'md' } : {}}
      transition="all 0.2s"
    >
      <Flex justifyContent="space-between">
        <Box flex="1">
          <Stat>
            <StatLabel color="gray.500" fontSize="sm">
              {title}
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" my={2}>
              {value}
            </StatNumber>
            {(change !== undefined || helpText) && (
              <StatHelpText mb={0}>
                {change !== undefined && (
                  <>
                    <StatArrow type={change >= 0 ? 'increase' : 'decrease'} />
                    {Math.abs(change)}%
                  </>
                )}
                {helpText && (change !== undefined ? ` · ${helpText}` : helpText)}
              </StatHelpText>
            )}
          </Stat>
        </Box>
        {icon && (
          <Flex
            w="56px"
            h="56px"
            align="center"
            justify="center"
            borderRadius="full"
            bg={iconBg}
            color={iconColor}
          >
            <Icon as={icon} boxSize="24px" />
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export default StatCard;
