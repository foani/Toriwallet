import React, { useState } from 'react';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useColorModeValue,
  HStack
} from '@chakra-ui/react';
import { LogFilters, LogLevel } from '@/services/logs';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/common';

interface LogFilterProps {
  filters: LogFilters;
  sources: string[];
  onApplyFilters: (filters: LogFilters) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
}

const LogFilter: React.FC<LogFilterProps> = ({
  filters,
  sources,
  onApplyFilters,
  onResetFilters,
  isLoading
}) => {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = useState<LogFilters>(filters);
  
  const handleChange = (field: keyof LogFilters, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value === '' ? undefined : field === 'level' ? (value as LogLevel) : value
    }));
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters((prev) => ({
      ...prev,
      search: e.target.value === '' ? undefined : e.target.value
    }));
  };
  
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };
  
  const handleApply = () => {
    onApplyFilters(localFilters);
  };
  
  const handleReset = () => {
    setLocalFilters({});
    onResetFilters();
  };
  
  return (
    <Card mb={6}>
      <Box>
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }}
          gap={6}
          mb={6}
        >
          <GridItem>
            <FormControl>
              <FormLabel>{t('logs.level')}</FormLabel>
              <Select
                placeholder={t('logs.allLevels')}
                value={localFilters.level || ''}
                onChange={(e) => handleChange('level', e.target.value)}
                disabled={isLoading}
              >
                {Object.values(LogLevel).map((level) => (
                  <option key={level} value={level}>
                    {t(`logs.levels.${level}`)}
                  </option>
                ))}
              </Select>
            </FormControl>
          </GridItem>
          
          <GridItem>
            <FormControl>
              <FormLabel>{t('logs.source')}</FormLabel>
              <Select
                placeholder={t('logs.allSources')}
                value={localFilters.source || ''}
                onChange={(e) => handleChange('source', e.target.value)}
                disabled={isLoading}
              >
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </Select>
            </FormControl>
          </GridItem>
          
          <GridItem>
            <FormControl>
              <FormLabel>{t('logs.userId')}</FormLabel>
              <Input
                placeholder={t('logs.userIdPlaceholder')}
                value={localFilters.userId || ''}
                onChange={(e) => handleChange('userId', e.target.value)}
                disabled={isLoading}
              />
            </FormControl>
          </GridItem>
          
          <GridItem>
            <FormControl>
              <FormLabel>{t('logs.startDate')}</FormLabel>
              <Input
                type="datetime-local"
                value={localFilters.startDate || ''}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                disabled={isLoading}
              />
            </FormControl>
          </GridItem>
          
          <GridItem>
            <FormControl>
              <FormLabel>{t('logs.endDate')}</FormLabel>
              <Input
                type="datetime-local"
                value={localFilters.endDate || ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                disabled={isLoading}
              />
            </FormControl>
          </GridItem>
          
          <GridItem>
            <FormControl>
              <FormLabel>{t('logs.search')}</FormLabel>
              <Input
                placeholder={t('logs.searchPlaceholder')}
                value={localFilters.search || ''}
                onChange={handleSearchChange}
                disabled={isLoading}
              />
            </FormControl>
          </GridItem>
        </Grid>
        
        <Flex justify="flex-end">
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              {t('common.reset')}
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleApply}
              isLoading={isLoading}
            >
              {t('common.apply')}
            </Button>
          </HStack>
        </Flex>
      </Box>
    </Card>
  );
};

export default LogFilter;
