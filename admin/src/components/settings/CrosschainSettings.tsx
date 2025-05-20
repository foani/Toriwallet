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
  Badge,
  Tooltip
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, InfoIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Card } from '@/components/common';
import { CrosschainSettings as CrosschainSettingsType } from '@/types';
import { useTranslation } from 'react-i18next';

interface CrosschainSettingsProps {
  settings: CrosschainSettingsType | null;
  onUpdate: (settings: Partial<CrosschainSettingsType>) => Promise<boolean>;
  isLoading: boolean;
}

const CrosschainSettings: React.FC<CrosschainSettingsProps> = ({
  settings,
  onUpdate,
  isLoading
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [localSettings, setLocalSettings] = useState<CrosschainSettingsType | null>(settings);
  const [newBridge, setNewBridge] = useState<string>('');
  
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
      formik.resetForm({ values: settings });
    }
  }, [settings]);
  
  const validationSchema = Yup.object({
    enabledBridges: Yup.array().of(Yup.string()),
    maxTransferAmount: Yup.number()
      .min(0, t('settings.errors.minValue', { value: 0 }))
      .required(t('settings.errors.required')),
    bridgeFee: Yup.number()
      .min(0, t('settings.errors.minValue', { value: 0 }))
      .max(100, t('settings.errors.maxValue', { value: 100 }))
      .required(t('settings.errors.required')),
    bridgeTimeoutMinutes: Yup.number()
      .min(1, t('settings.errors.minValue', { value: 1 }))
      .max(1440, t('settings.errors.maxValue', { value: 1440 }))
      .required(t('settings.errors.required'))
  });
  
  const formik = useFormik({
    initialValues: settings || {
      enabledBridges: [],
      maxTransferAmount: 1000000,
      bridgeFee: 0.5,
      bridgeTimeoutMinutes: 30
    },
    validationSchema,
    onSubmit: async (values) => {
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
  
  const handleAddBridge = () => {
    if (!newBridge.trim()) {
      return;
    }
    
    // 중복 체크
    if (formik.values.enabledBridges.includes(newBridge)) {
      toast({
        title: t('settings.crosschain.duplicateBridge'),
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // 브릿지 추가
    const updatedBridges = [...formik.values.enabledBridges, newBridge];
    formik.setFieldValue('enabledBridges', updatedBridges);
    setNewBridge('');
  };
  
  const handleRemoveBridge = (bridge: string) => {
    const updatedBridges = formik.values.enabledBridges.filter(b => b !== bridge);
    formik.setFieldValue('enabledBridges', updatedBridges);
  };
  
  return (
    <Card
      title={t('settings.crosschain.title')}
      subtitle={t('settings.crosschain.subtitle')}
      isLoading={isLoading && !localSettings}
    >
      <form onSubmit={formik.handleSubmit}>
        <VStack spacing={6} align="stretch">
          <Text fontSize="lg" fontWeight="bold">
            {t('settings.crosschain.generalSettings')}
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl
              isInvalid={!!(formik.touched.maxTransferAmount && formik.errors.maxTransferAmount)}
              isRequired
            >
              <FormLabel>
                {t('settings.crosschain.maxTransferAmount')}
                <Tooltip
                  label={t('settings.crosschain.maxTransferAmountTooltip')}
                  placement="top"
                  hasArrow
                >
                  <InfoIcon ml={1} boxSize={3} />
                </Tooltip>
              </FormLabel>
              <NumberInput
                id="maxTransferAmount"
                min={0}
                value={formik.values.maxTransferAmount}
                onChange={(valueAsString, valueAsNumber) => {
                  formik.setFieldValue('maxTransferAmount', valueAsNumber);
                }}
                isDisabled={isLoading}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{formik.errors.maxTransferAmount}</FormErrorMessage>
            </FormControl>
            
            <FormControl
              isInvalid={!!(formik.touched.bridgeFee && formik.errors.bridgeFee)}
              isRequired
            >
              <FormLabel>
                {t('settings.crosschain.bridgeFee')} (%)
                <Tooltip
                  label={t('settings.crosschain.bridgeFeeTooltip')}
                  placement="top"
                  hasArrow
                >
                  <InfoIcon ml={1} boxSize={3} />
                </Tooltip>
              </FormLabel>
              <NumberInput
                id="bridgeFee"
                min={0}
                max={100}
                step={0.1}
                precision={2}
                value={formik.values.bridgeFee}
                onChange={(valueAsString, valueAsNumber) => {
                  formik.setFieldValue('bridgeFee', valueAsNumber);
                }}
                isDisabled={isLoading}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{formik.errors.bridgeFee}</FormErrorMessage>
            </FormControl>
            
            <FormControl
              isInvalid={!!(formik.touched.bridgeTimeoutMinutes && formik.errors.bridgeTimeoutMinutes)}
              isRequired
            >
              <FormLabel>
                {t('settings.crosschain.bridgeTimeoutMinutes')}
                <Tooltip
                  label={t('settings.crosschain.bridgeTimeoutTooltip')}
                  placement="top"
                  hasArrow
                >
                  <InfoIcon ml={1} boxSize={3} />
                </Tooltip>
              </FormLabel>
              <NumberInput
                id="bridgeTimeoutMinutes"
                min={1}
                max={1440}
                value={formik.values.bridgeTimeoutMinutes}
                onChange={(valueAsString, valueAsNumber) => {
                  formik.setFieldValue('bridgeTimeoutMinutes', valueAsNumber);
                }}
                isDisabled={isLoading}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{formik.errors.bridgeTimeoutMinutes}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
          
          <Divider my={4} />
          
          <Text fontSize="lg" fontWeight="bold">
            {t('settings.crosschain.enabledBridges')}
          </Text>
          
          <Text fontSize="sm" color="gray.500">
            {t('settings.crosschain.enabledBridgesDescription')}
          </Text>
          
          <HStack spacing={4}>
            <FormControl>
              <Input
                placeholder={t('settings.crosschain.bridgePlaceholder')}
                value={newBridge}
                onChange={(e) => setNewBridge(e.target.value)}
                isDisabled={isLoading}
              />
            </FormControl>
            <IconButton
              icon={<AddIcon />}
              aria-label={t('settings.crosschain.addBridge')}
              onClick={handleAddBridge}
              isDisabled={isLoading || !newBridge}
            />
          </HStack>
          
          <Box>
            {formik.values.enabledBridges.length > 0 ? (
              <Flex flexWrap="wrap" gap={2}>
                {formik.values.enabledBridges.map((bridge) => (
                  <Badge
                    key={bridge}
                    px={2}
                    py={1}
                    borderRadius="md"
                    colorScheme="brand"
                    variant="solid"
                    fontSize="sm"
                  >
                    {bridge}
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label={t('settings.crosschain.removeBridge')}
                      size="xs"
                      variant="ghost"
                      colorScheme="whiteAlpha"
                      ml={1}
                      onClick={() => handleRemoveBridge(bridge)}
                      isDisabled={isLoading}
                    />
                  </Badge>
                ))}
              </Flex>
            ) : (
              <Text color="gray.500" fontSize="sm">
                {t('settings.crosschain.noBridges')}
              </Text>
            )}
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

export default CrosschainSettings;
