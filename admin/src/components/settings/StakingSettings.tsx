import React, { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Button,
  Flex,
  Box,
  Text,
  useToast,
  FormErrorMessage,
  SimpleGrid,
  Divider,
  HStack,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Card } from '@/components/common';
import { StakingSettings as StakingSettingsType } from '@/types';
import { useTranslation } from 'react-i18next';

interface StakingSettingsProps {
  settings: StakingSettingsType | null;
  onUpdate: (settings: Partial<StakingSettingsType>) => Promise<boolean>;
  isLoading: boolean;
}

const StakingSettings: React.FC<StakingSettingsProps> = ({
  settings,
  onUpdate,
  isLoading
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [localSettings, setLocalSettings] = useState<StakingSettingsType | null>(settings);
  const [newNetwork, setNewNetwork] = useState<string>('');
  const [newLockupPeriod, setNewLockupPeriod] = useState<{ period: number; apy: number }>({
    period: 0,
    apy: 0
  });
  
  const tableBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
      formik.resetForm({ values: settings });
    }
  }, [settings]);
  
  const validationSchema = Yup.object({
    enabledNetworks: Yup.array().of(Yup.string()),
    minStakeAmount: Yup.number()
      .min(0, t('settings.errors.minValue', { value: 0 }))
      .required(t('settings.errors.required')),
    maxStakeAmount: Yup.number()
      .min(0, t('settings.errors.minValue', { value: 0 }))
      .required(t('settings.errors.required')),
    stakingFee: Yup.number()
      .min(0, t('settings.errors.minValue', { value: 0 }))
      .max(100, t('settings.errors.maxValue', { value: 100 }))
      .required(t('settings.errors.required')),
    lockupPeriods: Yup.array().of(
      Yup.object({
        period: Yup.number().min(0).required(),
        apy: Yup.number().min(0).max(100).required()
      })
    ),
    autoCompoundEnabled: Yup.boolean()
  });
  
  const formik = useFormik({
    initialValues: settings || {
      enabledNetworks: [],
      minStakeAmount: 0,
      maxStakeAmount: 1000000,
      stakingFee: 0.5,
      lockupPeriods: [
        { period: 10, apy: 5 },
        { period: 30, apy: 10 },
        { period: 60, apy: 15 },
        { period: 90, apy: 20 }
      ],
      autoCompoundEnabled: true
    },
    validationSchema,
    onSubmit: async (values) => {
      // 최소 및 최대 스테이킹 검증
      if (values.minStakeAmount > values.maxStakeAmount) {
        toast({
          title: t('settings.staking.minGreaterThanMax'),
          status: 'error',
          duration: 3000,
          isClosable: true
        });
        return;
      }
      
      const success = await onUpdate(values);
      if (success) {
        toast({
          title: t('settings.updateSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
    }
  });
  
  const handleAddNetwork = () => {
    if (!newNetwork.trim()) {
      return;
    }
    
    // 중복 체크
    if (formik.values.enabledNetworks.includes(newNetwork)) {
      toast({
        title: t('settings.staking.duplicateNetwork'),
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // 네트워크 추가
    const updatedNetworks = [...formik.values.enabledNetworks, newNetwork];
    formik.setFieldValue('enabledNetworks', updatedNetworks);
    setNewNetwork('');
  };
  
  const handleRemoveNetwork = (network: string) => {
    const updatedNetworks = formik.values.enabledNetworks.filter(n => n !== network);
    formik.setFieldValue('enabledNetworks', updatedNetworks);
  };
  
  const handleAddLockupPeriod = () => {
    // 기간이 0보다 작거나 APY가 0보다 작은 경우
    if (newLockupPeriod.period <= 0 || newLockupPeriod.apy < 0) {
      toast({
        title: t('settings.staking.invalidLockupPeriod'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // 중복 체크
    const duplicatePeriod = formik.values.lockupPeriods.find(
      lp => lp.period === newLockupPeriod.period
    );
    if (duplicatePeriod) {
      toast({
        title: t('settings.staking.duplicateLockupPeriod'),
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // 락업 기간 추가
    const updatedLockupPeriods = [
      ...formik.values.lockupPeriods,
      { ...newLockupPeriod }
    ].sort((a, b) => a.period - b.period);
    
    formik.setFieldValue('lockupPeriods', updatedLockupPeriods);
    setNewLockupPeriod({ period: 0, apy: 0 });
  };
  
  const handleRemoveLockupPeriod = (period: number) => {
    const updatedLockupPeriods = formik.values.lockupPeriods.filter(
      lp => lp.period !== period
    );
    formik.setFieldValue('lockupPeriods', updatedLockupPeriods);
  };
  
  return (
    <Card
      title={t('settings.staking.title')}
      subtitle={t('settings.staking.subtitle')}
      isLoading={isLoading && !localSettings}
    >
      <form onSubmit={formik.handleSubmit}>
        <VStack spacing={6} align="stretch">
          <Text fontSize="lg" fontWeight="bold">
            {t('settings.staking.generalSettings')}
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl
              isInvalid={!!(formik.touched.minStakeAmount && formik.errors.minStakeAmount)}
              isRequired
            >
              <FormLabel>{t('settings.staking.minStakeAmount')}</FormLabel>
              <NumberInput
                id="minStakeAmount"
                min={0}
                value={formik.values.minStakeAmount}
                onChange={(valueAsString, valueAsNumber) => {
                  formik.setFieldValue('minStakeAmount', valueAsNumber);
                }}
                isDisabled={isLoading}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{formik.errors.minStakeAmount}</FormErrorMessage>
            </FormControl>
            
            <FormControl
              isInvalid={!!(formik.touched.maxStakeAmount && formik.errors.maxStakeAmount)}
              isRequired
            >
              <FormLabel>{t('settings.staking.maxStakeAmount')}</FormLabel>
              <NumberInput
                id="maxStakeAmount"
                min={0}
                value={formik.values.maxStakeAmount}
                onChange={(valueAsString, valueAsNumber) => {
                  formik.setFieldValue('maxStakeAmount', valueAsNumber);
                }}
                isDisabled={isLoading}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{formik.errors.maxStakeAmount}</FormErrorMessage>
            </FormControl>
            
            <FormControl
              isInvalid={!!(formik.touched.stakingFee && formik.errors.stakingFee)}
              isRequired
            >
              <FormLabel>{t('settings.staking.stakingFee')} (%)</FormLabel>
              <NumberInput
                id="stakingFee"
                min={0}
                max={100}
                step={0.1}
                precision={2}
                value={formik.values.stakingFee}
                onChange={(valueAsString, valueAsNumber) => {
                  formik.setFieldValue('stakingFee', valueAsNumber);
                }}
                isDisabled={isLoading}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{formik.errors.stakingFee}</FormErrorMessage>
            </FormControl>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="autoCompoundEnabled" mb="0">
                {t('settings.staking.autoCompoundEnabled')}
              </FormLabel>
              <Switch
                id="autoCompoundEnabled"
                name="autoCompoundEnabled"
                isChecked={formik.values.autoCompoundEnabled}
                onChange={formik.handleChange}
                isDisabled={isLoading}
              />
            </FormControl>
          </SimpleGrid>
          
          <Divider my={4} />
          
          <Text fontSize="lg" fontWeight="bold">
            {t('settings.staking.enabledNetworks')}
          </Text>
          
          <HStack spacing={4}>
            <FormControl>
              <Input
                placeholder={t('settings.staking.networkPlaceholder')}
                value={newNetwork}
                onChange={(e) => setNewNetwork(e.target.value)}
                isDisabled={isLoading}
              />
            </FormControl>
            <IconButton
              icon={<AddIcon />}
              aria-label={t('settings.staking.addNetwork')}
              onClick={handleAddNetwork}
              isDisabled={isLoading || !newNetwork}
            />
          </HStack>
          
          <Box>
            {formik.values.enabledNetworks.length > 0 ? (
              <Flex flexWrap="wrap" gap={2}>
                {formik.values.enabledNetworks.map((network) => (
                  <Badge
                    key={network}
                    px={2}
                    py={1}
                    borderRadius="md"
                    colorScheme="brand"
                    variant="solid"
                    fontSize="sm"
                  >
                    {network}
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label={t('settings.staking.removeNetwork')}
                      size="xs"
                      variant="ghost"
                      colorScheme="whiteAlpha"
                      ml={1}
                      onClick={() => handleRemoveNetwork(network)}
                      isDisabled={isLoading}
                    />
                  </Badge>
                ))}
              </Flex>
            ) : (
              <Text color="gray.500" fontSize="sm">
                {t('settings.staking.noNetworks')}
              </Text>
            )}
          </Box>
          
          <Divider my={4} />
          
          <Text fontSize="lg" fontWeight="bold">
            {t('settings.staking.lockupPeriods')}
          </Text>
          
          <Box
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
            p={4}
            overflowX="auto"
          >
            <Table size="sm" bg={tableBgColor}>
              <Thead>
                <Tr>
                  <Th>{t('settings.staking.period')} ({t('settings.staking.days')})</Th>
                  <Th>{t('settings.staking.apy')} (%)</Th>
                  <Th width="50px">{t('common.actions')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {formik.values.lockupPeriods.map((lockupPeriod) => (
                  <Tr key={lockupPeriod.period}>
                    <Td>{lockupPeriod.period}</Td>
                    <Td>{lockupPeriod.apy}%</Td>
                    <Td>
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label={t('settings.staking.removeLockupPeriod')}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleRemoveLockupPeriod(lockupPeriod.period)}
                        isDisabled={isLoading}
                      />
                    </Td>
                  </Tr>
                ))}
                <Tr>
                  <Td>
                    <NumberInput
                      size="sm"
                      min={0}
                      value={newLockupPeriod.period}
                      onChange={(valueAsString, valueAsNumber) => {
                        setNewLockupPeriod(prev => ({
                          ...prev,
                          period: valueAsNumber
                        }));
                      }}
                      isDisabled={isLoading}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Td>
                  <Td>
                    <NumberInput
                      size="sm"
                      min={0}
                      max={100}
                      value={newLockupPeriod.apy}
                      onChange={(valueAsString, valueAsNumber) => {
                        setNewLockupPeriod(prev => ({
                          ...prev,
                          apy: valueAsNumber
                        }));
                      }}
                      isDisabled={isLoading}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Td>
                  <Td>
                    <IconButton
                      icon={<AddIcon />}
                      aria-label={t('settings.staking.addLockupPeriod')}
                      size="sm"
                      colorScheme="brand"
                      onClick={handleAddLockupPeriod}
                      isDisabled={isLoading || newLockupPeriod.period <= 0}
                    />
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
          
          <Flex justify="flex-end" mt={4}>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={isLoading}
              isDisabled={!formik.isValid}
            >
              {t('common.save')}
            </Button>
          </Flex>
        </VStack>
      </form>
    </Card>
  );
};

export default StakingSettings;
